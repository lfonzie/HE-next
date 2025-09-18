"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { useChatContext } from '@/contexts/ChatContext'
import { useNotificationContext } from '@/contexts/NotificationContext'
import { useModuleOrchestrator } from './useModuleOrchestrator'
import { Message as ChatMessageType } from '@/types'

export interface MessageComposerConfig {
  enableAutoComplete: boolean
  enableSpellCheck: boolean
  enableEmojiSuggestions: boolean
  enableFileUpload: boolean
  enableVoiceInput: boolean
  maxMessageLength: number
  enableDraftSaving: boolean
  enableKeyboardShortcuts: boolean
  enableRichFormatting: boolean
}

export interface MessageDraft {
  id: string
  content: string
  timestamp: number
  conversationId?: string
  module?: string
  attachments?: File[]
  metadata?: Record<string, any>
}

export interface AutoCompleteSuggestion {
  text: string
  type: 'command' | 'emoji' | 'mention' | 'module'
  description?: string
  icon?: string
}

export interface MessageComposerState {
  content: string
  isComposing: boolean
  isRecording: boolean
  isUploading: boolean
  attachments: File[]
  draft: MessageDraft | null
  suggestions: AutoCompleteSuggestion[]
  cursorPosition: number
  selectionStart: number
  selectionEnd: number
  isDirty: boolean
  lastSaved: number
}

