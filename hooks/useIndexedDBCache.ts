/**
 * React Hook for IndexedDB Cache Integration
 * Provides seamless integration between React components and persistent cache
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  lessonCache, 
  progressCache, 
  imageCache, 
  cacheManager,
  CacheStats 
} from '@/lib/cache/indexeddb-cache';

export interface CacheStatus {
  isInitialized: boolean;
  isOnline: boolean;
  storageUsed: number;
  storageQuota: number;
  stats: Record<string, CacheStats>;
}

export interface UseCacheOptions {
  autoInitialize?: boolean;
  enableOfflineMode?: boolean;
  onCacheUpdate?: (key: string, data: any) => void;
  onCacheError?: (error: Error) => void;
}

export function useIndexedDBCache(options: UseCacheOptions = {}) {
  const {
    autoInitialize = true,
    enableOfflineMode = true,
    onCacheUpdate,
    onCacheError
  } = options;

  const [status, setStatus] = useState<CacheStatus>({
    isInitialized: false,
    isOnline: navigator.onLine,
    storageUsed: 0,
    storageQuota: 0,
    stats: {}
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const initializedRef = useRef(false);

  // Initialize cache on mount
  useEffect(() => {
    if (autoInitialize && !initializedRef.current) {
      initializeCache();
    }
  }, [autoInitialize]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initializeCache = useCallback(async () => {
    if (initializedRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      await cacheManager.initializeAll();
      const stats = cacheManager.getStats();
      const storageInfo = await lessonCache.getStorageInfo();

      setStatus(prev => ({
        ...prev,
        isInitialized: true,
        storageUsed: storageInfo.used,
        storageQuota: storageInfo.quota,
        stats
      }));

      initializedRef.current = true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize cache');
      setError(error);
      onCacheError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [onCacheError]);

  const cacheLesson = useCallback(async (lessonId: string, lessonData: any) => {
    try {
      await lessonCache.cacheLesson(lessonId, lessonData);
      onCacheUpdate?.(lessonId, lessonData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to cache lesson');
      setError(error);
      onCacheError?.(error);
    }
  }, [onCacheUpdate, onCacheError]);

  const getLesson = useCallback(async (lessonId: string) => {
    try {
      return await lessonCache.getLesson(lessonId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get lesson from cache');
      setError(error);
      onCacheError?.(error);
      return null;
    }
  }, [onCacheError]);

  const cacheSlide = useCallback(async (lessonId: string, slideIndex: number, slideData: any) => {
    try {
      await lessonCache.cacheSlide(lessonId, slideIndex, slideData);
      onCacheUpdate?.(`${lessonId}:slide:${slideIndex}`, slideData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to cache slide');
      setError(error);
      onCacheError?.(error);
    }
  }, [onCacheUpdate, onCacheError]);

  const getSlide = useCallback(async (lessonId: string, slideIndex: number) => {
    try {
      return await lessonCache.getSlide(lessonId, slideIndex);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get slide from cache');
      setError(error);
      onCacheError?.(error);
      return null;
    }
  }, [onCacheError]);

  const saveProgress = useCallback(async (userId: string, lessonId: string, progress: any) => {
    try {
      await progressCache.saveProgress(userId, lessonId, progress);
      onCacheUpdate?.(`${userId}:${lessonId}`, progress);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save progress');
      setError(error);
      onCacheError?.(error);
    }
  }, [onCacheUpdate, onCacheError]);

  const getProgress = useCallback(async (userId: string, lessonId: string) => {
    try {
      return await progressCache.getProgress(userId, lessonId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get progress from cache');
      setError(error);
      onCacheError?.(error);
      return null;
    }
  }, [onCacheError]);

  const cacheImage = useCallback(async (url: string, imageData: Blob) => {
    try {
      await imageCache.cacheImage(url, imageData);
      onCacheUpdate?.(url, imageData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to cache image');
      setError(error);
      onCacheError?.(error);
    }
  }, [onCacheUpdate, onCacheError]);

  const getImage = useCallback(async (url: string) => {
    try {
      return await imageCache.getImage(url);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get image from cache');
      setError(error);
      onCacheError?.(error);
      return null;
    }
  }, [onCacheError]);

  const cleanupCache = useCallback(async () => {
    try {
      await cacheManager.cleanupAll();
      const stats = cacheManager.getStats();
      setStatus(prev => ({ ...prev, stats }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to cleanup cache');
      setError(error);
      onCacheError?.(error);
    }
  }, [onCacheError]);

  const clearCache = useCallback(async () => {
    try {
      await cacheManager.clearAll();
      const stats = cacheManager.getStats();
      setStatus(prev => ({ ...prev, stats }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to clear cache');
      setError(error);
      onCacheError?.(error);
    }
  }, [onCacheError]);

  const refreshStats = useCallback(async () => {
    try {
      const stats = cacheManager.getStats();
      const storageInfo = await lessonCache.getStorageInfo();
      setStatus(prev => ({
        ...prev,
        storageUsed: storageInfo.used,
        storageQuota: storageInfo.quota,
        stats
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refresh stats');
      setError(error);
      onCacheError?.(error);
    }
  }, [onCacheError]);

  return {
    // Status
    status,
    isLoading,
    error,
    
    // Cache operations
    cacheLesson,
    getLesson,
    cacheSlide,
    getSlide,
    saveProgress,
    getProgress,
    cacheImage,
    getImage,
    
    // Cache management
    cleanupCache,
    clearCache,
    refreshStats,
    initializeCache
  };
}

// Specialized hook for lesson caching
export function useLessonCache(lessonId: string) {
  const cache = useIndexedDBCache();
  const [lessonData, setLessonData] = useState<any>(null);
  const [isCached, setIsCached] = useState(false);

  const loadLesson = useCallback(async () => {
    if (!cache.status.isInitialized) return;

    const cached = await cache.getLesson(lessonId);
    if (cached) {
      setLessonData(cached);
      setIsCached(true);
    } else {
      setIsCached(false);
    }
  }, [lessonId, cache]);

  const saveLesson = useCallback(async (data: any) => {
    await cache.cacheLesson(lessonId, data);
    setLessonData(data);
    setIsCached(true);
  }, [lessonId, cache]);

  useEffect(() => {
    if (cache.status.isInitialized) {
      loadLesson();
    }
  }, [loadLesson, cache.status.isInitialized]);

  return {
    lessonData,
    isCached,
    loadLesson,
    saveLesson,
    isLoading: cache.isLoading,
    error: cache.error
  };
}

// Specialized hook for progress tracking
export function useProgressCache(userId: string, lessonId: string) {
  const cache = useIndexedDBCache();
  const [progress, setProgress] = useState<any>(null);

  const loadProgress = useCallback(async () => {
    if (!cache.status.isInitialized) return;

    const cached = await cache.getProgress(userId, lessonId);
    setProgress(cached);
  }, [userId, lessonId, cache]);

  const saveProgress = useCallback(async (progressData: any) => {
    await cache.saveProgress(userId, lessonId, progressData);
    setProgress(progressData);
  }, [userId, lessonId, cache]);

  useEffect(() => {
    if (cache.status.isInitialized) {
      loadProgress();
    }
  }, [loadProgress, cache.status.isInitialized]);

  return {
    progress,
    loadProgress,
    saveProgress,
    isLoading: cache.isLoading,
    error: cache.error
  };
}

// Hook for offline-first lesson loading
export function useOfflineLesson(lessonId: string) {
  const cache = useIndexedDBCache({ enableOfflineMode: true });
  const [lessonData, setLessonData] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const loadLesson = useCallback(async () => {
    // Try cache first
    const cached = await cache.getLesson(lessonId);
    if (cached) {
      setLessonData(cached);
      return cached;
    }

    // If online, try to fetch from server
    if (!isOffline) {
      try {
        const response = await fetch(`/api/aulas/${lessonId}`);
        if (response.ok) {
          const data = await response.json();
          await cache.cacheLesson(lessonId, data);
          setLessonData(data);
          return data;
        }
      } catch (error) {
        console.warn('Failed to fetch lesson from server:', error);
      }
    }

    return null;
  }, [lessonId, cache, isOffline]);

  useEffect(() => {
    if (cache.status.isInitialized) {
      loadLesson();
    }
  }, [loadLesson, cache.status.isInitialized]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    lessonData,
    isOffline,
    loadLesson,
    isLoading: cache.isLoading,
    error: cache.error
  };
}


