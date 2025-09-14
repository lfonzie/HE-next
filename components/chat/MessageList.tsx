"use client"

import { Message } from '@/types'
import { MessageItem } from './MessageItem'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowDown, Sparkles, MessageSquare } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current && isAtBottom) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, isAtBottom])

  // Handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const atBottom = scrollTop + clientHeight >= scrollHeight - 10
    setIsAtBottom(atBottom)
    setShowScrollToBottom(!atBottom && messages.length > 3)
  }

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
      setIsAtBottom(true)
      setShowScrollToBottom(false)
    }
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8 text-center">
            <div className="text-8xl mb-6 animate-pulse">🤖</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Bem-vindo ao HubEdu.ai!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
              Escolha um módulo e comece a conversar com nossa IA especializada.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-semibold text-blue-900 dark:text-blue-100">IA Especializada</div>
                  <div className="text-sm text-blue-700 dark:text-blue-200">Respostas personalizadas por módulo</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="font-semibold text-green-900 dark:text-green-100">Chat Inteligente</div>
                  <div className="text-sm text-green-700 dark:text-green-200">Conversas contextuais e históricas</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 relative">
      <ScrollArea 
        ref={scrollAreaRef}
        className="h-full"
        onScrollCapture={handleScroll}
      >
        <div className="p-4 space-y-6">
          {messages.map((message, index) => (
            <MessageItem 
              key={message.id} 
              message={message}
              isLast={index === messages.length - 1}
            />
          ))}
          
          {/* Spacer for better scrolling */}
          <div className="h-4" />
        </div>
      </ScrollArea>
      
      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <Button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 h-10 w-10 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
          size="icon"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}