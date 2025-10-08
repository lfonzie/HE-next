import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface StreamFeedbackRequest {
  content: string
  theme: string
  sessionId: string
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body: StreamFeedbackRequest = await request.json()
    const { content, theme, sessionId } = body

    // Validações básicas
    if (!content || !theme || !sessionId) {
      return NextResponse.json({ 
        error: 'Conteúdo, tema e sessionId são obrigatórios' 
      }, { status: 400 })
    }

    // Criar stream de resposta
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Enviar status inicial
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'status',
            message: 'Iniciando análise da redação...',
            progress: 0
          })}\n\n`))

          // Simular análise em etapas
          const steps = [
            { message: 'Analisando estrutura geral...', progress: 20 },
            { message: 'Verificando competência 1 (Domínio da norma)...', progress: 40 },
            { message: 'Verificando competência 2 (Compreensão do tema)...', progress: 60 },
            { message: 'Verificando competência 3 (Argumentação)...', progress: 80 },
            { message: 'Finalizando avaliação...', progress: 100 }
          ]

          for (const step of steps) {
            await new Promise(resolve => setTimeout(resolve, 1000)) // Simular processamento
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'progress',
              message: step.message,
              progress: step.progress
            })}\n\n`))
          }

          // Enviar resultado final
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            message: 'Avaliação concluída com sucesso!',
            progress: 100,
            sessionId: sessionId
          })}\n\n`))

          controller.close()
        } catch (error) {
          console.error('Erro no stream de feedback:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            message: 'Erro durante a análise',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error) {
    console.error('Erro no stream de feedback:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
