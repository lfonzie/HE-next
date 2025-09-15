"use client";

import Image from 'next/image';
import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react';
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
  ChevronLeft, 
  ChevronRight, 
  Maximize2,
  Minimize2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Zap
} from 'lucide-react';

import { useLessonState } from '../hooks/useLessonState';
import { useLessonLoading } from '../hooks/useLessonLoading';
import { useLessonGeneration } from '../hooks/useLessonGeneration';
import { processSlidesForHubEduPattern } from '@/utils/professor-interactive/buildSlides';
import { useProfessorProgressiveLoading } from '@/hooks/useProfessorProgressiveLoading';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useFullscreen } from '@/hooks/useFullscreen';
import { detectSubject } from '@/utils/professor-interactive/subjectDetection';

import LessonHeader from './LessonHeader';
import LessonProgress from './LessonProgress';
import LessonLoadingScreen from './LessonLoadingScreen';
import LessonStats from './LessonStats';
import LessonControls from './LessonControls';
import QuestionCard from '../quiz/QuestionCard';
import InteractiveQuestionCard from '../quiz/InteractiveQuestionCard';
import UnsplashSlideCard from './UnsplashSlideCard';

interface EnhancedLessonModuleProps {
  initialQuery?: string;
  onLessonComplete?: () => void;
  className?: string;
}

// Componente de loading otimizado
const OptimizedLoadingScreen = React.memo(({ 
  progress, 
  message, 
  isGeneratingNext 
}: { 
  progress: number; 
  message: string; 
  isGeneratingNext: boolean;
}) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="relative">
      <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      {isGeneratingNext && (
        <div className="absolute -top-2 -right-2">
          <Zap className="h-6 w-6 text-yellow-500 animate-pulse" />
        </div>
      )}
    </div>
    <div className="text-center space-y-2">
      <h3 className="text-lg font-semibold">
        {isGeneratingNext ? 'Gerando próximo slide...' : 'Preparando sua aula'}
      </h3>
      <p className="text-sm text-muted-foreground">{message}</p>
      <Progress value={progress} className="w-64" />
    </div>
  </div>
));

OptimizedLoadingScreen.displayName = 'OptimizedLoadingScreen';

