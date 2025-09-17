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

  // Detectar tipo de dispositivo
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const newIsMobile = width < 768
      const newIsTablet = width >= 768 && width < 1024
      
      setIsMobile(newIsMobile)
      setIsTablet(newIsTablet)
      
      // Em mobile, fechar sidebar ao redimensionar
      if (newIsMobile) {
        setIsOpen(false)
      }
      
      // Em tablet/desktop, manter sidebar aberta
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
        {/* Botão hamburger para mobile */}
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-[1001] bg-white border border-gray-200 rounded-xl p-4 shadow-lg transition-all duration-300 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-lg w-14 h-14 min-w-11 min-h-11 flex items-center justify-center"
          aria-label="Abrir menu"
          title="Abrir menu"
        >
          <Menu className="w-6 h-6 text-gray-900" />
        </button>

        {/* Sidebar mobile como overlay */}
        <div className={`fixed top-0 left-0 w-full h-screen bg-white z-[1002] transform transition-transform duration-300 ease-out flex flex-col overflow-y-auto overflow-x-hidden shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 flex-shrink-0 bg-white">
            <div className="flex items-center gap-4">
              <Image 
                src={ASSETS.logoIcon} 
                alt="HubEdu.ia Logo" 
                width={32}
                height={32}
                className="rounded-lg object-contain"
              />
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {session?.user?.schoolId || "Escola"}
                </h2>
                <p className="text-xs text-gray-500">Powered by HubEdu.ia</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={closeSidebar}
                className="bg-red-500 text-white border-none rounded-lg p-2.5 cursor-pointer text-lg w-10 h-10 flex items-center justify-center transition-all duration-300 shadow-sm hover:-translate-y-0.5 hover:scale-105 hover:shadow-md active:translate-y-0 active:shadow-sm"
                aria-label="Fechar menu"
                title="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Módulos */}
          <div className="flex-1 p-6 flex flex-col gap-6 min-h-0 overflow-y-auto overflow-x-hidden">
            <ModuleSelector
              selectedModule={selectedModule}
              onSelectModule={handleModuleSelect}
            />
            
            {/* Footer com informações do usuário */}
            <div className="p-6 border-t-2 border-gray-200">
              <div className="flex items-center gap-4 mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={session?.user?.image || ''} />
                  <AvatarFallback className="bg-yellow-500 text-black font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-gray-900 truncate">
                    {session?.user?.name || "Usuário"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session?.user?.role === "STUDENT" ? "Aluno" : 
                     session?.user?.role === "TEACHER" ? "Professor" :
                     session?.user?.role === "STAFF" ? "Funcionário" : 
                     session?.user?.role === "ADMIN" ? "Admin" :
                     session?.user?.role === "SUPER_ADMIN" ? "Super Admin" : 
                     session?.user?.role || "Usuário"}
                  </p>
                </div>
              </div>
              
              {/* Admin Buttons */}
              {session?.user && (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") && (
                <div className="flex flex-col gap-3 mb-5">
                  {session.user.role === "SUPER_ADMIN" && (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20 justify-start"
                        onClick={() => window.location.href = '/admin-dashboard'}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        System Admin
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20 justify-start"
                        onClick={() => window.location.href = '/admin-system-prompts'}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        System Messages
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20 justify-start"
                        onClick={() => window.location.href = '/admin-escola'}
                      >
                        <School className="w-4 h-4 mr-2" />
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
                className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20 justify-start"
              >
                <LogOut className="w-4 h-4 mr-2" />
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

  // Em tablet e desktop, renderizar sidebar fixa
  return (
    <div className={`fixed top-0 left-0 h-screen bg-white border-r-2 border-gray-200 z-[1000] flex flex-col overflow-y-auto overflow-x-hidden shadow-lg min-h-0 ${isTablet ? 'w-70' : 'w-80'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Image 
            src={ASSETS.logoIcon} 
            alt="HubEdu.ia Logo" 
            width={32}
            height={32}
            className="rounded-lg object-contain"
          />
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {session?.user?.schoolId || "Escola"}
            </p>
            <p className="text-xs text-gray-500">Powered by HubEdu.ia</p>
          </div>
        </div>
      </div>

      {/* Módulos */}
      <div className="flex-1 p-6 flex flex-col gap-6 min-h-0 overflow-y-auto overflow-x-hidden">
        <ModuleSelector
          selectedModule={selectedModule}
          onSelectModule={handleModuleSelect}
        />

        {/* Footer com informações do usuário */}
        <div className="p-6 border-t-2 border-gray-200">
          <div className="flex items-center gap-4 mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <Avatar className="w-10 h-10">
              <AvatarImage src={session?.user?.image || ''} />
              <AvatarFallback className="bg-yellow-500 text-black font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name || "Usuário"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.role === "STUDENT" ? "Aluno" : 
                 session?.user?.role === "TEACHER" ? "Professor" :
                 session?.user?.role === "STAFF" ? "Funcionário" : 
                 session?.user?.role === "ADMIN" ? "Admin" :
                 session?.user?.role === "SUPER_ADMIN" ? "Super Admin" : 
                 session?.user?.role || "Usuário"}
              </p>
            </div>
          </div>

          {/* Admin Buttons */}
          {session?.user && (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") && (
            <div className="flex flex-col gap-2.5 mb-5">
              {session.user.role === "SUPER_ADMIN" && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20 justify-start"
                    onClick={() => window.location.href = '/admin-dashboard'}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    System Admin
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20 justify-start"
                    onClick={() => window.location.href = '/admin-system-prompts'}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    System Messages
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20 justify-start"
                    onClick={() => window.location.href = '/admin-escola'}
                  >
                    <School className="w-4 h-4 mr-2" />
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

          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20 justify-start"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  )
}

