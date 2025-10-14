// lib/ai-router/ai-router.ts
// Orquestrador principal do sistema de roteamento multi-fornecedor

import { 
  RouterResponse, 
  RouterConfig, 
  RouterMetrics,
  ContextualFeatures 
} from './types';
import { providerRegistry } from './provider-registry';
import { featureExtractor } from './feature-extractor';
import { modelRouter } from './model-router';
import { safetyLayer } from './safety-layer';

export class AIRouter {
  private config: RouterConfig;
  private metrics: RouterMetrics[] = [];
  private isEnabled: boolean = false;

  constructor(config: RouterConfig) {
    this.config = config;
  }

  async route(
    text: string,
    context?: Record<string, any>,
    userProfile?: Record<string, any>
  ): Promise<RouterResponse> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      // Verificar se o roteador está habilitado
      if (!this.isEnabled) {
        return this.getFallbackResponse(text, context, requestId, startTime);
      }

      // Extrair características contextuais
      const features = featureExtractor.extractFeatures(text, context, userProfile);

      // Validação pré-processamento
      const preValidation = await safetyLayer.validatePreProcessing(text, context);
      if (!preValidation.passed) {
        console.warn('Pre-processing validation failed:', preValidation.issues);
        // Continuar com sanitização
        text = safetyLayer.sanitizeText(text);
      }

      // Selecionar provedor
      const routingDecision = await modelRouter.selectProvider(text, context, userProfile);
      
      // Executar requisição
      const response = await this.executeRequest(
        routingDecision.selectedProvider,
        text,
        context,
        features
      );

      // Validação pós-processamento
      const postValidation = await safetyLayer.validatePostProcessing(
        {
          ...response,
          safety: { passed: true, issues: [], recommendations: [] },
          trace: { 
            requestId, 
            timestamp: new Date(),
            module: context?.module || 'unknown',
            selectedProvider: 'default',
            alternatives: [],
            actualMetrics: {
              latency: 0,
              cost: 0,
              success: true,
              jsonValid: true
            }
          }
        },
        this.getExpectedSchema(context?.module)
      );

      // Atualizar métricas
      const metrics = this.buildMetrics(
        requestId,
        context?.module || 'unknown',
        routingDecision,
        response,
        startTime,
        features
      );
      this.metrics.push(metrics);

      // Atualizar aprendizado
      this.updateLearning(routingDecision.selectedProvider, features, response.success);