export function useMessageComposer(config: MessageComposerConfig = {
  enableAutoComplete: true,
  enableSpellCheck: true,
  enableEmojiSuggestions: true,
  enableFileUpload: true,
  enableVoiceInput: false,
  maxMessageLength: 4000,
  enableDraftSaving: true,
  enableKeyboardShortcuts: true,
  enableRichFormatting: true
}) {
  const { currentConversation, addMessage, setSelectedModule } = useChatContext()
  const { notifySuccess, notifyError, notifyInfo } = useNotificationContext()
  const { selectOptimalModule } = useModuleOrchestrator()

  const [state, setState] = useState<MessageComposerState>({
    content: '',
    isComposing: false,
    isRecording: false,
    isUploading: false,
    attachments: [],
    draft: null,
    suggestions: [],
    cursorPosition: 0,
    selectionStart: 0,
    selectionEnd: 0,
    isDirty: false,
    lastSaved: 0
  })

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const draftTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const voiceRecognitionRef = useRef<any>(null)

  // Actions
  const updateContent = useCallback((content: string) => {
    setState(prev => ({
      ...prev,
      content,
      isDirty: true,
      cursorPosition: content.length
    }))

    // Auto-save draft
    if (config.enableDraftSaving) {
      if (draftTimeoutRef.current) {
        clearTimeout(draftTimeoutRef.current)
      }
      
      draftTimeoutRef.current = setTimeout(() => {
        saveDraft(content)
      }, 1000)
    }

    // Generate suggestions
    if (config.enableAutoComplete && content.length > 0) {
      generateSuggestions(content)
    }
  }, [config])

  const insertText = useCallback((text: string, replaceSelection = true) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = replaceSelection ? state.selectionStart : state.cursorPosition
    const end = replaceSelection ? state.selectionEnd : state.cursorPosition

    const newContent = state.content.slice(0, start) + text + state.content.slice(end)
    updateContent(newContent)

    // Set cursor position after inserted text
    setTimeout(() => {
      if (textarea) {
        const newPosition = start + text.length
        textarea.setSelectionRange(newPosition, newPosition)
      }
    }, 0)
  }, [state.content, state.selectionStart, state.selectionEnd, state.cursorPosition, updateContent])

  const insertSuggestion = useCallback((suggestion: AutoCompleteSuggestion) => {
    if (suggestion.type === 'command') {
      insertText(`/${suggestion.text} `)
    } else if (suggestion.type === 'emoji') {
      insertText(suggestion.text)
    } else if (suggestion.type === 'mention') {
      insertText(`@${suggestion.text} `)
    } else if (suggestion.type === 'module') {
      insertText(`#${suggestion.text} `)
    } else {
      insertText(suggestion.text)
    }

    // Clear suggestions
    setState(prev => ({ ...prev, suggestions: [] }))
  }, [insertText])

  const addAttachment = useCallback(async (file: File) => {
    try {
      if (!config.enableFileUpload) {
        throw new Error('File upload is disabled')
      }

      // Validate file
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size exceeds 10MB limit')
      }

      const allowedTypes = ['image/', 'text/', 'application/pdf']
      if (!allowedTypes.some(type => file.type.startsWith(type))) {
        throw new Error('File type not supported')
      }

      setState(prev => ({
        ...prev,
        attachments: [...prev.attachments, file],
        isUploading: true
      }))

      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 1000))

      notifySuccess('Arquivo Adicionado', `${file.name} foi adicionado com sucesso`)
      
      setState(prev => ({
        ...prev,
        isUploading: false
      }))

      return true
    } catch (error) {
      console.error('Error adding attachment:', error)
      notifyError('Erro', error instanceof Error ? error.message : 'Falha ao adicionar arquivo')
      setState(prev => ({ ...prev, isUploading: false }))
      throw error
    }
  }, [config.enableFileUpload, notifySuccess, notifyError])

  const removeAttachment = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }, [])

  const startVoiceRecording = useCallback(() => {
    try {
      if (!config.enableVoiceInput) {
        throw new Error('Voice input is disabled')
      }

      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        throw new Error('Speech recognition not supported')
      }

      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'pt-BR'

      recognition.onstart = () => {
        setState(prev => ({ ...prev, isRecording: true }))
        notifyInfo('Gravação Iniciada', 'Fale agora...')
      }

      recognition.onresult = (event: any) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        
        if (event.results[event.resultIndex].isFinal) {
          updateContent(state.content + transcript)
          setState(prev => ({ ...prev, isRecording: false }))
          notifySuccess('Gravação Concluída', 'Texto convertido com sucesso')
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setState(prev => ({ ...prev, isRecording: false }))
        notifyError('Erro de Gravação', 'Falha na gravação de voz')
      }

      recognition.onend = () => {
        setState(prev => ({ ...prev, isRecording: false }))
      }

      voiceRecognitionRef.current = recognition
      recognition.start()
    } catch (error) {
      console.error('Error starting voice recording:', error)
      notifyError('Erro', error instanceof Error ? error.message : 'Falha ao iniciar gravação')
    }
  }, [config.enableVoiceInput, state.content, updateContent, notifyInfo, notifySuccess, notifyError])

  const stopVoiceRecording = useCallback(() => {
    if (voiceRecognitionRef.current) {
      voiceRecognitionRef.current.stop()
      voiceRecognitionRef.current = null
    }
    setState(prev => ({ ...prev, isRecording: false }))
  }, [])

  const sendMessage = useCallback(async (content?: string) => {
    try {
      const messageContent = content || state.content.trim()
      
      if (!messageContent) {
        throw new Error('Mensagem não pode estar vazia')
      }

      if (messageContent.length > config.maxMessageLength) {
        throw new Error(`Mensagem excede o limite de ${config.maxMessageLength} caracteres`)
      }

      if (!currentConversation) {
        throw new Error('Nenhuma conversa ativa')
      }

      // Create message
      const message: ChatMessageType = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'user',
        content: messageContent,
        timestamp: Date.now(),
        conversationId: currentConversation.id,
        attachments: state.attachments.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file)
        }))
      }

      // Add message to conversation
      await addMessage(currentConversation.id, message)

      // Auto-select optimal module if not already selected
      if (!currentConversation.module || currentConversation.module === 'atendimento') {
        try {
          const optimalModule = await selectOptimalModule(
            messageContent,
            currentConversation.messages,
            'current-user' // TODO: Get from auth context
          )
          
          if (optimalModule && optimalModule !== currentConversation.module) {
            setSelectedModule(optimalModule as any)
          }
        } catch (error) {
          console.warn('Failed to auto-select module:', error)
        }
      }

      // Clear composer
      setState(prev => ({
        ...prev,
        content: '',
        attachments: [],
        isDirty: false,
        suggestions: []
      }))

      // Clear draft
      if (config.enableDraftSaving) {
        clearDraft()
      }

      notifySuccess('Mensagem Enviada', 'Mensagem enviada com sucesso')
      return message
    } catch (error) {
      console.error('Error sending message:', error)
      notifyError('Erro', error instanceof Error ? error.message : 'Falha ao enviar mensagem')
      throw error
    }
  }, [
    state.content,
    state.attachments,
    config.maxMessageLength,
    currentConversation,
    addMessage,
    selectOptimalModule,
    setSelectedModule,
    notifySuccess,
    notifyError
  ])

  const saveDraft = useCallback((content: string) => {
    if (!content.trim()) return

    const draft: MessageDraft = {
      id: `draft-${Date.now()}`,
      content,
      timestamp: Date.now(),
      conversationId: currentConversation?.id,
      attachments: state.attachments,
      metadata: {
        cursorPosition: state.cursorPosition,
        selectionStart: state.selectionStart,
        selectionEnd: state.selectionEnd
      }
    }

    setState(prev => ({
      ...prev,
      draft,
      lastSaved: Date.now()
    }))

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('message-draft', JSON.stringify(draft))
    }
  }, [currentConversation?.id, state.attachments, state.cursorPosition, state.selectionStart, state.selectionEnd])

  const loadDraft = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedDraft = localStorage.getItem('message-draft')
        if (savedDraft) {
          const draft = JSON.parse(savedDraft) as MessageDraft
          setState(prev => ({
            ...prev,
            content: draft.content,
            attachments: draft.attachments || [],
            draft,
            isDirty: true
          }))
          return draft
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error)
    }
    return null
  }, [])

  const clearDraft = useCallback(() => {
    setState(prev => ({
      ...prev,
      draft: null,
      isDirty: false
    }))

    if (typeof window !== 'undefined') {
      localStorage.removeItem('message-draft')
    }
  }, [])

  const generateSuggestions = useCallback((content: string) => {
    const suggestions: AutoCompleteSuggestion[] = []

    // Command suggestions
    if (content.startsWith('/')) {
      const commands = [
        { text: 'help', description: 'Mostrar ajuda' },
        { text: 'clear', description: 'Limpar conversa' },
        { text: 'export', description: 'Exportar conversa' },
        { text: 'settings', description: 'Configurações' }
      ]
      
      const query = content.slice(1).toLowerCase()
      suggestions.push(...commands
        .filter(cmd => cmd.text.startsWith(query))
        .map(cmd => ({
          text: cmd.text,
          type: 'command' as const,
          description: cmd.description
        }))
      )
    }

    // Module suggestions
    if (content.includes('#')) {
      const modules = [
        { text: 'professor', description: 'Módulo Professor' },
        { text: 'ti', description: 'Módulo TI' },
        { text: 'rh', description: 'Módulo RH' },
        { text: 'financeiro', description: 'Módulo Financeiro' }
      ]
      
      suggestions.push(...modules.map(module => ({
        text: module.text,
        type: 'module' as const,
        description: module.description
      })))
    }

    // Emoji suggestions
    if (config.enableEmojiSuggestions && content.includes(':')) {
      const emojis = [
        { text: '😊', description: 'Sorriso' },
        { text: '👍', description: 'Curtir' },
        { text: '❤️', description: 'Coração' },
        { text: '🎉', description: 'Celebração' }
      ]
      
      suggestions.push(...emojis.map(emoji => ({
        text: emoji.text,
        type: 'emoji' as const,
        description: emoji.description
      })))
    }

    setState(prev => ({
      ...prev,
      suggestions: suggestions.slice(0, 5)
    }))
  }, [config.enableEmojiSuggestions])

  const handleKeyboardShortcuts = useCallback((event: KeyboardEvent) => {
    if (!config.enableKeyboardShortcuts) return

    const { ctrlKey, metaKey, key } = event
    const isModifier = ctrlKey || metaKey

    if (isModifier && key === 'Enter') {
      event.preventDefault()
      sendMessage()
    } else if (isModifier && key === 'k') {
      event.preventDefault()
      clearDraft()
    } else if (isModifier && key === 's') {
      event.preventDefault()
      saveDraft(state.content)
    }
  }, [config.enableKeyboardShortcuts, sendMessage, clearDraft, saveDraft, state.content])

  // Keyboard shortcuts
  useEffect(() => {
    if (config.enableKeyboardShortcuts) {
      document.addEventListener('keydown', handleKeyboardShortcuts)
      return () => document.removeEventListener('keydown', handleKeyboardShortcuts)
    }
  }, [config.enableKeyboardShortcuts, handleKeyboardShortcuts])

  // Load draft on mount
  useEffect(() => {
    if (config.enableDraftSaving) {
      loadDraft()
    }
  }, [config.enableDraftSaving, loadDraft])

  // Cleanup
  useEffect(() => {
    return () => {
      if (draftTimeoutRef.current) {
        clearTimeout(draftTimeoutRef.current)
      }
      if (voiceRecognitionRef.current) {
        voiceRecognitionRef.current.stop()
      }
    }
  }, [])

  return {
    // State
    ...state,
    
    // Actions
    updateContent,
    insertText,
    insertSuggestion,
    addAttachment,
    removeAttachment,
    startVoiceRecording,
    stopVoiceRecording,
    sendMessage,
    saveDraft,
    loadDraft,
    clearDraft,
    
    // Utilities
    textareaRef,
    canSend: state.content.trim().length > 0 && !state.isUploading,
    hasAttachments: state.attachments.length > 0,
    isOverLimit: state.content.length > config.maxMessageLength,
    remainingChars: config.maxMessageLength - state.content.length
  }
}



