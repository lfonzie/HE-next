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
  subtitle: "A plataforma mais completa para escolas brasileiras com IA, simulador ENEM, aulas interativas e chat inteligente.",
  ctaPrimary: "Em Breve",
  ctaSecondary: "Ver Demonstração",
  modules: [
    {
      title: "Aulas Interativas",
      description: "Slides dinâmicos com imagens, quizzes e gamificação.",
      icon: "🎮",
      features: ["14 slides estruturados", "Atividades dinâmicas", "Quizzes interativos", "Gamificação completa"],
      cta: "Explorar Aula"
    },
    {
      title: "Simulador ENEM",
      description: "Mais de 3000 questões oficiais + infinitas geradas por IA.",
      icon: "📚",
      features: ["3000+ questões oficiais", "Questões infinitas por IA", "Modos personalizados", "Análise detalhada"],
      cta: "Fazer Simulado"
    },
    {
      title: "Redação ENEM",
      description: "Correção automática com temas oficiais e tendências atuais.",
      icon: "✍️",
      features: ["Correção automática", "Temas oficiais ENEM", "Tendências 2025", "Feedback detalhado"],
      cta: "Testar Redação"
    },
    {
      title: "Chat Inteligente - 10 Módulos",
      description: "Sistema completo de IA com módulos customizados, chats efêmeros e compliance total com LGPD.",
      icon: "💬",
      features: ["Professor IA", "Suporte T.I.", "Atendimento Pais", "Bem-estar", "Social Media", "Coordenação", "Secretaria", "RH", "Financeiro", "Gestão"],
      cta: "Explorar Módulos"
    }
  ]
};

const lessonsSection = {
  title: "Aulas de 45 Minutos Geradas por IA",
  description: "Aulas completas baseadas na BNCC, transformando qualquer conteúdo em experiências educacionais envolventes.",
  features: [
    {
      title: "Baseadas na BNCC",
      description: "Todas as aulas seguem rigorosamente a Base Nacional Comum Curricular brasileira.",
      icon: "📚"
    },
    {
      title: "Interatividade Total",
      description: "Canvas para desenho, quizzes com feedback instantâneo, atividades colaborativas e gamificação.",
      icon: "🎮"
    },
    {
      title: "Duração Otimizada",
      description: "Aulas de 45 minutos perfeitamente cronometradas para máxima atenção e aprendizado.",
      icon: "⏱️"
    },
    {
      title: "Qualquer Tema",
      description: "Educação, negócios, tecnologia, saúde, arte - qualquer assunto, qualquer nível de conhecimento.",
      icon: "🌍"
    }
  ]
};

const demos = [
  {
    title: "Aulas Interativas",
    description: "Slides dinâmicos com imagens, quizzes e gamificação.",
    cta: "Explorar Aula",
    icon: "🎮",
    features: ["14 slides estruturados", "Atividades dinâmicas", "Quizzes interativos", "Gamificação completa"]
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
    title: "Chat Inteligente - 10 Módulos",
    description: "Sistema completo de IA com módulos customizados, chats efêmeros e compliance total com LGPD.",
    cta: "Explorar Módulos",
    icon: "💬",
    features: ["Professor IA", "Suporte T.I.", "Atendimento Pais", "Bem-estar", "Social Media", "Coordenação", "Secretaria", "RH", "Financeiro", "Gestão"]
  }
];


const schoolsSection = {
  title: "Soluções para Escolas Brasileiras",
  description: "Plataforma completa desenvolvida especificamente para atender as necessidades das instituições de ensino brasileiras.",
  features: [
    {
      title: "Personalização de Conteúdo",
      description: "Adaptação completa do conteúdo educacional para o currículo e metodologia da sua escola.",
      icon: "📚",
      stats: "Conteúdo Customizado"
    },
    {
      title: "Ferramentas de IA para Todos",
      description: "Professores, coordenadores, gestores, alunos e pais têm acesso a ferramentas específicas de IA.",
      icon: "🤖",
      stats: "5 Perfis de Usuário"
    },
    {
      title: "Relatórios em Tempo Real",
      description: "Acompanhamento instantâneo do desempenho de alunos, turmas e professores.",
      icon: "📊",
      stats: "Monitoramento 24/7"
    }
  ]
};

