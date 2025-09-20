import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

import { openai, selectModel, getModelConfig } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { questions } = await request.json()

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Questions array is required' }, { status: 400 })
    }

    // Filtrar apenas questões erradas
    const wrongQuestions = questions.filter((q: any) => q.userAnswer !== q.correctAnswer)
    
    if (wrongQuestions.length === 0) {
      return NextResponse.json({ 
        explanations: [],
        totalWrong: 0,
        message: 'No wrong answers to explain'
      })
    }

    const model = selectModel('gpt-4o-mini')
    const config = getModelConfig(model)

    // Gerar explicações em lotes para otimizar performance
    const batchSize = 3
    const batches = []
    
    for (let i = 0; i < wrongQuestions.length; i += batchSize) {
      const batch = wrongQuestions.slice(i, i + batchSize)
      batches.push(batch)
    }

    const explanations = []

    for (const batch of batches) {
      try {
        const systemPrompt = `Você é um especialista em educação e questões do ENEM. Sua missão é fornecer explicações detalhadas e educativas para questões que o estudante errou.

Para cada questão errada, forneça:
1. Explicação clara e didática da resposta correta
2. Por que a resposta escolhida pelo estudante está incorreta
3. Conceitos fundamentais envolvidos na questão
4. Dicas práticas para resolver questões similares
5. Sugestões de estudo para melhorar na área

Seja didático, encorajador e focado no aprendizado. Use linguagem clara e acessível.`

        const userPrompt = `Analise as seguintes questões que o estudante errou e forneça explicações detalhadas:

${batch.map((q: any, index: number) => `
Questão ${index + 1}:
- Enunciado: ${q.question}
- Alternativas: ${q.options?.join(' | ') || 'Não disponível'}
- Resposta correta: ${q.correctAnswer}
- Resposta do estudante: ${q.userAnswer}
- Área: ${q.area || 'Geral'}
- Dificuldade: ${q.difficulty || 'Médio'}
`).join('\n')}

Retorne APENAS um JSON válido com array de explicações no formato:
[
  {
    "questionId": "id_da_questao",
    "explanation": "Explicação detalhada da resposta correta...",
    "concepts": ["conceito1", "conceito2", "conceito3"],
    "tips": ["dica1", "dica2", "dica3"],
    "studySuggestions": ["sugestão1", "sugestão2"]
  }
]`

        const completion = await openai.chat.completions.create({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        })

        const response = completion.choices[0]?.message?.content
        if (!response) continue

        // Limpar resposta para extrair JSON
        let cleanResponse = response.trim()
        
        // Remover markdown se presente
        if (cleanResponse.includes('```json')) {
          cleanResponse = cleanResponse.split('```json')[1].split('```')[0]
        } else if (cleanResponse.includes('```')) {
          cleanResponse = cleanResponse.split('```')[1].split('```')[0]
        }

        try {
          const batchExplanations = JSON.parse(cleanResponse)
          if (Array.isArray(batchExplanations)) {
            explanations.push(...batchExplanations)
          }
        } catch (parseError) {
          console.error('Error parsing batch explanations:', parseError)
          // Criar explicações básicas como fallback
          batch.forEach((q: any) => {
            explanations.push({
              questionId: q.id,
              explanation: `A resposta correta é a alternativa ${String.fromCharCode(65 + q.correctAnswer)}. Esta questão envolve conceitos de ${q.area || 'conhecimento geral'} e requer atenção aos detalhes do enunciado.`,
              concepts: [q.area || 'Conhecimento geral'],
              tips: ['Leia o enunciado com atenção', 'Elimine alternativas claramente incorretas', 'Considere o contexto da questão'],
              studySuggestions: [`Revise conceitos de ${q.area || 'conhecimento geral'}`, 'Pratique questões similares', 'Consulte material de estudo específico']
            })
          })
        }

        // Pequena pausa entre lotes para evitar rate limiting
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

      } catch (error) {
        console.error('Error generating explanations for batch:', error)
        // Criar explicações básicas como fallback
        batch.forEach((q: any) => {
          explanations.push({
            questionId: q.id,
            explanation: `A resposta correta é a alternativa ${String.fromCharCode(65 + q.correctAnswer)}. Esta questão envolve conceitos de ${q.area || 'conhecimento geral'} e requer atenção aos detalhes do enunciado.`,
            concepts: [q.area || 'Conhecimento geral'],
            tips: ['Leia o enunciado com atenção', 'Elimine alternativas claramente incorretas', 'Considere o contexto da questão'],
            studySuggestions: [`Revise conceitos de ${q.area || 'conhecimento geral'}`, 'Pratique questões similares', 'Consulte material de estudo específico']
          })
        })
      }
    }

    return NextResponse.json({
      explanations,
      totalWrong: wrongQuestions.length,
      success: true,
      source: 'ai_generated'
    })

  } catch (error) {
    console.error('Error in explanations API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 })
  }
}