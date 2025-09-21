"use client"

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Headphones, 
  Heart, 
  Share2, 
  ClipboardList,
  GraduationCap,
  Monitor
} from "lucide-react";
import { MODULES, ModuleId } from "@/lib/modules";

interface ModuleWelcomeProps {
  moduleId: ModuleId;
  onSuggestionClick: (suggestion: string) => void;
  quotaAvailable?: boolean;
}

const moduleWelcomeData = {
  PROFESSOR: {
    title: "Professor Particular Digital",
    subtitle: "Seu assistente de estudos personalizado",
    description: "Aqui você pode tirar dúvidas, criar aulas interativas e receber explicações detalhadas sobre qualquer matéria.",
    icon: BookOpen,
    color: "bg-gradient-to-br from-blue-500 to-blue-700",
    iconColor: "text-blue-600",
    suggestions: [
      "Explique o teorema de Pitágoras",
      "Como resolver equações de segundo grau?",
      "Me ajude com a história do Brasil",
      "Qual a diferença entre mitose e meiose?",
      "Crie uma aula sobre fotossíntese",
      "Como funciona a fotossíntese?"
    ],
    features: [
      "Aulas interativas personalizadas",
      "Explicações didáticas e claras",
      "Exercícios práticos",
      "Suporte em todas as matérias"
    ]
  },
  TI: {
    title: "Suporte Técnico Educacional",
    subtitle: "Especialista em tecnologia educacional",
    description: "Resolva problemas técnicos, configure equipamentos e receba suporte especializado em tecnologia educacional.",
    icon: Monitor,
    color: "bg-gradient-to-br from-gray-500 to-gray-700",
    iconColor: "text-gray-600",
    suggestions: [
      "Como configurar o Google Workspace?",
      "Problema com Chromebook não conecta",
      "Como fazer backup dos dados?",
      "Configurar rede Wi-Fi da escola",
      "Projetor não está funcionando",
      "Como instalar software educacional?"
    ],
    features: [
      "Suporte em Google Workspace",
      "Configuração de Chromebooks",
      "Troubleshooting técnico",
      "Segurança digital"
    ]
  },
  RH: {
    title: "Recursos Humanos",
    subtitle: "Gestão de pessoas e desenvolvimento profissional",
    description: "Orientações sobre benefícios, políticas internas, desenvolvimento profissional e gestão de equipes educacionais.",
    icon: Users,
    color: "bg-gradient-to-br from-purple-500 to-purple-700",
    iconColor: "text-purple-600",
    suggestions: [
      "Como contratar novos professores?",
      "Política de férias escolares",
      "Avaliação de desempenho docente",
      "Benefícios para funcionários",
      "Como fazer treinamento de equipe?",
      "Políticas de desenvolvimento profissional"
    ],
    features: [
      "Gestão de equipe educacional",
      "Desenvolvimento profissional",
      "Políticas de RH",
      "Avaliação de desempenho"
    ]
  },
  FINANCEIRO: {
    title: "Gestão Financeira Escolar",
    subtitle: "Controle financeiro e administrativo",
    description: "Ajuda com mensalidades, boletos, relatórios financeiros e gestão de recursos da instituição.",
    icon: DollarSign,
    color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
    iconColor: "text-yellow-600",
    suggestions: [
      "Como calcular mensalidades?",
      "Relatório de inadimplência",
      "Gestão de bolsas de estudo",
      "Controle de despesas escolares",
      "Como fazer renegociação de mensalidades?",
      "Relatórios financeiros mensais"
    ],
    features: [
      "Controle de mensalidades",
      "Relatórios financeiros",
      "Gestão de bolsas",
      "Análise de inadimplência"
    ]
  },
  COORDENACAO: {
    title: "Coordenação Pedagógica",
    subtitle: "Gestão pedagógica e acadêmica",
    description: "Suporte para planejamento curricular, acompanhamento pedagógico e coordenação acadêmica.",
    icon: TrendingUp,
    color: "bg-gradient-to-br from-indigo-500 to-indigo-700",
    iconColor: "text-indigo-600",
    suggestions: [
      "Planejamento curricular anual",
      "Acompanhamento de turmas",
      "Relatórios pedagógicos",
      "Projetos interdisciplinares",
      "Como avaliar desempenho das turmas?",
      "Estratégias de ensino-aprendizagem"
    ],
    features: [
      "Planejamento curricular",
      "Acompanhamento pedagógico",
      "Relatórios acadêmicos",
      "Projetos educacionais"
    ]
  },
  ATENDIMENTO: {
    title: "Atendimento ao Cliente",
    subtitle: "Suporte multicanal e experiência do usuário",
    description: "Atendimento especializado para pais, alunos e comunidade escolar com foco na satisfação e resolução de questões.",
    icon: Headphones,
    color: "bg-gradient-to-br from-red-500 to-red-700",
    iconColor: "text-red-600",
    suggestions: [
      "Como atender pais de alunos?",
      "Protocolo de matrículas",
      "Comunicação com famílias",
      "Gestão de reclamações",
      "Como melhorar o atendimento?",
      "Estratégias de comunicação"
    ],
    features: [
      "Atendimento multicanal",
      "Gestão de relacionamento",
      "Resolução de conflitos",
      "Comunicação eficaz"
    ]
  },
  BEM_ESTAR: {
    title: "Bem-Estar e Suporte Socioemocional",
    subtitle: "Cuidado integral e desenvolvimento humano",
    description: "Suporte emocional, estratégias de bem-estar e promoção de um ambiente escolar saudável e acolhedor.",
    icon: Heart,
    color: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    iconColor: "text-emerald-600",
    suggestions: [
      "Como acolher alunos com ansiedade?",
      "Estratégias de autocuidado",
      "Promoção de ambiente seguro",
      "Suporte socioemocional",
      "Como lidar com conflitos entre alunos?",
      "Técnicas de relaxamento para estudantes"
    ],
    features: [
      "Suporte emocional",
      "Estratégias de bem-estar",
      "Ambiente acolhedor",
      "Desenvolvimento socioemocional"
    ]
  },
  SOCIAL_MEDIA: {
    title: "Social Media e Comunicação Digital",
    subtitle: "Criação de conteúdo e engajamento digital",
    description: "Criação de posts, gestão de redes sociais e estratégias de comunicação digital para a escola.",
    icon: Share2,
    color: "bg-gradient-to-br from-pink-500 to-pink-700",
    iconColor: "text-pink-600",
    suggestions: [
      "Posts para redes sociais",
      "Comunicação de eventos escolares",
      "Celebração de conquistas",
      "Engajamento com famílias",
      "Como criar conteúdo educativo?",
      "Estratégias de marketing digital"
    ],
    features: [
      "Criação de conteúdo",
      "Gestão de redes sociais",
      "Marketing digital",
      "Engajamento da comunidade"
    ]
  },
  ENEM_INTERACTIVE: {
    title: "ENEM Interativo",
    subtitle: "Preparação completa para o Exame Nacional",
    description: "Simulador ENEM personalizado, análise de performance e estratégias de estudo específicas para o exame.",
    icon: ClipboardList,
    color: "bg-gradient-to-br from-red-500 to-red-700",
    iconColor: "text-red-600",
    suggestions: [
      "Simulador ENEM personalizado",
      "Análise de performance",
      "Estratégias de estudo",
      "Revisão de conteúdo",
      "Como interpretar gráficos no ENEM?",
      "Técnicas de redação para o ENEM"
    ],
    features: [
      "Simulador personalizado",
      "Análise de performance",
      "Estratégias específicas",
      "Preparação completa"
    ]
  },
  AULA_EXPANDIDA: {
    title: "Aulas Expandidas",
    subtitle: "Conteúdo interativo e gamificado",
    description: "Aulas completas com quizzes, exercícios interativos e conteúdo expandido para uma experiência de aprendizado imersiva.",
    icon: GraduationCap,
    color: "bg-gradient-to-br from-yellow-400 to-orange-500",
    iconColor: "text-orange-600",
    suggestions: [
      "Aula completa sobre equações",
      "Quiz interativo de história",
      "Exercícios de física com simulações",
      "Aula gamificada de biologia",
      "Conteúdo interativo de química",
      "Aulas com realidade virtual"
    ],
    features: [
      "Conteúdo interativo",
      "Quizzes gamificados",
      "Exercícios práticos",
      "Experiência imersiva"
    ]
  }
};

