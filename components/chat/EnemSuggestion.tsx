'use client';

import { ClipboardList, Clock, Target, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  onStartSimulator: (type: 'quick' | 'full') => void;
  className?: string;
}

export function EnemSuggestion({ onStartSimulator, className = '' }: Props) {
  const router = useRouter();

  const handleQuickSimulator = () => {
    onStartSimulator('quick');
    // Navigate to ENEM simulator with quick mode
    router.push('/enem?mode=quick');
  };

  const handleFullSimulator = () => {
    onStartSimulator('full');
    // Navigate to ENEM simulator with full mode
    router.push('/enem?mode=full');
  };

  return (
    <div
      className={`mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 ${className}`}
      role="region"
      aria-label="Sugestão de Simulador ENEM"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-medium text-green-900 text-lg">Simulador ENEM</h4>
          <p className="text-sm text-green-700">
            Pratique com questões reais do ENEM e simulados personalizados
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Quick Simulator */}
        <button
          onClick={handleQuickSimulator}
          className="p-4 bg-white border border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 group"
          aria-label="Iniciar simulado rápido"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <Zap className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-left">
              <h5 className="font-medium text-gray-900">Simulado Rápido</h5>
              <p className="text-sm text-gray-600">10 questões • ~20 min</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-left">
            Ideal para revisão rápida e prática diária
          </p>
        </button>

        {/* Full Simulator */}
        <button
          onClick={handleFullSimulator}
          className="p-4 bg-white border border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 group"
          aria-label="Iniciar simulado completo"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <Target className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-left">
              <h5 className="font-medium text-gray-900">Simulado Completo</h5>
              <p className="text-sm text-gray-600">45 questões • ~90 min</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-left">
            Simulação completa do exame oficial
          </p>
        </button>
      </div>

      {/* Features */}
      <div className="bg-white/50 rounded-lg p-3">
        <h5 className="font-medium text-green-900 mb-2 text-sm">✨ Recursos incluídos:</h5>
        <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
            <span>3000+ questões oficiais</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
            <span>Questões geradas por IA</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
            <span>Análise de performance</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
            <span>Alinhado com BNCC</span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-3 pt-3 border-t border-green-200">
        <div className="flex items-center justify-between text-xs text-green-600">
          <span>🎯 Prepare-se para o ENEM 2025</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Tempo real
          </span>
        </div>
      </div>
    </div>
  );
}
