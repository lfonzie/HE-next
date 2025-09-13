"use client";

import { useState, useCallback } from 'react';

interface InteractiveStep {
  type: 'explanation' | 'question' | 'example' | 'feedback';
  content: string;
  question?: string;
  expectedAnswer?: string;
  helpMessage?: string;
  correctAnswer?: string;
  options?: string[];
  correctOption?: number;
}

interface InteractiveLesson {
  title: string;
  subject: string;
  introduction: string;
  steps: InteractiveStep[];
  finalTest: {
    question: string;
    expectedAnswer: string;
    helpMessage: string;
    correctAnswer: string;
    options?: string[];
    correctOption?: number;
  };
  summary: string;
  nextSteps: string[];
}

interface LessonState {
  currentStep: number;
  userAnswers: { [key: number]: string | number | undefined; final?: number };
  showHelp: { [key: number]: boolean; final?: boolean };
  completed: boolean;
  score: number;
  showNavigationButtons: { [key: number]: boolean };
  currentQuestionIndex: { [key: number]: number };
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  startTime: number;
  showStats: boolean;
  achievements: string[];
  questionTimer: { [key: number]: number };
  currentQuestionStartTime: number;
}

export function useLessonState(lesson: InteractiveLesson | null) {
  const [lessonState, setLessonState] = useState<LessonState>({
    currentStep: 0,
    userAnswers: {},
    showHelp: {},
    completed: false,
    score: 0,
    showNavigationButtons: {},
    currentQuestionIndex: {},
    totalQuestions: lesson?.steps.filter(step => step.type === 'question').length || 0,
    correctAnswers: 0,
    timeSpent: 0,
    startTime: Date.now(),
    showStats: false,
    achievements: [],
    questionTimer: {},
    currentQuestionStartTime: Date.now()
  });

  const goNext = useCallback(() => {
    if (!lesson) return;
    
    setLessonState(prev => {
      const nextStep = prev.currentStep + 1;
      const isLastStep = nextStep >= lesson.steps.length;
      
      return {
        ...prev,
        currentStep: isLastStep ? prev.currentStep : nextStep,
        completed: isLastStep,
        showStats: isLastStep,
        showNavigationButtons: {
          ...prev.showNavigationButtons,
          [prev.currentStep]: false
        }
      };
    });
  }, [lesson]);

  const goPrevious = useCallback(() => {
    setLessonState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
      showNavigationButtons: {
        ...prev.showNavigationButtons,
        [prev.currentStep]: false
      }
    }));
  }, []);

  const recordAnswer = useCallback((stepIndex: number, answer: string | number, isCorrect: boolean) => {
    setLessonState(prev => {
      const newCorrectAnswers = isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers;
      const newScore = Math.round((newCorrectAnswers / prev.totalQuestions) * 100);
      
      return {
        ...prev,
        userAnswers: {
          ...prev.userAnswers,
          [stepIndex]: answer
        },
        correctAnswers: newCorrectAnswers,
        score: newScore,
        showNavigationButtons: {
          ...prev.showNavigationButtons,
          [stepIndex]: true
        }
      };
    });
  }, []);

  const toggleHelp = useCallback((stepIndex: number) => {
    setLessonState(prev => ({
      ...prev,
      showHelp: {
        ...prev.showHelp,
        [stepIndex]: !prev.showHelp[stepIndex]
      }
    }));
  }, []);

  const restartLesson = useCallback(() => {
    setLessonState({
      currentStep: 0,
      userAnswers: {},
      showHelp: {},
      completed: false,
      score: 0,
      showNavigationButtons: {},
      currentQuestionIndex: {},
      totalQuestions: lesson?.steps.filter(step => step.type === 'question').length || 0,
      correctAnswers: 0,
      timeSpent: 0,
      startTime: Date.now(),
      showStats: false,
      achievements: [],
      questionTimer: {},
      currentQuestionStartTime: Date.now()
    });
  }, [lesson]);

  const updateTimeSpent = useCallback((time: number) => {
    setLessonState(prev => ({
      ...prev,
      timeSpent: time
    }));
  }, []);

  const addAchievement = useCallback((achievement: string) => {
    setLessonState(prev => ({
      ...prev,
      achievements: [...prev.achievements, achievement]
    }));
  }, []);

  return {
    lessonState,
    goNext,
    goPrevious,
    recordAnswer,
    toggleHelp,
    restartLesson,
    updateTimeSpent,
    addAchievement
  };
}
