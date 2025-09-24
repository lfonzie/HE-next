// Configuração dos provedores de IA para geração de aulas
export const AI_PROVIDERS = {
  gemini: {
    name: 'gemini',
    model: 'gemini-2.0-flash-exp',
    priority: 1,
    timeout: 60000, // 1 minuto
    description: 'Google Gemini - Rápido e eficiente',
    fallbackReason: 'Modelo sobrecarregado ou indisponível'
  },
  'gpt-4o-mini': {
    name: 'gpt-4o-mini',
    model: 'gpt-4o-mini',
    priority: 2,
    timeout: 90000, // 1.5 minutos
    description: 'OpenAI GPT-4o Mini - Equilibrio entre velocidade e qualidade',
    fallbackReason: 'Modelo principal indisponível'
  },
  'gpt-5': {
    name: 'gpt-5',
    model: 'gpt-5',
    priority: 3,
    timeout: 120000, // 2 minutos
    description: 'OpenAI GPT-5 - Máxima qualidade e capacidade',
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