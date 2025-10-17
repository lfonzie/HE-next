// lib/cache/aiCache.ts
import Redis from 'ioredis';

// Configuração do Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

// Classe para gerenciar cache de IA
export class AICache {
  private static instance: AICache;
  private redis: Redis;
  private isConnected: boolean = false;

  constructor() {
    this.redis = redis;
    this.connect();
  }

  // Singleton pattern
  static getInstance(): AICache {
    if (!AICache.instance) {
      AICache.instance = new AICache();
    }
    return AICache.instance;
  }

  // Conectar ao Redis
  private async connect(): Promise<void> {
    try {
      await this.redis.connect();
      this.isConnected = true;
      console.log('✅ Redis connected successfully');
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      this.isConnected = false;
    }
  }

  // Verificar se está conectado
  private async ensureConnection(): Promise<boolean> {
    if (!this.isConnected) {
      await this.connect();
    }
    return this.isConnected;
  }

  // Gerar chave de cache
  static generateKey(prompt: string, model: string, options?: any): string {
    const promptHash = Buffer.from(prompt).toString('base64').substring(0, 32);
    const optionsHash = options ? Buffer.from(JSON.stringify(options)).toString('base64').substring(0, 16) : '';
    return `ai:${model}:${promptHash}:${optionsHash}`;
  }

