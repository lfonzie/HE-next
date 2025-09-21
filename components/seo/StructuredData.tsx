'use client'

import { useEffect } from 'react'

interface StructuredDataProps {
  data: Record<string, any>
  id?: string
}

export function StructuredData({ data, id }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = id || 'structured-data'
    script.textContent = JSON.stringify(data)
    
    // Remove existing script with same ID if it exists
    const existingScript = document.getElementById(script.id)
    if (existingScript) {
      existingScript.remove()
    }
    
    document.head.appendChild(script)
    
    return () => {
      const scriptToRemove = document.getElementById(script.id)
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [data, id])

  return null
}

interface BreadcrumbStructuredDataProps {
  breadcrumbs: Array<{ name: string; url: string }>
}

export function BreadcrumbStructuredData({ breadcrumbs }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `https://hubedu.ia${crumb.url}`,
    })),
  }

  return <StructuredData data={structuredData} id="breadcrumb-structured-data" />
}

interface FAQStructuredDataProps {
  faqs: Array<{ question: string; answer: string }>
}

export function FAQStructuredData({ faqs }: FAQStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return <StructuredData data={structuredData} id="faq-structured-data" />
}

interface CourseStructuredDataProps {
  name: string
  description: string
  provider: string
  url: string
  image?: string
  price?: string
  currency?: string
  duration?: string
  level?: string
  language?: string
}

export function CourseStructuredData({
  name,
  description,
  provider,
  url,
  image,
  price,
  currency = 'BRL',
  duration,
  level,
  language = 'pt-BR',
}: CourseStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider,
    },
    url: url.startsWith('http') ? url : `https://hubedu.ia${url}`,
    image: image ? (image.startsWith('http') ? image : `https://hubedu.ia${image}`) : 'https://hubedu.ia/og-image.png',
    ...(price && {
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency: currency,
        availability: 'https://schema.org/InStock',
      },
    }),
    ...(duration && { timeRequired: duration }),
    ...(level && { educationalLevel: level }),
    inLanguage: language,
  }

  return <StructuredData data={structuredData} id="course-structured-data" />
}

interface OrganizationStructuredDataProps {
  name?: string
  description?: string
  url?: string
  logo?: string
  contactPoint?: {
    telephone?: string
    email?: string
    contactType?: string
  }
  address?: {
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
  }
  sameAs?: string[]
}

export function OrganizationStructuredData({
  name = 'HubEdu.ia',
  description = 'Plataforma educacional completa com IA conversacional, simulador ENEM e 8 módulos educacionais',
  url = 'https://hubedu.ia',
  logo = 'https://hubedu.ia/logo.png',
  contactPoint,
  address,
  sameAs = [
    'https://twitter.com/hubedu_ia',
    'https://facebook.com/hubedu.ia',
    'https://instagram.com/hubedu.ia',
    'https://linkedin.com/company/hubedu-ia',
  ],
}: OrganizationStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name,
    description,
    url,
    logo,
    ...(contactPoint && { contactPoint }),
    ...(address && { address }),
    sameAs,
  }

  return <StructuredData data={structuredData} id="organization-structured-data" />
}
