import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Prevent prerendering
export const dynamic = 'force-dynamic'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

interface SmartSearchRequest {
  topic: string
  subject?: string
  count?: number
}

interface SmartSearchResult {
  optimizedQueries: string[]
  searchStrategy: string
  expectedResults: string[]
  reasoning: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SmartSearchRequest = await request.json()
    const { topic, subject = 'general', count = 3 } = body

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    console.log(`🧠 Gerando queries inteligentes com IA para: "${topic}"`)

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Prompt para geração de queries inteligentes
    const queryPrompt = `
Você é um especialista em busca de imagens educacionais. Gere queries otimizadas para encontrar as melhores imagens para uma aula sobre o tema especificado.

TEMA: "${topic}"
CONTEXTO: ${subject}
QUANTIDADE DE QUERIES: ${count}

Gere queries que sejam:
1. ESPECÍFICAS: Focadas no tema principal
2. EDUCACIONAIS: Apropriadas para ensino
3. DIVERSIFICADAS: Diferentes aspectos do tema
4. EM INGLÊS: Para melhor busca em bancos de imagens

Responda em JSON com a seguinte estrutura:
{
  "optimizedQueries": ["query1", "query2", "query3"],
  "searchStrategy": "Estratégia de busca explicada",
  "expectedResults": ["Tipo de imagem esperada 1", "Tipo de imagem esperada 2", "Tipo de imagem esperada 3"],
  "reasoning": "Explicação detalhada das escolhas"
}

EXEMPLOS:
- Para "Como funciona o cérebro?": ["human brain anatomy", "brain neural network", "brain cross section"]
- Para "Sistema solar": ["solar system planets", "sun and planets", "planetary orbits"]
- Para "Fotossíntese": ["photosynthesis process", "plant leaves sunlight", "chloroplast structure"]

Responda APENAS com JSON válido, sem texto adicional.
`

    const result = await model.generateContent(queryPrompt)
    const response = await result.response
    const text = response.text()

    console.log('🧠 Resposta da IA para queries:', text.slice(0, 200) + '...')

    // Tentar fazer parse do JSON
    let searchResult: SmartSearchResult
    try {
      // Limpar a resposta para extrair apenas o JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        searchResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON object found in response')
      }
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da resposta da IA:', parseError)
      console.error('Resposta completa:', text)
      
      // Fallback: queries simples baseadas no tema
      const fallbackQueries = generateFallbackQueries(topic)
      searchResult = {
        optimizedQueries: fallbackQueries,
        searchStrategy: 'Fallback: queries baseadas em palavras-chave',
        expectedResults: ['Imagens relacionadas ao tema'],
        reasoning: 'Análise automática de fallback devido a erro na IA'
      }
    }

    console.log(`✅ IA gerou ${searchResult.optimizedQueries.length} queries otimizadas`)

    return NextResponse.json({
      success: true,
      topic,
      subject,
      result: searchResult
    })

  } catch (error) {
    console.error('❌ Erro na geração de queries com IA:', error)
    return NextResponse.json(
      { error: 'Erro na geração de queries inteligentes' },
      { status: 500 }
    )
  }
}

// Função de fallback para gerar queries simples
function generateFallbackQueries(topic: string): string[] {
  const cleanTopic = topic
    .toLowerCase()
    .replace(/[?¿!¡.,;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Traduzir termos comuns para inglês
  const translations: Record<string, string> = {
    'cérebro': 'brain',
    'cerebro': 'brain',
    'sistema solar': 'solar system',
    'fotossíntese': 'photosynthesis',
    'fotossintese': 'photosynthesis',
    'matemática': 'mathematics',
    'matematica': 'mathematics',
    'física': 'physics',
    'fisica': 'physics',
    'química': 'chemistry',
    'quimica': 'chemistry',
    'biologia': 'biology',
    'história': 'history',
    'historia': 'history',
    'geografia': 'geography'
  }

  let englishTopic = cleanTopic
  Object.entries(translations).forEach(([pt, en]) => {
    englishTopic = englishTopic.replace(pt, en)
  })

  // Gerar queries variadas
  const queries = [
    englishTopic,
    `${englishTopic} anatomy`,
    `${englishTopic} structure`,
    `${englishTopic} process`,
    `${englishTopic} diagram`
  ]

  return queries.slice(0, 3)
}
