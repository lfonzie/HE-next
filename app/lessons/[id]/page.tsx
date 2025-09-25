'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
// import { Skeleton } from '@/components/ui/skeleton' // Commented out - not available
import DynamicStage from '@/components/interactive/DynamicStage'
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Star, 
  Trophy, 
  Target,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  PlayCircle,
  Lock,
  Bookmark,
  Share2,
  Download
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useLessonsProgressiveLoading } from '@/hooks/useLessonsProgressiveLoading'
// import { useLocalStorage } from '@/hooks/useLocalStorage' // Commented out - not available
// import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts' // Commented out - not available

// Enhanced TypeScript Interfaces
interface LessonMetadata {
  subject: string
  grade: string
  duration: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  author?: string
  createdAt?: string
  estimatedPoints?: number
}

interface Slide {
  slideNumber: number
  type: 'explanation' | 'question' | 'interactive' | 'video'
  title: string
  content: string
  imageUrl?: string
  imagePrompt?: string
  timeEstimate?: number
  question?: string
  options?: string[]
  correctAnswer?: number
  explanation?: string
  hint?: string
}

interface StageActivity {
  component: string
  content: string
  prompt: string
  questions?: Array<{
    q: string
    options: string[]
    correct: number
    explanation: string
    hint?: string
    points?: number
  }>
  media: string[]
  time: number
  points: number
  feedback: string
  imagePrompt?: string
  imageUrl?: string
  interactions?: Record<string, any>
}

interface Stage {
  etapa: string
  type: 'quiz' | 'explanation' | 'interactive'
  activity: StageActivity
  route: string
  prerequisites?: number[]
  isOptional?: boolean
}

interface LessonData {
  id?: string
  title: string
  objectives: string[]
  introduction: string
  slides?: Slide[]
  stages: Stage[]
  summary?: string
  nextSteps?: string[]
  feedback: Record<string, any>
  metadata: LessonMetadata
  estimatedDuration?: number
  completionCriteria?: {
    minScore?: number
    requiredStages?: number[]
  }
}

interface StageResult {
  stageIndex: number
  result: any
  timeSpent: number
  pointsEarned: number
  attempts?: number
  completedAt?: string
  score?: number
}

interface LessonProgress {
  currentStage: number
  stageResults: StageResult[]
  totalPoints: number
  totalTimeSpent: number
  isCompleted: boolean
  lastAccessedAt: string
  completedAt?: string
  bookmarked?: boolean
}

// Enhanced Constants
const DIFFICULTY_CONFIG = {
  easy: { 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: '●',
    description: 'Fácil - Conceitos básicos'
  },
  medium: { 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    icon: '●●',
    description: 'Médio - Conceitos intermediários'
  },
  hard: { 
    color: 'bg-red-100 text-red-800 border-red-200', 
    icon: '●●●',
    description: 'Difícil - Conceitos avançados'
  },
} as const

const STAGE_STATUS_CONFIG = {
  completed: {
    bgColor: 'bg-green-50 border-green-200 text-green-800',
    iconColor: 'bg-green-500 text-white',
    icon: CheckCircle,
  },
  current: {
    bgColor: 'bg-blue-50 border-blue-200 text-blue-800',
    iconColor: 'bg-blue-500 text-white',
    icon: PlayCircle,
  },
  available: {
    bgColor: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
    iconColor: 'bg-gray-400 text-white',
    icon: PlayCircle,
  },
  locked: {
    bgColor: 'bg-gray-100 border-gray-200 text-gray-400',
    iconColor: 'bg-gray-300 text-gray-500',
    icon: Lock,
  },
} as const

const DEFAULT_LESSON: LessonData = {
  title: 'Aula Interativa',
  objectives: ['Aprender conceitos fundamentais', 'Desenvolver compreensão prática'],
  introduction: 'Aula interativa gerada com IA',
  stages: [],
  feedback: {},
  metadata: {
    subject: 'Geral',
    grade: '5',
    duration: '45',
    difficulty: 'medium',
    tags: [],
  },
}

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const stageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
}

/**
 * Enhanced LessonPage component with improved UX, accessibility, and performance
 */
