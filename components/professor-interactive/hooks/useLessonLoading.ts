import { useState, useCallback } from 'react';

export interface LoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
  error?: string;
}

export interface LessonLoadingActions {
  startLoading: (message?: string) => void;
  updateProgress: (progress: number, message?: string) => void;
  finishLoading: () => void;
  stopLoading: () => void;
}

export function useLessonLoading(): { loadingState: LoadingState } & LessonLoadingActions {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    message: 'Carregando...'
  });

  const startLoading = useCallback((message = 'Carregando...') => {
    setLoadingState({
      isLoading: true,
      progress: 0,
      message
    });
  }, []);

  const updateProgress = useCallback((progress: number, message?: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
      ...(message && { message })
    }));
  }, []);

  const finishLoading = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      progress: 100,
      message: 'Concluído!'
    }));
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      progress: 0,
      message: 'Carregando...'
    });
  }, []);

  return {
    loadingState,
    startLoading,
    updateProgress,
    finishLoading,
    stopLoading
  };
}
