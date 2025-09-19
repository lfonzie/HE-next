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
const PrivacyPolicyModal = lazy(() => import('../../../components/modals/PrivacyPolicyModal'));
const TermsOfUseModal = lazy(() => import('../../../components/modals/TermsOfUseModal'));
const LGPDModal = lazy(() => import('../../../components/modals/LGPDModal'));

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
  "✅ Tutor IA Pessoal com aprendizado adaptativo",
  "✅ Laboratórios virtuais para disciplinas STEM",
  "✅ Realidade aumentada baseada em navegador",
  "✅ Progressive Web App com funcionalidades offline",
  "✅ Análise de sentimento em tempo real",
  "✅ Exercícios adaptativos personalizados",
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
  },
  {
    title: "Tutor IA Pessoal",
    description: "IA avançada que adapta conteúdo e ritmo baseado no perfil de aprendizado único de cada aluno.",
    icon: "🧠",
    features: ["Aprendizado adaptativo", "Exercícios personalizados", "Análise de sentimento", "Recomendações inteligentes", "Progresso em tempo real"],
    cta: "Experimentar Tutor"
  },
  {
    title: "Laboratórios Virtuais",
    description: "Simulações interativas para física, química, biologia e matemática com experimentos 3D.",
    icon: "🔬",
    features: ["Simulações realistas", "Experimentos seguros", "Visualização 3D", "Múltiplas disciplinas", "Feedback instantâneo"],
    cta: "Explorar Laboratórios"
  },
  {
    title: "Realidade Aumentada",
    description: "AR baseada em navegador para visualizar conceitos abstratos de forma imersiva.",
    icon: "📱",
    features: ["AR no navegador", "Visualização 3D", "Interação natural", "Múltiplos dispositivos", "Conteúdo educativo"],
    cta: "Testar AR"
  },
  {
    title: "PWA Offline",
    description: "Progressive Web App com funcionalidades offline completas e instalação nativa.",
    icon: "📲",
    features: ["Funciona offline", "Instalação nativa", "Sincronização automática", "Notificações push", "Experiência mobile"],
    cta: "Instalar PWA"
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
];

