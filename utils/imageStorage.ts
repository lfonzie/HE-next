// Utilitário para gerenciar armazenamento de imagens grandes
// Converte imagens base64 para URLs temporárias para evitar problemas de quota

interface ImageStorage {
  [key: string]: string // slideNumber -> imageUrl
}

// Cache de imagens em memória
const imageCache = new Map<string, string>()

// Armazenamento de metadados das imagens
const imageMetadata = new Map<string, ImageStorage>()

export function storeImages(lessonId: string, slides: any[]): ImageStorage {
  const imageStorage: ImageStorage = {}
  
  slides.forEach((slide, index) => {
    if (slide.imageUrl?.startsWith('data:')) {
      // Criar URL temporária para a imagem
      const imageKey = `${lessonId}_slide_${slide.slideNumber}`
      imageCache.set(imageKey, slide.imageUrl)
      imageStorage[slide.slideNumber] = imageKey
      
      console.log(`🖼️ Imagem armazenada: slide ${slide.slideNumber}, tamanho: ${slide.imageUrl.length}`)
    }
  })
  
  // Salvar metadados das imagens
  imageMetadata.set(lessonId, imageStorage)
  
  return imageStorage
}

export function restoreImages(lessonId: string, slides: any[]): any[] {
  const imageStorage = imageMetadata.get(lessonId)
  if (!imageStorage) {
    console.log('⚠️ Nenhum metadado de imagem encontrado para:', lessonId)
    return slides
  }
  
  const restoredSlides = slides.map(slide => {
    const imageKey = imageStorage[slide.slideNumber]
    if (imageKey) {
      const imageData = imageCache.get(imageKey)
      if (imageData) {
        console.log(`✅ Imagem restaurada: slide ${slide.slideNumber}`)
        return { ...slide, imageUrl: imageData }
      }
    }
    return slide
  })
  
  return restoredSlides
}

export function clearImageCache(lessonId?: string) {
  if (lessonId) {
    // Limpar apenas imagens de uma lição específica
    const imageStorage = imageMetadata.get(lessonId)
    if (imageStorage) {
      Object.values(imageStorage).forEach(key => {
        imageCache.delete(key)
      })
      imageMetadata.delete(lessonId)
    }
  } else {
    // Limpar todo o cache
    imageCache.clear()
    imageMetadata.clear()
  }
}

export function getImageCacheSize(): number {
  return imageCache.size
}

export function getImageMetadataSize(): number {
  return imageMetadata.size
}
