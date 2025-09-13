// app/(dashboard)/apresentacao/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Users,
  TrendingUp,
  BookOpen,
  Cpu,
  Building,
  BarChart,
  Zap,
  Shield,
  Maximize,
  Minimize,
  Star,
  Brain,
  Clock,
} from "lucide-react";
import { ASSETS } from "@/constants/assets";
import { stats as sharedStats, comparisonCards } from "@/content/home";
import Chat from "./chat/page";
import { QuotaProvider } from "@/components/providers/QuotaProvider";

// Estilos CSS customizados
const customStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 0.4; }
  }
  
  @keyframes slide-up {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes fade-in {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes slide-in-left {
    from { transform: translateX(-50px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slide-in-right {
    from { transform: translateX(50px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slide-in-up {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes scale-in {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  
  @keyframes bounce-in {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); opacity: 1; }
  }
  
  .floating-animation {
    animation: float 3s ease-in-out infinite;
  }
  
  .pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  .slide-up {
    animation: slide-up 0.6s ease-out forwards;
  }
  
  .fade-in {
    animation: fade-in 0.8s ease-out forwards;
  }
  
  .slide-in-left {
    animation: slide-in-left 0.6s ease-out forwards;
  }
  
  .slide-in-right {
    animation: slide-in-right 0.6s ease-out forwards;
  }
  
  .slide-in-up {
    animation: slide-in-up 0.6s ease-out forwards;
  }
  
  .scale-in {
    animation: scale-in 0.6s ease-out forwards;
  }
  
  .bounce-in {
    animation: bounce-in 0.8s ease-out forwards;
  }
  
  .animate-delay-100 {
    animation-delay: 0.1s;
  }
  
  .animate-delay-200 {
    animation-delay: 0.2s;
  }
  
  .animate-delay-300 {
    animation-delay: 0.3s;
  }
  
  .animate-delay-400 {
    animation-delay: 0.4s;
  }
  
  .animate-delay-500 {
    animation-delay: 0.5s;
  }
  
  .gradient-text {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .glass-effect {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .hover-lift {
    transition: all 0.3s ease;
  }
  
  .hover-lift:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  
  .slide-transition {
    transition: opacity 0.6s ease-in-out;
    will-change: opacity;
  }
  
  .slide-active {
    opacity: 1;
    visibility: visible;
    z-index: 10;
  }
  
  .slide-inactive {
    opacity: 0;
    visibility: hidden;
    z-index: 1;
  }
  
  .slide-prev {
    opacity: 0;
    visibility: hidden;
    z-index: 1;
  }
  
  .chat-message {
    animation: fade-in 0.5s ease-out forwards;
  }
  
  .chat-input {
    animation: slide-up 0.3s ease-out forwards;
  }

  /* ===== Layout adaptativo para diferentes tamanhos de tela ===== */
  .apresentacao-slide-center {
    display: grid;
    place-items: center;
    height: 100svh; /* viewport estável em mobile */
    padding: 0.5rem;
    overflow-y: auto;
  }
  
  .apresentacao-content {
    width: 100%;
    max-width: 90rem; /* Aumentado para telas maiores */
    margin-left: auto;
    margin-right: auto;
    padding: 1rem;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
  }
  
  /* Remover margens externas que deslocam o centro visual */
  .apresentacao-content > *:first-child { margin-top: 0 !important; }
  .apresentacao-content > *:last-child { margin-bottom: 0 !important; }
  
  /* Responsividade para telas muito pequenas */
  @media (max-width: 480px) {
    .apresentacao-slide-center {
      padding: 0.25rem;
    }
    .apresentacao-content {
      padding: 0.5rem;
      max-height: calc(100vh - 1rem);
    }
  }
  
  /* Responsividade para tablets */
  @media (min-width: 481px) and (max-width: 768px) {
    .apresentacao-content {
      padding: 1.5rem;
      max-height: calc(100vh - 3rem);
    }
  }
  
  /* Responsividade para desktop pequeno */
  @media (min-width: 769px) and (max-width: 1024px) {
    .apresentacao-content {
      padding: 2rem;
      max-height: calc(100vh - 4rem);
    }
  }
  
  /* Responsividade para desktop grande */
  @media (min-width: 1025px) {
    .apresentacao-content {
      padding: 2.5rem;
      max-height: calc(100vh - 5rem);
    }
  }
  
  /* Ajuste especial para slide 1 - mover conteúdo mais para cima */
  .slide-1-content {
    transform: translateY(-40px);
  }
  
  @media (min-width: 768px) {
    .slide-1-content {
      transform: translateY(-60px);
    }
  }
  
  @media (min-width: 1024px) {
    .slide-1-content {
      transform: translateY(-80px);
    }
  }
  
  /* Layout adaptativo para cards em telas menores */
  .adaptive-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
  }

  /* Grid 2x2 específico para o slide 2 */
  .two-by-two-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
  }
  @media (min-width: 640px) {
    .two-by-two-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }
  }
  
  @media (min-width: 640px) {
    .adaptive-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
  }
  
  @media (min-width: 1024px) {
    .adaptive-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }
  }
  
  /* Layout adaptativo para tabelas */
  .adaptive-table {
    width: 100%;
    overflow-x: auto;
  }
  
  @media (max-width: 768px) {
    .adaptive-table {
      font-size: 0.875rem;
    }
  }

  /* Pequeno ajuste para mover conteúdo para cima em alguns slides */
  .shift-up-small {
    transform: translateY(-12px);
  }
  @media (min-width: 768px) { /* md */
    .shift-up-small { transform: translateY(-24px); }
  }
  @media (min-width: 1024px) { /* lg */
    .shift-up-small { transform: translateY(-32px); }
  }

  /* Ajustes adicionais de deslocamento vertical */
  .shift-up-64 { transform: translateY(-64px); }
  .shift-up-80 { transform: translateY(-80px); }
  .shift-up-100 { transform: translateY(-100px); }
  .shift-up-120 { transform: translateY(-120px); }
`;


export default function Apresentacao() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dados dos slides - será definido em seguida
  const slides = [
    // Slide 1: Introdução
    {
      id: 1,
      title: "HubEdu.ia",
      subtitle: "IA educacional completa para escolas brasileiras",
      content: (
        <div className="text-center slide-1-content">
          <div className="flex justify-center mb-3 mt-8 slide-in-up">
            <div className="relative group floating-animation p-4">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 pulse-glow"></div>
              <img
                src={ASSETS.LOGO_ICON}
                alt="Símbolo da HubEdu.ia"
                className="relative w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 2xl:w-56 2xl:h-56 object-contain transition-all duration-700 hover:scale-110 drop-shadow-2xl"
                style={{ filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.2))" }}
                loading="eager"
              />
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-600 to-orange-500 mb-2 leading-tight slide-in-up animate-delay-100">
            HubEdu.ia
          </h1>
          
          <h2 className="text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold text-black mb-3 leading-tight slide-in-up animate-delay-200">
            IA educacional completa para escolas brasileiras
          </h2>

          <p className="text-sm md:text-base lg:text-lg xl:text-xl text-gray-700 mb-3 leading-relaxed font-medium slide-in-up animate-delay-300">
            Professor digital • Automações administrativas • Atendimento inteligente
          </p>
          
          <p className="text-xs md:text-sm lg:text-base xl:text-lg text-gray-600 mb-4 md:mb-6 lg:mb-8 max-w-3xl mx-auto leading-relaxed slide-in-up animate-delay-400">
            Alinhado à <strong className="text-yellow-600">BNCC</strong>, com <strong className="text-green-600">conversas efêmeras</strong> (LGPD) e suporte em <strong className="text-yellow-600">português do Brasil</strong>.
          </p>
          <div className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-orange-500 text-white p-3 md:p-4 lg:p-6 rounded-2xl mb-3 md:mb-4 lg:mb-6 max-w-3xl mx-auto shadow-2xl slide-in-up animate-delay-500">
            <h3 className="text-base md:text-lg lg:text-xl font-bold mb-2 text-center">Resultado comprovado</h3>
            <p className="text-xs md:text-sm lg:text-base text-center">Até <strong>70% de economia</strong> em custos, <strong>15h/semana</strong> economizadas e uma <strong>comunicação clara</strong> em todos os canais da escola.</p>
          </div>
          <div className="flex justify-center bounce-in animate-delay-500">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-3 md:px-4 lg:px-8 py-2 md:py-3 lg:py-4 text-xs md:text-sm lg:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all w-full md:w-auto max-w-sm">
              👉 Agendar Demonstração Gratuita
            </Button>
          </div>
        </div>
      ),
      background: "bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30"
    },
    // Mais slides serão adicionados em seguida...
  ];

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(prev => prev + 1);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 50);
    }
  }, [currentSlide, isTransitioning, slides.length]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(prev => prev - 1);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 50);
    }
  }, [currentSlide, isTransitioning]);

  const goToSlide = (index: number) => {
    if (!isTransitioning && index !== currentSlide) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 50);
    }
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

  // Navegação por teclado
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Verificar se estamos em um input ou textarea
      const target = event.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true')) {
        return;
      }
      
      // Verificar se estamos em transição
      if (isTransitioning) {
        return;
      }
      
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        event.stopPropagation();
        if (currentSlide < slides.length - 1) {
          nextSlide();
        }
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        event.stopPropagation();
        if (currentSlide > 0) {
          prevSlide();
        }
      }
    };

    // Usar window.addEventListener para capturar eventos globais
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, isTransitioning, nextSlide, prevSlide, slides]);

  return (
    <div className="min-h-screen bg-background text-foreground apresentacao-page">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      {/* Container principal */}
      <div className="relative min-h-screen">
        {/* Background fallback - sempre visível */}
        <div className="fixed inset-0 bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30 z-0"></div>
        
        {/* Slides */}
        <div className="relative h-screen overflow-hidden z-10">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 ${slide.background} slide-transition ${
                index === currentSlide ? 'slide-active' : 
                index < currentSlide ? 'slide-prev' : 'slide-inactive'
              }`}
            >
              <div className="apresentacao-slide-center">
                <div className="apresentacao-content">
                  {slide.content}
                </div>
              </div>
            </div>
          ))}
        </div>
          
        {/* Controles de navegação */}
        <div className="fixed top-1 md:top-2 left-1/2 transform -translate-x-1/2 z-50">
          <div className="flex items-center space-x-0.5 md:space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-1.5 md:px-2 py-0.5 md:py-1 shadow-lg border border-white/20">
            {/* Botão anterior */}
            <Button
              onClick={prevSlide}
              disabled={currentSlide === 0 || isTransitioning}
              variant="outline"
              size="sm"
              className="rounded-full w-5 h-5 md:w-6 md:h-6 p-0 bg-transparent hover:bg-gray-100 border-gray-300 hover:border-gray-400"
            >
              <ChevronLeft className="w-2.5 h-2.5 md:w-3 md:h-3" />
            </Button>

            {/* Indicadores de slide */}
            <div className="flex space-x-0.5 md:space-x-1">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  disabled={isTransitioning}
                  className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-yellow-500 scale-150 ring-2 ring-yellow-400 ring-offset-1 ring-white' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Botão próximo */}
            <Button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1 || isTransitioning}
              variant="outline"
              size="sm"
              className="rounded-full w-5 h-5 md:w-6 md:h-6 p-0 bg-transparent hover:bg-gray-100 border-gray-300 hover:border-gray-400"
            >
              <ChevronRight className="w-2.5 h-2.5 md:w-3 md:h-3" />
            </Button>

            {/* Botão tela cheia */}
            <Button
              onClick={toggleFullscreen}
              variant="outline"
              size="sm"
              className="rounded-full w-5 h-5 md:w-6 md:h-6 p-0 bg-transparent hover:bg-gray-100 border-gray-300 hover:border-gray-400"
              title="Tela cheia (F)"
            >
              {isFullscreen ? <Minimize className="w-2.5 h-2.5 md:w-3 md:h-3" /> : <Maximize className="w-2.5 h-2.5 md:w-3 md:h-3" />}
            </Button>
          </div>
        </div>

        {/* Logotipo - lado esquerdo */}
        <div className="fixed top-4 md:top-8 left-2 md:left-8 z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 md:p-2 shadow-lg border border-white/20">
            <div className="flex items-center space-x-1 md:space-x-2">
              <img
                src={ASSETS.LOGO_ICON}
                alt="HubEdu.ia"
                className="w-4 h-4 md:w-6 md:h-6 object-contain"
                loading="eager"
              />
              <span className="text-xs md:text-sm font-bold text-gray-800">
                HubEdu.ia
              </span>
            </div>
          </div>
        </div>
        
        {/* Contador de slides - lado direito */}
        <div className="fixed top-4 md:top-8 right-2 md:right-8 z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 md:px-4 py-1 md:py-2 shadow-lg border border-white/20">
            <span className="text-xs md:text-sm font-medium text-gray-700">
              {currentSlide + 1} de {slides.length}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
