"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Send, Upload, Mic } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { MessageList } from './MessageList'
import { ModuleSelector } from './ModuleSelector'
import { ModuleType } from '@/types'

export function ChatInterface() {
  const [message, setMessage] = useState('')
  const [selectedModule, setSelectedModule] = useState<ModuleType>('professor')
  const { currentConversation, sendMessage, isStreaming, startNewConversation } = useChat()
  const messages = currentConversation?.messages || []
  const isLoading = isStreaming
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    await sendMessage(message, selectedModule)
    setMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="p-4 border-b">
        <ModuleSelector 
          selectedModule={selectedModule}
          onSelectModule={(moduleId: string) => setSelectedModule(moduleId as ModuleType)}
        />
      </div>
      
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} />
      </div>
      
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 min-h-[60px] max-h-[120px] resize-none"
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={isLoading || !message.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {messages.length > 0 && (
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>{messages.length} mensagens</span>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => startNewConversation(selectedModule)}
              >
                Limpar conversa
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
