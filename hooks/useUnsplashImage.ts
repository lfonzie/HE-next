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
              regular: `https://picsum.photos/800/400?random=${Date.now()}`,
              small: `https://picsum.photos/400/200?random=${Date.now()}`
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
            regular: `https://picsum.photos/800/400?random=${Date.now()}`,
            small: `https://picsum.photos/400/200?random=${Date.now()}`
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