"use client"

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react'
import { ModuleType, Message as ChatMessageType, Conversation as ChatConversation } from '@/types'

// Types
export interface ChatSettings {
  theme: 'light' | 'dark' | 'auto'
  fontSize: 'small' | 'medium' | 'large'
  autoScroll: boolean
  showTimestamps: boolean
  enableNotifications: boolean
  enableVoiceInput: boolean
  enableFileUpload: boolean
  maxMessageLength: number
  streamingSpeed: 'slow' | 'normal' | 'fast'
}

export interface AIModel {
  id: string
  name: string
  provider: string
  tier: 'IA' | 'IA_SUPER' | 'IA_ECO'
  capabilities: string[]
  maxTokens: number
  costPerToken: number
  latency: number
  isAvailable: boolean
}

export interface Module {
  id: string
  name: string
  description: string
  icon: string
  color: string
  keywords: string[]
  aiPrompt: string
  models: AIModel[]
  settings: ModuleSettings
}

export interface ModuleSettings {
  autoClassification: boolean
  preferredModel: string
  customPrompt: string
  enableWebSearch: boolean
  enableImageGeneration: boolean
  maxResponseLength: number
}

export interface ChatState {
  conversations: ChatConversation[]
  activeConversation: string | null
  isStreaming: boolean
  selectedModule: ModuleType | null
  settings: ChatSettings
  availableModels: AIModel[]
  availableModules: Module[]
  lastClassification: {
    module: string
    confidence: number
    rationale: string
  } | null
  streamingQueue: string[]
  error: string | null
  isLoading: boolean
}

// Action Types
type ChatAction =
  | { type: 'SET_CONVERSATIONS'; payload: ChatConversation[] }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: string | null }
  | { type: 'SET_STREAMING'; payload: boolean }
  | { type: 'SET_SELECTED_MODULE'; payload: ModuleType | null }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<ChatSettings> }
  | { type: 'SET_AVAILABLE_MODELS'; payload: AIModel[] }
  | { type: 'SET_AVAILABLE_MODULES'; payload: Module[] }
  | { type: 'SET_LAST_CLASSIFICATION'; payload: { module: string; confidence: number; rationale: string } | null }
  | { type: 'ADD_TO_STREAMING_QUEUE'; payload: string }
  | { type: 'REMOVE_FROM_STREAMING_QUEUE'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: ChatMessageType } }
  | { type: 'UPDATE_MESSAGE'; payload: { conversationId: string; messageId: string; updates: Partial<ChatMessageType> } }
  | { type: 'CLEAR_CONVERSATION'; payload: string }

// Initial State
const initialState: ChatState = {
  conversations: [],
  activeConversation: null,
  isStreaming: false,
  selectedModule: null,
  settings: {
    theme: 'auto',
    fontSize: 'medium',
    autoScroll: true,
    showTimestamps: true,
    enableNotifications: true,
    enableVoiceInput: false,
    enableFileUpload: true,
    maxMessageLength: 4000,
    streamingSpeed: 'normal'
  },
  availableModels: [],
  availableModules: [],
  lastClassification: null,
  streamingQueue: [],
  error: null,
  isLoading: false
}

// Reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload }
    
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversation: action.payload }
    
    case 'SET_STREAMING':
      return { ...state, isStreaming: action.payload }
    
    case 'SET_SELECTED_MODULE':
      return { ...state, selectedModule: action.payload }
    
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }
    
    case 'SET_AVAILABLE_MODELS':
      return { ...state, availableModels: action.payload }
    
    case 'SET_AVAILABLE_MODULES':
      return { ...state, availableModules: action.payload }
    
    case 'SET_LAST_CLASSIFICATION':
      return { ...state, lastClassification: action.payload }
    
    case 'ADD_TO_STREAMING_QUEUE':
      return { ...state, streamingQueue: [...state.streamingQueue, action.payload] }
    
    case 'REMOVE_FROM_STREAMING_QUEUE':
      return { ...state, streamingQueue: state.streamingQueue.filter(id => id !== action.payload) }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.conversationId
            ? { ...conv, messages: [...conv.messages, action.payload.message] }
            : conv
        )
      }
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.conversationId
            ? {
                ...conv,
                messages: conv.messages.map(msg =>
                  msg.id === action.payload.messageId
                    ? { ...msg, ...action.payload.updates }
                    : msg
                )
              }
            : conv
        )
      }
    
    case 'CLEAR_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload
            ? { ...conv, messages: [] }
            : conv
        )
      }
    
    default:
      return state
  }
}

