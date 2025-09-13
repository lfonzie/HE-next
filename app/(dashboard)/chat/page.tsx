"use client"

import { ChatInterface } from '@/components/chat/ChatInterface'

export default function ChatPage() {
  return (
    <div className="h-screen flex flex-col">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">Chat Inteligente</h1>
        <p className="text-muted-foreground">
          Converse com nossa IA especializada em diferentes módulos educacionais
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  )
}