      // Retornar resposta
      return {
        ...response,
        safety: postValidation,
        trace: metrics
      };

    } catch (error) {
      console.error('AI Router error:', error);
      return this.getFallbackResponse(text, context, requestId, startTime, error);
    }
  }

  private async executeRequest(
    providerId: string,
    text: string,
    context?: Record<string, any>,
    features?: ContextualFeatures
  ): Promise<Omit<RouterResponse, 'safety' | 'trace'>> {
    const provider = providerRegistry.getProvider(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const startTime = Date.now();

    try {
      // Simular chamada para o provedor (em produção, seria uma chamada real)
      const response = await this.callProvider(provider, text, context);
      
      const latency = Date.now() - startTime;
      const cost = this.calculateCost(provider, text, response);

      // Atualizar métricas do provedor
      providerRegistry.updateProviderMetrics(providerId, {
        totalRequests: 1,
        successfulRequests: 1,
        totalLatency: latency,
        totalCost: cost,
        lastUsed: new Date(),
        errorCount: 0,
        consecutiveErrors: 0
      });

      return {
        success: true,
        content: response,
        provider: providerId,
        metrics: {
          latency,
          cost,
          tokens: {
            input: Math.ceil(text.length / 4),
            output: Math.ceil(response.length / 4),
            total: Math.ceil((text.length + response.length) / 4)
          }
        }
      };

    } catch (error) {
      const latency = Date.now() - startTime;
      
      // Atualizar métricas de erro
      providerRegistry.updateProviderMetrics(providerId, {
        totalRequests: 1,
        successfulRequests: 0,
        totalLatency: latency,
        totalCost: 0,
        lastUsed: new Date(),
        errorCount: 1,
        consecutiveErrors: 1
      });

      throw error;
    }
  }

  private async callProvider(
    provider: any,
    text: string,
    context?: Record<string, any>
  ): Promise<string> {
    // Em produção, esta seria uma chamada real para o provedor
    // Por enquanto, simulamos uma resposta baseada no tipo de provedor
    
    const delay = Math.random() * provider.capabilities.avgLatencyMs;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Simular diferentes tipos de resposta baseado no provedor
    switch (provider.type) {
      case 'grok':
        return this.generateGrokResponse(text, context);
      case 'openai':
        return this.generateOpenAIResponse(text, context);
      case 'anthropic':
        return this.generateAnthropicResponse(text, context);
      case 'google':
        return this.generateGoogleResponse(text, context);
      case 'mistral':
        return this.generateMistralResponse(text, context);
      case 'groq':
        return this.generateGroqResponse(text, context);
      default:
        return this.generateDefaultResponse(text, context);
    }
  }

  private generateGrokResponse(text: string, context?: Record<string, any>): string {
    if (context?.module === 'aula_interativa') {
      return JSON.stringify({
        slides: [
          { titulo: "Introdução", conteudo: "Conceitos básicos", tipo: "introducao" },
          { titulo: "Desenvolvimento", conteudo: "Aprofundamento", tipo: "desenvolvimento" }
        ]
      });
    }

    if (context?.module === 'enem') {
      return JSON.stringify({
        questoes: [{
          enunciado: "Questão de exemplo",
          alternativas: ["A) Opção A", "B) Opção B", "C) Opção C", "D) Opção D", "E) Opção E"],
          resposta: "A",
          explicacao: "Explicação detalhada"
        }]
      });
    }

    return `Resposta Grok 4 Fast para: ${text.substring(0, 50)}...`;
  }

  private generateOpenAIResponse(text: string, context?: Record<string, any>): string {
    return `Resposta OpenAI para: ${text.substring(0, 50)}...`;
  }

  private generateAnthropicResponse(text: string, context?: Record<string, any>): string {
    return `Resposta Claude (Anthropic) - Análise detalhada: ${text.substring(0, 50)}...`;
  }

  private generateGoogleResponse(text: string, context?: Record<string, any>): string {
    return `Resposta Gemini (Google) - Contexto extenso: ${text.substring(0, 50)}...`;
  }

  private generateMistralResponse(text: string, context?: Record<string, any>): string {
    return `Resposta Mistral - Conciso: ${text.substring(0, 50)}...`;
  }

  private generateGroqResponse(text: string, context?: Record<string, any>): string {
    return `Resposta Groq - Ultra-rápido: ${text.substring(0, 50)}...`;
  }

  private generateDefaultResponse(text: string, context?: Record<string, any>): string {
    return `Resposta padrão: ${text.substring(0, 50)}...`;
  }

  private calculateCost(provider: any, input: string, output: string): number {
    const inputTokens = Math.ceil(input.length / 4);
    const outputTokens = Math.ceil(output.length / 4);
    
    const inputCost = (inputTokens / 1000) * provider.capabilities.costPer1kTokens.inputPer1k;
    const outputCost = (outputTokens / 1000) * provider.capabilities.costPer1kTokens.outputPer1k;
    
    return inputCost + outputCost;
  }

  private getExpectedSchema(module?: string): string | undefined {
    if (module && ['aula_interativa', 'enem', 'ti'].includes(module)) {
      return module;
    }
    return undefined;
  }

  private buildMetrics(
    requestId: string,
    module: string,
    routingDecision: any,
    response: any,
    startTime: number,
    features: ContextualFeatures
  ): RouterMetrics {
    return {
      timestamp: new Date(),
      requestId,
      module,
      selectedProvider: routingDecision.selectedProvider,
      alternatives: routingDecision.alternatives,
      actualMetrics: {
        latency: response.metrics.latency,
        cost: response.metrics.cost,
        success: response.success,
        jsonValid: this.isValidJson(response.content),
        userSatisfaction: undefined // Seria preenchido pelo feedback do usuário
      },
      shadowComparison: this.config.mode === 'shadow' ? {
        recommendedProvider: routingDecision.alternatives[0]?.providerId || 'unknown',
        actualProvider: routingDecision.selectedProvider,
        performanceGap: 0 // Seria calculado baseado em métricas reais
      } : undefined
    };
  }

  private isValidJson(content: string): boolean {
    try {
      JSON.parse(content);
      return true;
    } catch {
      return false;
    }
  }

  private updateLearning(providerId: string, features: ContextualFeatures, success: boolean): void {
    modelRouter.updateLearningData(providerId, features, success);
  }

  private getFallbackResponse(
    text: string,
    context?: Record<string, any>,
    requestId?: string,
    startTime?: number,
    error?: any
  ): RouterResponse {
    // Fallback principal utiliza Grok 4 Fast
    const fallbackContent = this.generateGrokResponse(text, context);

    return {
      success: true,
      content: fallbackContent,
      provider: 'xai-grok-4-fast',
      metrics: {
        latency: Date.now() - (startTime || Date.now()),
        cost: 0.001, // Custo estimado baixo
        tokens: {
          input: Math.ceil(text.length / 4),
          output: Math.ceil(fallbackContent.length / 4),
          total: Math.ceil((text.length + fallbackContent.length) / 4)
        }
      },
      safety: {
        passed: true,
        issues: [],
        recommendations: error ? ['Sistema em modo fallback devido a erro'] : []
      },
      trace: {
        timestamp: new Date(),
        requestId: requestId || 'fallback',
        module: context?.module || 'unknown',
        selectedProvider: 'xai-grok-4-fast',
        alternatives: [],
        actualMetrics: {
          latency: Date.now() - (startTime || Date.now()),
          cost: 0.001,
          success: true,
          jsonValid: this.isValidJson(fallbackContent)
        }
      }
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Métodos de controle
  enable(): void {
    this.isEnabled = true;
    console.log('AI Router enabled');
  }

  disable(): void {
    this.isEnabled = false;
    console.log('AI Router disabled');
  }

  setMode(mode: 'shadow' | 'canary' | 'auto'): void {
    this.config.mode = mode;
    console.log(`AI Router mode set to: ${mode}`);
  }

  setCanaryPercentage(percentage: number): void {
    this.config.canaryPercentage = Math.max(0, Math.min(100, percentage));
    console.log(`AI Router canary percentage set to: ${percentage}%`);
  }

  // Métodos de monitoramento
  getMetrics(): RouterMetrics[] {
    return [...this.metrics];
  }

  getProviderHealth(): Map<string, 'healthy' | 'degraded' | 'unhealthy'> {
    const health = new Map();
    const providers = providerRegistry.getEnabledProviders();
    
    for (const provider of providers) {
      health.set(provider.id, providerRegistry.getProviderHealth(provider.id));
    }
    
    return health;
  }

  getLearningStats(): Map<string, any> {
    return modelRouter.getLearningStats();
  }

  // Métodos de configuração
  updateConfig(newConfig: Partial<RouterConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('AI Router config updated:', newConfig);
  }

  getConfig(): RouterConfig {
    return { ...this.config };
  }
}

// Instância singleton
export const aiRouter = new AIRouter({
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
