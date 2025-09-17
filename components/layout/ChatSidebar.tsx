'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  GraduationCap,
  Users,
  BookOpen,
  MessageSquare,
  ArrowRight,
  UserPlus,
  DollarSign,
  ClipboardList,
  Lock,
  Settings,
  LogOut,
  Plus,
  Headphones,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useChatContext } from '@/components/providers/ChatContext'
import { ModuleType } from '@/types'
import { getModuleIcon } from '@/lib/moduleIcons'
import { getModuleIconKey, getModuleColor, getModuleName } from '@/lib/iconMapping'

interface ChatSidebarProps {
  className?: string
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ className }) => {
  const router = useRouter()
  const { data: session } = useSession()
  const { selectedModule, setSelectedModule } = useChatContext()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Helper function to render module icon with consistent styling
  const renderModuleIcon = (moduleId: string, isSelected: boolean) => {
    const iconKey = getModuleIconKey(moduleId)
    const Icon = getModuleIcon(iconKey)
    const color = getModuleColor(moduleId)
    const name = getModuleName(moduleId)
    
    return (
      <div 
        className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-colors",
          isSelected 
            ? "text-white shadow-lg" 
            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
        )}
        style={isSelected ? { backgroundColor: color } : {}}
        title={name}
        data-module-id={moduleId}
        data-icon-key={iconKey}
      >
        <Icon className="w-6 h-6" />
      </div>
    )
  }

  // Detectar tipo de dispositivo
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const newIsMobile = width < 1024 // lg breakpoint
      
      setIsMobile(newIsMobile)
      
      // Em mobile, fechar sidebar ao redimensionar
      if (newIsMobile) {
        setIsOpen(false)
      } else {
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

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  const handleNewConversation = () => {
    setSelectedModule(null)
  }

  const handleSupport = () => {
    router.push('/suporte')
  }

  // Em mobile/tablet, renderizar botão hamburger e sidebar overlay
  if (isMobile) {
    return (
      <>
        {/* Botão hamburger para mobile */}
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 lg:hidden bg-white border border-gray-200 rounded-lg p-2 shadow-md"
          aria-label="Abrir menu"
          title="Abrir menu"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>

        {/* Sidebar mobile como overlay */}
        <div className={cn(
          "fixed inset-0 z-40 lg:hidden transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full bg-white border-r border-gray-200 w-80">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">HubEdu.ai</h1>
                    <p className="text-xs text-gray-600">Powered by HubEdu.ia</p>
                  </div>
                </div>
                <button
                  onClick={closeSidebar}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  aria-label="Fechar menu"
                  title="Fechar menu"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 p-4 space-y-2 overflow-y-auto">
              {/* Professor */}
              <div 
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                  selectedModule === 'professor' 
                    ? "bg-yellow-500 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
                onClick={() => {
                  setSelectedModule('professor' as ModuleType)
                  closeSidebar()
                }}
              >
                <GraduationCap className="w-6 h-6" />
                <span className="font-medium">Professor</span>
              </div>

              {/* Atendimento */}
              <div 
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                  selectedModule === 'atendimento' 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
                onClick={() => {
                  setSelectedModule('atendimento' as ModuleType)
                  closeSidebar()
                }}
              >
                <Headphones className="w-6 h-6" />
                <span className="font-medium">Atendimento</span>
              </div>

              {/* Aula Expandida */}
              <div 
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                  selectedModule === 'aula-expandida' 
                    ? "bg-yellow-500 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
                onClick={() => {
                  setSelectedModule('aula-expandida' as ModuleType)
                  closeSidebar()
                }}
              >
                <BookOpen className="w-6 h-6" />
                <span className="font-medium">Aula Expandida</span>
              </div>

              {/* Chat */}
              <div 
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                  selectedModule === null 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
                onClick={() => {
                  setSelectedModule(null)
                  closeSidebar()
                }}
              >
                <MessageSquare className="w-6 h-6" />
                <span className="font-medium">Chat Geral</span>
              </div>

              {/* RH */}
              <div 
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                  selectedModule === 'rh' 
                    ? "bg-purple-500 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
                onClick={() => {
                  setSelectedModule('rh' as ModuleType)
                  closeSidebar()
                }}
              >
                <Users className="w-6 h-6" />
                <span className="font-medium">Recursos Humanos</span>
              </div>

              {/* Financeiro */}
              <div 
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                  selectedModule === 'financeiro' 
                    ? "bg-green-500 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
                onClick={() => {
                  setSelectedModule('financeiro' as ModuleType)
                  closeSidebar()
                }}
              >
                <DollarSign className="w-6 h-6" />
                <span className="font-medium">Financeiro</span>
              </div>

              {/* Coordenação */}
              <div 
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                  selectedModule === 'coordenacao' 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
                onClick={() => {
                  setSelectedModule('coordenacao' as ModuleType)
                  closeSidebar()
                }}
              >
                <ClipboardList className="w-6 h-6" />
                <span className="font-medium">Coordenação</span>
              </div>
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={session?.user?.image || ''} />
                  <AvatarFallback className="bg-yellow-500 text-white">
                    {session?.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {session?.user?.name || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-600">Aluno</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Backdrop para mobile */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
            onClick={closeSidebar}
          />
        )}
      </>
    )
  }

  // Em desktop, renderizar sidebar fixa
  return (
    <div className={cn("flex flex-col h-full bg-gray-50 border-r border-gray-200", className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">HubEdu.ai</h1>
            <p className="text-xs text-gray-600">Powered by HubEdu.ia</p>
          </div>
        </div>
      </div>

      {/* Navigation Icons */}
      <div className="flex-1 p-4 space-y-2">
        {/* Professor */}
        <div onClick={() => setSelectedModule('professor' as ModuleType)}>
          {renderModuleIcon('PROFESSOR', selectedModule === 'professor')}
        </div>

        {/* Atendimento */}
        <div onClick={() => setSelectedModule('atendimento' as ModuleType)}>
          {renderModuleIcon('ATENDIMENTO', selectedModule === 'atendimento')}
        </div>

        {/* Aula Expandida */}
        <div onClick={() => setSelectedModule('aula-expandida' as ModuleType)}>
          {renderModuleIcon('AULA_EXPANDIDA', selectedModule === 'aula-expandida')}
        </div>

        {/* Chat */}
        <div 
          className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-colors",
            selectedModule === null 
              ? "bg-blue-500 text-white" 
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          )}
          onClick={() => setSelectedModule(null)}
          title="Chat Geral"
        >
          <MessageSquare className="w-6 h-6" />
        </div>

        {/* Arrow */}
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-200 text-gray-600">
          <ArrowRight className="w-6 h-6" />
        </div>

        {/* RH */}
        <div 
          className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-colors",
            selectedModule === 'rh' 
              ? "bg-purple-500 text-white" 
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          )}
          onClick={() => setSelectedModule('rh' as ModuleType)}
          title="Recursos Humanos"
        >
          <Users className="w-6 h-6" />
        </div>

        {/* Financeiro */}
        <div 
          className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-colors",
            selectedModule === 'financeiro' 
              ? "bg-green-500 text-white" 
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          )}
          onClick={() => setSelectedModule('financeiro' as ModuleType)}
          title="Financeiro"
        >
          <DollarSign className="w-6 h-6" />
        </div>

        {/* Coordenação */}
        <div 
          className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-colors",
            selectedModule === 'coordenacao' 
              ? "bg-blue-500 text-white" 
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          )}
          onClick={() => setSelectedModule('coordenacao' as ModuleType)}
          title="Coordenação"
        >
          <ClipboardList className="w-6 h-6" />
        </div>

        {/* Lock */}
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-200 text-gray-600">
          <Lock className="w-6 h-6" />
        </div>

        {/* Settings */}
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-200 text-gray-600">
          <Settings className="w-6 h-6" />
        </div>

        {/* Arrow */}
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-200 text-gray-600">
          <ArrowRight className="w-6 h-6" />
        </div>

        {/* Plus */}
        <div className="w-8 h-8 rounded bg-red-500 flex items-center justify-center">
          <Plus className="w-4 h-4 text-white" />
                </div>
                </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={session?.user?.image || ''} />
            <AvatarFallback className="bg-yellow-500 text-white">
              {session?.user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {session?.user?.name || 'Usuário'}
            </p>
            <p className="text-xs text-gray-600">Aluno</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="w-6 h-6 p-0"
            onClick={handleSignOut}
          >
            <LogOut className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}