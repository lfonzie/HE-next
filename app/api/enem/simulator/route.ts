import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai, selectModel, getModelConfig } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação (simplificado por enquanto)
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { area, totalQuestions = 20, duration = 120 } = await request.json()

    if (!area) {
      return NextResponse.json({ error: 'Area is required' }, { status: 400 })
    }

    // System prompt para gerar questões do ENEM
    const systemPrompt = `Você é um especialista em questões do ENEM (Exame Nacional do Ensino Médio). Sua missão é:

1. Gerar questões autênticas do ENEM baseadas na área especificada
2. Seguir o formato oficial do ENEM (5 alternativas A, B, C, D, E)
3. Alinhar com a BNCC (Base Nacional Comum Curricular)
4. Incluir competências e habilidades específicas
5. Fornecer explicações detalhadas e educativas
6. Variar níveis de dificuldade (Fácil, Médio, Difícil)

Formato de resposta em JSON:
{
  "questions": [
    {
      "id": "unique_id",
      "subject": "disciplina",
      "area": "área do conhecimento",
      "difficulty": "Fácil|Médio|Difícil",
      "year": 2023,
      "question": "Enunciado da questão",
      "options": ["A) alternativa 1", "B) alternativa 2", "C) alternativa 3", "D) alternativa 4", "E) alternativa 5"],
      "correctAnswer": 0,
      "explanation": "Explicação detalhada da resposta correta",
      "topics": ["tópico 1", "tópico 2"],
      "competencies": ["competência 1", "competência 2"]
    }
  ]
}`

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Gere ${totalQuestions} questões do ENEM para a área de ${area}. 
        As questões devem ser variadas em dificuldade e cobrir diferentes tópicos da área. 
        Responda APENAS com o JSON válido, sem texto adicional.` }
    ]

    // Selecionar modelo baseado na complexidade da tarefa de geração de simulado
    const selectedModel = selectModel(messages[1].content, 'enem')
    const modelConfig = getModelConfig(selectedModel)
    
    console.log(`Using model: ${selectedModel} for ENEM simulator generation`)
    
    const response = await openai.chat.completions.create({
      model: selectedModel,
      messages: messages as any,
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.max_tokens,
    })

    const content = response.choices[0]?.message?.content || ''
    
    try {
      // Tentar parsear como JSON
      const parsedData = JSON.parse(content)
      
      if (parsedData.questions && Array.isArray(parsedData.questions)) {
        const simulator = {
          id: `sim-${area}-${Date.now()}`,
          name: `Simulado – ${area}`,
          description: `Questões focadas na área de ${area} do ENEM`,
          duration: duration,
          areas: [area],
          totalQuestions: parsedData.questions.length,
          questions: parsedData.questions
        }

        return NextResponse.json({
          success: true,
          simulator: simulator,
          model: selectedModel,
          timestamp: new Date().toISOString()
        })
      } else {
        throw new Error('Invalid JSON structure')
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError)
      
      // Fallback: gerar questões mock
      const mockQuestions = generateMockQuestions(area, totalQuestions)
      
      const simulator = {
        id: `sim-mock-${area}-${Date.now()}`,
        name: `Simulado – ${area}`,
        description: `Questões focadas na área de ${area} do ENEM`,
        duration: duration,
        areas: [area],
        totalQuestions: mockQuestions.length,
        questions: mockQuestions
      }

      return NextResponse.json({
        success: true,
        simulator: simulator,
        model: 'mock-questions',
        timestamp: new Date().toISOString()
      })
    }

  } catch (error: any) {
    console.error('ENEM Simulator API error:', error)
    
    // Preparar erro amigável
    let friendlyError = 'Erro interno do servidor. Tente novamente.'
    
    if (error.message?.includes('rate limit')) {
      friendlyError = 'Limite de taxa excedido. Tente novamente em alguns minutos.'
    } else if (error.message?.includes('quota')) {
      friendlyError = 'Cota de tokens excedida. Verifique seu plano.'
    } else if (error.message?.includes('network')) {
      friendlyError = 'Erro de conexão. Verifique sua internet e tente novamente.'
    }

    return NextResponse.json({ error: friendlyError }, { status: 500 })
  }
}

function generateMockQuestions(area: string, totalQuestions: number) {
  const questions = []
  
  const areaQuestions = {
    'Linguagens': [
      {
        question: "Leia o texto: 'A tecnologia tem transformado profundamente a forma como nos comunicamos.' Qual é a função sintática da palavra 'profundamente'?",
        options: ["Adjunto adverbial", "Complemento nominal", "Predicativo do sujeito", "Adjunto adnominal", "Complemento verbal"],
        explanation: "A palavra 'profundamente' modifica o verbo 'transformado', indicando modo ou intensidade, caracterizando-se como adjunto adverbial."
      },
      {
        question: "No período 'Embora chovesse muito, saímos de casa', a conjunção 'embora' estabelece uma relação de:",
        options: ["Concessão", "Causa", "Consequência", "Finalidade", "Condição"],
        explanation: "A conjunção 'embora' introduz uma oração concessiva, indicando uma circunstância contrária ao fato expresso na oração principal."
      }
    ],
    'Matemática': [
      {
        question: "Se x + y = 10 e x - y = 4, qual é o valor de x?",
        options: ["7", "6", "5", "8", "9"],
        explanation: "Somando as duas equações: (x + y) + (x - y) = 10 + 4, temos 2x = 14, logo x = 7."
      },
      {
        question: "Qual é a área de um triângulo com base de 8 cm e altura de 6 cm?",
        options: ["24 cm²", "28 cm²", "32 cm²", "20 cm²", "26 cm²"],
        explanation: "A área do triângulo é calculada por A = (base × altura) / 2 = (8 × 6) / 2 = 24 cm²."
      }
    ],
    'Ciências da Natureza': [
      {
        question: "Qual é a fórmula química da água?",
        options: ["H₂O", "CO₂", "NaCl", "O₂", "H₂SO₄"],
        explanation: "A água é composta por dois átomos de hidrogênio (H) e um átomo de oxigênio (O), formando a molécula H₂O."
      },
      {
        question: "Qual é a velocidade da luz no vácuo?",
        options: ["3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10⁹ m/s", "3 × 10⁷ m/s", "3 × 10⁵ m/s"],
        explanation: "A velocidade da luz no vácuo é aproximadamente 3 × 10⁸ metros por segundo, uma constante fundamental da física."
      }
    ],
    'Ciências Humanas': [
      {
        question: "Em que ano foi proclamada a Independência do Brasil?",
        options: ["1822", "1821", "1823", "1824", "1825"],
        explanation: "A Independência do Brasil foi proclamada em 7 de setembro de 1822 por Dom Pedro I."
      },
      {
        question: "Qual é a capital do Brasil?",
        options: ["Brasília", "São Paulo", "Rio de Janeiro", "Salvador", "Belo Horizonte"],
        explanation: "Brasília é a capital federal do Brasil desde 1960, localizada no Distrito Federal."
      }
    ]
  }

  const questionsForArea = areaQuestions[area as keyof typeof areaQuestions] || areaQuestions['Matemática']
  
  for (let i = 0; i < totalQuestions; i++) {
    const questionData = questionsForArea[i % questionsForArea.length]
    questions.push({
      id: `mock-${area}-${i + 1}`,
      subject: area === 'Linguagens' ? 'Português' : area,
      area: area,
      difficulty: i < totalQuestions * 0.2 ? "Fácil" : i < totalQuestions * 0.7 ? "Médio" : "Difícil",
      year: 2023,
      question: questionData.question,
      options: questionData.options,
      correctAnswer: 0,
      explanation: questionData.explanation,
      topics: [`tópico-${i + 1}`, `conceito-${i + 1}`],
      competencies: [`Competência ${Math.floor(i / 3) + 1}`, `Habilidade ${(i % 3) + 1}`]
    })
  }
  
  return questions
}
