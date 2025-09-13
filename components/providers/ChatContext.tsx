'use client'

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { ModuleType } from '@/types'

interface ChatContextType {
  selectedModule: ModuleType | null
  setSelectedModule: (module: ModuleType | null) => void
  highlightActiveModule: () => void
  isModuleHighlighted: boolean
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [selectedModule, setSelectedModule] = useState<ModuleType | null>(null)
  const [isModuleHighlighted, setIsModuleHighlighted] = useState(false)

  const highlightActiveModule = useCallback(() => {
    if (selectedModule) {
      setIsModuleHighlighted(true)
      
      // Remove o destaque após 3 segundos
      setTimeout(() => {
        setIsModuleHighlighted(false)
      }, 3000)
    }
  }, [selectedModule])

  return (
    <ChatContext.Provider value={{ 
      selectedModule, 
      setSelectedModule, 
      highlightActiveModule,
      isModuleHighlighted 
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
