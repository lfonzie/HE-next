"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useConversationManager } from '@/hooks/useConversationManager'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  MessageSquare, 
  Trash2, 
  RefreshCw,
  Brain,
  Clock,
  Hash
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isStreaming?: boolean
  metadata?: {
    provider?: string
    model?: string
    tokens?: number
    trace?: any
  }
}

export default function ImprovedChatComponent() {
  const { data: session } = useSession()
  const [input, setInput] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('grok')
  const [selectedModel, setSelectedModel] = useState('grok-4-fast-reasoning')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    conversationContext,
    startNewConversation,
    loadConversation,
    sendMessage,
    clearConversation,
    generateContextSummary
  } = useConversationManager({
    autoSave: true,
    maxContextMessages: 20,
    enableIntelligentContext: true,
    enableContextSummary: true,
    persistConversations: true
  })

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationContext.messages])

  // Focar no input quando carregar
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim() || conversationContext.isStreaming) return

    const message = input.trim()
    setInput('')

    try {
      await sendMessage(message, {
        provider: selectedProvider as any,
        model: selectedModel,
        module: 'chat',
        useStreaming: true
      })
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleNewConversation = async () => {
    try {
      await startNewConversation()
    } catch (error) {
      console.error('Error starting new conversation:', error)
    }
  }

  const handleClearConversation = () => {
    clearConversation()
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(timestamp)
  }

  const getProviderIcon = (provider?: string) => {
    switch (provider) {
      case 'openai': return '🤖'
      case 'gemini': return '💎'
      case 'grok': return '🚀'
      case 'perplexity': return '🔍'
      default: return '🤖'
    }
  }

  const getProviderColor = (provider?: string) => {
    switch (provider) {
      case 'openai': return 'bg-green-100 text-green-800'
      case 'gemini': return 'bg-blue-100 text-blue-800'
      case 'grok': return 'bg-purple-100 text-purple-800'
      case 'perplexity': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat Inteligente
              {conversationContext.conversationId && (
                <Badge variant="secondary" className="text-xs">
                  <Hash className="h-3 w-3 mr-1" />
                  {conversationContext.conversationId.slice(-8)}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewConversation}
                disabled={conversationContext.isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Nova Conversa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearConversation}
                disabled={conversationContext.isLoading}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Provedor:</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="grok">Grok</option>
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
                <option value="perplexity">Perplexity</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Modelo:</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="grok-4-fast-reasoning">Grok 4 Fast Reasoning</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash</option>
                <option value="grok-beta">Grok Beta</option>
                <option value="sonar-pro">Sonar Pro</option>
              </select>
            </div>
            {conversationContext.contextSummary && (
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-gray-600 max-w-xs truncate">
                  {conversationContext.contextSummary}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {conversationContext.messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Inicie uma nova conversa enviando uma mensagem!</p>
                  <p className="text-sm mt-2">
                    O sistema usa contexto inteligente para manter a continuidade das conversas.
                  </p>
                </div>
              ) : (
                conversationContext.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`flex gap-3 max-w-[80%] ${
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="whitespace-pre-wrap break-words">
                          {message.content}
                          {message.isStreaming && (
                            <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
                          )}
                        </div>
                        
                        {/* Message Metadata */}
                        <div
                          className={`text-xs mt-2 flex items-center gap-2 ${
                            message.role === 'user'
                              ? 'text-blue-100'
                              : 'text-gray-500'
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          <span>{formatTimestamp(message.timestamp)}</span>
                          {message.metadata?.provider && (
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getProviderColor(message.metadata.provider)}`}
                            >
                              {getProviderIcon(message.metadata.provider)} {message.metadata.provider}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {/* Loading indicator */}
              {conversationContext.isLoading && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processando...</span>
                  </div>
                </div>
              )}

              {/* Error message */}
              {conversationContext.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{conversationContext.error}</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <Separator />

        {/* Input Area */}
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={conversationContext.isStreaming}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || conversationContext.isStreaming}
              size="sm"
            >
              {conversationContext.isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Context Info */}
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-4">
            <span>Mensagens: {conversationContext.messages.length}</span>
            <span>Contexto: {conversationContext.messages.length > 0 ? 'Ativo' : 'Inativo'}</span>
            {session?.user?.email && (
              <span>Usuário: {session.user.email}</span>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
