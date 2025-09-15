'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Image } from 'next/image';
import { 
  Clock, 
  BookOpen, 
  Target, 
  CheckCircle, 
  Circle, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Question } from '@/lib/stores/enem-simulation-store';
import { cn } from '@/lib/utils';

interface EnemQuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  userAnswer?: string;
  onAnswerSelect: (answer: string) => void;
  timeRemaining?: number;
  isActive?: boolean;
  showRationale?: boolean;
  onToggleRationale?: () => void;
}

export function EnemQuestionCard({
  question,
  questionNumber,
  totalQuestions,
  userAnswer,
  onAnswerSelect,
  timeRemaining,
  isActive = false,
  showRationale = false,
  onToggleRationale
}: EnemQuestionCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const options = [
    { key: 'A', value: question.a },
    { key: 'B', value: question.b },
    { key: 'C', value: question.c },
    { key: 'D', value: question.d },
    { key: 'E', value: question.e }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HARD': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'DATABASE': return 'bg-blue-100 text-blue-800';
      case 'AI': return 'bg-purple-100 text-purple-800';
      case 'FALLBACK': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="font-semibold">
                  Questão {questionNumber} de {totalQuestions}
                </span>
              </div>
              <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                {question.difficulty}
              </Badge>
              <Badge variant="outline" className={getSourceColor(question.source)}>
                {question.source === 'DATABASE' ? 'Real' : 
                 question.source === 'AI' ? 'IA' : 'Fallback'}
              </Badge>
            </div>
            
            {timeRemaining !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span className={cn(
                  "font-mono",
                  timeRemaining < 300 && "text-red-600 font-bold"
                )}>
                  {formatTimeRemaining(timeRemaining)}
                </span>
              </div>
            )}
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>{question.disciplina}</span>
              <span>Ano {question.year}</span>
            </div>
            <div className="flex gap-1">
              {question.skill_tag.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {question.skill_tag.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{question.skill_tag.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Question Content */}
      <Card>
        <CardContent className="p-6">
          {/* Question Image */}
          {question.image_url && !imageError && (
            <div className="mb-6">
              <div className="relative">
                {!imageLoaded && (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-gray-500">Carregando imagem...</div>
                  </div>
                )}
                <Image
                  src={question.image_url}
                  alt={question.image_alt || 'Imagem da questão'}
                  width={800}
                  height={400}
                  className={cn(
                    "w-full h-auto rounded-lg border",
                    !imageLoaded && "hidden"
                  )}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              </div>
            </div>
          )}

          {/* Question Stem */}
          <div className="mb-6">
            <h3 className="text-lg font-medium leading-relaxed">
              {question.stem}
            </h3>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {options.map((option) => {
              const isSelected = userAnswer === option.key;
              const isCorrect = showRationale && option.key === question.correct;
              const isIncorrect = showRationale && isSelected && option.key !== question.correct;

              return (
                <button
                  key={option.key}
                  onClick={() => onAnswerSelect(option.key)}
                  disabled={!isActive}
                  className={cn(
                    "w-full p-4 text-left rounded-lg border-2 transition-all",
                    "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary",
                    isSelected && "border-primary bg-primary/5",
                    isCorrect && "border-green-500 bg-green-50",
                    isIncorrect && "border-red-500 bg-red-50",
                    !isActive && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                      isSelected ? "border-primary bg-primary text-white" : "border-gray-300",
                      isCorrect && "border-green-500 bg-green-500 text-white",
                      isIncorrect && "border-red-500 bg-red-500 text-white"
                    )}>
                      {isSelected || isCorrect || isIncorrect ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-primary">{option.key})</span>
                        {isCorrect && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            Correta
                          </Badge>
                        )}
                        {isIncorrect && (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                            Incorreta
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {option.value}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Rationale */}
          {showRationale && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Explicação</h4>
              </div>
              <p className="text-blue-700 leading-relaxed">
                {question.rationale}
              </p>
            </div>
          )}

          {/* Toggle Rationale Button */}
          {onToggleRationale && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleRationale}
                className="flex items-center gap-2"
              >
                {showRationale ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Ocultar Explicação
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Ver Explicação
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
