'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle, Clock, Trophy, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'

interface Stage {
  etapa: number
  title: string
  type: string
  completed: boolean
  points: number
}

interface LessonProgressProps {
  lessonId: string
  title: string
  duration?: string
  points?: number
  progress?: string
  stages?: Stage[]
  onStageClick?: (etapa: number) => void
}

export default function LessonProgress({
  lessonId,
  title,
  duration = 'N/A min',
  points = 0,
  progress = '0/14 etapas, 0%',
  stages = [],
  onStageClick
}: LessonProgressProps) {
  const [currentStages, setCurrentStages] = useState<Stage[]>(stages)
  const [isLoading, setIsLoading] = useState(false)

  // Carregar progresso da aula
  useEffect(() => {
    const loadProgress = async () => {
      if (!lessonId) return
      
      setIsLoading(true)
      try {
        const response = await fetch(`/api/aulas/progress?lessonId=${lessonId}`)
        const data = await response.json()
        
        if (data.success && data.lesson) {
          setCurrentStages(data.lesson.stages || [])
        }
      } catch (error) {
        console.error('Erro ao carregar progresso:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProgress()
  }, [lessonId])

  // Calcular progresso
  const completedStages = currentStages.filter(stage => stage.completed).length
  const totalStages = currentStages.length || 14
  const progressPercentage = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0
  const totalPoints = currentStages.reduce((sum, stage) => sum + stage.points, 0)

  // Estrutura padrão das etapas se não houver dados
  const defaultStages: Stage[] = [
    { etapa: 1, title: 'Abertura: Tema e Objetivos', type: 'Conteúdo', completed: false, points: 0 },
    { etapa: 2, title: 'Conceitos Fundamentais', type: 'Conteúdo', completed: false, points: 0 },
    { etapa: 3, title: 'Desenvolvimento dos Processos', type: 'Conteúdo', completed: false, points: 0 },
    { etapa: 4, title: 'Aplicações Práticas', type: 'Conteúdo', completed: false, points: 0 },
    { etapa: 5, title: 'Variações e Adaptações', type: 'Conteúdo', completed: false, points: 0 },
    { etapa: 6, title: 'Conexões Avançadas', type: 'Conteúdo', completed: false, points: 0 },
    { etapa: 7, title: 'Quiz: Conceitos Básicos', type: 'Avaliação', completed: false, points: 0 },
    { etapa: 8, title: 'Aprofundamento', type: 'Conteúdo', completed: false, points: 0 },
    { etapa: 9, title: 'Exemplos Práticos', type: 'Conteúdo', completed: false, points: 0 },
    { etapa: 10, title: 'Análise Crítica', type: 'Conteúdo', completed: false, points: 0 },
    { etapa: 11, title: 'Síntese Intermediária', type: 'Conteúdo', completed: false, points: 0 },
    { etapa: 12, title: 'Quiz: Análise Situacional', type: 'Avaliação', completed: false, points: 0 },
    { etapa: 13, title: 'Aplicações Futuras', type: 'Conteúdo', completed: false, points: 0 },
    { etapa: 14, title: 'Encerramento: Síntese Final', type: 'Conteúdo', completed: false, points: 0 }
  ]

  const displayStages = currentStages.length > 0 ? currentStages : defaultStages

  const getStageIcon = (stage: Stage) => {
    if (stage.completed) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    return <Circle className="h-5 w-5 text-gray-400" />
  }

  const getStageTypeColor = (type: string) => {
    switch (type) {
      case 'Avaliação':
        return 'bg-red-100 text-red-800'
      case 'Encerramento':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {duration}
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            {totalPoints} pontos
          </div>
          <Badge variant="outline">
            {completedStages}/{totalStages} etapas, {progressPercentage}%
          </Badge>
        </div>
        <Progress value={progressPercentage} className="w-full" />
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {displayStages.map((stage, index) => (
            <motion.div
              key={stage.etapa}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                stage.completed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              } ${onStageClick ? 'cursor-pointer' : ''}`}
              onClick={() => onStageClick?.(stage.etapa)}
            >
              {getStageIcon(stage)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {stage.etapa}. {stage.title}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getStageTypeColor(stage.type)}`}
                  >
                    {stage.type}
                  </Badge>
                </div>
                {stage.points > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {stage.points} pontos
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        {isLoading && (
          <div className="text-center py-4">
            <div className="text-sm text-gray-500">Carregando progresso...</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
