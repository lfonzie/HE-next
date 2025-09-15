// lib/ai-router/model-router.ts
// Roteador inteligente de modelos de IA

import { 
  ContextualFeatures, 
  RoutingDecision, 
  ProviderScore, 
  RouterConfig,
  ProviderConfig 
} from './types';
import { providerRegistry } from './provider-registry';
import { featureExtractor } from './feature-extractor';

export class ModelRouter {
  private config: RouterConfig;
  private learningData: Map<string, LearningMetrics> = new Map();

  constructor(config: RouterConfig) {
    this.config = config;
  }

  async selectProvider(
    text: string,
    context?: Record<string, any>,
    userProfile?: Record<string, any>
  ): Promise<RoutingDecision> {
    // Extrair características contextuais
    const features = featureExtractor.extractFeatures(text, context, userProfile);
    
    // Obter provedores disponíveis
    const availableProviders = providerRegistry.getEnabledProviders();
    
    if (availableProviders.length === 0) {
      throw new Error('No providers available');
    }

    // Calcular scores para cada provedor
    const providerScores = await this.calculateProviderScores(
      availableProviders, 
      features, 
      context
    );

    // Ordenar por score
    providerScores.sort((a, b) => b.score - a.score);

    // Selecionar provedor principal
    const selectedProvider = providerScores[0];
    const alternatives = providerScores.slice(1, 4); // Top 3 alternativas

    // Construir cadeia de fallback
    const fallbackChain = this.buildFallbackChain(providerScores);

    // Aplicar política de modo (shadow/canary/auto)
    const finalDecision = this.applyModePolicy(selectedProvider, features);

    return {
      selectedProvider: finalDecision.providerId,
      confidence: finalDecision.score,
      reasoning: finalDecision.reasoning,
      alternatives,
      fallbackChain,
      estimatedMetrics: finalDecision.estimatedMetrics
    };
  }

  private async calculateProviderScores(
    providers: ProviderConfig[],
    features: ContextualFeatures,
    context?: Record<string, any>
  ): Promise<ProviderScore[]> {
    const scores: ProviderScore[] = [];

    for (const provider of providers) {
      const score = await this.calculateProviderScore(provider, features, context);
      scores.push(score);
    }

    return scores;
  }

  private async calculateProviderScore(
    provider: ProviderConfig,
    features: ContextualFeatures,
    context?: Record<string, any>
  ): Promise<ProviderScore> {
    let score = 0;
    const reasoning: string[] = [];
    const weights = this.config.weights;

    // Score de qualidade baseado em capacidades
    const qualityScore = this.calculateQualityScore(provider, features);
    score += qualityScore * weights.quality;
    reasoning.push(`Quality: ${qualityScore.toFixed(2)} (weight: ${weights.quality})`);

    // Score de velocidade
    const speedScore = this.calculateSpeedScore(provider, features);
    score += speedScore * weights.speed;
    reasoning.push(`Speed: ${speedScore.toFixed(2)} (weight: ${weights.speed})`);

    // Score de custo (inverso)
    const costScore = this.calculateCostScore(provider, features);
    score += costScore * weights.cost;
    reasoning.push(`Cost: ${costScore.toFixed(2)} (weight: ${weights.cost})`);

    // Score de confiabilidade
    const reliabilityScore = this.calculateReliabilityScore(provider);
    score += reliabilityScore * weights.reliability;
    reasoning.push(`Reliability: ${reliabilityScore.toFixed(2)} (weight: ${weights.reliability})`);

    // Aplicar penalidades
    const penalties = this.calculatePenalties(provider, features, context);
    score -= penalties.total;
    reasoning.push(`Penalties: -${penalties.total.toFixed(2)}`);

    // Aplicar bônus por especialização
    const bonuses = this.calculateBonuses(provider, features);
    score += bonuses.total;
    reasoning.push(`Bonuses: +${bonuses.total.toFixed(2)}`);

    // Aplicar aprendizado histórico
    const learningBonus = this.getLearningBonus(provider.id, features);
    score += learningBonus;
    if (learningBonus !== 0) {
      reasoning.push(`Learning: +${learningBonus.toFixed(2)}`);
    }

    return {
      providerId: provider.id,
      score: Math.max(0, score), // Não permitir scores negativos
      reasoning: reasoning.join('; '),
      estimatedMetrics: {
        latency: provider.capabilities.avgLatencyMs,
        cost: this.estimateCost(provider, features),
        quality: qualityScore
      }
    };
  }

