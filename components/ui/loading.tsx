'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { AnimatedLogo } from './logo'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-primary',
        sizeClasses[size],
        className
      )}
    />
  )
}

interface LoadingScreenProps {
  message?: string
  className?: string
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Carregando…', 
  className 
}) => {
  return (
    <div className={cn(
      'min-h-screen flex flex-col items-center justify-center',
      'bg-gradient-to-br from-yellow-50 to-orange-50',
      className
    )}>
      {/* Logo Animation */}
      <div className="mb-8">
        <AnimatedLogo variant="compact" size="lg" />
      </div>

      {/* Loading Spinner */}
      <div className="mb-6">
        <LoadingSpinner size="lg" />
      </div>

      {/* Loading Message */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          HubEdu.ia
        </h2>
        <p className="text-gray-600 animate-pulse">
          {message}
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex space-x-2 mt-6">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  message?: string
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  children, 
  message = 'Carregando…' 
}) => {
  if (!isLoading) return <>{children}</>

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  )
}

interface PageLoadingProps {
  className?: string
}

export const PageLoading: React.FC<PageLoadingProps> = ({ className }) => {
  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center',
      'bg-gradient-to-br from-yellow-50 to-orange-50',
      className
    )}>
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Carregando página...</p>
      </div>
    </div>
  )
}
