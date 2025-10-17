// hooks/useVirtualLab.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchExperiments, 
  fetchExperiment, 
  simulateExperiment, 
  calculatePhysics, 
  generateAIVisualEffects,
  predictReaction,
  getAIGuide,
  ExperimentFilters,
  SimulationResult,
  AIResponse
} from '@/lib/react-query';

// Hook para buscar experimentos
export const useExperiments = (filters?: ExperimentFilters) => {
  return useQuery({
    queryKey: ['experiments', filters],
    queryFn: () => fetchExperiments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para buscar um experimento específico
export const useExperiment = (id: string) => {
  return useQuery({
    queryKey: ['experiment', id],
    queryFn: () => fetchExperiment(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para simulação de experimentos
export const useSimulation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ experimentId, parameters, action }: {
      experimentId: string;
      parameters: any;
      action: string;
    }) => simulateExperiment(experimentId, parameters, action),
    onSuccess: (data, variables) => {
      // Invalidar cache relacionado ao experimento
      queryClient.invalidateQueries(['experiment', variables.experimentId]);
      queryClient.invalidateQueries(['simulation', variables.experimentId]);
    },
  });
};

// Hook para cálculos físicos
export const usePhysicsCalculation = () => {
  return useMutation({
    mutationFn: ({ experiment, parameters }: {
      experiment: string;
      parameters: any;
    }) => calculatePhysics(experiment, parameters),
  });
};

// Hook para efeitos visuais de IA
export const useAIVisualEffects = () => {
  return useMutation({
    mutationFn: ({ reaction, step, parameters }: {
      reaction: any;
      step: string;
      parameters: any;
    }) => generateAIVisualEffects(reaction, step, parameters),
  });
};

// Hook para predição de reações
export const useReactionPrediction = () => {
  return useMutation({
    mutationFn: ({ reactants, conditions }: {
      reactants: string[];
      conditions: any;
    }) => predictReaction(reactants, conditions),
  });
};

// Hook para guia de IA
export const useAIGuide = () => {
  return useMutation({
    mutationFn: ({ experimentId, question }: {
      experimentId: string;
      question: string;
    }) => getAIGuide(experimentId, question),
  });
};

// Hook para experimentos por categoria
export const useExperimentsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['experiments', 'category', category],
    queryFn: () => fetchExperiments({ category }),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para experimentos por dificuldade
export const useExperimentsByDifficulty = (difficulty: string) => {
  return useQuery({
    queryKey: ['experiments', 'difficulty', difficulty],
    queryFn: () => fetchExperiments({ difficulty }),
    enabled: !!difficulty,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para experimentos por tags
export const useExperimentsByTags = (tags: string[]) => {
  return useQuery({
    queryKey: ['experiments', 'tags', tags],
    queryFn: () => fetchExperiments({ tags }),
    enabled: tags.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para busca de experimentos
export const useSearchExperiments = (searchTerm: string) => {
  return useQuery({
    queryKey: ['experiments', 'search', searchTerm],
    queryFn: () => fetchExperiments({ search: searchTerm }),
    enabled: searchTerm.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutos para busca
  });
};

// Hook para pré-carregar experimentos
export const usePreloadExperiments = () => {
  const queryClient = useQueryClient();
  
  const preloadExperiment = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['experiment', id],
      queryFn: () => fetchExperiment(id),
      staleTime: 5 * 60 * 1000,
    });
  };
  
  const preloadExperimentsByCategory = (category: string) => {
    queryClient.prefetchQuery({
      queryKey: ['experiments', 'category', category],
      queryFn: () => fetchExperiments({ category }),
      staleTime: 5 * 60 * 1000,
    });
  };
  
  return { preloadExperiment, preloadExperimentsByCategory };
};

// Hook para estatísticas de experimentos
export const useExperimentStats = () => {
  const { data: experiments } = useExperiments();
  
  const stats = React.useMemo(() => {
    if (!experiments) return null;
    
    const total = experiments.length;
    const byCategory = experiments.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byDifficulty = experiments.reduce((acc, exp) => {
      acc[exp.difficulty] = (acc[exp.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const avgDuration = experiments.reduce((sum, exp) => sum + exp.duration, 0) / total;
    
    return {
      total,
      byCategory,
      byDifficulty,
      avgDuration: Math.round(avgDuration),
    };
  }, [experiments]);
  
  return { data: stats, isLoading: !experiments };
};

// Hook para cache de resultados de IA
export const useAICache = () => {
  const queryClient = useQueryClient();
  
  const getCachedAIResponse = (key: string) => {
    return queryClient.getQueryData(['ai-cache', key]);
  };
  
  const setCachedAIResponse = (key: string, data: any, ttl = 3600) => {
    queryClient.setQueryData(['ai-cache', key], data);
    
    // Remover do cache após TTL
    setTimeout(() => {
      queryClient.removeQueries(['ai-cache', key]);
    }, ttl * 1000);
  };
  
  const invalidateAICache = (pattern?: string) => {
    if (pattern) {
      queryClient.invalidateQueries(['ai-cache', pattern]);
    } else {
      queryClient.invalidateQueries(['ai-cache']);
    }
  };
  
  return {
    getCachedAIResponse,
    setCachedAIResponse,
    invalidateAICache,
  };
};

// Hook para debounce com React Query
export const useDebouncedQuery = <T>(
  queryKey: any[],
  queryFn: () => Promise<T>,
  delay: number = 300,
  options?: any
) => {
  const [debouncedQueryKey, setDebouncedQueryKey] = React.useState(queryKey);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQueryKey(queryKey);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [queryKey, delay]);
  
  return useQuery({
    queryKey: debouncedQueryKey,
    queryFn,
    ...options,
  });
};

// Hook para experimentos favoritos
export const useFavoriteExperiments = () => {
  const [favorites, setFavorites] = React.useState<string[]>([]);
  
  React.useEffect(() => {
    const stored = localStorage.getItem('virtual-lab-favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);
  
  const addFavorite = (experimentId: string) => {
    const newFavorites = [...favorites, experimentId];
    setFavorites(newFavorites);
    localStorage.setItem('virtual-lab-favorites', JSON.stringify(newFavorites));
  };
  
  const removeFavorite = (experimentId: string) => {
    const newFavorites = favorites.filter(id => id !== experimentId);
    setFavorites(newFavorites);
    localStorage.setItem('virtual-lab-favorites', JSON.stringify(newFavorites));
  };
  
  const toggleFavorite = (experimentId: string) => {
    if (favorites.includes(experimentId)) {
      removeFavorite(experimentId);
    } else {
      addFavorite(experimentId);
    }
  };
  
  const isFavorite = (experimentId: string) => favorites.includes(experimentId);
  
  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
};

// Hook para histórico de experimentos
export const useExperimentHistory = () => {
  const [history, setHistory] = React.useState<any[]>([]);
  
  React.useEffect(() => {
    const stored = localStorage.getItem('virtual-lab-history');
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);
  
  const addToHistory = (experiment: any, results: any) => {
    const entry = {
      id: Date.now().toString(),
      experiment,
      results,
      timestamp: new Date().toISOString(),
    };
    
    const newHistory = [entry, ...history].slice(0, 50); // Manter apenas 50 entradas
    setHistory(newHistory);
    localStorage.setItem('virtual-lab-history', JSON.stringify(newHistory));
  };
  
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('virtual-lab-history');
  };
  
  return {
    history,
    addToHistory,
    clearHistory,
  };
};
