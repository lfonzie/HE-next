'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import LoadingScreen, { SimpleSpinner, LoadingOverlay as UnifiedLoadingOverlay } from './UnifiedLoadingScreen'

// Re-export do sistema unificado para compatibilidade
export { LoadingScreen, SimpleSpinner as LoadingSpinner, UnifiedLoadingOverlay as LoadingOverlay }

// Componente de compatibilidade para PageLoading
interface PageLoadingProps {
  className?: string
}

export const PageLoading: React.FC<PageLoadingProps> = ({ className }) => {
  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center',
      'bg-black/70 backdrop-blur-sm',
      className
    )}>
      <div className="text-center">
        <SimpleSpinner size="lg" />
        <p className="mt-4 text-gray-600">Carregando página...</p>
      </div>
    </div>
  )
}
