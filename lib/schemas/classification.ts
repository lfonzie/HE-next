import { z } from 'zod'

// Schema para validação da saída do classificador
export const ClassificationSchema = z.object({
  module: z.enum([
    'professor',
    'aula_expandida', 
    'enem_interativo',
    'aula_interativa',
    'enem',
    'ti_troubleshooting',
    'faq_escola',
    'financeiro',
    'rh',
    'coordenacao',
    'bem_estar',
    'social_media',
    'conteudo_midia',
    'atendimento'
  ]),
  complexity: z.enum(['simples', 'media', 'complexa']),
  provider_hint: z.enum(['grok', 'openai', 'anthropic', 'google', 'groq']).optional(),
  confidence: z.number().min(0).max(1),
  rationale: z.string().optional(),
  needsImages: z.boolean().optional()
})

export type ClassificationResult = z.infer<typeof ClassificationSchema>

// Schema para scores de todos os módulos
export const ModuleScoresSchema = z.object({
  atendimento: z.number().min(0).max(1),
  professor: z.number().min(0).max(1),
  aula_expandida: z.number().min(0).max(1),
  enem_interativo: z.number().min(0).max(1),
  aula_interativa: z.number().min(0).max(1),
  enem: z.number().min(0).max(1),
  ti_troubleshooting: z.number().min(0).max(1),
  faq_escola: z.number().min(0).max(1),
  financeiro: z.number().min(0).max(1),
  rh: z.number().min(0).max(1),
  coordenacao: z.number().min(0).max(1),
  bem_estar: z.number().min(0).max(1),
  social_media: z.number().min(0).max(1),
  conteudo_midia: z.number().min(0).max(1)
})

export type ModuleScores = z.infer<typeof ModuleScoresSchema>

// Schema para resultado completo da classificação
export const FullClassificationSchema = z.object({
  classification: ClassificationSchema,
  scores: ModuleScoresSchema,
  model: z.string(),
  timestamp: z.string(),
  cached: z.boolean()
})

export type FullClassificationResult = z.infer<typeof FullClassificationSchema>

// Constantes para thresholds e políticas
export const CLASSIFICATION_THRESHOLD = 0.65
export const PROVIDER_CONFIDENCE_THRESHOLD = 0.75

// Políticas de provider por módulo
export const MODULE_PROVIDER_POLICIES = {
  enem: { preferred: 'grok', model: 'grok-4-fast-reasoning', complexModel: 'gpt-5-chat-latest' },
  professor: { preferred: 'grok', model: 'grok-4-fast-reasoning', complexModel: 'gpt-5-chat-latest' },
  aula_interativa: { preferred: 'grok', model: 'grok-4-fast-reasoning', complexModel: 'gpt-5-chat-latest' },
  financeiro: { preferred: 'grok', model: 'grok-4-fast-reasoning', complexModel: 'gpt-5-chat-latest' },
  admin: { preferred: 'grok', model: 'grok-4-fast-reasoning', complexModel: 'gpt-5-chat-latest' },
  atendimento: { preferred: 'grok', model: 'grok-4-fast-reasoning', complexModel: 'gpt-5-chat-latest' }
} as const

// Heurísticas de alta precisão em português
export const PORTUGUESE_HEURISTICS = {
  enem: /\b(enem|simulado|tri|prova objetiva|redação|questões de múltipla escolha|gabarito)\b/i,
  quiz: /\b(quiz|acertos|percentual|pontuação|correção)\b/i,
  professor_interativo: /\b(aula interativa|slides|explicação passo a passo|atividade|demonstração)\b/i,
  professor: /\b(dúvida|explicação|conceito|matéria|disciplina|geometria|álgebra|física|química|biologia|história|geografia)\b/i,
  social_media: /\b(post|rede social|instagram|facebook|tiktok|youtube|conteúdo digital)\b/i,
  financeiro: /\b(pagamento|boleto|mensalidade|financeiro|valor|preço|custo)\b/i
} as const

export function applyHeuristics(message: string): string | null {
  const messageLower = message.toLowerCase()
  
  for (const [module, pattern] of Object.entries(PORTUGUESE_HEURISTICS)) {
    if (pattern.test(messageLower)) {
      return module
    }
  }
  
  return null
}

export function calculateScores(classification: ClassificationResult, scores: ModuleScores) {
  const sortedScores = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)
  
  const [topModule, topScore] = sortedScores[0]
  const [, secondScore] = sortedScores[1] || [null, 0]
  
  return {
    picked: topModule,
    confidence: topScore,
    deltaToSecond: topScore - secondScore,
    scores
  }
}
