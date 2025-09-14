import { useState, useCallback, useRef } from 'react';

export interface HubEduSlide {
  slide: number;
  title: string;
  type: 'explanation' | 'question' | 'closing';
  content: string;
  options?: string[];
  answer?: string;
  image_prompt: string;
}

export interface HubEduLesson {
  theme: string;
  slides: HubEduSlide[];
  currentSlide: number;
  isLoading: boolean;
  isGeneratingNext: boolean;
  error: string | null;
}

export interface HubEduInteractiveState {
  lesson: HubEduLesson | null;
  isLoading: boolean;
  error: string | null;
  isGeneratingNext: boolean;
}

export function useHubEduInteractive() {
  const [state, setState] = useState<HubEduInteractiveState>({
    lesson: null,
    isLoading: false,
    error: null,
    isGeneratingNext: false
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const generateInitialSlides = useCallback(async (theme: string) => {
    try {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/module-professor-interactive/hubedu-initial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`Falha na resposta da API: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar slides iniciais');
      }

      const slides = [data.slides.slide1, data.slides.slide2];

      setState(prev => ({
        ...prev,
        lesson: {
          theme,
          slides,
          currentSlide: 0,
          isLoading: false,
          isGeneratingNext: false,
          error: null
        },
        isLoading: false,
        error: null
      }));

      return slides;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Geração de slides cancelada');
        return;
      }

      console.error('Erro ao gerar slides iniciais:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Erro ao gerar slides iniciais'
      }));
      throw error;
    }
  }, []);

  const generateNextSlide = useCallback(async (theme: string, slideNumber: number) => {
    try {
      setState(prev => ({
        ...prev,
        isGeneratingNext: true,
        error: null
      }));

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/module-professor-interactive/hubedu-slide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          theme,
          slideNumber 
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`Falha na resposta da API: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar slide');
      }

      const newSlide = data.slide;

      setState(prev => {
        if (!prev.lesson) return prev;

        const updatedSlides = [...prev.lesson.slides];
        // Insert slide at correct position (slideNumber - 1)
        updatedSlides[slideNumber - 1] = newSlide;

        return {
          ...prev,
          lesson: {
            ...prev.lesson,
            slides: updatedSlides,
            isGeneratingNext: false,
            error: null
          },
          isGeneratingNext: false,
          error: null
        };
      });

      return newSlide;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Geração de slide cancelada');
        return;
      }

      console.error('Erro ao gerar slide:', error);
      setState(prev => ({
        ...prev,
        isGeneratingNext: false,
        error: error.message || 'Erro ao gerar slide'
      }));
      throw error;
    }
  }, []);

  const navigateToSlide = useCallback((slideIndex: number) => {
    setState(prev => {
      if (!prev.lesson) return prev;

      return {
        ...prev,
        lesson: {
          ...prev.lesson,
          currentSlide: slideIndex
        }
      };
    });
  }, []);

  const goToNextSlide = useCallback(async () => {
    setState(prev => {
      if (!prev.lesson) return prev;

      const nextSlideIndex = prev.lesson.currentSlide + 1;
      
      // If we're going to slide 2 (index 1), generate slide 3
      if (nextSlideIndex === 1 && prev.lesson.slides.length === 2) {
        generateNextSlide(prev.lesson.theme, 3);
      }
      // If we're going to slide 3 (index 2), generate slide 4
      else if (nextSlideIndex === 2 && prev.lesson.slides.length === 3) {
        generateNextSlide(prev.lesson.theme, 4);
      }
      // Continue pattern for remaining slides
      else if (nextSlideIndex < prev.lesson.slides.length) {
        const nextSlideNumber = nextSlideIndex + 1;
        if (nextSlideNumber <= 8 && prev.lesson.slides.length < nextSlideNumber) {
          generateNextSlide(prev.lesson.theme, nextSlideNumber);
        }
      }

      return {
        ...prev,
        lesson: {
          ...prev.lesson,
          currentSlide: nextSlideIndex
        }
      };
    });
  }, [generateNextSlide]);

  const goToPreviousSlide = useCallback(() => {
    setState(prev => {
      if (!prev.lesson) return prev;

      const prevSlideIndex = Math.max(0, prev.lesson.currentSlide - 1);

      return {
        ...prev,
        lesson: {
          ...prev.lesson,
          currentSlide: prevSlideIndex
        }
      };
    });
  }, []);

  const clearLesson = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState({
      lesson: null,
      isLoading: false,
      error: null,
      isGeneratingNext: false
    });
  }, []);

  const getCurrentSlide = useCallback(() => {
    if (!state.lesson) return null;
    return state.lesson.slides[state.lesson.currentSlide] || null;
  }, [state.lesson]);

  const canGoNext = useCallback(() => {
    if (!state.lesson) return false;
    return state.lesson.currentSlide < state.lesson.slides.length - 1;
  }, [state.lesson]);

  const canGoPrevious = useCallback(() => {
    if (!state.lesson) return false;
    return state.lesson.currentSlide > 0;
  }, [state.lesson]);

  const isQuestionSlide = useCallback(() => {
    const currentSlide = getCurrentSlide();
    return currentSlide?.type === 'question';
  }, [getCurrentSlide]);

  const isClosingSlide = useCallback(() => {
    const currentSlide = getCurrentSlide();
    return currentSlide?.type === 'closing';
  }, [getCurrentSlide]);

  return {
    // State
    lesson: state.lesson,
    isLoading: state.isLoading,
    error: state.error,
    isGeneratingNext: state.isGeneratingNext,
    
    // Actions
    generateInitialSlides,
    generateNextSlide,
    navigateToSlide,
    goToNextSlide,
    goToPreviousSlide,
    clearLesson,
    
    // Getters
    getCurrentSlide,
    canGoNext,
    canGoPrevious,
    isQuestionSlide,
    isClosingSlide
  };
}
