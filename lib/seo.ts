import { Metadata } from 'next'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
}

export function generateMetadata({
  title,
  description,
  keywords = [],
  image = '/og-image.png',
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = []
}: SEOProps): Metadata {
  const baseUrl = 'https://hubedu.ia'
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`

  const defaultKeywords = [
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
  ]

  const allKeywords = [...new Set([...defaultKeywords, ...keywords, ...tags])]

  const metadata: Metadata = {
    title: title ? `${title} | HubEdu.ia` : 'HubEdu.ia - Plataforma Educacional com IA',
    description: description || 'Plataforma educacional completa com IA conversacional, simulador ENEM e 8 módulos educacionais. Transforme sua experiência de aprendizado com tecnologia avançada.',
    keywords: allKeywords,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: title ? `${title} | HubEdu.ia` : 'HubEdu.ia - Plataforma Educacional com IA',
      description: description || 'Plataforma educacional completa com IA conversacional, simulador ENEM e 8 módulos educacionais.',
      url: fullUrl,
      type,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title || 'HubEdu.ia - Plataforma Educacional com IA',
        },
      ],
      locale: 'pt_BR',
      siteName: 'HubEdu.ia',
    },
    twitter: {
      card: 'summary_large_image',
      title: title ? `${title} | HubEdu.ia` : 'HubEdu.ia - Plataforma Educacional com IA',
      description: description || 'Plataforma educacional completa com IA conversacional, simulador ENEM e 8 módulos educacionais.',
      images: [fullImageUrl],
      site: '@hubedu_ia',
      creator: '@hubedu_ia',
    },
  }

  // Add article-specific metadata
  if (type === 'article') {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
      section,
      tags,
    }
  }

  return metadata
}

export function generateStructuredData({
  title,
  description,
  url,
  type = 'WebPage',
  author,
  publishedTime,
  modifiedTime,
  image,
  breadcrumbs,
}: {
  title?: string
  description?: string
  url?: string
  type?: 'WebPage' | 'Article' | 'Course' | 'EducationalOrganization'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  image?: string
  breadcrumbs?: Array<{ name: string; url: string }>
}) {
  const baseUrl = 'https://hubedu.ia'
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  const fullImageUrl = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : `${baseUrl}/og-image.png`

  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    name: title || 'HubEdu.ia - Plataforma Educacional com IA',
    description: description || 'Plataforma educacional completa com IA conversacional, simulador ENEM e 8 módulos educacionais.',
    url: fullUrl,
    image: fullImageUrl,
    publisher: {
      '@type': 'Organization',
      name: 'HubEdu.ia',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
  }

  if (type === 'Article' && author) {
    return {
      ...baseStructuredData,
      author: {
        '@type': 'Person',
        name: author,
      },
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': fullUrl,
      },
    }
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    return {
      ...baseStructuredData,
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`,
        })),
      },
    }
  }

  return baseStructuredData
}

export function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = [
    { name: 'Início', url: '/' }
  ]

  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const name = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    breadcrumbs.push({
      name,
      url: currentPath,
    })
  })

  return breadcrumbs
}
