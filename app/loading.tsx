'use client';

import { useEffect } from 'react';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { LoadingScreen } from '@/components/ui/loading';

export default function GlobalLoadingPage() {
  const loading = useGlobalLoading();

  useEffect(() => {
    // Quando o loading.tsx monta, esconde o overlay global
    // Isso garante que o overlay some assim que a rota começa a renderizar
    loading.hide();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vazio para executar apenas uma vez

  return (
    <LoadingScreen message="Carregando..." />
  );
}
