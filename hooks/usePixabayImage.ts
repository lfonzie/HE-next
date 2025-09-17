// hooks/usePixabayImage.ts - Hook personalizado para API Pixabay
import { useState, useEffect, useCallback } from 'react';

export interface PixabayImageResult {
  id: string;
  url: string;
  thumbnail: string;
  largeUrl?: string;
  fullHdUrl?: string;
  description: string;
  author: string;
  authorUrl: string;
  source: string;
  downloadUrl: string;
  width: number;
  height: number;
  tags: string[];
  quality: string;
  educational: boolean;
  views?: number;
  downloads?: number;
  likes?: number;
  comments?: number;
  userImage?: string;
}

export interface PixabayVideoResult {
  id: string;
  url: string;
  thumbnail: string;
  largeUrl?: string;
  smallUrl?: string;
  tinyUrl?: string;
  description: string;
  author: string;
  authorUrl: string;
  source: string;
  downloadUrl: string;
  width: number;
  height: number;
  duration: number;
  tags: string[];
  quality: string;
  educational: boolean;
  views?: number;
  downloads?: number;
  likes?: number;
  comments?: number;
  userImage?: string;
}

export interface PixabaySearchParams {
  query: string;
  page?: number;
  perPage?: number;
  category?: 'education' | 'science' | 'business' | 'backgrounds' | 'nature' | 'people';
  subject?: string;
  type?: 'images' | 'videos' | 'both';
}

export interface PixabaySearchResult {
  success: boolean;
  data: (PixabayImageResult | PixabayVideoResult)[];
  metadata: {
    query: string;
    category?: string;
    subject?: string;
    type: string;
    page: number;
    perPage: number;
    totalResults: number;
    source: string;
    educational: boolean;
  };
  timestamp: string;
}

export function usePixabayImage(
  params: PixabaySearchParams,
  enabled: boolean = true
) {
  const [data, setData] = useState<PixabaySearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchImages = useCallback(async (searchParams: PixabaySearchParams) => {
    if (!enabled || !searchParams.query.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pixabay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'search',
          ...searchParams
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PixabaySearchResult = await response.json();
      
      if (result.success) {
        setData(result);
      } else {
        setError('Falha na busca de imagens');
      }
    } catch (err) {
      console.error('Erro ao buscar imagens Pixabay:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const searchBySubject = useCallback(async (subject: string, page: number = 1, perPage: number = 20) => {
    if (!enabled || !subject.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pixabay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'subject',
          subject,
          page,
          perPage
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PixabaySearchResult = await response.json();
      
      if (result.success) {
        setData(result);
      } else {
        setError('Falha na busca por disciplina');
      }
    } catch (err) {
      console.error('Erro ao buscar imagens por disciplina:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const searchForPresentation = useCallback(async (topic: string, page: number = 1, perPage: number = 20) => {
    if (!enabled || !topic.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pixabay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'presentation',
          topic,
          page,
          perPage
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PixabaySearchResult = await response.json();
      
      if (result.success) {
        setData(result);
      } else {
        setError('Falha na busca para apresentação');
      }
    } catch (err) {
      console.error('Erro ao buscar imagens para apresentação:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const searchScienceImages = useCallback(async (topic: string, page: number = 1, perPage: number = 20) => {
    if (!enabled || !topic.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pixabay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'science',
          topic,
          page,
          perPage
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PixabaySearchResult = await response.json();
      
      if (result.success) {
        setData(result);
      } else {
        setError('Falha na busca científica');
      }
    } catch (err) {
      console.error('Erro ao buscar imagens científicas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const searchInspirationalImages = useCallback(async (page: number = 1, perPage: number = 20) => {
    if (!enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pixabay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'inspirational',
          page,
          perPage
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PixabaySearchResult = await response.json();
      
      if (result.success) {
        setData(result);
      } else {
        setError('Falha na busca inspiracional');
      }
    } catch (err) {
      console.error('Erro ao buscar imagens inspiradoras:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const searchVideos = useCallback(async (query: string, page: number = 1, perPage: number = 20) => {
    if (!enabled || !query.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pixabay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'videos',
          query,
          page,
          perPage
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PixabaySearchResult = await response.json();
      
      if (result.success) {
        setData(result);
      } else {
        setError('Falha na busca de vídeos');
      }
    } catch (err) {
      console.error('Erro ao buscar vídeos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  // Auto-search quando os parâmetros mudam
  useEffect(() => {
    if (enabled && params.query) {
      searchImages(params);
    }
  }, [enabled, params.query, params.page, params.perPage, params.category, searchImages]);

  return {
    data,
    loading,
    error,
    searchImages,
    searchBySubject,
    searchForPresentation,
    searchScienceImages,
    searchInspirationalImages,
    searchVideos,
    refetch: () => searchImages(params)
  };
}

// Hook simplificado para busca rápida
export function usePixabayQuickSearch(query: string, enabled: boolean = true) {
  const [image, setImage] = useState<PixabayImageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !query.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    const searchImage = async () => {
      try {
        const response = await fetch('/api/pixabay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'search',
            query,
            perPage: 1,
            type: 'images'
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: PixabaySearchResult = await response.json();
        
        if (result.success && result.data.length > 0) {
          setImage(result.data[0] as PixabayImageResult);
        } else {
          setError('Nenhuma imagem encontrada');
        }
      } catch (err) {
        console.error('Erro ao buscar imagem:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    searchImage();
  }, [enabled, query]);

  return { image, loading, error };
}
