"use client";

import { SplashScreen } from "@/components/ui/SplashScreen";
import { useState } from "react";

export default function SplashTestPage() {
  const [showSplash, setShowSplash] = useState(false);

  const triggerSplash = () => {
    setShowSplash(true);
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowSplash(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-yellow-400 mb-8">
          🎬 Teste do Splash Screen
        </h1>
        
        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-yellow-300 mb-4">
            Splash Screen HubEdu.ia
          </h2>
          <p className="text-gray-400 mb-6">
            Clique no botão abaixo para ver o splash screen em ação
          </p>
          
          <button
            onClick={triggerSplash}
            className="px-8 py-4 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-500 transition-colors"
          >
            Mostrar Splash Screen
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-xl font-bold text-yellow-300 mb-4">
            Características do Splash Screen:
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <h4 className="font-bold text-yellow-200 mb-2">🎨 Visual:</h4>
              <ul className="space-y-1">
                <li>• Fundo escuro com gradiente</li>
                <li>• Logo HubEdu.ia animado</li>
                <li>• Ícones SVG profissionais</li>
                <li>• Animações Framer Motion</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-yellow-200 mb-2">⚡ Funcionalidades:</h4>
              <ul className="space-y-1">
                <li>• Detecção PWA automática</li>
                <li>• Mensagem de boas-vindas</li>
                <li>• Loading spinner animado</li>
                <li>• Acessibilidade completa</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Splash Screen Component */}
      {showSplash && (
        <SplashScreen
          onComplete={() => {
            console.log("Splash screen completed!");
            setShowSplash(false);
          }}
          minDisplayTime={2000}
          showIntro={true}
        />
      )}
    </div>
  );
}
