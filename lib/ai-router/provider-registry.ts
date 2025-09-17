// lib/ai-router/provider-registry.ts
// Registry centralizado de provedores de IA

import { ProviderConfig, ProviderCapabilities } from './types';

export class ProviderRegistry {
  private providers: Map<string, ProviderConfig> = new Map();
  private metrics: Map<string, ProviderMetrics> = new Map();

  constructor() {
    this.initializeDefaultProviders();
  }

  private initializeDefaultProviders(): void {
    // OpenAI - Provedor principal atual
    this.registerProvider({
      id: 'openai-gpt-4o-mini',
      name: 'OpenAI GPT-4o Mini',
      type: 'openai',
      enabled: true,
      capabilities: {
        supportsJsonStrict: true,
        supportsToolUse: true,
        supportsStreaming: true,
        maxContextTokens: 128000,
        languagePreference: 'multilingual',
        domainExpertise: [
          { domain: 'educational', confidence: 0.9, specialties: ['aulas', 'explicacoes'] },
          { domain: 'technical', confidence: 0.8, specialties: ['codigo', 'debug'] },
          { domain: 'assessment', confidence: 0.85, specialties: ['enem', 'quiz'] }
        ],
        responseStyle: 'conversational',
        avgLatencyMs: 800,
        successRate: 0.98,
        costPer1kTokens: {
          inputPer1k: 0.00015,
          outputPer1k: 0.0006,
          currency: 'USD'
        },
        dataResidency: ['us', 'eu'],
        complianceStandards: [
          { standard: 'SOC2', level: 'advanced', certifications: ['SOC2 Type II'] }
        ],
        safetyFilters: {
          contentFiltering: 'advanced',
          piiProtection: true,
          dataRetention: 30
        }
      },
      config: {
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 4000
      },
      limits: {
        requestsPerMinute: 60,
        tokensPerMinute: 150000,
        maxConcurrentRequests: 10
      },
      fallbackPriority: 1
    });

    // Anthropic Claude - Especializado em raciocínio complexo
    this.registerProvider({
      id: 'anthropic-claude-3-haiku',
      name: 'Anthropic Claude 3 Haiku',
      type: 'anthropic',
      enabled: false, // Desabilitado inicialmente
      capabilities: {
        supportsJsonStrict: true,
        supportsToolUse: true,
        supportsStreaming: true,
        maxContextTokens: 200000,
        languagePreference: 'multilingual',
        domainExpertise: [
          { domain: 'educational', confidence: 0.95, specialties: ['raciocinio-complexo', 'analise'] },
          { domain: 'technical', confidence: 0.9, specialties: ['arquitetura', 'design'] }
        ],
        responseStyle: 'detailed',
        avgLatencyMs: 1200,
        successRate: 0.97,
        costPer1kTokens: {
          inputPer1k: 0.00025,
          outputPer1k: 0.00125,
          currency: 'USD'
        },
        dataResidency: ['us'],
        complianceStandards: [
          { standard: 'SOC2', level: 'advanced', certifications: ['SOC2 Type II'] }
        ],
        safetyFilters: {
          contentFiltering: 'advanced',
          piiProtection: true,
          dataRetention: 30
        }
      },
      config: {
        model: 'claude-3-haiku-20240307',
        temperature: 0.6,
        maxTokens: 4000
      },
      limits: {
        requestsPerMinute: 50,
        tokensPerMinute: 100000,
        maxConcurrentRequests: 8
      },
      fallbackPriority: 2
    });

    // Google Gemini - Otimizado para contexto extenso
    this.registerProvider({
      id: 'google-gemini-pro',
      name: 'Google Gemini Pro',
      type: 'google',
      enabled: true, // Ativado para uso
      capabilities: {
        supportsJsonStrict: true,
        supportsToolUse: false,
        supportsStreaming: true,
        maxContextTokens: 1000000,
        languagePreference: 'multilingual',
        domainExpertise: [
          { domain: 'educational', confidence: 0.88, specialties: ['contexto-extenso', 'pesquisa'] },
          { domain: 'multimodal', confidence: 0.9, specialties: ['imagens', 'documentos'] }
        ],
        responseStyle: 'detailed',
        avgLatencyMs: 1500,
        successRate: 0.96,
        costPer1kTokens: {
          inputPer1k: 0.0005,
          outputPer1k: 0.0015,
          currency: 'USD'
        },
        dataResidency: ['us', 'eu'],
        complianceStandards: [
          { standard: 'SOC2', level: 'intermediate', certifications: ['SOC2 Type I'] }
        ],
        safetyFilters: {
          contentFiltering: 'intermediate',
          piiProtection: true,
          dataRetention: 30
        }
      },
      config: {
        model: 'gemini-2.0-flash-exp',
        temperature: 0.7,
        maxTokens: 8000
      },
      limits: {
        requestsPerMinute: 30,
        tokensPerMinute: 60000,
        maxConcurrentRequests: 5
      },
      fallbackPriority: 3
    });

    // Mistral AI - Solução econômica
    this.registerProvider({
      id: 'mistral-mistral-small',
      name: 'Mistral Small',
      type: 'mistral',
      enabled: false, // Desabilitado inicialmente
      capabilities: {
        supportsJsonStrict: true,
        supportsToolUse: false,
        supportsStreaming: true,
        maxContextTokens: 32000,
        languagePreference: 'multilingual',
        domainExpertise: [
          { domain: 'educational', confidence: 0.8, specialties: ['basico', 'simples'] },
          { domain: 'conversational', confidence: 0.85, specialties: ['chat', 'suporte'] }
        ],
        responseStyle: 'concise',
        avgLatencyMs: 600,
        successRate: 0.94,
        costPer1kTokens: {
          inputPer1k: 0.0001,
          outputPer1k: 0.0003,
          currency: 'USD'
        },
        dataResidency: ['eu'],
        complianceStandards: [
          { standard: 'GDPR', level: 'advanced', certifications: ['GDPR Compliant'] }
        ],
        safetyFilters: {
          contentFiltering: 'basic',
          piiProtection: true,
          dataRetention: 30
        }
      },
      config: {
        model: 'mistral-small-latest',
        temperature: 0.7,
        maxTokens: 2000
      },
      limits: {
        requestsPerMinute: 100,
        tokensPerMinute: 200000,
        maxConcurrentRequests: 15
      },
      fallbackPriority: 4
    });

    // Groq - Ultra-rápido
    this.registerProvider({
      id: 'groq-llama-3',
      name: 'Groq Llama 3',
      type: 'groq',
      enabled: false, // Desabilitado inicialmente
      capabilities: {
        supportsJsonStrict: true,
        supportsToolUse: false,
        supportsStreaming: true,
        maxContextTokens: 128000,
        languagePreference: 'multilingual',
        domainExpertise: [
          { domain: 'technical', confidence: 0.85, specialties: ['codigo', 'rapido'] },
          { domain: 'conversational', confidence: 0.8, specialties: ['chat', 'respostas-rapidas'] }
        ],
        responseStyle: 'concise',
        avgLatencyMs: 200,
        successRate: 0.95,
        costPer1kTokens: {
          inputPer1k: 0.00005,
          outputPer1k: 0.0001,
          currency: 'USD'
        },
        dataResidency: ['us'],
        complianceStandards: [
          { standard: 'SOC2', level: 'basic', certifications: ['SOC2 Type I'] }
        ],
        safetyFilters: {
          contentFiltering: 'basic',
          piiProtection: false,
          dataRetention: 7
        }
      },
      config: {
        model: 'llama-3-8b-8192',
        temperature: 0.7,
        maxTokens: 2000
      },
      limits: {
        requestsPerMinute: 200,
        tokensPerMinute: 300000,
        maxConcurrentRequests: 20
      },
      fallbackPriority: 5
    });
  }

