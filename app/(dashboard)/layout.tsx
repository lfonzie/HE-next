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
import { LoadingCard, LoadingOverlay } from '@/components/ui/loading'
import { useLoading } from '@/components/ui/loading'
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
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { isVisible } = useLoading()
  
  // Verificar se estamos na página do chat
  const isChatPage = pathname === '/chat'
  
  // Verificar se estamos na página de apresentação
  const isApresentacaoPage = pathname === '/apresentacao'
  
  // Verificar se estamos na página enem (sem sidebar)
  const isEnemPage = pathname === '/enem'

  // Verificar autenticação para rotas protegidas
  useEffect(() => {
    console.log('🔍 Dashboard layout - Session check:', { status, session: !!session, pathname })
    if (status === 'loading') return
    if (!session) {
      console.log('❌ No session found, redirecting to login')
      router.push('/login')
    } else {
      console.log('✅ Session found, user:', session.user?.email)
    }
  }, [session, status, router, pathname])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Verificando autenticação...</span>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Layout especial para enem - sem sidebar
  if (isEnemPage) {
    return (
      <ChatProvider>
        <QuotaProvider>
          <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
            {/* Layout sem sidebar - conteúdo ocupa toda a tela */}
            <div className="w-full h-screen overflow-y-auto">
              {children}
            </div>
          </div>
        </QuotaProvider>
      </ChatProvider>
    )
  }

  // Layout especial para apresentação - sidebar compacta
  if (isApresentacaoPage) {
    return (
      <ChatProvider>
        <QuotaProvider>
          <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
            <div className="flex h-screen">
              {/* Sidebar compacta para apresentação */}
              <div className="w-16 flex-shrink-0 bg-white/90 backdrop-blur-sm border-r border-gray-200 flex flex-col items-center py-4 space-y-4">
                {/* Logo */}
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Image
                    src="/Logo_HubEdu.ia.svg"
                    alt="HubEdu.ia"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                </div>
                
                {/* Botões de navegação compactos */}
                <button
                  onClick={() => window.location.href = '/chat'}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                  title="Chat"
                >
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                </button>
                
                <button
                  onClick={() => window.location.href = '/aula'}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                  title="Aula Expandida"
                >
                  <BookOpen className="w-5 h-5 text-gray-600" />
                </button>
                
                <button
                  onClick={() => window.location.href = '/enem'}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                  title="Simulador ENEM"
                >
                  <GraduationCap className="w-5 h-5 text-gray-600" />
                </button>
                
                <button
                  onClick={() => window.location.href = '/admin'}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                  title="Admin"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Main content - fullscreen para apresentação */}
              <div className="flex-1 overflow-hidden">
                {children}
              </div>
            </div>
          </div>
        </QuotaProvider>
      </ChatProvider>
    )
  }

  return (
    <ChatProvider>
      <QuotaProvider>
        <SidebarWrapper>
          {children}
        </SidebarWrapper>
      </QuotaProvider>
    </ChatProvider>
  )
}
