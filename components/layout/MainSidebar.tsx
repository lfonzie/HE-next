'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  MessageSquare,
  BookOpen,
  Settings,
  User,
  LogOut,
  Home,
  Users,
  GraduationCap,
  BarChart3,
  HelpCircle,
  Bell,
  Shield,
  FileText,
  Calendar,
  CreditCard,
  Headphones,
  Monitor,
  Smartphone,
  Globe,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  School,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { ModuleSelector } from '@/components/chat/ModuleSelector'
import { useChatContext } from '@/components/providers/ChatContext'
import { useNavigationLoading } from '@/hooks/useNavigationLoading'
import { ModuleType } from '@/types'
import { Logo } from '@/components/ui/logo'
import { ASSETS } from '@/constants/assets'
import './MainSidebar.css'

interface MainSidebarProps {
  selectedModule: string | null
  onSelectModule: (moduleId: string) => void
}

export const MainSidebar: React.FC<MainSidebarProps> = ({ selectedModule, onSelectModule }) => {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  // Detectar tipo de dispositivo com mobile-first approach
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const newIsMobile = width < 768
      const newIsTablet = width >= 768 && width < 1024
      
      setIsMobile(newIsMobile)
      setIsTablet(newIsTablet)
      
      // Mobile-first: fechar sidebar em mobile por padrão
      if (newIsMobile) {
        setIsOpen(false)
      }
      
      // Desktop: manter sidebar aberta
      if (!newIsMobile) {
        setIsOpen(true)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  const handleModuleSelect = (moduleId: string) => {
    // Always call the parent callback first
    onSelectModule(moduleId)
    
    // Fechar sidebar apenas em mobile
    if (isMobile) {
      closeSidebar()
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  const userInitials = session?.user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U"

  // Em mobile, renderizar botão hamburger e sidebar overlay
  if (isMobile) {
    return (
      <>
        {/* Botão hamburger para mobile com safe area */}
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-[1001] bg-surface-0 border border-subtle rounded-xl p-4 shadow-lg transition-all duration-300 hover:bg-surface-1 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-lg min-w-11 min-h-11 flex items-center justify-center safe-top"
          aria-label="Abrir menu"
          title="Abrir menu"
        >
          <Menu className="w-6 h-6 text-foreground" />
        </button>

        {/* Sidebar mobile como overlay */}
        <div className={`fixed top-0 left-0 w-full h-screen bg-surface-0 z-[1002] transform transition-transform duration-300 ease-out flex flex-col overflow-y-auto overflow-x-hidden shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Header com safe area */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b-2 border-subtle flex-shrink-0 bg-surface-0 safe-top">
            <div className="flex items-center gap-3 sm:gap-4">
              <Image 
                src={ASSETS.logoIcon} 
                alt="HubEdu.ia Logo" 
                width={32}
                height={32}
                className="rounded-lg object-contain flex-shrink-0"
                priority
              />
              <div className="min-w-0">
                <h2 className="type-h4 font-bold text-foreground truncate">
                  {session?.user?.schoolId || "Escola"}
                </h2>
                <p className="type-caption text-subtle">Powered by HubEdu.ia</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={closeSidebar}
                className="bg-red-500 text-white border-none rounded-lg p-2.5 cursor-pointer min-w-11 min-h-11 flex items-center justify-center transition-all duration-300 shadow-sm hover:-translate-y-0.5 hover:scale-105 hover:shadow-md active:translate-y-0 active:shadow-sm"
                aria-label="Fechar menu"
                title="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Módulos com espaçamento fluido */}
          <div className="flex-1 p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 min-h-0 overflow-y-auto overflow-x-hidden">
            <ModuleSelector
              selectedModule={selectedModule}
              onSelectModule={handleModuleSelect}
            />
            
            {/* Footer com informações do usuário */}
            <div className="p-4 sm:p-6 border-t-2 border-subtle safe-bottom">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5 p-3 sm:p-4 bg-surface-1 rounded-xl border border-subtle">
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                  <AvatarImage src={session?.user?.image || ''} />
                  <AvatarFallback className="bg-yellow-500 text-black font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="type-body font-semibold text-foreground truncate">
                    {session?.user?.name || "Usuário"}
                  </p>
                  <p className="type-caption text-subtle truncate">
                    {session?.user?.role === "STUDENT" ? "Aluno" : 
                     session?.user?.role === "TEACHER" ? "Professor" :
                     session?.user?.role === "STAFF" ? "Funcionário" : 
                     session?.user?.role === "ADMIN" ? "Admin" :
                     session?.user?.role === "SUPER_ADMIN" ? "Super Admin" : 
                     session?.user?.role || "Usuário"}
                  </p>
                </div>
              </div>
              
              {/* Admin Buttons com tap targets adequados */}
              {session?.user && (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") && (
                <div className="flex flex-col gap-2 sm:gap-3 mb-4 sm:mb-5">
                  {session.user.role === "SUPER_ADMIN" && (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full min-h-11 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20 justify-start type-small"
                        onClick={() => window.location.href = '/admin-dashboard'}
                      >
                        <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
                        System Admin
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full min-h-11 text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20 justify-start type-small"
                        onClick={() => window.location.href = '/admin-system-prompts'}
                      >
                        <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                        System Messages
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full min-h-11 text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20 justify-start type-small"
                        onClick={() => window.location.href = '/admin-escola'}
                      >
                        <School className="w-4 h-4 mr-2 flex-shrink-0" />
                        Admin Escola
                      </Button>
                    </>
                  )}
                  {session.user.role === "ADMIN" && (
                    <Button 
                      variant="outline" 
                      className="w-full text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20 justify-start"
                      onClick={() => window.location.href = '/admin'}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  )}
                </div>
              )}
              
              {/* Botão de Logout */}
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="w-full min-h-11 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20 justify-start type-small"
              >
                <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Backdrop para mobile */}
        {isOpen && (
          <div 
            className="fixed top-0 left-0 w-screen h-screen bg-black/60 backdrop-blur-sm z-[1001] opacity-0 transition-opacity duration-300"
            onClick={closeSidebar}
          />
        )}
      </>
    )
  }

  // Em tablet e desktop, renderizar sidebar fixa com tipografia fluida
  return (
    <div className={`fixed top-0 left-0 h-screen bg-surface-0 border-r-2 border-subtle z-[1000] flex flex-col overflow-y-auto overflow-x-hidden shadow-lg min-h-0 ${isTablet ? 'w-60' : 'w-64'} safe-top`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b-2 border-subtle flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <Image 
            src={ASSETS.logoIcon} 
            alt="HubEdu.ia Logo" 
            width={32}
            height={32}
            className="rounded-lg object-contain flex-shrink-0"
            priority
          />
          <div className="min-w-0">
            <p className="type-h4 font-semibold text-foreground truncate">
              {session?.user?.schoolId || "Escola"}
            </p>
            <p className="type-caption text-subtle">Powered by HubEdu.ia</p>
          </div>
        </div>
      </div>

      {/* Módulos com espaçamento fluido */}
      <div className="flex-1 p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 min-h-0 overflow-y-auto overflow-x-hidden">
        <ModuleSelector
          selectedModule={selectedModule}
          onSelectModule={handleModuleSelect}
        />
        
        {/* Footer com informações do usuário */}
        <div className="p-4 sm:p-6 border-t-2 border-subtle safe-bottom">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5 p-3 sm:p-4 bg-surface-1 rounded-xl border border-subtle">
            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
              <AvatarImage src={session?.user?.image || ''} />
              <AvatarFallback className="bg-yellow-500 text-black font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="type-body font-semibold text-foreground truncate">
                {session?.user?.name || "Usuário"}
              </p>
              <p className="type-caption text-subtle truncate">
                {session?.user?.role === "STUDENT" ? "Aluno" : 
                 session?.user?.role === "TEACHER" ? "Professor" :
                 session?.user?.role === "STAFF" ? "Funcionário" : 
                 session?.user?.role === "ADMIN" ? "Admin" :
                 session?.user?.role === "SUPER_ADMIN" ? "Super Admin" : 
                 session?.user?.role || "Usuário"}
              </p>
            </div>
          </div>

          {/* Admin Buttons com tap targets adequados */}
          {session?.user && (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") && (
            <div className="flex flex-col gap-2 sm:gap-3 mb-4 sm:mb-5">
              {session.user.role === "SUPER_ADMIN" && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full min-h-11 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20 justify-start type-small"
                    onClick={() => window.location.href = '/admin-dashboard'}
                  >
                    <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
                    System Admin
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full min-h-11 text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20 justify-start type-small"
                    onClick={() => window.location.href = '/admin-system-prompts'}
                  >
                    <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                    System Messages
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full min-h-11 text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20 justify-start type-small"
                    onClick={() => window.location.href = '/admin-escola'}
                  >
                    <School className="w-4 h-4 mr-2 flex-shrink-0" />
                    Admin Escola
                  </Button>
                </>
              )}
              {session.user.role === "ADMIN" && (
                <Button 
                  variant="outline" 
                  className="w-full min-h-11 text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20 justify-start type-small"
                  onClick={() => window.location.href = '/admin'}
                >
                  <User className="w-4 h-4 mr-2 flex-shrink-0" />
                  Admin
                </Button>
              )}
            </div>
          )}

              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="w-full min-h-11 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20 justify-start type-small"
              >
                <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
                Sair
              </Button>
        </div>
      </div>
    </div>
  )
}

