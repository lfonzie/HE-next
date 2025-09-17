'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Flag,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Keyboard,
  Eye,
  EyeOff,
  BookOpen,
  Target,
  Timer,
} from 'lucide-react'
import { EnemItem, EnemResponse, EnemScore, EnemMode, EnemArea } from '@/types/enem'
import { useToast } from '@/hooks/use-toast'
import { ExamGenerationLoading } from '@/components/enem/EnemLoadingStates'

// Enhanced TypeScript Interfaces
interface QuestionSource {
  text: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  icon?: string
}

interface ExamSession {
  startTime: Date
  questionStartTimes: Map<string, number>
  tabSwitchEvents: Array<{ timestamp: Date; questionIndex: number }>
}

// Enhanced Constants
const PROGRESS_STEPS = [
  { progress: 15, message: 'Configurando simulado ENEM...', icon: '⚙️' },
  { progress: 35, message: 'Selecionando questões oficiais...', icon: '📚' },
  { progress: 55, message: 'Analisando competências...', icon: '🎯' },
  { progress: 75, message: 'Preparando sistema TRI...', icon: '📊' },
  { progress: 90, message: 'Otimizando experiência...', icon: '✨' },
  { progress: 100, message: 'Simulado pronto!', icon: '🚀' },
]

const KEYBOARD_SHORTCUTS = {
  'ArrowLeft': 'Questão anterior',
  'ArrowRight': 'Próxima questão',
  '1-5': 'Selecionar alternativas A-E',
  'Space': 'Próxima questão',
  'Enter': 'Confirmar resposta',
  'F': 'Finalizar simulado (última questão)',
} as const

const DIFFICULTY_COLORS = {
  'Fácil': 'bg-green-100 text-green-800',
  'Médio': 'bg-yellow-100 text-yellow-800',
  'Difícil': 'bg-red-100 text-red-800',
} as const

/**
 * Enhanced function to determine question source with more detailed information
 */
const getQuestionSourceChip = (question: EnemItem | null): QuestionSource => {
  if (!question) return { text: 'ENEM Local', variant: 'default' }

  // Check metadata source first
  if (question.metadata?.source) {
    switch (question.metadata.source) {
      case 'LOCAL_DATABASE':
      case 'DATABASE':
        return {
          text: `ENEM ${question.year || question.metadata.original_year || 'Local'}`,
          variant: 'default',
          icon: '📖'
        }
      case 'AI':
        return { text: 'IA Gerada', variant: 'secondary', icon: '🤖' }
    }
  }

  // Check if it's official ENEM
  if (question.metadata?.is_official_enem) {
    return {
      text: `ENEM ${question.year || question.metadata.original_year || 'Oficial'}`,
      variant: 'default',
      icon: '🏛️'
    }
  }

  // Check if it's AI generated
  if (question.metadata?.is_ai_generated || 
      question.item_id?.startsWith('ai_generated_') || 
      question.item_id?.startsWith('generated_')) {
    return { text: 'IA Gerada', variant: 'secondary', icon: '🤖' }
  }

  // Check year and ID patterns
  if (question.year && question.year !== new Date().getFullYear()) {
    return { text: `ENEM ${question.year}`, variant: 'default', icon: '📅' }
  }

  if (question.item_id?.startsWith('enem_')) {
    return { text: `ENEM ${question.year || 'Oficial'}`, variant: 'default', icon: '📖' }
  }

  return { text: 'ENEM Local', variant: 'default', icon: '💾' }
}

/**
 * Enhanced props interface
 */
interface EnemSimulatorV2Props {
  sessionId: string
  items: EnemItem[]
  config: {
    mode: EnemMode
    areas: EnemArea[]
    numQuestions: number
    timeLimit?: number
    showKeyboardShortcuts?: boolean
    autoSave?: boolean
    allowReview?: boolean
  }
  onComplete: (score: EnemScore, items: EnemItem[], responses: EnemResponse[], session: ExamSession) => void
  onProgress?: (progress: { current: number; total: number; answered: number }) => void
}

/**
 * Enhanced ENEM Simulator component with improved UX and performance
 */
