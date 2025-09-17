'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import PageLoadingOverlay from '@/components/ui/PageLoadingOverlay';
import { loadingConfig, getLoadingMessage } from '@/lib/loading-config';

interface PageTransitionContextType {
  isLoading: boolean;
  message: string;
  startTransition: (message?: string) => void;
  endTransition: () => void;
}

const PageTransitionContext = createContext<PageTransitionContextType | undefined>(undefined);

interface PageTransitionProviderProps {
  children: ReactNode;
}

export function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(loadingConfig.pageTransition.defaultMessage);
  const pathname = usePathname();

  // Verificar se o loading está habilitado
  if (!loadingConfig.pageTransition.enabled) {
    return <>{children}</>;
  }

  const startTransition = (customMessage?: string) => {
    setIsLoading(true);
    setMessage(customMessage || loadingConfig.pageTransition.defaultMessage);
  };

  const endTransition = () => {
    setIsLoading(false);
  };

  // Auto-end loading quando a página muda
  useEffect(() => {
    if (isLoading && loadingConfig.autoHide) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, loadingConfig.pageTransition.duration);

      return () => clearTimeout(timer);
    }
  }, [pathname, isLoading]);

  return (
    <PageTransitionContext.Provider
      value={{
        isLoading,
        message,
        startTransition,
        endTransition,
      }}
    >
      {children}
      <PageLoadingOverlay isLoading={isLoading} message={message} />
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (context === undefined) {
    throw new Error('usePageTransition must be used within a PageTransitionProvider');
  }
  return context;
}
