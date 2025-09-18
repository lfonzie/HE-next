'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

// Privacy Settings Interface
interface PrivacySettings {
  dataCollection: boolean
  analytics: boolean
  personalization: boolean
  dataRetention: number // days
  anonymizeData: boolean
  allowCookies: boolean
  allowTracking: boolean
  shareProgress: boolean
  shareResults: boolean
  allowNotifications: boolean
  dataExport: boolean
  dataDeletion: boolean
}

// Data Categories Interface
interface DataCategories {
  personal: boolean
  behavioral: boolean
  performance: boolean
  technical: boolean
  location: boolean
  device: boolean
}

// Consent History Interface
interface ConsentRecord {
  id: string
  timestamp: Date
  category: string
  action: 'granted' | 'revoked' | 'modified'
  details: string
  version: string
}

// Context Interface
interface EnemPrivacyContextType {
  // State
  settings: PrivacySettings
  dataCategories: DataCategories
  consentHistory: ConsentRecord[]
  isCompliant: boolean
  lastUpdated: Date
  
  // Actions
  updateSettings: (updates: Partial<PrivacySettings>) => void
  updateDataCategories: (updates: Partial<DataCategories>) => void
  grantConsent: (category: string, details: string) => void
  revokeConsent: (category: string, details: string) => void
  exportData: () => Promise<string>
  deleteData: (category?: string) => Promise<void>
  resetToDefaults: () => void
  saveSettings: () => Promise<void>
  loadSettings: () => Promise<void>
  
  // Compliance
  checkCompliance: () => { compliant: boolean; issues: string[] }
  generatePrivacyReport: () => string
  
  // Utilities
  isDataAllowed: (category: string) => boolean
  getDataRetentionPeriod: () => number
  shouldAnonymize: () => boolean
}

// Default Privacy Settings (LGPD Compliant)
const defaultSettings: PrivacySettings = {
  dataCollection: true,
  analytics: true,
  personalization: true,
  dataRetention: 365, // 1 year
  anonymizeData: true,
  allowCookies: true,
  allowTracking: false,
  shareProgress: false,
  shareResults: false,
  allowNotifications: true,
  dataExport: true,
  dataDeletion: true
}

// Default Data Categories
const defaultDataCategories: DataCategories = {
  personal: true,
  behavioral: true,
  performance: true,
  technical: true,
  location: false,
  device: true
}

// Context
const EnemPrivacyContext = createContext<EnemPrivacyContextType | null>(null)

