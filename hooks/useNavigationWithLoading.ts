'use client';

import { useRouter } from 'next/navigation';
import { usePageTransition } from '@/components/providers/PageTransitionProvider';

export function useNavigationWithLoading() {
  const router = useRouter();
  const { startTransition } = usePageTransition();

  const push = (url: string, message?: string) => {
    startTransition(message || 'Navegando...');
    router.push(url);
  };

  const replace = (url: string, message?: string) => {
    startTransition(message || 'Redirecionando...');
    router.replace(url);
  };

  const back = (message?: string) => {
    startTransition(message || 'Voltando...');
    router.back();
  };

  const forward = (message?: string) => {
    startTransition(message || 'Avançando...');
    router.forward();
  };

  const refresh = (message?: string) => {
    startTransition(message || 'Atualizando página...');
    router.refresh();
  };

  return {
    push,
    replace,
    back,
    forward,
    refresh,
    // Expor métodos originais do router se necessário
    router
  };
}

