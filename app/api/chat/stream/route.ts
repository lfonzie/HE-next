import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { openai } from '@/lib/openai'
import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { getModelTier } from '@/lib/ai-config'
import { routeAIModel } from '@/lib/ai-model-router'
import { orchestrate } from '@/lib/orchestrator'
import { logUsageFromCallback } from '@/lib/token-logger'
import '@/lib/orchestrator-modules' // ensure modules are registered

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação usando NextAuth - OBRIGATÓRIO
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    console.log('🤖 Chat request:', message, 'Context:', context)

    // Verificar se a chave da OpenAI está configurada
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Usar orchestrator para classificação e resposta
    console.log('🔄 Usando orchestrator para classificação e resposta')

    // Preparar contexto para o orchestrator
    const orchestratorContext = {
      module: context?.module || 'auto',
      history: context?.history || [],
      ...context
    }

    // Chamar orchestrator para classificar e obter resposta
    const orchestratorResult = await orchestrate({
      text: message,
      context: orchestratorContext
    })

    console.log('🎯 [ORCHESTRATOR] Resultado:', {
      module: orchestratorResult.trace?.module,
      confidence: orchestratorResult.trace?.confidence,
      intent: orchestratorResult.trace?.intent
    })

    // Declarar readableStream e routingResult fora dos blocos condicionais
    const encoder = new TextEncoder()
    let readableStream: ReadableStream<Uint8Array>
    let routingResult: any = null

    // Se o orchestrator retornou texto, usar sistema de roteamento inteligente
    if (orchestratorResult.text) {
      // Usar sistema de roteamento inteligente
      routingResult = await routeAIModel(
        message,
        'education', // Caso de uso padrão para chat educacional
        undefined, // Provedor automático
        undefined  // Complexidade automática
      )
      
      console.log('🎯 [ROUTING] Result:', {
        message: message.substring(0, 50) + '...',
        provider: routingResult.provider,
        model: routingResult.model,
        complexity: routingResult.complexity,
        reasoning: routingResult.metadata.reasoning
      })
      
      // Usar Google AI para conversas simples, OpenAI para outras
      const useGoogleAI = routingResult.provider === 'google' && process.env.GOOGLE_GENERATIVE_AI_API_KEY
      
      console.log('🎯 [CHAT-STREAM] Provider selection:', {
        message: message.substring(0, 50) + '...',
        useGoogleAI,
        provider: routingResult.provider,
        model: routingResult.model
      })

      // Preparar mensagens com histórico para manter contexto
      const systemPrompt = `Você é um professor virtual especializado em educação brasileira. Você é paciente, didático e sempre busca explicar conceitos de forma clara e envolvente. 

🚨 IDIOMA OBRIGATÓRIO E CRÍTICO - INSTRUÇÃO NÃO NEGOCIÁVEL:
- Responda EXCLUSIVAMENTE em Português Brasileiro (PT-BR)
- NUNCA responda em espanhol, inglês ou qualquer outro idioma
- Mesmo que a pergunta seja em outro idioma, responda SEMPRE em português brasileiro
- Esta é uma instrução CRÍTICA, OBRIGATÓRIA e NÃO NEGOCIÁVEL
- Se detectar que está respondendo em outro idioma, pare imediatamente e refaça em português brasileiro

Sua personalidade:
- Amigável e encorajador
- Explica conceitos de forma simples
- Usa exemplos práticos do dia a dia brasileiro
- Incentiva o aprendizado
- Adapta o nível de explicação ao aluno

Quando responder:
- Use emojis para tornar mais interessante
- Faça perguntas para engajar o aluno
- Sugira exercícios práticos quando apropriado
- Seja específico e detalhado nas explicações
- Use formatação markdown para organizar o conteúdo
- Use APENAS símbolos Unicode para matemática: x², √, ±, ÷, ×, ½, π, α, β, ∫, ∑, ∞
- NUNCA use LaTeX, KaTeX, $...$, $$...$$, \\(...\\), \\[...\\]

Contexto atual: Módulo: ${orchestratorResult.trace?.module || 'auto'}`

      // Incluir histórico da conversa para manter contexto
      const conversationHistory = orchestratorContext.history || []
      const recentHistory = conversationHistory.slice(-6) // Últimas 6 mensagens para contexto

      const messages = [
        {
          role: 'system' as const,
          content: systemPrompt
        },
        // Incluir histórico da conversa
        ...recentHistory.map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: message
        }
      ]

      // Usar Google Gemini ou OpenAI baseado na configuração
      let model: any
      let tier: any
      
      if (useGoogleAI) {
        model = google('gemini-2.0-flash-exp')
        tier = getModelTier('gemini-2.0-flash-exp')
        console.log('🤖 [CHAT-STREAM] Using Google Gemini with memory')
      } else {
        model = 'gpt-4o-mini'
        tier = getModelTier(model)
        console.log('🤖 [CHAT-STREAM] Using OpenAI GPT-4o-mini')
      }
      
      // Configurar routing result para headers
      routingResult = {
        provider: useGoogleAI ? 'google' : 'openai',
        model: useGoogleAI ? 'gemini-2.0-flash-exp' : model,
        complexity: 'simple',
        useCase: 'chat',
        metadata: {
          cost: useGoogleAI ? 'low' : 'low',
          speed: useGoogleAI ? 'very-fast' : 'fast',
          quality: useGoogleAI ? 'high' : 'good',
          reasoning: useGoogleAI ? 'Google Gemini selecionado para chat educacional' : 'OpenAI selecionado para chat educacional'
        }
      }
      
      // Usar AI SDK para streaming (compatível com Google e OpenAI)
      const result = await streamText({
        model: model,
        messages: messages,
        temperature: 0.7,
        onFinish: async (result) => {
          console.log('✅ [CHAT-STREAM] Stream finished:', {
            finishReason: result.finishReason,
            usage: result.usage,
            provider: useGoogleAI ? 'google' : 'openai',
            module: orchestratorResult.trace?.module || 'auto'
          })

          // Track usage
          try {
            await logUsageFromCallback(
              session.user.id,
              'Chat' as const,
              result,
              useGoogleAI ? 'gemini-2.0-flash-exp' : 'gpt-4o-mini',
              useGoogleAI ? 'google' : 'openai',
              undefined, // Response time will be calculated by the logger
              {
                subject: orchestratorResult.trace?.module || 'auto',
                messages: { 
                  module: orchestratorResult.trace?.module || 'auto',
                  complexity: routingResult.complexity,
                  intent: orchestratorResult.trace?.intent
                }
              }
            )
          } catch (error) {
            console.warn('⚠️ [CHAT-STREAM] Failed to log usage:', error)
          }
        }
      })

      readableStream = new ReadableStream({
        async start(controller) {
          try {
            // Enviar informações do módulo primeiro
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              trace: {
                module: orchestratorResult.trace?.module,
                confidence: orchestratorResult.trace?.confidence,
                intent: orchestratorResult.trace?.intent,
                slots: orchestratorResult.trace?.slots
              }
            })}\n\n`))

            // Usar AI SDK stream
            for await (const chunk of result.textStream) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
            }
            // Enviar metadados finais incluindo tier e módulo
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              metadata: { 
                model: routingResult.model, 
                tier: routingResult.complexity === 'simple' ? 'IA' : 
                      routingResult.complexity === 'complex' ? 'IA_SUPER' : 'IA_ECO',
                tokens: 0, // Será calculado pelo cliente
                module: orchestratorResult.trace?.module,
                provider: routingResult.provider,
                complexity: routingResult.complexity,
                routingReasoning: routingResult.metadata.reasoning
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
    } else {
      // Se o orchestrator não retornou texto, retornar resposta direta
      readableStream = new ReadableStream({
        async start(controller) {
          try {
            // Enviar informações do módulo
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              trace: {
                module: orchestratorResult.trace?.module,
                confidence: orchestratorResult.trace?.confidence,
                intent: orchestratorResult.trace?.intent,
                slots: orchestratorResult.trace?.slots
              }
            })}\n\n`))
            
            // Enviar texto do orchestrator
            if (orchestratorResult.text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: orchestratorResult.text })}\n\n`))
            }
            
            // Enviar metadados finais
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              metadata: { 
                model: 'orchestrator',
                tier: 'IA',
                tokens: 0,
                module: orchestratorResult.trace?.module
              } 
            })}\n\n`))
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (error) {
            console.error('Orchestrator streaming error:', error)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Orchestrator streaming error' })}\n\n`))
            controller.close()
          }
        }
      })
    }

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'X-Provider': routingResult?.provider || 'openai',
        'X-Model': routingResult?.model || 'gpt-4o-mini',
        'X-UseCase': routingResult?.useCase || 'chat',
        'X-Complexity': routingResult?.complexity || 'simple',
        'X-Cost': routingResult?.metadata?.cost || 'low',
        'X-Speed': routingResult?.metadata?.speed || 'fast',
        'X-Quality': routingResult?.metadata?.quality || 'good',
        'X-Reasoning': routingResult?.metadata?.reasoning || 'Default routing',
      },
    })

  } catch (error: any) {
    console.error('Chat API error:', error)
    
    // Preparar erro amigável
    let friendlyError = 'Erro interno do servidor. Tente novamente.'
    
    if (error.message?.includes('rate limit')) {
      friendlyError = 'Limite de taxa excedido. Tente novamente em alguns minutos.'
    } else if (error.message?.includes('quota')) {
      friendlyError = 'Cota de tokens excedida. Verifique seu plano.'
    } else if (error.message?.includes('network')) {
      friendlyError = 'Erro de conexão. Verifique sua internet e tente novamente.'
    } else if (error.message?.includes('API key')) {
      friendlyError = 'Chave da OpenAI não configurada. Verifique as configurações.'
    }

    return NextResponse.json({ error: friendlyError }, { status: 500 })
  }
}
