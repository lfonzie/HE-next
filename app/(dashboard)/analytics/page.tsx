'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'
import Leaderboard from '@/components/gamification/Leaderboard'
import ProgressTracker from '@/components/gamification/ProgressTracker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, Trophy, Target, Users, BookOpen, 
  TrendingUp, Download, RefreshCw, Calendar
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface AnalyticsData {
  overview: {
    totalStudents: number
    totalLessons: number
    totalTimeSpent: number
    averageAccuracy: number
    completionRate: number
    engagementScore: number
  }
  studentProgress: Array<{
    studentId: string
    name: string
    completedLessons: number
    totalPoints: number
    accuracy: number
    timeSpent: number
    lastActive: Date
  }>
  lessonPerformance: Array<{
    lessonId: string
    title: string
    completionRate: number
    averageScore: number
    averageTime: number
    difficulty: string
    studentCount: number
  }>
  engagementMetrics: Array<{
    date: string
    activeStudents: number
    lessonsCompleted: number
    averageSessionTime: number
    quizAccuracy: number
  }>
  popularContent: Array<{
    type: string
    title: string
    views: number
    completions: number
    rating: number
  }>
}

interface ProgressData {
  totalPoints: number
  completedStages: number
  totalStages: number
  timeSpent: number
  streak: number
  accuracy: number
  badges: Array<{
    id: string
    name: string
    description: string
    icon: string
    earned: boolean
    earnedAt?: Date
  }>
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [activeTab, setActiveTab] = useState('overview')

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/analytics?timeRange=${timeRange}`)
        
        if (response.ok) {
          const data = await response.json()
          setAnalyticsData(data)
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('Analytics API error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          })
          
          if (response.status === 401) {
            toast.error('Você precisa fazer login para acessar os analytics')
            // Redirect to login or handle authentication
            window.location.href = '/login'
            return
          }
          
          throw new Error(`Failed to load analytics: ${response.status} ${response.statusText}`)
        }
      } catch (error) {
        console.error('Error loading analytics:', error)
        toast.error('Erro ao carregar dados de analytics')
        
        // Set mock data as fallback
        const mockData = {
          overview: {
            totalStudents: 25,
            totalLessons: 12,
            totalTimeSpent: 450,
            averageAccuracy: 78,
            completionRate: 85,
            engagementScore: 7.2
          },
          studentProgress: [
            {
              studentId: '1',
              name: 'Ana Silva',
              completedLessons: 8,
              totalPoints: 320,
              accuracy: 85,
              timeSpent: 120,
              lastActive: new Date()
            },
            {
              studentId: '2',
              name: 'Carlos Santos',
              completedLessons: 6,
              totalPoints: 280,
              accuracy: 72,
              timeSpent: 95,
              lastActive: new Date(Date.now() - 86400000)
            }
          ],
          lessonPerformance: [
            {
              lessonId: '1',
              title: 'Introdução à Matemática',
              completionRate: 92,
              averageScore: 85,
              averageTime: 25,
              difficulty: 'medium',
              studentCount: 23
            }
          ],
          engagementMetrics: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            activeStudents: Math.floor(Math.random() * 10) + 15,
            lessonsCompleted: Math.floor(Math.random() * 5) + 8,
            averageSessionTime: Math.floor(Math.random() * 20) + 15,
            quizAccuracy: Math.floor(Math.random() * 20) + 70
          })),
          popularContent: [
            {
              type: 'lesson',
              title: 'Introdução à Matemática',
              views: 69,
              completions: 23,
              rating: 4.2
            }
          ]
        }
        setAnalyticsData(mockData)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [timeRange])

  // Mock progress data for demonstration
  useEffect(() => {
    const mockProgressData: ProgressData = {
      totalPoints: 245,
      completedStages: 7,
      totalStages: 9,
      timeSpent: 1800000, // 30 minutes
      streak: 5,
      accuracy: 87,
      badges: [
        {
          id: 'first_lesson',
          name: 'Primeira Aula',
          description: 'Complete sua primeira aula',
          icon: '🎓',
          earned: true,
          earnedAt: new Date(Date.now() - 86400000)
        },
        {
          id: 'quiz_master',
          name: 'Mestre dos Quizzes',
          description: 'Acertou 90% ou mais em um quiz',
          icon: '🧠',
          earned: true,
          earnedAt: new Date(Date.now() - 3600000)
        },
        {
          id: 'speed_demon',
          name: 'Velocidade',
          description: 'Complete uma aula em menos de 20 minutos',
          icon: '⚡',
          earned: false
        },
        {
          id: 'streak_5',
          name: 'Sequência de 5',
          description: 'Complete 5 aulas consecutivas',
          icon: '🔥',
          earned: true,
          earnedAt: new Date(Date.now() - 7200000)
        },
        {
          id: 'perfect_score',
          name: 'Pontuação Perfeita',
          description: 'Acertou 100% em um quiz',
          icon: '💯',
          earned: false
        }
      ]
    }
    setProgressData(mockProgressData)
  }, [])

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range as any)
  }

  const handleExport = () => {
    if (!analyticsData) return
    
    const csvData = [
      ['Métrica', 'Valor'],
      ['Total de Estudantes', analyticsData.overview.totalStudents],
      ['Total de Aulas', analyticsData.overview.totalLessons],
      ['Tempo Total (min)', analyticsData.overview.totalTimeSpent],
      ['Precisão Média (%)', analyticsData.overview.averageAccuracy],
      ['Taxa de Conclusão (%)', analyticsData.overview.completionRate],
      ['Score de Engajamento', analyticsData.overview.engagementScore]
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast.success('Dados exportados com sucesso!')
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erro ao carregar dados</h1>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  // Mock leaderboard data
  const leaderboardData = analyticsData.studentProgress.map((student, index) => ({
    id: student.studentId,
    name: student.name,
    points: student.totalPoints,
    level: Math.floor(student.totalPoints / 100) + 1,
    completedLessons: student.completedLessons,
    accuracy: student.accuracy,
    streak: Math.floor(Math.random() * 10) + 1,
    lastActive: new Date(student.lastActive),
    isCurrentUser: index === 0 // Mock current user
  }))

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Analytics e Gamificação
            </h1>
            <p className="text-gray-600">
              Insights sobre o desempenho dos estudantes e progresso das aulas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={handleExport} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-gray-600" />
              <span className="font-medium">Período:</span>
              <div className="flex gap-2">
                {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(range => (
                  <Button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    variant={timeRange === range ? 'default' : 'outline'}
                    size="sm"
                  >
                    {range === 'daily' && 'Hoje'}
                    {range === 'weekly' && 'Esta Semana'}
                    {range === 'monthly' && 'Este Mês'}
                    {range === 'yearly' && 'Este Ano'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Ranking
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Progresso
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AnalyticsDashboard
            data={analyticsData}
            timeRange={timeRange}
            onTimeRangeChange={handleTimeRangeChange}
            onExport={handleExport}
          />
        </TabsContent>

        <TabsContent value="leaderboard">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Leaderboard
              entries={leaderboardData}
              timeRange={timeRange}
              onTimeRangeChange={handleTimeRangeChange}
              showCurrentUser={true}
              maxEntries={20}
            />
            
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Estatísticas Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analyticsData.overview.totalStudents}
                    </div>
                    <div className="text-sm text-blue-600">Estudantes Ativos</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analyticsData.overview.totalLessons}
                    </div>
                    <div className="text-sm text-green-600">Aulas Disponíveis</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {analyticsData.overview.completionRate}%
                    </div>
                    <div className="text-sm text-purple-600">Taxa de Conclusão</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {analyticsData.overview.averageAccuracy}%
                    </div>
                    <div className="text-sm text-orange-600">Precisão Média</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress">
          {progressData && (
            <ProgressTracker
              progressData={progressData}
              onBadgeEarned={(badge) => {
                toast.success(`🏆 Nova conquista: ${badge.name}!`)
              }}
              showAnimations={true}
            />
          )}
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Insights de Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Tendência Positiva</span>
                    </div>
                    <p className="text-sm text-green-700">
                      O engajamento dos estudantes aumentou 15% este mês comparado ao anterior.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Conteúdo Popular</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Aulas com elementos interativos têm 23% maior taxa de conclusão.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-800">Oportunidade</span>
                    </div>
                    <p className="text-sm text-purple-700">
                      Considere adicionar mais quizzes nas aulas de Ciências para aumentar o engajamento.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl">💡</div>
                    <div>
                      <h4 className="font-medium text-yellow-800">Gamificação</h4>
                      <p className="text-sm text-yellow-700">
                        Adicione mais badges e desafios para aumentar a motivação dos estudantes.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl">📊</div>
                    <div>
                      <h4 className="font-medium text-green-800">Analytics</h4>
                      <p className="text-sm text-green-700">
                        Monitore o progresso individual para identificar estudantes que precisam de apoio.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <h4 className="font-medium text-blue-800">Personalização</h4>
                      <p className="text-sm text-blue-700">
                        Use os dados para criar aulas mais personalizadas baseadas no desempenho.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
