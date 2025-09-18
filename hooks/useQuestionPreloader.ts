'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { EnemItem } from '@/types/enem'

// Preloader State Interface
interface PreloaderState {
  loadedQuestions: Map<number, EnemItem>
  loadingQuestions: Set<number>
  preloadQueue: number[]
  isPreloading: boolean
  cache: Map<string, EnemItem>
}

// Preloader Configuration
interface PreloaderConfig {
  preloadCount: number // Number of questions to preload ahead
  maxCacheSize: number // Maximum number of questions to keep in cache
  preloadDelay: number // Delay before starting preload (ms)
  enableImagePreload: boolean // Whether to preload images
  enableAssetPreload: boolean // Whether to preload other assets
}

// Default Configuration
const DEFAULT_CONFIG: PreloaderConfig = {
  preloadCount: 3,
  maxCacheSize: 10,
  preloadDelay: 500,
  enableImagePreload: true,
  enableAssetPreload: true
}

export function useQuestionPreloader(
  questions: EnemItem[],
  config: Partial<PreloaderConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  
  const [state, setState] = useState<PreloaderState>({
    loadedQuestions: new Map(),
    loadingQuestions: new Set(),
    preloadQueue: [],
    isPreloading: false,
    cache: new Map()
  })

  const preloadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Preload a single question
  const preloadQuestion = useCallback(async (index: number): Promise<EnemItem | null> => {
    if (index < 0 || index >= questions.length) return null
    
    // Check if already loaded
    if (state.loadedQuestions.has(index)) {
      return state.loadedQuestions.get(index)!
    }

    // Check if already loading
    if (state.loadingQuestions.has(index)) {
      return null
    }

    // Check cache
    const cacheKey = `question_${index}`
    if (state.cache.has(cacheKey)) {
      const cachedQuestion = state.cache.get(cacheKey)!
      setState(prev => ({
        ...prev,
        loadedQuestions: new Map(prev.loadedQuestions.set(index, cachedQuestion))
      }))
      return cachedQuestion
    }

    // Mark as loading
    setState(prev => ({
      ...prev,
      loadingQuestions: new Set(prev.loadingQuestions.add(index))
    }))

    try {
      const question = questions[index]
      
      // Simulate loading delay (in real implementation, this would be an API call)
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Preload images if enabled
      if (finalConfig.enableImagePreload && question.asset_refs) {
        await preloadImages(question.asset_refs)
      }

      // Preload other assets if enabled
      if (finalConfig.enableAssetPreload) {
        await preloadAssets(question)
      }

      // Update state
      setState(prev => {
        const newLoadedQuestions = new Map(prev.loadedQuestions.set(index, question))
        const newLoadingQuestions = new Set(prev.loadingQuestions)
        newLoadingQuestions.delete(index)
        
        // Update cache
        const newCache = new Map(prev.cache.set(cacheKey, question))
        
        // Limit cache size
        if (newCache.size > finalConfig.maxCacheSize) {
          const firstKey = newCache.keys().next().value
          newCache.delete(firstKey)
        }

        return {
          ...prev,
          loadedQuestions: newLoadedQuestions,
          loadingQuestions: newLoadingQuestions,
          cache: newCache
        }
      })

      return question
    } catch (error) {
      console.error(`Failed to preload question ${index}:`, error)
      
      setState(prev => {
        const newLoadingQuestions = new Set(prev.loadingQuestions)
        newLoadingQuestions.delete(index)
        return {
          ...prev,
          loadingQuestions: newLoadingQuestions
        }
      })
      
      return null
    }
  }, [questions, state.loadedQuestions, state.loadingQuestions, state.cache, finalConfig])

  // Preload multiple questions
  const preloadQuestions = useCallback(async (indices: number[]): Promise<EnemItem[]> => {
    const results = await Promise.allSettled(
      indices.map(index => preloadQuestion(index))
    )
    
    return results
      .filter((result): result is PromiseFulfilledResult<EnemItem> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value)
  }, [preloadQuestion])

  // Preload next questions based on current position
  const preloadNext = useCallback((currentIndex: number) => {
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current)
    }

    preloadTimeoutRef.current = setTimeout(async () => {
      const nextIndices = Array.from(
        { length: finalConfig.preloadCount },
        (_, i) => currentIndex + i + 1
      ).filter(index => index < questions.length && !state.loadedQuestions.has(index))

      if (nextIndices.length > 0) {
        setState(prev => ({
          ...prev,
          isPreloading: true,
          preloadQueue: nextIndices
        }))

        await preloadQuestions(nextIndices)

        setState(prev => ({
          ...prev,
          isPreloading: false,
          preloadQueue: []
        }))
      }
    }, finalConfig.preloadDelay)
  }, [questions.length, state.loadedQuestions, finalConfig.preloadCount, finalConfig.preloadDelay, preloadQuestions])

  // Preload previous questions
  const preloadPrevious = useCallback((currentIndex: number) => {
    const previousIndices = Array.from(
      { length: Math.min(finalConfig.preloadCount, currentIndex) },
      (_, i) => currentIndex - i - 1
    ).filter(index => index >= 0 && !state.loadedQuestions.has(index))

    if (previousIndices.length > 0) {
      preloadQuestions(previousIndices)
    }
  }, [state.loadedQuestions, finalConfig.preloadCount, preloadQuestions])

  // Preload images
  const preloadImages = useCallback(async (imageUrls: string[]): Promise<void> => {
    const imagePromises = imageUrls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
        img.src = url
      })
    })

    await Promise.allSettled(imagePromises)
  }, [])

  // Preload other assets
  const preloadAssets = useCallback(async (question: EnemItem): Promise<void> => {
    // Preload any additional assets like audio, video, etc.
    // This is a placeholder for future asset types
    const assetPromises: Promise<void>[] = []

    // Example: preload audio files if they exist
    if (question.metadata?.audio_url) {
      const audioPromise = new Promise<void>((resolve, reject) => {
        const audio = new Audio()
        audio.oncanplaythrough = () => resolve()
        audio.onerror = () => reject(new Error(`Failed to load audio: ${question.metadata.audio_url}`))
        audio.src = question.metadata.audio_url
        audio.load()
      })
      assetPromises.push(audioPromise)
    }

    await Promise.allSettled(assetPromises)
  }, [])

  // Get preloaded question
  const getPreloadedQuestion = useCallback((index: number): EnemItem | null => {
    return state.loadedQuestions.get(index) || null
  }, [state.loadedQuestions])

  // Check if question is loaded
  const isQuestionLoaded = useCallback((index: number): boolean => {
    return state.loadedQuestions.has(index)
  }, [state.loadedQuestions])

  // Check if question is loading
  const isQuestionLoading = useCallback((index: number): boolean => {
    return state.loadingQuestions.has(index)
  }, [state.loadingQuestions])

  // Clear cache
  const clearCache = useCallback(() => {
    setState(prev => ({
      ...prev,
      loadedQuestions: new Map(),
      loadingQuestions: new Set(),
      cache: new Map()
    }))
  }, [])

  // Preload all questions (for offline mode)
  const preloadAll = useCallback(async (): Promise<void> => {
    const allIndices = Array.from({ length: questions.length }, (_, i) => i)
    
    setState(prev => ({
      ...prev,
      isPreloading: true
    }))

    try {
      await preloadQuestions(allIndices)
    } finally {
      setState(prev => ({
        ...prev,
        isPreloading: false
      }))
    }
  }, [questions.length, preloadQuestions])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Computed values
  const loadedCount = state.loadedQuestions.size
  const loadingCount = state.loadingQuestions.size
  const cacheSize = state.cache.size
  const preloadProgress = questions.length > 0 ? (loadedCount / questions.length) * 100 : 0

  return {
    // State
    loadedCount,
    loadingCount,
    cacheSize,
    preloadProgress,
    isPreloading: state.isPreloading,
    preloadQueue: state.preloadQueue,

    // Actions
    preloadQuestion,
    preloadQuestions,
    preloadNext,
    preloadPrevious,
    preloadAll,
    getPreloadedQuestion,
    clearCache,

    // Utilities
    isQuestionLoaded,
    isQuestionLoading,

    // Configuration
    config: finalConfig
  }
}

// Hook for progressive loading with intelligent preloading
export function useProgressiveQuestionLoader(
  questions: EnemItem[],
  currentIndex: number,
  config: Partial<PreloaderConfig> = {}
) {
  const preloader = useQuestionPreloader(questions, config)

  // Auto-preload based on current position
  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < questions.length) {
      // Preload next questions
      preloader.preloadNext(currentIndex)
      
      // Preload previous questions
      preloader.preloadPrevious(currentIndex)
    }
  }, [currentIndex, questions.length, preloader])

  return preloader
}

