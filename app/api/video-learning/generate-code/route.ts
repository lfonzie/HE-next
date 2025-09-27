import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { SPEC_ADDENDUM, CODE_REGION_OPENER, CODE_REGION_CLOSER } from '@/lib/video-learning-prompts'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { spec } = await request.json()

    if (!spec || typeof spec !== 'string') {
      return NextResponse.json(
        { error: 'Especificação é obrigatória' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const fullPrompt = spec + SPEC_ADDENDUM

    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()

    if (!text) {
      return NextResponse.json(
        { error: 'Falha ao gerar código' },
        { status: 500 }
      )
    }

    // Extract code from markdown code blocks
    const codeMatch = text.match(
      new RegExp(`${CODE_REGION_OPENER}[\\s\\S]*?${CODE_REGION_CLOSER}`)
    )

    if (!codeMatch) {
      return NextResponse.json(
        { error: 'Código não encontrado na resposta' },
        { status: 500 }
      )
    }

    const code = codeMatch[0]
      .replace(CODE_REGION_OPENER, '')
      .replace(CODE_REGION_CLOSER, '')
      .trim()

    if (!code) {
      return NextResponse.json(
        { error: 'Código vazio gerado' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      code,
      spec
    })

  } catch (error) {
    console.error('Erro ao gerar código:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
