import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleGenAI, LiveServerMessage, MediaResolution, Modality, Session } from '@google/genai'

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
    const videoFile = formData.get('video') as File

    if (!videoFile) {
      return NextResponse.json({ error: 'Video file required' }, { status: 400 })
    }

    console.log(`📹 [LIVE-STREAM] Processing video frame: ${videoFile.size} bytes`)

    // Initialize Gemini Live
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })

    const model = 'models/gemini-2.5-flash-native-audio-preview-09-2025'

    const config = {
      responseModalities: [
        Modality.AUDIO,
        Modality.TEXT
      ],
      mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: 'Zephyr',
          }
        }
      },
      contextWindowCompression: {
        triggerTokens: '25600',
        slidingWindow: { targetTokens: '12800' },
      },
    }

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Connect to Gemini Live
          const liveSession = await ai.live.connect({
            model,
            callbacks: {
              onopen: function () {
                console.log('🔗 [LIVE-STREAM] Gemini Live connected for video')
              },
              onmessage: function (message: LiveServerMessage) {
                handleModelTurn(message, controller, encoder)
              },
              onerror: function (e: ErrorEvent) {
                console.error('❌ [LIVE-STREAM] Gemini Live error:', e.message)
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'error', 
                  content: e.message 
                })}\n\n`))
              },
              onclose: function (e: CloseEvent) {
                console.log('🔌 [LIVE-STREAM] Gemini Live closed:', e.reason)
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'done' 
                })}\n\n`))
                controller.close()
              },
            },
            config
          })

          // Convert video to base64 and send to Gemini Live
          const videoBuffer = await videoFile.arrayBuffer()
          const base64Video = Buffer.from(videoBuffer).toString('base64')
          
          liveSession.sendClientContent({
            turns: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Video
                }
              }
            ]
          })

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
    console.error('❌ [LIVE-STREAM] Video processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process video stream',
      details: error.message 
    }, { status: 500 })
  }
}

function handleModelTurn(message: LiveServerMessage, controller: ReadableStreamDefaultController, encoder: TextEncoder) {
  if (message.serverContent?.modelTurn?.parts) {
    const part = message.serverContent?.modelTurn?.parts?.[0]

    if (part?.fileData) {
      console.log(`📁 [LIVE-STREAM] File received: ${part?.fileData.fileUri}`)
    }

    if (part?.inlineData) {
      const inlineData = part?.inlineData
      const videoData = inlineData?.data ?? ''
      
      // Send video response
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
        type: 'video', 
        content: videoData,
        mimeType: inlineData.mimeType
      })}\n\n`))
    }

    if (part?.text) {
      console.log(`💬 [LIVE-STREAM] Text response: ${part?.text}`)
      
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
