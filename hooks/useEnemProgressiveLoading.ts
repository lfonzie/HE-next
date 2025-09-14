import { useState, useCallback, useEffect, useRef } from 'react'
import { EnemQuestion } from '@/types'

interface ProgressiveLoadingState {
  isLoading: boolean
  progress: number
  message: string
  loadedQuestions: EnemQuestion[]
  totalQuestions: number
  currentQuestionIndex: number
  canStart: boolean
  startTime: number | null
  estimatedTimeRemaining: number
  loadingSpeed: number // questões por segundo
  error: string | null
}

export function useEnemProgressiveLoading() {
  const [loadingState, setLoadingState] = useState<ProgressiveLoadingState>({
    isLoading: false,
    progress: 0,
    message: '',
    loadedQuestions: [],
    totalQuestions: 0,
    currentQuestionIndex: 0,
    canStart: false,
    startTime: null,
    estimatedTimeRemaining: 0,
    loadingSpeed: 1, // 1 questão por segundo por padrão
    error: null
  })

  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)

  const startProgressiveLoading = useCallback(async (
    totalQuestions: number,
    loadQuestionsFn: () => Promise<EnemQuestion[]>
  ) => {
    // Limpar intervalos anteriores
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current)
    }

    // Reset state first
    const startTime = Date.now()
    startTimeRef.current = startTime
    
    setLoadingState({
      isLoading: true,
      progress: 0,
      message: 'Preparando questões...',
      loadedQuestions: [],
      totalQuestions,
      currentQuestionIndex: 0,
      canStart: false,
      startTime,
      estimatedTimeRemaining: totalQuestions,
      loadingSpeed: 1,
      error: null
    })

    try {
      // Buscar todas as questões de uma vez
      console.log('🔄 Iniciando carregamento progressivo...')
      const allQuestions = await loadQuestionsFn()
      console.log(`✅ Carregadas ${allQuestions.length} questões`)
      
      if (allQuestions.length === 0) {
        throw new Error('Nenhuma questão foi encontrada')
      }

      // Calcular velocidade de carregamento baseada no número de questões
      const loadingSpeed = Math.max(0.5, Math.min(2, totalQuestions / 20)) // Entre 0.5 e 2 questões por segundo
      const intervalMs = Math.round(1000 / loadingSpeed)

      let currentIndex = 0
      
      // Atualizar velocidade de carregamento
      setLoadingState(prev => ({
        ...prev,
        loadingSpeed,
        message: `Carregando questões (${loadingSpeed.toFixed(1)}/s)...`
      }))

      // Simular carregamento progressivo com velocidade adaptativa
      loadingIntervalRef.current = setInterval(() => {
        if (currentIndex >= allQuestions.length) {
          // Finalizar carregamento
          if (loadingIntervalRef.current) {
            clearInterval(loadingIntervalRef.current)
          }
          
          setLoadingState(prev => ({
            ...prev,
            isLoading: false,
            progress: 100,
            message: 'Simulado pronto!',
            canStart: true,
            estimatedTimeRemaining: 0
          }))
          return
        }

        currentIndex++
        const progress = Math.round((currentIndex / allQuestions.length) * 100)
        const elapsed = Date.now() - startTime
        const actualSpeed = currentIndex / (elapsed / 1000)
        const remainingQuestions = allQuestions.length - currentIndex
        const estimatedTimeRemaining = Math.round(remainingQuestions / actualSpeed)
        
        setLoadingState(prev => ({
          ...prev,
          progress,
          message: `Carregando questão ${currentIndex} de ${allQuestions.length}...`,
          loadedQuestions: allQuestions.slice(0, currentIndex),
          currentQuestionIndex: currentIndex - 1,
          canStart: currentIndex >= 1, // Pode começar desde a primeira questão
          estimatedTimeRemaining,
          loadingSpeed: actualSpeed
        }))
      }, intervalMs)

    } catch (error) {
      console.error('Erro no carregamento progressivo:', error)
      
      // Limpar intervalos em caso de erro
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current)
      }
      
      setLoadingState(prevState => ({
        ...prevState,
        isLoading: false,
        progress: 0,
        message: `Erro ao carregar questões: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Verifique sua conexão e tente novamente.`,
        loadedQuestions: [],
        canStart: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        estimatedTimeRemaining: 0
      }))
    }
  }, [])

  const updateProgress = useCallback((progress: number, message: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      message
    }))
  }, [])

  const stopLoading = useCallback(() => {
    // Limpar intervalos
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current)
    }
    
    setLoadingState({
      isLoading: false,
      progress: 0,
      message: '',
      loadedQuestions: [],
      totalQuestions: 0,
      currentQuestionIndex: 0,
      canStart: false,
      startTime: null,
      estimatedTimeRemaining: 0,
      loadingSpeed: 1,
      error: null
    })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current)
      }
    }
  }, [])

  const getCurrentQuestion = useCallback(() => {
    if (loadingState.loadedQuestions.length === 0) return null
    return loadingState.loadedQuestions[loadingState.currentQuestionIndex] || null
  }, [loadingState.loadedQuestions, loadingState.currentQuestionIndex])

  const getAvailableQuestions = useCallback(() => {
    return loadingState.loadedQuestions
  }, [loadingState.loadedQuestions])

  const canNavigateToQuestion = useCallback((index: number) => {
    return index < loadingState.loadedQuestions.length
  }, [loadingState.loadedQuestions.length])

  return {
    loadingState,
    startProgressiveLoading,
    updateProgress,
    stopLoading,
    getCurrentQuestion,
    getAvailableQuestions,
    canNavigateToQuestion
  }
}
