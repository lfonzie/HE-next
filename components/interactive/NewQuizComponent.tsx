'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, Clock, Trophy, Star, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer'

interface QuizQuestion {
  question: string
  options: {
    a: string
    b: string
    c: string
    d: string
  }
  correct: 'a' | 'b' | 'c' | 'd'
  explanation?: string
}

interface QuizResult {
  questions: QuizQuestion[]
  userAnswers: Record<string, string> // questionId -> optionId
  correctMap: Record<string, string> // questionId -> correctOptionId
  submittedAt: number | null
  correctCount: number
  totalQuestions: number
  percentage: number
}

interface QuizComponentProps {
  questions: QuizQuestion[]
  onComplete: (score: number, totalQuestions: number) => void
  timeLimit?: number // in seconds
  showExplanations?: boolean
  allowRetry?: boolean
}

export default function NewQuizComponent({ 
  questions, 
  onComplete, 
  timeLimit = 0,
  showExplanations = true,
  allowRetry = false
}: QuizComponentProps) {
  
  // Helper function to normalize correct answer format
  const normalizeCorrectAnswer = (correct: 'a' | 'b' | 'c' | 'd'): 'a' | 'b' | 'c' | 'd' => {
    // The correct answer is already in the correct format from DynamicStage transformation
    // No need to apply toLowerCase() as it's already lowercase
    console.log(`🔍 DEBUG normalizeCorrectAnswer: input="${correct}", type=${typeof correct}`)
    return (correct || 'a') as 'a' | 'b' | 'c' | 'd'
  }
  
  // Helper function to compute result from single source of truth
  const computeResult = (userAnswers: Record<string, string>, correctMap: Record<string, string>): QuizResult => {
    const correctCount = Object.keys(correctMap).reduce((count, questionId) => {
      const userAnswer = userAnswers[questionId]
      const correctAnswer = correctMap[questionId]
      return count + (userAnswer === correctAnswer ? 1 : 0)
    }, 0)
    
    return {
      questions,
      userAnswers,
      correctMap,
      submittedAt: Date.now(),
      correctCount,
      totalQuestions: questions.length,
      percentage: Math.round((correctCount / questions.length) * 100)
    }
  }
  
  // Helper function to check if answer is correct
  const isCorrect = (questionId: string, optionId: string): boolean => {
    const userAnswer = result?.userAnswers[questionId]
    const correctAnswer = result?.correctMap[questionId]
    return userAnswer === optionId && optionId === correctAnswer
  }
  
  // Single source of truth state
  const [result, setResult] = useState<QuizResult | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<'a' | 'b' | 'c' | 'd' | null>(null)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingAnswer, setPendingAnswer] = useState<'a' | 'b' | 'c' | 'd' | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Timer effect
  useEffect(() => {
    if (timeLimit > 0 && !result) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeLimit, result])

  // Reset question timer when question changes
  useEffect(() => {
    setQuestionStartTime(Date.now())
  }, [currentQuestion])

  const handleAnswerSelect = (answer: 'a' | 'b' | 'c' | 'd') => {
    if (isCompleted) return
    
    setPendingAnswer(answer)
    setShowConfirmation(true)
  }

  const confirmAnswer = () => {
    if (pendingAnswer === null) return
    
    setSelectedAnswer(pendingAnswer)
    const questionId = `q${currentQuestion}`
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: pendingAnswer
    }))
    
    setShowConfirmation(false)
    setPendingAnswer(null)

    // Auto-advance after selection
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedAnswer(null)
      } else {
        handleSubmit()
      }
    }, 1500) // Increased delay for better UX
  }

  const cancelAnswer = () => {
    setShowConfirmation(false)
    setPendingAnswer(null)
  }

  // Early return if no questions are provided
  if (!questions || questions.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">Quiz Interativo</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-gray-500">
            <p className="text-lg mb-2">Nenhuma questão disponível</p>
            <p className="text-sm">Este quiz não possui questões para exibir.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleSubmit = () => {
    if (isSubmitting || result) return // Prevent double submission
    
    console.log('🔍 DEBUG: handleSubmit chamado');
    console.log('🔍 DEBUG: userAnswers:', userAnswers);
    console.log('🔍 DEBUG: questions:', questions);
    
    setIsSubmitting(true)
    
    // Freeze userAnswers and create correctMap
    const frozenUserAnswers = { ...userAnswers }
    const correctMap: Record<string, string> = {}
    
    questions.forEach((question, index) => {
      const questionId = `q${index}`
      const correctAnswer = normalizeCorrectAnswer(question.correct)
      correctMap[questionId] = correctAnswer
      
      console.log(`🔍 DEBUG Question ${index + 1}:`, {
        questionId,
        userAnswer: frozenUserAnswers[questionId],
        correctAnswer: question.correct,
        normalizedCorrect: correctAnswer,
        isCorrect: frozenUserAnswers[questionId] === correctAnswer
      })
    })
    
    // Compute result from single source of truth
    const computedResult = computeResult(frozenUserAnswers, correctMap)
    
    console.log('🔍 DEBUG: Computed result:', computedResult)
    console.log('🔍 DEBUG: Final score:', computedResult.correctCount, '/', computedResult.totalQuestions)
    
    // Set result (single source of truth)
    setResult(computedResult)
    
    // Call completion callback
    onComplete(computedResult.correctCount, computedResult.totalQuestions)
  }

  const handleRetry = () => {
    setResult(null)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setUserAnswers({})
    setTimeLeft(timeLimit)
    setIsSubmitting(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 90) return { 
      color: 'bg-green-500', 
      text: '🎉 Parabéns! Excelente trabalho!', 
      icon: Trophy,
      message: 'Você demonstrou um excelente entendimento do conteúdo!'
    }
    if (percentage >= 70) return { 
      color: 'bg-blue-500', 
      text: '👏 Muito bom!', 
      icon: Star,
      message: 'Você está no caminho certo! Continue assim!'
    }
    if (percentage >= 50) return { 
      color: 'bg-yellow-500', 
      text: '👍 Bom trabalho!', 
      icon: Star,
      message: 'Você acertou mais da metade! Que tal revisar alguns conceitos?'
    }
    return { 
      color: 'bg-red-500', 
      text: '📚 Continue estudando!', 
      icon: XCircle,
      message: 'Não desista! Revise o material e tente novamente.'
    }
  }

  // Show loading skeleton until result is computed
  if (!result) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mx-auto mb-4" />
            <div className="h-12 w-24 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mx-auto" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show result using single source of truth
  const scoreBadge = getScoreBadge(result.percentage)
  const ScoreIcon = scoreBadge.icon

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <ScoreIcon className="h-6 w-6" />
          Resultado do Quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Display - Derived from single source of truth */}
        <div className="text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white ${scoreBadge.color}`}>
            <ScoreIcon className="h-5 w-5" />
            {scoreBadge.text}
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{result.correctCount}/{result.totalQuestions}</div>
            <div className="text-gray-600">
              {result.percentage}% de acertos
            </div>
            <div className="mt-2 text-sm text-gray-700 italic">
              {scoreBadge.message}
            </div>
          </div>
        </div>

        {/* Progress Bar - Derived from single source of truth */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{result.percentage}%</span>
          </div>
          <Progress value={result.percentage} className="h-2" />
        </div>

        {/* Question Review - Derived from single source of truth */}
        {showExplanations && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resultados Detalhados</h3>
            {questions.map((question, index) => {
              const questionId = `q${index}`
              const userAnswer = result.userAnswers[questionId]
              const correctAnswer = result.correctMap[questionId]
              const isCorrect = userAnswer === correctAnswer
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="mb-2">
                        <MarkdownRenderer content={question.question} className="font-medium" />
                      </div>
                      <div className="space-y-1">
                        {Object.entries(question.options).map(([key, option]) => {
                          const isUserAnswer = key === userAnswer
                          const isCorrectAnswer = key === correctAnswer
                          
                          return (
                            <div
                              key={key}
                              className={`text-sm p-2 rounded flex items-center gap-2 ${
                                isCorrectAnswer
                                  ? 'bg-green-100 text-green-800 font-medium'
                                  : isUserAnswer && !isCorrect
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100'
                              }`}
                            >
                              {isCorrectAnswer && <CheckCircle className="h-4 w-4 text-green-600" />}
                              {isUserAnswer && !isCorrect && <XCircle className="h-4 w-4 text-red-600" />}
                              <span>
                                {key.toUpperCase()}) {option}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                      {question.explanation && (
                        <div className="mt-2 text-sm text-gray-600 italic">
                          <MarkdownRenderer content={`💡 ${question.explanation}`} />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          {allowRetry && (
            <Button onClick={handleRetry}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  // Ensure currentQuestion is within bounds
  const safeCurrentQuestion = Math.min(currentQuestion, questions.length - 1)
  const currentQ = questions[safeCurrentQuestion]
  const progress = ((safeCurrentQuestion + 1) / questions.length) * 100

  // Early return if no questions available
  if (!questions.length || !currentQ) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Nenhuma pergunta disponível.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">Quiz Interativo</Badge>
          </CardTitle>
          {timeLimit > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Questão {safeCurrentQuestion + 1} de {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <motion.div
          key={safeCurrentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6">
            <MarkdownRenderer content={currentQ.question} className="text-lg font-semibold" />
          </div>
          
          <div className="space-y-3">
            {Object.entries(currentQ.options).map(([key, option]) => (
              <motion.button
                key={key}
                onClick={() => handleAnswerSelect(key as 'a' | 'b' | 'c' | 'd')}
                disabled={isCompleted}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === key
                    ? 'border-blue-500 bg-blue-50'
                    : pendingAnswer === key
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${isCompleted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === key 
                      ? 'border-blue-500 bg-blue-500' 
                      : pendingAnswer === key
                      ? 'border-yellow-500 bg-yellow-500'
                      : 'border-gray-300'
                  }`}>
                    {(selectedAnswer === key || pendingAnswer === key) && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="font-medium">
                    {key.toUpperCase()}. {option}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Confirmation Dialog */}
          {showConfirmation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle className="text-center">Confirmar Resposta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-center text-gray-600">
                    Você tem certeza de que deseja selecionar a opção{' '}
                    <strong>{pendingAnswer?.toUpperCase()}</strong>?
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={cancelAnswer} variant="outline">
                      Cancelar
                    </Button>
                    <Button onClick={confirmAnswer}>
                      Confirmar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            Anterior
          </Button>
          <Button
            onClick={() => {
              if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(prev => prev + 1)
                setSelectedAnswer(null)
              } else {
                handleSubmit()
              }
            }}
            disabled={selectedAnswer === null || isSubmitting}
          >
            {currentQuestion < questions.length - 1 ? 'Próxima' : 'Finalizar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}