// Provider Component
export function EnemPrivacyProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings)
  const [dataCategories, setDataCategories] = useState<DataCategories>(defaultDataCategories)
  const [consentHistory, setConsentHistory] = useState<ConsentRecord[]>([])
  const [isCompliant, setIsCompliant] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Load settings from localStorage on mount
  useEffect(() => {
    loadSettings()
  }, [])

  // Check compliance whenever settings change
  useEffect(() => {
    const compliance = checkCompliance()
    setIsCompliant(compliance.compliant)
  }, [settings, dataCategories])

  // Actions
  const updateSettings = useCallback((updates: Partial<PrivacySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
    setLastUpdated(new Date())
  }, [])

  const updateDataCategories = useCallback((updates: Partial<DataCategories>) => {
    setDataCategories(prev => ({ ...prev, ...updates }))
    setLastUpdated(new Date())
  }, [])

  const grantConsent = useCallback((category: string, details: string) => {
    const record: ConsentRecord = {
      id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      category,
      action: 'granted',
      details,
      version: '1.0'
    }

    setConsentHistory(prev => [...prev, record])
    setLastUpdated(new Date())
  }, [])

  const revokeConsent = useCallback((category: string, details: string) => {
    const record: ConsentRecord = {
      id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      category,
      action: 'revoked',
      details,
      version: '1.0'
    }

    setConsentHistory(prev => [...prev, record])
    setLastUpdated(new Date())
  }, [])

  const exportData = useCallback(async (): Promise<string> => {
    if (!settings.dataExport) {
      throw new Error('Data export is disabled')
    }

    const exportData = {
      settings,
      dataCategories,
      consentHistory,
      lastUpdated,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }

    return JSON.stringify(exportData, null, 2)
  }, [settings, dataCategories, consentHistory, lastUpdated])

  const deleteData = useCallback(async (category?: string): Promise<void> => {
    if (!settings.dataDeletion) {
      throw new Error('Data deletion is disabled')
    }

    try {
      if (category) {
        // Delete specific category data
        const categoryData = localStorage.getItem(`enem-${category}-data`)
        if (categoryData) {
          localStorage.removeItem(`enem-${category}-data`)
        }
      } else {
        // Delete all ENEM-related data
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('enem-')) {
            localStorage.removeItem(key)
          }
        })
      }

      // Record deletion in consent history
      revokeConsent(category || 'all', 'Data deletion requested by user')
    } catch (error) {
      console.error('Error deleting data:', error)
      throw error
    }
  }, [settings.dataDeletion, revokeConsent])

  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings)
    setDataCategories(defaultDataCategories)
    setConsentHistory([])
    setLastUpdated(new Date())
  }, [])

  const saveSettings = useCallback(async () => {
    try {
      const data = {
        settings,
        dataCategories,
        consentHistory,
        lastUpdated
      }
      localStorage.setItem('enem-privacy-settings', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save privacy settings:', error)
    }
  }, [settings, dataCategories, consentHistory, lastUpdated])

  const loadSettings = useCallback(async () => {
    try {
      const saved = localStorage.getItem('enem-privacy-settings')
      if (saved) {
        const data = JSON.parse(saved)
        setSettings({ ...defaultSettings, ...data.settings })
        setDataCategories({ ...defaultDataCategories, ...data.dataCategories })
        setConsentHistory(data.consentHistory || [])
        setLastUpdated(data.lastUpdated ? new Date(data.lastUpdated) : new Date())
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error)
    }
  }, [])

  // Compliance
  const checkCompliance = useCallback((): { compliant: boolean; issues: string[] } => {
    const issues: string[] = []

    // LGPD Compliance Checks
    if (settings.dataCollection && !consentHistory.some(c => c.category === 'data_collection' && c.action === 'granted')) {
      issues.push('Data collection enabled without explicit consent')
    }

    if (settings.analytics && !consentHistory.some(c => c.category === 'analytics' && c.action === 'granted')) {
      issues.push('Analytics enabled without explicit consent')
    }

    if (settings.dataRetention > 730) { // 2 years
      issues.push('Data retention period exceeds recommended limit')
    }

    if (!settings.anonymizeData && settings.dataCollection) {
      issues.push('Personal data collection without anonymization')
    }

    if (!settings.dataExport) {
      issues.push('Data export must be available under LGPD')
    }

    if (!settings.dataDeletion) {
      issues.push('Data deletion must be available under LGPD')
    }

    return {
      compliant: issues.length === 0,
      issues
    }
  }, [settings, consentHistory])

  const generatePrivacyReport = useCallback((): string => {
    const report = {
      compliance: checkCompliance(),
      settings,
      dataCategories,
      consentHistory: consentHistory.map(c => ({
        ...c,
        timestamp: c.timestamp.toISOString()
      })),
      lastUpdated: lastUpdated.toISOString(),
      generatedAt: new Date().toISOString()
    }

    return JSON.stringify(report, null, 2)
  }, [settings, dataCategories, consentHistory, lastUpdated, checkCompliance])

  // Utilities
  const isDataAllowed = useCallback((category: string): boolean => {
    switch (category) {
      case 'personal':
        return dataCategories.personal && settings.dataCollection
      case 'behavioral':
        return dataCategories.behavioral && settings.analytics
      case 'performance':
        return dataCategories.performance && settings.dataCollection
      case 'technical':
        return dataCategories.technical && settings.dataCollection
      case 'location':
        return dataCategories.location && settings.dataCollection
      case 'device':
        return dataCategories.device && settings.dataCollection
      default:
        return false
    }
  }, [dataCategories, settings])

  const getDataRetentionPeriod = useCallback((): number => {
    return settings.dataRetention
  }, [settings.dataRetention])

  const shouldAnonymize = useCallback((): boolean => {
    return settings.anonymizeData
  }, [settings.anonymizeData])

  // Auto-save settings when they change
  useEffect(() => {
    saveSettings()
  }, [settings, dataCategories, consentHistory, saveSettings])

  const contextValue: EnemPrivacyContextType = {
    settings,
    dataCategories,
    consentHistory,
    isCompliant,
    lastUpdated,
    updateSettings,
    updateDataCategories,
    grantConsent,
    revokeConsent,
    exportData,
    deleteData,
    resetToDefaults,
    saveSettings,
    loadSettings,
    checkCompliance,
    generatePrivacyReport,
    isDataAllowed,
    getDataRetentionPeriod,
    shouldAnonymize
  }

  return (
    <EnemPrivacyContext.Provider value={contextValue}>
      {children}
    </EnemPrivacyContext.Provider>
  )
}

// Hook
export function useEnemPrivacy() {
  const context = useContext(EnemPrivacyContext)
  if (!context) {
    throw new Error('useEnemPrivacy must be used within an EnemPrivacyProvider')
  }
  return context
}

