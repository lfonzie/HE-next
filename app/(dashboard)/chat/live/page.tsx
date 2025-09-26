'use client';

import { LiveChatInterface } from '@/components/chat/LiveChatInterface';

export default function LivePage() {
  console.log('[LivePage] Component rendering...');
  
  return (
    <div className="container mx-auto p-6 max-w-6xl h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Chat ao Vivo</h1>
        <p className="text-muted-foreground mt-2">
          Converse em tempo real com IA usando voz e vídeo
        </p>
      </div>
      
      <LiveChatInterface className="h-full" />
    </div>
  );
}