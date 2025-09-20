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
