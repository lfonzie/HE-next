"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  Zap, 
  Brain, 
  Sparkles
} from "lucide-react"

interface ModelBadgeProps {
  model?: string
  className?: string
}

// Mapeamento de modelos para configuração do badge
const MODEL_BADGE_CONFIG = {
  // Gemini models
  'gemini-2.0-flash-exp': {
    label: 'GEMINI',
    icon: Bot,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
  },
  
  // GPT models
  'gpt-4o-mini': {
    label: 'GPT',
    icon: Brain,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  
  'gpt-4o': {
    label: 'GPT',
    icon: Brain,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  
  'gpt-5-chat-latest': {
    label: 'GPT',
    icon: Brain,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  
  // Claude models
  'claude-3-sonnet-20240229': {
    label: 'CLAUDE',
    icon: Sparkles,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
  },
  
  'claude-3-haiku-20240307': {
    label: 'CLAUDE',
    icon: Sparkles,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
  },
  
  // Mistral models
  'mistral-large-latest': {
    label: 'MISTRAL',
    icon: Sparkles,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
  },
  
  'mistral-small-latest': {
    label: 'MISTRAL',
    icon: Sparkles,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
  },
  
  // Perplexity models
  'llama-3.1-sonar-small-128k-online': {
    label: 'PERPLEXITY',
    icon: Zap,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200',
  },
  
  'llama-3.1-sonar-large-128k-online': {
    label: 'PERPLEXITY',
    icon: Zap,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200',
  },
  
  // Groq models
  'llama-3.1-70b-versatile': {
    label: 'GROQ',
    icon: Zap,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 border-cyan-200',
  },
  
  'llama-3.1-8b-instant': {
    label: 'GROQ',
    icon: Zap,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 border-cyan-200',
  }
}

export function ModelBadge({ model, className = "" }: ModelBadgeProps) {
  if (!model) {
    if (process.env.NODE_ENV === 'development') {
      console.log('ModelBadge: no model provided');
    }
    return null
  }

  // Debug log
  if (process.env.NODE_ENV === 'development') {
    console.log('ModelBadge: rendering with model:', model);
  }

  // Buscar configuração do modelo
  const config = MODEL_BADGE_CONFIG[model as keyof typeof MODEL_BADGE_CONFIG]
  
  // Se não encontrar configuração específica, tentar detectar pelo nome do modelo
  if (!config) {
    let detectedLabel = 'AI'
    let detectedColor = 'text-gray-600'
    let detectedBgColor = 'bg-gray-50 border-gray-200'
    
    if (model.toLowerCase().includes('gemini')) {
      detectedLabel = 'GEMINI'
      detectedColor = 'text-green-600'
      detectedBgColor = 'bg-green-50 border-green-200'
    } else if (model.toLowerCase().includes('gpt')) {
      detectedLabel = 'GPT'
      detectedColor = 'text-blue-600'
      detectedBgColor = 'bg-blue-50 border-blue-200'
    } else if (model.toLowerCase().includes('claude')) {
      detectedLabel = 'CLAUDE'
      detectedColor = 'text-purple-600'
      detectedBgColor = 'bg-purple-50 border-purple-200'
    } else if (model.toLowerCase().includes('mistral')) {
      detectedLabel = 'MISTRAL'
      detectedColor = 'text-orange-600'
      detectedBgColor = 'bg-orange-50 border-orange-200'
    } else if (model.toLowerCase().includes('perplexity') || model.toLowerCase().includes('sonar')) {
      detectedLabel = 'PERPLEXITY'
      detectedColor = 'text-indigo-600'
      detectedBgColor = 'bg-indigo-50 border-indigo-200'
    } else if (model.toLowerCase().includes('groq') || model.toLowerCase().includes('llama')) {
      detectedLabel = 'GROQ'
      detectedColor = 'text-cyan-600'
      detectedBgColor = 'bg-cyan-50 border-cyan-200'
    }
    
    return (
      <span className={`ml-2 rounded-full border px-2 py-0.5 text-xs font-medium ${detectedBgColor} ${detectedColor} ${className}`}>
        {detectedLabel}
      </span>
    )
  }

  const IconComponent = config.icon

  return (
    <span className={`ml-2 rounded-full border px-2 py-0.5 text-xs font-medium ${config.bgColor} ${config.color} ${className}`}>
      <IconComponent className="w-3 h-3 mr-1 inline" />
      {config.label}
    </span>
  )
}
