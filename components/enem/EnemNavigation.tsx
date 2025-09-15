'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  SkipBack, 
  SkipForward,
  Clock,
  CheckCircle,
  Circle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnemNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: number;
  timeRemaining: number;
  isActive: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onGoToQuestion: (index: number) => void;
  questionStatuses: Array<{
    index: number;
    isAnswered: boolean;
    isCorrect?: boolean;
    isCurrent: boolean;
  }>;
  showQuestionGrid?: boolean;
  onToggleQuestionGrid?: () => void;
}

export function EnemNavigation({
  currentQuestion,
  totalQuestions,
  answeredQuestions,
  timeRemaining,
  isActive,
  onPrevious,
  onNext,
  onGoToQuestion,
  questionStatuses,
  showQuestionGrid = false,
  onToggleQuestionGrid
}: EnemNavigationProps) {
  const progress = (answeredQuestions / totalQuestions) * 100;
  const canGoPrevious = currentQuestion > 0;
  const canGoNext = currentQuestion < totalQuestions - 1;

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatusIcon = (status: any) => {
    if (status.isCurrent) {
      return <Circle className="w-4 h-4 text-primary" />;
    }
    if (status.isAnswered) {
      return status.isCorrect ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <AlertCircle className="w-4 h-4 text-red-600" />
      );
    }
    return <Circle className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Progress and Timer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-semibold">Progresso:</span> {answeredQuestions}/{totalQuestions} questões
              </div>
              <Badge variant="outline">
                {Math.round(progress)}% concluído
              </Badge>
            </div>
            
            {isActive && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className={cn(
                  "font-mono text-lg",
                  timeRemaining < 300 && "text-red-600 font-bold"
                )}>
                  {formatTimeRemaining(timeRemaining)}
                </span>
              </div>
            )}
          </div>
          
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Previous Button */}
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={!canGoPrevious || !isActive}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            {/* Question Info */}
            <div className="text-center">
              <div className="text-lg font-semibold">
                Questão {currentQuestion + 1} de {totalQuestions}
              </div>
              <div className="text-sm text-muted-foreground">
                {canGoPrevious ? '←' : ''} {canGoNext ? '→' : ''}
              </div>
            </div>

            {/* Next Button */}
            <Button
              variant="outline"
              onClick={onNext}
              disabled={!canGoNext || !isActive}
              className="flex items-center gap-2"
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Navigation */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onGoToQuestion(0)}
              disabled={!isActive}
              className="flex items-center gap-1"
            >
              <SkipBack className="w-3 h-3" />
              Início
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onGoToQuestion(totalQuestions - 1)}
              disabled={!isActive}
              className="flex items-center gap-1"
            >
              Final
              <SkipForward className="w-3 h-3" />
            </Button>

            {onToggleQuestionGrid && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleQuestionGrid}
                className="flex items-center gap-1"
              >
                {showQuestionGrid ? 'Ocultar' : 'Mostrar'} Grade
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question Grid */}
      {showQuestionGrid && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Grade de Questões</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {questionStatuses.map((status) => (
                <button
                  key={status.index}
                  onClick={() => onGoToQuestion(status.index)}
                  disabled={!isActive}
                  className={cn(
                    "w-8 h-8 rounded border-2 flex items-center justify-center text-sm font-medium transition-all",
                    "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary",
                    status.isCurrent && "border-primary bg-primary text-white",
                    !status.isCurrent && status.isAnswered && "border-green-500 bg-green-50 text-green-700",
                    !status.isCurrent && !status.isAnswered && "border-gray-300 bg-white text-gray-700",
                    !isActive && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {status.index + 1}
                </button>
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                <Circle className="w-3 h-3 text-primary" />
                <span>Atual</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Respondida</span>
              </div>
              <div className="flex items-center gap-1">
                <Circle className="w-3 h-3 text-gray-400" />
                <span>Pendente</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
