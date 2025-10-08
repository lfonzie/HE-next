import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    console.log(`🎤 [LIVE-STREAM] Processing audio file: ${audioFile.name}, size: ${audioFile.size} bytes`)

    // Convert audio file to base64
    const arrayBuffer = await audioFile.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')

    // Initialize Gemini API (Gemini 2.5 version)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('🔗 [LIVE-STREAM] Processing audio with Gemini 2.5')
          
          // Send initial connection message
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'text', 
            content: 'Processando áudio com Gemini 2.5...' 
          })}\n\n`))

          // Create the prompt for audio processing
          const prompt = `Transcreva este áudio e responda de forma natural e conversacional. Se for uma pergunta, responda diretamente. Se for uma conversa, mantenha o contexto e responda apropriadamente.`

          // Generate content with streaming
          const result = await model.generateContentStream([
            {
              inlineData: {
                mimeType: 'audio/webm',
                data: base64Audio
              }
            },
            prompt
          ])

          // Stream the response
          for await (const chunk of result.stream) {
            const chunkText = chunk.text()
            if (chunkText) {
              console.log(`💬 [LIVE-STREAM] Text chunk: ${chunkText}`)
              
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

          console.log('✅ [LIVE-STREAM] Audio processing completed')

        } catch (error: any) {
          console.error('❌ [LIVE-STREAM] Stream error:', error)
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
    console.error('❌ [LIVE-STREAM] Audio processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process audio stream',
      details: error.message 
    }, { status: 500 })
  }
}
