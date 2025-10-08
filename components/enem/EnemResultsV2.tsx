'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart3,
  Target,
  Lightbulb,
  Download,
  Share2,
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  Award,
  TrendingUp,
  Clock,
  Users,
  BookOpen
} from 'lucide-react'
import { EnemScore, EnemItem, EnemResponse, EnemSession } from '@/types/enem'
import { ResultsOverview } from './results/ResultsOverview'
import { ResultsBySubject } from './results/ResultsBySubject'
import { ResultsRecommendations } from './results/ResultsRecommendations'
import { useToast } from '@/hooks/use-toast'
import { processQuestionsImages } from '@/lib/utils/image-url-converter'

interface EnemResultsV2Props {
  score: EnemScore
  items: EnemItem[]
  responses: EnemResponse[]
  session: EnemSession
  onRetake?: () => void
  onExport?: () => void
  onShare?: () => void
  className?: string
}

export function EnemResultsV2({
  score,
  items,
  responses,
  session,
  onRetake,
  onExport,
  onShare,
  className = ''
}: EnemResultsV2Props) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isDetailedView, setIsDetailedView] = useState(false)
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  // Converter URLs de imagens do enem.dev para caminhos locais
  const processedItems = useMemo(() => {
    return processQuestionsImages(items);
  }, [items]);

  // Calculate additional metrics
  const totalCorrect = Object.values(score.area_scores).reduce((sum, area) => sum + area.correct, 0)
  const totalQuestions = Object.values(score.area_scores).reduce((sum, area) => sum + area.total, 0)
  const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0
  
  // Calculate time efficiency
  const averageTimePerQuestion = score.stats.average_time_per_question
  const timeEfficiency = averageTimePerQuestion < 180 ? 'Eficiente' : 'Pode melhorar'
  
  // Calculate improvement potential
  const weakAreas = Object.entries(score.area_scores)
    .filter(([_, areaScore]) => (areaScore.correct / areaScore.total) < 0.6)
    .map(([area, _]) => area)
  
  const improvementPotential = weakAreas.length * 50 // Estimated points per weak area

  // Handle export
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const exportData = {
        score,
        session,
        items: processedItems.map(item => ({
          item_id: item.item_id,
          area: item.area,
          topic: item.topic,
          difficulty: item.estimated_difficulty,
          correct_answer: item.correct_answer
        })),
        responses: responses.map(response => ({
          item_id: response.item_id,
          selected_answer: response.selected_answer,
          is_correct: response.is_correct,
          time_spent: response.time_spent
        })),
        summary: {
          total_score: score.total_score,
          overall_accuracy: overallAccuracy,
          time_efficiency: timeEfficiency,
          weak_areas: weakAreas,
          improvement_potential: improvementPotential
        },
        export_date: new Date().toISOString(),
        version: '2.0'
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `enem-results-${session.session_id}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: '✅ Relatório exportado',
        description: 'Seus resultados foram salvos com sucesso!',
      })
    } catch (error) {
      toast({
        title: '❌ Erro na exportação',
        description: 'Não foi possível exportar o relatório.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Handle share
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Meus Resultados do Simulado ENEM',
          text: `Consegui ${score.total_score} pontos no simulado ENEM!`,
          url: window.location.href
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `Consegui ${score.total_score} pontos no simulado ENEM! ${window.location.href}`
        )
        toast({
          title: '✅ Link copiado',
          description: 'Link dos resultados copiado para a área de transferência!',
        })
      }
    } catch (error) {
      toast({
        title: '❌ Erro ao compartilhar',
        description: 'Não foi possível compartilhar os resultados.',
        variant: 'destructive',
      })
    }
  }

  // Get performance level
  const getPerformanceLevel = (score: number) => {
    if (score >= 800) return { level: 'Excelente', color: 'text-green-600', bgColor: 'bg-green-100' }
    if (score >= 700) return { level: 'Muito Bom', color: 'text-blue-600', bgColor: 'bg-blue-100' }
    if (score >= 600) return { level: 'Bom', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    if (score >= 500) return { level: 'Regular', color: 'text-orange-600', bgColor: 'bg-orange-100' }
    return { level: 'Precisa Melhorar', color: 'text-red-600', bgColor: 'bg-red-100' }
  }

  const performance = getPerformanceLevel(score.total_score)

  return (
    <div className={`max-w-7xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <Card className="shadow-lg border-t-4 border-t-blue-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Resultados do Simulado ENEM
                </CardTitle>
                <p className="text-gray-600">
                  {session.mode} • {session.area.join(', ')} • {new Date(session.start_time).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={`text-sm px-3 py-1 ${performance.bgColor} ${performance.color}`}>
                {performance.level}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailedView(!isDetailedView)}
              >
                {isDetailedView ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {isDetailedView ? 'Visão Simples' : 'Visão Detalhada'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-md">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{score.total_score}</div>
            <div className="text-sm text-gray-600">Pontuação Total</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-600">{Math.round(overallAccuracy)}%</div>
            <div className="text-sm text-gray-600">Precisão Geral</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{totalCorrect}</div>
            <div className="text-sm text-gray-600">Acertos</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-orange-600">
              {Math.floor(averageTimePerQuestion / 60)}m {Math.round(averageTimePerQuestion % 60)}s
            </div>
            <div className="text-sm text-gray-600">Tempo Médio</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="subjects" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Por Área
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Recomendações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ResultsOverview score={score} session={session} />
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          <ResultsBySubject score={score} items={processedItems} responses={responses} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <ResultsRecommendations score={score} items={processedItems} responses={responses} />
        </TabsContent>
      </Tabs>

      {/* Advanced Metrics (if enabled) */}
      {showAdvancedMetrics && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Métricas Avançadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">
                  {score.tri_estimated.confidence_interval.lower} - {score.tri_estimated.confidence_interval.upper}
                </div>
                <div className="text-sm text-gray-600">Intervalo de Confiança TRI</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">
                  {Math.round(score.tri_estimated.score * 0.1)}%
                </div>
                <div className="text-sm text-gray-600">Confiabilidade</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">
                  {improvementPotential}
                </div>
                <div className="text-sm text-gray-600">Potencial de Melhoria</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
              >
                <Settings className="h-4 w-4 mr-2" />
                {showAdvancedMetrics ? 'Ocultar' : 'Mostrar'} Métricas Avançadas
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExporting ? 'Exportando...' : 'Exportar'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              
              {onRetake && (
                <Button onClick={onRetake}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refazer Simulado
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <Card className="shadow-md bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-700">
              <strong>💡 Dica:</strong> Use as recomendações personalizadas para criar um plano de estudo eficaz.
            </p>
            <p className="text-xs text-gray-500">
              Resultados calculados usando o sistema TRI (Teoria de Resposta ao Item) • 
              Última atualização: {new Date().toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

