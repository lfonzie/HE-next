'use client';

import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  message: string;
}

export function useNavigationLoading() {
  const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>({});

  const startLoading = useCallback((key: string, message: string = 'Carregando...') => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: { isLoading: true, message }
    }));
    return key;
  }, []);

  const stopLoading = useCallback((key: string) => {
    setLoadingStates(prev => {
      const newStates = { ...prev };
      delete newStates[key];
      return newStates;
    });
  }, []);

  const isLoading = useCallback((key?: string) => {
    if (key) {
      return loadingStates[key]?.isLoading || false;
    }
    return Object.values(loadingStates).some(state => state.isLoading);
  }, [loadingStates]);

  const getLoadingMessage = useCallback((key: string) => {
    return loadingStates[key]?.message || 'Carregando...';
  }, [loadingStates]);

  const clearAllLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    startLoading,
    stopLoading,
    isLoading,
    getLoadingMessage,
    clearAllLoading,
    loadingStates
  };
}