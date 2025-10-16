import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Trail, TrailProgress, TrailRecommendation, TrailAnalytics } from '@/types/trails';

// State interface
interface TrailState {
  trails: Trail[];
  userProgress: TrailProgress[];
  recommendations: TrailRecommendation[];
  analytics: TrailAnalytics[];
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
  currentTrail: Trail | null;
  currentProgress: TrailProgress | null;
}

// Action types
type TrailAction =
  | { type: 'FETCH_TRAILS_START' }
  | { type: 'FETCH_TRAILS_SUCCESS'; payload: Trail[] }
  | { type: 'FETCH_TRAILS_ERROR'; payload: string }
  | { type: 'FETCH_PROGRESS_SUCCESS'; payload: TrailProgress[] }
  | { type: 'FETCH_RECOMMENDATIONS_SUCCESS'; payload: TrailRecommendation[] }
  | { type: 'FETCH_ANALYTICS_SUCCESS'; payload: TrailAnalytics[] }
  | { type: 'SET_CURRENT_TRAIL'; payload: Trail }
  | { type: 'SET_CURRENT_PROGRESS'; payload: TrailProgress }
  | { type: 'UPDATE_TRAIL_PROGRESS'; payload: { trailId: string; progress: number } }
  | { type: 'COMPLETE_MODULE'; payload: { trailId: string; moduleId: string } }
  | { type: 'START_TRAIL'; payload: { trailId: string; userId: string } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: TrailState = {
  trails: [],
  userProgress: [],
  recommendations: [],
  analytics: [],
  loading: false,
  error: null,
  lastFetched: null,
  currentTrail: null,
  currentProgress: null,
};

// Reducer
function trailReducer(state: TrailState, action: TrailAction): TrailState {
  switch (action.type) {
    case 'FETCH_TRAILS_START':
      return { ...state, loading: true, error: null };
    
    case 'FETCH_TRAILS_SUCCESS':
      return {
        ...state,
        trails: action.payload,
        loading: false,
        lastFetched: new Date().toISOString(),
      };
    
    case 'FETCH_TRAILS_ERROR':
      return { ...state, loading: false, error: action.payload };
    
    case 'FETCH_PROGRESS_SUCCESS':
      return { ...state, userProgress: action.payload };
    
    case 'FETCH_RECOMMENDATIONS_SUCCESS':
      return { ...state, recommendations: action.payload };
    
    case 'FETCH_ANALYTICS_SUCCESS':
      return { ...state, analytics: action.payload };
    
    case 'SET_CURRENT_TRAIL':
      return { ...state, currentTrail: action.payload };
    
    case 'SET_CURRENT_PROGRESS':
      return { ...state, currentProgress: action.payload };
    
    case 'UPDATE_TRAIL_PROGRESS':
      return {
        ...state,
        userProgress: state.userProgress.map(progress =>
          progress.trailId === action.payload.trailId
            ? { ...progress, overallProgress: action.payload.progress, lastAccessed: new Date().toISOString() }
            : progress
        ),
        currentProgress: state.currentProgress?.trailId === action.payload.trailId
          ? { ...state.currentProgress, overallProgress: action.payload.progress, lastAccessed: new Date().toISOString() }
          : state.currentProgress,
      };
    
    case 'COMPLETE_MODULE':
      return {
        ...state,
        userProgress: state.userProgress.map(progress =>
          progress.trailId === action.payload.trailId
            ? {
                ...progress,
                completedModules: [...progress.completedModules, action.payload.moduleId],
                lastAccessed: new Date().toISOString(),
              }
            : progress
        ),
      };
    
    case 'START_TRAIL':
      const newProgress: TrailProgress = {
        trailId: action.payload.trailId,
        userId: action.payload.userId,
        currentModule: '',
        completedModules: [],
        overallProgress: 0,
        timeSpent: 0,
        lastAccessed: new Date().toISOString(),
        startedAt: new Date().toISOString(),
        moduleProgress: {},
        achievements: [],
        notes: [],
        bookmarks: [],
      };
      return {
        ...state,
        userProgress: [...state.userProgress, newProgress],
        currentProgress: newProgress,
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
interface TrailContextType {
  state: TrailState;
  fetchTrails: (filters?: TrailFilters) => Promise<void>;
  fetchUserProgress: (userId: string) => Promise<void>;
  fetchRecommendations: (userId: string) => Promise<void>;
  fetchAnalytics: (trailId?: string) => Promise<void>;
  setCurrentTrail: (trail: Trail) => void;
  startTrail: (trailId: string, userId: string) => Promise<void>;
  updateProgress: (trailId: string, progress: number) => Promise<void>;
  completeModule: (trailId: string, moduleId: string) => Promise<void>;
  refreshData: (userId: string) => Promise<void>;
  clearError: () => void;
}

// Trail filters interface
interface TrailFilters {
  category?: string;
  difficulty?: string;
  duration?: number;
  tags?: string[];
  search?: string;
}

// Create context
const TrailContext = createContext<TrailContextType | undefined>(undefined);

// Provider component
interface TrailProviderProps {
  children: ReactNode;
}

export function TrailProvider({ children }: TrailProviderProps) {
  const [state, dispatch] = useReducer(trailReducer, initialState);

  // API functions
  const fetchTrails = async (filters?: TrailFilters) => {
    try {
      dispatch({ type: 'FETCH_TRAILS_START' });
      
      const queryParams = new URLSearchParams();
      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.difficulty) queryParams.append('difficulty', filters.difficulty);
      if (filters?.duration) queryParams.append('duration', filters.duration.toString());
      if (filters?.tags) queryParams.append('tags', filters.tags.join(','));
      if (filters?.search) queryParams.append('search', filters.search);

      const response = await fetch(`/api/trails?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch trails: ${response.statusText}`);
      }

      const data = await response.json();
      dispatch({ type: 'FETCH_TRAILS_SUCCESS', payload: data.trails });
    } catch (error) {
      dispatch({ type: 'FETCH_TRAILS_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const fetchUserProgress = async (userId: string) => {
    try {
      const response = await fetch(`/api/trails/progress?userId=${userId}`, {
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

  const fetchRecommendations = async (userId: string) => {
    try {
      const response = await fetch(`/api/trails/recommendations?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
      }

      const data = await response.json();
      dispatch({ type: 'FETCH_RECOMMENDATIONS_SUCCESS', payload: data.recommendations });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const fetchAnalytics = async (trailId?: string) => {
    try {
      const url = trailId ? `/api/trails/analytics?trailId=${trailId}` : '/api/trails/analytics';
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const data = await response.json();
      dispatch({ type: 'FETCH_ANALYTICS_SUCCESS', payload: data.analytics });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const setCurrentTrail = (trail: Trail) => {
    dispatch({ type: 'SET_CURRENT_TRAIL', payload: trail });
    
    // Find current progress for this trail
    const progress = state.userProgress.find(p => p.trailId === trail.id);
    if (progress) {
      dispatch({ type: 'SET_CURRENT_PROGRESS', payload: progress });
    }
  };

  const startTrail = async (trailId: string, userId: string) => {
    try {
      dispatch({ type: 'START_TRAIL', payload: { trailId, userId } });

      // Update on server
      await fetch('/api/trails/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trailId,
          userId,
          startedAt: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Error starting trail:', error);
    }
  };

  const updateProgress = async (trailId: string, progress: number) => {
    try {
      dispatch({ type: 'UPDATE_TRAIL_PROGRESS', payload: { trailId, progress } });

      // Update on server
      await fetch('/api/trails/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trailId,
          progress,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const completeModule = async (trailId: string, moduleId: string) => {
    try {
      dispatch({ type: 'COMPLETE_MODULE', payload: { trailId, moduleId } });

      // Update on server
      await fetch('/api/trails/modules/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trailId,
          moduleId,
          completedAt: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Error completing module:', error);
    }
  };

  const refreshData = async (userId: string) => {
    await Promise.all([
      fetchTrails(),
      fetchUserProgress(userId),
      fetchRecommendations(userId),
      fetchAnalytics(),
    ]);
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: TrailContextType = {
    state,
    fetchTrails,
    fetchUserProgress,
    fetchRecommendations,
    fetchAnalytics,
    setCurrentTrail,
    startTrail,
    updateProgress,
    completeModule,
    refreshData,
    clearError,
  };

  return (
    <TrailContext.Provider value={value}>
      {children}
    </TrailContext.Provider>
  );
}

// Custom hook
export function useTrails() {
  const context = useContext(TrailContext);
  if (context === undefined) {
    throw new Error('useTrails must be used within a TrailProvider');
  }
  return context;
}

// Selector hooks for specific data
export function useTrailList() {
  const { state } = useTrails();
  return state.trails;
}

export function useTrailProgress() {
  const { state } = useTrails();
  return state.userProgress;
}

export function useTrailRecommendations() {
  const { state } = useTrails();
  return state.recommendations;
}

export function useCurrentTrail() {
  const { state } = useTrails();
  return { trail: state.currentTrail, progress: state.currentProgress };
}

export function useTrailLoading() {
  const { state } = useTrails();
  return state.loading;
}

export function useTrailError() {
  const { state } = useTrails();
  return state.error;
}
