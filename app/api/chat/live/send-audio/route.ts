import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Gemini API key is configured
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Gemini API key not configured. Please set GOOGLE_GENERATIVE_AI_API_KEY, GOOGLE_API_KEY, or GEMINI_API_KEY environment variable.' 
      }, { status: 500 })
    }

    // Parse form data
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file required' }, { status: 400 })
    }

    console.log(`🎤 [LIVE-CHAT] Processing audio: ${audioFile.size} bytes`)

    // Initialize Gemini API (using standard API instead of Live API)
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '')
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    })

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Convert audio to base64
          const audioBuffer = await audioFile.arrayBuffer()
          const audioBase64 = Buffer.from(audioBuffer).toString('base64')
          const mimeType = audioFile.type || 'audio/wav'

          // Generate content using standard Gemini API with audio
          const result = await model.generateContentStream([
            {
              text: "Please transcribe this audio and respond to it in a helpful way."
            },
            {
              inlineData: {
                mimeType,
                data: audioBase64
              }
            }
          ])

          // Stream the response
          for await (const chunk of result.stream) {
            const chunkText = chunk.text()
            if (chunkText) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'text', 
                content: chunkText 
              })}\n\n`))
            }
          }

          // Send completion signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'done' 
          })}\n\n`))
          controller.close()

        } catch (error: any) {
          console.error('❌ [LIVE-CHAT] Stream error:', error)
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
    console.error('❌ [LIVE-CHAT] Audio processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process audio',
      details: error.message 
    }, { status: 500 })
  }
}