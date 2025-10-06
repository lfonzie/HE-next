// hooks/useGeminiImageBeta.ts
import { useState, useEffect, useCallback } from 'react';

interface BetaStatus {
  enabled: boolean;
  model: string;
  imageSlides: number[];
  maxRetries: number;
  timeout: number;
}

interface BetaStats {
  enabled: boolean;
  model: string;
  totalGenerated: number;
  totalFailed: number;
}

interface UseGeminiImageBetaReturn {
  betaEnabled: boolean;
  betaStatus: BetaStatus | null;
  betaStats: BetaStats | null;
  isLoading: boolean;
  error: string | null;
  toggleBeta: (enabled: boolean) => Promise<void>;
  refreshStatus: () => Promise<void>;
  generateLessonImages: (request: any) => Promise<any>;
}

export function useGeminiImageBeta(): UseGeminiImageBetaReturn {
  const [betaEnabled, setBetaEnabled] = useState(true); // ✅ SEMPRE ATIVADO
  const [betaStatus, setBetaStatus] = useState<BetaStatus | null>(null);
  const [betaStats, setBetaStats] = useState<BetaStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar status inicial
  useEffect(() => {
    refreshStatus();
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/gemini/generate-lesson-images');
      if (!response.ok) {
        throw new Error('Failed to fetch beta status');
      }

      const data = await response.json();
      setBetaStatus(data.betaStatus);
      setBetaEnabled(data.betaStatus.enabled);

    } catch (err) {
      console.error('Error fetching beta status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleBeta = useCallback(async (enabled: boolean) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/gemini/generate-lesson-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ betaEnabled: enabled })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle beta system');
      }

      setBetaEnabled(enabled);
      
      // Atualizar status após toggle
      await refreshStatus();

    } catch (err) {
      console.error('Error toggling beta system:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Reverter estado em caso de erro
      setBetaEnabled(!enabled);
    } finally {
      setIsLoading(false);
    }
  }, [refreshStatus]);

  const generateLessonImages = useCallback(async (request: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/gemini/generate-lesson-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...request,
          betaEnabled: betaEnabled
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate lesson images');
      }

      const data = await response.json();
      
      // Atualizar estatísticas
      if (data.betaStatus) {
        setBetaStats(data.betaStatus);
      }

      return data;

    } catch (err) {
      console.error('Error generating lesson images:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [betaEnabled]);

  return {
    betaEnabled,
    betaStatus,
    betaStats,
    isLoading,
    error,
    toggleBeta,
    refreshStatus,
    generateLessonImages
  };
}

export default useGeminiImageBeta;
