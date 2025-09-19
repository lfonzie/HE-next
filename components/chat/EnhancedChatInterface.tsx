"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Send, 
  Upload, 
  Mic, 
  MoreHorizontal, 
  Trash2, 
  Download, 
  Share2,
  Settings,
  History,
  Search,
  BarChart3,
  MessageSquare,
  Bot,
  User
} from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { MessageList } from './MessageList'
import { ModuleSelector } from './ModuleSelector'
import { ConversationHistory } from './ConversationHistory'
import { ChatNotifications, useChatNotifications } from './ChatNotifications'
import { ModuleType } from '@/types'
import { useToast } from '@/hooks/use-toast'

export function EnhancedChatInterface() {
  const [message, setMessage] = useState('')
  const [selectedModule, setSelectedModule] = useState<ModuleType>('professor')
  const [showModuleSelector, setShowModuleSelector] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const [showHistory, setShowHistory] = useState(false)
  
  const { 
    conversations,
    currentConversation,
    currentMessages,
    isStreaming,
    lastClassification,
    error,
    retryCount,
    conversationCount,
    totalMessages,
    sendMessage,
    startNewConversation,
    searchConversations,
    getConversationStats,
    exportCurrentConversation,
    importConversation,
    cancelCurrentRequest,
    clearError
  } = useChat()
  
  const { toast } = useToast()
  const { 
    notifications, 
    isOnline, 
    connectionStatus, 
    addNotification, 
    removeNotification, 
    clearAll, 
    retryConnection 
  } = useChatNotifications()
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    setIsTyping(true)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }, [])

  // Handle errors
  useEffect(() => {
    if (error) {
      addNotification({
        type: 'error',
        title: 'Erro no chat',
        message: error,
        autoHide: false
      })
    }
  }, [error, addNotification])

  // Handle retry count
  useEffect(() => {
    if (retryCount > 0) {
      addNotification({
        type: 'warning',
        title: 'Tentativa de reconexão',
        message: `Tentativa ${retryCount} de reconexão`,
        autoHide: true,
        duration: 2000
      })
    }
  }, [retryCount, addNotification])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isStreaming) return

    try {
      // TEMPORÁRIO: Debug - sempre usar "auto" para permitir classificação automática
      console.log('🔍 [EnhancedChatInterface] selectedModule antes do override:', selectedModule);
      await sendMessage(message, "auto") // Forçar "auto" para permitir classificação automática
      setMessage('')
      setIsTyping(false)
      
      addNotification({
        type: 'success',
        title: 'Mensagem enviada',
        message: 'Sua mensagem foi enviada com sucesso',
        autoHide: true,
        duration: 2000
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro ao enviar mensagem',
        message: 'Tente novamente em alguns instantes',
        autoHide: false
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleClearConversation = () => {
    startNewConversation(selectedModule)
    addNotification({
      type: 'info',
      title: 'Conversa limpa',
      message: 'Nova conversa iniciada',
      autoHide: true,
      duration: 2000
    })
  }

  const handleExportConversation = (conversation: any) => {
    const exportData = exportCurrentConversation()
    if (!exportData) return
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversa-${conversation.id || 'atual'}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    addNotification({
      type: 'success',
      title: 'Conversa exportada',
      message: 'Arquivo baixado com sucesso',
      autoHide: true,
      duration: 3000
    })
  }

  const handleImportConversation = async (file: File) => {
    try {
      const text = await file.text()
      const importData = JSON.parse(text)
      
      const success = importConversation(importData)
      if (success) {
        addNotification({
          type: 'success',
          title: 'Conversa importada',
          message: 'Conversa carregada com sucesso',
          autoHide: true,
          duration: 3000
        })
      } else {
        throw new Error('Formato inválido')
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro ao importar',
        message: 'Arquivo inválido ou corrompido',
        autoHide: false
      })
    }
  }

  const handleDeleteConversation = (conversationId: string) => {
    // Implementar lógica de exclusão
    addNotification({
      type: 'info',
      title: 'Conversa excluída',
      message: 'Conversa removida do histórico',
      autoHide: true,
      duration: 2000
    })
  }

  const handleSelectConversation = (conversation: any) => {
    // Implementar lógica de seleção
    setActiveTab('chat')
    setShowHistory(false)
  }

  const handleCancelRequest = () => {
    cancelCurrentRequest()
    addNotification({
      type: 'info',
      title: 'Requisição cancelada',
      message: 'Operação interrompida pelo usuário',
      autoHide: true,
      duration: 2000
    })
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar com histórico */}
      {showHistory && (
        <div className="w-80 border-r bg-white dark:bg-gray-800">
          <ConversationHistory
            conversations={conversations}
            currentConversation={currentConversation}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={handleDeleteConversation}
            onExportConversation={handleExportConversation}
            onImportConversation={handleImportConversation}
            searchConversations={searchConversations}
            getConversationStats={getConversationStats}
          />
        </div>
      )}

      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Chat HubEdu.ai
              </h2>
              {lastClassification && (
                <Badge variant="secondary" className="text-xs">
                  {lastClassification.module} ({Math.round(lastClassification.confidence * 100)}%)
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="text-gray-600 dark:text-gray-300"
              >
                <History className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModuleSelector(!showModuleSelector)}
                className="text-gray-600 dark:text-gray-300"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              
              {isStreaming && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelRequest}
                  className="text-red-600 dark:text-red-400"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>
          
          {/* Module Selector */}
          {showModuleSelector && (
            <div className="mt-4">
              <ModuleSelector 
                selectedModule={selectedModule}
                onSelectModule={(moduleId: string) => {
                  setSelectedModule(moduleId as ModuleType)
                  setShowModuleSelector(false)
                }}
              />
            </div>
          )}
        </div>
        
        {/* Área de mensagens */}
        <div className="flex-1 overflow-hidden">
          <MessageList messages={currentMessages} />
        </div>
        
        {/* Input Area */}
        <div className="p-4 border-t bg-white dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value)
                    handleTyping()
                  }}
                  placeholder="Digite sua mensagem... (Shift+Enter para nova linha)"
                  className="min-h-[44px] max-h-32 resize-none pr-12"
                  onKeyDown={handleKeyDown}
                  disabled={isStreaming}
                />
                
                {/* Typing indicator */}
                {isTyping && !isStreaming && (
                  <div className="absolute right-3 top-3 text-xs text-gray-500">
                    Digitando...
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 items-end">
                {/* File upload button */}
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  className="h-11 w-11"
                  title="Anexar arquivo"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                
                {/* Voice recording button */}
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  className="h-11 w-11"
                  title="Gravar áudio"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                
                {/* Send button */}
                <Button 
                  type="submit" 
                  disabled={!message.trim() || isStreaming} 
                  className="h-11 px-6 bg-blue-600 hover:bg-blue-700"
                >
                  {isStreaming ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Status bar */}
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>{currentMessages.length} mensagens</span>
                {isStreaming && (
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    Processando...
                  </span>
                )}
                {!isOnline && (
                  <span className="flex items-center gap-2 text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    Offline
                  </span>
                )}
              </div>
              
              <div className="text-xs">
                Pressione Enter para enviar, Shift+Enter para nova linha
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Notificações */}
      <ChatNotifications
        notifications={notifications}
        onRemoveNotification={removeNotification}
        onClearAll={clearAll}
        isOnline={isOnline}
        connectionStatus={connectionStatus}
        retryCount={retryCount}
        onRetry={retryConnection}
      />
    </div>
  )
}
