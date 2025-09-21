"use client"

import dynamic from 'next/dynamic'

// Dynamically import the main chat component to avoid SSR issues
const ChatComponent = dynamic(() => import('./ChatComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-gray-500">Carregando chat...</p>
      </div>
    </div>
  )
})

export default function ChatPage() {
  return <ChatComponent />
}
