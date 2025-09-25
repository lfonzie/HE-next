// lib/system-prompts/index.ts
export * from './classification';
export * from './professor';
export * from './enem';
export * from './support';
export * from './ti';
export * from './lessons';
export * from './common';
export * from './unified-config';
export * from './utils';
export * from './api-routes';
export * from './modules';
export * from './features';

// Re-export principais para facilitar uso
export { 
  UNIFIED_SYSTEM_PROMPTS, 
  getUnifiedSystemPrompt, 
  getUnifiedPromptsByType, 
  getUnifiedActivePrompts, 
  getUnifiedPromptsByModule 
} from './unified-config';
export { 
  promptManager, 
  SystemPromptManager, 
  formatPromptContent, 
  sanitizePromptContent, 
  validatePromptContent 
} from './utils';
export { 
  addUnicodeInstructions,
  UNICODE_INSTRUCTIONS,
  DEFAULT_SYSTEM_PROMPT 
} from './common';

// Re-export das novas categorias
export { 
  API_ROUTE_SYSTEM_PROMPTS, 
  getApiRouteSystemPrompt, 
  API_ROUTE_KEYS 
} from './api-routes';
export { 
  MODULE_SYSTEM_PROMPTS, 
  getModuleSystemPrompt, 
  MODULE_KEYS 
} from './modules';
export { 
  FEATURE_SYSTEM_PROMPTS, 
  getFeatureSystemPrompt, 
  FEATURE_KEYS 
} from './features';
