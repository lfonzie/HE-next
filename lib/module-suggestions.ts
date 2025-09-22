import { ModuleId } from './modules';

export interface ModuleSuggestion {
  id: string;
  text: string;
  category: string;
  icon: string;
}

export const MODULE_SUGGESTIONS: Record<ModuleId, ModuleSuggestion[]> = {
  PROFESSOR: [
    {
      id: 'prof-1',
      text: 'Como estudar matemática de forma mais eficiente?',
      category: 'Estudos',
      icon: '📚'
    },
    {
      id: 'prof-2',
      text: 'Preciso de ajuda com exercícios de física',
      category: 'Exercícios',
      icon: '🧮'
    },
    {
      id: 'prof-3',
      text: 'Como fazer uma boa redação para o ENEM?',
      category: 'Redação',
      icon: '✍️'
    },
    {
      id: 'prof-4',
      text: 'Explicação sobre fotossíntese para prova',
      category: 'Biologia',
      icon: '🌱'
    },
    {
      id: 'prof-5',
      text: 'Como memorizar fórmulas de química?',
      category: 'Memorização',
      icon: '🧪'
    },
    {
      id: 'prof-6',
      text: 'Dicas para melhorar meu desempenho escolar',
      category: 'Performance',
      icon: '📈'
    }
  ],
  AULA_EXPANDIDA: [
    {
      id: 'aula-1',
      text: 'Crie uma aula interativa sobre sistema solar',
      category: 'Ciências',
      icon: '🪐'
    },
    {
      id: 'aula-2',
      text: 'Aula gamificada sobre história do Brasil',
      category: 'História',
      icon: '🏛️'
    },
    {
      id: 'aula-3',
      text: 'Atividade prática de laboratório virtual',
      category: 'Laboratório',
      icon: '🔬'
    },
    {
      id: 'aula-4',
      text: 'Jogo educativo sobre matemática básica',
      category: 'Matemática',
      icon: '🎲'
    },
    {
      id: 'aula-5',
      text: 'Aula de literatura com realidade aumentada',
      category: 'Literatura',
      icon: '📖'
    },
    {
      id: 'aula-6',
      text: 'Simulação de ecossistema em sala de aula',
      category: 'Biologia',
      icon: '🌿'
    }
  ],
  ENEM_INTERACTIVE: [
    {
      id: 'enem-1',
      text: 'Simulado ENEM de matemática com correção automática',
      category: 'Matemática',
      icon: '📐'
    },
    {
      id: 'enem-2',
      text: 'Questões de física com explicações detalhadas',
      category: 'Física',
      icon: '⚡'
    },
    {
      id: 'enem-3',
      text: 'Análise de texto e interpretação para linguagens',
      category: 'Linguagens',
      icon: '📝'
    },
    {
      id: 'enem-4',
      text: 'Simulado de ciências da natureza',
      category: 'Ciências',
      icon: '🧪'
    },
    {
      id: 'enem-5',
      text: 'Questões de história e geografia do Brasil',
      category: 'Humanas',
      icon: '🗺️'
    },
    {
      id: 'enem-6',
      text: 'Estratégias de prova e gestão de tempo',
      category: 'Estratégia',
      icon: '⏰'
    }
  ],
  TI: [
    {
      id: 'ti-1',
      text: 'Como configurar o sistema de videoconferência?',
      category: 'Configuração',
      icon: '📹'
    },
    {
      id: 'ti-2',
      text: 'Problemas com acesso ao sistema acadêmico',
      category: 'Suporte',
      icon: '🔧'
    },
    {
      id: 'ti-3',
      text: 'Backup e segurança de dados escolares',
      category: 'Segurança',
      icon: '🔒'
    },
    {
      id: 'ti-4',
      text: 'Configuração de laboratório de informática',
      category: 'Infraestrutura',
      icon: '💻'
    },
    {
      id: 'ti-5',
      text: 'Integração de sistemas educacionais',
      category: 'Integração',
      icon: '🔗'
    },
    {
      id: 'ti-6',
      text: 'Treinamento de professores em tecnologia',
      category: 'Capacitação',
      icon: '👨‍🏫'
    }
  ],
  RH: [
    {
      id: 'rh-1',
      text: 'Processo de contratação de novos professores',
      category: 'Contratação',
      icon: '📋'
    },
    {
      id: 'rh-2',
      text: 'Avaliação de desempenho docente',
      category: 'Avaliação',
      icon: '📊'
    },
    {
      id: 'rh-3',
      text: 'Programa de capacitação profissional',
      category: 'Desenvolvimento',
      icon: '🎓'
    },
    {
      id: 'rh-4',
      text: 'Gestão de benefícios e folha de pagamento',
      category: 'Administrativo',
      icon: '💰'
    },
    {
      id: 'rh-5',
      text: 'Políticas de trabalho remoto',
      category: 'Políticas',
      icon: '🏠'
    },
    {
      id: 'rh-6',
      text: 'Resolução de conflitos na equipe',
      category: 'Mediação',
      icon: '🤝'
    }
  ],
  FINANCEIRO: [
    {
      id: 'fin-1',
      text: 'Controle de mensalidades e inadimplência',
      category: 'Cobrança',
      icon: '💳'
    },
    {
      id: 'fin-2',
      text: 'Relatório de fluxo de caixa mensal',
      category: 'Relatórios',
      icon: '📈'
    },
    {
      id: 'fin-3',
      text: 'Orçamento para reformas e melhorias',
      category: 'Orçamento',
      icon: '🏗️'
    },
    {
      id: 'fin-4',
      text: 'Gestão de fornecedores e compras',
      category: 'Compras',
      icon: '🛒'
    },
    {
      id: 'fin-5',
      text: 'Análise de custos por aluno',
      category: 'Análise',
      icon: '📊'
    },
    {
      id: 'fin-6',
      text: 'Planejamento financeiro anual',
      category: 'Planejamento',
      icon: '📅'
    }
  ],
  COORDENACAO: [
    {
      id: 'coord-1',
      text: 'Planejamento pedagógico anual',
      category: 'Planejamento',
      icon: '📚'
    },
    {
      id: 'coord-2',
      text: 'Acompanhamento do desempenho dos alunos',
      category: 'Acompanhamento',
      icon: '📊'
    },
    {
      id: 'coord-3',
      text: 'Formação continuada dos professores',
      category: 'Formação',
      icon: '👨‍🏫'
    },
    {
      id: 'coord-4',
      text: 'Implementação de novas metodologias',
      category: 'Inovação',
      icon: '💡'
    },
    {
      id: 'coord-5',
      text: 'Gestão de projetos educacionais',
      category: 'Projetos',
      icon: '🎯'
    },
    {
      id: 'coord-6',
      text: 'Avaliação institucional e melhorias',
      category: 'Avaliação',
      icon: '⭐'
    }
  ],
  ATENDIMENTO: [
    {
      id: 'atend-1',
      text: 'Como resolver dúvidas sobre matrícula?',
      category: 'Matrícula',
      icon: '📝'
    },
    {
      id: 'atend-2',
      text: 'Informações sobre calendário escolar',
      category: 'Calendário',
      icon: '📅'
    },
    {
      id: 'atend-3',
      text: 'Suporte para pais e responsáveis',
      category: 'Família',
      icon: '👨‍👩‍👧‍👦'
    },
    {
      id: 'atend-4',
      text: 'Orientações sobre documentos escolares',
      category: 'Documentação',
      icon: '📄'
    },
    {
      id: 'atend-5',
      text: 'Resolução de problemas de acesso',
      category: 'Técnico',
      icon: '🔧'
    },
    {
      id: 'atend-6',
      text: 'Feedback e sugestões da comunidade',
      category: 'Feedback',
      icon: '💬'
    }
  ],
  BEM_ESTAR: [
    {
      id: 'bem-1',
      text: 'Estratégias para reduzir ansiedade escolar',
      category: 'Ansiedade',
      icon: '😌'
    },
    {
      id: 'bem-2',
      text: 'Programa de saúde mental para estudantes',
      category: 'Saúde Mental',
      icon: '🧠'
    },
    {
      id: 'bem-3',
      text: 'Atividades de relaxamento e mindfulness',
      category: 'Relaxamento',
      icon: '🧘'
    },
    {
      id: 'bem-4',
      text: 'Prevenção ao bullying e cyberbullying',
      category: 'Prevenção',
      icon: '🛡️'
    },
    {
      id: 'bem-5',
      text: 'Suporte emocional para professores',
      category: 'Suporte',
      icon: '🤗'
    },
    {
      id: 'bem-6',
      text: 'Criação de ambiente acolhedor',
      category: 'Ambiente',
      icon: '🏫'
    }
  ],
  SOCIAL_MEDIA: [
    {
      id: 'social-1',
      text: 'Estratégia de conteúdo para Instagram educacional',
      category: 'Instagram',
      icon: '📸'
    },
    {
      id: 'social-2',
      text: 'Como criar posts engajantes sobre educação',
      category: 'Conteúdo',
      icon: '✍️'
    },
    {
      id: 'social-3',
      text: 'Gestão de comentários e interações',
      category: 'Interação',
      icon: '💬'
    },
    {
      id: 'social-4',
      text: 'Campanhas para captação de alunos',
      category: 'Marketing',
      icon: '🎯'
    },
    {
      id: 'social-5',
      text: 'Relatórios de performance das redes sociais',
      category: 'Analytics',
      icon: '📊'
    },
    {
      id: 'social-6',
      text: 'Criação de vídeos educativos para TikTok',
      category: 'Vídeo',
      icon: '🎬'
    }
  ]
};

/**
 * Retorna 3 sugestões aleatórias para um módulo específico
 */
export function getRandomSuggestions(moduleId: ModuleId, count: number = 3): ModuleSuggestion[] {
  const suggestions = MODULE_SUGGESTIONS[moduleId];
  if (!suggestions || suggestions.length === 0) {
    return [];
  }

  // Embaralha as sugestões e pega as primeiras 'count'
  const shuffled = [...suggestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Retorna todas as sugestões de um módulo
 */
export function getAllSuggestions(moduleId: ModuleId): ModuleSuggestion[] {
  return MODULE_SUGGESTIONS[moduleId] || [];
}
