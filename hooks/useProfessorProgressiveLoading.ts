"use client";

import { useState, useCallback, useRef, useEffect } from 'react';

interface ProgressiveLoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
  currentStep: string;
  totalSteps: number;
  formattedTime: string;
  isGeneratingNext: boolean;
  loadedSlides: any[];
  loadingState: {
    isLoading: boolean;
    progress: number;
    message: string;
    currentStep: string;
    totalSteps: number;
    formattedTime: string;
    isGeneratingNext: boolean;
    loadedSlides: any[];
  };
}

interface LoadingStep {
  threshold: number;
  message: string;
  duration: number; // em segundos
}

const LOADING_STEPS: LoadingStep[] = [
  { threshold: 0, message: 'Analisando o tópico...', duration: 5 },
  { threshold: 10, message: 'Identificando matéria e série...', duration: 5 },
  { threshold: 20, message: 'Criando objetivos de aprendizagem...', duration: 5 },
  { threshold: 30, message: 'Estruturando os 14 slides...', duration: 8 },
  { threshold: 40, message: 'Gerando conteúdo explicativo...', duration: 8 },
  { threshold: 50, message: 'Criando perguntas interativas...', duration: 6 },
  { threshold: 60, message: 'Buscando imagens no Unsplash...', duration: 5 },
  { threshold: 70, message: 'Verificando imagens no Wiki Commons...', duration: 4 },
  { threshold: 80, message: 'Finalizando estrutura da aula...', duration: 4 },
  { threshold: 90, message: 'Salvando no banco de dados...', duration: 3 },
  { threshold: 95, message: 'Preparando para exibição...', duration: 2 }
];