const enemSection = {
  title: "Preparação Completa para o ENEM",
  description: "A plataforma mais completa para estudantes brasileiros se prepararem para o Exame Nacional do Ensino Médio.",
  features: [
    {
      title: "Banco de Questões Gigante",
      description: "Mais de 3000 questões oficiais (2009-2024) + infinitas geradas por IA para prática ilimitada.",
      icon: "📚",
      stats: "3000+ Questões Oficiais"
    },
    {
      title: "Modos de Estudo Inteligentes",
      description: "Modo rápido para revisão, personalizado por dificuldade e oficial completo com cronômetro.",
      icon: "⚡",
      stats: "3 Modos Disponíveis"
    },
    {
      title: "Correção Automática de Redação",
      description: "IA especializada corrige sua redação seguindo critérios oficiais do ENEM com feedback detalhado.",
      icon: "✍️",
      stats: "Correção Instantânea"
    },
    {
      title: "Temas e Tendências 2025",
      description: "Acesso a todos os temas oficiais de redação + análise de tendências para o próximo ENEM.",
      icon: "🎯",
      stats: "Tendências Atualizadas"
    }
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
    answer: "IA gera aulas de 45 minutos baseadas na BNCC com slides, atividades e quizzes sobre qualquer tema."
  },
  {
    question: "As aulas seguem a BNCC?",
    answer: "Sim, todas as aulas são criadas seguindo rigorosamente a Base Nacional Comum Curricular brasileira."
  },
  {
    question: "Quantos módulos tem o chat inteligente?",
    answer: "10 módulos customizados: Professor IA, Suporte T.I., Atendimento Pais, Bem-estar, Social Media, Coordenação, Secretaria, RH, Financeiro e Gestão."
  },
  {
    question: "O simulador ENEM tem quantas questões?",
    answer: "Mais de 3000 questões oficiais (2009-2024) + infinitas geradas por IA."
  },
  {
    question: "Como funciona a correção de redação?",
    answer: "Correção automática com temas oficiais ENEM e análise de tendências 2025."
  },
  {
    question: "O chat é seguro para alunos?",
    answer: "Sim, módulos seguros por faixa etária e função escolar (alunos, professores, coordenação, pais)."
  },
  {
    question: "Os pais têm acesso?",
    answer: "Sim, chat omni-channel para dúvidas com a escola via WhatsApp, site e redes sociais."
  },
  {
    question: "É compatível com LGPD?",
    answer: "Sim, compliance total com LGPD. Chats são efêmeros e dados protegidos com servidores brasileiros."
  },
  {
    question: "Menores de 18 anos podem usar?",
    answer: "Sim, diferentemente do ChatGPT e Grok, nossa plataforma é oficialmente acessível para todas as idades."
  },
  {
    question: "Quando estará disponível?",
    answer: "Em breve, com suporte completo para escolas brasileiras."
  }
];

const finalCta = {
  title: "A Educação do Futuro Chega Em Breve",
  subtitle: "Prepare sua escola para uma nova era.",
  features: [
    "Aulas Interativas - 45 minutos geradas por IA.",
    "Simulador ENEM - +3000 questões oficiais + infinitas por IA.",
    "Redação ENEM - Correção automática com temas oficiais.",
    "Chat Inteligente - 10 módulos customizados para toda escola.",
    "Suporte nacional e configuração rápida."
  ],
  ctaPrimary: "Em Breve",
  ctaSecondary: "Agendar Demonstração"
};