export const ModuleWelcome: React.FC<ModuleWelcomeProps> = ({
  moduleId,
  onSuggestionClick,
  quotaAvailable = true
}) => {
  const moduleData = moduleWelcomeData[moduleId];
  const moduleInfo = MODULES[moduleId];

  if (!moduleData || !moduleId) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Módulo não encontrado</p>
      </div>
    );
  }

  const IconComponent = moduleData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl pt-24" role="main">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 rounded-3xl blur-3xl"></div>
            
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-6">
                  <IconComponent className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white fill-current" />
                </div>
              </div>
              
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                {moduleData.title}
              </h1>
              <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                {moduleData.subtitle}
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-yellow-100 text-yellow-800 border border-yellow-200">
                  <BookOpen className="h-4 w-4" />
                  IA Avançada
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-100 text-orange-800 border border-orange-200">
                  <Users className="h-4 w-4" />
                  Personalizado
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-red-100 text-red-800 border border-red-200">
                  <Heart className="h-4 w-4" />
                  Interativo
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-green-100 text-green-800 border border-green-200">
                  <GraduationCap className="h-4 w-4" />
                  Inteligente
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200">
                  <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-yellow-900 mb-2">Especializado</h3>
                  <p className="text-sm text-yellow-700">Conhecimento específico para sua área</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-orange-900 mb-2">Personalizado</h3>
                  <p className="text-sm text-orange-700">Respostas adaptadas ao seu contexto</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-red-900 mb-2">Sempre Disponível</h3>
                  <p className="text-sm text-red-700">Suporte 24/7 para suas necessidades</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Seção "O que você encontra aqui" */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <ClipboardList className="h-4 w-4 text-white" />
              </div>
              O que você encontra aqui
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Recursos e funcionalidades disponíveis neste módulo
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moduleData.features.map((feature, index) => (
              <div key={index} className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 hover:border-yellow-300 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <span className="text-gray-700 font-medium leading-relaxed">{feature}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seção "Sugestões para [Módulo]" */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <IconComponent className="h-4 w-4 text-white" />
              </div>
              Sugestões para {moduleData.title}
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Clique em qualquer sugestão para começar uma conversa
            </p>
          </div>
          
          {/* Perguntas Populares */}
          <div className="mb-8">
            <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Headphones className="h-3 w-3 text-white" />
              </div>
              Perguntas Populares
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {moduleData.suggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => quotaAvailable && onSuggestionClick(suggestion)}
                  disabled={!quotaAvailable}
                  className="group p-6 text-left border-2 border-gray-200 rounded-2xl hover:border-yellow-300 hover:bg-gradient-to-br hover:from-yellow-50 hover:to-orange-50 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Perguntar sobre ${suggestion}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-base font-semibold text-gray-800 group-hover:text-yellow-800 line-clamp-2 leading-relaxed">
                      {suggestion}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200">
                      {moduleData.title}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-3 py-1 border-orange-200 text-orange-700">
                      Sugestão
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tópicos Disponíveis */}
          <div>
            <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-3 w-3 text-white" />
              </div>
              Tópicos Disponíveis
            </h4>
            <div className="flex flex-wrap gap-3">
              {["Geral", "Específico", "Avançado"].map((topic, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  size="sm"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  onClick={() => quotaAvailable && onSuggestionClick(`Me ajude com ${topic.toLowerCase()}`)}
                  disabled={!quotaAvailable}
                >
                  {topic}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Campo de Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder={`Digite sua pergunta sobre ${moduleData.title.toLowerCase()}...`}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!quotaAvailable}
            />
            <Button 
              variant="outline" 
              size="icon"
              className="p-3"
              disabled={!quotaAvailable}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="p-3"
              disabled={!quotaAvailable}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </Button>
            <Button 
              className="p-3 bg-blue-500 hover:bg-blue-600 text-white"
              disabled={!quotaAvailable}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Badge de Status */}
      <div className="text-center mb-20">
        <Badge variant="outline" className="text-sm">
          {quotaAvailable ? "✅ Disponível" : "⏸️ Quota esgotada"}
        </Badge>
      </div>
    </div>
  );
};

