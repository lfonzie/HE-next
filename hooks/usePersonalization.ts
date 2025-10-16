import { useState, useEffect, useCallback } from 'react';
import { TrailRecommendation } from '@/types/trails';

interface PersonalizationData {
  userId: string;
  learningHistory: LearningHistoryItem[];
  interests: string[];
  goals: string[];
  preferences: UserPreferences;
  performanceMetrics: PerformanceMetrics;
}

interface LearningHistoryItem {
  trailId: string;
  completedAt: string;
  score: number;
  timeSpent: number;
  difficulty: string;
  category: string;
}

interface UserPreferences {
  preferredDifficulty: string[];
  preferredDuration: number;
  preferredCategories: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'any';
}

interface PerformanceMetrics {
  averageScore: number;
  completionRate: number;
  preferredPace: 'slow' | 'medium' | 'fast';
  strengths: string[];
  weaknesses: string[];
}

interface UsePersonalizationOptions {
  userId: string;
  enableRealTimeUpdates?: boolean;
  cacheDuration?: number; // in milliseconds
}

interface UsePersonalizationReturn {
  recommendations: TrailRecommendation[];
  personalizationData: PersonalizationData | null;
  loading: boolean;
  error: string | null;
  refreshRecommendations: () => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  recordInteraction: (trailId: string, interaction: string, data?: any) => Promise<void>;
  getPersonalizedContent: (trailId: string) => Promise<any>;
}

export function usePersonalization({
  userId,
  enableRealTimeUpdates = true,
  cacheDuration = 5 * 60 * 1000, // 5 minutes
}: UsePersonalizationOptions): UsePersonalizationReturn {
  const [recommendations, setRecommendations] = useState<TrailRecommendation[]>([]);
  const [personalizationData, setPersonalizationData] = useState<PersonalizationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  // Fetch personalized recommendations
  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/recommendTrail?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      setPersonalizationData(data.personalizationData || null);
      setLastFetch(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching personalized recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Refresh recommendations
  const refreshRecommendations = useCallback(async () => {
    await fetchRecommendations();
  }, [fetchRecommendations]);

  // Update user preferences
  const updatePreferences = useCallback(async (preferences: Partial<UserPreferences>) => {
    try {
      const response = await fetch('/api/personalization/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          preferences,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update preferences: ${response.statusText}`);
      }

      // Refresh recommendations after updating preferences
      await fetchRecommendations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error updating preferences:', err);
    }
  }, [userId, fetchRecommendations]);

  // Record user interactions for better personalization
  const recordInteraction = useCallback(async (trailId: string, interaction: string, data?: any) => {
    try {
      await fetch('/api/personalization/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          trailId,
          interaction,
          data,
          timestamp: new Date().toISOString(),
        }),
      });

      // Update local state if needed
      if (interaction === 'completed' && personalizationData) {
        const newHistoryItem: LearningHistoryItem = {
          trailId,
          completedAt: new Date().toISOString(),
          score: data?.score || 0,
          timeSpent: data?.timeSpent || 0,
          difficulty: data?.difficulty || 'medium',
          category: data?.category || 'general',
        };

        setPersonalizationData(prev => prev ? {
          ...prev,
          learningHistory: [...prev.learningHistory, newHistoryItem],
        } : null);
      }
    } catch (err) {
      console.error('Error recording interaction:', err);
    }
  }, [userId, personalizationData]);

  // Get personalized content for a specific trail
  const getPersonalizedContent = useCallback(async (trailId: string) => {
    try {
      const response = await fetch(`/api/personalization/content?userId=${userId}&trailId=${trailId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch personalized content: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error fetching personalized content:', err);
      return null;
    }
  }, [userId]);

  // Auto-refresh recommendations based on cache duration
  useEffect(() => {
    const shouldRefresh = Date.now() - lastFetch > cacheDuration;
    if (shouldRefresh && !loading) {
      fetchRecommendations();
    }
  }, [fetchRecommendations, lastFetch, cacheDuration, loading]);

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchRecommendations();
    }
  }, [userId, fetchRecommendations]);

  // Real-time updates (if enabled)
  useEffect(() => {
    if (!enableRealTimeUpdates) return;

    const interval = setInterval(() => {
      if (Date.now() - lastFetch > cacheDuration) {
        fetchRecommendations();
      }
    }, cacheDuration);

    return () => clearInterval(interval);
  }, [enableRealTimeUpdates, fetchRecommendations, lastFetch, cacheDuration]);

  return {
    recommendations,
    personalizationData,
    loading,
    error,
    refreshRecommendations,
    updatePreferences,
    recordInteraction,
    getPersonalizedContent,
  };
}

// Additional utility hooks
export function usePersonalizedTrails(userId: string) {
  const { recommendations, loading, error } = usePersonalization({ userId });
  
  return {
    trails: recommendations.map(rec => rec.trail),
    loading,
    error,
  };
}

export function useLearningAnalytics(userId: string) {
  const { personalizationData, loading, error } = usePersonalization({ userId });
  
  return {
    analytics: personalizationData?.performanceMetrics,
    learningHistory: personalizationData?.learningHistory,
    preferences: personalizationData?.preferences,
    loading,
    error,
  };
}
