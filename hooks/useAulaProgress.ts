'use client'

import { useState, useEffect, useCallback } from 'react'

interface ProgressState {
  progress: number
  status: string
  isGenerating: boolean
  elapsedTime: number
  startTime: number | null
}

interface TimerState {
  elapsedTime: number
  startTime: number | null
}

const STATUS_MESSAGES = [
  { progress: 0, message: 'Analisando o tópico e contexto educacional...' },
  { progress: 15, message: 'Identificando matéria, série e nível de dificuldade...' },
  { progress: 35, message: 'Criando objetivos de aprendizagem personalizados...' },
  { progress: 55, message: 'Estruturando conteúdo pedagógico...' },
  { progress: 75, message: 'Gerando atividades interativas e avaliações...' },
  { progress: 90, message: 'Aplicando técnicas de gamificação...' },
  { progress: 95, message: 'Finalizando aula e preparando interface...' }
]

export function useAulaProgress() {
  const [progressState, setProgressState] = useState<ProgressState>({
    progress: 0,
    status: '',
    isGenerating: false,
    elapsedTime: 0,
    startTime: null
  })

  const [timerState, setTimerState] = useState<TimerState>({
    elapsedTime: 0,
    startTime: null
  })

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (progressState.isGenerating && progressState.startTime) {
      interval = setInterval(() => {
        setProgressState(prev => ({
          ...prev,
          elapsedTime: Date.now() - prev.startTime!
        }))
      }, 100)
    } else if (!progressState.isGenerating) {
      setProgressState(prev => ({
        ...prev,
        elapsedTime: 0,
        startTime: null
      }))
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [progressState.isGenerating, progressState.startTime])

  // Format time helper
  const formatTime = useCallback((milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000)
    const ms = Math.floor((milliseconds % 1000) / 100)
    
    if (seconds < 60) {
      return `${seconds}.${ms}s`
    }
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (remainingSeconds === 0) {
      return `${minutes}m`
    }
    
    return `${minutes}m ${remainingSeconds}s`
  }, [])

  // Update progress
  const updateProgress = useCallback((progress: number, status?: string) => {
    setProgressState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
      status: status || prev.status
    }))
  }, [])

  // Update status
  const updateStatus = useCallback((status: string) => {
    setProgressState(prev => ({
      ...prev,
      status
    }))
  }, [])

  // Start generation
  const startGeneration = useCallback(() => {
    setProgressState(prev => ({
      ...prev,
      isGenerating: true,
      progress: 0,
      status: 'Iniciando geração da aula...',
      startTime: Date.now(),
      elapsedTime: 0
    }))
  }, [])

  // Stop generation
  const stopGeneration = useCallback(() => {
    setProgressState(prev => ({
      ...prev,
      isGenerating: false,
      startTime: null
    }))
  }, [])

  // Reset progress
  const resetProgress = useCallback(() => {
    setProgressState({
      progress: 0,
      status: '',
      isGenerating: false,
      elapsedTime: 0,
      startTime: null
    })
  }, [])

  // Get status message based on progress
  const getStatusMessage = useCallback((progress: number): string => {
    const message = STATUS_MESSAGES.find(msg => msg.progress <= progress)
    return message?.message || 'Processando...'
  }, [])

  // Estimate remaining time
  const getEstimatedTimeRemaining = useCallback((progress: number, elapsedTime: number): string => {
    if (progress <= 0 || elapsedTime <= 0) {
      return 'Calculando...'
    }

    const totalEstimatedTime = (elapsedTime / progress) * 100
    const remainingTime = totalEstimatedTime - elapsedTime

    if (remainingTime <= 0) {
      return 'Quase pronto...'
    }

    return formatTime(remainingTime)
  }, [formatTime])

  // Get progress percentage with animation
  const getAnimatedProgress = useCallback((targetProgress: number, duration: number = 300) => {
    return new Promise<void>((resolve) => {
      const startProgress = progressState.progress
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        const currentProgress = startProgress + (targetProgress - startProgress) * progress
        
        setProgressState(prev => ({
          ...prev,
          progress: currentProgress
        }))

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }

      animate()
    })
  }, [progressState.progress])

  return {
    // State
    progressState,
    
    // Actions
    updateProgress,
    updateStatus,
    startGeneration,
    stopGeneration,
    resetProgress,
    getAnimatedProgress,
    
    // Computed
    progress: progressState.progress,
    status: progressState.status,
    isGenerating: progressState.isGenerating,
    elapsedTime: progressState.elapsedTime,
    formattedTime: formatTime(progressState.elapsedTime),
    estimatedTimeRemaining: getEstimatedTimeRemaining(progressState.progress, progressState.elapsedTime),
    statusMessage: getStatusMessage(progressState.progress)
  }
}


