/**
 * Sistema de logging inteligente para o HubEdu
 * Permite controle granular de logs por categoria e nível
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug'
export type LogCategory = 
  | 'auth' 
  | 'middleware' 
  | 'api' 
  | 'database' 
  | 'unsplash' 
  | 'chat' 
  | 'aulas' 
  | 'enem' 
  | 'general'

interface LogConfig {
  level: LogLevel
  categories: LogCategory[]
  enableEmojis: boolean
  enableTimestamps: boolean
  enableColors: boolean
}

class Logger {
  private config: LogConfig
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    
    // Configuração padrão
    this.config = {
      level: this.isDevelopment ? 'debug' : 'error',
      categories: this.isDevelopment ? [
        'auth', 'middleware', 'api', 'database', 'unsplash', 'chat', 'aulas', 'enem', 'general'
      ] : ['error'],
      enableEmojis: this.isDevelopment,
      enableTimestamps: this.isDevelopment,
      enableColors: this.isDevelopment
    }

    // Permitir override via variáveis de ambiente
    this.loadConfigFromEnv()
  }

  private loadConfigFromEnv() {
    // Nível de log
    if (process.env.LOG_LEVEL) {
      this.config.level = process.env.LOG_LEVEL as LogLevel
    }

    // Categorias habilitadas
    if (process.env.LOG_CATEGORIES) {
      this.config.categories = process.env.LOG_CATEGORIES.split(',') as LogCategory[]
    }

    // Configurações específicas
    if (process.env.DEBUG_UNSPLASH_SCORES === 'true') {
      this.config.categories.push('unsplash')
    }

    if (process.env.DEBUG_AUTH === 'true') {
      this.config.categories.push('auth')
    }

    if (process.env.DEBUG_MIDDLEWARE === 'true') {
      this.config.categories.push('middleware')
    }
  }

  private shouldLog(level: LogLevel, category: LogCategory): boolean {
    if (!this.isDevelopment && level !== 'error') {
      return false
    }

    const levelPriority = { error: 0, warn: 1, info: 2, debug: 3 }
    const currentLevelPriority = levelPriority[this.config.level]
    const messageLevelPriority = levelPriority[level]

    return messageLevelPriority <= currentLevelPriority && 
           this.config.categories.includes(category)
  }

  private formatMessage(level: LogLevel, category: LogCategory, message: string, data?: any): string {
    let formattedMessage = ''

    // Timestamp
    if (this.config.enableTimestamps) {
      formattedMessage += `[${new Date().toISOString()}] `
    }

    // Emoji e categoria
    if (this.config.enableEmojis) {
      const emojis = {
        error: '❌',
        warn: '⚠️',
        info: 'ℹ️',
        debug: '🔍'
      }
      formattedMessage += `${emojis[level]} `
    }

    // Categoria
    formattedMessage += `[${category.toUpperCase()}] `

    // Mensagem
    formattedMessage += message

    return formattedMessage
  }

  private log(level: LogLevel, category: LogCategory, message: string, data?: any) {
    if (!this.shouldLog(level, category)) {
      return
    }

    const formattedMessage = this.formatMessage(level, category, message, data)
    
    switch (level) {
      case 'error':
        console.error(formattedMessage, data || '')
        break
      case 'warn':
        console.warn(formattedMessage, data || '')
        break
      case 'info':
        console.info(formattedMessage, data || '')
        break
      case 'debug':
        console.log(formattedMessage, data || '')
        break
    }
  }

  // Métodos públicos
  error(category: LogCategory, message: string, data?: any) {
    this.log('error', category, message, data)
  }

  warn(category: LogCategory, message: string, data?: any) {
    this.log('warn', category, message, data)
  }

  info(category: LogCategory, message: string, data?: any) {
    this.log('info', category, message, data)
  }

  debug(category: LogCategory, message: string, data?: any) {
    this.log('debug', category, message, data)
  }

  // Métodos específicos por categoria
  auth = {
    error: (message: string, data?: any) => this.error('auth', message, data),
    warn: (message: string, data?: any) => this.warn('auth', message, data),
    info: (message: string, data?: any) => this.info('auth', message, data),
    debug: (message: string, data?: any) => this.debug('auth', message, data),
  }

  middleware = {
    error: (message: string, data?: any) => this.error('middleware', message, data),
    warn: (message: string, data?: any) => this.warn('middleware', message, data),
    info: (message: string, data?: any) => this.info('middleware', message, data),
    debug: (message: string, data?: any) => this.debug('middleware', message, data),
  }

  api = {
    error: (message: string, data?: any) => this.error('api', message, data),
    warn: (message: string, data?: any) => this.warn('api', message, data),
    info: (message: string, data?: any) => this.info('api', message, data),
    debug: (message: string, data?: any) => this.debug('api', message, data),
  }

  database = {
    error: (message: string, data?: any) => this.error('database', message, data),
    warn: (message: string, data?: any) => this.warn('database', message, data),
    info: (message: string, data?: any) => this.info('database', message, data),
    debug: (message: string, data?: any) => this.debug('database', message, data),
  }

  unsplash = {
    error: (message: string, data?: any) => this.error('unsplash', message, data),
    warn: (message: string, data?: any) => this.warn('unsplash', message, data),
    info: (message: string, data?: any) => this.info('unsplash', message, data),
    debug: (message: string, data?: any) => this.debug('unsplash', message, data),
  }

  chat = {
    error: (message: string, data?: any) => this.error('chat', message, data),
    warn: (message: string, data?: any) => this.warn('chat', message, data),
    info: (message: string, data?: any) => this.info('chat', message, data),
    debug: (message: string, data?: any) => this.debug('chat', message, data),
  }

  aulas = {
    error: (message: string, data?: any) => this.error('aulas', message, data),
    warn: (message: string, data?: any) => this.warn('aulas', message, data),
    info: (message: string, data?: any) => this.info('aulas', message, data),
    debug: (message: string, data?: any) => this.debug('aulas', message, data),
  }

  enem = {
    error: (message: string, data?: any) => this.error('enem', message, data),
    warn: (message: string, data?: any) => this.warn('enem', message, data),
    info: (message: string, data?: any) => this.info('enem', message, data),
    debug: (message: string, data?: any) => this.debug('enem', message, data),
  }

  general = {
    error: (message: string, data?: any) => this.error('general', message, data),
    warn: (message: string, data?: any) => this.warn('general', message, data),
    info: (message: string, data?: any) => this.info('general', message, data),
    debug: (message: string, data?: any) => this.debug('general', message, data),
  }
}

// Instância singleton
export const logger = new Logger()

// Export para compatibilidade com código existente
export default logger
