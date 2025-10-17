// lib/react-query.ts
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Configuração do QueryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Provider para React Query
export const ReactQueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

// Tipos para experimentos
export interface Experiment {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  tags: string[];
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  component: React.FC;
}

export interface ExperimentFilters {
  category?: string;
  difficulty?: string;
  tags?: string[];
  search?: string;
}

export interface SimulationResult {
  success: boolean;
  data: {
    status: string;
    message: string;
    parameters?: any;
    timestamp: number;
  };
}

export interface AIResponse {
  success: boolean;
  visualEffects: {
    colors: string[];
    particles: string[];
    movement: string[];
    temperature: string;
    gases: string[];
    animations: string[];
    intensity: string;
    equipment: string[];
    rawResponse?: string;
  };
  cached?: boolean;
  timestamp: string;
  aiProvider: string;
}

// Funções de API
export const fetchExperiments = async (filters?: ExperimentFilters): Promise<Experiment[]> => {
  const params = new URLSearchParams();
  
  if (filters?.category) params.append('category', filters.category);
  if (filters?.difficulty) params.append('difficulty', filters.difficulty);
  if (filters?.tags) filters.tags.forEach(tag => params.append('tag', tag));
  if (filters?.search) params.append('search', filters.search);

  const response = await fetch(`/api/virtual-lab/experiments?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch experiments');
  }
  
  const data = await response.json();
  return data.data || [];
};

export const fetchExperiment = async (id: string): Promise<Experiment> => {
  const response = await fetch(`/api/virtual-lab/experiments/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch experiment');
  }
  
  const data = await response.json();
  return data.data;
};

export const simulateExperiment = async (
  experimentId: string,
  parameters: any,
  action: string
): Promise<SimulationResult> => {
  const response = await fetch('/api/virtual-lab/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      experimentId,
      parameters,
      action
    })
  });
  
  if (!response.ok) {
    throw new Error('Simulation failed');
  }
  
  return response.json();
};

export const calculatePhysics = async (
  experiment: string,
  parameters: any
): Promise<any> => {
  const response = await fetch('/api/virtual-lab/physics/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      experiment,
      parameters
    })
  });
  
  if (!response.ok) {
    throw new Error('Physics calculation failed');
  }
  
  const data = await response.json();
  return data.data;
};

export const generateAIVisualEffects = async (
  reaction: any,
  step: string,
  parameters: any
): Promise<AIResponse> => {
  const response = await fetch('/api/virtual-lab/ai/visual-effects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reaction,
      step,
      parameters
    })
  });
  
  if (!response.ok) {
    throw new Error('AI visual effects generation failed');
  }
  
  return response.json();
};

export const predictReaction = async (
  reactants: string[],
  conditions: any
): Promise<any> => {
  const response = await fetch('/api/virtual-lab/ai/predict-reaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reactants,
      conditions
    })
  });
  
  if (!response.ok) {
    throw new Error('Reaction prediction failed');
  }
  
  const data = await response.json();
  return data.data;
};

export const getAIGuide = async (
  experimentId: string,
  question: string
): Promise<any> => {
  const response = await fetch('/api/virtual-lab/ai/guide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      experimentId,
      question
    })
  });
  
  if (!response.ok) {
    throw new Error('AI guide failed');
  }
  
  const data = await response.json();
  return data.data;
};
