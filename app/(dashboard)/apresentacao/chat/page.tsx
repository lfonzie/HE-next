"use client"

// app/(dashboard)/apresentacao/chat/page.tsx
import ChatWrapper from "@/components/chat/ChatWrapper";
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
