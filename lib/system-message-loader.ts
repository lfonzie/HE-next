// lib/system-message-loader.ts
// Sistema para carregar prompts específicos do arquivo system-message.json

import fs from 'fs'
import path from 'path'

export interface SystemMessageConfig {
  name: string
  description: string
  system_prompt: string
  temperature: number
  max_tokens: number
  max_completion_tokens: number
  tone: string
  is_active: boolean
}

export interface SystemMessagesConfig {
  [module: string]: SystemMessageConfig
}

// Cache para evitar leitura repetida do arquivo
let systemMessagesCache: SystemMessagesConfig | null = null
let lastModified: number = 0

/**
 * Carrega as configurações de mensagens do sistema do arquivo JSON
 */
export function loadSystemMessages(): SystemMessagesConfig {
  const filePath = path.join(process.cwd(), 'system-message.json')
  
  try {
    // Verificar se o arquivo foi modificado
    const stats = fs.statSync(filePath)
    const currentModified = stats.mtime.getTime()
    
    // Se o arquivo não foi modificado e temos cache, retornar cache
    if (systemMessagesCache && currentModified === lastModified) {
      return systemMessagesCache
    }
    
    // Ler arquivo JSON
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const config = JSON.parse(fileContent) as SystemMessagesConfig
    
    // Atualizar cache
    systemMessagesCache = config
    lastModified = currentModified
    
    console.log('✅ System messages loaded from JSON file')
    return config
    
  } catch (error) {
    console.error('❌ Error loading system messages:', error)
    
    // Retornar configuração padrão em caso de erro
    return getDefaultSystemMessages()
  }
}

/**
 * Obtém o prompt do sistema para um módulo específico
 */
export function getSystemPrompt(module: string = 'professor'): string {
  const config = loadSystemMessages()
  
  // Primeiro, tentar encontrar no chat_modules
  const chatModuleConfig = config.chat_modules?.[module]
  if (chatModuleConfig && chatModuleConfig.is_active) {
    return chatModuleConfig.system_prompt
  }
  
  // Se não encontrou, tentar em outras categorias
  const allCategories = ['classification', 'api_routes', 'interactive_lessons', 'specialized_features']
  for (const category of allCategories) {
    const categoryConfig = config[category]?.[module]
    if (categoryConfig && categoryConfig.is_active) {
      return categoryConfig.system_prompt
    }
  }
  
  // Fallback para módulo padrão
  const defaultConfig = config.chat_modules?.default || config.chat_modules?.professor
  return defaultConfig?.system_prompt || 'Você é um assistente educacional.'
}

/**
 * Obtém a configuração completa de um módulo
 */
export function getModuleConfig(module: string): SystemMessageConfig | null {
  const config = loadSystemMessages()
  
  // Buscar em todas as categorias
  const allCategories = ['chat_modules', 'classification', 'api_routes', 'interactive_lessons', 'specialized_features']
  for (const category of allCategories) {
    const categoryConfig = config[category]?.[module]
    if (categoryConfig) {
      return categoryConfig
    }
  }
  
  return null
}

/**
 * Obtém todos os módulos disponíveis
 */
export function getAvailableModules(): string[] {
  const config = loadSystemMessages()
  const modules: string[] = []
  
  // Coletar módulos de todas as categorias
  const allCategories = ['chat_modules', 'classification', 'api_routes', 'interactive_lessons', 'specialized_features']
  for (const category of allCategories) {
    if (config[category]) {
      modules.push(...Object.keys(config[category]))
    }
  }
  
  return [...new Set(modules)] // Remove duplicatas
}

/**
 * Obtém configuração padrão em caso de erro
 */
function getDefaultSystemMessages(): SystemMessagesConfig {
  return {
    chat_modules: {
      professor: {
        name: 'Professor',
        description: 'Assistente educacional',
        system_prompt: 'Você é um assistente educacional especializado em ajudar estudantes brasileiros.',
        temperature: 0.7,
        max_tokens: 1000,
        max_completion_tokens: 800,
        tone: 'motivacional',
        is_active: true
      },
      default: {
        name: 'Assistente Geral',
        description: 'Assistente educacional inteligente',
        system_prompt: 'Você é um assistente educacional inteligente.',
        temperature: 0.7,
        max_tokens: 800,
        max_completion_tokens: 600,
        tone: 'educativo',
        is_active: true
      }
    }
  }
}

/**
 * Força o reload do cache (útil para desenvolvimento)
 */
export function reloadSystemMessages(): void {
  systemMessagesCache = null
  lastModified = 0
  console.log('🔄 System messages cache cleared')
}

/**
 * Valida se um módulo existe e está ativo
 */
export function isModuleActive(module: string): boolean {
  const config = loadSystemMessages()
  const moduleConfig = config[module]
  return moduleConfig ? moduleConfig.is_active : false
}

/**
 * Obtém configurações de temperatura e tokens para um módulo
 */
export function getModuleSettings(module: string): {
  temperature: number
  max_tokens: number
  max_completion_tokens: number
} {
  const config = loadSystemMessages()
  const moduleConfig = config[module] || config.default || config.professor
  
  return {
    temperature: moduleConfig?.temperature || 0.7,
    max_tokens: moduleConfig?.max_tokens || 800,
    max_completion_tokens: moduleConfig?.max_completion_tokens || 600
  }
}
