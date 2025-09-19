import { useState, useCallback, useMemo, useEffect } from 'react';

export interface OptimizedLessonState {
  currentStep: number;
  userAnswers: Record<number, number>;
  showHelp: Record<number, boolean>;
  completed: boolean;
  score: number;
  showNavigationButtons: Record<number, boolean>;
  currentQuestionIndex: Record<number, number>;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  startTime: number;
  showStats: boolean;
  achievements: string[];
  questionTimer: Record<number, number>;
  currentQuestionStartTime: number;
  // Novos campos otimizados
  slideProgress: Record<number, boolean>;
  lastInteractionTime: number;
  sessionId: string;
  performanceMetrics: {
    averageResponseTime: number;
    accuracyRate: number;
    engagementScore: number;
  };
}

export interface OptimizedLessonActions {
  goNext: () => void;
  goPrevious: () => void;
  goToStep: (step: number) => void;
  recordAnswer: (stepIndex: number, selectedOption: number, isCorrect: boolean) => void;
  toggleHelp: (stepIndex: number) => void;
  restartLesson: () => void;
  updateTimeSpent: (timeSpent: number) => void;
  markSlideComplete: (stepIndex: number) => void;
  updatePerformanceMetrics: (metrics: Partial<OptimizedLessonState['performanceMetrics']>) => void;
}

export function useOptimizedLessonState(lesson: any): [OptimizedLessonState, OptimizedLessonActions] {
  const [state, setState] = useState<OptimizedLessonState>({
    currentStep: 0,
    userAnswers: {},
    showHelp: {},
    completed: false,
    score: 0,
    showNavigationButtons: {},
    currentQuestionIndex: {},
    totalQuestions: 0,
    correctAnswers: 0,
    timeSpent: 0,
    startTime: typeof window !== 'undefined' ? Date.now() : 0,
    showStats: false,
    achievements: [],
    questionTimer: {},
    currentQuestionStartTime: typeof window !== 'undefined' ? Date.now() : 0,
    slideProgress: {},
    lastInteractionTime: typeof window !== 'undefined' ? Date.now() : 0,
    sessionId: `session_${typeof window !== 'undefined' ? Date.now() : 0}_${typeof window !== 'undefined' ? Math.random().toString(36).substr(2, 9) : 'server'}`,
    performanceMetrics: {
      averageResponseTime: 0,
      accuracyRate: 0,
      engagementScore: 0
    }
  });

  // Calcular métricas de performance automaticamente
  const calculatePerformanceMetrics = useCallback(() => {
    const totalAnswers = Object.keys(state.userAnswers).length;
    const correctAnswers = state.correctAnswers;
    const accuracyRate = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    
    const totalTime = state.timeSpent;
    const averageResponseTime = totalAnswers > 0 ? totalTime / totalAnswers : 0;
    
    // Calcular engagement score baseado em interações e tempo
    const engagementScore = Math.min(100, 
      (accuracyRate * 0.4) + 
      (Math.min(totalAnswers / 8, 1) * 30) + 
      (Math.min(state.timeSpent / 300, 1) * 30)
    );

    return {
      averageResponseTime,
      accuracyRate,
      engagementScore
    };
  }, [state.userAnswers, state.correctAnswers, state.timeSpent]);

  // Atualizar métricas automaticamente
  useEffect(() => {
    const metrics = calculatePerformanceMetrics();
    setState(prev => ({
      ...prev,
      performanceMetrics: metrics
    }));
  }, [calculatePerformanceMetrics]);

  const goNext = useCallback(() => {
    setState(prev => {
      const nextStep = prev.currentStep + 1;
      const maxSteps = lesson?.steps?.length || 8;
      
      return {
        ...prev,
        currentStep: Math.min(nextStep, maxSteps - 1),
        lastInteractionTime: Date.now(),
        completed: nextStep >= maxSteps
      };
    });
  }, [lesson]);

  const goPrevious = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
      lastInteractionTime: Date.now()
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(step, (lesson?.steps?.length || 8) - 1)),
      lastInteractionTime: Date.now()
    }));
  }, [lesson]);

  const recordAnswer = useCallback((stepIndex: number, selectedOption: number, isCorrect: boolean) => {
    setState(prev => {
      const newUserAnswers = { ...prev.userAnswers, [stepIndex]: selectedOption };
      const newCorrectAnswers = prev.correctAnswers + (isCorrect ? 1 : 0);
      const newTotalQuestions = prev.totalQuestions + 1;
      
      // Calcular novo score
      const newScore = newTotalQuestions > 0 ? (newCorrectAnswers / newTotalQuestions) * 100 : 0;
      
      // Adicionar achievement se necessário
      const newAchievements = [...prev.achievements];
      if (isCorrect && newScore === 100 && newTotalQuestions >= 3) {
        newAchievements.push('Perfeição');
      }
      if (newCorrectAnswers === 5) {
        newAchievements.push('Cinco acertos');
      }
      
      return {
        ...prev,
        userAnswers: newUserAnswers,
        correctAnswers: newCorrectAnswers,
        totalQuestions: newTotalQuestions,
        score: newScore,
        achievements: newAchievements,
        lastInteractionTime: Date.now()
      };
    });
  }, []);

  const toggleHelp = useCallback((stepIndex: number) => {
    setState(prev => ({
      ...prev,
      showHelp: {
        ...prev.showHelp,
        [stepIndex]: !prev.showHelp[stepIndex]
      },
      lastInteractionTime: Date.now()
    }));
  }, []);

  const restartLesson = useCallback(() => {
    setState({
      currentStep: 0,
      userAnswers: {},
      showHelp: {},
      completed: false,
      score: 0,
      showNavigationButtons: {},
      currentQuestionIndex: {},
      totalQuestions: 0,
      correctAnswers: 0,
      timeSpent: 0,
      startTime: Date.now(),
      showStats: false,
      achievements: [],
      questionTimer: {},
      currentQuestionStartTime: Date.now(),
      slideProgress: {},
      lastInteractionTime: Date.now(),
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      performanceMetrics: {
        averageResponseTime: 0,
        accuracyRate: 0,
        engagementScore: 0
      }
    });
  }, []);

  const updateTimeSpent = useCallback((timeSpent: number) => {
    setState(prev => ({
      ...prev,
      timeSpent,
      lastInteractionTime: Date.now()
    }));
  }, []);

  const markSlideComplete = useCallback((stepIndex: number) => {
    setState(prev => ({
      ...prev,
      slideProgress: {
        ...prev.slideProgress,
        [stepIndex]: true
      },
      lastInteractionTime: Date.now()
    }));
  }, []);

  const updatePerformanceMetrics = useCallback((metrics: Partial<OptimizedLessonState['performanceMetrics']>) => {
    setState(prev => ({
      ...prev,
      performanceMetrics: {
        ...prev.performanceMetrics,
        ...metrics
      },
      lastInteractionTime: Date.now()
    }));
  }, []);

  // Memoizar ações para evitar re-renders desnecessários
  const actions = useMemo(() => ({
    goNext,
    goPrevious,
    goToStep,
    recordAnswer,
    toggleHelp,
    restartLesson,
    updateTimeSpent,
    markSlideComplete,
    updatePerformanceMetrics
  }), [
    goNext,
    goPrevious,
    goToStep,
    recordAnswer,
    toggleHelp,
    restartLesson,
    updateTimeSpent,
    markSlideComplete,
    updatePerformanceMetrics
  ]);

  return [state, actions];
}
