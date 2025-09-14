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
    <div className="p-6 max-w-6xl mx-auto bg-white min-h-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Principais funcionalidades do HubEdu.ai
        </h1>
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
          {/* Planejamento Pedagógico */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                Planejamento Pedagógico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Crie aulas estruturadas, atividades e avaliações personalizadas
              </p>
            </CardContent>
          </Card>

          {/* Aulas Interativas */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                Aulas Interativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Conteúdo completo com quizzes, exercícios e explicações detalhadas
              </p>
            </CardContent>
          </Card>

          {/* Suporte Técnico */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-gray-600" />
                </div>
                Suporte Técnico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Resolução de problemas tecnológicos e manutenção de sistemas
              </p>
            </CardContent>
          </Card>

          {/* Gestão de Pessoas */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                Gestão de Pessoas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Recrutamento, treinamento e desenvolvimento de equipes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seção "Sugestões para Professor" */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          Sugestões para Professor
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
            <div
              className={`rounded-lg px-4 py-3 text-sm cursor-pointer transition-colors ${
                quotaAvailable 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm' 
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
              onClick={() => quotaAvailable && onSuggestionClick("Quero tirar uma dúvida de geometria")}
            >
              Quero tirar uma dúvida de geometria
            </div>
            <div
              className={`rounded-lg px-4 py-3 text-sm cursor-pointer transition-colors ${
                quotaAvailable 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm' 
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
              onClick={() => quotaAvailable && onSuggestionClick("Preciso de ajuda antes da prova de história")}
            >
              Preciso de ajuda antes da prova de história
            </div>
            <div
              className={`rounded-lg px-4 py-3 text-sm cursor-pointer transition-colors ${
                quotaAvailable 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm' 
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
              onClick={() => quotaAvailable && onSuggestionClick("Quero entender como funciona a fotossíntese")}
            >
              Quero entender como funciona a fotossíntese
            </div>
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
            {["Ciências", "Matemática", "História"].map((topic, index) => (
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
              placeholder="Digite sua pergunta sobre professor..."
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
