import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HubEdu - Embed',
  description: 'Módulos educacionais para incorporação',
  robots: 'noindex, nofollow', // Não indexar páginas embed
}

/**
 * Layout para páginas embed
 * Remove navegação e autenticação
 */
export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="embed-layout">
      {/* Sem navegação, sem header/footer - apenas o conteúdo */}
      {children}
    </div>
  )
}

