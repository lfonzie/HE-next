// lib/ai-router/types.ts
// Tipos para o sistema de roteamento multi-fornecedor de IA

export interface ProviderCapabilities {
  // Capacidades técnicas
  supportsJsonStrict: boolean;
  supportsToolUse: boolean;
  supportsStreaming: boolean;
  maxContextTokens: number;
  
  // Perfil comportamental
  languagePreference: 'pt-BR' | 'en' | 'multilingual';
  domainExpertise: DomainExpertise[];
  responseStyle: 'concise' | 'detailed' | 'conversational';
  
  // Métricas operacionais
  avgLatencyMs: number;
  successRate: number;
  costPer1kTokens: CostBreakdown;
  
  // Conformidade e segurança
  dataResidency: string[];
  complianceStandards: ComplianceStandard[];
  safetyFilters: SafetyLevel;
}

export interface DomainExpertise {
  domain: string;
  confidence: number;
  specialties: string[];
}

export interface CostBreakdown {
  inputPer1k: number;
  outputPer1k: number;
  currency: string;
}

export interface ComplianceStandard {
  standard: string;
  level: 'basic' | 'intermediate' | 'advanced';
  certifications: string[];
}

export interface SafetyLevel {
  contentFiltering: 'basic' | 'intermediate' | 'advanced';
  piiProtection: boolean;
  dataRetention: number; // dias
}

export interface ProviderConfig {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'google' | 'mistral' | 'groq' | 'self-hosted';
  enabled: boolean;
  capabilities: ProviderCapabilities;
  config: {
    apiKey?: string;
    baseUrl?: string;
    model: string;
    temperature: number;
    maxTokens: number;
  };
  limits: {
    requestsPerMinute: number;
    tokensPerMinute: number;
    maxConcurrentRequests: number;
  };
  fallbackPriority: number;
}

export interface ContextualFeatures {
  // Análise linguística
  language: 'pt-BR' | 'en' | 'mixed';
  complexity: 'simple' | 'moderate' | 'complex';
  domain: 'educational' | 'technical' | 'conversational';
  
  // Características da tarefa
  requiresJsonStrict: boolean;
  requiresToolUse: boolean;
  requiresStreaming: boolean;
  contextLength: number;
  
  // Perfil do usuário
  userType: 'student' | 'teacher' | 'admin';
  sessionHistory: SessionContext;
  preferences: UserPreferences;
  
  // Fatores temporais
  timeOfDay: 'peak' | 'off-peak';
  dayOfWeek: 'weekday' | 'weekend';
  systemLoad: 'low' | 'medium' | 'high';
}

export interface SessionContext {
  module: string;
  previousInteractions: number;
  averageResponseTime: number;
  userSatisfaction: number;
}

export interface UserPreferences {
  preferredResponseStyle: 'concise' | 'detailed';
  maxResponseTime: number;
  costSensitivity: 'low' | 'medium' | 'high';
}

export interface ProviderScore {
  providerId: string;
  score: number;
  reasoning: string;
  estimatedMetrics: {
    latency: number;
    cost: number;
    quality: number;
  };
}

export interface RoutingDecision {
  selectedProvider: string;
  confidence: number;
  reasoning: string;
  alternatives: ProviderScore[];
  fallbackChain: string[];
  estimatedMetrics: {
    latency: number;
    cost: number;
    quality: number;
  };
}

export interface RouterConfig {
  mode: 'shadow' | 'canary' | 'auto';
  canaryPercentage: number;
  weights: {
    quality: number;
    speed: number;
    cost: number;
    reliability: number;
  };
  budgets: {
    perSession: number;
    perUserDaily: number;
    perModule: Record<string, number>;
  };
  safetyThresholds: {
    jsonValidity: number;
    responseTimeout: number;
    costAlert: number;
  };
}

export interface RouterMetrics {
  timestamp: Date;
  requestId: string;
  module: string;
  selectedProvider: string;
  alternatives: ProviderScore[];
  actualMetrics: {
    latency: number;
    cost: number;
    success: boolean;
    jsonValid: boolean;
    userSatisfaction?: number;
  };
  shadowComparison?: {
    recommendedProvider: string;
    actualProvider: string;
    performanceGap: number;
  };
}

export interface SafetyValidation {
  passed: boolean;
  issues: SafetyIssue[];
  recommendations: string[];
}

export interface SafetyIssue {
  type: 'pii' | 'content' | 'compliance' | 'json' | 'timeout';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestion: string;
}

export interface RouterResponse {
  success: boolean;
  content: string;
  provider: string;
  metrics: {
    latency: number;
    cost: number;
    tokens: {
      input: number;
      output: number;
      total: number;
    };
  };
  safety: SafetyValidation;
  trace: RouterMetrics;
}
