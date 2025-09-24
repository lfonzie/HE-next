"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote,
  Code,
  Link,
  Image,
  Smile,
  AtSign,
  Hash,
  Zap,
  CheckSquare,
  Minus,
  Plus
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export interface TextFormat {
  type: 'bold' | 'italic' | 'underline' | 'code' | 'link'
  start: number
  end: number
  value?: string
}

export interface Suggestion {
  text: string
  type: 'command' | 'emoji' | 'mention' | 'module' | 'hashtag'
  description?: string
  icon?: string
  category?: string
}

export interface Attachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  preview?: string
}

export interface SlashCommand {
  command: string
  description: string
  action: (editor: typeof RichMessageEditor) => void
  icon?: string
}

interface RichMessageEditorProps {
  value: string
  onChange: (value: string) => void
  onSend?: (value: string) => void
  placeholder?: string
  maxLength?: number
  enableFormatting?: boolean
  enableAutoComplete?: boolean
  enableEmojiSuggestions?: boolean
  enableFileUpload?: boolean
  enableSlashCommands?: boolean
  disabled?: boolean
  className?: string
}

export function RichMessageEditor({
  value,
  onChange,
  onSend,
  placeholder = "Digite sua mensagem...",
  maxLength = 4000,
  enableFormatting = true,
  enableAutoComplete = true,
  enableEmojiSuggestions = true,
  enableFileUpload = true,
  enableSlashCommands = true,
  disabled = false,
  className = ''
}: RichMessageEditorProps) {
  const [selection, setSelection] = useState({ start: 0, end: 0 })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Slash commands
  const slashCommands: SlashCommand[] = [
    {
      command: 'help',
      description: 'Mostrar ajuda',
      action: () => insertText('/help - Lista de comandos disponíveis\n'),
      icon: '❓'
    },
    {
      command: 'clear',
      description: 'Limpar conversa',
      action: () => onChange(''),
      icon: '🗑️'
    },
    {
      command: 'export',
      description: 'Exportar conversa',
      action: () => insertText('/export - Exportar conversa atual\n'),
      icon: '📤'
    },
    {
      command: 'settings',
      description: 'Configurações',
      action: () => insertText('/settings - Abrir configurações\n'),
      icon: '⚙️'
    },
    {
      command: 'bold',
      description: 'Texto em negrito',
      action: () => formatText('bold'),
      icon: '**'
    },
    {
      command: 'italic',
      description: 'Texto em itálico',
      action: () => formatText('italic'),
      icon: '*'
    },
    {
      command: 'code',
      description: 'Código',
      action: () => formatText('code'),
      icon: '`'
    },
    {
      command: 'list',
      description: 'Lista',
      action: () => insertText('- Item 1\n- Item 2\n- Item 3\n'),
      icon: '📝'
    },
    {
      command: 'quote',
      description: 'Citação',
      action: () => insertText('> Citação aqui\n'),
      icon: '💬'
    }
  ]

  // Actions
  const insertText = useCallback((text: string) => {
    const start = selection.start
    const end = selection.end
    const newValue = value.slice(0, start) + text + value.slice(end)
    
    onChange(newValue)
    
    // Update cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = start + text.length
        textareaRef.current.setSelectionRange(newPosition, newPosition)
        textareaRef.current.focus()
      }
    }, 0)
  }, [value, selection, onChange])

  const formatText = useCallback((format: string) => {
    const start = selection.start
    const end = selection.end
    const selectedText = value.slice(start, end)
    
    let formattedText = ''
    let newStart = start
    let newEnd = end
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`
        newStart = start + 2
        newEnd = end + 2
        break
      case 'italic':
        formattedText = `*${selectedText}*`
        newStart = start + 1
        newEnd = end + 1
        break
      case 'underline':
        formattedText = `<u>${selectedText}</u>`
        newStart = start + 3
        newEnd = end + 3
        break
      case 'code':
        formattedText = `\`${selectedText}\``
        newStart = start + 1
        newEnd = end + 1
        break
      case 'link':
        formattedText = `[${selectedText}](url)`
        newStart = start + selectedText.length + 3
        newEnd = newStart + 3
        break
    }
    
    const newValue = value.slice(0, start) + formattedText + value.slice(end)
    onChange(newValue)
    
    // Update cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(newStart, newEnd)
        textareaRef.current.focus()
      }
    }, 0)
  }, [value, selection, onChange])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    
    // Update selection
    setSelection({
      start: e.target.selectionStart,
      end: e.target.selectionEnd
    })
    
    // Generate suggestions
    if (enableAutoComplete) {
      generateSuggestions(newValue, e.target.selectionStart)
    }
  }, [onChange, enableAutoComplete])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend?.(value)
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault()
      setSelectedSuggestion(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault()
      setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter' && showSuggestions && selectedSuggestion >= 0) {
      e.preventDefault()
      handleSuggestionClick(suggestions[selectedSuggestion])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedSuggestion(-1)
    }
  }, [value, onSend, showSuggestions, suggestions, selectedSuggestion])

  const generateSuggestions = useCallback((text: string, cursorPosition: number) => {
    const suggestions: Suggestion[] = []
    
    // Slash commands
    if (enableSlashCommands && text.includes('/')) {
      const slashIndex = text.lastIndexOf('/', cursorPosition)
      if (slashIndex !== -1) {
        const query = text.slice(slashIndex + 1, cursorPosition).toLowerCase()
        const matchingCommands = slashCommands.filter(cmd => 
          cmd.command.toLowerCase().startsWith(query)
        )
        
        suggestions.push(...matchingCommands.map(cmd => ({
          text: cmd.command,
          type: 'command' as const,
          description: cmd.description,
          icon: cmd.icon
        })))
      }
    }
    
    // Emoji suggestions
    if (enableEmojiSuggestions && text.includes(':')) {
      const emojiIndex = text.lastIndexOf(':', cursorPosition)
      if (emojiIndex !== -1) {
        const query = text.slice(emojiIndex + 1, cursorPosition).toLowerCase()
        const emojis = [
          { text: '😊', description: 'Sorriso' },
          { text: '👍', description: 'Curtir' },
          { text: '❤️', description: 'Coração' },
          { text: '🎉', description: 'Celebração' },
          { text: '🔥', description: 'Fogo' },
          { text: '💡', description: 'Ideia' },
          { text: '🚀', description: 'Foguete' },
          { text: '⭐', description: 'Estrela' }
        ]
        
        const matchingEmojis = emojis.filter(emoji => 
          emoji.description.toLowerCase().includes(query)
        )
        
        suggestions.push(...matchingEmojis.map(emoji => ({
          text: emoji.text,
          type: 'emoji' as const,
          description: emoji.description
        })))
      }
    }
    
    // Module suggestions
    if (text.includes('#')) {
      const hashIndex = text.lastIndexOf('#', cursorPosition)
      if (hashIndex !== -1) {
        const query = text.slice(hashIndex + 1, cursorPosition).toLowerCase()
        const modules = [
          { text: 'professor', description: 'Módulo Estudos' },
          { text: 'ti', description: 'Módulo TI' },
          { text: 'rh', description: 'Módulo RH' },
          { text: 'financeiro', description: 'Módulo Financeiro' }
        ]
        
        const matchingModules = modules.filter(module => 
          module.text.toLowerCase().startsWith(query)
        )
        
        suggestions.push(...matchingModules.map(module => ({
          text: module.text,
          type: 'module' as const,
          description: module.description
        })))
      }
    }
    
    setSuggestions(suggestions.slice(0, 5))
    setShowSuggestions(suggestions.length > 0)
  }, [enableSlashCommands, enableEmojiSuggestions, slashCommands])

  const handleSuggestionClick = useCallback((suggestion: Suggestion) => {
    const cursorPos = textareaRef.current?.selectionStart || 0
    const textBeforeCursor = value.slice(0, cursorPos)
    const textAfterCursor = value.slice(cursorPos)
    
    let replacement = suggestion.text
    
    if (suggestion.type === 'command') {
      replacement = `/${suggestion.text} `
    } else if (suggestion.type === 'emoji') {
      replacement = suggestion.text
    } else if (suggestion.type === 'module') {
      replacement = `#${suggestion.text} `
    }
    
    const newValue = textBeforeCursor + replacement + textAfterCursor
    onChange(newValue)
    
    setShowSuggestions(false)
    setSelectedSuggestion(-1)
    
    // Focus textarea
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)
  }, [value, onChange])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    setIsUploading(true)
    
    Array.from(files).forEach(async (file) => {
      try {
        const attachment: Attachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file)
        }
        
        setAttachments(prev => [...prev, attachment])
        insertText(`[${file.name}](${attachment.url}) `)
      } catch (error) {
        console.error('Error uploading file:', error)
      }
    })
    
    setIsUploading(false)
  }, [insertText])

  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }, [])

  const remainingChars = maxLength - value.length
  const isOverLimit = remainingChars < 0

  return (
    <TooltipProvider>
      <div className={`rich-message-editor ${className}`}>
        {/* Formatting toolbar */}
        {enableFormatting && (
          <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText('bold')}
                  className="h-8 w-8 p-0"
                >
                  <Bold className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Negrito (Ctrl+B)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText('italic')}
                  className="h-8 w-8 p-0"
                >
                  <Italic className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Itálico (Ctrl+I)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText('code')}
                  className="h-8 w-8 p-0"
                >
                  <Code className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Código (Ctrl+`)</TooltipContent>
            </Tooltip>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText('- ')}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Lista</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText('1. ')}
                  className="h-8 w-8 p-0"
                >
                  <ListOrdered className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Lista numerada</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText('> ')}
                  className="h-8 w-8 p-0"
                >
                  <Quote className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Citação</TooltipContent>
            </Tooltip>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText('link')}
                  className="h-8 w-8 p-0"
                >
                  <Link className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Link</TooltipContent>
            </Tooltip>

            {enableFileUpload && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="h-8 w-8 p-0"
                  >
                    <Image className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Anexar arquivo</TooltipContent>
              </Tooltip>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          </div>
        )}

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="p-2 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <Badge key={attachment.id} variant="secondary" className="flex items-center gap-1">
                  <Image className="w-3 h-3" />
                  {attachment.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeAttachment(attachment.id)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Text area */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[100px] max-h-[300px] resize-none pr-12"
            maxLength={maxLength}
          />

          {/* Character count */}
          <div className={`absolute bottom-2 right-2 text-xs ${
            isOverLimit ? 'text-red-500' : 'text-gray-500'
          }`}>
            {remainingChars}
          </div>
        </div>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto bg-white">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${
                  selectedSuggestion === index ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center gap-2">
                  {suggestion.icon && (
                    <span className="text-sm">{suggestion.icon}</span>
                  )}
                  <span className="text-sm font-medium">
                    {suggestion.type === 'command' ? '/' : ''}
                    {suggestion.type === 'emoji' ? '' : ''}
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
            {isUploading && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Enviando arquivo...
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



