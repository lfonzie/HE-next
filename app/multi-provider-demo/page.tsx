"use client"

import React, { useState } from 'react'
import { useMultiProviderChat, useProviderStats } from '@/hooks/useMultiProviderChat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Send, Zap, Brain, Clock } from 'lucide-react'

export default function MultiProviderChatDemo() {
  const [message, setMessage] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<'auto' | 'openai' | 'google'>('auto')
  const [messages, setMessages] = useState<Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    provider?: string
    model?: string
    complexity?: string
    latency?: number
    timestamp: Date
  }>>([])

  const { sendMessage, isStreaming, lastMessage, cancelCurrentRequest } = useMultiProviderChat({
    forceProvider: selectedProvider,
    useCache: true,
    onStreamingStart: () => console.log('Streaming started')
  })

  const { stats, loading: statsLoading, fetchStats } = useProviderStats()

  const handleSendMessage = async () => {
    if (!message.trim() || isStreaming) return

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setMessage('')

    try {
      const result = await sendMessage(message, 'auto')
      
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant' as const,
        content: result.response,
        provider: result.provider,
        model: result.model,
        complexity: result.complexity,
        latency: result.latency,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
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

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return <Brain className="w-4 h-4" />
      case 'google': return <Zap className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'trivial': return 'bg-green-100 text-green-800'
      case 'simples': return 'bg-yellow-100 text-yellow-800'
      case 'complexa': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI SDK Multi-Provider Demo
        </h1>
        <p className="text-gray-600">
          Sistema inteligente que escolhe automaticamente entre Google e OpenAI baseado na complexidade
        </p>
      </div>

      {/* Provider Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Provider Statistics
            <Button 
              onClick={fetchStats} 
              disabled={statsLoading}
              size="sm"
              variant="outline"
            >
              {statsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">2</div>
                <div className="text-sm text-gray-600">Providers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">4</div>
                <div className="text-sm text-gray-600">Models</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">3</div>
                <div className="text-sm text-gray-600">Complexity Levels</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">Auto</div>
                <div className="text-sm text-gray-600">Selection</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Chat Multi-Provider</CardTitle>
          <div className="flex gap-4 items-center">
            <Select value={selectedProvider} onValueChange={(value: any) => setSelectedProvider(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Escolher Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">🤖 Auto (Recomendado)</SelectItem>
                <SelectItem value="openai">🧠 OpenAI</SelectItem>
                <SelectItem value="google">⚡ Google</SelectItem>
              </SelectContent>
            </Select>
            
            {isStreaming && (
              <Button onClick={cancelCurrentRequest} variant="destructive" size="sm">
                Cancelar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Messages */}
          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-sm">{msg.content}</div>
                  
                  {msg.role === 'assistant' && (
                    <div className="flex gap-2 mt-2 text-xs opacity-75">
                      <Badge variant="outline" className="text-xs">
                        {getProviderIcon(msg.provider || '')}
                        {msg.provider}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {msg.model}
                      </Badge>
                      <Badge className={`text-xs ${getComplexityColor(msg.complexity || '')}`}>
                        {msg.complexity}
                      </Badge>
                      {msg.latency && (
                        <Badge variant="outline" className="text-xs">
                          {msg.latency}ms
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={isStreaming}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!message.trim() || isStreaming}
            >
              {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Exemplos de Complexidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-green-700 mb-2">Trivial</h3>
              <p className="text-sm text-gray-600 mb-2">Mensagens simples e rápidas</p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setMessage('oi')}
                className="w-full"
              >
                "oi" → Google Gemini Flash
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-yellow-700 mb-2">Simples</h3>
              <p className="text-sm text-gray-600 mb-2">Perguntas básicas</p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setMessage('Qual é a capital do Brasil?')}
                className="w-full"
              >
                "Qual é a capital?" → OpenAI GPT-4o-mini
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-red-700 mb-2">Complexa</h3>
              <p className="text-sm text-gray-600 mb-2">Explicações detalhadas</p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setMessage('Explique detalhadamente como funciona a fotossíntese')}
                className="w-full"
              >
                "Explique fotossíntese" → OpenAI GPT-5 Chat Latest
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
