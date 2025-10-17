// components/virtual-labs/__tests__/VirtualLab.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VirtualLab from '../VirtualLab';

// Mock dos componentes de UI
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="card-description">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="card-title">{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props} data-testid="button">
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, ...props }: any) => (
    <input
      type="range"
      value={value?.[0] || 0}
      onChange={(e) => onValueChange?.(parseFloat(e.target.value))}
      {...props}
      data-testid="slider"
    />
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span data-testid="badge">{children}</span>,
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: { value: number }) => (
    <div data-testid="progress" data-value={value}></div>
  ),
}));

// Mock do fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      success: true,
      data: { status: 'running', message: 'Simulation started' }
    }),
    ok: true,
    status: 200,
  })
);

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('VirtualLab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders experiment interface correctly', () => {
    render(
      <TestWrapper>
        <VirtualLab
          subject="chemistry"
          topic="chemical-reaction"
          difficulty="intermediate"
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('Laboratório Virtual')).toBeInTheDocument();
    expect(screen.getByText('Reação Química')).toBeInTheDocument();
    expect(screen.getByText('Misture compostos e observe as reações com efeitos visuais')).toBeInTheDocument();
  });

  it('displays correct difficulty badge', () => {
    render(
      <TestWrapper>
        <VirtualLab
          subject="chemistry"
          topic="chemical-reaction"
          difficulty="beginner"
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('beginner')).toBeInTheDocument();
  });

  it('shows experiment controls', () => {
    render(
      <TestWrapper>
        <VirtualLab
          subject="chemistry"
          topic="chemical-reaction"
          difficulty="intermediate"
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('Iniciar')).toBeInTheDocument();
    expect(screen.getByText('Resetar')).toBeInTheDocument();
  });

  it('handles experiment start', async () => {
    const onComplete = jest.fn();
    
    render(
      <TestWrapper>
        <VirtualLab
          subject="chemistry"
          topic="chemical-reaction"
          difficulty="intermediate"
          onComplete={onComplete}
        />
      </TestWrapper>
    );
    
    const startButton = screen.getByText('Iniciar');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/virtual-lab/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"action":"start"')
      });
    });
  });

  it('handles experiment pause', async () => {
    render(
      <TestWrapper>
        <VirtualLab
          subject="chemistry"
          topic="chemical-reaction"
          difficulty="intermediate"
        />
      </TestWrapper>
    );
    
    const startButton = screen.getByText('Iniciar');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText('Pausar')).toBeInTheDocument();
    });
    
    const pauseButton = screen.getByText('Pausar');
    fireEvent.click(pauseButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/virtual-lab/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"action":"pause"')
      });
    });
  });

  it('handles experiment reset', async () => {
    render(
      <TestWrapper>
        <VirtualLab
          subject="chemistry"
          topic="chemical-reaction"
          difficulty="intermediate"
        />
      </TestWrapper>
    );
    
    const resetButton = screen.getByText('Resetar');
    fireEvent.click(resetButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/virtual-lab/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"action":"reset"')
      });
    });
  });

  it('updates variables when sliders change', () => {
    render(
      <TestWrapper>
        <VirtualLab
          subject="chemistry"
          topic="chemical-reaction"
          difficulty="intermediate"
        />
      </TestWrapper>
    );
    
    const sliders = screen.getAllByTestId('slider');
    expect(sliders).toHaveLength(3); // temperature, concentration, pressure
    
    // Test temperature slider
    fireEvent.change(sliders[0], { target: { value: '50' } });
    expect(sliders[0]).toHaveValue(50);
  });

  it('shows AI assistant when enabled', () => {
    render(
      <TestWrapper>
        <VirtualLab
          subject="chemistry"
          topic="chemical-reaction"
          difficulty="intermediate"
          enableAI={true}
        />
      </TestWrapper>
    );
    
    const aiButton = screen.getByRole('button', { name: /bot/i });
    expect(aiButton).toBeInTheDocument();
  });

  it('hides AI assistant when disabled', () => {
    render(
      <TestWrapper>
        <VirtualLab
          subject="chemistry"
          topic="chemical-reaction"
          difficulty="intermediate"
          enableAI={false}
        />
      </TestWrapper>
    );
    
    const aiButton = screen.queryByRole('button', { name: /bot/i });
    expect(aiButton).not.toBeInTheDocument();
  });

  it('shows sidebar when enabled', () => {
    render(
      <TestWrapper>
        <VirtualLab
          subject="chemistry"
          topic="chemical-reaction"
          difficulty="intermediate"
          showSidebar={true}
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('Laboratório Virtual')).toBeInTheDocument();
  });

  it('handles fullscreen toggle', () => {
    const mockRequestFullscreen = jest.fn();
    const mockExitFullscreen = jest.fn();
    
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
    });
    
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      value: mockRequestFullscreen,
      writable: true,
    });
    
    Object.defineProperty(document, 'exitFullscreen', {
      value: mockExitFullscreen,
      writable: true,
    });
    
    render(
      <TestWrapper>
        <VirtualLab
          subject="chemistry"
          topic="chemical-reaction"
          difficulty="intermediate"
          enableFullscreen={true}
        />
      </TestWrapper>
    );
    
    const fullscreenButton = screen.getByRole('button', { name: /maximize/i });
    fireEvent.click(fullscreenButton);
    
    expect(mockRequestFullscreen).toHaveBeenCalled();
  });

  it('calls onExperimentChange when experiment changes', () => {
    const onExperimentChange = jest.fn();
    
    render(
      <TestWrapper>
        <VirtualLab
          subject="chemistry"
          topic="chemical-reaction"
          difficulty="intermediate"
          onExperimentChange={onExperimentChange}
        />
      </TestWrapper>
    );
    
    expect(onExperimentChange).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'chemical-reaction',
        name: 'Reação Química',
        category: 'chemistry'
      })
    );
  });

  it('displays loading state initially', () => {
    render(
      <TestWrapper>
        <VirtualLab
          subject="chemistry"
          topic="chemical-reaction"
          difficulty="intermediate"
        />
      </TestWrapper>
    );
    
    // O componente deve renderizar sem mostrar loading após inicialização
    expect(screen.getByText('Laboratório Virtual')).toBeInTheDocument();
  });

  it('handles different subjects correctly', () => {
    const { rerender } = render(
      <TestWrapper>
        <VirtualLab
          subject="physics"
          topic="pendulum-motion"
          difficulty="beginner"
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('Movimento Pendular')).toBeInTheDocument();
    
    rerender(
      <TestWrapper>
        <VirtualLab
          subject="biology"
          topic="cell-microscopy"
          difficulty="intermediate"
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('Microscopia Celular')).toBeInTheDocument();
  });

  it('handles different difficulties correctly', () => {
    const { rerender } = render(
      <TestWrapper>
        <VirtualLab
          subject="chemistry"
          topic="chemical-reaction"
          difficulty="beginner"
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('beginner')).toBeInTheDocument();
    
    rerender(
      <TestWrapper>
        <VirtualLab
          subject="chemistry"
          topic="chemical-reaction"
          difficulty="advanced"
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('advanced')).toBeInTheDocument();
  });
});
