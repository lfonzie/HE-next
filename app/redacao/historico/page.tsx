'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, 
  FileText, 
  Search, 
  Calendar,
  TrendingUp,
  Eye,
  Filter
} from 'lucide-react'
import { useNotifications } from '@/components/providers/NotificationProvider'

interface RedacaoHistoryItem {
  id: string
  theme: string
  themeYear: number
  wordCount: number
  totalScore: number
  createdAt: string
  status: string
}

export default function RedacaoHistoricoPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { addNotification } = useNotifications()
  
  const [history, setHistory] = useState<RedacaoHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterYear, setFilterYear] = useState('')

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch('/api/redacao/historico')
        if (!response.ok) {
          throw new Error('Falha ao carregar histórico')
        }
        
        const data = await response.json()
        setHistory(data.history || [])
      } catch (error) {
        console.error('Erro ao carregar histórico:', error)
        addNotification({ type: 'error', title: 'Erro', message: 'Falha ao carregar histórico de redações' })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadHistory()
    }
  }, [user, addNotification])

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.theme.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesYear = !filterYear || item.themeYear.toString() === filterYear
    return matchesSearch && matchesYear
  })

  const getScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-600'
    if (score >= 600) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 800) return 'success'
    if (score >= 600) return 'warning'
    return 'destructive'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 800) return 'Excelente'
    if (score >= 600) return 'Bom'
    if (score >= 400) return 'Regular'
    return 'Precisa Melhorar'
  }

  const averageScore = history.length > 0 
    ? Math.round(history.reduce((sum, item) => sum + item.totalScore, 0) / history.length)
    : 0

  const bestScore = history.length > 0 
    ? Math.max(...history.map(item => item.totalScore))
    : 0

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando histórico...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => router.push('/redacao')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Histórico de Redações
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Acompanhe seu progresso nas redações ENEM
              </p>
            </div>
          </div>
          
          <Button onClick={() => router.push('/redacao')}>
            <FileText className="h-4 w-4 mr-2" />
            Nova Redação
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total de Redações</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {history.length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Média Geral</p>
                  <p className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
                    {averageScore}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Melhor Nota</p>
                  <p className={`text-2xl font-bold ${getScoreColor(bestScore)}`}>
                    {bestScore}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por tema..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Filtrar por ano..."
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Redações */}
        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {history.length === 0 ? 'Nenhuma redação encontrada' : 'Nenhuma redação corresponde aos filtros'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {history.length === 0 
                  ? 'Comece escrevendo sua primeira redação ENEM!'
                  : 'Tente ajustar os filtros de busca.'
                }
              </p>
              <Button onClick={() => router.push('/redacao')}>
                <FileText className="h-4 w-4 mr-2" />
                Nova Redação
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Badge variant="outline" className="mr-2">
                          {item.themeYear}
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {item.theme}
                      </h3>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                        <span>{item.wordCount} palavras</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleTimeString('pt-BR')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(item.totalScore)}`}>
                          {item.totalScore}
                        </div>
                        <Badge variant={getScoreBadge(item.totalScore)} className="text-xs">
                          {getScoreLabel(item.totalScore)}
                        </Badge>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/redacao/resultado/${item.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Resultado
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
