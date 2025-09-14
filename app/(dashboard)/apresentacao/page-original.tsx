import Image from 'next/image';
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Users,
  TrendingUp,
  BookOpen,
  Cpu,
  Building,
  BarChart,
  Zap,
  X,
  Shield,
  Maximize,
  MessageSquare,
  Minimize,
  Send,
  Star,
  Brain,
  Clock,
} from "lucide-react";
import { ASSETS } from "@/constants/assets";

// Componente Chat simples para demo
const Chat = ({ maxMessages = 5, embedded = false, onLimitReached }: any) => {
  return (
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
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm" disabled>
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

// Estilos CSS customizados
const customStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 0.4; }
  }
  
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
  
  .floating-animation {
    animation: float 3s ease-in-out infinite;
  }
  
  .pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
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
  
  .glass-effect {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
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
    overflow-y: auto;
  }
  
  .apresentacao-content {
    width: 100%;
    max-width: 90rem; /* Aumentado para telas maiores */
    margin-left: auto;
    margin-right: auto;
    padding: 1rem;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
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


// Componente de logo para os slides
export function SlideLogo() {
  return (
    <div className="flex items-center space-x-3 group cursor-pointer">
      <div className="relative p-1">
        <Image
        src={ASSETS.LOGO_ICON}
        alt={"Image"}
        width={500}
        height={300}
        className={""}
        loading={"lazy"}
      />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
      <h1 className="text-xl font-bold text-gray-800 group-hover:text-yellow-600 transition-all duration-300">
        HubEdu.ia
      </h1>
              </div>
  );
}


// Dados locais para substituir importações
const sharedStats = [
  { icon: Users, value: "10K+", label: "Usuários Ativos" },
  { icon: BookOpen, value: "50K+", label: "Aulas Geradas" },
  { icon: Brain, value: "95%", label: "Satisfação" },
  { icon: Clock, value: "24/7", label: "Disponível" }
];

const comparisonCards = [
  {
    title: "Tradicional",
    features: ["Aulas estáticas", "Conteúdo limitado", "Sem personalização"],
    bullets: ["Aulas estáticas", "Conteúdo limitado", "Sem personalização"],
    price: "R$ 0",
    priceLabel: "R$ 0",
    priceNote: "Limitado",
    highlighted: false,
    variant: "default"
  },
  {
    title: "HubEdu.ia",
    features: ["IA conversacional", "8 módulos especializados", "Personalização total"],
    bullets: ["IA conversacional", "8 módulos especializados", "Personalização total"],
    price: "R$ 97/mês",
    priceLabel: "R$ 97/mês",
    priceNote: "Por escola",
    highlighted: true,
    variant: "highlight"
  }
];

// Dados dos slides
const slides = [
  {
    id: 1,
    title: "HubEdu.ia",
    subtitle: "IA educacional completa para escolas brasileiras",
    content: (
      <div className="text-center slide-1-content">
        <div className="flex justify-center mb-3 mt-8 slide-in-up">
          <div className="relative group floating-animation p-4">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 pulse-glow"></div>
            <Image
        src={ASSETS.LOGO_ICON}
        alt={"Image"}
        width={500}
        height={300}
        className={""}
        loading={"lazy"}
        style={{ filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.2))" }}
      />
          </div>
          </div>
          
        <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-600 to-orange-500 mb-2 leading-tight slide-in-up animate-delay-100">
          HubEdu.ia
        </h1>
        
        <h2 className="text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold text-black mb-3 leading-tight slide-in-up animate-delay-200">
          IA educacional completa para escolas brasileiras
        </h2>

        <p className="text-sm md:text-base lg:text-lg xl:text-xl text-gray-700 mb-3 leading-relaxed font-medium slide-in-up animate-delay-300">
          Professor digital • Automações administrativas • Atendimento inteligente
        </p>
        
        <p className="text-xs md:text-sm lg:text-base xl:text-lg text-gray-600 mb-4 md:mb-6 lg:mb-8 max-w-3xl mx-auto leading-relaxed slide-in-up animate-delay-400">
          Alinhado à <strong className="text-yellow-600">BNCC</strong>, com <strong className="text-green-600">conversas efêmeras</strong> (LGPD) e suporte em <strong className="text-yellow-600">português do Brasil</strong>.
        </p>
        <div className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-orange-500 text-white p-3 md:p-4 lg:p-6 rounded-2xl mb-3 md:mb-4 lg:mb-6 max-w-3xl mx-auto shadow-2xl slide-in-up animate-delay-500">
          <h3 className="text-base md:text-lg lg:text-xl font-bold mb-2 text-center">Resultado comprovado</h3>
          <p className="text-xs md:text-sm lg:text-base text-center">Até <strong>70% de economia</strong> em custos, <strong>15h/semana</strong> economizadas e uma <strong>comunicação clara</strong> em todos os canais da escola.</p>
        </div>
        <div className="flex justify-center bounce-in animate-delay-500">
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-3 md:px-4 lg:px-8 py-2 md:py-3 lg:py-4 text-xs md:text-sm lg:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all w-full md:w-auto max-w-sm">
            👉 Agendar Demonstração Gratuita
          </Button>
        </div>
        </div>
      ),
    background: "bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30"
    },
  {
    id: 2,
    title: "Como Funciona",
    subtitle: "Módulos e principais recursos",
    content: (
      <div className="two-by-two-grid">
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm md:text-base"><BookOpen className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" /> Professor IA 24h</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600 text-xs md:text-sm">
            Tutor seguro por faixa etária (Infantil, Fundamental I/II, Médio), alinhado à BNCC, com reforço, resolução de dúvidas, resumos, gráficos e imagens. Economia típica vs. aulas particulares: até R$ 3.000/mês.
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm md:text-base"><Cpu className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" /> Automação Administrativa</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600 text-xs md:text-sm">
            TI, Secretaria, RH e Financeiro mais ágeis: redução de chamados (até 80% em TI), aceleração de rotinas (+60% em eficiência) e padronização de processos.
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm md:text-base"><Shield className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" /> LGPD + BNCC</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600 text-xs md:text-sm">
            Conversas efêmeras (LGPD) por padrão, filtros por idade e governança pedagógica alinhada à BNCC.
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm md:text-base"><TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" /> Resultados</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600 text-xs md:text-sm">
            Até 70% de economia em custos, 15h/semana economizadas e comunicação clara em todos os canais.
          </CardContent>
        </Card>
      </div>
    ),
    background: "bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30"
  },
  {
    id: 3,
    title: "Módulos Disponíveis",
    subtitle: "9 áreas especializadas",
    content: (
      <div className="adaptive-grid">
        {[
          { icon: BookOpen, label: 'Professor', desc: 'Professor digital 24/7 com filtros por idade e alinhamento à BNCC.' },
          { icon: Cpu, label: 'TI', desc: 'Automação de configurações, guias e redução de chamados.' },
          { icon: Building, label: 'Secretaria', desc: 'Atendimento a pais, matrículas e fluxo de rotinas.' },
          { icon: BarChart, label: 'Financeiro', desc: 'Relatórios e apoio operacional com consistência.' },
          { icon: Users, label: 'RH', desc: 'Processos e orientações para a equipe.' },
          { icon: Zap, label: 'Atendimento', desc: 'Respostas rápidas e padronizadas para a comunidade.' },
          { icon: TrendingUp, label: 'Coordenação', desc: 'Apoio pedagógico e organização didática.' },
          { icon: Zap, label: 'Social Media', desc: 'Conteúdo e suporte para comunicação digital.' },
          { icon: Shield, label: 'Bem-Estar', desc: 'Acolhimento e boas práticas socioemocionais.' },
        ].map(({ icon: Icon, label, desc }, index) => (
          <Card key={label} className="hover-lift slide-in-up animate-delay-100" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                <Icon className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" /> {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 text-xs md:text-sm pt-0">{desc || 'Soluções práticas para a escola.'}</CardContent>
          </Card>
        ))}
      </div>
    ),
    background: "bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30"
  },
  {
    id: 4,
    title: "Funcionalidades do Chat IA",
    subtitle: "Completo, simples e em conformidade",
    content: (
      <div>
        {/* 2x2: duas listas de recursos + LGPD/BNCC */}
        <div className="two-by-two-grid">
          {/* Coluna 1: recursos gerais */}
          <Card className="hover-lift slide-in-up animate-delay-100">
            <CardContent className="pt-4 md:pt-6 text-gray-700 text-xs md:text-sm space-y-2">
              <p className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600"/> Streaming de respostas</p>
              <p className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600"/> Upload de arquivos, imagens e áudio</p>
              <p className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600"/> Matemática e formatação avançada</p>
              <p className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600"/> Histórico, exportação e compartilhamento</p>
              <p className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600"/> Quotas e limites com monitoramento</p>
            </CardContent>
          </Card>

          {/* Coluna 2: performance/integrações */}
          <Card className="hover-lift slide-in-up animate-delay-200">
            <CardContent className="pt-4 md:pt-6 text-gray-700 text-xs md:text-sm space-y-2">
              <p className="flex items-center gap-2"><Brain className="w-4 h-4 text-yellow-600"/> Modelos IA com contexto brasileiro</p>
              <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-600"/> Respostas rápidas em tempo real</p>
              <p className="flex items-center gap-2"><Users className="w-4 h-4 text-yellow-600"/> Multimódulos por perfil</p>
              <p className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-600"/> Integrações e automações</p>
            </CardContent>
          </Card>

          {/* Linha 2: conformidade */}
          <Card className="hover-lift slide-in-up animate-delay-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm md:text-base"><Shield className="w-4 h-4 md:w-5 md:h-5 text-green-700"/> Privacidade (LGPD)</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 text-xs md:text-sm">
              Conversas efêmeras por padrão, minimização de dados e controle de acesso. Logs e auditoria conforme boas práticas.
            </CardContent>
          </Card>
          <Card className="hover-lift slide-in-up animate-delay-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm md:text-base"><BookOpen className="w-4 h-4 md:w-5 md:h-5 text-yellow-700"/> Alinhado à BNCC</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 text-xs md:text-sm">
              Governança pedagógica: conteúdo e exemplos adequados ao currículo brasileiro e diferentes níveis de ensino.
            </CardContent>
          </Card>
        </div>
      </div>
    ),
    background: "bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30"
  },
  
  {
    id: 5.1 as any,
    title: "Casos de Uso e ROI",
    subtitle: "Resultados práticos",
    content: (
      <div className="adaptive-grid">
        <Card className="slide-in-up animate-delay-100">
          <CardContent className="pt-4 md:pt-6 text-center">
            <div className="text-2xl md:text-3xl font-extrabold text-yellow-600 mb-2">-30%</div>
            <p className="text-gray-600 text-xs md:text-sm">Tempo em tarefas administrativas</p>
          </CardContent>
        </Card>
        <Card className="slide-in-up animate-delay-200">
          <CardContent className="pt-4 md:pt-6 text-center">
            <div className="text-2xl md:text-3xl font-extrabold text-yellow-600 mb-2">+25%</div>
            <p className="text-gray-600 text-xs md:text-sm">Agilidade no atendimento</p>
          </CardContent>
        </Card>
        <Card className="slide-in-up animate-delay-300">
          <CardContent className="pt-4 md:pt-6 text-center">
            <div className="text-2xl md:text-3xl font-extrabold text-yellow-600 mb-2">+18%</div>
            <p className="text-gray-600 text-xs md:text-sm">Engajamento pedagógico</p>
          </CardContent>
        </Card>
      </div>
    ),
    background: "bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30"
  },
  {
    id: 5.15 as any,
    title: "Indicadores de impacto",
    subtitle: "Métricas do HubEdu.ia",
    content: (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
        {sharedStats.map((stat, index) => (
          <div key={index} className="text-center group slide-in-up animate-delay-100" style={{ animationDelay: `${index * 150}ms` }}>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow text-white scale-in animate-delay-200" style={{ animationDelay: `${index * 150 + 200}ms` }}>
              <stat.icon className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div className="text-xl md:text-2xl lg:text-3xl font-extrabold text-black mb-1 bounce-in animate-delay-300" style={{ animationDelay: `${index * 150 + 300}ms` }}>{stat.value}</div>
            <div className="text-gray-700 font-medium text-xs md:text-sm slide-in-up animate-delay-400" style={{ animationDelay: `${index * 150 + 400}ms` }}>{stat.label}</div>
          </div>
        ))}
      </div>
    ),
    background: "bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30"
  },
  {
    id: 5.2 as any,
    title: "Comparação de preços",
    subtitle: "HubEdu.ia vs. alternativas",
    content: (
      <div className="max-w-7xl mx-auto">
        {/* Logotipo decorativo */}
        <div className="flex justify-center mb-8">
          <div className="relative group floating-animation p-3">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 pulse-glow"></div>
            <Image
        src={ASSETS.LOGO_ICON}
        alt={"Image"}
        width={500}
        height={300}
        className={""}
        loading={"lazy"}
      />
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {comparisonCards.map((card, idx) => (
            <div key={idx} className={`w-80 max-w-sm rounded-2xl p-4 md:p-6 shadow-lg border transition-all duration-300 hover:scale-105 slide-in-up animate-delay-100 ${
              card.variant === 'highlight' 
                ? 'bg-gradient-to-br from-yellow-600 to-yellow-700 text-white border-yellow-700 shadow-2xl' 
                : 'bg-white/90 backdrop-blur-sm border-gray-200 hover:shadow-xl'
            }`} style={{ animationDelay: `${idx * 150}ms` }}>
              {card.variant === 'highlight' && (
                <div className="-mt-6 md:-mt-8 mb-3 md:mb-4 text-center">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-bold shadow-lg">
                    🏆 MELHOR CUSTO-BENEFÍCIO
                  </span>
                </div>
              )}
              <h3 className={`text-lg md:text-xl font-bold mb-2 md:mb-3 ${card.variant === 'highlight' ? '' : 'text-slate-900'}`}>
                {card.title}
              </h3>
              <div className={`text-2xl md:text-3xl lg:text-4xl font-extrabold mb-2 ${card.variant === 'highlight' ? '' : 'text-yellow-600'}`}>
                {card.priceLabel}
              </div>
              {card.priceNote && (
                <p className={`${card.variant === 'highlight' ? 'text-white/90' : 'text-slate-700'} text-xs md:text-sm mb-3 md:mb-4`}>
                  {card.priceNote}
                </p>
              )}
              <div className="space-y-1 md:space-y-2">
                {card.bullets.map((bullet, i) => (
                  <p key={i} className={`text-xs md:text-sm ${card.variant === 'highlight' ? 'text-white' : 'text-slate-800'}`}>
                    {bullet}
                  </p>
                ))}
              </div>
              
              {/* Elemento decorativo */}
              <div className={`mt-3 md:mt-4 h-1 rounded-full ${
                card.variant === 'highlight' 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-400' 
                  : 'bg-gradient-to-r from-slate-200 to-slate-300'
              }`}></div>
            </div>
          ))}
        </div>
        
        {/* Nota explicativa */}
        <div className="mt-6 md:mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-white/20 text-center">
          <p className="text-gray-600 text-xs md:text-sm">
            💡 <strong>HubEdu.ia</strong> oferece todos os módulos em uma única plataforma, eliminando a necessidade de múltiplas assinaturas e reduzindo custos operacionais.
          </p>
        </div>
      </div>
    ),
    background: "bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30"
  },
  {
    id: 5.3 as any,
    title: "Problemas reais que resolvemos",
    subtitle: "Onde chats genéricos falham, uma plataforma entrega",
    content: (
      <div className="adaptive-grid">
        <Card className="border-l-4 border-rose-600 slide-in-left animate-delay-100">
          <CardContent className="pt-4 md:pt-6">
            <h4 className="text-base md:text-lg font-bold text-black mb-2">Custos altos</h4>
            <p className="text-gray-700 mb-3 text-sm md:text-base">Vários fornecedores (tutoria, TI, administrativo) elevam o custo fixo.</p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs md:text-sm text-emerald-800">
              <strong>Solução:</strong> Ambiente integrado substitui múltiplos serviços por até 70% menos.
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-rose-600 slide-in-up animate-delay-200">
          <CardContent className="pt-4 md:pt-6">
            <h4 className="text-base md:text-lg font-bold text-black mb-2">Privacidade</h4>
            <p className="text-gray-700 mb-3 text-sm md:text-base">Chats comuns guardam dados sensíveis de menores.</p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs md:text-sm text-emerald-800">
              <strong>Solução:</strong> Conversas efêmeras: privacidade por padrão e aderência à LGPD.
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-rose-600 slide-in-right animate-delay-300">
          <CardContent className="pt-4 md:pt-6">
            <h4 className="text-base md:text-lg font-bold text-black mb-2">Conteúdo inadequado</h4>
            <p className="text-gray-700 mb-3 text-sm md:text-base">Respostas genéricas podem ser problemáticas para crianças.</p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs md:text-sm text-emerald-800">
              <strong>Solução:</strong> Filtros por idade + orientação pedagógica alinhada à BNCC.
            </div>
          </CardContent>
        </Card>
      </div>
    ),
    background: "bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30"
  },
  {
    id: 5.5 as any,
    title: "A diferença é clara",
    subtitle: "HubEdu.ia vs. alternativas",
    content: (
      <div className="text-center">
        <p className="text-sm md:text-base lg:text-lg xl:text-xl mb-4 slide-in-up animate-delay-100 text-gray-700">Plataforma educacional com IA que resolve problemas reais — não apenas um chat.</p>
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 text-xs md:text-sm font-semibold">
          <span className="bg-white px-3 md:px-4 py-1 md:py-2 rounded-full border slide-in-up animate-delay-200">Segurança educacional</span>
          <span className="bg-white px-3 md:px-4 py-1 md:py-2 rounded-full border slide-in-up animate-delay-300">Conformidade LGPD</span>
          <span className="bg-white px-3 md:px-4 py-1 md:py-2 rounded-full border slide-in-up animate-delay-400">Economia comprovada</span>
          <span className="bg-white px-3 md:px-4 py-1 md:py-2 rounded-full border slide-in-up animate-delay-500">Suporte em português</span>
        </div>
      </div>
    ),
    background: "bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30"
  },
  {
    id: 6,
    title: "Depoimentos",
    subtitle: "Quem usa, recomenda",
    content: (
      <div className="max-w-6xl mx-auto shift-up-100">
        {/* Logotipo decorativo */}
        <div className="flex justify-center mb-8">
          <div className="relative group floating-animation p-3">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 pulse-glow"></div>
            <Image
        src={ASSETS.LOGO_ICON}
        alt={"Image"}
        width={500}
        height={300}
        className={""}
        loading={"lazy"}
      />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[
            {
              name: "Maria Silva",
              role: "Coordenadora Pedagógica",
              school: "Colégio São José",
              testimonial: "Simplificou processos e melhorou a comunicação com pais e alunos. Economizamos 15 horas por semana!",
              rating: 5
            },
            {
              name: "João Santos",
              role: "Diretor",
              school: "Escola Futuro",
              testimonial: "A IA do professor é incrível. Os alunos adoram e os resultados acadêmicos melhoraram significativamente.",
              rating: 5
            },
            {
              name: "Ana Costa",
              role: "Secretária",
              school: "Instituto Educacional",
              testimonial: "Atendimento automatizado reduziu nossa carga de trabalho em 70%. Sistema muito intuitivo!",
              rating: 5
            }
          ].map((testimonial, index) => (
            <Card key={index} className="hover-lift bg-white/90 backdrop-blur-sm border-0 shadow-lg slide-in-up animate-delay-100" style={{ animationDelay: `${index * 200}ms` }}>
              <CardContent className="pt-4 md:pt-6">
                <div className="flex items-center gap-1 mb-3 md:mb-4 slide-in-up animate-delay-200" style={{ animationDelay: `${index * 200 + 100}ms` }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-xs md:text-sm mb-3 md:mb-4 italic slide-in-up animate-delay-300" style={{ animationDelay: `${index * 200 + 200}ms` }}>&ldquo;{testimonial.testimonial}&rdquo;</p>
                <div className="border-t pt-2 md:pt-3 slide-in-up animate-delay-400" style={{ animationDelay: `${index * 200 + 300}ms` }}>
                  <p className="text-black font-semibold text-xs md:text-sm">{testimonial.name}</p>
                  <p className="text-gray-500 text-xs">{testimonial.role}</p>
                  <p className="text-gray-400 text-xs">{testimonial.school}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Estatísticas de satisfação */}
        <div className="mt-6 md:mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-white/20 slide-in-up animate-delay-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-center">
            <div className="slide-in-up animate-delay-600">
              <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">98%</div>
              <p className="text-gray-600 text-xs md:text-sm">Satisfação dos usuários</p>
            </div>
            <div className="slide-in-up animate-delay-700">
              <div className="text-2xl md:text-3xl font-bold text-yellow-600 mb-1">15h</div>
              <p className="text-gray-600 text-xs md:text-sm">Economizadas por semana</p>
            </div>
            <div className="slide-in-up animate-delay-800">
              <div className="text-2xl md:text-3xl font-bold text-yellow-600 mb-1">70%</div>
              <p className="text-gray-600 text-xs md:text-sm">Redução de custos</p>
            </div>
          </div>
        </div>
      </div>
    ),
    background: "bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30"
  },
  {
    id: 7,
    title: "Demonstração: Chat IA",
    subtitle: "Versão demo com 5 mensagens",
    content: (
      <div className="w-full h-full px-4 md:px-8 lg:px-12 py-2 md:py-4 lg:py-6 shift-up-120">
        {/* Container do chat ocupando quase toda a tela */}
        <div className="w-full h-full bg-white/95 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-xl border border-white/20 overflow-hidden flex flex-col">
          {/* Barra superior do chat */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-3 md:px-4 py-2 md:py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 md:space-x-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div>
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/70 rounded-full"></div>
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/50 rounded-full"></div>
              </div>
              <div className="flex items-center space-x-1 md:space-x-2">
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-xs md:text-sm font-medium">HubEdu.ia Chat</span>
              </div>
              <div className="w-5 h-2.5 md:w-6 md:h-3 bg-white/20 rounded-full flex items-center">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full ml-0.5"></div>
              </div>
            </div>
          </div>

          {/* Área do chat - ocupa todo o espaço restante */}
          <div className="flex-1 relative overflow-y-auto">
            <div className="h-full">
              <Chat 
                maxMessages={5}
                embedded={true}
                onLimitReached={() => {
                  console.log('Demo limit reached');
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    background: "bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30"
  },
  {
    id: 8,
    title: "Tabela de Preços",
    subtitle: "Planos detalhados por faixa de alunos",
    content: (
      <div className="max-w-6xl mx-auto shift-up-100">
        {/* Logotipo decorativo */}
        <div className="flex justify-center mb-2">
          <div className="relative group floating-animation p-3">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 pulse-glow"></div>
            <Image
        src={ASSETS.LOGO_ICON}
        alt={"Image"}
        width={500}
        height={300}
        className={""}
        loading={"lazy"}
      />
          </div>
        </div>
        
        {/* Tabela de preços */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 md:p-6">
            <h3 className="text-xl md:text-2xl font-bold text-center">Planos HubEdu.ia</h3>
            <p className="text-yellow-100 text-center mt-2 text-sm md:text-base">Preços por escola, sem cobrança por usuário</p>
          </div>
          
          <div className="overflow-x-auto adaptive-table">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-black">Faixa de alunos</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-black">Valor mensal</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-black">Custo médio por aluno</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-yellow-50 transition-colors">
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-black">Até 150 alunos</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-yellow-600">R$ 2.000</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">≈ R$ 13,33/aluno</td>
                </tr>
                <tr className="hover:bg-yellow-50 transition-colors">
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-black">Até 300 alunos</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-yellow-600">R$ 3.500</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">≈ R$ 11,67/aluno</td>
                </tr>
                <tr className="hover:bg-yellow-50 transition-colors">
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-black">Até 500 alunos</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-yellow-600">R$ 5.000</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">R$ 10,00/aluno</td>
                </tr>
                <tr className="hover:bg-yellow-50 transition-colors">
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-black">Até 750 alunos</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-yellow-600">R$ 6.500</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">≈ R$ 8,67/aluno</td>
                </tr>
                <tr className="hover:bg-yellow-50 transition-colors">
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-black">Até 1.000 alunos</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-yellow-600">R$ 8.000</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">R$ 8,00/aluno</td>
                </tr>
                <tr className="hover:bg-yellow-50 transition-colors bg-gradient-to-r from-yellow-50 to-orange-50">
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-black">1.001+ alunos</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-orange-600">Sob consulta</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-orange-600">Customizado</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="bg-gray-50 p-4 md:p-6 border-t">
            <div className="flex items-center justify-center space-x-2 text-xs md:text-sm text-gray-600">
              <Check className="w-3 h-3 md:w-4 md:h-4 text-yellow-600" />
              <span>Todos os planos incluem todos os módulos e suporte completo</span>
            </div>
          </div>
        </div>
      </div>
    ),
    background: "bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30"
  },
  {
    id: 9,
    title: "Encerramento",
    subtitle: "Próximos passos",
    content: (
      <div className="text-center shift-up-100">
        {/* Logotipo grande centralizado */}
        <div className="flex justify-center mb-4 mt-2">
          <div className="relative group floating-animation p-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 pulse-glow"></div>
            <Image
        src={ASSETS.LOGO_ICON}
        alt={"Image"}
        width={500}
        height={300}
        className={""}
        loading={"lazy"}
        style={{ filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.2))" }}
      />
          </div>
        </div>
        
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-3">
          Obrigado pela sua atenção!
        </h3>
        
        <div className="max-w-2xl mx-auto mb-6 md:mb-8">
          <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-3 md:mb-4">
            Entre em contato para uma demonstração guiada ou para ativar um piloto na sua escola.
          </p>
          <p className="text-sm md:text-base text-gray-500">
            Transforme sua escola com inteligência artificial educacional
          </p>
        </div>
        
        {/* Informações de contato */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-white/20 max-w-md mx-auto">
          <h4 className="text-base md:text-lg font-semibold text-black mb-3">Contato</h4>
          <div className="space-y-2 text-xs md:text-sm text-gray-600">
            <p>📧 contato@hubedu.ai</p>
            <p>🌐 www.hubedu.ai</p>
            <p>📱 WhatsApp disponível</p>
          </div>
        </div>
      </div>
    ),
    background: "bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30"
  }
];

export default function Apresentacao() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Debug: Log do estado atual
  useEffect(() => {
    console.log('Slide atual:', currentSlide.toString());
    console.log('Total slides:', slides.length.toString());
    console.log('Transição:', isTransitioning.toString());
  }, [currentSlide, isTransitioning]);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(prev => prev + 1);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 50);
    }
  }, [currentSlide, isTransitioning]);

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
  }, [currentSlide, isTransitioning, nextSlide, prevSlide]);


  return (
    <div className="min-h-screen bg-background text-foreground apresentacao-page">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      {/* Container principal */}
      <div className="relative min-h-screen">
        {/* Background fallback - sempre visível */}
        <div className="fixed inset-0 bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30 z-0"></div>
        
        {/* Slides */}
        <div className="relative h-screen overflow-hidden z-10">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 ${slide.background} slide-transition ${
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
          
        {/* Controles de navegação */}
        <div className="fixed top-1 md:top-2 left-1/2 transform -translate-x-1/2 z-50">
          <div className="flex items-center space-x-0.5 md:space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-1.5 md:px-2 py-0.5 md:py-1 shadow-lg border border-white/20">
            {/* Botão anterior */}
            <Button
              onClick={prevSlide}
              disabled={currentSlide === 0 || isTransitioning}
              variant="outline"
              size="sm"
              className="rounded-full w-5 h-5 md:w-6 md:h-6 p-0 bg-transparent hover:bg-gray-100 border-gray-300 hover:border-gray-400"
            >
              <ChevronLeft className="w-2.5 h-2.5 md:w-3 md:h-3" />
            </Button>

            {/* Indicadores de slide */}
            <div className="flex space-x-0.5 md:space-x-1">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  disabled={isTransitioning}
                  className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-yellow-500 scale-150 ring-2 ring-yellow-400 ring-offset-1 ring-white' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Botão próximo */}
            <Button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1 || isTransitioning}
              variant="outline"
              size="sm"
              className="rounded-full w-5 h-5 md:w-6 md:h-6 p-0 bg-transparent hover:bg-gray-100 border-gray-300 hover:border-gray-400"
            >
              <ChevronRight className="w-2.5 h-2.5 md:w-3 md:h-3" />
            </Button>

            {/* Botão tela cheia */}
            <Button
              onClick={toggleFullscreen}
              variant="outline"
              size="sm"
              className="rounded-full w-5 h-5 md:w-6 md:h-6 p-0 bg-transparent hover:bg-gray-100 border-gray-300 hover:border-gray-400"
              title="Tela cheia (F)"
            >
              {isFullscreen ? <Minimize className="w-2.5 h-2.5 md:w-3 md:h-3" /> : <Maximize className="w-2.5 h-2.5 md:w-3 md:h-3" />}
            </Button>
          </div>
        </div>

        {/* Logotipo - lado esquerdo */}
        <div className="fixed top-4 md:top-8 left-2 md:left-8 z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 md:p-2 shadow-lg border border-white/20">
            <div className="flex items-center space-x-1 md:space-x-2">
              <Image
        src={ASSETS.LOGO_ICON}
        alt={"Image"}
        width={500}
        height={300}
        className={""}
        loading={"lazy"}
      />
              <span className="text-xs md:text-sm font-bold text-gray-800">
                HubEdu.ia
              </span>
            </div>
          </div>
        </div>
        
        {/* Contador de slides - lado direito */}
        <div className="fixed top-4 md:top-8 right-2 md:right-8 z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 md:px-4 py-1 md:py-2 shadow-lg border border-white/20">
            <span className="text-xs md:text-sm font-medium text-gray-700">
              {currentSlide + 1} de {slides.length}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
