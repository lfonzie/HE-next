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
  { id: 11, title: '📋 Memorandum de Investimento', path: '/apresentacao/investor', special: true },
];

export default function ApresentacaoMain() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextSlide = () => {
    // Skip the investor memorandum slide in sequential navigation
    if (currentSlide < SLIDES.length - 1) {
      let nextSlideNum = currentSlide + 1;
      // If next slide is the special investor slide, skip it
      if (SLIDES[nextSlideNum - 1]?.special) {
        nextSlideNum++;
      }
      if (nextSlideNum <= SLIDES.length) {
        setCurrentSlide(nextSlideNum);
        router.push(SLIDES[nextSlideNum - 1].path);
      }
    }
  };

  const prevSlide = () => {
    if (currentSlide > 1) {
      let prevSlideNum = currentSlide - 1;
      // If previous slide is the special investor slide, skip it
      if (SLIDES[prevSlideNum - 1]?.special) {
        prevSlideNum--;
      }
      if (prevSlideNum >= 1) {
        setCurrentSlide(prevSlideNum);
        router.push(SLIDES[prevSlideNum - 1].path);
      }
    }
  };

  const goToSlide = (slideNum) => {
    setCurrentSlide(slideNum);
    const slide = SLIDES.find(s => s.id === slideNum);
    if (slide) {
      router.push(slide.path);
    }
  };

  // Update current slide based on URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/apresentacao/investor') {
      setCurrentSlide(11);
    } else {
      const slideMatch = path.match(/\/apresentacao\/(\d+)/);
      if (slideMatch) {
        const slideNum = parseInt(slideMatch[1]);
        if (slideNum >= 1 && slideNum <= SLIDES.length) {
          setCurrentSlide(slideNum);
        }
      }
    }
  }, []);

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
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
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
                    className={`rounded-full transition-all duration-300 ${
                      slide.special
                        ? 'px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                        : `w-3 h-3 ${slide.id === currentSlide
                            ? 'bg-yellow-500 scale-125'
                            : 'bg-gray-300 hover:bg-gray-400'}`
                    }`}
                    title={slide.special ? slide.title : `Slide ${slide.id}: ${slide.title}`}
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

      {/* Content Area */}
      <div className="pt-16 min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100">
        <div className="text-center max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <Image src="/assets/Logo_HubEdu.ia.svg" alt="HubEdu.ia" width={120} height={120} className="mx-auto mb-6" />
            <h1 className="text-5xl font-black text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">
                Apresentação HubEdu.ia
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Navegue pelos slides usando as setas ou clique nos indicadores
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {SLIDES.map((slide) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(slide.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                  slide.special
                    ? slide.id === currentSlide
                      ? 'border-purple-500 bg-purple-50 shadow-lg'
                      : 'border-purple-300 hover:border-purple-400 hover:bg-purple-50 shadow-md'
                    : slide.id === currentSlide
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`rounded-full flex items-center justify-center text-sm font-bold ${
                    slide.special
                      ? slide.id === currentSlide
                        ? 'bg-purple-500 text-white px-3 py-1'
                        : 'bg-purple-200 text-purple-700 px-3 py-1'
                      : `w-8 h-8 ${slide.id === currentSlide ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'}`
                  }`}>
                    {slide.special ? '📋' : slide.id}
            </div>
                  <div>
                    <div className={`font-semibold ${
                      slide.special
                        ? slide.id === currentSlide ? 'text-purple-900' : 'text-purple-700'
                        : 'text-gray-900'
                    }`}>
                      {slide.title}
                    </div>
                </div>
                </div>
                  </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
              onClick={() => goToSlide(1)}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold rounded-lg shadow-lg transition-all duration-300"
            >
              <ArrowRight className="w-5 h-5 inline mr-2" />
              Começar Apresentação
            </button>
            <button
              onClick={goHome}
              className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-all duration-300"
            >
              <Home className="w-5 h-5 inline mr-2" />
              Voltar ao Início
            </button>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>💡 <strong>Dicas de navegação:</strong></p>
            <p>Use as setas ← → para navegar • Pressione F para tela cheia • Home para voltar</p>
          </div>
        </div>
      </div>
    </div>
  );
}
