"use client"

import React, { useRef, useEffect, useState } from 'react'
import { useMessageComposer } from '@/hooks/useMessageComposer'
import { useNotificationContext } from '@/contexts/NotificationContext'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Upload, 
  Mic, 
  MicOff, 
  Paperclip, 
  X,
  Smile,
  MoreHorizontal,
  Zap,
  Clock
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface MessageComposerProps {
  onSendMessage: (message: string) => void
  isStreaming?: boolean
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  className?: string
}

export function MessageComposer({
  onSendMessage,
  isStreaming = false,
  disabled = false,
  placeholder = "Digite sua mensagem...",
  maxLength = 4000,
  className = ''
}: MessageComposerProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1)
  
  const {
    content,
    isComposing,
    isRecording,
    isUploading,
    attachments,
    suggestions,
    draft,
    isDirty,
    remainingChars,
    isOverLimit,
    updateContent,
    insertSuggestion,
    addAttachment,
    removeAttachment,
    startVoiceRecording,
    stopVoiceRecording,
    sendMessage,
    saveDraft,
    clearDraft,
    textareaRef
  } = useMessageComposer({
    enableAutoComplete: true,
    enableSpellCheck: true,
    enableEmojiSuggestions: true,
    enableFileUpload: true,
    enableVoiceInput: true,
    maxMessageLength: maxLength,
    enableDraftSaving: true,
    enableKeyboardShortcuts: true,
    enableRichFormatting: true
  })

  const { notifyInfo, notifyError } = useNotificationContext()

  // Handle send message
  const handleSendMessage = async () => {
    if (!content.trim() || isStreaming || disabled || isOverLimit) {
      return
    }

    try {
      await sendMessage(content)
      onSendMessage(content)
      clearDraft()
    } catch (error) {
      notifyError('Erro', 'Falha ao enviar mensagem')
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateContent(e.target.value)
  }

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault()
      setSelectedSuggestion(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault()
      setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedSuggestion(-1)
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: any) => {
    insertSuggestion(suggestion)
    setShowSuggestions(false)
    setSelectedSuggestion(-1)
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => {
        addAttachment(file)
      })
    }
  }

  // Handle voice recording
  const handleVoiceToggle = () => {
    if (isRecording) {
      stopVoiceRecording()
    } else {
      startVoiceRecording()
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [content])

  // Show suggestions when available
  useEffect(() => {
    setShowSuggestions(suggestions.length > 0)
    setSelectedSuggestion(-1)
  }, [suggestions])

  const canSend = content.trim().length > 0 && !isStreaming && !disabled && !isOverLimit

  return (
    <TooltipProvider>
      <div className={`relative ${className}`}>
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                {file.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeAttachment(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Main composer */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isStreaming}
            className="min-h-[60px] max-h-[200px] resize-none pr-24"
            maxLength={maxLength}
          />

          {/* Character count */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {remainingChars}
          </div>

          {/* Action buttons */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            {/* Voice recording */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVoiceToggle}
                  disabled={disabled || isStreaming}
                  className={`h-8 w-8 p-0 ${
                    isRecording ? 'text-red-600 bg-red-50' : 'text-gray-500'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isRecording ? 'Parar gravação' : 'Gravação de voz'}
              </TooltipContent>
            </Tooltip>

            {/* File upload */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled || isStreaming || isUploading}
                  className="h-8 w-8 p-0 text-gray-500"
                  asChild
                >
                  <label>
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                  </label>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Anexar arquivo
              </TooltipContent>
            </Tooltip>

            {/* More options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled || isStreaming}
                  className="h-8 w-8 p-0 text-gray-500"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={saveDraft}>
                  <Clock className="w-4 h-4 mr-2" />
                  Salvar rascunho
                </DropdownMenuItem>
                {draft && (
                  <DropdownMenuItem onClick={clearDraft}>
                    <X className="w-4 h-4 mr-2" />
                    Limpar rascunho
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Smile className="w-4 h-4 mr-2" />
                  Emojis
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Zap className="w-4 h-4 mr-2" />
                  Atalhos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Send button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSendMessage}
                  disabled={!canSend}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isStreaming ? 'Enviando...' : 'Enviar mensagem (Enter)'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${
                  selectedSuggestion === index ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {suggestion.type === 'command' ? '/' : ''}
                    {suggestion.type === 'emoji' ? '' : ''}
                    {suggestion.type === 'mention' ? '@' : ''}
                    {suggestion.type === 'module' ? '#' : ''}
                    {suggestion.text}
                  </span>
                  {suggestion.description && (
                    <span className="text-xs text-gray-500">
                      {suggestion.description}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status indicators */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            {isComposing && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Digitando...
              </span>
            )}
            {isRecording && (
              <span className="flex items-center gap-1 text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Gravando...
              </span>
            )}
            {isUploading && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Enviando arquivo...
              </span>
            )}
            {isDirty && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Rascunho salvo
              </span>
            )}
          </div>
          
          {isOverLimit && (
            <span className="text-red-500">
              Limite de caracteres excedido
            </span>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
