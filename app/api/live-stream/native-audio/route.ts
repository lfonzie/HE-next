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

    console.log(`🎤 [NATIVE-AUDIO] Processing ${type} with Gemini 2.0 Flash Thinking`)

    // Initialize Gemini API with native audio support
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-thinking-exp",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    })

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log(`🔗 [NATIVE-AUDIO] Processing ${type} with native audio capabilities`)
          
          // Send initial processing message
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'text', 
            content: `Processando ${type} com Gemini 2.0 Flash Thinking...` 
          })}\n\n`))

          let prompt = ''
          let content = []

          // Prepare content with enhanced prompts for native audio
          switch (type) {
            case 'audio':
              prompt = `Você é um assistente de IA com capacidades nativas de áudio. Transcreva este áudio em português brasileiro e responda de forma natural, conversacional e amigável. Se for uma pergunta, responda diretamente. Se for uma conversa, mantenha o contexto e responda apropriadamente. Seja breve, claro e use uma linguagem natural como se estivesse falando com um amigo.`
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
              prompt = `Você é um assistente de IA com capacidades nativas de áudio. Analise este vídeo e descreva o que você vê em português brasileiro. Se houver áudio, transcreva-o também. Responda de forma breve, útil e natural, como se estivesse explicando para um amigo o que está acontecendo no vídeo.`
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
              prompt = `Você é um assistente de IA com capacidades nativas de áudio. Analise esta captura de tela e descreva o que você vê em português brasileiro. Se houver texto visível, transcreva-o. Se for uma interface, explique o que está acontecendo de forma clara e natural, como se estivesse guiando alguém.`
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
              prompt = `Você é um assistente de IA com capacidades nativas de áudio. Responda de forma natural, conversacional e amigável em português brasileiro à seguinte mensagem: "${data}". Seja útil, direto e use uma linguagem natural como se estivesse falando com um amigo.`
              content = [prompt]
              break

            default:
              throw new Error(`Unsupported type: ${type}`)
          }

          // Add context if provided
          if (context) {
            content.push(`Contexto da conversa: ${context}`)
          }

          // Generate content with streaming
          const result = await model.generateContentStream(content)

          // Stream the response
          for await (const chunk of result.stream) {
            const chunkText = chunk.text()
            if (chunkText) {
              console.log(`💬 [NATIVE-AUDIO] ${type} chunk: ${chunkText}`)
              
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

          console.log(`✅ [NATIVE-AUDIO] ${type} processing completed with native audio support`)

        } catch (error: any) {
          console.error(`❌ [NATIVE-AUDIO] ${type} stream error:`, error)
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
    console.error('❌ [NATIVE-AUDIO] Processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process native audio stream',
      details: error.message 
    }, { status: 500 })
  }
}
