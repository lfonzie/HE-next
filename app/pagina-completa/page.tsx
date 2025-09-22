'use client';

import { useState, useEffect, useCallback, useMemo, lazy, Suspense, memo } from 'react';
import { 
  Users, Clock, DollarSign, Star, ArrowRight, Play, CheckCircle, MessageSquare, 
  Bot, Zap, Rocket, Shield, Heart, Phone, Mail, MapPin, Target, TrendingUp, 
  BookOpen, Lightbulb, LogIn, ChevronDown, Brain, Award, Globe, 
  GraduationCap, Trophy, Users2, BarChart3, Settings, Calendar, FileText, 
  MessageCircle, Search, Filter, Download, Share2, ExternalLink, X
} from 'lucide-react';

// TypeScript interfaces
interface SectionTitleProps {
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
}

interface FeatureCardProps {
  feature: {
    icon: string;
    title: string;
    description: string;
    stats?: string;
  };
  index?: number;
}

interface ModuleCardProps {
  module: {
    title?: string;
    name?: string;
    description: string;
    icon: string;
    features?: string[];
    cta?: string;
    color?: string;
  };
  index?: number;
  onClick?: () => void;
}

interface ModuleModalProps {
  module: {
    name: string;
    description: string;
    icon: string;
    features?: string[];
    benefits: string;
    color: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

interface TestimonialCardProps {
  testimonial: {
    name: string;
    role: string;
    content: string;
  };
  index?: number;
}

interface FAQItemProps {
  item: {
    question: string;
    answer: string;
  };
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
}

// Lazy-loaded modals
const PrivacyPolicyModal = lazy(() => import('../../components/modals/PrivacyPolicyModal'));
const TermsOfUseModal = lazy(() => import('../../components/modals/TermsOfUseModal'));
const LGPDModal = lazy(() => import('../../components/modals/LGPDModal'));

// Enhanced Constants
const BRAND = {
  name: 'HubEdu.ia',
  tagline: 'A Educação do Futuro',
  description: 'Primeira plataforma brasileira de IA educacional com aulas BNCC, simulador ENEM e compliance LGPD completo.',
  features: ['100% BNCC', 'Compliance LGPD', 'Simulador ENEM', '10 Módulos de IA']
};

// Performance optimization: Reduced array size
const CHAT_MODULES = [
  { name: 'Professor IA', description: 'Suporte pedagógico 24/7', icon: '👩‍🏫', features: ['Dúvidas BNCC', 'Planejamento de aulas', 'Metodologias ativas'], benefits: 'Suporte pedagógico instantâneo', color: 'from-blue-500 to-blue-600' },
  { name: 'Suporte T.I.', description: 'Resolução técnica imediata', icon: '💻', features: ['Problemas de sistema', 'Configuração equipamentos', 'Treinamento digital'], benefits: 'Suporte técnico 24/7', color: 'from-green-500 to-green-600' },
  { name: 'Atendimento', description: 'Atendimento humanizado para pais', icon: '👨‍👩‍👧‍👦', features: ['Informações escolares', 'Agendamento reuniões', 'Comunicação professores'], benefits: 'Atendimento eficiente', color: 'from-purple-500 to-purple-600' },
  { name: 'Bem-estar', description: 'Suporte emocional completo', icon: '💚', features: ['Suporte psicológico', 'Mediação conflitos', 'Prevenção bullying'], benefits: 'Ambiente escolar saudável', color: 'from-pink-500 to-pink-600' },
  { name: 'Social Media', description: 'Gestão profissional de redes', icon: '📱', features: ['Posts automáticos', 'Gestão conteúdo', 'Relatórios engajamento'], benefits: 'Presença digital profissional', color: 'from-indigo-500 to-indigo-600' },
  { name: 'Gestão', description: 'Analytics educacionais avançados', icon: '📊', features: ['Dashboard executivo', 'Métricas aprendizado', 'Análise de dados'], benefits: 'Gestão baseada em dados', color: 'from-orange-500 to-orange-600' },
];

// Simplified competitor data
const COMPETITORS = [
  { name: 'ChatGPT', price: 'R$ 106/mês', restrictions: ['Não adaptado para escolas', 'Sem BNCC', 'Sem LGPD'], icon: '🤖' },
  { name: 'Gemini', price: 'R$ 106/mês', restrictions: ['Conteúdo não escolar', 'Sem simulador ENEM', 'Sem compliance LGPD'], icon: '💎' },
];

const HERO_MODULES = [
  { 
    title: 'Aulas Interativas', 
    description: 'Slides dinâmicos baseados na BNCC com gamificação completa.', 
    icon: '🎮', 
    features: ['100% BNCC', '14 slides estruturados', 'Quizzes interativos'], 
    cta: 'Explorar Aulas',
    color: 'from-blue-500 to-blue-600'
  },
  { 
    title: 'Simulador ENEM', 
    description: '3000+ questões oficiais + infinitas geradas por IA.', 
    icon: '📚', 
    features: ['3000+ questões', 'Modos personalizados', 'Análise detalhada'], 
    cta: 'Testar Simulado',
    color: 'from-green-500 to-green-600'
  },
  { 
    title: 'Redação ENEM', 
    description: 'Correção automática com critérios oficiais.', 
    icon: '✍️', 
    features: ['Correção automática', 'Temas oficiais', 'Feedback detalhado'], 
    cta: 'Corrigir Redação',
    color: 'from-purple-500 to-purple-600'
  },
  { 
    title: 'Chat Inteligente', 
    description: '6 módulos especializados para toda escola.', 
    icon: '💬', 
    features: ['Professor IA', 'Suporte T.I.', 'Atendimento'], 
    cta: 'Ver Módulos',
    color: 'from-yellow-500 to-yellow-600'
  },
];

// Streamlined FAQ
const FAQ_ITEMS = [
  { question: 'Como funciona o HubEdu.ia?', answer: 'Plataforma completa com 4 módulos principais: Aulas IA, Simulador ENEM, Correção de Redações e Chat Inteligente, tudo baseado na BNCC.' },
  { question: 'É seguro para menores de 18 anos?', answer: 'Sim, única plataforma com compliance LGPD total, chats temporários e conteúdo adequado para todas as idades.' },
  { question: 'Quantas questões tem o simulador?', answer: 'Mais de 3000 questões oficiais do ENEM (2009-2024) + infinitas questões geradas por IA.' },
  { question: 'As aulas seguem a BNCC?', answer: 'Sim, 100% das aulas são rigorosamente alinhadas à Base Nacional Comum Curricular.' },
  { question: 'Quando estará disponível?', answer: 'Em breve. Cadastre-se para receber acesso prioritário e condições especiais.' },
];

// Enhanced components with better performance and mobile-first design
const SectionTitle = memo(({ children, subtitle, className = '' }: SectionTitleProps) => (
  <div className={`text-center mb-8 sm:mb-12 ${className}`}>
    <h2 className="type-h2 font-black mb-3 sm:mb-4 leading-tight">{children}</h2>
    {subtitle && <p className="type-body-lg text-gray-600 max-w-[65ch] mx-auto">{subtitle}</p>}
  </div>
));

const FeatureCard = memo(({ feature, index = 0 }: FeatureCardProps) => (
  <div 
    className="group bg-white border-2 border-gray-200 hover:border-yellow-400 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="text-center">
      <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
      <h3 className="type-h4 font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
      <p className="type-small text-gray-600 leading-relaxed">{feature.description}</p>
      {feature.stats && (
        <div className="mt-3 sm:mt-4">
          <span className="type-caption font-bold text-white bg-yellow-500 px-3 py-1 rounded-full">{feature.stats}</span>
        </div>
      )}
    </div>
  </div>
));

const ModuleCard = memo(({ module, index = 0, onClick }: ModuleCardProps) => (
  <div 
    className="group bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    style={{ animationDelay: `${index * 100}ms` }}
    onClick={onClick}
  >
    <div className="text-center mb-4 sm:mb-6">
      <div className={`text-3xl sm:text-4xl mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${module.color || 'from-yellow-500 to-yellow-600'} text-white inline-block group-hover:scale-110 transition-transform duration-300`}>
        {module.icon}
      </div>
      <h3 className="type-h4 font-bold text-gray-900 mb-2 sm:mb-3">{module.title || module.name}</h3>
      <p className="type-small text-gray-600 mb-3 sm:mb-4">{module.description}</p>
    </div>
    <div className="space-y-2 mb-4 sm:mb-6">
      {(module.features || []).slice(0, 3).map((feature, idx) => (
        <div key={idx} className="flex items-center gap-2 type-small text-gray-600">
          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0"></div>
          <span>{feature}</span>
        </div>
      ))}
    </div>
    <button className="w-full min-h-11 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold rounded-xl transition-all duration-300 type-body">
      {module.cta || 'Saber Mais'}
    </button>
  </div>
));

// Enhanced modal with better UX and mobile-first design
const ModuleModal = memo(({ module, isOpen, onClose }: ModuleModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !module) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="p-4 sm:p-8">
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`text-3xl sm:text-4xl p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${module.color} text-white`}>{module.icon}</div>
              <div className="min-w-0">
                <h3 className="type-h3 font-bold text-gray-900 mb-1 sm:mb-2">{module.name}</h3>
                <p className="type-small text-gray-600">{module.description}</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors min-h-11 min-w-11 flex items-center justify-center"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="mb-4 sm:mb-6">
            <h4 className="type-h4 font-bold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
              Funcionalidades:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(module.features || []).map((feature, index) => (
                <div key={index} className="flex items-center gap-2 type-small text-gray-700 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 sm:p-6 rounded-xl border border-yellow-200">
            <h4 className="type-h4 font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
              Benefício Principal:
            </h4>
            <p className="type-body text-gray-700">{module.benefits}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

// Optimized chat modules grid with mobile-first design
const ChatModulesGrid = memo(() => {
  const [selectedModule, setSelectedModule] = useState(null);

  const handleModuleClick = useCallback((module) => {
    setSelectedModule(module);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedModule(null);
  }, []);

  return (
    <>
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl">
        <div className="text-center mb-6 sm:mb-8">
          <h3 className="type-h2 font-black mb-3 sm:mb-4">💬 6 Módulos de Chat IA</h3>
          <p className="type-body-lg font-semibold">Soluções especializadas para toda comunidade escolar</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {CHAT_MODULES.map((module, index) => (
            <div 
              key={index} 
              className="text-center bg-white/20 hover:bg-white/30 p-3 sm:p-4 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 min-h-11"
              onClick={() => handleModuleClick(module)}
            >
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{module.icon}</div>
              <div className="font-bold type-small mb-1">{module.name}</div>
              <div className="type-caption opacity-90 mb-1 sm:mb-2">{module.description}</div>
              <div className="type-caption text-yellow-800 font-semibold">Clique para detalhes</div>
            </div>
          ))}
        </div>
      </div>
      <ModuleModal 
        module={selectedModule} 
        isOpen={!!selectedModule} 
        onClose={handleCloseModal} 
      />
    </>
  );
});

// Simplified testimonial component with mobile-first design
const TestimonialCard = memo(({ testimonial, index = 0 }: TestimonialCardProps) => (
  <div 
    className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/20 hover:border-yellow-400 transition-all duration-300"
    style={{ animationDelay: `${index * 200}ms` }}
  >
    <div className="flex mb-3 sm:mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
      ))}
    </div>
    <blockquote className="type-body mb-3 sm:mb-4 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</blockquote>
    <footer>
      <div className="font-bold text-yellow-400 type-body">{testimonial.name}</div>
      <div className="text-gray-300 type-small">{testimonial.role}</div>
    </footer>
  </div>
));

const FAQItem = memo(({ item, index, isOpen, onToggle }: FAQItemProps) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden">
    <button
      className="w-full p-4 sm:p-6 text-left hover:bg-yellow-50 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-inset min-h-11"
      onClick={() => onToggle(index)}
      aria-expanded={isOpen}
    >
      <div className="flex items-center justify-between">
        <h3 className="type-body font-bold text-gray-900 pr-3 sm:pr-4">{item.question}</h3>
        <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
    </button>
    {isOpen && (
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <p className="type-body text-gray-700 leading-relaxed">{item.answer}</p>
      </div>
    )}
  </div>
));

