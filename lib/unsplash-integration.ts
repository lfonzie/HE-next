// lib/unsplash-integration.ts

interface UnsplashImage {
  id: string
  urls: {
    small: string
    regular: string
    full: string
  }
  alt_description: string
  user: {
    name: string
  }
}

interface UnsplashResponse {
  results: UnsplashImage[]
  total: number
}

export async function getUnsplashImages(query: string, count: number = 1): Promise<string[]> {
  try {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY
    
    if (!accessKey) {
      console.warn('Unsplash access key not found, using placeholder images')
      return generatePlaceholderImages(count)
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${accessKey}`,
          'Accept-Version': 'v1'
        }
      }
    )

    if (!response.ok) {
      console.warn('Unsplash API error:', response.status)
      return generatePlaceholderImages(count)
    }

    const data: UnsplashResponse = await response.json()
    
    if (data.results.length === 0) {
      console.warn('No images found for query:', query)
      return generatePlaceholderImages(count)
    }

    return data.results.map(img => img.urls.regular)
    
  } catch (error) {
    console.error('Error fetching Unsplash images:', error)
    return generatePlaceholderImages(count)
  }
}

function generatePlaceholderImages(count: number): string[] {
  const placeholderImages = [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1523240798033-32679a3ea26f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=600&fit=crop'
  ]
  
  return Array.from({ length: count }, (_, i) => placeholderImages[i % placeholderImages.length])
}

export async function populateLessonWithImages(lessonData: any): Promise<any> {
  try {
    console.log('🖼️ Populando imagens apenas no primeiro e último slide')
    
    // Import Wikimedia integration
    const { getBestEducationalImage } = await import('./wikimedia-integration')
    
    const slidesWithImages = await Promise.all(
      lessonData.slides.map(async (slide: any, index: number) => {
        // Apenas primeiro slide (index 0) e último slide (index slides.length - 1)
        const isFirstSlide = index === 0
        const isLastSlide = index === lessonData.slides.length - 1
        
        if (slide.imagePrompt && (isFirstSlide || isLastSlide)) {
          // Try Wikimedia Commons first, fallback to Unsplash
          const imageUrl = await getBestEducationalImage(slide.imagePrompt)
          console.log(`✅ Imagem educacional adicionada ao slide ${index + 1} (${isFirstSlide ? 'primeiro' : 'último'})`)
          return {
            ...slide,
            imageUrl: imageUrl || null
          }
        }
        
        // Para slides intermediários, remover imageUrl se existir
        const { imageUrl, ...slideWithoutImage } = slide
        return slideWithoutImage
      })
    )

    return {
      ...lessonData,
      slides: slidesWithImages
    }
  } catch (error) {
    console.error('Error populating lesson with images:', error)
    return lessonData
  }
}
