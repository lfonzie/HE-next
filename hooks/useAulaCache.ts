'use client'

import { useState, useCallback, useEffect } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

interface CacheStats {
  hits: number
  misses: number
  size: number
  lastCleanup: number
}

class AulaCache {
  private cache = new Map<string, CacheEntry<any>>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    lastCleanup: Date.now()
  }

  private readonly DEFAULT_TTL = 30 * 60 * 1000 // 30 minutes
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000 // 5 minutes

  constructor() {
    // Start cleanup interval
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL)
  }

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
    this.stats.size = this.cache.size
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.size = this.cache.size
      return null
    }

    this.stats.hits++
    return entry.data
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.size = this.cache.size
      return false
    }

    return true
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    this.stats.size = this.cache.size
    return deleted
  }

  clear(): void {
    this.cache.clear()
    this.stats.size = 0
  }

  private cleanup(): void {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleanedCount++
      }
    }

    this.stats.size = this.cache.size
    this.stats.lastCleanup = now

    if (cleanedCount > 0) {
      console.log(`🧹 Cache cleanup: removed ${cleanedCount} expired entries`)
    }
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  // Lesson-specific cache methods
  setLesson(lessonId: string, lessonData: any, ttl?: number): void {
    this.set(`lesson_${lessonId}`, lessonData, ttl)
  }

  getLesson(lessonId: string): any | null {
    return this.get(`lesson_${lessonId}`)
  }

  hasLesson(lessonId: string): boolean {
    return this.has(`lesson_${lessonId}`)
  }

  // Suggestions cache
  setSuggestions(suggestions: any[], ttl?: number): void {
    this.set('suggestions', suggestions, ttl)
  }

  getSuggestions(): any[] | null {
    return this.get('suggestions')
  }

  hasSuggestions(): boolean {
    return this.has('suggestions')
  }

  // Progress cache
  setProgress(lessonId: string, progress: any, ttl?: number): void {
    this.set(`progress_${lessonId}`, progress, ttl)
  }

  getProgress(lessonId: string): any | null {
    return this.get(`progress_${lessonId}`)
  }
}

// Singleton instance
const aulaCache = new AulaCache()

export function useAulaCache() {
  const [stats, setStats] = useState<CacheStats>(aulaCache.getStats())

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(aulaCache.getStats())
    }, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const setLesson = useCallback((lessonId: string, lessonData: any, ttl?: number) => {
    aulaCache.setLesson(lessonId, lessonData, ttl)
    setStats(aulaCache.getStats())
  }, [])

  const getLesson = useCallback((lessonId: string) => {
    const lesson = aulaCache.getLesson(lessonId)
    setStats(aulaCache.getStats())
    return lesson
  }, [])

  const hasLesson = useCallback((lessonId: string) => {
    const has = aulaCache.hasLesson(lessonId)
    setStats(aulaCache.getStats())
    return has
  }, [])

  const setSuggestions = useCallback((suggestions: any[], ttl?: number) => {
    aulaCache.setSuggestions(suggestions, ttl)
    setStats(aulaCache.getStats())
  }, [])

  const getSuggestions = useCallback(() => {
    const suggestions = aulaCache.getSuggestions()
    setStats(aulaCache.getStats())
    return suggestions
  }, [])

  const hasSuggestions = useCallback(() => {
    const has = aulaCache.hasSuggestions()
    setStats(aulaCache.getStats())
    return has
  }, [])

  const setProgress = useCallback((lessonId: string, progress: any, ttl?: number) => {
    aulaCache.setProgress(lessonId, progress, ttl)
    setStats(aulaCache.getStats())
  }, [])

  const getProgress = useCallback((lessonId: string) => {
    const progress = aulaCache.getProgress(lessonId)
    setStats(aulaCache.getStats())
    return progress
  }, [])

  const clearCache = useCallback(() => {
    aulaCache.clear()
    setStats(aulaCache.getStats())
  }, [])

  const clearLesson = useCallback((lessonId: string) => {
    aulaCache.delete(`lesson_${lessonId}`)
    setStats(aulaCache.getStats())
  }, [])

  return {
    // Lesson methods
    setLesson,
    getLesson,
    hasLesson,
    clearLesson,
    
    // Suggestions methods
    setSuggestions,
    getSuggestions,
    hasSuggestions,
    
    // Progress methods
    setProgress,
    getProgress,
    
    // Cache management
    clearCache,
    stats
  }
}

// Export singleton for direct access
export { aulaCache }


