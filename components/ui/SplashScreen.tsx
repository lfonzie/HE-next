'use client';

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface SplashScreenProps {
  onComplete?: () => void;
  minDisplayTime?: number;
  className?: string;
  showIntro?: boolean;
}

interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
  showOverlay?: boolean;
}

interface LoadingContextType {
  isLoading: boolean;
  message?: string;
  progress?: number;
  startLoading: (message?: string, showOverlay?: boolean) => void;
  updateProgress: (progress: number, message?: string) => void;
  stopLoading: () => void;
  setMessage: (message: string) => void;
}

// ============================================================================
// CONTEXTO E PROVIDER
// ============================================================================

const LoadingContext = createContext<LoadingContextType | null>(null);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    message: undefined,
    progress: undefined,
    showOverlay: false
  });

  const startLoading = (message?: string, showOverlay: boolean = true) => {
    setState({
      isLoading: true,
      message: message || "Carregando...",
      progress: 0,
      showOverlay
    });
  };

  const updateProgress = (progress: number, message?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      message: message || prev.message
    }));
  };

  const stopLoading = () => {
    setState({
      isLoading: false,
      message: undefined,
      progress: undefined,
      showOverlay: false
    });
  };

  const setMessage = (message: string) => {
    setState(prev => ({
      ...prev,
      message
    }));
  };

  const value: LoadingContextType = {
    isLoading: state.isLoading,
    message: state.message,
    progress: state.progress,
    startLoading,
    updateProgress,
    stopLoading,
    setMessage
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

// ============================================================================
// HOOKS AUXILIARES
// ============================================================================

export const useAsyncLoader = () => {
  const { startLoading, stopLoading } = useLoading();

  const withLoading = async <T,>(
    asyncFn: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    startLoading(message);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading();
    }
  };

  return { withLoading };
};

// ============================================================================
// COMPONENTE PRINCIPAL SPLASH SCREEN
// ============================================================================

export function SplashScreen({ 
  onComplete, 
  minDisplayTime = 2000,
  className,
  showIntro = true
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [startTime] = useState(() => typeof window !== 'undefined' ? Date.now() : 0);
  const [isStandalone, setIsStandalone] = useState(false);

  // Detect PWA standalone mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    }
  }, []);

  // Set global flag to prevent other loadings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__SPLASH_ACTIVE__ = true;
    }
    return () => {
      if (typeof window !== 'undefined') {
        (window as any).__SPLASH_ACTIVE__ = false;
      }
    };
  }, []);

  useEffect(() => {
    const hideSplash = () => {
      const elapsed = Date.now() - startTime;
      const delay = Math.max(0, minDisplayTime - elapsed);
      
      setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, delay);
    };

    // Hide splash when app is ready
    const checkAppReady = () => {
      if (document.readyState === 'complete') {
        hideSplash();
      } else {
        setTimeout(checkAppReady, 100);
      }
    };

    // Start checking after a short delay
    setTimeout(checkAppReady, 500);

    // Fallback timeout
    setTimeout(hideSplash, 8000);
  }, [onComplete, minDisplayTime, startTime]);

  if (!isVisible) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center",
        "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Carregando HubEdu.ia"
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />
      </div>

      <div className="relative z-10 text-center">
        {/* Logo Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(255, 210, 51, 0.3)",
                "0 0 40px rgba(255, 210, 51, 0.5)",
                "0 0 20px rgba(255, 210, 51, 0.3)"
              ]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Image 
              src="/favicon.svg" 
              alt="HubEdu.ia" 
              width={48}
              height={48}
              className="object-contain filter drop-shadow-lg"
            />
          </motion.div>
          
          <motion.h1 
            className="text-4xl font-bold text-yellow-400 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            HubEdu.ia
          </motion.h1>
          <motion.p 
            className="text-yellow-300/80 text-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Inteligência Artificial Educacional Completa
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-12 h-12 mx-auto mb-2 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="text-yellow-200 text-sm font-medium">Professor<br/>Digital</div>
          </motion.div>
          
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-12 h-12 mx-auto mb-2 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-yellow-200 text-sm font-medium">Automações<br/>Administrativas</div>
          </motion.div>
          
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-12 h-12 mx-auto mb-2 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="text-yellow-200 text-sm font-medium">Atendimento<br/>Inteligente</div>
          </motion.div>
        </motion.div>

        {/* Loading Section */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.div 
            className="w-8 h-8 mx-auto border-2 border-yellow-400/30 border-t-yellow-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div 
            className="text-yellow-300/80 text-sm font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Carregando HubEdu.ia...
          </motion.div>
        </motion.div>

        {/* PWA Intro Message */}
        {isStandalone && showIntro && (
          <motion.div 
            className="mt-8 text-yellow-200/60 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            Bem-vindo ao HubEdu.ia
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// COMPONENTE DE LOADING OVERLAY GLOBAL
// ============================================================================

export const LoadingOverlay = () => {
  const { isLoading, message, progress, showOverlay } = useLoading();

  if (!isLoading || !showOverlay) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl w-[min(90vw,400px)] text-center border border-gray-700/50"
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div 
              className="w-12 h-12 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            <div className="space-y-2">
              <p className="text-yellow-300 text-sm font-medium">
                {message}
              </p>
            </div>

            {progress !== undefined && (
              <div className="w-full max-w-xs">
                <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    className="bg-yellow-400 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="text-xs text-yellow-200/70 mt-1 text-center">
                  {Math.round(progress)}%
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// COMPONENTE DE INTEGRAÇÃO COM ROTAS
// ============================================================================

export const RouteLoadingGlue = () => {
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    const handleRouteStart = () => {
      startLoading("Navegando...", true);
    };

    const handleRouteComplete = () => {
      stopLoading();
    };

    // Listen for route changes
    window.addEventListener('beforeunload', handleRouteStart);
    window.addEventListener('load', handleRouteComplete);

    return () => {
      window.removeEventListener('beforeunload', handleRouteStart);
      window.removeEventListener('load', handleRouteComplete);
    };
  }, [startLoading, stopLoading]);

  return null;
};

export default SplashScreen;
