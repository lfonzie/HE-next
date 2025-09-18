'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Trophy,
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { EnemScore, EnemSession } from '@/types/enem'

interface ResultsOverviewProps {
  score: EnemScore
  session: EnemSession
  className?: string
}

export function ResultsOverview({ score, session, className = '' }: ResultsOverviewProps) {
  // Calculate overall performance metrics
  const totalCorrect = Object.values(score.area_scores).reduce((sum, area) => sum + area.correct, 0)
  const totalQuestions = Object.values(score.area_scores).reduce((sum, area) => sum + area.total, 0)
  const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0
  
  // Calculate time metrics
  const averageTimePerQuestion = score.stats.average_time_per_question
  const totalTimeSpent = score.stats.total_time_spent
  
  // Determine performance level
  const getPerformanceLevel = (score: number) => {
    if (score >= 800) return { level: 'Excelente', color: 'text-green-600', bgColor: 'bg-green-100', icon: Trophy }
    if (score >= 700) return { level: 'Muito Bom', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Award }
    if (score >= 600) return { level: 'Bom', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Star }
    if (score >= 500) return { level: 'Regular', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Target }
    return { level: 'Precisa Melhorar', color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertCircle }
  }
  
  const performance = getPerformanceLevel(score.total_score)
  const PerformanceIcon = performance.icon
  
  // Calculate trend (simplified - would need historical data)
  const getTrend = () => {
    // This would be calculated based on previous scores
    return 'stable' // 'up', 'down', 'stable'
  }
  
  const trend = getTrend()
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Score Card */}
      <Card className="shadow-lg border-t-4 border-t-blue-600">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className={`p-4 rounded-full ${performance.bgColor}`}>
              <PerformanceIcon className={`h-12 w-12 ${performance.color}`} />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            {score.total_score} pontos
          </CardTitle>
          <div className="space-y-2">
            <Badge className={`text-lg px-4 py-2 ${performance.bgColor} ${performance.color}`}>
              {performance.level}
            </Badge>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <TrendIcon className={`h-4 w-4 ${trendColor}`} />
              <span className={trendColor}>
                {trend === 'up' ? 'Melhorou' : trend === 'down' ? 'Piorou' : 'Estável'} em relação ao último simulado
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* TRI Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Análise TRI</h3>
              <Badge variant="outline" className="text-sm">
                Sistema Oficial
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {score.tri_estimated.score}
                </div>
                <div className="text-sm text-gray-600">Pontuação TRI</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800">
                  {score.tri_estimated.confidence_interval.lower} - {score.tri_estimated.confidence_interval.upper}
                </div>
                <div className="text-sm text-gray-600">Intervalo de Confiança</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800">
                  ±{Math.round((score.tri_estimated.confidence_interval.upper - score.tri_estimated.confidence_interval.lower) / 2)}
                </div>
                <div className="text-sm text-gray-600">Margem de Erro</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 italic">
              {score.tri_estimated.disclaimer}
            </p>
          </div>

          {/* Overall Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalCorrect}</div>
              <div className="text-sm text-gray-600">Acertos</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{totalQuestions - totalCorrect}</div>
              <div className="text-sm text-gray-600">Erros</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{Math.round(overallAccuracy)}%</div>
              <div className="text-sm text-gray-600">Precisão</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.floor(averageTimePerQuestion / 60)}m {Math.round(averageTimePerQuestion % 60)}s
              </div>
              <div className="text-sm text-gray-600">Tempo Médio</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Breakdown */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Desempenho por Área
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(score.area_scores).map(([area, areaScore]) => {
              const accuracy = (areaScore.correct / areaScore.total) * 100
              const areaNames = {
                'CN': 'Ciências da Natureza',
                'CH': 'Ciências Humanas',
                'LC': 'Linguagens e Códigos',
                'MT': 'Matemática'
              }
              
              return (
                <div key={area} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-sm">
                        {area}
                      </Badge>
                      <span className="font-medium text-gray-900">
                        {areaNames[area as keyof typeof areaNames]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        {areaScore.correct}/{areaScore.total}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {Math.round(accuracy)}%
                      </span>
                      <span className="font-bold text-blue-600">
                        {areaScore.raw_score}
                      </span>
                    </div>
                  </div>
                  <Progress value={accuracy} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Analysis */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Análise de Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {Math.floor(totalTimeSpent / 3600)}h {Math.floor((totalTimeSpent % 3600) / 60)}m
              </div>
              <div className="text-sm text-gray-600">Tempo Total</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">
                {Math.floor(averageTimePerQuestion / 60)}m {Math.round(averageTimePerQuestion % 60)}s
              </div>
              <div className="text-sm text-gray-600">Tempo por Questão</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">
                {Math.round((totalTimeSpent / totalQuestions) / 60)} min
              </div>
              <div className="text-sm text-gray-600">Tempo Ideal</div>
            </div>
          </div>
          
          {/* Time Efficiency */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Eficiência de Tempo</h4>
            <div className="flex items-center gap-2">
              <Progress 
                value={Math.min(100, (averageTimePerQuestion / 180) * 100)} 
                className="flex-1 h-2" 
              />
              <span className="text-sm text-gray-600">
                {averageTimePerQuestion < 180 ? 'Eficiente' : 'Pode melhorar'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Tempo ideal por questão: 3 minutos
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <Card className="shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Insights Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Pontos Fortes</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {Object.entries(score.area_scores)
                  .filter(([_, areaScore]) => (areaScore.correct / areaScore.total) >= 0.7)
                  .map(([area, _]) => (
                    <li key={area} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {area} - Boa performance
                    </li>
                  ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Áreas para Melhorar</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {Object.entries(score.area_scores)
                  .filter(([_, areaScore]) => (areaScore.correct / areaScore.total) < 0.6)
                  .map(([area, _]) => (
                    <li key={area} className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      {area} - Precisa de mais estudo
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

