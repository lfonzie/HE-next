import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

interface Flashcard {
  term: string
  definition: string
}

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json()

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Tópico é obrigatório' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const prompt = `Gere uma lista de flashcards para o tópico "${topic}". Cada flashcard deve ter um termo e uma definição concisa. Formate a saída como uma lista de pares "Termo: Definição", com cada par em uma nova linha. Certifique-se de que os termos e definições sejam distintos e claramente separados por dois pontos. Aqui está um exemplo de saída:

História: Disciplina que estuda o passado humano
Matemática: Ciência que estuda números, formas e padrões
Geografia: Estudo da Terra e suas características

Gere entre 5 e 15 flashcards relevantes para o tópico "${topic}".`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    if (!text) {
      return NextResponse.json(
        { error: 'Falha ao gerar flashcards' },
        { status: 500 }
      )
    }

    // Parse the response to extract flashcards
    const flashcards: Flashcard[] = text
      .split('\n')
      .map((line) => {
        const parts = line.split(':')
        if (parts.length >= 2 && parts[0].trim()) {
          const term = parts[0].trim()
          const definition = parts.slice(1).join(':').trim()
          if (definition) {
            return { term, definition }
          }
        }
        return null
      })
      .filter((card): card is Flashcard => card !== null)

    if (flashcards.length === 0) {
      return NextResponse.json(
        { error: 'Não foi possível gerar flashcards válidos' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      flashcards,
      topic,
      count: flashcards.length
    })

  } catch (error) {
    console.error('Erro ao gerar flashcards:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
