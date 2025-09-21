'use client';

import { useState, useEffect, useCallback, useMemo, lazy, Suspense, memo } from 'react';
import { 
  Users, Clock, DollarSign, Star, ArrowRight, Play, CheckCircle, MessageSquare, 
  Bot, Zap, Rocket, Shield, Heart, Phone, Mail, MapPin, Target, TrendingUp, 
  BookOpen, Lightbulb, LogIn, ChevronDown, Brain, Award, Globe, BookOpenIcon, 
  GraduationCap, Trophy, Users2, BarChart3, Settings, Calendar, FileText, 
  MessageCircle, Search, Filter, Download, Share2 
} from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { debounce } from 'lodash';

// Lazy load modals
const PrivacyPolicyModal = lazy(() => import('../components/modals/PrivacyPolicyModal'));
const TermsOfUseModal = lazy(() => import('../components/modals/TermsOfUseModal'));
const LGPDModal = lazy(() => import('../components/modals/LGPDModal'));

// Constants and data configuration
const BRAND = {
  name: "HubEdu.ia",
  tagline: "A Educação do Futuro",
  description: "Plataforma educacional completa com aulas geradas por IA, simulador ENEM, correção automática de redações e sistema de chat inteligente - tudo alinhado com BNCC e LGPD."
};

const CHAT_MODULES = [
  { 
    name: "Professor IA", 
    description: "Tire dúvidas pedagógicas instantaneamente", 
    icon: "👩‍🏫",
    features: ["Dúvidas sobre BNCC", "Sugestões de atividades", "Planejamento de aulas", "Avaliação de alunos", "Metodologias ativas"],
    benefits: "Suporte pedagógico 24/7 para professores"
  },
  { 
    name: "Suporte T.I.", 
    description: "Suporte técnico para funcionários", 
    icon: "💻",
    features: ["Problemas de sistema", "Configuração de equipamentos", "Treinamento digital", "Manutenção preventiva", "Soluções rápidas"],
    benefits: "Resolução técnica imediata para toda equipe"
  },
  { 
    name: "Atendimento", 
    description: "Atendimento personalizado para pais e visitantes", 
    icon: "👨‍👩‍👧‍👦",
    features: ["Informações escolares", "Agendamento de reuniões", "Dúvidas sobre matrícula", "Comunicação com professores", "Eventos da escola"],
    benefits: "Atendimento humanizado e eficiente"
  },
  { 
    name: "Bem-estar", 
    description: "Suporte emocional para toda comunidade", 
    icon: "💚",
    features: ["Suporte psicológico", "Mediação de conflitos", "Orientação familiar", "Prevenção ao bullying", "Cuidados emocionais"],
    benefits: "Ambiente escolar saudável e acolhedor"
  },
  { 
    name: "Social Media", 
    description: "Gestão de redes sociais da escola", 
    icon: "📱",
    features: ["Posts automáticos", "Gestão de conteúdo", "Interação com comunidade", "Relatórios de engajamento", "Cronograma de publicações"],
    benefits: "Presença digital profissional e engajante"
  },
  { 
    name: "Coordenação", 
    description: "Ferramentas para coordenação pedagógica", 
    icon: "👨‍💼",
    features: ["Planejamento curricular", "Acompanhamento pedagógico", "Reuniões de equipe", "Formação continuada", "Gestão de projetos"],
    benefits: "Coordenação pedagógica eficiente e organizada"
  },
  { 
    name: "Secretaria", 
    description: "Automação de processos administrativos", 
    icon: "📋",
    features: ["Documentação digital", "Controle de frequência", "Emissão de certificados", "Arquivo de documentos", "Processos burocráticos"],
    benefits: "Administração escolar moderna e eficiente"
  },
  { 
    name: "RH", 
    description: "Gestão de recursos humanos", 
    icon: "👥",
    features: ["Controle de ponto", "Avaliação de desempenho", "Treinamentos", "Folha de pagamento", "Benefícios funcionais"],
    benefits: "Gestão completa de recursos humanos"
  },
  { 
    name: "Financeiro", 
    description: "Controle financeiro e pagamentos", 
    icon: "💰",
    features: ["Controle de mensalidades", "Relatórios financeiros", "Gestão de inadimplência", "Orçamento escolar", "Contas a pagar"],
    benefits: "Controle financeiro transparente e eficaz"
  },
  { 
    name: "Gestão", 
    description: "Relatórios e analytics educacionais", 
    icon: "📊",
    features: ["Dashboard executivo", "Métricas de aprendizado", "Relatórios de performance", "Análise de dados", "Tomada de decisões"],
    benefits: "Gestão baseada em dados e insights"
  }
];

