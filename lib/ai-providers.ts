import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { mistral } from '@ai-sdk/mistral'
import { groq } from '@ai-sdk/groq'

type ProviderFactory = (modelName: string) => unknown

// Configuração de múltiplos provedores como fábricas de modelos
export const AI_PROVIDERS = {
  openai: (modelName: string) => {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }
    return openai(modelName, {
      apiKey: process.env.OPENAI_API_KEY,
    })
  },
  anthropic: (modelName: string) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured')
    }
    return anthropic(modelName, {
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  },
  google: (modelName: string) => {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY
    if (!apiKey) {
      throw new Error('Google API key not configured')
    }
    return google(modelName, {
      apiKey: apiKey,
    })
  },
  mistral: (modelName: string) => {
    if (!process.env.MISTRAL_API_KEY) {
      throw new Error('Mistral API key not configured')
    }
    return mistral(modelName, {
      apiKey: process.env.MISTRAL_API_KEY,
    })
  },
  groq: (modelName: string) => {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Groq API key not configured')
    }
    return groq(modelName, {
      apiKey: process.env.GROQ_API_KEY,
    })
  },
} satisfies Record<string, ProviderFactory>

// Tipos de provedores
export type ProviderType = keyof typeof AI_PROVIDERS

// Modelos por provedor e complexidade
export const PROVIDER_MODELS = {
  openai: {
    simple: 'gpt-4o-mini',
    complex: 'gpt-4o-mini', // Usando gpt-4o-mini em vez de gpt-5 (que pode não estar disponível)
    fast: 'gpt-4o-mini'
  },
  anthropic: {
    simple: 'claude-3-haiku-20240307',
    complex: 'claude-3-sonnet-20240229',
    fast: 'claude-3-haiku-20240307'
  },
  google: {
    simple: 'gemini-2.0-flash-exp',
    complex: 'gemini-2.0-flash-exp',
    fast: 'gemini-2.0-flash-exp'
  },
  mistral: {
    simple: 'mistral-small-latest',
    complex: 'mistral-large-latest',
    fast: 'mistral-small-latest'
  },
  groq: {
    simple: 'llama-3.1-8b-instant',
    complex: 'llama-3.1-70b-versatile',
    fast: 'llama-3.1-8b-instant'
  }
} as const

// Função para criar modelo de qualquer provedor
export function createModel(provider: ProviderType, modelType: 'simple' | 'complex' | 'fast' = 'simple') {
  const providerInstance = AI_PROVIDERS[provider]
  const modelName = PROVIDER_MODELS[provider][modelType]
  
  if (!providerInstance) {
    throw new Error(`Provider ${provider} not found in AI_PROVIDERS`)
  }
  
  if (!modelName) {
    throw new Error(`Model type ${modelType} not found for provider ${provider}`)
  }
  
  try {
    return providerInstance(modelName)
  } catch (error) {
    console.error(`Error creating model for provider ${provider} with model ${modelName}:`, error)
    throw new Error(`Failed to create model ${modelName} for provider ${provider}`)
  }
}

// Função para obter provedor baseado em configuração
export function getProvider(providerName?: string): ProviderType {
  const defaultProvider = process.env.DEFAULT_AI_PROVIDER as ProviderType || 'openai'
  
  if (!providerName || providerName === 'auto') {
    return defaultProvider
  }
  
  const validProviders: ProviderType[] = ['openai', 'anthropic', 'google', 'mistral', 'groq']
  
  if (validProviders.includes(providerName as ProviderType)) {
    return providerName as ProviderType
  }
  
  return defaultProvider
}

// Função para obter provedores disponíveis
export function getAvailableProviders(): ProviderType[] {
  const available: ProviderType[] = []
  
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10) {
    available.push('openai')
  }
  
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.length > 10) {
    available.push('anthropic')
  }
  
  if ((process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GOOGLE_GENERATIVE_AI_API_KEY.length > 10) ||
      (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.length > 10)) {
    available.push('google')
  }
  
  if (process.env.MISTRAL_API_KEY && process.env.MISTRAL_API_KEY.length > 10) {
    available.push('mistral')
  }
  
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 10) {
    available.push('groq')
  }
  
  return available
}

