import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { routeAIModel } from '@/lib/ai-model-router'
import { orchestrate } from '@/lib/orchestrator'
import { getModelTier } from '@/lib/ai-config'
import { classifyComplexity, classifyComplexityAsync, getProviderConfig } from '@/lib/complexity-classifier'

// Schema para validação de entrada - suporta ambos os formatos
const RequestSchema = z.object({
  // Formato legacy (useChat.ts)
  message: z.string().min(1, 'Message is required').optional(),
  // Formato Vercel AI SDK (generate-lesson-multi)
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string()
  })).optional(),
  provider: z.enum(['auto', 'openai', 'anthropic', 'google']).optional().default('auto'),
  module: z.string().optional(),
  history: z.array(z.any()).optional().default([]),
  conversationId: z.string().optional(),
  complexity: z.enum(['simple', 'complex', 'fast']).optional().default('simple')
}).refine(
  (data) => data.message || (data.messages && data.messages.length > 0),
  {
    message: "Either 'message' or 'messages' must be provided",
    path: ["message"]
  }
);

// Políticas de provider por módulo
const MODULE_PROVIDER_POLICIES = {
  enem: { preferred: 'openai', model: 'gpt-4o-mini', complexModel: 'gpt-5-chat-latest' },
  professor: { preferred: 'openai', model: 'gpt-4o-mini', complexModel: 'gpt-5-chat-latest' },
  aula_interativa: { preferred: 'openai', model: 'gpt-4o-mini', complexModel: 'gpt-5-chat-latest' },
  financeiro: { preferred: 'openai', model: 'gpt-4o-mini', complexModel: 'gpt-5-chat-latest' },
  social_media: { preferred: 'openai', model: 'gpt-4o-mini', complexModel: 'gpt-5-chat-latest' },
  atendimento: { preferred: 'openai', model: 'gpt-4o-mini', complexModel: 'gpt-5-chat-latest' }
} as const;

