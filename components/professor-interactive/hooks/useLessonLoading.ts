"use client";

import { useState, useCallback, useEffect } from 'react';

interface LoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
  startTime: number | null;
  elapsedTime: number;
  formattedTime: string;
}

export function useLessonLoading() {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    message: '',
    startTime: null,
    elapsedTime: 0,
    formattedTime: '0s'
  });

  const startLoading = useCallback((initialMessage: string = 'Iniciando...') => {
    setLoadingState({
      isLoading: true,
      progress: 0,
      message: initialMessage,
      startTime: Date.now(),
      elapsedTime: 0,
      formattedTime: '0s'
    });
  }, []);

  const updateProgress = useCallback((progress: number, message: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      message
    }));
  }, []);

  const finishLoading = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      progress: 100,
      message: 'Aula pronta!'
    }));
    
    // Auto-hide after 150ms for immediate feedback
    setTimeout(() => {
      setLoadingState({
        isLoading: false,
        progress: 0,
        message: '',
        startTime: null,
        elapsedTime: 0,
        formattedTime: '00:00'
      });
    }, 150);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      progress: 0,
      message: '',
      startTime: null,
      elapsedTime: 0,
      formattedTime: '0s'
    });
  }, []);

  const simulateProgress = useCallback(async (steps: Array<{ progress: number; message: string; delay: number }>) => {
    startLoading(steps[0]?.message || 'Iniciando...');
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      updateProgress(step.progress, step.message);
    }
    
    finishLoading();
  }, [startLoading, updateProgress, finishLoading]);

  // Função para formatar tempo
  const formatTime = useCallback((seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (remainingSeconds === 0) {
      return `${minutes}m`
    }
    
    return `${minutes}m ${remainingSeconds}s`
  }, [])

  // Auto-update progress and timer based on elapsed time
  useEffect(() => {
    if (!loadingState.isLoading || !loadingState.startTime) return;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - loadingState.startTime!;
      const seconds = Math.floor(elapsed / 1000);
      
      // Atualizar contador de tempo
      setLoadingState(prev => ({
        ...prev,
        elapsedTime: seconds,
        formattedTime: formatTime(seconds)
      }));
      
      // Progressive loading based on time
      if (seconds < 2) {
        updateProgress(20, 'Conectando com IA...');
      } else if (seconds < 5) {
        updateProgress(40, 'Analisando conteúdo...');
      } else if (seconds < 8) {
        updateProgress(60, 'Gerando aula interativa...');
      } else if (seconds < 12) {
        updateProgress(80, 'Criando exercícios...');
      } else {
        updateProgress(95, 'Finalizando...');
      }
    }, 1000); // Update every 1 second for timer and 500ms for progress
    
    return () => clearInterval(interval);
  }, [loadingState.isLoading, loadingState.startTime, updateProgress, formatTime]);

  return {
    loadingState,
    startLoading,
    updateProgress,
    finishLoading,
    stopLoading,
    simulateProgress
  };
}
