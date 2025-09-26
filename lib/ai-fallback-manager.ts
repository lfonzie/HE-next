import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { anthropic } from '@ai-sdk/anthropic'
import { perplexity } from '@ai-sdk/perplexity'

/**
 * Sistema Universal de Fallback de IA
 * Gerencia automaticamente o fallback entre provedores quando um falha
 */

export interface AIProviderConfig {
  id: string
  name: string
  priority: number
  enabled: boolean
  apiKey: string | undefined
  createClient: (model: string) => any
  models: {
    simple: string
    complex: string
    fast: string
  }
  timeout: number
  maxRetries: number
}

export interface FallbackResult {
  success: boolean
  content?: string
  provider: string
  model: string
  error?: string
  latency: number
  attempts: number
  fallbackChain: string[]
}

export interface FallbackOptions {
  message: string
  module?: string
  complexity?: 'simple' | 'complex' | 'fast'
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  timeout?: number
  maxRetries?: number
  preferredProvider?: string
  excludeProviders?: string[]
}

class AIFallbackManager {
  private providers: Map<string, AIProviderConfig> = new Map()
  private healthStatus: Map<string, { healthy: boolean; lastCheck: number; failures: number }> = new Map()
  
  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    // OpenAI Provider
    if (process.env.OPENAI_API_KEY) {
      this.providers.set('openai', {
        id: 'openai',
        name: 'OpenAI',
        priority: 1,
        enabled: true,
        apiKey: process.env.OPENAI_API_KEY,
        createClient: (model: string) => openai(model),
        models: {
          simple: 'gpt-4o-mini',
          complex: 'gpt-5-chat-latest',
          fast: 'gpt-4o-mini'
        },
        timeout: 30000,
        maxRetries: 3
      })
    }

    // Google Provider
    const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || 
                        process.env.GOOGLE_GEMINI_API_KEY || 
                        process.env.GOOGLE_API_KEY
    if (googleApiKey) {
      this.providers.set('google', {
        id: 'google',
        name: 'Google Gemini',
        priority: 2,
        enabled: true,
        apiKey: googleApiKey,
        createClient: (model: string) => google(model),
        models: {
          simple: 'gemini-2.0-flash-exp',
          complex: 'gemini-2.0-flash-exp',
          fast: 'gemini-2.0-flash-exp'
        },
        timeout: 45000,
        maxRetries: 3
      })
    }

