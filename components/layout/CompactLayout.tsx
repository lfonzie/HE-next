'use client'

import { ReactNode } from 'react'
import { CompactSidebar } from './CompactSidebar'
import { cn } from '@/lib/utils'

interface CompactLayoutProps {
  children: ReactNode
  showHome?: boolean
  className?: string
}

export function CompactLayout({ 
  children, 
  showHome = true, 
  className 
}: CompactLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-100">
      <CompactSidebar showHome={showHome} />
      <main className={cn("main-content-with-sidebar", className)}>
        {children}
      </main>
    </div>
  )
}
