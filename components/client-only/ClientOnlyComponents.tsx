/**
 * Wrapper para componentes que precisam ser carregados apenas no cliente
 * Evita erros de SSR com bibliotecas que acessam APIs do browser
 */

import dynamic from 'next/dynamic';
import { ComponentType, useState, useEffect } from 'react';

/**
 * Cria um componente dinâmico que só carrega no cliente
 * @param importFunc Função que importa o componente
 * @param fallback Componente de fallback (opcional)
 */
export function createClientOnlyComponent<T = {}>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: ComponentType<T>
) {
  return dynamic(importFunc, {
    ssr: false,
    loading: fallback ? () => fallback({} as T) : undefined,
  });
}

/**
 * Componentes dinâmicos pré-configurados para bibliotecas comuns
 */

// Para gráficos (recharts, chart.js, etc.)
export const DynamicChart = createClientOnlyComponent(
  () => import('recharts').then(mod => ({ default: mod.ResponsiveContainer }))
);

// Para animações (framer-motion, lottie, etc.)
export const DynamicMotion = createClientOnlyComponent(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div }))
);

// Para PDFs (pdfjs-dist, react-pdf, etc.)
export const DynamicPDFViewer = createClientOnlyComponent(
  () => import('react-pdf').then(mod => ({ default: mod.Document }))
);

// Para mapas (mapbox-gl, leaflet, etc.)
export const DynamicMap = createClientOnlyComponent(
  () => import('react-map-gl').then(mod => ({ default: mod.Map }))
);

// Para editores de código (monaco-editor, codemirror, etc.)
export const DynamicCodeEditor = createClientOnlyComponent(
  () => import('@monaco-editor/react').then(mod => ({ default: mod.Editor }))
);

// Para vídeos (video.js, plyr, etc.)
export const DynamicVideoPlayer = createClientOnlyComponent(
  () => import('video.js').then(mod => ({ default: mod.default }))
);

/**
 * Hook para verificar se estamos no cliente
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
}

/**
 * Componente wrapper que só renderiza no cliente
 */
export function ClientOnly({ children, fallback }: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  const isClient = useIsClient();
  
  if (!isClient) {
    return fallback || null;
  }
  
  return <>{children}</>;
}
