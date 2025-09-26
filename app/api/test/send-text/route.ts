import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI, LiveServerMessage, MediaResolution, Modality, Session } from '@google/genai'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    console.log(`💬 [LIVE-CHAT-TEST] Processing text: "${message}"`)

    // Create streaming response with simulated AI response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Simulate AI processing delay
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Send simulated response
          const response = `Olá! Recebi sua mensagem: "${message}". Esta é uma resposta simulada do chat ao vivo. Para usar o Gemini Live real, você precisa configurar a API key.`
          
          // Stream the response character by character
          for (let i = 0; i < response.length; i++) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'text', 
              content: response[i] 
            })}\n\n`))
            await new Promise(resolve => setTimeout(resolve, 50)) // Simulate typing
          }
          
          // Send completion signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'done' 
          })}\n\n`))
          controller.close()

        } catch (error: any) {
          console.error('❌ [LIVE-CHAT-TEST] Stream error:', error)
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
    console.error('❌ [LIVE-CHAT-TEST] Text processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process text',
      details: error.message 
    }, { status: 500 })
  }
}

function handleModelTurn(message: LiveServerMessage, controller: ReadableStreamDefaultController, encoder: TextEncoder) {
  if (message.serverContent?.modelTurn?.parts) {
    const part = message.serverContent?.modelTurn?.parts?.[0]

    if (part?.fileData) {
      console.log(`📁 [LIVE-CHAT-TEST] File received: ${part?.fileData.fileUri}`)
    }

    if (part?.inlineData) {
      const inlineData = part?.inlineData
      const audioData = inlineData?.data ?? ''
      
      // Send audio response
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
        type: 'audio', 
        content: audioData,
        mimeType: inlineData.mimeType
      })}\n\n`))
    }

    if (part?.text) {
      console.log(`💬 [LIVE-CHAT-TEST] Text response: ${part?.text}`)
      
      // Send text response
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
        type: 'text', 
        content: part?.text 
      })}\n\n`))
    }
  }

  // Check if turn is complete
  if (message.serverContent && message.serverContent.turnComplete) {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
      type: 'done' 
    })}\n\n`))
  }
}
