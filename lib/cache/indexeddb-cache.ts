/**
 * IndexedDB Persistent Cache System
 * Provides offline storage and retrieval for lessons, slides, and user progress
 */

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
  metadata?: {
    size: number;
    compressed: boolean;
    checksum?: string;
  };
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  lastCleanup: number;
  storageUsed: number;
  storageQuota: number;
}

export interface CacheConfig {
  dbName: string;
  version: number;
  maxSize: number; // in MB
  defaultTTL: number; // in milliseconds
  compressionThreshold: number; // in bytes
}

class IndexedDBCache {
  private db: IDBDatabase | null = null;
  private config: CacheConfig;
  private stats: CacheStats;
  private isInitialized = false;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      dbName: 'he-next-cache',
      version: 1,
      maxSize: 100, // 100MB
      defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
      compressionThreshold: 1024, // 1KB
      ...config
    };

    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      lastCleanup: Date.now(),
      storageUsed: 0,
      storageQuota: 0
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        this.updateStorageInfo();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores for different data types
        if (!db.objectStoreNames.contains('lessons')) {
          const lessonStore = db.createObjectStore('lessons', { keyPath: 'key' });
          lessonStore.createIndex('timestamp', 'timestamp', { unique: false });
          lessonStore.createIndex('ttl', 'ttl', { unique: false });
        }

        if (!db.objectStoreNames.contains('slides')) {
          const slideStore = db.createObjectStore('slides', { keyPath: 'key' });
          slideStore.createIndex('lessonId', 'lessonId', { unique: false });
          slideStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', { keyPath: 'key' });
          progressStore.createIndex('userId', 'userId', { unique: false });
          progressStore.createIndex('lessonId', 'lessonId', { unique: false });
        }

        if (!db.objectStoreNames.contains('images')) {
          const imageStore = db.createObjectStore('images', { keyPath: 'key' });
          imageStore.createIndex('url', 'url', { unique: false });
          imageStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async set<T>(storeName: string, key: string, data: T, ttl?: number): Promise<void> {
    await this.initialize();

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      version: '1.0.0',
      metadata: {
        size: this.calculateSize(data),
        compressed: this.shouldCompress(data),
        checksum: this.calculateChecksum(data)
      }
    };

    // Compress data if needed
    if (entry.metadata!.compressed) {
      entry.data = await this.compress(data) as T;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({ key, ...entry });

      request.onsuccess = () => {
        this.updateStats();
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async get<T>(storeName: string, key: string): Promise<T | null> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        
        if (!result) {
          resolve(null);
          return;
        }

        // Check if entry is expired
        if (this.isExpired(result)) {
          this.delete(storeName, key);
          resolve(null);
          return;
        }

        // Decompress if needed
        if (result.metadata?.compressed) {
          this.decompress(result.data).then(decompressed => {
            resolve(decompressed);
          }).catch(reject);
        } else {
          resolve(result.data);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName?: string): Promise<void> {
    await this.initialize();

    const stores = storeName ? [storeName] : Array.from(this.db!.objectStoreNames);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(stores, 'readwrite');
      let completed = 0;
      let hasError = false;

      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
          completed++;
          if (completed === stores.length && !hasError) {
            resolve();
          }
        };

        request.onerror = () => {
          hasError = true;
          reject(request.error);
        };
      });
    });
  }

  async getAllKeys(storeName: string): Promise<string[]> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        resolve(request.result as string[]);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async cleanup(): Promise<void> {
    await this.initialize();

    const stores = Array.from(this.db!.objectStoreNames);
    const now = Date.now();

    for (const storeName of stores) {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const index = store.index('timestamp');
      const request = index.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const entry = cursor.value;
          if (this.isExpired(entry)) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    }

    this.stats.lastCleanup = now;
  }

  async getStorageInfo(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    return { used: 0, quota: 0 };
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private calculateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  private shouldCompress(data: any): boolean {
    return this.calculateSize(data) > this.config.compressionThreshold;
  }

  private calculateChecksum(data: any): string {
    // Simple checksum for data integrity
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private async compress(data: any): Promise<any> {
    // Simple compression using JSON stringify and gzip
    const jsonString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(jsonString);
    
    // Use CompressionStream if available
    if ('CompressionStream' in window) {
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(dataBytes);
      writer.close();
      
      const chunks: Uint8Array[] = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        compressed.set(chunk, offset);
        offset += chunk.length;
      }
      
      return Array.from(compressed);
    }
    
    // Fallback: return original data
    return data;
  }

  private async decompress(compressedData: any): Promise<any> {
    if (Array.isArray(compressedData) && 'DecompressionStream' in window) {
      const stream = new DecompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(new Uint8Array(compressedData));
      writer.close();
      
      const chunks: Uint8Array[] = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        decompressed.set(chunk, offset);
        offset += chunk.length;
      }
      
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decompressed);
      return JSON.parse(jsonString);
    }
    
    return compressedData;
  }

  private updateStats(): void {
    // Update statistics
    this.stats.totalEntries++;
    // Additional stats updates would go here
  }

  private async updateStorageInfo(): Promise<void> {
    const info = await this.getStorageInfo();
    this.stats.storageUsed = info.used;
    this.stats.storageQuota = info.quota;
  }
}