  // Obter valor do cache
  async get(key: string): Promise<any | null> {
    try {
      if (!(await this.ensureConnection())) {
        return null;
      }

      const cached = await this.redis.get(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        
        // Verificar se não expirou
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          await this.redis.del(key);
          return null;
        }
        
        return parsed.data;
      }
      
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Definir valor no cache
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      if (!(await this.ensureConnection())) {
        return;
      }

      const cacheData = {
        data: value,
        timestamp: Date.now(),
        expiresAt: Date.now() + (ttl * 1000)
      };

      await this.redis.setex(key, ttl, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // Deletar chave do cache
  async delete(key: string): Promise<void> {
    try {
      if (!(await this.ensureConnection())) {
        return;
      }

      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  // Limpar cache por padrão
  async clearPattern(pattern: string): Promise<void> {
    try {
      if (!(await this.ensureConnection())) {
        return;
      }

      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache clear pattern error:', error);
    }
  }

  // Obter estatísticas do cache
  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate: number;
    connected: boolean;
  }> {
    try {
      if (!(await this.ensureConnection())) {
        return {
          totalKeys: 0,
          memoryUsage: '0B',
          hitRate: 0,
          connected: false
        };
      }

      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');
      
      // Parse memory usage
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memoryUsage = memoryMatch ? memoryMatch[1] : '0B';
      
      // Parse total keys
      const keysMatch = keyspace.match(/keys=(\d+)/);
      const totalKeys = keysMatch ? parseInt(keysMatch[1]) : 0;
      
      return {
        totalKeys,
        memoryUsage,
        hitRate: 0, // Seria necessário implementar contadores
        connected: true
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return {
        totalKeys: 0,
        memoryUsage: '0B',
        hitRate: 0,
        connected: false
      };
    }
  }

  // Cache específico para efeitos visuais
  async getVisualEffects(reaction: any, step: string, parameters: any): Promise<any | null> {
    const key = AICache.generateKey(
      `visual-effects:${JSON.stringify({ reaction, step, parameters })}`,
      'grok-4-fast'
    );
    return this.get(key);
  }

  async setVisualEffects(reaction: any, step: string, parameters: any, effects: any, ttl: number = 3600): Promise<void> {
    const key = AICache.generateKey(
      `visual-effects:${JSON.stringify({ reaction, step, parameters })}`,
      'grok-4-fast'
    );
    return this.set(key, effects, ttl);
  }

  // Cache específico para predição de reações
  async getReactionPrediction(reactants: string[], conditions: any): Promise<any | null> {
    const key = AICache.generateKey(
      `reaction-prediction:${JSON.stringify({ reactants, conditions })}`,
      'grok-4-fast'
    );
    return this.get(key);
  }

  async setReactionPrediction(reactants: string[], conditions: any, prediction: any, ttl: number = 7200): Promise<void> {
    const key = AICache.generateKey(
      `reaction-prediction:${JSON.stringify({ reactants, conditions })}`,
      'grok-4-fast'
    );
    return this.set(key, prediction, ttl);
  }

  // Cache específico para guias de IA
  async getAIGuide(experimentId: string, question: string): Promise<any | null> {
    const key = AICache.generateKey(
      `ai-guide:${experimentId}:${question}`,
      'grok-4-fast'
    );
    return this.get(key);
  }

  async setAIGuide(experimentId: string, question: string, guide: any, ttl: number = 1800): Promise<void> {
    const key = AICache.generateKey(
      `ai-guide:${experimentId}:${question}`,
      'grok-4-fast'
    );
    return this.set(key, guide, ttl);
  }

  // Cache específico para cálculos físicos
  async getPhysicsCalculation(type: string, parameters: any): Promise<any | null> {
    const key = AICache.generateKey(
      `physics:${type}:${JSON.stringify(parameters)}`,
      'calculation'
    );
    return this.get(key);
  }

  async setPhysicsCalculation(type: string, parameters: any, result: any, ttl: number = 86400): Promise<void> {
    const key = AICache.generateKey(
      `physics:${type}:${JSON.stringify(parameters)}`,
      'calculation'
    );
    return this.set(key, result, ttl);
  }

  // Fechar conexão
  async close(): Promise<void> {
    try {
      await this.redis.quit();
      this.isConnected = false;
    } catch (error) {
      console.error('Redis close error:', error);
    }
  }
}

// Instância singleton
export const aiCache = AICache.getInstance();

// Funções utilitárias para cache
export const cacheUtils = {
  // Gerar chave para efeitos visuais
  generateVisualEffectsKey: (reaction: any, step: string, parameters: any) => {
    return AICache.generateKey(
      `visual-effects:${JSON.stringify({ reaction, step, parameters })}`,
      'grok-4-fast'
    );
  },

  // Gerar chave para predição de reações
  generateReactionPredictionKey: (reactants: string[], conditions: any) => {
    return AICache.generateKey(
      `reaction-prediction:${JSON.stringify({ reactants, conditions })}`,
      'grok-4-fast'
    );
  },

  // Gerar chave para guia de IA
  generateAIGuideKey: (experimentId: string, question: string) => {
    return AICache.generateKey(
      `ai-guide:${experimentId}:${question}`,
      'grok-4-fast'
    );
  },

  // Gerar chave para cálculo físico
  generatePhysicsCalculationKey: (type: string, parameters: any) => {
    return AICache.generateKey(
      `physics:${type}:${JSON.stringify(parameters)}`,
      'calculation'
    );
  },

  // Limpar cache por experimento
  clearExperimentCache: async (experimentId: string) => {
    await aiCache.clearPattern(`ai:*:${experimentId}:*`);
  },

  // Limpar cache por modelo
  clearModelCache: async (model: string) => {
    await aiCache.clearPattern(`ai:${model}:*`);
  },

  // Limpar todo o cache de IA
  clearAllAICache: async () => {
    await aiCache.clearPattern('ai:*');
  }
};

// Middleware para cache automático
export const withCache = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  ttl: number = 3600
) => {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args);
    
    // Tentar obter do cache
    const cached = await aiCache.get(key);
    if (cached) {
      return cached;
    }
    
    // Executar função e cachear resultado
    const result = await fn(...args);
    await aiCache.set(key, result, ttl);
    
    return result;
  };
};

// Decorator para métodos de classe
export const cached = (keyGenerator: (...args: any[]) => string, ttl: number = 3600) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      const key = keyGenerator(...args);
      
      // Tentar obter do cache
      const cached = await aiCache.get(key);
      if (cached) {
        return cached;
      }
      
      // Executar método e cachear resultado
      const result = await method.apply(this, args);
      await aiCache.set(key, result, ttl);
      
      return result;
    };
    
    return descriptor;
  };
};

export default aiCache;