const COMPETITORS = [
  {
    name: "ChatGPT",
    price: "US$ 20/mês por usuário (~R$ 106/mês)",
    restrictions: [
      "Conteúdo não adaptado para idade escolar",
      "Sem conteúdo específico para escolas", 
      "Não baseado na BNCC",
      "Sem compliance LGPD"
    ],
    icon: "🤖"
  },
  {
    name: "Grok", 
    price: "US$ 30/mês por usuário (~R$ 159/mês)",
    restrictions: [
      "Conteúdo não adaptado para idade escolar",
      "Sem simulador ENEM",
      "Não baseado na BNCC", 
      "Sem compliance LGPD"
    ],
    icon: "⚡"
  },
  {
    name: "Gemini",
    price: "US$ 20/mês por usuário (~R$ 106/mês)",
    restrictions: [
      "Conteúdo não adaptado para idade escolar",
      "Sem conteúdo específico para escolas",
      "Não baseado na BNCC",
      "Sem compliance LGPD"
    ],
    icon: "💎"
  }
];

const ADVANTAGES = [
  "✅ Disponível para todas as idades (incluindo menores)",
  "✅ Conteúdo específico para escolas brasileiras", 
  "✅ 100% baseado na BNCC (Base Nacional Comum Curricular)",
  "✅ Compliance total com LGPD (Lei Geral de Proteção de Dados)",
  "✅ Conversas temporárias (apagadas automaticamente) para máxima privacidade",
  "✅ Infraestrutura global de ponta garantindo máxima performance",
  "✅ Simulador ENEM com +3000 questões oficiais",
  "✅ Suporte nacional especializado",
  "✅ Plataforma pioneira desenvolvida para educação brasileira"
];

const HERO_MODULES = [
  {
    title: "Aulas Interativas",
    description: "Slides dinâmicos baseados na BNCC com imagens, quizzes e gamificação.",
    icon: "🎮",
    features: ["100% baseado na BNCC", "14 slides estruturados", "Atividades dinâmicas", "Quizzes interativos", "Gamificação completa"],
    cta: "Explorar Aula"
  },
  {
    title: "Simulador ENEM",
    description: "Mais de 3000 questões oficiais + infinitas geradas por IA alinhadas com BNCC.",
    icon: "📚",
    features: ["3000+ questões oficiais", "Questões infinitas por IA", "Modos personalizados", "Análise detalhada", "Alinhado com BNCC"],
    cta: "Fazer Simulado"
  },
  {
    title: "Redação ENEM",
    description: "Correção automática com temas oficiais e tendências atuais baseadas na BNCC.",
    icon: "✍️",
    features: ["Correção automática", "Temas oficiais ENEM", "Tendências 2025", "Feedback detalhado", "Critérios BNCC"],
    cta: "Testar Redação"
  },
  {
    title: "Chat Inteligente",
    description: "Sistema completo de IA com 10 módulos customizados e compliance LGPD.",
    icon: "💬",
    features: ["Professor IA", "Suporte T.I.", "Atendimento Pais", "Bem-estar", "Social Media", "Coordenação", "Secretaria", "RH", "Financeiro", "Gestão", "Conversas temporárias LGPD"],
    cta: "Explorar Módulos"
  }
];

