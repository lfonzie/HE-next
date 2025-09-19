import { NextRequest, NextResponse } from 'next/server'
import { Message, streamText } from 'ai'
import { openai } from 'ai/openai'
import { anthropic } from 'ai/anthropic'
import { google } from 'ai/google'
import { z } from 'zod'
import { routeAIModel } from '@/lib/ai-model-router'
import { orchestrator } from '@/lib/orchestrator'

// Schema para validação de entrada
const RequestSchema = z.object({
  message: z.string(),
  provider: z.enum(['auto', 'openai', 'anthropic', 'google']).optional().default('auto'),
  module: z.string().optional(),
  history: z.array(z.any()).optional().default([]),
  conversationId: z.string().optional()
});

// Políticas de provider por módulo
const MODULE_PROVIDER_POLICIES = {
  enem: { preferred: 'openai', model: 'gpt-4o-mini', complexModel: 'gpt-4o' },
  professor: { preferred: 'openai', model: 'gpt-4o-mini', complexModel: 'gpt-4o' },
  aula_interativa: { preferred: 'openai', model: 'gpt-4o-mini', complexModel: 'gpt-4o' },
  financeiro: { preferred: 'openai', model: 'gpt-4o-mini', complexModel: 'gpt-4o' },
  social_media: { preferred: 'openai', model: 'gpt-4o-mini', complexModel: 'gpt-4o' },
  atendimento: { preferred: 'openai', model: 'gpt-4o-mini', complexModel: 'gpt-4o' }
} as const;

const PROVIDER_CONFIDENCE_THRESHOLD = 0.75;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Validar entrada
    const body = await request.json();
    const validationResult = RequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('❌ [MULTI-PROVIDER] Invalid request schema:', validationResult.error.errors);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const { message, provider, module, history, conversationId } = validationResult.data;
    
    // Calcular messageCount a partir do payload atual
    const messageCount = history.length + 1;
    
    console.log(`🤖 [MULTI-PROVIDER] Starting request: msg="${message.substring(0, 30)}..." provider=${provider} module=${module || 'auto'} msgCount=${messageCount}`);

    // 1. Determinação do módulo com prioridade explícita
    let targetModule = module || 'auto';
    let moduleSource = 'default';
    let classificationConfidence = 0;
    let moduleScores = {};
    
    if (module && module !== 'auto') {
      // Override do cliente
      moduleSource = 'client_override';
      classificationConfidence = 1.0;
      console.log(`🎯 [MODULE] Client override: ${module}`);
    } else {
      // Usar orquestrador para classificação
      try {
        console.log('🔄 [MODULE] Calling orchestrator for classification...');
        
        const orchestratorResult = await orchestrator({
          message,
          context: {
            module: 'auto',
            history,
            conversationId
          }
        });

        if (orchestratorResult.trace?.module) {
          targetModule = orchestratorResult.trace.module;
          moduleSource = 'orchestrator';
          classificationConfidence = orchestratorResult.trace.confidence || 0.8;
          moduleScores = orchestratorResult.trace.scores || {};
          
          console.log(`🎯 [MODULE] Orchestrator result: ${targetModule} (confidence: ${classificationConfidence})`);
        } else {
          console.warn('⚠️ [MODULE] Orchestrator failed to determine module, using fallback');
          targetModule = 'atendimento';
          moduleSource = 'fallback';
          classificationConfidence = 0.0;
        }
      } catch (error) {
        console.error('❌ [MODULE] Orchestrator error:', error);
        targetModule = 'atendimento';
        moduleSource = 'error_fallback';
        classificationConfidence = 0.0;
      }
    }

    // 2. Classificação de complexidade
    console.log('⚡ [COMPLEXITY] Classifying complexity...');
    const complexityResult = await routeAIModel(message, { module: targetModule, history });
    
    const complexity = complexityResult.complexity || 'simples';
    console.log(`⚡ [COMPLEXITY] Result: ${complexity} (source: ${complexityResult.source || 'local'})`);

    // 3. Seleção de provider com base em políticas
    let finalProvider = provider;
    let finalModel = 'gpt-4o-mini';
    let providerSource = 'default';
    
    if (provider === 'auto') {
      // Aplicar política baseada no módulo
      const policy = MODULE_PROVIDER_POLICIES[targetModule as keyof typeof MODULE_PROVIDER_POLICIES] || MODULE_PROVIDER_POLICIES.atendimento;
      
      finalProvider = policy.preferred;
      finalModel = complexity === 'complexa' ? policy.complexModel : policy.model;
      providerSource = 'module_policy';
      
      console.log(`🎯 [PROVIDER] Auto-selected: ${finalProvider}:${finalModel} (policy for ${targetModule}, complexity: ${complexity})`);
    } else {
      providerSource = 'client_specified';
      console.log(`🎯 [PROVIDER] Client specified: ${finalProvider}`);
    }

    // 4. Configuração do modelo
    let modelInstance;
    switch (finalProvider) {
      case 'anthropic':
        modelInstance = anthropic(finalModel === 'gpt-4o' ? 'claude-3-5-sonnet-20241022' : 'claude-3-haiku-20240307');
        break;
      case 'google':
        modelInstance = google(finalModel === 'gpt-4o' ? 'gemini-1.5-pro' : 'gemini-1.5-flash');
        break;
      case 'openai':
      default:
        modelInstance = openai(finalModel);
        break;
    }

    // 5. Preparar contexto final
    const finalContext = {
      module: targetModule,
      provider: finalProvider,
      model: finalModel,
      complexity,
      tier: 'IA',
      messageCount,
      conversationId,
      classification: {
        confidence: classificationConfidence,
        source: moduleSource,
        scores: moduleScores
      }
    };

    // Telemetria compacta
    console.log(`[MULTI] msg=${message.substring(0, 20)}... module=${targetModule} src=${moduleSource} conf=${classificationConfidence.toFixed(2)} provider=${finalProvider}:${finalModel} msgCount=${messageCount} complexity=${complexity}`);

    // 6. Streaming da resposta
    console.log(`🚀 [STREAM] Starting with context:`, finalContext);

    const result = await streamText({
      model: modelInstance,
      messages: [
        {
          role: 'system',
          content: `Você é um assistente educacional especializado no módulo ${targetModule}. Responda de forma clara e educativa.`
        },
        ...history.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: message
        }
      ] as Message[],
      temperature: 0.7,
      maxTokens: 1000,
      onFinish: (result) => {
        const totalLatency = Date.now() - startTime;
        console.log(`✅ [MULTI] msg=${message.substring(0, 20)}... module=${targetModule} provider=${finalProvider} tokens=${result.usage?.totalTokens || 0} latency=${totalLatency}ms finish=${result.finishReason}`);
      }
    });

    return result.toDataStreamResponse({
      headers: {
        'X-Module': targetModule,
        'X-Provider': finalProvider,
        'X-Model': finalModel,
        'X-Complexity': complexity,
        'X-Classification-Source': moduleSource,
        'X-Classification-Confidence': classificationConfidence.toString(),
        'X-Message-Count': messageCount.toString()
      }
    });

  } catch (error: any) {
    const totalLatency = Date.now() - startTime;
    console.error(`❌ [MULTI] Fatal error: ${error.message} latency=${totalLatency}ms`);
    
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}