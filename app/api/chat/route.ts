import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { getServerSession } from 'next-auth'


import { authOptions } from '@/lib/auth'


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
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Criar stream de resposta
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log(`🚀 [CHAT-STREAM] Starting stream for: "${message.substring(0, 30)}..."`)
          
          // Obter resultado do orquestrador
          const result = await orchestrate({ text: message, context })
          
          // Enviar trace primeiro
          if (result.trace) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ trace: result.trace })}\n\n`))
          }
          
          // Se o resultado tem streaming habilitado, usar streaming
          if (result.trace?.streaming) {
            console.log(`📡 [CHAT-STREAM] Using streaming response`)
            
            // Simular streaming palavra por palavra
            const words = result.text.split(' ')
            for (let i = 0; i < words.length; i++) {
              const word = words[i] + (i < words.length - 1 ? ' ' : '')
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: word })}\n\n`))
              
              // Pequeno delay para simular streaming natural
              await new Promise(resolve => setTimeout(resolve, 50))
            }
            
          } else {
            console.log(`📦 [CHAT-STREAM] Using non-streaming response`)
            
            // Resposta não-streaming - enviar tudo de uma vez
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: result.text })}\n\n`))
          }
          
          // Enviar metadados finais
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            metadata: {
              model: result.model || { modelId: 'gpt-4o-mini' },
              tier: result.tier || 'IA',
              tokens: result.tokens || 0,
              module: result.trace?.module || 'atendimento',
              provider: result.provider || 'openai',
              complexity: result.complexity || 'simple',
              routingReasoning: result.routingReasoning || 'OpenAI selecionado para chat educacional'
            }
          })}\n\n`))
          
          // Finalizar stream
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
          
        } catch (error) {
          console.error('❌ [CHAT-STREAM] Error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error'
          })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
