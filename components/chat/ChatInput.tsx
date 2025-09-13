"use client"

import React, { useState, useRef, useEffect } from "react";
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
    if (message.trim() && !isStreaming && !disabled) {
      onSendMessage(message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
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
    <div className="flex gap-2 items-end w-full">
      <div className="flex-1">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isStreaming || disabled}
          className="min-h-[44px] max-h-32 resize-none"
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
          className="h-11 w-11 p-0"
          title="Anexar arquivo"
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
          className={`h-11 w-11 p-0 ${isRecording ? 'text-red-500' : ''}`}
          title="Gravar áudio"
        >
          <Mic className="w-4 h-4" />
        </Button>
        
        {/* Send button */}
        <Button
          type="submit"
          disabled={!message.trim() || isStreaming || disabled}
          className="h-11 px-4"
          onClick={handleSubmit}
        >
          {isStreaming ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
