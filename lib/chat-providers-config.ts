/**
 * Configuração específica dos providers para o chat
 * Modelos especificados pelo usuário:
 * - Grok: Grok 4 Fast Reasoning (PADRÃO para ENEM e Redação)
 * - Google: Gemini 1.5 e 2.0 Flash
 * - OpenAI: GPT-4o-mini e GPT-5 Chat Latest
 * - Perplexity: Sonar (para busca na web)
 */

import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { perplexity } from '@ai-sdk/perplexity'
import { grok } from '@/lib/providers/grok-ai-sdk'

export interface ChatProviderConfig {
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
  description: string
  useCase: string
}

export const CHAT_PROVIDERS: Record<string, ChatProviderConfig> = {
  grok: {
    id: 'grok',
    name: 'Grok 4 Fast Reasoning',
    priority: 0,
    enabled: true,
    apiKey: process.env.GROK_API_KEY,
    createClient: (model: string) => grok(model),
    models: {
      simple: 'grok-4-fast-reasoning',
      complex: 'grok-4-fast-reasoning',
      fast: 'grok-4-fast-reasoning'
    },
    timeout: 30000,
    maxRetries: 3,
    description: 'Grok 4 Fast Reasoning - Ultra-rápido e eficiente',
    useCase: 'ENEM, Redação, conversas rápidas, raciocínio avançado, respostas instantâneas'
  },

  openai: {
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
    maxRetries: 3,
    description: 'OpenAI GPT - Alta qualidade para tarefas complexas',
    useCase: 'Tarefas complexas, análise detalhada, ENEM'
  },

  google: {
    id: 'google',
    name: 'Google Gemini',
    priority: 2,
    enabled: true,
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || 
            process.env.GOOGLE_GEMINI_API_KEY || 
            process.env.GOOGLE_API_KEY,
    createClient: (model: string) => google(model),
    models: {
      simple: 'gemini-2.0-flash-exp',
      complex: 'gemini-2.0-flash-exp',
      fast: 'gemini-2.0-flash-exp'
    },
    timeout: 45000,
    maxRetries: 3,
    description: 'Google Gemini - Rápido e eficiente para conversas',
    useCase: 'Conversas gerais, aulas, explicações'
  },

  perplexity: {
    id: 'perplexity',
    name: 'Perplexity Sonar',
    priority: 3,
    enabled: true,
    apiKey: process.env.PERPLEXITY_API_KEY,
    createClient: (model: string) => perplexity(model),
    models: {
      simple: 'sonar',
      complex: 'sonar',
      fast: 'sonar'
    },
    timeout: 45000,
    maxRetries: 2,
    description: 'Perplexity Sonar - Para busca na web em tempo real',
    useCase: 'Busca na web, informações atualizadas, pesquisa em tempo real'
  }
}

/**
 * Seleciona o provider baseado no módulo/página
 * Prioriza Grok 4 Fast Reasoning para ENEM e Redação
 */
export function selectProviderByModule(module: string): ChatProviderConfig | null {
  // Módulos que devem usar Grok 4 Fast Reasoning
  const grokModules = ['enem', 'redacao', 'simulador'];
  
  if (grokModules.includes(module.toLowerCase()) && CHAT_PROVIDERS.grok.enabled) {
    console.log(`🎯 [PROVIDER-SELECTION] Using Grok 4 Fast Reasoning for module: ${module}`);
    return CHAT_PROVIDERS.grok;
  }
  
  // Para outros módulos, usar a lógica padrão
  const enabledProviders = Object.values(CHAT_PROVIDERS)
    .filter(provider => provider.enabled)
    .sort((a, b) => a.priority - b.priority);
  
  return enabledProviders[0] || null;
}

/**
 * Obtém o provider configurado para um módulo específico
 */
export function getProviderForModule(module: string, complexity: 'simple' | 'complex' | 'fast' = 'fast'): {
  provider: ChatProviderConfig;
  model: string;
} | null {
  const selectedProvider = selectProviderByModule(module);
  
  if (!selectedProvider) {
    return null;
  }
  
  return {
    provider: selectedProvider,
    model: selectedProvider.models[complexity]
  };
}

/**
 * Seleciona o melhor provider baseado na complexidade e contexto
 */
export function selectChatProvider(
  complexity: 'simple' | 'complex' | 'fast',
  context?: {
    module?: string
    requiresWebSearch?: boolean
    requiresLatestInfo?: boolean
  }
): ChatProviderConfig | null {
  // Se precisa de busca na web ou informações atualizadas, usar Perplexity
  if (context?.requiresWebSearch || context?.requiresLatestInfo) {
    const provider = CHAT_PROVIDERS.perplexity
    if (provider.enabled && provider.apiKey) {
      return provider
    }
  }

  // Para módulos específicos, usar provider preferido
  if (context?.module) {
    const modulePreferences: Record<string, string> = {
      'enem': 'grok',
      'redacao': 'grok',
      'simulador': 'grok',
      'professor': 'google',
      'aula_interativa': 'google',
      'financeiro': 'openai',
      'social_media': 'perplexity',
      'atendimento': 'openai'
    }

    const preferredProvider = modulePreferences[context.module]
    if (preferredProvider && CHAT_PROVIDERS[preferredProvider]?.enabled) {
      return CHAT_PROVIDERS[preferredProvider]
    }
  }

  // Seleção baseada na complexidade
  const providerOrder = {
    simple: ['grok', 'google', 'openai', 'perplexity'],
    complex: ['grok', 'openai', 'google', 'perplexity'],
    fast: ['grok', 'google', 'perplexity', 'openai']
  }

  const order = providerOrder[complexity]
  for (const providerId of order) {
    const provider = CHAT_PROVIDERS[providerId]
    if (provider?.enabled && provider.apiKey) {
      return provider
    }
  }

  return null
}

/**
 * Obtém todos os providers disponíveis
 */
export function getAvailableChatProviders(): ChatProviderConfig[] {
  return Object.values(CHAT_PROVIDERS)
    .filter(provider => provider.enabled && provider.apiKey)
    .sort((a, b) => a.priority - b.priority)
}

/**
 * Verifica se um provider está disponível
 */
export function isChatProviderAvailable(providerId: string): boolean {
  const provider = CHAT_PROVIDERS[providerId]
  return provider?.enabled && !!provider.apiKey
}

/**
 * Obtém configuração de um provider específico
 */
export function getChatProviderConfig(providerId: string): ChatProviderConfig | null {
  return CHAT_PROVIDERS[providerId] || null
}

/**
 * Lista todos os modelos disponíveis
 */
export function getAllAvailableModels(): string[] {
  const models: string[] = []
  
  Object.values(CHAT_PROVIDERS).forEach(provider => {
    if (provider.enabled && provider.apiKey) {
      models.push(...Object.values(provider.models))
    }
  })
  
  return [...new Set(models)] // Remove duplicatas
}

export default CHAT_PROVIDERS
