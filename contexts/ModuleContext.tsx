"use client"

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react'
import { ModuleType } from '@/types'

// Types
export interface ModulePlugin {
  id: string
  name: string
  description: string
  icon: string
  color: string
  keywords: string[]
  aiPrompt: string
  component: React.ComponentType<any>
  models: string[]
  settings: ModuleSettings
  isEnabled: boolean
  priority: number
  category: string
  version: string
  author: string
  dependencies: string[]
}

export interface ModuleSettings {
  autoClassification: boolean
  preferredModel: string
  customPrompt: string
  enableWebSearch: boolean
  enableImageGeneration: boolean
  maxResponseLength: number
  enableNotifications: boolean
  enableAnalytics: boolean
  customKeywords: string[]
  responseStyle: 'formal' | 'casual' | 'technical' | 'creative'
  language: string
  timezone: string
}

export interface ContextClassifier {
  classifyIntent: (message: string, history: any[]) => Promise<{
    module: string
    confidence: number
    reasoning: string
    suggestedModels: string[]
  }>
  adaptToUserBehavior: (userId: string, interactions: any[]) => Promise<UserProfile>
}

export interface UserProfile {
  userId: string
  preferredModules: string[]
  moduleUsage: Record<string, number>
  interactionPatterns: string[]
  customSettings: Record<string, any>
  lastUpdated: number
}

export interface ModuleState {
  availableModules: ModulePlugin[]
  activeModule: string | null
  moduleHistory: string[]
  userProfiles: Map<string, UserProfile>
  classificationCache: Map<string, any>
  moduleMetrics: Record<string, {
    usageCount: number
    successRate: number
    averageResponseTime: number
    userSatisfaction: number
    lastUsed: number
  }>
  isLoading: boolean
  error: string | null
}

