'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ChevronLeft, ChevronRight, Maximize, Minimize, 
  ArrowLeft, ArrowRight, Home
} from 'lucide-react';

const SLIDES = [
  { id: 1, title: 'HubEdu.ia - A Educação do Futuro', path: '/apresentacao/1' },
  { id: 2, title: 'Inovação em Educação', path: '/apresentacao/2' },
  { id: 3, title: 'Módulos de Chat IA', path: '/apresentacao/3' },
  { id: 4, title: 'Preparação para o ENEM', path: '/apresentacao/4' },
  { id: 5, title: 'Comparação com Competidores', path: '/apresentacao/5' },
  { id: 6, title: 'Funcionalidades Avançadas', path: '/apresentacao/6' },
  { id: 7, title: 'Compliance LGPD e BNCC', path: '/apresentacao/7' },
  { id: 8, title: 'Depoimentos', path: '/apresentacao/8' },
  { id: 9, title: 'Comece Hoje', path: '/apresentacao/9' },
  { id: 10, title: 'Demonstração Interativa', path: '/apresentacao/10' },
];

export default function NavigationHeader() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextSlide = () => {
    if (currentSlide < SLIDES.length) {
      const nextSlideNum = currentSlide + 1;
      setCurrentSlide(nextSlideNum);
      router.push(`/apresentacao/${nextSlideNum}`);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 1) {
      const prevSlideNum = currentSlide - 1;
      setCurrentSlide(prevSlideNum);
      router.push(`/apresentacao/${prevSlideNum}`);
    }
  };

  const goToSlide = (slideNum) => {
    setCurrentSlide(slideNum);
    router.push(`/apresentacao/${slideNum}`);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const goHome = () => {
    router.push('/');
  };

  // Update current slide based on URL
  useEffect(() => {
    const path = window.location.pathname;
    const slideMatch = path.match(/\/apresentacao\/(\d+)/);
    if (slideMatch) {
      const slideNum = parseInt(slideMatch[1]);
      if (slideNum >= 1 && slideNum <= SLIDES.length) {
        setCurrentSlide(slideNum);
      }
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'ArrowRight') nextSlide();
      else if (event.key === 'ArrowLeft') prevSlide();
      else if (event.key === 'f' || event.key === 'F') toggleFullscreen();
      else if (event.key === 'Home') goHome();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Image src="/assets/Logo_HubEdu.ia.svg" alt="HubEdu.ia" width={32} height={32} />
            <span className="text-xl font-bold text-gray-900">HubEdu.ia</span>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-4">
            {/* Slide Indicators */}
            <div className="flex space-x-2">
              {SLIDES.map((slide) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(slide.id)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    slide.id === currentSlide 
                      ? 'bg-yellow-500 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  title={`Slide ${slide.id}: ${slide.title}`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              disabled={currentSlide === 1}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Slide anterior (←)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={nextSlide}
              disabled={currentSlide === SLIDES.length}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Próximo slide (→)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              title="Tela cheia (F)"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>

            {/* Home Button */}
            <button
              onClick={goHome}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              title="Voltar ao início (Home)"
            >
              <Home className="w-5 h-5" />
            </button>

            {/* Slide Counter */}
            <span className="text-sm text-gray-600 font-medium">
              {currentSlide} de {SLIDES.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
