// lib/wikimedia-integration.ts

interface WikimediaImage {
  title: string
  url: string
  description: string
  author: string
  license: string
  width: number
  height: number
}

interface WikimediaResponse {
  query: {
    pages: {
      [key: string]: {
        title: string
        imageinfo: Array<{
          url: string
          descriptionurl: string
          descriptionshorturl: string
          extmetadata: {
            Artist?: { value: string }
            LicenseShortName?: { value: string }
            ImageDescription?: { value: string }
            DateTime?: { value: string }
            ImageWidth?: { value: string }
            ImageHeight?: { value: string }
          }
        }>
      }
    }
  }
}

export async function searchWikimediaImages(query: string, count: number = 1): Promise<WikimediaImage[]> {
  try {
    console.log(`🔍 Buscando imagens no Wikimedia Commons para: "${query}"`)
    
    // Search for images using Wikimedia Commons API
    const searchUrl = `https://commons.wikimedia.org/w/api.php?` +
      `action=query&` +
      `format=json&` +
      `list=search&` +
      `srsearch=${encodeURIComponent(query)}&` +
      `srnamespace=6&` + // File namespace
      `srlimit=${count}&` +
      `srprop=size&` +
      `origin=*`

    const searchResponse = await fetch(searchUrl)
    
    if (!searchResponse.ok) {
      console.warn('Wikimedia search API error:', searchResponse.status)
      return []
    }

    const searchData = await searchResponse.json()
    
    // Check for batchcomplete response (empty search result)
    if (searchData.batchcomplete === '' || !searchData.query?.search?.length) {
      console.warn('No images found in Wikimedia Commons for query:', query, 'Response:', searchData)
      return []
    }

    // Get detailed information for each image
    const imageTitles = searchData.query.search.map((item: any) => item.title).join('|')
    
    const detailUrl = `https://commons.wikimedia.org/w/api.php?` +
      `action=query&` +
      `format=json&` +
      `titles=${encodeURIComponent(imageTitles)}&` +
      `prop=imageinfo&` +
      `iiprop=url|descriptionurl|descriptionshorturl|extmetadata&` +
      `origin=*`

    const detailResponse = await fetch(detailUrl)
    
    if (!detailResponse.ok) {
      console.warn('Wikimedia detail API error:', detailResponse.status)
      return []
    }

    const detailData: WikimediaResponse = await detailResponse.json()
    
    const images: WikimediaImage[] = []
    
    for (const pageId in detailData.query.pages) {
      const page = detailData.query.pages[pageId]
      
      if (page.imageinfo && page.imageinfo.length > 0) {
        const imageInfo = page.imageinfo[0]
        const metadata = imageInfo.extmetadata || {}
        
        images.push({
          title: page.title,
          url: imageInfo.url,
          description: metadata.ImageDescription?.value || '',
          author: metadata.Artist?.value || 'Desconhecido',
          license: metadata.LicenseShortName?.value || 'CC',
          width: parseInt(metadata.ImageWidth?.value || '0'),
          height: parseInt(metadata.ImageHeight?.value || '0')
        })
      }
    }

    console.log(`✅ Encontradas ${images.length} imagens no Wikimedia Commons`)
    return images.slice(0, count)
    
  } catch (error) {
    console.error('Error fetching Wikimedia images:', error)
    return []
  }
}

export async function getBestEducationalImage(topic: string): Promise<string | null> {
  try {
    // Try Wikimedia Commons first (more educational content)
    const wikimediaImages = await searchWikimediaImages(topic, 1)
    
    if (wikimediaImages.length > 0) {
      console.log(`✅ Usando imagem do Wikimedia Commons para: ${topic}`)
      return wikimediaImages[0].url
    }
    
    // Fallback to Unsplash if Wikimedia has no results
    const { getUnsplashImages } = await import('./unsplash-integration')
    const unsplashImages = await getUnsplashImages(topic, 1)
    
    if (unsplashImages.length > 0) {
      console.log(`✅ Usando imagem do Unsplash para: ${topic}`)
      return unsplashImages[0]
    }
    
    console.warn(`⚠️ Nenhuma imagem encontrada para: ${topic}`)
    return null
    
  } catch (error) {
    console.error('Error getting best educational image:', error)
    return null
  }
}

export async function populateLessonWithEducationalImages(lessonData: any): Promise<any> {
  try {
    console.log('🖼️ Populando imagens educacionais obrigatórias nos slides 1, 6 e 14')
    
    const slidesWithImages = await Promise.all(
      lessonData.slides.map(async (slide: any, index: number) => {
        // Imagens obrigatórias nos slides 1, 6 e 14 (índices 0, 5 e 13)
        const isSlide1 = index === 0
        const isSlide6 = index === 5
        const isSlide14 = index === 13
        
        if (slide.imagePrompt && (isSlide1 || isSlide6 || isSlide14)) {
          const imageUrl = await getBestEducationalImage(slide.imagePrompt)
          console.log(`✅ Imagem educacional obrigatória adicionada ao slide ${index + 1}`)
          return {
            ...slide,
            imageUrl: imageUrl || null
          }
        }
        
        // Para outros slides, remover imageUrl se existir
        const { imageUrl, ...slideWithoutImage } = slide
        return slideWithoutImage
      })
    )

    return {
      ...lessonData,
      slides: slidesWithImages
    }
  } catch (error) {
    console.error('Error populating lesson with educational images:', error)
    return lessonData
  }
}
