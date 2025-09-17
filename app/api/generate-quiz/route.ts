import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { ensureQuizFormat, ValidatedQuizQuestion } from '@/lib/quiz-validation'

interface QuizGenerationRequest {
  topic: string
  difficulty?: 'easy' | 'medium' | 'hard'
  count?: number
}

interface QuizQuestion {
  question: string
  options: {
    a: string
    b: string
    c: string
    d: string
  }
  correct: 'a' | 'b' | 'c' | 'd'
  explanation: string
}

export async function POST(request: NextRequest) {
  try {
    const { topic, difficulty = 'medium', count = 5 }: QuizGenerationRequest = await request.json()

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ 
        error: 'Tópico é obrigatório' 
      }, { status: 400 })
    }

    console.log(`🎯 Gerando quiz sobre "${topic}" (${difficulty}, ${count} questões)`)

    const systemPrompt = `Você é um especialista em educação que cria quizzes educacionais de alta qualidade.

FORMATO OBRIGATÓRIO:
- Cada questão deve ter exatamente 4 alternativas (a, b, c, d)
- Apenas UMA alternativa deve estar correta
- Use o formato JSON exato especificado
- Linguagem clara e em português brasileiro
- Explicações detalhadas e educativas

DIFICULDADE:
- Easy: Conceitos básicos, perguntas diretas
- Medium: Aplicação de conceitos, análise moderada  
- Hard: Análise crítica, síntese, aplicação complexa

TÓPICO: ${topic}
DIFICULDADE: ${difficulty}
QUANTIDADE: ${count} questões`

    const userPrompt = `Crie um quiz educacional sobre "${topic}" com ${count} questões de dificuldade ${difficulty}.

Retorne APENAS um JSON válido com este formato exato:
{
  "questions": [
    {
      "question": "Pergunta clara e específica sobre o tópico",
      "options": {
        "a": "Primeira alternativa",
        "b": "Segunda alternativa", 
        "c": "Terceira alternativa",
        "d": "Quarta alternativa"
      },
      "correct": "a",
      "explanation": "Explicação detalhada de por que a resposta está correta e por que as outras estão erradas"
    }
  ]
}

IMPORTANTE:
- Use apenas "a", "b", "c", "d" para a resposta correta
- Cada questão deve ser única e desafiadora
- As alternativas devem ser plausíveis e bem elaboradas
- A explicação deve ser educativa e detalhada
- Sem formatação markdown, apenas JSON puro`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Nenhum conteúdo gerado pela API')
    }

    // Parse JSON response
    let quizData
    try {
      // Remove any markdown formatting
      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim()
      quizData = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError)
      console.error('Conteúdo recebido:', content)
      throw new Error('Resposta da API não é um JSON válido')
    }

    // Validate quiz structure
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Estrutura de quiz inválida: questions não encontrado')
    }

    // Validar e corrigir questões usando a nova validação
    const validatedQuestions = ensureQuizFormat(quizData.questions)
    
    // Verificar se temos questões válidas
    if (validatedQuestions.length === 0) {
      throw new Error('Nenhuma questão válida foi gerada')
    }
    
    // Log de questões corrigidas
    const invalidQuestions = validatedQuestions.filter(q => !q.isValid)
    if (invalidQuestions.length > 0) {
      console.warn(`⚠️ ${invalidQuestions.length} questões foram corrigidas automaticamente`)
    }

    console.log(`✅ Quiz gerado com sucesso: ${validatedQuestions.length} questões`)

    return NextResponse.json({
      success: true,
      topic,
      difficulty,
      questions: validatedQuestions,
      totalQuestions: validatedQuestions.length,
      validationInfo: {
        totalGenerated: quizData.questions.length,
        totalValidated: validatedQuestions.length,
        correctedQuestions: invalidQuestions.length
      }
    })

  } catch (error) {
    console.error('❌ Erro ao gerar quiz:', error)
    
    return NextResponse.json({ 
      error: 'Erro ao gerar quiz',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
