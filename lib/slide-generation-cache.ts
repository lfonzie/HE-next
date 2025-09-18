// lib/slide-generation-cache.ts - Sistema de cache e deduplicação para geração de slides
import { log } from '@/lib/lesson-logger';

interface SlideGenerationRequest {
  topic: string;
  slideNumber: number;
  lessonId?: string;
  schoolId?: string;
  customPrompt?: string;
}

interface SlideGenerationResult {
  slide: any;
  timestamp: number;
  requestId: string;
  usage: any;
}

interface PendingRequest {
  promise: Promise<SlideGenerationResult>;
  timestamp: number;
  requestId: string;
}

export class SlideGenerationCache {
  private static instance: SlideGenerationCache;
  private cache: Map<string, SlideGenerationResult> = new Map();
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  private readonly MAX_CACHE_SIZE = 1000; // Máximo de 1000 slides em cache

  static getInstance(): SlideGenerationCache {
    if (!SlideGenerationCache.instance) {
      SlideGenerationCache.instance = new SlideGenerationCache();
    }
    return SlideGenerationCache.instance;
  }

  private constructor() {
    // Limpar cache periodicamente
    setInterval(() => this.cleanup(), 60000); // A cada minuto
  }

  /**
   * Gera uma chave única para a requisição
   */
  private generateCacheKey(request: SlideGenerationRequest): string {
    const { topic, slideNumber, lessonId, schoolId, customPrompt } = request;
    return `${topic}_${slideNumber}_${lessonId || 'no-lesson'}_${schoolId || 'no-school'}_${customPrompt || 'default'}`;
  }

  /**
   * Verifica se uma requisição está em andamento
   */
  private isRequestPending(cacheKey: string): boolean {
    const pending = this.pendingRequests.get(cacheKey);
    if (!pending) return false;

    // Verificar se a requisição não expirou (timeout de 30 segundos)
    const isExpired = Date.now() - pending.timestamp > 30000;
    if (isExpired) {
      this.pendingRequests.delete(cacheKey);
      return false;
    }

    return true;
  }

  /**
   * Verifica se um resultado está em cache e ainda é válido
   */
  private isCachedResultValid(cacheKey: string): boolean {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;

    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(cacheKey);
      return false;
    }

    return true;
  }

  /**
   * Obtém um slide do cache ou inicia uma nova geração
   */
  async getOrGenerateSlide(
    request: SlideGenerationRequest,
    generationFunction: (request: SlideGenerationRequest) => Promise<SlideGenerationResult>
  ): Promise<SlideGenerationResult> {
    const cacheKey = this.generateCacheKey(request);
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const baseContext = {
      requestId,
      topic: request.topic,
      slideNumber: request.slideNumber,
      schoolId: request.schoolId,
      timestamp: new Date().toISOString()
    };

    // 1. Verificar se já está em cache
    if (this.isCachedResultValid(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      log.info('📋 Slide encontrado em cache', baseContext, {
        cacheKey,
        age: Date.now() - cached.timestamp
      });
      return cached;
    }

    // 2. Verificar se já está sendo gerado
    if (this.isRequestPending(cacheKey)) {
      const pending = this.pendingRequests.get(cacheKey)!;
      log.info('⏳ Aguardando geração em andamento', baseContext, {
        cacheKey,
        pendingRequestId: pending.requestId,
        waitTime: Date.now() - pending.timestamp
      });
      return pending.promise;
    }

    // 3. Iniciar nova geração
    log.info('🚀 Iniciando nova geração de slide', baseContext, {
      cacheKey,
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size
    });

    const generationPromise = this.executeGeneration(request, generationFunction, baseContext);
    
    // Registrar como requisição pendente
    this.pendingRequests.set(cacheKey, {
      promise: generationPromise,
      timestamp: Date.now(),
      requestId
    });

    try {
      const result = await generationPromise;
      
      // Armazenar no cache
      this.cache.set(cacheKey, result);
      
      // Limpar requisição pendente
      this.pendingRequests.delete(cacheKey);
      
      // Verificar limite de cache
      if (this.cache.size > this.MAX_CACHE_SIZE) {
        this.evictOldestEntries();
      }

      log.success('✅ Slide gerado e armazenado em cache', baseContext, {
        cacheKey,
        cacheSize: this.cache.size,
        generationTime: Date.now() - result.timestamp
      });

      return result;
    } catch (error) {
      // Limpar requisição pendente em caso de erro
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }

  /**
   * Executa a geração do slide
   */
  private async executeGeneration(
    request: SlideGenerationRequest,
    generationFunction: (request: SlideGenerationRequest) => Promise<SlideGenerationResult>,
    baseContext: any
  ): Promise<SlideGenerationResult> {
    const startTime = Date.now();
    
    try {
      const result = await generationFunction(request);
      
      return {
        ...result,
        timestamp: startTime
      };
    } catch (error) {
      log.error('❌ Erro na geração do slide', baseContext, {
        error: error.message,
        generationTime: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Remove as entradas mais antigas do cache
   */
  private evictOldestEntries(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.2)); // Remove 20%
    toRemove.forEach(([key]) => this.cache.delete(key));
    
    log.info('🧹 Cache limpo', {}, {
      removedEntries: toRemove.length,
      remainingEntries: this.cache.size
    });
  }

  /**
   * Limpa o cache periodicamente
   */
  private cleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    // Limpar requisições pendentes expiradas
    for (const [key, pending] of this.pendingRequests.entries()) {
      if (now - pending.timestamp > 30000) { // 30 segundos
        this.pendingRequests.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      log.info('🧹 Limpeza automática do cache', {}, {
        removedEntries: removedCount,
        cacheSize: this.cache.size,
        pendingRequests: this.pendingRequests.size
      });
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats(): {
    cacheSize: number;
    pendingRequests: number;
    hitRate: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    const entries = Array.from(this.cache.values());
    const timestamps = entries.map(e => e.timestamp);
    
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      hitRate: 0, // TODO: Implementar tracking de hit rate
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0
    };
  }

  /**
   * Limpa todo o cache (para testes ou reset manual)
   */
  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    log.info('🧹 Cache completamente limpo', {}, {});
  }

  /**
   * Remove uma entrada específica do cache
   */
  removeFromCache(request: SlideGenerationRequest): boolean {
    const cacheKey = this.generateCacheKey(request);
    return this.cache.delete(cacheKey);
  }
}

// Instância singleton
export const slideGenerationCache = SlideGenerationCache.getInstance();