  private calculateQualityScore(provider: ProviderConfig, features: ContextualFeatures): number {
    let score = 0.5; // Base score

    // Bônus por suporte a JSON estrito
    if (features.requiresJsonStrict && provider.capabilities.supportsJsonStrict) {
      score += 0.3;
    }

    // Bônus por suporte a tool-use
    if (features.requiresToolUse && provider.capabilities.supportsToolUse) {
      score += 0.2;
    }

    // Bônus por especialização no domínio
    const domainExpertise = provider.capabilities.domainExpertise.find(
      exp => exp.domain === features.domain
    );
    if (domainExpertise) {
      score += domainExpertise.confidence * 0.3;
    }

    // Bônus por preferência de idioma
    if (provider.capabilities.languagePreference === features.language ||
        provider.capabilities.languagePreference === 'multilingual') {
      score += 0.1;
    }

    // Bônus por contexto adequado
    if (provider.capabilities.maxContextTokens >= features.contextLength) {
      score += 0.1;
    }

    return Math.min(1.0, score);
  }

  private calculateSpeedScore(provider: ProviderConfig, features: ContextualFeatures): number {
    // Score baseado na latência (menor é melhor)
    const latencyScore = Math.max(0, 1 - (provider.capabilities.avgLatencyMs / 5000));
    
    // Bônus por streaming se necessário
    let streamingBonus = 0;
    if (features.requiresStreaming && provider.capabilities.supportsStreaming) {
      streamingBonus = 0.2;
    }

    return Math.min(1.0, latencyScore + streamingBonus);
  }

  private calculateCostScore(provider: ProviderConfig, features: ContextualFeatures): number {
    // Score baseado no custo (menor é melhor)
    const estimatedCost = this.estimateCost(provider, features);
    const costScore = Math.max(0, 1 - (estimatedCost / 0.1)); // Normalizar para custos até $0.10

    // Ajustar baseado na sensibilidade do usuário ao custo
    const sensitivityMultiplier = {
      'low': 0.5,
      'medium': 1.0,
      'high': 1.5
    }[features.preferences.costSensitivity];

    return Math.min(1.0, costScore * sensitivityMultiplier);
  }

  private calculateReliabilityScore(provider: ProviderConfig): number {
    const metrics = providerRegistry.getProviderMetrics(provider.id);
    if (!metrics) return provider.capabilities.successRate;

    const successRate = metrics.totalRequests > 0 ? 
      metrics.successfulRequests / metrics.totalRequests : 
      provider.capabilities.successRate;

    // Penalizar por erros consecutivos
    const consecutiveErrorPenalty = Math.min(0.5, metrics.consecutiveErrors * 0.1);
    
    return Math.max(0, successRate - consecutiveErrorPenalty);
  }

  private calculatePenalties(
    provider: ProviderConfig, 
    features: ContextualFeatures, 
    context?: Record<string, any>
  ): { total: number; details: string[] } {
    let total = 0;
    const details: string[] = [];

    // Penalidade por não suportar JSON estrito quando necessário
    if (features.requiresJsonStrict && !provider.capabilities.supportsJsonStrict) {
      total += 0.5;
      details.push('No JSON strict support');
    }

    // Penalidade por não suportar tool-use quando necessário
    if (features.requiresToolUse && !provider.capabilities.supportsToolUse) {
      total += 0.3;
      details.push('No tool-use support');
    }

    // Penalidade por contexto insuficiente
    if (provider.capabilities.maxContextTokens < features.contextLength) {
      total += 0.4;
      details.push('Insufficient context length');
    }

    // Penalidade por erros recentes
    const metrics = providerRegistry.getProviderMetrics(provider.id);
    if (metrics && metrics.consecutiveErrors > 2) {
      total += 0.2 * metrics.consecutiveErrors;
      details.push(`${metrics.consecutiveErrors} consecutive errors`);
    }

    // Penalidade por custo alto quando usuário é sensível
    if (features.preferences.costSensitivity === 'high') {
      const costRatio = provider.capabilities.costPer1kTokens.inputPer1k / 0.00015; // Comparar com OpenAI
      if (costRatio > 2) {
        total += 0.2;
        details.push('High cost for sensitive user');
      }
    }

    return { total, details };
  }

