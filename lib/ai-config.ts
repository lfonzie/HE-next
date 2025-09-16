// AI Configuration for HubEdu.ai
// Uses GPT-4o-mini as default and GPT-5 for complex tasks

export interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface TaskComplexity {
  level: 'simple' | 'complex';
  confidence: number;
  rationale: string;
}

// Model configurations
export const AI_MODELS = {
  'gpt-4o-mini': {
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    costPer1kTokens: 0.00015, // Input tokens
    costPer1kOutputTokens: 0.0006, // Output tokens
  },
  'gpt-5-chat-latest': {
    model: 'gpt-5-chat-latest',
    temperature: 0.7,
    maxTokens: 4000,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    costPer1kTokens: 0.0025, // Input tokens (estimated)
    costPer1kOutputTokens: 0.01, // Output tokens (estimated)
  },
  'gemini-2.0-flash-exp': {
    model: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    maxTokens: 4000,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    costPer1kTokens: 0.00075, // Input tokens (estimated)
    costPer1kOutputTokens: 0.003, // Output tokens (estimated)
  },
  'gemini-1.5-pro': {
    model: 'gemini-1.5-pro',
    temperature: 0.7,
    maxTokens: 4000,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    costPer1kTokens: 0.00125, // Input tokens
    costPer1kOutputTokens: 0.005, // Output tokens
  },
  'gemini-1.5-flash': {
    model: 'gemini-1.5-flash',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    costPer1kTokens: 0.000075, // Input tokens
    costPer1kOutputTokens: 0.0003, // Output tokens
  }
} as const;

// Module-specific configurations
export const MODULE_AI_CONFIGS = {
  'professor': {
    defaultModel: 'gpt-4o-mini',
    complexModel: 'gpt-5-chat-latest',
    temperature: 0.7,
    maxTokens: 2000,
  },
  'aula-expandida': {
    defaultModel: 'gpt-4o-mini',
    complexModel: 'gpt-5-chat-latest',
    temperature: 0.8,
    maxTokens: 3000,
  },
  'enem-interativo': {
    defaultModel: 'gpt-4o-mini',
    complexModel: 'gpt-5-chat-latest',
    temperature: 0.6,
    maxTokens: 1500,
  },
  'enem': {
    defaultModel: 'gpt-4o-mini',
    complexModel: 'gpt-5-chat-latest',
    temperature: 0.6,
    maxTokens: 1500,
  },
  'ti': {
    defaultModel: 'gpt-4o-mini',
    complexModel: 'gpt-5-chat-latest',
    temperature: 0.5,
    maxTokens: 1000,
  },
  'atendimento': {
    defaultModel: 'gpt-4o-mini',
    complexModel: 'gpt-5-chat-latest',
    temperature: 0.7,
    maxTokens: 1000,
  },
  'coordenacao': {
    defaultModel: 'gpt-4o-mini',
    complexModel: 'gpt-5-chat-latest',
    temperature: 0.7,
    maxTokens: 1500,
  },
  'social-media': {
    defaultModel: 'gpt-4o-mini',
    complexModel: 'gpt-5-chat-latest',
    temperature: 0.8,
    maxTokens: 1000,
  },
  'bem-estar': {
    defaultModel: 'gpt-4o-mini',
    complexModel: 'gpt-5-chat-latest',
    temperature: 0.8,
    maxTokens: 1500,
  },
  'rh': {
    defaultModel: 'gpt-4o-mini',
    complexModel: 'gpt-5-chat-latest',
    temperature: 0.6,
    maxTokens: 1500,
  },
  'financeiro': {
    defaultModel: 'gpt-4o-mini',
    complexModel: 'gpt-5-chat-latest',
    temperature: 0.5,
    maxTokens: 1000,
  },
  'secretaria': {
    defaultModel: 'gpt-4o-mini',
    complexModel: 'gpt-5-chat-latest',
    temperature: 0.6,
    maxTokens: 1000,
  }
} as const;

