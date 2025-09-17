// Sistema Unificado de Loading - HubEdu.ia
// Este arquivo centraliza todas as exportações do sistema de loading

// Componente principal de loading screen
export { default as LoadingScreen } from './UnifiedLoadingScreen';

// Componentes auxiliares
export { 
  SimpleSpinner, 
  LoadingOverlay, 
  useLoadingScreen 
} from './UnifiedLoadingScreen';

// Componentes de compatibilidade
export { 
  LoadingScreen as LegacyLoadingScreen,
  LoadingSpinner as LegacyLoadingSpinner,
  LoadingOverlay as LegacyLoadingOverlay,
  PageLoading 
} from './loading';

// Sistema global de loading (para casos avançados)
export {
  LoadingProvider,
  useLoading,
  Spinner,
  LoadingCard,
  ProgressBar,
  useLoadingState,
  useProgressLoading,
  Skeleton,
  ChatSkeleton,
  CardSkeleton,
  TableSkeleton,
  LoadingButton,
  LoadingInput,
  useButtonLoading,
  useInputLoading
} from '../lib/loading';

// Hook global de loading (para compatibilidade)
export { 
  useGlobalLoading,
  GlobalLoadingProvider 
} from '../hooks/useGlobalLoading';
