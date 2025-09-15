import { useState, useEffect, useCallback } from 'react';

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  description: string;
  user: {
    name: string;
    username: string;
  };
}

interface UseUnsplashImageReturn {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUnsplashImage(query: string, enabled: boolean = true): UseUnsplashImageReturn {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImage = useCallback(async () => {
    if (!query || !enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/unsplash/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          count: 1
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar imagem');
      }

      const data = await response.json();
      
      if (data.success && data.photos && data.photos.length > 0) {
        setImageUrl(data.photos[0].urls.regular);
      } else {
        throw new Error('Nenhuma imagem encontrada');
      }
    } catch (err) {
      console.error('Erro ao buscar imagem do Unsplash:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Fallback para imagem placeholder
      setImageUrl('/placeholder-education.jpg');
    } finally {
      setIsLoading(false);
    }
  }, [query, enabled]);

  useEffect(() => {
    fetchImage();
  }, [fetchImage]);

  const refetch = useCallback(() => {
    fetchImage();
  }, [fetchImage]);

  return {
    imageUrl,
    isLoading,
    error,
    refetch
  };
}
