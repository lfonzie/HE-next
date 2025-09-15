import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { openai } from '@/lib/openai'

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

    console.log('🤖 Chat OpenAI request:', message, 'Context:', context)

    // Verificar se a chave da OpenAI está configurada
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Construir mensagens para OpenAI
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

Contexto atual: ${context?.module ? `Módulo: ${context.module}` : 'Chat geral'}`
      },
      {
        role: 'user' as const,
        content: message
      }
    ]

    // Chamar OpenAI com streaming
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any,
      max_completion_tokens: 2000,
      temperature: 0.7,
      stream: true
    })

    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
            }
          }
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
