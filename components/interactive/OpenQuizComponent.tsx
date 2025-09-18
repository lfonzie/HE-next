'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, Clock, Trophy, Star, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer'

interface Question {
  q: string
  options: string[]
  correct: number | string // OBRIGATÓRIO: índice da resposta correta (0,1,2,3) ou letra ('a','b','c','d')
  explanation?: string
}

interface OpenQuizComponentProps {
  questions: Question[]
  onComplete?: (score: number, total: number) => void
  timeLimit?: number
  showExplanations?: boolean
  allowRetry?: boolean
}

export default function OpenQuizComponent({ 
  questions, 
  onComplete, 
  timeLimit = 0,
  showExplanations = true,
  allowRetry = false
}: OpenQuizComponentProps) {
  
  // Helper function to normalize correct answer format
  const normalizeCorrectAnswer = (correct: number | string): number => {
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
  }
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null))
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showExplanationsState, setShowExplanationsState] = useState(false)
  const [score, setScore] = useState(0)

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLimit, isCompleted])

  const handleAnswerSelect = (answerIndex: number) => {
    if (isCompleted) return
    
    setSelectedAnswer(answerIndex)
    setShowResult(true)
    
    // Atualizar array de respostas
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(answers[currentQuestion + 1])
      setShowResult(false)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(answers[currentQuestion - 1])
      setShowResult(false)
    }
  }

  const handleComplete = () => {
    // Calcular pontuação baseada nas respostas corretas
    let correctAnswers = 0
    questions.forEach((question, index) => {
      const userAnswer = answers[index]
      if (userAnswer !== null) {
        const correctAnswer = normalizeCorrectAnswer(question.correct)
        if (userAnswer === correctAnswer) {
          correctAnswers++
        }
      }
    })
    
    setScore(correctAnswers)
    setIsCompleted(true)
    if (onComplete) {
      onComplete(correctAnswers, questions.length)
    }
  }

  const handleRetry = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setAnswers(new Array(questions.length).fill(null))
    setShowResult(false)
    setIsCompleted(false)
    setShowExplanationsState(false)
    setTimeLeft(timeLimit)
    setScore(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const answeredQuestions = answers.filter(answer => answer !== null).length

  if (isCompleted) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Quiz Concluído!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-3xl font-bold text-green-600">
              {score}/{questions.length} questões corretas
            </div>
            <div className="text-lg text-gray-600">
              {score === questions.length ? 'Perfeito! 🎉' : 
               score >= questions.length * 0.7 ? 'Muito bem! 👏' : 
               'Continue estudando! 📚'}
            </div>
            <div className="text-sm text-gray-500">
              {answeredQuestions}/{questions.length} questões respondidas
            </div>
          </div>

          {showExplanations && (
            <div className="space-y-4">
              <Button 
                onClick={() => setShowExplanationsState(!showExplanationsState)}
                variant="outline"
                className="w-full"
              >
                {showExplanationsState ? 'Ocultar' : 'Ver'} Explicações
              </Button>
              
              <AnimatePresence>
                {showExplanationsState && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    {questions.map((question, index) => {
                      const userAnswer = answers[index]
                      const correctAnswer = normalizeCorrectAnswer(question.correct)
                      const isCorrect = userAnswer === correctAnswer
                      
                      return (
                        <Card key={index} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                              Questão {index + 1}
                              {isCorrect ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <p className="font-medium">{question.q}</p>
                              <div className="space-y-2">
                                {question.options.map((option, optionIndex) => {
                                  let className = 'p-3 rounded-lg border '
                                  if (optionIndex === correctAnswer) {
                                    className += 'bg-green-50 border-green-300'
                                  } else if (answers[index] === optionIndex && !isCorrect) {
                                    className += 'bg-red-50 border-red-300'
                                  } else {
                                    className += 'bg-gray-50 border-gray-200'
                                  }
                                  
                                  return (
                                    <div key={optionIndex} className={className}>
                                      <div className="flex items-center gap-2">
                                        {optionIndex === correctAnswer && (
                                          <CheckCircle className="h-4 w-4 text-green-500" />
                                        )}
                                        {answers[index] === optionIndex && !isCorrect && (
                                          <XCircle className="h-4 w-4 text-red-500" />
                                        )}
                                        <MarkdownRenderer content={option} />
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                              {question.explanation && (
                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                  <p className="text-sm text-green-800">
                                    <strong>Explicação:</strong> {question.explanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {allowRetry && (
            <div className="text-center">
              <Button onClick={handleRetry} variant="outline">
                Refazer Quiz
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const currentQ = questions[currentQuestion]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Quiz Interativo
          </CardTitle>
          <div className="flex items-center gap-4">
            {timeLimit > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                {formatTime(timeLeft)}
              </div>
            )}
            <Badge variant="outline">
              {currentQuestion + 1} de {questions.length}
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="text-lg font-medium">
            <MarkdownRenderer content={currentQ.q} />
          </div>
          
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={selectedAnswer === index ? "default" : "outline"}
                  className={`w-full justify-start p-4 h-auto text-left ${
                    selectedAnswer === index 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                      selectedAnswer === index 
                        ? 'border-white text-white' 
                        : 'border-gray-300 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <MarkdownRenderer content={option} />
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {(() => {
              const correctAnswer = normalizeCorrectAnswer(currentQ.correct)
              const isCorrect = selectedAnswer === correctAnswer
              
              return (
                <div className={`p-4 border rounded-lg ${
                  isCorrect 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className={`flex items-center gap-2 ${
                    isCorrect ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                    <span className="font-medium">
                      {isCorrect ? 'Correto! 🎉' : 'Incorreto ❌'}
                    </span>
                  </div>
                  <p className={`text-sm mt-2 ${
                    isCorrect ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {isCorrect 
                      ? 'Parabéns! Você acertou esta questão.'
                      : `A resposta correta era a alternativa ${String.fromCharCode(65 + correctAnswer)}.`
                    }
                  </p>
                </div>
              )
            })()}

            {currentQ.explanation && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Explicação:</strong> {currentQ.explanation}
                </p>
              </div>
            )}
          </motion.div>
        )}

        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            Anterior
          </Button>
          
          <div className="text-sm text-gray-600">
            {answeredQuestions} de {questions.length} respondidas
          </div>
          
          <Button
            onClick={handleNext}
            disabled={!showResult}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Próxima'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
