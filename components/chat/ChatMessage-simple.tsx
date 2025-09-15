"use client"

import React from "react";

interface MessageProps {
  message: {
    id?: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
    module?: string;
  };
  isUser: boolean;
  userInitials?: string;
  currentModuleId?: string | null;
  conversationId?: string;
  messageIndex?: number;
}

export function ChatMessage({ message, isUser }: MessageProps) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`max-w-[70%] p-4 rounded-lg ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-white border border-gray-200 text-gray-900'
        }`}
      >
        <div className="whitespace-pre-wrap">
          {message.content}
        </div>
        {message.timestamp && (
          <div className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>
    </div>
  );
}
