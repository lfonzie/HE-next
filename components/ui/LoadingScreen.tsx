import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  showProgress?: boolean;
  showPercentage?: boolean;
  variant?: 'default' | 'minimal' | 'gradient' | 'pulse';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  backdropBlur?: boolean;
  onComplete?: () => void;
  duration?: number;
  cancelable?: boolean;
  onCancel?: () => void;
}

interface UseLoadingScreenReturn {
  isLoading: boolean;
  message: string;
  progress: number;
  startLoading: (message?: string, duration?: number) => void;
  stopLoading: () => void;
  updateMessage: (message: string) => void;
  updateProgress: (progress: number) => void;
  simulateProgress: (duration?: number) => void;
}

// Hook aprimorado para gerenciar estado do loading screen
export function useLoadingScreen(): UseLoadingScreenReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Carregando...');
  const [progress, setProgress] = useState(0);

  const simulateProgress = useCallback((duration: number = 3000) => {
    const interval = 50;
    const steps = duration / interval;
    const progressStep = 100 / steps;
    let currentProgress = 0;

    const timer = setInterval(() => {
      currentProgress += progressStep + Math.random() * 2; // Adiciona variação natural
      if (currentProgress >= 100) {
        setProgress(100);
        clearInterval(timer);
      } else {
        setProgress(currentProgress);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const startLoading = useCallback((newMessage?: string, duration?: number) => {
    setIsLoading(true);
    setMessage(newMessage || 'Carregando...');
    setProgress(0);
    
    if (duration) {
      simulateProgress(duration);
    }
  }, [simulateProgress]);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setProgress(100);
  }, []);

  const updateMessage = useCallback((newMessage: string) => {
    setMessage(newMessage);
  }, []);

  const updateProgress = useCallback((newProgress: number) => {
    setProgress(Math.min(100, Math.max(0, newProgress)));
  }, []);

  return {
    isLoading,
    message,
    progress,
    startLoading,
    stopLoading,
    updateMessage,
    updateProgress,
    simulateProgress,
  };
}

// Componente principal aprimorado
export function LoadingScreen({
  isLoading,
  message = 'Carregando...',
  progress = 0,
  showProgress = true,
  showPercentage = true,
  variant = 'default',
  size = 'md',
  className,
  backdropBlur = false,
  onComplete,
  duration,
  cancelable = false,
  onCancel,
}: LoadingScreenProps) {
  const [dots, setDots] = useState('');
  const [mounted, setMounted] = useState(false);

  // Animação dos pontos com useCallback para performance
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Callback quando progresso atinge 100%
  useEffect(() => {
    if (progress >= 100 && onComplete && isLoading) {
      const timer = setTimeout(() => {
        onComplete();
        setMounted(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete, isLoading]);

  // Animação de entrada
  useEffect(() => {
    if (isLoading) {
      setMounted(true);
    }
  }, [isLoading]);

  // Handler para cancelamento
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  // Handler para tecla ESC
  useEffect(() => {
    if (!cancelable || !isLoading) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [cancelable, isLoading, handleCancel]);

  // Configurações por tamanho
  const sizeConfig = useMemo(() => ({
    sm: { spinner: 'w-24 h-24', logo: 'w-12 h-12 text-sm', title: 'text-xl', message: 'text-sm' },
    md: { spinner: 'w-32 h-32', logo: 'w-16 h-16 text-base', title: 'text-2xl', message: 'text-base' },
    lg: { spinner: 'w-48 h-48', logo: 'w-20 h-20 text-lg', title: 'text-3xl', message: 'text-lg' },
    xl: { spinner: 'w-64 h-64', logo: 'w-24 h-24 text-xl', title: 'text-4xl', message: 'text-xl' },
  }), []);

  // Configurações por variante
  const variantConfig = useMemo(() => ({
    default: {
      background: 'bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
      spinner: 'from-orange-500 to-yellow-500',
      logo: 'from-yellow-400 to-orange-500',
      title: 'text-yellow-600 dark:text-yellow-400',
      message: 'text-yellow-500 dark:text-yellow-300',
    },
    minimal: {
      background: 'bg-white/95 dark:bg-gray-900/95',
      spinner: 'from-gray-400 to-gray-600',
      logo: 'from-gray-500 to-gray-700',
      title: 'text-gray-700 dark:text-gray-300',
      message: 'text-gray-500 dark:text-gray-400',
    },
    gradient: {
      background: 'bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900 dark:via-blue-900 dark:to-cyan-900',
      spinner: 'from-purple-500 to-cyan-500',
      logo: 'from-blue-500 to-purple-500',
      title: 'text-purple-600 dark:text-purple-400',
      message: 'text-blue-500 dark:text-blue-300',
    },
    pulse: {
      background: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900 dark:via-green-900 dark:to-teal-900',
      spinner: 'from-emerald-500 to-teal-500',
      logo: 'from-green-500 to-emerald-500',
      title: 'text-emerald-600 dark:text-emerald-400',
      message: 'text-green-500 dark:text-green-300',
    },
  }), []);

  const currentVariant = variantConfig[variant];
  const currentSize = sizeConfig[size];

  if (!isLoading && !mounted) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        currentVariant.background,
        backdropBlur && "backdrop-blur-sm",
        "transition-all duration-500 ease-in-out",
        mounted ? "opacity-100" : "opacity-0",
        className
      )}
      role="dialog"
      aria-live="polite"
      aria-label="Carregando conteúdo"
    >
      <div className="text-center animate-fade-in">
        {/* Spinner Container */}
        <div className={cn("relative mx-auto mb-8", currentSize.spinner)}>
          {/* Anel externo com gradiente dinâmico */}
          <div 
            className={cn(
              "absolute inset-0 rounded-full opacity-75",
              variant === 'pulse' && "animate-pulse-ring"
            )}
            style={{
              background: `conic-gradient(transparent 0deg, theme(colors.orange.500) 90deg, theme(colors.yellow.500) 180deg, theme(colors.orange.500) 270deg, transparent 360deg)`,
              WebkitMask: 'radial-gradient(farthest-side, transparent 45%, #000 46%)',
              mask: 'radial-gradient(farthest-side, transparent 45%, #000 46%)',
              animation: `spin ${variant === 'minimal' ? '3s' : '2s'} linear infinite`,
            }}
          />
          
          {/* Anel interno com animação diferenciada */}
          <div 
            className="absolute inset-4 rounded-full opacity-60"
            style={{
              background: `conic-gradient(theme(colors.yellow.400) 0deg, theme(colors.orange.600) 120deg, theme(colors.yellow.400) 240deg, theme(colors.orange.600) 360deg)`,
              WebkitMask: 'radial-gradient(farthest-side, transparent 45%, #000 46%)',
              mask: 'radial-gradient(farthest-side, transparent 45%, #000 46%)',
              animation: `spin ${variant === 'minimal' ? '4s' : '1.5s'} linear infinite reverse`,
            }}
          />
          
          {/* Logo centralizado com melhor responsividade */}
          <div 
            className={cn(
              "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
              "bg-gradient-to-br shadow-2xl flex items-center justify-center text-white font-bold rounded-full",
              `bg-gradient-to-br ${currentVariant.logo}`,
              currentSize.logo,
              variant === 'pulse' && "animate-pulse-glow"
            )}
          >
            H
          </div>

          {/* Indicador de progresso circular (se habilitado) */}
          {showProgress && progress > 0 && (
            <div 
              className="absolute inset-0 rounded-full border-4 border-transparent"
              style={{
                background: `conic-gradient(theme(colors.green.500) ${progress * 3.6}deg, transparent 0deg)`,
                WebkitMask: 'radial-gradient(farthest-side, transparent 35%, #000 36%)',
                mask: 'radial-gradient(farthest-side, transparent 35%, #000 36%)',
              }}
            />
          )}
        </div>

        {/* Título com animação melhorada */}
        <h1 className={cn(
          "font-bold mb-4 animate-slide-up tracking-wide",
          currentSize.title,
          currentVariant.title
        )}>
          HubEdu.ia
        </h1>

        {/* Mensagem com suporte a múltiplas linhas */}
        <div className={cn(
          "mb-6 animate-slide-up max-w-md mx-auto",
          currentSize.message,
          currentVariant.message
        )} 
        style={{ animationDelay: '0.2s' }}>
          <p className="leading-relaxed">
            {message}{dots}
          </p>
        </div>

        {/* Barra de progresso aprimorada */}
        {showProgress && (
          <div className="w-80 max-w-sm mx-auto mb-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="relative bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out relative",
                  "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
                )}
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                {/* Efeito de brilho na barra */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
            {showPercentage && (
              <div className={cn("text-sm mt-3 font-medium", currentVariant.message)}>
                {Math.round(Math.min(progress, 100))}%
              </div>
            )}
          </div>
        )}

        {/* Botão de cancelar (se habilitado) */}
        {cancelable && (
          <button
            onClick={handleCancel}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
              "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600",
              "text-gray-700 dark:text-gray-300 animate-slide-up"
            )}
            style={{ animationDelay: '0.6s' }}
            aria-label="Cancelar carregamento"
          >
            Cancelar (ESC)
          </button>
        )}

        {/* Pontos animados com variação */}
        {!cancelable && (
          <div className="flex justify-center space-x-3 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-2.5 h-2.5 rounded-full animate-bounce-alt",
                  variant === 'minimal' ? 'bg-gray-400' : 'bg-orange-500'
                )}
                style={{ 
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.4s'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Estilos CSS aprimorados */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse-ring {
          0% { opacity: 0.6; transform: scale(0.95); }
          50% { opacity: 0.8; transform: scale(1.05); }
          100% { opacity: 0.6; transform: scale(0.95); }
        }

        @keyframes pulse-glow {
          0%, 100% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 0 0 20px rgba(249, 115, 22, 0.4);
          }
          50% { 
            opacity: 0.9; 
            transform: translate(-50%, -50%) scale(1.02);
            box-shadow: 0 0 30px rgba(249, 115, 22, 0.6);
          }
        }
        
        @keyframes bounce-alt {
          0%, 80%, 100% { 
            transform: scale(0.8); 
            opacity: 0.5;
          }
          40% { 
            transform: scale(1.1); 
            opacity: 1;
          }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slide-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-bounce-alt {
          animation: bounce-alt 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}

// Spinner aprimorado com mais variantes
export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default',
  className 
}: { 
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; 
  variant?: 'default' | 'dots' | 'pulse' | 'ring';
  className?: string; 
}) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  if (variant === 'dots') {
    return (
      <div className={cn('flex space-x-1', className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'bg-orange-500 rounded-full animate-bounce',
              sizeClasses[size]
            )}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn(
        'bg-orange-500 rounded-full animate-pulse',
        sizeClasses[size],
        className
      )} />
    );
  }

  if (variant === 'ring') {
    return (
      <div className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-orange-500',
        sizeClasses[size],
        className
      )} />
    );
  }

  return (
    <div className={cn(
      'animate-spin rounded-full border-2 border-gray-300 border-t-orange-500',
      sizeClasses[size],
      className
    )} />
  );
}

// Card de loading aprimorado
export function LoadingCard({ 
  message = 'Carregando...',
  showSpinner = true,
  variant = 'default',
  className 
}: { 
  message?: string; 
  showSpinner?: boolean;
  variant?: 'default' | 'minimal' | 'skeleton';
  className?: string; 
}) {
  if (variant === 'skeleton') {
    return (
      <div className={cn(
        'animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 space-y-4',
        className
      )}>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border',
      'transition-all duration-300 hover:shadow-md',
      className
    )}>
      {showSpinner && (
        <LoadingSpinner 
          size="lg" 
          variant={variant === 'minimal' ? 'ring' : 'default'}
          className="mb-4" 
        />
      )}
      <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
        {message}
      </p>
    </div>
  );
}

export default LoadingScreen;
