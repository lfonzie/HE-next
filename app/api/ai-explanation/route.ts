import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { question, userAnswer, correctAnswer } = await request.json()

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    // Gerar explicação via IA
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um professor experiente e paciente. Sua tarefa é explicar conceitos educacionais de forma clara e didática.

Instruções:
- Use linguagem simples e acessível
- Explique passo a passo quando necessário
- Use exemplos práticos quando possível
- Mantenha um tom encorajador e positivo
- Formate a resposta em Markdown com quebras de linha adequadas
- Se a resposta estiver incorreta, explique o erro de forma construtiva
- Se a resposta estiver correta, elogie e aprofunde o conhecimento`
        },
        {
          role: "user",
          content: `Pergunta: ${question}

${userAnswer ? `Resposta do aluno: ${userAnswer}` : ''}
${correctAnswer ? `Resposta correta: ${correctAnswer}` : ''}

Por favor, forneça uma explicação educativa e detalhada sobre esta pergunta.`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const explanation = completion.choices[0]?.message?.content || 'Não foi possível gerar uma explicação no momento.'

    return NextResponse.json({
      success: true,
      explanation: explanation
    })

  } catch (error) {
    console.error('Erro ao gerar explicação IA:', error)
    
    // Fallback para explicação padrão
    const fallbackExplanation = `Esta é uma pergunta interessante! 

**Conceito Principal:** A pergunta aborda um tópico importante que merece atenção.

**Explicação:** Embora não seja possível gerar uma explicação personalizada no momento, recomendo revisar o material relacionado ao tópico.

**Dica:** Tente pensar sobre os conceitos fundamentais envolvidos na pergunta e como eles se relacionam com o que você já aprendeu.`

    return NextResponse.json({
      success: true,
      explanation: fallbackExplanation
    })
  }
}
