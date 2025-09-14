import { useState, useCallback, useEffect } from 'react'

interface Slide {
  id?: string;
  type: 'explanation' | 'question' | 'example' | 'feedback';
  content?: string;
  question?: string;
  options?: string[];
  correctOption?: number;
  helpMessage?: string;
  correctAnswer?: string;
  card1?: {
    title: string;
    content: string;
  };
  card2?: {
    title: string;
    content: string;
    imageUrl?: string;
    options?: string[];
    correctOption?: number;
    helpMessage?: string;
    correctAnswer?: string;
  };
}

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
}

export function useProfessorProgressiveLoading() {
  const [loadingState, setLoadingState] = useState<ProgressiveLoadingState>({
    isLoading: false,
    progress: 0,
    message: '',
    loadedSlides: [],
    totalSlides: 8,
    currentSlideIndex: 0,
    canStart: false,
    startTime: null,
    isGeneratingNext: false,
    elapsedTime: 0,
    formattedTime: '0s'
  });

  const generateSlide = useCallback(async (slideIndex: number, query: string, subject: string): Promise<Slide> => {
    try {
      // Para o slide 1, usar API rápida
      if (slideIndex === 1) {
        const response = await fetch('/api/module-professor-interactive/quick-start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            query: query,
            subject: subject
          }),
        });

        if (!response.ok) {
          throw new Error(`Falha na resposta da API: ${response.status}`);
        }

        const data = await response.json();
        return data.slide1;
      }

      // Para outros slides, usar API normal
      const response = await fetch('/api/module-professor-interactive/slide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: query,
          subject: subject,
          slideIndex: slideIndex
        }),
      });

      if (!response.ok) {
        throw new Error(`Falha na resposta da API: ${response.status}`);
      }

      const data = await response.json();
      let slide = data.slide;

      // Se for o slide 8, buscar uma imagem diferente
      if (slideIndex === 8 && slide.card2) {
        try {
          const imageResponse = await fetch('/api/unsplash/search', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            if (imageData.data && imageData.data.results && imageData.data.results.length > 0) {
              // Pegar uma imagem diferente (segunda da lista)
              const differentImage = imageData.data.results[1] || imageData.data.results[0];
              slide.card2.imageUrl = differentImage.urls.regular;
            }
          }
        } catch (imageError) {
          console.warn('Erro ao buscar imagem diferente para slide 8:', imageError);
        }
      }

      return slide;
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
    console.log('🚀 Iniciando carregamento progressivo otimizado');
    
    setLoadingState({
      isLoading: true,
      progress: 0,
      message: 'Preparando aula interativa...',
      loadedSlides: [],
      totalSlides: 8,
      currentSlideIndex: 0,
      canStart: false,
      startTime: Date.now(),
      isGeneratingNext: false,
      elapsedTime: 0,
      formattedTime: '0s'
    });

    try {
      // Preparação inicial mínima
      setLoadingState(prev => ({
        ...prev,
        progress: 10,
        message: 'Gerando primeiro slide...'
      }));

      // Gerar APENAS o slide 1 primeiro (usando API rápida)
      console.log('⚡ Gerando slide 1 com API rápida...');
      const slide1 = await generateSlide(1, query, subject);

      // Adicionar imagem ao slide 1 se disponível
      if (initialImageUrl && slide1.card2) {
        slide1.card2.imageUrl = initialImageUrl;
      }

      // Mostrar slide 1 imediatamente
      setLoadingState(prev => ({
        ...prev,
        progress: 100,
        message: 'Primeiro slide pronto!',
        loadedSlides: [slide1], // APENAS slide 1 carregado
        canStart: true, // Permitir começar com slide 1
        isLoading: false // Parar loading principal
      }));

      console.log('✅ Slide 1 pronto - usuário pode começar');

      // Gerar slide 2 em paralelo (sem bloquear a UI)
      setTimeout(async () => {
        try {
          console.log('📝 Gerando slide 2 em paralelo...');
          const slide2 = await generateSlide(2, query, subject);
          
          setLoadingState(prev => ({
            ...prev,
            loadedSlides: [slide1, slide2], // Adicionar slide 2
            message: 'Segundo slide carregado!'
          }));

          console.log('✅ Slide 2 carregado em paralelo');
          
          // Limpar mensagem após um tempo
          setTimeout(() => {
            setLoadingState(prev => ({
              ...prev,
              message: ''
            }));
          }, 1500);
        } catch (error) {
          console.error('❌ Erro ao gerar slide 2:', error);
        }
      }, 50); // Delay mínimo

    } catch (error) {
      console.error('❌ Erro no carregamento inicial:', error);
      setLoadingState(prevState => ({
        ...prevState,
        isLoading: false,
        progress: 0,
        message: `Erro ao carregar slides: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        loadedSlides: [],
        canStart: false
      }));
    }
  }, [generateSlide]);

  const loadNextSlide = useCallback(async (
    query: string,
    subject: string,
    slideIndex: number
  ) => {
    if (slideIndex >= 8) {
      console.log('⚠️ Máximo de slides atingido (8)');
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
      // Gerar APENAS o próximo slide
      const newSlide = await generateSlide(nextSlideNumber, query, subject);
      
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
  }, [generateSlide]);

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
      totalSlides: 8,
      currentSlideIndex: 0,
      canStart: false,
      startTime: null,
      isGeneratingNext: false,
      elapsedTime: 0,
      formattedTime: '0s'
    });
  }, []);

  // Função para formatar tempo
  const formatTime = useCallback((seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (remainingSeconds === 0) {
      return `${minutes}m`
    }
    
    return `${minutes}m ${remainingSeconds}s`
  }, [])

  // Atualizar contador de tempo durante o carregamento
  useEffect(() => {
    if (!loadingState.isLoading || !loadingState.startTime) return;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - loadingState.startTime!;
      const seconds = Math.floor(elapsed / 1000);
      
      setLoadingState(prev => ({
        ...prev,
        elapsedTime: seconds,
        formattedTime: formatTime(seconds)
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [loadingState.isLoading, loadingState.startTime, formatTime]);

  const getCurrentSlide = useCallback(() => {
    if (loadingState.loadedSlides.length === 0) return null;
    return loadingState.loadedSlides[loadingState.currentSlideIndex] || null;
  }, [loadingState.loadedSlides, loadingState.currentSlideIndex]);

  const getAvailableSlides = useCallback(() => {
    return loadingState.loadedSlides;
  }, [loadingState.loadedSlides]);

  const canNavigateToSlide = useCallback((index: number) => {
    return index < loadingState.loadedSlides.length;
  }, [loadingState.loadedSlides.length]);

  const canGoNext = useCallback((currentIndex: number) => {
    // Pode ir para próximo se não estiver gerando e houver próximo slide disponível
    return !loadingState.isGeneratingNext && currentIndex < loadingState.loadedSlides.length - 1;
  }, [loadingState.isGeneratingNext, loadingState.loadedSlides.length]);

  return {
    loadingState,
    startProgressiveLoading,
    loadNextSlide,
    updateProgress,
    stopLoading,
    getCurrentSlide,
    getAvailableSlides,
    canNavigateToSlide,
    canGoNext
  };
}