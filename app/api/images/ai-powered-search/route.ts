import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering
export const dynamic = 'force-dynamic'

interface AIImageSearchRequest {
  topic: string
  subject?: string
  count?: number
}

interface ImageResult {
  url: string
  title: string
  description?: string
  source: string
  relevanceScore: number
  educationalValue: number
  appropriateness: number
  reasoning: string
  category: string
}

export async function POST(request: NextRequest) {
  try {
    const body: AIImageSearchRequest = await request.json()
    const { topic, subject = 'general', count = 3 } = body

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    console.log(`🚀 Iniciando busca inteligente com IA para: "${topic}"`)

    // ETAPA 1: Gerar queries otimizadas com IA
    console.log('📝 ETAPA 1: Gerando queries inteligentes...')
    const queryResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/images/ai-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, subject, count })
    })

    if (!queryResponse.ok) {
      throw new Error('Erro ao gerar queries com IA')
    }

    const queryData = await queryResponse.json()
    const optimizedQueries = queryData.result.optimizedQueries

    console.log(`✅ Queries geradas: ${optimizedQueries.join(', ')}`)

    // ETAPA 2: Buscar imagens usando as queries otimizadas
    console.log('🔍 ETAPA 2: Buscando imagens...')
    const allImages: any[] = []

    for (const query of optimizedQueries) {
      try {
        // Buscar em múltiplos provedores
        const searchPromises = [
          searchUnsplash(query),
          searchPixabay(query),
          searchWikimedia(query)
        ]

        const results = await Promise.allSettled(searchPromises)
        
        results.forEach((result, index) => {
          const providerNames = ['unsplash', 'pixabay', 'wikimedia']
          const providerName = providerNames[index]
          
          if (result.status === 'fulfilled' && result.value.length > 0) {
            allImages.push(...result.value.map((img: any) => ({
              ...img,
              source: providerName,
              searchQuery: query
            })))
            console.log(`✅ ${providerName}: ${result.value.length} imagens encontradas para "${query}"`)
          } else {
            console.log(`❌ ${providerName}: falha na busca para "${query}"`)
          }
        })
      } catch (error) {
        console.error(`❌ Erro ao buscar imagens para "${query}":`, error)
      }
    }

    console.log(`📊 Total de imagens encontradas: ${allImages.length}`)

    if (allImages.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Nenhuma imagem encontrada',
        totalImages: 0,
        relevantImages: 0,
        results: []
      })
    }

    // ETAPA 3: Classificar imagens com IA
    console.log('🤖 ETAPA 3: Classificando imagens com IA...')
    const classificationResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/images/ai-classification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: topic,
        images: allImages.slice(0, 20), // Limitar para não sobrecarregar a IA
        subject
      })
    })

    if (!classificationResponse.ok) {
      throw new Error('Erro na classificação com IA')
    }

    const classificationData = await classificationResponse.json()
    const relevantImages = classificationData.results as ImageResult[]

    console.log(`✅ IA classificou ${relevantImages.length} imagens como relevantes`)

    // ETAPA 4: Selecionar as melhores imagens
    console.log('🎯 ETAPA 4: Selecionando melhores imagens...')
    const selectedImages = selectBestImages(relevantImages, count)

    console.log(`🏆 Selecionadas ${selectedImages.length} imagens finais`)

    return NextResponse.json({
      success: true,
      topic,
      subject,
      totalImages: allImages.length,
      relevantImages: relevantImages.length,
      selectedImages: selectedImages.length,
      results: selectedImages,
      searchStrategy: queryData.result.searchStrategy,
      reasoning: queryData.result.reasoning,
      analysisMethod: 'ai-powered'
    })

  } catch (error) {
    console.error('❌ Erro na busca inteligente com IA:', error)
    return NextResponse.json(
      { error: 'Erro na busca inteligente com IA' },
      { status: 500 }
    )
  }
}

// Função para buscar no Unsplash
async function searchUnsplash(query: string): Promise<any[]> {
  try {
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`, {
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      }
    })

    if (!response.ok) return []

    const data = await response.json()
    return data.results.map((photo: any) => ({
      url: photo.urls.regular,
      title: photo.description || photo.alt_description || 'Unsplash image',
      description: photo.description,
      width: photo.width,
      height: photo.height,
      author: photo.user.name
    }))
  } catch (error) {
    console.error('Erro ao buscar no Unsplash:', error)
    return []
  }
}

// Função para buscar no Pixabay
async function searchPixabay(query: string): Promise<any[]> {
  try {
    const response = await fetch(`https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=3&safesearch=true`)

    if (!response.ok) return []

    const data = await response.json()
    return data.hits.map((hit: any) => ({
      url: hit.largeImageURL,
      title: hit.tags,
      description: hit.tags,
      width: hit.imageWidth,
      height: hit.imageHeight,
      author: hit.user
    }))
  } catch (error) {
    console.error('Erro ao buscar no Pixabay:', error)
    return []
  }
}

// Função para buscar no Wikimedia Commons
async function searchWikimedia(query: string): Promise<any[]> {
  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=3&srprop=size&origin=*`
    
    const response = await fetch(searchUrl)
    if (!response.ok) return []

    const data = await response.json()
    if (!data.query?.search) return []

    const imageTitles = data.query.search.map((item: any) => item.title)
    const imageInfoUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${imageTitles.join('|')}&prop=imageinfo&iiprop=url|size|mime&origin=*`
    
    const imageInfoResponse = await fetch(imageInfoUrl)
    if (!imageInfoResponse.ok) return []

    const imageInfoData = await imageInfoResponse.json()
    const pages = imageInfoData.query.pages
    const results: any[] = []

    for (const pageId in pages) {
      const page = pages[pageId]
      if (page.imageinfo && page.imageinfo.length > 0) {
        const imageInfo = page.imageinfo[0]
        
        if (imageInfo.url && imageInfo.mime?.startsWith('image/')) {
          results.push({
            url: imageInfo.url,
            title: page.title.replace('File:', ''),
            description: page.title.replace('File:', ''),
            width: imageInfo.width || 0,
            height: imageInfo.height || 0,
            author: 'Wikimedia Commons'
          })
        }
      }
    }

    return results
  } catch (error) {
    console.error('Erro ao buscar no Wikimedia:', error)
    return []
  }
}

// Função para selecionar as melhores imagens
function selectBestImages(images: ImageResult[], count: number): ImageResult[] {
  // Ordenar por score combinado
  const sortedImages = images.sort((a, b) => {
    const scoreA = a.relevanceScore + a.educationalValue + a.appropriateness
    const scoreB = b.relevanceScore + b.educationalValue + b.appropriateness
    return scoreB - scoreA
  })

  // Selecionar diversificando por fonte
  const selected: ImageResult[] = []
  const usedSources = new Set<string>()

  // Primeira passada: uma imagem por fonte
  for (const image of sortedImages) {
    if (selected.length >= count) break
    if (!usedSources.has(image.source)) {
      selected.push(image)
      usedSources.add(image.source)
    }
  }

  // Segunda passada: completar com as melhores restantes
  for (const image of sortedImages) {
    if (selected.length >= count) break
    if (!selected.some(selectedImg => selectedImg.url === image.url)) {
      selected.push(image)
    }
  }

  return selected
}
