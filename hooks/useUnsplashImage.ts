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
        // Priorizar Unsplash em vez de Wikimedia Commons
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
        })

        if (response.ok) {
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
            return;
          }
        }
        
        // Fallback final para uma imagem padrão do Unsplash
        setImage({
          id: 'default',
          urls: {
            regular: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop&auto=format`,
            small: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=200&fit=crop&auto=format`
          },
          alt_description: query,
          user: { name: 'Unsplash' }
        })
      } catch (err) {
        console.error('Error fetching image:', err)
        // Fallback para imagem padrão em caso de erro
        setImage({
          id: 'fallback',
          urls: {
            regular: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop&auto=format`,
            small: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=200&fit=crop&auto=format`
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
  }, [query, enabled, subject])

  return { image, loading, error }
}

// Manter compatibilidade com código existente
export const useUnsplashImage = useWikimediaImage