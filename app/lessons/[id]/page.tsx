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

export default function LessonPage() {
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
        router.push('/lessons')
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
    if (lessonData) {
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
    const pointsEarned = result.points || 0
    const timeSpent = result.timeSpent || 0

    setStageResults(prev => {
      const existing = prev.find(sr => sr.stageIndex === stageIndex)
      if (existing) {
        return prev.map(sr => 
          sr.stageIndex === stageIndex 
            ? { ...sr, result, pointsEarned, timeSpent }
            : sr
        )
      } else {
        return [...prev, { stageIndex, result, pointsEarned, timeSpent }]
      }
    })

    setTotalPoints(prev => prev + pointsEarned)
    setTotalTimeSpent(prev => prev + timeSpent)

    // Check if lesson is completed
    if (stageIndex === lessonData!.stages.length - 1) {
      setIsCompleted(true)
      toast.success('🎉 Parabéns! Você completou a aula!')
    }
  }

  const handleNext = () => {
    if (currentStage < lessonData!.stages.length - 1) {
      setCurrentStage(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
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
    toast.success('Aula reiniciada!')
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStageStatus = (stageIndex: number) => {
    const result = stageResults.find(sr => sr.stageIndex === stageIndex)
    if (result) return 'completed'
    if (stageIndex === currentStage) return 'current'
    if (stageIndex < currentStage) return 'available'
    return 'locked'
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
          <Button onClick={() => router.push('/lessons')}>
            Voltar para Aulas
          </Button>
        </div>
      </div>
    )
  }

  const currentStageData = lessonData.stages[currentStage]
  const progress = ((currentStage + 1) / lessonData.stages.length) * 100

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={() => router.push('/lessons')}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Badge variant="outline" className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {lessonData.metadata.subject}
          </Badge>
          <Badge variant="outline">
            {lessonData.metadata.grade}º ano
          </Badge>
          <Badge className={getDifficultyColor(lessonData.metadata.difficulty)}>
            {lessonData.metadata.difficulty}
          </Badge>
        </div>

        <h1 className="text-3xl font-bold mb-2">{lessonData.title}</h1>
        <p className="text-gray-600 mb-4">{lessonData.introduction}</p>

        {/* Lesson Stats */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm">{lessonData.metadata.duration}min</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-600" />
            <span className="text-sm">{totalPoints} pontos</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-green-600" />
            <span className="text-sm">{stageResults.length}/{lessonData.stages.length} etapas</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso da Aula</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Stage Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Etapas da Aula</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lessonData.stages.map((stage, index) => {
                const status = getStageStatus(index)
                const result = stageResults.find(sr => sr.stageIndex === index)
                
                return (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentStage(index)}
                    disabled={status === 'locked'}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      status === 'completed' 
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : status === 'current'
                        ? 'bg-blue-50 border border-blue-200 text-blue-800'
                        : status === 'available'
                        ? 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                        : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    whileHover={{ scale: status !== 'locked' ? 1.02 : 1 }}
                    whileTap={{ scale: status !== 'locked' ? 0.98 : 1 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        status === 'completed' ? 'bg-green-500 text-white' :
                        status === 'current' ? 'bg-blue-500 text-white' :
                        status === 'available' ? 'bg-gray-400 text-white' :
                        'bg-gray-300 text-gray-500'
                      }`}>
                        {status === 'completed' ? '✓' : index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{stage.etapa}</div>
                        <div className="text-xs opacity-75">{stage.type}</div>
                      </div>
                      {result && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs">{result.pointsEarned}</span>
                        </div>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="space-y-2">
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Reiniciar Aula
                </Button>
                {isCompleted && (
                  <Button
                    onClick={() => router.push('/lessons')}
                    size="sm"
                    className="w-full"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Ver Certificado
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <DynamicStage
              key={currentStage}
              stage={currentStageData}
              stageIndex={currentStage}
              totalStages={lessonData.stages.length}
              onComplete={handleStageComplete}
              onNext={handleNext}
              onPrevious={handlePrevious}
              canGoNext={currentStage < lessonData.stages.length - 1}
              canGoPrevious={currentStage > 0}
              timeSpent={stageResults.find(sr => sr.stageIndex === currentStage)?.timeSpent || 0}
              pointsEarned={stageResults.find(sr => sr.stageIndex === currentStage)?.pointsEarned || 0}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Objectives */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objetivos de Aprendizagem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {lessonData.objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">{objective}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
