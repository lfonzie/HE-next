'use client';

import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

export function GlobalLoading() {
  const { state } = useGlobalLoading();

  return (
    <LoadingOverlay
      isVisible={state.isVisible}
      message={state.message}
      showCancelButton={state.showCancelButton}
      onCancel={state.onCancel}
    />
  );
}
