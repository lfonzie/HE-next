import React from 'react';
import { Play, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface HeroProps {
  data: {
    title: string;
    subtitle: string;
    cta: {
      primary: string;
      secondary: string;
    };
  };
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  className?: string;
}

const Hero: React.FC<HeroProps> = ({ data, features, className = "" }) => {
  return (
    <section className={`pt-20 pb-16 text-white relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold mb-6">
            🎯 NOVIDADE
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold mb-6">
            A plataforma de IA que conecta ensino, gestão e bem-estar em um só lugar
          </h1>
          <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            {data.subtitle}
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-12 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Resultados Comprovados em Escolas Brasileiras:</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="flex items-center gap-3">
                <div className="text-3xl">📈</div>
                <div>
                  <div className="text-lg font-bold">Até 70% de economia em custos operacionais</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-3xl">⏰</div>
                <div>
                  <div className="text-lg font-bold">+300 horas economizadas por mês</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-3xl">👩‍🏫</div>
                <div>
                  <div className="text-lg font-bold">Mais de 15h semanais liberadas para professores</div>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <div className="text-sm opacity-80">Tecnologia baseada no GPT-5 da OpenAI</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link href="/register" className="group px-8 py-4 bg-black hover:bg-gray-800 text-white font-bold text-lg transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-2">
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {data.cta.primary}
            </Link>
            <Link href="/login" className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300 font-semibold flex items-center justify-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {data.cta.secondary}
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-sm opacity-80">Setup em 24h</div>
            </div>
            <div className="text-center">
              <div className="text-sm opacity-80">Suporte brasileiro</div>
            </div>
            <div className="text-center">
              <div className="text-sm opacity-80">Planos flexíveis e sob medida</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
