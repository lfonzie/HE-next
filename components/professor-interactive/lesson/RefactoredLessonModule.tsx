"use client";

import React, { useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Play, RotateCcw } from 'lucide-react';

import { useLessonState } from '../hooks/useLessonState';
import { useLessonLoading } from '../hooks/useLessonLoading';
import { useLessonGeneration } from '../hooks/useLessonGeneration';

import LessonHeader from './LessonHeader';
import LessonProgress from './LessonProgress';
import LessonLoadingScreen from './LessonLoadingScreen';
import LessonStats from './LessonStats';
import LessonNavigation from './LessonNavigation';
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
  const { loadingState, simulateProgress, stopLoading } = useLessonLoading();
  const { 
    lessonState, 
    goNext, 
    goPrevious, 
    recordAnswer, 
    toggleHelp, 
    restartLesson,
    updateTimeSpent 
  } = useLessonState(lesson);

  // Memoized values
  const currentStep = useMemo(() => {
    if (!lesson) return null;
    return lesson.steps[lessonState.currentStep];
  }, [lesson, lessonState.currentStep]);

  const canGoPrevious = useMemo(() => lessonState.currentStep > 0, [lessonState.currentStep]);
  const canGoNext = useMemo(() => {
    if (!lesson) return false;
    return lessonState.currentStep < lesson.steps.length - 1;
  }, [lesson, lessonState.currentStep]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    try {
      // Start loading simulation
      await simulateProgress([
        { progress: 10, message: 'Analisando conteúdo...', delay: 1000 },
        { progress: 30, message: 'Gerando aula interativa...', delay: 1500 },
        { progress: 60, message: 'Criando exercícios...', delay: 1000 },
        { progress: 90, message: 'Finalizando...', delay: 500 }
      ]);

      // Generate lesson
      await generateLesson(query);
    } catch (error) {
      console.error('Erro ao gerar aula:', error);
      stopLoading();
    }
  }, [query, simulateProgress, generateLesson, stopLoading]);

  const handleAnswer = (stepIndex: number, selectedOption: number, isCorrect: boolean) => {
    recordAnswer(stepIndex, selectedOption, isCorrect);
    
    // Add achievement if perfect score
    if (isCorrect && lessonState.correctAnswers + 1 === lessonState.totalQuestions) {
      // Achievement logic here
    }
  };

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
    <div className="min-h-screen bg-gray-50 p-4">
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
          progress={loadingState.progress}
          message={loadingState.message}
          isLoading={loadingState.isLoading}
        />

        {lesson && (
          <>
            <LessonHeader
              title={lesson.title}
              subject={lesson.subject}
              totalSteps={lesson.steps.length}
              currentStep={lessonState.currentStep}
              timeSpent={lessonState.timeSpent}
              score={lessonState.score}
              achievements={lessonState.achievements}
            />

            <LessonProgress
              currentStep={lessonState.currentStep}
              totalSteps={lesson.steps.length}
              className="mb-6"
            />

            {currentStep && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Passo {lessonState.currentStep + 1}: {currentStep.type}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose max-w-none">
                    <p>{currentStep.content}</p>
                  </div>
                  
                  {currentStep.type === 'question' && currentStep.question && (
                    <QuestionCard
                      question={currentStep.question}
                      options={currentStep.options || []}
                      correctOption={currentStep.correctOption || 0}
                      helpMessage={currentStep.helpMessage}
                      correctAnswer={currentStep.correctAnswer}
                      onAnswer={(selectedOption, isCorrect) => 
                        handleAnswer(lessonState.currentStep, selectedOption, isCorrect)
                      }
                      showHelp={lessonState.showHelp[lessonState.currentStep] || false}
                      onToggleHelp={() => toggleHelp(lessonState.currentStep)}
                      disabled={lessonState.userAnswers[lessonState.currentStep] !== undefined}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            <LessonStats
              totalQuestions={lessonState.totalQuestions}
              correctAnswers={lessonState.correctAnswers}
              timeSpent={lessonState.timeSpent}
              score={lessonState.score}
              achievements={lessonState.achievements}
              showStats={lessonState.showStats}
            />

            <LessonNavigation
              currentStep={lessonState.currentStep}
              totalSteps={lesson.steps.length}
              onPrevious={goPrevious}
              onNext={goNext}
              onRestart={restartLesson}
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
              isCompleted={lessonState.completed}
              showNavigationButtons={lessonState.showNavigationButtons}
            />
          </>
        )}
      </div>
    </div>
  );
}