const LESSONS_FEATURES = [
  {
    title: "Baseadas na BNCC",
    description: "Todas as aulas seguem rigorosamente a Base Nacional Comum Curricular brasileira.",
    icon: "📚"
  },
  {
    title: "Interatividade Total",
    description: "Quizzes com feedback instantâneo, atividades colaborativas e gamificação.",
    icon: "🎮"
  },
  {
    title: "Duração Otimizada",
    description: "Aulas de 30-40 minutos (assíncronas) perfeitamente cronometradas. Assíncronas = alunos podem assistir no seu próprio ritmo.",
    icon: "⏱️"
  },
  {
    title: "Qualquer Tema",
    description: "Educação, negócios, tecnologia, saúde, arte - qualquer assunto, qualquer nível.",
    icon: "🌍"
  }
];

const SCHOOL_FEATURES = [
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
    title: "Conteúdo Personalizado",
    description: "Aulas adaptadas para diferentes níveis e necessidades específicas de cada turma.",
    icon: "🎯",
    stats: "Adaptação Inteligente"
  }
];

const ENEM_FEATURES = [
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
    description: "IA especializada corrige sua redação seguindo critérios oficiais do ENEM com feedback detalhado - permite também o envio de redação escrita à mão por PDF ou pela câmera.",
    icon: "✍️",
    stats: "Correção Instantânea"
  },
  {
    title: "Temas e Tendências 2025",
    description: "Acesso a todos os temas oficiais de redação + análise de tendências para o próximo ENEM.",
    icon: "🎯",
    stats: "Tendências Atualizadas"
  }
];

const TESTIMONIALS = [
  {
    name: "Maria Santos",
    role: "Professora, Escola Nova Era",
    content: "As aulas interativas são incríveis! Os alunos adoram os quizzes e rankings. A correção automática de redação economiza horas de trabalho.",
    rating: 5
  },
  {
    name: "Carlos Mendes",
    role: "Coordenador, Instituto Esperança", 
    content: "O simulador ENEM aumentou significativamente o desempenho dos alunos. Os pais adoram o chat omni-channel.",
    rating: 5
  },
  {
    name: "Ana Silva",
    role: "Diretora, Colégio Crescer",
    content: "A gestão escolar ficou muito mais eficiente com as ferramentas de IA. O chat inteligente para toda comunidade escolar é verdadeiramente revolucionário.",
    rating: 5
  }
];

const FAQ_ITEMS = [
  {
    question: "Como são criadas as aulas?",
    answer: "IA gera aulas de 30-40 minutos (assíncronas) baseadas na BNCC com slides, atividades e quizzes sobre qualquer tema. Assíncronas = alunos podem assistir no seu próprio ritmo."
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
    answer: "Sim, diferentemente de outras plataformas, nossa plataforma é oficialmente acessível para todas as idades."
  },
  {
    question: "Quando estará disponível?",
    answer: "Em breve, com suporte completo para escolas brasileiras."
  }
];

// Reusable Components
const SectionTitle = ({ children, subtitle = null }) => (
  <div className="text-center mb-12">
    <h2 className="text-4xl lg:text-5xl font-black mb-4">{children}</h2>
    {subtitle && <p className="text-lg text-gray-600 max-w-3xl mx-auto">{subtitle}</p>}
  </div>
);

