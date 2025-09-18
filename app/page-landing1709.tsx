// Landing page backup saved as landing1709
// This file contains the original HubEdu.ia landing page content

'use client';

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Users, Clock, DollarSign, Star, ArrowRight, Play, CheckCircle, MessageSquare, Bot, Zap, Rocket, Shield, Heart, Phone, Mail, MapPin, Target, TrendingUp, BookOpen, Lightbulb, LogIn, ChevronDown } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';

// Lazy load modals for better performance
const PrivacyPolicyModal = lazy(() => import('../components/modals/PrivacyPolicyModal'));
const TermsOfUseModal = lazy(() => import('../components/modals/TermsOfUseModal'));
const LGPDModal = lazy(() => import('../components/modals/LGPDModal'));

// HubEdu.ia content
const hero = {
  title: "A plataforma de IA que conecta ensino, gestão e bem-estar em um só lugar",
  subtitle: "Muito além de um chat com IA",
  description: "Professor digital, automação administrativa e atendimento inteligente em um só lugar",
  features: ["Professor Digital 24/7", "Automação Completa", "Atendimento Inteligente"]
};

const stats = [
  { number: "+300h", label: "Economizadas por mês", icon: Clock },
  { number: "70%", label: "Economia em custos operacionais", icon: DollarSign },
  { number: "15h+", label: "Semanais liberadas para professores", icon: Users },
  { number: "100%", label: "Brasileiro", icon: Star }
];

const modules = [
  {
    icon: "👩‍🏫",
    title: "Professor IA",
    desc: "Suporte 24h em todas as matérias",
    benefits: ["Respostas imediatas", "Conteúdo BNCC", "Adaptado por idade"],
    status: "active",
    badge: "Novo!"
  },
  {
    icon: "⚙️",
    title: "TI",
    desc: "80% menos chamados técnicos",
    benefits: ["Suporte automatizado", "Diagnósticos rápidos", "Soluções eficazes"],
    status: "active"
  },
  {
    icon: "📋",
    title: "Atendimento",
    desc: "Matrículas e documentos organizados",
    benefits: ["Processos digitais", "Documentação ágil", "Zero papel"],
    status: "active"
  },
  {
    icon: "💰",
    title: "Financeiro",
    desc: "Políticas e prazos claros",
    benefits: ["Pagamentos online", "Lembretes automáticos", "Relatórios claros"],
    status: "active"
  },
  {
    icon: "👥",
    title: "RH",
    desc: "Férias e benefícios acessíveis",
    benefits: ["Gestão de pessoal", "Benefícios digitais", "Comunicação eficaz"],
    status: "active"
  },
  {
    icon: "🤝",
    title: "Atendimento Omni-Channel",
    desc: "Respostas automáticas em todos os canais",
    benefits: ["WhatsApp integrado", "Respostas consistentes", "Atendimento 24/7"],
    status: "em-breve"
  },
  {
    icon: "📊",
    title: "Relatórios & Analytics",
    desc: "Insights e métricas detalhadas",
    benefits: ["Relatórios automáticos", "Dashboards interativos", "Métricas de performance"],
    status: "em-breve"
  },
  {
    icon: "🔗",
    title: "Integração com Sistemas",
    desc: "Conecta com ERPs existentes",
    benefits: ["Integração seamless", "Sincronização automática", "Compatibilidade total"],
    status: "em-breve"
  },
  {
    icon: "💚",
    title: "Bem-estar e Social Media",
    desc: "Gestão de redes sociais e bem-estar",
    benefits: ["Posts automáticos", "Monitoramento de bem-estar", "Engajamento digital"],
    status: "active"
  }
];

