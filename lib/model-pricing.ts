/**
 * Configuração de preços das APIs de IA atualizada para setembro de 2025
 * Baseado nos preços oficiais da OpenAI e Google
 */

export interface ModelPricing {
  provider: string
  model: string
  inputCostPerMillionTokens: number  // USD por milhão de tokens
  outputCostPerMillionTokens: number  // USD por milhão de tokens
  contextWindow: number
  description: string
}

export const MODEL_PRICING: ModelPricing[] = [
  // OpenAI - Modelos utilizados no projeto
  {
    provider: 'openai',
    model: 'gpt-5',
    inputCostPerMillionTokens: 1.25,
    outputCostPerMillionTokens: 10.00,
    contextWindow: 400000,
    description: 'GPT-5 - Modelo principal da OpenAI (setembro 2025)'
  },
  {
    provider: 'openai',
    model: 'gpt-4o-mini',
    inputCostPerMillionTokens: 0.15,
    outputCostPerMillionTokens: 0.60,
    contextWindow: 128000,
    description: 'GPT-4o Mini - Modelo econômico da OpenAI'
  },
  
  // Google - Apenas Gemini 1.5 Flash utilizado
  {
    provider: 'google',
    model: 'gemini-1.5-flash',
    inputCostPerMillionTokens: 0.075,
    outputCostPerMillionTokens: 0.30,
    contextWindow: 1000000,
    description: 'Gemini 1.5 Flash - Modelo rápido e econômico do Google'
  },
  
  // Perplexity - Sonar (não Pro)
  {
    provider: 'perplexity',
    model: 'sonar',
    inputCostPerMillionTokens: 1.00,
    outputCostPerMillionTokens: 1.00,
    contextWindow: 128000,
    description: 'Perplexity Sonar - API de busca com IA (não Pro)'
  }
]

/**
 * Calcula o custo de uma requisição baseado no modelo e tokens utilizados
 */
export function calculateCost(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number
): { costUsd: number; costBrl: number } {
  const pricing = MODEL_PRICING.find(
    p => p.provider === provider && p.model === model
  )
  
  if (!pricing) {
    // Fallback para modelo não encontrado
    console.warn(`Preço não encontrado para ${provider}/${model}`)
    return { costUsd: 0, costBrl: 0 }
  }
  
  const inputCost = (inputTokens / 1000000) * pricing.inputCostPerMillionTokens
  const outputCost = (outputTokens / 1000000) * pricing.outputCostPerMillionTokens
  const costUsd = inputCost + outputCost
  
  // Taxa de câmbio USD/BRL aproximada (setembro 2025)
  const usdToBrlRate = 5.20
  const costBrl = costUsd * usdToBrlRate
  
  return { costUsd, costBrl }
}

/**
 * Obtém informações de preço de um modelo específico
 */
export function getModelPricing(provider: string, model: string): ModelPricing | null {
  return MODEL_PRICING.find(
    p => p.provider === provider && p.model === model
  ) || null
}

/**
 * Lista todos os modelos disponíveis por provider
 */
export function getModelsByProvider(provider: string): ModelPricing[] {
  return MODEL_PRICING.filter(p => p.provider === provider)
}

/**
 * Obtém o modelo mais econômico para uma tarefa específica
 */
export function getMostEconomicalModel(
  estimatedInputTokens: number,
  estimatedOutputTokens: number
): ModelPricing {
  let bestModel = MODEL_PRICING[0]
  let lowestCost = Infinity
  
  for (const model of MODEL_PRICING) {
    const cost = calculateCost(
      model.provider,
      model.model,
      estimatedInputTokens,
      estimatedOutputTokens
    )
    
    if (cost.costUsd < lowestCost) {
      lowestCost = cost.costUsd
      bestModel = model
    }
  }
  
  return bestModel
}

/**
 * Configurações de quota atualizadas baseadas nos novos preços
 */
export const UPDATED_QUOTA_SETTINGS = [
  {
    role: 'STUDENT',
    monthly_token_limit: 100000,      // Aumentado devido aos preços mais altos
    daily_token_limit: 4000,
    hourly_token_limit: 400,
    cost_limit_usd: 10.0,             // Aumentado para cobrir custos mais altos
    cost_limit_brl: 52.0
  },
  {
    role: 'TEACHER',
    monthly_token_limit: 500000,       // Aumentado significativamente
    daily_token_limit: 20000,
    hourly_token_limit: 2000,
    cost_limit_usd: 50.0,             // Aumentado para cobrir custos mais altos
    cost_limit_brl: 260.0
  },
  {
    role: 'STAFF',
    monthly_token_limit: 200000,
    daily_token_limit: 8000,
    hourly_token_limit: 800,
    cost_limit_usd: 20.0,
    cost_limit_brl: 104.0
  },
  {
    role: 'ADMIN',
    monthly_token_limit: 1000000,      // Aumentado significativamente
    daily_token_limit: 50000,
    hourly_token_limit: 5000,
    cost_limit_usd: 100.0,            // Aumentado para cobrir custos mais altos
    cost_limit_brl: 520.0
  },
  {
    role: 'SUPER_ADMIN',
    monthly_token_limit: 2000000,     // Aumentado significativamente
    daily_token_limit: 100000,
    hourly_token_limit: 10000,
    cost_limit_usd: 200.0,            // Aumentado para cobrir custos mais altos
    cost_limit_brl: 1040.0
  }
]

/**
 * Resumo dos preços dos modelos utilizados no projeto (setembro 2025)
 */
export const PRICING_SUMMARY = {
  gpt5: {
    input: '$1.25 por milhão de tokens',
    output: '$10.00 por milhão de tokens',
    context: '400K tokens',
    usage: 'Modelo principal para tarefas complexas'
  },
  gpt4oMini: {
    input: '$0.15 por milhão de tokens',
    output: '$0.60 por milhão de tokens',
    context: '128K tokens',
    usage: 'Modelo econômico para tarefas simples'
  },
  gemini15Flash: {
    input: '$0.075 por milhão de tokens',
    output: '$0.30 por milhão de tokens',
    context: '1M tokens',
    usage: 'Modelo mais econômico para tarefas rápidas'
  },
  perplexitySonar: {
    input: '$1.00 por milhão de tokens',
    output: '$1.00 por milhão de tokens',
    context: '128K tokens',
    usage: 'API de busca com IA (não Pro)'
  }
}
