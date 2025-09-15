'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function ComingSoonPage() {
  const [loadingText, setLoadingText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const text = "EM BREVE";
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setLoadingText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      } else {
        // Reset after showing complete text for a moment
        setTimeout(() => {
          setLoadingText('');
          setCurrentIndex(0);
        }, 2000);
      }
    }, 200);
    
    return () => clearInterval(interval);
  }, [currentIndex, text]);

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 4}s`
            }}
          >
            <div className="w-1 h-1 bg-yellow-400 rounded-full opacity-60"></div>
          </div>
        ))}
        
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-yellow-500/10 to-orange-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

      {/* Logo Animation */}
      <div className="relative z-10 mb-8">
              <div className="relative">
                  <Image 
                    src="/assets/Logo_HubEdu.ia.svg" 
                    alt="HubEdu.ia Logo" 
            width={200}
            height={80}
            className="h-20 w-auto animate-pulse drop-shadow-2xl"
            style={{ animationDuration: '3s' }}
          />
          {/* Glow effect */}
          <div className="absolute inset-0 h-20 w-auto bg-yellow-400/30 rounded-full blur-xl animate-pulse" style={{ animationDuration: '3s' }}></div>
        </div>
          </div>
          
      {/* Main text */}
      <div className="relative z-10 text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-yellow-400 mb-4 drop-shadow-lg">
          {loadingText}
          <span className="animate-pulse text-yellow-300">|</span>
        </h1>
        
        <h2 className="text-2xl font-semibold text-white mb-4 animate-pulse">
          HubEdu.ia
            </h2>
        
        <p className="text-yellow-300 text-lg animate-pulse mb-8">
          Estamos preparando algo incrível para você!
                </p>
              </div>

      {/* Progress Dots */}
      <div className="relative z-10 flex space-x-3 mt-6">
        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce shadow-lg"></div>
        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.2s' }}></div>
          </div>
          
      {/* Floating educational icons */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
                        key={i} 
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${4 + Math.random() * 6}s`
            }}
          >
            <div className="text-yellow-400/40 text-2xl">
              {['📚', '🎓', '💡', '🚀', '⭐', '🎯', '📖', '🔬', '🎨', '🧮'][Math.floor(Math.random() * 10)]}
            </div>
                    </div>
                  ))}
                </div>
          
      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-30px) rotate(180deg); 
          }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}