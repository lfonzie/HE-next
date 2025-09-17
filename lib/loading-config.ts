'use client';

// Configurações do sistema de loading baseadas em variáveis de ambiente
export const loadingConfig = {
  // Configurações gerais
  enabled: process.env.NEXT_PUBLIC_LOADING_ENABLED === 'true' || true,
  duration: parseInt(process.env.NEXT_PUBLIC_LOADING_DURATION || '1500'),
  showProgress: process.env.NEXT_PUBLIC_LOADING_SHOW_PROGRESS === 'true' || false,
  animationEnabled: process.env.NEXT_PUBLIC_LOADING_ANIMATION_ENABLED !== 'false',
  backdropBlur: process.env.NEXT_PUBLIC_LOADING_BACKDROP_BLUR !== 'false',
  autoHide: process.env.NEXT_PUBLIC_LOADING_AUTO_HIDE !== 'false',
  timeout: parseInt(process.env.NEXT_PUBLIC_LOADING_TIMEOUT || '5000'),

  // Configurações de transição de página
  pageTransition: {
    enabled: process.env.NEXT_PUBLIC_PAGE_TRANSITION_ENABLED === 'true' || true,
    duration: parseInt(process.env.NEXT_PUBLIC_PAGE_TRANSITION_DURATION || '1000'),
    type: (process.env.NEXT_PUBLIC_PAGE_TRANSITION_TYPE || 'overlay') as 'overlay' | 'fullscreen',
    defaultMessage: process.env.NEXT_PUBLIC_PAGE_TRANSITION_MESSAGE || 'Carregando página...',
  },

  // Mensagens específicas por contexto
  messages: {
    chat: process.env.NEXT_PUBLIC_LOADING_MESSAGE_CHAT || 'Carregando chat...',
    enem: process.env.NEXT_PUBLIC_LOADING_MESSAGE_ENEM || 'Carregando simulador ENEM...',
    aulas: process.env.NEXT_PUBLIC_LOADING_MESSAGE_AULAS || 'Carregando aulas...',
    login: process.env.NEXT_PUBLIC_LOADING_MESSAGE_LOGIN || 'Fazendo login...',
    navigation: process.env.NEXT_PUBLIC_LOADING_MESSAGE_NAVIGATION || 'Navegando...',
    redirect: process.env.NEXT_PUBLIC_LOADING_MESSAGE_REDIRECT || 'Redirecionando...',
  },

  // Configurações de performance
  performance: {
    optimize: process.env.NEXT_PUBLIC_LOADING_OPTIMIZE_PERFORMANCE !== 'false',
    reducedMotion: process.env.NEXT_PUBLIC_LOADING_REDUCED_MOTION === 'true',
    prefetchEnabled: process.env.NEXT_PUBLIC_LOADING_PREFETCH_ENABLED !== 'false',
  },

  // Configurações de debug
  debug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true' || false,
};

// Função para obter mensagem baseada no contexto
export function getLoadingMessage(context: keyof typeof loadingConfig.messages): string {
  return loadingConfig.messages[context] || loadingConfig.pageTransition.defaultMessage;
}

// Função para verificar se o loading está habilitado
export function isLoadingEnabled(): boolean {
  return loadingConfig.enabled;
}

// Função para obter configurações de transição
export function getTransitionConfig() {
  return loadingConfig.pageTransition;
}

// Função para obter configurações de performance
export function getPerformanceConfig() {
  return loadingConfig.performance;
}

// Configurações padrão caso as variáveis de ambiente não estejam definidas
export const defaultLoadingConfig = {
  enabled: true,
  duration: 1500,
  showProgress: false,
  animationEnabled: true,
  backdropBlur: true,
  autoHide: true,
  timeout: 5000,
  pageTransition: {
    enabled: true,
    duration: 1000,
    type: 'overlay' as const,
    defaultMessage: 'Carregando página...',
  },
  messages: {
    chat: 'Carregando chat...',
    enem: 'Carregando simulador ENEM...',
    aulas: 'Carregando aulas...',
    login: 'Fazendo login...',
    navigation: 'Navegando...',
    redirect: 'Redirecionando...',
  },
  performance: {
    optimize: true,
    reducedMotion: false,
    prefetchEnabled: true,
  },
  debug: false,
};

