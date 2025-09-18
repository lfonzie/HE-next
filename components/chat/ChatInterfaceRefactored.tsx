"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ChatMessageRefactored } from "./ChatMessageRefactored"
import { StreamingMessage } from "./StreamingMessage"
import { MessageComposer } from "./MessageComposer"
import { ConversationManager } from "./ConversationManager"
import { GeneralWelcome } from "./GeneralWelcome"
import { ModuleWelcomeScreen } from "./ModuleWelcomeScreen"
import { ClassificationIndicator } from "./ClassificationIndicator"
import { SupportModal } from "@/components/modals/SupportModal"

// Context providers
import { ChatProvider } from "@/contexts/ChatContext"
import { StreamingProvider } from "@/contexts/StreamingContext"
import { ModuleProvider } from "@/contexts/ModuleContext"
import { NotificationProvider } from "@/contexts/NotificationContext"

// Hooks
import { useConversationManager } from "@/hooks/useConversationManager"
import { useMessageStreaming } from "@/hooks/useMessageStreaming"
import { useModuleOrchestrator } from "@/hooks/useModuleOrchestrator"
import { useChatKeyboard } from "@/hooks/useChatKeyboard"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  Headphones, 
  Settings, 
  History, 
  Download, 
  Search, 
  Square,
  Zap,
  Brain,
  Activity
} from "lucide-react"

// Types and utilities
import { ModuleId, MODULES, convertModuleId } from "@/lib/modules"
import { ModuleType, Message as ChatMessageType, Conversation as ChatConversation } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { useLoading } from "@/components/ui/loading"
import { useNavigationLoading } from "@/hooks/useNavigationLoading"

interface ChatInterfaceRefactoredProps {
  className?: string
}

