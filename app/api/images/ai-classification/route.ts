import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Prevent prerendering
export const dynamic = 'force-dynamic'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

interface ImageAnalysisRequest {
  query: string
  images: Array<{
    url: string
    title: string
    description?: string
    source: string
  }>
  subject?: string
}

interface ImageAnalysisResult {
  url: string
  title: string
  source: string
  relevanceScore: number
  educationalValue: number
  appropriateness: number
  reasoning: string
  isRelevant: boolean
  category: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ImageAnalysisRequest = await request.json()
    const { query, images, subject = 'general' } = body

    if (!query || !images || images.length === 0) {
      return NextResponse.json(
        { error: 'Query and images are required' },
        { status: 400 }
      )
    }

    console.log(`🤖 Analisando ${images.length} imagens com IA para: "${query}"`)

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Prompt para análise de imagens com IA
    const analysisPrompt = `
Você é um especialista em educação e análise de imagens. Analise cada imagem e determine sua relevância para o tema educacional especificado.

TEMA EDUCACIONAL: "${query}"
CONTEXTO: ${subject}

Para cada imagem, forneça uma análise detalhada em JSON com os seguintes campos:

{
  "url": "URL da imagem",
  "title": "Título da imagem",
  "source": "Fonte da imagem",
  "relevanceScore": 0-100, // Quão relevante é para o tema (0=nada relevante, 100=perfeitamente relevante)
  "educationalValue": 0-100, // Valor educacional (0=inútil, 100=excelente para ensino)
  "appropriateness": 0-100, // Adequação para educação (0=inadequada, 100=perfeita)
  "reasoning": "Explicação detalhada da análise",
  "isRelevant": true/false, // Se deve ser incluída na aula
  "category": "categoria do conteúdo (ex: anatomy, astronomy, biology, etc.)"
}

CRITÉRIOS DE ANÁLISE:
1. RELEVÂNCIA: A imagem está diretamente relacionada ao tema "${query}"?
2. VALOR EDUCACIONAL: A imagem ajuda no aprendizado do tema?
3. ADEQUAÇÃO: A imagem é apropriada para ambiente educacional?
4. QUALIDADE: A imagem é clara e informativa?

IMAGENS PARA ANALISAR:
${images.map((img, index) => `
${index + 1}. URL: ${img.url}
   Título: ${img.title}
   Descrição: ${img.description || 'N/A'}
   Fonte: ${img.source}
`).join('\n')}

Responda APENAS com um array JSON válido, sem texto adicional ou formatação markdown.
`

    const result = await model.generateContent(analysisPrompt)
    const response = await result.response
    const text = response.text()

    console.log('🤖 Resposta da IA:', text.slice(0, 200) + '...')

    // Tentar fazer parse do JSON
    let analysisResults: ImageAnalysisResult[]
    try {
      // Limpar a resposta para extrair apenas o JSON
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        analysisResults = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON array found in response')
      }
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da resposta da IA:', parseError)
      console.error('Resposta completa:', text)
      
      // Fallback: análise simples baseada em palavras-chave
      analysisResults = images.map(img => ({
        url: img.url,
        title: img.title,
        source: img.source,
        relevanceScore: calculateSimpleRelevance(img.title, query),
        educationalValue: 50,
        appropriateness: 80,
        reasoning: 'Análise automática de fallback',
        isRelevant: calculateSimpleRelevance(img.title, query) > 30,
        category: 'general'
      }))
    }

    // Filtrar apenas imagens relevantes e ordenar por score
    const relevantImages = analysisResults
      .filter(img => img.isRelevant)
      .sort((a, b) => (b.relevanceScore + b.educationalValue + b.appropriateness) - 
                     (a.relevanceScore + a.educationalValue + a.appropriateness))

    console.log(`✅ IA classificou ${relevantImages.length} imagens como relevantes de ${images.length} total`)

    return NextResponse.json({
      success: true,
      totalImages: images.length,
      relevantImages: relevantImages.length,
      results: relevantImages,
      analysisMethod: 'ai-powered'
    })

  } catch (error) {
    console.error('❌ Erro na análise de IA:', error)
    return NextResponse.json(
      { error: 'Erro na análise de imagens com IA' },
      { status: 500 }
    )
  }
}

// Função de fallback para análise simples
function calculateSimpleRelevance(title: string, query: string): number {
  const titleLower = title.toLowerCase()
  const queryLower = query.toLowerCase()
  
  // Palavras-chave do tema
  const queryWords = queryLower.split(' ').filter(word => word.length > 2)
  
  let score = 0
  queryWords.forEach(word => {
    if (titleLower.includes(word)) {
      score += 30
    }
  })
  
  // Bonus para correspondência exata
  if (titleLower.includes(queryLower)) {
    score += 50
  }
  
  return Math.min(100, score)
}
