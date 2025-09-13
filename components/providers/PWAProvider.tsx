'use client';

import { useEffect, useState } from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';

interface PWAProviderProps {
  children: React.ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isClient, setIsClient] = useState(false);
  
  const { isSupported, isRegistered, isOnline } = useServiceWorker();

  useEffect(() => {
    // Set client-side flag
    setIsClient(true);
  }, []);

  return (
    <>
      {children}
      
      {/* Offline Indicator */}
      {isClient && !isOnline && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-medium">Sem conexão</span>
          </div>
        </div>
      )}

    </>
  );
}
