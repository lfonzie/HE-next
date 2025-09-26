import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        error: 'Gemini API key not configured'
      }, { status: 500 })
    }

    const { type, data, mimeType, context } = await request.json()

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 })
    }

    console.log(`🎤 [GEMINI-2.5-TTS] Processing ${type} with native audio response`)

    // Initialize Gemini API with TTS model
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    
    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log(`🔗 [GEMINI-2.5-TTS] Processing ${type} with native TTS`)
          
          // Send initial processing message
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'text', 
            content: `Processando ${type} com Gemini 2.5 TTS...` 
          })}\n\n`))

          let prompt = ''
          let content = []

          // Prepare content for TTS model
          switch (type) {
            case 'audio':
              prompt = `Transcreva este áudio em português brasileiro e responda de forma natural e conversacional. Se for uma pergunta, responda diretamente. Se for uma conversa, mantenha o contexto e responda apropriadamente. Seja breve, claro e amigável.`
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
              prompt = `Analise este vídeo e descreva o que você vê em português brasileiro. Se houver áudio, transcreva-o também. Responda de forma breve e útil, como se estivesse explicando para um amigo.`
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
              prompt = `Analise esta captura de tela e descreva o que você vê em português brasileiro. Se houver texto visível, transcreva-o. Se for uma interface, explique o que está acontecendo de forma clara e natural.`
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

          // Add context if provided
          if (context) {
            content.push(`Contexto da conversa: ${context}`)
          }

          // First, get text response using regular model
          const textModel = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })

          const textResult = await textModel.generateContent(content)
          const textResponse = await textResult.response
          const responseText = textResponse.text()

          console.log(`💬 [GEMINI-2.5-TTS] Text response: ${responseText}`)

          // Send text response
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'text', 
            content: responseText 
          })}\n\n`))

          // Now generate audio response using TTS model
          try {
            const ttsModel = genAI.getGenerativeModel({ 
              model: "gemini-2.5-flash-preview-tts",
              generationConfig: {
                responseMimeType: "audio/mpeg",
                responseSchema: {
                  type: "object",
                  properties: {
                    audio: {
                      type: "string",
                      description: "Base64 encoded audio data"
                    }
                  }
                }
              }
            })

            const ttsResult = await ttsModel.generateContent([
              `Convert this text to speech in Portuguese Brazilian: "${responseText}"`
            ])
            
            const ttsResponse = await ttsResult.response
            
            // The TTS model returns audio data
            if (ttsResponse.text) {
              console.log(`🎤 [GEMINI-2.5-TTS] Audio response generated`)
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'audio_response', 
                content: responseText,
                audioData: ttsResponse.text()
              })}\n\n`))
            }

          } catch (ttsError: any) {
            console.error('❌ [GEMINI-2.5-TTS] TTS error:', ttsError)
            // Fallback to text response
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'audio_response', 
              content: responseText 
            })}\n\n`))
          }

          // Send completion message
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'done' 
          })}\n\n`))

          console.log(`✅ [GEMINI-2.5-TTS] ${type} processing completed with native TTS`)

        } catch (error: any) {
          console.error(`❌ [GEMINI-2.5-TTS] ${type} stream error:`, error)
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
    console.error('❌ [GEMINI-2.5-TTS] Processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process Gemini 2.5 TTS stream',
      details: error.message 
    }, { status: 500 })
  }
}
