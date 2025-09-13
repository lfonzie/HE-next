"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle } from 'lucide-react';

interface LessonNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onRestart: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isCompleted: boolean;
  showNavigationButtons: { [key: number]: boolean };
}

export default React.memo(function LessonNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onRestart,
  canGoPrevious,
  canGoNext,
  isCompleted,
  showNavigationButtons
}: LessonNavigationProps) {
  const showButtons = showNavigationButtons[currentStep] || false;

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
    );
  }

  if (!showButtons) return null;

  return (
    <div className="flex justify-between items-center mt-6 p-4 bg-gray-50 rounded-lg">
      <Button 
        onClick={onPrevious}
        disabled={!canGoPrevious}
        variant="outline"
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Button>
      
      <div className="text-sm text-gray-600">
        Passo {currentStep + 1} de {totalSteps}
      </div>
      
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
  );
});