  registerProvider(provider: ProviderConfig): void {
    this.providers.set(provider.id, provider);
    this.metrics.set(provider.id, {
      totalRequests: 0,
      successfulRequests: 0,
      totalLatency: 0,
      totalCost: 0,
      lastUsed: null,
      errorCount: 0,
      consecutiveErrors: 0
    });
  }

  getProvider(id: string): ProviderConfig | undefined {
    return this.providers.get(id);
  }

  getEnabledProviders(): ProviderConfig[] {
    return Array.from(this.providers.values()).filter(p => p.enabled);
  }

  getProvidersByCapability(capability: keyof ProviderCapabilities, value: any): ProviderConfig[] {
    return Array.from(this.providers.values()).filter(p => 
      p.enabled && p.capabilities[capability] === value
    );
  }

  updateProviderMetrics(id: string, metrics: Partial<ProviderMetrics>): void {
    const current = this.metrics.get(id);
    if (current) {
      this.metrics.set(id, { ...current, ...metrics });
    }
  }

  getProviderMetrics(id: string): ProviderMetrics | undefined {
    return this.metrics.get(id);
  }

  getAllMetrics(): Map<string, ProviderMetrics> {
    return new Map(this.metrics);
  }

  enableProvider(id: string): boolean {
    const provider = this.providers.get(id);
    if (provider) {
      provider.enabled = true;
      return true;
    }
    return false;
  }

  disableProvider(id: string): boolean {
    const provider = this.providers.get(id);
    if (provider) {
      provider.enabled = false;
      return true;
    }
    return false;
  }

  getProviderHealth(id: string): 'healthy' | 'degraded' | 'unhealthy' {
    const metrics = this.metrics.get(id);
    if (!metrics) return 'unhealthy';

    const successRate = metrics.totalRequests > 0 ? 
      metrics.successfulRequests / metrics.totalRequests : 0;

    if (successRate >= 0.95 && metrics.consecutiveErrors === 0) return 'healthy';
    if (successRate >= 0.85 && metrics.consecutiveErrors < 3) return 'degraded';
    return 'unhealthy';
  }
}

interface ProviderMetrics {
  totalRequests: number;
  successfulRequests: number;
  totalLatency: number;
  totalCost: number;
  lastUsed: Date | null;
  errorCount: number;
  consecutiveErrors: number;
}

// Instância singleton
export const providerRegistry = new ProviderRegistry();
