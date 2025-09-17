'use client';

import { createContext, useContext, useCallback, useRef, useState, useMemo } from 'react';

interface LoadingState {
  isVisible: boolean;
  message: string;
  showCancelButton: boolean;
  onCancel?: () => void;
}

interface LoadingContextType {
  show: (minMs?: number, options?: Partial<Omit<LoadingState, 'isVisible'>>) => void;
  hide: () => void;
  state: LoadingState;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export function useGlobalLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useGlobalLoading must be used within GlobalLoadingProvider');
  }
  return context;
}

export function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LoadingState>({
    isVisible: false,
    message: "Carregando…",
    showCancelButton: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const minMsRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const show = useCallback((minMs: number = 300, options?: Partial<Omit<LoadingState, 'isVisible'>>) => {
    // Limpar timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    startTimeRef.current = Date.now();
    minMsRef.current = minMs;

    setState(prev => ({
      ...prev,
      isVisible: true,
      message: options?.message || "Carregando…",
      showCancelButton: options?.showCancelButton || false,
      onCancel: options?.onCancel,
    }));
  }, []);

  const hide = useCallback(() => {
    // Evitar chamadas desnecessárias se já não está visível
    setState(prev => {
      if (!prev.isVisible) return prev;
      
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, minMsRef.current - elapsed);

      if (remaining > 0) {
        // Aguardar o tempo mínimo antes de esconder
        timeoutRef.current = setTimeout(() => {
          setState(prevState => ({
            ...prevState,
            isVisible: false,
            showCancelButton: false,
            onCancel: undefined,
          }));
        }, remaining);
        return prev; // Manter estado atual
      } else {
        // Esconder imediatamente
        return {
          ...prev,
          isVisible: false,
          showCancelButton: false,
          onCancel: undefined,
        };
      }
    });
  }, []);

  const contextValue: LoadingContextType = useMemo(() => ({
    show,
    hide,
    state,
  }), [show, hide, state]);

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
}
