import { role, plan } from '@prisma/client'

export interface User {
  id: string
  name?: string
  email: string
  emailVerified?: Date
  image?: string
  role: role
  schoolId?: string
  createdAt: Date
  updatedAt: Date
}

export interface School {
  id: string
  domain: string
  name: string
  logoUrl?: string
  plan: plan
  primaryColor: string
  secondaryColor: string
  supportEmail?: string
  generalSystemMessage?: string
  createdAt: Date
  updatedAt: Date
}

export interface Conversation {
  id: string
  userId?: string
  title?: string
  module: string
  subject?: string
  grade?: string
  messages: Message[]
  tokenCount: number
  model?: string
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  module?: string
  model?: string
  tokens?: number
  tier?: "IA" | "IA_SUPER" | "IA_ECO"
  isStreaming?: boolean
  originalQuery?: string
  structured?: boolean
  webSearchUsed?: boolean
  citations?: any[]
  searchTime?: number
  attachments?: Attachment[]
  image?: string
  attachment?: File
  hasError?: boolean
  // Informações de roteamento do modelo
  provider?: string
  complexity?: string
  routingReasoning?: string
  // Orchestrated UI payloads
  blocks?: OrchestratorBlock[]
  actions?: OrchestratorAction[]
  trace?: OrchestratorTrace
}

export interface Attachment {
  id: string
  name: string
  type: string
  url: string
  size: number
}

export interface EnemQuestion {
  id: string
  area: string
  disciplina: string
  year?: number
  source?: string
  stem: string
  alternatives: string[]
  correct: string
  explanation?: string
  image_url?: string
  image_alt?: string
  createdAt: Date
}

export interface EnemSession {
  id: string
  userId: string
  area: string
  disciplina?: string
  numQuestions: number
  durationMs: number
  startedAt: Date
  finishedAt?: Date
  questions: EnemQuestion[]
  answers?: Record<number, string>
  score?: number
  createdAt: Date
}

export interface Analytics {
  id: string
  schoolId: string
  userId: string
  module: string
  subject?: string
  grade?: string
  tokensUsed: number
  responseTime?: number
  model: string
  satisfactionRating?: number
  date: Date
}

export interface Quota {
  id: string
  userId: string
  month: string
  tokenLimit: number
  tokenUsed: number
  createdAt: Date
  updatedAt: Date
}

export type ModuleType = 
  | 'professor'
  | 'ti'
  | 'secretaria'
  | 'financeiro'
  | 'rh'
  | 'atendimento'
  | 'coordenacao'
  | 'social-media'
  | 'bem-estar'
  | 'enem-interactive'
  | 'aula-expandida'

export interface ModuleConfig {
  id: ModuleType
  name: string
  description: string
  icon: string
  color: string
  systemPrompt: string
  temperature: number
  maxTokens: number
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  selectedModule: ModuleType
  error?: string
}

export interface EnemState {
  questions: EnemQuestion[]
  currentQuestion: number
  answers: Record<number, string>
  timeLeft: number
  isActive: boolean
  isFinished: boolean
  score?: number
}

// Legacy types for compatibility
export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
  timestamp: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface NavigationItem {
  name: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  children?: NavigationItem[]
}

export interface Feature {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  color: string
}

export interface Stat {
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
  description: string
}

// Unified Orchestrator contract
export type OrchestratorBlock =
  | { type: 'lesson_interactive'; lesson_id: string; meta?: Record<string, any> }
  | { type: 'quiz'; questions: any[]; meta?: Record<string, any> }
  | { type: 'media'; items: Array<{ url: string; title?: string; caption?: string; source?: string }>; meta?: Record<string, any> }
  | { type: 'notice'; title: string; body: string; meta?: Record<string, any> }
  | { type: 'checklist'; items: Array<{ text: string; done?: boolean }>; meta?: Record<string, any> }

export type OrchestratorAction =
  | { type: 'cta'; label: string; module: string; args?: Record<string, any> }
  | { type: 'link'; label: string; href: string }

export interface OrchestratorTrace {
  module: string
  confidence: number
  intent?: string
  slots?: Record<string, any>
  latencyMs?: number
  cost?: { inputTokens?: number; outputTokens?: number }
  errors?: string[]
}

export interface OrchestratorResponse {
  text: string
  blocks: OrchestratorBlock[]
  actions?: OrchestratorAction[]
  trace?: OrchestratorTrace
}