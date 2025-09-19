"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Database, 
  Calendar, 
  BookOpen, 
  Target, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface DatabaseStats {
  local_database: {
    available: boolean
    stats?: {
      totalYears: number
      totalQuestions: number
      questionsByYear: Record<number, number>
      questionsByDiscipline: Record<string, number>
    }
  }
  external_api: {
    available: boolean
  }
}

export function EnemDatabaseStats() {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/enem/real-questions-local?action=status')
        
        if (!response.ok) {
          throw new Error('Failed to fetch database stats')
        }
        
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error('Error fetching database stats:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-blue-700 font-medium">Checking database...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-red-700 font-medium">Erro ao verificar base de dados</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const { local_database, external_api } = stats

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Database className="h-6 w-6 text-green-600" />
          Status da Base de Dados ENEM
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Geral */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg">
            <div className={`p-2 rounded-full ${
              local_database.available ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Database className={`h-5 w-5 ${
                local_database.available ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Base Local</p>
              <p className={`text-sm ${
                local_database.available ? 'text-green-600' : 'text-red-600'
              }`}>
                {local_database.available ? 'Available' : 'Unavailable'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg">
            <div className={`p-2 rounded-full ${
              external_api.available ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              <TrendingUp className={`h-5 w-5 ${
                external_api.available ? 'text-green-600' : 'text-yellow-600'
              }`} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">API Externa</p>
              <p className={`text-sm ${
                external_api.available ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {external_api.available ? 'Available' : 'Unavailable'}
              </p>
            </div>
          </div>
        </div>

        {/* Local Database Statistics */}
        {local_database.available && local_database.stats && (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-gray-800">Local Database Statistics</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">{local_database.stats.totalYears}</p>
                <p className="text-sm text-gray-600">Available Years</p>
              </div>

              <div className="text-center p-4 bg-white/50 rounded-lg">
                <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">
                  {local_database.stats.totalQuestions.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Questions</p>
              </div>

              <div className="text-center p-4 bg-white/50 rounded-lg">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">
                  {Object.keys(local_database.stats.questionsByDiscipline).length}
                </p>
                <p className="text-sm text-gray-600">Disciplinas</p>
              </div>
            </div>

            {/* Questions by Subject */}
            <div>
              <h5 className="font-semibold text-gray-800 mb-3">Questions by Subject</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(local_database.stats.questionsByDiscipline).map(([discipline, count]) => (
                  <div key={discipline} className="p-3 bg-white/50 rounded-lg text-center">
                    <p className="text-lg font-bold text-gray-800">{count.toLocaleString()}</p>
                    <p className="text-xs text-gray-600 capitalize">
                      {discipline.replace('-', ' ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Anos Recentes */}
            <div>
              <h5 className="font-semibold text-gray-800 mb-3">Anos Recentes</h5>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {Object.entries(local_database.stats.questionsByYear)
                  .sort(([a], [b]) => parseInt(b) - parseInt(a))
                  .slice(0, 10)
                  .map(([year, count]) => (
                    <div key={year} className="p-2 bg-white/50 rounded-lg text-center">
                      <p className="text-sm font-bold text-gray-800">{year}</p>
                      <p className="text-xs text-gray-600">{count}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Fallback Information */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-800">Sistema de Fallback Inteligente</p>
              <p className="text-sm text-blue-700 mt-1">
                O simulador sempre funcionará, usando a melhor fonte disponível:
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• <strong>1º:</strong> Base de dados local (mais rápida)</li>
                <li>• <strong>2º:</strong> API externa enem.dev</li>
                <li>• <strong>3º:</strong> IA especializada (sempre disponível)</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
