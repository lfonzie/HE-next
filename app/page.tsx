'use client';

import { useState, useEffect } from 'react';
import { 
  Rocket, Play, MessageSquare, CheckCircle, ArrowRight, 
  Mail, Phone, MapPin, LogIn, Star, Zap, Shield, Heart
} from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Constants
const BRAND = {
  name: "HubEdu.ia",
  tagline: "A Educação do Futuro",
  description: "Plataforma educacional completa com aulas geradas por IA, simulador ENEM, correção automática de redações e sistema de chat inteligente - tudo alinhado com BNCC e LGPD."
};

const MAIN_MODULES = [
  {
    title: "Aulas Interativas",
    description: "Conteúdo personalizado e interativo gerado por IA para cada aluno",
    icon: "🎮",
    color: "from-blue-500 to-blue-600"
  },
  {
    title: "Simulador ENEM", 
    description: "Banco completo de questões + simulações personalizadas por IA",
    icon: "📚",
    color: "from-green-500 to-green-600"
  },
  {
    title: "Redação ENEM",
    description: "Correção inteligente e feedback personalizado para redações",
    icon: "✍️",
    color: "from-purple-500 to-purple-600"
  },
  {
    title: "Chat Inteligente",
    description: "Assistente educacional personalizado para dúvidas e apoio",
    icon: "💬",
    color: "from-yellow-500 to-yellow-600"
  }
];

// Main Component
const ComingSoonPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsVisible(true);
    setScrollY(window.scrollY);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerClasses = `fixed top-0 w-full z-50 transition-all duration-300 ${
    isClient && scrollY > 50 ? 'bg-white/95 backdrop-blur-md shadow-xl' : 'bg-white/90 backdrop-blur-sm'
  } border-b-2 border-yellow-300`;

  return (
    <div className="min-h-dvh w-full overflow-x-hidden">

      {/* Header */}
      <header className={`${headerClasses} safe-top`}>
        <div className="container-fluid-xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image 
              src="/assets/Logo_HubEdu.ia.svg" 
              alt="HubEdu.ia Logo" 
              width={40}
              height={40}
              className="h-10 w-auto"
              priority
            />
            <div className="type-h4 font-bold">
              <span className="text-black">Hub</span>
              <span className="text-yellow-500">Edu</span>
              <span className="text-black">.ia</span>
            </div>
          </div>
          
        </div>
      </header>


      {/* Main Content Section */}
      <section className="bg-gradient-to-b from-neutral-950 to-neutral-900 text-white py-16 relative overflow-hidden pt-24 safe-top">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container-fluid-md mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 sm:space-y-8"
          >
            <h2 className="type-h1 font-extrabold text-white">
              A Educação do Futuro Chega Em Breve
            </h2>
            <p className="type-body-lg text-gray-300 max-w-[65ch] mx-auto">
              Prepare sua escola para uma nova era.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 sm:p-8 rounded-2xl mb-12 border border-gray-700"
          >
            <h3 className="type-h3 font-bold mb-6 text-yellow-400">🎯 4 Módulos Principais:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {MAIN_MODULES.map((feature, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3 sm:gap-4 p-4 bg-gray-700/50 rounded-xl border border-gray-600 hover:border-yellow-400 transition-all duration-300 min-h-[88px]"
                >
                  <div className={`text-2xl sm:text-3xl p-2 sm:p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-lg flex-shrink-0`}>
                    {feature.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="type-h4 text-gray-300 font-bold">{feature.title}</div>
                    <div className="type-small text-gray-400">{feature.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 p-3 bg-gray-700/50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <span className="type-body text-gray-300 font-medium">Suporte nacional e configuração rápida</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
          >
            <button 
              className="min-h-11 min-w-11 px-6 sm:px-8 py-3 sm:py-4 bg-gray-400 text-white font-bold type-body rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-not-allowed"
              disabled
            >
              <Play className="w-5 h-5" />
              Em Breve
            </button>
            <button 
              className="min-h-11 min-w-11 px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-400 text-gray-400 font-semibold type-body rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
              disabled
            >
              <MessageSquare className="w-5 h-5" />
              Agendar Demonstração
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-16 safe-bottom">
        <div className="container-fluid-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-3 mb-6">
              <Image 
                src="/assets/Logo_HubEdu.ia.svg" 
                alt="HubEdu.ia Logo" 
                width={60}
                height={60}
                className="h-15 w-auto"
              />
              <div className="type-h2 font-bold">
                <span className="text-white">Hub</span>
                <span className="text-yellow-400">Edu</span>
                <span className="text-white">.ia</span>
              </div>
            </div>
            
            <div className="flex justify-center items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              <a 
                href="mailto:contato@hubedu.ia.br"
                className="type-body-lg font-semibold text-white hover:text-yellow-400 transition-colors"
              >
                contato@hubedu.ia.br
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="type-small text-gray-500">
                © 2025 HubEdu.ia - Transformando a educação
              </p>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <span className="hover:text-yellow-400 transition-colors px-3 py-1 border border-gray-600 rounded min-h-11 flex items-center">
                  Privacidade
                </span>
                <span className="hover:text-yellow-400 transition-colors px-3 py-1 border border-gray-600 rounded min-h-11 flex items-center">
                  Termos
                </span>
                <span className="hover:text-yellow-400 transition-colors px-3 py-1 border border-gray-600 rounded min-h-11 flex items-center">
                  LGPD
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ComingSoonPage;
