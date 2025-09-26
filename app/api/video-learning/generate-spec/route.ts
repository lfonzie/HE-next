import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { SPEC_FROM_VIDEO_PROMPT } from '@/lib/video-learning-prompts'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json()

    if (!videoUrl || typeof videoUrl !== 'string') {
      return NextResponse.json(
        { error: 'URL do vídeo é obrigatória' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const result = await model.generateContent([
      SPEC_FROM_VIDEO_PROMPT,
      {
        fileData: {
          mimeType: 'video/mp4',
          fileUri: videoUrl,
        },
      },
    ])

    const response = await result.response
    const text = response.text()

    if (!text) {
      return NextResponse.json(
        { error: 'Falha ao gerar especificação' },
        { status: 500 }
      )
    }

    // Parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Resposta não contém JSON válido')
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      if (!parsed.spec) {
        throw new Error('Especificação não encontrada na resposta')
      }

      return NextResponse.json({
        spec: parsed.spec,
        videoUrl
      })

    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta:', parseError)
      return NextResponse.json(
        { error: 'Erro ao processar resposta da IA' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erro ao gerar especificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
