"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Upload, Mic, MoreHorizontal, Trash2, Download, Share2, Zap } from 'lucide-react'
import { useAISDKChat } from '@/hooks/useAISDKChat'
import { MessageList } from './MessageList'
import { ModuleSelector } from './ModuleSelector'
import { ModuleType } from '@/types'
import { useToast } from '@/hooks/use-toast'

export function AISDKChatInterface() {
  const [message, setMessage] = useState('')
  const [selectedModule, setSelectedModule] = useState<ModuleType>('professor')
  const [showModuleSelector, setShowModuleSelector] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [useCache, setUseCache] = useState(true)
  
  const { 
    currentConversation, 
    sendMessage, 
    isStreaming, 
    startNewConversation, 
    lastClassification,
    error,
    retryCount,
    cancelCurrentRequest,
    clearError
  } = useAISDKChat()
  
  const { toast } = useToast()
  const messages = currentConversation?.messages || []
  const isLoading = isStreaming
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    try {
      // Passar o ID da conversa atual para manter o histórico
      await sendMessage(
        message, 
        selectedModule,
        undefined, // subject
        undefined, // grade
        currentConversation?.id // conversationId - CRÍTICO para manter histórico
      )
      setMessage('')
    } catch (error) {
      toast({
        title: 'Erro ao enviar mensagem',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleModuleChange = (module: ModuleType) => {
    setSelectedModule(module)
    setShowModuleSelector(false)
  }

  const handleNewConversation = () => {
    startNewConversation(selectedModule)
    setMessage('')
  }

  const handleCancel = () => {
    cancelCurrentRequest()
  }

  const handleClearError = () => {
    clearError()
  }

  const handleToggleCache = () => {
    setUseCache(!useCache)
    toast({
      title: useCache ? 'Cache desabilitado' : 'Cache habilitado',
      description: useCache ? 'Respostas serão sempre geradas' : 'Respostas similares serão cacheadas',
    })
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Chat AI SDK
          </h1>
          {lastClassification && (
            <Badge variant="secondary" className="text-xs">
              {lastClassification.module} ({Math.round(lastClassification.confidence * 100)}%)
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowModuleSelector(!showModuleSelector)}
          >
            {selectedModule}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleCache}
            className={useCache ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}
          >
            Cache {useCache ? 'ON' : 'OFF'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewConversation}
            disabled={isLoading}
          >
            Nova Conversa
          </Button>
          
          {isLoading && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {/* Module Selector */}
      {showModuleSelector && (
        <div className="p-4 border-b">
          <ModuleSelector
            selectedModule={selectedModule}
            onModuleChange={handleModuleChange}
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-800 font-medium">Erro no chat</p>
              <p className="text-red-600 text-sm">{error}</p>
              {retryCount > 0 && (
                <p className="text-red-500 text-xs">Tentativas: {retryCount}</p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearError}
            >
              Limpar
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={messages}
          isLoading={isLoading}
          isTyping={isTyping}
        />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                handleTyping()
              }}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              className="min-h-[60px] max-h-[120px] resize-none"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              disabled={!message.trim() || isLoading}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </form>
        
        {/* Status */}
        <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
          <div>
            {isLoading && "Processando com Vercel AI SDK..."}
            {!isLoading && messages.length > 0 && `${messages.length} mensagens`}
          </div>
          <div className="flex items-center gap-2">
            {useCache && <Badge variant="outline" className="text-xs">Cache ON</Badge>}
            <Badge variant="outline" className="text-xs">AI SDK</Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
