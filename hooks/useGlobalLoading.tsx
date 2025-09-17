"use client";

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';

interface GlobalLoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
  type?: 'navigation' | 'data' | 'upload' | 'processing';
}

interface GlobalLoadingContextType {
  isLoading: boolean;
  message?: string;
  progress?: number;
  type?: 'navigation' | 'data' | 'upload' | 'processing';
  startLoading: (message?: string, type?: 'navigation' | 'data' | 'upload' | 'processing') => void;
  updateProgress: (progress: number, message?: string) => void;
  stopLoading: () => void;
  setMessage: (message: string) => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextType | null>(null);

export const GlobalLoadingProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GlobalLoadingState>({
    isLoading: false,
    message: undefined,
    progress: undefined,
    type: undefined
  });

  const startLoading = useCallback((message?: string, type?: 'navigation' | 'data' | 'upload' | 'processing') => {
    setState({
      isLoading: true,
      message,
      progress: 0,
      type
    });
  }, []);

  const updateProgress = useCallback((progress: number, message?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      message: message || prev.message
    }));
  }, []);

  const stopLoading = useCallback(() => {
    setState({
      isLoading: false,
      message: undefined,
      progress: undefined,
      type: undefined
    });
  }, []);

  const setMessage = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      message
    }));
  }, []);

  const value: GlobalLoadingContextType = {
    isLoading: state.isLoading,
    message: state.message,
    progress: state.progress,
    type: state.type,
    startLoading,
    updateProgress,
    stopLoading,
    setMessage
  };

  return (
    <GlobalLoadingContext.Provider value={value}>
      {children}
    </GlobalLoadingContext.Provider>
  );
};

export const useGlobalLoading = () => {
  const context = useContext(GlobalLoadingContext);
  if (!context) {
    throw new Error('useGlobalLoading must be used within GlobalLoadingProvider');
  }
  return context;
};
