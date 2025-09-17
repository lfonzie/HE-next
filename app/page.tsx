import type { Metadata } from 'next'

import ComingSoonPage from '@/components/landing/ComingSoonPage'

export const metadata: Metadata = {
  title: 'HubEdu.ia - Em breve',
  description: 'HubEdu.ia: Transformando o aprendizado com uma plataforma inteligente para educação.',
  openGraph: {
    title: 'HubEdu.ia - Em breve',
    description: 'HubEdu.ia: Transformando o aprendizado com uma plataforma inteligente para educação.',
  },
  twitter: {
    title: 'HubEdu.ia - Em breve',
    description: 'HubEdu.ia: Transformando o aprendizado com uma plataforma inteligente para educação.',
    card: 'summary_large_image',
  },
}

export default function HomePage() {
  return <ComingSoonPage />
}
