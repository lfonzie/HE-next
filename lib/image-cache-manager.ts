// lib/image-cache-manager.ts - Image cache management and invalidation

export interface CacheInvalidationOptions {
  clearAll?: boolean
  clearByTheme?: string
  clearBySubject?: string
  clearByQuery?: string
  forceRefresh?: boolean
}

export interface CacheStats {
  totalEntries: number
  expiredEntries: number
  memoryUsage: string
  hitRate: number
  lastCleanup: Date
}

class ImageCacheManager {
  private readonly CACHE_KEY_PREFIX = 'enhanced_image_cache_'
  private readonly STATS_KEY = 'image_cache_stats'
  private readonly MAX_CACHE_SIZE = 50
  private readonly CACHE_EXPIRY = 30 * 60 * 1000 // 30 minutes

  /**
   * Clear specific cache entries based on criteria
   */
  clearCache(options: CacheInvalidationOptions = {}): void {
    const { clearAll, clearByTheme, clearBySubject, clearByQuery, forceRefresh } = options

    if (clearAll) {
      this.clearAllCache()
      return
    }

    const keysToRemove: string[] = []
    const now = Date.now()

    // Iterate through all cache entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(this.CACHE_KEY_PREFIX)) continue

      try {
        const entry = JSON.parse(localStorage.getItem(key) || '{}')
        
        // Check if entry should be removed
        let shouldRemove = false

        if (forceRefresh) {
          shouldRemove = true
        } else if (clearByTheme && entry.theme?.toLowerCase().includes(clearByTheme.toLowerCase())) {
          shouldRemove = true
        } else if (clearBySubject && entry.subject?.toLowerCase().includes(clearBySubject.toLowerCase())) {
          shouldRemove = true
        } else if (clearByQuery && entry.query?.toLowerCase().includes(clearByQuery.toLowerCase())) {
          shouldRemove = true
        } else if (entry.expiresAt && entry.expiresAt <= now) {
          shouldRemove = true
        }

        if (shouldRemove) {
          keysToRemove.push(key)
        }
      } catch (error) {
        // Remove corrupted entries
        keysToRemove.push(key)
      }
    }

    // Remove selected keys
    keysToRemove.forEach(key => localStorage.removeItem(key))

    console.log(`🧹 Cache cleanup: removed ${keysToRemove.length} entries`)
    this.updateStats({ removedEntries: keysToRemove.length })
  }

  /**
   * Clear all image cache entries
   */
  private clearAllCache(): void {
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.CACHE_KEY_PREFIX)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key))
    localStorage.removeItem(this.STATS_KEY)

    console.log(`🧹 Cache cleared: removed ${keysToRemove.length} entries`)
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    const stats = this.loadStats()
    const now = Date.now()
    let totalEntries = 0
    let expiredEntries = 0

    // Count cache entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(this.CACHE_KEY_PREFIX)) continue

      totalEntries++
      
      try {
        const entry = JSON.parse(localStorage.getItem(key) || '{}')
        if (entry.expiresAt && entry.expiresAt <= now) {
          expiredEntries++
        }
      } catch {
        expiredEntries++
      }
    }

    return {
      totalEntries,
      expiredEntries,
      memoryUsage: this.calculateMemoryUsage(),
      hitRate: stats.hitRate,
      lastCleanup: new Date(stats.lastCleanup || 0)
    }
  }

  /**
   * Invalidate cache for specific lesson theme
   */
  invalidateThemeCache(theme: string): void {
    this.clearCache({ clearByTheme: theme })
    console.log(`🎯 Cache invalidated for theme: ${theme}`)
  }

  /**
   * Invalidate cache for specific subject
   */
  invalidateSubjectCache(subject: string): void {
    this.clearCache({ clearBySubject: subject })
    console.log(`📚 Cache invalidated for subject: ${subject}`)
  }

  /**
   * Force refresh cache for specific query
   */
  forceRefreshQuery(query: string): void {
    this.clearCache({ clearByQuery: query, forceRefresh: true })
    console.log(`🔄 Force refresh for query: ${query}`)
  }

  /**
   * Clean up expired entries
   */
  cleanupExpiredEntries(): void {
    this.clearCache({})
    console.log('🧹 Expired cache entries cleaned up')
  }

  /**
   * Check if cache is healthy
   */
  isCacheHealthy(): boolean {
    const stats = this.getCacheStats()
    const expiredRatio = stats.expiredEntries / Math.max(stats.totalEntries, 1)
    
    return expiredRatio < 0.5 && stats.totalEntries < this.MAX_CACHE_SIZE
  }

  /**
   * Get cache recommendations
   */
  getCacheRecommendations(): string[] {
    const stats = this.getCacheStats()
    const recommendations: string[] = []

    if (stats.expiredEntries > stats.totalEntries * 0.3) {
      recommendations.push('Consider cleaning up expired entries')
    }

    if (stats.totalEntries > this.MAX_CACHE_SIZE * 0.8) {
      recommendations.push('Cache is getting large, consider cleanup')
    }

    if (stats.hitRate < 0.5) {
      recommendations.push('Low cache hit rate, check cache strategy')
    }

    return recommendations
  }

  /**
   * Load cache statistics
   */
  private loadStats(): any {
    try {
      const stats = localStorage.getItem(this.STATS_KEY)
      return stats ? JSON.parse(stats) : { hitRate: 0, lastCleanup: 0 }
    } catch {
      return { hitRate: 0, lastCleanup: 0 }
    }
  }

  /**
   * Update cache statistics
   */
  private updateStats(updates: any): void {
    try {
      const stats = this.loadStats()
      const newStats = { ...stats, ...updates, lastCleanup: Date.now() }
      localStorage.setItem(this.STATS_KEY, JSON.stringify(newStats))
    } catch (error) {
      console.warn('Failed to update cache stats:', error)
    }
  }

  /**
   * Calculate memory usage estimate
   */
  private calculateMemoryUsage(): string {
    let totalSize = 0
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.CACHE_KEY_PREFIX)) {
        const value = localStorage.getItem(key) || ''
        totalSize += key.length + value.length
      }
    }

    if (totalSize < 1024) {
      return `${totalSize} B`
    } else if (totalSize < 1024 * 1024) {
      return `${(totalSize / 1024).toFixed(1)} KB`
    } else {
      return `${(totalSize / (1024 * 1024)).toFixed(1)} MB`
    }
  }

  /**
   * Schedule automatic cleanup
   */
  scheduleCleanup(): void {
    // Clean up every hour
    setInterval(() => {
      if (!this.isCacheHealthy()) {
        this.cleanupExpiredEntries()
      }
    }, 60 * 60 * 1000)
  }
}

export const imageCacheManager = new ImageCacheManager()

// Auto-cleanup on page load
if (typeof window !== 'undefined') {
  imageCacheManager.scheduleCleanup()
}