// Specialized cache classes for different data types
export class LessonCache extends IndexedDBCache {
  constructor() {
    super({
      dbName: 'he-lessons-cache',
      maxSize: 200, // 200MB for lessons
      defaultTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
      compressionThreshold: 2048 // 2KB
    });
  }

  async cacheLesson(lessonId: string, lessonData: any): Promise<void> {
    await this.set('lessons', lessonId, lessonData);
  }

  async getLesson(lessonId: string): Promise<any | null> {
    return await this.get('lessons', lessonId);
  }

  async cacheSlide(lessonId: string, slideIndex: number, slideData: any): Promise<void> {
    const key = `${lessonId}:slide:${slideIndex}`;
    await this.set('slides', key, slideData);
  }

  async getSlide(lessonId: string, slideIndex: number): Promise<any | null> {
    const key = `${lessonId}:slide:${slideIndex}`;
    return await this.get('slides', key);
  }
}

export class ProgressCache extends IndexedDBCache {
  constructor() {
    super({
      dbName: 'he-progress-cache',
      maxSize: 50, // 50MB for progress
      defaultTTL: 30 * 24 * 60 * 60 * 1000, // 30 days
      compressionThreshold: 512 // 512 bytes
    });
  }

  async saveProgress(userId: string, lessonId: string, progress: any): Promise<void> {
    const key = `${userId}:${lessonId}`;
    await this.set('progress', key, progress);
  }

  async getProgress(userId: string, lessonId: string): Promise<any | null> {
    const key = `${userId}:${lessonId}`;
    return await this.get('progress', key);
  }

  async getUserProgress(userId: string): Promise<any[]> {
    const keys = await this.getAllKeys('progress');
    const userKeys = keys.filter(key => key.startsWith(`${userId}:`));
    const progressData = [];

    for (const key of userKeys) {
      const progress = await this.get('progress', key);
      if (progress) {
        progressData.push({ key, ...progress });
      }
    }

    return progressData;
  }
}

export class ImageCache extends IndexedDBCache {
  constructor() {
    super({
      dbName: 'he-images-cache',
      maxSize: 500, // 500MB for images
      defaultTTL: 14 * 24 * 60 * 60 * 1000, // 14 days
      compressionThreshold: 0 // Don't compress images
    });
  }

  async cacheImage(url: string, imageData: Blob): Promise<void> {
    const key = this.generateImageKey(url);
    await this.set('images', key, imageData);
  }

  async getImage(url: string): Promise<Blob | null> {
    const key = this.generateImageKey(url);
    return await this.get('images', key);
  }

  private generateImageKey(url: string): string {
    // Generate a consistent key from URL
    return btoa(url).replace(/[^a-zA-Z0-9]/g, '');
  }
}

// Singleton instances
export const lessonCache = new LessonCache();
export const progressCache = new ProgressCache();
export const imageCache = new ImageCache();

// Cache manager for coordinating all caches
export class CacheManager {
  private static instance: CacheManager;
  private caches: Map<string, IndexedDBCache> = new Map();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  constructor() {
    this.caches.set('lessons', lessonCache);
    this.caches.set('progress', progressCache);
    this.caches.set('images', imageCache);
  }

  async initializeAll(): Promise<void> {
    const promises = Array.from(this.caches.values()).map(cache => cache.initialize());
    await Promise.all(promises);
  }

  async cleanupAll(): Promise<void> {
    const promises = Array.from(this.caches.values()).map(cache => cache.cleanup());
    await Promise.all(promises);
  }

  async clearAll(): Promise<void> {
    const promises = Array.from(this.caches.values()).map(cache => cache.clear());
    await Promise.all(promises);
  }

  getStats(): Record<string, CacheStats> {
    const stats: Record<string, CacheStats> = {};
    for (const [name, cache] of this.caches) {
      stats[name] = cache.getStats();
    }
    return stats;
  }
}

export const cacheManager = CacheManager.getInstance();


