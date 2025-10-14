'use client';

import { ReactNode } from 'react';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { GlobalLoadingProvider } from '@/hooks/useGlobalLoading';
import { ChatProvider } from '@/components/providers/ChatContext';
import { QuotaProvider } from '@/components/providers/QuotaProvider';
import { ToastProvider } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/contexts/ThemeContext';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider>
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