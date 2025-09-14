"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Componente de ícone 404 animado
const NotFoundIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("relative", className)}>
      {/* Ícone principal - círculo com traço */}
      <div className="relative w-24 h-24 mx-auto mb-6">
        {/* Círculo de fundo */}
        <div className="absolute inset-0 rounded-full border-4 border-yellow-400/30 animate-pulse" />
        
        {/* Círculo principal */}
        <div className="absolute inset-2 rounded-full border-4 border-yellow-400 animate-spin" 
             style={{ animationDuration: "3s" }} />
        
        {/* Ícone de erro no centro */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-red-400 animate-bounce" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        
        {/* Partículas flutuantes */}
        <div className="absolute -top-2 -right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
        <div className="absolute -bottom-2 -left-2 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping" 
             style={{ animationDelay: "0.5s" }} />
        <div className="absolute top-1/2 -left-3 w-1 h-1 bg-yellow-200 rounded-full animate-ping" 
             style={{ animationDelay: "1s" }} />
      </div>
    </div>
  );
};

// Componente de texto animado
const AnimatedText: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}> = ({ children, className, delay = 0 }) => {
  return (
    <div 
      className={cn("animate-fade-in-up", className)}
      style={{ 
        animationDelay: `${delay}ms`,
        animationFillMode: "both"
      }}
    >
      {children}
    </div>
  );
};

// Componente de botão estilizado
const StyledButton: React.FC<{
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}> = ({ href, children, variant = "primary", className }) => {
  const baseClasses = "inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-yellow-500 text-black hover:bg-yellow-400 border border-yellow-400/50 shadow-lg hover:shadow-xl",
    secondary: "bg-gray-600/80 text-yellow-100 border border-gray-500/50 hover:bg-gray-700/80"
  };

  return (
    <Link
      href={href}
      className={cn(baseClasses, variantClasses[variant], className)}
    >
      {children}
    </Link>
  );
};

// Componente principal da página 404
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Overlay de fundo com padrão */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_0%,transparent_50%)]" />
      
      {/* Container principal */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Card principal */}
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50">
          {/* Ícone animado */}
          <NotFoundIcon />
          
          {/* Título principal */}
          <AnimatedText delay={200}>
            <h1 className="text-4xl md:text-6xl font-bold text-yellow-400 mb-4">
              404
            </h1>
          </AnimatedText>
          
          {/* Subtítulo */}
          <AnimatedText delay={400}>
            <h2 className="text-xl md:text-2xl font-semibold text-yellow-300 mb-4">
              Página não encontrada
            </h2>
          </AnimatedText>
          
          {/* Descrição */}
          <AnimatedText delay={600}>
            <p className="text-gray-300 mb-8 leading-relaxed">
              Ops! Parece que você se perdeu no espaço digital. 
              <br />
              A página que você está procurando não existe ou foi movida.
            </p>
          </AnimatedText>
          
          {/* Botões de ação */}
          <AnimatedText delay={800}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <StyledButton href="/">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Voltar ao Início
              </StyledButton>
              
              <StyledButton href="/chat" variant="secondary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Ir para Chat
              </StyledButton>
            </div>
          </AnimatedText>
          
          {/* Informações adicionais */}
          <AnimatedText delay={1000}>
            <div className="mt-8 pt-6 border-t border-gray-700/50">
              <p className="text-sm text-gray-400">
                Se você acredita que isso é um erro, entre em contato conosco.
              </p>
              <div className="flex justify-center gap-4 mt-3">
                <Link 
                  href="/suporte" 
                  className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  Suporte
                </Link>
                <span className="text-gray-600">•</span>
                <Link 
                  href="/contato" 
                  className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  Contato
                </Link>
              </div>
            </div>
          </AnimatedText>
        </div>
        
        {/* Elementos decorativos */}
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-yellow-400/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-300/5 rounded-full blur-2xl animate-pulse" 
             style={{ animationDelay: "1s" }} />
      </div>
    </div>
  );
};

export default NotFoundPage;
