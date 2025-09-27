'use client';

import { Play, MessageSquare, CheckCircle } from 'lucide-react';
import NavigationHeader from '../components/NavigationHeader';

export default function Slide9() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900 text-white relative overflow-hidden">
      <NavigationHeader />
      
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="pt-16 px-4 sm:px-6 lg:px-8 flex items-center min-h-screen relative z-10">
        <div className="max-w-4xl mx-auto w-full text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            A Educação do Futuro Chega Em Breve
          </h2>
          <p className="text-lg mb-6 text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Prepare sua escola para uma nova era com BNCC, LGPD e IA.
          </p>
          
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl mb-8 border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-yellow-400">🎯 4 Módulos Principais:</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {[
                { title: 'Aulas Interativas', desc: 'Aulas assíncronas de 30-40 min geradas por IA', icon: '🎮', color: 'from-blue-500 to-blue-600' },
                { title: 'Simulador ENEM', desc: '+3000 questões oficiais + infinitas por IA', icon: '📚', color: 'from-green-500 to-green-600' },
                { title: 'Redação ENEM', desc: 'Correção automática com temas oficiais', icon: '✍️', color: 'from-purple-500 to-purple-600' },
                { title: 'Chat Inteligente', desc: '10 módulos para toda a escola', icon: '💬', color: 'from-yellow-500 to-yellow-600' },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className={`text-2xl p-2 rounded-lg bg-gradient-to-r ${feature.color} text-white shadow-lg`}>
                    {feature.icon}
                  </div>
                  <div>
                    <div className="text-gray-300 font-bold text-sm">{feature.title}</div>
                    <div className="text-gray-400 text-xs">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 p-2 bg-gray-700/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <span className="text-gray-300 font-medium text-sm">Suporte nacional e configuração rápida</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <button className="px-6 py-3 bg-gray-400 text-white font-bold text-base rounded-lg shadow-lg flex items-center justify-center gap-2 cursor-not-allowed" disabled>
              <Play className="w-4 h-4" /> Em Breve
            </button>
            <button className="px-6 py-3 border-2 border-gray-400 text-gray-400 font-semibold rounded-lg flex items-center justify-center gap-2 cursor-not-allowed" disabled>
              <MessageSquare className="w-4 h-4" /> Agendar Demonstração
            </button>
          </div>
          
          <div className="text-xs text-gray-400 mb-6">
            <p>✅ <strong>Sem compromisso</strong> • ✅ <strong>Sem cartão de crédito</strong> • ✅ <strong>Resultados em 24h</strong></p>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black p-4 rounded-xl">
            <h4 className="text-lg font-bold mb-2">🚀 Próximos Passos:</h4>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div className="text-center">
                <div className="text-xl mb-1">1️⃣</div>
                <div className="font-semibold">Agende uma Demo</div>
                <div className="text-xs">Veja a plataforma em ação</div>
              </div>
              <div className="text-center">
                <div className="text-xl mb-1">2️⃣</div>
                <div className="font-semibold">Configure sua Escola</div>
                <div className="text-xs">Setup personalizado em 24h</div>
              </div>
              <div className="text-center">
                <div className="text-xl mb-1">3️⃣</div>
                <div className="font-semibold">Transforme a Educação</div>
                <div className="text-xs">Resultados imediatos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
