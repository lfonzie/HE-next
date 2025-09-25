'use client'

import { useState, useEffect, useCallback } from 'react'

export interface QuotaStatus {
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

export interface QuotaError {
  error: string
  message?: string
  remainingTokens?: number
  quotaExceeded?: boolean
  dailyLimitExceeded?: boolean
  hourlyLimitExceeded?: boolean
  costLimitExceeded?: boolean
}

/**
 * Hook para gerenciar quotas de tokens
 */
export function useQuota() {
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Carrega o status atual da quota do usuário
   */
  const loadQuotaStatus = useCallback(async (month?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (month) {
        params.append('month', month)
      }
      
      const response = await fetch(`/api/quota/status?${params}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Usuário não autenticado')
        }
        if (response.status === 404) {
          throw new Error('Quota não encontrada')
        }
        throw new Error('Erro ao carregar status da quota')
      }
      
      const data = await response.json()
      setQuotaStatus(data)
      return data
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Verifica se o usuário pode fazer uma requisição
   */
  const canMakeRequest = useCallback((estimatedTokens: number = 100): boolean => {
    if (!quotaStatus) return true // Se não há quota carregada, permitir
    
    return quotaStatus.remainingTokens >= estimatedTokens
  }, [quotaStatus])

  /**
   * Obtém informações sobre o uso atual
   */
  const getUsageInfo = useCallback(() => {
    if (!quotaStatus) return null
    
    return {
      percentageUsed: quotaStatus.percentageUsed,
      remainingTokens: quotaStatus.remainingTokens,
      tokenLimit: quotaStatus.tokenLimit,
      tokenUsed: quotaStatus.tokenUsed,
      isNearLimit: quotaStatus.percentageUsed >= 75,
      isAtLimit: quotaStatus.percentageUsed >= 90,
      isExceeded: quotaStatus.percentageUsed >= 100
    }
  }, [quotaStatus])

  /**
   * Trata erros de quota de uma resposta de API
   */
  const handleQuotaError = useCallback((error: any): QuotaError | null => {
    if (error?.status === 429 && error?.quotaExceeded) {
      return {
        error: 'Quota excedida',
        message: error.message,
        remainingTokens: error.remainingTokens,
        quotaExceeded: error.quotaExceeded,
        dailyLimitExceeded: error.dailyLimitExceeded,
        hourlyLimitExceeded: error.hourlyLimitExceeded,
        costLimitExceeded: error.costLimitExceeded
      }
    }
    return null
  }, [])

  /**
   * Faz uma requisição com verificação de quota
   */
  const makeRequest = useCallback(async (
    url: string, 
    options: RequestInit = {},
    estimatedTokens: number = 100
  ): Promise<Response> => {
    // Verificar se pode fazer a requisição
    if (!canMakeRequest(estimatedTokens)) {
      throw new Error('Quota insuficiente para esta requisição')
    }

    try {
      const response = await fetch(url, options)
      
      // Se a resposta indica erro de quota, tratar
      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}))
        const quotaError = handleQuotaError(errorData)
        if (quotaError) {
          throw quotaError
        }
      }
      
      // Se a requisição foi bem-sucedida, atualizar status da quota
      if (response.ok) {
        // Recarregar status da quota após um pequeno delay
        setTimeout(() => {
          loadQuotaStatus().catch(console.error)
        }, 1000)
      }
      
      return response
      
    } catch (err) {
      // Se for erro de quota, recarregar status
      if (err && typeof err === 'object' && 'quotaExceeded' in err) {
        loadQuotaStatus().catch(console.error)
      }
      throw err
    }
  }, [canMakeRequest, handleQuotaError, loadQuotaStatus])

  /**
   * Carrega status da quota automaticamente no mount
   */
  useEffect(() => {
    loadQuotaStatus().catch(console.error)
  }, [loadQuotaStatus])

  return {
    quotaStatus,
    loading,
    error,
    loadQuotaStatus,
    canMakeRequest,
    getUsageInfo,
    handleQuotaError,
    makeRequest
  }
}

/**
 * Hook para componentes que precisam verificar quota antes de ações
 */
export function useQuotaCheck() {
  const { quotaStatus, canMakeRequest, getUsageInfo } = useQuota()
  
  const checkBeforeAction = useCallback((
    action: () => void | Promise<void>,
    estimatedTokens: number = 100,
    showWarning: boolean = true
  ) => {
    const usageInfo = getUsageInfo()
    
    if (!usageInfo) {
      // Se não há informações de quota, executar ação
      action()
      return
    }
    
    if (usageInfo.isExceeded) {
      if (showWarning) {
        alert('Limite de tokens excedido. Não é possível realizar esta ação.')
      }
      return
    }
    
    if (usageInfo.isAtLimit && showWarning) {
      const confirmed = confirm(
        `Você está próximo do limite de tokens (${usageInfo.percentageUsed}% usado). ` +
        `Deseja continuar? Restam ${usageInfo.remainingTokens.toLocaleString()} tokens.`
      )
      if (!confirmed) return
    }
    
    if (!canMakeRequest(estimatedTokens)) {
      if (showWarning) {
        alert('Tokens insuficientes para esta ação.')
      }
      return
    }
    
    action()
  }, [quotaStatus, canMakeRequest, getUsageInfo])
  
  return {
    quotaStatus,
    checkBeforeAction,
    canMakeRequest,
    getUsageInfo
  }
}
