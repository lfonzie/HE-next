'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Lightbulb,
  Target,
  Clock,
  BookOpen,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Star,
  ArrowRight,
  Download,
  Share2,
  Bookmark,
  Users,
  Award
} from 'lucide-react'
import { EnemScore, EnemItem, EnemResponse } from '@/types/enem'

interface ResultsRecommendationsProps {
  score: EnemScore
  items: EnemItem[]
  responses: EnemResponse[]
  className?: string
}

interface StudyPlan {
  id: string
  title: string
  description: string
  duration: number // in hours
  priority: 'high' | 'medium' | 'low'
  topics: string[]
  resources: string[]
  estimatedImprovement: number
}

interface Recommendation {
  id: string
  type: 'study' | 'practice' | 'review' | 'strategy'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  estimatedTime: number
  expectedImprovement: number
  area?: string
  topic?: string
}

export function ResultsRecommendations({ score, items, responses, className = '' }: ResultsRecommendationsProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'recommendations' | 'study-plans' | 'strategies'>('recommendations')

  // Generate study recommendations based on performance
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = []
    
    // Analyze weak areas
    Object.entries(score.area_scores).forEach(([area, areaScore]) => {
      const accuracy = (areaScore.correct / areaScore.total) * 100
      
      if (accuracy < 60) {
        recommendations.push({
          id: `weak-area-${area}`,
          type: 'study',
          title: `Foque em ${area}`,
          description: `Sua performance em ${area} está abaixo de 60%. Recomendamos estudo intensivo nesta área.`,
          priority: 'high',
          estimatedTime: 20,
          expectedImprovement: 50,
          area
        })
      }
    })

    // Analyze topic performance
    const topicStats: Record<string, { correct: number; total: number; area: string }> = {}
    
    items.forEach(item => {
      const response = responses.find(r => r.item_id === item.item_id)
      const topic = item.topic
      
      if (!topicStats[topic]) {
        topicStats[topic] = { correct: 0, total: 0, area: item.area }
      }
      
      topicStats[topic].total++
      if (response?.is_correct) {
        topicStats[topic].correct++
      }
    })

    Object.entries(topicStats).forEach(([topic, stats]) => {
      const accuracy = (stats.correct / stats.total) * 100
      
      if (accuracy < 50) {
        recommendations.push({
          id: `weak-topic-${topic}`,
          type: 'study',
          title: `Estude ${topic}`,
          description: `Tópico ${topic} em ${stats.area} precisa de atenção especial.`,
          priority: 'high',
          estimatedTime: 10,
          expectedImprovement: 30,
          area: stats.area,
          topic
        })
      }
    })

    // Time management recommendations
    if (score.stats.average_time_per_question > 240) { // More than 4 minutes
      recommendations.push({
        id: 'time-management',
        type: 'strategy',
        title: 'Melhore sua gestão de tempo',
        description: 'Você está gastando muito tempo por questão. Pratique com cronômetro.',
        priority: 'medium',
        estimatedTime: 5,
        expectedImprovement: 20
      })
    }

    // Practice recommendations
    if (score.total_score < 600) {
      recommendations.push({
        id: 'more-practice',
        type: 'practice',
        title: 'Mais simulados',
        description: 'Faça mais simulados para ganhar experiência e confiança.',
        priority: 'high',
        estimatedTime: 15,
        expectedImprovement: 40
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  // Generate study plans
  const generateStudyPlans = (): StudyPlan[] => {
    const plans: StudyPlan[] = []
    
    // Intensive plan for low scores
    if (score.total_score < 500) {
      plans.push({
        id: 'intensive',
        title: 'Plano Intensivo',
        description: 'Foco total na preparação para o ENEM',
        duration: 120, // 2 weeks, 8 hours/day
        priority: 'high',
        topics: ['Matemática Básica', 'Português Fundamental', 'Ciências Básicas'],
        resources: ['Livros didáticos', 'Vídeo-aulas', 'Exercícios práticos'],
        estimatedImprovement: 200
      })
    }

    // Balanced plan for medium scores
    if (score.total_score >= 500 && score.total_score < 700) {
      plans.push({
        id: 'balanced',
        title: 'Plano Equilibrado',
        description: 'Estudo balanceado com foco nas áreas fracas',
        duration: 80,
        priority: 'medium',
        topics: ['Áreas específicas', 'Revisão geral', 'Prática de simulados'],
        resources: ['Material específico', 'Simulados', 'Revisões'],
        estimatedImprovement: 150
      })
    }

    // Refinement plan for high scores
    if (score.total_score >= 700) {
      plans.push({
        id: 'refinement',
        title: 'Plano de Refinamento',
        description: 'Aperfeiçoamento e manutenção do nível',
        duration: 40,
        priority: 'low',
        topics: ['Tópicos específicos', 'Estratégias avançadas', 'Simulados'],
        resources: ['Material avançado', 'Simulados oficiais'],
        estimatedImprovement: 100
      })
    }

    return plans
  }

  const recommendations = generateRecommendations()
  const studyPlans = generateStudyPlans()

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'study': return BookOpen
      case 'practice': return Target
      case 'review': return CheckCircle
      case 'strategy': return Lightbulb
      default: return Star
    }
  }

  // Render recommendations
  const renderRecommendations = () => (
    <div className="space-y-4">
      {recommendations.map((rec) => {
        const Icon = getTypeIcon(rec.type)
        return (
          <Card key={rec.id} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                    <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                      {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-4">{rec.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {rec.estimatedTime}h estimadas
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      +{rec.expectedImprovement} pontos
                    </div>
                    {rec.area && (
                      <Badge variant="outline" className="text-xs">
                        {rec.area}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  // Render study plans
  const renderStudyPlans = () => (
    <div className="space-y-4">
      {studyPlans.map((plan) => (
        <Card key={plan.id} className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">{plan.title}</CardTitle>
                  <p className="text-gray-600">{plan.description}</p>
                </div>
              </div>
              <Badge className={`${getPriorityColor(plan.priority)}`}>
                {plan.priority === 'high' ? 'Alta' : plan.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{plan.duration}h</div>
                <div className="text-sm text-gray-600">Duração</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">+{plan.estimatedImprovement}</div>
                <div className="text-sm text-gray-600">Melhoria</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xl font-bold text-purple-600">{plan.topics.length}</div>
                <div className="text-sm text-gray-600">Tópicos</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-xl font-bold text-orange-600">{plan.resources.length}</div>
                <div className="text-sm text-gray-600">Recursos</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Tópicos de Foco:</h4>
                <div className="flex flex-wrap gap-2">
                  {plan.topics.map((topic) => (
                    <Badge key={topic} variant="outline" className="text-sm">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Recursos Recomendados:</h4>
                <div className="flex flex-wrap gap-2">
                  {plan.resources.map((resource) => (
                    <Badge key={resource} variant="secondary" className="text-sm">
                      {resource}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button className="flex-1">
                <Bookmark className="h-4 w-4 mr-2" />
                Adotar Plano
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Render strategies
  const renderStrategies = () => (
    <div className="space-y-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Estratégias de Estudo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Método Pomodoro</h4>
              <p className="text-sm text-gray-700 mb-3">
                Estude por 25 minutos, descanse por 5 minutos. Repita 4 vezes e faça uma pausa maior.
              </p>
              <Button variant="outline" size="sm">
                Aplicar Método
              </Button>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Revisão Espaçada</h4>
              <p className="text-sm text-gray-700 mb-3">
                Revise o conteúdo em intervalos crescentes: 1 dia, 3 dias, 1 semana, 2 semanas.
              </p>
              <Button variant="outline" size="sm">
                Configurar Lembretes
              </Button>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Mapas Mentais</h4>
              <p className="text-sm text-gray-700 mb-3">
                Crie mapas visuais para conectar conceitos e melhorar a memorização.
              </p>
              <Button variant="outline" size="sm">
                Criar Mapa
              </Button>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Grupos de Estudo</h4>
              <p className="text-sm text-gray-700 mb-3">
                Estude em grupo para discutir dúvidas e reforçar o aprendizado.
              </p>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Encontrar Grupo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Estratégias para o Dia da Prova
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">1</div>
              <div>
                <h4 className="font-semibold text-gray-900">Leia todas as questões primeiro</h4>
                <p className="text-sm text-gray-700">Identifique as mais fáceis e comece por elas para ganhar confiança.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">2</div>
              <div>
                <h4 className="font-semibold text-gray-900">Gerencie seu tempo</h4>
                <p className="text-sm text-gray-700">Reserve tempo para revisar as respostas antes de entregar.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">3</div>
              <div>
                <h4 className="font-semibold text-gray-900">Não deixe questões em branco</h4>
                <p className="text-sm text-gray-700">Mesmo sem certeza, marque uma alternativa. No ENEM não há penalização por erro.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Recomendações Personalizadas
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'recommendations' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('recommendations')}
              >
                Recomendações
              </Button>
              <Button
                variant={viewMode === 'study-plans' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('study-plans')}
              >
                Planos de Estudo
              </Button>
              <Button
                variant={viewMode === 'strategies' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('strategies')}
              >
                Estratégias
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content */}
      {viewMode === 'recommendations' && renderRecommendations()}
      {viewMode === 'study-plans' && renderStudyPlans()}
      {viewMode === 'strategies' && renderStrategies()}

      {/* Action Buttons */}
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
            <Button>
              <Award className="h-4 w-4 mr-2" />
              Criar Plano Personalizado
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

