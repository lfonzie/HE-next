"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AlertCircle, Loader2 } from 'lucide-react'

interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
}

export function ImageWithFallback({
  src,
  alt,
  className = "",
  width,
  height,
  priority = false
}: ImageWithFallbackProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 2

  useEffect(() => {
    if (!src) {
      setImageState('error')
      return
    }

    setImageState('loading')
    
    // Test image accessibility
    const testImage = new Image()
    testImage.onload = () => setImageState('loaded')
    testImage.onerror = () => {
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1)
        // Retry with a small delay
        setTimeout(() => {
          testImage.src = src
        }, 1000 * (retryCount + 1))
      } else {
        setImageState('error')
      }
    }
    testImage.src = src
  }, [src, retryCount])

  if (imageState === 'loading') {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="flex flex-col items-center gap-2 p-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          <span className="text-sm text-gray-500">Carregando imagem...</span>
        </div>
      </div>
    )
  }

  if (imageState === 'error') {
    return (
      <div className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg ${className}`}>
        <div className="flex flex-col items-center gap-2 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-gray-400" />
          <span className="text-sm text-gray-500 font-medium">Imagem não disponível</span>
          <span className="text-xs text-gray-400">A questão pode ser respondida sem a imagem</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width || 800}
        height={height || 600}
        priority={priority}
        className="max-w-full h-auto rounded-lg border border-gray-200"
        onError={() => setImageState('error')}
        onLoad={() => setImageState('loaded')}
      />
    </div>
  )
}