export function EnemSimulatorV2({ 
  sessionId, 
  items, 
  config, 
  onComplete, 
  onProgress 
}: EnemSimulatorV2Props) {
  // Core state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Map<string, EnemResponse>>(new Map())
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  
  // Enhanced session tracking
  const [examSession] = useState<ExamSession>(() => ({
    startTime: new Date(),
    questionStartTimes: new Map(),
    tabSwitchEvents: []
  }))
  
  // UI state
  const [showWarning, setShowWarning] = useState(false)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())
  
  // Loading state
  const [isGeneratingExam, setIsGeneratingExam] = useState(items.length === 0)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationMessage, setGenerationMessage] = useState('')
  
  // Refs for performance
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const questionStartTimeRef = useRef<number>(Date.now())
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const handleTimeUpRef = useRef<() => Promise<void>>()
  
  const { toast } = useToast()

  // Memoized values
  const currentItem = useMemo(() => items[currentQuestionIndex], [items, currentQuestionIndex])
  const currentResponse = useMemo(() => 
    responses.get(currentItem?.item_id ?? ''), 
    [responses, currentItem?.item_id]
  )
  const progress = useMemo(
    () => ((currentQuestionIndex + 1) / Math.max(items.length, 1)) * 100,
    [currentQuestionIndex, items.length]
  )
  const answeredCount = responses.size
  const sourceChip = useMemo(() => getQuestionSourceChip(currentItem), [currentItem])

  /**
   * Enhanced exam generation with smoother progress
   */
  useEffect(() => {
    if (!isGeneratingExam) return

    let currentStep = 0
    const progressInterval = setInterval(() => {
      if (currentStep < PROGRESS_STEPS.length) {
        const step = PROGRESS_STEPS[currentStep]
        setGenerationProgress(step.progress)
        setGenerationMessage(step.message)
        currentStep++
      } else {
        clearInterval(progressInterval)
        setTimeout(() => setIsGeneratingExam(false), 500)
      }
    }, 700)

    return () => clearInterval(progressInterval)
  }, [isGeneratingExam])

  /**
   * Enhanced score calculation with detailed analytics
   */
  const calculateScore = useCallback(async () => {
    try {
      if (!sessionId) throw new Error('Session ID not found')
      if (items.length === 0) throw new Error('No questions loaded')

      const responseArray = Array.from(responses.values())
      const responseData = {
        session_id: sessionId,
        responses: responseArray,
        items: items,
        config,
        session_metadata: {
          start_time: examSession.startTime,
          end_time: new Date(),
          tab_switches: examSession.tabSwitchEvents,
          total_time_spent: Date.now() - examSession.startTime.getTime(),
          question_times: Object.fromEntries(examSession.questionStartTimes),
        }
      }

      const response = await fetch('/api/enem/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseData),
      })

      if (!response.ok) {
        throw new Error(`Failed to calculate score: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success || !data.score) {
        throw new Error('Invalid API response')
      }

      onComplete(data.score, items, responseArray, examSession)
    } catch (error) {
      console.error('Error calculating score:', error)
      toast({
        title: '❌ Erro',
        description: `Falha ao calcular pontuação: ${(error as Error).message}`,
        variant: 'destructive',
      })
    }
  }, [sessionId, responses, items, config, examSession, onComplete, toast])

  /**
   * Enhanced time up handler
   */
  const handleTimeUp = useCallback(async () => {
    toast({
      title: '⏰ Tempo Esgotado!',
      description: 'O simulado foi finalizado automaticamente.',
      variant: 'destructive',
    })
    setIsCompleted(true)
    await calculateScore()
  }, [toast, calculateScore])

  /**
   * Enhanced timer with better precision and warnings
   */
  useEffect(() => {
    if (!config.timeLimit || isCompleted) return

    setTimeRemaining(config.timeLimit * 60)
    
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          handleTimeUpRef.current?.()
          return 0
        }
        
        // Show warnings at specific intervals
        if (prev === 300) { // 5 minutes
          toast({
            title: '⚠️ Atenção',
            description: 'Restam apenas 5 minutos!',
            variant: 'destructive',
          })
        } else if (prev === 60) { // 1 minute
          toast({
            title: '🚨 Último minuto!',
            description: 'O tempo está acabando!',
            variant: 'destructive',
          })
        }
        
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [config.timeLimit, isCompleted, toast])

  /**
   * Enhanced tab switch tracking with detailed logging
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const switchEvent = {
          timestamp: new Date(),
          questionIndex: currentQuestionIndex
        }
        
        examSession.tabSwitchEvents.push(switchEvent)
        
        setTabSwitchCount((prev) => {
          const newCount = prev + 1
          
          if (newCount === 2) {
            toast({
              title: '⚠️ Aviso',
              description: 'Evite trocar de abas durante o simulado.',
            })
          } else if (newCount >= 3) {
            setShowWarning(true)
          }
          
          return newCount
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [currentQuestionIndex, examSession.tabSwitchEvents, toast])

  /**
   * Enhanced keyboard shortcuts with better UX
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted || isSaving) return

      // Prevent shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      setLastActivity(Date.now())

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          if (currentQuestionIndex > 0) {
            handlePrevious()
          }
          break
        
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          if (currentQuestionIndex < items.length - 1) {
            handleNext()
          }
          break
        
        case 'f':
        case 'F':
          if (currentQuestionIndex === items.length - 1) {
            e.preventDefault()
            handleCompleteExam()
          }
          break
        
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          e.preventDefault()
          const answerMap: Record<string, string> = { 
            '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E' 
          }
          handleAnswerSelect(answerMap[e.key])
          break
        
        case '?':
          e.preventDefault()
          setShowKeyboardHelp(prev => !prev)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentQuestionIndex, items.length, isCompleted, isSaving])

  /**
   * Track question start times for detailed analytics
   */
  useEffect(() => {
    if (currentItem?.item_id) {
      questionStartTimeRef.current = Date.now()
      examSession.questionStartTimes.set(currentItem.item_id, questionStartTimeRef.current)
    }
  }, [currentItem?.item_id, examSession.questionStartTimes])

  /**
   * Progress reporting
   */
  useEffect(() => {
    onProgress?.({
      current: currentQuestionIndex + 1,
      total: items.length,
      answered: answeredCount
    })
  }, [currentQuestionIndex, items.length, answeredCount, onProgress])

  /**
   * Enhanced answer selection with better UX and error handling
   */
  const handleAnswerSelect = useCallback(
    async (answer: string) => {
      if (!currentItem || isCompleted || isSaving) return

      const questionStartTime = examSession.questionStartTimes.get(currentItem.item_id) || Date.now()
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
      
      const response: EnemResponse = {
        response_id: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        session_id: sessionId,
        item_id: currentItem.item_id,
        selected_answer: answer as "A" | "B" | "C" | "D" | "E",
        time_spent: timeSpent,
        is_correct: answer === currentItem.correct_answer,
        timestamp: new Date(),
      }

      // Optimistic update
      setResponses((prev) => new Map(prev.set(currentItem.item_id, response)))
      
      // Clear any existing save timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      // Auto-save with debouncing
      if (config.autoSave !== false) {
        setIsSaving(true)
        
        saveTimeoutRef.current = setTimeout(async () => {
          try {
            const serverResponse = await fetch('/api/enem/responses', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                session_id: sessionId,
                item_id: currentItem.item_id,
                selected_answer: answer,
                time_spent: timeSpent,
                metadata: {
                  tab_switches: tabSwitchCount,
                  question_start_time: questionStartTime,
                }
              }),
            })

            if (!serverResponse.ok && serverResponse.status !== 404) {
              throw new Error(`HTTP ${serverResponse.status}`)
            }

            if (serverResponse.status === 404) {
              console.log('Item not found in database, saved locally')
            }
          } catch (error) {
            console.error('Error saving response:', error)
            // Still keep the local response
          } finally {
            setIsSaving(false)
          }
        }, 300) // 300ms debounce
      }
    },
    [currentItem, sessionId, isCompleted, isSaving, examSession.questionStartTimes, tabSwitchCount, config.autoSave]
  )

  /**
   * Enhanced navigation with smooth transitions
   */
  const handleNext = useCallback(() => {
    if (currentQuestionIndex < items.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }, [currentQuestionIndex, items.length])

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }, [currentQuestionIndex])


  /**
   * Enhanced exam completion with better user feedback
   */
  const handleCompleteExam = useCallback(async () => {
    const unanswered = items.length - responses.size
    
    if (unanswered > 0) {
      const confirmMessage = unanswered === 1 
        ? `Você ainda tem 1 questão sem resposta. Deseja finalizar mesmo assim?`
        : `Você ainda tem ${unanswered} questões sem resposta. Deseja finalizar mesmo assim?`
      
      if (!confirm(confirmMessage)) {
        return
      }
    }
    
    setIsCompleted(true)
  }, [responses.size, items.length])


  // Calculate score when exam is completed
  useEffect(() => {
    if (isCompleted) {
      calculateScore()
    }
  }, [isCompleted, calculateScore])

  /**
   * Enhanced time formatting with better readability
   */
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`
    }
    return `${minutes}m ${secs.toString().padStart(2, '0')}s`
  }, [handleAnswerSelect, handleCompleteExam, handleNext, handlePrevious])

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  if (isGeneratingExam) {
    return (
      <ExamGenerationLoading
        isLoading={isGeneratingExam}
        progress={generationProgress}
        message={generationMessage}
      />
    )
  }

  if (isCompleted) {
    return (
      <Card className="max-w-2xl mx-auto" role="region" aria-label="Simulado concluído">
        <CardContent className="pt-8 text-center">
          <div className="space-y-4">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto" aria-hidden="true" />
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Simulado Concluído! 🎉</h2>
              <p className="text-gray-600 text-lg mb-4">
                Processando seus resultados com inteligência artificial...
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-blue-600 font-medium">Analisando desempenho</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Questões respondidas:</strong> {answeredCount}/{items.length}
                </div>
                <div>
                  <strong>Tempo total:</strong> {formatTime(Math.floor((Date.now() - examSession.startTime.getTime()) / 1000))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6" role="main">
      {/* Enhanced Header with better visual hierarchy */}
      <Card className="shadow-lg border-t-4 border-t-blue-600">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-3 text-xl">
                <BookOpen className="h-6 w-6 text-blue-600" />
                Simulado ENEM - {config.mode}
                <Badge variant="secondary" className="text-sm">
                  {config.areas.join(' • ')}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  Questão {currentQuestionIndex + 1} de {items.length}
                </span>
                <Badge variant={sourceChip.variant} className="text-xs">
                  {sourceChip.icon && <span className="mr-1">{sourceChip.icon}</span>}
                  {sourceChip.text}
                </Badge>
              </div>
            </div>
            
            <div className="text-right space-y-2">
              {timeRemaining !== null && (
                <div
                  className={`flex items-center gap-2 text-lg font-bold ${
                    timeRemaining < 300 ? 'text-red-600' : timeRemaining < 900 ? 'text-orange-600' : 'text-gray-900'
                  }`}
                  aria-live="polite"
                  aria-label={`Tempo restante: ${formatTime(timeRemaining)}`}
                >
                  <Timer className="h-5 w-5" />
                  {formatTime(timeRemaining)}
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Respondidas: {answeredCount}/{items.length}</span>
                {isSaving && (
                  <span className="text-blue-600 flex items-center gap-1">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={progress} 
              className="h-2" 
              aria-label={`Progresso: ${Math.round(progress)}%`} 
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{Math.round(progress)}% concluído</span>
              <span>{answeredCount} de {items.length} respondidas</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Warning System */}
      {showWarning && (
        <Card className="border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50" role="alert">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">
                  ⚠️ Múltiplas trocas de aba detectadas
                </h3>
                <p className="text-orange-800 text-sm">
                  Você trocou de aba <strong>{tabSwitchCount} vezes</strong>. 
                  Isso pode afetar a precisão da análise do seu desempenho no simulado real.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two Cards Layout - Question and Answers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Question Card */}
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-base font-bold px-3 py-1">
                  #{currentQuestionIndex + 1}
                </Badge>
                <Badge variant={sourceChip.variant} className="text-sm">
                  {sourceChip.icon && <span className="mr-1">{sourceChip.icon}</span>}
                  {sourceChip.text}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-sm">
                  {currentItem?.area}
                </Badge>
                <Badge 
                  className={`text-sm ${
                    DIFFICULTY_COLORS[currentItem?.estimated_difficulty as keyof typeof DIFFICULTY_COLORS] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {currentItem?.estimated_difficulty}
                </Badge>
                {currentResponse && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                    ✓ Respondida
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Question Text */}
              <div className="prose max-w-none prose-lg">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold mb-4 text-gray-900">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-semibold mb-4 text-gray-900">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold mb-3 text-gray-900">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-800 mb-4 leading-relaxed text-base">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-4 space-y-2 text-gray-800">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-800">{children}</ol>
                    ),
                    li: ({ children }) => <li className="mb-1 leading-relaxed">{children}</li>,
                    strong: ({ children }) => (
                      <strong className="font-bold text-gray-900">{children}</strong>
                    ),
                    em: ({ children }) => <em className="italic text-gray-800">{children}</em>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-700 mb-4 bg-blue-50 py-2">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="bg-gray-200 px-2 py-1 rounded text-sm font-mono text-gray-900">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4 border">
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {currentItem?.text ?? ''}
                </ReactMarkdown>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answers Card */}
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Selecione a alternativa correta:
              </CardTitle>
              <div className="text-sm text-gray-500">
                {currentResponse ? 'Respondida' : 'Aguardando resposta'}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-4">
              {currentItem?.alternatives &&
                Object.entries(currentItem.alternatives).map(([key, value], index) => {
                  const isSelected = currentResponse?.selected_answer === key
                  
                  return (
                    <button
                      key={key}
                      onClick={() => handleAnswerSelect(key)}
                      disabled={isSaving || isCompleted}
                      className={`w-full p-4 text-left border-2 rounded-xl transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md'
                          : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm'
                      } ${
                        isSaving || isCompleted 
                          ? 'cursor-not-allowed opacity-60' 
                          : 'cursor-pointer'
                      }`}
                      aria-label={`Selecionar alternativa ${key}: ${value.substring(0, 50)}...`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-gray-400 text-gray-600'
                          }`}
                        >
                          {key}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <span className="inline text-sm">{children}</span>,
                              strong: ({ children }) => (
                                <strong className="font-semibold text-gray-900">{children}</strong>
                              ),
                              em: ({ children }) => <em className="italic text-gray-800">{children}</em>,
                              code: ({ children }) => (
                                <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono text-gray-800">
                                  {children}
                                </code>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc list-inside space-y-1 text-gray-800 mt-1">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-inside space-y-1 text-gray-800 mt-1">{children}</ol>
                              ),
                              li: ({ children }) => <li className="mb-1 text-sm">{children}</li>,
                            }}
                          >
                            {value}
                          </ReactMarkdown>
                        </div>
                        {isSelected && (
                          <div className="text-blue-600 pt-0.5">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Navigation with better UX */}
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || isSaving}
              aria-label="Questão anterior"
              className="flex items-center gap-2 px-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
              <kbd className="hidden sm:inline-block ml-2 px-2 py-1 bg-gray-100 text-xs rounded">←</kbd>
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {currentQuestionIndex + 1} / {items.length}
                </div>
                <div className="text-xs text-gray-500">questões</div>
              </div>
              
              {config.showKeyboardShortcuts !== false && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                  aria-label={showKeyboardHelp ? "Ocultar atalhos" : "Mostrar atalhos"}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Keyboard className="h-4 w-4 mr-1" />
                  {showKeyboardHelp ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              )}
            </div>
            
            <Button
              onClick={currentQuestionIndex === items.length - 1 ? handleCompleteExam : handleNext}
              disabled={isSaving}
              className={`flex items-center gap-2 px-6 ${
                currentQuestionIndex === items.length - 1 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : ''
              }`}
              aria-label={
                currentQuestionIndex === items.length - 1 
                  ? 'Finalizar simulado' 
                  : 'Próxima questão'
              }
            >
              {currentQuestionIndex === items.length - 1 ? (
                <>
                  <Flag className="h-4 w-4" />
                  Finalizar
                  <kbd className="hidden sm:inline-block ml-2 px-2 py-1 bg-green-800 text-xs rounded">F</kbd>
                </>
              ) : (
                <>
                  Próxima
                  <ArrowRight className="h-4 w-4" />
                  <kbd className="hidden sm:inline-block ml-2 px-2 py-1 bg-gray-700 text-xs rounded text-white">→</kbd>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Keyboard Shortcuts Panel */}
      {showKeyboardHelp && (
        <Card className="shadow-lg border-dashed border-2 border-gray-300 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Atalhos do Teclado
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKeyboardHelp(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(KEYBOARD_SHORTCUTS).map(([key, description]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border">
                  <span className="text-sm text-gray-600">{description}</span>
                  <kbd className="px-2 py-1 bg-gray-100 text-xs font-mono rounded border">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Dica:</strong> Use os atalhos para navegar mais rapidamente pelo simulado. 
                Pressione <kbd className="px-1 bg-white rounded">?</kbd> para alternar esta ajuda.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Stats Panel */}
      <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">{answeredCount}</div>
              <div className="text-sm text-gray-600">Respondidas</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-600">{items.length - answeredCount}</div>
              <div className="text-sm text-gray-600">Restantes</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-2xl font-bold text-orange-600">{Math.round(progress)}%</div>
              <div className="text-sm text-gray-600">Progresso</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">
                {timeRemaining ? formatTime(timeRemaining) : '--'}
              </div>
              <div className="text-sm text-gray-600">Tempo</div>
            </div>
          </div>
          
          {/* Additional helpful info */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
              <span>⌨️ Use atalhos para maior agilidade</span>
              <span>💾 Respostas salvas automaticamente</span>
              <span>📊 Sistema TRI ativo</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}