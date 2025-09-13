"use client"

import { Message } from '@/types'
import { MessageItem } from './MessageItem'
import { Card, CardContent } from '@/components/ui/card'

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold mb-2">Bem-vindo ao HubEdu.ai!</h3>
            <p className="text-muted-foreground">
              Escolha um módulo e comece a conversar com nossa IA especializada.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  )
}