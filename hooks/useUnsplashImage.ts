'use client'

import { useState, useEffect } from 'react'

interface UnsplashImage {
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

export function useUnsplashImage(query: string, enabled: boolean = true, subject?: string) {
  const [image, setImage] = useState<UnsplashImage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !query.trim()) return

    const fetchImage = async () => {
      setLoading(true)
      setError(null)

      try {
        // Usar a nova API com tradução
        const response = await fetch('/api/unsplash/translate-search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query,
            subject: subject || '',
            count: 1
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch image')
        }

        const data = await response.json()
        
        if (data.photos && data.photos.length > 0) {
          setImage(data.photos[0])
        } else {
          // Fallback para uma imagem padrão se não encontrar resultados
          setImage({
            id: 'default',
            urls: {
              regular: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop&auto=format`,
              small: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=200&fit=crop&auto=format`
            },
            alt_description: query,
            user: { name: 'Placeholder' }
          })
        }
      } catch (err) {
        console.error('Error fetching Unsplash image:', err)
        // Fallback para imagem padrão em caso de erro
        setImage({
          id: 'fallback',
          urls: {
            regular: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop&auto=format`,
            small: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=200&fit=crop&auto=format`
          },
          alt_description: query,
          user: { name: 'Placeholder' }
        })
        setError('Using fallback image')
      } finally {
        setLoading(false)
      }
    }

    fetchImage()
  }, [query, enabled, subject])

  return { image, loading, error }
}