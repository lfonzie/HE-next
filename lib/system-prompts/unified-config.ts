// lib/system-prompts/unified-config.ts
import { SystemPromptConfig } from '../../types/system-prompts';
import * as Classification from './classification';
import * as Professor from './professor';
import * as ENEM from './enem';
import * as Support from './support';
import * as TI from './ti';
import * as Lessons from './lessons';
import * as Common from './common';

// Sistema unificado que combina prompts TypeScript + JSON
export const UNIFIED_SYSTEM_PROMPTS: Record<string, SystemPromptConfig> = {
  // Classificação (do sistema TypeScript)
  'router.intent.system': {
    key: 'router.intent.system',
    scope: 'production',
    model: 'gpt-4o-mini',
    json: {
      type: 'router',
      role: 'system',
      content: Classification.MODULE_CLASSIFICATION_PROMPT,
      sectors: ['PROFESSOR', 'TI', 'SECRETARIA', 'RH', 'FINANCEIRO', 'ATENDIMENTO', 'OUTRO'],
      thresholds: { lesson: 0.45, troubleshooting: 0.45 }
    },
    description: 'Roteador de intenções para classificar setores e probabilidades',
    version: 1,
    status: 'active',
    createdBy: 'unified-system'
  },

  'visual.classification.system': {
    key: 'visual.classification.system',
    scope: 'production',
    model: 'gpt-4o-mini',
    json: {
      type: 'visual_classification',
      role: 'system',
      content: Classification.VISUAL_CLASSIFICATION_PROMPT,
      format: 'json',
      focus: 'concrete_objects'
    },
    description: 'Sistema de classificação de relevância visual',
    version: 1,
    status: 'active',
    createdBy: 'unified-system'
  },

  'topic.extraction.system': {
    key: 'topic.extraction.system',
    scope: 'production',
    model: 'gpt-4o-mini',
    json: {
      type: 'topic_extraction',
      role: 'system',
      content: Classification.TOPIC_EXTRACTION_PROMPT,
      format: 'text',
      maxLength: 'concise'
    },
    description: 'Sistema de extração de tópicos concisos',
    version: 1,
    status: 'active',
    createdBy: 'unified-system'
  },

  // Professor (do sistema TypeScript - mais completo)
  'professor.interactive.system': {
    key: 'professor.interactive.system',
    scope: 'production',
    model: 'gpt-5-chat-latest',
    json: {
      type: 'professor_interactive',
      role: 'system',
      content: Professor.PROFESSOR_INTERACTIVE_PROMPT,
      steps: { total: 9, quizzes: 1 },
      bncc: true,
      guardrails: [
        'Evite respostas clínicas/legais sensíveis',
        'Sempre cite definições no primeiro uso de termos técnicos',
        'Mantenha linguagem apropriada para a idade do aluno'
      ]
    },
    description: 'Prompt para geração de aulas interativas com quizzes (9 slides)',
    version: 1,
    status: 'active',
    createdBy: 'unified-system'
  },

  'professor.expanded_lesson.system': {
    key: 'professor.expanded_lesson.system',
    scope: 'production',
    model: 'gpt-4o-mini',
    json: {
      type: 'expanded_lesson',
      role: 'system',
      content: Professor.PROFESSOR_EXPANDED_LESSON_PROMPT,
      steps: { total: 8, quizzes: 2 },
      bncc: true
    },
    description: 'Prompt para geração de aulas expandidas com quizzes (8 passos)',
    version: 1,
    status: 'active',
    createdBy: 'unified-system'
  },

  'math.integration.system': {
    key: 'math.integration.system',
    scope: 'production',
    model: 'gpt-4o-mini',
    json: {
      type: 'math',
      role: 'system',
      content: Professor.MATH_INTEGRATION_PROMPT,
      complexity: 'intermediate',
      subjects: ['álgebra', 'geometria', 'trigonometria', 'cálculo', 'estatística']
    },
    description: 'Sistema de integração matemática com explicações didáticas',
    version: 1,
    status: 'active',
    createdBy: 'unified-system'
  },

  // ENEM (do sistema TypeScript)
  'enem.interactive.system': {
    key: 'enem.interactive.system',
    scope: 'production',
    model: 'gpt-5-chat-latest',
    json: {
      type: 'enem_interactive',
      role: 'system',
      content: ENEM.ENEM_INTERACTIVE_PROMPT,
      focus: 'ENEM_preparation',
      tri: true,
      competencies: ['Linguagens e Códigos', 'Ciências Humanas', 'Ciências da Natureza', 'Matemática', 'Redação']
    },
    description: 'Sistema de aulas interativas específicas para preparação ENEM',
    version: 1,
    status: 'active',
    createdBy: 'unified-system'
  },

  'enem.essay.evaluation': {
    key: 'enem.essay.evaluation',
    scope: 'production',
    model: 'gpt-4o-mini',
    json: {
      type: 'enem_essay_evaluation',
      role: 'system',
      content: ENEM.ENEM_ESSAY_EVALUATION_PROMPT,
      competencies: ['comp1', 'comp2', 'comp3', 'comp4', 'comp5'],
      scoring: '0-200_per_competency'
    },
    description: 'Sistema de avaliação de redação ENEM',
    version: 1,
    status: 'active',
    createdBy: 'unified-system'
  },

  // TI (do sistema TypeScript)
  'ti.troubleshoot.system': {
    key: 'ti.troubleshoot.system',
    scope: 'production',
    model: 'gpt-4o-mini',
    json: {
      type: 'ti_troubleshoot',
      role: 'system',
      content: TI.TI_TROUBLESHOOTING_PROMPT,
      style: 'checklist',
      guardrails: [
        'Não pedir comandos perigosos sem aviso',
        'Sugerir backup antes de alterações profundas',
        'Sempre explicar o que cada comando faz',
        'Priorizar soluções seguras e reversíveis'
      ]
    },
    description: 'Sistema de resolução guiada de problemas de TI',
    version: 1,
    status: 'active',
    createdBy: 'unified-system'
  },

  'ti.hint.system': {
    key: 'ti.hint.system',
    scope: 'production',
    model: 'gpt-4o-mini',
    json: {
      type: 'ti_hint',
      role: 'system',
      content: TI.TI_HINT_PROMPT,
      format: 'json',
      maxLength: '2-3_sentences'
    },
    description: 'Sistema de dicas específicas para problemas de TI',
    version: 1,
    status: 'active',
    createdBy: 'unified-system'
  },

  // Suporte (do sistema TypeScript)
  'support.general.system': {
    key: 'support.general.system',
    scope: 'production',
    model: 'gpt-4o-mini',
    json: {
      type: 'support',
      role: 'system',
      content: Support.SUPPORT_SYSTEM_PROMPT,
      language: 'pt-BR',
      style: 'friendly_technical'
    },
    description: 'Assistente de suporte técnico geral',
    version: 1,
    status: 'active',
    createdBy: 'unified-system'
  },

  'secretaria.atendimento.system': {
    key: 'secretaria.atendimento.system',
    scope: 'production',
    model: 'gpt-4o-mini',
    json: {
      type: 'support',
      role: 'system',
      content: Support.SECRETARIA_SUPPORT_PROMPT,
      department: 'SECRETARIA',
      priority: 'medium'
    },
    description: 'Assistente virtual para secretaria escolar',
    version: 1,
    status: 'active',
    createdBy: 'unified-system'
  },

  'rh.support.system': {
    key: 'rh.support.system',
    scope: 'production',
    model: 'gpt-4o-mini',
    json: {
      type: 'support',
      role: 'system',
      content: Support.RH_SUPPORT_PROMPT,
      department: 'RH',
      priority: 'high'
    },
    description: 'Assistente virtual de recursos humanos',
    version: 1,
    status: 'active',
    createdBy: 'unified-system'
  },

  'financeiro.support.system': {
    key: 'financeiro.support.system',
    scope: 'production',
    model: 'gpt-4o-mini',
    json: {
      type: 'support',
      role: 'system',
      content: Support.FINANCEIRO_SUPPORT_PROMPT,
      department: 'FINANCEIRO',
      priority: 'high',
      focus: 'student_payments'
    },
    description: 'Assistente virtual financeiro para alunos',
    version: 1,
    status: 'active',
    createdBy: 'unified-system'
  },

  'social_media.support.system': {
    key: 'social_media.support.system',
    scope: 'production',
    model: 'gpt-4o-mini',
    json: {
      type: 'support',
      role: 'system',
      content: Support.SOCIAL_MEDIA_SUPPORT_PROMPT,
      department: 'SOCIAL_MEDIA',
      priority: 'medium',
      platforms: ['Instagram', 'Facebook', 'LinkedIn', 'Twitter']
    },
    description: 'Assistente virtual para redes sociais e marketing digital',
    version: 1,
    status: 'active',
    createdBy: 'unified-system'
  },

  'bem_estar.support.system': {
    key: 'bem_estar.support.system',
    scope: 'production',
    model: 'gpt-4o-mini',
    json: {
      type: 'support',
      role: 'system',
      content: Support.BEM_ESTAR_SUPPORT_PROMPT,
      department: 'BEM_ESTAR',
      priority: 'high',
      guardrails: [
        'Não substituir atendimento psicológico profissional',
        'Manter tom acolhedor e empático',
        'Orientar para profissionais especializados quando necessário'
      ]
    },
    description: 'Assistente virtual de bem-estar e apoio socioemocional',
    version: 1,
    status: 'active',
    createdBy: 'unified-system'
  },

  'coordenacao.support.system': {
    key: 'coordenacao.support.system',
    scope: 'production',
    model: 'gpt-4o-mini',
    json: {
      type: 'support',
      role: 'system',
      content: Support.COORDENACAO_SUPPORT_PROMPT,
      department: 'COORDENACAO',
      priority: 'medium',
      focus: 'pedagogical_management'
    },
    description: 'Assistente virtual de coordenação pedagógica',
    version: 1,
    status: 'active',
    createdBy: 'unified-system'
  },

  'atendimento.geral.system': {
    key: 'atendimento.geral.system',
    scope: 'production',
    model: 'gpt-4o-mini',
    json: {
      type: 'chat',
      role: 'system',
      content: Support.ATENDIMENTO_GERAL_PROMPT,
      department: 'ATENDIMENTO',
      priority: 'high',
      mathFormat: 'unicode',
      markdownFormat: true
    },
    description: 'Professor virtual para chat geral com formatação Unicode',
    version: 1,
    status: 'active',
    createdBy: 'unified-system'
  },

  // Lições (do sistema TypeScript)
  'lessons.creation.system': {
    key: 'lessons.creation.system',
    scope: 'production',
    model: 'gpt-4o-mini',
    json: {
      type: 'lesson_creation',
      role: 'system',
      content: Lessons.LESSON_CREATION_PROMPT,
      format: 'json',
      cardTypes: ['reading', 'math', 'quiz', 'flashcards', 'video', 'code', 'whiteboard', 'assignment']
    },
    description: 'Sistema de criação de lições interativas',
    version: 1,
    status: 'active',
    createdBy: 'unified-system'
  }
};

// Função para obter um prompt específico
export function getUnifiedSystemPrompt(key: string): SystemPromptConfig | null {
  return UNIFIED_SYSTEM_PROMPTS[key] || null;
}

// Função para obter todos os prompts de um tipo específico
export function getUnifiedPromptsByType(type: string): SystemPromptConfig[] {
  return Object.values(UNIFIED_SYSTEM_PROMPTS).filter(prompt => prompt.json.type === type);
}

// Função para obter todos os prompts ativos
export function getUnifiedActivePrompts(): SystemPromptConfig[] {
  return Object.values(UNIFIED_SYSTEM_PROMPTS).filter(prompt => prompt.status === 'active');
}

// Função para obter prompts por módulo
export function getUnifiedPromptsByModule(module: string): SystemPromptConfig[] {
  return Object.values(UNIFIED_SYSTEM_PROMPTS).filter(prompt => 
    prompt.key.includes(module.toLowerCase()) || 
    prompt.json.department === module.toUpperCase()
  );
}
