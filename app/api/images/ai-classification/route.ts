import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Prevent prerendering
export const dynamic = 'force-dynamic'

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || 
  process.env.GEMINI_API_KEY || 
  process.env.GOOGLE_API_KEY || 
  ''
)

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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    // Prompt melhorado para análise de imagens com IA
    const analysisPrompt = `
Analise esta imagem e determine sua relevância ao tema "${query}" (processo biológico de plantas que converte luz em energia). Forneça um score de 0-1 (1 = altamente relevante, como diagramas de clorofila ou plantas em luz solar) e uma justificativa breve. Ignore elementos genéricos como folhas isoladas sem contexto fotossintético.

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

CRITÉRIOS DE ANÁLISE ESPECÍFICOS:
1. RELEVÂNCIA: A imagem está diretamente relacionada ao tema "${query}"?
   - Para fotossíntese: plantas verdes, clorofila, luz solar, diagramas do processo
   - Para biologia: células, organismos, processos biológicos
   - Para química: moléculas, reações, laboratórios
   - Para física: experimentos, fenômenos físicos, equipamentos
2. VALOR EDUCACIONAL: A imagem ajuda no aprendizado do tema?
   - Diagramas explicativos são altamente valorizados
   - Imagens de laboratório para ciências
   - Ilustrações didáticas são preferíveis a fotos genéricas
3. ADEQUAÇÃO: A imagem é apropriada para ambiente educacional?
   - Evitar conteúdo inadequado ou irrelevante
   - Priorizar imagens científicas e educativas
4. QUALIDADE: A imagem é clara e informativa?
   - Resolução adequada para apresentação
   - Conteúdo visual claro e compreensível

IMAGENS PARA ANALISAR:
${images.map((img, index) => `
${index + 1}. URL: ${img.url}
   Título: ${img.title}
   Descrição: ${img.description || 'N/A'}
   Fonte: ${img.source}
`).join('\n')}

Responda APENAS com um array JSON válido, sem texto adicional ou formatação markdown.
`

    // Implementar retry com backoff exponencial
    let analysisResults: ImageAnalysisResult[]
    let retryCount = 0
    const maxRetries = 3
    
    while (retryCount < maxRetries) {
      try {
        console.log(`🤖 Tentativa ${retryCount + 1} de classificação com IA...`)
        
        const result = await model.generateContent(analysisPrompt)
        const response = await result.response
        const text = response.text()

        console.log('🤖 Resposta da IA:', text.slice(0, 200) + '...')

        // Tentar fazer parse do JSON
        try {
          // Limpar a resposta para extrair apenas o JSON
          const jsonMatch = text.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            analysisResults = JSON.parse(jsonMatch[0])
            console.log('✅ Classificação IA bem-sucedida')
            break // Sucesso, sair do loop
          } else {
            throw new Error('No JSON array found in response')
          }
        } catch (parseError) {
          console.error('❌ Erro ao fazer parse da resposta da IA:', parseError)
          console.error('Resposta completa:', text)
          throw new Error('JSON parsing failed')
        }
        
      } catch (error: any) {
        retryCount++
        console.warn(`⚠️ Tentativa ${retryCount} falhou:`, error.message)
        
        if (retryCount >= maxRetries) {
          console.warn('AI classification failed, using local fallback')
          // Fallback: análise simples baseada em palavras-chave
          analysisResults = images.map(img => ({
            url: img.url,
            title: img.title,
            source: img.source,
            relevanceScore: calculateSimpleRelevance(img.title, query),
            educationalValue: 50,
            appropriateness: 80,
            reasoning: 'Análise automática de fallback - IA indisponível',
            isRelevant: calculateSimpleRelevance(img.title, query) > 30,
            category: 'general'
          }))
          break
        }
        
        // Backoff exponencial: 1s, 2s, 4s
        const delay = Math.pow(2, retryCount - 1) * 1000
        console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
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

// Função de fallback otimizada para análise simples
function calculateSimpleRelevance(title: string, query: string): number {
  const titleLower = title.toLowerCase()
  const queryLower = query.toLowerCase()
  
  // Palavras-chave do tema
  const queryWords = queryLower.split(' ').filter(word => word.length > 2)
  
  let score = 0
  
  // Bonus para correspondência exata (prioridade máxima)
  if (titleLower.includes(queryLower)) {
    score += 60
  }
  
  // Bonus para palavras individuais
  queryWords.forEach(word => {
    if (titleLower.includes(word)) {
      score += 20
    }
  })
  
  // Bonus para termos educacionais específicos
  const educationalTerms = {
    'fotossíntese': ['plant', 'leaf', 'green', 'chlorophyll', 'sunlight', 'photosynthesis', 'biology'],
    'biologia': ['cell', 'organism', 'biology', 'science', 'laboratory', 'microscope'],
    'química': ['molecule', 'atom', 'reaction', 'chemistry', 'laboratory', 'chemical'],
    'física': ['physics', 'energy', 'force', 'experiment', 'laboratory', 'science'],
    'matemática': ['math', 'equation', 'formula', 'calculation', 'geometry', 'algebra'],
    'história': ['history', 'historical', 'ancient', 'civilization', 'culture'],
    'geografia': ['geography', 'landscape', 'environment', 'climate', 'earth']
  }
  
  // Verificar termos educacionais específicos
  for (const [theme, terms] of Object.entries(educationalTerms)) {
    if (queryLower.includes(theme) || queryLower.includes(theme.replace('ç', 'c'))) {
      terms.forEach(term => {
        if (titleLower.includes(term)) {
          score += 15
        }
      })
    }
  }
  
  // Penalização para conteúdo irrelevante
  const irrelevantTerms = ['book', 'text', 'logo', 'sticker', 'design', 'pattern', 'abstract']
  irrelevantTerms.forEach(term => {
    if (titleLower.includes(term) && !titleLower.includes(queryLower)) {
      score -= 20
    }
  })
  
  return Math.max(0, Math.min(100, score))
}
