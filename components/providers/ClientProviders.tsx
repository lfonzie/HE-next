'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { GlobalLoadingProvider } from '@/hooks/useGlobalLoading';
import { ChatProvider } from '@/components/providers/ChatContext';
import { QuotaProvider } from '@/components/providers/QuotaProvider';
import { ToastProvider } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      disableTransitionOnChange
      storageKey="hubedu-theme"
      themes={['light', 'dark']}
    >
      <SessionProvider>
        <GlobalLoadingProvider>
          <ChatProvider>
            <QuotaProvider>
              <ToastProvider>
                {children}
                <Toaster />
              </ToastProvider>
            </QuotaProvider>
          </ChatProvider>
        </GlobalLoadingProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}