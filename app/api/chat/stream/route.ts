import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { openai } from '@/lib/openai'
import { getModelTier } from '@/lib/ai-config'
import { orchestrate } from '@/lib/orchestrator'
import '@/lib/orchestrator-modules' // ensure modules are registered

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação usando NextAuth (desabilitado temporariamente para desenvolvimento)
    const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

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
      module: context?.module || 'atendimento',
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

    // Declarar readableStream fora dos blocos condicionais
    const encoder = new TextEncoder()
    let readableStream: ReadableStream<Uint8Array>

    // Se o orchestrator retornou texto, usar OpenAI para streaming
    if (orchestratorResult.text) {
      const messages = [
        {
          role: 'system' as const,
          content: `Você é um professor virtual especializado em educação brasileira. Você é paciente, didático e sempre busca explicar conceitos de forma clara e envolvente. 

Sua personalidade:
- Amigável e encorajador
- Explica conceitos de forma simples
- Usa exemplos práticos do dia a dia
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

Contexto atual: Módulo: ${orchestratorResult.trace?.module || 'atendimento'}`
        },
        {
          role: 'user' as const,
          content: message
        }
      ]

      // Usar modelo rápido por padrão
      const model = 'gpt-4o-mini'
      const tier = getModelTier(model)
      
      // Chamar OpenAI com streaming
      const completion = await openai.chat.completions.create({
        model: model,
        messages: messages as any,
        max_completion_tokens: 2000,
        temperature: 0.7,
        stream: true
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

            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content || ''
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
              }
            }
            // Enviar metadados finais incluindo tier e módulo
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              metadata: { 
                model: model, 
                tier: tier,
                tokens: 0, // Será calculado pelo cliente
                module: orchestratorResult.trace?.module
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
