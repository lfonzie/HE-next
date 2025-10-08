// Utilitário para converter imagens base64 para URLs temporárias
// Isso evita problemas de quota do localStorage

export function convertBase64ToBlobUrl(base64Data: string): string {
  try {
    // Extrair o tipo MIME e os dados base64
    const [header, data] = base64Data.split(',')
    const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/png'
    
    // Converter base64 para blob
    const byteCharacters = atob(data)
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: mimeType })
    
    // Criar URL temporária
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('Erro ao converter base64 para blob URL:', error)
    return base64Data // Fallback para base64 original
  }
}

export function convertImagesToBlobUrls(slides: any[]): any[] {
  return slides.map(slide => {
    if (slide.imageUrl?.startsWith('data:')) {
      const blobUrl = convertBase64ToBlobUrl(slide.imageUrl)
      console.log(`🔄 Convertendo imagem base64 para blob URL: slide ${slide.slideNumber}`)
      return { ...slide, imageUrl: blobUrl }
    }
    return slide
  })
}

export function cleanupBlobUrls(slides: any[]): void {
  slides.forEach(slide => {
    if (slide.imageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(slide.imageUrl)
      console.log(`🗑️ Limpando blob URL: slide ${slide.slideNumber}`)
    }
  })
}
