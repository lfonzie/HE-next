'use client'

import { useState, useEffect, useRef } from 'react'

interface WikimediaImage {
  id: string
  urls: {
    regular: string
    small: string
  }
  alt_description: string
  user: {
    name: string
  }
}

// Cache global para evitar requisições duplicadas
const imageCache = new Map<string, { image: WikimediaImage; timestamp: number }>()
const pendingRequests = new Map<string, Promise<WikimediaImage>>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export function useWikimediaImage(query: string, enabled: boolean = true, subject?: string) {
  const [image, setImage] = useState<WikimediaImage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!enabled || !query.trim()) {
      setImage(null)
      setLoading(false)
      setError(null)
      return
    }

    const cacheKey = `${query}-${subject || ''}`
    
    // Verificar cache primeiro
    const cached = imageCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('🎯 Cache hit for image:', cacheKey)
      setImage(cached.image)
      setLoading(false)
      setError(null)
      return
    }

    // Verificar se já há uma requisição pendente para esta query
    const pendingRequest = pendingRequests.get(cacheKey)
    if (pendingRequest) {
      console.log('⏳ Using pending request for:', cacheKey)
      setLoading(true)
      pendingRequest.then((result) => {
        setImage(result)
        setLoading(false)
        setError(null)
      }).catch((err) => {
        console.error('Error in pending request:', err)
        setError('Failed to load image')
        setLoading(false)
      })
      return
    }

    const fetchImage = async () => {
      // Cancelar requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      setLoading(true)
      setError(null)

      try {
        console.log('🖼️ Fetching image for:', cacheKey)
        
        // Priorizar Unsplash em vez de Wikimedia Commons
        const unsplashResponse = await fetch('/api/unsplash/translate-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query, subject: subject || '', count: 1 }),
          signal
        });
        
        if (unsplashResponse.ok) {
          const unsplashData = await unsplashResponse.json();
          if (unsplashData.photos && unsplashData.photos.length > 0) {
            const photo = unsplashData.photos[0];
            const result: WikimediaImage = {
              id: photo.id || 'unsplash',
              urls: {
                regular: photo.urls.regular,
                small: photo.urls.small || photo.urls.regular
              },
              alt_description: photo.alt_description || query,
              user: { name: photo.user?.name || 'Unsplash' }
            };
            
            // Salvar no cache
            imageCache.set(cacheKey, { image: result, timestamp: Date.now() })
            setImage(result)
            return;
          }
        }
        
        // Fallback para Wikimedia Commons se Unsplash falhar
        const response = await fetch('/api/wikimedia/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query,
            subject: subject || '',
            count: 1
          }),
          signal
        })

        if (response.ok) {
          const data = await response.json()
          
          if (data.success && data.photos && data.photos.length > 0) {
            const photo = data.photos[0]
            const result: WikimediaImage = {
              id: photo.id || 'wikimedia',
              urls: {
                regular: photo.urls?.regular || photo.url,
                small: photo.urls?.small || photo.url
              },
              alt_description: photo.description || query,
              user: { name: photo.author || 'Wikimedia Commons' }
            }
            
            // Salvar no cache
            imageCache.set(cacheKey, { image: result, timestamp: Date.now() })
            setImage(result)
            return;
          }
        }
        
        // Fallback final para uma imagem padrão do Unsplash
        const fallbackImage: WikimediaImage = {
          id: 'default',
          urls: {
            regular: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop&auto=format`,
            small: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=200&fit=crop&auto=format`
          },
          alt_description: query,
          user: { name: 'Unsplash' }
        }
        
        // Salvar fallback no cache também
        imageCache.set(cacheKey, { image: fallbackImage, timestamp: Date.now() })
        setImage(fallbackImage)
      } catch (err) {
        if (signal.aborted) {
          console.log('Request aborted for:', cacheKey)
          return
        }
        
        console.error('Error fetching image:', err)
        // Fallback para imagem padrão em caso de erro
        const errorImage: WikimediaImage = {
          id: 'fallback',
          urls: {
            regular: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop&auto=format`,
            small: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=200&fit=crop&auto=format`
          },
          alt_description: query,
          user: { name: 'Unsplash' }
        }
        
        // Salvar erro no cache para evitar tentativas repetidas
        imageCache.set(cacheKey, { image: errorImage, timestamp: Date.now() })
        setImage(errorImage)
        setError('Using fallback image')
      } finally {
        setLoading(false)
        // Remover da lista de requisições pendentes
        pendingRequests.delete(cacheKey)
      }
    }

    // Criar promise e adicionar à lista de pendentes
    const requestPromise = fetchImage()
    pendingRequests.set(cacheKey, requestPromise.then(() => image!).catch(() => {
      // Retornar imagem padrão em caso de erro
      return {
        id: 'error',
        urls: {
          regular: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop&auto=format`,
          small: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=200&fit=crop&auto=format`
        },
        alt_description: query,
        user: { name: 'Unsplash' }
      }
    }))

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [query, enabled, subject])

  return { image, loading, error }
}

// Manter compatibilidade com código existente
export const useUnsplashImage = useWikimediaImage