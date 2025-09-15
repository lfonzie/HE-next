'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import DynamicStage from '@/components/interactive/DynamicStage'
import { ArrowLeft, BookOpen, Clock, Star, Trophy, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface LessonData {
  title: string
  objectives: string[]
  introduction: string
  stages: Array<{
    etapa: string
    type: string
    activity: any
    route: string
  }>
  feedback: any
  metadata: {
    subject: string
    grade: string
    duration: string
    difficulty: string
    tags: string[]
  }
}

interface StageResult {
  stageIndex: number
  result: any
  timeSpent: number
  pointsEarned: number
}

export default function AulaPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.id as string
  
  const [lessonData, setLessonData] = useState<LessonData | null>(null)
  const [currentStage, setCurrentStage] = useState(0)
  const [stageResults, setStageResults] = useState<StageResult[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [totalTimeSpent, setTotalTimeSpent] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)

  // Load lesson data
  useEffect(() => {
    const loadLesson = async () => {
      try {
        // Try to load from database first
        const response = await fetch(`/api/lessons/${lessonId}`)
        if (response.ok) {
          const data = await response.json()
          setLessonData(data)
        } else {
          // Fallback to static data for photosynthesis lesson
          if (lessonId === 'photosynthesis') {
            const staticData = await import('@/data/photosynthesis-lesson.json')
            setLessonData(staticData.default)
          } else {
            throw new Error('Lesson not found')
          }
        }
      } catch (error) {
        console.error('Error loading lesson:', error)
        toast.error('Erro ao carregar a aula')
        router.push('/aula')
      } finally {
        setIsLoading(false)
      }
    }

    loadLesson()
  }, [lessonId, router])

  // Load progress from localStorage
  useEffect(() => {
    if (lessonData) {
      const savedProgress = localStorage.getItem(`lesson_progress_${lessonId}`)
      if (savedProgress) {
        const progress = JSON.parse(savedProgress)
        setCurrentStage(progress.currentStage || 0)
        setStageResults(progress.stageResults || [])
        setTotalPoints(progress.totalPoints || 0)
        setTotalTimeSpent(progress.totalTimeSpent || 0)
        setIsCompleted(progress.isCompleted || false)
      }
    }
  }, [lessonData, lessonId])

  // Save progress to localStorage
  useEffect(() => {
    if (lessonData && currentStage > 0) {
      const progress = {
        currentStage,
        stageResults,
        totalPoints,
        totalTimeSpent,
        isCompleted
      }
      localStorage.setItem(`lesson_progress_${lessonId}`, JSON.stringify(progress))
    }
  }, [currentStage, stageResults, totalPoints, totalTimeSpent, isCompleted, lessonData, lessonId])

  const handleStageComplete = (stageIndex: number, result: any) => {
    const newResult: StageResult = {
      stageIndex,
      result,
      timeSpent: result.timeSpent || 0,
      pointsEarned: result.pointsEarned || 0
    }

    setStageResults(prev => [...prev, newResult])
    setTotalPoints(prev => prev + newResult.pointsEarned)
    setTotalTimeSpent(prev => prev + newResult.timeSpent)

    if (currentStage < lessonData!.stages.length - 1) {
      setCurrentStage(prev => prev + 1)
    } else {
      setIsCompleted(true)
      toast.success('Parabéns! Você completou a aula!')
    }
  }

  const handleNextStage = () => {
    if (currentStage < lessonData!.stages.length - 1) {
      setCurrentStage(prev => prev + 1)
    }
  }

  const handlePreviousStage = () => {
    if (currentStage > 0) {
      setCurrentStage(prev => prev - 1)
    }
  }

  const handleRestart = () => {
    setCurrentStage(0)
    setStageResults([])
    setTotalPoints(0)
    setTotalTimeSpent(0)
    setIsCompleted(false)
    localStorage.removeItem(`lesson_progress_${lessonId}`)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil'
      case 'medium': return 'Médio'
      case 'hard': return 'Difícil'
      default: return 'Indefinido'
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando aula...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!lessonData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Aula não encontrada</h1>
          <Button onClick={() => router.push('/aula')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Aulas
          </Button>
        </div>
      </div>
    )
  }

  const currentStageData = lessonData.stages[currentStage]
  const progressPercentage = ((currentStage + 1) / lessonData.stages.length) * 100

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/aula')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                {lessonData.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <Badge variant="outline">{lessonData.metadata.subject}</Badge>
                <Badge variant="outline">{lessonData.metadata.grade}º ano</Badge>
                <Badge className={getDifficultyColor(lessonData.metadata.difficulty)}>
                  {getDifficultyLabel(lessonData.metadata.difficulty)}
                </Badge>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {lessonData.metadata.duration} min
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Progresso</div>
            <div className="text-2xl font-bold text-blue-600">
              {currentStage + 1}/{lessonData.stages.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Etapa {currentStage + 1}: {currentStageData?.etapa}</span>
                <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {totalPoints} pontos
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {Math.round(totalTimeSpent / 60)} min
                  </div>
                </div>
                {isCompleted && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Trophy className="h-4 w-4" />
                    Concluída!
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Objectives */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Objetivos da Aula
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {lessonData.objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Current Stage */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStageData && (
            <DynamicStage
              stage={currentStageData}
              stageIndex={currentStage}
              totalStages={lessonData.stages.length}
              onComplete={handleStageComplete}
              onNext={handleNextStage}
              onPrevious={handlePreviousStage}
              canGoNext={currentStage < lessonData.stages.length - 1}
              canGoPrevious={currentStage > 0}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Completion Screen */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mt-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-center text-green-800 flex items-center justify-center gap-2">
                <Trophy className="h-6 w-6" />
                Parabéns! Aula Concluída!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
                  <div className="text-sm text-gray-600">Pontos Ganhos</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{Math.round(totalTimeSpent / 60)}</div>
                  <div className="text-sm text-gray-600">Minutos Estudados</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">{lessonData.stages.length}</div>
                  <div className="text-sm text-gray-600">Etapas Completadas</div>
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <Button onClick={handleRestart} variant="outline">
                  Refazer Aula
                </Button>
                <Button onClick={() => router.push('/aula')}>
                  Voltar para Aulas
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
