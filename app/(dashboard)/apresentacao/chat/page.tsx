"use client"

import dynamic from 'next/dynamic'
import { PasswordProtection } from '../../../../components/auth/PasswordProtection'

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

const ProtectedChatDemo = () => {
  return (
    <PasswordProtection 
      password="revolucao"
      title="Chat Demo HubEdu.ia"
      description="Digite a senha para acessar o chat de demonstração"
    >
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
    </PasswordProtection>
  );
};

export default ProtectedChatDemo;
