// app/(dashboard)/apresentacao/page.tsx
"use client";

import Image from 'next/image';
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Users,
  Clock,
  DollarSign,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  MessageSquare,
  Bot,
  Zap,
  Rocket,
  Shield,
  Heart,
  Phone,
  Mail,
  MapPin,
  Target,
  TrendingUp,
  BookOpen,
  Lightbulb,
  LogIn,
  ChevronDown,
  Brain,
  Award,
  Globe,
  BookOpenIcon,
  GraduationCap,
  Trophy,
  Users2,
  BarChart3,
  Settings,
  Calendar,
  FileText,
  MessageCircle,
  Search,
  Filter,
  Download,
  Share2,
  Maximize,
  Minimize,
} from "lucide-react";
import { ASSETS } from "@/constants/assets";

// Estilos CSS customizados
const customStyles = `
  
  @keyframes slide-up {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes fade-in {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes slide-in-left {
    from { transform: translateX(-50px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slide-in-right {
    from { transform: translateX(50px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slide-in-up {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes scale-in {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  
  @keyframes bounce-in {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); opacity: 1; }
  }
  
  
  .slide-up {
    animation: slide-up 0.6s ease-out forwards;
  }
  
  .fade-in {
    animation: fade-in 0.8s ease-out forwards;
  }
  
  .slide-in-left {
    animation: slide-in-left 0.6s ease-out forwards;
  }
  
  .slide-in-right {
    animation: slide-in-right 0.6s ease-out forwards;
  }
  
  .slide-in-up {
    animation: slide-in-up 0.6s ease-out forwards;
  }
  
  .scale-in {
    animation: scale-in 0.6s ease-out forwards;
  }
  
  .bounce-in {
    animation: bounce-in 0.8s ease-out forwards;
  }
  
  .animate-delay-100 {
    animation-delay: 0.1s;
  }
  
  .animate-delay-200 {
    animation-delay: 0.2s;
  }
  
  .animate-delay-300 {
    animation-delay: 0.3s;
  }
  
  .animate-delay-400 {
    animation-delay: 0.4s;
  }
  
  .animate-delay-500 {
    animation-delay: 0.5s;
  }
  
  .gradient-text {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  
  .hover-lift {
    transition: all 0.3s ease;
  }
  
  .hover-lift:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  
  .slide-transition {
    transition: opacity 0.6s ease-in-out;
    will-change: opacity;
  }
  
  .slide-active {
    opacity: 1;
    visibility: visible;
    z-index: 10;
  }
  
  .slide-inactive {
    opacity: 0;
    visibility: hidden;
    z-index: 1;
  }
  
  .slide-prev {
    opacity: 0;
    visibility: hidden;
    z-index: 1;
  }
  
  .chat-message {
    animation: fade-in 0.5s ease-out forwards;
  }
  
  .chat-input {
    animation: slide-up 0.3s ease-out forwards;
  }

  /* ===== Layout adaptativo para diferentes tamanhos de tela ===== */
  .apresentacao-slide-center {
    display: grid;
    place-items: center;
    height: 100svh; /* viewport estável em mobile */
    padding: 0.5rem;
    overflow-y: hidden;
  }
  
  .apresentacao-content {
    width: 100%;
    max-width: 90rem; /* Aumentado para telas maiores */
    margin-left: auto;
    margin-right: auto;
    padding: 1rem;
    max-height: calc(100vh - 2rem);
    overflow-y: hidden;
  }
  
  /* Remover margens externas que deslocam o centro visual */
  .apresentacao-content > *:first-child { margin-top: 0 !important; }
  .apresentacao-content > *:last-child { margin-bottom: 0 !important; }
  
  /* Responsividade para telas muito pequenas */
  @media (max-width: 480px) {
    .apresentacao-slide-center {
      padding: 0.25rem;
    }
    .apresentacao-content {
      padding: 0.5rem;
      max-height: calc(100vh - 1rem);
    }
  }
  
  /* Responsividade para tablets */
  @media (min-width: 481px) and (max-width: 768px) {
    .apresentacao-content {
      padding: 1.5rem;
      max-height: calc(100vh - 3rem);
    }
  }
  
  /* Responsividade para desktop pequeno */
  @media (min-width: 769px) and (max-width: 1024px) {
    .apresentacao-content {
      padding: 2rem;
      max-height: calc(100vh - 4rem);
    }
  }
  
  /* Responsividade para desktop grande */
  @media (min-width: 1025px) {
    .apresentacao-content {
      padding: 2.5rem;
      max-height: calc(100vh - 5rem);
    }
  }
  
  /* Ajuste especial para slide 1 - mover conteúdo mais para cima */
  .slide-1-content {
    transform: translateY(-40px);
  }
  
  @media (min-width: 768px) {
    .slide-1-content {
      transform: translateY(-60px);
    }
  }
  
  @media (min-width: 1024px) {
    .slide-1-content {
      transform: translateY(-80px);
    }
  }
  
  /* Layout adaptativo para cards em telas menores */
  .adaptive-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
  }

  /* Grid 2x2 específico para o slide 2 */
  .two-by-two-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
  }
  @media (min-width: 640px) {
    .two-by-two-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }
  }
  
  @media (min-width: 640px) {
    .adaptive-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
  }
  
  @media (min-width: 1024px) {
    .adaptive-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }
  }
  
  /* Layout adaptativo para tabelas */
  .adaptive-table {
    width: 100%;
    overflow-x: auto;
  }
  
  @media (max-width: 768px) {
    .adaptive-table {
      font-size: 0.875rem;
    }
  }

  /* Pequeno ajuste para mover conteúdo para cima em alguns slides */
  .shift-up-small {
    transform: translateY(-12px);
  }
  @media (min-width: 768px) { /* md */
    .shift-up-small { transform: translateY(-24px); }
  }
  @media (min-width: 1024px) { /* lg */
    .shift-up-small { transform: translateY(-32px); }
  }

  /* Ajustes adicionais de deslocamento vertical */
  .shift-up-64 { transform: translateY(-64px); }
  .shift-up-80 { transform: translateY(-80px); }
  .shift-up-100 { transform: translateY(-100px); }
  .shift-up-120 { transform: translateY(-120px); }
`;


