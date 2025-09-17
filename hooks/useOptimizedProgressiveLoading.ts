import { useState, useCallback, useEffect, useRef } from 'react'

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

interface OptimizedLoadingState {
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
  // Novos campos otimizados
  cache: Map<string, Slide>;
  preloadQueue: number[];
  isPreloading: boolean;
  errorCount: number;
  retryAttempts: Map<number, number>;
}

export function useOptimizedProgressiveLoading() {
  const [loadingState, setLoadingState] = useState<OptimizedLoadingState>({
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
    formattedTime: '0s',
    cache: new Map(),
    preloadQueue: [],
    isPreloading: false,
    errorCount: 0,
    retryAttempts: new Map()
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Função para gerar slide com retry e cache
  const generateSlide = useCallback(async (
    slideIndex: number, 
    query: string, 
    subject: string,
    retryCount = 0
  ): Promise<Slide> => {
    const cacheKey = `${query}_${subject}_${slideIndex}`;
    
    // Verificar cache primeiro
    if (loadingState.cache.has(cacheKey)) {
      console.log(`📋 Cache hit para slide ${slideIndex}`);
      return loadingState.cache.get(cacheKey)!;
    }

    try {
      console.log(`🔄 Gerando slide ${slideIndex} (tentativa ${retryCount + 1})`);
      
      // Cancelar requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      let response: Response;
      
      // Para o slide 1, usar API rápida
      if (slideIndex === 1) {
        response = await fetch('/api/module-professor-interactive/quick-start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            query: query,
            subject: subject
          }),
          signal: abortControllerRef.current.signal
        });
      } else {
        // Para outros slides, usar API normal
        response = await fetch('/api/module-professor-interactive/slide', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            query: query,
            subject: subject,
            slideIndex: slideIndex
          }),
          signal: abortControllerRef.current.signal
        });
      }

      if (!response.ok) {
        throw new Error(`Falha na resposta da API: ${response.status}`);
      }

      const data = await response.json();
      let slide = data.slide1 || data.slide;

      // Se for o slide 8, buscar uma imagem diferente
      if (slideIndex === 8 && slide.card2) {
        try {
          const imageResponse = await fetch('/api/unsplash/search', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: abortControllerRef.current.signal
          });
          
          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            if (imageData.data?.results?.length > 0) {
              const differentImage = imageData.data.results[1] || imageData.data.results[0];
              slide.card2.imageUrl = differentImage.urls.regular;
            }
          }
        } catch (imageError) {
          console.warn('Erro ao buscar imagem diferente para slide 8:', imageError);
        }
      }

      // Adicionar ao cache
      setLoadingState(prev => ({
        ...prev,
        cache: new Map(prev.cache.set(cacheKey, slide))
      }));

      console.log(`✅ Slide ${slideIndex} gerado com sucesso`);
      return slide;
      
    } catch (error) {
      console.error(`❌ Erro ao gerar slide ${slideIndex}:`, error);
      
      // Retry logic
      if (retryCount < 2) {
        console.log(`🔄 Tentando novamente slide ${slideIndex} (tentativa ${retryCount + 2})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return generateSlide(slideIndex, query, subject, retryCount + 1);
      }
      
      throw error;
    }
  }, [loadingState.cache]);

  // Função para preload de slides em background
  const preloadSlides = useCallback(async (
    query: string,
    subject: string,
    startIndex: number,
    count: number
  ) => {
    if (loadingState.isPreloading) return;
    
    setLoadingState(prev => ({ ...prev, isPreloading: true }));
    
    try {
      const preloadPromises = [];
      
      for (let i = startIndex; i < startIndex + count && i <= 8; i++) {
        if (!loadingState.cache.has(`${query}_${subject}_${i}`)) {
          preloadPromises.push(
            generateSlide(i, query, subject).catch(error => {
              console.warn(`Erro no preload do slide ${i}:`, error);
              return null;
            })
          );
        }
      }
      
      await Promise.allSettled(preloadPromises);
      console.log(`📦 Preload de ${count} slides concluído`);
      
    } catch (error) {
      console.error('Erro no preload:', error);
    } finally {
      setLoadingState(prev => ({ ...prev, isPreloading: false }));
    }
  }, [loadingState.isPreloading, loadingState.cache, generateSlide]);

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
      formattedTime: '0s',
      cache: new Map(),
      preloadQueue: [],
      isPreloading: false,
      errorCount: 0,
      retryAttempts: new Map()
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
        loadedSlides: [slide1],
        canStart: true,
        isLoading: false
      }));

      console.log('✅ Slide 1 pronto - usuário pode começar');

      // Preload dos próximos slides em background
      setTimeout(() => {
        preloadSlides(query, subject, 2, 3); // Preload slides 2-4
      }, 100);

    } catch (error) {
      console.error('❌ Erro no carregamento inicial:', error);
      setLoadingState(prevState => ({
        ...prevState,
        isLoading: false,
        progress: 0,
        message: `Erro ao carregar slides: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        loadedSlides: [],
        canStart: false,
        errorCount: prevState.errorCount + 1
      }));
    }
  }, [generateSlide, preloadSlides]);

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
      // Verificar cache primeiro
      const cacheKey = `${query}_${subject}_${nextSlideNumber}`;
      let newSlide: Slide;
      
      if (loadingState.cache.has(cacheKey)) {
        console.log(`📋 Usando slide ${nextSlideNumber} do cache`);
        newSlide = loadingState.cache.get(cacheKey)!;
      } else {
        // Gerar novo slide
        newSlide = await generateSlide(nextSlideNumber, query, subject);
      }
      
      setLoadingState(prev => ({
        ...prev,
        loadedSlides: [...prev.loadedSlides, newSlide],
        isGeneratingNext: false,
        message: `Slide ${nextSlideNumber} carregado!`
      }));

      console.log(`✅ Slide ${nextSlideNumber} carregado com sucesso`);

      // Preload do próximo slide em background
      if (nextSlideNumber < 7) {
        setTimeout(() => {
          preloadSlides(query, subject, nextSlideNumber + 1, 1);
        }, 500);
      }

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
        message: `Erro ao gerar slide ${nextSlideNumber}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        errorCount: prev.errorCount + 1
      }));
    }
  }, [generateSlide, loadingState.cache, preloadSlides]);

  const updateProgress = useCallback((progress: number, message: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      message
    }));
  }, []);

  const stopLoading = useCallback(() => {
    // Cancelar requisições em andamento
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
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
      formattedTime: '0s',
      cache: new Map(),
      preloadQueue: [],
      isPreloading: false,
      errorCount: 0,
      retryAttempts: new Map()
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
    return !loadingState.isGeneratingNext && currentIndex < loadingState.loadedSlides.length - 1;
  }, [loadingState.isGeneratingNext, loadingState.loadedSlides.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    loadingState,
    startProgressiveLoading,
    loadNextSlide,
    updateProgress,
    stopLoading,
    getCurrentSlide,
    getAvailableSlides,
    canNavigateToSlide,
    canGoNext,
    preloadSlides,
    cache: loadingState.cache
  };
}
