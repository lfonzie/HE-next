'use client';

import React, { Suspense, lazy, useMemo } from 'react';
import { motion } from 'framer-motion';

// Lazy loading dos componentes de experimentos
const LazyChemicalReactionLab = lazy(() => import('./EnhancedChemicalReactionLab'));
const LazyPendulumLab = lazy(() => import('./PendulumLab'));
const LazyBouncingBallLab = lazy(() => import('./BouncingBallLab'));
const LazyColorMixingLab = lazy(() => import('./ColorMixingLab'));
const LazyCellMicroscopyLab = lazy(() => import('./CellMicroscopyLab'));
const LazyFunctionGraphingLab = lazy(() => import('./FunctionGraphingLab'));

// Componente de loading skeleton
const ExperimentSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
      <div className="p-6">
        {/* Header skeleton */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        
        {/* Controls skeleton */}
        <div className="flex space-x-4 mb-6">
          <div className="h-10 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>
        
        {/* Variables skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        
        {/* Canvas skeleton */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="w-full h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

// Componente de erro para fallback
const ExperimentError = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
    <div className="p-6 text-center">
      <div className="text-red-500 mb-4">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Erro ao carregar experimento
      </h3>
      <p className="text-gray-600 mb-4">
        {error.message || 'Ocorreu um erro inesperado'}
      </p>
      <button
        onClick={retry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  </div>
);

// Hook para gerenciar estado de erro
const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);
  
  const resetError = React.useCallback(() => {
    setError(null);
  }, []);
  
  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);
  
  return { error, resetError, captureError };
};

// Componente principal de carregamento lazy
interface LazyExperimentLoaderProps {
  experimentType: string;
  experimentId: string;
  onError?: (error: Error) => void;
}

const LazyExperimentLoader: React.FC<LazyExperimentLoaderProps> = ({ 
  experimentType, 
  experimentId,
  onError 
}) => {
  const { error, resetError, captureError } = useErrorBoundary();
  
  // Mapeamento de tipos de experimento para componentes lazy
  const ExperimentComponent = useMemo(() => {
    switch (experimentType) {
      case 'chemical-reaction':
        return LazyChemicalReactionLab;
      case 'pendulum-motion':
        return LazyPendulumLab;
      case 'bouncing-ball':
        return LazyBouncingBallLab;
      case 'color-mixing':
        return LazyColorMixingLab;
      case 'cell-microscopy':
        return LazyCellMicroscopyLab;
      case 'function-graphing':
        return LazyFunctionGraphingLab;
      default:
        return null;
    }
  }, [experimentType]);

  // Se houver erro, mostrar componente de erro
  if (error) {
    return <ExperimentError error={error} retry={resetError} />;
  }

  // Se não há componente para este tipo, mostrar mensagem
  if (!ExperimentComponent) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
        <div className="p-6 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.591" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Experimento não encontrado
          </h3>
          <p className="text-gray-600">
            O tipo de experimento "{experimentType}" não está disponível.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense 
      fallback={<ExperimentSkeleton />}
      onError={captureError}
    >
      <ExperimentComponent />
    </Suspense>
  );
};

// Componente wrapper com error boundary
class ExperimentErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Experiment Error Boundary caught an error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ExperimentError 
          error={this.state.error!} 
          retry={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}

// Hook para pré-carregar experimentos
export const useExperimentPreloader = () => {
  const preloadExperiment = React.useCallback((experimentType: string) => {
    switch (experimentType) {
      case 'chemical-reaction':
        import('./EnhancedChemicalReactionLab');
        break;
      case 'pendulum-motion':
        import('./PendulumLab');
        break;
      case 'bouncing-ball':
        import('./BouncingBallLab');
        break;
      case 'color-mixing':
        import('./ColorMixingLab');
        break;
      case 'cell-microscopy':
        import('./CellMicroscopyLab');
        break;
      case 'function-graphing':
        import('./FunctionGraphingLab');
        break;
    }
  }, []);

  const preloadAllExperiments = React.useCallback(() => {
    const experimentTypes = [
      'chemical-reaction',
      'pendulum-motion', 
      'bouncing-ball',
      'color-mixing',
      'cell-microscopy',
      'function-graphing'
    ];
    
    experimentTypes.forEach(preloadExperiment);
  }, [preloadExperiment]);

  return { preloadExperiment, preloadAllExperiments };
};

// Componente principal exportado
interface ExperimentLoaderProps {
  experimentType: string;
  experimentId: string;
  onError?: (error: Error) => void;
  className?: string;
}

const ExperimentLoader: React.FC<ExperimentLoaderProps> = ({
  experimentType,
  experimentId,
  onError,
  className = ''
}) => {
  return (
    <div className={className}>
      <ExperimentErrorBoundary onError={onError}>
        <LazyExperimentLoader
          experimentType={experimentType}
          experimentId={experimentId}
          onError={onError}
        />
      </ExperimentErrorBoundary>
    </div>
  );
};

export default ExperimentLoader;
export { useExperimentPreloader, ExperimentSkeleton };
