// lib/beta-system-config.ts
// Configuração do Sistema Beta - SEMPRE ATIVADO

export const BETA_SYSTEM_CONFIG = {
  // ✅ SISTEMA BETA SEMPRE ATIVADO
  enabled: true,
  
  // Configurações do Gemini
  gemini: {
    model: 'gemini-2.5-flash-image-preview', // Modelo correto para geração de imagens
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    maxRetries: 3,
    timeout: 30000
  },
  
  // Slides que devem ter imagens
  imageSlides: [1, 3, 6, 8, 11, 14],
  
  // Configurações de prompts
  prompts: {
    language: 'english',
    translationEnabled: true,
    optimizationEnabled: true
  },
  
  // Sistema de fallback
  fallback: {
    enabled: true,
    placeholderImages: {
      1: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop&crop=center',
      3: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop&crop=center',
      6: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
      8: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&crop=center',
      11: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&crop=center',
      14: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&crop=center'
    }
  },
  
  // URLs dos sistemas antigos (desativados)
  deprecatedEndpoints: [
    '/api/aulas/generate-gemini',
    '/api/aulas/generate-simple', 
    '/api/aulas/generate-grok',
    '/api/aulas/generate-ai-sdk'
  ],
  
  // Novo endpoint principal
  newEndpoint: '/api/aulas/generate-with-gemini-images',
  
  // Configurações de redirecionamento
  redirect: {
    enabled: true,
    statusCode: 410, // Gone - recurso não está mais disponível
    message: 'Sistema antigo desativado. Use o novo sistema beta.'
  }
};

// Função para verificar se o sistema beta está ativo
export function isBetaSystemActive(): boolean {
  return BETA_SYSTEM_CONFIG.enabled && !!BETA_SYSTEM_CONFIG.gemini.apiKey;
}

// Função para obter configuração do sistema beta
export function getBetaSystemConfig() {
  return {
    ...BETA_SYSTEM_CONFIG,
    isActive: isBetaSystemActive(),
    timestamp: new Date().toISOString()
  };
}

// Função para validar se um endpoint está desativado
export function isDeprecatedEndpoint(endpoint: string): boolean {
  return BETA_SYSTEM_CONFIG.deprecatedEndpoints.includes(endpoint);
}

// Função para obter URL de redirecionamento
export function getRedirectUrl(): string {
  return BETA_SYSTEM_CONFIG.newEndpoint;
}

// Mensagem de sistema desativado
export const DEPRECATED_SYSTEM_MESSAGE = {
  error: 'Sistema antigo desativado. Use o novo sistema beta.',
  redirectUrl: BETA_SYSTEM_CONFIG.newEndpoint,
  message: 'Este endpoint foi desativado. Use o novo sistema beta.',
  betaSystem: 'ATIVADO',
  newFeatures: [
    'Geração automática de imagens com Google Gemini',
    'Prompts otimizados em inglês',
    'Sistema de fallback inteligente',
    'Estruturação completa em JSON',
    'Slides selecionados: 1, 3, 6, 8, 11, 14'
  ]
};

export default BETA_SYSTEM_CONFIG;