// Function to determine task complexity
export function analyzeTaskComplexity(text: string, module: string): TaskComplexity {
  const lowerText = text.toLowerCase();
  
  // Keywords that indicate complex tasks
  const complexKeywords = [
    // Educational complexity
    'explicação detalhada', 'análise profunda', 'conceito avançado', 'teoria complexa',
    'múltiplas etapas', 'processo completo', 'metodologia', 'abordagem sistemática',
    
    // ENEM complexity
    'simulado completo', 'prova inteira', 'análise de performance', 'relatório detalhado',
    'explicação de cada questão', 'feedback personalizado', 'análise estatística',
    
    // Aula complexity
    'aula completa', 'conteúdo expandido', 'múltiplos slides', 'exercícios práticos',
    'exemplos detalhados', 'material de apoio', 'avaliação formativa',
    
    // Technical complexity
    'diagnóstico completo', 'solução passo a passo', 'troubleshooting avançado',
    'configuração complexa', 'análise técnica', 'relatório de problemas',
    
    // Administrative complexity
    'relatório completo', 'análise de dados', 'processo administrativo',
    'documentação detalhada', 'procedimento completo', 'análise de políticas'
  ];
  
  // Keywords that indicate simple tasks
  const simpleKeywords = [
    'pergunta simples', 'dúvida básica', 'informação rápida', 'resposta curta',
    'sim/não', 'simples', 'básico', 'rápido', 'breve', 'resumo'
  ];
  
  // Count complex vs simple indicators
  const complexCount = complexKeywords.filter(keyword => lowerText.includes(keyword)).length;
  const simpleCount = simpleKeywords.filter(keyword => lowerText.includes(keyword)).length;
  
  // Length-based complexity
  const lengthComplexity = text.length > 200 ? 0.3 : 0.1;
  
  // Module-based complexity adjustment
  const moduleComplexity = {
    'professor': 0.2,
    'aula-expandida': 0.4,
    'enem-interativo': 0.3,
    'enem': 0.2,
    'ti': 0.1,
    'atendimento': 0.0,
    'coordenacao': 0.1,
    'social-media': 0.0,
    'bem-estar': 0.1,
    'rh': 0.1,
    'financeiro': 0.1,
    'secretaria': 0.0
  }[module] || 0.0;
  
  // Calculate final complexity score
  const complexityScore = Math.min(
    (complexCount * 0.3) + lengthComplexity + moduleComplexity - (simpleCount * 0.2),
    1.0
  );
  
  const isComplex = complexityScore > 0.5;
  
  return {
    level: isComplex ? 'complex' : 'simple',
    confidence: Math.abs(complexityScore - 0.5) * 2, // Convert to 0-1 confidence
    rationale: isComplex 
      ? `Task requires advanced reasoning (score: ${complexityScore.toFixed(2)})`
      : `Task can be handled with standard processing (score: ${complexityScore.toFixed(2)})`
  };
}

// Function to get AI configuration for a task
export function getAIConfig(module: string, text: string): AIConfig {
  const moduleConfig = MODULE_AI_CONFIGS[module as keyof typeof MODULE_AI_CONFIGS];
  if (!moduleConfig) {
    // Default fallback
    return {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 1500
    };
  }
  
  const complexity = analyzeTaskComplexity(text, module);
  const modelKey = complexity.level === 'complex' ? 'complexModel' : 'defaultModel';
  const selectedModel = moduleConfig[modelKey];
  
  return {
    model: selectedModel,
    temperature: moduleConfig.temperature,
    maxTokens: moduleConfig.maxTokens,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0
  };
}

// Function to estimate cost for a request
export function estimateCost(config: AIConfig, inputTokens: number, outputTokens: number): number {
  const modelConfig = AI_MODELS[config.model as keyof typeof AI_MODELS];
  if (!modelConfig) return 0;
  
  const inputCost = (inputTokens / 1000) * modelConfig.costPer1kTokens;
  const outputCost = (outputTokens / 1000) * modelConfig.costPer1kOutputTokens;
  
  return inputCost + outputCost;
}

// Function to get model tier for UI display
export function getModelTier(model: string): 'IA_ECO' | 'IA' | 'IA_SUPER' {
  // Google/Gemini models - IA Eco tier
  if (model.includes('gemini')) return 'IA_ECO';
  
  // GPT-5 variants - IA Turbo tier (IA_SUPER)
  if (model === 'gpt-5-chat-latest' || model.startsWith('gpt-5-')) return 'IA_SUPER';
  
  // GPT-4o-mini - IA tier
  if (model === 'gpt-4o-mini') return 'IA';
  
  // Default to IA tier
  return 'IA';
}

// Export default configuration
export const DEFAULT_AI_CONFIG: AIConfig = {
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2000,
  topP: 0.9,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0
};
