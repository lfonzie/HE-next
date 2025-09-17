'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface PageTransitionOptions {
  duration?: number;
  message?: string;
  showProgress?: boolean;
}

export function usePageTransition(options: PageTransitionOptions = {}) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('Carregando página...');
  const router = useRouter();
  const pathname = usePathname();

  const {
    duration = 1500,
    message = 'Carregando página...',
    showProgress = false
  } = options;

  // Interceptar navegação programática
  const navigateWithLoading = useCallback((url: string, customMessage?: string) => {
    setIsTransitioning(true);
    setTransitionMessage(customMessage || message);
    
    // Simular loading antes da navegação
    setTimeout(() => {
      router.push(url);
    }, 200);
  }, [router, message]);

  const replaceWithLoading = useCallback((url: string, customMessage?: string) => {
    setIsTransitioning(true);
    setTransitionMessage(customMessage || message);
    
    setTimeout(() => {
      router.replace(url);
    }, 200);
  }, [router, message]);

  const backWithLoading = useCallback((customMessage?: string) => {
    setIsTransitioning(true);
    setTransitionMessage(customMessage || 'Voltando...');
    
    setTimeout(() => {
      router.back();
    }, 200);
  }, [router, message]);

  // Auto-hide loading quando a página carrega
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isTransitioning, duration]);

  return {
    isTransitioning,
    transitionMessage,
    navigateWithLoading,
    replaceWithLoading,
    backWithLoading,
    setIsTransitioning
  };
}

