"use client";

import { useState, useCallback, useEffect } from 'react';

interface LoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
  startTime: number | null;
}

export function useLessonLoading() {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    message: '',
    startTime: null
  });

  const startLoading = useCallback((initialMessage: string = 'Iniciando...') => {
    setLoadingState({
      isLoading: true,
      progress: 0,
      message: initialMessage,
      startTime: Date.now()
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
      message: 'Concluído!'
    }));
    
    // Auto-hide after 1 second
    setTimeout(() => {
      setLoadingState({
        isLoading: false,
        progress: 0,
        message: '',
        startTime: null
      });
    }, 1000);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      progress: 0,
      message: '',
      startTime: null
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

  // Auto-update time spent
  useEffect(() => {
    if (!loadingState.isLoading || !loadingState.startTime) return;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - loadingState.startTime!;
      const seconds = Math.floor(elapsed / 1000);
      
      // Update message based on time elapsed
      if (seconds > 10 && loadingState.progress < 50) {
        updateProgress(loadingState.progress + 5, 'Processando dados...');
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [loadingState.isLoading, loadingState.startTime, loadingState.progress, updateProgress]);

  return {
    loadingState,
    startLoading,
    updateProgress,
    finishLoading,
    stopLoading,
    simulateProgress
  };
}