// Context
interface ChatContextType {
  state: ChatState
  dispatch: React.Dispatch<ChatAction>
  
  // Computed values
  currentConversation: ChatConversation | null
  currentMessages: ChatMessageType[]
  hasActiveConversation: boolean
  
  // Actions
  setActiveConversation: (id: string | null) => void
  setStreaming: (streaming: boolean) => void
  setSelectedModule: (module: ModuleType | null) => void
  updateSettings: (settings: Partial<ChatSettings>) => void
  addMessage: (conversationId: string, message: ChatMessageType) => void
  updateMessage: (conversationId: string, messageId: string, updates: Partial<ChatMessageType>) => void
  clearConversation: (conversationId: string) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  
  // Module operations
  getModuleById: (id: string) => Module | null
  getModelById: (id: string) => AIModel | null
  getPreferredModel: (moduleId: string) => AIModel | null
  
  // Classification
  setLastClassification: (classification: { module: string; confidence: number; rationale: string } | null) => void
  
  // Streaming queue
  addToStreamingQueue: (id: string) => void
  removeFromStreamingQueue: (id: string) => void
  isInStreamingQueue: (id: string) => boolean
}

const ChatContext = createContext<ChatContextType | null>(null)

// Provider Component
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  // Computed values
  const currentConversation = useMemo(() => {
    return state.conversations.find(conv => conv.id === state.activeConversation) || null
  }, [state.conversations, state.activeConversation])

  const currentMessages = useMemo(() => {
    return currentConversation?.messages || []
  }, [currentConversation])

  const hasActiveConversation = useMemo(() => {
    return !!state.activeConversation && !!currentConversation
  }, [state.activeConversation, currentConversation])

  // Actions
  const setActiveConversation = useCallback((id: string | null) => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: id })
  }, [])

  const setStreaming = useCallback((streaming: boolean) => {
    dispatch({ type: 'SET_STREAMING', payload: streaming })
  }, [])

  const setSelectedModule = useCallback((module: ModuleType | null) => {
    dispatch({ type: 'SET_SELECTED_MODULE', payload: module })
  }, [])

  const updateSettings = useCallback((settings: Partial<ChatSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings })
  }, [])

  const addMessage = useCallback((conversationId: string, message: ChatMessageType) => {
    dispatch({ type: 'ADD_MESSAGE', payload: { conversationId, message } })
  }, [])

  const updateMessage = useCallback((conversationId: string, messageId: string, updates: Partial<ChatMessageType>) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { conversationId, messageId, updates } })
  }, [])

  const clearConversation = useCallback((conversationId: string) => {
    dispatch({ type: 'CLEAR_CONVERSATION', payload: conversationId })
  }, [])

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }, [])

  // Module operations
  const getModuleById = useCallback((id: string) => {
    return state.availableModules.find(module => module.id === id) || null
  }, [state.availableModules])

  const getModelById = useCallback((id: string) => {
    return state.availableModels.find(model => model.id === id) || null
  }, [state.availableModels])

  const getPreferredModel = useCallback((moduleId: string) => {
    const module = getModuleById(moduleId)
    if (!module) return null
    
    const preferredModelId = module.settings.preferredModel
    return getModelById(preferredModelId) || state.availableModels[0] || null
  }, [getModuleById, getModelById, state.availableModels])

  // Classification
  const setLastClassification = useCallback((classification: { module: string; confidence: number; rationale: string } | null) => {
    dispatch({ type: 'SET_LAST_CLASSIFICATION', payload: classification })
  }, [])

  // Streaming queue
  const addToStreamingQueue = useCallback((id: string) => {
    dispatch({ type: 'ADD_TO_STREAMING_QUEUE', payload: id })
  }, [])

  const removeFromStreamingQueue = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_FROM_STREAMING_QUEUE', payload: id })
  }, [])

  const isInStreamingQueue = useCallback((id: string) => {
    return state.streamingQueue.includes(id)
  }, [state.streamingQueue])

  const contextValue: ChatContextType = {
    state,
    dispatch,
    currentConversation,
    currentMessages,
    hasActiveConversation,
    setActiveConversation,
    setStreaming,
    setSelectedModule,
    updateSettings,
    addMessage,
    updateMessage,
    clearConversation,
    setError,
    setLoading,
    getModuleById,
    getModelById,
    getPreferredModel,
    setLastClassification,
    addToStreamingQueue,
    removeFromStreamingQueue,
    isInStreamingQueue
  }

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  )
}

