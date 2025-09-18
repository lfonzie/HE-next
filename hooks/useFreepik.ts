import { useState, useCallback } from 'react';

interface FreepikResource {
  id: string;
  title: string;
  preview_url: string;
  download_url?: string;
  type: string;
  premium: boolean;
  author: {
    name: string;
    avatar_url?: string;
  };
  tags: string[];
  dimensions?: {
    width: number;
    height: number;
  };
}

interface SearchParams {
  query: string;
  type?: 'images' | 'templates' | 'videos' | 'icons';
  limit?: number;
}

interface ClassifyParams {
  image_url?: string;
  text_content?: string;
}

interface UseFreepikReturn {
  search: (params: SearchParams) => Promise<FreepikResource[]>;
  classify: (params: ClassifyParams) => Promise<any>;
  downloadResource: (resourceId: string, resourceType?: string) => Promise<any>;
  loading: boolean;
  error: string | null;
}

export function useFreepik(): UseFreepikReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (params: SearchParams): Promise<FreepikResource[]> => {
    setLoading(true);
    setError(null);

    try {
      const { query, type = 'vector', limit = 12 } = params;
      
      const response = await fetch(
        `/api/freepik/search?query=${encodeURIComponent(query)}&limit=${limit}&type=${type}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }

      const data = await response.json();
      return data.data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const classify = useCallback(async (params: ClassifyParams): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const { image_url, text_content } = params;
      
      const response = await fetch('/api/freepik/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url,
          text_content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Classification failed');
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadResource = useCallback(async (resourceId: string, resourceType: string = 'images'): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/freepik/download?id=${resourceId}&type=${resourceType}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    search,
    classify,
    downloadResource,
    loading,
    error,
  };
}
