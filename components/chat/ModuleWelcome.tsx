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
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-full">
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

      {/* Funcionalidades Principais */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
          Principais Funcionalidades
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {moduleData.features.map((feature, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 ${moduleData.iconColor} mx-auto mb-2`}>
                <IconComponent className="w-8 h-8" />
              </div>
              <p className="text-sm text-gray-700 font-medium">{feature}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sugestões de Perguntas */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
          Sugestões de Perguntas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {moduleData.suggestions.map((suggestion, index) => (
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

      {/* Badge de Status */}
      <div className="text-center">
        <Badge variant="outline" className="text-sm">
          {quotaAvailable ? "✅ Disponível" : "⏸️ Quota esgotada"}
        </Badge>
      </div>
    </div>
  );
};

