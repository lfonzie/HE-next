// Sistema de cache otimizado para o módulo Professor Interativo

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milliseconds
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  memoryUsage: number;
}

class LessonCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    memoryUsage: 0
  };
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) { // 5 minutos por padrão
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  // Gerar chave de cache baseada em parâmetros
  private generateKey(query: string, subject: string, slideIndex: number): string {
    return `lesson_${query}_${subject}_${slideIndex}`.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  // Verificar se uma entrada está expirada
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  // Limpar entradas expiradas
  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.stats.size--;
      }
    }
  }

  // Implementar LRU (Least Recently Used) eviction
  private evictLRU(): void {
    if (this.cache.size < this.maxSize) return;

    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.size--;
    }
  }

  // Obter dados do cache
  get(query: string, subject: string, slideIndex: number): T | null {
    const key = this.generateKey(query, subject, slideIndex);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size--;
      return null;
    }

    // Atualizar estatísticas de acesso
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;

    return entry.data;
  }

  // Armazenar dados no cache
  set(query: string, subject: string, slideIndex: number, data: T, ttl?: number): void {
    const key = this.generateKey(query, subject, slideIndex);
    
    // Limpar entradas expiradas antes de adicionar nova
    this.cleanupExpired();
    
    // Evict LRU se necessário
    this.evictLRU();

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    this.cache.set(key, entry);
    this.stats.size++;
  }

  // Verificar se existe no cache
  has(query: string, subject: string, slideIndex: number): boolean {
    const key = this.generateKey(query, subject, slideIndex);
    const entry = this.cache.get(key);
    
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.size--;
      return false;
    }
    
    return true;
  }

  // Remover entrada específica
  delete(query: string, subject: string, slideIndex: number): boolean {
    const key = this.generateKey(query, subject, slideIndex);
    const deleted = this.cache.delete(key);
    
    if (deleted) {
      this.stats.size--;
    }
    
    return deleted;
  }

  // Limpar todo o cache
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  // Obter estatísticas do cache
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  // Obter informações sobre entradas do cache
  getCacheInfo(): Array<{
    key: string;
    age: number;
    accessCount: number;
    size: number;
  }> {
    const now = Date.now();
    return Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      accessCount: entry.accessCount,
      size: JSON.stringify(entry.data).length
    }));
  }

  // Pré-aquecer cache com dados conhecidos
  preload(query: string, subject: string, slides: T[]): void {
    slides.forEach((slide, index) => {
      this.set(query, subject, index + 1, slide);
    });
  }

  // Obter tamanho estimado do cache em bytes
  getMemoryUsage(): number {
    let totalSize = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length;
      totalSize += JSON.stringify(entry.data).length;
      totalSize += 100; // Overhead estimado por entrada
    }
    
    this.stats.memoryUsage = totalSize;
    return totalSize;
  }
}

// Instâncias específicas do cache
export const lessonCache = new LessonCache(50, 10 * 60 * 1000); // 10 minutos
export const slideCache = new LessonCache(100, 5 * 60 * 1000); // 5 minutos
export const imageCache = new LessonCache(200, 30 * 60 * 1000); // 30 minutos

// Utilitários para cache
export const cacheUtils = {
  // Gerar chave de cache para diferentes tipos
  generateLessonKey: (query: string, subject: string) => 
    `lesson_${query}_${subject}`.replace(/[^a-zA-Z0-9_]/g, '_'),
  
  generateSlideKey: (query: string, subject: string, slideIndex: number) => 
    `slide_${query}_${subject}_${slideIndex}`.replace(/[^a-zA-Z0-9_]/g, '_'),
  
  generateImageKey: (query: string, slideIndex: number) => 
    `image_${query}_${slideIndex}`.replace(/[^a-zA-Z0-9_]/g, '_'),
  
  // Verificar se dados são válidos para cache
  isValidForCache: (data: any): boolean => {
    if (!data) return false;
    if (typeof data === 'object' && Object.keys(data).length === 0) return false;
    return true;
  },
  
  // Limpar cache por padrão
  clearByPattern: (pattern: string, cache: LessonCache) => {
    const regex = new RegExp(pattern);
    for (const [key] of cache['cache'].entries()) {
      if (regex.test(key)) {
        cache['cache'].delete(key);
        cache['stats'].size--;
      }
    }
  },
  
  // Obter estatísticas combinadas de todos os caches
  getAllStats: () => ({
    lesson: lessonCache.getStats(),
    slide: slideCache.getStats(),
    image: imageCache.getStats(),
    total: {
      hits: lessonCache.getStats().hits + slideCache.getStats().hits + imageCache.getStats().hits,
      misses: lessonCache.getStats().misses + slideCache.getStats().misses + imageCache.getStats().misses,
      size: lessonCache.getStats().size + slideCache.getStats().size + imageCache.getStats().size,
      memoryUsage: lessonCache.getMemoryUsage() + slideCache.getMemoryUsage() + imageCache.getMemoryUsage()
    }
  })
};

export default LessonCache;
