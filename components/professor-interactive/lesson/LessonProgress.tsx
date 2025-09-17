"use client";

import React from 'react';
import { Progress } from '@/components/ui/progress';

interface LessonProgressProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export default React.memo(function LessonProgress({
  currentStep,
  totalSteps,
  className = ""
}: LessonProgressProps) {
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Progresso da Aula
        </span>
        <span className="text-sm text-gray-500">
          {currentStep} de {totalSteps} passos
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
});
