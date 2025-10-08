// Step 3: Prompting for Lesson Creation with 14 Slides
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const maxDuration = 300

const LESSON_STRUCTURE_PROMPT = `Você é um professor especializado em criar aulas interativas estruturadas com EXATAMENTE 14 slides.

🎯 ESTRUTURA OBRIGATÓRIA DA AULA (EXATAMENTE 14 SLIDES):
1. SLIDE 1 - EXPLICAÇÃO: Introdução e apresentação do tema [IMAGEM OBRIGATÓRIA]
2. SLIDE 2 - EXPLICAÇÃO: Conceitos básicos e fundamentos
3. SLIDE 3 - EXPLICAÇÃO: Desenvolvimento e detalhamento [IMAGEM OBRIGATÓRIA]
4. SLIDE 4 - EXPLICAÇÃO: Aplicações práticas
5. SLIDE 5 - QUIZ: Primeiro quiz com 3 perguntas obrigatórias
6. SLIDE 6 - EXPLICAÇÃO: Variações e casos especiais [IMAGEM OBRIGATÓRIA]
7. SLIDE 7 - EXPLICAÇÃO: Conexões e contexto amplo
8. SLIDE 8 - EXPLICAÇÃO: Aprofundamento conceitual
9. SLIDE 9 - EXPLICAÇÃO: Exemplos práticos [IMAGEM OBRIGATÓRIA]
10. SLIDE 10 - QUIZ: Segundo quiz com 3 perguntas obrigatórias
11. SLIDE 11 - EXPLICAÇÃO: Síntese e consolidação [IMAGEM OBRIGATÓRIA]
12. SLIDE 12 - EXPLICAÇÃO: Análise crítica
13. SLIDE 13 - EXPLICAÇÃO: Aplicações futuras
14. SLIDE 14 - ENCERRAMENTO: Resumo final e próximos passos [IMAGEM OBRIGATÓRIA]

IMPORTANTE SOBRE OS QUIZES:
- EXATAMENTE 3 perguntas por quiz (slides 5 e 10)
- Use múltipla escolha com 4 alternativas (A, B, C, D)
- EMBARALHE AS OPÇÕES: A resposta correta deve aparecer em posições diferentes
- Teste compreensão profunda, não apenas memorização

IMPORTANTE SOBRE CONTEÚDO:
- Cada slide de EXPLICAÇÃO deve ter aproximadamente 800 palavras (conteúdo otimizado)
- Use linguagem clara e didática
- Inclua exemplos práticos sempre que possível
- Adapte o conteúdo ao nível educacional apropriado
- SEMPRE inclua quebras de linha (\n) para melhor formatação
- Divida o conteúdo em parágrafos claros com \n\n entre eles

FORMATO DE RESPOSTA (JSON):
{
  "title": "Título envolvente da aula",
  "subject": "Matéria inferida (ex: Matemática, Ciências, História)",
  "grade": 5,
  "objectives": [
    "Objetivo de aprendizado 1",
    "Objetivo de aprendizado 2",
    "Objetivo de aprendizado 3"
  ],
  "introduction": "Breve introdução para envolver os estudantes",
  "slides": [
    {
      "slideNumber": 1,
      "type": "explanation",
      "title": "Título do Slide 1",
      "content": "Conteúdo explicativo detalhado com ~800 palavras\n\nDividido em parágrafos com quebras de linha\n\nIncluindo exemplos práticos e explicações detalhadas",
      "requiresImage": true,
      "timeEstimate": 5
    },
    {
      "slideNumber": 5,
      "type": "quiz",
      "title": "Quiz 1: Verificação de Compreensão",
      "content": "Teste seu entendimento dos conceitos",
      "questions": [
        {
          "question": "Pergunta que exige análise",
          "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
          "correctAnswer": 0,
          "explanation": "Explicação detalhada"
        },
        {
          "question": "Segunda pergunta",
          "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
          "correctAnswer": 2,
          "explanation": "Explicação detalhada"
        },
        {
          "question": "Terceira pergunta",
          "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
          "correctAnswer": 1,
          "explanation": "Explicação detalhada"
        }
      ],
      "requiresImage": false,
      "timeEstimate": 4
    }
  ],
  "summary": "Resumo dos pontos principais aprendidos",
  "nextSteps": [
    "Próximo passo de estudo 1",
    "Próximo passo de estudo 2",
    "Próximo passo de estudo 3"
  ]
}

Responda APENAS com JSON válido. Não inclua formatação markdown ou texto adicional.`

export async function POST(req: NextRequest) {
  try {
    const { theme } = await req.json()

    if (!theme || typeof theme !== 'string') {
      return NextResponse.json(
        { error: 'Theme is required' },
        { status: 400 }
      )
    }

    const XAI_API_KEY = process.env.XAI_API_KEY

    if (!XAI_API_KEY) {
      console.error('❌ XAI_API_KEY not configured')
      return NextResponse.json(
        { error: 'XAI API key not configured' },
        { status: 500 }
      )
    }

    console.log('📚 Step 3: Creating lesson with 14 slides for:', theme)

    // Call Grok to generate the lesson
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-2-1212',
        messages: [
          {
            role: 'system',
            content: LESSON_STRUCTURE_PROMPT
          },
          {
            role: 'user',
            content: `Crie uma aula completa sobre: ${theme}`
          }
        ],
        temperature: 0.7,
        max_tokens: 16000,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Grok API error:', response.status, errorText)
      throw new Error(`Grok API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content received from Grok')
    }

    const lesson = JSON.parse(content)

    // Validate lesson structure
    if (!lesson.slides || lesson.slides.length !== 14) {
      console.warn('⚠️ Lesson does not have exactly 14 slides, received:', lesson.slides?.length)
    }

    console.log('✅ Lesson created successfully with', lesson.slides?.length, 'slides')

    return NextResponse.json({
      success: true,
      lesson,
      theme,
      provider: 'grok-2-1212',
      slidesCount: lesson.slides?.length || 0
    })

  } catch (error) {
    console.error('❌ Error creating lesson:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create lesson',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

