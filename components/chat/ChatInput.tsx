"use client"

import React, { useState, useRef, useEffect } from "react";
import { encodeMessage, normalizeUnicode } from '@/utils/unicode';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Upload, Mic } from "lucide-react";

interface ChatInputProps {
  message: string;
  onMessageChange: (message: string) => void;
  onSendMessage: (message: string) => void;
  isStreaming: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  message,
  onMessageChange,
  onSendMessage,
  isStreaming,
  placeholder = "Digite sua mensagem...",
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🚀 ChatInput handleSubmit called:', { message: message.trim(), isStreaming, disabled });
    if (message.trim() && !isStreaming && !disabled) {
      const processedMessage = encodeMessage(message); // Processar Unicode
      console.log('✅ Sending message:', processedMessage);
      onSendMessage(processedMessage);
    } else {
      console.log('❌ Cannot send message:', { hasMessage: !!message.trim(), isStreaming, disabled });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('⌨️ Key pressed:', e.key, 'Shift:', e.shiftKey);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log('🚀 Enter key triggered submit');
      handleSubmit(e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      console.log('File selected:', file);
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Handle voice recording logic here
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isStreaming || disabled}
          className="w-full min-h-[44px] max-h-44 resize-none rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Mensagem"
        />
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2 items-end flex-shrink-0">
        {/* File upload button */}
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileUpload}
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={isStreaming || disabled}
          className="h-10 w-10 p-0 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700"
          title="Anexar arquivo"
          aria-label="Anexar arquivo"
        >
          <Upload className="w-4 h-4" />
        </Button>
        
        {/* Voice recording button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleVoiceRecord}
          disabled={isStreaming || disabled}
          className={`h-10 w-10 p-0 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 ${isRecording ? 'text-red-500' : ''}`}
          title="Gravar áudio"
          aria-label="Gravar áudio"
        >
          <Mic className="w-4 h-4" />
        </Button>
        
        {/* Send button */}
        <Button
          type="submit"
          disabled={!message.trim() || isStreaming || disabled}
          className="h-10 rounded-xl px-3 font-medium bg-yellow-500 hover:bg-yellow-600 text-black disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
          aria-label="Enviar mensagem"
        >
          {isStreaming ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </form>
  );
};
