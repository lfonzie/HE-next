import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { openai, selectModel, getModelConfig } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { questions, answers } = await request.json()

    if (!questions || !answers) {
      return NextResponse.json({ error: 'Questions and answers are required' }, { status: 400 })
    }

    // Filtrar apenas questões erradas
    const wrongAnswers = questions.filter((question: any, index: number) => {
      const userAnswer = answers[index]
      const correctAnswer = question.correctAnswer
      return userAnswer !== correctAnswer
    })

    if (wrongAnswers.length === 0) {
      return NextResponse.json({ 
        explanations: [],
        message: 'Parabéns! Você acertou todas as questões!'
      })
    }

    // Gerar explicações para questões erradas
    const explanations = await generateExplanations(wrongAnswers)

    return NextResponse.json({ 
      explanations,
      totalWrong: wrongAnswers.length,
      totalQuestions: questions.length
    })

  } catch (error) {
    console.error('ENEM explanations API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateExplanations(wrongQuestions: any[]) {
  const explanations = []

  for (const question of wrongQuestions) {
    try {
      const prompt = `Você é um professor especialista em questões do ENEM. Analise a questão abaixo e forneça uma explicação educativa detalhada.

QUESTÃO:
${question.question}

ALTERNATIVAS:
A) ${question.options[0]}
B) ${question.options[1]}
C) ${question.options[2]}
D) ${question.options[3]}
E) ${question.options[4]}

RESPOSTA CORRETA: ${question.options[question.correctAnswer]}

ÁREA: ${question.area || question.subject}

Forneça uma explicação que:
1. Explique por que a resposta correta está certa
2. Explique por que as outras alternativas estão erradas
3. Inclua conceitos teóricos relevantes
4. Seja educativa e clara
5. Use linguagem adequada para estudantes do ensino médio

Formato da resposta em JSON:
{
  "explanation": "Explicação detalhada da resposta correta",
  "concepts": ["conceito 1", "conceito 2"],
  "tips": ["dica 1", "dica 2"],
  "difficulty": "Fácil|Médio|Difícil"
}`

      const selectedModel = selectModel(prompt, 'enem')
      const modelConfig = getModelConfig(selectedModel)
      
      const completion = await openai.chat.completions.create({
        model: selectedModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      })

      const response = completion.choices[0]?.message?.content
      if (!response) continue

      // Limpar resposta e extrair JSON
      let cleanResponse = response.trim()
      if (cleanResponse.includes('```json')) {
        cleanResponse = cleanResponse.split('```json')[1].split('```')[0]
      } else if (cleanResponse.includes('```')) {
        cleanResponse = cleanResponse.split('```')[1].split('```')[0]
      }

      const explanationData = JSON.parse(cleanResponse)
      
      explanations.push({
        questionId: question.id,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        userAnswer: question.userAnswer,
        explanation: explanationData.explanation,
        concepts: explanationData.concepts || [],
        tips: explanationData.tips || [],
        difficulty: explanationData.difficulty || 'Médio',
        area: question.area || question.subject
      })

    } catch (error) {
      console.error('Error generating explanation for question:', question.id, error)
      
      // Fallback explanation
      explanations.push({
        questionId: question.id,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        userAnswer: question.userAnswer,
        explanation: `A resposta correta é ${question.options[question.correctAnswer]}. Esta questão aborda conceitos de ${question.area || question.subject}.`,
        concepts: [question.area || question.subject],
        tips: ['Revise os conceitos fundamentais desta área'],
        difficulty: 'Médio',
        area: question.area || question.subject
      })
    }
  }

  return explanations
}
