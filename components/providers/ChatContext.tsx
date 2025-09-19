'use client'

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { ModuleType } from '@/types'

interface ChatContextType {
  selectedModule: ModuleType | null
  setSelectedModule: (module: ModuleType | null) => void
  highlightActiveModule: () => void
  isModuleHighlighted: boolean
  autoSwitchModule: (moduleId: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [selectedModule, setSelectedModule] = useState<ModuleType | null>(null)
  const [isModuleHighlighted, setIsModuleHighlighted] = useState(false)
  
  // Debug log para verificar quando selectedModule muda
  console.log('🔍 [ChatProvider] selectedModule:', selectedModule)

  const highlightActiveModule = useCallback(() => {
    if (selectedModule) {
      setIsModuleHighlighted(true)
      
      // Remove o destaque após 3 segundos
      setTimeout(() => {
        setIsModuleHighlighted(false)
      }, 3000)
    }
  }, [selectedModule])

  const autoSwitchModule = useCallback((moduleId: string) => {
    // Trocar automaticamente o módulo durante o chat
    console.log(`🔄 [AUTO_SWITCH] Mudando módulo de ${selectedModule} para ${moduleId}`)
    setSelectedModule(moduleId as ModuleType)
    
    // Destacar o novo módulo ativo
    setIsModuleHighlighted(true)
    setTimeout(() => {
      setIsModuleHighlighted(false)
    }, 3000)
  }, [selectedModule])

  return (
    <ChatContext.Provider value={{ 
      selectedModule, 
      setSelectedModule, 
      highlightActiveModule,
      isModuleHighlighted,
      autoSwitchModule
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}