const demoScenarios = [
  {
    title: "Professor IA - Matemática",
    student: "Como resolver equação de segundo grau?",
    ai: "Vou te explicar passo a passo! A fórmula de Bhaskara é x = (-b ± √(b²-4ac))/2a. Que tal resolvermos um exemplo prático? 📐"
  },
  {
    title: "Atendimento - Matrícula",
    student: "Quais documentos preciso para matrícula?",
    ai: "Para matrícula você precisa: RG e CPF do aluno, comprovante de residência, histórico escolar e 2 fotos 3x4. Posso agendar uma visita?"
  },
  {
    title: "TI - Suporte",
    student: "Meu computador está lento, o que fazer?",
    ai: "Vou te ajudar! Primeiro, vamos verificar se há muitos programas abertos. Pode fechar os que não está usando e reiniciar o computador?"
  }
];

const depoimentos = [
  {
    name: "Ana Silva",
    role: "Diretora Pedagógica, Colégio Crescer • 450 alunos",
    content: "O HubEdu.ia cortou 70% do tempo com tarefas administrativas. Agora, nossa equipe foca no ensino de qualidade.",
    rating: 5
  },
  {
    name: "Carlos Mendes",
    role: "Coordenador de TI, Instituto Esperança • 280 alunos",
    content: "Chamados técnicos caíram drasticamente. O que levava horas, agora se resolve em minutos.",
    rating: 5
  },
  {
    name: "Maria Santos",
    role: "Professora de Matemática, Escola Nova Era • 320 alunos",
    content: "Os alunos adoram o tutor. É como um professor particular 24/7, com respostas seguras e adequadas à idade.",
    rating: 5
  }
];

const planos = {
  title: "Preços",
  subtitle: "Em breve, preços transparentes e sem surpresas.",
  plans: [
    {
      name: "Escolas até 150 alunos",
      subtitle: "Preço fixo para escolas pequenas e médias",
      price: "EM BREVE",
      period: "",
      description: "• Professor IA 24/7\n• 9 módulos administrativos\n• Suporte técnico brasileiro\n• Treinamento completo",
      highlight: true,
      buttonText: "EM BREVE"
    },
    {
      name: "Escolas maiores",
      subtitle: "Desconto progressivo para escolas maiores",
      price: "EM BREVE",
      period: "",
      description: "• Todos os recursos inclusos\n• Desconto progressivo\n• Suporte dedicado\n• Personalização total",
      highlight: false,
      buttonText: "EM BREVE"
    }
  ]
};

const visual = {
  gradientHero: "bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500",
  sectionDark: "bg-gradient-to-b from-gray-900 to-black"
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

  const faqItems = [
    {
      question: "🔧 O HubEdu.ai substitui meu ERP/SGE atual?",
      answer: "Não, ele complementa seu sistema atual. O HubEdu.ia padroniza e automatiza o fluxo de informações, integrando-se perfeitamente com ERPs como Lyceum, Prime, Educacional, entre outros."
    },
    {
      question: "📞 Como funciona o atendimento omni-channel?",
      answer: "A escola configura as informações principais no painel, e o HubEdu.ia responde automaticamente em WhatsApp, site, Instagram, Facebook e Google. Respostas consistentes em todos os canais, 24/7."
    },
    {
      question: "🔒 Os dados dos alunos ficam seguros?",
      answer: "Totalmente seguro. Todas as conversas são efêmeras (não armazenadas), em total conformidade com a LGPD. Usamos criptografia de ponta a ponta e servidores brasileiros."
    },
    {
      question: "⏱️ Quanto tempo leva para implementar?",
      answer: "Apenas 24 horas! Nossa equipe faz todo o setup inicial, treinamento da sua equipe e configuração personalizada. Você começa a ver resultados no primeiro dia."
    },
    {
      question: "💰 Como funciona o modelo de preços?",
      answer: "Preço a partir de R$ 2.000/mês por escola (até 150 alunos). Sem cobrança por usuário, sem taxas extras, todos os módulos inclusos. Escolas maiores têm desconto progressivo."
    }
  ];

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
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">Ainda tem dúvidas? Fale com nossos especialistas!</p>
          <button 
            className="px-8 py-3 bg-gray-400 text-white font-bold shadow-lg rounded-xl cursor-not-allowed"
            disabled
            aria-label="Funcionalidade em breve"
          >
            💬 EM BREVE
          </button>
        </div>
      </div>
    </section>
  );
};

