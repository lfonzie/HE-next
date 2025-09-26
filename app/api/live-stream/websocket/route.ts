import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Store active sessions
const activeSessions = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'Gemini API key not configured' 
      }, { status: 500 })
    }

    const { type, data, mimeType } = await request.json()

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 })
    }

    console.log(`🎥 [LIVE-STREAM] Processing ${type} data: ${data.length} chars`)

    // Initialize Gemini API with native audio support
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp" })

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log(`🔗 [LIVE-STREAM] Processing ${type} with Gemini API`)
          
          // Send initial connection message
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'text', 
            content: `Processando ${type}...` 
          })}\n\n`))

          let prompt = ''
          let content = []

          // Prepare content based on type
          switch (type) {
            case 'audio':
              prompt = `Transcreva este áudio em português brasileiro e responda de forma natural e conversacional em português. Se for uma pergunta, responda diretamente. Se for uma conversa, mantenha o contexto e responda apropriadamente. Seja breve e direto.`
              content = [
                {
                  inlineData: {
                    mimeType: mimeType || 'audio/webm',
                    data: data
                  }
                },
                prompt
              ]
              break

            case 'video':
              prompt = `Analise este vídeo e descreva o que você vê em português brasileiro. Se houver áudio, transcreva-o também. Responda de forma breve e útil em português.`
              content = [
                {
                  inlineData: {
                    mimeType: mimeType || 'video/mp4',
                    data: data
                  }
                },
                prompt
              ]
              break

            case 'screen':
              prompt = `Analise esta captura de tela e descreva o que você vê em português brasileiro. Se houver texto visível, transcreva-o. Se for uma interface, explique o que está acontecendo de forma breve.`
              content = [
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: data
                  }
                },
                prompt
              ]
              break

            case 'text':
              prompt = `Responda de forma natural e conversacional em português brasileiro à seguinte mensagem: "${data}". Seja útil, amigável e direto.`
              content = [prompt]
              break

            default:
              throw new Error(`Unsupported type: ${type}`)
          }

          // Generate content with streaming
          const result = await model.generateContentStream(content)

          // Stream the response
          for await (const chunk of result.stream) {
            const chunkText = chunk.text()
            if (chunkText) {
              console.log(`💬 [LIVE-STREAM] ${type} chunk: ${chunkText}`)
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'text', 
                content: chunkText 
              })}\n\n`))
            }
          }

          // Send completion message
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'done' 
          })}\n\n`))

          console.log(`✅ [LIVE-STREAM] ${type} processing completed`)

        } catch (error: any) {
          console.error(`❌ [LIVE-STREAM] ${type} stream error:`, error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'error', 
            content: error.message 
          })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error: any) {
    console.error('❌ [LIVE-STREAM] WebSocket processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process media stream',
      details: error.message 
    }, { status: 500 })
  }
}