    // Anthropic Provider (opcional)
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.set('anthropic', {
        id: 'anthropic',
        name: 'Anthropic Claude',
        priority: 3,
        enabled: true,
        apiKey: process.env.ANTHROPIC_API_KEY,
        createClient: (model: string) => anthropic(model),
        models: {
          simple: 'claude-3-haiku-20240307',
          complex: 'claude-3-sonnet-20240229',
          fast: 'claude-3-haiku-20240307'
        },
        timeout: 60000,
        maxRetries: 2
      })
    }

    // Perplexity Provider - Para busca na web
    if (process.env.PERPLEXITY_API_KEY) {
      this.providers.set('perplexity', {
        id: 'perplexity',
        name: 'Perplexity Sonar',
        priority: 4,
        enabled: true,
        apiKey: process.env.PERPLEXITY_API_KEY,
        createClient: (model: string) => perplexity(model, {
          apiKey: process.env.PERPLEXITY_API_KEY
        }),
        models: {
          simple: 'sonar',
          complex: 'sonar',
          fast: 'sonar'
        },
        timeout: 45000,
        maxRetries: 2
      })
    }

    // Inicializar status de saúde
    this.providers.forEach((_, providerId) => {
      this.healthStatus.set(providerId, {
        healthy: true,
        lastCheck: Date.now(),
        failures: 0
      })
    })

    console.log(`🤖 [AI-FALLBACK] Initialized ${this.providers.size} providers:`, 
      Array.from(this.providers.keys()))
  }

  /**
   * Executa uma requisição com fallback automático
   */
  async executeWithFallback(options: FallbackOptions): Promise<FallbackResult> {
    const startTime = Date.now()
    const fallbackChain: string[] = []
    let attempts = 0
    let lastError: Error | null = null

    // Ordenar provedores por prioridade e saúde
    const availableProviders = this.getAvailableProviders(options.preferredProvider, options.excludeProviders)
    
    if (availableProviders.length === 0) {
      return {
        success: false,
        error: 'No AI providers available',
        provider: 'none',
        model: 'none',
        latency: Date.now() - startTime,
        attempts: 0,
        fallbackChain: []
      }
    }

    console.log(`🔄 [AI-FALLBACK] Starting with ${availableProviders.length} providers:`, 
      availableProviders.map(p => p.id))

    // Tentar cada provedor em ordem de prioridade
    for (const provider of availableProviders) {
      attempts++
      fallbackChain.push(provider.id)
      
      try {
        console.log(`🎯 [AI-FALLBACK] Attempt ${attempts}: ${provider.name}`)
        
        const result = await this.executeWithProvider(provider, options)
        
        // Sucesso! Marcar provedor como saudável
        this.markProviderHealthy(provider.id)
        
        return {
          success: true,
          content: result.content,
          provider: provider.id,
          model: result.model,
          latency: Date.now() - startTime,
          attempts,
          fallbackChain
        }
        
      } catch (error) {
        lastError = error as Error
        console.warn(`❌ [AI-FALLBACK] ${provider.name} failed:`, error.message)
        
        // Marcar provedor como não saudável temporariamente
        this.markProviderUnhealthy(provider.id)
        
        // Se não é o último provedor, continuar para o próximo
        if (provider !== availableProviders[availableProviders.length - 1]) {
          console.log(`🔄 [AI-FALLBACK] Trying next provider...`)
          continue
        }
      }
    }

    // Todos os provedores falharam
    return {
      success: false,
      error: `All providers failed. Last error: ${lastError?.message}`,
      provider: 'none',
      model: 'none',
      latency: Date.now() - startTime,
      attempts,
      fallbackChain
    }
  }

  /**
   * Executa uma requisição com um provedor específico
   */
  private async executeWithProvider(provider: AIProviderConfig, options: FallbackOptions): Promise<{ content: string; model: string }> {
    const model = provider.models[options.complexity || 'simple']
    const client = provider.createClient(model)
    
    const systemPrompt = options.systemPrompt || this.getDefaultSystemPrompt(options.module)
    
    // Configurar timeout
    const timeout = options.timeout || provider.timeout
    
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Provider ${provider.name} timeout after ${timeout}ms`))
      }, timeout)

      try {
        // Usar generateText do AI SDK
        const { generateText } = await import('ai')
        
        const result = await generateText({
          model: client,
          prompt: `${systemPrompt}\n\nUser: ${options.message}`,
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 4000,
        })

        clearTimeout(timeoutId)
        resolve({
          content: result.text,
          model: model
        })
        
      } catch (error) {
        clearTimeout(timeoutId)
        reject(error)
      }
    })
  }

  /**
   * Obtém provedores disponíveis ordenados por prioridade e saúde
   */
  private getAvailableProviders(preferredProvider?: string, excludeProviders?: string[]): AIProviderConfig[] {
    const providers = Array.from(this.providers.values())
      .filter(provider => provider.enabled)
      .filter(provider => !excludeProviders?.includes(provider.id))
      .filter(provider => this.isProviderHealthy(provider.id))

    // Se há um provedor preferido, colocá-lo primeiro
    if (preferredProvider) {
      const preferred = providers.find(p => p.id === preferredProvider)
      if (preferred) {
        return [preferred, ...providers.filter(p => p.id !== preferredProvider)]
      }
    }

    // Ordenar por prioridade (menor número = maior prioridade)
    return providers.sort((a, b) => a.priority - b.priority)
  }

  /**
   * Verifica se um provedor está saudável
   */
  private isProviderHealthy(providerId: string): boolean {
    const status = this.healthStatus.get(providerId)
    if (!status) return false
    
    // Se falhou recentemente, aguardar um tempo antes de tentar novamente
    const timeSinceLastFailure = Date.now() - status.lastCheck
    const backoffTime = Math.min(300000, status.failures * 60000) // Max 5 minutes
    
    return status.healthy || timeSinceLastFailure > backoffTime
  }

  /**
   * Marca um provedor como saudável
   */
  private markProviderHealthy(providerId: string): void {
    const status = this.healthStatus.get(providerId)
    if (status) {
      status.healthy = true
      status.failures = 0
      status.lastCheck = Date.now()
    }
  }

  /**
   * Marca um provedor como não saudável
   */
  private markProviderUnhealthy(providerId: string): void {
    const status = this.healthStatus.get(providerId)
    if (status) {
      status.healthy = false
      status.failures++
      status.lastCheck = Date.now()
    }
  }

  /**
   * Obtém system prompt padrão baseado no módulo
   */
  private getDefaultSystemPrompt(module?: string): string {
    const prompts: Record<string, string> = {
      professor: 'Você é um professor especializado em educação. Responda de forma clara, didática e objetiva.',
      enem: 'Você é um especialista em ENEM. Forneça explicações concisas e diretas sobre questões e conceitos do ENEM.',
      aula_interativa: 'Você é um professor criador de aulas interativas. Crie conteúdo educativo envolvente e didático.',
      ti: 'Você é um especialista em TI. Forneça soluções técnicas práticas e diretas para problemas de tecnologia.',
      financeiro: 'Você é um especialista em questões financeiras. Responda de forma clara e objetiva sobre pagamentos.',
      default: 'Você é um assistente educacional. Responda de forma clara, objetiva e útil.'
    }
    
    return prompts[module || 'default']
  }

  /**
   * Obtém status de todos os provedores
   */
  getProviderStatus(): Record<string, any> {
    const status: Record<string, any> = {}
    
    this.providers.forEach((provider, id) => {
      const health = this.healthStatus.get(id)
      status[id] = {
        name: provider.name,
        enabled: provider.enabled,
        healthy: health?.healthy ?? false,
        failures: health?.failures ?? 0,
        lastCheck: health?.lastCheck ?? 0,
        priority: provider.priority
      }
    })
    
    return status
  }

  /**
   * Força reset do status de um provedor
   */
  resetProviderStatus(providerId: string): void {
    const status = this.healthStatus.get(providerId)
    if (status) {
      status.healthy = true
      status.failures = 0
      status.lastCheck = Date.now()
    }
  }
}

// Instância singleton
export const aiFallbackManager = new AIFallbackManager()

// Função de conveniência para uso direto
export async function executeWithFallback(options: FallbackOptions): Promise<FallbackResult> {
  return aiFallbackManager.executeWithFallback(options)
}

// Função para detectar erros de quota
export function isQuotaExceededError(error: any): boolean {
  const errorMessage = error?.message?.toLowerCase() || ''
  const errorCode = error?.code || ''
  
  return (
    errorMessage.includes('quota') ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('limit exceeded') ||
    errorMessage.includes('too many requests') ||
    errorCode === '429' ||
    errorCode === 'quota_exceeded' ||
    errorCode === 'rate_limit_exceeded'
  )
}

// Função para detectar erros de API key
export function isApiKeyError(error: any): boolean {
  const errorMessage = error?.message?.toLowerCase() || ''
  const errorCode = error?.code || ''
  
  return (
    errorMessage.includes('api key') ||
    errorMessage.includes('authentication') ||
    errorMessage.includes('unauthorized') ||
    errorCode === '401' ||
    errorCode === 'invalid_api_key'
  )
}

export default aiFallbackManager
