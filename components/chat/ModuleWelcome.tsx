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
  const IconComponent = moduleData.icon;

  if (!moduleData) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Módulo não encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white min-h-full">
      {/* Header do Módulo */}
      <div className="text-center mb-8">
        <div className={`w-20 h-20 ${moduleData.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
          <IconComponent className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {moduleData.title}
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          {moduleData.subtitle}
        </p>
        <p className="text-gray-500 max-w-2xl mx-auto">
          {moduleData.description}
        </p>
      </div>

      {/* Seção "O que você encontra aqui" */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">★</span>
          </div>
          O que você encontra aqui
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {moduleData.features.map((feature, index) => (
            <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className={`w-10 h-10 ${moduleData.color} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  {feature}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Funcionalidade específica do módulo {moduleData.title}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Seção "Sugestões para [Módulo]" */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
            <IconComponent className="w-4 h-4 text-white" />
          </div>
          Sugestões para {moduleData.title}
        </h2>
        
        {/* Perguntas Populares */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
              <Headphones className="w-3 h-3 text-white" />
            </div>
            Perguntas Populares
          </h3>
          <div className="space-y-3">
            {moduleData.suggestions.slice(0, 3).map((suggestion, index) => (
              <div
                key={index}
                className={`rounded-lg px-4 py-3 text-sm cursor-pointer transition-colors ${
                  quotaAvailable 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm' 
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
                onClick={() => quotaAvailable && onSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>

        {/* Tópicos Disponíveis */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            Tópicos Disponíveis
          </h3>
          <div className="flex flex-wrap gap-3">
            {["Geral", "Específico", "Avançado"].map((topic, index) => (
              <Button 
                key={index}
                variant="outline" 
                className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors border-gray-300"
                onClick={() => quotaAvailable && onSuggestionClick(`Me ajude com ${topic.toLowerCase()}`)}
                disabled={!quotaAvailable}
              >
                {topic}
              </Button>
            ))}
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

