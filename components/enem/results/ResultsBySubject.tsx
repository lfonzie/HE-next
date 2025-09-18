'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { EnemScore, EnemItem, EnemResponse } from '@/types/enem'

interface ResultsBySubjectProps {
  score: EnemScore
  items: EnemItem[]
  responses: EnemResponse[]
  className?: string
}

export function ResultsBySubject({ score, items, responses, className = '' }: ResultsBySubjectProps) {
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'topics'>('overview')

  // Area information
  const areaInfo = {
    'CN': {
      name: 'Ciências da Natureza',
      description: 'Física, Química e Biologia',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: '🧬'
    },
    'CH': {
      name: 'Ciências Humanas',
      description: 'História, Geografia, Filosofia e Sociologia',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      icon: '🌍'
    },
    'LC': {
      name: 'Linguagens e Códigos',
      description: 'Português, Literatura e Língua Estrangeira',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      icon: '📚'
    },
    'MT': {
      name: 'Matemática',
      description: 'Matemática e suas Tecnologias',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      icon: '🔢'
    }
  }

  // Calculate topic performance
  const calculateTopicPerformance = (area: string) => {
    const areaItems = items.filter(item => item.area === area)
    const areaResponses = responses.filter(response => 
      areaItems.some(item => item.item_id === response.item_id)
    )

    const topicStats: Record<string, {
      correct: number
      total: number
      averageTime: number
      difficulty: { easy: number; medium: number; hard: number }
    }> = {}

    areaItems.forEach(item => {
      const response = areaResponses.find(r => r.item_id === item.item_id)
      const topic = item.topic

      if (!topicStats[topic]) {
        topicStats[topic] = {
          correct: 0,
          total: 0,
          averageTime: 0,
          difficulty: { easy: 0, medium: 0, hard: 0 }
        }
      }

      topicStats[topic].total++
      if (response?.is_correct) {
        topicStats[topic].correct++
      }
      if (response) {
        topicStats[topic].averageTime += response.time_spent
      }

      // Count by difficulty
      const diff = item.estimated_difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'
      topicStats[topic].difficulty[diff]++
    })

    // Calculate averages
    Object.keys(topicStats).forEach(topic => {
      const stats = topicStats[topic]
      stats.averageTime = stats.total > 0 ? stats.averageTime / stats.total : 0
    })

    return topicStats
  }

  // Get performance level
  const getPerformanceLevel = (accuracy: number) => {
    if (accuracy >= 80) return { level: 'Excelente', color: 'text-green-600', bgColor: 'bg-green-100' }
    if (accuracy >= 70) return { level: 'Bom', color: 'text-blue-600', bgColor: 'bg-blue-100' }
    if (accuracy >= 60) return { level: 'Regular', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    if (accuracy >= 50) return { level: 'Ruim', color: 'text-orange-600', bgColor: 'bg-orange-100' }
    return { level: 'Muito Ruim', color: 'text-red-600', bgColor: 'bg-red-100' }
  }

  // Render area overview
  const renderAreaOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(score.area_scores).map(([area, areaScore]) => {
        const info = areaInfo[area as keyof typeof areaInfo]
        const accuracy = (areaScore.correct / areaScore.total) * 100
        const performance = getPerformanceLevel(accuracy)
        const topicStats = calculateTopicPerformance(area)

        return (
          <Card key={area} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{info.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{info.name}</CardTitle>
                    <p className="text-sm text-gray-600">{info.description}</p>
                  </div>
                </div>
                <Badge className={`${performance.bgColor} ${performance.color}`}>
                  {performance.level}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Score and Accuracy */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{areaScore.raw_score}</div>
                  <div className="text-sm text-gray-600">Pontuação</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{Math.round(accuracy)}%</div>
                  <div className="text-sm text-gray-600">Precisão</div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Acertos: {areaScore.correct}/{areaScore.total}</span>
                  <span>{Math.round(accuracy)}%</span>
                </div>
                <Progress value={accuracy} className="h-2" />
              </div>

              {/* Topic Summary */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 text-sm">Principais Tópicos:</h4>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(topicStats)
                    .sort(([,a], [,b]) => (b.correct / b.total) - (a.correct / a.total))
                    .slice(0, 3)
                    .map(([topic, stats]) => {
                      const topicAccuracy = (stats.correct / stats.total) * 100
                      return (
                        <Badge
                          key={topic}
                          variant="outline"
                          className={`text-xs ${
                            topicAccuracy >= 70 ? 'border-green-300 text-green-700' :
                            topicAccuracy >= 50 ? 'border-yellow-300 text-yellow-700' :
                            'border-red-300 text-red-700'
                          }`}
                        >
                          {topic} ({Math.round(topicAccuracy)}%)
                        </Badge>
                      )
                    })}
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedArea(area)}
                className="w-full"
              >
                Ver Detalhes
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  // Render detailed view
  const renderDetailedView = () => {
    if (!selectedArea) return null

    const areaScore = score.area_scores[selectedArea]
    const info = areaInfo[selectedArea as keyof typeof areaInfo]
    const topicStats = calculateTopicPerformance(selectedArea)
    const accuracy = (areaScore.correct / areaScore.total) * 100
    const performance = getPerformanceLevel(accuracy)

    return (
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{info.icon}</span>
              <div>
                <CardTitle className="text-xl">{info.name}</CardTitle>
                <p className="text-gray-600">{info.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${performance.bgColor} ${performance.color}`}>
                {performance.level}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedArea(null)}
              >
                ← Voltar
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{areaScore.raw_score}</div>
              <div className="text-sm text-gray-600">Pontuação</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{areaScore.correct}</div>
              <div className="text-sm text-gray-600">Acertos</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{areaScore.total - areaScore.correct}</div>
              <div className="text-sm text-gray-600">Erros</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{Math.round(accuracy)}%</div>
              <div className="text-sm text-gray-600">Precisão</div>
            </div>
          </div>

          {/* Topic Performance */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Desempenho por Tópico</h3>
            <div className="space-y-3">
              {Object.entries(topicStats)
                .sort(([,a], [,b]) => (b.correct / b.total) - (a.correct / a.total))
                .map(([topic, stats]) => {
                  const topicAccuracy = (stats.correct / stats.total) * 100
                  const topicPerformance = getPerformanceLevel(topicAccuracy)
                  
                  return (
                    <div key={topic} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{topic}</h4>
                          <Badge className={`text-xs ${topicPerformance.bgColor} ${topicPerformance.color}`}>
                            {topicPerformance.level}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {stats.correct}/{stats.total} ({Math.round(topicAccuracy)}%)
                        </div>
                      </div>
                      
                      <Progress value={topicAccuracy} className="h-2 mb-2" />
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Tempo médio: {Math.round(stats.averageTime / 60)}m {Math.round(stats.averageTime % 60)}s</span>
                        <div className="flex gap-2">
                          <span>Fácil: {stats.difficulty.easy}</span>
                          <span>Médio: {stats.difficulty.medium}</span>
                          <span>Difícil: {stats.difficulty.hard}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Recomendações de Estudo</h3>
            <div className="space-y-2">
              {Object.entries(topicStats)
                .filter(([, stats]) => (stats.correct / stats.total) < 0.6)
                .map(([topic, stats]) => (
                  <div key={topic} className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span>Foque mais em <strong>{topic}</strong> - {Math.round((stats.correct / stats.total) * 100)}% de acerto</span>
                  </div>
                ))}
              {Object.entries(topicStats).every(([, stats]) => (stats.correct / stats.total) >= 0.6) && (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span>Parabéns! Você está indo bem em todos os tópicos desta área.</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Desempenho por Área
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('overview')}
              >
                Visão Geral
              </Button>
              <Button
                variant={viewMode === 'detailed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('detailed')}
              >
                Detalhado
              </Button>
              <Button
                variant={viewMode === 'topics' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('topics')}
              >
                Por Tópicos
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content */}
      {viewMode === 'overview' && renderAreaOverview()}
      {viewMode === 'detailed' && renderDetailedView()}
      {viewMode === 'topics' && (
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Visualização por tópicos será implementada em breve.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

