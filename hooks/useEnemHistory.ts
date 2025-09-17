import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export interface EnemSimulationHistory {
  id: string
  date: string
  area: string
  numQuestions: number
  duration: number
  score: number
  correctAnswers: number
  totalQuestions: number
  percentage: number
  timeSpent: number
  useRealQuestions: boolean
  year?: number
  questions: string[]
  answers: Record<number, string>
  performanceData?: {
    strengths: string[]
    weaknesses: string[]
    recommendations: Array<{
      area: string
      priority: 'high' | 'medium' | 'low'
      suggestion: string
      action: string
    }>
  }
}

export function useEnemHistory() {
  const [history, setHistory] = useState<EnemSimulationHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  // Carregar histórico do localStorage como fallback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localHistory = localStorage.getItem('enem-history')
      if (localHistory) {
        try {
          const parsedHistory = JSON.parse(localHistory)
          setHistory(parsedHistory)
        } catch (error) {
          console.error('Erro ao carregar histórico local:', error)
        }
      }
    }
  }, [])

  // Carregar histórico do servidor
  const loadHistory = useCallback(async () => {
    if (!session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/enem/history', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to load history')

      const data = await response.json()
      setHistory(data.history || [])
      
      // Salvar no localStorage como backup
      if (typeof window !== 'undefined') {
        localStorage.setItem('enem-history', JSON.stringify(data.history || []))
      }
    } catch (error) {
      console.error('Error loading history:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [session])

  // Salvar simulado no histórico
  const saveSimulation = useCallback(async (simulationData: Omit<EnemSimulationHistory, 'id' | 'date'>) => {
    const newSimulation: EnemSimulationHistory = {
      ...simulationData,
      id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
    }

    // Adicionar ao estado local imediatamente
    setHistory(prev => [newSimulation, ...prev])

    // Salvar no localStorage como backup
    if (typeof window !== 'undefined') {
      const updatedHistory = [newSimulation, ...history]
      localStorage.setItem('enem-history', JSON.stringify(updatedHistory))
    }

    // Salvar no servidor se logado
    if (session) {
      try {
        await fetch('/api/enem/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(newSimulation),
        })
      } catch (error) {
        console.error('Error saving to server:', error)
        // Não falhar se não conseguir salvar no servidor
      }
    }
  }, [session, history])

  // Remover simulado do histórico
  const removeSimulation = useCallback(async (simulationId: string) => {
    setHistory(prev => prev.filter(sim => sim.id !== simulationId))

    // Atualizar localStorage
    if (typeof window !== 'undefined') {
      const updatedHistory = history.filter(sim => sim.id !== simulationId)
      localStorage.setItem('enem-history', JSON.stringify(updatedHistory))
    }

    // Remover do servidor se logado
    if (session) {
      try {
        await fetch(`/api/enem/history/${simulationId}`, {
          method: 'DELETE',
          credentials: 'include',
        })
      } catch (error) {
        console.error('Error removing from server:', error)
      }
    }
  }, [session, history])

  // Limpar todo o histórico
  const clearHistory = useCallback(async () => {
    setHistory([])

    // Limpar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('enem-history')
    }

    // Limpar do servidor se logado
    if (session) {
      try {
        await fetch('/api/enem/history', {
          method: 'DELETE',
          credentials: 'include',
        })
      } catch (error) {
        console.error('Error clearing server history:', error)
      }
    }
  }, [session])

  // Estatísticas do histórico
  const getStatistics = useCallback(() => {
    if (history.length === 0) {
      return {
        totalSimulations: 0,
        averageScore: 0,
        bestScore: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        improvement: 0,
        areaStats: {},
        recentTrend: 'stable' as 'up' | 'down' | 'stable'
      }
    }

    const totalSimulations = history.length
    const scores = history.map(sim => sim.score)
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    const bestScore = Math.max(...scores)
    const totalQuestions = history.reduce((sum, sim) => sum + sim.totalQuestions, 0)
    const totalCorrect = history.reduce((sum, sim) => sum + sim.correctAnswers, 0)

    // Calcular melhoria (comparar últimos 3 com primeiros 3)
    let improvement = 0
    if (history.length >= 6) {
      const recentScores = history.slice(0, 3).map(sim => sim.score)
      const olderScores = history.slice(-3).map(sim => sim.score)
      const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length
      const olderAvg = olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length
      improvement = Math.round(recentAvg - olderAvg)
    }

    // Estatísticas por área
    const areaStats = history.reduce((acc, sim) => {
      if (!acc[sim.area]) {
        acc[sim.area] = { count: 0, totalScore: 0, bestScore: 0 }
      }
      acc[sim.area].count++
      acc[sim.area].totalScore += sim.score
      acc[sim.area].bestScore = Math.max(acc[sim.area].bestScore, sim.score)
      return acc
    }, {} as Record<string, { count: number; totalScore: number; bestScore: number }>)

    // Calcular tendência recente
    let recentTrend: 'up' | 'down' | 'stable' = 'stable'
    if (history.length >= 3) {
      const recentScores = history.slice(0, 3).map(sim => sim.score)
      const isIncreasing = recentScores[0] > recentScores[1] && recentScores[1] > recentScores[2]
      const isDecreasing = recentScores[0] < recentScores[1] && recentScores[1] < recentScores[2]
      
      if (isIncreasing) recentTrend = 'up'
      else if (isDecreasing) recentTrend = 'down'
    }

    return {
      totalSimulations,
      averageScore,
      bestScore,
      totalQuestions,
      totalCorrect,
      improvement,
      areaStats: Object.entries(areaStats).reduce((acc, [area, stats]) => {
        acc[area] = {
          ...stats,
          averageScore: Math.round(stats.totalScore / stats.count)
        }
        return acc
      }, {} as Record<string, { count: number; totalScore: number; bestScore: number; averageScore: number }>),
      recentTrend
    }
  }, [history])

  // Filtrar histórico por área
  const getHistoryByArea = useCallback((area: string) => {
    return history.filter(sim => sim.area === area)
  }, [history])

  // Obter simulado mais recente
  const getLatestSimulation = useCallback(() => {
    return history.length > 0 ? history[0] : null
  }, [history])

  // Obter melhor simulado
  const getBestSimulation = useCallback(() => {
    if (history.length === 0) return null
    return history.reduce((best, current) => 
      current.score > best.score ? current : best
    )
  }, [history])

  return {
    history,
    isLoading,
    error,
    loadHistory,
    saveSimulation,
    removeSimulation,
    clearHistory,
    getStatistics,
    getHistoryByArea,
    getLatestSimulation,
    getBestSimulation
  }
}
