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

    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    console.log(`💬 [LIVE-STREAM] Processing text message: ${text}`)

    // Initialize Gemini API (standard version)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('🔗 [LIVE-STREAM] Processing text with Gemini API')
          
          // Send initial connection message
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'text', 
            content: 'Processando mensagem...' 
          })}\n\n`))

          // Create the prompt for text processing
          const prompt = `Responda de forma natural e conversacional à seguinte mensagem: "${text}". Seja útil, amigável e direto.`

          // Generate content with streaming
          const result = await model.generateContentStream(prompt)

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

          console.log('✅ [LIVE-STREAM] Text processing completed')

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
    console.error('❌ [LIVE-STREAM] Text processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process text message',
      details: error.message 
    }, { status: 500 })
  }
}
