import { useState, useCallback, useEffect } from 'react'
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
    startTime: null
  })

  const startProgressiveLoading = useCallback(async (
    totalQuestions: number,
    loadQuestionsFn: () => Promise<EnemQuestion[]>
  ) => {
    // Reset state first
    setLoadingState({
      isLoading: true,
      progress: 0,
      message: 'Preparando questões...',
      loadedQuestions: [],
      totalQuestions,
      currentQuestionIndex: 0,
      canStart: false,
      startTime: Date.now()
    })

    try {
      // Buscar todas as questões de uma vez
      console.log('🔄 Iniciando carregamento progressivo...')
      const allQuestions = await loadQuestionsFn()
      console.log(`✅ Carregadas ${allQuestions.length} questões`)
      
      if (allQuestions.length === 0) {
        throw new Error('Nenhuma questão foi encontrada')
      }

      // Simular carregamento progressivo: 1 questão por segundo
      for (let i = 0; i < allQuestions.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // 1 segundo por questão
        
        const progress = Math.round(((i + 1) / allQuestions.length) * 100)
        const message = `Carregando questão ${i + 1} de ${allQuestions.length}...`
        
        setLoadingState(prev => ({
          ...prev,
          progress,
          message,
          loadedQuestions: allQuestions.slice(0, i + 1),
          currentQuestionIndex: i,
          canStart: i >= 0 // Pode começar desde a primeira questão
        }))
      }

      // Finalizar carregamento
      setLoadingState(prev => ({
        ...prev,
        isLoading: false,
        progress: 100,
        message: 'Simulado pronto!',
        canStart: true
      }))

    } catch (error) {
      console.error('Erro no carregamento progressivo:', error)
      
      // Use a more defensive state update
      setLoadingState(prevState => ({
        ...prevState,
        isLoading: false,
        progress: 0,
        message: `Erro ao carregar questões: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Verifique sua conexão e tente novamente.`,
        loadedQuestions: [],
        canStart: false
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
    setLoadingState({
      isLoading: false,
      progress: 0,
      message: '',
      loadedQuestions: [],
      totalQuestions: 0,
      currentQuestionIndex: 0,
      canStart: false,
      startTime: null
    })
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
