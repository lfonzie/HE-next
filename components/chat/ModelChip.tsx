"use client"

import { Badge } from "@/components/ui/badge"
import { 
  Bot, 
  Zap, 
  Brain, 
  Sparkles,
  Clock,
  DollarSign
} from "lucide-react"

interface ModelChipProps {
  model?: string
  provider?: string
  complexity?: string
  tier?: "IA" | "IA_SUPER" | "IA_ECO"
  className?: string
  showDetails?: boolean
}

// Mapeamento de modelos para chips
const MODEL_CHIP_CONFIG = {
  // Gemini (IA Eco - triviais)
  'gemini-2.0-flash-exp': {
    label: 'IA Eco',
    icon: Bot,
    variant: 'secondary' as const,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    description: 'Respostas rápidas e econômicas'
  },
  
  // GPT-4o-mini (IA - simples)
  'gpt-4o-mini': {
    label: 'IA',
    icon: Brain,
    variant: 'default' as const,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'Respostas equilibradas'
  },
  
  // GPT-5 (IA Turbo - complexas)
  'gpt-5-chat-latest': {
    label: 'IA Turbo',
    icon: Sparkles,
    variant: 'destructive' as const,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    description: 'Respostas avançadas e detalhadas'
  },
  
  // Claude models
  'claude-3-sonnet-20240229': {
    label: 'IA Turbo',
    icon: Sparkles,
    variant: 'destructive' as const,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    description: 'Respostas avançadas e detalhadas'
  },
  
  'claude-3-haiku-20240307': {
    label: 'IA',
    icon: Brain,
    variant: 'default' as const,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'Respostas equilibradas'
  },
  
  // Mistral models
  'mistral-large-latest': {
    label: 'IA Turbo',
    icon: Sparkles,
    variant: 'destructive' as const,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    description: 'Respostas avançadas e detalhadas'
  },
  
  'mistral-small-latest': {
    label: 'IA',
    icon: Brain,
    variant: 'default' as const,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'Respostas equilibradas'
  },
  
  // Groq models
  'llama-3.1-70b-versatile': {
    label: 'IA Turbo',
    icon: Sparkles,
    variant: 'destructive' as const,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    description: 'Respostas avançadas e detalhadas'
  },
  
  'llama-3.1-8b-instant': {
    label: 'IA Eco',
    icon: Bot,
    variant: 'secondary' as const,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    description: 'Respostas rápidas e econômicas'
  }
}

// Mapeamento de complexidade para ícones
const COMPLEXITY_ICONS = {
  simple: Brain,
  complex: Sparkles,
  fast: Zap,
  creative: Sparkles,
  analytical: Brain
}

export function ModelChip({ 
  model, 
  provider, 
  complexity, 
  tier,
  className = "",
  showDetails = false 
}: ModelChipProps) {
  // Determinar configuração do chip baseado no modelo ou tier
  let chipConfig = null
  
  if (model && MODEL_CHIP_CONFIG[model as keyof typeof MODEL_CHIP_CONFIG]) {
    chipConfig = MODEL_CHIP_CONFIG[model as keyof typeof MODEL_CHIP_CONFIG]
  } else if (tier) {
    // Fallback para tier se modelo não estiver mapeado
    switch (tier) {
      case 'IA_ECO':
        chipConfig = MODEL_CHIP_CONFIG['gemini-2.0-flash-exp']
        break
      case 'IA':
        chipConfig = MODEL_CHIP_CONFIG['gpt-4o-mini']
        break
      case 'IA_SUPER':
        chipConfig = MODEL_CHIP_CONFIG['gpt-5-chat-latest']
        break
      default:
        chipConfig = MODEL_CHIP_CONFIG['gpt-4o-mini']
    }
  }
  
  // Se não há configuração, usar padrão
  if (!chipConfig) {
    chipConfig = MODEL_CHIP_CONFIG['gpt-4o-mini']
  }
  
  const IconComponent = chipConfig.icon
  const ComplexityIcon = complexity ? COMPLEXITY_ICONS[complexity as keyof typeof COMPLEXITY_ICONS] : null
  
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <Badge 
        variant={chipConfig.variant}
        className={`${chipConfig.bgColor} ${chipConfig.color} border text-xs font-medium px-2 py-1`}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        {chipConfig.label}
      </Badge>
      
      {showDetails && (
        <>
          {ComplexityIcon && (
            <Badge variant="outline" className="text-xs px-1 py-0.5">
              <ComplexityIcon className="w-2.5 h-2.5 mr-1" />
              {complexity}
            </Badge>
          )}
          
          {provider && (
            <Badge variant="outline" className="text-xs px-1 py-0.5">
              {provider}
            </Badge>
          )}
        </>
      )}
    </div>
  )
}

// Componente para exibir informações detalhadas do modelo
export function ModelDetails({ 
  model, 
  provider, 
  complexity, 
  tier,
  tokens,
  className = ""
}: ModelChipProps & { tokens?: number }) {
  // Só mostrar informações se tokens estiverem disponíveis ou se for modo debug
  if (!tokens && process.env.NODE_ENV !== 'development') return null
  
  const chipConfig = model ? MODEL_CHIP_CONFIG[model as keyof typeof MODEL_CHIP_CONFIG] : null
  
  if (!chipConfig) return null
  
  return (
    <div className={`text-xs text-gray-500 dark:text-gray-400 ${className}`}>
      <div className="flex items-center gap-2">
        {process.env.NODE_ENV === 'development' && (
          <span className="text-gray-400">• {chipConfig.description}</span>
        )}
      </div>
    </div>
  )
}
