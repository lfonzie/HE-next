import { NextRequest } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { streamText, generateText } from 'ai'


import { openai } from '@ai-sdk/openai'


import { fastClassify } from '@/lib/fast-classifier'


import { generateCacheKey, responseCache } from '@/lib/aggressive-cache'



// Configurações ultra-otimizadas para Vercel AI SDK
const ULTRA_CONFIGS = {
  professor: {
    model: 'gpt-4o-mini',
    maxTokens: 600,
    temperature: 0.5,
    topP: 0.9,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1
  },
  enem: {
    model: 'gpt-4o-mini',
    maxTokens: 400,
    temperature: 0.3,
    topP: 0.8,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0
  },
  ti: {
    model: 'gpt-4o-mini',
    maxTokens: 300,
    temperature: 0.2,
    topP: 0.7,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0
  },
  financeiro: {
    model: 'gpt-4o-mini',
    maxTokens: 200,
    temperature: 0.1,
    topP: 0.6,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0
  },
  default: {
    model: 'gpt-4o-mini',
    maxTokens: 500,
    temperature: 0.4,
    topP: 0.8,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const { message, module = 'auto', conversationId, history = [], useCache = true } = body

    if (!message?.trim()) {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    console.log(`⚡ [AI-SDK-ULTRA] Processing: "${message.substring(0, 30)}..." module=${module}`)
    
    // 1. Cache ultra-agressivo
    if (useCache) {
      const cacheKey = generateCacheKey(message, module, history.length)
      const cachedResponse = responseCache.get(cacheKey)
      
      if (cachedResponse) {
        console.log(`🎯 [ULTRA-CACHE-HIT] Using cached response`)
        return new Response(cachedResponse, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Cached': 'true',
            'X-Module': module,
            'X-Latency': `${Date.now() - startTime}ms`,
            'X-Ultra': 'true'
          }
        })
      }
    }

    // 2. Classificação ultra-rápida
    let targetModule = module
    if (module === 'auto') {
      const classification = fastClassify(message, history.length)
      targetModule = classification.module
      console.log(`🎯 [ULTRA-CLASSIFY] ${targetModule} (confidence: ${classification.confidence})`)
    }

    // 3. Configuração ultra-otimizada
    const config = ULTRA_CONFIGS[targetModule as keyof typeof ULTRA_CONFIGS] || ULTRA_CONFIGS.default
    const modelInstance = openai(config.model)

    // 4. Mensagens ultra-otimizadas (apenas 2 mensagens do histórico)
    const messages = [
      {
        role: 'system' as const,
        content: getUltraSystemPrompt(targetModule)
      },
      ...history.slice(-2).map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: message
      }
    ]

    // 5. Headers ultra-otimizados
    const headers = {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Provider': 'vercel-ai-sdk-ultra',
      'X-Model': config.model,
      'X-Module': targetModule,
      'X-Ultra': 'true',
      'X-Latency': `${Date.now() - startTime}ms`
    }

    // 6. Streaming ultra-otimizado
    try {
      const result = await streamText({
        model: modelInstance,
        messages,
        maxTokens: config.maxTokens,
        temperature: config.temperature,
        topP: config.topP,
        frequencyPenalty: config.frequencyPenalty,
        presencePenalty: config.presencePenalty,
        // Otimizações específicas do Vercel AI SDK
        experimental_streamData: false,
        experimental_telemetry: false,
        // Configurações de performance
        abortSignal: request.signal,
      })

      // 7. Cache inteligente com interceptação
      if (useCache) {
        const cacheKey = generateCacheKey(message, module, history.length)
        let fullResponse = ''
        
        const originalStream = result.textStream
        const cachedStream = new ReadableStream({
          start(controller) {
            const reader = originalStream.getReader()
            
            const pump = async () => {
              try {
                while (true) {
                  const { done, value } = await reader.read()
                  
                  if (done) {
                    // Cache apenas respostas com mais de 10 caracteres
                    if (fullResponse.length > 10) {
                      responseCache.set(cacheKey, fullResponse)
                      console.log(`💾 [ULTRA-CACHE-SAVE] Cached response (${fullResponse.length} chars)`)
                    }
                    controller.close()
                    break
                  }
                  
                  fullResponse += value
                  controller.enqueue(value)
                }
              } catch (error) {
                controller.error(error)
              }
            }
            
            pump()
          }
        })

        return new Response(cachedStream, { headers })
      }

      // Retornar stream normal
      return result.toTextStreamResponse({ headers })

    } catch (streamingError: any) {
      console.error('❌ [AI-SDK-ULTRA] Streaming error:', streamingError)
      
      return new Response(
        `Desculpe, houve um problema ao processar sua mensagem. Tente novamente.`,
        {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Provider': 'error',
            'X-Module': targetModule,
            'X-Error': streamingError.message
          }
        }
      )
    }

  } catch (error: any) {
    const totalLatency = Date.now() - startTime
    console.error(`❌ [AI-SDK-ULTRA] Fatal error: ${error.message} latency=${totalLatency}ms`)
    
    return Response.json({
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// System prompts ultra-otimizados
function getUltraSystemPrompt(module: string): string {
  const prompts = {
    professor: `Professor especializado. Respostas claras e didáticas. Máximo 3 parágrafos.`,
    
    enem: `Especialista ENEM. Explicações concisas e diretas. Máximo 2 parágrafos.`,
    
    aula_interativa: `Professor criador de aulas. Conteúdo envolvente e didático. Máximo 4 parágrafos.`,
    
    ti: `Especialista TI. Soluções técnicas práticas. Máximo 2 parágrafos.`,
    
    financeiro: `Especialista financeiro. Respostas claras sobre pagamentos. Máximo 1 parágrafo.`,
    
    default: `Assistente educacional. Respostas claras e objetivas. Máximo 2 parágrafos.`
  }
  
  return prompts[module as keyof typeof prompts] || prompts.default
}