export function ChatInterfaceRefactored({ className = '' }: ChatInterfaceRefactoredProps) {
  const router = useRouter()
  const { start: startLoading, end: endLoading } = useLoading()
  const { stopLoading: stopNavLoading } = useNavigationLoading()
  const { toast } = useToast()

  // State
  const [inputMessage, setInputMessage] = useState("")
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
  const [showConversationHistory, setShowConversationHistory] = useState(false)
  const [showMetadata, setShowMetadata] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  // Conversation management
  const {
    conversations,
    currentConversation,
    hasActiveConversation,
    conversationCount,
    createConversation,
    deleteConversation,
    exportConversation,
    searchConversations,
    addMessageToConversation,
    setActiveConversation
  } = useConversationManager({
    autoSave: true,
    maxConversations: 50,
    enableHistory: true,
    enableExport: true,
    enableSearch: true
  })

  // Streaming management
  const {
    isConnected,
    connectionStatus,
    isConnecting,
    lastError,
    startStreaming,
    stopStreaming,
    getStreamingStatus,
    connectWebSocket,
    disconnectWebSocket
  } = useMessageStreaming({
    bufferSize: 1024,
    flushInterval: 100,
    maxRetries: 3,
    retryDelay: 1000,
    enableCompression: true,
    enableEncryption: false,
    autoReconnect: true,
    maxReconnectAttempts: 5
  })

  // Module orchestration
  const {
    availableModules,
    modulePerformance,
    isClassifying,
    classifyUserMessage,
    selectOptimalModule,
    switchModule,
    getModuleRecommendations
  } = useModuleOrchestrator({
    enableAutoClassification: true,
    enableUserAdaptation: true,
    enableModuleSwitching: true,
    classificationThreshold: 0.7,
    maxHistoryLength: 10,
    enableCaching: true,
    enableAnalytics: true
  })

  // Keyboard shortcuts
  const {
    shortcuts,
    isEnabled: shortcutsEnabled,
    showShortcutsHelp
  } = useChatKeyboard({
    enableShortcuts: true,
    enableGlobalShortcuts: true,
    enableContextualShortcuts: true,
    enableAccessibility: true,
    showShortcuts: false,
    customShortcuts: {}
  })

  // Computed values
  const currentModuleId = useMemo(
    () => currentConversation ? convertModuleId(currentConversation.module as ModuleType) : null,
    [currentConversation]
  )

  const messages = useMemo(() => currentConversation?.messages || [], [currentConversation?.messages])
  const hasMessages = messages.length > 0

  const filteredConversations = useMemo(() => {
    return searchConversations(searchQuery)
  }, [conversations, searchQuery, searchConversations])

  // Actions
  const handleSelectModule = useCallback((moduleId: string) => {
    createConversation(moduleId, `Nova conversa - ${moduleId}`)
  }, [createConversation])

  const handleNewConversation = useCallback(() => {
    createConversation('atendimento', 'Nova Conversa')
  }, [createConversation])

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return

    const loadingKey = startLoading('message', {
      message: 'Carregando…',
      cancelable: true,
      priority: 'normal',
      timeout: 12000
    })

    try {
      // Create user message
      const userMessage: ChatMessageType = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'user',
        content: message,
        timestamp: Date.now(),
        conversationId: currentConversation?.id || '',
      }

      // Add user message to conversation
      if (currentConversation) {
        await addMessageToConversation(currentConversation.id, userMessage)
      }

      // Classify message and select optimal module
      const classification = await classifyUserMessage(
        message,
        messages,
        'current-user' // TODO: Get from auth context
      )

      // Select optimal module if needed
      const optimalModule = await selectOptimalModule(
        message,
        messages,
        'current-user'
      )

      if (optimalModule && optimalModule !== currentConversation?.module) {
        await switchModule(
          currentConversation?.module || 'atendimento',
          optimalModule,
          `Classificação automática: ${classification.reasoning}`,
          'current-user'
        )
      }

      // Start streaming response
      await startStreaming(userMessage)

      setInputMessage("")
    } catch (error: any) {
      console.error('Error sending message:', error)
      endLoading(loadingKey, 'error')
      
      toast({
        title: "Erro",
        description: error.message || "Falha ao enviar mensagem",
        variant: "destructive"
      })
    }
  }, [
    startLoading,
    endLoading,
    currentConversation,
    addMessageToConversation,
    classifyUserMessage,
    selectOptimalModule,
    switchModule,
    startStreaming,
    toast,
    messages
  ])

  const handleSuggestionClick = useCallback(async (suggestion: string) => {
    await handleSendMessage(`Me ajude com: ${suggestion}`)
  }, [handleSendMessage])

  const handleStopStreaming = useCallback(() => {
    try {
      stopStreaming('current-message', currentConversation?.id || '')
      toast({ title: "Interrompido", description: "Geração cancelada." })
    } catch (e) {
      // noop
    }
  }, [stopStreaming, currentConversation?.id, toast])

  const handleExportConversation = useCallback(async () => {
    if (!currentConversation) return
    
    setIsExporting(true)
    try {
      await exportConversation(currentConversation.id)
      toast({
        title: "Sucesso",
        description: "Conversa exportada com sucesso!",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao exportar conversa",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }, [currentConversation, exportConversation, toast])

  const handleSelectConversation = useCallback((conversation: ChatConversation) => {
    setActiveConversation(conversation.id)
  }, [setActiveConversation])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault()
        handleNewConversation()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleNewConversation])

  // Clear loading states on mount
  useEffect(() => {
    stopNavLoading()
    endLoading('login-redirect', 'success')
    endLoading('login', 'success')
  }, [stopNavLoading, endLoading])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <div className={`flex-1 flex flex-col h-full bg-gray-50 dark:bg-zinc-900 ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 shadow-sm border-b border-gray-200 dark:border-zinc-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">
                {currentModuleId ? MODULES[currentModuleId]?.label : "Chat"}
              </h1>
              {currentModuleId && (
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  {MODULES[currentModuleId]?.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Connection status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 
                isConnecting ? 'bg-yellow-500 animate-pulse' : 
                'bg-red-500'
              }`} />
              <span className="text-xs text-gray-500">
                {isConnected ? 'Conectado' : 
                 isConnecting ? 'Conectando...' : 
                 'Desconectado'}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleNewConversation}
                variant="outline"
                size="sm"
                className="border-yellow-500 text-yellow-700 hover:bg-yellow-100 bg-yellow-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Conversa
              </Button>
              {hasMessages && (
                <Button
                  onClick={handleExportConversation}
                  variant="outline"
                  size="sm"
                  disabled={isExporting}
                  className="border-blue-500 text-blue-700 hover:bg-blue-100 bg-blue-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? "Exportando..." : "Exportar"}
                </Button>
              )}
              <Button
                onClick={() => setShowConversationHistory(!showConversationHistory)}
                variant="outline"
                size="sm"
                className="border-purple-500 text-purple-700 hover:bg-purple-100 bg-purple-50"
              >
                <History className="w-4 h-4 mr-2" />
                Histórico
              </Button>
              <Button
                onClick={() => setShowMetadata(!showMetadata)}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Activity className="w-4 h-4 mr-2" />
                {showMetadata ? 'Ocultar' : 'Mostrar'} Metadados
              </Button>
              <Button
                onClick={() => setIsSupportModalOpen(true)}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Headphones className="w-4 h-4 mr-2" />
                Suporte
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conversation History Sidebar */}
      <ConversationManager
        isOpen={showConversationHistory}
        onClose={() => setShowConversationHistory(false)}
        onSelectConversation={handleSelectConversation}
        currentConversationId={currentConversation?.id}
      />

      {/* Messages Container */}
      <main className="flex-1 overflow-y-auto chat-messages-container chat-content-with-fixed-input bg-gray-50 dark:bg-zinc-900" ref={messagesContainerRef}>
        {hasMessages ? (
          <div className="mx-auto max-w-screen-md px-4 md:px-6 lg:px-8 leading-relaxed text-pretty">
            <div 
              className="flex flex-col gap-4 md:gap-6 pb-16"
              role="log"
              aria-live="polite"
            >
              {/* Classification Indicator */}
              {/* TODO: Add classification indicator */}
              
              {messages.map((message, index) => {
                const isLastMessage = index === messages.length - 1
                const shouldRenderStreaming = message.isStreaming
                
                return shouldRenderStreaming ? (
                  <StreamingMessage
                    key={`streaming-${message.id || index}`}
                    content={message.content}
                    userInitials="U"
                    isComplete={!message.isStreaming}
                    currentModuleId={currentModuleId}
                    tier={message.tier}
                    model={message.model}
                    tokens={message.tokens}
                    provider={message.provider}
                    complexity={message.complexity}
                  />
                ) : (
                  <ChatMessageRefactored
                    key={`message-${message.id || index}-${message.isStreaming ? 'streaming' : 'complete'}`}
                    message={message}
                    isUser={message.role === "user"}
                    userInitials="U"
                    currentModuleId={currentModuleId}
                    conversationId={currentConversation?.id || ''}
                    messageIndex={index}
                    showMetadata={showMetadata}
                  />
                )
              })}
              {/* Scroll sentinel */}
              <div ref={endRef} />
            </div>
          </div>
        ) : currentModuleId ? (
          <ModuleWelcomeScreen
            moduleId={currentModuleId}
            onSuggestionClick={handleSuggestionClick}
            quotaAvailable={true}
          />
        ) : (
          <GeneralWelcome
            selectedModule={currentConversation?.module as ModuleType}
            selectedModuleLabel={null}
            onModuleSelect={(moduleId: string) => handleSelectModule(moduleId)}
            onSuggestionClick={handleSuggestionClick}
            quotaAvailable={true}
          />
        )}
      </main>

      {/* Chat Input */}
      <div className="sticky bottom-0 left-0 right-0 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-zinc-900/60 border-t border-zinc-200/60 dark:border-zinc-700/50 shadow-[0_-1px_0_0_rgba(0,0,0,0.04)] px-4 md:px-6 lg:px-8 py-3">
        <div className="mx-auto max-w-screen-md">
          {isConnecting && (
            <div className="flex justify-end pb-2">
              <Button
                onClick={handleStopStreaming}
                variant="destructive"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Square className="w-4 h-4 mr-2" />
                Parar
              </Button>
            </div>
          )}
          <MessageComposer
            onSendMessage={handleSendMessage}
            isStreaming={isConnecting}
            disabled={false}
            placeholder={
              currentModuleId 
                ? `Digite sua pergunta sobre ${MODULES[currentModuleId]?.label?.toLowerCase()}...`
                : "Digite sua pergunta ou escolha um módulo..."
            }
            maxLength={4000}
          />
        </div>
      </div>

      {/* Support Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </div>
  )
}

// Wrapper with all providers
export function ChatInterfaceWithProviders({ className = '' }: ChatInterfaceRefactoredProps) {
  return (
    <ChatProvider>
      <StreamingProvider>
        <ModuleProvider>
          <NotificationProvider>
            <ChatInterfaceRefactored className={className} />
          </NotificationProvider>
        </ModuleProvider>
      </StreamingProvider>
    </ChatProvider>
  )
}



