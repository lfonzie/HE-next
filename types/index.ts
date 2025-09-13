import { UserRole, PlanType } from '@prisma/client'

export interface User {
  id: string
  name?: string
  email: string
  emailVerified?: Date
  image?: string
  role: UserRole
  schoolId?: string
  createdAt: Date
  updatedAt: Date
}

export interface School {
  id: string
  domain: string
  name: string
  logoUrl?: string
  plan: PlanType
  primaryColor: string
  secondaryColor: string
  supportEmail?: string
  generalSystemMessage?: string
  createdAt: Date
  updatedAt: Date
}

export interface Conversation {
  id: string
  userId: string
  module: string
  subject?: string
  grade?: string
  messages: Message[]
  tokenCount: number
  model: string
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  module?: string
  attachments?: Attachment[]
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