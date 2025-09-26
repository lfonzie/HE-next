'use client'

import Head from 'next/head'

interface MetaTagsProps {
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
  noIndex?: boolean
  noFollow?: boolean
}

export function MetaTags({
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
  tags = [],
  noIndex = false,
  noFollow = false,
}: MetaTagsProps) {
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

  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow',
  ].join(', ')

  return (
    <Head>
      {/* Basic Meta Tags */}
      {title && <title>{title} | HubEdu.ia</title>}
      {description && <meta name="description" content={description} />}
      <meta name="keywords" content={allKeywords.join(', ')} />
      <meta name="robots" content={robotsContent} />
      <meta name="author" content={author || 'HubEdu.ia'} />
      <meta name="generator" content="Next.js" />
      <meta name="theme-color" content="#ffd700" />
      <meta name="msapplication-TileColor" content="#ffd700" />
      <meta name="msapplication-config" content="/browserconfig.xml" />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title ? `${title} | HubEdu.ia` : 'HubEdu.ia - Plataforma Educacional com IA'} />
      <meta property="og:description" content={description || 'Plataforma educacional completa com IA conversacional, simulador ENEM e 8 módulos educacionais.'} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || 'HubEdu.ia - Plataforma Educacional com IA'} />
      <meta property="og:site_name" content="HubEdu.ia" />
      <meta property="og:locale" content="pt_BR" />

      {/* Article-specific Open Graph tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@hubedu_ia" />
      <meta name="twitter:creator" content="@hubedu_ia" />
      <meta name="twitter:title" content={title ? `${title} | HubEdu.ia` : 'HubEdu.ia - Plataforma Educacional com IA'} />
      <meta name="twitter:description" content={description || 'Plataforma educacional completa com IA conversacional, simulador ENEM e 8 módulos educacionais.'} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={title || 'HubEdu.ia - Plataforma Educacional com IA'} />

      {/* Additional Meta Tags */}
      <meta name="geo.region" content="BR-SP" />
      <meta name="geo.placename" content="São Paulo" />
      <meta name="geo.position" content="-23.5505;-46.6333" />
      <meta name="ICBM" content="-23.5505, -46.6333" />
      <meta name="language" content="pt-BR" />
      <meta name="revisit-after" content="1 days" />
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      <meta name="target" content="all" />
      <meta name="HandheldFriendly" content="true" />
      <meta name="MobileOptimized" content="320" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="HubEdu.ia" />
      <meta name="application-name" content="HubEdu.ia" />
      <meta name="msapplication-tooltip" content="HubEdu.ia - Plataforma Educacional com IA" />
      <meta name="msapplication-starturl" content="/" />
      <meta name="msapplication-navbutton-color" content="#ffd700" />
      <meta name="msapplication-TileColor" content="#ffd700" />
      <meta name="msapplication-TileImage" content="/icons/ms-icon-144x144.png" />
    </Head>
  )
}
