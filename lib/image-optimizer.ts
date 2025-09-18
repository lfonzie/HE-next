/**
 * Image Optimizer - Advanced image optimization for ENEM questions
 * 
 * This module provides intelligent image optimization including:
 * - Lazy loading
 * - WebP conversion with fallbacks
 * - Responsive image generation
 * - CDN integration
 * - Compression optimization
 */

// Image Optimization Configuration
export interface ImageOptimizerConfig {
  enableWebP: boolean
  enableLazyLoading: boolean
  enableResponsiveImages: boolean
  enableCompression: boolean
  quality: number // 0-100
  maxWidth: number
  maxHeight: number
  formats: string[] // ['webp', 'jpeg', 'png']
  cdnBaseUrl?: string
  placeholderColor: string
  blurDataUrl?: string
}

// Optimized Image Interface
export interface OptimizedImage {
  src: string
  srcSet?: string
  sizes?: string
  alt: string
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
  placeholder?: string
  blurDataUrl?: string
  formats: {
    webp?: string
    jpeg?: string
    png?: string
  }
}

// Default Configuration
const DEFAULT_CONFIG: ImageOptimizerConfig = {
  enableWebP: true,
  enableLazyLoading: true,
  enableResponsiveImages: true,
  enableCompression: true,
  quality: 85,
  maxWidth: 1200,
  maxHeight: 800,
  formats: ['webp', 'jpeg'],
  placeholderColor: '#f3f4f6',
  blurDataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
}

/**
 * Image Optimizer Class
 */
export class ImageOptimizer {
  private config: ImageOptimizerConfig
  private cache: Map<string, OptimizedImage> = new Map()
  private observer: IntersectionObserver | null = null

  constructor(config: Partial<ImageOptimizerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.initializeIntersectionObserver()
  }

