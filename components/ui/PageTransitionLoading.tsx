'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from './UnifiedLoadingScreen';

interface PageTransitionLoadingProps {
  children: React.ReactNode;
}

export default function PageTransitionLoading({ children }: PageTransitionLoadingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Interceptar mudanças de rota
    const handleRouteChange = () => {
      setIsLoading(true);
      const key = `route-${Date.now()}`;
      setLoadingKey(key);
    };

    // Simular detecção de mudança de rota
    // Em uma implementação real, isso seria conectado ao router do Next.js
    const timer = setTimeout(() => {
      setIsLoading(false);
      setLoadingKey(null);
    }, 1500); // Loading de 1.5 segundos para transições

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <LoadingScreen
              duration={1500}
              message="Carregando página..."
              variant="fullscreen"
              showProgress={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}