const PROVIDER_CONFIDENCE_THRESHOLD = 0.75;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  console.log(`🚀 [MULTI-PROVIDER] START - ${timestamp}`);
  
  try {
    // Validar entrada
    const validationStart = Date.now();
    const body = await request.json();
    const validationResult = RequestSchema.safeParse(body);
    const validationTime = Date.now() - validationStart;
    console.log(`⏱️ [VALIDATION] Completed in ${validationTime}ms`);
    
    if (!validationResult.success) {
      console.error('❌ [MULTI-PROVIDER] Invalid request schema:', validationResult.error.errors);
      console.error('❌ [MULTI-PROVIDER] Request body received:', JSON.stringify(body, null, 2));
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          details: validationResult.error.errors,
          received: body
        },
        { status: 400 }
      );
    }

    const { message, messages, provider, module, history, conversationId, complexity } = validationResult.data;
    
    // Processar mensagem - suportar ambos os formatos
    let finalMessage: string;
    let finalMessages: Message[] = [];
    
    if (messages && messages.length > 0) {
      // Formato Vercel AI SDK (generate-lesson-multi)
      finalMessages = messages;
      finalMessage = messages[messages.length - 1]?.content || '';
      console.log(`🤖 [MULTI-PROVIDER] Using messages format: ${messages.length} messages`);
    } else if (message) {
      // Formato legacy (useChat.ts)
      finalMessage = message;
      finalMessages = [
        ...(history || []).map((msg: any) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: message
        }
      ];
      console.log(`🤖 [MULTI-PROVIDER] Using message format: "${message.substring(0, 30)}..."`);
    } else {
      throw new Error('No message or messages provided');
    }
    
    // Calcular messageCount a partir do payload atual
    const messageCount = finalMessages.length;
    
    console.log(`🤖 [MULTI-PROVIDER] Starting request: msg="${finalMessage.substring(0, 30)}..." provider=${provider} module=${module || 'auto'} msgCount=${messageCount} complexity=${complexity}`);
    console.log(`🔍 [DEBUG] Module parameter received: "${module}" (type: ${typeof module})`);

    // 1. Determinação do módulo com prioridade explícita
    const moduleStart = Date.now();
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
        const orchestrateStart = Date.now();
        
        const orchestrateResponse = await orchestrate({ 
          text: finalMessage,
          context: { history: finalMessages.slice(0, -1) }
        });
        
        const orchestrateTime = Date.now() - orchestrateStart;
        console.log(`⏱️ [ORCHESTRATOR] Completed in ${orchestrateTime}ms`);
        
        targetModule = orchestrateResponse.trace?.module || 'professor';
        moduleSource = 'orchestrator';
        classificationConfidence = orchestrateResponse.trace?.confidence || 0.5;
        moduleScores = {};
        
        console.log(`🎯 [MODULE] Orchestrator result: ${targetModule} (confidence: ${classificationConfidence})`);
      } catch (error) {
        console.error('❌ [MODULE] Orchestrator error:', error);
        targetModule = 'professor';
        moduleSource = 'error_fallback';
        classificationConfidence = 0.0;
      }
    }
    
    const moduleTime = Date.now() - moduleStart;
    console.log(`⏱️ [MODULE-DETECTION] Total time: ${moduleTime}ms`);

        // 2. Classificação de complexidade
        const complexityStart = Date.now();
        console.log('⚡ [COMPLEXITY] Classifying complexity...');
        const complexityResult = await classifyComplexityAsync(finalMessage, targetModule);
        const complexityLevel = complexityResult.classification;
        const complexityTime = Date.now() - complexityStart;
        console.log(`⚡ [COMPLEXITY] Result: ${complexityLevel} (source: ${complexityResult.method}, cached: ${complexityResult.cached})`);
        console.log(`⏱️ [COMPLEXITY] Completed in ${complexityTime}ms`);

    // 3. Seleção de provider e modelo baseada na complexidade
    const providerStart = Date.now();
    let finalProvider = provider;
    let finalModel = 'gpt-4o-mini';
    let providerSource = 'default';
    let tier = 'IA';
    
    if (provider === 'auto') {
      // Usar configuração baseada na complexidade
      const providerConfig = getProviderConfig(complexityLevel);
      finalProvider = providerConfig.provider;
      finalModel = providerConfig.model;
      tier = providerConfig.tier;
      providerSource = 'complexity_based';
      
      console.log(`🎯 [PROVIDER] Auto-selected: ${finalProvider}:${finalModel} (complexity: ${complexityLevel}, tier: ${tier})`);
    } else {
      // Se provider específico foi solicitado, ainda aplicar lógica de complexidade para modelo
      const providerConfig = getProviderConfig(complexityLevel);
      finalProvider = provider;
      finalModel = providerConfig.model;
      tier = providerConfig.tier;
      providerSource = 'client_specified';
      
      console.log(`🎯 [PROVIDER] Client specified: ${finalProvider}:${finalModel} (complexity: ${complexityLevel}, tier: ${tier})`);
    }
    
    const providerTime = Date.now() - providerStart;
    console.log(`⏱️ [PROVIDER-SELECTION] Completed in ${providerTime}ms`);

    // 4. Configuração do modelo baseada na complexidade
    const modelStart = Date.now();
    let modelInstance;
    try {
      switch (finalProvider) {
        case 'anthropic':
          // Verificar se a chave da API está disponível
          if (!process.env.ANTHROPIC_API_KEY) {
            console.warn('⚠️ [MODEL] Anthropic API key not found, falling back to OpenAI');
            modelInstance = openai('gpt-4o-mini');
          } else {
            modelInstance = anthropic(finalModel === 'gpt-4o' ? 'claude-3-5-sonnet-20241022' : 'claude-3-haiku-20240307');
          }
          break;
        case 'google':
          // Verificar se a chave da API está disponível
          if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            console.warn('⚠️ [MODEL] Google API key not found, falling back to OpenAI');
            modelInstance = openai('gpt-4o-mini');
          } else {
            modelInstance = google(finalModel);
          }
          break;
        case 'openai':
        default:
          // Verificar se a chave da API está disponível
          if (!process.env.OPENAI_API_KEY) {
            console.warn('⚠️ [MODEL] OpenAI API key not found, using mock response');
            // Retornar resposta mock para desenvolvimento
            return new NextResponse(
              `Desculpe, a chave da API da OpenAI não está configurada. Por favor, configure a variável OPENAI_API_KEY no arquivo .env para usar o chat com IA.`,
              {
                status: 200,
                headers: {
                  'Content-Type': 'text/plain; charset=utf-8',
                  'X-Provider': 'mock',
                  'X-Model': 'mock-model',
                  'X-Module': targetModule,
                  'X-Complexity': complexityLevel,
                  'X-Tier': tier,
                  'X-Routing-Reasoning': `Mock response for development - Module: ${targetModule}, Provider: ${finalProvider} (${providerSource}), Complexity: ${complexityLevel}`
                }
              }
            );
          } else {
            modelInstance = openai(finalModel);
            console.log(`✅ [MODEL] Using OpenAI model: ${finalModel}`);
          }
          break;
      }
    } catch (modelError: any) {
      console.error('❌ [MODEL] Error creating model instance:', modelError);
      // Fallback para resposta de erro
      return new NextResponse(
        `Desculpe, houve um problema ao configurar o modelo de IA. Tente novamente em alguns instantes.`,
        {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Provider': 'error',
            'X-Model': 'error-model',
            'X-Module': targetModule,
            'X-Complexity': complexityLevel,
            'X-Tier': tier,
            'X-Routing-Reasoning': `Error response due to model configuration error - Module: ${targetModule}, Provider: ${finalProvider}, Error: ${modelError.message}`
          }
        }
      );
    }
    
    const modelTime = Date.now() - modelStart;
    console.log(`⏱️ [MODEL-CONFIG] Completed in ${modelTime}ms`);

    // 5. Tier já foi calculado baseado na complexidade
    
    // 6. Preparar contexto final
    const finalContext = {
      module: targetModule,
      provider: finalProvider,
      model: finalModel,
      complexity: complexityLevel,
      tier,
      messageCount,
      conversationId,
      classification: {
        confidence: classificationConfidence,
        source: moduleSource,
        scores: moduleScores
      }
    };

    // Telemetria compacta
    console.log(`[MULTI] msg=${finalMessage.substring(0, 20)}... module=${targetModule} src=${moduleSource} conf=${classificationConfidence.toFixed(2)} provider=${finalProvider}:${finalModel} msgCount=${messageCount} complexity=${complexityLevel} tier=${tier}`);

    // 7. Streaming da resposta
    const streamStart = Date.now();
    console.log(`🚀 [STREAM] Starting with context:`, finalContext);

    // Mensagens já preparadas em finalMessages

    // Configurar headers de resposta
    const headers = new Headers({
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Provider': finalProvider,
      'X-Model': finalModel,
      'X-Module': targetModule,
      'X-Complexity': complexity,
      'X-Tier': tier,
      'X-Routing-Reasoning': `Module: ${targetModule} (${moduleSource}), Provider: ${finalProvider} (${providerSource}), Complexity: ${complexity}`
    });

    // Usar streaming real com a IA
    try {
      const streamTextStart = Date.now();
      const result = await streamText({
        model: modelInstance,
        messages: finalMessages,
        maxTokens: 1000,
        temperature: 0.7,
      });
      
      const streamTextTime = Date.now() - streamTextStart;
      console.log(`⏱️ [STREAM-TEXT] Completed in ${streamTextTime}ms`);

      // Use the correct method name for Vercel AI SDK v5
      return result.toTextStreamResponse({
        headers,
        onFinish: async () => {
          const endTime = Date.now();
          const totalDuration = endTime - startTime;
          const streamDuration = endTime - streamStart;
          console.log(`⏱️ [STREAM-TOTAL] Streaming completed in ${streamDuration}ms`);
          console.log(`✅ [MULTI-PROVIDER] TOTAL REQUEST completed in ${totalDuration}ms`);
          console.log(`📊 [TIMING-BREAKDOWN] Validation: ${validationTime}ms | Module: ${moduleTime}ms | Complexity: ${complexityTime}ms | Provider: ${providerTime}ms | Model: ${modelTime}ms | Stream: ${streamDuration}ms`);
        }
      });
    } catch (streamingError: any) {
      console.error('❌ [MULTI-PROVIDER] Streaming error:', streamingError);
      
      // Fallback para resposta simples em caso de erro
      const fallbackResponse = `Desculpe, houve um problema ao processar sua mensagem. Tente novamente em alguns instantes.`;
      
      return new NextResponse(fallbackResponse, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Provider': finalProvider,
          'X-Model': finalModel,
          'X-Module': targetModule,
          'X-Complexity': complexity,
          'X-Tier': tier,
          'X-Routing-Reasoning': `Fallback response - Module: ${targetModule} (${moduleSource}), Provider: ${finalProvider} (${providerSource}), Complexity: ${complexity}`
        }
      });
    }

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