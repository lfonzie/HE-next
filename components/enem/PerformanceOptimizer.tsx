"use client"

import { useEffect, useRef, useCallback, useState } from 'react'

interface PerformanceOptimizerProps {
  questions: any[]
  currentIndex: number
  preloadCount?: number
  onPreloadComplete?: (index: number) => void
}

/**
 * Performance optimization component for ENEM simulator
 * Handles image preloading, question preloading, and lazy loading
 */
export function PerformanceOptimizer({ 
  questions, 
  currentIndex, 
  preloadCount = 3,
  onPreloadComplete 
}: PerformanceOptimizerProps) {
  const preloadedImages = useRef<Set<string>>(new Set())
  const preloadedQuestions = useRef<Set<number>>(new Set())

  // Preload images for upcoming questions
  const preloadImages = useCallback(async (questionIndex: number) => {
    const question = questions[questionIndex]
    if (!question || !question.image_url) return

    const imageUrl = question.image_url
    if (preloadedImages.current.has(imageUrl)) return

    try {
      const img = new Image()
      img.onload = () => {
        preloadedImages.current.add(imageUrl)
        onPreloadComplete?.(questionIndex)
      }
      img.onerror = () => {
        console.warn(`Failed to preload image: ${imageUrl}`)
      }
      img.src = imageUrl
    } catch (error) {
      console.warn(`Error preloading image: ${imageUrl}`, error)
    }
  }, [questions, onPreloadComplete])

  // Preload questions data
  const preloadQuestion = useCallback((questionIndex: number) => {
    if (preloadedQuestions.current.has(questionIndex)) return
    
    const question = questions[questionIndex]
    if (!question) return

    // Simulate question data processing
    try {
      // This could include data sanitization, validation, etc.
      preloadedQuestions.current.add(questionIndex)
      onPreloadComplete?.(questionIndex)
    } catch (error) {
      console.warn(`Error preloading question ${questionIndex}:`, error)
    }
  }, [questions, onPreloadComplete])

  // Main preloading effect
  useEffect(() => {
    const preloadRange = Math.min(preloadCount, questions.length - currentIndex)
    
    for (let i = 1; i <= preloadRange; i++) {
      const nextIndex = currentIndex + i
      if (nextIndex < questions.length) {
        preloadImages(nextIndex)
        preloadQuestion(nextIndex)
      }
    }
  }, [currentIndex, questions.length, preloadCount, preloadImages, preloadQuestion])

  return null // This component doesn't render anything
}

/**
 * Hook for managing performance optimizations
 */
export function usePerformanceOptimization() {
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map())
  const questionCache = useRef<Map<string, any>>(new Map())

  const preloadImage = useCallback((url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      if (imageCache.current.has(url)) {
        resolve(imageCache.current.get(url)!)
        return
      }

      const img = new Image()
      img.onload = () => {
        imageCache.current.set(url, img)
        resolve(img)
      }
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`))
      }
      img.src = url
    })
  }, [])

  const preloadQuestion = useCallback((questionId: string, questionData: any) => {
    questionCache.current.set(questionId, questionData)
  }, [])

  const getCachedQuestion = useCallback((questionId: string) => {
    return questionCache.current.get(questionId)
  }, [])

  const clearCache = useCallback(() => {
    imageCache.current.clear()
    questionCache.current.clear()
  }, [])

  return {
    preloadImage,
    preloadQuestion,
    getCachedQuestion,
    clearCache
  }
}

/**
 * Lazy loading wrapper for components
 */
interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
}

export function LazyWrapper({ 
  children, 
  fallback = <div className="animate-pulse bg-gray-200 h-32 rounded" />,
  threshold = 0.1 
}: LazyWrapperProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  )
}

/**
 * Virtual scrolling for large question lists
 */
interface VirtualScrollProps {
  items: any[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: any, index: number) => React.ReactNode
}

export function VirtualScroll({ 
  items, 
  itemHeight, 
  containerHeight, 
  renderItem 
}: VirtualScrollProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  )

  const visibleItems = items.slice(visibleStart, visibleEnd)
  const offsetY = visibleStart * itemHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => 
            renderItem(item, visibleStart + index)
          )}
        </div>
      </div>
    </div>
  )
}
