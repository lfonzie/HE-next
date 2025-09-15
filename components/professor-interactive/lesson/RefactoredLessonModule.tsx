"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Play, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useProgressiveSlideLoading } from '@/hooks/useProgressiveSlideLoading';
import { Slide } from '@/types/slides';

interface RefactoredLessonModuleProps {
  initialQuery?: string;
  onLessonComplete?: () => void;
}

interface LessonState {
  currentStep: number;
  answers: Record<number, string>;
  isCompleted: boolean;
}

export default function RefactoredLessonModule({ 
  initialQuery = "", 
  onLessonComplete 
}: RefactoredLessonModuleProps) {
  
  const [query, setQuery] = useState(initialQuery);
  const [subject, setSubject] = useState('Geral');
  const [lessonState, setLessonState] = useState<LessonState>({
    currentStep: 0,
    answers: {},
    isCompleted: false
  });

  const progressiveLoading = useProgressiveSlideLoading();

  // Handlers
  const handleSubmit = useCallback(async (e?: any) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    // Reset lesson state
    setLessonState({
      currentStep: 0,
      answers: {},
      isCompleted: false
    });

    // Start progressive loading
    await progressiveLoading.startProgressiveLoading(query.trim(), subject);
  }, [query, subject, progressiveLoading]);

  const handleAnswerSelect = useCallback((slideIndex: number, answer: string) => {
    setLessonState((prev: any) => ({
      ...prev,
      answers: { ...prev.answers, [slideIndex]: answer }
    }));
  }, []);

  const handleNext = useCallback(() => {
    const availableSlides = progressiveLoading.getAvailableSlides();
    
    if (lessonState.currentStep < availableSlides.length - 1) {
      setLessonState((prev: any) => ({ ...prev, currentStep: prev.currentStep + 1 }));
    } else if (progressiveLoading.canLoadNextSlide(lessonState.currentStep)) {
      // Load next slide if available
      progressiveLoading.loadNextSlide(query, subject, lessonState.currentStep);
    }
  }, [lessonState.currentStep, progressiveLoading, query, subject]);

  const handlePrevious = useCallback(() => {
    if (lessonState.currentStep > 0) {
      setLessonState((prev: any) => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  }, [lessonState.currentStep]);

  const handleRestart = useCallback(() => {
    setQuery('');
    setSubject('Geral');
    setLessonState({
      currentStep: 0,
      answers: {},
      isCompleted: false
    });
    progressiveLoading.stopLoading();
  }, [progressiveLoading]);

  // Carregamento automático do próximo slide quando o usuário está navegando
  useEffect(() => {
    const availableSlides = progressiveLoading.getAvailableSlides();
    
    // Se o usuário está no último slide disponível e há mais slides para carregar
    if (lessonState.currentStep >= availableSlides.length - 1 && 
        availableSlides.length < 9 && 
        !progressiveLoading.loadingState.isGeneratingNext) {
      
      // Carregar próximo slide em background
      setTimeout(() => {
        progressiveLoading.loadNextSlide(
          query, 
          subject, 
          lessonState.currentStep
        ).catch((error: any) => {
          console.error('Erro no carregamento automático:', error);
        });
      }, 1000); // Delay para não interferir na navegação
    }
  }, [lessonState.currentStep, progressiveLoading, query, subject]);

  // Verificar se a aula foi concluída
  useEffect(() => {
    const availableSlides = progressiveLoading.getAvailableSlides();
    if (availableSlides.length === 9 && lessonState.currentStep === availableSlides.length - 1) {
      setLessonState((prev: any) => ({ ...prev, isCompleted: true }));
      if (onLessonComplete) {
        onLessonComplete();
      }
    }
  }, [lessonState.currentStep, progressiveLoading.loadingState.loadedSlides, onLessonComplete]);

  // Valores calculados
  const currentSlide = progressiveLoading.loadingState.loadedSlides[lessonState.currentStep];
  const canGoNext = lessonState.currentStep < progressiveLoading.loadingState.loadedSlides.length - 1 || 
                   progressiveLoading.canLoadNextSlide(lessonState.currentStep);
  const canGoPrevious = lessonState.currentStep > 0;
  const progress = progressiveLoading.loadingState.loadedSlides.length > 0 ? 
    ((lessonState.currentStep + 1) / 9) * 100 : 0;

  // Se não há aula carregada, mostrar formulário
  if (progressiveLoading.loadingState.loadedSlides.length === 0 && !progressiveLoading.loadingState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                Aula Progressiva - Carregamento Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    value={query}
                    onChange={(e: any) => setQuery(e.target.value)}
                    placeholder="Digite o tema da aula (ex: Funções Quadráticas, Revolução Francesa, etc.)..."
                    className="w-full"
                    disabled={progressiveLoading.loadingState.isLoading}
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    value={subject}
                    onChange={(e: any) => setSubject(e.target.value)}
                    placeholder="Matéria/Disciplina (opcional)"
                    className="w-full"
                    disabled={progressiveLoading.loadingState.isLoading}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={progressiveLoading.loadingState.isLoading || !query.trim()}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {progressiveLoading.loadingState.isLoading ? 'Iniciando...' : 'Iniciar Aula Progressiva'}
                  </Button>
                </div>
              </form>
              
              {progressiveLoading.loadingState.error && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{progressiveLoading.loadingState.error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Informações sobre carregamento progressivo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">⚡</div>
                  <h3 className="font-semibold mb-2">Carregamento Rápido</h3>
                  <p className="text-sm text-gray-600">Primeiro slide carrega em segundos, você pode começar imediatamente</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">📚</div>
                  <h3 className="font-semibold mb-2">Conteúdo Único</h3>
                  <p className="text-sm text-gray-600">Cada slide é gerado com conteúdo diversificado e não repetitivo</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">🎯</div>
                  <h3 className="font-semibold mb-2">Mix Inteligente</h3>
                  <p className="text-sm text-gray-600">Combinação de explicações, perguntas e encerramento</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                Aula Progressiva: {query}
              </div>
              <Button 
                variant="outline"
                onClick={handleRestart}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Nova Aula
              </Button>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Progress */}
        {progressiveLoading.loadingState.loadedSlides.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progresso da Aula
                </span>
                <span className="text-sm text-gray-500">
                  {lessonState.currentStep + 1} de {progressiveLoading.loadingState.loadedSlides.length} slides
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between mt-2">
                <Badge variant="outline">
                  {Object.keys(lessonState.answers).length} respondidas
                </Badge>
                <Badge variant="secondary">
                  {Math.round(progress)}% completo
                </Badge>
                {progressiveLoading.loadingState.isGeneratingNext && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Gerando próximo...
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {progressiveLoading.loadingState.isLoading && (
          <Card className="mb-6">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-3 text-blue-600">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-lg font-semibold">{progressiveLoading.loadingState.message}</span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>🚀 Preparando primeiro slide...</p>
                  <p>⚡ Você poderá começar em segundos!</p>
                </div>
                <div className="mt-4">
                  <Progress value={progressiveLoading.loadingState.progress} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Slide Display */}
        {currentSlide && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Slide {lessonState.currentStep + 1}: {currentSlide.title}</span>
                  <Badge variant={currentSlide.type === 'question' ? 'default' : 'secondary'}>
                    {currentSlide.type === 'question' ? 'Pergunta' : 
                     currentSlide.type === 'closing' ? 'Encerramento' : 'Explicação'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="text-lg leading-relaxed mb-4">
                    {currentSlide.content}
                  </div>
                  
                  {/* Key Points */}
                  {currentSlide.key_points && currentSlide.key_points.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Pontos-chave:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {currentSlide.key_points.map((point: any, index: any) => (
                          <li key={index} className="text-gray-700">{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Question */}
                  {currentSlide.type === 'question' && currentSlide.question_stem && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold mb-3">{currentSlide.question_stem}</h4>
                      <div className="space-y-2">
                        {currentSlide.options?.map((option: any, index: any) => (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(lessonState.currentStep, option)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              lessonState.answers[lessonState.currentStep] === option
                                ? 'bg-blue-100 border-blue-300 text-blue-800'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      
                      {/* Show answer and rationale if answered */}
                      {lessonState.answers[lessonState.currentStep] && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-800">Resposta Correta:</span>
                          </div>
                          <p className="text-green-700 font-medium mb-2">{currentSlide.answer}</p>
                          <p className="text-green-600 text-sm">{currentSlide.rationale}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Image */}
                  {currentSlide.image_prompt && (
                    <div className="mt-6">
                      <div className="text-sm text-gray-500 mb-2">
                        Imagem sugerida: {currentSlide.image_prompt}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        {progressiveLoading.loadingState.loadedSlides.length > 0 && (
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Button>

            <div className="flex items-center gap-2">
              {lessonState.isCompleted && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Aula Concluída!</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleNext}
              disabled={!canGoNext}
              className="flex items-center gap-2"
            >
              {progressiveLoading.loadingState.isGeneratingNext ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Completion Summary */}
        {lessonState.isCompleted && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl text-center">Aula Concluída!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-2xl font-bold text-green-600">
                  Parabéns! Você completou a aula sobre "{query}"
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">9</div>
                    <div className="text-sm text-blue-600">Slides Únicos</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Object.keys(lessonState.answers).length}
                    </div>
                    <div className="text-sm text-green-600">Questões Respondidas</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {progressiveLoading.loadingState.loadedSlides.filter((slide: any) => 
                        slide.image_confidence && slide.image_confidence >= 0.7
                      ).length}
                    </div>
                    <div className="text-sm text-purple-600">Imagens de Qualidade</div>
                  </div>
                </div>
                <Button onClick={handleRestart} className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Criar Nova Aula
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}