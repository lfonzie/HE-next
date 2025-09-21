"use client"

import { ReactNode, useState } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { MainSidebar } from '@/components/layout/MainSidebar'
import { UnifiedSidebar } from '@/components/layout/UnifiedSidebar'
import { ChatProvider, useChatContext } from '@/components/providers/ChatContext'
import { QuotaProvider } from '@/components/providers/QuotaProvider'
import { ModuleType } from '@/types'
import { LoadingCard, LoadingOverlay, LoadingProvider } from '@/components/ui/loading'
import { MessageSquare, BookOpen, Settings, GraduationCap } from 'lucide-react'
import '../globals.css'

interface DashboardLayoutProps {
  children: ReactNode
}

// Componente wrapper para conectar o sidebar com o ChatProvider
function SidebarWrapper({ children }: { children: ReactNode }) {
  const { selectedModule, setSelectedModule, isModuleHighlighted } = useChatContext()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="flex h-screen">
        {/* Sidebar - Usar UnifiedSidebar com estado do ChatProvider */}
        <UnifiedSidebar 
          selectedModule={selectedModule}
          onSelectModule={(moduleId: string) => setSelectedModule(moduleId as ModuleType)}
        />

        {/* Main content - ajusta automaticamente ao sidebar */}
        <div className="flex-1 flex flex-col overflow-y-auto main-content-with-sidebar">
          {/* Page Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  
  // Check if we are on the chat page
  const isChatPage = pathname === '/chat'
  
  // Check if we are on the presentation page
  const isApresentacaoPage = pathname === '/apresentacao'
  
  // Check if we are on the enem page (without sidebar)
  const isEnemPage = pathname === '/enem'

  // Handle prerendering - return children without session checks
  if (typeof window === 'undefined') {
    return <>{children}</>
  }

  // Use session hook only on client side
  let session, status
  try {
    const sessionResult = useSession()
    session = sessionResult.data
    status = sessionResult.status
  } catch (error) {
    // Handle case where useSession fails during prerendering
    session = null
    status = 'unauthenticated'
  }

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
              {/* Layout without sidebar - content occupies full screen */}
              <div className="w-full h-screen overflow-y-auto">
                {children}
              </div>
            </div>
            <LoadingOverlay />
          </QuotaProvider>
        </ChatProvider>
      </LoadingProvider>
    )
  }

  // For enem page, don't show sidebar
  if (isEnemPage) {
    return (
      <LoadingProvider>
        <ChatProvider>
          <QuotaProvider>
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
              {/* Layout without sidebar - content occupies full screen */}
              <div className="w-full h-screen overflow-y-auto">
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
          <SidebarWrapper>
            {children}
          </SidebarWrapper>
          <LoadingOverlay />
        </QuotaProvider>
      </ChatProvider>
    </LoadingProvider>
  )
}