const pricingComparison = {
  title: "Por que Escolher HubEdu.ia?",
  subtitle: "Comparativo com as principais plataformas de IA",
  competitors: [
    {
      name: "ChatGPT",
      price: "US$ 30/mês",
      restrictions: ["Indisponível para menores de 18 anos", "Sem conteúdo específico para escolas", "Não baseado na BNCC", "Sem compliance LGPD"],
      icon: "🤖"
    },
    {
      name: "Grok",
      price: "US$ 30/mês", 
      restrictions: ["Indisponível para menores de 18 anos", "Sem simulador ENEM", "Não baseado na BNCC", "Sem compliance LGPD"],
      icon: "⚡"
    }
  ],
  advantages: [
    "✅ Disponível para todas as idades (incluindo menores)",
    "✅ Conteúdo específico para escolas brasileiras",
    "✅ Baseado na BNCC (Base Nacional Comum Curricular)",
    "✅ Compliance total com LGPD",
    "✅ Chats efêmeros para máxima privacidade",
    "✅ Simulador ENEM com +3000 questões oficiais",
    "✅ Suporte nacional especializado"
  ]
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

const AnimatedCounter = ({ number }: { number: string }) => {
  return <span>{number}</span>;
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
            className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur-3xl"
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
            className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-full blur-3xl"
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
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full blur-2xl"
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
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-lg"
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
              <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">
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
            
            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {hero.modules.map((module, index) => (
                <motion.div 
                  key={index}
                  className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-3">{module.icon}</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{module.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{module.description}</p>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {module.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    className="w-full px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold rounded-xl transition-all duration-300 cursor-not-allowed"
                    disabled
                  >
                    {module.cta}
                  </button>
                </motion.div>
              ))}
            </div>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <button 
                className="group px-10 py-5 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-black text-xl shadow-2xl rounded-2xl flex items-center justify-center gap-3 transform hover:scale-105 transition-all duration-300 cursor-not-allowed"
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
            </div>

          </div>
        </div>
      </section>

      {/* SEÇÃO 2: EXPERIMENTE A EDUCAÇÃO DO FUTURO */}
      <section className="py-20 bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-black mb-6">
              🎮 <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">Veja Como Funciona</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">4 módulos principais + 10 módulos customizados de chat para transformar sua escola</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{typeof feature === 'object' ? feature.icon : '📖'}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">{typeof feature === 'object' ? feature.title : ''}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{typeof feature === 'object' ? feature.description : feature}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Additional Info - 10 Módulos do Chat */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-8 rounded-3xl shadow-2xl">
              <h3 className="text-3xl font-black mb-4">💬 10 Módulos Customizados de Chat IA</h3>
              <p className="text-xl font-semibold mb-8">Sistema completo de inteligência artificial para toda comunidade escolar</p>
              <div className="grid md:grid-cols-5 gap-4">
                <div className="text-center bg-white/20 p-4 rounded-xl">
                  <div className="text-3xl mb-2">👩‍🏫</div>
                  <div className="font-bold text-sm">Professor IA</div>
                  <div className="text-xs">Dúvidas rápidas</div>
                </div>
                <div className="text-center bg-white/20 p-4 rounded-xl">
                  <div className="text-3xl mb-2">💻</div>
                  <div className="font-bold text-sm">Suporte T.I.</div>
                  <div className="text-xs">Funcionários</div>
                </div>
                <div className="text-center bg-white/20 p-4 rounded-xl">
                  <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
                  <div className="font-bold text-sm">Atendimento</div>
                  <div className="text-xs">Pais & Visitantes</div>
                </div>
                <div className="text-center bg-white/20 p-4 rounded-xl">
                  <div className="text-3xl mb-2">💚</div>
                  <div className="font-bold text-sm">Bem-estar</div>
                  <div className="text-xs">Comunidade</div>
                </div>
                <div className="text-center bg-white/20 p-4 rounded-xl">
                  <div className="text-3xl mb-2">📱</div>
                  <div className="font-bold text-sm">Social Media</div>
                  <div className="text-xs">Administração</div>
                </div>
                <div className="text-center bg-white/20 p-4 rounded-xl">
                  <div className="text-3xl mb-2">👨‍💼</div>
                  <div className="font-bold text-sm">Coordenação</div>
                  <div className="text-xs">Gestão escolar</div>
                </div>
                <div className="text-center bg-white/20 p-4 rounded-xl">
                  <div className="text-3xl mb-2">📋</div>
                  <div className="font-bold text-sm">Secretaria</div>
                  <div className="text-xs">Documentação</div>
                </div>
                <div className="text-center bg-white/20 p-4 rounded-xl">
                  <div className="text-3xl mb-2">👥</div>
                  <div className="font-bold text-sm">RH</div>
                  <div className="text-xs">Recursos humanos</div>
                </div>
                <div className="text-center bg-white/20 p-4 rounded-xl">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="font-bold text-sm">Financeiro</div>
                  <div className="text-xs">Contas & Pagamentos</div>
                </div>
                <div className="text-center bg-white/20 p-4 rounded-xl">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="font-bold text-sm">Gestão</div>
                  <div className="text-xs">Relatórios & Analytics</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEÇÃO 3: AULAS QUE FAZEM A DIFERENÇA */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-black mb-6">
              📚 <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">{lessonsSection.title}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">{lessonsSection.description}</p>
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
                    className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-black rounded-xl transition-all duration-300 transform hover:scale-105 cursor-not-allowed"
                    disabled
                  >
                    {demo.cta}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Additional Info - 10 Módulos do Chat */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-8 rounded-3xl shadow-2xl">
              <h3 className="text-3xl font-black mb-4">💬 10 Módulos Customizados de Chat IA</h3>
              <p className="text-xl font-semibold mb-8">Sistema completo de inteligência artificial para toda comunidade escolar</p>
              <div className="grid md:grid-cols-5 gap-4">
                <div className="text-center bg-white/20 p-4 rounded-xl">
                  <div className="text-3xl mb-2">👩‍🏫</div>
                  <div className="font-bold text-sm">Professor IA</div>
                  <div className="text-xs">Dúvidas rápidas</div>
                </div>
                <div className="text-center bg-white/20 p-4 rounded-xl">
                  <div className="text-3xl mb-2">💻</div>
                  <div className="font-bold text-sm">Suporte T.I.</div>
                  <div className="text-xs">Funcionários</div>
                </div>
                <div className="text-center bg-white/20 p-4 rounded-xl">
                  <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
                  <div className="font-bold text-sm">Atendimento</div>
                  <div className="text-xs">Pais & Visitantes</div>
                </div>
                <div className="text-center bg-white/20 p-4 rounded-xl">
                  <div className="text-3xl mb-2">💚</div>
                  <div className="font-bold text-sm">Bem-estar</div>
                  <div className="text-xs">Comunidade</div>
                </div>
                <div className="text-center bg-white/20 p-4 rounded-xl">
                  <div className="text-3xl mb-2">📱</div>
                  <div className="font-bold text-sm">Social Media</div>
                  <div className="text-xs">Administração</div>
                </div>
                <div className="text-center bg-white/20 p-4 rounded-xl">
                  <div className="text-3xl mb-2">👨‍💼</div>
                  <div className="font-bold text-sm">Coordenação</div>
                  <div className="text-xs">Gestão escolar</div>
                </div>
                <div className="text-center bg-white/20 p-4 rounded-xl">
                  <div className="text-3xl mb-2">📋</div>
                  <div className="font-bold text-sm">Secretaria</div>
                  <div className="text-xs">Documentação</div>
                </div>
                <div className="text-center bg-white/20 p-4 rounded-xl">
                  <div className="text-3xl mb-2">👥</div>
                  <div className="font-bold text-sm">RH</div>
                  <div className="text-xs">Recursos humanos</div>
                </div>
                <div className="text-center bg-white/20 p-4 rounded-xl">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="font-bold text-sm">Financeiro</div>
                  <div className="text-xs">Contas & Pagamentos</div>
                </div>
                <div className="text-center bg-white/20 p-4 rounded-xl">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="font-bold text-sm">Gestão</div>
                  <div className="text-xs">Relatórios & Analytics</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* SEÇÃO 4: FEITO PARA ESCOLAS */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-black mb-6">
              🏫 <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">{schoolsSection.title}</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">{schoolsSection.description}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {schoolsSection.features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-400 rounded-2xl p-6 hover:border-yellow-300 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full blur-2xl opacity-20"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-3">{typeof feature === 'object' ? feature.icon : '🎨'}</div>
                    <div className="text-sm font-bold text-yellow-400 bg-yellow-400/20 px-3 py-1 rounded-full inline-block">
                      {typeof feature === 'object' ? feature.stats : ''}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-3 text-center">
                    {typeof feature === 'object' ? feature.title : ''}
                  </h3>
                  
                  <p className="text-gray-300 text-sm leading-relaxed text-center">
                    {typeof feature === 'object' ? feature.description : feature}
                  </p>
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
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-8 rounded-3xl shadow-2xl">
              <h3 className="text-3xl font-black mb-4">🎯 Benefícios para Sua Escola</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                <div className="text-center">
                  <div className="text-4xl mb-3">👨‍🏫</div>
                  <h4 className="font-bold text-lg mb-2">Professores</h4>
                  <p className="text-sm">Ferramentas de criação de aulas e acompanhamento de alunos</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">👨‍💼</div>
                  <h4 className="font-bold text-lg mb-2">Gestores</h4>
                  <p className="text-sm">Relatórios completos e gestão administrativa</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">👨‍🎓</div>
                  <h4 className="font-bold text-lg mb-2">Alunos</h4>
                  <p className="text-sm">Aulas interativas e simuladores personalizados</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">👨‍👩‍👧‍👦</div>
                  <h4 className="font-bold text-lg mb-2">Pais</h4>
                  <p className="text-sm">Acompanhamento do desempenho dos filhos</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEÇÃO 5: SIMULADOR ENEM */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-black mb-6">
              🎓 <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">{enemSection.title}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">{enemSection.description}</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {enemSection.features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200 rounded-2xl p-6 hover:border-yellow-400 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full blur-2xl opacity-30"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-3">{typeof feature === 'object' ? feature.icon : '📊'}</div>
                    <div className="text-sm font-bold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full inline-block">
                      {typeof feature === 'object' ? feature.stats : ''}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
                    {typeof feature === 'object' ? feature.title : ''}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed text-center">
                    {typeof feature === 'object' ? feature.description : feature}
                  </p>
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
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-8 rounded-3xl shadow-2xl">
              <h3 className="text-3xl font-black mb-4">🏆 Por que Escolher Nosso Simulador?</h3>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="text-center">
                  <div className="text-4xl mb-3">📈</div>
                  <h4 className="font-bold text-lg mb-2">Resultados Comprovados</h4>
                  <p className="text-sm">Estudantes aumentam 45% no desempenho</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🎯</div>
                  <h4 className="font-bold text-lg mb-2">Foco no ENEM</h4>
                  <p className="text-sm">Desenvolvido especificamente para o exame brasileiro</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">⚡</div>
                  <h4 className="font-bold text-lg mb-2">Tecnologia Avançada</h4>
                  <p className="text-sm">IA que gera questões infinitas e personalizadas</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEÇÃO 6: O QUE DIZEM SOBRE NÓS */}
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

      {/* SEÇÃO 7: TEMAS DE REDAÇÃO ENEM */}
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
      </Suspense>

      {/* SEÇÃO 8: PERGUNTAS FREQUENTES */}
      <FAQ />

      {/* SEÇÃO 9: CTA FINAL */}
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
            <h3 className="text-2xl font-bold mb-6 text-yellow-400">🎯 4 Módulos Principais:</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {finalCta.features.slice(0, 4).map((feature, index) => {
                const icons = ["🎮", "📚", "✍️", "💬"];
                const colors = ["from-blue-500 to-blue-600", "from-green-500 to-green-600", "from-purple-500 to-purple-600", "from-yellow-500 to-yellow-600"];
                return (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                    <div className={`text-3xl p-3 rounded-xl bg-gradient-to-r ${colors[index]} text-white shadow-lg`}>
                      {icons[index]}
                    </div>
                    <div>
                      <div className="text-gray-300 font-bold text-lg">{feature.split(' - ')[0]}</div>
                      <div className="text-gray-400 text-sm">{feature.split(' - ')[1]}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 p-3 bg-gray-700/50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <span className="text-gray-300 font-medium">{finalCta.features[4]}</span>
              </div>
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

      {/* SEÇÃO 10: COMPARATIVO DE PREÇOS */}
      <section className="py-20 bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-black mb-6">
              💰 <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">Por que Escolher HubEdu.ia?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Comparativo com as principais plataformas de IA</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* ChatGPT */}
            <motion.div 
              className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🤖</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">ChatGPT</h3>
                <div className="text-3xl font-black text-red-500 mb-4">US$ 30/mês</div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-bold text-gray-700 mb-3">❌ Limitações:</h4>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Indisponível para menores de 18 anos</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Sem foco educacional</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Sem módulos específicos para escolas</span>
                </div>
              </div>
            </motion.div>
            
            {/* Grok */}
            <motion.div 
              className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Grok</h3>
                <div className="text-3xl font-black text-red-500 mb-4">US$ 30/mês</div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-bold text-gray-700 mb-3">❌ Limitações:</h4>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Indisponível para menores de 18 anos</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Sem ferramentas pedagógicas</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Sem simulador ENEM</span>
                </div>
              </div>
            </motion.div>
            
            {/* HubEdu.ia */}
            <motion.div 
              className="bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-yellow-500 rounded-2xl p-6 shadow-2xl relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold">
                  🏆 MELHOR ESCOLHA
                </span>
              </div>
              
              <div className="text-center mb-6 mt-4">
                <div className="text-4xl mb-3">🎓</div>
                <h3 className="text-2xl font-bold text-black mb-2">HubEdu.ia</h3>
                <div className="text-3xl font-black text-black mb-4">Preço Especial</div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-bold text-black mb-3">✅ Vantagens:</h4>
                <div className="flex items-start gap-2 text-sm text-black">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Disponível para todas as idades</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-black">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Módulos específicos para educação</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-black">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Simulador ENEM completo</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-black">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Ferramentas pedagógicas integradas</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-black">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Suporte nacional especializado</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="text-center bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-8 rounded-3xl shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-black mb-4">🎯 Por que HubEdu.ia é Superior?</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-bold text-lg mb-3">🚫 Problemas dos Concorrentes:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Restrição de idade:</strong> Menores de 18 anos não podem usar oficialmente</li>
                  <li>• <strong>Preço alto:</strong> US$ 30/mês por usuário (ChatGPT/Grok)</li>
                  <li>• <strong>Sem conteúdo educacional:</strong> Não baseado na BNCC</li>
                  <li>• <strong>Sem compliance LGPD:</strong> Não atendem regulamentações brasileiras</li>
                  <li>• <strong>Sem simulador ENEM:</strong> Não atendem necessidades específicas brasileiras</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-3">✅ Soluções HubEdu.ia:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Todas as idades:</strong> Crianças, adolescentes e adultos incluídos</li>
                  <li>• <strong>Preço especial:</strong> Valor competitivo para escolas brasileiras</li>
                  <li>• <strong>Baseado na BNCC:</strong> Conteúdo alinhado com currículo nacional</li>
                  <li>• <strong>Compliance LGPD:</strong> Chats efêmeros e proteção total de dados</li>
                  <li>• <strong>Simulador ENEM:</strong> +3000 questões oficiais brasileiras</li>
                </ul>
              </div>
            </div>
          </motion.div>
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