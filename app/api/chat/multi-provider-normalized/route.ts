import { NextRequest, NextResponse } from 'next/server'
import { Message, streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { routeAIModel } from '@/lib/ai-model-router'
import { orchestrate } from '@/lib/orchestrator'
import { getModelTier } from '@/lib/ai-config'
import { classifyComplexity, classifyComplexityAsync, getProviderConfig } from '@/lib/complexity-classifier'
import { normalizeScientificText } from '@/lib/math-normalizer'
import { addEnhancedUnicodeInstructions } from '@/lib/system-prompts/math-unicode'

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
  
  try {
    // 1. Validação da requisição
    const body = await request.json();
    const validationResult = RequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('❌ [MULTI-PROVIDER-NORMALIZED] Invalid request schema:', validationResult.error.errors);
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          details: validationResult.error.errors,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const { message, messages, provider, module, history, conversationId, complexity } = validationResult.data;
    
    // 2. Determinar mensagem e módulo
    const userMessage = message || (messages && messages[messages.length - 1]?.content) || '';
    const targetModule = module || 'professor';
    
    console.log(`🚀 [MULTI-PROVIDER-NORMALIZED] Processing request - Module: ${targetModule}, Provider: ${provider}, Message length: ${userMessage.length}`);

    // 3. Classificação de complexidade
    const complexityResult = await classifyComplexityAsync(userMessage, targetModule);
    const complexityLevel = complexityResult.classification;
    console.log(`⚡ [COMPLEXITY] Result: ${complexityLevel} (source: ${complexityResult.method}, cached: ${complexityResult.cached})`);

    // 4. Seleção de provider e modelo baseada na complexidade
    let finalProvider = provider;
    let finalModel = 'gpt-4o-mini';
    let providerSource = 'default';
    let tier = 'IA';
    
    if (provider === 'auto') {
      const providerConfig = getProviderConfig(complexityLevel);
      finalProvider = providerConfig.provider;
      finalModel = providerConfig.model;
      tier = providerConfig.tier;
      providerSource = 'complexity_based';
      
      console.log(`🎯 [PROVIDER] Auto-selected: ${finalProvider}:${finalModel} (complexity: ${complexityLevel}, tier: ${tier})`);
    } else {
      const providerConfig = getProviderConfig(complexityLevel);
      finalProvider = provider;
      finalModel = providerConfig.model;
      tier = providerConfig.tier;
      providerSource = 'client_specified';
      
      console.log(`🎯 [PROVIDER] Client specified: ${finalProvider}:${finalModel} (complexity: ${complexityLevel}, tier: ${tier})`);
    }

    // 5. Configuração do modelo
    let modelInstance;
    try {
      switch (finalProvider) {
        case 'anthropic':
          if (!process.env.ANTHROPIC_API_KEY) {
            console.warn('⚠️ [MODEL] Anthropic API key not found, falling back to OpenAI');
            modelInstance = openai('gpt-4o-mini');
          } else {
            modelInstance = anthropic(finalModel === 'gpt-4o' ? 'claude-3-5-sonnet-20241022' : 'claude-3-haiku-20240307');
          }
          break;
        case 'google':
          if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            console.warn('⚠️ [MODEL] Google API key not found, falling back to OpenAI');
            modelInstance = openai('gpt-4o-mini');
          } else {
            modelInstance = google(finalModel);
          }
          break;
        case 'openai':
        default:
          if (!process.env.OPENAI_API_KEY) {
            console.warn('⚠️ [MODEL] OpenAI API key not found, using mock response');
            const mockResponse = `Desculpe, a chave da API da OpenAI não está configurada. Por favor, configure a variável OPENAI_API_KEY no arquivo .env para usar o chat com IA.`;
            const normalizedMockResponse = normalizeScientificText(mockResponse);
            
            return new NextResponse(normalizedMockResponse, {
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
            });
          } else {
            modelInstance = openai(finalModel);
            console.log(`✅ [MODEL] Using OpenAI model: ${finalModel}`);
          }
          break;
      }
    } catch (modelError: any) {
      console.error('❌ [MODEL] Error creating model instance:', modelError);
      const errorResponse = `Desculpe, houve um problema ao configurar o modelo de IA. Tente novamente em alguns instantes.`;
      const normalizedErrorResponse = normalizeScientificText(errorResponse);
      
      return new NextResponse(normalizedErrorResponse, {
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
      });
    }

    // 6. Preparar contexto final
    const finalContext = {
      module: targetModule,
      provider: finalProvider,
      model: finalModel,
      complexity: complexityLevel,
      tier,
      messageCount: history.length,
      conversationId,
      classification: {
        complexity: complexityLevel,
        confidence: complexityResult.confidence,
        method: complexityResult.method,
        cached: complexityResult.cached
      }
    };

    // 7. Preparar mensagens com instruções de Unicode aprimoradas
    let finalMessages: Message[];
    
    if (messages && messages.length > 0) {
      // Formato Vercel AI SDK
      finalMessages = messages.map(msg => ({
        ...msg,
        content: msg.role === 'system' ? addEnhancedUnicodeInstructions(msg.content) : msg.content
      }));
    } else {
      // Formato legacy
      const systemPrompt = addEnhancedUnicodeInstructions(`
        Você é um assistente educacional especializado em ${targetModule}.
        Responda de forma clara, concisa e educativa.
        Use APENAS símbolos Unicode para matemática e química.
        NUNCA use LaTeX ou comandos de formatação.
      `);
      
      finalMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ];
    }

    // 8. Headers de resposta
    const headers = {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Provider': finalProvider,
      'X-Model': finalModel,
      'X-Module': targetModule,
      'X-Complexity': complexityLevel,
      'X-Tier': tier,
      'X-Routing-Reasoning': `Module: ${targetModule}, Provider: ${finalProvider} (${providerSource}), Complexity: ${complexityLevel}, Model: ${finalModel}`,
      'X-Normalization': 'enabled'
    };

    // 9. Usar streaming com normalização
    try {
      const result = await streamText({
        model: modelInstance,
        messages: finalMessages,
        maxTokens: 1000,
        temperature: 0.7,
      });

      // Interceptar o stream para normalizar
      const originalStream = result.textStream;
      
      const normalizedStream = new ReadableStream({
        start(controller) {
          const reader = originalStream.getReader();
          
          const pump = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                  controller.close();
                  const endTime = Date.now();
                  const duration = endTime - startTime;
                  console.log(`✅ [MULTI-PROVIDER-NORMALIZED] Request completed in ${duration}ms`);
                  break;
                }
                
                // Normalizar o texto antes de enviar
                const normalizedValue = normalizeScientificText(value);
                controller.enqueue(normalizedValue);
              }
            } catch (error) {
              controller.error(error);
            }
          };
          
          pump();
        }
      });

      return new Response(normalizedStream, {
        headers,
      });

    } catch (streamingError: any) {
      console.error('❌ [MULTI-PROVIDER-NORMALIZED] Streaming error:', streamingError);
      
      const fallbackResponse = `Desculpe, houve um problema ao processar sua mensagem. Tente novamente em alguns instantes.`;
      const normalizedFallbackResponse = normalizeScientificText(fallbackResponse);
      
      return new NextResponse(normalizedFallbackResponse, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Provider': 'fallback',
          'X-Model': 'fallback-model',
          'X-Module': targetModule,
          'X-Complexity': complexityLevel,
          'X-Tier': tier,
          'X-Routing-Reasoning': `Fallback response due to streaming error - Module: ${targetModule}, Provider: ${finalProvider}, Error: ${streamingError.message}`,
          'X-Normalization': 'enabled'
        }
      });
    }

  } catch (error: any) {
    const totalLatency = Date.now() - startTime;
    console.error(`❌ [MULTI-PROVIDER-NORMALIZED] Fatal error: ${error.message} latency=${totalLatency}ms`);
    
    const errorResponse = `Desculpe, houve um erro interno. Tente novamente em alguns instantes.`;
    const normalizedErrorResponse = normalizeScientificText(errorResponse);
    
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString(),
      normalizedResponse: normalizedErrorResponse
    }, { status: 500 });
  }
}
