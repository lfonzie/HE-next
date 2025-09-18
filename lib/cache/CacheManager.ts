"use client"

import { EventEmitter } from 'events'

export interface CacheEntry<T = any> {
  key: string
  value: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
  size: number
  metadata?: Record<string, any>
}

export interface CacheConfig {
  maxSize: number
  defaultTTL: number
  enableCompression: boolean
  enableEncryption: boolean
  compressionThreshold: number
  encryptionKey?: string
  enableMetrics: boolean
  enablePersistence: boolean
  persistenceKey: string
  cleanupInterval: number
  maxAge: number
}

export interface CacheMetrics {
  hits: number
  misses: number
  sets: number
  deletes: number
  evictions: number
  totalSize: number
  hitRate: number
  averageAccessTime: number
  compressionRatio: number
  encryptionOverhead: number
}

export interface InvalidationRule {
  pattern: string
  condition: (key: string, entry: CacheEntry) => boolean
  action: 'delete' | 'refresh' | 'expire'
}

export class CacheManager<T = any> extends EventEmitter {
  private cache: Map<string, CacheEntry<T>> = new Map()
  private config: CacheConfig
  private metrics: CacheMetrics
  private invalidationRules: InvalidationRule[] = []
  private cleanupInterval: NodeJS.Timeout | null = null
  private accessTimes: number[] = []

  constructor(config: Partial<CacheConfig> = {}) {
    super()
    
    this.config = {
      maxSize: 1000,
      defaultTTL: 300000, // 5 minutes
      enableCompression: true,
      enableEncryption: false,
      compressionThreshold: 1024, // 1KB
      enableMetrics: true,
      enablePersistence: true,
      persistenceKey: 'cache-data',
      cleanupInterval: 60000, // 1 minute
      maxAge: 3600000, // 1 hour
      ...config
    }

    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      totalSize: 0,
      hitRate: 0,
      averageAccessTime: 0,
      compressionRatio: 0,
      encryptionOverhead: 0
    }

