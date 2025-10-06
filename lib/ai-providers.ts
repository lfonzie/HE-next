// Configuração dos provedores de IA para geração de aulas - Grok 4 Fast como padrão
export const AI_PROVIDERS = {
  grok: {
    name: 'grok',
    model: 'grok-4-fast-reasoning',
    priority: 0,
    timeout: 15000, // 15 segundos
    description: 'Grok 4 Fast Reasoning - Ultra-rápido e eficiente',
    fallbackReason: 'Modelo sobrecarregado ou indisponível'
  },
  openai: {
    name: 'openai',
    model: 'gpt-4o-mini',
    priority: 1,
    timeout: 30000, // 30 segundos
    description: 'OpenAI GPT-4o Mini - Alta qualidade e confiabilidade',
    fallbackReason: 'Modelo principal indisponível'
  },
  google: {
    name: 'google',
    model: 'gemini-2.0-flash-exp',
    priority: 2,
    timeout: 60000, // 1 minuto
    description: 'Google Gemini 2.0 Flash - Rápido e eficiente',
    fallbackReason: 'Modelo sobrecarregado ou indisponível'
  },
  perplexity: {
    name: 'perplexity',
    model: 'sonar',
    priority: 3,
    timeout: 120000, // 2 minutos
    description: 'Perplexity Sonar - Para busca na web em tempo real',
    fallbackReason: 'Provedores anteriores falharam'
  }
} as const;

export type AIProvider = keyof typeof AI_PROVIDERS;

// Configurações de fallback
export const FALLBACK_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 segundo entre tentativas
  timeoutMultiplier: 1.5, // Multiplicador de timeout para retries
  logLevel: 'info' as const
};

// Métricas de performance dos provedores
export const PROVIDER_METRICS = {
  gemini: {
    averageResponseTime: 30000, // 30 segundos
    successRate: 0.95,
    costPerToken: 0.000001
  },
  'gpt-4o-mini': {
    averageResponseTime: 45000, // 45 segundos
    successRate: 0.98,
    costPerToken: 0.000002
  },
  'gpt-5': {
    averageResponseTime: 60000, // 60 segundos
    successRate: 0.99,
    costPerToken: 0.000005
  }
} as const;

// Função para obter provedores disponíveis
export function getAvailableProviders(): AIProvider[] {
  return Object.keys(AI_PROVIDERS) as AIProvider[];
}

// Configuração de modelos por provedor
export const PROVIDER_MODELS = {
  google: ['gemini-2.0-flash-exp'],
  openai: ['gpt-4o-mini', 'gpt-4o'],
  anthropic: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229']
} as const;