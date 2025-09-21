'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DynamicStage from '@/components/interactive/DynamicStage'
import { ArrowLeft, BookOpen, Trophy, Loader2, Keyboard, Star, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useProgressiveLoading } from '@/lib/progressive-lesson-loader'
import { ensureLessonStructure } from '@/lib/lesson-data-transformer'

interface LessonData {
  title: string
  objectives: string[]
  introduction: string
  slides?: Array<{
    slideNumber: number
    type: string
    title: string
    content: string
    imageUrl?: string
    imagePrompt?: string
    timeEstimate?: number
    question?: string
    options?: string[]
    correctAnswer?: number
    explanation?: string
  }>
  stages: Array<{
    etapa: string
    type: string
    activity: any
    route: string
  }>
  summary?: string
  nextSteps?: string[]
  feedback: any
  metadata: {
    subject: string
    grade: string
    duration: string
    difficulty: string
    tags: string[]
    status?: string
    backgroundGenerationStarted?: boolean
    initialSlidesLoaded?: number
    totalSlides?: number
    backgroundGenerationTimestamp?: string
    backgroundGenerationCompleted?: boolean
    backgroundGenerationCompletedTimestamp?: string
    totalSlidesGenerated?: number
    allSlidesLoaded?: boolean
  }
}

interface StageResult {
  stageIndex: number
  result: any
  timeSpent: number
  pointsEarned: number
}

