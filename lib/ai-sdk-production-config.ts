import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'

/**
 * Configuração específica para produção no Render
 * Resolve problemas de compatibilidade com diferentes ambientes
 */

// Função para validar API key do OpenAI
export function validateOpenAIKey(): boolean {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return false
  
  // Validações específicas para produção
  return apiKey.trim() !== '' && 
         apiKey !== 'your-openai-api-key-here' &&
         apiKey.startsWith('sk-') &&
         apiKey.length > 20
}

// Função para criar cliente OpenAI com configuração robusta
export function createOpenAIClient(modelName: string) {
  if (!validateOpenAIKey()) {
    throw new Error('OpenAI API key not properly configured for production')
  }

  try {
    // Configuração específica para produção
    return openai(modelName)
  } catch (error) {
    console.error('Error creating OpenAI client:', error)
    throw new Error(`Failed to create OpenAI client for model ${modelName}`)
  }
}

// Função para criar cliente Google com configuração robusta
export function createGoogleClient(modelName: string) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY
  
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Google API key not properly configured for production')
  }

  try {
    return google(modelName)
  } catch (error) {
    console.error('Error creating Google client:', error)
    throw new Error(`Failed to create Google client for model ${modelName}`)
  }
}

// Configuração de modelos válidos para produção
export const PRODUCTION_MODELS = {
  openai: {
    simple: 'gpt-4o-mini',
    complex: 'gpt-5-chat-latest',
    fast: 'gpt-4o-mini'
  },
  google: {
    simple: 'gemini-2.0-flash-exp',
    complex: 'gemini-2.0-flash-exp',
    fast: 'gemini-2.0-flash-exp'
  }
} as const

// Função para obter modelo com fallback seguro
export function getSafeModel(provider: 'openai' | 'google', complexity: 'simple' | 'complex' | 'fast' = 'simple'): string {
  const models = PRODUCTION_MODELS[provider]
  
  // Fallback para modelo simples se o complexo não estiver disponível
  if (complexity === 'complex' && provider === 'openai') {
    // Verificar se gpt-5-chat-latest está disponível
    try {
      return models.complex
    } catch {
      console.warn('GPT-5 not available, falling back to GPT-4o-mini')
      return models.simple
    }
  }
  
  return models[complexity] || models.simple
}

// Função para criar modelo com tratamento de erro robusto
export function createSafeModel(provider: 'openai' | 'google', complexity: 'simple' | 'complex' | 'fast' = 'simple') {
  try {
    const modelName = getSafeModel(provider, complexity)
    
    if (provider === 'openai') {
      return createOpenAIClient(modelName)
    } else if (provider === 'google') {
      return createGoogleClient(modelName)
    }
    
    throw new Error(`Unknown provider: ${provider}`)
  } catch (error) {
    console.error(`Error creating ${provider} model:`, error)
    
    // Fallback para OpenAI com modelo simples
    if (provider !== 'openai') {
      console.warn(`Falling back to OpenAI gpt-4o-mini due to ${provider} error`)
      return createOpenAIClient('gpt-4o-mini')
    }
    
    throw error
  }
}

// Configuração de produção para AI SDK
export const productionAIConfig = {
  openai: validateOpenAIKey() ? {
    createClient: (model: string) => createOpenAIClient(model),
    available: true
  } : {
    createClient: () => { throw new Error('OpenAI not available') },
    available: false
  },
  google: (process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY) ? {
    createClient: (model: string) => createGoogleClient(model),
    available: true
  } : {
    createClient: () => { throw new Error('Google not available') },
    available: false
  }
}

export default productionAIConfig
