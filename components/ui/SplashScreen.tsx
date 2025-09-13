'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onComplete?: () => void;
  minDisplayTime?: number;
  className?: string;
}

export function SplashScreen({ 
  onComplete, 
  minDisplayTime = 2000,
  className 
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [startTime] = useState(Date.now());

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
    <div 
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center",
        "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
        "transition-opacity duration-500 ease-in-out",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Carregando HubEdu.ia"
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 text-center">
        {/* Logo Section */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-glow">
            <Image 
              src="/assets/Logo_HubEdu.ia.svg" 
              alt="HubEdu.ia" 
              width={48}
              height={48}
              className="object-contain filter drop-shadow-lg"
            />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in">
            HubEdu.ia
          </h1>
          <p className="text-yellow-300/80 text-lg animate-fade-in delay-200">
            Inteligência Artificial Educacional Completa
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 animate-slide-up delay-300">
            <div className="w-12 h-12 mx-auto mb-2 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div className="text-white text-sm font-medium">Professor<br/>Digital</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 animate-slide-up delay-400">
            <div className="w-12 h-12 mx-auto mb-2 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
            </div>
            <div className="text-white text-sm font-medium">Automações<br/>Administrativas</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 animate-slide-up delay-500">
            <div className="w-12 h-12 mx-auto mb-2 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z"/>
              </svg>
            </div>
            <div className="text-white text-sm font-medium">Atendimento<br/>Inteligente</div>
          </div>
        </div>

        {/* Loading Section */}
        <div className="animate-slide-up delay-600">
          <div className="w-8 h-8 mx-auto mb-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
          <div className="text-yellow-300/80 text-sm font-medium">
            <span className="animate-pulse">Inicializando</span>
            <span className="animate-dots">...</span>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(255, 210, 51, 0.3);
          }
          50% { 
            box-shadow: 0 0 40px rgba(255, 210, 51, 0.5);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes dots {
          0%, 20% { content: ''; }
          40% { content: '.'; }
          60% { content: '..'; }
          80%, 100% { content: '...'; }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-dots::after {
          content: '';
          animation: dots 1.5s steps(4, end) infinite;
        }
      `}</style>
    </div>
  );
}

export default SplashScreen;
