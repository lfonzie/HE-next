"use client"

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'

// Types
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'streaming' | 'classification'
  title: string
  message: string
  timestamp: number
  duration?: number
  actions?: NotificationAction[]
  persistent?: boolean
  priority: 'low' | 'normal' | 'high' | 'urgent'
  category: string
  metadata?: Record<string, any>
}

export interface NotificationAction {
  id: string
  label: string
  action: () => void
  variant?: 'default' | 'destructive' | 'outline'
}

export interface NotificationSettings {
  enableDesktopNotifications: boolean
  enableSound: boolean
  enableVibration: boolean
  enableStreamingNotifications: boolean
  enableClassificationNotifications: boolean
  enableErrorNotifications: boolean
  enableSuccessNotifications: boolean
  maxNotifications: number
  defaultDuration: number
  soundUrl?: string
}

export interface NotificationState {
  notifications: Notification[]
  settings: NotificationSettings
  isPermissionGranted: boolean
  isSupported: boolean
  unreadCount: number
}

// Action Types
type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'CLEAR_CATEGORY'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<NotificationSettings> }
  | { type: 'SET_PERMISSION_GRANTED'; payload: boolean }
  | { type: 'SET_SUPPORTED'; payload: boolean }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<Notification> } }

// Initial State
const initialState: NotificationState = {
  notifications: [],
  settings: {
    enableDesktopNotifications: true,
    enableSound: true,
    enableVibration: false,
    enableStreamingNotifications: true,
    enableClassificationNotifications: false,
    enableErrorNotifications: true,
    enableSuccessNotifications: true,
    maxNotifications: 10,
    defaultDuration: 5000,
    soundUrl: '/sounds/notification.mp3'
  },
  isPermissionGranted: false,
  isSupported: false,
  unreadCount: 0
}

// Reducer
function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      const newNotifications = [action.payload, ...state.notifications]
        .slice(0, state.settings.maxNotifications)
      
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: state.unreadCount + 1
      }
    }
    
    case 'REMOVE_NOTIFICATION': {
      const notification = state.notifications.find(n => n.id === action.payload)
      const wasUnread = notification && !notification.persistent
      
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
      }
    }
    
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      }
    
    case 'CLEAR_CATEGORY':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.category !== action.payload)
      }
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      }
    
    case 'SET_PERMISSION_GRANTED':
      return { ...state, isPermissionGranted: action.payload }
    
    case 'SET_SUPPORTED':
      return { ...state, isSupported: action.payload }
    
    case 'MARK_AS_READ': {
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, persistent: false } : n
      )
      
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: Math.max(0, state.unreadCount - 1)
      }
    }
    
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, persistent: false })),
        unreadCount: 0
      }
    
    case 'UPDATE_NOTIFICATION': {
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload.id ? { ...n, ...action.payload.updates } : n
      )
      
      return { ...state, notifications: updatedNotifications }
    }
    
    default:
      return state
  }
}

