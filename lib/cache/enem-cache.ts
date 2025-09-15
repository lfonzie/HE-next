import { Question } from '@/lib/stores/enem-simulation-store';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
}

export class EnemCache {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      cleanupInterval: 60 * 1000, // 1 minute
      ...config
    };

    this.startCleanupTimer();
  }

  private startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private cleanup() {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));

    // If cache is still too large, remove least recently used entries
    if (this.cache.size > this.config.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, this.cache.size - this.config.maxSize);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      hits: 0
    };

    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
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

  getStats() {
    const entries = Array.from(this.cache.values());
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const avgHits = entries.length > 0 ? totalHits / entries.length : 0;

    return {
      size: this.cache.size,
      totalHits,
      avgHits,
      maxSize: this.config.maxSize
    };
  }

  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

// Question-specific cache utilities
export class QuestionCache {
  private cache: EnemCache;

  constructor() {
    this.cache = new EnemCache({
      maxSize: 500,
      defaultTTL: 10 * 60 * 1000, // 10 minutes for questions
      cleanupInterval: 2 * 60 * 1000 // 2 minutes cleanup
    });
  }

  generateKey(area: string, config: any): string {
    const configStr = JSON.stringify({
      area,
      years: config.years?.sort(),
      difficulty: config.difficulty?.sort(),
      skill_tags: config.skill_tags?.sort(),
      count: config.count
    });
    
    return `questions:${btoa(configStr)}`;
  }

  setQuestions(key: string, questions: Question[]): void {
    this.cache.set(key, questions, 10 * 60 * 1000); // 10 minutes TTL
  }

  getQuestions(key: string): Question[] | null {
    return this.cache.get<Question[]>(key);
  }

  setBatch(batchKey: string, questions: Question[], batchNumber: number): void {
    const key = `${batchKey}:batch:${batchNumber}`;
    this.cache.set(key, questions, 15 * 60 * 1000); // 15 minutes TTL for batches
  }

  getBatch(batchKey: string, batchNumber: number): Question[] | null {
    const key = `${batchKey}:batch:${batchNumber}`;
    return this.cache.get<Question[]>(key);
  }

  invalidateArea(area: string): void {
    const keys = Array.from((this.cache as any).cache.keys());
    keys.forEach(key => {
      if (key.includes(`area:${area}`) || key.includes(`questions:`)) {
        this.cache.delete(key);
      }
    });
  }

  getStats() {
    return this.cache.getStats();
  }

  clear() {
    this.cache.clear();
  }
}

// Singleton instances
export const questionCache = new QuestionCache();
export const generalCache = new EnemCache({
  maxSize: 200,
  defaultTTL: 5 * 60 * 1000,
  cleanupInterval: 60 * 1000
});

// Cache key generators
export const CacheKeys = {
  questions: (area: string, config: any) => 
    questionCache.generateKey(area, config),
  
  batch: (examId: string, batchNumber: number) => 
    `batch:${examId}:${batchNumber}`,
  
  exam: (examId: string) => 
    `exam:${examId}`,
  
  userStats: (userId: string) => 
    `stats:${userId}`,
  
  areaInfo: (area: string) => 
    `area:${area}`,
  
  modeInfo: (mode: string) => 
    `mode:${mode}`
};
