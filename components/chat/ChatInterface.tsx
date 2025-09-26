"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Upload, Mic, MoreHorizontal, Trash2, Download, Share2 } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { MessageList } from './MessageList'
import { ModuleSelector } from './ModuleSelector'
import { ModuleType } from '@/types'
import { useToast } from '@/hooks/use-toast'

export function ChatInterface() {
  const [message, setMessage] = useState('')
  const [selectedModule, setSelectedModule] = useState<ModuleType>('professor')
  const [showModuleSelector, setShowModuleSelector] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const { currentConversation, sendMessage, isStreaming, startNewConversation, lastClassification } = useChat()
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
      // TEMPORÁRIO: Debug - sempre usar "auto" para permitir classificação automática
      console.log('🔍 [ChatInterface] selectedModule antes do override:', selectedModule);
      await sendMessage(message, "auto") // Forçar "auto" para permitir classificação automática
      setMessage('')
      setIsTyping(false)
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
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
    toast({
      title: "Conversa limpa",
      description: "Nova conversa iniciada."
    })
  }

  const handleExportConversation = () => {
    if (messages.length === 0) return
    
    const conversationText = messages.map(msg => 
      `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`
    ).join('\n\n')
    
    const blob = new Blob([conversationText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversa-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: "Conversa exportada",
      description: "Arquivo baixado com sucesso."
    })
  }

  const handleShareConversation = async () => {
    if (navigator.share && messages.length > 0) {
      try {
        const conversationText = messages.map(msg => 
          `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`
        ).join('\n\n')
        
        await navigator.share({
          title: 'Conversa HubEdu.ai',
          text: conversationText,
        })
      } catch (error) {
        console.log('Erro ao compartilhar:', error)
      }
    }
  }

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
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
              onClick={() => setShowModuleSelector(!showModuleSelector)}
              className="text-gray-600 dark:text-gray-300"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            
            {messages.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportConversation}
                  className="text-gray-600 dark:text-gray-300"
                  title="Exportar conversa"
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShareConversation}
                  className="text-gray-600 dark:text-gray-300"
                  title="Compartilhar conversa"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearConversation}
                  className="text-red-600 dark:text-red-400"
                  title="Limpar conversa"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
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
              onNewConversation={() => {
                startNewConversation(selectedModule)
              }}
            />
          </div>
        )}
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} />
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t bg-gray-50 dark:bg-gray-800">
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
                disabled={isLoading}
              />
              
              {/* Typing indicator */}
              {isTyping && !isLoading && (
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
                disabled={!message.trim() || isLoading} 
                className="h-11 px-6 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
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
              <span>{messages.length} mensagens</span>
              {isLoading && (
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  Processando...
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
  )
}
