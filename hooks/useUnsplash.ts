// hooks/useUnsplash.ts
'use client';

import { useState, useCallback } from 'react';
import { UnsplashImage } from '@/lib/unsplash';

interface UseUnsplashOptions {
  onError?: (error: string) => void;
  onSuccess?: (images: UnsplashImage[]) => void;
}

interface UseUnsplashReturn {
  images: UnsplashImage[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  searchImages: (query: string, page?: number) => Promise<void>;
  searchEducationImages: (page?: number) => Promise<void>;
  searchPresentationImages: (page?: number) => Promise<void>;
  searchSubjectImages: (subject: string, page?: number) => Promise<void>;
  loadMore: () => Promise<void>;
  clearResults: () => void;
}

export function useUnsplash(options: UseUnsplashOptions = {}): UseUnsplashReturn {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentType, setCurrentType] = useState('search');

  const hasMore = currentPage < totalPages;

  const makeRequest = useCallback(async (
    query: string, 
    page: number, 
    type: string = 'search'
  ) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        query,
        page: page.toString(),
        per_page: '20',
        type
      });

      const response = await fetch(`/api/unsplash/search?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao buscar imagens');
      }

      const searchResult = result.data;
      
      if (page === 1) {
        setImages(searchResult.results);
      } else {
        setImages(prev => [...prev, ...searchResult.results]);
      }
      
      setTotalPages(result.pagination.total_pages);
      setCurrentPage(result.pagination.page);
      setCurrentQuery(query);
      setCurrentType(type);

      options.onSuccess?.(searchResult.results);

    } catch (err: any) {
      const errorMessage = err.message || 'Erro desconhecido';
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options]);

  const searchImages = useCallback(async (query: string, page: number = 1) => {
    await makeRequest(query, page, 'search');
  }, [makeRequest]);

  const searchEducationImages = useCallback(async (page: number = 1) => {
    await makeRequest('', page, 'education');
  }, [makeRequest]);

  const searchPresentationImages = useCallback(async (page: number = 1) => {
    await makeRequest('', page, 'presentation');
  }, [makeRequest]);

  const searchSubjectImages = useCallback(async (subject: string, page: number = 1) => {
    await makeRequest(subject, page, 'subject');
  }, [makeRequest]);

  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await makeRequest(currentQuery, currentPage + 1, currentType);
    }
  }, [hasMore, loading, currentQuery, currentPage, currentType, makeRequest]);

  const clearResults = useCallback(() => {
    setImages([]);
    setError(null);
    setCurrentPage(1);
    setTotalPages(0);
    setCurrentQuery('');
    setCurrentType('search');
  }, []);

  return {
    images,
    loading,
    error,
    hasMore,
    currentPage,
    searchImages,
    searchEducationImages,
    searchPresentationImages,
    searchSubjectImages,
    loadMore,
    clearResults
  };
}
