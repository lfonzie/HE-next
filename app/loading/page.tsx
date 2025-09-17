'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/ui/UnifiedLoadingScreen';

export default function GlobalLoadingPage() {
  const router = useRouter();

  const handleLoadingComplete = () => {
    // Redirect to main page after loading completes
    router.push('/');
  };

  return (
    <LoadingScreen 
      onComplete={handleLoadingComplete}
      duration={6000} // 6 seconds loading time
      message="Carregando plataforma..."
      variant="fullscreen"
    />
  );
}
