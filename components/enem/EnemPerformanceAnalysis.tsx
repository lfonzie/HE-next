"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Brain, 
  Award,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Users,
  Calendar,
  Star,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'

interface PerformanceData {
  overallScore: number
  areaScores: Record<string, {
    score: number
    correct: number
    total: number
    percentage: number
    timeSpent: number
    averageTimePerQuestion: number
    difficulty: 'Fácil' | 'Médio' | 'Difícil'
    trend: 'up' | 'down' | 'stable'
  }>
  timeAnalysis: {
    totalTime: number
    averageTimePerQuestion: number
    timeDistribution: Record<string, number>
    efficiency: number
  }
  strengths: string[]
  weaknesses: string[]
  recommendations: Array<{
    area: string
    priority: 'high' | 'medium' | 'low'
    suggestion: string
    action: string
  }>
  comparison: {
    previousScore?: number
    improvement?: number
    percentile?: number
  }
}

interface EnemPerformanceAnalysisProps {
  questions: any[]
  answers: Record<number, string>
  timeSpent: number
  onClose: () => void
}

export function EnemPerformanceAnalysis({ 
  questions, 
  answers, 
  timeSpent, 
  onClose 
}: EnemPerformanceAnalysisProps) {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const performAdvancedAnalysis = useCallback(async (): Promise<PerformanceData> => {
    // Análise por área
    const areaScores: Record<string, any> = {}
    const areaTimes: Record<string, number> = {}
    
    questions.forEach((question, index) => {
      const area = question.area || question.subject || 'Geral'
      const isCorrect = answers[index] === question.correctAnswer
      
      if (!areaScores[area]) {
        areaScores[area] = { correct: 0, total: 0, timeSpent: 0 }
        areaTimes[area] = 0
      }
      
      areaScores[area].total++
      if (isCorrect) areaScores[area].correct++
      
      // Simular tempo por questão (em produção, seria real)
      const questionTime = Math.random() * 120 + 30 // 30-150 segundos
      areaScores[area].timeSpent += questionTime
      areaTimes[area] += questionTime
    })

    // Calcular scores e métricas
    const processedAreaScores: Record<string, any> = {}
    let totalCorrect = 0
    const totalQuestions = questions.length

    Object.entries(areaScores).forEach(([area, data]) => {
      const percentage = Math.round((data.correct / data.total) * 100)
      const score = Math.round(percentage * 10) // Escala 0-1000
      
      processedAreaScores[area] = {
        score,
        correct: data.correct,
        total: data.total,
        percentage,
        timeSpent: data.timeSpent,
        averageTimePerQuestion: Math.round(data.timeSpent / data.total),
        difficulty: percentage >= 70 ? 'Fácil' : percentage >= 40 ? 'Médio' : 'Difícil',
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
      }
      
      totalCorrect += data.correct
    })

    const overallScore = Math.round((totalCorrect / totalQuestions) * 1000)
    const averageTimePerQuestion = Math.round(timeSpent / totalQuestions)

    // Identificar pontos fortes e fracos
    const strengths = Object.entries(processedAreaScores)
      .filter(([_, data]) => data.percentage >= 70)
      .map(([area, _]) => area)

    const weaknesses = Object.entries(processedAreaScores)
      .filter(([_, data]) => data.percentage < 50)
      .map(([area, _]) => area)

    // Gerar recomendações
    const recommendations = Object.entries(processedAreaScores)
      .filter(([_, data]) => data.percentage < 60)
      .map(([area, data]) => ({
        area,
        priority: data.percentage < 30 ? 'high' : data.percentage < 50 ? 'medium' : 'low' as 'high' | 'medium' | 'low',
        suggestion: getRecommendation(area, data.percentage),
        action: getAction(area, data.percentage)
      }))

    return {
      overallScore,
      areaScores: processedAreaScores,
      timeAnalysis: {
        totalTime: timeSpent,
        averageTimePerQuestion,
        timeDistribution: areaTimes,
        efficiency: Math.round((totalCorrect / totalQuestions) * (3600 / (timeSpent / 60))) // Questões corretas por hora
      },
      strengths,
      weaknesses,
      recommendations,
      comparison: {
        previousScore: Math.round(overallScore * (0.8 + Math.random() * 0.4)), // Simular score anterior
        improvement: Math.round((overallScore - (overallScore * (0.8 + Math.random() * 0.4)))),
        percentile: Math.round(50 + Math.random() * 40) // Percentil simulado
      }
    }
  }, [questions, answers, timeSpent]);

  const analyzePerformance = useCallback(async () => {
    setIsLoading(true)
    
    try {
      // Simular análise de performance (em produção, isso seria feito com IA)
      const analysis = await performAdvancedAnalysis()
      setPerformanceData(analysis)
    } catch (error) {
      console.error('Erro na análise de performance:', error)
    } finally {
      setIsLoading(false)
    }
  }, [performAdvancedAnalysis]);

  useEffect(() => {
    analyzePerformance()
  }, [questions, answers, timeSpent, analyzePerformance])

  const getRecommendation = (area: string, percentage: number): string => {
    const recommendations = {
      'Matemática': 'Foque em exercícios práticos e resolução de problemas',
      'Português': 'Pratique interpretação de textos e gramática',
      'Física': 'Estude conceitos fundamentais e resolução de exercícios',
      'Química': 'Revise tabela periódica e cálculos estequiométricos',
      'Biologia': 'Foque em ecologia, genética e fisiologia',
      'História': 'Estude cronologia e contexto histórico',
      'Geografia': 'Pratique cartografia e geografia física',
      'Filosofia': 'Estude ética, política e filosofia moderna',
      'Sociologia': 'Foque em movimentos sociais e teorias sociológicas'
    }
    
    return recommendations[area as keyof typeof recommendations] || 'Continue praticando e revise os conceitos fundamentais'
  }

  const getAction = (area: string, percentage: number): string => {
    if (percentage < 30) return 'Revisão completa necessária'
    if (percentage < 50) return 'Prática intensiva recomendada'
    return 'Revisão pontual suficiente'
  }

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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg font-semibold">Analisando seu desempenho...</p>
              <p className="text-sm text-gray-600 mt-2">Gerando insights personalizados</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!performanceData) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-semibold">Erro na análise</p>
              <p className="text-sm text-gray-600 mt-2">Não foi possível analisar seu desempenho</p>
              <Button onClick={onClose} className="mt-4">Fechar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BarChart3 className="h-7 w-7 text-blue-600" />
                Análise de Performance
              </CardTitle>
              <p className="text-gray-600 mt-1">Insights detalhados sobre seu desempenho no simulado</p>
            </div>
            <Button onClick={onClose} variant="outline">
              Fechar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {performanceData.overallScore}
            </div>
            <div className="text-sm text-gray-600 mb-2">Pontuação Geral</div>
            <Badge className={getScoreBadge(performanceData.overallScore)}>
              {performanceData.overallScore >= 800 ? 'Excelente' : 
               performanceData.overallScore >= 600 ? 'Bom' : 
               performanceData.overallScore >= 400 ? 'Regular' : 'Precisa melhorar'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {performanceData.timeAnalysis.efficiency}
            </div>
            <div className="text-sm text-gray-600 mb-2">Eficiência</div>
            <div className="text-xs text-gray-500">Questões/hora</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {performanceData.comparison.percentile}%
            </div>
            <div className="text-sm text-gray-600 mb-2">Percentil</div>
            <div className="text-xs text-gray-500">Comparado a outros</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className={`text-3xl font-bold mb-2 ${
              performanceData.comparison.improvement! >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {performanceData.comparison.improvement! >= 0 ? '+' : ''}{performanceData.comparison.improvement}
            </div>
            <div className="text-sm text-gray-600 mb-2">Melhoria</div>
            <div className="text-xs text-gray-500">vs. simulado anterior</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="areas">Por Área</TabsTrigger>
          <TabsTrigger value="time">Análise Temporal</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Pontos Fortes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceData.strengths.length > 0 ? (
                    performanceData.strengths.map((strength, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">{strength}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">Nenhum ponto forte identificado</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Áreas de Melhoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceData.weaknesses.length > 0 ? (
                    performanceData.weaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="font-medium">{weakness}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">Nenhuma área crítica identificada</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="areas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(performanceData.areaScores).map(([area, data]) => (
              <Card key={area}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{area}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(data.trend)}
                      <Badge variant="outline">{data.difficulty}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{data.score}</div>
                      <div className="text-sm text-gray-600">Pontuação</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{data.percentage}%</div>
                      <div className="text-sm text-gray-600">Acertos</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{data.correct}/{data.total}</span>
                    </div>
                    <Progress value={data.percentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{data.averageTimePerQuestion}s/questão</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span>{data.timeSpent}s total</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Análise Temporal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {Math.round(performanceData.timeAnalysis.totalTime / 60)}min
                  </div>
                  <div className="text-sm text-gray-600">Tempo Total</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {performanceData.timeAnalysis.averageTimePerQuestion}s
                  </div>
                  <div className="text-sm text-gray-600">Tempo Médio/Questão</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {performanceData.timeAnalysis.efficiency}
                  </div>
                  <div className="text-sm text-gray-600">Questões/Hora</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {performanceData.recommendations.map((rec, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${
                      rec.priority === 'high' ? 'bg-red-100' :
                      rec.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                      <Lightbulb className={`h-5 w-5 ${
                        rec.priority === 'high' ? 'text-red-600' :
                        rec.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{rec.area}</h4>
                        <Badge variant={
                          rec.priority === 'high' ? 'destructive' :
                          rec.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {rec.priority === 'high' ? 'Alta' :
                           rec.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-2">{rec.suggestion}</p>
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-medium">Ação:</span>
                        <span>{rec.action}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
