import { useState, useCallback, useEffect } from 'react'

interface LessonSlide {
  slideNumber: number
  type: string
  title: string
  content: string
  imageUrl?: string
  imagePrompt?: string
  timeEstimate?: number
  question?: string
  options?: string[]
  correctAnswer?: number
  explanation?: string
}

interface ProgressiveLoadingState {
  isLoading: boolean
  progress: number
  message: string
  loadedSlides: LessonSlide[]
  totalSlides: number
  currentSlideIndex: number
  canStart: boolean
  startTime: number | null
  isGeneratingNext: boolean
  elapsedTime: number
  formattedTime: string
}

export function useLessonsProgressiveLoading() {
  const [loadingState, setLoadingState] = useState<ProgressiveLoadingState>({
    isLoading: false,
    progress: 0,
    message: '',
    loadedSlides: [],
    totalSlides: 9, // Total de slides esperados
    currentSlideIndex: 0,
    canStart: false,
    startTime: null,
    isGeneratingNext: false,
    elapsedTime: 0,
    formattedTime: '0s'
  })

  const generateSlide = useCallback(async (
    slideIndex: number, 
    topic: string, 
    subject: string = 'Geral'
  ): Promise<LessonSlide> => {
    try {
      console.log(`🔄 Gerando slide ${slideIndex} para tópico: ${topic}`)
      
      const response = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          topic: topic,
          subject: subject,
          grade: 5, // Default grade
          generateSingleSlide: slideIndex // Indica que queremos apenas um slide específico
        }),
      })

      if (!response.ok) {
        throw new Error(`Falha na resposta da API: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success || !data.lesson) {
        throw new Error(data.error || 'Falha ao gerar slide')
      }

      // Extrair apenas o slide solicitado
      const slide = data.lesson.slides[slideIndex - 1] // slides são indexados de 0
      
      if (!slide) {
        throw new Error(`Slide ${slideIndex} não encontrado na resposta`)
      }

      return slide
    } catch (error) {
      console.error(`❌ Erro ao gerar slide ${slideIndex}:`, error)
      throw error
    }
  }, [])

  const startProgressiveLoading = useCallback(async (
    topic: string,
    subject: string = 'Geral'
  ) => {
    console.log('🚀 Iniciando carregamento progressivo para lessons')
    
    setLoadingState({
      isLoading: true,
      progress: 0,
      message: 'Preparando aula...',
      loadedSlides: [],
      totalSlides: 9,
      currentSlideIndex: 0,
      canStart: false,
      startTime: Date.now(),
      isGeneratingNext: false,
      elapsedTime: 0,
      formattedTime: '0s'
    })

    try {
      // Preparação inicial
      setLoadingState(prev => ({
        ...prev,
        progress: 10,
        message: 'Gerando primeiro slide...'
      }))

      // Gerar slide 1 (introdução)
      console.log('⚡ Gerando slide 1...')
      const slide1 = await generateSlide(1, topic, subject)

      setLoadingState(prev => ({
        ...prev,
        progress: 50,
        message: 'Gerando segundo slide...',
        loadedSlides: [slide1]
      }))

      // Gerar slide 2 (conteúdo principal)
      console.log('⚡ Gerando slide 2...')
      const slide2 = await generateSlide(2, topic, subject)

      // Permitir começar com apenas 2 slides
      setLoadingState(prev => ({
        ...prev,
        progress: 100,
        message: 'Primeiros slides prontos!',
        loadedSlides: [slide1, slide2], // APENAS 2 slides carregados
        canStart: true,
        isLoading: false
      }))

      console.log('✅ Slides 1 e 2 prontos - usuário pode começar')

    } catch (error) {
      console.error('❌ Erro no carregamento inicial:', error)
      setLoadingState(prevState => ({
        ...prevState,
        isLoading: false,
        progress: 0,
        message: `Erro ao carregar slides: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        loadedSlides: [],
        canStart: false
      }))
    }
  }, [generateSlide])

  const loadNextSlide = useCallback(async (
    topic: string,
    subject: string = 'Geral',
    slideIndex: number
  ) => {
    if (slideIndex >= 9) {
      console.log('⚠️ Máximo de slides atingido (9)')
      return
    }

    const nextSlideNumber = slideIndex + 1
    console.log(`📥 Carregando slide ${nextSlideNumber} sob demanda...`)

    setLoadingState(prev => ({
      ...prev,
      isGeneratingNext: true,
      message: `Gerando slide ${nextSlideNumber}...`
    }))

    try {
      // Gerar APENAS o próximo slide
      const newSlide = await generateSlide(nextSlideNumber, topic, subject)
      
      setLoadingState(prev => ({
        ...prev,
        loadedSlides: [...prev.loadedSlides, newSlide], // Adicionar apenas 1 slide
        isGeneratingNext: false,
        message: `Slide ${nextSlideNumber} carregado!`
      }))

      console.log(`✅ Slide ${nextSlideNumber} carregado com sucesso`)

      // Limpar mensagem após um tempo
      setTimeout(() => {
        setLoadingState(prev => ({
          ...prev,
          message: ''
        }))
      }, 1500)

    } catch (error) {
      console.error(`❌ Erro ao gerar slide ${nextSlideNumber}:`, error)
      setLoadingState(prev => ({
        ...prev,
        isGeneratingNext: false,
        message: `Erro ao gerar slide ${nextSlideNumber}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }))
    }
  }, [generateSlide])

  const updateProgress = useCallback((progress: number, message: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      message
    }))
  }, [])

  const stopLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      progress: 0,
      message: '',
      loadedSlides: [],
      totalSlides: 9,
      currentSlideIndex: 0,
      canStart: false,
      startTime: null,
      isGeneratingNext: false,
      elapsedTime: 0,
      formattedTime: '0s'
    })
  }, [])

  // Função para formatar tempo
  const formatTime = useCallback((seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (remainingSeconds === 0) {
      return `${minutes}m`
    }
    
    return `${minutes}m ${remainingSeconds}s`
  }, [])

  // Atualizar contador de tempo durante o carregamento
  useEffect(() => {
    if (!loadingState.isLoading || !loadingState.startTime) return
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - loadingState.startTime!
      const seconds = Math.floor(elapsed / 1000)
      
      setLoadingState(prev => ({
        ...prev,
        elapsedTime: seconds,
        formattedTime: formatTime(seconds)
      }))
    }, 1000)
    
    return () => clearInterval(interval)
  }, [loadingState.isLoading, loadingState.startTime, formatTime])

  const getCurrentSlide = useCallback(() => {
    if (loadingState.loadedSlides.length === 0) return null
    return loadingState.loadedSlides[loadingState.currentSlideIndex] || null
  }, [loadingState.loadedSlides, loadingState.currentSlideIndex])

  const getAvailableSlides = useCallback(() => {
    return loadingState.loadedSlides
  }, [loadingState.loadedSlides])

  const canNavigateToSlide = useCallback((index: number) => {
    return index < loadingState.loadedSlides.length
  }, [loadingState.loadedSlides.length])

  const canGoNext = useCallback((currentIndex: number) => {
    // Pode ir para próximo se não estiver gerando e houver próximo slide disponível
    return !loadingState.isGeneratingNext && currentIndex < loadingState.loadedSlides.length - 1
  }, [loadingState.isGeneratingNext, loadingState.loadedSlides.length])

  return {
    loadingState,
    startProgressiveLoading,
    loadNextSlide,
    updateProgress,
    stopLoading,
    getCurrentSlide,
    getAvailableSlides,
    canNavigateToSlide,
    canGoNext
  }
}
