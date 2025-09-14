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
  Monitor,
  Target,
  Clock,
  UserCheck,
  Play,
  CheckCircle,
  Lightbulb,
  MessageSquare
} from "lucide-react";
import { MODULES, ModuleId } from "@/lib/modules";

interface ModuleWelcomeScreenProps {
  moduleId: ModuleId;
  onSuggestionClick: (suggestion: string) => void;
  quotaAvailable?: boolean;
}

const moduleWelcomeData = {
  PROFESSOR: {
    title: "Professor",
    subtitle: "Assistente de estudos focado no aluno",
    icon: BookOpen,
    color: "bg-gradient-to-br from-blue-500 to-blue-700",
    iconColor: "text-blue-600",
    mainFeatures: [
      {
        title: "Planejamento de Aulas",
        description: "Crie aulas estruturadas com objetivos, conteúdo e atividades",
        icon: Play,
        color: "bg-blue-100",
        iconColor: "text-blue-600"
      },
      {
        title: "Avaliações",
        description: "Desenvolva provas, trabalhos e atividades de avaliação",
        icon: Target,
        color: "bg-green-100",
        iconColor: "text-green-600"
      },
      {
        title: "Gestão de Tempo",
        description: "Organize cronogramas e prazos de atividades escolares",
        icon: Clock,
        color: "bg-yellow-100",
        iconColor: "text-yellow-600"
      },
      {
        title: "Acompanhamento",
        description: "Monitore o progresso e desenvolvimento dos estudantes",
        icon: UserCheck,
        color: "bg-purple-100",
        iconColor: "text-purple-600"
      }
    ],
    popularQuestions: [
      "Quero tirar uma dúvida de geometria",
      "Preciso de ajuda antes da prova de história",
      "Quero entender como funciona a fotossíntese"
    ],
    availableTopics: ["Ciências", "Matemática", "História"]
  },
  TI: {
    title: "TI",
    subtitle: "Suporte técnico educacional",
    icon: Monitor,
    color: "bg-gradient-to-br from-gray-500 to-gray-700",
    iconColor: "text-gray-600",
    mainFeatures: [
      {
        title: "Configuração de Sistemas",
        description: "Configure Google Workspace, Chromebooks e sistemas educacionais",
        icon: Monitor,
        color: "bg-gray-100",
        iconColor: "text-gray-600"
      },
      {
        title: "Troubleshooting",
        description: "Resolução de problemas técnicos e manutenção",
        icon: CheckCircle,
        color: "bg-red-100",
        iconColor: "text-red-600"
      },
      {
        title: "Segurança Digital",
        description: "Implemente políticas de segurança e proteção de dados",
        icon: CheckCircle,
        color: "bg-green-100",
        iconColor: "text-green-600"
      },
      {
        title: "Suporte Remoto",
        description: "Assistência técnica à distância para equipes",
        icon: Headphones,
        color: "bg-blue-100",
        iconColor: "text-blue-600"
      }
    ],
    popularQuestions: [
      "Como configurar o Google Workspace?",
      "Problema com Chromebook não conecta",
      "Como fazer backup dos dados?"
    ],
    availableTopics: ["Google Workspace", "Chromebooks", "Rede Wi-Fi"]
  },
  RH: {
    title: "RH",
    subtitle: "Recursos humanos",
    icon: Users,
    color: "bg-gradient-to-br from-purple-500 to-purple-700",
    iconColor: "text-purple-600",
    mainFeatures: [
      {
        title: "Recrutamento",
        description: "Processos de contratação e seleção de profissionais",
        icon: Users,
        color: "bg-purple-100",
        iconColor: "text-purple-600"
      },
      {
        title: "Desenvolvimento",
        description: "Treinamentos e capacitação de equipes",
        icon: TrendingUp,
        color: "bg-green-100",
        iconColor: "text-green-600"
      },
      {
        title: "Políticas Internas",
        description: "Gestão de benefícios e políticas organizacionais",
        icon: CheckCircle,
        color: "bg-blue-100",
        iconColor: "text-blue-600"
      },
      {
        title: "Avaliação",
        description: "Avaliação de desempenho e feedback",
        icon: Target,
        color: "bg-yellow-100",
        iconColor: "text-yellow-600"
      }
    ],
    popularQuestions: [
      "Como contratar novos professores?",
      "Política de férias escolares",
      "Avaliação de desempenho docente"
    ],
    availableTopics: ["Contratação", "Desenvolvimento", "Políticas"]
  },
  FINANCEIRO: {
    title: "Financeiro",
    subtitle: "Controle financeiro escolar",
    icon: DollarSign,
    color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
    iconColor: "text-yellow-600",
    mainFeatures: [
      {
        title: "Mensalidades",
        description: "Controle de pagamentos e inadimplência",
        icon: DollarSign,
        color: "bg-yellow-100",
        iconColor: "text-yellow-600"
      },
      {
        title: "Relatórios",
        description: "Relatórios financeiros e análises",
        icon: TrendingUp,
        color: "bg-green-100",
        iconColor: "text-green-600"
      },
      {
        title: "Bolsas",
        description: "Gestão de bolsas de estudo e descontos",
        icon: CheckCircle,
        color: "bg-blue-100",
        iconColor: "text-blue-600"
      },
      {
        title: "Orçamento",
        description: "Planejamento e controle orçamentário",
        icon: Clock,
        color: "bg-purple-100",
        iconColor: "text-purple-600"
      }
    ],
    popularQuestions: [
      "Como calcular mensalidades?",
      "Relatório de inadimplência",
      "Gestão de bolsas de estudo"
    ],
    availableTopics: ["Mensalidades", "Relatórios", "Bolsas"]
  },
  COORDENACAO: {
    title: "Coordenação",
    subtitle: "Gestão pedagógica",
    icon: TrendingUp,
    color: "bg-gradient-to-br from-indigo-500 to-indigo-700",
    iconColor: "text-indigo-600",
    mainFeatures: [
      {
        title: "Planejamento Curricular",
        description: "Desenvolvimento e organização curricular",
        icon: BookOpen,
        color: "bg-indigo-100",
        iconColor: "text-indigo-600"
      },
      {
        title: "Acompanhamento",
        description: "Monitoramento de turmas e desempenho",
        icon: UserCheck,
        color: "bg-green-100",
        iconColor: "text-green-600"
      },
      {
        title: "Projetos",
        description: "Desenvolvimento de projetos interdisciplinares",
        icon: Lightbulb,
        color: "bg-yellow-100",
        iconColor: "text-yellow-600"
      },
      {
        title: "Relatórios",
        description: "Relatórios pedagógicos e acadêmicos",
        icon: ClipboardList,
        color: "bg-blue-100",
        iconColor: "text-blue-600"
      }
    ],
    popularQuestions: [
      "Planejamento curricular anual",
      "Acompanhamento de turmas",
      "Relatórios pedagógicos"
    ],
    availableTopics: ["Currículo", "Acompanhamento", "Projetos"]
  },
  ATENDIMENTO: {
    title: "Atendimento",
    subtitle: "Suporte multicanal",
    icon: Headphones,
    color: "bg-gradient-to-br from-red-500 to-red-700",
    iconColor: "text-red-600",
    mainFeatures: [
      {
        title: "Atendimento Multicanal",
        description: "Suporte via chat, telefone e presencial",
        icon: Headphones,
        color: "bg-red-100",
        iconColor: "text-red-600"
      },
      {
        title: "Gestão de Relacionamento",
        description: "Construção de relacionamento com famílias",
        icon: Users,
        color: "bg-blue-100",
        iconColor: "text-blue-600"
      },
      {
        title: "Resolução de Conflitos",
        description: "Mediação e resolução de questões",
        icon: CheckCircle,
        color: "bg-green-100",
        iconColor: "text-green-600"
      },
      {
        title: "Comunicação",
        description: "Estratégias de comunicação eficaz",
        icon: MessageSquare,
        color: "bg-purple-100",
        iconColor: "text-purple-600"
      }
    ],
    popularQuestions: [
      "Como atender pais de alunos?",
      "Protocolo de matrículas",
      "Comunicação com famílias"
    ],
    availableTopics: ["Atendimento", "Comunicação", "Protocolos"]
  },
  BEM_ESTAR: {
    title: "Bem-Estar",
    subtitle: "Suporte socioemocional",
    icon: Heart,
    color: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    iconColor: "text-emerald-600",
    mainFeatures: [
      {
        title: "Suporte Emocional",
        description: "Acolhimento e apoio emocional",
        icon: Heart,
        color: "bg-emerald-100",
        iconColor: "text-emerald-600"
      },
      {
        title: "Estratégias de Bem-estar",
        description: "Técnicas de autocuidado e relaxamento",
        icon: CheckCircle,
        color: "bg-green-100",
        iconColor: "text-green-600"
      },
      {
        title: "Ambiente Seguro",
        description: "Promoção de ambiente acolhedor",
        icon: Users,
        color: "bg-blue-100",
        iconColor: "text-blue-600"
      },
      {
        title: "Desenvolvimento Socioemocional",
        description: "Habilidades sociais e emocionais",
        icon: TrendingUp,
        color: "bg-purple-100",
        iconColor: "text-purple-600"
      }
    ],
    popularQuestions: [
      "Como acolher alunos com ansiedade?",
      "Estratégias de autocuidado",
      "Promoção de ambiente seguro"
    ],
    availableTopics: ["Emocional", "Bem-estar", "Desenvolvimento"]
  },
  SOCIAL_MEDIA: {
    title: "Social Media",
    subtitle: "Comunicação digital",
    icon: Share2,
    color: "bg-gradient-to-br from-pink-500 to-pink-700",
    iconColor: "text-pink-600",
    mainFeatures: [
      {
        title: "Criação de Conteúdo",
        description: "Posts e materiais para redes sociais",
        icon: Share2,
        color: "bg-pink-100",
        iconColor: "text-pink-600"
      },
      {
        title: "Gestão de Redes",
        description: "Administração de perfis e páginas",
        icon: Users,
        color: "bg-blue-100",
        iconColor: "text-blue-600"
      },
      {
        title: "Marketing Digital",
        description: "Estratégias de marketing e engajamento",
        icon: TrendingUp,
        color: "bg-green-100",
        iconColor: "text-green-600"
      },
      {
        title: "Comunicação",
        description: "Comunicação com comunidade escolar",
        icon: MessageSquare,
        color: "bg-purple-100",
        iconColor: "text-purple-600"
      }
    ],
    popularQuestions: [
      "Posts para redes sociais",
      "Comunicação de eventos escolares",
      "Celebração de conquistas"
    ],
    availableTopics: ["Conteúdo", "Marketing", "Comunicação"]
  },
  ENEM_INTERACTIVE: {
    title: "ENEM Interativo",
    subtitle: "Simulador ENEM com IA",
    icon: ClipboardList,
    color: "bg-gradient-to-br from-red-500 to-red-700",
    iconColor: "text-red-600",
    mainFeatures: [
      {
        title: "Simulador Personalizado",
        description: "Simulados adaptados ao nível do aluno",
        icon: ClipboardList,
        color: "bg-red-100",
        iconColor: "text-red-600"
      },
      {
        title: "Análise de Performance",
        description: "Relatórios detalhados de desempenho",
        icon: TrendingUp,
        color: "bg-green-100",
        iconColor: "text-green-600"
      },
      {
        title: "Estratégias de Estudo",
        description: "Planejamento personalizado de estudos",
        icon: Lightbulb,
        color: "bg-yellow-100",
        iconColor: "text-yellow-600"
      },
      {
        title: "Revisão de Conteúdo",
        description: "Revisão focada em áreas de dificuldade",
        icon: BookOpen,
        color: "bg-blue-100",
        iconColor: "text-blue-600"
      }
    ],
    popularQuestions: [
      "Simulador ENEM personalizado",
      "Análise de performance",
      "Estratégias de estudo"
    ],
    availableTopics: ["Matemática", "Português", "Ciências"]
  },
  AULA_EXPANDIDA: {
    title: "Aula Expandida",
    subtitle: "Aulas interativas e gamificadas",
    icon: GraduationCap,
    color: "bg-gradient-to-br from-yellow-400 to-orange-500",
    iconColor: "text-orange-600",
    mainFeatures: [
      {
        title: "Conteúdo Interativo",
        description: "Aulas com elementos interativos e gamificados",
        icon: Play,
        color: "bg-orange-100",
        iconColor: "text-orange-600"
      },
      {
        title: "Quizzes Gamificados",
        description: "Exercícios em formato de jogo",
        icon: Target,
        color: "bg-green-100",
        iconColor: "text-green-600"
      },
      {
        title: "Exercícios Práticos",
        description: "Atividades hands-on e experimentais",
        icon: CheckCircle,
        color: "bg-blue-100",
        iconColor: "text-blue-600"
      },
      {
        title: "Experiência Imersiva",
        description: "Aprendizado através de simulações",
        icon: Lightbulb,
        color: "bg-purple-100",
        iconColor: "text-purple-600"
      }
    ],
    popularQuestions: [
      "Aula completa sobre equações",
      "Quiz interativo de história",
      "Exercícios de física com simulações"
    ],
    availableTopics: ["Matemática", "Ciências", "História"]
  }
};

export const ModuleWelcomeScreen: React.FC<ModuleWelcomeScreenProps> = ({
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
          {moduleData.mainFeatures.map((feature, index) => (
            <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center`}>
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  {feature.description}
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
            {moduleData.popularQuestions.map((question, index) => (
              <div
                key={index}
                className={`rounded-lg px-4 py-3 text-sm cursor-pointer transition-colors ${
                  quotaAvailable 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm' 
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
                onClick={() => quotaAvailable && onSuggestionClick(question)}
              >
                {question}
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
            {moduleData.availableTopics.map((topic, index) => (
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
