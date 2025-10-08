'use client';

import Image from 'next/image';
import { 
  Rocket, Play, Phone, ArrowRight
} from 'lucide-react';
import NavigationHeader from '../components/NavigationHeader';

const BRAND = {
  name: 'HubEdu.ia',
  tagline: 'A Educação do Futuro',
  description: 'Aulas completas em 2 minutos, chat Professor IA para dúvidas, simulador ENEM completo e correção automática por IA de redações e questões. A única plataforma educacional com 5 principais IAs integradas.'
};

const HERO_MODULES = [
  { title: 'Aulas Completas', description: 'Aulas completas sobre qualquer tema com quizzes, geradas em menos de 2 minutos por IA.', icon: '🎮' },
  { title: 'Chat Professor IA', description: 'Professor virtual para tirar dúvidas pedagógicas instantaneamente com 5 principais IAs.', icon: '👩‍🏫' },
  { title: 'Simulador ENEM', description: '3000 questões oficiais (2009-2024) + infinitas geradas por IA com explicações detalhadas.', icon: '📚' },
  { title: 'Redação ENEM', description: 'Todos os temas oficiais desde 1998 + infinitos gerados por IA baseados nas principais tendências.', icon: '✍️' },
];

const FeatureCard = ({ feature }) => (
  <div className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200 hover:border-yellow-400 rounded-xl p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
    <div className="text-center">
      <div className="text-3xl mb-3">{feature.icon}</div>
      <h3 className="text-sm font-bold text-yellow-600 mb-2">{feature.title}</h3>
      <p className="text-gray-600 text-xs leading-relaxed">{feature.description}</p>
    </div>
  </div>
);

export default function Slide1() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-100 text-black relative overflow-hidden">
      <NavigationHeader />
      
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-yellow-400/30 to-yellow-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-yellow-500/30 to-yellow-700/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>
      
      <div className="pt-16 px-4 sm:px-6 lg:px-8 relative z-10 flex items-center min-h-screen">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 py-3 rounded-xl text-sm font-bold mb-6 shadow-lg">
              <Rocket className="w-5 h-5" /> 🚀 EM BREVE - A Educação do Futuro
            </div>
            
            <div className="flex justify-center mb-4">
              <Image src="/assets/Logo_HubEdu.ia.svg" alt="HubEdu.ia Logo" width={80} height={80} className="h-16 w-auto" />
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight text-black">
              <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">
                {BRAND.name}
              </span>
              <br />
              <span className="text-2xl lg:text-4xl font-bold text-gray-800">
                {BRAND.tagline}
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl mb-6 text-gray-700 leading-relaxed max-w-3xl mx-auto font-medium">
              {BRAND.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-black text-lg shadow-xl rounded-xl flex items-center justify-center gap-3 cursor-not-allowed" disabled>
                <Play className="w-5 h-5" /> Em Breve
              </button>
              <button className="px-8 py-4 border-2 border-yellow-500 hover:bg-yellow-500 hover:text-black text-yellow-700 font-bold text-lg rounded-xl flex items-center justify-center gap-3 cursor-not-allowed" disabled>
                <Phone className="w-5 h-5" /> Ver Demonstração <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {HERO_MODULES.map((module, index) => (
                <FeatureCard key={index} feature={module} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
