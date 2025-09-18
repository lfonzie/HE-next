'use client';

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Users, Clock, DollarSign, Star, ArrowRight, Play, CheckCircle, MessageSquare, Bot, Zap, Rocket, Shield, Heart, Phone, Mail, MapPin, Target, TrendingUp, BookOpen, Lightbulb, LogIn, ChevronDown, Brain, Award, Globe, BookOpenIcon, GraduationCap, Trophy, Users2, BarChart3, Settings, Calendar, FileText, MessageCircle, Search, Filter, Download, Share2 } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load modals for better performance
const PrivacyPolicyModal = lazy(() => import('../components/modals/PrivacyPolicyModal'));
const TermsOfUseModal = lazy(() => import('../components/modals/TermsOfUseModal'));
const LGPDModal = lazy(() => import('../components/modals/LGPDModal'));

// HubEdu.ia content for new landing page
const hero = {
  title: "HubEdu.ia - A Educação do Futuro",
  subtitle: "Plataforma completa de IA para escolas brasileiras: aulas interativas, simulador ENEM, redação automática e chat inteligente.",
  ctaPrimary: "Em Breve",
  ctaSecondary: "Ver Demonstração",
  stats: [
    { number: "+3000", label: "Questões Oficiais ENEM", icon: BookOpen },
    { number: "∞", label: "Questões Geradas por IA", icon: Brain },
    { number: "45min", label: "Aulas Completas", icon: Clock },
    { number: "100%", label: "Brasileiro", icon: Star }
  ],
  benefits: [
    "✅ Aulas de 45 minutos geradas por IA",
    "✅ Simulador ENEM com +3000 questões oficiais", 
    "✅ Redação automática com correção ENEM",
    "✅ Chat inteligente para toda comunidade escolar"
  ]
};

const lessonsSection = {
  title: "Aulas de 45 Minutos Geradas por IA",
  description: "Aulas completas sobre qualquer tema em minutos.",
  features: [
    "Estrutura de 14 slides com introdução, conteúdo, quizzes e resumo.",
    "Imagens geradas por IA e quizzes interativos.",
    "Duração média: 45 minutos."
  ]
};

const demos = [
  {
    title: "Aulas Interativas",
    description: "Slides dinâmicos com imagens, quizzes e gamificação.",
    cta: "Explorar Aula",
    icon: "🎮",
    features: ["14 slides estruturados", "Imagens geradas por IA", "Quizzes interativos", "Gamificação completa"]
  },
  {
    title: "Simulador ENEM",
    description: "Mais de 3000 questões oficiais + infinitas geradas por IA.",
    cta: "Fazer Simulado",
    icon: "📚",
    features: ["3000+ questões oficiais", "Questões infinitas por IA", "Modos personalizados", "Análise detalhada"]
  },
  {
    title: "Redação ENEM",
    description: "Correção automática com temas oficiais e tendências atuais.",
    cta: "Testar Redação",
    icon: "✍️",
    features: ["Correção automática", "Temas oficiais ENEM", "Tendências 2025", "Feedback detalhado"]
  },
  {
    title: "Chat Inteligente",
    description: "Módulos seguros para alunos, professores, coordenação e pais.",
    cta: "Testar Chat",
    icon: "💬",
    features: ["Chat para alunos", "Suporte professores", "Coordenação escolar", "Pais omni-channel"]
  }
];

const howItWorks = {
  title: "Aulas Inteligentes e Envolventes",
  subtitle: "Criadas para engajar alunos",
  features: [
    {
      title: "Estrutura Pedagógica",
      description: "14 slides com introdução, conceitos, quizzes interativos e resumo.",
      icon: BookOpenIcon
    },
    {
      title: "Interatividade",
      description: "Imagens geradas por IA, canvas para desenho, quizzes com feedback instantâneo.",
      icon: Brain
    },
    {
      title: "Gamificação",
      description: "Pontos, rankings e badges para motivar alunos.",
      icon: Trophy
    },
    {
      title: "Flexibilidade",
      description: "Aulas sobre qualquer tema, adaptadas em tempo real.",
      icon: Settings
    }
  ]
};

