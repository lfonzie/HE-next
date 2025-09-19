import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import { SessionProvider } from '@/components/providers/SessionProvider'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
import { LessonProvider } from '@/components/providers/LessonProvider'
import { PWAProvider } from '@/components/providers/PWAProvider'
import { LoadingProvider } from '@/components/ui/loading'
import { PageTransitionProvider } from '@/components/providers/PageTransitionProvider'
import { SplashScreen } from '@/components/ui/SplashScreen'
import { Toaster } from '@/components/ui/toaster'
import { GlobalLoadingProvider } from '@/hooks/useGlobalLoading'
import { NotificationProvider } from '@/components/providers/NotificationProvider'
import { ToastProvider } from '@/hooks/use-toast'
import PWAManagerWrapper from '@/components/pwa/PWAManagerWrapper'
import './globals.css'

export const metadata: Metadata = {
  title: 'HubEdu.ia - Plataforma Educacional com IA',
  description: 'Plataforma educacional completa com IA conversacional, simulador ENEM e 8 modulos educacionais',
  keywords: ['educacao', 'IA', 'ENEM', 'simulador', 'professor', 'escola', 'aprendizado'],
  authors: [{ name: 'HubEdu.ia' }],
  creator: 'HubEdu.ia',
  publisher: 'HubEdu.ia',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/icons-new/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/favicon.svg', color: '#ffd233' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HubEdu.ia',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://hubedu.ia',
    title: 'HubEdu.ia - Plataforma Educacional com IA',
    description: 'Plataforma educacional completa com IA conversacional, simulador ENEM e 8 modulos educacionais',
    siteName: 'HubEdu.ia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HubEdu.ia - Plataforma Educacional com IA',
    description: 'Plataforma educacional completa com IA conversacional, simulador ENEM e 8 modulos educacionais',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffd233',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {/* <SplashScreen /> */}
        <SessionProvider>
          {/* <PWAProvider> */}
            <LoadingProvider>
              <GlobalLoadingProvider>
                <PageTransitionProvider>
                  <LessonProvider>
                    <ToastProvider>
                      <NotificationProvider>
                        {children}
                        {/* <PWAManagerWrapper /> */}
                        <Toaster />
                      </NotificationProvider>
                    </ToastProvider>
                  </LessonProvider>
                </PageTransitionProvider>
              </GlobalLoadingProvider>
            </LoadingProvider>
          {/* </PWAProvider> */}
        </SessionProvider>
      </body>
    </html>
  )
}
