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

export function useUnsplashImage(query: string, enabled: boolean = true) {
  const [image, setImage] = useState<UnsplashImage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !query.trim()) return

    const fetchImage = async () => {
      setLoading(true)
      setError(null)

      try {
        // Usar uma API pública do Unsplash (sem chave de API)
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
          {
            headers: {
              'Authorization': 'Client-ID YOUR_UNSPLASH_ACCESS_KEY' // Será substituído por uma chave real
            }
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch image')
        }

        const data = await response.json()
        
        if (data.results && data.results.length > 0) {
          setImage(data.results[0])
        } else {
          // Fallback para uma imagem padrão se não encontrar resultados
          setImage({
            id: 'default',
            urls: {
              regular: `https://source.unsplash.com/800x400/?${encodeURIComponent(query)}`,
              small: `https://source.unsplash.com/400x200/?${encodeURIComponent(query)}`
            },
            alt_description: query,
            user: { name: 'Unsplash' }
          })
        }
      } catch (err) {
        console.error('Error fetching Unsplash image:', err)
        // Fallback para imagem padrão em caso de erro
        setImage({
          id: 'fallback',
          urls: {
            regular: `https://source.unsplash.com/800x400/?${encodeURIComponent(query)}`,
            small: `https://source.unsplash.com/400x200/?${encodeURIComponent(query)}`
          },
          alt_description: query,
          user: { name: 'Unsplash' }
        })
        setError('Using fallback image')
      } finally {
        setLoading(false)
      }
    }

    fetchImage()
  }, [query, enabled])

  return { image, loading, error }
}