// Action Types
type ModuleAction =
  | { type: 'SET_AVAILABLE_MODULES'; payload: ModulePlugin[] }
  | { type: 'SET_ACTIVE_MODULE'; payload: string | null }
  | { type: 'ADD_TO_HISTORY'; payload: string }
  | { type: 'SET_USER_PROFILE'; payload: { userId: string; profile: UserProfile } }
  | { type: 'UPDATE_MODULE_METRICS'; payload: { moduleId: string; metrics: Partial<ModuleState['moduleMetrics'][string]> } }
  | { type: 'SET_CLASSIFICATION_CACHE'; payload: { key: string; value: any } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ENABLE_MODULE'; payload: string }
  | { type: 'DISABLE_MODULE'; payload: string }
  | { type: 'UPDATE_MODULE_SETTINGS'; payload: { moduleId: string; settings: Partial<ModuleSettings> } }

// Initial State
const initialState: ModuleState = {
  availableModules: [],
  activeModule: null,
  moduleHistory: [],
  userProfiles: new Map(),
  classificationCache: new Map(),
  moduleMetrics: {},
  isLoading: false,
  error: null
}

// Reducer
function moduleReducer(state: ModuleState, action: ModuleAction): ModuleState {
  switch (action.type) {
    case 'SET_AVAILABLE_MODULES':
      return { ...state, availableModules: action.payload }
    
    case 'SET_ACTIVE_MODULE':
      return { ...state, activeModule: action.payload }
    
    case 'ADD_TO_HISTORY': {
      const newHistory = [action.payload, ...state.moduleHistory.filter(id => id !== action.payload)].slice(0, 10)
      return { ...state, moduleHistory: newHistory }
    }
    
    case 'SET_USER_PROFILE': {
      const newProfiles = new Map(state.userProfiles)
      newProfiles.set(action.payload.userId, action.payload.profile)
      return { ...state, userProfiles: newProfiles }
    }
    
    case 'UPDATE_MODULE_METRICS': {
      const currentMetrics = state.moduleMetrics[action.payload.moduleId] || {
        usageCount: 0,
        successRate: 0,
        averageResponseTime: 0,
        userSatisfaction: 0,
        lastUsed: Date.now()
      }
      
      return {
        ...state,
        moduleMetrics: {
          ...state.moduleMetrics,
          [action.payload.moduleId]: {
            ...currentMetrics,
            ...action.payload.metrics,
            lastUsed: Date.now()
          }
        }
      }
    }
    
    case 'SET_CLASSIFICATION_CACHE': {
      const newCache = new Map(state.classificationCache)
      newCache.set(action.payload.key, action.payload.value)
      return { ...state, classificationCache: newCache }
    }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'ENABLE_MODULE':
      return {
        ...state,
        availableModules: state.availableModules.map(module =>
          module.id === action.payload ? { ...module, isEnabled: true } : module
        )
      }
    
    case 'DISABLE_MODULE':
      return {
        ...state,
        availableModules: state.availableModules.map(module =>
          module.id === action.payload ? { ...module, isEnabled: false } : module
        )
      }
    
    case 'UPDATE_MODULE_SETTINGS':
      return {
        ...state,
        availableModules: state.availableModules.map(module =>
          module.id === action.payload.moduleId
            ? { ...module, settings: { ...module.settings, ...action.payload.settings } }
            : module
        )
      }
    
    default:
      return state
  }
}

// Context
interface ModuleContextType {
  state: ModuleState
  dispatch: React.Dispatch<ModuleAction>
  
  // Computed values
  enabledModules: ModulePlugin[]
  activeModulePlugin: ModulePlugin | null
  recentModules: ModulePlugin[]
  
  // Actions
  setActiveModule: (moduleId: string | null) => void
  addToHistory: (moduleId: string) => void
  setUserProfile: (userId: string, profile: UserProfile) => void
  updateModuleMetrics: (moduleId: string, metrics: Partial<ModuleState['moduleMetrics'][string]>) => void
  setClassificationCache: (key: string, value: any) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  enableModule: (moduleId: string) => void
  disableModule: (moduleId: string) => void
  updateModuleSettings: (moduleId: string, settings: Partial<ModuleSettings>) => void
  
  // Module operations
  getModuleById: (id: string) => ModulePlugin | null
  getModuleByType: (type: ModuleType) => ModulePlugin | null
  getEnabledModules: () => ModulePlugin[]
  getModulesByCategory: (category: string) => ModulePlugin[]
  getModuleMetrics: (moduleId: string) => ModuleState['moduleMetrics'][string] | null
  
  // Classification
  classifyMessage: (message: string, history: any[], userId?: string) => Promise<{
    module: string
    confidence: number
    reasoning: string
    suggestedModels: string[]
  }>
  
  // User profile operations
  getUserProfile: (userId: string) => UserProfile | null
  updateUserPreferences: (userId: string, preferences: Partial<UserProfile>) => void
  
  // Module registry operations
  registerModule: (module: ModulePlugin) => void
  unregisterModule: (moduleId: string) => void
  findBestModule: (context: any) => ModulePlugin | null
}

const ModuleContext = createContext<ModuleContextType | null>(null)

// Provider Component
export function ModuleProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(moduleReducer, initialState)

  // Computed values
  const enabledModules = useMemo(() => {
    return state.availableModules.filter(module => module.isEnabled)
  }, [state.availableModules])

  const activeModulePlugin = useMemo(() => {
    return state.activeModule ? state.availableModules.find(m => m.id === state.activeModule) || null : null
  }, [state.activeModule, state.availableModules])

  const recentModules = useMemo(() => {
    return state.moduleHistory
      .map(id => state.availableModules.find(m => m.id === id))
      .filter(Boolean) as ModulePlugin[]
  }, [state.moduleHistory, state.availableModules])

  // Actions
  const setActiveModule = useCallback((moduleId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_MODULE', payload: moduleId })
    if (moduleId) {
      dispatch({ type: 'ADD_TO_HISTORY', payload: moduleId })
    }
  }, [])

  const addToHistory = useCallback((moduleId: string) => {
    dispatch({ type: 'ADD_TO_HISTORY', payload: moduleId })
  }, [])

  const setUserProfile = useCallback((userId: string, profile: UserProfile) => {
    dispatch({ type: 'SET_USER_PROFILE', payload: { userId, profile } })
  }, [])

  const updateModuleMetrics = useCallback((moduleId: string, metrics: Partial<ModuleState['moduleMetrics'][string]>) => {
    dispatch({ type: 'UPDATE_MODULE_METRICS', payload: { moduleId, metrics } })
  }, [])

  const setClassificationCache = useCallback((key: string, value: any) => {
    dispatch({ type: 'SET_CLASSIFICATION_CACHE', payload: { key, value } })
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }, [])

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }, [])

  const enableModule = useCallback((moduleId: string) => {
    dispatch({ type: 'ENABLE_MODULE', payload: moduleId })
  }, [])

  const disableModule = useCallback((moduleId: string) => {
    dispatch({ type: 'DISABLE_MODULE', payload: moduleId })
  }, [])

  const updateModuleSettings = useCallback((moduleId: string, settings: Partial<ModuleSettings>) => {
    dispatch({ type: 'UPDATE_MODULE_SETTINGS', payload: { moduleId, settings } })
  }, [])

  // Module operations
  const getModuleById = useCallback((id: string) => {
    return state.availableModules.find(module => module.id === id) || null
  }, [state.availableModules])

  const getModuleByType = useCallback((type: ModuleType) => {
    return state.availableModules.find(module => module.id === type) || null
  }, [state.availableModules])

  const getEnabledModules = useCallback(() => {
    return state.availableModules.filter(module => module.isEnabled)
  }, [state.availableModules])

  const getModulesByCategory = useCallback((category: string) => {
    return state.availableModules.filter(module => module.category === category)
  }, [state.availableModules])

  const getModuleMetrics = useCallback((moduleId: string) => {
    return state.moduleMetrics[moduleId] || null
  }, [state.moduleMetrics])

  // Classification
  const classifyMessage = useCallback(async (message: string, history: any[], userId?: string) => {
    const cacheKey = `${message}-${history.length}-${userId || 'anonymous'}`
    
    // Check cache first
    const cached = state.classificationCache.get(cacheKey)
    if (cached) {
      return cached
    }

    try {
      setLoading(true)
      
      // Call AI classification API
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history,
          userId,
          availableModules: enabledModules.map(m => ({
            id: m.id,
            keywords: m.keywords,
            description: m.description
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Classification failed')
      }

      const result = await response.json()
      
      // Cache the result
      setClassificationCache(cacheKey, result)
      
      return result
    } catch (error) {
      console.error('Classification error:', error)
      setError(error instanceof Error ? error.message : 'Classification failed')
      
      // Fallback to simple keyword matching
      const fallbackResult = {
        module: 'atendimento',
        confidence: 0.5,
        reasoning: 'Fallback classification due to error',
        suggestedModels: ['gpt-3.5-turbo']
      }
      
      setClassificationCache(cacheKey, fallbackResult)
      return fallbackResult
    } finally {
      setLoading(false)
    }
  }, [state.classificationCache, enabledModules, setLoading, setError, setClassificationCache])

  // User profile operations
  const getUserProfile = useCallback((userId: string) => {
    return state.userProfiles.get(userId) || null
  }, [state.userProfiles])

  const updateUserPreferences = useCallback((userId: string, preferences: Partial<UserProfile>) => {
    const currentProfile = getUserProfile(userId) || {
      userId,
      preferredModules: [],
      moduleUsage: {},
      interactionPatterns: [],
      customSettings: {},
      lastUpdated: Date.now()
    }
    
    const updatedProfile = {
      ...currentProfile,
      ...preferences,
      lastUpdated: Date.now()
    }
    
    setUserProfile(userId, updatedProfile)
  }, [getUserProfile, setUserProfile])

  // Module registry operations
  const registerModule = useCallback((module: ModulePlugin) => {
    const existingModules = state.availableModules.filter(m => m.id !== module.id)
    dispatch({ type: 'SET_AVAILABLE_MODULES', payload: [...existingModules, module] })
  }, [state.availableModules])

  const unregisterModule = useCallback((moduleId: string) => {
    const updatedModules = state.availableModules.filter(m => m.id !== moduleId)
    dispatch({ type: 'SET_AVAILABLE_MODULES', payload: updatedModules })
  }, [state.availableModules])

  const findBestModule = useCallback((context: any) => {
    // Simple implementation - can be enhanced with ML
    const { message, history, userId } = context
    
    // Check user preferences first
    if (userId) {
      const userProfile = getUserProfile(userId)
      if (userProfile?.preferredModules.length) {
        const preferredModule = getModuleById(userProfile.preferredModules[0])
        if (preferredModule) return preferredModule
      }
    }
    
    // Fallback to keyword matching
    const messageLower = message.toLowerCase()
    for (const module of enabledModules) {
      if (module.keywords.some(keyword => messageLower.includes(keyword.toLowerCase()))) {
        return module
      }
    }
    
    // Default fallback
    return getModuleById('atendimento')
  }, [enabledModules, getUserProfile, getModuleById])

  const contextValue: ModuleContextType = {
    state,
    dispatch,
    enabledModules,
    activeModulePlugin,
    recentModules,
    setActiveModule,
    addToHistory,
    setUserProfile,
    updateModuleMetrics,
    setClassificationCache,
    setLoading,
    setError,
    enableModule,
    disableModule,
    updateModuleSettings,
    getModuleById,
    getModuleByType,
    getEnabledModules,
    getModulesByCategory,
    getModuleMetrics,
    classifyMessage,
    getUserProfile,
    updateUserPreferences,
    registerModule,
    unregisterModule,
    findBestModule
  }

  return (
    <ModuleContext.Provider value={contextValue}>
      {children}
    </ModuleContext.Provider>
  )
}

// Hook
export function useModuleContext() {
  const context = useContext(ModuleContext)
  if (!context) {
    throw new Error('useModuleContext must be used within a ModuleProvider')
  }
  return context
}

// Selector hooks
export function useModuleState() {
  const { state } = useModuleContext()
  return state
}

export function useModuleActions() {
  const {
    setActiveModule,
    addToHistory,
    setUserProfile,
    updateModuleMetrics,
    setClassificationCache,
    setLoading,
    setError,
    enableModule,
    disableModule,
    updateModuleSettings
  } = useModuleContext()
  
  return {
    setActiveModule,
    addToHistory,
    setUserProfile,
    updateModuleMetrics,
    setClassificationCache,
    setLoading,
    setError,
    enableModule,
    disableModule,
    updateModuleSettings
  }
}

export function useActiveModule() {
  const { activeModulePlugin, setActiveModule } = useModuleContext()
  return { activeModule: activeModulePlugin, setActiveModule }
}

export function useModuleClassification() {
  const { classifyMessage, state } = useModuleContext()
  return { classifyMessage, isLoading: state.isLoading, error: state.error }
}

export function useUserProfile(userId: string) {
  const { getUserProfile, updateUserPreferences } = useModuleContext()
  return {
    profile: getUserProfile(userId),
    updatePreferences: (preferences: Partial<UserProfile>) => updateUserPreferences(userId, preferences)
  }
}



