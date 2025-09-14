"use client";

import React, { useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Play, RotateCcw } from 'lucide-react';

import { useLessonState } from '../hooks/useLessonState';
import { useLessonLoading } from '../hooks/useLessonLoading';
import { useLessonGeneration } from '../hooks/useLessonGeneration';
import { processSlidesForHubEduPattern } from '@/utils/professor-interactive/buildSlides';
import { useProfessorProgressiveLoading } from '@/hooks/useProfessorProgressiveLoading';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useFullscreen } from '@/hooks/useFullscreen';

import LessonHeader from './LessonHeader';
import LessonProgress from './LessonProgress';
import LessonLoadingScreen from './LessonLoadingScreen';
import LessonStats from './LessonStats';
import LessonControls from './LessonControls';
import QuestionCard from '../quiz/QuestionCard';

interface RefactoredLessonModuleProps {
  initialQuery?: string;
  onLessonComplete?: () => void;
}

export default function RefactoredLessonModule({ 
  initialQuery = "", 
  onLessonComplete 
}: RefactoredLessonModuleProps) {
  const [query, setQuery] = React.useState(initialQuery);
  
  const { lesson, error, generateLesson, generateMockLesson, clearLesson } = useLessonGeneration();
  const { loadingState, startLoading, updateProgress, finishLoading, stopLoading } = useLessonLoading();
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

  // Memoized values - usar slides processados
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
    if (!processedLesson) return false;
    const availableSlides = progressiveLoading.getAvailableSlides();
    const currentIndex = lessonState.currentStep;
    
    // Pode ir para próximo se não estiver gerando e houver próximo slide disponível
    return !progressiveLoading.loadingState.isGeneratingNext && 
           (currentIndex < availableSlides.length - 1 || currentIndex < 7);
  }, [processedLesson, lessonState.currentStep, progressiveLoading]);
  
  // Função para navegação para o próximo slide
  const handleGoNext = useCallback(async () => {
    const availableSlides = progressiveLoading.getAvailableSlides();
    const currentSlideIndex = lessonState.currentStep;
    const nextSlideIndex = currentSlideIndex + 1;
    
    console.log('🔄 handleGoNext:', {
      currentSlideIndex,
      nextSlideIndex,
      availableSlides: availableSlides.length,
      isGenerating: progressiveLoading.loadingState.isGeneratingNext,
      totalSlides: 8
    });
    
    // Se o próximo slide não existe ainda, carregar automaticamente
    if (nextSlideIndex >= availableSlides.length && nextSlideIndex < 8) {
      console.log('📥 Carregando próximo slide automaticamente:', nextSlideIndex + 1);
      
      // Mostrar indicador de carregamento
      startLoading(`Gerando slide ${nextSlideIndex + 1}...`);
      
      try {
        await progressiveLoading.loadNextSlide(
          query, 
          lesson?.subject || 'Geral',
          currentSlideIndex
        );
        finishLoading();
        console.log('✅ Slide carregado com sucesso:', nextSlideIndex + 1);
      } catch (error) {
        console.error('❌ Erro ao carregar slide:', error);
        stopLoading();
        return; // Não navegar se houver erro
      }
    }
    
    // Ir para o próximo slide
    goNext();
  }, [lessonState.currentStep, progressiveLoading, query, lesson, goNext, startLoading, finishLoading, stopLoading]);
  
  // Hook para navegação por teclado
  useKeyboardNavigation({
    onNext: handleGoNext,
    onPrevious: goPrevious,
    onFullscreen: () => fullscreen.toggleFullscreen(containerRef.current || undefined),
    onExitFullscreen: fullscreen.exitFullscreen,
    canGoNext,
    canGoPrevious,
    isFullscreen: fullscreen.isFullscreen,
    disabled: loadingState.isLoading || progressiveLoading.loadingState.isGeneratingNext
  });

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    try {
      // Start loading immediately
      startLoading('Gerando aula interativa...');
      
      // Generate lesson (this will take the actual API time)
      const generatedLesson = await generateLesson(query);
      
      // Complete initial loading
      finishLoading();
      
      // Start progressive loading with initial slides
      if (generatedLesson) {
        await progressiveLoading.startProgressiveLoading(
          query, 
          generatedLesson.subject || 'Geral',
          generatedLesson.themeImage
        );
      }
    } catch (error) {
      console.error('Erro ao gerar aula:', error);
      stopLoading();
    }
  }, [query, startLoading, finishLoading, generateLesson, stopLoading, progressiveLoading]);

  const handleAnswer = (stepIndex: number, selectedOption: number, isCorrect: boolean) => {
    recordAnswer(stepIndex, selectedOption, isCorrect);
    
    // Add achievement if perfect score
    if (isCorrect && lessonState.correctAnswers + 1 === lessonState.totalQuestions) {
      // Achievement logic here
    }
  };


  // Carregamento automático do próximo slide quando o usuário está navegando
  useEffect(() => {
    const availableSlides = progressiveLoading.getAvailableSlides();
    const currentSlideIndex = lessonState.currentStep;
    const nextSlideIndex = currentSlideIndex + 1;
    
    // Carregar automaticamente o próximo slide se:
    // 1. Não está gerando um slide no momento
    // 2. O próximo slide não existe ainda
    // 3. Não é o último slide (máximo 8)
    // 4. Temos pelo menos 2 slides carregados (para evitar carregamento prematuro)
    if (
      !progressiveLoading.loadingState.isGeneratingNext &&
      nextSlideIndex >= availableSlides.length &&
      nextSlideIndex < 8 &&
      availableSlides.length >= 2
    ) {
      console.log(`🚀 Carregamento automático: usuário está no slide ${currentSlideIndex + 1}, carregando slide ${nextSlideIndex + 1}...`);
      
      const loadNextSlideAsync = async () => {
        try {
          await progressiveLoading.loadNextSlide(
            query, 
            lesson?.subject || 'Geral',
            currentSlideIndex
          );
          console.log(`✅ Slide ${nextSlideIndex + 1} carregado automaticamente`);
        } catch (error) {
          console.error('❌ Erro no carregamento automático:', error);
        }
      };
      
      loadNextSlideAsync();
    }
  }, [lessonState.currentStep, progressiveLoading, query, lesson]);

  const handleLessonComplete = useCallback(() => {
    if (onLessonComplete) {
      onLessonComplete();
    }
  }, [onLessonComplete]);

  // Auto-start if initial query provided
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setQuery(initialQuery);
      handleSubmit();
    }
  }, [initialQuery, handleSubmit]);

  // Update time spent
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lessonState.startTime) / 1000);
      updateTimeSpent(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [lessonState.startTime, updateTimeSpent]);

  // Handle lesson completion
  useEffect(() => {
    if (lessonState.completed) {
      handleLessonComplete();
    }
  }, [lessonState.completed, handleLessonComplete]);

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Professor Interativo - Aulas Expandidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Digite sua pergunta para gerar uma aula interativa..."
                  className="w-full"
                  disabled={loadingState.isLoading}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={loadingState.isLoading || !query.trim()}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  {loadingState.isLoading ? 'Gerando aula...' : 'Gerar Aula Interativa'}
                </Button>
                
                {lesson && (
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      clearLesson();
                      setQuery('');
                    }}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Nova Aula
                  </Button>
                )}
              </div>
            </form>
            
            {error && (
              <Alert className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <LessonLoadingScreen
          progress={progressiveLoading.loadingState.isLoading ? progressiveLoading.loadingState.progress : loadingState.progress}
          message={progressiveLoading.loadingState.isLoading ? progressiveLoading.loadingState.message : loadingState.message}
          isLoading={loadingState.isLoading || progressiveLoading.loadingState.isLoading}
          elapsedTime={progressiveLoading.loadingState.isLoading ? progressiveLoading.loadingState.elapsedTime : loadingState.elapsedTime}
          formattedTime={progressiveLoading.loadingState.isLoading ? progressiveLoading.loadingState.formattedTime : loadingState.formattedTime}
        />
        
        {/* Mostrar mensagem quando está gerando próximo slide */}
        {progressiveLoading.loadingState.isGeneratingNext && (
          <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              {progressiveLoading.loadingState.message}
            </div>
          </div>
        )}

        {processedLesson && (
          <>
            <LessonHeader
              title={processedLesson.title}
              subject={processedLesson.subject}
              totalSteps={processedLesson.steps.length}
              currentStep={lessonState.currentStep}
              timeSpent={lessonState.timeSpent}
              score={lessonState.score}
              achievements={lessonState.achievements}
            />

            <LessonProgress
              currentStep={lessonState.currentStep}
              totalSteps={processedLesson.steps.length}
              className="mb-6"
            />

            {currentStep && (
              <div className="mb-6">
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Slide {lessonState.currentStep + 1} de 8: {currentStep.type === 'question' ? 'Pergunta' : 'Conteúdo'}
                    </CardTitle>
                  </CardHeader>
                </Card>
                
                {/* Layout de 2 cards lado a lado */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Card 1 */}
                  <Card className="h-fit">
                    <CardHeader>
                      <CardTitle className="text-base">
                        {currentStep.card1?.title || (currentStep.type === 'question' ? 'Pergunta' : 'Conteúdo Principal')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <p className="text-sm leading-relaxed">
                          {currentStep.card1?.content || currentStep.content || 'Conteúdo do primeiro card'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 2 */}
                  <Card className="h-fit">
                    <CardHeader>
                      <CardTitle className="text-base">
                        {currentStep.card2?.title || (currentStep.type === 'question' ? 'Opções de Resposta' : 'Detalhes Adicionais')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Mostrar imagem nos slides 1 e 8 */}
                      {(lessonState.currentStep === 0 || lessonState.currentStep === 7) && (currentStep.card2?.imageUrl || lesson?.themeImage) && (
                        <div className="mb-4">
                          <img
                            src={currentStep.card2?.imageUrl || lesson?.themeImage}
                            alt={lesson?.title || 'Imagem da aula'}
                            className="w-full object-cover rounded-lg shadow-md"
                            style={{ 
                              aspectRatio: '1350/1080',
                              height: 'auto',
                              maxHeight: '300px'
                            }}
                            loading="lazy"
                          />
                        </div>
                      )}
                      
                      <div className="prose max-w-none">
                        <p className="text-sm leading-relaxed">
                          {currentStep.card2?.content || 'Conteúdo do segundo card'}
                        </p>
                      </div>
                      
                      {/* Para slides de pergunta, mostrar opções */}
                      {currentStep.type === 'question' && currentStep.card2?.options && (
                        <div className="mt-4">
                          <QuestionCard
                            question={currentStep.card1?.content || currentStep.question || 'Pergunta de verificação'}
                            options={currentStep.card2.options}
                            correctOption={currentStep.card2.correctOption ?? 0}
                            helpMessage={currentStep.card2.helpMessage}
                            correctAnswer={currentStep.card2.correctAnswer}
                            onAnswer={(selectedOption, isCorrect) => 
                              handleAnswer(lessonState.currentStep, selectedOption, isCorrect)
                            }
                            showHelp={lessonState.showHelp[lessonState.currentStep] || false}
                            onToggleHelp={() => toggleHelp(lessonState.currentStep)}
                            disabled={lessonState.userAnswers[lessonState.currentStep] !== undefined}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <LessonStats
              totalQuestions={lessonState.totalQuestions}
              correctAnswers={lessonState.correctAnswers}
              timeSpent={lessonState.timeSpent}
              score={lessonState.score}
              achievements={lessonState.achievements}
              showStats={lessonState.showStats}
            />

            <LessonControls
              currentStep={lessonState.currentStep}
              totalSteps={processedLesson.steps.length}
              onPrevious={goPrevious}
              onNext={handleGoNext}
              onRestart={restartLesson}
              onToggleFullscreen={() => fullscreen.toggleFullscreen(containerRef.current || undefined)}
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
              isCompleted={lessonState.completed}
              isFullscreen={fullscreen.isFullscreen}
              isFullscreenSupported={fullscreen.isSupported}
              showNavigationButtons={lessonState.showNavigationButtons}
            />
          </>
        )}
      </div>
    </div>
  );
}