export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const lessonId = params.id as string
  const startStage = parseInt(searchParams?.get('stage') || '0')
  
  const progressiveLoading = useLessonsProgressiveLoading()
  const progressRef = useRef<HTMLDivElement>(null)
  const stageNavRef = useRef<HTMLDivElement>(null)

  // Enhanced state management
  const [lessonData, setLessonData] = useState<LessonData | null>(null)
  const [currentStage, setCurrentStage] = useState(startStage)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Use useState for localStorage with better error handling
  const [progress, setProgress] = useState<LessonProgress>(() => {
    // Verificar se estamos no browser antes de acessar localStorage
    if (typeof window === 'undefined') {
      return {
        currentStage: startStage,
        stageResults: [],
        totalPoints: 0,
        totalTimeSpent: 0,
        isCompleted: false,
        lastAccessedAt: new Date().toISOString(),
      }
    }
    
    try {
      const saved = localStorage.getItem(`lesson_progress_${lessonId}`)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    }
    return {
      currentStage: startStage,
      stageResults: [],
      totalPoints: 0,
      totalTimeSpent: 0,
      isCompleted: false,
      lastAccessedAt: new Date().toISOString(),
    }
  })

  // Sync progress with localStorage
  useEffect(() => {
    // Verificar se estamos no browser antes de acessar localStorage
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(`lesson_progress_${lessonId}`, JSON.stringify(progress))
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }, [progress, lessonId])

  /**
   * Navigation handlers with validation
   */
  const handleNext = useCallback(() => {
    const availableSlides = progressiveLoading.getAvailableSlides()
    const totalStages = Math.max(lessonData?.stages.length ?? 0, availableSlides.length)
    
    if (currentStage < totalStages - 1) {
      setCurrentStage(prev => prev + 1)
      
      // Load next slide if needed
      if (currentStage >= availableSlides.length - 1 && availableSlides.length < 9) {
        progressiveLoading.loadNextSlide(lessonId, 'Geral', availableSlides.length)
      }
    }
  }, [currentStage, lessonData, progressiveLoading, lessonId])

  const handlePrevious = useCallback(() => {
    if (currentStage > 0) {
      setCurrentStage(prev => prev - 1)
    }
  }, [currentStage])

  /**
   * Enhanced restart with confirmation
   */
  const handleRestart = useCallback(() => {
    if (progress.stageResults.length > 0) {
      const confirmed = window.confirm(
        'Tem certeza que deseja reiniciar a aula? Todo o progresso será perdido.'
      )
      if (!confirmed) return
    }

    setCurrentStage(0)
    setProgress({
      currentStage: 0,
      stageResults: [],
      totalPoints: 0,
      totalTimeSpent: 0,
      isCompleted: false,
      lastAccessedAt: new Date().toISOString(),
    })
    
    toast.success('Aula reiniciada com sucesso!')
  }, [progress.stageResults.length, setProgress])

  /**
   * Additional utility functions
   */
  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev)
  }, [])

  // Keyboard shortcuts - commented out until hook is available
  // useKeyboardShortcuts({
  //   'ArrowLeft': handlePrevious,
  //   'ArrowRight': handleNext,
  //   'KeyR': handleRestart,
  //   'Escape': () => router.push('/lessons'),
  //   'KeyS': handleToggleSidebar,
  // })

  /**
   * Enhanced lesson loading with better error handling and retry logic
   */
  const loadLesson = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true)
      setError(null)

      // Try API first
      const response = await fetch(`/api/lessons/${lessonId}`, {
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setLessonData({
          ...data.lesson,
          id: lessonId,
        })
        return
      }

      if (response.status === 404) {
        // Try localStorage fallback
        const demoLesson = localStorage.getItem(`demo_lesson_${lessonId}`)
        if (demoLesson) {
          const lesson = JSON.parse(demoLesson)
          setLessonData({
            ...DEFAULT_LESSON,
            id: lessonId,
            title: lesson.title,
            objectives: lesson.objectives,
            introduction: lesson.introduction || DEFAULT_LESSON.introduction,
            stages: lesson.stages,
            feedback: lesson.feedback,
            metadata: {
              ...DEFAULT_LESSON.metadata,
              subject: lesson.subject,
              grade: lesson.level?.toString() ?? '5',
            },
          })
          return
        }

        // Try static data
        if (lessonId === 'photosynthesis') {
          const staticData = await import('@/data/photosynthesis-lesson.json')
        setLessonData({
          ...staticData.default,
          id: lessonId,
        } as unknown as LessonData)
          return
        }

        // Start progressive loading
        await progressiveLoading.startProgressiveLoading(lessonId, 'Geral')
        setLessonData({ 
          ...DEFAULT_LESSON, 
          id: lessonId,
          title: `Aula sobre ${lessonId}` 
        })
        return
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`)

    } catch (error) {
      console.error('Erro ao carregar aula:', error)
      
      if (retryCount < 2) {
        setTimeout(() => loadLesson(retryCount + 1), 1000 * (retryCount + 1))
        return
      }

      setError(error instanceof Error ? error.message : 'Erro desconhecido')
      toast.error('Não foi possível carregar a aula. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }, [lessonId, progressiveLoading])

  // Load lesson on mount
  useEffect(() => {
    loadLesson()
  }, [loadLesson])

  // Sync current stage with URL
  useEffect(() => {
    if (progress.currentStage !== currentStage) {
      const url = new URL(window.location.href)
      url.searchParams.set('stage', currentStage.toString())
      window.history.replaceState({}, '', url.toString())
    }
  }, [currentStage, progress.currentStage])

  // Update progress when stage changes
  useEffect(() => {
    if (lessonData && currentStage !== progress.currentStage) {
      setProgress((prev: LessonProgress) => ({
        ...prev,
        currentStage,
        lastAccessedAt: new Date().toISOString(),
      }))
    }
  }, [currentStage, lessonData, progress.currentStage, setProgress])

  /**
   * Enhanced stage completion handler with validation
   */
  const handleStageComplete = useCallback((stageIndex: number, result: any) => {
    if (!lessonData) return

    const pointsEarned = Math.max(0, result.points ?? 0)
    const timeSpent = Math.max(0, result.timeSpent ?? 0)
    const attempts = Math.max(1, result.attempts ?? 1)
    const score = result.score ?? 0

    setProgress((prev: LessonProgress) => {
      const existingResultIndex = prev.stageResults.findIndex((sr: StageResult) => sr.stageIndex === stageIndex)
      const newResult: StageResult = {
        stageIndex,
        result,
        pointsEarned,
        timeSpent,
        attempts,
        score,
        completedAt: new Date().toISOString(),
      }

      let updatedResults: StageResult[]
      let pointsDiff = pointsEarned
      let timeDiff = timeSpent

      if (existingResultIndex >= 0) {
        // Update existing result
        const existingResult = prev.stageResults[existingResultIndex]
        pointsDiff = pointsEarned - existingResult.pointsEarned
        timeDiff = timeSpent - existingResult.timeSpent
        
        updatedResults = prev.stageResults.map((sr: StageResult, index: number) =>
          index === existingResultIndex ? newResult : sr
        )
      } else {
        // Add new result
        updatedResults = [...prev.stageResults, newResult]
      }

      const newTotalPoints = Math.max(0, prev.totalPoints + pointsDiff)
      const newTotalTimeSpent = Math.max(0, prev.totalTimeSpent + timeDiff)
      
      // Check completion
      const availableSlides = progressiveLoading.getAvailableSlides()
      const totalStages = Math.max(lessonData.stages.length, availableSlides.length)
      const isCompleted = updatedResults.length >= totalStages &&
        updatedResults.every((r: StageResult) => (r.score ?? 0) >= (lessonData.completionCriteria?.minScore ?? 0))

      if (isCompleted && !prev.isCompleted) {
        toast.success('🎉 Parabéns! Você completou a aula!')
      }

      return {
        ...prev,
        stageResults: updatedResults,
        totalPoints: newTotalPoints,
        totalTimeSpent: newTotalTimeSpent,
        isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : prev.completedAt,
        lastAccessedAt: new Date().toISOString(),
      }
    })

    // Load next slide if needed
    const availableSlides = progressiveLoading.getAvailableSlides()
    if (stageIndex >= availableSlides.length - 1 && availableSlides.length < 9) {
      progressiveLoading.loadNextSlide(lessonId, 'Geral', availableSlides.length)
    }
  }, [lessonData, lessonId, progressiveLoading, setProgress])


  const handleBookmark = useCallback(() => {
    setProgress((prev: LessonProgress) => ({
      ...prev,
      bookmarked: !prev.bookmarked,
      lastAccessedAt: new Date().toISOString(),
    }))
    
    toast.success(progress.bookmarked ? 'Bookmark removido' : 'Aula marcada como favorita')
  }, [progress.bookmarked, setProgress])

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/lessons/${lessonId}?stage=${currentStage}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: lessonData?.title ?? 'Aula Interativa',
          text: lessonData?.introduction ?? 'Confira esta aula interativa',
          url,
        })
      } catch (error) {
        console.log('Compartilhamento cancelado')
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copiado para a área de transferência!')
    }
  }, [lessonId, currentStage, lessonData])

  // Enhanced memoized calculations
  const stagesToUse = useMemo(() => {
    const availableSlides = progressiveLoading.getAvailableSlides()
    if (availableSlides.length > 0) {
      return availableSlides.map((slide, index) => ({
        etapa: slide.title,
        type: slide.type === 'question' ? 'quiz' : 'explanation',
        activity: {
          component: slide.type === 'question' ? 'QuizComponent' : 'AnimationSlide',
          content: slide.content,
          prompt: slide.question ?? slide.content,
          questions: slide.type === 'question' ? [{
            q: slide.question ?? '',
            options: slide.options ?? [],
            correct: slide.correctAnswer ?? 0,
            explanation: slide.explanation ?? '',
            hint: (slide as any).hint ?? undefined,
            points: 10,
          }] : [],
          media: [],
          time: slide.timeEstimate ?? 5,
          points: slide.type === 'question' ? 10 : 5,
          feedback: slide.explanation ?? 'Bom trabalho!',
          imagePrompt: slide.imagePrompt,
          imageUrl: slide.imageUrl,
        },
        route: `/lessons/${lessonId}/slide-${index + 1}`,
      })) as Stage[]
    }
    return lessonData?.stages ?? []
  }, [lessonData, lessonId, progressiveLoading])

  /**
   * Enhanced stage status calculation
   */
  const getStageStatus = useCallback((stageIndex: number): keyof typeof STAGE_STATUS_CONFIG => {
    const result = progress.stageResults.find((sr: StageResult) => sr.stageIndex === stageIndex)
    if (result) return 'completed'
    if (stageIndex === currentStage) return 'current'
    if (stageIndex < currentStage) return 'available'
    
    // Check prerequisites
    const stage = stagesToUse[stageIndex]
    if (stage?.prerequisites?.some((prereq: number) => !progress.stageResults.find((sr: StageResult) => sr.stageIndex === prereq))) {
      return 'locked'
    }
    
    return 'available'
  }, [currentStage, progress.stageResults, stagesToUse])

  const totalStages = Math.max(lessonData?.stages.length ?? 0, stagesToUse.length)
  const completionPercentage = useMemo(() => {
    if (totalStages === 0) return 0
    return Math.round(((currentStage + 1) / totalStages) * 100)
  }, [currentStage, totalStages])

  const currentStageData = stagesToUse[currentStage]

  // Enhanced loading states
  if (isLoading || progressiveLoading.loadingState.isLoading) {
    return (
      <motion.div 
        className="container mx-auto px-4 py-8" 
        role="main"
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <div className="space-y-2">
              <p className="text-gray-600 font-medium">
                {progressiveLoading.loadingState.message ?? 'Carregando aula...'}
              </p>
              {progressiveLoading.loadingState.progress > 0 && (
                <div className="w-64 mx-auto space-y-2">
                  <Progress value={progressiveLoading.loadingState.progress} className="h-2" />
                  <p className="text-sm text-gray-500">
                    {progressiveLoading.loadingState.progress}% • {progressiveLoading.loadingState.formattedTime}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Error state
  if (error || !lessonData) {
    return (
      <motion.div 
        className="container mx-auto px-4 py-8" 
        role="main"
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900">
            {error ? 'Erro ao carregar aula' : 'Aula não encontrada'}
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            {error || 'A aula solicitada não foi encontrada. Verifique o link e tente novamente.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => loadLesson()} variant="outline">
              Tentar Novamente
            </Button>
            <Button onClick={() => router.push('/lessons')}>
              Voltar para Aulas
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  const difficultyConfig = DIFFICULTY_CONFIG[lessonData.metadata.difficulty]

  return (
    <motion.div 
      className="container mx-auto px-4 py-6 max-w-7xl" 
      role="main"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      {/* Enhanced Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/lessons')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {lessonData.metadata.subject}
              </Badge>
              <Badge variant="outline">{lessonData.metadata.grade}º ano</Badge>
              <Badge className={`${difficultyConfig.color} border`}>
                <span className="mr-1">{difficultyConfig.icon}</span>
                {lessonData.metadata.difficulty}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleBookmark}
              variant="ghost"
              size="sm"
              className={progress.bookmarked ? 'text-yellow-600' : ''}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button onClick={handleShare} variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button onClick={handleToggleSidebar} variant="ghost" size="sm">
              <Target className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{lessonData.title}</h1>
            <p className="text-gray-600 text-lg leading-relaxed">{lessonData.introduction}</p>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-blue-900">{lessonData.metadata.duration}min</div>
                <div className="text-xs text-blue-600">Duração</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-sm font-medium text-yellow-900">{progress.totalPoints}</div>
                <div className="text-xs text-yellow-600">Pontos</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm font-medium text-green-900">
                  {progress.stageResults.length}/{totalStages}
                </div>
                <div className="text-xs text-green-600">Etapas</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <Trophy className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm font-medium text-purple-900">
                  {Math.round(progress.totalTimeSpent / 60)}min
                </div>
                <div className="text-xs text-purple-600">Tempo gasto</div>
              </div>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Progresso da Aula</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{completionPercentage}%</span>
                {progress.isCompleted && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Concluído
                  </Badge>
                )}
              </div>
            </div>
            <Progress value={completionPercentage} className="h-3" ref={progressRef} />
          </div>
        </div>
      </header>

      {/* Enhanced Main Content Grid */}
      <div className={`grid gap-8 transition-all duration-300 ${
        sidebarCollapsed ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'
      }`}>
        {/* Enhanced Sidebar */}
        {!sidebarCollapsed && (
          <motion.aside 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="sticky top-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Etapas da Aula</CardTitle>
                  <Button
                    onClick={handleToggleSidebar}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ScrollArea className="h-[60vh]" ref={stageNavRef}>
                  <div className="space-y-2">
                    {stagesToUse.map((stage, index) => {
                      const status = getStageStatus(index)
                      const result = progress.stageResults.find((sr: StageResult) => sr.stageIndex === index)
                      const config = STAGE_STATUS_CONFIG[status]
                      const IconComponent = config.icon

                      return (
                        <motion.button
                          key={index}
                          onClick={() => setCurrentStage(index)}
                          disabled={status === 'locked'}
                          className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${config.bgColor} ${
                            status !== 'locked' ? 'hover:shadow-sm active:scale-95' : 'cursor-not-allowed'
                          }`}
                          whileHover={{ scale: status !== 'locked' ? 1.02 : 1 }}
                          aria-label={`Ir para etapa ${index + 1}: ${stage.etapa}`}
                          aria-current={status === 'current' ? 'step' : undefined}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${config.iconColor}`}>
                              {status === 'completed' ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <span className="text-xs font-medium">
                                  {status === 'locked' ? <Lock className="h-3 w-3" /> : index + 1}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{stage.etapa}</div>
                              <div className="text-xs opacity-75 flex items-center gap-1">
                                <span className="capitalize">{stage.type}</span>
                                {stage.activity.time && (
                                  <>
                                    <span>•</span>
                                    <span>{stage.activity.time}min</span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1">
                              {result && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span className="text-xs font-medium">{result.pointsEarned}</span>
                                </div>
                              )}
                              {result?.attempts && result.attempts > 1 && (
                                <div className="text-xs text-gray-500">
                                  {result.attempts} tentativas
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {status === 'current' && (
                            <div className="mt-2 w-full bg-blue-200 rounded-full h-1">
                              <div 
                                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                style={{ width: '30%' }} // This could be dynamic based on stage progress
                              />
                            </div>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </ScrollArea>

                <Separator className="my-4" />
                
                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handleRestart}
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reiniciar Aula
                  </Button>
                  
                  {progress.isCompleted && (
                    <Button
                      onClick={() => router.push('/lessons')}
                      size="sm"
                      className="w-full flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      <Trophy className="h-4 w-4" />
                      Ver Certificado
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full flex items-center gap-2"
                    onClick={() => {
                      // Download progress report
                      const progressData = {
                        lessonTitle: lessonData.title,
                        completionDate: progress.completedAt,
                        totalPoints: progress.totalPoints,
                        totalTimeSpent: progress.totalTimeSpent,
                        stageResults: progress.stageResults,
                      }
                      const blob = new Blob([JSON.stringify(progressData, null, 2)], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `progresso-${lessonId}.json`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Baixar Progresso
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.aside>
        )}

        {/* Enhanced Main Content */}
        <main className={sidebarCollapsed ? 'col-span-1' : 'lg:col-span-3'}>
          <AnimatePresence mode="wait">
            {currentStageData ? (
              <motion.div
                key={currentStage}
                variants={stageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <DynamicStage
                  stage={currentStageData}
                  stageIndex={currentStage}
                  totalStages={totalStages}
                  onComplete={handleStageComplete}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  canGoNext={currentStage < totalStages - 1}
                  canGoPrevious={currentStage > 0}
                  timeSpent={progress.stageResults.find((sr: StageResult) => sr.stageIndex === currentStage)?.timeSpent ?? 0}
                  pointsEarned={progress.stageResults.find((sr: StageResult) => sr.stageIndex === currentStage)?.pointsEarned ?? 0}
                />
              </motion.div>
            ) : (
              <Card className="p-8 text-center">
                <div className="space-y-4">
                  <div className="text-gray-400 text-6xl">📚</div>
                  <h3 className="text-xl font-semibold text-gray-700">Etapa não encontrada</h3>
                  <p className="text-gray-600">
                    Esta etapa ainda não foi carregada ou não existe.
                  </p>
                  <Button onClick={() => setCurrentStage(0)} variant="outline">
                    Voltar para o início
                  </Button>
                </div>
              </Card>
            )}
          </AnimatePresence>

          {/* Enhanced Navigation */}
          <div className="flex items-center justify-between mt-6 p-4 bg-gray-50 rounded-lg">
            <Button
              onClick={handlePrevious}
              disabled={currentStage === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {currentStage + 1} de {totalStages}
              </span>
              {sidebarCollapsed && (
                <Button
                  onClick={handleToggleSidebar}
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                >
                  <Target className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Button
              onClick={handleNext}
              disabled={currentStage >= totalStages - 1}
              className="flex items-center gap-2"
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </main>
      </div>

      {/* Enhanced Learning Objectives */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Objetivos de Aprendizagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {lessonData.objectives.map((objective, index) => {
                const isCompleted = progress.isCompleted
                return (
                  <div 
                    key={index} 
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      isCompleted ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                      isCompleted ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-white" />
                      ) : (
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${isCompleted ? 'text-green-800' : 'text-gray-700'}`}>
                        {objective}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Summary and Next Steps */}
      {(lessonData.summary || lessonData.nextSteps?.length) && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {lessonData.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  Resumo da Aula
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed">{lessonData.summary}</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {lessonData.nextSteps?.length && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-emerald-600" />
                  Próximos Passos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lessonData.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                        <span className="text-emerald-600 text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Progress Summary for Completed Lessons */}
      {progress.isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Trophy className="h-6 w-6" />
                Parabéns! Aula Concluída
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{progress.totalPoints}</div>
                  <div className="text-sm text-green-600">Pontos Totais</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">
                    {Math.round(progress.totalTimeSpent / 60)}min
                  </div>
                  <div className="text-sm text-green-600">Tempo Gasto</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{progress.stageResults.length}</div>
                  <div className="text-sm text-green-600">Etapas Concluídas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">
                    {Math.round(progress.stageResults.reduce((acc: number, r: StageResult) => acc + (r.score || 0), 0) / progress.stageResults.length)}%
                  </div>
                  <div className="text-sm text-green-600">Nota Média</div>
                </div>
              </div>
              
              {progress.completedAt && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-sm text-green-700 text-center">
                    Concluído em {new Date(progress.completedAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}