// Sistema de cache agressivo para reduzir latência

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
  lastAccessed: number;
}

class AggressiveCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize: number = 200, defaultTTL: number = 1800000) { // 30 min default
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      hits: 0,
      lastAccessed: Date.now()
    };

    this.cache.set(key, entry);

    // Limitar tamanho do cache
    if (this.cache.size > this.maxSize) {
      this.evictLeastUsed();
    }
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verificar TTL
    const ttl = this.defaultTTL;
    if (Date.now() - entry.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }

    // Atualizar estatísticas
    entry.hits++;
    entry.lastAccessed = Date.now();

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getStats(): { size: number; hits: number; mostUsed: string[] } {
    const entries = Array.from(this.cache.entries());
    const totalHits = entries.reduce((sum, [, entry]) => sum + entry.hits, 0);
    const mostUsed = entries
      .sort(([, a], [, b]) => b.hits - a.hits)
      .slice(0, 5)
      .map(([key]) => key);

    return {
      size: this.cache.size,
      hits: totalHits,
      mostUsed
    };
  }

  private evictLeastUsed(): void {
    const entries = Array.from(this.cache.entries());
    const leastUsed = entries.reduce((min, current) => {
      const [, minEntry] = min;
      const [, currentEntry] = current;
      return currentEntry.hits < minEntry.hits ? current : min;
    });

    this.cache.delete(leastUsed[0]);
  }
}

// Instâncias globais de cache
export const classificationCache = new AggressiveCache<any>(100, 1800000); // 30 min
export const orchestratorCache = new AggressiveCache<any>(50, 1800000); // 30 min
export const modelConfigCache = new AggressiveCache<any>(20, 3600000); // 1 hora
export const responseCache = new AggressiveCache<string>(200, 900000); // 15 min

// Função para gerar chave de cache inteligente
export function generateCacheKey(
  message: string, 
  module: string, 
  historyLength: number = 0,
  additionalContext?: Record<string, any>
): string {
  const baseKey = `${message.toLowerCase().trim()}_${module}_${historyLength}`;
  
  if (additionalContext) {
    const contextStr = Object.entries(additionalContext)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
    return `${baseKey}_${contextStr}`;
  }
  
  return baseKey;
}

// Função para limpar todos os caches
export function clearAllCaches(): void {
  classificationCache.clear();
  orchestratorCache.clear();
  modelConfigCache.clear();
  responseCache.clear();
  console.log('🧹 [AGGRESSIVE-CACHE] Todos os caches foram limpos');
}

// Função para obter estatísticas de todos os caches
export function getCacheStats(): Record<string, any> {
  return {
    classification: classificationCache.getStats(),
    orchestrator: orchestratorCache.getStats(),
    modelConfig: modelConfigCache.getStats(),
    response: responseCache.getStats()
  };
}
