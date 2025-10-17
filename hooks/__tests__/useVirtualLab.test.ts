// hooks/__tests__/useVirtualLab.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useExperiments, 
  useExperiment, 
  useSimulation,
  usePhysicsCalculation,
  useAIVisualEffects,
  useFavoriteExperiments,
  useExperimentHistory
} from '../useVirtualLab';

// Mock do fetch
global.fetch = jest.fn();

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useVirtualLab hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ data: [] }),
      ok: true,
      status: 200,
    });
  });

  describe('useExperiments', () => {
    it('fetches experiments successfully', async () => {
      const mockExperiments = [
        {
          id: 'test-experiment',
          name: 'Test Experiment',
          description: 'A test experiment',
          category: 'chemistry',
          difficulty: 'beginner',
          duration: 10,
          tags: ['test'],
          icon: jest.fn(),
          component: jest.fn(),
        }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ data: mockExperiments }),
        ok: true,
        status: 200,
      });

      const { result } = renderHook(() => useExperiments(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockExperiments);
    });

    it('handles fetch error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'));

      const { result } = renderHook(() => useExperiments(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('filters experiments by category', async () => {
      const { result } = renderHook(() => useExperiments({ category: 'chemistry' }), { wrapper });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/virtual-lab/experiments?category=chemistry');
      });
    });

    it('filters experiments by difficulty', async () => {
      const { result } = renderHook(() => useExperiments({ difficulty: 'beginner' }), { wrapper });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/virtual-lab/experiments?difficulty=beginner');
      });
    });
  });

  describe('useExperiment', () => {
    it('fetches single experiment successfully', async () => {
      const mockExperiment = {
        id: 'test-experiment',
        name: 'Test Experiment',
        description: 'A test experiment',
        category: 'chemistry',
        difficulty: 'beginner',
        duration: 10,
        tags: ['test'],
        icon: jest.fn(),
        component: jest.fn(),
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ data: mockExperiment }),
        ok: true,
        status: 200,
      });

      const { result } = renderHook(() => useExperiment('test-experiment'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockExperiment);
    });

    it('does not fetch when id is empty', () => {
      const { result } = renderHook(() => useExperiment(''), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('useSimulation', () => {
    it('executes simulation successfully', async () => {
      const mockResponse = {
        success: true,
        data: { status: 'running', message: 'Simulation started' }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
        status: 200,
      });

      const { result } = renderHook(() => useSimulation(), { wrapper });

      await waitFor(() => {
        result.current.mutate({
          experimentId: 'test-experiment',
          parameters: { temperature: 25 },
          action: 'start'
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
    });

    it('handles simulation error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Simulation failed'));

      const { result } = renderHook(() => useSimulation(), { wrapper });

      await waitFor(() => {
        result.current.mutate({
          experimentId: 'test-experiment',
          parameters: { temperature: 25 },
          action: 'start'
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('usePhysicsCalculation', () => {
    it('calculates physics successfully', async () => {
      const mockResponse = {
        success: true,
        data: { period: 2.0, frequency: 0.5 }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
        status: 200,
      });

      const { result } = renderHook(() => usePhysicsCalculation(), { wrapper });

      await waitFor(() => {
        result.current.mutate({
          experiment: 'pendulum',
          parameters: { length: 1, gravity: 9.8 }
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe('useAIVisualEffects', () => {
    it('generates visual effects successfully', async () => {
      const mockResponse = {
        success: true,
        visualEffects: {
          colors: ['blue', 'red'],
          particles: ['bubbles'],
          movement: ['swirling']
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
        status: 200,
      });

      const { result } = renderHook(() => useAIVisualEffects(), { wrapper });

      await waitFor(() => {
        result.current.mutate({
          reaction: { type: 'acid-base' },
          step: 'mixing',
          parameters: { temperature: 25 }
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe('useFavoriteExperiments', () => {
    beforeEach(() => {
      // Mock localStorage
      const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });
    });

    it('manages favorites correctly', () => {
      const { result } = renderHook(() => useFavoriteExperiments());

      expect(result.current.favorites).toEqual([]);
      expect(result.current.isFavorite('test-experiment')).toBe(false);

      result.current.addFavorite('test-experiment');
      expect(result.current.favorites).toContain('test-experiment');
      expect(result.current.isFavorite('test-experiment')).toBe(true);

      result.current.removeFavorite('test-experiment');
      expect(result.current.favorites).not.toContain('test-experiment');
      expect(result.current.isFavorite('test-experiment')).toBe(false);
    });

    it('toggles favorites correctly', () => {
      const { result } = renderHook(() => useFavoriteExperiments());

      result.current.toggleFavorite('test-experiment');
      expect(result.current.favorites).toContain('test-experiment');

      result.current.toggleFavorite('test-experiment');
      expect(result.current.favorites).not.toContain('test-experiment');
    });
  });

  describe('useExperimentHistory', () => {
    beforeEach(() => {
      // Mock localStorage
      const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });
    });

    it('manages history correctly', () => {
      const { result } = renderHook(() => useExperimentHistory());

      expect(result.current.history).toEqual([]);

      const mockExperiment = {
        id: 'test-experiment',
        name: 'Test Experiment',
        category: 'chemistry'
      };

      const mockResults = {
        score: 85,
        timeSpent: 300,
        attempts: 2
      };

      result.current.addToHistory(mockExperiment, mockResults);
      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0]).toMatchObject({
        experiment: mockExperiment,
        results: mockResults
      });

      result.current.clearHistory();
      expect(result.current.history).toEqual([]);
    });
  });
});
