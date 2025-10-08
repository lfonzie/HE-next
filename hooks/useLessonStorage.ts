import { useState, useCallback } from 'react'
import { convertImagesToBlobUrls, cleanupBlobUrls } from '@/utils/imageUtils'

interface LessonData {
  id: string
  title: string
  subject: string
  grade: number
  objectives: string[]
  introduction: string
  slides: Array<{
    slideNumber: number
    type: string
    title: string
    content: string
    imageUrl?: string
    requiresImage?: boolean
    timeEstimate?: number
    questions?: any[]
  }>
  summary: string
  nextSteps: string[]
  filteredTheme?: string
  curiosities?: any[]
  imagePrompts?: any[]
}

export function useLessonStorage() {
  const [isSaving, setIsSaving] = useState(false)

  const saveLesson = useCallback(async (lesson: LessonData) => {
    setIsSaving(true)
    
    try {
      console.log('📊 Debug - Salvando lição:', {
        title: lesson.title,
        totalSlides: lesson.slides.length,
        slidesWithImages: lesson.slides.filter(slide => slide.imageUrl).length
      })

      // Salvar imagens base64 diretamente (conversão para blob URLs será feita no carregamento)
      try {
        localStorage.setItem(`lesson_v2_${lesson.id}`, JSON.stringify(lesson))
        console.log('✅ Lição salva com sucesso (com imagens base64):', lesson.title)
        return true
      } catch (quotaError) {
        console.warn('⚠️ Quota excedida, tentando salvar sem imagens...')
        
        // Fallback: salvar sem imagens
        const lessonWithoutImages = {
          ...lesson,
          slides: lesson.slides.map(slide => ({ ...slide, imageUrl: null }))
        }
        
        localStorage.setItem(`lesson_v2_${lesson.id}`, JSON.stringify(lessonWithoutImages))
        console.log('⚠️ Lição salva sem imagens devido ao limite de armazenamento')
        return true
      }
    } catch (error) {
      console.error('❌ Erro ao salvar lição:', error)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [])

  const loadLesson = useCallback((lessonId: string): LessonData | null => {
    try {
      const saved = localStorage.getItem(`lesson_v2_${lessonId}`)
      if (!saved) return null

      const lesson = JSON.parse(saved) as LessonData
      
      // Converter imagens base64 para blob URLs no cliente
      const slidesWithBlobUrls = convertImagesToBlobUrls(lesson.slides)
      const lessonWithBlobUrls = {
        ...lesson,
        slides: slidesWithBlobUrls
      }
      
      // Debug: verificar imagens carregadas
      const imageCount = lessonWithBlobUrls.slides.filter(slide => slide.imageUrl).length
      console.log('📊 Debug - Carregando lição:', {
        title: lessonWithBlobUrls.title,
        totalSlides: lessonWithBlobUrls.slides.length,
        slidesWithImages: imageCount,
        imageDetails: lessonWithBlobUrls.slides.filter(slide => slide.imageUrl).map(slide => ({
          slideNumber: slide.slideNumber,
          hasImage: !!slide.imageUrl,
          isBlobUrl: slide.imageUrl?.startsWith('blob:'),
          isBase64: slide.imageUrl?.startsWith('data:'),
          imageSize: slide.imageUrl?.length || 0
        }))
      })
      
      return lessonWithBlobUrls
    } catch (error) {
      console.error('❌ Erro ao carregar lição:', error)
      return null
    }
  }, [])

  const clearCache = useCallback((lessonId?: string) => {
    if (lessonId) {
      // Limpar blob URLs antes de remover do localStorage
      try {
        const saved = localStorage.getItem(`lesson_v2_${lessonId}`)
        if (saved) {
          const lesson = JSON.parse(saved) as LessonData
          cleanupBlobUrls(lesson.slides)
        }
      } catch (error) {
        console.warn('Erro ao limpar blob URLs:', error)
      }
      
      localStorage.removeItem(`lesson_v2_${lessonId}`)
    } else {
      // Limpar todas as lições
      const keys = Object.keys(localStorage).filter(key => key.startsWith('lesson_v2_'))
      keys.forEach(key => {
        try {
          const saved = localStorage.getItem(key)
          if (saved) {
            const lesson = JSON.parse(saved) as LessonData
            cleanupBlobUrls(lesson.slides)
          }
        } catch (error) {
          console.warn('Erro ao limpar blob URLs:', error)
        }
        localStorage.removeItem(key)
      })
    }
  }, [])

  return {
    saveLesson,
    loadLesson,
    clearImageCache: clearCache,
    isSaving
  }
}
