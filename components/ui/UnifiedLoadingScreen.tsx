'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENTE DE FUNDO ANIMADO
// ============================================================================

const AnimatedBackground = () => {
  const particlePositions = [
    { left: 49.47, top: 25.68, xOffset: 23.5, duration: 5.2, delay: 1.8 },
    { left: 91.05, top: 8.13, xOffset: -31.2, duration: 6.8, delay: 0.3 },
    { left: 12.83, top: 24.59, xOffset: 18.7, duration: 4.5, delay: 2.1 },
    { left: 26.74, top: 44.98, xOffset: -12.3, duration: 7.1, delay: 0.9 },
    { left: 84.74, top: 65.74, xOffset: 28.9, duration: 5.9, delay: 1.5 },
    { left: 87.42, top: 61.95, xOffset: -19.6, duration: 6.3, delay: 0.7 },
    { left: 96.72, top: 60.31, xOffset: 15.4, duration: 4.8, delay: 2.4 },
    { left: 98.31, top: 67.02, xOffset: -25.1, duration: 7.5, delay: 0.5 },
    { left: 96.65, top: 53.19, xOffset: 22.8, duration: 5.6, delay: 1.2 },
    { left: 7.62, top: 12.03, xOffset: -8.9, duration: 6.7, delay: 0.8 },
    { left: 91.54, top: 84.94, xOffset: 31.5, duration: 4.2, delay: 2.7 },
    { left: 39.16, top: 29.32, xOffset: -16.2, duration: 7.8, delay: 0.4 },
    { left: 87.48, top: 39.76, xOffset: 24.6, duration: 5.4, delay: 1.6 },
    { left: 0.84, top: 32.55, xOffset: -14.7, duration: 6.9, delay: 0.2 },
    { left: 26.54, top: 92.12, xOffset: 19.3, duration: 4.6, delay: 2.5 },
    { left: 62.75, top: 39.12, xOffset: -27.8, duration: 7.2, delay: 0.6 },
    { left: 20.03, top: 0.61, xOffset: 11.5, duration: 5.7, delay: 1.9 },
    { left: 50.35, top: 95.11, xOffset: -21.4, duration: 6.4, delay: 0.1 },
    { left: 62.90, top: 29.06, xOffset: 17.9, duration: 4.9, delay: 2.8 },
    { left: 37.25, top: 90.79, xOffset: -29.6, duration: 7.6, delay: 0.3 }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Partículas flutuantes */}
      {particlePositions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
          style={{
            left: `${pos.left}%`,
            top: `${pos.top}%`,
          }}
          animate={{
            y: [0, -150, 0],
            x: [0, pos.xOffset, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: pos.duration,
            repeat: Infinity,
            delay: pos.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Orbs de gradiente */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-yellow-400/30 to-orange-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-yellow-400/30 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.6, 0.3, 0.6],
          x: [0, -50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  );
};

// ============================================================================
// COMPONENTE DO LOGO
// ============================================================================

const LogoComponent = () => (
  <div className="text-yellow-400 font-bold text-4xl tracking-wider">
    HubEdu.ia
  </div>
);

// ============================================================================
// SPINNER DE CARREGAMENTO PERSONALIZADO
// ============================================================================

const LoadingSpinner = () => {
  return (
    <div className="relative w-16 h-16">
      {/* Anel exterior */}
      <motion.div
        className="absolute inset-0 border-4 border-yellow-400/20 rounded-full"
      />
      
      {/* Anel animado */}
      <motion.div
        className="absolute inset-0 border-4 border-transparent border-t-yellow-400 rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Pontos internos */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          style={{
            top: '50%',
            left: '50%',
            transformOrigin: '0 0',
            transform: `rotate(${i * 45}deg) translateX(20px) translateY(-4px)`
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// BARRA DE PROGRESSO ANIMADA
// ============================================================================

const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <div className="w-80 max-w-sm mx-auto">
      {/* Container da barra */}
      <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
        {/* Barra de progresso */}
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
          style={{ width: `${progress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        
        {/* Efeito de brilho */}
        <motion.div
          className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            x: [-80, 320]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
      
      {/* Texto de porcentagem */}
      <motion.div
        className="text-yellow-300 text-sm font-medium mt-3 text-center"
        key={progress}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {progress}%
      </motion.div>
    </div>
  );
};

// ============================================================================
// MENSAGENS DE LOADING
// ============================================================================

const LoadingMessage = ({ message }: { message: string }) => {
  return (
    <motion.p
      className="text-yellow-300/80 text-lg font-light tracking-wide text-center"
      key={message}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5 }}
    >
      {message}
    </motion.p>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL DE LOADING SCREEN
// ============================================================================

interface LoadingScreenProps {
  onComplete?: () => void;
  duration?: number;
  message?: string;
  showProgress?: boolean;
  variant?: 'fullscreen' | 'overlay';
  className?: string;
}

export default function LoadingScreen({ 
  onComplete, 
  duration = 6000,
  message,
  showProgress = true,
  variant = 'fullscreen',
  className
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const defaultMessages = [
    "Inicializando plataforma...",
    "Carregando recursos educacionais...",
    "Preparando experiência personalizada...",
    "Conectando com a IA educacional...",
    "Finalizando configurações...",
    "Quase pronto!"
  ];

  const messages = message ? [message] : defaultMessages;

  // Simulação do progresso
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          setTimeout(() => {
            onComplete?.();
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, duration / 20);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  // Mudança de mensagens
  useEffect(() => {
    if (messages.length <= 1) return;
    
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % messages.length);
    }, duration / 3);

    return () => clearInterval(messageInterval);
  }, [duration, messages.length]);

  // Pontos animados
  const [dots, setDots] = useState('');
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(dotInterval);
  }, []);

  if (isComplete) {
    return null;
  }

  const containerClasses = variant === 'overlay' 
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center relative overflow-hidden px-4"
    : "min-h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden px-4";

  return (
    <div className={cn(containerClasses, className)}>
      {/* Fundo animado */}
      <AnimatedBackground />
      
      {/* Grid sutil */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 193, 7, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 193, 7, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Conteúdo principal */}
      <div className="relative z-10 text-center space-y-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="relative">
            <LogoComponent />
            <motion.div
              className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl"
              animate={{
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>

        {/* Spinner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <LoadingSpinner />
        </motion.div>

        {/* Barra de progresso */}
        {showProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <ProgressBar progress={Math.min(progress, 100)} />
          </motion.div>
        )}

        {/* Mensagem de loading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="h-8"
        >
          <AnimatePresence mode="wait">
            <LoadingMessage message={messages[currentMessageIndex] + dots} />
          </AnimatePresence>
        </motion.div>

        {/* Indicador de carregamento adicional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex justify-center space-x-2"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-yellow-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Estilos para reduced motion */}
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// COMPONENTES AUXILIARES PARA COMPATIBILIDADE
// ============================================================================

// Spinner simples para uso em botões e componentes menores
export const SimpleSpinner = ({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg', className?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn('animate-spin rounded-full border-2 border-gray-300 border-t-yellow-400', sizeClasses[size], className)} />
  );
};

// Overlay de loading para uso em componentes específicos
export const LoadingOverlay = ({ 
  isLoading, 
  children, 
  message = 'Carregando...' 
}: { 
  isLoading: boolean; 
  children: React.ReactNode; 
  message?: string; 
}) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
        <div className="text-center">
          <SimpleSpinner size="lg" />
          <p className="mt-4 text-yellow-300">{message}</p>
        </div>
      </div>
    </div>
  );
};

// Hook para controle de loading
export const useLoadingScreen = (options: { duration?: number; autoComplete?: boolean } = {}) => {
  const { duration = 6000, autoComplete = true } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const startLoading = () => {
    setIsLoading(true);
    setProgress(0);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setProgress(0);
  };

  const setProgressValue = (value: number) => {
    setProgress(Math.min(100, Math.max(0, value)));
  };

  // Auto-complete loading if enabled
  useEffect(() => {
    if (isLoading && autoComplete) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsLoading(false);
            }, 500);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, duration / 20);

      return () => clearInterval(interval);
    }
  }, [isLoading, autoComplete, duration]);

  return {
    isLoading,
    progress,
    startLoading,
    stopLoading,
    setProgressValue,
  };
};
