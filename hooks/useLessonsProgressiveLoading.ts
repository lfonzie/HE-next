"use client";

import { useState, useCallback } from 'react';

interface ProgressiveLoadingState {
  isLoading: boolean;
  progress: number;
  message?: string;
  currentStep?: string;
  totalSteps?: number;
}

export const useLessonsProgressiveLoading = () => {
  const [state, setState] = useState<ProgressiveLoadingState>({
    isLoading: false,
    progress: 0,
    message: undefined,
    currentStep: undefined,
    totalSteps: undefined
  });

  const startLoading = useCallback((totalSteps?: number, message?: string) => {
    setState({
      isLoading: true,
      progress: 0,
      message,
      currentStep: undefined,
      totalSteps
    });
  }, []);

  const updateProgress = useCallback((progress: number, currentStep?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      currentStep
    }));
  }, []);

  const stopLoading = useCallback(() => {
    setState({
      isLoading: false,
      progress: 0,
      message: undefined,
      currentStep: undefined,
      totalSteps: undefined
    });
  }, []);

  const setMessage = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      message
    }));
  }, []);

  return {
    isLoading: state.isLoading,
    progress: state.progress,
    message: state.message,
    currentStep: state.currentStep,
    totalSteps: state.totalSteps,
    startLoading,
    updateProgress,
    stopLoading,
    setMessage
  };
};