    this.startCleanup()
    this.loadFromPersistence()
  }

  // Public methods
  async get(key: string): Promise<T | null> {
    const startTime = Date.now()
    
    try {
      const entry = this.cache.get(key)
      
      if (!entry) {
        this.metrics.misses++
        this.updateHitRate()
        this.emit('cacheMiss', { key })
        return null
      }

      // Check if expired
      if (this.isExpired(entry)) {
        this.delete(key)
        this.metrics.misses++
        this.updateHitRate()
        this.emit('cacheExpired', { key, entry })
        return null
      }

      // Update access info
      entry.accessCount++
      entry.lastAccessed = Date.now()
      
      this.metrics.hits++
      this.updateHitRate()
      this.updateAccessTime(Date.now() - startTime)
      
      this.emit('cacheHit', { key, entry })
      
      // Return value (decompress/decrypt if needed)
      return await this.processValue(entry.value, 'get')
    } catch (error) {
      console.error('Error getting cache entry:', error)
      this.emit('cacheError', { key, error })
      return null
    }
  }

  async set(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const startTime = Date.now()
      
      // Process value (compress/encrypt if needed)
      const processedValue = await this.processValue(value, 'set')
      
      // Calculate size
      const size = this.calculateSize(processedValue)
      
      // Check if we need to evict
      if (this.cache.size >= this.config.maxSize) {
        await this.evict()
      }

      // Create entry
      const entry: CacheEntry<T> = {
        key,
        value: processedValue,
        timestamp: Date.now(),
        ttl: ttl || this.config.defaultTTL,
        accessCount: 0,
        lastAccessed: Date.now(),
        size,
        metadata: {
          originalSize: this.calculateSize(value),
          compressionRatio: this.config.enableCompression ? size / this.calculateSize(value) : 1,
          encryptionOverhead: this.config.enableEncryption ? 0.1 : 0
        }
      }

      this.cache.set(key, entry)
      this.metrics.sets++
      this.updateTotalSize()
      
      this.emit('cacheSet', { key, entry })
      
      // Save to persistence
      if (this.config.enablePersistence) {
        this.saveToPersistence()
      }

      return true
    } catch (error) {
      console.error('Error setting cache entry:', error)
      this.emit('cacheError', { key, error })
      return false
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const entry = this.cache.get(key)
      if (!entry) {
        return false
      }

      this.cache.delete(key)
      this.metrics.deletes++
      this.updateTotalSize()
      
      this.emit('cacheDelete', { key, entry })
      
      // Save to persistence
      if (this.config.enablePersistence) {
        this.saveToPersistence()
      }

      return true
    } catch (error) {
      console.error('Error deleting cache entry:', error)
      this.emit('cacheError', { key, error })
      return false
    }
  }

  async clear(): Promise<void> {
    try {
      this.cache.clear()
      this.metrics.totalSize = 0
      
      this.emit('cacheClear')
      
      // Clear persistence
      if (this.config.enablePersistence) {
        this.clearPersistence()
      }
    } catch (error) {
      console.error('Error clearing cache:', error)
      this.emit('cacheError', { error })
    }
  }

  async invalidate(pattern: string): Promise<number> {
    try {
      let invalidatedCount = 0
      const regex = new RegExp(pattern)
      
      for (const [key, entry] of this.cache) {
        if (regex.test(key)) {
          await this.delete(key)
          invalidatedCount++
        }
      }
      
      this.emit('cacheInvalidated', { pattern, count: invalidatedCount })
      return invalidatedCount
    } catch (error) {
      console.error('Error invalidating cache:', error)
      this.emit('cacheError', { error })
      return 0
    }
  }

  async refresh(key: string, refreshFn: () => Promise<T>, ttl?: number): Promise<T | null> {
    try {
      const value = await refreshFn()
      await this.set(key, value, ttl)
      return value
    } catch (error) {
      console.error('Error refreshing cache entry:', error)
      this.emit('cacheError', { key, error })
      return null
    }
  }

  async getOrSet(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T | null> {
    try {
      const cached = await this.get(key)
      if (cached !== null) {
        return cached
      }

      const value = await fetchFn()
      await this.set(key, value, ttl)
      return value
    } catch (error) {
      console.error('Error in getOrSet:', error)
      this.emit('cacheError', { key, error })
      return null
    }
  }

  // Cache management
  addInvalidationRule(rule: InvalidationRule): void {
    this.invalidationRules.push(rule)
    this.emit('invalidationRuleAdded', { rule })
  }

  removeInvalidationRule(pattern: string): boolean {
    const index = this.invalidationRules.findIndex(rule => rule.pattern === pattern)
    if (index !== -1) {
      this.invalidationRules.splice(index, 1)
      this.emit('invalidationRuleRemoved', { pattern })
      return true
    }
    return false
  }

  // Private methods
  private async evict(): Promise<void> {
    if (this.cache.size === 0) return

    // LRU eviction
    const entries = Array.from(this.cache.entries())
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
    
    const toEvict = entries.slice(0, Math.ceil(this.config.maxSize * 0.1)) // Evict 10%
    
    for (const [key] of toEvict) {
      await this.delete(key)
      this.metrics.evictions++
    }

    this.emit('cacheEvicted', { count: toEvict.length })
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  private async processValue(value: T, operation: 'get' | 'set'): Promise<T> {
    let processedValue = value

    if (operation === 'set') {
      // Compress if enabled and above threshold
      if (this.config.enableCompression && this.calculateSize(value) > this.config.compressionThreshold) {
        processedValue = await this.compress(processedValue)
      }

      // Encrypt if enabled
      if (this.config.enableEncryption && this.config.encryptionKey) {
        processedValue = await this.encrypt(processedValue)
      }
    } else if (operation === 'get') {
      // Decrypt if enabled
      if (this.config.enableEncryption && this.config.encryptionKey) {
        processedValue = await this.decrypt(processedValue)
      }

      // Decompress if needed
      if (this.config.enableCompression && this.isCompressed(processedValue)) {
        processedValue = await this.decompress(processedValue)
      }
    }

    return processedValue
  }

  private calculateSize(value: any): number {
    try {
      return JSON.stringify(value).length * 2 // Rough estimate in bytes
    } catch (error) {
      return 0
    }
  }

  private async compress(value: T): Promise<T> {
    // Simple compression placeholder - replace with actual compression
    return value
  }

  private async decompress(value: T): Promise<T> {
    // Simple decompression placeholder - replace with actual decompression
    return value
  }

  private async encrypt(value: T): Promise<T> {
    // Simple encryption placeholder - replace with actual encryption
    return value
  }

  private async decrypt(value: T): Promise<T> {
    // Simple decryption placeholder - replace with actual decryption
    return value
  }

  private isCompressed(value: any): boolean {
    // Simple check - replace with actual compression detection
    return false
  }

  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses
    this.metrics.hitRate = total > 0 ? this.metrics.hits / total : 0
  }

  private updateAccessTime(accessTime: number): void {
    this.accessTimes.push(accessTime)
    if (this.accessTimes.length > 100) {
      this.accessTimes.shift()
    }
    
    this.metrics.averageAccessTime = 
      this.accessTimes.reduce((sum, time) => sum + time, 0) / this.accessTimes.length
  }

  private updateTotalSize(): void {
    this.metrics.totalSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0)
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  private cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, entry] of this.cache) {
      // Check expiration
      if (this.isExpired(entry)) {
        expiredKeys.push(key)
        continue
      }

      // Check max age
      if (now - entry.timestamp > this.config.maxAge) {
        expiredKeys.push(key)
        continue
      }

      // Check invalidation rules
      for (const rule of this.invalidationRules) {
        if (new RegExp(rule.pattern).test(key) && rule.condition(key, entry)) {
          if (rule.action === 'delete') {
            expiredKeys.push(key)
          } else if (rule.action === 'expire') {
            entry.ttl = 0 // Mark as expired
            expiredKeys.push(key)
          }
          // 'refresh' action would trigger a refresh, not implemented here
        }
      }
    }

    // Remove expired entries
    expiredKeys.forEach(key => {
      this.cache.delete(key)
      this.metrics.evictions++
    })

    if (expiredKeys.length > 0) {
      this.updateTotalSize()
      this.emit('cacheCleanup', { expiredCount: expiredKeys.length })
    }
  }

  private async loadFromPersistence(): Promise<void> {
    if (!this.config.enablePersistence || typeof window === 'undefined') {
      return
    }

    try {
      const stored = localStorage.getItem(this.config.persistenceKey)
      if (stored) {
        const data = JSON.parse(stored)
        const now = Date.now()
        
        for (const [key, entry] of Object.entries(data)) {
          const cacheEntry = entry as CacheEntry<T>
          
          // Check if still valid
          if (now - cacheEntry.timestamp < cacheEntry.ttl) {
            this.cache.set(key, cacheEntry)
          }
        }
        
        this.updateTotalSize()
        this.emit('cacheLoaded', { count: this.cache.size })
      }
    } catch (error) {
      console.error('Error loading cache from persistence:', error)
      this.emit('cacheError', { error })
    }
  }

  private async saveToPersistence(): Promise<void> {
    if (!this.config.enablePersistence || typeof window === 'undefined') {
      return
    }

    try {
      const data = Object.fromEntries(this.cache)
      localStorage.setItem(this.config.persistenceKey, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving cache to persistence:', error)
      this.emit('cacheError', { error })
    }
  }

  private async clearPersistence(): Promise<void> {
    if (!this.config.enablePersistence || typeof window === 'undefined') {
      return
    }

    try {
      localStorage.removeItem(this.config.persistenceKey)
    } catch (error) {
      console.error('Error clearing cache persistence:', error)
      this.emit('cacheError', { error })
    }
  }

  // Public getters
  getSize(): number {
    return this.cache.size
  }

  getMaxSize(): number {
    return this.config.maxSize
  }

  getMetrics(): CacheMetrics {
    return { ...this.metrics }
  }

  getConfig(): CacheConfig {
    return { ...this.config }
  }

  getKeys(): string[] {
    return Array.from(this.cache.keys())
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    return entry !== undefined && !this.isExpired(entry)
  }

  // Configuration methods
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.emit('configUpdated', { config: this.config })
  }

  // Cleanup
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }

    this.cache.clear()
    this.invalidationRules = []
    this.removeAllListeners()
  }
}

// Singleton instances for different cache types
const cacheInstances: Map<string, CacheManager> = new Map()

export function getCacheManager<T = any>(
  name: string = 'default',
  config?: Partial<CacheConfig>
): CacheManager<T> {
  if (!cacheInstances.has(name)) {
    cacheInstances.set(name, new CacheManager<T>(config))
  }
  return cacheInstances.get(name) as CacheManager<T>
}

export function destroyCacheManager(name: string): void {
  const cache = cacheInstances.get(name)
  if (cache) {
    cache.destroy()
    cacheInstances.delete(name)
  }
}

export function destroyAllCacheManagers(): void {
  cacheInstances.forEach(cache => cache.destroy())
  cacheInstances.clear()
}