export const useProfessorProgressiveLoading = () => {
  const [state, setState] = useState<ProgressiveLoadingState>({
    isLoading: false,
    progress: 0,
    message: 'Preparando geração da aula...',
    currentStep: 'Iniciando',
    totalSteps: LOADING_STEPS.length,
    formattedTime: '50s',
    isGeneratingNext: false,
    loadedSlides: [],
    loadingState: {
      isLoading: false,
      progress: 0,
      message: 'Preparando geração da aula...',
      currentStep: 'Iniciando',
      totalSteps: LOADING_STEPS.length,
      formattedTime: '50s',
      isGeneratingNext: false,
      loadedSlides: []
    }
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const formatTime = useCallback((seconds: number): string => {
    if (seconds <= 0) return '0s';
    if (seconds < 60) return `${Math.ceil(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.ceil(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  }, []);

  const updateProgress = useCallback((progress: number, message?: string, currentStep?: string) => {
    const currentTime = Date.now();
    const elapsed = (currentTime - startTimeRef.current) / 1000;
    const remaining = Math.max(0, 50 - elapsed);
    
    setState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      message: message || prev.message,
      currentStep: currentStep || prev.currentStep,
      formattedTime: formatTime(remaining),
      loadingState: {
        ...prev.loadingState,
        progress: Math.min(100, Math.max(0, progress)),
        message: message || prev.message,
        currentStep: currentStep || prev.currentStep,
        formattedTime: formatTime(remaining)
      }
    }));
  }, [formatTime]);

  const startProgressiveLoading = useCallback(async (query: string, subject: string) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      progress: 0,
      message: 'Iniciando geração da aula...',
      currentStep: 'Iniciando',
      formattedTime: '50s',
      isGeneratingNext: false,
      loadedSlides: [],
      loadingState: {
        ...prev.loadingState,
        isLoading: true,
        progress: 0,
        message: 'Iniciando geração da aula...',
        currentStep: 'Iniciando',
        formattedTime: '50s',
        isGeneratingNext: false,
        loadedSlides: []
      }
    }));

    startTimeRef.current = Date.now();
    
    // Simular carregamento progressivo baseado em tempo real
    let currentStepIndex = 0;
    const totalDuration = 50000; // 50 segundos em ms
    const updateInterval = 200; // Atualizar a cada 200ms
    
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(95, (elapsed / totalDuration) * 100);
      
      // Atualizar mensagem baseada no progresso
      const currentStep = LOADING_STEPS.find(step => 
        progress >= step.threshold && 
        progress < (LOADING_STEPS[LOADING_STEPS.indexOf(step) + 1]?.threshold || 100)
      );
      
      if (currentStep && currentStepIndex !== LOADING_STEPS.indexOf(currentStep)) {
        currentStepIndex = LOADING_STEPS.indexOf(currentStep);
        updateProgress(progress, currentStep.message, currentStep.message);
      } else {
        updateProgress(progress);
      }
      
      // Finalizar quando atingir 95%
      if (progress >= 95) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Finalizar com 100%
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            isLoading: false,
            progress: 100,
            message: 'Aula gerada com sucesso!',
            currentStep: 'Concluído',
            formattedTime: '0s',
            loadingState: {
              ...prev.loadingState,
              isLoading: false,
              progress: 100,
              message: 'Aula gerada com sucesso!',
              currentStep: 'Concluído',
              formattedTime: '0s'
            }
          }));
        }, 1000);
      }
    }, updateInterval);

    // Simular chamada real da API
    try {
      const response = await fetch('/api/generate-lesson-professional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          topic: query, 
          subject: subject,
          demoMode: false 
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar aula');
      }

      // Simular slides carregados
      const mockSlides = Array.from({ length: 14 }, (_, i) => ({
        id: `slide_${i + 1}`,
        title: `Slide ${i + 1}`,
        content: `Conteúdo do slide ${i + 1}`,
        type: i === 0 || i === 6 || i === 13 ? 'image' : 'content',
        imageUrl: i === 0 || i === 6 || i === 13 ? `https://picsum.photos/800/400?random=${i + 1}` : null
      }));

      setState(prev => ({
        ...prev,
        loadedSlides: mockSlides,
        loadingState: {
          ...prev.loadingState,
          loadedSlides: mockSlides
        }
      }));

    } catch (error: any) {
      console.error('❌ Erro ao gerar aula:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        message: `Erro: ${error.message}`,
        loadingState: {
          ...prev.loadingState,
          isLoading: false,
          message: `Erro: ${error.message}`
        }
      }));
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [updateProgress]);

  const stopLoading = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isLoading: false,
      progress: 0,
      message: 'Preparando geração da aula...',
      currentStep: 'Iniciando',
      formattedTime: '50s',
      isGeneratingNext: false,
      loadedSlides: [],
      loadingState: {
        ...prev.loadingState,
        isLoading: false,
        progress: 0,
        message: 'Preparando geração da aula...',
        currentStep: 'Iniciando',
        formattedTime: '50s',
        isGeneratingNext: false,
        loadedSlides: []
      }
    }));
  }, []);

  const getAvailableSlides = useCallback(() => {
    return state.loadedSlides;
  }, [state.loadedSlides]);

  const canLoadNextSlide = useCallback((currentSlide: number) => {
    return currentSlide < state.loadedSlides.length - 1;
  }, [state.loadedSlides.length]);

  const loadNextSlide = useCallback(async (query: string, subject: string, slideIndex: number) => {
    setState(prev => ({
      ...prev,
      isGeneratingNext: true,
      loadingState: {
        ...prev.loadingState,
        isGeneratingNext: true
      }
    }));

    // Simular carregamento do próximo slide
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isGeneratingNext: false,
        loadingState: {
          ...prev.loadingState,
          isGeneratingNext: false
        }
      }));
    }, 2000);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isLoading: state.isLoading,
    progress: state.progress,
    message: state.message,
    currentStep: state.currentStep,
    totalSteps: state.totalSteps,
    formattedTime: state.formattedTime,
    isGeneratingNext: state.isGeneratingNext,
    loadedSlides: state.loadedSlides,
    loadingState: state.loadingState,
    startProgressiveLoading,
    stopLoading,
    getAvailableSlides,
    canLoadNextSlide,
    loadNextSlide
  };
};
