import { useState, useEffect, useCallback } from 'react';

export type Provider = "wikimedia" | "unsplash" | "pixabay";

export interface SemanticImageItem {
  id: string;
  provider: Provider;
  title?: string;
  alt?: string;
  thumbUrl?: string;
  url: string;
  width?: number;
  height?: number;
  author?: string;
  sourcePage?: string;
  license?: string;
  score?: number;
  meta?: Record<string, any>;
}

export interface SemanticImageResponse {
  query: string;
  count: number;
  topK: number;
  page: number;
  perProvider: number;
  items: SemanticImageItem[];
}

export interface UseSemanticImagesOptions {
  query: string;
  orientation?: string;
  safe?: boolean;
  perProvider?: number;
  page?: number;
  enabled?: boolean;
}

export interface UseSemanticImagesReturn {
  data: SemanticImageResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSemanticImages({
  query,
  orientation,
  safe = true,
  perProvider = 12,
  page = 1,
  enabled = true,
}: UseSemanticImagesOptions): UseSemanticImagesReturn {
  const [data, setData] = useState<SemanticImageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    if (!query.trim() || !enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: query,
        perProvider: perProvider.toString(),
        page: page.toString(),
        safe: safe.toString(),
      });

      if (orientation) {
        params.set('orientation', orientation);
      }

      const response = await fetch(`/api/semantic-images?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar imagens');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [query, orientation, safe, perProvider, page, enabled]);

  const refetch = useCallback(() => {
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

// Hook simplificado para busca rápida
export function useSemanticImageSearch(query: string) {
  return useSemanticImages({ query, enabled: !!query.trim() });
}