// Early access form component
const EarlyAccessForm = memo(() => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      // Here you would typically send the email to your backend
      setTimeout(() => setSubmitted(false), 3000);
    }
  }, [email]);

  return (
    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black p-8 rounded-3xl shadow-2xl">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-black mb-2">🚀 Acesso Prioritário</h3>
        <p className="text-lg font-semibold">Seja um dos primeiros a usar o HubEdu.ia</p>
      </div>
      
      {!submitted ? (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-yellow-300 focus:border-yellow-600 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="px-6 py-3 bg-black text-yellow-400 font-bold rounded-xl hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            Cadastrar
          </button>
        </form>
      ) : (
        <div className="text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="font-bold text-green-700">Email cadastrado com sucesso!</p>
        </div>
      )}
    </div>
  );
});

// Main Component
const HubEduLanding = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [openFAQs, setOpenFAQs] = useState(new Set());
  const [modalsState, setModalsState] = useState({ privacy: false, terms: false, lgpd: false });

  const toggleFAQ = useCallback((index) => {
    setOpenFAQs((prev) => {
      const newSet = new Set(prev);
      newSet.has(index) ? newSet.delete(index) : newSet.add(index);
      return newSet;
    });
  }, []);

  const toggleModal = useCallback((modalType) => {
    setModalsState((prev) => ({ ...prev, [modalType]: !prev[modalType] }));
  }, []);

  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerClasses = useMemo(() => 
    `fixed top-0 w-full z-50 transition-all duration-300 ${
      isClient && scrollY > 50 
        ? 'bg-white/95 backdrop-blur-md shadow-xl' 
        : 'bg-white/90 backdrop-blur-sm'
    } border-b border-yellow-300`,
    [scrollY, isClient]
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Improved Launch Banner */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-center py-2 font-bold animate-pulse">
        🚀 EM BREVE - Primeira plataforma brasileira com IA + BNCC + LGPD
      </div>

      {/* Optimized Header */}
      <header className={headerClasses}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center text-white font-bold">
              H
            </div>
            <div className="text-xl font-bold">
              <span className="text-black">Hub</span><span className="text-yellow-500">Edu</span><span className="text-black">.ia</span>
            </div>
          </div>
          <button 
            disabled 
            className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl cursor-not-allowed opacity-75"
          >
            Em Breve
          </button>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-100 pt-20 pb-16 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-yellow-400/30 to-yellow-600/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-yellow-500/30 to-yellow-700/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 py-3 rounded-2xl text-base font-bold mb-8 shadow-lg">
              <Rocket className="w-5 h-5" />
              Primeira plataforma brasileira com IA + BNCC + LGPD
            </div>

            {/* Logo */}
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-6">
              H
            </div>

            {/* Main heading */}
            <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">{BRAND.name}</span>
              <br />
              <span className="text-3xl lg:text-5xl font-bold text-gray-800">{BRAND.tagline}</span>
            </h1>

            {/* Description */}
            <p className="text-xl lg:text-2xl mb-8 text-gray-700 max-w-4xl mx-auto font-medium">
              {BRAND.description}
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {BRAND.features.map((feature, index) => (
                <span 
                  key={index} 
                  className="px-4 py-2 bg-white border border-yellow-300 rounded-full text-sm font-semibold text-gray-700 shadow-sm"
                >
                  {feature}
                </span>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <EarlyAccessForm />
            </div>
          </div>

          {/* Module cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HERO_MODULES.map((module, index) => (
              <ModuleCard key={index} module={module} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Streamlined Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <SectionTitle subtitle="Recursos desenvolvidos especificamente para educação brasileira">
            ⚡ <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">Recursos Principais</span>
          </SectionTitle>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: '📚', title: '100% BNCC', description: 'Todo conteúdo rigorosamente alinhado à Base Nacional Comum Curricular.' },
              { icon: '🛡️', title: 'Total LGPD', description: 'Chats temporários, dados protegidos e compliance completo com LGPD.' },
              { icon: '🎯', title: 'Simulador ENEM', description: '3000+ questões oficiais + infinitas geradas por IA avançada.' },
            ].map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>

          <ChatModulesGrid />
        </div>
      </section>

      {/* Simplified Comparison Section */}
      <section className="py-16 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <SectionTitle subtitle="Compare com outras plataformas de IA">
            🏆 <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">Por que HubEdu.ia?</span>
          </SectionTitle>
          
          <div className="grid md:grid-cols-3 gap-8">
            {COMPETITORS.map((competitor, index) => (
              <div key={index} className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">{competitor.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{competitor.name}</h3>
                  <div className="text-2xl font-bold text-red-500 mb-4">{competitor.price}</div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-700 mb-3">❌ Limitações:</h4>
                  {competitor.restrictions.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-red-500">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* HubEdu.ia advantage card */}
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-yellow-500 rounded-2xl p-6 shadow-2xl relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">MELHOR ESCOLHA</span>
              </div>
              <div className="text-center mb-6 mt-2">
                <div className="text-4xl mb-3">🎓</div>
                <h3 className="text-xl font-bold text-black mb-2">HubEdu.ia</h3>
                <div className="text-2xl font-bold text-black mb-4">Preço Especial</div>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-black mb-3">✅ Vantagens Exclusivas:</h4>
                {['Todas as idades', '100% BNCC', 'Total LGPD', 'Simulador ENEM', '6 módulos IA'].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-black">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4">
          <SectionTitle subtitle="Depoimentos de educadores que conhecem nossa proposta">
            💬 O que dizem <span className="text-yellow-400">sobre nós</span>
          </SectionTitle>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Maria Santos', role: 'Professora, Escola Nova Era', content: 'Finalmente uma plataforma pensada para a realidade brasileira. A integração com BNCC faz toda diferença.' },
              { name: 'Carlos Mendes', role: 'Coordenador, Instituto Esperança', content: 'O compliance com LGPD nos dá segurança para usar com todos os alunos, incluindo menores.' },
              { name: 'Ana Silva', role: 'Diretora, Colégio Crescer', content: 'Os 6 módulos de IA cobrem todas as necessidades da escola. Aguardando ansiosamente o lançamento.' },
            ].map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Optimized FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <SectionTitle subtitle="Respostas para suas principais dúvidas">
            ❓ Perguntas <span className="text-yellow-500">Frequentes</span>
          </SectionTitle>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <FAQItem 
                key={index} 
                item={item} 
                index={index} 
                isOpen={openFAQs.has(index)} 
                onToggle={toggleFAQ} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="bg-gradient-to-b from-neutral-950 to-neutral-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-black mb-6">A Educação do Futuro Chega Em Breve</h2>
          <p className="text-xl mb-12 text-gray-300 max-w-3xl mx-auto">
            Seja uma das primeiras escolas a transformar a educação com IA, BNCC e LGPD.
          </p>

          {/* Key benefits grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: '🎮', title: 'Aulas IA', desc: 'Conteúdo personalizado' },
              { icon: '📚', title: 'ENEM 2025', desc: '3000+ questões' },
              { icon: '✍️', title: 'Redação IA', desc: 'Correção automática' },
              { icon: '💬', title: 'Chat 6 em 1', desc: 'Módulos especializados' },
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-yellow-400 transition-all duration-300"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-lg text-yellow-400 mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black p-8 rounded-3xl">
            <h3 className="text-2xl font-bold mb-4">🚀 Cadastre-se para Acesso Prioritário</h3>
            <p className="mb-6">Receba em primeira mão quando estivermos prontos + condições especiais de lançamento</p>
            <EarlyAccessForm />
          </div>
        </div>
      </section>

      {/* Streamlined Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                H
              </div>
              <div className="text-2xl font-bold">
                <span className="text-white">Hub</span><span className="text-yellow-400">Edu</span><span className="text-white">.ia</span>
              </div>
            </div>
            <p className="text-gray-400 mb-4">Transformando a educação brasileira com IA</p>
            <div className="flex justify-center items-center gap-2 text-yellow-400">
              <Mail className="w-5 h-5" />
              <a href="mailto:contato@hubedu.ia" className="hover:text-yellow-300 transition-colors">
                contato@hubedu.ia
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">© 2025 HubEdu.ia - A educação do futuro</p>
              <div className="flex gap-4 text-sm">
                {[
                  { key: 'privacy', label: 'Privacidade' },
                  { key: 'terms', label: 'Termos' },
                  { key: 'lgpd', label: 'LGPD' },
                ].map((modal) => (
                  <button
                    key={modal.key}
                    onClick={() => toggleModal(modal.key)}
                    className="text-gray-400 hover:text-yellow-400 transition-colors px-3 py-1 border border-gray-700 hover:border-yellow-400 rounded-lg"
                  >
                    {modal.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <Suspense fallback={null}>
        {modalsState.privacy && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Política de Privacidade</h2>
                <button onClick={() => toggleModal('privacy')} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-gray-700 space-y-4">
                <p>O HubEdu.ia está comprometido com sua privacidade e segurança de dados.</p>
                <h3 className="font-bold">Coleta de Dados</h3>
                <p>Coletamos apenas dados necessários para o funcionamento da plataforma educacional.</p>
                <h3 className="font-bold">Uso dos Dados</h3>
                <p>Seus dados são usados exclusivamente para personalizar sua experiência educacional.</p>
                <h3 className="font-bold">Proteção</h3>
                <p>Utilizamos criptografia de ponta e servidores seguros para proteger suas informações.</p>
              </div>
            </div>
          </div>
        )}
        {modalsState.terms && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Termos de Uso</h2>
                <button onClick={() => toggleModal('terms')} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-gray-700 space-y-4">
                <p>Bem-vindo ao HubEdu.ia. Estes termos regem o uso de nossa plataforma.</p>
                <h3 className="font-bold">Uso Permitido</h3>
                <p>A plataforma destina-se exclusivamente para fins educacionais.</p>
                <h3 className="font-bold">Responsabilidades</h3>
                <p>Os usuários devem usar a plataforma de forma ética e responsável.</p>
                <h3 className="font-bold">Propriedade Intelectual</h3>
                <p>Todo conteúdo gerado é protegido por direitos autorais.</p>
              </div>
            </div>
          </div>
        )}
        {modalsState.lgpd && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Compliance LGPD</h2>
                <button onClick={() => toggleModal('lgpd')} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-gray-700 space-y-4">
                <p>O HubEdu.ia está em total conformidade com a Lei Geral de Proteção de Dados.</p>
                <h3 className="font-bold">Conversas Temporárias</h3>
                <p>Todas as conversas são automaticamente apagadas após cada sessão.</p>
                <h3 className="font-bold">Direitos do Usuário</h3>
                <p>Você tem direito de acessar, corrigir ou excluir seus dados a qualquer momento.</p>
                <h3 className="font-bold">Segurança</h3>
                <p>Implementamos as melhores práticas de segurança para proteger menores de idade.</p>
              </div>
            </div>
          </div>
        )}
      </Suspense>
    </div>
  );
};

// Add display name for better debugging
SectionTitle.displayName = 'SectionTitle';
FeatureCard.displayName = 'FeatureCard';
ModuleCard.displayName = 'ModuleCard';
ModuleModal.displayName = 'ModuleModal';
ChatModulesGrid.displayName = 'ChatModulesGrid';
TestimonialCard.displayName = 'TestimonialCard';
FAQItem.displayName = 'FAQItem';
EarlyAccessForm.displayName = 'EarlyAccessForm';

export default memo(HubEduLanding);