// Função para obter informações do provedor
export function getProviderInfo(provider: ProviderType) {
  const info = {
    openai: {
      name: 'OpenAI',
      description: 'GPT-5, GPT-4o Mini',
      website: 'https://openai.com',
      models: ['gpt-5', 'gpt-4o-mini']
    },
    anthropic: {
      name: 'Anthropic',
      description: 'Claude 3 Sonnet, Haiku, Opus',
      website: 'https://anthropic.com',
      models: ['claude-3-sonnet-20240229', 'claude-3-haiku-20240307', 'claude-3-opus-20240229']
    },
    google: {
      name: 'Google',
      description: 'Gemini 2.0 Flash, Pro',
      website: 'https://ai.google.dev',
      models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash']
    },
    mistral: {
      name: 'Mistral',
      description: 'Mistral Large, Small',
      website: 'https://mistral.ai',
      models: ['mistral-large-latest', 'mistral-small-latest']
    },
    groq: {
      name: 'Groq',
      description: 'Llama 3.1, Mixtral',
      website: 'https://groq.com',
      models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768']
    }
  }
  
  return info[provider]
}

// Função para verificar se um provedor está disponível
export function isProviderAvailable(provider: ProviderType): boolean {
  return getAvailableProviders().includes(provider)
}

// Função para obter modelo padrão de um provedor
export function getDefaultModel(provider: ProviderType): string {
  return PROVIDER_MODELS[provider].simple
}

// Função para obter todos os modelos de um provedor
export function getProviderModels(provider: ProviderType): string[] {
  return Object.values(PROVIDER_MODELS[provider])
}

// Função para obter configuração de um modelo
export function getModelConfig(model: string) {
  const configs = {
    'gpt-5': { temperature: 0.7, maxTokens: 4000, timeout: 30000 },
    'gpt-4o-mini': { temperature: 0.7, maxTokens: 2000, timeout: 20000 },
    'claude-3-sonnet-20240229': { temperature: 0.7, maxTokens: 4000, timeout: 30000 },
    'claude-3-haiku-20240307': { temperature: 0.7, maxTokens: 2000, timeout: 20000 },
    'claude-3-opus-20240229': { temperature: 0.7, maxTokens: 4000, timeout: 30000 },
    'gemini-2.0-flash-exp': { temperature: 0.7, maxTokens: 4000, timeout: 30000 },
    'gemini-1.5-pro': { temperature: 0.7, maxTokens: 4000, timeout: 30000 },
    'gemini-1.5-flash': { temperature: 0.7, maxTokens: 2000, timeout: 20000 },
    'mistral-large-latest': { temperature: 0.7, maxTokens: 4000, timeout: 30000 },
    'mistral-small-latest': { temperature: 0.7, maxTokens: 2000, timeout: 20000 },
    'llama-3.1-70b-versatile': { temperature: 0.7, maxTokens: 4000, timeout: 30000 },
    'llama-3.1-8b-instant': { temperature: 0.7, maxTokens: 2000, timeout: 20000 },
    'mixtral-8x7b-32768': { temperature: 0.7, maxTokens: 4000, timeout: 30000 }
  }
  
  return configs[model as keyof typeof configs] || { temperature: 0.7, maxTokens: 2000, timeout: 20000 }
}

// Função para selecionar provedor baseado em complexidade e preferência
export function selectProvider(
  complexity: 'simple' | 'complex' | 'fast' = 'simple',
  preferredProvider?: ProviderType
): { provider: ProviderType; model: string } {
  const availableProviders = getAvailableProviders()
  
  // Se um provedor específico foi solicitado e está disponível, usar ele
  if (preferredProvider && availableProviders.includes(preferredProvider)) {
    return {
      provider: preferredProvider,
      model: PROVIDER_MODELS[preferredProvider][complexity]
    }
  }
  
  // Ordem de preferência para fallback
  const fallbackOrder: ProviderType[] = ['openai', 'anthropic', 'google', 'mistral', 'groq']
  
  // Encontrar o primeiro provedor disponível na ordem de preferência
  for (const provider of fallbackOrder) {
    if (availableProviders.includes(provider)) {
      return {
        provider,
        model: PROVIDER_MODELS[provider][complexity]
      }
    }
  }
  
  // Fallback para OpenAI se nenhum estiver disponível
  return {
    provider: 'openai',
    model: 'gpt-4o-mini'
  }
}

// Função para obter configuração de um provedor
export function getProviderConfig(provider: ProviderType) {
  const defaultModel = getDefaultModel(provider)
  return getModelConfig(defaultModel)
}
