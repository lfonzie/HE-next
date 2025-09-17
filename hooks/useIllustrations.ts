// hooks/useIllustrations.ts - Hook para busca de ilustrações
import { useState, useCallback } from 'react';

export interface Illustration {
  id: string;
  url: string;
  thumbnail: string;
  description: string;
  author: string;
  authorUrl: string;
  source: string;
  downloadUrl: string;
  width: number;
  height: number;
  tags: string[];
  metadata?: {
    category: string;
    process?: string;
    style: string;
    language: string;
    searchQuery: string;
    optimizedQuery: string;
    educationalRelevance: number;
  };
  processRelevance?: number;
  educationalLevel?: string;
}

export interface ProcessInfo {
  id: string;
  name: string;
  description: string;
  categories: string[];
  difficulty: string;
  ageRange: string;
  keywords: string[];
  relatedProcesses: string[];
  steps?: string[];
}

export interface SearchParams {
  query: string;
  category?: string;
  process?: string;
  style?: 'scientific' | 'educational' | 'diagram' | 'illustration' | 'photograph';
  language?: 'pt' | 'en' | 'es';
  limit?: number;
  includeMetadata?: boolean;
}

export interface ProcessSearchParams {
  process: string;
  level?: 'fundamental' | 'medio' | 'superior';
  language?: 'pt' | 'en' | 'es';
  limit?: number;
  includeSteps?: boolean;
  includeDiagrams?: boolean;
}

export interface UseIllustrationsReturn {
  // Estados
  images: Illustration[];
  processes: ProcessInfo[];
  loading: boolean;
  error: string | null;
  
  // Funções de busca
  searchImages: (params: SearchParams) => Promise<Illustration[]>;
  searchProcessImages: (params: ProcessSearchParams) => Promise<Illustration[]>;
  getProcesses: () => Promise<ProcessInfo[]>;
  getProcessById: (id: string) => Promise<ProcessInfo | null>;
  
  // Funções de utilidade
  clearError: () => void;
  clearImages: () => void;
}

export function useIllustrations(): UseIllustrationsReturn {
  const [images, setImages] = useState<Illustration[]>([]);
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearImages = useCallback(() => {
    setImages([]);
  }, []);

  const searchImages = useCallback(async (params: SearchParams): Promise<Illustration[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/illustrations/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na busca de imagens');
      }

      if (data.success) {
        setImages(data.data);
        return data.data;
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro de conexão';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchProcessImages = useCallback(async (params: ProcessSearchParams): Promise<Illustration[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/illustrations/processes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na busca de imagens do processo');
      }

      if (data.success) {
        setImages(data.images);
        return data.images;
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro de conexão';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProcesses = useCallback(async (): Promise<ProcessInfo[]> => {
    try {
      const response = await fetch('/api/illustrations/processes?action=list');
      const data = await response.json();

      if (data.success) {
        setProcesses(data.data);
        return data.data;
      } else {
        throw new Error(data.error || 'Erro ao carregar processos');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro de conexão';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getProcessById = useCallback(async (id: string): Promise<ProcessInfo | null> => {
    try {
      const response = await fetch('/api/illustrations/processes?action=list');
      const data = await response.json();

      if (data.success) {
        const process = data.data.find((p: ProcessInfo) => p.id === id);
        return process || null;
      } else {
        throw new Error(data.error || 'Erro ao carregar processo');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro de conexão';
      setError(errorMessage);
      return null;
    }
  }, []);

  return {
    images,
    processes,
    loading,
    error,
    searchImages,
    searchProcessImages,
    getProcesses,
    getProcessById,
    clearError,
    clearImages
  };
}

// Hook específico para busca rápida de fotossíntese
export function usePhotosynthesisImages() {
  const { searchProcessImages, ...rest } = useIllustrations();

  const searchPhotosynthesis = useCallback(async (level: 'fundamental' | 'medio' | 'superior' = 'medio') => {
    return searchProcessImages({
      process: 'fotossintese',
      level,
      limit: 8,
      includeSteps: true,
      includeDiagrams: true
    });
  }, [searchProcessImages]);

  return {
    ...rest,
    searchPhotosynthesis
  };
}

// Hook para busca por categoria
export function useCategoryImages() {
  const { searchImages, ...rest } = useIllustrations();

  const searchByCategory = useCallback(async (
    category: 'biology' | 'chemistry' | 'physics' | 'math' | 'history' | 'geography' | 'general',
    limit: number = 12
  ) => {
    return searchImages({
      query: category,
      category,
      limit,
      includeMetadata: true
    });
  }, [searchImages]);

  return {
    ...rest,
    searchByCategory
  };
}

// Hook para busca educacional inteligente
export function useEducationalSearch() {
  const { searchImages, searchProcessImages, ...rest } = useIllustrations();

  const smartSearch = useCallback(async (
    query: string,
    options: {
      level?: 'fundamental' | 'medio' | 'superior';
      preferProcesses?: boolean;
      limit?: number;
    } = {}
  ) => {
    const { level = 'medio', preferProcesses = false, limit = 12 } = options;

    // Primeiro, tentar encontrar um processo correspondente
    if (preferProcesses) {
      const processKeywords = [
        'fotossíntese', 'respiração', 'digestão', 'circulação', 'mitose', 'meiose',
        'evolução', 'química orgânica', 'tabela periódica', 'movimento', 'eletricidade'
      ];

      const matchingProcess = processKeywords.find(keyword => 
        query.toLowerCase().includes(keyword.toLowerCase())
      );

      if (matchingProcess) {
        return searchProcessImages({
          process: matchingProcess,
          level,
          limit,
          includeSteps: true,
          includeDiagrams: true
        });
      }
    }

    // Se não encontrar processo específico, fazer busca geral
    return searchImages({
      query,
      limit,
      includeMetadata: true
    });
  }, [searchImages, searchProcessImages]);

  return {
    ...rest,
    smartSearch
  };
}
