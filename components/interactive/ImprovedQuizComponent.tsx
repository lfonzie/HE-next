'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, Clock, Trophy, Star, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer'

interface QuizQuestion {
  q: string
  options: string[]
  correct: number | string // Support both number (0,1,2,3) and string ('a','b','c','d') formats
  explanation?: string
}

interface QuizComponentProps {
  questions: QuizQuestion[]
  onComplete: (score: number, totalQuestions: number, results: QuizResult[]) => void
  timeLimit?: number // in seconds
  showExplanations?: boolean
  allowRetry?: boolean
  showHints?: boolean
  className?: string
}

interface QuizResult {
  questionIndex: number
  question: QuizQuestion
  selectedAnswer: number | null
  correctAnswer: number
  isCorrect: boolean
  timeSpent: number
  pointsEarned: number
}

interface QuizStats {
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  unansweredQuestions: number
  totalScore: number
  totalTimeSpent: number
  averageTimePerQuestion: number
  accuracy: number
}

export default function ImprovedQuizComponent({ 
  questions, 
  onComplete, 
  timeLimit = 0,
  showExplanations = true,
  allowRetry = false,
  showHints = true,
  className = ""
}: QuizComponentProps) {
  
  // Helper function to normalize correct answer format
  const normalizeCorrectAnswer = useCallback((correct: number | string): number => {
    if (typeof correct === 'string') {
      // Handle both lowercase and uppercase letters
      const normalizedCorrect = correct.toLowerCase();
      if (normalizedCorrect === 'a') return 0;
      if (normalizedCorrect === 'b') return 1;
      if (normalizedCorrect === 'c') return 2;
      if (normalizedCorrect === 'd') return 3;
      // Fallback to charCodeAt for other cases
      return normalizedCorrect.charCodeAt(0) - 97; // 'a' = 0, 'b' = 1, etc.
    }
    return correct;
  }, []);
  
  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null))
  const [showResult, setShowResult] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingAnswer, setPendingAnswer] = useState<number | null>(null)

  // Get current question
  const currentQuestion = questions[currentQuestionIndex]

  // Timer effect
  useEffect(() => {
    if (timeLimit > 0 && !isCompleted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeLimit, isCompleted])

  // Reset question timer when question changes
  useEffect(() => {
    setQuestionStartTime(Date.now())
    setShowResult(false)
    setSelectedAnswer(answers[currentQuestionIndex])
  }, [currentQuestionIndex, answers])

  // Handle answer selection
  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (isCompleted) return
    
    setPendingAnswer(answerIndex)
    setShowConfirmation(true)
  }, [isCompleted])

  const confirmAnswer = useCallback(() => {
    if (pendingAnswer === null) return
    
    setSelectedAnswer(pendingAnswer)
    setShowResult(true)
    
    // Update answers array
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = pendingAnswer
    setAnswers(newAnswers)

    // Calculate time spent on this question
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000)
    
    // Create result for this question
    const correctIndex = normalizeCorrectAnswer(currentQuestion.correct)
    const result: QuizResult = {
      questionIndex: currentQuestionIndex,
      question: currentQuestion,
      selectedAnswer: pendingAnswer,
      correctAnswer: correctIndex,
      isCorrect: pendingAnswer === correctIndex,
      timeSpent,
      pointsEarned: pendingAnswer === correctIndex ? 10 : 0
    }

    setQuizResults(prev => {
      const updated = [...prev]
      updated[currentQuestionIndex] = result
      return updated
    })
    
    setShowConfirmation(false)
    setPendingAnswer(null)

    // Auto-advance after selection
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
        setSelectedAnswer(null)
      } else {
        handleComplete()
      }
    }, 1000)
  }, [pendingAnswer, currentQuestionIndex, answers, currentQuestion, questionStartTime, normalizeCorrectAnswer, questions.length])

  const cancelAnswer = useCallback(() => {
    setShowConfirmation(false)
    setPendingAnswer(null)
  }, [])

  // Handle next question
  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      handleComplete()
    }
  }, [currentQuestionIndex, questions.length])

  // Handle previous question
  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }, [currentQuestionIndex])

  // Handle quiz completion
  const handleComplete = useCallback(() => {
    setIsCompleted(true)
    
    // Calculate final statistics
    const stats = calculateStats()
    
    // Call completion callback
    onComplete(stats.totalScore, stats.totalQuestions, quizResults)
  }, [quizResults, onComplete])

  // Calculate quiz statistics
  const calculateStats = useCallback((): QuizStats => {
    const totalQuestions = questions.length
    const correctAnswers = quizResults.filter(r => r.isCorrect).length
    const wrongAnswers = quizResults.filter(r => !r.isCorrect && r.selectedAnswer !== null).length
    const unansweredQuestions = totalQuestions - correctAnswers - wrongAnswers
    const totalScore = quizResults.reduce((sum, r) => sum + r.pointsEarned, 0)
    const totalTimeSpent = quizResults.reduce((sum, r) => sum + r.timeSpent, 0)
    const averageTimePerQuestion = totalQuestions > 0 ? Math.round(totalTimeSpent / totalQuestions) : 0
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

    return {
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      unansweredQuestions,
      totalScore,
      totalTimeSpent,
      averageTimePerQuestion,
      accuracy
    }
  }, [questions.length, quizResults])

  // Handle retry
  const handleRetry = useCallback(() => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setAnswers(new Array(questions.length).fill(null))
    setShowResult(false)
    setIsCompleted(false)
    setTimeLeft(timeLimit)
    setQuizResults([])
  }, [questions.length, timeLimit])

  // Format time
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Get score badge
  const getScoreBadge = useCallback((score: number, total: number) => {
    const percentage = (score / total) * 100
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
  }, [])

  // Early return if no questions are provided
  if (!questions || questions.length === 0) {
    return (
      <Card className={`w-full max-w-2xl mx-auto ${className}`}>
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

  // If completed, show results
  if (isCompleted) {
    const stats = calculateStats()
    const scoreBadge = getScoreBadge(stats.correctAnswers, stats.totalQuestions)
    const ScoreIcon = scoreBadge.icon
    
    return (
      <Card className={`w-full max-w-4xl mx-auto ${className}`}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <ScoreIcon className="h-8 w-8 text-yellow-500" />
            Quiz Concluído!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.correctAnswers}</div>
              <div className="text-sm text-green-800">Corretas</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.wrongAnswers}</div>
              <div className="text-sm text-red-800">Incorretas</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{stats.unansweredQuestions}</div>
              <div className="text-sm text-gray-800">Sem resposta</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.accuracy}%</div>
              <div className="text-sm text-blue-800">Precisão</div>
            </div>
          </div>

          {/* Score Display */}
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white ${scoreBadge.color}`}>
              <ScoreIcon className="h-5 w-5" />
              {scoreBadge.text}
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold">{stats.correctAnswers}/{stats.totalQuestions}</div>
              <div className="text-gray-600">
                {stats.accuracy}% de acertos
              </div>
              <div className="mt-2 text-sm text-gray-700 italic">
                {scoreBadge.message}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>{stats.accuracy}%</span>
            </div>
            <Progress value={stats.accuracy} className="h-2" />
          </div>

          {/* Detailed Results */}
          {showExplanations && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resultados Detalhados</h3>
              {questions.map((question, index) => {
                const result = quizResults[index]
                const isCorrect = result?.isCorrect || false
                const selectedAnswer = result?.selectedAnswer || null
                const correctIndex = normalizeCorrectAnswer(question.correct)
                
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
                          <MarkdownRenderer content={question.q} className="font-medium" />
                        </div>
                        <div className="space-y-1">
                          {question.options.map((option, optIndex) => {
                            const isUserAnswer = optIndex === selectedAnswer
                            const isCorrectAnswer = optIndex === correctIndex
                            
                            return (
                              <div
                                key={optIndex}
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
                                  {String.fromCharCode(65 + optIndex)}. {option}
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
          <div className="flex justify-center gap-4">
            {allowRetry && (
              <Button onClick={handleRetry} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Refazer Quiz
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Main quiz interface
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Questão {currentQuestionIndex + 1} de {questions.length}
          </CardTitle>
          {timeLimit > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <Progress 
          value={progress} 
          className="w-full"
        />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Question */}
        <div className="space-y-4">
          <div className="prose max-w-none">
            <MarkdownRenderer content={currentQuestion.q} />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrect = showResult && index === normalizeCorrectAnswer(currentQuestion.correct)
            const isWrong = showResult && isSelected && !isCorrect
            
            return (
              <motion.button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  isCorrect
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : isWrong
                    ? 'border-red-500 bg-red-50 text-red-800'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                whileHover={!showResult ? { scale: 1.02 } : {}}
                whileTap={!showResult ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    isCorrect
                      ? 'bg-green-500 text-white'
                      : isWrong
                      ? 'bg-red-500 text-white'
                      : isSelected
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <div className="flex-1">
                    <MarkdownRenderer content={option} />
                  </div>
                  {showResult && (
                    <div className="ml-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : isWrong ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : null}
                    </div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Explanation */}
        {showResult && showExplanations && currentQuestion.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <h4 className="font-medium text-gray-800 mb-2">Explicação:</h4>
            <MarkdownRenderer content={currentQuestion.explanation} />
          </motion.div>
        )}

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
                  <strong>{String.fromCharCode(65 + (pendingAnswer || 0))}</strong>?
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

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          
          <div className="flex gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-blue-500 text-white'
                    : answers[index]
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          <Button
            onClick={handleNext}
            disabled={!showResult && currentQuestionIndex === questions.length - 1}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Finalizar' : 'Próxima'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
