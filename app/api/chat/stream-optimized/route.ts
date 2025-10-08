import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { perplexity } from '@ai-sdk/perplexity';
import { grok } from '@/lib/providers/grok-ai-sdk';
import { fastClassify } from '@/lib/fast-classifier';
import { z } from 'zod';
import { getSystemPrompt as loadSystemPrompt } from '@/lib/system-message-loader';

export const dynamic = 'force-dynamic';

// Schema simplificado para validação rápida
const OptimizedRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  module: z.string().optional().default('auto'),
  conversationId: z.string().optional(),
  history: z.array(z.any()).optional().default([]),
  useCache: z.boolean().optional().default(true),
  forceProvider: z.enum(['auto', 'grok', 'openai', 'google', 'perplexity']).optional().default('auto')
});

// Configurações otimizadas de modelos
const MODEL_CONFIGS = {
  grok: {
    simple: 'grok-4-fast-reasoning',
    complex: 'grok-4-fast-reasoning'
  },
  openai: {
    simple: 'gpt-4o-mini',
    complex: 'gpt-5-chat-latest'
  },
  google: {
    simple: 'gemini-2.0-flash-exp',
    complex: 'gemini-2.0-flash-exp'
  },
  perplexity: {
    simple: 'sonar',
    complex: 'sonar'
  }
};

// Cache de respostas para melhor performance
const responseCache = new Map<string, { response: string; timestamp: number }>();

function generateCacheKey(message: string, module: string, historyLength: number): string {
  return `${message.toLowerCase().trim()}_${module}_${historyLength}`;
}

function detectComplexityFast(message: string): 'simple' | 'complex' {
  const complexKeywords = [
    'explicar detalhadamente', 'explique detalhadamente', 'explicação detalhada',
    'demonstração', 'demonstrar', 'prova', 'provar', 'análise', 'analisar',
    'síntese', 'sintetizar', 'comparar', 'comparação', 'processo complexo',
    'teorema', 'fórmula', 'cálculo', 'calcular', 'derivada', 'derivar',
    'integral', 'integrar', 'limite', 'continuidade', 'estatística',
    'probabilidade', 'vetores', 'matriz', 'logaritmo', 'exponencial',
    'equação', 'equações', 'gráfico', 'gráficos', 'função', 'funções',
    'geometria', 'trigonometria', 'álgebra', 'física', 'química',
    'biologia', 'história', 'filosofia', 'literatura', 'redação'
  ];
  
  const messageLower = message.toLowerCase();
  return complexKeywords.some(keyword => messageLower.includes(keyword)) ? 'complex' : 'simple';
}

function requiresWebSearch(message: string): boolean {
  const webSearchKeywords = [
    'pesquisar', 'buscar', 'notícias', 'atual', 'recente', 'hoje', 'agora',
    'últimas', 'novidades', 'tendências', 'preços', 'cotação', 'mercado',
    'tempo', 'clima', 'previsão', 'eventos', 'acontecimentos'
  ];
  
  const messageLower = message.toLowerCase();
  return webSearchKeywords.some(keyword => messageLower.includes(keyword));
}

function formatMessagesForProvider(messages: any[], provider: string): any[] {
  if (provider === 'google') {
    // Google Gemini usa prompt simples
    return messages;
  }
  
  if (provider === 'perplexity') {
    // Perplexity precisa alternar user/assistant corretamente
    const formattedMessages = [];
    
    // Adicionar system message se existir
    const systemMsg = messages.find(msg => msg.role === 'system');
    if (systemMsg) {
      formattedMessages.push({
        role: 'system',
        content: systemMsg.content
      });
    }
    
    // Processar mensagens alternando user/assistant
    let lastRole = 'system';
    for (const msg of messages) {
      if (msg.role === 'system') continue;
      
      if (msg.role === 'user' && lastRole !== 'user') {
        formattedMessages.push({
          role: 'user',
          content: msg.content
        });
        lastRole = 'user';
      } else if (msg.role === 'assistant' && lastRole !== 'assistant') {
        formattedMessages.push({
          role: 'assistant',
          content: msg.content
        });
        lastRole = 'assistant';
      } else if (msg.role === 'user' && lastRole === 'user') {
        // Combinar mensagens user consecutivas
        const lastMsg = formattedMessages[formattedMessages.length - 1];
        lastMsg.content += '\n\n' + msg.content;
      } else if (msg.role === 'assistant' && lastRole === 'assistant') {
        // Combinar mensagens assistant consecutivas
        const lastMsg = formattedMessages[formattedMessages.length - 1];
        lastMsg.content += '\n\n' + msg.content;
      }
    }
    
    return formattedMessages;
  }
  
  // OpenAI usa formato padrão
  return messages;
}

