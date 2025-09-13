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
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Principais funcionalidades do HubEdu.ai
        </h1>
      </div>

      {/* Main Functionality Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Planejamento Pedagógico */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              Planejamento Pedagógico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Crie aulas estruturadas, atividades e avaliações personalizadas
            </p>
            <div className="space-y-2">
              <div 
                className={`rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
                  quotaAvailable 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
                onClick={() => quotaAvailable && onSuggestionClick("Quero tirar uma dúvida de geometria")}
              >
                Quero tirar uma dúvida de geometria
              </div>
              <div 
                className={`rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
                  quotaAvailable 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
                onClick={() => quotaAvailable && onSuggestionClick("Preciso de ajuda para entender frações")}
              >
                Preciso de ajuda para entender frações
              </div>
              <div 
                className={`rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
                  quotaAvailable 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
                onClick={() => quotaAvailable && onSuggestionClick("Como estudar melhor para a prova de matemática?")}
              >
                Como estudar melhor para a prova de matemática?
              </div>
              <div 
                className={`rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
                  quotaAvailable 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
                onClick={() => quotaAvailable && onSuggestionClick("Quero exemplos práticos de ciências")}
              >
                Quero exemplos práticos de ciências
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aulas Interativas */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              Aulas Interativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Conteúdo completo com quizzes, exercícios e explicações detalhadas
            </p>
            <div className="space-y-2">
              <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700">
                Quero uma aula completa sobre equações de segundo grau
              </div>
              <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700">
                Preciso de uma aula passo a passo sobre geometria analítica
              </div>
              <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700">
                Quero uma aula interativa sobre fotossíntese com quizzes
              </div>
              <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700">
                Preciso de uma aula sobre história do Brasil com exercícios
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suporte Técnico */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              Suporte Técnico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Resolução de problemas tecnológicos e manutenção de sistemas
            </p>
            <div className="space-y-2">
              <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700">
                Como configurar o Google Workspace?
              </div>
              <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700">
                Problema com Chromebook não conecta
              </div>
              <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700">
                Como fazer backup dos dados?
              </div>
              <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700">
                Configurar rede Wi-Fi da escola
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gestão de Pessoas */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              Gestão de Pessoas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Recrutamento, treinamento e desenvolvimento de equipes
            </p>
            <div className="space-y-2">
              <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700">
                Como contratar novos professores?
              </div>
              <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700">
                Política de férias escolares
              </div>
              <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700">
                Avaliação de desempenho docente
              </div>
              <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700">
                Benefícios para funcionários
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
