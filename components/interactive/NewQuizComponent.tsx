'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, Clock, Trophy, Star, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react'
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
  
  // Log questions when component mounts or questions change
  useEffect(() => {
    console.log('🔍 DEBUG NewQuizComponent - Questions received:', questions)
    questions.forEach((q, index) => {
      console.log(`🔍 DEBUG Question ${index + 1}:`, {
        question: q.question,
        options: q.options,
        correct: q.correct
      })
    })
  }, [questions])
  
  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>(new Array(questions.length).fill(null))
  const [isCompleted, setIsCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

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

  const handleAnswerSelect = (answer: 'a' | 'b' | 'c' | 'd') => {
    if (isCompleted) return
    
    console.log(`🔍 DEBUG Answer Selected:`, {
      answer,
      currentQuestionIndex,
      currentQuestion: questions[currentQuestionIndex],
      correctAnswer: questions[currentQuestionIndex]?.correct
    })
    
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answer
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    if (isCompleted) return
    
    setIsCompleted(true)
    
    // Calculate score
    let correctCount = 0
    questions.forEach((question, index) => {
      const userAnswer = selectedAnswers[index]
      console.log(`🔍 DEBUG Question ${index + 1}:`, {
        userAnswer,
        correctAnswer: question.correct,
        isCorrect: userAnswer === question.correct,
        question: question.question,
        options: question.options
      })
      if (userAnswer === question.correct) {
        correctCount++
      }
    })
    
    console.log(`🔍 DEBUG Final Score:`, { correctCount, total: questions.length })
    
    const finalScore = { correct: correctCount, total: questions.length }
    setScore(finalScore)
    setShowResult(true)
    
    // Call completion callback
    onComplete(correctCount, questions.length)
  }

  const handleRetry = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers(new Array(questions.length).fill(null))
    setIsCompleted(false)
    setTimeLeft(timeLimit)
    setShowResult(false)
    setScore({ correct: 0, total: 0 })
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

  // Early return if no questions
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

  // Show results
  if (showResult) {
    const percentage = Math.round((score.correct / score.total) * 100)
    const scoreBadge = getScoreBadge(percentage)
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
              <div className="text-3xl font-bold">{score.correct}/{score.total}</div>
              <div className="text-gray-600">
                {percentage}% de acertos
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
              <span>{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>

          {/* Question Review */}
          {showExplanations && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resultados Detalhados</h3>
              {questions.map((question, index) => {
                const userAnswer = selectedAnswers[index]
                const correctAnswer = question.correct
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
  }

  // Main quiz interface
  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const selectedAnswer = selectedAnswers[currentQuestionIndex]

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
            <span>Questão {currentQuestionIndex + 1} de {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Question */}
          <div className="mb-6">
            <MarkdownRenderer content={currentQuestion.question} className="text-lg font-semibold" />
          </div>
          
          {/* Options */}
          <div className="space-y-3">
            {Object.entries(currentQuestion.options).map(([key, option]) => (
              <motion.button
                key={key}
                onClick={() => handleAnswerSelect(key as 'a' | 'b' | 'c' | 'd')}
                disabled={isCompleted}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${isCompleted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === key 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswer === key && (
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
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedAnswer === null}
          >
            {currentQuestionIndex < questions.length - 1 ? (
              <>
                Próxima
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              'Finalizar'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}