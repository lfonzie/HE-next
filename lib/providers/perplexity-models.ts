/**
 * Perplexity AI Models Configuration - September 2025
 * 
 * This file contains the available Perplexity models and their recommended use cases.
 * Updated for September 2025 with the latest Sonar models and third-party integrations.
 */

export interface PerplexityModelConfig {
  id: string;
  name: string;
  description: string;
  useCase: string;
  speed: 'fast' | 'medium' | 'slow';
  cost: 'low' | 'medium' | 'high';
  capabilities: string[];
}

export const PERPLEXITY_MODELS: Record<string, PerplexityModelConfig> = {
  // === SONAR MODELS (Perplexity's proprietary models) ===
  
  'sonar': {
    id: 'sonar',
    name: 'Sonar',
    description: 'Modelo leve e econômico para consultas rápidas com citações em tempo real',
    useCase: 'Consultas cotidianas onde velocidade e clareza são prioritárias',
    speed: 'fast',
    cost: 'low',
    capabilities: ['real-time search', 'citations', 'fast responses']
  },

  'sonar-pro': {
    id: 'sonar-pro',
    name: 'Sonar Pro',
    description: 'Versão aprimorada com buscas mais precisas e suporte a consultas complexas',
    useCase: 'Consultas complexas e interações de acompanhamento',
    speed: 'fast',
    cost: 'medium',
    capabilities: ['advanced search', 'complex queries', 'follow-up support']
  },

  'sonar-reasoning': {
    id: 'sonar-reasoning',
    name: 'Sonar Reasoning',
    description: 'Modelo otimizado para raciocínio lógico e análise passo a passo',
    useCase: 'Análises complexas que exigem pensamento estruturado',
    speed: 'medium',
    cost: 'medium',
    capabilities: ['logical reasoning', 'step-by-step analysis', 'problem solving']
  },

  'sonar-reasoning-pro': {
    id: 'sonar-reasoning-pro',
    name: 'Sonar Reasoning Pro',
    description: 'Versão avançada alimentada pelo DeepSeek-R1 com Chain of Thought',
    useCase: 'Tarefas que exigem raciocínio preciso e análise profunda',
    speed: 'medium',
    cost: 'high',
    capabilities: ['advanced reasoning', 'chain-of-thought', 'deep analysis']
  },

  'sonar-deep-research': {
    id: 'sonar-deep-research',
    name: 'Sonar Deep Research',
    description: 'Modelo especializado em pesquisas exaustivas e relatórios detalhados',
    useCase: 'Pesquisas abrangentes e síntese de múltiplas fontes',
    speed: 'slow',
    cost: 'high',
    capabilities: ['exhaustive research', 'comprehensive reports', 'multi-source synthesis']
  },

  // === LLAMA SONAR MODELS ===

  'llama-3.1-sonar-small-128k-online': {
    id: 'llama-3.1-sonar-small-128k-online',
    name: 'Llama 3.1 Sonar Small',
    description: 'Modelo Llama 3.1 pequeno otimizado para busca online',
    useCase: 'Consultas rápidas com contexto limitado',
    speed: 'fast',
    cost: 'low',
    capabilities: ['online search', 'fast processing', 'limited context']
  },

  'llama-3.1-sonar-large-128k-online': {
    id: 'llama-3.1-sonar-large-128k-online',
    name: 'Llama 3.1 Sonar Large',
    description: 'Modelo Llama 3.1 grande com maior capacidade de contexto',
    useCase: 'Consultas complexas com contexto extenso',
    speed: 'medium',
    cost: 'medium',
    capabilities: ['large context', 'complex queries', 'online search']
  },

  'llama-3.1-sonar-huge-128k-online': {
    id: 'llama-3.1-sonar-huge-128k-online',
    name: 'Llama 3.1 Sonar Huge',
    description: 'Modelo Llama 3.1 máximo com capacidade máxima de contexto',
    useCase: 'Análises muito complexas e documentos extensos',
    speed: 'slow',
    cost: 'high',
    capabilities: ['maximum context', 'complex analysis', 'document processing']
  },

  'llama-3.2-sonar-small-128k-online': {
    id: 'llama-3.2-sonar-small-128k-online',
    name: 'Llama 3.2 Sonar Small',
    description: 'Versão mais recente do Llama 3.2 pequeno',
    useCase: 'Consultas rápidas com melhor qualidade',
    speed: 'fast',
    cost: 'low',
    capabilities: ['improved quality', 'fast processing', 'online search']
  },

  'llama-3.2-sonar-large-128k-online': {
    id: 'llama-3.2-sonar-large-128k-online',
    name: 'Llama 3.2 Sonar Large',
    description: 'Versão mais recente do Llama 3.2 grande',
    useCase: 'Consultas complexas com melhor qualidade e contexto',
    speed: 'medium',
    cost: 'medium',
    capabilities: ['improved quality', 'large context', 'complex queries']
  },

  'llama-3.2-sonar-huge-128k-online': {
    id: 'llama-3.2-sonar-huge-128k-online',
    name: 'Llama 3.2 Sonar Huge',
    description: 'Versão mais recente do Llama 3.2 máximo',
    useCase: 'Análises muito complexas com melhor qualidade',
    speed: 'slow',
    cost: 'high',
    capabilities: ['improved quality', 'maximum context', 'complex analysis']
  },

  // === THIRD-PARTY MODELS (Available in Pro/Max plans) ===

  'gpt-5': {
    id: 'gpt-5',
    name: 'GPT-5',
    description: 'Modelo mais avançado da OpenAI integrado ao Perplexity',
    useCase: 'Tarefas que exigem capacidades avançadas de IA',
    speed: 'medium',
    cost: 'high',
    capabilities: ['advanced AI', 'complex reasoning', 'creative tasks']
  },

  'claude-4.1-opus': {
    id: 'claude-4.1-opus',
    name: 'Claude 4.1 Opus',
    description: 'Modelo mais avançado da Anthropic integrado ao Perplexity',
    useCase: 'Análises complexas e raciocínio avançado',
    speed: 'medium',
    cost: 'high',
    capabilities: ['advanced reasoning', 'complex analysis', 'safety-focused']
  },

  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Modelo avançado do Google integrado ao Perplexity',
    useCase: 'Tarefas multimodais e análises complexas',
    speed: 'medium',
    cost: 'high',
    capabilities: ['multimodal', 'complex analysis', 'Google integration']
  },

  'grok-4': {
    id: 'grok-4',
    name: 'Grok 4',
    description: 'Modelo avançado da xAI integrado ao Perplexity',
    useCase: 'Análises em tempo real e insights únicos',
    speed: 'fast',
    cost: 'high',
    capabilities: ['real-time analysis', 'unique insights', 'xAI integration']
  }
};

