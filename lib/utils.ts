import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function calculateScore(answers: Record<number, string>, questions: any[]): number {
  let correct = 0
  questions.forEach((question, index) => {
    if (answers[index] === question.correct) {
      correct++
    }
  })
  return Math.round((correct / questions.length) * 1000)
}

export function getModuleConfig(module: string) {
  const configs = {
    professor: {
      name: 'Professor',
      description: 'Assistente de estudos e ensino',
      icon: '👨‍🏫',
      color: 'blue'
    },
    ti: {
      name: 'TI',
      description: 'Suporte técnico educacional',
      icon: '💻',
      color: 'green'
    },
    secretaria: {
      name: 'Secretaria',
      description: 'Gestão administrativa',
      icon: '📋',
      color: 'purple'
    },
    financeiro: {
      name: 'Financeiro',
      description: 'Controle financeiro',
      icon: '💰',
      color: 'yellow'
    },
    rh: {
      name: 'RH',
      description: 'Recursos humanos',
      icon: '👥',
      color: 'orange'
    },
    atendimento: {
      name: 'Atendimento',
      description: 'Suporte multicanal',
      icon: '🎧',
      color: 'pink'
    },
    coordenacao: {
      name: 'Coordenação',
      description: 'Gestão pedagógica',
      icon: '📚',
      color: 'indigo'
    },
    'social-media': {
      name: 'Social Media',
      description: 'Comunicação digital',
      icon: '📱',
      color: 'cyan'
    },
    'bem-estar': {
      name: 'Bem-Estar',
      description: 'Suporte socioemocional',
      icon: '🧘',
      color: 'emerald'
    }
  }
  
  return configs[module as keyof typeof configs] || configs.professor
}