const schoolsSection = {
  title: "Soluções para Escolas Brasileiras",
  features: [
    "Ambientes personalizados (cores, logos).",
    "Ferramentas de IA para professores, coordenadores e gestores.",
    "Relatórios de desempenho em tempo real."
  ]
};

const enemSection = {
  title: "Preparação Completa para o ENEM",
  features: [
    "Mais de 3000 questões oficiais (2009-2024) + infinitas geradas por IA.",
    "Modos rápido, personalizado e oficial com análise detalhada.",
    "Explicações claras e correção automática de redação.",
    "Temas de redação oficiais e tendências 2025."
  ]
};

const testimonials = [
  {
    name: "Maria Santos",
    role: "Professora, Escola Nova Era",
    content: "As aulas de 45 minutos são incríveis! Os alunos adoram os quizzes e rankings. A correção automática de redação economiza horas de trabalho.",
    rating: 5
  },
  {
    name: "Carlos Mendes", 
    role: "Coordenador, Instituto Esperança",
    content: "O simulador ENEM com +3000 questões aumentou o desempenho dos alunos em 45%. Os pais adoram o chat omni-channel.",
    rating: 5
  },
  {
    name: "Ana Silva",
    role: "Diretora, Colégio Crescer", 
    content: "A gestão escolar ficou mais fácil com as ferramentas de IA. Chat inteligente para toda comunidade escolar é revolucionário.",
    rating: 5
  }
];

const faqItems = [
  {
    question: "Como são criadas as aulas?",
    answer: "IA gera aulas de 45 minutos com slides, imagens e quizzes sobre qualquer tema."
  },
  {
    question: "As aulas são interativas?",
    answer: "Sim, com quizzes, imagens dinâmicas e gamificação."
  },
  {
    question: "O simulador ENEM é confiável?",
    answer: "Baseado em questões oficiais com explicações claras."
  },
  {
    question: "É seguro?",
    answer: "Compatível com LGPD, com proteção de dados avançada."
  },
  {
    question: "Quando estará disponível?",
    answer: "Em breve, com suporte completo para escolas."
  }
];

const finalCta = {
  title: "A Educação do Futuro Chega Em Breve",
  subtitle: "Prepare sua escola para uma nova era.",
  features: [
    "Aulas de 45 minutos geradas por IA.",
    "Imagens e quizzes interativos.",
    "Simulador ENEM avançado.",
    "Suporte nacional e configuração rápida."
  ],
  ctaPrimary: "Em Breve",
  ctaSecondary: "Agendar Demonstração"
};

const contactInfo = {
  name: "HubEdu.ia - Educação com IA",
  website: "HubEdu.ia.br",
  email: "contato@hubedu.ia",
  phone: "(11) 9999-9999",
  location: "São Paulo, SP",
  links: ["Demonstração", "Suporte", "Privacidade", "Termos"]
};

// Optimized components using Next.js Image
const OptimizedImage = ({ src, alt, className, ...props }: { src: string; alt: string; className?: string; [key: string]: any }) => (
  <Image 
    src={src} 
    alt={alt} 
    className={className}
    width={200}
    height={200}
    loading="lazy"
    {...props}
  />
);

const AnimatedCounter = ({ number, duration = 2000 }: { number: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // Handle special cases like infinity symbol
    if (number === "∞") {
      setCount(1);
      return;
    }
    
    const numericValue = parseInt(number.replace(/\D/g, '')) || 0;
    if (numericValue === 0) return;
    
    const increment = numericValue / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [number, duration]);
  
  // Handle special cases
  if (number === "∞") {
    return <span>∞</span>;
  }
  
  return <span>{count > 0 ? `${count}${number.replace(/\d/g, '')}` : number}</span>;
};