function selectProvider(message: string, module: string, forceProvider: string): 'grok' | 'openai' | 'google' | 'perplexity' {
  if (forceProvider !== 'auto') {
    return forceProvider as 'grok' | 'openai' | 'google' | 'perplexity';
  }
  
  // Se precisa de busca na web, usar Perplexity
  if (requiresWebSearch(message) && process.env.PERPLEXITY_API_KEY) {
    console.log('🔍 [PROVIDER-SELECTION] Using Perplexity for web search');
    return 'perplexity';
  }
  
  // Verificar complexidade primeiro
  const complexity = detectComplexityFast(message);
  
  // Priorizar Grok 4 Fast Reasoning para perguntas educacionais
  if (process.env.GROK_API_KEY) {
    console.log('🚀 [PROVIDER-SELECTION] Using Grok 4 Fast Reasoning for educational content');
    return 'grok';
  }
  
  // Para tarefas complexas, usar OpenAI (melhor qualidade)
  if (complexity === 'complex') {
    console.log('🎯 [PROVIDER-SELECTION] Using OpenAI for complex task');
    return 'openai';
  }
  
  // Verificar se Google está disponível para tarefas simples
  const hasGoogleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || 
                      process.env.GOOGLE_GEMINI_API_KEY || 
                      process.env.GOOGLE_API_KEY;
  
  // Para mensagens simples e módulos específicos, usar Grok (mais rápido)
  const simpleModules = ['ti', 'rh', 'financeiro', 'secretaria', 'coordenacao', 'social-media', 'bem-estar', 'professor', 'aula_interativa'];
  
  if (process.env.GROK_API_KEY && (simpleModules.includes(module) || complexity === 'simple')) {
    console.log('🎯 [PROVIDER-SELECTION] Using Grok 4 Fast for simple task');
    return 'grok';
  }
  
  console.log('🎯 [PROVIDER-SELECTION] Using OpenAI as default');
  return 'openai';
}