// Default lesson structure for loading states
const DEFAULT_LESSON: LessonData = {
  title: 'Carregando aula...',
  objectives: [],
  introduction: 'Preparando conteúdo educacional...',
  slides: [],
  stages: [],
  summary: '',
  nextSteps: [],
  feedback: {},
  metadata: {
    subject: 'Carregando',
    grade: 'N/A',
    duration: 'N/A',
    difficulty: 'medium',
    tags: [],
    status: 'loading'
  }
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
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState('Preparando sua aula personalizada...')

  // Progressive loading system
  const { loadingState, isLoading: progressiveLoading, progress, startLoading } = useProgressiveLoading(lessonId)

  // Load lesson data from database or localStorage (demo mode)
  useEffect(() => {
    const loadLesson = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log(`[DEBUG] Loading lesson: ${lessonId}, attempt: ${retryCount + 1}`)
        
        // 1. Verificar cache local primeiro
        try {
          const { lessonCache } = await import('@/lib/lesson-cache')
          const cachedLesson = lessonCache.get(lessonId)
          
          if (cachedLesson) {
            console.log('⚡ Carregando aula do cache:', lessonId)
            const transformedLesson = ensureLessonStructure(cachedLesson) as LessonData
            setLessonData(transformedLesson)
            setIsLoading(false)
            return
          }
        } catch (cacheError) {
          console.warn('Cache not available:', cacheError)
        }

        // 2. Verificar localStorage primeiro (modo demo)
        const demoLessonKey = `demo_lesson_${lessonId}`
        const demoLesson = localStorage.getItem(demoLessonKey)
        
        if (demoLesson) {
          console.log('🎮 Carregando aula do localStorage (modo demo):', lessonId)
          try {
            const parsedLesson = JSON.parse(demoLesson)
            const transformedLesson = ensureLessonStructure(parsedLesson) as LessonData
            setLessonData(transformedLesson)
            setIsLoading(false)
            return
          } catch (parseError) {
            console.error('Erro ao fazer parse da aula do localStorage:', parseError)
          }
        }
        
        // 3. Carregamento rápido do banco (com autenticação)
        try {
          console.log(`[DEBUG] Loading lesson from database: ${lessonId}`)
          const response = await fetch(`/api/lessons/fast-load`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lessonId })
          })
          
          if (response.ok) {
            const data = await response.json()
            console.log(`[DEBUG] Lesson found in database:`, data.lesson?.title)
            const transformedLesson = ensureLessonStructure(data.lesson)
            setLessonData(transformedLesson)
            
            // Adicionar ao cache para próximas vezes
            try {
              const { lessonCache } = await import('@/lib/lesson-cache')
              lessonCache.set(lessonId, data.lesson)
            } catch (cacheError) {
              console.warn('Could not cache lesson:', cacheError)
            }
            
            setIsLoading(false)
            return
          } else if (response.status === 404) {
            const errorData = await response.json()
            
            // Check if lesson is being generated
            if (errorData.status === 'generating') {
              console.log('Lesson is being generated, showing loading state')
              setLessonData({ 
                ...DEFAULT_LESSON, 
                title: `Gerando aula sobre ${lessonId}`
              })
              
              // Retry after 3 seconds
              setTimeout(() => {
                console.log('Retrying lesson load after generation delay')
                loadLesson()
              }, 3000)
              
              return
            }
            
            throw new Error('Lesson not found in database')
          } else if (response.status === 401) {
            throw new Error('Authentication required')
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
        } catch (dbError) {
          console.log('Fast load failed, trying regular load:', dbError)
          
          // 4. Fallback para carregamento regular
          try {
            const response = await fetch(`/api/lessons/${lessonId}`)
            if (response.ok) {
              const data = await response.json()
              const transformedLesson = ensureLessonStructure(data.lesson)
              setLessonData(transformedLesson)
              
              // Adicionar ao cache
              try {
                const { lessonCache } = await import('@/lib/lesson-cache')
                lessonCache.set(lessonId, data.lesson)
              } catch (cacheError) {
                console.warn('Could not cache lesson:', cacheError)
              }
              
              setIsLoading(false)
              return
            } else if (response.status === 401) {
              throw new Error('Authentication required')
            } else {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
          } catch (regularError) {
            console.log('Regular load also failed:', regularError)
            throw regularError
          }
        }
        
        // 5. Se chegou até aqui, a aula não foi encontrada
        console.log('Aula não encontrada:', lessonId)
        setError('Aula não encontrada')
        setIsLoading(false)
        return
      } catch (error) {
        console.error('Erro ao carregar aula:', error)
        
        // Handle authentication errors specifically
        if (error instanceof Error && error.message === 'Authentication required') {
          setError('Você precisa estar logado para acessar esta aula')
          setIsLoading(false)
          return
        }
        
        setError(error instanceof Error ? error.message : 'Erro desconhecido')
        
        // Only show error after multiple failed attempts
        if (retryCount >= 3) {
          toast.error('Erro ao carregar a aula')
          setIsLoading(false)
        } else {
          // Retry with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000)
          console.log(`Retrying lesson load in ${delay}ms (attempt ${retryCount + 1})`)
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
            loadLesson()
          }, delay)
        }
      }
    }

    loadLesson()
  }, [lessonId, retryCount])

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
    const totalStages = lessonData?.stages?.length || 0
    if (stageIndex === totalStages - 1) {
      setIsCompleted(true)
      toast.success('🎉 Parabéns! Você completou a aula!')
    }
  }

  const handleNext = () => {
    const totalStages = lessonData?.stages?.length || 0
    
    if (currentStage < totalStages - 1) {
      setCurrentStage(prev => prev + 1)
      // Scroll to top when changing slides
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentStage > 0) {
      setCurrentStage(prev => prev - 1)
      // Scroll to top when changing slides
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Navegação por teclado
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Evitar conflitos quando estiver digitando em inputs
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        return
      }

      // Verificar se estamos em transição ou carregando
      if (isLoading || progressiveLoading) {
        return
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          handlePrevious()
          break
        case 'ArrowRight':
          event.preventDefault()
          handleNext()
          break
        case 'Escape':
          event.preventDefault()
          // Voltar para a lista de aulas
          router.push('/aulas')
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentStage, isLoading, progressiveLoading, router])


  // Show lesson immediately when lessonData is available
  useEffect(() => {
    if (lessonData && lessonData.stages && lessonData.stages.length > 0) {
      console.log('[DEBUG] Lesson data loaded, showing lesson immediately')
      setIsLoading(false)
    }
  }, [lessonData])


  const handleRestart = () => {
    setCurrentStage(0)
    setStageResults([])
    setTotalPoints(0)
    setTotalTimeSpent(0)
    setIsCompleted(false)
    localStorage.removeItem(`lesson_progress_${lessonId}`)
    toast.success('Aula reiniciada!')
  }

  // Difficulty badges removed from header UI

  const getStageStatus = (stageIndex: number) => {
    const result = stageResults.find(sr => sr.stageIndex === stageIndex)
    if (result) return 'completed'
    if (stageIndex === currentStage) return 'current'
    if (stageIndex < currentStage) return 'available'
    return 'locked'
  }

  if (isLoading || progressiveLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center animate-pulse shadow-lg">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-gray-900">
              Preparando sua aula...
            </h2>
            <p className="text-lg text-gray-600">
              Aguarde enquanto carregamos todo o conteúdo
            </p>
          </div>
          
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
          </div>
        </div>
      </div>
    )
  }

  if (!lessonData && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-white/90 backdrop-blur-sm border-2 border-yellow-200 shadow-xl rounded-3xl">
          <CardContent className="pt-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="h-20 w-20 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BookOpen className="h-10 w-10 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">
                  Aula não encontrada
                </h2>
                <p className="text-lg text-gray-600">
                  {error}
                </p>
              </div>
              
              <div className="space-y-3">
                {error === 'Você precisa estar logado para acessar esta aula' ? (
                  <>
                    <Button 
                      onClick={() => router.push('/login')}
                      className="w-full"
                    >
                      Fazer Login
                    </Button>
                    <Button 
                      onClick={() => router.push('/aulas')}
                      variant="outline"
                      className="w-full"
                    >
                      Voltar para Aulas
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={() => {
                        setError(null)
                        setRetryCount(0)
                        setIsLoading(true)
                      }}
                      className="w-full"
                    >
                      Tentar Novamente
                    </Button>
                    <Button 
                      onClick={() => router.push('/aulas')}
                      variant="outline"
                      className="w-full"
                    >
                      Voltar para Aulas
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Use lesson stages from database with validation
  const totalStages = lessonData?.stages?.length || 0
  const stagesToUse = lessonData?.stages || []

  // Add debugging for stage data
  console.log('[DEBUG] Lesson data structure:', {
    hasStages: !!lessonData?.stages,
    stagesLength: lessonData?.stages?.length,
    currentStage,
    totalStages
  });

  if (totalStages === 0) {
    console.error('[ERROR] No stages found in lesson data:', lessonData);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  Aula sem conteúdo
                </h2>
                <p className="text-gray-600">
                  Esta aula não possui etapas definidas.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/aulas')}
                  className="w-full"
                >
                  Voltar para Aulas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStageData = stagesToUse[currentStage]
  
  // Validate current stage data
  if (!currentStageData) {
    console.error('[ERROR] Current stage data is undefined:', { currentStage, totalStages, stagesToUse });
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  Etapa não encontrada
                </h2>
                <p className="text-gray-600">
                  A etapa {currentStage + 1} não foi encontrada nesta aula.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => setCurrentStage(0)}
                  className="w-full"
                >
                  Ir para Primeira Etapa
                </Button>
                <Button 
                  onClick={() => router.push('/aulas')}
                  variant="outline"
                  className="w-full"
                >
                  Voltar para Aulas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Stage progress UI removed

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* TOPO LIMPO - SEM BOTÕES VOLTAR OU BANNERS AZUIS */}
        {/* Botão Voltar e instruções estão APENAS no footer abaixo */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Stage Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-yellow-200 shadow-xl rounded-3xl">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-t-3xl">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  Etapas da Aula
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
              {stagesToUse.map((stage, index) => {
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
                    onClick={() => router.push('/aulas')}
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
            {(() => {
              console.log('[DEBUG] Rendering DynamicStage with data:', {
                currentStage,
                stageData: currentStageData,
                hasActivity: !!currentStageData?.activity,
                activityComponent: currentStageData?.activity?.component
              });
              
              return (
                <DynamicStage
                  key={currentStage}
                  stage={currentStageData}
                  stageIndex={currentStage}
                  totalStages={totalStages}
                  onComplete={handleStageComplete}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  canGoNext={currentStage < totalStages - 1}
                  canGoPrevious={currentStage > 0}
                  timeSpent={stageResults.find(sr => sr.stageIndex === currentStage)?.timeSpent || 0}
                  pointsEarned={stageResults.find(sr => sr.stageIndex === currentStage)?.pointsEarned || 0}
                  lessonTheme={lessonData?.metadata?.subject || lessonData?.title?.toLowerCase() || 'geral'}
                  lessonData={lessonData ? {
                    title: lessonData.title,
                    totalPoints,
                    totalTimeSpent,
                    stageResults
                  } : undefined}
                  onRestart={handleRestart}
                  onNewLesson={() => router.push('/aulas')}
                />
              );
            })()}
          </AnimatePresence>
        </div>
      </div>

      {/* Objectives */}
      {lessonData?.objectives && lessonData.objectives.length > 0 && (
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
      )}

      {/* Summary and Next Steps */}
      {lessonData && (lessonData.summary || lessonData.nextSteps) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {lessonData.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Resumo da Aula
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{lessonData.summary}</p>
              </CardContent>
            </Card>
          )}

          {lessonData.nextSteps && lessonData.nextSteps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Próximos Passos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {lessonData.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Footer com navegação por teclado e botão voltar - movido para baixo */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Botão Voltar */}
          <Button
            onClick={() => router.push('/aulas')}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Aulas
          </Button>

          {/* Keyboard Navigation Help */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Keyboard className="h-4 w-4" />
              <span className="font-medium">Navegação por teclado:</span>
              <span>← → para navegar entre slides</span>
              <span>•</span>
              <span>Esc para voltar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
