"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  History, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Trophy,
  Target,
  Clock,
  Calendar,
  BarChart3,
  Award,
  Trash2,
  RefreshCw,
  Eye,
  Download,
  Share2,
  Filter,
  Search,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Zap,
  BookOpen,
  Brain,
  Globe
} from 'lucide-react'
import { useEnemHistory, EnemSimulationHistory } from '@/hooks/useEnemHistory'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EnemHistoryProps {
  onViewSimulation?: (simulation: EnemSimulationHistory) => void
  onClose?: () => void
}

export function EnemHistory({ onViewSimulation, onClose }: EnemHistoryProps) {
  const {
    history,
    isLoading,
    error,
    loadHistory,
    removeSimulation,
    clearHistory,
    getStatistics,
    getHistoryByArea,
    getLatestSimulation,
    getBestSimulation
  } = useEnemHistory()

  const [activeTab, setActiveTab] = useState('overview')
  const [selectedArea, setSelectedArea] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'area'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const statistics = getStatistics()
  const latestSimulation = getLatestSimulation()
  const bestSimulation = getBestSimulation()

  // Filtrar e ordenar histórico
  const filteredHistory = history
    .filter(sim => {
      const matchesArea = selectedArea === 'all' || sim.area === selectedArea
      const matchesSearch = searchTerm === '' || 
        sim.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sim.id.includes(searchTerm)
      return matchesArea && matchesSearch
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'score':
          comparison = a.score - b.score
          break
        case 'area':
          comparison = a.area.localeCompare(b.area)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const getScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-600'
    if (score >= 600) return 'text-blue-600'
    if (score >= 400) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 800) return 'bg-green-100 text-green-800'
    if (score >= 600) return 'bg-blue-100 text-blue-800'
    if (score >= 400) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getAreaIcon = (area: string) => {
    const icons = {
      'linguagens': BookOpen,
      'matematica': Target,
      'ciencias-humanas': Globe,
      'ciencias-natureza': Brain,
      'geral': Award
    }
    const IconComponent = icons[area as keyof typeof icons] || Award
    return <IconComponent className="h-4 w-4" />
  }

  const getAreaName = (area: string) => {
    const names = {
      'linguagens': 'Linguagens',
      'matematica': 'Matemática',
      'ciencias-humanas': 'Ciências Humanas',
      'ciencias-natureza': 'Ciências da Natureza',
      'geral': 'Simulado Geral'
    }
    return names[area as keyof typeof names] || area
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg font-semibold">Carregando histórico...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-semibold">Erro ao carregar histórico</p>
              <p className="text-sm text-gray-600 mt-2">{error}</p>
              <Button onClick={loadHistory} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <History className="h-7 w-7 text-purple-600" />
                Histórico de Simulados
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Acompanhe sua evolução e compare seus resultados
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadHistory} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              {onClose && (
                <Button onClick={onClose} variant="outline">
                  Fechar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {statistics.totalSimulations}
            </div>
            <div className="text-sm text-gray-600 mb-2">Simulados Realizados</div>
            <div className="flex items-center justify-center gap-1">
              {getTrendIcon(statistics.recentTrend)}
              <span className="text-xs text-gray-500">Tendência recente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {statistics.averageScore}
            </div>
            <div className="text-sm text-gray-600 mb-2">Pontuação Média</div>
            <Badge className={getScoreBadge(statistics.averageScore)}>
              {statistics.averageScore >= 800 ? 'Excelente' : 
               statistics.averageScore >= 600 ? 'Bom' : 
               statistics.averageScore >= 400 ? 'Regular' : 'Precisa melhorar'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {statistics.bestScore}
            </div>
            <div className="text-sm text-gray-600 mb-2">Melhor Pontuação</div>
            <div className="flex items-center justify-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-gray-500">Recorde pessoal</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className={`text-3xl font-bold mb-2 ${
              statistics.improvement >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {statistics.improvement >= 0 ? '+' : ''}{statistics.improvement}
            </div>
            <div className="text-sm text-gray-600 mb-2">Melhoria</div>
            <div className="text-xs text-gray-500">Últimos vs. primeiros simulados</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="history">Histórico Completo</TabsTrigger>
          <TabsTrigger value="areas">Por Área</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Simulado Mais Recente */}
            {latestSimulation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Simulado Mais Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {getAreaIcon(latestSimulation.area)}
                      <div>
                        <h4 className="font-semibold">{getAreaName(latestSimulation.area)}</h4>
                        <p className="text-sm text-gray-600">
                          {formatDistanceToNow(new Date(latestSimulation.date), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{latestSimulation.score}</div>
                        <div className="text-sm text-gray-600">Pontuação</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{latestSimulation.percentage}%</div>
                        <div className="text-sm text-gray-600">Acertos</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{latestSimulation.correctAnswers}/{latestSimulation.totalQuestions}</span>
                      </div>
                      <Progress value={latestSimulation.percentage} className="h-2" />
                    </div>

                    <Button 
                      onClick={() => onViewSimulation?.(latestSimulation)}
                      size="sm"
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Melhor Simulado */}
            {bestSimulation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    Melhor Simulado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {getAreaIcon(bestSimulation.area)}
                      <div>
                        <h4 className="font-semibold">{getAreaName(bestSimulation.area)}</h4>
                        <p className="text-sm text-gray-600">
                          {formatDistanceToNow(new Date(bestSimulation.date), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{bestSimulation.score}</div>
                        <div className="text-sm text-gray-600">Pontuação</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{bestSimulation.percentage}%</div>
                        <div className="text-sm text-gray-600">Acertos</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{bestSimulation.correctAnswers}/{bestSimulation.totalQuestions}</span>
                      </div>
                      <Progress value={bestSimulation.percentage} className="h-2" />
                    </div>

                    <Button 
                      onClick={() => onViewSimulation?.(bestSimulation)}
                      size="sm"
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Filtros e Controles */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar simulados..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todas as áreas</option>
                    <option value="linguagens">Linguagens</option>
                    <option value="matematica">Matemática</option>
                    <option value="ciencias-humanas">Ciências Humanas</option>
                    <option value="ciencias-natureza">Ciências da Natureza</option>
                    <option value="geral">Simulado Geral</option>
                  </select>
                  
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder]
                      setSortBy(newSortBy)
                      setSortOrder(newSortOrder)
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="date-desc">Mais recente</option>
                    <option value="date-asc">Mais antigo</option>
                    <option value="score-desc">Maior pontuação</option>
                    <option value="score-asc">Menor pontuação</option>
                    <option value="area-asc">Área A-Z</option>
                    <option value="area-desc">Área Z-A</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Simulados */}
          <div className="space-y-4">
            {filteredHistory.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-600">Nenhum simulado encontrado</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {searchTerm || selectedArea !== 'all' 
                        ? 'Tente ajustar os filtros de busca'
                        : 'Realize seu primeiro simulado para começar a acompanhar sua evolução'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredHistory.map((simulation) => (
                <Card key={simulation.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-full">
                          {getAreaIcon(simulation.area)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{getAreaName(simulation.area)}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDistanceToNow(new Date(simulation.date), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              {simulation.totalQuestions} questões
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {Math.round(simulation.timeSpent / 60)} min
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(simulation.score)}`}>
                            {simulation.score}
                          </div>
                          <div className="text-sm text-gray-600">
                            {simulation.correctAnswers}/{simulation.totalQuestions} acertos
                          </div>
                          <Badge className={getScoreBadge(simulation.score)}>
                            {simulation.percentage}%
                          </Badge>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => onViewSimulation?.(simulation)}
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => removeSimulation(simulation.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="areas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(statistics.areaStats).map(([area, stats]) => (
              <Card key={area}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getAreaIcon(area)}
                    {getAreaName(area)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.count}</div>
                      <div className="text-sm text-gray-600">Simulados</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.averageScore}</div>
                      <div className="text-sm text-gray-600">Média</div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.bestScore}</div>
                    <div className="text-sm text-gray-600">Melhor Pontuação</div>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedArea(area)
                      setActiveTab('history')
                    }}
                    size="sm"
                    className="w-full"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Ver Histórico
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
