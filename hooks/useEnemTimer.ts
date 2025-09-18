'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'

// Timer State Interface
interface TimerState {
  timeRemaining: number
  isActive: boolean
  isPaused: boolean
  startTime: Date | null
  endTime: Date | null
  totalTime: number
  warnings: number[]
}

// Timer Configuration Interface
interface TimerConfig {
  duration: number // in seconds
  warnings: number[] // warning times in seconds (e.g., [300, 60] for 5min and 1min)
  autoPauseOnTabSwitch?: boolean
  autoResumeOnFocus?: boolean
  showNotifications?: boolean
  soundEffects?: boolean
}

// Timer Hook
export function useEnemTimer(config: TimerConfig) {
  const [state, setState] = useState<TimerState>({
    timeRemaining: config.duration,
    isActive: false,
    isPaused: false,
    startTime: null,
    endTime: null,
    totalTime: config.duration,
    warnings: []
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const tabSwitchCountRef = useRef<number>(0)
  const { toast } = useToast()

  // Format time helper
  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`
    }
    return `${minutes}m ${secs.toString().padStart(2, '0')}s`
  }, [])

  // Check for warnings
  const checkWarnings = useCallback((timeRemaining: number) => {
    const newWarnings: number[] = []
    
    config.warnings.forEach(warningTime => {
      if (timeRemaining <= warningTime && !state.warnings.includes(warningTime)) {
        newWarnings.push(warningTime)
        
        if (config.showNotifications) {
          const message = warningTime >= 60 
            ? `Restam ${Math.floor(warningTime / 60)} minutos!`
            : `Restam ${warningTime} segundos!`
          
          toast({
            title: '⏰ Atenção',
            description: message,
            variant: warningTime <= 60 ? 'destructive' : 'default',
          })
        }

        // Play sound effect if enabled
        if (config.soundEffects && typeof window !== 'undefined') {
          try {
            const audio = new Audio('/sounds/timer-warning.mp3')
            audio.volume = 0.3
            audio.play().catch(() => {
              // Fallback: use Web Audio API
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
              const oscillator = audioContext.createOscillator()
              const gainNode = audioContext.createGain()
              
              oscillator.connect(gainNode)
              gainNode.connect(audioContext.destination)
              
              oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
              gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
              
              oscillator.start(audioContext.currentTime)
              oscillator.stop(audioContext.currentTime + 0.5)
            })
          } catch (error) {
            console.warn('Could not play timer sound:', error)
          }
        }
      }
    })

    if (newWarnings.length > 0) {
      setState(prev => ({
        ...prev,
        warnings: [...prev.warnings, ...newWarnings]
      }))
    }
  }, [config.warnings, config.showNotifications, config.soundEffects, state.warnings, toast])

  // Start timer
  const start = useCallback(() => {
    if (state.isActive) return

    setState(prev => ({
      ...prev,
      isActive: true,
      isPaused: false,
      startTime: prev.startTime || new Date(),
      warnings: []
    }))

    lastActivityRef.current = Date.now()
  }, [state.isActive])

  // Pause timer
  const pause = useCallback(() => {
    if (!state.isActive || state.isPaused) return

    setState(prev => ({
      ...prev,
      isPaused: true
    }))

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [state.isActive, state.isPaused])

  // Resume timer
  const resume = useCallback(() => {
    if (!state.isActive || !state.isPaused) return

    setState(prev => ({
      ...prev,
      isPaused: false
    }))

    lastActivityRef.current = Date.now()
  }, [state.isActive, state.isPaused])

  // Stop timer
  const stop = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      isPaused: false,
      endTime: new Date()
    }))

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Reset timer
  const reset = useCallback(() => {
    setState({
      timeRemaining: config.duration,
      isActive: false,
      isPaused: false,
      startTime: null,
      endTime: null,
      totalTime: config.duration,
      warnings: []
    })

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    tabSwitchCountRef.current = 0
  }, [config.duration])

  // Add time
  const addTime = useCallback((seconds: number) => {
    setState(prev => ({
      ...prev,
      timeRemaining: Math.max(0, prev.timeRemaining + seconds),
      totalTime: prev.totalTime + seconds
    }))
  }, [])

  // Set time
  const setTime = useCallback((seconds: number) => {
    setState(prev => ({
      ...prev,
      timeRemaining: Math.max(0, Math.min(seconds, prev.totalTime))
    }))
  }, [])

  // Timer tick
  useEffect(() => {
    if (!state.isActive || state.isPaused) return

    intervalRef.current = setInterval(() => {
      setState(prev => {
        const newTimeRemaining = prev.timeRemaining - 1
        
        if (newTimeRemaining <= 0) {
          // Time's up
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          
          return {
            ...prev,
            timeRemaining: 0,
            isActive: false,
            isPaused: false,
            endTime: new Date()
          }
        }

        // Check for warnings
        checkWarnings(newTimeRemaining)

        return {
          ...prev,
          timeRemaining: newTimeRemaining
        }
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [state.isActive, state.isPaused, checkWarnings])

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && state.isActive && !state.isPaused) {
        tabSwitchCountRef.current++
        
        if (config.autoPauseOnTabSwitch) {
          pause()
        }
      } else if (!document.hidden && state.isActive && state.isPaused && config.autoResumeOnFocus) {
        resume()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [state.isActive, state.isPaused, config.autoPauseOnTabSwitch, config.autoResumeOnFocus, pause, resume])

  // Activity tracking
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now()
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [])

  // Auto-pause on inactivity (optional)
  useEffect(() => {
    if (!state.isActive || state.isPaused) return

    const inactivityInterval = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivityRef.current
      
      // Auto-pause after 5 minutes of inactivity
      if (timeSinceLastActivity > 300000) { // 5 minutes
        pause()
        toast({
          title: '⏸️ Timer pausado',
          description: 'Timer foi pausado devido à inatividade',
        })
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(inactivityInterval)
  }, [state.isActive, state.isPaused, pause, toast])

  // Computed values
  const progress = (state.totalTime - state.timeRemaining) / state.totalTime * 100
  const isTimeUp = state.timeRemaining === 0 && state.isActive === false
  const elapsedTime = state.startTime ? Date.now() - state.startTime.getTime() : 0
  const effectiveTime = elapsedTime - (state.isPaused ? 0 : 0) // Could track paused time

  return {
    // State
    timeRemaining: state.timeRemaining,
    isActive: state.isActive,
    isPaused: state.isPaused,
    startTime: state.startTime,
    endTime: state.endTime,
    totalTime: state.totalTime,
    warnings: state.warnings,
    tabSwitchCount: tabSwitchCountRef.current,
    
    // Computed
    progress,
    isTimeUp,
    elapsedTime,
    effectiveTime,
    formattedTime: formatTime(state.timeRemaining),
    formattedElapsed: formatTime(Math.floor(elapsedTime / 1000)),
    
    // Actions
    start,
    pause,
    resume,
    stop,
    reset,
    addTime,
    setTime,
    
    // Utilities
    formatTime
  }
}

// Preset timer configurations
export const TIMER_PRESETS = {
  quick: {
    duration: 60 * 60, // 1 hour
    warnings: [300, 60], // 5min, 1min
    autoPauseOnTabSwitch: true,
    autoResumeOnFocus: true,
    showNotifications: true,
    soundEffects: true
  },
  custom: {
    duration: 45 * 60, // 45 minutes
    warnings: [300, 60],
    autoPauseOnTabSwitch: false,
    autoResumeOnFocus: false,
    showNotifications: true,
    soundEffects: false
  },
  official: {
    duration: 330 * 60, // 5.5 hours
    warnings: [1800, 900, 300, 60], // 30min, 15min, 5min, 1min
    autoPauseOnTabSwitch: true,
    autoResumeOnFocus: true,
    showNotifications: true,
    soundEffects: true
  },
  adaptive: {
    duration: 270 * 60, // 4.5 hours
    warnings: [1800, 600, 120],
    autoPauseOnTabSwitch: true,
    autoResumeOnFocus: true,
    showNotifications: true,
    soundEffects: false
  }
} as const

