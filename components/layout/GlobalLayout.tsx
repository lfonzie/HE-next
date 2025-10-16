'use client'

import { ReactNode, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { CompactSidebar } from '@/components/layout/CompactSidebar'
import { ModernHeader } from '@/components/layout/ModernHeader'
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
    const isMainPage = pathname === '/'
    return (
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-strong)] transition-theme">
        <main className="min-h-screen">{children}</main>
      </div>
    )
  }

  if (!shouldShowSidebar) {
    // Páginas sem sidebar (login, erro, etc.)
    // Don't show theme toggle on main page to disable dark mode
    const isMainPage = pathname === '/'
    
    return (
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-strong)] transition-theme">
        <main className="min-h-screen">{children}</main>
      </div>
    )
  }

  // Páginas com sidebar (desktop e tablet) e header (mobile)
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-strong)] transition-theme">
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