// Componente de slide otimizado
const OptimizedSlideCard = React.memo(({ 
  slide, 
  stepIndex, 
  onAnswer, 
  userAnswer, 
  showHelp 
}: {
  slide: any;
  stepIndex: number;
  onAnswer: (stepIndex: number, selectedOption: number, isCorrect: boolean) => void;
  userAnswer?: number;
  showHelp?: boolean;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            Slide {stepIndex + 1}
          </Badge>
          {slide.type === 'question' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Quiz
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Conteúdo principal - melhorado para preservar quebras de linha */}
        {slide.content && (
          <div className="prose prose-sm max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {slide.content}
            </div>
          </div>
        )}

        {/* Card 1 */}
        {slide.card1 && (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{slide.card1.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-600 whitespace-pre-line">{slide.card1.content}</div>
            </CardContent>
          </Card>
        )}

        {/* Card 2 com imagem otimizada */}
        {slide.card2 && (
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{slide.card2.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-gray-600 whitespace-pre-line">{slide.card2.content}</div>
              
              {/* Imagem otimizada */}
              {slide.card2.imageUrl && !imageError && (
                <div className="relative">
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  )}
                  <Image
                    src={slide.card2.imageUrl}
                    alt={slide.card2.title}
                    width={500}
                    height={300}
                    className={`w-full h-auto object-cover rounded-lg transition-opacity duration-300 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading="lazy"
                    style={{ 
                      aspectRatio: '1350/1080',
                      width: 'auto',
                      height: 'auto',
                      maxHeight: '300px'
                    }}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                </div>
              )}

              {/* Questão de múltipla escolha - usando componente interativo */}
              {slide.card2.options && (
                <InteractiveQuestionCard
                  question={slide.card2.title}
                  options={slide.card2.options}
                  correctOption={slide.card2.correctOption || 0}
                  onAnswer={(selected, isCorrect) => onAnswer(stepIndex, selected, isCorrect)}
                  showHelp={showHelp}
                  helpMessage={slide.card2.helpMessage}
                  correctAnswer={slide.card2.correctAnswer}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Questão direta - usando componente interativo */}
        {slide.question && slide.options && (
          <InteractiveQuestionCard
            question={slide.question}
            options={slide.options}
            correctOption={slide.correctOption || 0}
            onAnswer={(selected, isCorrect) => onAnswer(stepIndex, selected, isCorrect)}
            showHelp={showHelp}
            helpMessage={slide.helpMessage}
            correctAnswer={slide.correctAnswer}
          />
        )}
      </CardContent>
    </Card>
  );
});

OptimizedSlideCard.displayName = 'OptimizedSlideCard';

// Componente de navegação otimizado
const OptimizedNavigation = React.memo(({ 
  canGoPrevious, 
  canGoNext, 
  onPrevious, 
  onNext, 
  isGeneratingNext,
  currentStep,
  totalSteps 
}: {
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  isGeneratingNext: boolean;
  currentStep: number;
  totalSteps: number;
}) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <Button
      variant="outline"
      onClick={onPrevious}
      disabled={!canGoPrevious}
      className="flex items-center gap-2"
    >
      <ChevronLeft className="h-4 w-4" />
      Anterior
    </Button>

    <div className="flex items-center gap-4">
      <Badge variant="outline" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {currentStep + 1} de {totalSteps}
      </Badge>
      
      {isGeneratingNext && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Gerando...
        </Badge>
      )}
    </div>

    <Button
      onClick={onNext}
      disabled={!canGoNext || isGeneratingNext}
      className="flex items-center gap-2"
    >
      Próximo
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>
));

OptimizedNavigation.displayName = 'OptimizedNavigation';

export default function EnhancedLessonModule({ 
  initialQuery = "", 
  onLessonComplete,
  className = ""
}: EnhancedLessonModuleProps) {
  const [query, setQuery] = useState(initialQuery);
  const [subject, setSubject] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const { lesson, error: generationError, generateLesson, generateMockLesson, clearLesson } = useLessonGeneration();
  const { loadingState, startLoading, updateProgress, finishLoading, stopLoading } = useLessonLoading();
  const { start: startGlobalLoading, end: endGlobalLoading } = useLoading();
  const { 
    lessonState, 
    goNext, 
    goPrevious, 
    recordAnswer, 
    toggleHelp, 
    restartLesson,
    updateTimeSpent 
  } = useLessonState(lesson);
  
  // Hook para carregamento progressivo dos slides
  const progressiveLoading = useProfessorProgressiveLoading();
  
  // Hook para navegação por teclado e fullscreen
  const fullscreen = useFullscreen();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Processar slides para seguir padrão HubEdu de 8 slides
  const processedLesson = useMemo(() => {
    if (!lesson) return null;
    return {
      ...lesson,
      steps: processSlidesForHubEduPattern(lesson.steps)
    };
  }, [lesson]);

  // Memoized values - usar slides carregados progressivamente se disponível
  const currentStep = useMemo(() => {
    if (!processedLesson) return null;
    // Usar slides carregados progressivamente se disponível
    const availableSlides = progressiveLoading.getAvailableSlides();
    if (availableSlides.length > 0 && lessonState.currentStep < availableSlides.length) {
      return availableSlides[lessonState.currentStep];
    }
    return processedLesson.steps[lessonState.currentStep];
  }, [processedLesson, lessonState.currentStep, progressiveLoading]);

  const canGoPrevious = useMemo(() => lessonState.currentStep > 0, [lessonState.currentStep]);
  const canGoNext = useMemo(() => {
    const availableSlides = progressiveLoading.getAvailableSlides();
    // Permitir navegação até o slide 8 (índice 7) quando usando slides progressivos
    if (availableSlides.length > 0) {
      return !progressiveLoading.loadingState.isGeneratingNext && 
             lessonState.currentStep < 7;
    }
    return processedLesson && lessonState.currentStep < processedLesson.steps.length - 1;
  }, [lessonState.currentStep, progressiveLoading, processedLesson]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    try {
      setError('');
      // Start global loading immediately with lesson-specific message
      startGlobalLoading('lesson-generation', {
        message: '🎓 Gerando sua aula interativa...',
        estimatedDuration: 15000, // 15 segundos estimados
        cancelable: false
      });
      
      // Detect subject quickly
      const detectedSubject = await detectSubject(query);
      setSubject(detectedSubject || 'Geral');
      
      // Start progressive loading with initial slides
      await progressiveLoading.startProgressiveLoading(
        query, 
        detectedSubject || 'Geral'
      );
      
      // Finalizar loading global quando a aula estiver pronta
      endGlobalLoading('lesson-generation');
    } catch (error) {
      console.error('Erro ao gerar aula:', error);
      setError('Erro ao gerar aula. Tente novamente.');
      endGlobalLoading('lesson-generation');
    }
  }, [query, progressiveLoading, startGlobalLoading, endGlobalLoading]);

  // Auto-start se houver query inicial
  useEffect(() => {
    if (initialQuery && initialQuery.trim() && !lesson) {
      setQuery(initialQuery);
      handleSubmit();
    }
  }, [initialQuery, lesson, handleSubmit]);

  // Detectar assunto automaticamente
  useEffect(() => {
    if (query.trim()) {
      detectSubject(query).then(setSubject).catch(() => setSubject('Geral'));
    }
  }, [query]);

  const handleGoNext = useCallback(async () => {
    const availableSlides = progressiveLoading.getAvailableSlides();
    
    // Se não há próximo slide carregado, carregar sob demanda
    if (lessonState.currentStep >= availableSlides.length - 1) {
      try {
        await progressiveLoading.loadNextSlide(
          query, 
          subject || 'Geral', 
          lessonState.currentStep
        );
      } catch (error) {
        console.error('Erro ao carregar próximo slide:', error);
        setError('Erro ao carregar próximo slide. Tente novamente.');
        return;
      }
    }
    
    // Ir para o próximo slide
    goNext();
  }, [lessonState.currentStep, progressiveLoading, query, subject, goNext]);
  
  // Hook para navegação por teclado
  useKeyboardNavigation({
    onNext: handleGoNext,
    onPrevious: goPrevious,
    onFullscreen: () => fullscreen.toggleFullscreen(containerRef.current || undefined),
    onExitFullscreen: fullscreen.exitFullscreen,
    canGoNext: canGoNext ?? false,
    canGoPrevious: canGoPrevious ?? false,
    isFullscreen: fullscreen.isFullscreen,
    disabled: loadingState.isLoading || progressiveLoading.loadingState.isGeneratingNext
  });

  const handleAnswer = useCallback((stepIndex: number, selectedOption: number, isCorrect: boolean) => {
    recordAnswer(stepIndex, selectedOption, isCorrect);
    
    // Add achievement if perfect score
    if (isCorrect && lessonState.correctAnswers + 1 === lessonState.totalQuestions) {
      // Achievement logic here
    }
  }, [recordAnswer, lessonState.correctAnswers, lessonState.totalQuestions]);

  const handleRestart = useCallback(() => {
    clearLesson();
    setQuery('');
    setError('');
    progressiveLoading.stopLoading();
  }, [clearLesson, progressiveLoading]);

  // Carregamento automático do próximo slide quando o usuário está navegando
  useEffect(() => {
    const availableSlides = progressiveLoading.getAvailableSlides();
    
    // Se o usuário está no último slide disponível e há mais slides para carregar
    if (lessonState.currentStep >= availableSlides.length - 1 && 
        availableSlides.length < 8 && 
        !progressiveLoading.loadingState.isGeneratingNext) {
      
      // Carregar próximo slide em background
      setTimeout(() => {
        progressiveLoading.loadNextSlide(
          query, 
          subject || 'Geral', 
          lessonState.currentStep
        ).catch(error => {
          console.error('Erro no carregamento automático:', error);
        });
      }, 1000); // Delay para não interferir na navegação
    }
  }, [lessonState.currentStep, progressiveLoading, query, subject]);

  // Se não há aula carregada, mostrar formulário
  if (!lesson && !progressiveLoading.loadingState.isLoading) {
    return (
      <div className={`w-full max-w-2xl mx-auto p-6 ${className}`}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-500" />
              Professor Interativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="query" className="block text-sm font-medium mb-2">
                  Sobre o que você gostaria de aprender?
                </label>
                <Input
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ex: Como funciona a fotossíntese?"
                  className="w-full"
                  disabled={loadingState.isLoading}
                />
              </div>
              
              {subject && (
                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                  <Target className="h-3 w-3" />
                  {subject}
                </Badge>
              )}
              
              <Button 
                type="submit" 
                disabled={!query.trim() || loadingState.isLoading}
                className="w-full"
              >
                {loadingState.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Gerando aula...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Começar aula
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se está carregando, mostrar tela de loading
  if (loadingState.isLoading || progressiveLoading.loadingState.isLoading) {
    return (
      <div className={`w-full max-w-4xl mx-auto p-6 ${className}`}>
        <OptimizedLoadingScreen 
          progress={loadingState.progress}
          message={loadingState.message || progressiveLoading.loadingState.message}
          isGeneratingNext={progressiveLoading.loadingState.isGeneratingNext}
        />
      </div>
    );
  }

  // Se há erro, mostrar mensagem de erro
  if (error || generationError) {
    return (
      <div className={`w-full max-w-2xl mx-auto p-6 ${className}`}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || generationError}
          </AlertDescription>
        </Alert>
        <Button onClick={handleRestart} className="mt-4">
          <RotateCcw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  // Se não há slide atual, mostrar mensagem
  if (!currentStep) {
    return (
      <div className={`w-full max-w-2xl mx-auto p-6 ${className}`}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhum slide disponível. Tente gerar uma nova aula.
          </AlertDescription>
        </Alert>
        <Button onClick={handleRestart} className="mt-4">
          <RotateCcw className="h-4 w-4 mr-2" />
          Nova aula
        </Button>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`w-full max-w-6xl mx-auto p-6 space-y-6 ${className} ${
        fullscreen.isFullscreen ? 'fixed inset-0 z-50 bg-white overflow-auto' : ''
      }`}
    >
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-500" />
            {lesson?.title || 'Aula Interativa'}
          </h1>
          {subject && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {subject}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fullscreen.toggleFullscreen(containerRef.current || undefined)}
          >
            {fullscreen.isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progresso da aula</span>
          <span>{lessonState.currentStep + 1} de {progressiveLoading.getAvailableSlides().length}</span>
        </div>
        <Progress 
          value={(lessonState.currentStep + 1) / progressiveLoading.getAvailableSlides().length * 100} 
          className="h-2"
        />
      </div>

      {/* Slide atual com integração Unsplash */}
      <UnsplashSlideCard
        slide={currentStep}
        stepIndex={lessonState.currentStep}
        onAnswer={handleAnswer}
        userAnswer={lessonState.userAnswers[lessonState.currentStep] as number | undefined}
        showHelp={lessonState.showHelp[lessonState.currentStep]}
      />

      {/* Navegação */}
      <OptimizedNavigation
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext ?? false}
        onPrevious={goPrevious}
        onNext={handleGoNext}
        isGeneratingNext={progressiveLoading.loadingState.isGeneratingNext}
        currentStep={lessonState.currentStep}
        totalSteps={progressiveLoading.getAvailableSlides().length}
      />

      {/* Estatísticas */}
      {lessonState.showStats && (
        <LessonStats
          totalQuestions={lessonState.totalQuestions}
          correctAnswers={lessonState.correctAnswers}
          timeSpent={lessonState.timeSpent}
          achievements={lessonState.achievements}
          score={Math.round((lessonState.correctAnswers / lessonState.totalQuestions) * 100)}
          showStats={lessonState.showStats}
        />
      )}
    </div>
  );
}