  /**
   * Initialize Intersection Observer for lazy loading
   */
  private initializeIntersectionObserver(): void {
    if (!this.config.enableLazyLoading || typeof window === 'undefined') return

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            this.loadImage(img)
            this.observer?.unobserve(img)
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    )
  }

  /**
   * Optimize image URL
   */
  optimizeImageUrl(
    originalUrl: string,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: string
    } = {}
  ): string {
    if (!this.config.cdnBaseUrl) return originalUrl

    const params = new URLSearchParams()
    
    if (options.width) params.set('w', options.width.toString())
    if (options.height) params.set('h', options.height.toString())
    if (options.quality) params.set('q', options.quality.toString())
    if (options.format) params.set('f', options.format)

    return `${this.config.cdnBaseUrl}${originalUrl}?${params.toString()}`
  }

  /**
   * Generate responsive image sources
   */
  generateResponsiveSources(
    originalUrl: string,
    sizes: number[] = [320, 640, 1024, 1200]
  ): { srcSet: string; sizes: string } {
    if (!this.config.enableResponsiveImages) {
      return {
        srcSet: this.optimizeImageUrl(originalUrl),
        sizes: '100vw'
      }
    }

    const srcSet = sizes
      .map(size => {
        const url = this.optimizeImageUrl(originalUrl, {
          width: size,
          quality: this.config.quality
        })
        return `${url} ${size}w`
      })
      .join(', ')

    const sizes = sizes
      .map((size, index) => {
        if (index === sizes.length - 1) return `${size}px`
        return `(max-width: ${size}px) ${size}px`
      })
      .join(', ')

    return { srcSet, sizes }
  }

  /**
   * Generate multiple format sources
   */
  generateFormatSources(originalUrl: string): OptimizedImage['formats'] {
    const formats: OptimizedImage['formats'] = {}

    this.config.formats.forEach(format => {
      formats[format as keyof OptimizedImage['formats']] = this.optimizeImageUrl(
        originalUrl,
        { format, quality: this.config.quality }
      )
    })

    return formats
  }

  /**
   * Create optimized image object
   */
  createOptimizedImage(
    originalUrl: string,
    alt: string,
    options: {
      width?: number
      height?: number
      loading?: 'lazy' | 'eager'
      priority?: boolean
    } = {}
  ): OptimizedImage {
    const cacheKey = `${originalUrl}_${options.width || 'auto'}_${options.height || 'auto'}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const { srcSet, sizes } = this.generateResponsiveSources(originalUrl)
    const formats = this.generateFormatSources(originalUrl)

    const optimizedImage: OptimizedImage = {
      src: this.optimizeImageUrl(originalUrl, {
        width: options.width,
        height: options.height,
        quality: this.config.quality
      }),
      srcSet: this.config.enableResponsiveImages ? srcSet : undefined,
      sizes: this.config.enableResponsiveImages ? sizes : undefined,
      alt,
      width: options.width,
      height: options.height,
      loading: options.loading || (this.config.enableLazyLoading ? 'lazy' : 'eager'),
      placeholder: this.config.placeholderColor,
      blurDataUrl: this.config.blurDataUrl,
      formats
    }

    this.cache.set(cacheKey, optimizedImage)
    return optimizedImage
  }

  /**
   * Load image with lazy loading
   */
  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src
    if (!src) return

    const optimizedImage = this.createOptimizedImage(src, img.alt)
    
    // Set the optimized source
    img.src = optimizedImage.src
    
    if (optimizedImage.srcSet) {
      img.srcset = optimizedImage.srcSet
    }
    
    if (optimizedImage.sizes) {
      img.sizes = optimizedImage.sizes
    }

    // Add loading states
    img.classList.add('loading')
    
    img.onload = () => {
      img.classList.remove('loading')
      img.classList.add('loaded')
    }
    
    img.onerror = () => {
      img.classList.remove('loading')
      img.classList.add('error')
      // Fallback to original image
      img.src = src
    }
  }

  /**
   * Observe image for lazy loading
   */
  observeImage(img: HTMLImageElement): void {
    if (this.observer && this.config.enableLazyLoading) {
      this.observer.observe(img)
    } else {
      this.loadImage(img)
    }
  }

  /**
   * Preload critical images
   */
  preloadImages(urls: string[]): Promise<void[]> {
    return Promise.all(
      urls.map(url => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve()
          img.onerror = () => reject(new Error(`Failed to preload: ${url}`))
          img.src = this.optimizeImageUrl(url)
        })
      })
    )
  }

  /**
   * Generate placeholder image
   */
  generatePlaceholder(width: number, height: number, text?: string): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return this.config.blurDataUrl || ''

    canvas.width = width
    canvas.height = height

    // Background
    ctx.fillStyle = this.config.placeholderColor
    ctx.fillRect(0, 0, width, height)

    // Text
    if (text) {
      ctx.fillStyle = '#6b7280'
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, width / 2, height / 2)
    }

    return canvas.toDataURL('image/jpeg', 0.1)
  }

  /**
   * Compress image data
   */
  async compressImage(
    file: File,
    quality: number = this.config.quality
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        
        if (width > this.config.maxWidth) {
          height = (height * this.config.maxWidth) / width
          width = this.config.maxWidth
        }
        
        if (height > this.config.maxHeight) {
          width = (width * this.config.maxHeight) / height
          height = this.config.maxHeight
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          'image/jpeg',
          quality / 100
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Check WebP support
   */
  static async checkWebPSupport(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image()
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2)
      }
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    })
  }

  /**
   * Get optimal format based on browser support
   */
  static async getOptimalFormat(): Promise<string[]> {
    const webpSupported = await this.checkWebPSupport()
    
    if (webpSupported) {
      return ['webp', 'jpeg', 'png']
    } else {
      return ['jpeg', 'png']
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
    this.cache.clear()
  }
}

/**
 * React Hook for Image Optimization
 */
export function useImageOptimizer(config: Partial<ImageOptimizerConfig> = {}) {
  const optimizer = new ImageOptimizer(config)

  const optimizeImage = (url: string, alt: string, options?: any) => {
    return optimizer.createOptimizedImage(url, alt, options)
  }

  const preloadImages = (urls: string[]) => {
    return optimizer.preloadImages(urls)
  }

  const observeImage = (img: HTMLImageElement) => {
    optimizer.observeImage(img)
  }

  return {
    optimizeImage,
    preloadImages,
    observeImage,
    optimizer
  }
}

/**
 * Utility functions
 */
export const ImageUtils = {
  /**
   * Get image dimensions from URL
   */
  async getImageDimensions(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img.src = url
    })
  },

  /**
   * Convert file to base64
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to convert file to base64'))
      reader.readAsDataURL(file)
    })
  },

  /**
   * Generate blur hash for placeholder
   */
  generateBlurHash(width: number, height: number): string {
    // Simplified blur hash generation
    // In production, use a proper blur hash library
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return ''

    canvas.width = width
    canvas.height = height
    
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, width, height)
    
    return canvas.toDataURL('image/jpeg', 0.1)
  }
}

