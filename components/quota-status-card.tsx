'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Calendar
} from 'lucide-react'

interface QuotaStatus {
  userId: string
  month: string
  tokenLimit: number
  tokenUsed: number
  remainingTokens: number
  percentageUsed: number
  dailyUsage?: number
  hourlyUsage?: number
  costUsd?: number
  costBrl?: number
  isActive: boolean
}

export default function QuotaStatusCard() {
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadQuotaStatus()
  }, [])

  const loadQuotaStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/quota/status')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar status da quota')
      }
      
      const data = await response.json()
      setQuotaStatus(data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getUsageBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return 'destructive'
    if (percentage >= 75) return 'secondary'
    return 'default'
  }

  const getUsageIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertTriangle className="h-4 w-4 text-red-600" />
    if (percentage >= 75) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <CheckCircle className="h-4 w-4 text-green-600" />
  }

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-')
    const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
    return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            Status da Quota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <span className="text-muted-foreground">Carregando...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status da Quota</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!quotaStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status da Quota</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Nenhuma quota encontrada para o mês atual.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const { percentageUsed, remainingTokens, tokenUsed, tokenLimit, month } = quotaStatus

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Status da Quota</span>
          <div className="flex items-center space-x-2">
            {getUsageIcon(percentageUsed)}
            <Badge variant={getUsageBadgeVariant(percentageUsed)}>
              {percentageUsed}%
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informações do mês */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          {formatMonth(month)}
        </div>

        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uso de Tokens</span>
            <span className={getUsageColor(percentageUsed)}>
              {tokenUsed.toLocaleString()} / {tokenLimit.toLocaleString()}
            </span>
          </div>
          <Progress value={percentageUsed} className="h-2" />
        </div>

        {/* Tokens restantes */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Tokens Restantes:</span>
          <span className={`text-sm font-bold ${getUsageColor(percentageUsed)}`}>
            {remainingTokens.toLocaleString()}
          </span>
        </div>

        {/* Informações adicionais */}
        {quotaStatus.dailyUsage !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uso Hoje:</span>
            <span>{quotaStatus.dailyUsage.toLocaleString()} tokens</span>
          </div>
        )}

        {quotaStatus.hourlyUsage !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uso Esta Hora:</span>
            <span>{quotaStatus.hourlyUsage.toLocaleString()} tokens</span>
          </div>
        )}

        {/* Alertas */}
        {percentageUsed >= 90 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Você está próximo do limite mensal de tokens. 
              Considere otimizar suas consultas ou aguardar o próximo mês.
            </AlertDescription>
          </Alert>
        )}

        {percentageUsed >= 75 && percentageUsed < 90 && (
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Você já utilizou {percentageUsed}% da sua quota mensal. 
              Ainda restam {remainingTokens.toLocaleString()} tokens disponíveis.
            </AlertDescription>
          </Alert>
        )}

        {/* Botão de atualizar */}
        <div className="pt-2">
          <button
            onClick={loadQuotaStatus}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Atualizar Status
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