// Constants and data configuration from home page
const BRAND = {
  name: "HubEdu.ia",
  tagline: "A Educação do Futuro",
  description: "Plataforma educacional completa com aulas geradas por IA, simulador ENEM, correção automática de redações e sistema de chat inteligente - tudo alinhado com BNCC e LGPD."
};

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

export default function Apresentacao() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dados dos slides - cópia fiel da página home
  const slides = useMemo(() => [
    {
      id: 1,
      title: "HubEdu.ia",
      subtitle: "A Educação do Futuro",
      content: (
        <div className="text-center slide-1-content">
          <div className="flex justify-center mb-3 mt-8 slide-in-up">
            <Image
              src={ASSETS.LOGO_ICON}
              alt="HubEdu.ia Logo"
              width={500}
              height={300}
              className=""
              loading="lazy"
            />
          </div>
          
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-600 to-orange-500 mb-2 leading-tight slide-in-up animate-delay-100">
            {BRAND.name}
          </h1>
          
          <h2 className="text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold text-black mb-3 leading-tight slide-in-up animate-delay-200">
            {BRAND.tagline}
          </h2>

          <p className="text-sm md:text-base lg:text-lg xl:text-xl text-gray-700 mb-3 leading-relaxed font-medium slide-in-up animate-delay-300">
            {BRAND.description}
          </p>
          
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-center py-2 font-bold text-sm mb-4 slide-in-up animate-delay-400">
            🚀 EM BREVE - Primeira plataforma de IA com BNCC + LGPD para escolas brasileiras
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 slide-in-up animate-delay-500">
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
        </div>
      ),
      background: "bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    },

    {
      id: 2,
      title: "4 Módulos Principais",
      subtitle: "Veja Como Funciona",
      content: (
        <div className="text-center shift-up-small">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-8 slide-in-up">
            🎮 Veja Como Funciona
          </h1>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {HERO_MODULES.map((module, index) => (
              <Card key={index} className="hover-lift slide-in-up animate-delay-100" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="pb-3">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-4">{module.icon}</div>
                    <h3 className="text-lg font-bold text-yellow-600 mb-3">{module.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{module.description}</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
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
                    disabled
                  >
                    {module.cta}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ),
      background: "bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    },

    {
      id: 3,
      title: "Inovação em Educação",
      subtitle: "Tecnologia de ponta combinada com pedagogia brasileira",
      content: (
        <div className="text-center shift-up-small">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-8 slide-in-up">
            🚀 Inovação em Educação
          </h1>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="hover-lift slide-in-up animate-delay-100">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">🧠</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">IA Generativa Avançada</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Algoritmos de última geração que criam conteúdo educacional personalizado em tempo real, adaptando-se ao perfil de cada aluno.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-lift slide-in-up animate-delay-200">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Correção Automática</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">IA avançada corrige redações, simulados e atividades instantaneamente, seguindo critérios oficiais do ENEM e BNCC.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-lift slide-in-up animate-delay-300">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Aulas Estruturadas</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Slides organizados com introdução, desenvolvimento e conclusão, incluindo atividades práticas e quizzes interativos.</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-8 rounded-3xl shadow-2xl slide-in-up animate-delay-400">
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
      ),
      background: "bg-gradient-to-r from-purple-50 to-pink-50"
    },

    {
      id: 4,
      title: "Preparação Completa para o ENEM",
      subtitle: "A plataforma mais completa para estudantes brasileiros",
      content: (
        <div className="text-center shift-up-small">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-8 slide-in-up">
            🎓 Preparação Completa para o ENEM
          </h1>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {ENEM_FEATURES.map((feature, index) => (
              <Card key={index} className="hover-lift slide-in-up animate-delay-100" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
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
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-8 rounded-3xl shadow-2xl slide-in-up animate-delay-500">
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
      ),
      background: "bg-white"
    },

    {
      id: 5,
      title: "Soluções para Escolas Brasileiras",
      subtitle: "Plataforma completa desenvolvida especificamente para instituições de ensino",
      content: (
        <div className="text-center shift-up-small">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-8 slide-in-up">
            🏫 Soluções para Escolas Brasileiras
          </h1>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {SCHOOL_FEATURES.map((feature, index) => (
              <Card key={index} className="hover-lift slide-in-up animate-delay-100" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-8">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ),
      background: "bg-gradient-to-b from-gray-900 to-black text-white"
    },

    {
      id: 6,
      title: "Compliance Total com LGPD",
      subtitle: "Totalmente compatível com a Lei Geral de Proteção de Dados",
      content: (
        <div className="text-center shift-up-small">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-8 slide-in-up">
            🛡️ Compliance Total com LGPD
          </h1>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="hover-lift slide-in-up animate-delay-100">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">🗑️</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Conversas Temporárias</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Conversas são descartadas automaticamente após cada sessão. Informações pessoais não ficam registradas no sistema.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-lift slide-in-up animate-delay-200">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌐</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Infraestrutura Global</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Infraestrutura de ponta com tecnologia de nuvem global, garantindo máxima performance e disponibilidade.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-lift slide-in-up animate-delay-300">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔒</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Criptografia Total</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Dados protegidos com criptografia de ponta a ponta. Acesso restrito e auditado.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-lift slide-in-up animate-delay-400">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">👶</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Todas as Idades</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Plataforma pioneira desenvolvida especificamente para o contexto educacional brasileiro, com foco em segurança e adequação pedagógica.</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-8 rounded-3xl shadow-2xl slide-in-up animate-delay-500">
            <h3 className="text-3xl font-black mb-6 text-center">🚫 Por que ChatGPT, Grok e Gemini Não Atendem Escolas?</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 p-6 rounded-2xl">
                <h4 className="text-xl font-bold mb-4 text-red-300">❌ Problemas das Outras Plataformas:</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span><strong>Conteúdo não adaptado:</strong> Não há conteúdo específico para idade escolar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span><strong>Infraestrutura limitada:</strong> Recursos insuficientes para suportar múltiplos usuários simultâneos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span><strong>Armazenamento permanente:</strong> Conversas ficam salvas indefinidamente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span><strong>Sem compliance LGPD:</strong> Não atendem regulamentações brasileiras</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white/10 p-6 rounded-2xl">
                <h4 className="text-xl font-bold mb-4 text-green-300">✅ Soluções HubEdu.ia:</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span><strong>Todas as idades:</strong> Crianças, adolescentes e adultos incluídos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span><strong>Infraestrutura global:</strong> Tecnologia de nuvem de ponta para máxima performance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span><strong>Conversas temporárias:</strong> Conversas são descartadas automaticamente após cada sessão</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span><strong>Compliance LGPD:</strong> Atendimento total às regulamentações</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
      background: "bg-gradient-to-r from-green-50 to-blue-50"
    },

    {
      id: 7,
      title: "100% Baseado na BNCC",
      subtitle: "Todas as aulas e conteúdos seguem rigorosamente a Base Nacional Comum Curricular brasileira",
      content: (
        <div className="text-center shift-up-small">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-8 slide-in-up">
            📚 100% Baseado na BNCC
          </h1>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="hover-lift slide-in-up animate-delay-100">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Competências BNCC</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Desenvolvimento das 10 competências gerais da BNCC em todas as atividades e aulas.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-lift slide-in-up animate-delay-200">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Objetivos de Aprendizagem</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Cada aula alinhada com objetivos específicos da BNCC para cada ano e componente curricular.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-lift slide-in-up animate-delay-300">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔄</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Atualizações Automáticas</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Conteúdo sempre atualizado conforme mudanças na BNCC e diretrizes do MEC.</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-3xl shadow-2xl slide-in-up animate-delay-400">
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
      ),
      background: "bg-gradient-to-r from-blue-50 to-purple-50"
    },

    {
      id: 8,
      title: "O que dizem sobre nós",
      subtitle: "Depoimentos de nossos clientes",
      content: (
        <div className="text-center shift-up-small">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-8 slide-in-up">
            💬 O que dizem sobre nós
          </h1>
          
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card key={index} className="hover-lift slide-in-up animate-delay-100" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-8">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg mb-6 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</blockquote>
                  <footer>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-gray-300">{testimonial.role}</div>
                  </footer>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ),
      background: "bg-gradient-to-b from-gray-900 to-black text-white"
    },

    {
      id: 9,
      title: "Por que Escolher HubEdu.ia?",
      subtitle: "Comparativo com as principais plataformas de IA",
      content: (
        <div className="text-center shift-up-small">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-8 slide-in-up">
            💰 Por que Escolher HubEdu.ia?
          </h1>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {COMPETITORS.map((competitor, index) => (
              <Card key={index} className="hover-lift slide-in-up animate-delay-100" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-3">{competitor.icon}</div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-800">{competitor.name}</h3>
                    <div className="text-3xl font-black mb-4 text-red-500">
                      {competitor.price}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-bold mb-3 text-gray-700">❌ Limitações:</h4>
                    {competitor.restrictions.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="mt-1 text-red-500">•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Card className="hover-lift slide-in-up animate-delay-400 ring-2 ring-yellow-500 shadow-xl">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold">
                      🏆 MELHOR ESCOLHA
                    </span>
                  </div>
                  <div className="text-4xl mb-3 mt-4">🎓</div>
                  <h3 className="text-2xl font-bold mb-2 text-black">HubEdu.ia</h3>
                  <div className="text-3xl font-black mb-4 text-black">
                    Preço Especial
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-bold mb-3 text-black">✅ Vantagens:</h4>
                  {ADVANTAGES.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-black">
                      <span className="mt-1 text-green-600">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-8 rounded-3xl shadow-2xl slide-in-up animate-delay-500">
            <h3 className="text-3xl font-black mb-4">🎯 Por que HubEdu.ia é Superior?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-left">
                <h4 className="font-bold text-lg mb-3">🚫 Problemas das Outras Plataformas:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Conteúdo não adaptado:</strong> Não há conteúdo específico para idade escolar</li>
                  <li>• <strong>Preço alto:</strong> US$ 20-30/mês por usuário (~R$ 106-159/mês)</li>
                  <li>• <strong>Sem BNCC:</strong> Não baseado na Base Nacional Comum Curricular</li>
                  <li>• <strong>Sem LGPD:</strong> Conversas salvas permanentemente, sem proteção adequada de dados</li>
                  <li>• <strong>Sem simulador ENEM:</strong> Não atendem necessidades específicas brasileiras</li>
                  <li>• <strong>Sem conteúdo educacional:</strong> Não desenvolvido para escolas brasileiras</li>
                </ul>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-lg mb-3">✅ Soluções HubEdu.ia:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Todas as idades:</strong> Crianças, adolescentes e adultos incluídos</li>
                  <li>• <strong>Preço especial:</strong> Valor competitivo para escolas brasileiras</li>
                  <li>• <strong>100% BNCC:</strong> Conteúdo rigorosamente alinhado com currículo nacional</li>
                  <li>• <strong>Total LGPD:</strong> Conversas temporárias (apagadas automaticamente), infraestrutura global, criptografia total</li>
                  <li>• <strong>Simulador ENEM:</strong> +3000 questões oficiais brasileiras</li>
                  <li>• <strong>Educação brasileira:</strong> Desenvolvido especificamente para escolas do Brasil</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
      background: "bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    },

    {
      id: 10,
      title: "A Educação do Futuro Chega Em Breve",
      subtitle: "Prepare sua escola para uma nova era",
      content: (
        <div className="text-center shift-up-small">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-8 slide-in-up">
            A Educação do Futuro Chega Em Breve
          </h1>
          
          <p className="text-xl mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed slide-in-up animate-delay-100">
            Prepare sua escola para uma nova era. BNCC + LGPD + IA = Educação brasileira do futuro.
          </p>
          
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-2xl mb-12 border border-gray-700 slide-in-up animate-delay-200">
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
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center slide-in-up animate-delay-300">
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
      ),
      background: "bg-gradient-to-b from-neutral-950 to-neutral-900 text-white"
    }
  ], []);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(prev => prev + 1);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 50);
    }
  }, [currentSlide, isTransitioning, slides.length]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(prev => prev - 1);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 50);
    }
  }, [currentSlide, isTransitioning]);

  const goToSlide = (index: number) => {
    if (!isTransitioning && index !== currentSlide) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 50);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Navegação por teclado
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Verificar se estamos em um input ou textarea
      const target = event.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true')) {
        return;
      }
      
      // Verificar se estamos em transição
      if (isTransitioning) {
        return;
      }
      
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        event.stopPropagation();
        if (currentSlide < slides.length - 1) {
          nextSlide();
        }
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        event.stopPropagation();
        if (currentSlide > 0) {
          prevSlide();
        }
      }
    };

    // Usar window.addEventListener para capturar eventos globais
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, isTransitioning, nextSlide, prevSlide, slides]);

  return (
    <div className="min-h-screen bg-background text-foreground apresentacao-page">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      {/* Container principal */}
      <div className="relative min-h-screen">
        
        {/* Slides */}
        <div className="relative h-screen overflow-hidden z-10">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 slide-transition ${
                index === currentSlide ? 'slide-active' : 
                index < currentSlide ? 'slide-prev' : 'slide-inactive'
              }`}
            >
              <div className="apresentacao-slide-center">
                <div className="apresentacao-content">
                  {slide.content}
                </div>
              </div>
            </div>
          ))}
        </div>
          
        
        {/* Contador de slides - lado direito */}
        <div className="fixed top-4 md:top-8 right-2 md:right-8 z-50">
          <div className="bg-white rounded-full px-2 md:px-4 py-1 md:py-2 shadow-lg border border-gray-200">
            <span className="text-xs md:text-sm font-medium text-gray-700">
              {currentSlide + 1} de {slides.length}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
