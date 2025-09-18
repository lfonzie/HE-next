'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { EnemMode, EnemArea } from '@/types/enem'

// Configuration Interface
interface EnemConfig {
  mode: EnemMode
  areas: EnemArea[]
  numQuestions: number
  timeLimit?: number
  difficultyDistribution?: {
    easy: number
    medium: number
    hard: number
  }
  year?: number
  showKeyboardShortcuts?: boolean
  autoSave?: boolean
  allowReview?: boolean
  theme?: 'light' | 'dark' | 'auto'
  fontSize?: 'small' | 'medium' | 'large'
  contrast?: 'normal' | 'high'
  focusMode?: boolean
  soundEffects?: boolean
  notifications?: boolean
}

// User Preferences Interface
interface UserPreferences {
  defaultMode: EnemMode
  defaultAreas: EnemArea[]
  defaultNumQuestions: number
  defaultTimeLimit?: number
  preferredTheme: 'light' | 'dark' | 'auto'
  preferredFontSize: 'small' | 'medium' | 'large'
  preferredContrast: 'normal' | 'high'
  enableFocusMode: boolean
  enableSoundEffects: boolean
  enableNotifications: boolean
  enableKeyboardShortcuts: boolean
  enableAutoSave: boolean
  enableReview: boolean
}

// Context Interface
interface EnemConfigContextType {
  // Current Configuration
  config: EnemConfig
  
  // User Preferences
  preferences: UserPreferences
  
  // Actions
  updateConfig: (updates: Partial<EnemConfig>) => void
  updatePreferences: (updates: Partial<UserPreferences>) => void
  resetConfig: () => void
  resetPreferences: () => void
  savePreferences: () => Promise<void>
  loadPreferences: () => Promise<void>
  
  // Presets
  applyPreset: (preset: 'quick' | 'custom' | 'official' | 'adaptive') => void
  getPresetConfig: (preset: string) => EnemConfig
  
  // Validation
  validateConfig: (config: EnemConfig) => { isValid: boolean; errors: string[] }
}

// Default Configuration
const defaultConfig: EnemConfig = {
  mode: 'QUICK',
  areas: ['CN', 'CH', 'LC', 'MT'],
  numQuestions: 45,
  timeLimit: 270, // 4.5 hours
  difficultyDistribution: {
    easy: 0.3,
    medium: 0.5,
    hard: 0.2
  },
  showKeyboardShortcuts: true,
  autoSave: true,
  allowReview: true,
  theme: 'auto',
  fontSize: 'medium',
  contrast: 'normal',
  focusMode: false,
  soundEffects: false,
  notifications: true
}

// Default Preferences
const defaultPreferences: UserPreferences = {
  defaultMode: 'QUICK',
  defaultAreas: ['CN', 'CH', 'LC', 'MT'],
  defaultNumQuestions: 45,
  defaultTimeLimit: 270,
  preferredTheme: 'auto',
  preferredFontSize: 'medium',
  preferredContrast: 'normal',
  enableFocusMode: false,
  enableSoundEffects: false,
  enableNotifications: true,
  enableKeyboardShortcuts: true,
  enableAutoSave: true,
  enableReview: true
}

// Preset Configurations
const presetConfigs: Record<string, EnemConfig> = {
  quick: {
    ...defaultConfig,
    mode: 'QUICK',
    numQuestions: 20,
    timeLimit: 60,
    areas: ['CN', 'CH', 'LC', 'MT']
  },
  custom: {
    ...defaultConfig,
    mode: 'CUSTOM',
    numQuestions: 45,
    timeLimit: 270,
    areas: ['CN', 'CH', 'LC', 'MT']
  },
  official: {
    ...defaultConfig,
    mode: 'OFFICIAL',
    numQuestions: 180,
    timeLimit: 330, // 5.5 hours
    areas: ['CN', 'CH', 'LC', 'MT'],
    difficultyDistribution: {
      easy: 0.25,
      medium: 0.5,
      hard: 0.25
    }
  },
  adaptive: {
    ...defaultConfig,
    mode: 'ADAPTIVE',
    numQuestions: 45,
    timeLimit: 270,
    areas: ['CN', 'CH', 'LC', 'MT']
  }
}

// Context
const EnemConfigContext = createContext<EnemConfigContextType | null>(null)

// Provider Component
export function EnemConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<EnemConfig>(defaultConfig)
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)

  // Load preferences from localStorage on mount
  useEffect(() => {
    loadPreferences()
  }, [])

  // Actions
  const updateConfig = useCallback((updates: Partial<EnemConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }, [])

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }, [])

  const resetConfig = useCallback(() => {
    setConfig(defaultConfig)
  }, [])

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences)
  }, [])

  const savePreferences = useCallback(async () => {
    try {
      localStorage.setItem('enem-preferences', JSON.stringify(preferences))
    } catch (error) {
      console.error('Failed to save preferences:', error)
    }
  }, [preferences])

  const loadPreferences = useCallback(async () => {
    try {
      const saved = localStorage.getItem('enem-preferences')
      if (saved) {
        const parsed = JSON.parse(saved)
        setPreferences({ ...defaultPreferences, ...parsed })
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
    }
  }, [])

  const applyPreset = useCallback((preset: 'quick' | 'custom' | 'official' | 'adaptive') => {
    const presetConfig = presetConfigs[preset]
    if (presetConfig) {
      setConfig(presetConfig)
    }
  }, [])

  const getPresetConfig = useCallback((preset: string): EnemConfig => {
    return presetConfigs[preset] || defaultConfig
  }, [])

  const validateConfig = useCallback((config: EnemConfig): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!config.areas || config.areas.length === 0) {
      errors.push('Pelo menos uma área deve ser selecionada')
    }

    if (config.numQuestions < 1 || config.numQuestions > 180) {
      errors.push('Número de questões deve estar entre 1 e 180')
    }

    if (config.timeLimit && (config.timeLimit < 1 || config.timeLimit > 600)) {
      errors.push('Tempo limite deve estar entre 1 e 600 minutos')
    }

    if (config.difficultyDistribution) {
      const { easy, medium, hard } = config.difficultyDistribution
      const total = easy + medium + hard
      if (Math.abs(total - 1) > 0.01) {
        errors.push('Distribuição de dificuldade deve somar 100%')
      }
    }

    if (config.year && (config.year < 2009 || config.year > new Date().getFullYear())) {
      errors.push('Ano deve estar entre 2009 e o ano atual')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }, [])

  // Auto-save preferences when they change
  useEffect(() => {
    savePreferences()
  }, [preferences, savePreferences])

  // Apply theme to document
  useEffect(() => {
    const theme = config.theme === 'auto' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : config.theme

    document.documentElement.setAttribute('data-theme', theme)
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [config.theme])

  // Apply font size to document
  useEffect(() => {
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    }
    
    document.documentElement.style.fontSize = fontSizeMap[config.fontSize || 'medium']
  }, [config.fontSize])

  // Apply contrast to document
  useEffect(() => {
    if (config.contrast === 'high') {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [config.contrast])

  const contextValue: EnemConfigContextType = {
    config,
    preferences,
    updateConfig,
    updatePreferences,
    resetConfig,
    resetPreferences,
    savePreferences,
    loadPreferences,
    applyPreset,
    getPresetConfig,
    validateConfig
  }

  return (
    <EnemConfigContext.Provider value={contextValue}>
      {children}
    </EnemConfigContext.Provider>
  )
}

// Hook
export function useEnemConfig() {
  const context = useContext(EnemConfigContext)
  if (!context) {
    throw new Error('useEnemConfig must be used within an EnemConfigProvider')
  }
  return context
}

