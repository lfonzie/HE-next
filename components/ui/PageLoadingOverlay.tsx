'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageLoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export default function PageLoadingOverlay({ 
  isLoading, 
  message = 'Carregando página...',
  className 
}: PageLoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center",
            "bg-black/80 backdrop-blur-sm",
            className
          )}
        >
          <div className="text-center space-y-6">
            {/* Spinner animado */}
            <div className="relative w-16 h-16 mx-auto">
              {/* Anel exterior */}
              <div className="absolute inset-0 border-4 border-yellow-400/20 rounded-full" />
              
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
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    transformOrigin: '0 0',
                    transform: `rotate(${i * 60}deg) translateX(18px) translateY(-3px)`
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

            {/* Mensagem */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-yellow-300 text-lg font-medium tracking-wide"
            >
              {message}
            </motion.p>

            {/* Indicadores de progresso */}
            <div className="flex justify-center space-x-2">
              {[...Array(3)].map((_, i) => (
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
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

