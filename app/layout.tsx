import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import { ClientProviders } from '@/components/providers/ClientProviders'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://hubedu.ia'),
  title: {
    default: 'HubEdu.ia - Plataforma Educacional com IA',
    template: '%s | HubEdu.ia'
  },
  description: 'Plataforma educacional completa com IA conversacional, simulador ENEM e 8 módulos educacionais. Transforme sua experiência de aprendizado com tecnologia avançada.',
  keywords: [
    'educação',
    'IA',
    'inteligência artificial',
    'ENEM',
    'simulador',
    'professor',
    'escola',
    'aprendizado',
    'educação online',
    'plataforma educacional',
    'tutor IA',
    'chatbot educacional',
    'aulas interativas',
    'redação',
    'matemática',
    'física',
    'química',
    'biologia',
    'história',
    'geografia',
    'português',
    'literatura',
    'filosofia',
    'sociologia',
    'educação básica',
    'ensino médio',
    'vestibular',
    'concursos',
    'estudos',
    'aprendizado personalizado',
    'tecnologia educacional',
    'edtech',
    'Brasil',
    'educação brasileira'
  ],
  authors: [{ name: 'HubEdu.ia', url: 'https://hubedu.ia' }],
  creator: 'HubEdu.ia',
  publisher: 'HubEdu.ia',
  applicationName: 'HubEdu.ia',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://hubedu.ia',
    languages: {
      'pt-BR': 'https://hubedu.ia',
    },
  },
  category: 'Education',
  classification: 'Educational Technology Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
    other: {
      'msvalidate.01': 'your-bing-verification-code',
    },
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
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
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
    description: 'Plataforma educacional completa com IA conversacional, simulador ENEM e 8 módulos educacionais. Transforme sua experiência de aprendizado com tecnologia avançada.',
    siteName: 'HubEdu.ia',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HubEdu.ia - Plataforma Educacional com IA',
        type: 'image/png',
      },
      {
        url: '/og-image-square.png',
        width: 1200,
        height: 1200,
        alt: 'HubEdu.ia - Plataforma Educacional com IA',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@hubedu_ia',
    creator: '@hubedu_ia',
    title: 'HubEdu.ia - Plataforma Educacional com IA',
    description: 'Plataforma educacional completa com IA conversacional, simulador ENEM e 8 módulos educacionais.',
    images: ['/twitter-image.png'],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'msapplication-TileColor': '#ffd233',
    'msapplication-config': '/browserconfig.xml',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 3,
  userScalable: true,
  themeColor: '#ffd233',
  colorScheme: 'light',
  // Prevent excessive zoom
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-PFZKLG4HCR"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-PFZKLG4HCR');
            `,
          }}
        />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "HubEdu.ia",
              "description": "Plataforma educacional completa com IA conversacional, simulador ENEM e 8 módulos educacionais",
              "url": "https://hubedu.ia",
              "logo": "https://hubedu.ia/logo.png",
              "image": "https://hubedu.ia/og-image.png",
              "sameAs": [
                "https://twitter.com/hubedu_ia",
                "https://facebook.com/hubedu.ia",
                "https://instagram.com/hubedu.ia",
                "https://linkedin.com/company/hubedu-ia"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+55-11-99999-9999",
                "contactType": "customer service",
                "areaServed": "BR",
                "availableLanguage": "Portuguese"
              },
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "BR",
                "addressRegion": "São Paulo",
                "addressLocality": "São Paulo"
              },
              "offers": {
                "@type": "Offer",
                "name": "Plataforma Educacional HubEdu.ia",
                "description": "Acesso completo à plataforma educacional com IA",
                "price": "0",
                "priceCurrency": "BRL",
                "availability": "https://schema.org/InStock"
              },
              "educationalUse": [
                "ENEM",
                "Vestibular",
                "Educação Básica",
                "Ensino Médio",
                "Concursos"
              ],
              "audience": {
                "@type": "EducationalAudience",
                "educationalRole": "student"
              }
            })
          }}
        />
        
        {/* Additional SEO Meta Tags */}
        <meta name="geo.region" content="BR-SP" />
        <meta name="geo.placename" content="São Paulo" />
        <meta name="geo.position" content="-23.5505;-46.6333" />
        <meta name="ICBM" content="-23.5505, -46.6333" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//commons.wikimedia.org" />
        <link rel="dns-prefetch" href="//upload.wikimedia.org" />
      </head>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}