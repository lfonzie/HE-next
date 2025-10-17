// hooks/useDebounce.ts
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para debounce de valores
 * @param value - Valor a ser debounced
 * @param delay - Delay em milissegundos
 * @returns Valor debounced
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook para debounce de callback
 * @param callback - Função a ser debounced
 * @param delay - Delay em milissegundos
 * @returns Função debounced
 */
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Hook para debounce de estado com callback
 * @param initialValue - Valor inicial
 * @param delay - Delay em milissegundos
 * @param onDebouncedChange - Callback chamado quando o valor debounced muda
 * @returns [valor, setValor, valorDebounced]
 */
export const useDebouncedState = <T>(
  initialValue: T,
  delay: number,
  onDebouncedChange?: (value: T) => void
): [T, (value: T) => void, T] => {
  const [value, setValue] = useState<T>(initialValue);
  const debouncedValue = useDebounce(value, delay);

  useEffect(() => {
    if (onDebouncedChange && debouncedValue !== initialValue) {
      onDebouncedChange(debouncedValue);
    }
  }, [debouncedValue, onDebouncedChange, initialValue]);

  return [value, setValue, debouncedValue];
};

/**
 * Hook para debounce de input com validação
 * @param initialValue - Valor inicial
 * @param delay - Delay em milissegundos
 * @param validator - Função de validação
 * @returns [valor, setValor, valorDebounced, isValid, error]
 */
export const useDebouncedInput = <T>(
  initialValue: T,
  delay: number,
  validator?: (value: T) => { isValid: boolean; error?: string }
) => {
  const [value, setValue] = useState<T>(initialValue);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const debouncedValue = useDebounce(value, delay);

  useEffect(() => {
    if (validator) {
      const validation = validator(debouncedValue);
      setIsValid(validation.isValid);
      setError(validation.error);
    } else {
      setIsValid(true);
      setError(undefined);
    }
  }, [debouncedValue, validator]);

  return [value, setValue, debouncedValue, isValid, error] as const;
};

/**
 * Hook para debounce de pesquisa
 * @param initialQuery - Query inicial
 * @param delay - Delay em milissegundos
 * @param onSearch - Callback chamado quando a pesquisa muda
 * @returns [query, setQuery, debouncedQuery, isSearching]
 */
export const useDebouncedSearch = (
  initialQuery: string = '',
  delay: number = 300,
  onSearch?: (query: string) => void
) => {
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(query, delay);

  useEffect(() => {
    if (onSearch && debouncedQuery !== initialQuery) {
      setIsSearching(true);
      onSearch(debouncedQuery);
      setIsSearching(false);
    }
  }, [debouncedQuery, onSearch, initialQuery]);

  return [query, setQuery, debouncedQuery, isSearching] as const;
};

/**
 * Hook para debounce de scroll
 * @param delay - Delay em milissegundos
 * @param onScroll - Callback chamado quando o scroll muda
 * @returns [scrollPosition, isScrolling]
 */
export const useDebouncedScroll = (
  delay: number = 100,
  onScroll?: (position: { x: number; y: number }) => void
) => {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [isScrolling, setIsScrolling] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleScroll = () => {
      const position = {
        x: window.scrollX,
        y: window.scrollY,
      };

      setScrollPosition(position);
      setIsScrolling(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        if (onScroll) {
          onScroll(position);
        }
      }, delay);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay, onScroll]);

  return [scrollPosition, isScrolling] as const;
};

/**
 * Hook para debounce de resize
 * @param delay - Delay em milissegundos
 * @param onResize - Callback chamado quando o tamanho muda
 * @returns [size, isResizing]
 */
export const useDebouncedResize = (
  delay: number = 100,
  onResize?: (size: { width: number; height: number }) => void
) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleResize = () => {
      const newSize = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      setSize(newSize);
      setIsResizing(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsResizing(false);
        if (onResize) {
          onResize(newSize);
        }
      }, delay);
    };

    // Definir tamanho inicial
    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay, onResize]);

  return [size, isResizing] as const;
};

/**
 * Hook para debounce de API calls
 * @param apiCall - Função da API
 * @param delay - Delay em milissegundos
 * @returns [execute, isLoading, data, error]
 */
export const useDebouncedApiCall = <T, P extends any[]>(
  apiCall: (...args: P) => Promise<T>,
  delay: number = 300
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const execute = useCallback(
    (...args: P) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        setIsLoading(true);
        setError(null);

        try {
          const result = await apiCall(...args);
          setData(result);
        } catch (err) {
          setError(err as Error);
        } finally {
          setIsLoading(false);
        }
      }, delay);
    },
    [apiCall, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [execute, isLoading, data, error] as const;
};

export default useDebounce;