// Hook
export function useChatContext() {
  // Handle prerendering - return empty context
  if (typeof window === 'undefined') {
    return {
      state: initialState,
      dispatch: () => {},
      currentConversation: null,
      currentMessages: [],
      hasActiveConversation: false,
      setActiveConversation: () => {},
      setStreaming: () => {},
      setSelectedModule: () => {},
      updateSettings: () => {},
      addMessage: () => {},
      updateMessage: () => {},
      clearConversation: () => {},
      setError: () => {},
      setLoading: () => {},
      getModuleById: () => null,
      getModelById: () => null,
      getPreferredModel: () => null,
      setLastClassification: () => {},
      addToStreamingQueue: () => {},
      removeFromStreamingQueue: () => {},
      isInStreamingQueue: () => false
    }
  }

  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}

// Selector hooks for performance optimization
export function useChatState() {
  // Handle prerendering
  if (typeof window === 'undefined') {
    return initialState
  }
  const { state } = useChatContext()
  return state
}

export function useChatActions() {
  // Handle prerendering
  if (typeof window === 'undefined') {
    return {
      setActiveConversation: () => {},
      setStreaming: () => {},
      setSelectedModule: () => {},
      updateSettings: () => {},
      addMessage: () => {},
      updateMessage: () => {},
      clearConversation: () => {},
      setError: () => {},
      setLoading: () => {},
      setLastClassification: () => {},
      addToStreamingQueue: () => {},
      removeFromStreamingQueue: () => {}
    }
  }
  
  const {
    setActiveConversation,
    setStreaming,
    setSelectedModule,
    updateSettings,
    addMessage,
    updateMessage,
    clearConversation,
    setError,
    setLoading,
    setLastClassification,
    addToStreamingQueue,
    removeFromStreamingQueue
  } = useChatContext()
  
  return {
    setActiveConversation,
    setStreaming,
    setSelectedModule,
    updateSettings,
    addMessage,
    updateMessage,
    clearConversation,
    setError,
    setLoading,
    setLastClassification,
    addToStreamingQueue,
    removeFromStreamingQueue
  }
}

export function useCurrentConversation() {
  // Handle prerendering
  if (typeof window === 'undefined') {
    return { currentConversation: null, currentMessages: [], hasActiveConversation: false }
  }
  const { currentConversation, currentMessages, hasActiveConversation } = useChatContext()
  return { currentConversation, currentMessages, hasActiveConversation }
}

export function useChatSettings() {
  // Handle prerendering
  if (typeof window === 'undefined') {
    return { settings: initialState.settings, updateSettings: () => {} }
  }
  const { state, updateSettings } = useChatContext()
  return { settings: state.settings, updateSettings }
}

export function useAvailableModules() {
  // Handle prerendering
  if (typeof window === 'undefined') {
    return { modules: [], getModuleById: () => null, getPreferredModel: () => null }
  }
  const { state, getModuleById, getPreferredModel } = useChatContext()
  return { 
    modules: state.availableModules, 
    getModuleById, 
    getPreferredModel 
  }
}

export function useAvailableModels() {
  // Handle prerendering
  if (typeof window === 'undefined') {
    return { models: [], getModelById: () => null }
  }
  const { state, getModelById } = useChatContext()
  return { models: state.availableModels, getModelById }
}