const TESTIMONIALS = [
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
      <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
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
  <div className="bg-white/95 backdrop-blur-sm p-5 rounded-2xl border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
    <div className="text-center mb-4">
      <div className="text-3xl mb-3">{module.icon}</div>
      <h3 className="text-base font-bold text-gray-800 mb-2">{module.title}</h3>
      <p className="text-xs text-gray-600 mb-3">{module.description}</p>
    </div>
    
    <div className="space-y-1 mb-4">
      {module.features.slice(0, 3).map((feature, idx) => (
        <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
          <span>{feature}</span>
        </div>
      ))}
      {module.features.length > 3 && (
        <div className="text-xs text-gray-500 text-center">+{module.features.length - 3} mais</div>
      )}
    </div>
    
    <button 
      className="w-full px-3 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold rounded-xl transition-all duration-300 cursor-not-allowed text-sm"
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
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold rounded-xl transition-all duration-300"
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
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-8 rounded-3xl shadow-2xl">
        <h3 className="text-3xl font-black mb-4 text-center">💬 10 Módulos Customizados de Chat IA</h3>
        <p className="text-xl font-semibold mb-8 text-center">Sistema completo de inteligência artificial para toda comunidade escolar</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {CHAT_MODULES.map((module, index) => (
            <div 
              key={index} 
              className="text-center bg-white/20 p-3 sm:p-4 rounded-xl cursor-pointer hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
              onClick={() => handleModuleClick(module)}
            >
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{module.icon}</div>
              <div className="font-bold text-xs sm:text-sm">{module.name}</div>
              <div className="text-xs">{module.description}</div>
              <div className="text-xs mt-1 sm:mt-2 text-yellow-800 font-semibold">Clique para saber mais</div>
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
  const [openFAQs, setOpenFAQs] = useState(new Set());
  const [modalsState, setModalsState] = useState({
    privacy: false,
    terms: false,
    lgpd: false,
  });
  
  // Estados para navegação entre slides
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Funções de navegação entre slides
  const nextSlide = useCallback(() => {
    if (currentSlide < 9 && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => Math.min(prev + 1, 9));
        setTimeout(() => setIsTransitioning(false), 150);
      }, 80);
    }
  }, [currentSlide, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
        setTimeout(() => setIsTransitioning(false), 150);
      }, 80);
    }
  }, [currentSlide, isTransitioning]);

  const goToSlide = useCallback(
    (index) => {
      if (index !== currentSlide && !isTransitioning && index >= 0 && index < 10) {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentSlide(index);
          setTimeout(() => setIsTransitioning(false), 150);
        }, 80);
      }
    },
    [currentSlide, isTransitioning]
  );

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Controle de teclado para navegação entre slides
  useEffect(() => {
    const handleKeyPress = (event) => {
      const target = event.target;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.contentEditable === "true")) {
        return;
      }
      if (isTransitioning) {
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (currentSlide < 9) {
          nextSlide();
        }
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (currentSlide > 0) {
          prevSlide();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentSlide, isTransitioning, nextSlide, prevSlide]);

  const headerClasses = useMemo(() => 
    `fixed top-0 w-full z-50 transition-all duration-300 ${
      scrollY > 50 ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/90 backdrop-blur-sm'
    } border-b border-yellow-200`,
    [scrollY]
  );

  // Dividir conteúdo em slides
  const slides = [
    // Slide 0: Hero Section
    <section key="hero" className="bg-gradient-to-br from-yellow-50 via-white to-yellow-100 text-black pt-24 pb-16 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
            <Rocket className="w-5 h-5" />
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

          <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-tight text-black">
            <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">
              {BRAND.name}
            </span>
            <br />
            <span className="text-3xl lg:text-5xl font-bold text-gray-800">
              {BRAND.tagline}
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl mb-8 text-gray-700 leading-relaxed max-w-4xl mx-auto font-medium">
            {BRAND.description}
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-black text-lg shadow-2xl rounded-2xl flex items-center justify-center gap-3 cursor-not-allowed transition-all duration-300"
              disabled
            >
              <Play className="w-5 h-5" />
              Em Breve
            </button>
            <button 
              className="px-8 py-4 border-2 border-yellow-400 hover:bg-yellow-400 hover:text-black text-yellow-600 font-bold text-lg rounded-2xl flex items-center justify-center gap-3 cursor-not-allowed transition-all duration-300"
              disabled
            >
              <Phone className="w-5 h-5" />
              Ver Demonstração
              <ArrowRight className="w-5 h-5" />
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
    </section>,
    
    // Slide 1: Innovation Section
    <section key="innovation" className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle subtitle="Tecnologia de ponta combinada com pedagogia brasileira para criar a experiência educacional mais avançada do país">
          🚀 <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Inovação em Educação</span>
        </SectionTitle>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 shadow-lg hover:shadow-xl">
            <div className="text-center">
              <div className="text-6xl mb-4">🧠</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tutor IA Pessoal</h3>
              <p className="text-gray-600 text-sm leading-relaxed">IA que adapta conteúdo e ritmo baseado no perfil único de cada aluno, com análise de sentimento e exercícios adaptativos.</p>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl">
            <div className="text-center">
              <div className="text-6xl mb-4">🔬</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Laboratórios Virtuais</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Simulações interativas para física, química, biologia e matemática com experimentos 3D seguros e realistas.</p>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 shadow-lg hover:shadow-xl">
            <div className="text-center">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Realidade Aumentada</h3>
              <p className="text-gray-600 text-sm leading-relaxed">AR baseada em navegador para visualizar conceitos abstratos de forma imersiva em múltiplos dispositivos.</p>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 shadow-lg hover:shadow-xl">
            <div className="text-center">
              <div className="text-6xl mb-4">📲</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">PWA Offline</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Progressive Web App com funcionalidades offline completas, instalação nativa e sincronização automática.</p>
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
    </section>,
    
    // Slide 2: Features Overview
    <section key="features" className="py-16 bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
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
    </section>,
    
    // Slide 3: ENEM Section
    <section key="enem" className="py-16 bg-white">
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
    </section>,
    
    // Slide 4: Schools Section
    <section key="schools" className="py-16 bg-gradient-to-b from-gray-900 to-black text-white">
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
    </section>,
    
    // Slide 5: LGPD Compliance Section
    <section key="lgpd" className="py-16 bg-gradient-to-r from-green-50 to-blue-50">
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
    </section>,
    
    // Slide 6: BNCC Compliance Section
    <section key="bncc" className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
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
    </section>,
    
    // Slide 7: Testimonials Section
    <section key="testimonials" className="py-16 bg-gradient-to-b from-gray-900 to-black text-white">
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
    </section>,
    
    // Slide 8: FAQ Section
    <section key="faq" className="py-16 bg-white">
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
    </section>,
    
    // Slide 9: Pricing Comparison Section (PENÚLTIMO - DEMO)
    <section key="demo" className="py-16 bg-gradient-to-r from-yellow-50 to-white">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl lg:text-5xl font-bold mb-2">🎮 Demonstração</h2>
          <p className="text-lg text-gray-600">Versão demo com 5 mensagens</p>
        </div>
        <div className="w-full bg-white/95 backdrop-blur rounded-2xl shadow-xl border overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-white font-medium">HubEdu.ia Chat – Demo</div>
          <div className="flex-1 relative overflow-y-auto">
            <div className="flex flex-col h-full">
              <div className="flex-1 p-4 space-y-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">Olá! Sou o HubEdu.ia. Como posso ajudar você hoje?</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg ml-8">
                  <p className="text-sm text-gray-700">Preciso de ajuda com matemática</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">Claro! Vou te ajudar com matemática. Qual tópico específico você gostaria de estudar?</p>
                </div>
              </div>
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Digite sua mensagem..."
                    className="flex-1 p-2 border rounded-lg text-sm"
                    disabled
                  />
                  <button className="px-4 py-2 bg-yellow-500 text-black rounded-lg text-sm flex items-center gap-2" disabled>
                    <ArrowRight className="w-4 h-4" />
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Launch Banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-center py-2 font-bold text-sm">
        🚀 EM BREVE - Aulas por IA + Simulador ENEM + Chat Inteligente = Educação Brasileira do Futuro
      </div>

      {/* Header com controles de navegação */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <Image src="/assets/Logo_HubEdu.ia.svg" alt="HubEdu.ia" width={32} height={32} className="h-8 w-8" />
            <div className="text-lg font-bold text-gray-900">
              Hub<span className="text-yellow-500">Edu</span>.ia
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "w-6 bg-yellow-500" : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                  title={`Slide ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={toggleFullscreen}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              title={isFullscreen ? "Sair do modo tela cheia" : "Modo tela cheia"}
            >
              {isFullscreen ? "⛶" : "⛶"}
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo dos slides */}
      <div className="relative min-h-screen pt-16">
        <div className="relative h-screen overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="min-h-full w-full">
                <div className="min-h-screen">
                  {slide}
                </div>
              </div>
            </div>
          ))}
          
          {/* Controles de navegação */}
          <div className="absolute inset-x-0 bottom-6 z-20 px-4">
            <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 rounded-full bg-white/90 px-6 py-3 shadow-xl backdrop-blur">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>
              <div className="flex flex-col items-center text-center">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Slide {currentSlide + 1}/{slides.length}
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {currentSlide === 0 && "Hero"}
                  {currentSlide === 1 && "Inovação"}
                  {currentSlide === 2 && "Funcionalidades"}
                  {currentSlide === 3 && "ENEM"}
                  {currentSlide === 4 && "Escolas"}
                  {currentSlide === 5 && "LGPD"}
                  {currentSlide === 6 && "BNCC"}
                  {currentSlide === 7 && "Depoimentos"}
                  {currentSlide === 8 && "FAQ"}
                  {currentSlide === 9 && "Demo"}
                </span>
              </div>
              <button
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Suspense fallback={<div>Carregando...</div>}>
        <PrivacyPolicyModal 
          isOpen={modalsState.privacy} 
          onClose={() => toggleModal('privacy')} 
        />
        <TermsOfUseModal 
          isOpen={modalsState.terms} 
          onClose={() => toggleModal('terms')} 
        />
        <LGPDModal 
          isOpen={modalsState.lgpd} 
          onClose={() => toggleModal('lgpd')} 
        />
      </Suspense>
    </div>
  );
};

// Viewport configuration is handled in the root layout.tsx

export default HubEduLanding;
