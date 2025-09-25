#!/usr/bin/env node

// Cálculo dos custos mensais baseados nos preços das APIs (setembro 2025)

// Preços por milhão de tokens
const PRICING = {
  'gpt-5': { input: 1.25, output: 10.00 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gemini-1.5-flash': { input: 0.075, output: 0.30 },
  'perplexity-sonar': { input: 1.00, output: 1.00 }
}

// Configurações de quota por role
const QUOTA_CONFIGS = [
  {
    role: 'STUDENT',
    monthly_token_limit: 100000,
    daily_token_limit: 4000,
    hourly_token_limit: 400
  },
  {
    role: 'TEACHER',
    monthly_token_limit: 500000,
    daily_token_limit: 20000,
    hourly_token_limit: 2000
  },
  {
    role: 'STAFF',
    monthly_token_limit: 200000,
    daily_token_limit: 8000,
    hourly_token_limit: 800
  },
  {
    role: 'ADMIN',
    monthly_token_limit: 1000000,
    daily_token_limit: 50000,
    hourly_token_limit: 5000
  },
  {
    role: 'SUPER_ADMIN',
    monthly_token_limit: 2000000,
    daily_token_limit: 100000,
    hourly_token_limit: 10000
  }
]

// Calcular custos para diferentes cenários de uso
function calculateMonthlyCosts(tokenLimit) {
  const scenarios = {
    // Cenário 1: 70% Gemini Flash, 15% GPT-4o Mini, 10% Perplexity, 5% GPT-5
    balanced: {
      gemini: tokenLimit * 0.70,
      gpt4oMini: tokenLimit * 0.15,
      perplexity: tokenLimit * 0.10,
      gpt5: tokenLimit * 0.05
    },
    // Cenário 2: 50% entrada, 50% saída (assumindo 1000 entrada + 500 saída por requisição)
    realistic: {
      gemini: { input: tokenLimit * 0.50 * 0.70, output: tokenLimit * 0.50 * 0.70 },
      gpt4oMini: { input: tokenLimit * 0.50 * 0.15, output: tokenLimit * 0.50 * 0.15 },
      perplexity: { input: tokenLimit * 0.50 * 0.10, output: tokenLimit * 0.50 * 0.10 },
      gpt5: { input: tokenLimit * 0.50 * 0.05, output: tokenLimit * 0.50 * 0.05 }
    }
  }

  // Calcular custo realista (50% entrada, 50% saída)
  const realistic = scenarios.realistic
  
  const geminiCost = (realistic.gemini.input / 1000000 * PRICING['gemini-1.5-flash'].input) + 
                     (realistic.gemini.output / 1000000 * PRICING['gemini-1.5-flash'].output)
  
  const gpt4oMiniCost = (realistic.gpt4oMini.input / 1000000 * PRICING['gpt-4o-mini'].input) + 
                        (realistic.gpt4oMini.output / 1000000 * PRICING['gpt-4o-mini'].output)
  
  const perplexityCost = (realistic.perplexity.input / 1000000 * PRICING['perplexity-sonar'].input) + 
                         (realistic.perplexity.output / 1000000 * PRICING['perplexity-sonar'].output)
  
  const gpt5Cost = (realistic.gpt5.input / 1000000 * PRICING['gpt-5'].input) + 
                   (realistic.gpt5.output / 1000000 * PRICING['gpt-5'].output)

  const totalCost = geminiCost + gpt4oMiniCost + perplexityCost + gpt5Cost
  const costBrl = totalCost * 5.20 // Taxa de conversão USD para BRL

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    costBrl: Math.round(costBrl * 100) / 100,
    breakdown: {
      gemini: Math.round(geminiCost * 100) / 100,
      gpt4oMini: Math.round(gpt4oMiniCost * 100) / 100,
      perplexity: Math.round(perplexityCost * 100) / 100,
      gpt5: Math.round(gpt5Cost * 100) / 100
    }
  }
}

console.log('💰 Cálculo dos Custos Mensais Reais das Quotas\n')

QUOTA_CONFIGS.forEach(config => {
  const costs = calculateMonthlyCosts(config.monthly_token_limit)
  
  console.log(`${config.role}:`)
  console.log(`  Tokens: ${config.monthly_token_limit.toLocaleString()}/mês`)
  console.log(`  Custo USD: $${costs.totalCost}`)
  console.log(`  Custo BRL: R$ ${costs.costBrl}`)
  console.log(`  Breakdown:`)
  console.log(`    Gemini Flash: $${costs.breakdown.gemini}`)
  console.log(`    GPT-4o Mini: $${costs.breakdown.gpt4oMini}`)
  console.log(`    Perplexity: $${costs.breakdown.perplexity}`)
  console.log(`    GPT-5: $${costs.breakdown.gpt5}`)
  console.log('')
})

console.log('📊 Resumo dos Valores Corretos:')
console.log('| Role | Tokens/mês | Custo USD | Custo BRL |')
console.log('|------|------------|-----------|-----------|')

QUOTA_CONFIGS.forEach(config => {
  const costs = calculateMonthlyCosts(config.monthly_token_limit)
  console.log(`| ${config.role} | ${config.monthly_token_limit.toLocaleString()} | $${costs.totalCost} | R$ ${costs.costBrl} |`)
})
