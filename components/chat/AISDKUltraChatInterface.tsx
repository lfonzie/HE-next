"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Upload, Mic, MoreHorizontal, Trash2, Download, Share2, Zap, Rocket } from 'lucide-react'
import { useAISDKUltraChat } from '@/hooks/useAISDKUltraChat'
import { MessageList } from './MessageList'
import { ModuleSelector } from './ModuleSelector'
import { ModuleType } from '@/types'
import { useToast } from '@/hooks/use-toast'

export function AISDKUltraChatInterface() {
  const [message, setMessage] = useState('')
  const [selectedModule, setSelectedModule] = useState<ModuleType>('professor')
  const [showModuleSelector, setShowModuleSelector] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  
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
  } = useAISDKUltraChat()
  
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
      await sendMessage(message, selectedModule)
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
    
    // Iniciar nova conversa sempre que um módulo for selecionado
    startNewConversation(module)
    setMessage('')
    
    toast({
      title: "Nova conversa iniciada",
      description: `Módulo ${module} selecionado - conversa limpa`,
    })
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

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Rocket className="h-5 w-5 text-purple-500" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Chat Ultra AI SDK
            </span>
          </h1>
          {lastClassification && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
              {lastClassification.module} ({Math.round(lastClassification.confidence * 100)}%)
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowModuleSelector(!showModuleSelector)}
            className="bg-white/80"
          >
            {selectedModule}
          </Button>
          
          <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800">
            <Zap className="h-3 w-3 mr-1" />
            ULTRA
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewConversation}
            disabled={isLoading}
            className="bg-white/80"
          >
            Nova Conversa
          </Button>
          
          {isLoading && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="bg-red-50 text-red-700 border-red-200"
            >
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {/* Module Selector */}
      {showModuleSelector && (
        <div className="p-4 border-b bg-gray-50">
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
      <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-blue-50">
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
              className="min-h-[60px] max-h-[120px] resize-none bg-white/80 border-blue-200 focus:border-blue-400"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              disabled={!message.trim() || isLoading}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Send className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="bg-white/80"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </form>
        
        {/* Status */}
        <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
          <div>
            {isLoading && "Processando com Vercel AI SDK Ultra..."}
            {!isLoading && messages.length > 0 && `${messages.length} mensagens`}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
              <Zap className="h-3 w-3 mr-1" />
              Cache ON
            </Badge>
            <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800">
              <Rocket className="h-3 w-3 mr-1" />
              AI SDK ULTRA
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
