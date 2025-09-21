"use client"

import dynamic from 'next/dynamic'

// Dynamically import ChatWrapper to avoid SSR issues
const ChatWrapper = dynamic(() => import("@/components/chat/ChatWrapper"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-gray-500">Carregando chat...</p>
      </div>
    </div>
  )
})

// app/(dashboard)/apresentacao/chat/page.tsx
import DemoGuard from "../components/DemoGuard";
import { QuotaProvider } from "@/components/providers/QuotaProvider";

const handleLimitReached = () => {
  console.log('Demo limit reached');
};

export default function ChatDemo() {
  return (
    <div className="flex flex-col h-screen">
      <div className="p-4">
        <DemoGuard />
      </div>
      <div className="flex-1">
        <QuotaProvider>
          <ChatWrapper 
            mode="demo" 
            maxMessages={5}
            onLimitReached={handleLimitReached}
          />
        </QuotaProvider>
      </div>
    </div>
  );
}
