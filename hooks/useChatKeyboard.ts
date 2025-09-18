"use client"

import { useCallback, useEffect, useRef } from 'react'
import { useChatContext } from '@/contexts/ChatContext'
import { useNotificationContext } from '@/contexts/NotificationContext'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
  description: string
  category: 'navigation' | 'message' | 'conversation' | 'system'
  enabled?: boolean
}

export interface KeyboardConfig {
  enableShortcuts: boolean
  enableGlobalShortcuts: boolean
  enableContextualShortcuts: boolean
  enableAccessibility: boolean
  showShortcuts: boolean
  customShortcuts: Record<string, KeyboardShortcut>
}

export function useChatKeyboard(config: KeyboardConfig = {
  enableShortcuts: true,
  enableGlobalShortcuts: true,
  enableContextualShortcuts: true,
  enableAccessibility: true,
  showShortcuts: false,
  customShortcuts: {}
}) {
  const {
    setActiveConversation,
    setSelectedModule,
    currentConversation,
    hasActiveConversation
  } = useChatContext()

  const { notifyInfo } = useNotificationContext()
  const shortcutsRef = useRef<Map<string, KeyboardShortcut>>(new Map())
  const isComposingRef = useRef(false)

  // Default shortcuts
  const defaultShortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: 'k',
      ctrlKey: true,
      action: () => {
        if (hasActiveConversation) {
          setActiveConversation(null)
          notifyInfo('Nova Conversa', 'Pressione Ctrl+K para iniciar nova conversa')
        }
      },
      description: 'Nova conversa',
      category: 'navigation',
      enabled: true
    },
    {
      key: 'ArrowUp',
      ctrlKey: true,
      action: () => {
        // Navigate to previous conversation
        notifyInfo('Navegação', 'Conversa anterior')
      },
      description: 'Conversa anterior',
      category: 'navigation',
      enabled: true
    },
    {
      key: 'ArrowDown',
      ctrlKey: true,
      action: () => {
        // Navigate to next conversation
        notifyInfo('Navegação', 'Próxima conversa')
      },
      description: 'Próxima conversa',
      category: 'navigation',
      enabled: true
    },
    {
      key: 'h',
      ctrlKey: true,
      action: () => {
        // Toggle conversation history
        notifyInfo('Histórico', 'Alternar histórico de conversas')
      },
      description: 'Alternar histórico',
      category: 'navigation',
      enabled: true
    },

    // Message shortcuts
    {
      key: 'Enter',
      ctrlKey: true,
      action: () => {
        // Send message
        notifyInfo('Enviar', 'Enviar mensagem')
      },
      description: 'Enviar mensagem',
      category: 'message',
      enabled: true
    },
    {
      key: 'Enter',
      shiftKey: true,
      action: () => {
        // New line in message
        notifyInfo('Nova Linha', 'Adicionar nova linha')
      },
      description: 'Nova linha',
      category: 'message',
      enabled: true
    },
    {
      key: 'Escape',
      action: () => {
        // Cancel current action
        notifyInfo('Cancelar', 'Cancelar ação atual')
      },
      description: 'Cancelar ação',
      category: 'message',
      enabled: true
    },
    {
      key: 'Backspace',
      ctrlKey: true,
      action: () => {
        // Delete word
        notifyInfo('Deletar', 'Deletar palavra')
      },
      description: 'Deletar palavra',
      category: 'message',
      enabled: true
    },

    // Conversation shortcuts
    {
      key: 'd',
      ctrlKey: true,
      action: () => {
        // Delete conversation
        if (currentConversation) {
          notifyInfo('Excluir', 'Excluir conversa atual')
        }
      },
      description: 'Excluir conversa',
      category: 'conversation',
      enabled: true
    },
    {
      key: 'e',
      ctrlKey: true,
      action: () => {
        // Export conversation
        if (currentConversation) {
          notifyInfo('Exportar', 'Exportar conversa atual')
        }
      },
      description: 'Exportar conversa',
      category: 'conversation',
      enabled: true
    },
    {
      key: 'c',
      ctrlKey: true,
      action: () => {
        // Clear conversation
        if (currentConversation) {
          notifyInfo('Limpar', 'Limpar conversa atual')
        }
      },
      description: 'Limpar conversa',
      category: 'conversation',
      enabled: true
    },
    {
      key: 'r',
      ctrlKey: true,
      action: () => {
        // Rename conversation
        if (currentConversation) {
          notifyInfo('Renomear', 'Renomear conversa atual')
        }
      },
      description: 'Renomear conversa',
      category: 'conversation',
      enabled: true
    },

    // System shortcuts
    {
      key: '?',
      ctrlKey: true,
      action: () => {
        // Show help
        notifyInfo('Ajuda', 'Mostrar atalhos de teclado')
      },
      description: 'Mostrar ajuda',
      category: 'system',
      enabled: true
    },
    {
      key: 's',
      ctrlKey: true,
      action: () => {
        // Save/Settings
        notifyInfo('Configurações', 'Abrir configurações')
      },
      description: 'Configurações',
      category: 'system',
      enabled: true
    },
    {
      key: 'f',
      ctrlKey: true,
      action: () => {
        // Search
        notifyInfo('Buscar', 'Buscar nas conversas')
      },
      description: 'Buscar',
      category: 'system',
      enabled: true
    },
    {
      key: 'n',
      ctrlKey: true,
      action: () => {
        // New conversation
        notifyInfo('Nova Conversa', 'Criar nova conversa')
      },
      description: 'Nova conversa',
      category: 'system',
      enabled: true
    }
  ]

  // Module-specific shortcuts
  const moduleShortcuts: KeyboardShortcut[] = [
    {
      key: '1',
      ctrlKey: true,
      action: () => setSelectedModule('professor'),
      description: 'Módulo Professor',
      category: 'navigation',
      enabled: true
    },
    {
      key: '2',
      ctrlKey: true,
      action: () => setSelectedModule('ti'),
      description: 'Módulo TI',
      category: 'navigation',
      enabled: true
    },
    {
      key: '3',
      ctrlKey: true,
      action: () => setSelectedModule('rh'),
      description: 'Módulo RH',
      category: 'navigation',
      enabled: true
    },
    {
      key: '4',
      ctrlKey: true,
      action: () => setSelectedModule('financeiro'),
      description: 'Módulo Financeiro',
      category: 'navigation',
      enabled: true
    },
    {
      key: '5',
      ctrlKey: true,
      action: () => setSelectedModule('coordenacao'),
      description: 'Módulo Coordenação',
      category: 'navigation',
      enabled: true
    },
    {
      key: '6',
      ctrlKey: true,
      action: () => setSelectedModule('secretaria'),
      description: 'Módulo Secretaria',
      category: 'navigation',
      enabled: true
    },
    {
      key: '7',
      ctrlKey: true,
      action: () => setSelectedModule('bem-estar'),
      description: 'Módulo Bem-Estar',
      category: 'navigation',
      enabled: true
    },
    {
      key: '8',
      ctrlKey: true,
      action: () => setSelectedModule('social-media'),
      description: 'Módulo Social Media',
      category: 'navigation',
      enabled: true
    }
  ]

  // Initialize shortcuts
  useEffect(() => {
    const allShortcuts = [
      ...defaultShortcuts,
      ...moduleShortcuts,
      ...Object.values(config.customShortcuts)
    ]

    shortcutsRef.current.clear()
    allShortcuts.forEach(shortcut => {
      if (shortcut.enabled !== false) {
        const key = generateShortcutKey(shortcut)
        shortcutsRef.current.set(key, shortcut)
      }
    })
  }, [config.customShortcuts])

  // Generate shortcut key
  const generateShortcutKey = useCallback((shortcut: KeyboardShortcut): string => {
    const parts = []
    if (shortcut.ctrlKey) parts.push('ctrl')
    if (shortcut.metaKey) parts.push('meta')
    if (shortcut.shiftKey) parts.push('shift')
    if (shortcut.altKey) parts.push('alt')
    parts.push(shortcut.key.toLowerCase())
    return parts.join('+')
  }, [])

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!config.enableShortcuts) return

    // Skip if composing (IME input)
    if (isComposingRef.current) return

    // Skip if in input field (unless it's a global shortcut)
    const target = event.target as HTMLElement
    const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true'
    
    if (isInputField && !config.enableGlobalShortcuts) return

    // Generate shortcut key
    const shortcutKey = generateShortcutKey({
      key: event.key,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      action: () => {},
      description: '',
      category: 'system'
    })

    // Find matching shortcut
    const shortcut = shortcutsRef.current.get(shortcutKey)
    if (shortcut) {
      event.preventDefault()
      event.stopPropagation()
      
      try {
        shortcut.action()
      } catch (error) {
        console.error('Error executing shortcut:', error)
      }
    }
  }, [config, generateShortcutKey])

  // Handle composition events
  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true
  }, [])

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false
  }, [])

  // Register event listeners
  useEffect(() => {
    if (config.enableShortcuts) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('compositionstart', handleCompositionStart)
      document.addEventListener('compositionend', handleCompositionEnd)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('compositionstart', handleCompositionStart)
        document.removeEventListener('compositionend', handleCompositionEnd)
      }
    }
  }, [config.enableShortcuts, handleKeyDown, handleCompositionStart, handleCompositionEnd])

  // Get shortcuts by category
  const getShortcutsByCategory = useCallback((category: KeyboardShortcut['category']) => {
    return Array.from(shortcutsRef.current.values())
      .filter(shortcut => shortcut.category === category)
  }, [])

  // Get all shortcuts
  const getAllShortcuts = useCallback(() => {
    return Array.from(shortcutsRef.current.values())
  }, [])

  // Check if shortcut exists
  const hasShortcut = useCallback((key: string, modifiers?: {
    ctrlKey?: boolean
    metaKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
  }) => {
    const shortcutKey = generateShortcutKey({
      key,
      ctrlKey: modifiers?.ctrlKey,
      metaKey: modifiers?.metaKey,
      shiftKey: modifiers?.shiftKey,
      altKey: modifiers?.altKey,
      action: () => {},
      description: '',
      category: 'system'
    })
    
    return shortcutsRef.current.has(shortcutKey)
  }, [generateShortcutKey])

  // Add custom shortcut
  const addShortcut = useCallback((shortcut: KeyboardShortcut) => {
    const key = generateShortcutKey(shortcut)
    shortcutsRef.current.set(key, shortcut)
  }, [generateShortcutKey])

  // Remove shortcut
  const removeShortcut = useCallback((key: string, modifiers?: {
    ctrlKey?: boolean
    metaKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
  }) => {
    const shortcutKey = generateShortcutKey({
      key,
      ctrlKey: modifiers?.ctrlKey,
      metaKey: modifiers?.metaKey,
      shiftKey: modifiers?.shiftKey,
      altKey: modifiers?.altKey,
      action: () => {},
      description: '',
      category: 'system'
    })
    
    shortcutsRef.current.delete(shortcutKey)
  }, [generateShortcutKey])

  // Show shortcuts help
  const showShortcutsHelp = useCallback(() => {
    const shortcuts = getAllShortcuts()
    const grouped = shortcuts.reduce((acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = []
      }
      acc[shortcut.category].push(shortcut)
      return acc
    }, {} as Record<string, KeyboardShortcut[]>)

    console.log('Keyboard Shortcuts:', grouped)
    notifyInfo('Atalhos de Teclado', 'Verifique o console para ver todos os atalhos disponíveis')
  }, [getAllShortcuts, notifyInfo])

  return {
    // State
    shortcuts: getAllShortcuts(),
    isEnabled: config.enableShortcuts,
    
    // Actions
    getShortcutsByCategory,
    getAllShortcuts,
    hasShortcut,
    addShortcut,
    removeShortcut,
    showShortcutsHelp,
    
    // Utilities
    generateShortcutKey,
    isComposing: isComposingRef.current
  }
}
