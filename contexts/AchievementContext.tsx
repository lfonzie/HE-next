import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Achievement, AchievementProgress, UserAchievementStats } from '@/types/achievements';

// State interface
interface AchievementState {
  achievements: Achievement[];
  userProgress: AchievementProgress[];
  userStats: UserAchievementStats | null;
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
}

// Action types
type AchievementAction =
  | { type: 'FETCH_ACHIEVEMENTS_START' }
  | { type: 'FETCH_ACHIEVEMENTS_SUCCESS'; payload: Achievement[] }
  | { type: 'FETCH_ACHIEVEMENTS_ERROR'; payload: string }
  | { type: 'FETCH_PROGRESS_SUCCESS'; payload: AchievementProgress[] }
  | { type: 'FETCH_STATS_SUCCESS'; payload: UserAchievementStats }
  | { type: 'UPDATE_PROGRESS'; payload: { achievementId: string; progress: number } }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AchievementState = {
  achievements: [],
  userProgress: [],
  userStats: null,
  loading: false,
  error: null,
  lastFetched: null,
};

// Reducer
function achievementReducer(state: AchievementState, action: AchievementAction): AchievementState {
  switch (action.type) {
    case 'FETCH_ACHIEVEMENTS_START':
      return { ...state, loading: true, error: null };
    
    case 'FETCH_ACHIEVEMENTS_SUCCESS':
      return {
        ...state,
        achievements: action.payload,
        loading: false,
        lastFetched: new Date().toISOString(),
      };
    
    case 'FETCH_ACHIEVEMENTS_ERROR':
      return { ...state, loading: false, error: action.payload };
    
    case 'FETCH_PROGRESS_SUCCESS':
      return { ...state, userProgress: action.payload };
    
    case 'FETCH_STATS_SUCCESS':
      return { ...state, userStats: action.payload };
    
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        userProgress: state.userProgress.map(progress =>
          progress.achievementId === action.payload.achievementId
            ? { ...progress, progress: action.payload.progress, lastUpdated: new Date().toISOString() }
            : progress
        ),
      };
    
    case 'UNLOCK_ACHIEVEMENT':
      return {
        ...state,
        userProgress: state.userProgress.map(progress =>
          progress.achievementId === action.payload
            ? { ...progress, progress: 100, lastUpdated: new Date().toISOString() }
            : progress
        ),
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    default:
      return state;
  }
}

// Context interface
interface AchievementContextType {
  state: AchievementState;
  fetchAchievements: (userId: string) => Promise<void>;
  fetchUserProgress: (userId: string) => Promise<void>;
  fetchUserStats: (userId: string) => Promise<void>;
  updateProgress: (achievementId: string, progress: number) => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  refreshData: (userId: string) => Promise<void>;
  clearError: () => void;
}

// Create context
const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

// Provider component
interface AchievementProviderProps {
  children: ReactNode;
}

export function AchievementProvider({ children }: AchievementProviderProps) {
  const [state, dispatch] = useReducer(achievementReducer, initialState);

  // API functions
  const fetchAchievements = async (userId: string) => {
    try {
      dispatch({ type: 'FETCH_ACHIEVEMENTS_START' });
      
      const response = await fetch(`/api/achievements?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch achievements: ${response.statusText}`);
      }

      const data = await response.json();
      dispatch({ type: 'FETCH_ACHIEVEMENTS_SUCCESS', payload: data.achievements });
    } catch (error) {
      dispatch({ type: 'FETCH_ACHIEVEMENTS_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const fetchUserProgress = async (userId: string) => {
    try {
      const response = await fetch(`/api/achievements/progress?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user progress: ${response.statusText}`);
      }

      const data = await response.json();
      dispatch({ type: 'FETCH_PROGRESS_SUCCESS', payload: data.progress });
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const fetchUserStats = async (userId: string) => {
    try {
      const response = await fetch(`/api/achievements/stats?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user stats: ${response.statusText}`);
      }

      const data = await response.json();
      dispatch({ type: 'FETCH_STATS_SUCCESS', payload: data.stats });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const updateProgress = async (achievementId: string, progress: number) => {
    try {
      dispatch({ type: 'UPDATE_PROGRESS', payload: { achievementId, progress } });

      // Update on server
      await fetch('/api/achievements/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          achievementId,
          progress,
          timestamp: new Date().toISOString(),
        }),
      });

      // Check if achievement should be unlocked
      const achievement = state.achievements.find(a => a.id === achievementId);
      if (achievement && progress >= achievement.threshold) {
        await unlockAchievement(achievementId);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const unlockAchievement = async (achievementId: string) => {
    try {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievementId });

      // Update on server
      await fetch('/api/achievements/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          achievementId,
          unlockedAt: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  };

  const refreshData = async (userId: string) => {
    await Promise.all([
      fetchAchievements(userId),
      fetchUserProgress(userId),
      fetchUserStats(userId),
    ]);
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AchievementContextType = {
    state,
    fetchAchievements,
    fetchUserProgress,
    fetchUserStats,
    updateProgress,
    unlockAchievement,
    refreshData,
    clearError,
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
}

// Custom hook
export function useAchievements() {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
}

// Selector hooks for specific data
export function useAchievementList() {
  const { state } = useAchievements();
  return state.achievements;
}

export function useUserProgress() {
  const { state } = useAchievements();
  return state.userProgress;
}

export function useUserStats() {
  const { state } = useAchievements();
  return state.userStats;
}

export function useAchievementLoading() {
  const { state } = useAchievements();
  return state.loading;
}

export function useAchievementError() {
  const { state } = useAchievements();
  return state.error;
}
