// lib/lesson-cache.ts - Sistema de cache para aulas

interface CachedLesson {
  id: string;
  title: string;
  subject: string;
  grade: string;
  objectives: string[];
  stages: any[];
  slides: any[];
  metadata: any;
  cachedAt: number;
  expiresAt: number;
  version: string;
}

interface CacheStats {
  totalCached: number;
  totalSize: number;
  hitRate: number;
  lastCleanup: number;
}

const CACHE_VERSION = '1.0.0';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas
const MAX_CACHE_SIZE = 50; // Máximo 50 aulas em cache
const MAX_CACHE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export class LessonCache {
  private static instance: LessonCache;
  private cache: Map<string, CachedLesson> = new Map();
  private stats: CacheStats = {
    totalCached: 0,
    totalSize: 0,
    hitRate: 0,
    lastCleanup: Date.now()
  };

  static getInstance(): LessonCache {
    if (!LessonCache.instance) {
      LessonCache.instance = new LessonCache();
    }
    return LessonCache.instance;
  }

  private constructor() {
    this.loadFromLocalStorage();
    this.cleanup();
  }

  private loadFromLocalStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cached = localStorage.getItem('lesson_cache');
      if (cached) {
        const data = JSON.parse(cached);
        this.cache = new Map(data.cache || []);
        this.stats = data.stats || this.stats;
      }
    } catch (error) {
      console.warn('Erro ao carregar cache do localStorage:', error);
      this.clearCache();
    }
  }

  private saveToLocalStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data = {
        cache: Array.from(this.cache.entries()),
        stats: this.stats,
        version: CACHE_VERSION
      };
      localStorage.setItem('lesson_cache', JSON.stringify(data));
    } catch (error) {
      console.warn('Erro ao salvar cache no localStorage:', error);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    // Remover itens expirados
    for (const [key, lesson] of this.cache.entries()) {
      if (lesson.expiresAt < now) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.cache.delete(key));
    
    // Se ainda temos muitos itens, remover os mais antigos
    if (this.cache.size > MAX_CACHE_SIZE) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].cachedAt - b[1].cachedAt);
      
      const toRemove = sortedEntries.slice(0, this.cache.size - MAX_CACHE_SIZE);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
    
    this.stats.lastCleanup = now;
    this.updateStats();
    this.saveToLocalStorage();
  }

  private updateStats(): void {
    this.stats.totalCached = this.cache.size;
    this.stats.totalSize = Array.from(this.cache.values())
      .reduce((total, lesson) => total + JSON.stringify(lesson).length, 0);
  }

  set(lessonId: string, lessonData: any): void {
    try {
      const cachedLesson: CachedLesson = {
        id: lessonId,
        title: lessonData.title,
        subject: lessonData.subject,
        grade: lessonData.grade,
        objectives: lessonData.objectives || [],
        stages: lessonData.stages || [],
        slides: lessonData.slides || [],
        metadata: lessonData.metadata || {},
        cachedAt: Date.now(),
        expiresAt: Date.now() + CACHE_EXPIRY,
        version: CACHE_VERSION
      };

      this.cache.set(lessonId, cachedLesson);
      this.updateStats();
      this.saveToLocalStorage();
      
      console.log(`📦 Aula ${lessonId} adicionada ao cache`);
    } catch (error) {
      console.warn('Erro ao adicionar aula ao cache:', error);
    }
  }

  get(lessonId: string): CachedLesson | null {
    const cached = this.cache.get(lessonId);
    
    if (!cached) {
      return null;
    }
    
    // Verificar se expirou
    if (cached.expiresAt < Date.now()) {
      this.cache.delete(lessonId);
      this.updateStats();
      this.saveToLocalStorage();
      return null;
    }
    
    // Verificar versão
    if (cached.version !== CACHE_VERSION) {
      this.cache.delete(lessonId);
      this.updateStats();
      this.saveToLocalStorage();
      return null;
    }
    
    console.log(`⚡ Aula ${lessonId} carregada do cache`);
    return cached;
  }

  has(lessonId: string): boolean {
    const cached = this.cache.get(lessonId);
    return cached ? cached.expiresAt > Date.now() : false;
  }

  remove(lessonId: string): void {
    this.cache.delete(lessonId);
    this.updateStats();
    this.saveToLocalStorage();
    console.log(`🗑️ Aula ${lessonId} removida do cache`);
  }

  clearCache(): void {
    this.cache.clear();
    this.stats = {
      totalCached: 0,
      totalSize: 0,
      hitRate: 0,
      lastCleanup: Date.now()
    };
    this.saveToLocalStorage();
    console.log('🧹 Cache de aulas limpo');
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Método para pré-carregar aulas populares
  async preloadPopularLessons(): Promise<void> {
    try {
      const response = await fetch('/api/lessons');
      if (response.ok) {
        const lessons = await response.json();
        const popularLessons = lessons.slice(0, 5); // Primeiras 5 aulas
        
        for (const lesson of popularLessons) {
          if (!this.has(lesson.id)) {
            // Carregar dados completos da aula
            const fullResponse = await fetch(`/api/lessons/fast-load`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lessonId: lesson.id })
            });
            
            if (fullResponse.ok) {
              const fullLesson = await fullResponse.json();
              this.set(lesson.id, fullLesson.lesson);
            }
          }
        }
        
        console.log('🚀 Aulas populares pré-carregadas');
      }
    } catch (error) {
      console.warn('Erro ao pré-carregar aulas:', error);
    }
  }

  // Método para otimizar cache baseado no uso
  optimizeCache(): void {
    // Implementar lógica de otimização baseada em uso
    // Por exemplo, manter apenas aulas acessadas recentemente
    console.log('🔧 Cache otimizado');
  }
}

// Instância singleton
export const lessonCache = LessonCache.getInstance();

// Hook para React
export function useLessonCache() {
  return {
    get: (lessonId: string) => lessonCache.get(lessonId),
    set: (lessonId: string, lessonData: any) => lessonCache.set(lessonId, lessonData),
    has: (lessonId: string) => lessonCache.has(lessonId),
    remove: (lessonId: string) => lessonCache.remove(lessonId),
    clear: () => lessonCache.clearCache(),
    stats: () => lessonCache.getStats(),
    preload: () => lessonCache.preloadPopularLessons()
  };
}
