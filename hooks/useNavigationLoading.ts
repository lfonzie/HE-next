"use client";

import { useState, useCallback } from 'react';

interface NavigationLoadingState {
  isLoading: boolean;
  message?: string;
}

export const useNavigationLoading = () => {
  const [state, setState] = useState<NavigationLoadingState>({
    isLoading: false,
    message: undefined
  });

  const startLoading = useCallback((message?: string) => {
    setState({
      isLoading: true,
      message
    });
  }, []);

  const stopLoading = useCallback(() => {
    setState({
      isLoading: false,
      message: undefined
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
    message: state.message,
    startLoading,
    stopLoading,
    setMessage
  };
};
