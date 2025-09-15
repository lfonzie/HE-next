// lib/ai-router/index.ts
// Ponto de entrada principal do sistema de roteamento multi-fornecedor

export * from './types';
export * from './provider-registry';
export * from './feature-extractor';
export * from './model-router';
export * from './safety-layer';
export * from './ai-router';

// Re-exportar instâncias principais para facilitar o uso
export { 
  aiRouter
} from './ai-router';