// Context
interface NotificationContextType {
  state: NotificationState
  dispatch: React.Dispatch<NotificationAction>
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  clearCategory: (category: string) => void
  updateSettings: (settings: Partial<NotificationSettings>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  updateNotification: (id: string, updates: Partial<Notification>) => void
  
  // Permission management
  requestPermission: () => Promise<boolean>
  checkPermission: () => Promise<boolean>
  
  // Convenience methods
  notifyInfo: (title: string, message: string, options?: Partial<Notification>) => string
  notifySuccess: (title: string, message: string, options?: Partial<Notification>) => string
  notifyWarning: (title: string, message: string, options?: Partial<Notification>) => string
  notifyError: (title: string, message: string, options?: Partial<Notification>) => string
  notifyStreaming: (title: string, message: string, options?: Partial<Notification>) => string
  notifyClassification: (module: string, confidence: number, options?: Partial<Notification>) => string
  
  // Audio/Visual feedback
  playSound: () => void
  vibrate: () => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

// Provider Component
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  // Initialize audio
  useEffect(() => {
    if (typeof window !== 'undefined' && state.settings.soundUrl) {
      audioRef.current = new Audio(state.settings.soundUrl)
      audioRef.current.preload = 'auto'
    }
  }, [state.settings.soundUrl])

  // Check browser support
  useEffect(() => {
    const isSupported = typeof window !== 'undefined' && 'Notification' in window
    dispatch({ type: 'SET_SUPPORTED', payload: isSupported })
    
    if (isSupported) {
      checkPermission()
    }
  }, [])

  // Actions
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const fullNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      duration: notification.duration || state.settings.defaultDuration
    }
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: fullNotification })
    
    // Auto-remove after duration
    if (fullNotification.duration && !fullNotification.persistent) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
      }, fullNotification.duration)
    }
    
    // Play sound if enabled
    if (state.settings.enableSound) {
      playSound()
    }
    
    // Vibrate if enabled
    if (state.settings.enableVibration && 'vibrate' in navigator) {
      vibrate()
    }
    
    // Show desktop notification if enabled and permission granted
    if (state.settings.enableDesktopNotifications && state.isPermissionGranted) {
      showDesktopNotification(fullNotification)
    }
    
    return id
  }, [state.settings, state.isPermissionGranted])

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
  }, [])

  const clearAllNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' })
  }, [])

  const clearCategory = useCallback((category: string) => {
    dispatch({ type: 'CLEAR_CATEGORY', payload: category })
  }, [])

  const updateSettings = useCallback((settings: Partial<NotificationSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings })
  }, [])

  const markAsRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id })
  }, [])

  const markAllAsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_AS_READ' })
  }, [])

  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
    dispatch({ type: 'UPDATE_NOTIFICATION', payload: { id, updates } })
  }, [])

  // Permission management
  const requestPermission = useCallback(async () => {
    if (!state.isSupported) return false
    
    try {
      const permission = await Notification.requestPermission()
      const granted = permission === 'granted'
      dispatch({ type: 'SET_PERMISSION_GRANTED', payload: granted })
      return granted
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }, [state.isSupported])

  const checkPermission = useCallback(async () => {
    if (!state.isSupported) return false
    
    try {
      const permission = Notification.permission
      const granted = permission === 'granted'
      dispatch({ type: 'SET_PERMISSION_GRANTED', payload: granted })
      return granted
    } catch (error) {
      console.error('Error checking notification permission:', error)
      return false
    }
  }, [state.isSupported])

  // Convenience methods
  const notifyInfo = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'info',
      title,
      message,
      priority: 'normal',
      category: 'general',
      ...options
    })
  }, [addNotification])

  const notifySuccess = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    if (!state.settings.enableSuccessNotifications) return ''
    
    return addNotification({
      type: 'success',
      title,
      message,
      priority: 'normal',
      category: 'success',
      ...options
    })
  }, [addNotification, state.settings.enableSuccessNotifications])

  const notifyWarning = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      priority: 'high',
      category: 'warning',
      ...options
    })
  }, [addNotification])

  const notifyError = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    if (!state.settings.enableErrorNotifications) return ''
    
    return addNotification({
      type: 'error',
      title,
      message,
      priority: 'urgent',
      category: 'error',
      persistent: true,
      ...options
    })
  }, [addNotification, state.settings.enableErrorNotifications])

  const notifyStreaming = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    if (!state.settings.enableStreamingNotifications) return ''
    
    return addNotification({
      type: 'streaming',
      title,
      message,
      priority: 'low',
      category: 'streaming',
      persistent: true,
      ...options
    })
  }, [addNotification, state.settings.enableStreamingNotifications])

  const notifyClassification = useCallback((module: string, confidence: number, options?: Partial<Notification>) => {
    if (!state.settings.enableClassificationNotifications) return ''
    
    return addNotification({
      type: 'classification',
      title: 'Módulo Classificado',
      message: `Mensagem classificada como: ${module} (${Math.round(confidence * 100)}% confiança)`,
      priority: 'low',
      category: 'classification',
      metadata: { module, confidence },
      ...options
    })
  }, [addNotification, state.settings.enableClassificationNotifications])

  // Audio/Visual feedback
  const playSound = useCallback(() => {
    if (audioRef.current && state.settings.enableSound) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(error => {
        console.warn('Could not play notification sound:', error)
      })
    }
  }, [state.settings.enableSound])

  const vibrate = useCallback(() => {
    if ('vibrate' in navigator && state.settings.enableVibration) {
      navigator.vibrate([200, 100, 200])
    }
  }, [state.settings.enableVibration])

  // Desktop notification helper
  const showDesktopNotification = useCallback((notification: Notification) => {
    if (!state.isPermissionGranted || !state.settings.enableDesktopNotifications) return
    
    try {
      const desktopNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.persistent,
        silent: !state.settings.enableSound
      })
      
      desktopNotification.onclick = () => {
        window.focus()
        desktopNotification.close()
        markAsRead(notification.id)
      }
      
      // Auto-close after duration
      if (notification.duration && !notification.persistent) {
        setTimeout(() => {
          desktopNotification.close()
        }, notification.duration)
      }
    } catch (error) {
      console.error('Error showing desktop notification:', error)
    }
  }, [state.isPermissionGranted, state.settings, markAsRead])

  const contextValue: NotificationContextType = {
    state,
    dispatch,
    addNotification,
    removeNotification,
    clearAllNotifications,
    clearCategory,
    updateSettings,
    markAsRead,
    markAllAsRead,
    updateNotification,
    requestPermission,
    checkPermission,
    notifyInfo,
    notifySuccess,
    notifyWarning,
    notifyError,
    notifyStreaming,
    notifyClassification,
    playSound,
    vibrate
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

// Hook
export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
}

// Selector hooks
export function useNotifications() {
  const { state, removeNotification, markAsRead, clearAllNotifications } = useNotificationContext()
  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    removeNotification,
    markAsRead,
    clearAllNotifications
  }
}

export function useNotificationActions() {
  const {
    notifyInfo,
    notifySuccess,
    notifyWarning,
    notifyError,
    notifyStreaming,
    notifyClassification
  } = useNotificationContext()
  
  return {
    notifyInfo,
    notifySuccess,
    notifyWarning,
    notifyError,
    notifyStreaming,
    notifyClassification
  }
}

export function useNotificationSettings() {
  const { state, updateSettings, requestPermission, checkPermission } = useNotificationContext()
  return {
    settings: state.settings,
    isPermissionGranted: state.isPermissionGranted,
    isSupported: state.isSupported,
    updateSettings,
    requestPermission,
    checkPermission
  }
}