// Usar a função do system-message-loader para carregar prompts do system-message.json
function getSystemPrompt(module: string): string {
  try {
    // Carregar prompt do sistema do arquivo system-message.json
    const systemPrompt = loadSystemPrompt(module);
    
    console.log(`✅ [SYSTEM-PROMPT] Loaded from system-message.json for module: ${module}`);
    return systemPrompt;
  } catch (error) {
    console.error(`❌ [SYSTEM-PROMPT] Error loading for module ${module}:`, error);
    
    // Fallback simples apenas em caso de erro crítico
    return `Você é um assistente educacional brasileiro. Responda SEMPRE em português brasileiro.`;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let message = ''; // Declarar fora do try-catch para usar no fallback
  
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validação rápida
    const body = await request.json();
    const validationResult = OptimizedRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request format', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { message: requestMessage, module, history, conversationId, useCache, forceProvider } = validationResult.data;
    message = requestMessage; // Atribuir para usar no fallback
    
    console.log(`🚀 [STREAM-OPTIMIZED] Processing: "${message.substring(0, 30)}..." module=${module}`);
    
    // 1. Verificar cache primeiro (se habilitado)
    if (useCache) {
      const cacheKey = generateCacheKey(message, module, history.length);
      const cachedResponse = responseCache.get(cacheKey);
      
      if (cachedResponse && Date.now() - cachedResponse.timestamp < 300000) { // 5 minutos
        console.log(`🎯 [CACHE-HIT] Using cached response`);
        return new Response(cachedResponse.response, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Cached': 'true',
            'X-Module': module,
            'X-Latency': `${Date.now() - startTime}ms`
          }
        });
      }
    }

    // 2. Classificação rápida local (sem chamadas externas)
    let targetModule = module;
    let classificationSource = 'client_override';
    
    if (module === 'auto') {
      const classificationStart = Date.now();
      const classification = fastClassify(message, history.length);
      const classificationTime = Date.now() - classificationStart;
      
      targetModule = classification.module;
      classificationSource = 'fast_local';
      console.log(`🎯 [FAST-CLASSIFY] ${targetModule} (confidence: ${classification.confidence}) - ${classificationTime}ms`);
    }

    // 3. Seleção de provider otimizada
    const providerStart = Date.now();
    const selectedProvider = selectProvider(message, targetModule, forceProvider);
    const providerTime = Date.now() - providerStart;
    console.log(`🎯 [PROVIDER-SELECTION] ${selectedProvider} - ${providerTime}ms`);

    // 4. Configuração do modelo
    const modelStart = Date.now();
    const complexity = detectComplexityFast(message);
    const modelName = MODEL_CONFIGS[selectedProvider][complexity];
    
    // Verificar se o modelo está definido
    if (!modelName) {
      throw new Error(`Model not found for provider ${selectedProvider} and complexity ${complexity}`);
    }
    
    let modelInstance;
    if (selectedProvider === 'grok' && process.env.GROK_API_KEY) {
      modelInstance = grok(modelName);
    } else if (selectedProvider === 'google' && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      modelInstance = google(modelName);
    } else if (selectedProvider === 'perplexity' && process.env.PERPLEXITY_API_KEY) {
      modelInstance = perplexity(modelName);
    } else {
      modelInstance = openai(modelName);
    }
    
    const modelTime = Date.now() - modelStart;
    console.log(`⚡ [MODEL-CONFIG] ${selectedProvider}/${modelName} - ${modelTime}ms`);

    // 5. Preparar mensagens otimizadas (apenas últimas 3 mensagens)
    const rawMessages = [
      {
        role: 'system' as const,
        content: getSystemPrompt(targetModule)
      },
      ...history.slice(-3).map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: message
      }
    ];

    // Formatar mensagens para o provider específico
    const messages = formatMessagesForProvider(rawMessages, selectedProvider);

    // 6. Configuração otimizada de streaming
    const streamingConfig = {
      temperature: complexity === 'complex' ? 0.7 : 0.5,
      topP: 0.9
    };

    console.log(`📡 [STREAMING] Starting stream with ${selectedProvider}/${modelName}`);
    
    // 7. Iniciar streaming com fallback automático
    const streamStart = Date.now();
    let result;
    let finalProvider = selectedProvider;
    
    try {
      // Configuração específica por provider
      const streamConfig = selectedProvider === 'google' 
        ? {
            model: modelInstance,
            prompt: `${getSystemPrompt(targetModule)}\n\nUser: ${message}`,
            ...streamingConfig,
            onFinish: async (result: any) => {
              const finishTime = Date.now() - startTime;
              console.log(`✅ [STREAM-FINISHED] Total time: ${finishTime}ms`, {
                finishReason: result.finishReason,
                usage: result.usage,
                provider: finalProvider,
                module: targetModule,
                classificationSource
              });
              
              // Salvar no cache se habilitado
              if (useCache && result.text) {
                const cacheKey = generateCacheKey(message, targetModule, history.length);
                responseCache.set(cacheKey, {
                  response: result.text,
                  timestamp: Date.now()
                });
                
                // Limitar tamanho do cache
                if (responseCache.size > 100) {
                  const firstKey = responseCache.keys().next().value;
                  if (firstKey) {
                    responseCache.delete(firstKey);
                  }
                }
              }
            }
          }
        : {
            model: modelInstance,
            messages: formatMessagesForProvider(rawMessages, selectedProvider),
            ...streamingConfig,
            onFinish: async (result: any) => {
              const finishTime = Date.now() - startTime;
              console.log(`✅ [STREAM-FINISHED] Total time: ${finishTime}ms`, {
                finishReason: result.finishReason,
                usage: result.usage,
                provider: finalProvider,
                module: targetModule,
                classificationSource
              });
              
              // Salvar no cache se habilitado
              if (useCache && result.text) {
                const cacheKey = generateCacheKey(message, targetModule, history.length);
                responseCache.set(cacheKey, {
                  response: result.text,
                  timestamp: Date.now()
                });
                
                // Limitar tamanho do cache
                if (responseCache.size > 100) {
                  const firstKey = responseCache.keys().next().value;
                  if (firstKey) {
                    responseCache.delete(firstKey);
                  }
                }
              }
            }
          };

      result = await streamText(streamConfig);
    } catch (providerError: any) {
      // Se provider falhar, fazer fallback automático para OpenAI
      if (selectedProvider === 'google' || selectedProvider === 'perplexity') {
        console.log(`🔄 [PROVIDER-FALLBACK] ${selectedProvider} failed, switching to OpenAI: ${providerError.message}`);
        finalProvider = 'openai';
        
        const openaiModel = openai(MODEL_CONFIGS.openai[complexity]);
        result = await streamText({
          model: openaiModel,
          messages,
          ...streamingConfig,
          onFinish: async (result) => {
            const finishTime = Date.now() - startTime;
            console.log(`✅ [STREAM-FINISHED-FALLBACK] Total time: ${finishTime}ms`, {
              finishReason: result.finishReason,
              usage: result.usage,
              provider: 'openai-fallback',
              module: targetModule,
              classificationSource,
              originalProvider: selectedProvider
            });
          }
        });
      } else {
        throw providerError; // Re-throw se não for Google ou Perplexity
      }
    }

    const streamTime = Date.now() - streamStart;
    const totalTime = Date.now() - startTime;
    
    console.log(`⚡ [STREAM-OPTIMIZED] Total processing time: ${totalTime}ms (classification: ${classificationSource}, provider: ${finalProvider}, model: ${modelName})`);

    // 8. Retornar stream otimizado no formato esperado pelo useChat
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Enviar informações do módulo primeiro
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            trace: {
              module: targetModule,
              confidence: 0.8,
              intent: targetModule,
              slots: {}
            }
          })}\n\n`))

          // Usar AI SDK stream
          for await (const chunk of result.textStream) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
          }
          
          // Enviar metadados finais
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            metadata: { 
              model: modelName, 
              tier: complexity === 'complex' ? 'IA_SUPER' : 'IA',
              tokens: 0,
              module: targetModule,
              provider: finalProvider,
              complexity: complexity,
              classificationSource: classificationSource
            },
            meta: {
              provider: finalProvider,
              model: modelName,
              timestamp: Date.now()
            }
          })}\n\n`))
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Streaming error' })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Module': targetModule,
        'X-Provider': finalProvider,
        'X-Model': modelName,
        'X-Classification-Source': classificationSource,
        'X-Total-Time': `${totalTime}ms`,
        'X-Cache-Enabled': useCache.toString(),
        'X-Fallback-Used': (finalProvider !== selectedProvider).toString()
      }
    });

  } catch (error: any) {
    console.error('❌ [STREAM-OPTIMIZED] Error:', error);
    
    // Fallback para OpenAI em caso de erro
    try {
      console.log('🔄 [FALLBACK] Using OpenAI fallback');
      const fallbackResult = await streamText({
        model: openai('gpt-4o-mini'),
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente educacional. Responda em português brasileiro de forma clara e didática.'
          },
          {
            role: 'user',
            content: message || 'Erro no processamento da mensagem'
          }
        ],
        temperature: 0.7
      });
      
      // Fallback também precisa usar o formato correto
      const fallbackEncoder = new TextEncoder()
      const fallbackStream = new ReadableStream({
        async start(controller) {
          try {
            // Enviar trace do fallback
            controller.enqueue(fallbackEncoder.encode(`data: ${JSON.stringify({ 
              trace: {
                module: 'professor',
                confidence: 0.5,
                intent: 'fallback',
                slots: {}
              }
            })}\n\n`))

            // Stream do fallback
            for await (const chunk of fallbackResult.textStream) {
              controller.enqueue(fallbackEncoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
            }
            
            // Metadados do fallback
            controller.enqueue(fallbackEncoder.encode(`data: ${JSON.stringify({ 
              metadata: { 
                model: 'gpt-4o-mini', 
                tier: 'IA',
                tokens: 0,
                module: 'professor',
                provider: 'openai-fallback',
                complexity: 'simple',
                classificationSource: 'fallback'
              } 
            })}\n\n`))
            
            controller.enqueue(fallbackEncoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (error) {
            console.error('Fallback streaming error:', error)
            controller.enqueue(fallbackEncoder.encode(`data: ${JSON.stringify({ error: 'Fallback streaming error' })}\n\n`))
            controller.close()
          }
        }
      })

      return new Response(fallbackStream, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Fallback': 'true',
          'X-Error': error.message
        }
      });
    } catch (fallbackError) {
      console.error('❌ [FALLBACK-FAILED]', fallbackError);
      return NextResponse.json(
        { error: 'Internal server error', details: error.message },
        { status: 500 }
      );
    }
  }
}
