'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Wrench, AlertCircle, CheckCircle, Clock, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface GuidedChatProps {
  sessionId?: string
  issue?: string
  deviceLabel?: string
}

export default function GuidedChat({ 
  sessionId, 
  issue = 'printer', 
  deviceLabel
}: GuidedChatProps) {
  const [currentSessionId, setCurrentSessionId] = useState(sessionId)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/ti/assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId: currentSessionId,
          issue,
          deviceLabel
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, assistantMessage])
        
        if (data.sessionId) {
          setCurrentSessionId(data.sessionId)
        }
      } else {
        console.error('API Error:', data.error)
      }
    } catch (error) {
      console.error('Network Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input?.trim()) {
      sendMessage(input)
    }
  }

  const getStatusIcon = (role: 'user' | 'assistant') => {
    if (role === 'user') return <MessageSquare className="h-4 w-4" />
    return <Wrench className="h-4 w-4" />
  }

  const getStatusColor = (role: 'user' | 'assistant') => {
    if (role === 'user') return 'bg-blue-100 text-blue-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className="space-y-4">
      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Suporte TI - Chat Guiado com IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Sessão: {currentSessionId || 'Nova'}</Badge>
            <Badge variant="outline">Problema: {issue}</Badge>
            {deviceLabel && <Badge variant="outline">Dispositivo: {deviceLabel}</Badge>}
            <Badge variant="default" className="bg-green-500">IA Ativa</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="h-96 overflow-hidden">
        <CardContent className="h-full p-4">
          <div className="h-full overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Descreva seu problema de TI para começar</p>
                  <p className="text-sm mt-1">A IA irá gerar um playbook personalizado para você</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(message.role)}`}>
                      {getStatusIcon(message.role)}
                    </div>
                    <div className={`rounded-lg p-3 ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.createdAt || Date.now()).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm">IA está processando sua mensagem...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Input */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleFormSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Descreva seu problema de TI..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input?.trim()}>
              {isLoading ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => sendMessage('Minha impressora não imprime')}
              disabled={isLoading}
            >
              Impressora não imprime
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => sendMessage('Não consigo conectar no Wi-Fi')}
              disabled={isLoading}
            >
              Problema de Wi-Fi
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => sendMessage('Meu computador está travando')}
              disabled={isLoading}
            >
              Computador travando
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => sendMessage('Não consigo acessar meu email')}
              disabled={isLoading}
            >
              Problema de email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}