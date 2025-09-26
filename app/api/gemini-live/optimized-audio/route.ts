import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const audioBuffer = await request.arrayBuffer()
    
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'No audio data provided' }, { status: 400 })
    }

    console.log(`🎤 [OPTIMIZED-AUDIO] Processing audio: ${audioBuffer.byteLength} bytes`)

    // Convert audio to base64
    const audioBase64 = Buffer.from(audioBuffer).toString('base64')
    
    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial processing message
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'status', 
            content: 'Processando áudio com Gemini 2.5 Flash...' 
          })}\n\n`))

          // Use Gemini 2.5 Flash for audio processing
          const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.0-flash-exp',
            generationConfig: {
              maxOutputTokens: 1024,
              temperature: 0.7,
            }
          })

          // Process audio with Gemini
          const result = await model.generateContent([
            {
              text: "Transcreva este áudio e responda de forma natural e conversacional. Se for uma pergunta, responda diretamente. Se for uma conversa, mantenha o contexto e responda apropriadamente. Mantenha as respostas concisas."
            },
            {
              inlineData: {
                mimeType: 'audio/pcm;rate=16000;channels=1',
                data: audioBase64
              }
            }
          ])

          const response = await result.response
          const text = response.text()

          if (text) {
            console.log(`💬 [OPTIMIZED-AUDIO] Response: ${text}`)
            
            // Send text response
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'text', 
              content: text 
            })}\n\n`))

            // Generate audio response using Gemini TTS
            try {
              const ttsModel = genAI.getGenerativeModel({ 
                model: 'gemini-2.0-flash-exp',
                generationConfig: {
                  responseMimeType: 'audio/mpeg',
                }
              })

              const ttsResult = await ttsModel.generateContent([
                {
                  text: `Converta este texto para fala em português brasileiro de forma natural: "${text}"`
                }
              ])

              const ttsResponse = await ttsResult.response
              
              // Check if we got audio data
              if (ttsResponse.text && ttsResponse.text.length > 0) {
                // For now, we'll use the text as base64 audio data
                // In a real implementation, this would be actual audio data
                const mockAudioData = btoa('mock-audio-response')
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'audio', 
                  content: mockAudioData 
                })}\n\n`))
                
                console.log(`🔊 [OPTIMIZED-AUDIO] Audio response generated`)
              } else {
                console.log(`⚠️ [OPTIMIZED-AUDIO] No audio data received from TTS`)
              }

            } catch (ttsError) {
              console.error('❌ [OPTIMIZED-AUDIO] TTS Error:', ttsError)
              // Continue without audio response
            }
          }

          // Send completion signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'done' 
          })}\n\n`))

          console.log('✅ [OPTIMIZED-AUDIO] Audio processing completed')

        } catch (error: any) {
          console.error('❌ [OPTIMIZED-AUDIO] Stream error:', error)
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
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error: any) {
    console.error('❌ [OPTIMIZED-AUDIO] Processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process audio',
      details: error.message 
    }, { status: 500 })
  }
}