  private calculateBonuses(
    provider: ProviderConfig, 
    features: ContextualFeatures
  ): { total: number; details: string[] } {
    let total = 0;
    const details: string[] = [];

    // Bônus por especialização específica
    const domainExpertise = provider.capabilities.domainExpertise.find(
      exp => exp.domain === features.domain
    );
    if (domainExpertise && domainExpertise.confidence > 0.9) {
      total += 0.2;
      details.push('High domain expertise');
    }

    // Bônus por horário de pico (provedores mais rápidos)
    if (features.timeOfDay === 'peak' && provider.capabilities.avgLatencyMs < 1000) {
      total += 0.1;
      details.push('Fast provider for peak time');
    }

    // Bônus por conformidade LGPD para dados sensíveis
    if (features.userType === 'student' && 
        provider.capabilities.complianceStandards.some(c => c.standard === 'GDPR')) {
      total += 0.1;
      details.push('GDPR compliant for student data');
    }

    return { total, details };
  }

  private getLearningBonus(providerId: string, features: ContextualFeatures): number {
    const key = `${providerId}_${features.domain}_${features.complexity}`;
    const learningData = this.learningData.get(key);
    
    if (!learningData) return 0;

    // Bônus baseado na performance histórica
    const performanceBonus = (learningData.successRate - 0.5) * 0.2;
    const satisfactionBonus = (learningData.avgSatisfaction - 0.5) * 0.1;
    
    return Math.max(-0.1, Math.min(0.1, performanceBonus + satisfactionBonus));
  }

  private estimateCost(provider: ProviderConfig, features: ContextualFeatures): number {
    const estimatedInputTokens = Math.ceil(features.contextLength / 4); // Aproximação
    const estimatedOutputTokens = features.complexity === 'complex' ? 1000 : 500;
    
    const inputCost = (estimatedInputTokens / 1000) * provider.capabilities.costPer1kTokens.inputPer1k;
    const outputCost = (estimatedOutputTokens / 1000) * provider.capabilities.costPer1kTokens.outputPer1k;
    
    return inputCost + outputCost;
  }

  private buildFallbackChain(providerScores: ProviderScore[]): string[] {
    return providerScores.map(score => score.providerId);
  }

  private applyModePolicy(
    selectedProvider: ProviderScore, 
    features: ContextualFeatures
  ): ProviderScore {
    // No modo shadow, sempre retorna OpenAI como recomendado
    if (this.config.mode === 'shadow') {
      return {
        ...selectedProvider,
        providerId: 'openai-gpt-4o-mini',
        reasoning: `Shadow mode: Recommended ${selectedProvider.providerId}, using OpenAI`,
        score: selectedProvider.score
      };
    }

    // No modo canary, aplicar percentual aleatório
    if (this.config.mode === 'canary') {
      const random = Math.random();
      if (random > this.config.canaryPercentage / 100) {
        return {
          ...selectedProvider,
          providerId: 'openai-gpt-4o-mini',
          reasoning: `Canary mode: ${random.toFixed(2)} > ${this.config.canaryPercentage}%, using OpenAI`,
          score: selectedProvider.score
        };
      }
    }

    // Modo auto - usar seleção normal
    return selectedProvider;
  }

  // Método para atualizar dados de aprendizado
  updateLearningData(
    providerId: string, 
    features: ContextualFeatures, 
    success: boolean, 
    satisfaction?: number
  ): void {
    const key = `${providerId}_${features.domain}_${features.complexity}`;
    const current = this.learningData.get(key) || {
      totalRequests: 0,
      successfulRequests: 0,
      totalSatisfaction: 0,
      avgSatisfaction: 0.5,
      successRate: 0.5
    };

    current.totalRequests++;
    if (success) current.successfulRequests++;
    if (satisfaction !== undefined) {
      current.totalSatisfaction += satisfaction;
      current.avgSatisfaction = current.totalSatisfaction / current.totalRequests;
    }
    current.successRate = current.successfulRequests / current.totalRequests;

    this.learningData.set(key, current);
  }

  // Método para obter estatísticas de aprendizado
  getLearningStats(): Map<string, LearningMetrics> {
    return new Map(this.learningData);
  }
}

interface LearningMetrics {
  totalRequests: number;
  successfulRequests: number;
  totalSatisfaction: number;
  avgSatisfaction: number;
  successRate: number;
}

// Instância singleton
export const modelRouter = new ModelRouter({
  mode: 'shadow',
  canaryPercentage: 5,
  weights: {
    quality: 0.4,
    speed: 0.3,
    cost: 0.2,
    reliability: 0.1
  },
  budgets: {
    perSession: 0.50,
    perUserDaily: 5.00,
    perModule: {
      'aula_interativa': 2.00,
      'enem': 1.50,
      'ti': 0.75,
      'professor': 1.00,
      'atendimento': 0.50
    }
  },
  safetyThresholds: {
    jsonValidity: 0.95,
    responseTimeout: 30000,
    costAlert: 0.80
  }
});
