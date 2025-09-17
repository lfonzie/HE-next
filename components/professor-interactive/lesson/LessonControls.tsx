"use client";

import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  RotateCcw,
  Maximize,
  Minimize,
  Keyboard
} from 'lucide-react'

interface LessonControlsProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  onRestart: () => void
  onToggleFullscreen: () => void
  canGoPrevious: boolean
  canGoNext: boolean
  isCompleted: boolean
  isFullscreen: boolean
  isFullscreenSupported: boolean
  showNavigationButtons: { [key: number]: boolean }
}

export default React.memo(function LessonControls({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onRestart,
  onToggleFullscreen,
  canGoPrevious,
  canGoNext,
  isCompleted,
  isFullscreen,
  isFullscreenSupported,
  showNavigationButtons
}: LessonControlsProps) {
  
  if (isCompleted) {
    return (
      <div className="flex justify-center gap-4 mt-6">
        <Button 
          onClick={onRestart}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reiniciar Aula
        </Button>
      </div>
    )
  }

  return (
    <div className="flex justify-between items-center mt-6 p-4 bg-gray-50 rounded-lg">
      {/* Botão Anterior */}
      <Button 
        onClick={onPrevious}
        disabled={!canGoPrevious}
        variant="outline"
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Button>
      
      {/* Controles Centrais */}
      <div className="flex items-center gap-4">
        {/* Indicador de Progresso */}
        <div className="text-sm text-gray-600">
          Passo {currentStep + 1} de {totalSteps}
        </div>
        
        {/* Botão Fullscreen */}
        {isFullscreenSupported && (
          <Button
            onClick={onToggleFullscreen}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            title={isFullscreen ? 'Sair do fullscreen (F11)' : 'Entrar no fullscreen (F11)'}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
        )}
        
        {/* Indicador de Navegação por Teclado */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Keyboard className="h-3 w-3" />
          <span>← →</span>
        </div>
      </div>
      
      {/* Botão Próximo */}
      <Button 
        onClick={onNext}
        disabled={!canGoNext}
        className="flex items-center gap-2"
      >
        {currentStep === totalSteps - 1 ? (
          <>
            <CheckCircle className="h-4 w-4" />
            Finalizar
          </>
        ) : (
          <>
            Próximo
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  )
})
