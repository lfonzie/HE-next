import { useState, useCallback, useEffect } from 'react';

interface SlideInfo {
  slideNumber: number;
  title: string;
  type: 'explanation' | 'question';
  objective: string;
  contentSummary: string;
  imagePrompt: string;
}

interface LessonSkeleton {
  title: string;
  subject: string;
  theme: string;
  slides: SlideInfo[];
}

interface GeneratedSlide {
  type: 'explanation' | 'question';
  title: string;
  content: string;
  options?: string[];
  correctOption?: number;
  helpMessage?: string;
  correctAnswer?: string;
  imagePrompt: string;
}

interface ProgressiveLessonState {
  skeleton: LessonSkeleton | null;
  generatedSlides: Map<number, GeneratedSlide>;
  isLoading: boolean;
  isGeneratingNext: boolean;
  error: string | null;
  currentSlide: number;
  totalSlides: number;
}

export function useProgressiveLesson() {
  const [state, setState] = useState<ProgressiveLessonState>({
    skeleton: null,
    generatedSlides: new Map(),
    isLoading: false,
    isGeneratingNext: false,
    error: null,
    currentSlide: 0,
    totalSlides: 0
  });

  // Gerar esqueleto da aula
  const generateSkeleton = useCallback(async (query: string, subject?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/module-professor-interactive/skeleton', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, subject }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar esqueleto');
      }

      setState(prev => ({
        ...prev,
        skeleton: data.skeleton,
        totalSlides: data.skeleton.slides.length,
        isLoading: false
      }));

      // Gerar os 2 primeiros slides automaticamente
      await generateInitialSlides(data.skeleton);

    } catch (error: any) {
      console.error('❌ Erro ao gerar esqueleto:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
    }
  }, []);

  // Gerar slides iniciais (1 e 2)
  const generateInitialSlides = useCallback(async (skeleton: LessonSkeleton) => {
    setState(prev => ({ ...prev, isGeneratingNext: true }));

    try {
      // Gerar slide 1
      const slide1Response = await fetch('/api/module-professor-interactive/progressive-slide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: skeleton.theme,
          subject: skeleton.subject,
          slideNumber: 1,
          slideInfo: skeleton.slides[0]
        }),
      });

      if (slide1Response.ok) {
        const slide1Data = await slide1Response.json();
        if (slide1Data.success) {
          setState(prev => ({
            ...prev,
            generatedSlides: new Map(prev.generatedSlides).set(1, slide1Data.slide)
          }));
        }
      }

      // Gerar slide 2
      const slide2Response = await fetch('/api/module-professor-interactive/progressive-slide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: skeleton.theme,
          subject: skeleton.subject,
          slideNumber: 2,
          slideInfo: skeleton.slides[1]
        }),
      });

      if (slide2Response.ok) {
        const slide2Data = await slide2Response.json();
        if (slide2Data.success) {
          setState(prev => ({
            ...prev,
            generatedSlides: new Map(prev.generatedSlides).set(2, slide2Data.slide)
          }));
        }
      }

      setState(prev => ({ ...prev, isGeneratingNext: false }));

    } catch (error: any) {
      console.error('❌ Erro ao gerar slides iniciais:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        isGeneratingNext: false
      }));
    }
  }, []);

  // Gerar próximo slide quando necessário
  const generateNextSlide = useCallback(async (targetSlide: number) => {
    if (!state.skeleton || state.generatedSlides.has(targetSlide)) {
      return;
    }

    setState(prev => ({ ...prev, isGeneratingNext: true }));

    try {
      const slideInfo = state.skeleton.slides[targetSlide - 1];
      
      const response = await fetch('/api/module-professor-interactive/progressive-slide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: state.skeleton.theme,
          subject: state.skeleton.subject,
          slideNumber: targetSlide,
          slideInfo: slideInfo
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setState(prev => ({
            ...prev,
            generatedSlides: new Map(prev.generatedSlides).set(targetSlide, data.slide),
            isGeneratingNext: false
          }));
        }
      }
    } catch (error: any) {
      console.error('❌ Erro ao gerar próximo slide:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        isGeneratingNext: false
      }));
    }
  }, [state.skeleton, state.generatedSlides]);

  // Navegar para próximo slide
  const goToNextSlide = useCallback(() => {
    if (state.currentSlide < state.totalSlides - 1) {
      const nextSlide = state.currentSlide + 1;
      setState(prev => ({ ...prev, currentSlide: nextSlide }));
      
      // Gerar próximo slide se necessário
      if (nextSlide + 1 <= state.totalSlides && !state.generatedSlides.has(nextSlide + 1)) {
        generateNextSlide(nextSlide + 1);
      }
    }
  }, [state.currentSlide, state.totalSlides, state.generatedSlides, generateNextSlide]);

  // Navegar para slide anterior
  const goToPreviousSlide = useCallback(() => {
    if (state.currentSlide > 0) {
      setState(prev => ({ ...prev, currentSlide: prev.currentSlide - 1 }));
    }
  }, [state.currentSlide]);

  // Ir para slide específico
  const goToSlide = useCallback((slideNumber: number) => {
    if (slideNumber >= 0 && slideNumber < state.totalSlides) {
      setState(prev => ({ ...prev, currentSlide: slideNumber }));
      
      // Gerar próximo slide se necessário
      if (slideNumber + 1 <= state.totalSlides && !state.generatedSlides.has(slideNumber + 1)) {
        generateNextSlide(slideNumber + 1);
      }
    }
  }, [state.totalSlides, state.generatedSlides, generateNextSlide]);

  // Limpar estado
  const clearLesson = useCallback(() => {
    setState({
      skeleton: null,
      generatedSlides: new Map(),
      isLoading: false,
      isGeneratingNext: false,
      error: null,
      currentSlide: 0,
      totalSlides: 0
    });
  }, []);

  // Verificar se pode navegar
  const canGoNext = useCallback(() => {
    return state.currentSlide < state.totalSlides - 1;
  }, [state.currentSlide, state.totalSlides]);

  const canGoPrevious = useCallback(() => {
    return state.currentSlide > 0;
  }, [state.currentSlide]);

  // Obter slide atual
  const getCurrentSlide = useCallback(() => {
    const slideNumber = state.currentSlide + 1;
    return state.generatedSlides.get(slideNumber) || null;
  }, [state.currentSlide, state.generatedSlides]);

  // Verificar se é slide de pergunta
  const isQuestionSlide = useCallback(() => {
    const currentSlide = getCurrentSlide();
    return currentSlide?.type === 'question';
  }, [getCurrentSlide]);

  // Verificar se é slide de encerramento
  const isClosingSlide = useCallback(() => {
    return state.currentSlide === state.totalSlides - 1;
  }, [state.currentSlide, state.totalSlides]);

  return {
    // Estado
    skeleton: state.skeleton,
    generatedSlides: state.generatedSlides,
    isLoading: state.isLoading,
    isGeneratingNext: state.isGeneratingNext,
    error: state.error,
    currentSlide: state.currentSlide,
    totalSlides: state.totalSlides,
    
    // Ações
    generateSkeleton,
    generateNextSlide,
    goToNextSlide,
    goToPreviousSlide,
    goToSlide,
    clearLesson,
    
    // Utilitários
    canGoNext,
    canGoPrevious,
    getCurrentSlide,
    isQuestionSlide,
    isClosingSlide
  };
}