/**
 * Get the recommended model based on use case
 */
export function getRecommendedModel(useCase: 'fast' | 'balanced' | 'quality' | 'research'): string {
  switch (useCase) {
    case 'fast':
      return 'sonar';
    case 'balanced':
      return 'sonar-reasoning';
    case 'quality':
      return 'sonar-reasoning-pro';
    case 'research':
      return 'sonar-deep-research';
    default:
      return 'sonar-reasoning';
  }
}

/**
 * Get model configuration by ID
 */
export function getModelConfig(modelId: string): PerplexityModelConfig | undefined {
  return PERPLEXITY_MODELS[modelId];
}

/**
 * List all available models
 */
export function getAllModels(): PerplexityModelConfig[] {
  return Object.values(PERPLEXITY_MODELS);
}

/**
 * List models by category
 */
export function getModelsByCategory(category: 'sonar' | 'llama' | 'third-party'): PerplexityModelConfig[] {
  return Object.values(PERPLEXITY_MODELS).filter(model => {
    if (category === 'sonar') {
      return model.id.startsWith('sonar');
    } else if (category === 'llama') {
      return model.id.includes('llama');
    } else if (category === 'third-party') {
      return ['gpt-5', 'claude-4.1-opus', 'gemini-2.5-pro', 'grok-4'].includes(model.id);
    }
    return false;
  });
}