const FAQ = () => {
  const [openItems, setOpenItems] = useState(new Set());
  
  const toggleItem = useCallback((index: number) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  return (
    <section className="py-20 bg-white" aria-labelledby="faq-title">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 id="faq-title" className="text-4xl lg:text-5xl font-bold mb-6">
            ❓ Perguntas <span className="text-yellow-500">Frequentes</span>
          </h2>
          <p className="text-xl text-gray-600">Tire suas principais dúvidas sobre o HubEdu.ia</p>
        </div>
        
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden">
              <button
                className="w-full p-6 text-left hover:bg-yellow-50 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                onClick={() => toggleItem(index)}
                aria-expanded={openItems.has(index)}
                aria-controls={`faq-answer-${index}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">{item.question}</h3>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${
                      openItems.has(index) ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>
              {openItems.has(index) && (
                <div 
                  id={`faq-answer-${index}`}
                  className="px-6 pb-6"
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                >
                  <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HubEduLanding = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [modalsState, setModalsState] = useState({
    privacy: false,
    terms: false,
    lgpd: false
  });

  // Memoized handlers
  const toggleModal = useCallback((modalType: keyof typeof modalsState) => {
    setModalsState(prev => ({
      ...prev,
      [modalType]: !prev[modalType]
    }));
  }, []);

  // Effects
  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Memoized values
  const headerClasses = useMemo(() => 
    `fixed top-0 w-full z-50 transition-all duration-300 ${
      scrollY > 50 ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/90 backdrop-blur-sm'
    } border-b border-yellow-200`,
    [scrollY]
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Lazy load modals */}
      <Suspense fallback={null}>
        {modalsState.privacy && (
          <PrivacyPolicyModal 
            isOpen={modalsState.privacy} 
            onClose={() => toggleModal('privacy')} 
          />
        )}
        {modalsState.terms && (
          <TermsOfUseModal 
            isOpen={modalsState.terms} 
            onClose={() => toggleModal('terms')} 
          />
        )}
        {modalsState.lgpd && (
          <LGPDModal 
            isOpen={modalsState.lgpd} 
            onClose={() => toggleModal('lgpd')} 
          />
        )}
      </Suspense>

      {/* EM BREVE Banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-center py-2 font-bold text-sm">
        🚀 EM BREVE - Lançamento oficial da plataforma HubEdu.ia
      </div>

      {/* Enhanced Header */}
      <header className={headerClasses}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <OptimizedImage 
              src="/assets/Logo_HubEdu.ia.svg" 
              alt="HubEdu.ia Logo" 
              className="h-6 w-6 md:h-8 md:w-8"
              width={160}
              height={40}
            />
            <div className="text-base md:text-xl font-bold truncate">
              <span className="text-black">Hub</span>
              <span className="text-yellow-500">Edu</span>
              <span className="text-black">.ia</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              disabled
              className="px-2 py-1 md:px-6 md:py-3 bg-gray-400 text-white font-bold rounded-xl shadow-lg flex items-center gap-1 md:gap-2 text-sm md:text-base cursor-not-allowed"
              aria-label="Funcionalidade em breve"
            >
              <LogIn className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">EM BREVE</span>
              <span className="sm:hidden">EM BREVE</span>
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* SEÇÃO 1: HERO MODERNA */}
      <section className="bg-gradient-to-br from-yellow-50 via-white to-yellow-100 text-black pt-32 pb-20 relative overflow-hidden">
        {/* Modern animated background */}
        <div className="absolute inset-0 opacity-20">
          <motion.div 
            className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 12, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.1, 0.2],
              rotate: [360, 180, 0]
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full blur-2xl"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.05, 0.15, 0.05]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5
            }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Rocket className="w-5 h-5" />
              🚀 EM BREVE - A Educação do Futuro
            </motion.div>

            {/* Main Title */}
            <motion.h1 
              className="text-6xl lg:text-8xl font-black mb-8 leading-tight text-black"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                HubEdu.ia
              </span>
              <br />
              <span className="text-4xl lg:text-6xl font-bold text-gray-800">
                A Educação do Futuro
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-2xl lg:text-3xl mb-12 text-gray-700 leading-relaxed max-w-4xl mx-auto font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {hero.subtitle}
            </motion.p>
            
            {/* Stats Grid */}
            <motion.div 
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {hero.stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05, y: -5 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                >
                  <div className="flex justify-center mb-3">
                    <stat.icon className="w-8 h-8 text-yellow-500" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-black text-yellow-600 mb-2">
                    <AnimatedCounter number={stat.number} />
                  </div>
                  <div className="text-sm font-semibold text-gray-700">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
            
            {/* CTAs */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <button 
                className="group px-10 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-black text-xl shadow-2xl rounded-2xl flex items-center justify-center gap-3 transform hover:scale-105 transition-all duration-300 cursor-not-allowed"
                disabled
              >
                <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                {hero.ctaPrimary}
              </button>
              <button 
                className="px-10 py-5 border-3 border-yellow-400 hover:bg-yellow-400 hover:text-black text-yellow-600 font-bold text-xl rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 cursor-not-allowed"
                disabled
              >
                <Phone className="w-6 h-6" />
                {hero.ctaSecondary}
                <ArrowRight className="w-6 h-6" />
              </button>
            </motion.div>

            {/* Benefits */}
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              {hero.benefits.map((benefit, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center gap-3 text-lg font-semibold text-gray-700 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-yellow-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6 + index * 0.1 }}
                >
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: AULAS QUE FAZEM A DIFERENÇA */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              📚 <span className="text-yellow-500">{lessonsSection.title}</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">{lessonsSection.description}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {lessonsSection.features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200 rounded-2xl p-6 hover:border-yellow-400 hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">📖</div>
                  <p className="text-gray-700 leading-relaxed">{feature}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: EXPERIMENTE A EDUCAÇÃO DO FUTURO */}
      <section className="py-20 bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-black mb-6">
              🎮 <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Veja Como Funciona</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">4 módulos completos para transformar sua escola</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {demos.map((demo, index) => (
              <motion.div 
                key={index}
                className="group bg-white p-8 rounded-3xl shadow-2xl border-4 border-yellow-200 hover:border-yellow-400 transition-all duration-500 hover:shadow-3xl"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <div className="text-center">
                  <div className="text-8xl mb-6 group-hover:scale-110 transition-transform duration-300">{demo.icon}</div>
                  <h3 className="text-2xl font-black mb-4 text-black group-hover:text-yellow-600 transition-colors">{demo.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed font-medium">{demo.description}</p>
                  
                  {/* Features List */}
                  <div className="space-y-2 mb-8">
                    {demo.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-black rounded-xl transition-all duration-300 transform hover:scale-105 cursor-not-allowed"
                    disabled
                  >
                    {demo.cta}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Additional Info */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black p-8 rounded-3xl shadow-2xl">
              <h3 className="text-3xl font-black mb-4">🎯 Todos os Módulos Inclusos</h3>
              <p className="text-xl font-semibold mb-6">Chat inteligente com módulos seguros para cada faixa etária e função escolar</p>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">👨‍🎓</div>
                  <div className="font-bold">Alunos</div>
                  <div className="text-sm">Suporte 24/7</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">👩‍🏫</div>
                  <div className="font-bold">Professores</div>
                  <div className="text-sm">Ferramentas IA</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">👨‍💼</div>
                  <div className="font-bold">Coordenação</div>
                  <div className="text-sm">Gestão escolar</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">👨‍👩‍👧‍👦</div>
                  <div className="font-bold">Pais</div>
                  <div className="text-sm">Omni-channel</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEÇÃO 4: COMO AS AULAS FUNCIONAM */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              ⚡ <span className="text-yellow-500">{howItWorks.title}</span>
            </h2>
            <p className="text-xl text-gray-600">{howItWorks.subtitle}</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200 rounded-2xl p-6 hover:border-yellow-400 hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className="text-center">
                  <feature.icon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3 text-black">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 5: FEITO PARA ESCOLAS */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              🏫 <span className="text-yellow-500">{schoolsSection.title}</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {schoolsSection.features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:border-yellow-400 transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">🎨</div>
                  <p className="text-white leading-relaxed">{feature}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 6: SIMULADOR ENEM */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              🎓 <span className="text-yellow-500">{enemSection.title}</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {enemSection.features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200 rounded-2xl p-6 hover:border-yellow-400 hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-gray-700 leading-relaxed">{feature}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 7: O QUE DIZEM SOBRE NÓS */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              💬 O que dizem <span className="text-yellow-400">sobre nós</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:border-yellow-400 transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg mb-6 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</blockquote>
                <footer>
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-gray-300">{testimonial.role}</div>
                </footer>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 8: TEMAS DE REDAÇÃO ENEM */}
      <Suspense fallback={
        <div className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-12 bg-gray-300 rounded-lg mb-4 mx-auto w-96"></div>
                <div className="h-6 bg-gray-300 rounded-lg mb-8 mx-auto w-64"></div>
                <div className="h-96 bg-gray-300 rounded-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      }>
        <EnemThemesSection />
      </Suspense>

      {/* SEÇÃO 9: PERGUNTAS FREQUENTES */}
      <FAQ />

      {/* SEÇÃO 10: CTA FINAL */}
      <section className="bg-gradient-to-b from-neutral-950 to-neutral-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            {finalCta.title}
          </h2>
          <p className="text-xl mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {finalCta.subtitle}
          </p>
          
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-2xl mb-12 border border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-yellow-400">🎯 Diferenciais:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {finalCta.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              className="group px-8 py-4 bg-gray-400 text-white font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-not-allowed"
              disabled
            >
              <Play className="w-5 h-5" />
              {finalCta.ctaPrimary}
            </button>
            <button 
              className="px-8 py-4 border-2 border-gray-400 text-gray-400 font-semibold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
              disabled
            >
              <MessageSquare className="w-5 h-5" />
              {finalCta.ctaSecondary}
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO 11: CONTATO */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <OptimizedImage
                  src="/assets/Logo_HubEdu.ia.svg"
                  alt="HubEdu.ia"
                  className="w-12 h-12 object-contain"
                  width={48}
                  height={48}
                />
                <div className="text-3xl font-bold">
                  <span className="text-white">Hub</span>
                  <span className="text-yellow-400">Edu</span>
                  <span className="text-white">.ia</span>
                </div>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                {contactInfo.name}
              </p>
              <div className="flex gap-4">
                <button 
                  className="px-6 py-3 bg-gray-400 text-white font-bold rounded-xl cursor-not-allowed"
                  disabled
                >
                  EM BREVE
                </button>
                <button 
                  className="px-6 py-3 rounded-xl bg-gray-600 text-white font-semibold cursor-not-allowed"
                  disabled
                >
                  EM BREVE
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6 text-yellow-400">Contato</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Website</div>
                    <div className="text-gray-400">{contactInfo.website}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Email</div>
                    <a href={`mailto:${contactInfo.email}`} className="text-gray-400 hover:text-yellow-400 transition-colors">
                      {contactInfo.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Telefone</div>
                    <a href={`tel:+5511999999999`} className="text-gray-400 hover:text-yellow-400 transition-colors">
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Localização</div>
                    <div className="text-gray-400">{contactInfo.location}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6 text-yellow-400">Links</h3>
              <nav className="space-y-3">
                {contactInfo.links.map((link, index) => (
                  <a key={index} href="#" className="block text-gray-400 hover:text-yellow-400 transition-colors">
                    {link}
                  </a>
                ))}
              </nav>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">
                © 2025 HubEdu.ia - Transformando a educação
              </p>
              <div className="flex gap-6 text-sm text-gray-500">
                <button 
                  onClick={() => toggleModal('privacy')}
                  className="hover:text-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded px-3 py-1 border border-gray-600 hover:border-yellow-400"
                >
                  Privacidade
                </button>
                <button 
                  onClick={() => toggleModal('terms')}
                  className="hover:text-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded px-3 py-1 border border-gray-600 hover:border-yellow-400"
                >
                  Termos
                </button>
                <button 
                  onClick={() => toggleModal('lgpd')}
                  className="hover:text-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded px-3 py-1 border border-gray-600 hover:border-yellow-400"
                >
                  LGPD
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HubEduLanding;