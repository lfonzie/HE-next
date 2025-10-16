import { useCallback, useMemo, useRef, useEffect } from 'react';
import { debounce } from 'lodash';

// Memoized progress calculation
export const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

// Memoized access check
export const canAccessAula = (userLevel: string, aulaLevel: string): boolean => {
  const levelHierarchy = {
    'beginner': 1,
    'intermediate': 2,
    'advanced': 3,
    'expert': 4
  };
  
  const userLevelNum = levelHierarchy[userLevel as keyof typeof levelHierarchy] || 0;
  const aulaLevelNum = levelHierarchy[aulaLevel as keyof typeof levelHierarchy] || 0;
  
  return userLevelNum >= aulaLevelNum;
};

// Custom hook for debounced effects
export function useDebouncedEffect(
  effect: () => void,
  deps: React.DependencyList,
  delay: number
) {
  const callback = useCallback(effect, deps);
  const debouncedCallback = useMemo(
    () => debounce(callback, delay),
    [callback, delay]
  );

  useEffect(() => {
    debouncedCallback();
    return () => {
      debouncedCallback.cancel();
    };
  }, [debouncedCallback]);
}

// Custom hook for memoized calculations
export function useMemoizedCalculation<T>(
  calculation: () => T,
  deps: React.DependencyList
): T {
  return useMemo(calculation, deps);
}

// Custom hook for slide sync with debouncing
export function useSlideSync(
  currentSlide: number,
  onSlideChange: (slide: number) => void,
  delay: number = 300
) {
  const debouncedSlideChange = useMemo(
    () => debounce(onSlideChange, delay),
    [onSlideChange, delay]
  );

  useEffect(() => {
    debouncedSlideChange(currentSlide);
    return () => {
      debouncedSlideChange.cancel();
    };
  }, [currentSlide, debouncedSlideChange]);
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - startTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCount.current} times in ${renderTime}ms`);
    }
  });

  return {
    renderCount: renderCount.current,
    getRenderTime: () => Date.now() - startTime.current
  };
}

// Memory-efficient list rendering
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  };
}

// Image lazy loading hook
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(img);

    return () => observer.disconnect();
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setIsError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsError(true);
    setIsLoaded(false);
  }, []);

  return {
    imageSrc,
    isLoaded,
    isError,
    imgRef,
    handleLoad,
    handleError
  };
}

// Audio player optimization hook
export function useAudioOptimization() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferProgress, setBufferProgress] = useState(0);

  const handleLoadStart = useCallback(() => {
    setIsBuffering(true);
  }, []);

  const handleProgress = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const buffered = audio.buffered;
    if (buffered.length > 0) {
      const bufferedEnd = buffered.end(buffered.length - 1);
      const duration = audio.duration;
      if (duration > 0) {
        setBufferProgress((bufferedEnd / duration) * 100);
      }
    }
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsBuffering(false);
  }, []);

  const preloadAudio = useCallback((src: string) => {
    const audio = audioRef.current;
    if (audio && audio.src !== src) {
      audio.preload = 'metadata';
      audio.src = src;
    }
  }, []);

  return {
    audioRef,
    isBuffering,
    bufferProgress,
    handleLoadStart,
    handleProgress,
    handleCanPlay,
    preloadAudio
  };
}

// Component memoization utilities
export const memoizeComponent = <P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return React.memo(Component, areEqual);
};

// Function memoization with cache
export function createMemoizedFunction<T extends (...args: any[]) => any>(
  fn: T,
  cacheSize: number = 100
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    
    if (cache.size >= cacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, result);
    return result;
  }) as T;
}

// Batch state updates
export function useBatchedUpdates() {
  const [, forceUpdate] = useState({});
  const updatesRef = useRef<(() => void)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchedUpdate = useCallback((update: () => void) => {
    updatesRef.current.push(update);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      updatesRef.current.forEach(update => update());
      updatesRef.current = [];
      forceUpdate({});
    }, 0);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return batchedUpdate;
}

// Resource preloading
export function useResourcePreloader() {
  const preloadedResources = useRef<Set<string>>(new Set());

  const preloadImage = useCallback((src: string) => {
    if (preloadedResources.current.has(src)) return Promise.resolve();
    
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        preloadedResources.current.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadAudio = useCallback((src: string) => {
    if (preloadedResources.current.has(src)) return Promise.resolve();
    
    return new Promise<void>((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => {
        preloadedResources.current.add(src);
        resolve();
      };
      audio.onerror = reject;
      audio.src = src;
    });
  }, []);

  const preloadFont = useCallback((fontFamily: string, fontUrl: string) => {
    if (preloadedResources.current.has(fontUrl)) return Promise.resolve();
    
    return new Promise<void>((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = fontUrl;
      
      link.onload = () => {
        preloadedResources.current.add(fontUrl);
        resolve();
      };
      link.onerror = reject;
      
      document.head.appendChild(link);
    });
  }, []);

  return {
    preloadImage,
    preloadAudio,
    preloadFont,
    isPreloaded: (src: string) => preloadedResources.current.has(src)
  };
}
