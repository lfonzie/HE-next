'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Image as ImageIcon, RefreshCw } from 'lucide-react'

interface EnhancedImageProps {
  src: string
  alt: string
  title?: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  showRelevanceInfo?: boolean
  relevanceScore?: number
  theme?: string
  englishTheme?: string
  fallback?: boolean
}

export function EnhancedImage({
  src,
  alt,
  title,
  className = '',
  width = 800,
  height = 400,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  showRelevanceInfo = false,
  relevanceScore,
  theme,
  englishTheme,
  fallback = false
}: EnhancedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)

  const maxRetries = 2

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
    setImageLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1)
      setHasError(false)
      setIsLoading(true)
      setImageLoaded(false)
    }
  }

  // Generate blur data URL for better loading experience
  const generateBlurDataURL = () => {
    if (blurDataURL) return blurDataURL
    
    // Create a simple gradient blur placeholder
    const canvas = document.createElement('canvas')
    canvas.width = 10
    canvas.height = 10
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 10, 10)
      gradient.addColorStop(0, '#f3f4f6')
      gradient.addColorStop(1, '#e5e7eb')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 10, 10)
    }
    return canvas.toDataURL()
  }

  const getRelevanceColor = (score?: number) => {
    if (!score) return 'text-gray-500'
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    if (score >= 0.4) return 'text-orange-600'
    return 'text-red-600'
  }

  const getRelevanceLabel = (score?: number) => {
    if (!score) return 'Unknown'
    if (score >= 0.8) return 'Highly Relevant'
    if (score >= 0.6) return 'Relevant'
    if (score >= 0.4) return 'Somewhat Relevant'
    return 'Low Relevance'
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10"
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Loading image...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10"
          >
            <div className="flex flex-col items-center space-y-3 text-center p-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Image failed to load</p>
                <p className="text-xs text-gray-600 mt-1">Unable to display image</p>
              </div>
              {retryCount < maxRetries && (
                <button
                  onClick={handleRetry}
                  className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: imageLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-lg"
      >
        <Image
          src={src}
          alt={alt}
          title={title || alt}
          width={width}
          height={height}
          priority={priority}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={placeholder === 'blur' ? generateBlurDataURL() : undefined}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-transform duration-300 group-hover:scale-105 ${
            hasError ? 'opacity-0' : ''
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </motion.div>

      {/* Relevance Information Overlay */}
      {showRelevanceInfo && !isLoading && !hasError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg p-2 text-white text-xs"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-3 w-3" />
              <span>Image Relevance</span>
            </div>
            <div className={`font-medium ${getRelevanceColor(relevanceScore)}`}>
              {getRelevanceLabel(relevanceScore)}
            </div>
          </div>
          
          {relevanceScore && (
            <div className="mt-1">
              <div className="flex justify-between text-xs">
                <span>Score: {(relevanceScore * 100).toFixed(0)}%</span>
                {fallback && <span className="text-yellow-400">Fallback</span>}
              </div>
              <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                <div
                  className={`h-1 rounded-full transition-all duration-500 ${
                    relevanceScore >= 0.8 ? 'bg-green-500' :
                    relevanceScore >= 0.6 ? 'bg-yellow-500' :
                    relevanceScore >= 0.4 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${relevanceScore * 100}%` }}
                />
              </div>
            </div>
          )}
          
          {(theme || englishTheme) && (
            <div className="mt-1 text-xs text-gray-300">
              <div>Theme: {theme}</div>
              {englishTheme && <div>English: {englishTheme}</div>}
            </div>
          )}
        </motion.div>
      )}

      {/* Accessibility: Screen reader information */}
      <div className="sr-only">
        <p>Image: {alt}</p>
        {title && <p>Title: {title}</p>}
        {relevanceScore && (
          <p>Relevance score: {(relevanceScore * 100).toFixed(0)}% - {getRelevanceLabel(relevanceScore)}</p>
        )}
        {theme && <p>Theme: {theme}</p>}
        {fallback && <p>Note: This is a fallback image</p>}
      </div>
    </div>
  )
}

// Hook for image loading with retry logic
export function useImageWithRetry(src: string, maxRetries: number = 3) {
  const [imageSrc, setImageSrc] = useState(src)
  const [retryCount, setRetryCount] = useState(0)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setImageSrc(src)
    setRetryCount(0)
    setHasError(false)
  }, [src])

  const retry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1)
      setHasError(false)
      // Force reload by adding timestamp
      setImageSrc(`${src}?retry=${retryCount}&t=${Date.now()}`)
    }
  }

  return {
    imageSrc,
    retryCount,
    hasError,
    canRetry: retryCount < maxRetries,
    retry
  }
}
