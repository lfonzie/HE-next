import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { openai, selectModel, getModelConfig } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { area, numQuestions } = await request.json()

    // Get questions from database
    const questions = await prisma.enemQuestion.findMany({
      where: { area },
      take: numQuestions,
      orderBy: { created_at: 'desc' }
    })

    // If not enough questions in DB, generate with AI
    if (questions.length < numQuestions) {
      const remaining = numQuestions - questions.length
      const generatedQuestions = await generateQuestions(area, remaining)
      
      // Save generated questions to database
      for (const question of generatedQuestions) {
        await prisma.enemQuestion.create({
          data: question
        })
      }
      
      questions.push(...generatedQuestions)
    }

    return NextResponse.json({ questions })

  } catch (error) {
    console.error('ENEM API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateQuestions(area: string, count: number) {
  try {
    const prompt = `Gere ${count} questões do ENEM para a área de ${area}. 
    Cada questão deve ter:
    - Um enunciado claro e objetivo
    - 5 alternativas (A, B, C, D, E)
    - Uma alternativa correta
    - Formato JSON com campos: stem, a, b, c, d, e, correct, disciplina
    
    Retorne apenas o JSON válido com um array de questões.`

    // Selecionar modelo baseado na complexidade da tarefa de geração de questões
    const selectedModel = selectModel(prompt, 'enem')
    const modelConfig = getModelConfig(selectedModel)
    
    console.log(`Using model: ${selectedModel} for ENEM questions generation`)
    
    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.max_tokens,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) return []

    const questions = JSON.parse(response)
    return questions.map((q: any) => ({
      area,
      disciplina: q.disciplina || area,
      stem: q.stem,
      a: q.a,
      b: q.b,
      c: q.c,
      d: q.d,
      e: q.e,
      correct: q.correct,
      source: 'AI Generated'
    }))
  } catch (error) {
    console.error('Error generating questions:', error)
    return []
  }
}
