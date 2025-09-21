'use client';

import { ReactNode } from 'react';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { LessonProvider } from '@/components/providers/LessonProvider';
import { LoadingProvider, LoadingOverlay, RouteLoadingGlue } from '@/components/ui/SplashScreen';
import { PageTransitionProvider } from '@/components/providers/PageTransitionProvider';
import { GlobalLoadingProvider } from '@/hooks/useGlobalLoading';
import { NotificationProvider } from '@/components/providers/NotificationProvider';
import { ToastProvider } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <LoadingProvider>
      <RouteLoadingGlue />
      <LoadingOverlay />
      <SessionProvider>
        <GlobalLoadingProvider>
          <PageTransitionProvider>
            <LessonProvider>
              <ToastProvider>
                <NotificationProvider>
                  {children}
                  <Toaster />
                </NotificationProvider>
              </ToastProvider>
            </LessonProvider>
          </PageTransitionProvider>
        </GlobalLoadingProvider>
      </SessionProvider>
    </LoadingProvider>
  );
}
