'use client'

import { useState, useEffect } from 'react'

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

export function useWikimediaImage(query: string, enabled: boolean = true, subject?: string) {
  const [image, setImage] = useState<WikimediaImage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !query.trim()) return

    const fetchImage = async () => {
      setLoading(true)
      setError(null)

      try {
        // Usar Wikimedia Commons API
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
        })

        if (!response.ok) {
          throw new Error('Failed to fetch image')
        }

        const data = await response.json()
        
        if (data.success && data.photos && data.photos.length > 0) {
          const photo = data.photos[0]
          setImage({
            id: photo.id || 'wikimedia',
            urls: {
              regular: photo.urls?.regular || photo.url,
              small: photo.urls?.small || photo.url
            },
            alt_description: photo.description || query,
            user: { name: photo.author || 'Wikimedia Commons' }
          })
        } else {
          // Fallback para Unsplash se Wikimedia não encontrar nada
          try {
            const unsplashResponse = await fetch('/api/unsplash/translate-search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: query, subject: subject || '', count: 1 })
            });
            
            if (unsplashResponse.ok) {
              const unsplashData = await unsplashResponse.json();
              if (unsplashData.photos && unsplashData.photos.length > 0) {
                const photo = unsplashData.photos[0];
                setImage({
                  id: photo.id || 'unsplash',
                  urls: {
                    regular: photo.urls.regular,
                    small: photo.urls.small || photo.urls.regular
                  },
                  alt_description: photo.alt_description || query,
                  user: { name: photo.user?.name || 'Unsplash' }
                });
                return;
              }
            }
          } catch (unsplashError) {
            console.warn('Unsplash fallback failed:', unsplashError);
          }
          
          // Fallback final para uma imagem padrão do Wikimedia Commons
          setImage({
            id: 'default',
            urls: {
              regular: `https://commons.wikimedia.org/wiki/Special:FilePath/Education%20-%20The%20Noun%20Project.svg?width=800&height=400`,
              small: `https://commons.wikimedia.org/wiki/Special:FilePath/Education%20-%20The%20Noun%20Project.svg?width=400&height=200`
            },
            alt_description: query,
            user: { name: 'Wikimedia Commons' }
          })
        }
      } catch (err) {
        console.error('Error fetching Wikimedia image:', err)
        // Fallback para imagem padrão em caso de erro
        setImage({
          id: 'fallback',
          urls: {
            regular: `https://commons.wikimedia.org/wiki/Special:FilePath/Education%20-%20The%20Noun%20Project.svg?width=800&height=400`,
            small: `https://commons.wikimedia.org/wiki/Special:FilePath/Education%20-%20The%20Noun%20Project.svg?width=400&height=200`
          },
          alt_description: query,
          user: { name: 'Wikimedia Commons' }
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

// Manter compatibilidade com código existente
export const useUnsplashImage = useWikimediaImage