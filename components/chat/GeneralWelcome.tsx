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
import { MODULES } from "@/lib/modules";

interface GeneralWelcomeProps {
  selectedModule: string | null;
  selectedModuleLabel: string | null;
  onModuleSelect: (moduleId: string) => void;
  onSuggestionClick: (suggestion: string) => void;
  quotaAvailable?: boolean;
}

const moduleSuggestions = {
  PROFESSOR: [
    "Explique o teorema de Pitágoras",
    "Como resolver equações de segundo grau?",
    "Me ajude com a história do Brasil",
    "Qual a diferença entre mitose e meiose?"
  ],
  TI: [
    "Como configurar o Google Workspace?",
    "Problema com Chromebook não conecta",
    "Como fazer backup dos dados?",
    "Configurar rede Wi-Fi da escola"
  ],
  RH: [
    "Como contratar novos professores?",
    "Política de férias escolares",
    "Avaliação de desempenho docente",
    "Benefícios para funcionários"
  ],
  FINANCEIRO: [
    "Como calcular mensalidades?",
    "Relatório de inadimplência",
    "Gestão de bolsas de estudo",
    "Controle de despesas escolares"
  ],
  COORDENACAO: [
    "Planejamento curricular anual",
    "Acompanhamento de turmas",
    "Relatórios pedagógicos",
    "Projetos interdisciplinares"
  ],
  ATENDIMENTO: [
    "Como atender pais de alunos?",
    "Protocolo de matrículas",
    "Comunicação com famílias",
    "Gestão de reclamações"
  ],
  BEM_ESTAR: [
    "Como acolher alunos com ansiedade?",
    "Estratégias de autocuidado",
    "Promoção de ambiente seguro",
    "Suporte socioemocional"
  ],
  SOCIAL_MEDIA: [
    "Posts para redes sociais",
    "Comunicação de eventos escolares",
    "Celebração de conquistas",
    "Engajamento com famílias"
  ],
  ENEM_INTERACTIVE: [
    "Simulador ENEM personalizado",
    "Análise de performance",
    "Estratégias de estudo",
    "Revisão de conteúdo"
  ]
};

const moduleIcons = {
  PROFESSOR: BookOpen,
  TI: Monitor,
  RH: Users,
  FINANCEIRO: DollarSign,
  COORDENACAO: TrendingUp,
  ATENDIMENTO: Headphones,
  BEM_ESTAR: Heart,
  SOCIAL_MEDIA: Share2,
  ENEM_INTERACTIVE: ClipboardList,
  AULA_EXPANDIDA: GraduationCap
};

export const GeneralWelcome: React.FC<GeneralWelcomeProps> = ({
  selectedModule,
  selectedModuleLabel,
  onModuleSelect,
  onSuggestionClick,
  quotaAvailable = true
}) => {
  const currentSuggestions = selectedModule ? moduleSuggestions[selectedModule as keyof typeof moduleSuggestions] || [] : [];

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
                  <BookOpen className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Heart className="h-4 w-4 text-white fill-current" />
                </div>
              </div>
              
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                Chat Inteligente
              </h1>
              <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Principais funcionalidades do HubEdu.ai
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
                  <p className="text-sm text-yellow-700">Conhecimento específico para educação</p>
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
              Recursos e funcionalidades disponíveis no chat inteligente
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Planejamento Pedagógico */}
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 hover:border-yellow-300 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Planejamento Pedagógico</h4>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Crie aulas estruturadas, atividades e avaliações personalizadas
              </p>
            </div>

            {/* Aulas Interativas */}
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 hover:border-yellow-300 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Aulas Interativas</h4>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Conteúdo completo com quizzes, exercícios e explicações detalhadas
              </p>
            </div>

            {/* Suporte Técnico */}
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 hover:border-yellow-300 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Monitor className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Suporte Técnico</h4>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Resolução de problemas tecnológicos e manutenção de sistemas
              </p>
            </div>

            {/* Gestão de Pessoas */}
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 hover:border-yellow-300 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Gestão de Pessoas</h4>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Recrutamento, treinamento e desenvolvimento de equipes
              </p>
            </div>
          </div>
        </div>

        {/* Seção "Sugestões para Estudos" */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              Sugestões para Estudos
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
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const suggestion = "Quero tirar uma dúvida de geometria";
                  console.log('🎯 Suggestion clicked:', suggestion);
                  if (quotaAvailable && suggestion && suggestion.trim()) {
                    onSuggestionClick(suggestion);
                  }
                }}
                disabled={!quotaAvailable}
                className="group p-6 text-left border-2 border-gray-200 rounded-2xl hover:border-yellow-300 hover:bg-gradient-to-br hover:from-yellow-50 hover:to-orange-50 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Perguntar sobre ${"Quero tirar uma dúvida de geometria"}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-base font-semibold text-gray-800 group-hover:text-yellow-800 line-clamp-2 leading-relaxed">
                    Quero tirar uma dúvida de geometria
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200">
                    Estudos
                  </Badge>
                  <Badge variant="outline" className="text-xs px-3 py-1 border-orange-200 text-orange-700">
                    Sugestão
                  </Badge>
                </div>
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const suggestion = "Preciso de ajuda antes da prova de história";
                  console.log('🎯 Suggestion clicked:', suggestion);
                  if (quotaAvailable && suggestion && suggestion.trim()) {
                    onSuggestionClick(suggestion);
                  }
                }}
                disabled={!quotaAvailable}
                className="group p-6 text-left border-2 border-gray-200 rounded-2xl hover:border-yellow-300 hover:bg-gradient-to-br hover:from-yellow-50 hover:to-orange-50 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Perguntar sobre ${"Preciso de ajuda antes da prova de história"}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-base font-semibold text-gray-800 group-hover:text-yellow-800 line-clamp-2 leading-relaxed">
                    Preciso de ajuda antes da prova de história
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200">
                    Estudos
                  </Badge>
                  <Badge variant="outline" className="text-xs px-3 py-1 border-orange-200 text-orange-700">
                    Sugestão
                  </Badge>
                </div>
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const suggestion = "Quero entender como funciona a fotossíntese";
                  console.log('🎯 Suggestion clicked:', suggestion);
                  if (quotaAvailable && suggestion && suggestion.trim()) {
                    onSuggestionClick(suggestion);
                  }
                }}
                disabled={!quotaAvailable}
                className="group p-6 text-left border-2 border-gray-200 rounded-2xl hover:border-yellow-300 hover:bg-gradient-to-br hover:from-yellow-50 hover:to-orange-50 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Perguntar sobre ${"Quero entender como funciona a fotossíntese"}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-base font-semibold text-gray-800 group-hover:text-yellow-800 line-clamp-2 leading-relaxed">
                    Quero entender como funciona a fotossíntese
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200">
                    Estudos
                  </Badge>
                  <Badge variant="outline" className="text-xs px-3 py-1 border-orange-200 text-orange-700">
                    Sugestão
                  </Badge>
                </div>
              </button>
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
              {["Ciências", "Matemática", "História"].map((topic, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  size="sm"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const suggestion = `Me ajude com ${topic.toLowerCase()}`;
                    console.log('🎯 Topic clicked:', suggestion);
                    if (quotaAvailable && suggestion && suggestion.trim()) {
                      onSuggestionClick(suggestion);
                    }
                  }}
                  disabled={!quotaAvailable}
                >
                  {topic}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
