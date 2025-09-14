// lib/api-config.ts
// Configuration system for API priorities and fallback behavior

export interface ApiConfig {
  // ENEM API configuration
  enem: {
    priority: 'api' | 'database' | 'ai' | 'hybrid'
    enableRealQuestions: boolean
    enableDatabaseFallback: boolean
    enableAiFallback: boolean
    maxRetries: number
    timeoutMs: number
  }
  
  // OpenAI API configuration
  openai: {
    priority: 'api' | 'fallback'
    enableStreaming: boolean
    maxTokens: number
    temperature: number
    modelSelection: 'auto' | 'simple' | 'complex'
  }
  
  // Unsplash API configuration
  unsplash: {
    priority: 'api' | 'fallback'
    enableImageSearch: boolean
    enableAutoImages: boolean
    maxImagesPerRequest: number
  }
  
  // General API settings
  general: {
    enableCaching: boolean
    cacheTimeoutMs: number
    enableRetries: boolean
    maxRetries: number
    enableLogging: boolean
  }
}

// Default configuration prioritizing APIs
export const DEFAULT_API_CONFIG: ApiConfig = {
  enem: {
    priority: 'api', // Use API as primary source
    enableRealQuestions: true,
    enableDatabaseFallback: true,
    enableAiFallback: true,
    maxRetries: 3,
    timeoutMs: 10000
  },
  
  openai: {
    priority: 'api',
    enableStreaming: true,
    maxTokens: 4000,
    temperature: 0.7,
    modelSelection: 'auto'
  },
  
  unsplash: {
    priority: 'api',
    enableImageSearch: true,
    enableAutoImages: true,
    maxImagesPerRequest: 20
  },
  
  general: {
    enableCaching: true,
    cacheTimeoutMs: 300000, // 5 minutes
    enableRetries: true,
    maxRetries: 3,
    enableLogging: true
  }
}

// Configuration manager
class ApiConfigManager {
  private config: ApiConfig = DEFAULT_API_CONFIG
  
  constructor() {
    this.loadConfigFromEnv()
  }
  
  private loadConfigFromEnv() {
    // Load configuration from environment variables
    if (process.env.ENEM_API_PRIORITY) {
      this.config.enem.priority = process.env.ENEM_API_PRIORITY as any
    }
    
    if (process.env.OPENAI_API_PRIORITY) {
      this.config.openai.priority = process.env.OPENAI_API_PRIORITY as any
    }
    
    if (process.env.UNSPLASH_API_PRIORITY) {
      this.config.unsplash.priority = process.env.UNSPLASH_API_PRIORITY as any
    }
    
    if (process.env.API_CACHE_TIMEOUT) {
      this.config.general.cacheTimeoutMs = parseInt(process.env.API_CACHE_TIMEOUT)
    }
  }
  
  getConfig(): ApiConfig {
    return this.config
  }
  
  updateConfig(newConfig: Partial<ApiConfig>) {
    this.config = { ...this.config, ...newConfig }
  }
  
  // ENEM specific methods
  shouldUseEnemApi(): boolean {
    return this.config.enem.priority === 'api' || this.config.enem.priority === 'hybrid'
  }
  
  shouldUseEnemDatabase(): boolean {
    return this.config.enem.priority === 'database' || this.config.enem.priority === 'hybrid'
  }
  
  shouldUseEnemAi(): boolean {
    return this.config.enem.priority === 'ai' || this.config.enem.priority === 'hybrid'
  }
  
  // OpenAI specific methods
  shouldUseOpenAiApi(): boolean {
    return this.config.openai.priority === 'api'
  }
  
  // Unsplash specific methods
  shouldUseUnsplashApi(): boolean {
    return this.config.unsplash.priority === 'api'
  }
  
  // General methods
  shouldCache(): boolean {
    return this.config.general.enableCaching
  }
  
  getCacheTimeout(): number {
    return this.config.general.cacheTimeoutMs
  }
  
  shouldRetry(): boolean {
    return this.config.general.enableRetries
  }
  
  getMaxRetries(): number {
    return this.config.general.maxRetries
  }
  
  shouldLog(): boolean {
    return this.config.general.enableLogging
  }
}

// Singleton instance
export const apiConfig = new ApiConfigManager()

// Helper functions
export function getEnemApiPriority(): 'api' | 'database' | 'ai' | 'hybrid' {
  return apiConfig.getConfig().enem.priority
}

export function getOpenAiApiPriority(): 'api' | 'fallback' {
  return apiConfig.getConfig().openai.priority
}

export function getUnsplashApiPriority(): 'api' | 'fallback' {
  return apiConfig.getConfig().unsplash.priority
}

// Environment variable helpers
export function setApiPriorityFromEnv() {
  if (process.env.API_PRIORITY_MODE === 'api-first') {
    apiConfig.updateConfig({
      enem: { ...apiConfig.getConfig().enem, priority: 'api' },
      openai: { ...apiConfig.getConfig().openai, priority: 'api' },
      unsplash: { ...apiConfig.getConfig().unsplash, priority: 'api' }
    })
  } else if (process.env.API_PRIORITY_MODE === 'hybrid') {
    apiConfig.updateConfig({
      enem: { ...apiConfig.getConfig().enem, priority: 'hybrid' },
      openai: { ...apiConfig.getConfig().openai, priority: 'api' },
      unsplash: { ...apiConfig.getConfig().unsplash, priority: 'api' }
    })
  }
}

// Initialize configuration
setApiPriorityFromEnv()
