import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI, Modality, MediaResolution } from '@google/genai'

// Google Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'Zephyr', speed = 1.0, pitch = 0.0 } = await request.json()

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Check if Gemini API key is configured
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please set GEMINI_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    console.log(`🎤 [GEMINI-2.5-NATIVE-AUDIO] Generating audio for: "${text.substring(0, 50)}..."`)

    // Initialize Gemini Live API
    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    })

    const model = 'models/gemini-2.5-flash-native-audio-preview-09-2025'

    const config = {
      responseModalities: [Modality.AUDIO],
      mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voice,
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
    let isControllerClosed = false
    let session: any = null
    let isSessionClosed = false
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log(`🔗 [GEMINI-2.5-NATIVE-AUDIO] Connecting to Live API...`)
          
          session = await ai.live.connect({
            model,
            callbacks: {
              onopen: function () {
                console.log('✅ [GEMINI-2.5-NATIVE-AUDIO] Connection opened')
              },
              onmessage: function (message: any) {
                // Early return if already closed
                if (isControllerClosed || isSessionClosed || controller.desiredSize === null) {
                  return
                }
                
                console.log('📨 [GEMINI-2.5-NATIVE-AUDIO] Message received:', message.type || 'undefined')
                console.log('📨 [GEMINI-2.5-NATIVE-AUDIO] Full message structure:', JSON.stringify(message, null, 2))
                
                // Check for audio data in different possible structures
                let audioData = null
                let mimeType = 'audio/wav'
                
                // Try different message structures
                if (message.serverContent?.modelTurn?.parts) {
                  const part = message.serverContent.modelTurn.parts[0]
                  
                  if (part?.inlineData) {
                    audioData = part.inlineData.data
                    mimeType = part.inlineData.mimeType || 'audio/wav'
                    console.log(`🎵 [GEMINI-2.5-NATIVE-AUDIO] Audio data found in modelTurn.parts`)
                  }
                }
                
                // Alternative structure check
                if (!audioData && message.inlineData) {
                  audioData = message.inlineData.data
                  mimeType = message.inlineData.mimeType || 'audio/wav'
                  console.log(`🎵 [GEMINI-2.5-NATIVE-AUDIO] Audio data found in inlineData`)
                }
                
                // Another alternative structure
                if (!audioData && message.data) {
                  audioData = message.data
                  console.log(`🎵 [GEMINI-2.5-NATIVE-AUDIO] Audio data found in data field`)
                }
                
                if (audioData) {
                  console.log(`🎵 [GEMINI-2.5-NATIVE-AUDIO] Audio data received: ${audioData.length} chars, mimeType: ${mimeType}`)
                  
                  // Send audio data to client
                  try {
                    if (!isControllerClosed && !isSessionClosed && controller.desiredSize !== null) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                        type: 'audio', 
                        data: audioData,
                        mimeType: mimeType
                      })}\n\n`))
                    }
                  } catch (error) {
                    console.error('❌ [GEMINI-2.5-NATIVE-AUDIO] Error enqueueing audio data:', error)
                    closeControllerAndSession()
                  }
                }
                
                // Check for text content
                if (message.serverContent?.modelTurn?.parts) {
                  const part = message.serverContent.modelTurn.parts[0]
                  if (part?.text) {
                    console.log(`💬 [GEMINI-2.5-NATIVE-AUDIO] Text: ${part.text}`)
                  }
                }
                
                if (message.serverContent?.turnComplete) {
                  console.log('✅ [GEMINI-2.5-NATIVE-AUDIO] Turn complete')
                  closeControllerAndSession()
                }
              },
              onerror: function (e: any) {
                console.error('❌ [GEMINI-2.5-NATIVE-AUDIO] Error:', e.message)
                closeControllerAndSession(e.message)
              },
              onclose: function (e: any) {
                console.log('🔒 [GEMINI-2.5-NATIVE-AUDIO] Connection closed:', e.reason)
                closeControllerAndSession()
              },
            },
            config
          })

          // Send text to convert to speech
          session.sendClientContent({
            turns: [`Convert this text to speech in Portuguese Brazilian: "${text.trim()}"`]
          })

          // Helper function to close controller and session
          function closeControllerAndSession(errorMessage?: string) {
            if (isControllerClosed) return
            
            isControllerClosed = true
            isSessionClosed = true
            
            try {
              if (controller.desiredSize !== null) {
                if (errorMessage) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                    type: 'error', 
                    content: errorMessage 
                  })}\n\n`))
                } else {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                    type: 'done' 
                  })}\n\n`))
                }
                controller.close()
              }
            } catch (error) {
              console.error('❌ [GEMINI-2.5-NATIVE-AUDIO] Error closing controller:', error)
            }
            
            // Close session if it exists
            if (session && !isSessionClosed) {
              try {
                session.close()
              } catch (error) {
                console.error('❌ [GEMINI-2.5-NATIVE-AUDIO] Error closing session:', error)
              }
            }
          }

        } catch (error: any) {
          console.error('❌ [GEMINI-2.5-NATIVE-AUDIO] Stream error:', error)
          closeControllerAndSession(error.message)
        }
      },
      
      // Add cancel method to handle client disconnection
      cancel() {
        console.log('🚫 [GEMINI-2.5-NATIVE-AUDIO] Stream cancelled by client')
        isControllerClosed = true
        isSessionClosed = true
        
        if (session) {
          try {
            session.close()
          } catch (error) {
            console.error('❌ [GEMINI-2.5-NATIVE-AUDIO] Error closing session on cancel:', error)
          }
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

  } catch (error) {
    console.error('❌ [GEMINI-2.5-AUDIO-PREVIEW] Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate audio with Gemini 2.5 Audio Preview',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
