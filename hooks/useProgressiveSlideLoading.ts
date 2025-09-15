import { useState, useCallback } from 'react';
import { Slide } from '@/types/slides';

interface ProgressiveLoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
  loadedSlides: Slide[];
  totalSlides: number;
  currentSlideIndex: number;
  canStart: boolean;
  startTime: number | null;
  isGeneratingNext: boolean;
  elapsedTime: number;
  formattedTime: string;
  error: string;
}

export function useProgressiveSlideLoading() {
  const [loadingState, setLoadingState] = useState<ProgressiveLoadingState>({
    isLoading: false,
    progress: 0,
    message: '',
    loadedSlides: [],
    totalSlides: 9,
    currentSlideIndex: 0,
    canStart: false,
    startTime: null,
    isGeneratingNext: false,
    elapsedTime: 0,
    formattedTime: '0s',
    error: ''
  });

  const generateSlide = useCallback(async (
    slideIndex: number, 
    query: string, 
    subject: string, 
    previousSlides: Slide[] = []
  ): Promise<Slide> => {
    try {
      const response = await fetch('/api/slides/progressive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          topic: query,
          subject: subject,
          position: slideIndex,
          previousSlides: previousSlides
        }),
      });

      if (!response.ok) {
        throw new Error(`Falha na resposta da API: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.slide) {
        throw new Error(data.error || 'Falha ao gerar slide');
      }

      return data.slide;
    } catch (error) {
      console.error('Erro ao gerar slide:', error);
      throw error;
    }
  }, []);

  const startProgressiveLoading = useCallback(async (
    query: string,
    subject: string,
    initialImageUrl?: string
  ) => {
    console.log('🚀 Iniciando carregamento progressivo real');
    
    setLoadingState({
      isLoading: true,
      progress: 0,
      message: 'Preparando aula interativa...',
      loadedSlides: [],
      totalSlides: 9,
      currentSlideIndex: 0,
      canStart: false,
      startTime: Date.now(),
      isGeneratingNext: false,
      elapsedTime: 0,
      formattedTime: '0s',
      error: ''
    });

    try {
      // Preparação inicial mínima
      setLoadingState(prev => ({
        ...prev,
        progress: 10,
        message: 'Gerando primeiro slide...'
      }));

      // Gerar APENAS o slide 1 primeiro
      console.log('⚡ Gerando slide 1...');
      const slide1 = await generateSlide(1, query, subject);

      // Adicionar imagem ao slide 1 se disponível
      if (initialImageUrl) {
        // Note: Image handling would need to be implemented based on the Slide interface
        console.log('Image URL available:', initialImageUrl);
      }

      // Mostrar slide 1 imediatamente
      setLoadingState(prev => ({
        ...prev,
        progress: 100,
        message: 'Primeiro slide pronto!',
        loadedSlides: [slide1],
        canStart: true,
        isLoading: false
      }));

      console.log('✅ Slide 1 pronto - usuário pode começar');

    } catch (error) {
      console.error('❌ Erro no carregamento inicial:', error);
      setLoadingState(prev => ({
        ...prev,
        isLoading: false,
        error: `Erro ao gerar primeiro slide: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }));
    }
  }, [generateSlide]);

  const loadNextSlide = useCallback(async (
    query: string,
    subject: string,
    slideIndex: number
  ) => {
    if (slideIndex >= 9) {
      console.log('⚠️ Máximo de slides atingido (9)');
      return;
    }

    const nextSlideNumber = slideIndex + 1;
    console.log(`📥 Carregando slide ${nextSlideNumber} sob demanda...`);

    setLoadingState(prev => ({
      ...prev,
      isGeneratingNext: true,
      message: `Gerando slide ${nextSlideNumber}...`
    }));

    try {
      // Obter slides anteriores para contexto
      const previousSlides = loadingState.loadedSlides;
      
      // Gerar APENAS o próximo slide
      const newSlide = await generateSlide(nextSlideNumber, query, subject, previousSlides);
      
      setLoadingState(prev => ({
        ...prev,
        loadedSlides: [...prev.loadedSlides, newSlide], // Adicionar apenas 1 slide
        isGeneratingNext: false,
        message: `Slide ${nextSlideNumber} carregado!`
      }));

      console.log(`✅ Slide ${nextSlideNumber} carregado com sucesso`);

      // Limpar mensagem após um tempo
      setTimeout(() => {
        setLoadingState(prev => ({
          ...prev,
          message: ''
        }));
      }, 1500);

    } catch (error) {
      console.error(`❌ Erro ao gerar slide ${nextSlideNumber}:`, error);
      setLoadingState(prev => ({
        ...prev,
        isGeneratingNext: false,
        message: `Erro ao gerar slide ${nextSlideNumber}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }));
    }
  }, [generateSlide, loadingState.loadedSlides]);

  const updateProgress = useCallback((progress: number, message: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      message
    }));
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      progress: 0,
      message: '',
      loadedSlides: [],
      totalSlides: 9,
      currentSlideIndex: 0,
      canStart: false,
      startTime: null,
      isGeneratingNext: false,
      elapsedTime: 0,
      formattedTime: '0s',
      error: ''
    });
  }, []);

  // Função para formatar tempo
  const formatTime = useCallback((milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }, []);

  // Função para obter slides disponíveis
  const getAvailableSlides = useCallback(() => {
    return loadingState.loadedSlides;
  }, [loadingState.loadedSlides]);

  // Função para verificar se pode carregar próximo slide
  const canLoadNextSlide = useCallback((currentIndex: number) => {
    return currentIndex < loadingState.loadedSlides.length - 1 && 
           loadingState.loadedSlides.length < 9 && 
           !loadingState.isGeneratingNext;
  }, [loadingState.loadedSlides.length, loadingState.isGeneratingNext]);

  return {
    loadingState,
    startProgressiveLoading,
    loadNextSlide,
    updateProgress,
    stopLoading,
    formatTime,
    getAvailableSlides,
    canLoadNextSlide
  };
}
