"use client";

import { useState, useCallback } from 'react';

interface SlideLoadingState {
  isLoading: boolean;
  progress: number;
  message?: string;
  currentSlide?: number;
  totalSlides?: number;
  slideTitle?: string;
}

export const useProgressiveSlideLoading = () => {
  const [state, setState] = useState<SlideLoadingState>({
    isLoading: false,
    progress: 0,
    message: undefined,
    currentSlide: undefined,
    totalSlides: undefined,
    slideTitle: undefined
  });

  const startLoading = useCallback((totalSlides?: number, message?: string) => {
    setState({
      isLoading: true,
      progress: 0,
      message,
      currentSlide: undefined,
      totalSlides,
      slideTitle: undefined
    });
  }, []);

  const updateSlide = useCallback((currentSlide: number, slideTitle?: string) => {
    const totalSlides = state.totalSlides || 1;
    const progress = (currentSlide / totalSlides) * 100;
    
    setState(prev => ({
      ...prev,
      currentSlide,
      slideTitle,
      progress
    }));
  }, [state.totalSlides]);

  const updateProgress = useCallback((progress: number, message?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      message
    }));
  }, []);

  const stopLoading = useCallback(() => {
    setState({
      isLoading: false,
      progress: 0,
      message: undefined,
      currentSlide: undefined,
      totalSlides: undefined,
      slideTitle: undefined
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
    currentSlide: state.currentSlide,
    totalSlides: state.totalSlides,
    slideTitle: state.slideTitle,
    startLoading,
    updateSlide,
    updateProgress,
    stopLoading,
    setMessage
  };
};
