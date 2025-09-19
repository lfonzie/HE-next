// Tipos para a seção de Redação ENEM

export interface EnemTheme {
  id: string
  year: number
  theme: string
  description: string
  isAIGenerated?: boolean
  isOfficial?: boolean
  isSessionGenerated?: boolean
  createdAt?: string
}

export interface CompetenciaScore {
  comp1: number // Domínio da norma padrão (0-200)
  comp2: number // Compreensão do tema (0-200)
  comp3: number // Organização de argumentos (0-200)
  comp4: number // Mecanismos linguísticos (0-200)
  comp5: number // Proposta de intervenção (0-200)
}

export interface RedacaoSubmission {
  theme: string
  content: string
  wordCount: number
}

export interface RedacaoEvaluation {
  scores: CompetenciaScore
  totalScore: number
  feedback: string
  suggestions: string[]
  highlights: {
    grammar: string[]
    structure: string[]
    content: string[]
  }
}

export interface RedacaoSession {
  id: string
  userId: string
  theme: string
  themeYear: number
  content: string
  wordCount: number
  scores: CompetenciaScore
  totalScore: number
  feedback: string
  suggestions: string[]
  highlights: {
    grammar: string[]
    structure: string[]
    content: string[]
  }
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  createdAt: Date
  updatedAt: Date
}

export interface RedacaoHistoryItem {
  id: string
  theme: string
  themeYear: number
  wordCount: number
  totalScore: number
  createdAt: string
  status: string
}

export interface RedacaoStats {
  totalRedacoes: number
  averageScore: number
  bestScore: number
  recentScores: number[]
  improvementTrend: 'up' | 'down' | 'stable'
}

// Constantes para as competências
export const COMPETENCIAS_INFO = [
  {
    id: 'comp1',
    name: 'Domínio da Norma Padrão',
    description: 'Gramática, ortografia, pontuação e uso adequado da língua portuguesa',
    maxScore: 200
  },
  {
    id: 'comp2',
    name: 'Compreensão do Tema',
    description: 'Entendimento da proposta e desenvolvimento com conhecimentos de várias áreas',
    maxScore: 200
  },
  {
    id: 'comp3',
    name: 'Organização de Argumentos',
    description: 'Estrutura dissertativa-argumentativa com coerência e coesão',
    maxScore: 200
  },
  {
    id: 'comp4',
    name: 'Mecanismos Linguísticos',
    description: 'Uso adequado de conectivos e recursos de coesão textual',
    maxScore: 200
  },
  {
    id: 'comp5',
    name: 'Proposta de Intervenção',
    description: 'Solução clara, viável e respeitando os direitos humanos',
    maxScore: 200
  }
] as const

// Funções utilitárias
export const getScoreColor = (score: number): string => {
  if (score >= 160) return 'text-green-600'
  if (score >= 120) return 'text-yellow-600'
  return 'text-red-600'
}

export const getScoreBadge = (score: number): 'success' | 'warning' | 'destructive' => {
  if (score >= 160) return 'success'
  if (score >= 120) return 'warning'
  return 'destructive'
}

export const getScoreLabel = (score: number): string => {
  if (score >= 160) return 'Excelente'
  if (score >= 120) return 'Bom'
  if (score >= 80) return 'Regular'
  return 'Precisa Melhorar'
}

export const getTotalScoreColor = (totalScore: number): string => {
  if (totalScore >= 800) return 'text-green-600'
  if (totalScore >= 600) return 'text-yellow-600'
  return 'text-red-600'
}

export const getTotalScoreLabel = (totalScore: number): string => {
  if (totalScore >= 800) return 'Excelente'
  if (totalScore >= 600) return 'Bom'
  if (totalScore >= 400) return 'Regular'
  return 'Precisa Melhorar'
}

export const validateWordCount = (wordCount: number): { isValid: boolean; message?: string } => {
  if (wordCount < 100) {
    return { isValid: false, message: 'A redação deve ter pelo menos 100 palavras' }
  }
  if (wordCount > 1000) {
    return { isValid: false, message: 'A redação não pode exceder 1000 palavras' }
  }
  return { isValid: true }
}

export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}
