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
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<'a' | 'b' | 'c' | 'd' | null>(null)
  const [answers, setAnswers] = useState<(string | null)[]>(new Array(questions.length).fill(null))
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showExplanationsState, setShowExplanationsState] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingAnswer, setPendingAnswer] = useState<'a' | 'b' | 'c' | 'd' | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())

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
  }, [currentQuestion])

  const handleAnswerSelect = (answer: 'a' | 'b' | 'c' | 'd') => {
    if (isCompleted) return
    
    setPendingAnswer(answer)
    setShowConfirmation(true)
  }

  const confirmAnswer = () => {
    if (pendingAnswer === null) return
    
    console.log('🔍 DEBUG: confirmAnswer chamado')
    console.log('🔍 DEBUG: pendingAnswer:', pendingAnswer)
    console.log('🔍 DEBUG: currentQuestion:', currentQuestion)
    
    setSelectedAnswer(pendingAnswer)
    const newAnswers = [...answers]
    const safeCurrentQuestion = Math.min(currentQuestion, questions.length - 1)
    newAnswers[safeCurrentQuestion] = pendingAnswer
    setAnswers(newAnswers)
    
    console.log('🔍 DEBUG: newAnswers após confirmação:', newAnswers)
    
    setShowConfirmation(false)
    setPendingAnswer(null)

    // Auto-advance after selection
    setTimeout(() => {
      if (safeCurrentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedAnswer(null)
      } else {
        console.log('🔍 DEBUG: Última pergunta respondida, chamando handleComplete')
        handleComplete()
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

  const handleComplete = () => {
    console.log('🔍 DEBUG: handleComplete chamado')
    console.log('🔍 DEBUG: answers array:', answers)
    console.log('🔍 DEBUG: questions array:', questions)
    
    const correctAnswers = answers.filter((answer, index) => {
      const correctAnswer = questions[index].correct
      console.log(`🔍 DEBUG Question ${index + 1}: User answer: ${answer}, Correct answer: ${correctAnswer}, Match: ${answer === correctAnswer}`)
      return answer === correctAnswer
    }).length
    
    console.log(`🔍 DEBUG: Quiz completed: ${correctAnswers}/${questions.length} correct answers`)
    console.log('🔍 DEBUG: Setting score to:', correctAnswers)
    
    setScore(correctAnswers)
    setIsCompleted(true)
    setShowResult(true)
    onComplete(correctAnswers, questions.length)
  }

  const handleRetry = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setAnswers(new Array(questions.length).fill(null))
    setShowResult(false)
    setScore(0)
    setIsCompleted(false)
    setTimeLeft(timeLimit)
    setShowExplanationsState(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreBadge = (score: number, total: number) => {
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
  }

  if (showResult) {
    const scoreBadge = getScoreBadge(score, questions.length)
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
          {/* Score Display */}
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white ${scoreBadge.color}`}>
              <ScoreIcon className="h-5 w-5" />
              {scoreBadge.text}
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold">{score}/{questions.length}</div>
              <div className="text-gray-600">
                {Math.round((score / questions.length) * 100)}% de acertos
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
              <span>{Math.round((score / questions.length) * 100)}%</span>
            </div>
            <Progress value={(score / questions.length) * 100} className="h-2" />
          </div>

          {/* Question Review */}
          {showExplanationsState && (
            <div className="space-y-4">
              <h3 className="font-semibold">Revisão das Respostas:</h3>
              {questions.map((question, index) => {
                const userAnswer = answers[index]
                const isCorrect = userAnswer === question.correct
                
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
                            const isCorrectAnswer = key === question.correct
                            
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
                                  {key.toUpperCase()}. {option}
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
            <Button
              onClick={() => setShowExplanationsState(!showExplanationsState)}
              variant="outline"
            >
              {showExplanationsState ? 'Ocultar Explicações' : 'Ver Explicações'}
            </Button>
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
  }

  // Ensure currentQuestion is within bounds
  const safeCurrentQuestion = Math.min(currentQuestion, questions.length - 1)
  const currentQ = questions[safeCurrentQuestion]
  const progress = ((safeCurrentQuestion + 1) / questions.length) * 100

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
                handleComplete()
              }
            }}
            disabled={selectedAnswer === null}
          >
            {currentQuestion < questions.length - 1 ? 'Próxima' : 'Finalizar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}