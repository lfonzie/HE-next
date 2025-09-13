import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { LessonProvider } from '@/components/providers/LessonProvider'
import { NotificationProvider } from '@/components/providers/NotificationProvider'
import { PWAProvider } from '@/components/providers/PWAProvider'
import { LoadingProvider } from '@/lib/loading'
import { SplashScreen } from '@/components/ui/SplashScreen'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'
import '../styles/loading-screen.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HubEdu.ia - Plataforma Educacional com IA',
  description: 'Plataforma educacional completa com IA conversacional, simulador ENEM e 8 módulos educacionais',
  keywords: ['educação', 'IA', 'ENEM', 'simulador', 'professor', 'escola', 'aprendizado'],
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
  manifest: '/manifest.webmanifest',
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
    description: 'Plataforma educacional completa com IA conversacional, simulador ENEM e 8 módulos educacionais',
    siteName: 'HubEdu.ia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HubEdu.ia - Plataforma Educacional com IA',
    description: 'Plataforma educacional completa com IA conversacional, simulador ENEM e 8 módulos educacionais',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffd233',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="mask-icon" href="/favicon.svg" color="#ffd233" />
        
        <meta name="theme-color" content="#ffd233" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="HubEdu.ia" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#ffd233" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:site_name" content="HubEdu.ia" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@HubEduIA" />
      </head>
      <body className={inter.className}>
        <SplashScreen />
        <SessionProvider>
          <ThemeProvider>
            <PWAProvider>
              <LoadingProvider>
                <LessonProvider>
                  <NotificationProvider>
                    {children}
                    <Toaster />
                  </NotificationProvider>
                </LessonProvider>
              </LoadingProvider>
            </PWAProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
