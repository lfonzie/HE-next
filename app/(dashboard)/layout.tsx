"use client"

import { ReactNode, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { ModernHeader } from '@/components/layout/ModernHeader'
import { ChatProvider, useChatContext } from '@/components/providers/ChatContext'
import { QuotaProvider } from '@/components/providers/QuotaProvider'
import { LoadingCard, LoadingOverlay, LoadingProvider } from '@/components/ui/loading'
import '../globals.css'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  
  // Check if we are on the presentation page
  const isApresentacaoPage = pathname === '/apresentacao'
  
  // Handle prerendering - return children without session checks
  if (typeof window === 'undefined') {
    return <>{children}</>
  }

  // Use session hook only on client side
  const { data: session, status } = useSession()

  // Check authentication for protected routes
  useEffect(() => {
    console.log('Dashboard layout - Session check:', { status, session: !!session, pathname })
    if (status === 'loading') return
    if (!session && !isApresentacaoPage) {
      console.log('No session found, redirecting to login')
      router.push('/login')
    } else {
      console.log('Session found, user:', session?.user?.email)
    }
  }, [session, status, router, pathname, isApresentacaoPage])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600" suppressHydrationWarning>
            Verificando autenticação...
          </span>
        </div>
      </div>
    )
  }

  // For apresentacao page, don't require session
  if (isApresentacaoPage) {
    return (
      <LoadingProvider>
        <ChatProvider>
          <QuotaProvider>
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
              {/* Layout with header only - content occupies full screen */}
              <ModernHeader showNavigation={true} showUserProfile={false} />
              <div className="w-full min-h-screen pt-20 overflow-y-auto">
                {children}
              </div>
            </div>
            <LoadingOverlay />
          </QuotaProvider>
        </ChatProvider>
      </LoadingProvider>
    )
  }

  if (!session) {
    return null
  }

  return (
    <LoadingProvider>
      <ChatProvider>
        <QuotaProvider>
          <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
            {/* Header only - no sidebar */}
            <ModernHeader showNavigation={true} showUserProfile={true} />
            
            {/* Main content - full width with header padding */}
            <div className="w-full min-h-screen pt-20 overflow-y-auto">
              {children}
            </div>
          </div>
          <LoadingOverlay />
        </QuotaProvider>
      </ChatProvider>
    </LoadingProvider>
  )
}
