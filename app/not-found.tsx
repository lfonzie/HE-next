"use client";

import React from "react";
import Link from "next/link";

// Componente principal da página 404
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Container principal */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Card principal */}
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50">
          {/* Ícone animado */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-yellow-400/30 animate-pulse" />
            <div className="absolute inset-2 rounded-full border-4 border-yellow-400 animate-spin" 
                 style={{ animationDuration: "3s" }} />
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
          </div>
          
          {/* Título principal */}
          <h1 className="text-4xl md:text-6xl font-bold text-yellow-400 mb-4">
            404
          </h1>
          
          {/* Subtítulo */}
          <h2 className="text-xl md:text-2xl font-semibold text-yellow-300 mb-4">
            Página não encontrada
          </h2>
          
          {/* Descrição */}
          <p className="text-gray-300 mb-8 leading-relaxed">
            Ops! Parece que você se perdeu no espaço digital. 
            <br />
            A página que você está procurando não existe ou foi movida.
          </p>
          
          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-300 bg-yellow-500 text-black hover:bg-yellow-400 border border-yellow-400/50 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Voltar ao Início
            </Link>
            
            <Link
              href="/chat"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-300 bg-gray-600/80 text-yellow-100 border border-gray-500/50 hover:bg-gray-700/80"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Ir para Chat
            </Link>
          </div>
          
          {/* Informações adicionais */}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
