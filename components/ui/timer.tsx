'use client'

import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface TimerProps {
  isActive: boolean
  className?: string
  showMilliseconds?: boolean
  format?: 'mm:ss' | 'hh:mm:ss' | 'ss'
}

export const Timer: React.FC<TimerProps> = ({ 
  isActive, 
  className,
  showMilliseconds = false,
  format = 'mm:ss'
}) => {
  const [time, setTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    switch (format) {
      case 'hh:mm:ss':
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      case 'mm:ss':
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      case 'ss':
        return `${seconds}s`
      default:
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
  }

  return (
    <div className={cn(
      'font-mono text-sm font-medium',
      className
    )}>
      {formatTime(time)}
    </div>
  )
}

interface LoadingTimerProps {
  isLoading: boolean
  message?: string
  className?: string
  showTimer?: boolean
}

export const LoadingTimer: React.FC<LoadingTimerProps> = ({ 
  isLoading, 
  message = 'Carregando...',
  className,
  showTimer = true
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center min-h-[200px] space-y-4',
      className
    )}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      
      <div className="text-center space-y-2">
        <p className="text-gray-600 font-medium">{message}</p>
        {showTimer && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <Timer isActive={isLoading} format="mm:ss" />
          </div>
        )}
      </div>
    </div>
  )
}

interface ProgressTimerProps {
  isLoading: boolean
  progress?: number
  message?: string
  className?: string
}

export const ProgressTimer: React.FC<ProgressTimerProps> = ({ 
  isLoading, 
  progress = 0,
  message = 'Processando...',
  className
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center min-h-[200px] space-y-6',
      className
    )}>
      {/* Progress Circle */}
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-gray-200"
            strokeWidth="3"
            fill="none"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-blue-600"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${progress}, 100`}
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-700">{progress}%</span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-gray-600 font-medium">{message}</p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <Timer isActive={isLoading} format="mm:ss" />
        </div>
      </div>
    </div>
  )
}
