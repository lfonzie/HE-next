"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X,
  Wifi,
  WifiOff,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'connection'
  title: string
  message: string
  timestamp: Date
  autoHide?: boolean
  duration?: number
}

interface ChatNotificationsProps {
  notifications: Notification[]
  onRemoveNotification: (id: string) => void
  onClearAll: () => void
  isOnline: boolean
  connectionStatus: 'connected' | 'connecting' | 'disconnected'
  retryCount: number
  onRetry: () => void
}

export function ChatNotifications({
  notifications,
  onRemoveNotification,
  onClearAll,
  isOnline,
  connectionStatus,
  retryCount,
  onRetry
}: ChatNotificationsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Contar notificações não lidas
  useEffect(() => {
    setUnreadCount(notifications.length)
  }, [notifications])

  // Auto-hide para notificações com autoHide
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.autoHide && notification.duration) {
        const timer = setTimeout(() => {
          onRemoveNotification(notification.id)
        }, notification.duration)
        
        return () => clearTimeout(timer)
      }
    })
  }, [notifications, onRemoveNotification])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />
      case 'connection':
        return isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'info':
        return 'border-blue-200 bg-blue-50'
      case 'connection':
        return isOnline ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes}m`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  if (notifications.length === 0 && connectionStatus === 'connected') {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      {/* Botão de notificações */}
      <div className="flex justify-end mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Painel de notificações */}
      {isExpanded && (
        <Card className="shadow-lg border">
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Notificações</h3>
                <div className="flex gap-1">
                  {notifications.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearAll}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Status de conexão */}
              {connectionStatus !== 'connected' && (
                <div className={`p-3 rounded-lg border ${getNotificationColor('connection')}`}>
                  <div className="flex items-center gap-2">
                    {getNotificationIcon('connection')}
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {connectionStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
                      </p>
                      {retryCount > 0 && (
                        <p className="text-xs text-gray-600">
                          Tentativa {retryCount} de reconexão
                        </p>
                      )}
                    </div>
                    {connectionStatus === 'disconnected' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                        className="h-6 px-2 text-xs"
                      >
                        Tentar novamente
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Lista de notificações */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${getNotificationColor(notification.type)}`}
                  >
                    <div className="flex items-start gap-2">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveNotification(notification.id)}
                        className="h-6 w-6 p-0 flex-shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ações rápidas */}
              {notifications.length === 0 && connectionStatus === 'connected' && (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Tudo funcionando perfeitamente!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Hook para gerenciar notificações
export function useChatNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected')

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setConnectionStatus('connected')
      addNotification({
        type: 'success',
        title: 'Conexão restaurada',
        message: 'Você está conectado novamente',
        autoHide: true,
        duration: 3000
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      setConnectionStatus('disconnected')
      addNotification({
        type: 'error',
        title: 'Conexão perdida',
        message: 'Verifique sua conexão com a internet',
        autoHide: false
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    }
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]) // Manter apenas 10 notificações
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const retryConnection = () => {
    setConnectionStatus('connecting')
    // Simular tentativa de reconexão
    setTimeout(() => {
      if (navigator.onLine) {
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('disconnected')
      }
    }, 2000)
  }

  return {
    notifications,
    isOnline,
    connectionStatus,
    addNotification,
    removeNotification,
    clearAll,
    retryConnection
  }
}
