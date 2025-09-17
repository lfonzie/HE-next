import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface Suggestion {
  text: string
  category: string
  level: string
}

export async function GET(request: NextRequest) {
  try {
    console.log('Iniciando geração de sugestões...')
    
    // Verificar se a chave da API está configurada
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      console.error('Nenhuma chave do Gemini encontrada')
      console.log('Variáveis de ambiente disponíveis:', Object.keys(process.env).filter(key => key.includes('GEMINI') || key.includes('GOOGLE')))
      
      // Retornar sugestões de fallback se não houver chave da API
      const fallbackSuggestions: Suggestion[] = [
        {
          text: "Como funciona a fotossíntese?",
          category: "Biologia",
          level: "8º ano"
        },
        {
          text: "Matemática dos algoritmos",
          category: "Matemática",
          level: "Ensino Médio"
        },
        {
          text: "Causas da Revolução Francesa",
          category: "História",
          level: "9º ano"
        }
      ]

      return NextResponse.json({
        success: true,
        suggestions: fallbackSuggestions,
        generatedAt: new Date().toISOString(),
        fallback: true,
        reason: 'API key não configurada'
      })
    }

    console.log('Chave da API encontrada, inicializando Gemini...')
    
    // Inicializar o Gemini
    const genAI = new GoogleGenerativeAI(apiKey)

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
Você é um assistente educacional especializado em criar sugestões de aulas interessantes e envolventes.

Gere exatamente 3 sugestões de tópicos educacionais que sejam:
- Diversos em matérias (matemática, ciências, história, geografia, literatura, etc.)
- Adequados para diferentes níveis (do 6º ano ao ensino médio)
- Interessantes e relevantes para estudantes brasileiros
- CURTOS E DIRETOS (máximo 8 palavras)
- Específicos o suficiente para gerar uma aula completa

Para cada sugestão, forneça:
1. Um tópico específico e interessante (BEM CURTO)
2. A matéria/disciplina
3. O nível educacional apropriado

Responda APENAS com um JSON válido no seguinte formato:
[
  {
    "text": "Tópico específico da aula",
    "category": "Matéria",
    "level": "Nível educacional"
  }
]

Exemplos de bons tópicos CURTOS:
- "Como funciona a fotossíntese?"
- "Causas da Revolução Francesa"
- "Matemática dos algoritmos"
- "Como funciona a vacinação?"
- "Física dos esportes"

IMPORTANTE: Mantenha os tópicos BEM CURTOS e diretos. Evite explicações longas ou perguntas extensas.
`

    console.log('Enviando prompt para o Gemini...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log('Resposta do Gemini recebida:', text)

    // Tentar extrair JSON da resposta
    let suggestions: Suggestion[]
    
    try {
      console.log('Tentando extrair JSON da resposta...')
      
      // Limpar a resposta para extrair apenas o JSON
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        console.log('JSON encontrado:', jsonMatch[0])
        suggestions = JSON.parse(jsonMatch[0])
        console.log('Sugestões parseadas:', suggestions)
      } else {
        console.error('JSON não encontrado na resposta')
        console.error('Texto completo:', text)
        throw new Error('JSON não encontrado na resposta')
      }
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError)
      console.error('Texto recebido:', text)
      
      // Fallback para sugestões padrão se o parsing falhar
      suggestions = [
        {
          text: "Como funciona a fotossíntese?",
          category: "Biologia",
          level: "8º ano"
        },
        {
          text: "Matemática dos algoritmos",
          category: "Matemática",
          level: "Ensino Médio"
        },
        {
          text: "Causas da Revolução Francesa",
          category: "História",
          level: "9º ano"
        }
      ]
      console.log('Usando sugestões de fallback devido ao erro de parsing')
    }

    // Validar se temos exatamente 3 sugestões
    if (!Array.isArray(suggestions) || suggestions.length !== 3) {
      console.error('Número inválido de sugestões:', suggestions.length)
      throw new Error('Resposta inválida do Gemini')
    }

    // Validar estrutura de cada sugestão
    for (const suggestion of suggestions) {
      if (!suggestion.text || !suggestion.category || !suggestion.level) {
        console.error('Estrutura de sugestão inválida:', suggestion)
        throw new Error('Estrutura de sugestão inválida')
      }
    }

    console.log('Sugestões geradas com sucesso:', suggestions)

    return NextResponse.json({
      success: true,
      suggestions,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro geral ao gerar sugestões:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A')
    
    // Fallback para sugestões estáticas em caso de erro
    const fallbackSuggestions: Suggestion[] = [
      {
        text: "Como funciona a fotossíntese?",
        category: "Biologia",
        level: "8º ano"
      },
      {
        text: "Matemática dos algoritmos",
        category: "Matemática",
        level: "Ensino Médio"
      },
      {
        text: "Causas da Revolução Francesa",
        category: "História",
        level: "9º ano"
      }
    ]

    console.log('Retornando sugestões de fallback devido ao erro')

    return NextResponse.json({
      success: true,
      suggestions: fallbackSuggestions,
      generatedAt: new Date().toISOString(),
      fallback: true,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}