const HubEduLanding = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeDemo, setActiveDemo] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [modalsState, setModalsState] = useState({
    privacy: false,
    terms: false,
    lgpd: false
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const loading = useGlobalLoading();

  // Memoized handlers
  const toggleModal = useCallback((modalType: keyof typeof modalsState) => {
    setModalsState(prev => ({
      ...prev,
      [modalType]: !prev[modalType]
    }));
  }, []);

  const handleLogin = useCallback(async () => {
    if (isLoggingIn) return; // Prevenir múltiplos cliques
    
    setIsLoggingIn(true);
    loading.show(300, { message: "Carregando…" });
    
    try {
      // Simular delay mínimo para evitar flicker
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Redirecionar para login
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro no login:', error);
      loading.hide();
      setIsLoggingIn(false);
    }
  }, [isLoggingIn, loading]);


  // Effects
  useEffect(() => {
    setIsVisible(true);
    
    const demoInterval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % demoScenarios.length);
    }, 6000);

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(demoInterval);
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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-yellow-50 to-white text-black pt-32 pb-20 relative overflow-hidden">
        {/* Subtle animated background */}
        <div className="absolute inset-0 opacity-10">
          <motion.div 
            className="absolute top-20 left-10 w-72 h-72 bg-yellow-400 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"
            animate={{ 
              scale: [1.1, 1, 1.1],
              opacity: [0.2, 0.1, 0.2]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div 
              className="transform transition-all duration-1000"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                className="flex items-center gap-2 mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  NOVIDADE
                </span>
                <span className="text-gray-600">A plataforma de IA que conecta ensino, gestão e bem-estar em um só lugar</span>
              </motion.div>
              
              <motion.h1 
                className="text-5xl lg:text-7xl font-bold mb-6 leading-tight text-black"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Muito além de um
                <span className="block text-yellow-500 relative">
                  chat com IA
                  <motion.div 
                    className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 0.8 }}
                  />
              </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl mb-8 text-gray-600 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <strong>Professor digital</strong>, automação administrativa e atendimento inteligente em um só lugar
              </motion.p>
              
              {/* Enhanced result box */}
              <motion.div 
                className="bg-gradient-to-r from-black to-gray-800 text-white p-6 rounded-2xl mb-8 shadow-2xl border-l-4 border-yellow-400"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-yellow-400 font-bold text-lg">Resultados Comprovados em Escolas Brasileiras:</h3>
          </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span>Até 70% de economia em custos operacionais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span>+300 horas economizadas por mês</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    <span>Mais de 15h semanais liberadas para professores</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-yellow-400" />
                    <span>Tecnologia baseada no GPT-5 da OpenAI</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
            <button 
              className="group px-8 py-4 bg-gray-400 text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 cursor-not-allowed"
              disabled
            >
                  <Play className="w-5 h-5" />
              EM BREVE
            </button>
            <button 
              className="px-8 py-4 border-2 border-gray-400 text-gray-400 font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
              disabled
                >
                  <Phone className="w-5 h-5" />
                  EM BREVE
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-6 mt-6 text-sm text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Setup em 24h</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Suporte brasileiro</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Planos flexíveis e sob medida</span>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Right Column - Logo and Demo */}
            <motion.div 
              className="transform transition-all duration-1000 delay-300"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative">
                {/* Grande Logo à direita */}
                <motion.div 
                  className="flex justify-center mb-8"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  <Image 
                    src="/assets/Logo_HubEdu.ia.svg" 
                    alt="HubEdu.ia Logo" 
                    className="h-24 lg:h-32 w-auto"
                    width={256}
                    height={128}
                    priority
                    unoptimized
                  />
                </motion.div>
                
                {/* Enhanced demo card */}
                <motion.div 
                  className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-yellow-400 transform rotate-1 hover:rotate-0 transition-transform duration-500"
                  initial={{ rotate: 5, scale: 0.8 }}
                  animate={{ rotate: 1, scale: 1 }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
                  whileHover={{ rotate: 0, scale: 1.05 }}
                >
                  <div className="transform -rotate-1">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-6 h-6 text-yellow-500">💡</div>
                      <h3 className="text-2xl font-bold text-black">Sistema Completo de IA Educacional</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <motion.div 
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-yellow-50 rounded-xl hover:from-yellow-50 hover:to-yellow-100 transition-all duration-300 group"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 }}
                        whileHover={{ x: 5 }}
                      >
                        <div className="text-yellow-500 group-hover:scale-110 transition-transform text-2xl">
                          🤖
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-black">Professor IA 24h</h4>
                            <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded-full">
                              Novo!
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Tutor digital seguro, adaptado por faixa etária e alinhado à BNCC
                          </p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-yellow-50 rounded-xl hover:from-yellow-50 hover:to-yellow-100 transition-all duration-300 group"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0 }}
                        whileHover={{ x: 5 }}
                      >
                        <div className="text-yellow-500 group-hover:scale-110 transition-transform text-2xl">
                          ⚡
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-black">Automações Administrativas</h4>
                            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                              Popular
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            TI, Secretaria, RH e Financeiro mais ágeis e eficientes
                          </p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-yellow-50 rounded-xl hover:from-yellow-50 hover:to-yellow-100 transition-all duration-300 group"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.1 }}
                        whileHover={{ x: 5 }}
                      >
                        <div className="text-yellow-500 group-hover:scale-110 transition-transform text-2xl">
                          💬
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-black">Atendimento Omni-Channel</h4>
                            <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded-full">
                              Essencial
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Pais e alunos atendidos em todos os canais com respostas padronizadas
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              📊 Números que <span className="text-yellow-500">Falam por Si</span>
            </h2>
            <p className="text-xl text-gray-300">Resultados reais de escolas que já transformaram sua gestão</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 hover:border-yellow-400 transform hover:scale-105 transition-all duration-300">
                  <div className="flex justify-center mb-3">
                    <stat.icon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="text-3xl lg:text-5xl font-bold text-yellow-400 mb-2">
                    <AnimatedCounter number={stat.number} />
                  </div>
                  <div className="text-gray-300">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-white">
              Junte-se às escolas que já transformaram sua gestão com o HubEdu.ia
            </h3>
            <button className="px-8 py-3 bg-gray-400 text-white font-bold rounded-xl shadow-lg cursor-not-allowed" disabled>
              EM BREVE
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className="py-20 bg-gradient-to-r from-yellow-50 to-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              🎮 <span className="text-yellow-500">Veja em Ação:</span> Demo Interativa
            </h2>
            <p className="text-xl text-gray-600">Experimente como o HubEdu.ia funciona na prática</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-4">
              {demoScenarios.map((scenario, index) => (
                <button
                  key={index}
                  onClick={() => setActiveDemo(index)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                    activeDemo === index 
                      ? 'bg-yellow-400 text-black shadow-lg' 
                      : 'bg-white hover:bg-yellow-50 border-2 border-gray-200 hover:border-yellow-300'
                  }`}
                  aria-pressed={activeDemo === index}
                >
                  <h3 className="font-bold text-lg mb-2">{scenario.title}</h3>
                  <p className="text-sm opacity-75">Clique para ver a conversa</p>
                </button>
              ))}
            </div>
            
            <div className="bg-gradient-to-br from-black to-gray-800 p-8 rounded-3xl text-white shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Bot className="w-8 h-8 text-yellow-400" />
                <h3 className="text-xl font-bold">{demoScenarios[activeDemo].title}</h3>
                <div className="ml-auto flex gap-1">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                </div>
              </div>
              
              <div className="space-y-4 min-h-[200px]" role="log" aria-live="polite">
                <div className="bg-gray-700 p-4 rounded-xl rounded-br-sm">
                  <p className="text-sm text-gray-300 mb-2">👤 Usuário</p>
                  <p className="text-white">{demoScenarios[activeDemo].student}</p>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black p-4 rounded-xl rounded-bl-sm">
                  <p className="text-sm text-gray-700 mb-2">🤖 HubEdu.ia</p>
                  <p className="font-medium">{demoScenarios[activeDemo].ai}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-600">
                <p className="text-sm text-gray-400">
                  ⚡ Resposta gerada em menos de 2 segundos • 🛡️ Conteúdo seguro e educacional
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              ⚙️ <span className="text-yellow-500">Módulos</span> Integrados
            </h2>
            <p className="text-xl text-gray-600">Até +60% de eficiência operacional em todas as áreas</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((module, index) => (
              <motion.div 
                key={index} 
                className="group relative"
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
                <motion.div 
                  className="p-6 bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200 rounded-2xl hover:border-yellow-400 hover:shadow-xl transition-all duration-300 h-full"
                  whileHover={{ 
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                    borderColor: "#facc15",
                    scale: 1.02
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <motion.div 
                      className="text-4xl" 
                      role="img" 
                      aria-label="Ícone do módulo"
                      whileHover={{ 
                        scale: 1.2, 
                        rotate: 10,
                        filter: "drop-shadow(0 0 10px rgba(250, 204, 21, 0.5))"
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {module.icon}
                    </motion.div>
                    <div className="flex gap-2">
                      {module.badge && (
                        <motion.span 
                          className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
                        >
                          {module.badge}
                        </motion.span>
                      )}
                    {module.status === 'em-breve' && (
                        <motion.span 
                          className="bg-gray-400 text-white px-2 py-1 rounded-full text-xs font-medium"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
                        >
                        EM BREVE
                        </motion.span>
                    )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-yellow-600 transition-colors">{module.title}</h3>
                  <p className="text-gray-600 mb-4">{module.desc}</p>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">Benefícios:</h4>
                    {module.benefits.map((benefit, i) => (
                      <motion.div 
                        key={i} 
                        className="flex items-center gap-2 text-sm text-gray-600"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: 0.8 + index * 0.1 + i * 0.05,
                          duration: 0.4
                        }}
                        viewport={{ once: true }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 180 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                        <CheckCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        </motion.div>
                        <span>{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 bg-yellow-100 px-6 py-3 rounded-full">
              <Rocket className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Todos os módulos inclusos no plano único</span>
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials */}
      <section id="testimonials" className={`${visual.sectionDark} py-20 text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              ⭐ O que dizem nossos <span className="text-yellow-400">clientes</span>
            </h2>
            <p className="text-xl text-gray-300">Casos reais de transformação educacional</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {depoimentos.map((depoimento, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
                <div className="flex mb-4">
                  {[...Array(depoimento.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg mb-6 leading-relaxed">&ldquo;{depoimento.content}&rdquo;</blockquote>
                <footer>
                  <div className="font-bold">{depoimento.name}</div>
                  <div className="text-gray-300">{depoimento.role}</div>
                </footer>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
            💰 <span className="text-yellow-500">Preços</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12">{planos.subtitle}</p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {planos.plans.map((plan, index) => (
              <div key={index} className={`p-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform ${
                plan.highlight 
                  ? 'bg-white text-black' 
                  : 'bg-gradient-to-br from-gray-800 to-gray-900 text-white border border-gray-700'
              }`}>
                {plan.highlight && (
                  <div className="text-center mb-4">
                    <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Recomendado
                    </span>
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? 'text-black' : 'text-white'}`}>{plan.name}</h3>
                <p className={`text-sm mb-4 ${plan.highlight ? 'text-gray-600' : 'text-gray-300'}`}>{plan.subtitle}</p>
                <div className={`text-4xl font-bold mb-2 ${plan.highlight ? 'text-black' : 'text-white'}`}>{plan.price}</div>
                <div className={`text-lg mb-6 ${plan.highlight ? 'text-gray-600' : 'text-gray-300'}`}>{plan.period}</div>
                
                <div className="text-left mb-8">
                  {plan.description.split('\n').map((item, i) => (
                    <div key={i} className="flex items-center gap-3 mb-2">
                      <CheckCircle className={`w-5 h-5 flex-shrink-0 ${plan.highlight ? 'text-green-500' : 'text-yellow-400'}`} />
                      <span className={`text-sm ${plan.highlight ? 'text-black' : 'text-white'}`}>{item.replace('• ', '')}</span>
                    </div>
                  ))}
                </div>
          
                <button className={`w-full font-bold py-4 rounded-xl text-lg border-2 cursor-not-allowed ${
                  plan.highlight
                    ? 'bg-gray-400 text-white border-gray-400'
                    : 'bg-gray-400 text-white border-gray-400'
                }`} disabled>
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced FAQ */}
      <FAQ />

      {/* CTA Section */}
      <section className="bg-gradient-to-b from-neutral-950 to-neutral-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            Transforme sua escola com IA
          </h2>
          <p className="text-xl mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Junte-se às escolas que já transformaram sua gestão com o HubEdu.ia
          </p>
          
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-2xl mb-12 border border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-yellow-400">🎯 Garantia de Resultado</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">24h</div>
                <div className="text-gray-300">Setup completo</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">24/7</div>
                <div className="text-gray-300">Respostas inteligentes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">100%</div>
                <div className="text-gray-300">Brasileiro</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              className="group px-8 py-4 bg-gray-400 text-white font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-not-allowed"
              disabled
            >
              <Play className="w-5 h-5" />
              EM BREVE
            </button>
            <button 
              className="px-8 py-4 border-2 border-gray-400 text-gray-400 font-semibold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
              disabled
            >
              <MessageSquare className="w-5 h-5" />
              EM BREVE
            </button>
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Dados seguros (LGPD)</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Suporte rápido e humanizado</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Suporte 100% nacional</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer id="contact" className="bg-gradient-to-b from-gray-900 to-black text-white py-16">
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
                A primeira plataforma de inteligência artificial desenvolvida especificamente para escolas brasileiras. 
                Professor digital, automações administrativas e atendimento inteligente em uma solução completa.
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
                  <Mail className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Email</div>
                    <a href="mailto:contato@hubedu.ai" className="text-gray-400 hover:text-yellow-400 transition-colors">
                      contato@hubedu.ai
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Telefone</div>
                    <a href="tel:+5511999999999" className="text-gray-400 hover:text-yellow-400 transition-colors">
                      (11) 9999-9999
                    </a>
                    <div className="text-sm text-gray-500">Seg-Sex, 8h-18h</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Escritório</div>
                    <div className="text-gray-400">São Paulo - SP, Brasil</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6 text-yellow-400">Links Rápidos</h3>
              <nav className="space-y-3">
                <a href="#demo" className="block text-gray-400 hover:text-yellow-400 transition-colors">Demo Interativa</a>
                <a href="/faq" className="block text-gray-400 hover:text-yellow-400 transition-colors">Central de Ajuda</a>
              </nav>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">
                © 2025 HubEdu.ai — Transformando a educação brasileira com IA
              </p>
              <div className="flex gap-6 text-sm text-gray-500">
                <button 
                  onClick={() => toggleModal('privacy')}
                  className="hover:text-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded px-3 py-1 border border-gray-600 hover:border-yellow-400"
                >
                  Política de Privacidade
                </button>
                <button 
                  onClick={() => toggleModal('terms')}
                  className="hover:text-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded px-3 py-1 border border-gray-600 hover:border-yellow-400"
                >
                  Termos de Uso
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