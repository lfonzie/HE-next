'use client'

import { ReactNode, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { CompactSidebar } from '@/components/layout/CompactSidebar'
import { ModernHeader } from '@/components/layout/ModernHeader'
import ThemeToggle from '@/components/theme/ThemeToggle'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

interface GlobalLayoutProps {
  children: ReactNode
}

// Páginas que NÃO devem ter o sidebar
const PAGES_WITHOUT_SIDEBAR = [
  '/', // Página principal
  '/login',
  '/register',
  '/auth',
  '/error',
  '/404',
  '/500',
  '/_error',
  '/api',
  '/admin/login'
]

export function GlobalLayout({ children }: GlobalLayoutProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { mounted: themeReady } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Verifica se a página atual deve ter sidebar
  const shouldShowSidebar = !PAGES_WITHOUT_SIDEBAR.some(path => 
    pathname.startsWith(path)
  )

  // Prevent hydration mismatch
  if (!mounted || !themeReady) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-strong)] transition-theme">
        <div className="fixed right-4 top-4 z-50">
          <ThemeToggle size="compact" hideLabel />
        </div>
        <main className="min-h-screen">{children}</main>
      </div>
    )
  }

  if (!shouldShowSidebar) {
    // Páginas sem sidebar (login, erro, etc.)
    return (
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-strong)] transition-theme">
        <div className="fixed right-4 top-4 z-50">
          <ThemeToggle size="compact" hideLabel />
        </div>
        <main className="min-h-screen">{children}</main>
      </div>
    )
  }

  // Páginas com sidebar (desktop e tablet) e header (mobile)
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-strong)] transition-theme">
      <div className="fixed right-4 top-4 z-50 md:hidden">
        <ThemeToggle size="compact" hideLabel />
      </div>
      {/* Desktop e Tablet: Sidebar */}
      <div className="hidden md:block">
        <CompactSidebar />
      </div>
      
      {/* Mobile: Header */}
      <div className="md:hidden">
        <ModernHeader showNavigation={true} showUserProfile={true} />
      </div>
      
      {/* Main Content */}
      <main className={cn(
        "main-content-with-sidebar",
        "md:main-content-with-sidebar", // Desktop e tablet com sidebar
        "pt-0 md:pt-0", // Mobile com header
        "min-h-screen", // Ensure minimum height
        "bg-transparent", // Transparent background
        "relative", // Relative positioning
        "z-10" // Higher z-index than sidebar
      )}>
        {children}
      </main>
    </div>
  )
}
