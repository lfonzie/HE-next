import { NextRequest } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { streamText, generateText } from 'ai'


import { openai } from '@ai-sdk/openai'


import { anthropic } from '@ai-sdk/anthropic'


import { google } from '@ai-sdk/google'


import { fastClassify } from '@/lib/fast-classifier'


import { getOptimizedStreamingConfig } from '@/lib/streaming-optimizer'


import { generateCacheKey, responseCache } from '@/lib/aggressive-cache'



// Schema simplificado para Vercel AI SDK
const AISDKRequestSchema = {
  message: 'string',
  module: 'string?',
  conversationId: 'string?',
  history: 'array?',
  useCache: 'boolean?'
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()
  
  console.log(`🚀 [AI-SDK-FAST] START - ${timestamp}`)
  
  try {
    const parseStart = Date.now()
    const body = await request.json()
    const { message, module = 'auto', conversationId, history = [], useCache = true } = body
    const parseTime = Date.now() - parseStart
    console.log(`⏱️ [PARSE] Completed in ${parseTime}ms`)

    if (!message?.trim()) {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    console.log(`🚀 [AI-SDK-FAST] Processing: "${message.substring(0, 30)}..." module=${module}`)
    
    // 1. Verificar cache primeiro (se habilitado)
    if (useCache) {
      const cacheKey = generateCacheKey(message, module, history.length)
      const cachedResponse = responseCache.get(cacheKey)
      
      if (cachedResponse) {
        console.log(`🎯 [CACHE-HIT] Using cached response for: "${message.substring(0, 30)}..."`)
        return new Response(cachedResponse, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Cached': 'true',
            'X-Module': module,
            'X-Latency': `${Date.now() - startTime}ms`
          }
        })
      }
    }

    // 2. Classificação rápida local
    let targetModule = module
    if (module === 'auto') {
      const classification = fastClassify(message, history.length)
      targetModule = classification.module
      console.log(`🎯 [FAST-CLASSIFY] ${targetModule} (confidence: ${classification.confidence})`)
    }

    // 3. Configuração otimizada do modelo
    const streamingConfig = getOptimizedStreamingConfig(targetModule)
    
    // Seleção inteligente de modelo baseada no módulo
    let modelInstance
    switch (targetModule) {
      case 'ti':
      case 'financeiro':
        // Modelos mais rápidos para módulos simples
        modelInstance = openai('gpt-4o-mini')
        break
      case 'professor':
      case 'enem':
        // Modelo padrão para módulos educacionais
        modelInstance = openai('gpt-4o-mini')
        break
      case 'aula_interativa':
        // Modelo com mais tokens para aulas
        modelInstance = openai('gpt-4o-mini')
        break
      default:
        modelInstance = openai('gpt-4o-mini')
    }

    // 4. Preparar mensagens otimizadas para Vercel AI SDK
    const messages = [
      // System prompt otimizado baseado no módulo
      {
        role: 'system' as const,
        content: getSystemPrompt(targetModule)
      },
      // Histórico reduzido (últimas 3 mensagens para velocidade)
      ...history.slice(-3).map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      // Mensagem atual
      {
        role: 'user' as const,
        content: message
      }
    ]

    // 5. Headers otimizados
    const headers = {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Provider': 'vercel-ai-sdk',
      'X-Model': 'gpt-4o-mini',
      'X-Module': targetModule,
      'X-Optimized': 'true',
      'X-Latency': `${Date.now() - startTime}ms`
    }

    // 6. Streaming otimizado com Vercel AI SDK
    try {
      const result = await streamText({
        model: modelInstance,
        messages,
        temperature: streamingConfig.temperature,
        // Otimizações específicas do Vercel AI SDK
        experimental_streamData: false, // Desabilitar para velocidade
      })

      // 7. Interceptar stream para cache (se habilitado)
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
                    // Cache a resposta completa
                    if (fullResponse.length > 0) {
                      responseCache.set(cacheKey, fullResponse)
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

      // Retornar stream normal se cache desabilitado
      return result.toTextStreamResponse({ headers })

    } catch (streamingError: any) {
      console.error('❌ [AI-SDK-FAST] Streaming error:', streamingError)
      
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
    console.error(`❌ [AI-SDK-FAST] Fatal error: ${error.message} latency=${totalLatency}ms`)
    
    return Response.json({
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// System prompts otimizados por módulo
function getSystemPrompt(module: string): string {
  const prompts = {
    professor: `Você é um professor especializado em educação. Responda de forma clara, didática e objetiva. Foque em explicar conceitos de forma simples e prática.`,
    
    enem: `Você é um especialista em ENEM. Forneça explicações concisas e diretas sobre questões e conceitos do ENEM.`,
    
    aula_interativa: `Você é um professor criador de aulas interativas. Crie conteúdo educativo envolvente e didático.`,
    
    ti: `Você é um especialista em TI. Forneça soluções técnicas práticas e diretas para problemas de tecnologia.`,
    
    financeiro: `Você é um especialista em questões financeiras. Responda de forma clara e objetiva sobre pagamentos e questões financeiras.`,
    
    default: `Você é um assistente educacional. Responda de forma clara, objetiva e útil.`
  }
  
  return prompts[module as keyof typeof prompts] || prompts.default
}