const FeatureCard = ({ feature, index, gradient = "from-yellow-50 to-white", border = "border-yellow-200 hover:border-yellow-400" }) => (
  <div className={`bg-gradient-to-br ${gradient} border-2 ${border} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
    <div className="text-center">
      <div className="text-4xl mb-4">{feature.icon}</div>
      <h3 className="text-lg font-bold text-yellow-600 mb-3">{feature.title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed" suppressHydrationWarning>{feature.description}</p>
      {feature.stats && (
        <div className="mt-4">
          <div className="text-sm font-bold text-black bg-yellow-400 px-3 py-1 rounded-full inline-block">
            {feature.stats}
          </div>
        </div>
      )}
    </div>
  </div>
);

const ModuleCard = ({ module, disabled = true }) => (
  <div className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl border-2 border-yellow-300 hover:border-yellow-500 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105">
    <div className="text-center mb-6">
      <div className="text-4xl mb-4">{module.icon}</div>
      <h3 className="text-lg font-bold text-gray-800 mb-3">{module.title}</h3>
      <p className="text-sm text-gray-600 mb-4">{module.description}</p>
    </div>
    
    <div className="space-y-2 mb-6">
      {module.features.slice(0, 3).map((feature, idx) => (
        <div key={idx} className="flex items-center gap-3 text-sm text-gray-600">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span>{feature}</span>
        </div>
      ))}
      {module.features.length > 3 && (
        <div className="text-sm text-gray-500 text-center font-medium">+{module.features.length - 3} mais</div>
      )}
    </div>
    
    <button 
      className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold rounded-2xl transition-all duration-300 cursor-not-allowed text-base shadow-lg"
      disabled={disabled}
    >
      {module.cta}
    </button>
  </div>
);

const ModuleModal = ({ module, isOpen, onClose }) => {
  if (!isOpen || !module) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{module.icon}</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{module.name}</h3>
                <p className="text-gray-600">{module.description}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-900 mb-3">🎯 Principais Funcionalidades:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {module.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl">
            <h4 className="text-lg font-bold text-gray-900 mb-2">✨ Benefício Principal:</h4>
            <p className="text-gray-700">{module.benefits}</p>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button 
              onClick={onClose}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold rounded-2xl transition-all duration-300 shadow-lg"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatModulesGrid = () => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModuleClick = (module) => {
    setSelectedModule(module);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedModule(null);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black p-10 rounded-3xl shadow-2xl">
        <h3 className="text-4xl font-black mb-6 text-center">💬 10 Módulos Customizados de Chat IA</h3>
        <p className="text-2xl font-semibold mb-10 text-center">Sistema completo de inteligência artificial para toda comunidade escolar</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
          {CHAT_MODULES.map((module, index) => (
            <div 
              key={index} 
              className="text-center bg-white/20 p-4 sm:p-6 rounded-2xl cursor-pointer hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
              onClick={() => handleModuleClick(module)}
            >
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{module.icon}</div>
              <div className="font-bold text-sm sm:text-base">{module.name}</div>
              <div className="text-xs sm:text-sm">{module.description}</div>
              <div className="text-xs sm:text-sm mt-2 sm:mt-3 text-yellow-800 font-semibold">Clique para saber mais</div>
            </div>
          ))}
        </div>
      </div>
      
      <ModuleModal 
        module={selectedModule} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
};

const TestimonialCard = ({ testimonial, index }) => (
  <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:border-yellow-400 transition-all duration-300">
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
  </div>
);

const CompetitorCard = ({ competitor, isSpecial = false }) => (
  <div className={`${isSpecial ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-500' : 'bg-white border-gray-200'} border-2 rounded-2xl p-6 shadow-lg ${isSpecial ? 'relative shadow-2xl' : ''}`}>
    {isSpecial && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold">
          🏆 MELHOR ESCOLHA
        </span>
      </div>
    )}
    
    <div className={`text-center mb-6 ${isSpecial ? 'mt-4' : ''}`}>
      <div className="text-4xl mb-3">{competitor.icon}</div>
      <h3 className={`text-2xl font-bold mb-2 ${isSpecial ? 'text-black' : 'text-gray-800'}`}>{competitor.name}</h3>
      <div className={`text-3xl font-black mb-4 ${isSpecial ? 'text-black' : 'text-red-500'}`}>
        {competitor.price || "Preço Especial"}
      </div>
    </div>
    
    <div className="space-y-3">
      <h4 className={`font-bold mb-3 ${isSpecial ? 'text-black' : 'text-gray-700'}`}>
        {isSpecial ? '✅ Vantagens:' : '❌ Limitações:'}
      </h4>
      {(competitor.restrictions || ADVANTAGES.slice(0, 5)).map((item, idx) => (
        <div key={idx} className={`flex items-start gap-2 text-sm ${isSpecial ? 'text-black' : 'text-gray-600'}`}>
          <span className={`mt-1 ${isSpecial ? 'text-green-600' : 'text-red-500'}`}>•</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  </div>
);

const FAQItem = ({ item, index, isOpen, onToggle }) => (
  <div className="border border-gray-200 rounded-2xl overflow-hidden">
    <button
      className="w-full p-6 text-left hover:bg-yellow-50 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
      onClick={() => onToggle(index)}
      aria-expanded={isOpen}
      aria-controls={`faq-answer-${index}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">{item.question}</h3>
        <ChevronDown 
          className={`w-5 h-5 text-gray-500 transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>
    </button>
    {isOpen && (
      <div 
        id={`faq-answer-${index}`}
        className="px-6 pb-6"
        role="region"
      >
        <p className="text-gray-700 leading-relaxed">{item.answer}</p>
      </div>
    )}
  </div>
);

// Main Component
const HubEduLanding = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [openFAQs, setOpenFAQs] = useState(new Set());
  const [modalsState, setModalsState] = useState({
    privacy: false,
    terms: false,
    lgpd: false,
  });

  const toggleFAQ = useCallback((index) => {
    setOpenFAQs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const toggleModal = useCallback((modalType) => {
    setModalsState((prev) => ({
      ...prev,
      [modalType]: !prev[modalType],
    }));
  }, []);

  useEffect(() => {
    setIsClient(true);
    setIsVisible(true);
    // Set initial scroll position to avoid hydration mismatch
    setScrollY(window.scrollY);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerClasses = useMemo(() => 
    `fixed top-0 w-full z-50 transition-all duration-300 ${
      isClient && scrollY > 50 ? 'bg-white/95 backdrop-blur-md shadow-xl' : 'bg-white/90 backdrop-blur-sm'
    } border-b-2 border-yellow-300`,
    [scrollY, isClient]
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Launch Banner */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-center py-3 font-bold text-lg">
        🚀 EM BREVE - Aulas por IA + Simulador ENEM + Chat Inteligente = Educação Brasileira do Futuro
      </div>

      {/* Header */}
      <header className={headerClasses}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image 
              src="/assets/Logo_HubEdu.ia.svg" 
              alt="HubEdu.ia Logo" 
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <div className="text-xl font-bold">
              <span className="text-black">Hub</span>
              <span className="text-yellow-500">Edu</span>
              <span className="text-black">.ia</span>
            </div>
          </div>
          
          <button 
            disabled
            className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-2xl shadow-lg flex items-center gap-2 cursor-not-allowed"
          >
            <LogIn className="w-5 h-5" />
            EM BREVE
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-100 text-black pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-yellow-400/30 to-yellow-600/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-yellow-500/30 to-yellow-700/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-4 rounded-2xl text-lg font-bold mb-8 shadow-xl">
              <Rocket className="w-6 h-6" />
              🚀 EM BREVE - Aulas por IA + Simulador ENEM + Chat Inteligente = Educação Brasileira do Futuro
            </div>

            <div className="flex justify-center mb-6">
              <Image 
                src="/assets/Logo_HubEdu.ia.svg" 
                alt="HubEdu.ia Logo" 
                width={120}
                height={120}
                className="h-20 w-auto"
              />
            </div>

            <h1 className="text-6xl lg:text-8xl font-black mb-8 leading-tight text-black">
              <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">
                {BRAND.name}
              </span>
              <br />
              <span className="text-4xl lg:text-6xl font-bold text-gray-800">
                {BRAND.tagline}
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl mb-8 text-gray-700 leading-relaxed max-w-4xl mx-auto font-medium">
              {BRAND.description}
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <button 
                className="px-10 py-5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-black text-xl shadow-2xl rounded-2xl flex items-center justify-center gap-3 cursor-not-allowed transition-all duration-300"
                disabled
              >
                <Play className="w-6 h-6" />
                Em Breve
              </button>
              <button 
                className="px-10 py-5 border-2 border-yellow-500 hover:bg-yellow-500 hover:text-black text-yellow-700 font-bold text-xl rounded-2xl flex items-center justify-center gap-3 cursor-not-allowed transition-all duration-300"
                disabled
              >
                <Phone className="w-6 h-6" />
                Ver Demonstração
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {HERO_MODULES.map((module, index) => (
                <ModuleCard key={index} module={module} />
              ))}
            </div>
          </div>
        </div>
      </section>




      {/* Innovation Section */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle="Tecnologia de ponta combinada com pedagogia brasileira para criar a experiência educacional mais avançada do país">
            🚀 <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Inovação em Educação</span>
          </SectionTitle>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="text-center">
                <div className="text-6xl mb-4">🧠</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">IA Generativa Avançada</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Algoritmos de última geração que criam conteúdo educacional personalizado em tempo real, adaptando-se ao perfil de cada aluno.</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border-2 border-pink-200 hover:border-pink-400 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Correção Automática</h3>
                <p className="text-gray-600 text-sm leading-relaxed">IA avançada corrige redações, simulados e atividades instantaneamente, seguindo critérios oficiais do ENEM e BNCC.</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Aulas Estruturadas</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Slides organizados com introdução, desenvolvimento e conclusão, incluindo atividades práticas e quizzes interativos.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-8 rounded-3xl shadow-2xl">
            <h3 className="text-3xl font-black mb-6 text-center">🌟 Por que HubEdu.ia é Revolucionário?</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 p-6 rounded-2xl">
                <h4 className="text-xl font-bold mb-4 text-purple-300">🔬 Tecnologia de Ponta:</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>IA Multimodal:</strong> Processa texto, imagem e áudio simultaneamente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>IA Avançada:</strong> Tecnologia OpenAI (ChatGPT) e Google (Gemini)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>Conteúdo Estruturado:</strong> Aulas organizadas com introdução, desenvolvimento e conclusão</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>Cloud Native:</strong> Arquitetura escalável e resiliente</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white/10 p-6 rounded-2xl">
                <h4 className="text-xl font-bold mb-4 text-pink-300">🎓 Pedagogia Brasileira:</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400 mt-1">•</span>
                    <span><strong>BNCC Integrada:</strong> Cada conteúdo alinhado com competências</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400 mt-1">•</span>
                    <span><strong>Metodologias Ativas:</strong> Aprendizado interativo com quizzes e atividades práticas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400 mt-1">•</span>
                    <span><strong>Gamificação:</strong> Elementos de jogos para engajamento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400 mt-1">•</span>
                    <span><strong>Inclusão Digital:</strong> Acessível para todos os perfis</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle="4 módulos principais + 10 módulos customizados de chat para transformar sua escola">
            🎮 <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">Veja Como Funciona</span>
          </SectionTitle>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {LESSONS_FEATURES.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
          
          <div className="text-center">
            <ChatModulesGrid />
          </div>
        </div>
      </section>

      {/* ENEM Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle="A plataforma mais completa para estudantes brasileiros se prepararem para o Exame Nacional do Ensino Médio - 100% alinhado com a BNCC">
            🎓 <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">Preparação Completa para o ENEM</span>
          </SectionTitle>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {ENEM_FEATURES.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-8 rounded-3xl shadow-2xl">
              <h3 className="text-3xl font-black mb-4">🏆 Por que Escolher Nosso Simulador?</h3>
              <div className="grid md:grid-cols-3 gap-6">
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
          </div>
        </div>
      </section>

      {/* Schools Section */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle="Plataforma completa desenvolvida especificamente para atender as necessidades das instituições de ensino brasileiras - BNCC + LGPD">
            🏫 <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Soluções para Escolas Brasileiras</span>
          </SectionTitle>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {SCHOOL_FEATURES.map((feature, index) => (
              <FeatureCard 
                key={index} 
                feature={feature} 
                index={index}
                gradient="from-gray-800 to-gray-900"
                border="border-yellow-400 hover:border-yellow-300"
              />
            ))}
          </div>
        </div>
      </section>

      {/* LGPD Compliance Section */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle="Totalmente compatível com a Lei Geral de Proteção de Dados - Privacidade e segurança garantidas">
            🛡️ <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Compliance Total com LGPD</span>
          </SectionTitle>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="bg-white p-8 rounded-2xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="text-center">
                <div className="text-6xl mb-4">🗑️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Conversas Temporárias</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Conversas são descartadas automaticamente após cada sessão. Informações pessoais não ficam registradas no sistema.</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="text-center">
                <div className="text-6xl mb-4">🌐</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Infraestrutura Global</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Infraestrutura de ponta com tecnologia de nuvem global, garantindo máxima performance e disponibilidade.</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Criptografia Total</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Dados protegidos com criptografia de ponta a ponta. Acesso restrito e auditado.</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="text-center">
                <div className="text-6xl mb-4">👶</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Todas as Idades</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Plataforma pioneira desenvolvida especificamente para o contexto educacional brasileiro, com foco em segurança e adequação pedagógica.</p>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* BNCC Compliance Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle="Todas as aulas e conteúdos seguem rigorosamente a Base Nacional Comum Curricular brasileira">
            📚 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">100% Baseado na BNCC</span>
          </SectionTitle>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-2xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Competências BNCC</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Desenvolvimento das 10 competências gerais da BNCC em todas as atividades e aulas.</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Objetivos de Aprendizagem</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Cada aula alinhada com objetivos específicos da BNCC para cada ano e componente curricular.</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="text-center">
                <div className="text-6xl mb-4">🔄</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Atualizações Automáticas</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Conteúdo sempre atualizado conforme mudanças na BNCC e diretrizes do MEC.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-3xl shadow-2xl">
            <h3 className="text-3xl font-black mb-6 text-center">🎓 Por que a BNCC é Fundamental?</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 p-6 rounded-2xl">
                <h4 className="text-xl font-bold mb-4 text-blue-300">📖 Base Nacional Comum Curricular:</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong>Padronização:</strong> Conteúdo unificado em todo território nacional</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong>Competências:</strong> Desenvolvimento de habilidades do século XXI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong>Flexibilidade:</strong> Adaptação às realidades locais</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong>Qualidade:</strong> Garantia de educação de qualidade</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white/10 p-6 rounded-2xl">
                <h4 className="text-xl font-bold mb-4 text-purple-300">🚀 HubEdu.ia + BNCC:</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>IA Alinhada:</strong> Inteligência artificial configurada especificamente para gerar conteúdo baseado na BNCC</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>Conteúdo Personalizado:</strong> Aulas geradas seguindo rigorosamente a BNCC</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>Avaliação BNCC:</strong> Questões e atividades alinhadas com objetivos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>Relatórios BNCC:</strong> Acompanhamento do desenvolvimento das competências</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle>
            💬 O que dizem <span className="text-yellow-400">sobre nós</span>
          </SectionTitle>
          
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle="Tire suas principais dúvidas sobre o HubEdu.ia">
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

      {/* Pricing Comparison Section */}
      <section className="py-16 bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle="Comparativo com as principais plataformas de IA - Única com BNCC + LGPD">
            💰 <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">Por que Escolher HubEdu.ia?</span>
          </SectionTitle>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {COMPETITORS.map((competitor, index) => (
              <CompetitorCard key={index} competitor={competitor} />
            ))}
            <CompetitorCard 
              competitor={{ name: "HubEdu.ia", icon: "🎓", price: "Preço Especial" }} 
              isSpecial={true} 
            />
          </div>
          
          <div className="text-center bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-8 rounded-3xl shadow-2xl">
            <h3 className="text-3xl font-black mb-4">🎯 Por que HubEdu.ia é Superior?</h3>
            <p className="text-lg mb-6 font-medium">Enquanto ChatGPT, Grok e Gemini não atendem escolas adequadamente, nós oferecemos uma solução completa</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-left">
                <h4 className="font-bold text-lg mb-3">🚫 Por que ChatGPT, Grok e Gemini Não Atendem Escolas:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Restrição de idade:</strong> Menores de 18 anos não podem usar oficialmente</li>
                  <li>• <strong>Preço alto:</strong> US$ 20-30/mês por usuário (~R$ 106-159/mês)</li>
                  <li>• <strong>Conteúdo não adaptado:</strong> Não há conteúdo específico para idade escolar</li>
                  <li>• <strong>Sem BNCC:</strong> Não baseado na Base Nacional Comum Curricular</li>
                  <li>• <strong>Sem LGPD:</strong> Conversas salvas permanentemente, sem proteção adequada de dados</li>
                  <li>• <strong>Sem simulador ENEM:</strong> Não atendem necessidades específicas brasileiras</li>
                  <li>• <strong>Sem conteúdo educacional:</strong> Não desenvolvido para escolas brasileiras</li>
                  <li>• <strong>Sem gestão escolar:</strong> Não oferecem ferramentas administrativas</li>
                </ul>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-lg mb-3">✅ Por que HubEdu.ia é Superior:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Todas as idades:</strong> Crianças, adolescentes e adultos incluídos oficialmente</li>
                  <li>• <strong>Preço especial:</strong> Valor competitivo para escolas brasileiras</li>
                  <li>• <strong>Conteúdo adaptado:</strong> Desenvolvido especificamente para educação brasileira</li>
                  <li>• <strong>100% BNCC:</strong> Conteúdo rigorosamente alinhado com currículo nacional</li>
                  <li>• <strong>Total LGPD:</strong> Conversas temporárias (apagadas automaticamente), infraestrutura global, criptografia total</li>
                  <li>• <strong>Simulador ENEM:</strong> +3000 questões oficiais brasileiras</li>
                  <li>• <strong>Educação brasileira:</strong> Desenvolvido especificamente para escolas do Brasil</li>
                  <li>• <strong>Gestão completa:</strong> Professor IA + Automação + Atendimento + Analytics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-b from-neutral-950 to-neutral-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            A Educação do Futuro Chega Em Breve
          </h2>
          <p className="text-xl mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Prepare sua escola para uma nova era. BNCC + LGPD + IA = Educação brasileira do futuro.
          </p>
          
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-2xl mb-12 border border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-yellow-400">🎯 4 Módulos Principais:</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {[
                { title: "Aulas Interativas", desc: "30-40 min (assíncronas) geradas por IA - alunos assistem no seu próprio ritmo", icon: "🎮", color: "from-blue-500 to-blue-600" },
                { title: "Simulador ENEM", desc: "+3000 questões oficiais + infinitas por IA", icon: "📚", color: "from-green-500 to-green-600" },
                { title: "Redação ENEM", desc: "Correção automática com temas oficiais", icon: "✍️", color: "from-purple-500 to-purple-600" },
                { title: "Chat Inteligente", desc: "10 módulos customizados para toda escola", icon: "💬", color: "from-yellow-500 to-yellow-600" }
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                  <div className={`text-3xl p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-lg`}>
                    {feature.icon}
                  </div>
                  <div>
                    <div className="text-gray-300 font-bold text-lg">{feature.title}</div>
                    <div className="text-gray-400 text-sm">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 p-3 bg-gray-700/50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <span className="text-gray-300 font-medium">Suporte nacional e configuração rápida</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              className="px-8 py-4 bg-gray-400 text-white font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-not-allowed"
              disabled
            >
              <Play className="w-5 h-5" />
              Em Breve
            </button>
            <button 
              className="px-8 py-4 border-2 border-gray-400 text-gray-400 font-semibold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
              disabled
            >
              <MessageSquare className="w-5 h-5" />
              Agendar Demonstração
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-3 mb-6">
              <Image 
                src="/assets/Logo_HubEdu.ia.svg" 
                alt="HubEdu.ia Logo" 
                width={60}
                height={60}
                className="h-15 w-auto"
              />
              <div className="text-3xl font-bold">
                <span className="text-white">Hub</span>
                <span className="text-yellow-400">Edu</span>
                <span className="text-white">.ia</span>
              </div>
            </div>
            
            <div className="flex justify-center items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-yellow-400" />
              <a 
                href="mailto:contato@hubedu.ia.br"
                className="text-xl font-semibold text-white hover:text-yellow-400 transition-colors"
              >
                contato@hubedu.ia.br
              </a>
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

      {/* Modals */}
      <Suspense fallback={null}>
        {modalsState.privacy && <PrivacyPolicyModal isOpen={modalsState.privacy} onClose={() => toggleModal('privacy')} />}
        {modalsState.terms && <TermsOfUseModal isOpen={modalsState.terms} onClose={() => toggleModal('terms')} />}
        {modalsState.lgpd && <LGPDModal isOpen={modalsState.lgpd} onClose={() => toggleModal('lgpd')} />}
      </Suspense>
    </div>
  );
};

export default HubEduLanding;