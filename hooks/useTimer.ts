import { useState, useEffect, useCallback } from 'react'

interface TimerState {
  elapsedTime: number
  formattedTime: string
  isRunning: boolean
}

export function useTimer() {
  const [timerState, setTimerState] = useState<TimerState>({
    elapsedTime: 0,
    formattedTime: '0s',
    isRunning: false
  })

  const startTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      elapsedTime: 0,
      formattedTime: '0s',
      isRunning: true
    }))
  }, [])

  const stopTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false
    }))
  }, [])

  const resetTimer = useCallback(() => {
    setTimerState({
      elapsedTime: 0,
      formattedTime: '0s',
      isRunning: false
    })
  }, [])

  // Função para formatar tempo em segundos/minutos
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

  // Atualizar timer a cada segundo
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timerState.isRunning) {
      interval = setInterval(() => {
        setTimerState(prev => {
          const newElapsedTime = prev.elapsedTime + 1
          return {
            ...prev,
            elapsedTime: newElapsedTime,
            formattedTime: formatTime(newElapsedTime)
          }
        })
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [timerState.isRunning, formatTime])

  return {
    elapsedTime: timerState.elapsedTime,
    formattedTime: timerState.formattedTime,
    isRunning: timerState.isRunning,
    startTimer,
    stopTimer,
    resetTimer
  }
}
