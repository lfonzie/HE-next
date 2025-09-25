'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, 
  X, 
  RefreshCw,
  Calendar,
  TrendingUp,
  DollarSign
} from 'lucide-react'

interface QuotaNotificationProps {
  quotaExceeded?: boolean
  dailyLimitExceeded?: boolean
  hourlyLimitExceeded?: boolean
  costLimitExceeded?: boolean
  remainingTokens?: number
  message?: string
  onDismiss?: () => void
  onRefresh?: () => void
}

export default function QuotaNotification({
  quotaExceeded,
  dailyLimitExceeded,
  hourlyLimitExceeded,
  costLimitExceeded,
  remainingTokens = 0,
  message,
  onDismiss,
  onRefresh
}: QuotaNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  const getNotificationType = () => {
    if (quotaExceeded) return 'quota'
    if (dailyLimitExceeded) return 'daily'
    if (hourlyLimitExceeded) return 'hourly'
    if (costLimitExceeded) return 'cost'
    return 'warning'
  }

  const getNotificationContent = () => {
    const type = getNotificationType()
    
    switch (type) {
      case 'quota':
        return {
          title: 'Limite Mensal de Tokens Excedido',
          description: message || `Você atingiu o limite mensal de tokens. Restam ${remainingTokens.toLocaleString()} tokens disponíveis.`,
          icon: <AlertTriangle className="h-4 w-4" />,
          variant: 'destructive' as const,
          actions: [
            {
              label: 'Aguardar Próximo Mês',
              description: 'Sua quota será renovada automaticamente no próximo mês.'
            }
          ]
        }
      
      case 'daily':
        return {
          title: 'Limite Diário de Tokens Excedido',
          description: message || 'Você atingiu o limite diário de tokens. Tente novamente amanhã.',
          icon: <Calendar className="h-4 w-4" />,
          variant: 'destructive' as const,
          actions: [
            {
              label: 'Aguardar Amanhã',
              description: 'Seu limite diário será renovado à meia-noite.'
            }
          ]
        }
      
      case 'hourly':
        return {
          title: 'Limite Horário de Tokens Excedido',
          description: message || 'Você atingiu o limite horário de tokens. Aguarde alguns minutos.',
          icon: <TrendingUp className="h-4 w-4" />,
          variant: 'secondary' as const,
          actions: [
            {
              label: 'Aguardar 1 Hora',
              description: 'Seu limite horário será renovado na próxima hora.'
            }
          ]
        }
      
      case 'cost':
        return {
          title: 'Limite de Custo Excedido',
          description: message || 'Você atingiu o limite de custo mensal. Entre em contato com o administrador.',
          icon: <DollarSign className="h-4 w-4" />,
          variant: 'destructive' as const,
          actions: [
            {
              label: 'Contatar Administrador',
              description: 'Solicite um aumento do limite de custo.'
            }
          ]
        }
      
      default:
        return {
          title: 'Atenção - Uso de Tokens',
          description: message || 'Você está próximo do limite de tokens.',
          icon: <AlertTriangle className="h-4 w-4" />,
          variant: 'secondary' as const,
          actions: []
        }
    }
  }

  const content = getNotificationContent()

  if (!isVisible) {
    return null
  }

  return (
    <Alert variant={content.variant} className="mb-4">
      <div className="flex items-start space-x-2">
        {content.icon}
        <div className="flex-1">
          <AlertDescription className="font-medium">
            {content.title}
          </AlertDescription>
          <AlertDescription className="mt-1">
            {content.description}
          </AlertDescription>
          
          {content.actions.length > 0 && (
            <div className="mt-3 space-y-2">
              {content.actions.map((action, index) => (
                <div key={index} className="text-sm">
                  <div className="font-medium">{action.label}</div>
                  <div className="text-muted-foreground">{action.description}</div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-3 flex space-x-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="h-8"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Atualizar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8"
            >
              <X className="h-3 w-3 mr-1" />
              Dispensar
            </Button>
          </div>
        </div>
      </div>
    </Alert>
  )
}

/**
 * Hook para gerenciar notificações de quota
 */
export function useQuotaNotifications() {
  const [notifications, setNotifications] = useState<QuotaNotificationProps[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addNotification = (notification: QuotaNotificationProps) => {
    setNotifications(prev => [...prev, notification])
  }

  const removeNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const checkQuotaStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/quota/status')
      
      if (response.ok) {
        const quotaStatus = await response.json()
        
        // Verificar se precisa mostrar notificações
        if (quotaStatus.percentageUsed >= 90) {
          addNotification({
            quotaExceeded: quotaStatus.percentageUsed >= 100,
            remainingTokens: quotaStatus.remainingTokens,
            message: quotaStatus.percentageUsed >= 100 
              ? 'Limite mensal de tokens excedido.'
              : `Você está próximo do limite mensal (${quotaStatus.percentageUsed}% usado).`
          })
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status da quota:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    notifications,
    isLoading,
    addNotification,
    removeNotification,
    clearNotifications,
    checkQuotaStatus
  }
}
