// Otimizações para streaming mais rápido

export interface StreamingConfig {
  maxTokens: number;
  temperature: number;
  model: string;
  enableOptimizations: boolean;
}

// Configurações otimizadas por tipo de módulo
export const OPTIMIZED_STREAMING_CONFIGS = {
  professor: {
    maxTokens: 800,
    temperature: 0.6,
    model: 'gpt-4o-mini',
    enableOptimizations: true
  },
  enem: {
    maxTokens: 600,
    temperature: 0.5,
    model: 'gpt-4o-mini',
    enableOptimizations: true
  },
  aula_interativa: {
    maxTokens: 1000,
    temperature: 0.7,
    model: 'gpt-4o-mini',
    enableOptimizations: true
  },
  ti: {
    maxTokens: 400,
    temperature: 0.3,
    model: 'gpt-4o-mini',
    enableOptimizations: true
  },
  financeiro: {
    maxTokens: 300,
    temperature: 0.2,
    model: 'gpt-4o-mini',
    enableOptimizations: true
  },
  default: {
    maxTokens: 600,
    temperature: 0.5,
    model: 'gpt-4o-mini',
    enableOptimizations: true
  }
};

export function getOptimizedStreamingConfig(module: string): StreamingConfig {
  return OPTIMIZED_STREAMING_CONFIGS[module as keyof typeof OPTIMIZED_STREAMING_CONFIGS] || 
         OPTIMIZED_STREAMING_CONFIGS.default;
}

// Função para otimizar mensagens antes do streaming
export function optimizeMessagesForStreaming(messages: any[]): any[] {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content?.substring(0, 2000) // Limitar tamanho para streaming mais rápido
  }));
}

// Função para configurar headers otimizados
export function getOptimizedHeaders(module: string, provider: string, model: string) {
  return {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Provider': provider,
    'X-Model': model,
    'X-Module': module,
    'X-Optimized': 'true',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  };
}
