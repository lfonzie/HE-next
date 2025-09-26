import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    console.log(`🎤 [DICTATION] Processing audio file: ${audioFile.name} (${audioFile.size} bytes)`)

    // Converter arquivo para base64
    const audioBuffer = await audioFile.arrayBuffer()
    const audioBase64 = Buffer.from(audioBuffer).toString('base64')
    const mimeType = audioFile.type || 'audio/webm'

    // Use Gemini 2.0 Flash para transcrição
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.3, // Baixa temperatura para transcrição mais precisa
      }
    })

    const prompt = `Transcreva este áudio para texto em português brasileiro. 
    
INSTRUÇÕES:
1. Transcreva APENAS o que foi falado, sem adicionar pontuação desnecessária
2. Mantenha a naturalidade da fala
3. Corrija erros de pronúncia quando óbvio
4. Use pontuação básica (vírgulas, pontos) quando apropriado
5. Se houver pausas longas, indique com reticências (...)
6. Se não conseguir entender algo, use [inaudível]
7. Responda APENAS com o texto transcrito, sem explicações adicionais

TRANSCRIÇÃO:`

    try {
      const result = await model.generateContent([
        {
          text: prompt
        },
        {
          inlineData: {
            mimeType,
            data: audioBase64
          }
        }
      ])

      const response = await result.response
      const transcribedText = response.text().trim()

      console.log(`✅ [DICTATION] Transcription completed: ${transcribedText.substring(0, 100)}...`)

      return NextResponse.json({
        success: true,
        text: transcribedText,
        timestamp: new Date().toISOString(),
        duration: audioFile.size / 1000 // Estimativa de duração
      })

    } catch (error: any) {
      console.error('❌ [DICTATION] Error generating transcription:', error)
      return NextResponse.json({
        error: 'Failed to transcribe audio',
        details: error.message
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ [DICTATION] Processing error:', error)
    return NextResponse.json({
      error: 'Failed to process audio',
      details: error.message
    }, { status: 500 })
  }
}
