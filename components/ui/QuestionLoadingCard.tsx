"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  BookOpen, 
  Brain, 
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

interface QuestionLoadingCardProps {
  isLoading: boolean;
  currentQuestion: number;
  totalQuestions: number;
  loadingMessage?: string;
  className?: string;
}

export function QuestionLoadingCard({ 
  isLoading, 
  currentQuestion, 
  totalQuestions, 
  loadingMessage = "Carregando questão...",
  className = ""
}: QuestionLoadingCardProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  const progressPercentage = (currentQuestion / totalQuestions) * 100;

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardContent className="py-12 px-8">
        <div className="text-center space-y-6">
          {/* Loading Animation */}
          <div className="relative">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
              <BookOpen className="h-10 w-10 text-white animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <Brain className="h-3 w-3 text-white" />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">
              {loadingMessage}
            </h3>
            <p className="text-gray-600">
              Questão {currentQuestion} de {totalQuestions}
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Carregando questão</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Question Preview */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded animate-pulse w-1/2"></div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-300 rounded animate-pulse w-5/6"></div>
              <div className="h-3 bg-gray-300 rounded animate-pulse w-4/6"></div>
            </div>
          </div>

          {/* Loading Tips */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <Zap className="h-4 w-4" />
              <span className="font-medium">Dica</span>
            </div>
            <p className="text-sm text-blue-700">
              Leia com atenção o enunciado e todas as alternativas antes de responder
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para loading de múltiplas questões
export function QuestionsBatchLoadingCard({ 
  isLoading, 
  loadedQuestions, 
  totalQuestions, 
  className = ""
}: {
  isLoading: boolean;
  loadedQuestions: number;
  totalQuestions: number;
  className?: string;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const progressPercentage = (loadedQuestions / totalQuestions) * 100;
      setProgress(progressPercentage);
    }
  }, [isLoading, loadedQuestions, totalQuestions]);

  if (!isLoading) return null;

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardContent className="py-8 px-6">
        <div className="text-center space-y-4">
          {/* Animation */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">
              Carregando Questões
            </h3>
            <p className="text-gray-600">
              {loadedQuestions} de {totalQuestions} questões carregadas
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-gray-500">
              {Math.round(progress)}% concluído
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Preparando simulado...</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
