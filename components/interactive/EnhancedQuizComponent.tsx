'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, Clock, Trophy, Star, RotateCcw, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer'
import { useQuizValidation, type QuizValidationResult } from '@/lib/quiz-validation'

interface QuizQuestion {
  id?: string
  question: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  explanation: string
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  points?: number
  timeEstimate?: number
  hint?: string
}

interface QuizComponentProps {
  questions: QuizQuestion[]
  onComplete: (score: number, totalQuestions: number, results: QuizResult[]) => void
  timeLimit?: number // in seconds
  showExplanations?: boolean
  allowRetry?: boolean
  showHints?: boolean
  shuffleOptions?: boolean
  className?: string
}

interface QuizResult {
  questionIndex: number
  question: QuizQuestion
  selectedAnswer: string | null
  correctAnswer: string
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

export default function EnhancedQuizComponent({ 
  questions, 
  onComplete, 
  timeLimit = 0,
  showExplanations = true,
  allowRetry = false,
  showHints = true,
  shuffleOptions = false, // This parameter is now ignored since options come pre-shuffled from API
  className = ""
}: QuizComponentProps) {
  
  console.log('🔍 DEBUG EnhancedQuizComponent - Initial render:', {
    questionsCount: questions.length,
    questions: questions.map(q => ({
      id: q.id,
      question: q.question?.slice(0, 50),
      options: q.options,
      correctAnswer: q.correctAnswer
    }))
  });
  
  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answers, setAnswers] = useState<(string | null)[]>(new Array(questions.length).fill(null))
  const [showResult, setShowResult] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [showHint, setShowHint] = useState(false)
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [isAnswerConfirmed, setIsAnswerConfirmed] = useState(false)
  
  // AI Validation state
  const [validationResult, setValidationResult] = useState<QuizValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const { validateQuiz } = useQuizValidation()

  // Get current question
  const currentQuestion = questions[currentQuestionIndex]
  // Options are now pre-shuffled from the API, so we use them directly
  const currentOptions = ['A', 'B', 'C', 'D']

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

    console.log('🔍 DEBUG EnhancedQuizComponent - calculateStats:', {
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      unansweredQuestions,
      totalScore,
      totalTimeSpent,
      averageTimePerQuestion,
      accuracy
    })

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

  // Timer effect
  useEffect(() => {
    if (timeLimit > 0 && !isCompleted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsCompleted(true)
            // Calculate final statistics
            const stats = calculateStats()
            console.log('🔍 DEBUG EnhancedQuizComponent - calculated stats:', stats)
            
            // Call completion callback
            onComplete(stats.totalScore, stats.totalQuestions, quizResults)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeLimit, isCompleted, calculateStats, onComplete, quizResults])

  // Reset question timer when question changes
  useEffect(() => {
    setQuestionStartTime(Date.now())
    setShowResult(false)
    setShowHint(false)
    setSelectedAnswer(answers[currentQuestionIndex])
  }, [currentQuestionIndex, answers])

  // Handle answer selection
  const handleAnswerSelect = useCallback((answer: string) => {
    if (isCompleted) return
    
    console.log('🔍 DEBUG EnhancedQuizComponent - handleAnswerSelect called with:', answer)
    console.log('🔍 DEBUG EnhancedQuizComponent - currentQuestionIndex:', currentQuestionIndex)
    console.log('🔍 DEBUG EnhancedQuizComponent - currentQuestion:', currentQuestion)
    
    setSelectedAnswer(answer)
    // Don't show result immediately - wait for confirmation
    setShowResult(false)
    setIsAnswerConfirmed(false)
    
    // Update answers array
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = answer
    setAnswers(newAnswers)
  }, [isCompleted, currentQuestionIndex, answers])

  // Handle answer confirmation
  const handleConfirmAnswer = useCallback(() => {
    if (!selectedAnswer) return
    
    console.log('🔍 DEBUG EnhancedQuizComponent - handleConfirmAnswer called')
    
    setShowResult(true)
    setIsAnswerConfirmed(true)
    
    // Calculate time spent on this question
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000)
    
    // Create result for this question
    const result: QuizResult = {
      questionIndex: currentQuestionIndex,
      question: currentQuestion,
      selectedAnswer: selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer,
      timeSpent,
      pointsEarned: selectedAnswer === currentQuestion.correctAnswer ? (currentQuestion.points || 10) : 0
    }

    console.log('🔍 DEBUG EnhancedQuizComponent - created result:', result)

    setQuizResults(prev => {
      const updated = [...prev]
      updated[currentQuestionIndex] = result
      console.log('🔍 DEBUG EnhancedQuizComponent - updated quizResults:', updated)
      return updated
    })
  }, [selectedAnswer, currentQuestionIndex, currentQuestion, questionStartTime])

  // Validate quiz completion using AI SDK
  const validateQuizCompletion = useCallback(async () => {
    setIsValidating(true);
    try {
      // Convert answers to the format expected by validation
      const userAnswers: Record<string, { questionId: string; answer: string | number; timestamp: number }> = {};
      
      answers.forEach((answer, index) => {
        if (answer !== null) {
          const questionId = questions[index].id || `question_${index}`;
          userAnswers[questionId] = {
            questionId,
            answer,
            timestamp: Date.now()
          };
        }
      });

      // Convert questions to validation format
      const validationQuestions = questions.map(q => ({
        id: q.id || `question_${questions.indexOf(q)}`,
        question: q.question,
        type: 'multiple-choice' as const,
        options: Object.values(q.options),
        correctAnswer: q.correctAnswer,
        required: true
      }));

      const result = await validateQuiz(validationQuestions, userAnswers, {
        subject: 'Educacional',
        difficulty: 'Média'
      });

      setValidationResult(result);
      return result;
    } catch (error) {
      console.error('Erro na validação do quiz:', error);
      // Fallback: validação simples
      const unansweredCount = answers.filter(a => a === null).length;
      const result: QuizValidationResult = {
        allQuestionsAnswered: unansweredCount === 0,
        unansweredQuestions: answers.map((a, i) => a === null ? i : -1).filter(i => i !== -1),
        incompleteAnswers: [],
        canProceed: unansweredCount === 0,
        recommendations: unansweredCount > 0 ? ['Responda todas as questões antes de prosseguir'] : []
      };
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, [answers, questions, validateQuiz]);

  // Handle next question with validation
  const handleNext = useCallback(async () => {
    console.log('🔍 DEBUG EnhancedQuizComponent - handleNext called')
    console.log('🔍 DEBUG EnhancedQuizComponent - currentQuestionIndex:', currentQuestionIndex)
    console.log('🔍 DEBUG EnhancedQuizComponent - questions.length:', questions.length)
    console.log('🔍 DEBUG EnhancedQuizComponent - selectedAnswer:', selectedAnswer)
    
    // Verificar se a pergunta atual foi respondida antes de avançar
    if (!isAnswerConfirmed) {
      console.log('🔍 DEBUG EnhancedQuizComponent - Current question not answered, cannot advance')
      return; // Não permitir avançar sem responder a pergunta atual
    }
    
    // Se não é a última questão, permitir navegação normal
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null) // Reset selected answer for next question
      setShowResult(false) // Reset result display
      setShowHint(false) // Reset hint display
      setIsAnswerConfirmed(false) // Reset confirmation state
      setQuestionStartTime(Date.now()) // Reset timer for next question
    } else {
      // Na última questão, validar se pode prosseguir
      console.log('🔍 DEBUG EnhancedQuizComponent - Reached last question, validating completion')
      const validation = await validateQuizCompletion();
      
      if (validation.canProceed) {
        console.log('🔍 DEBUG EnhancedQuizComponent - Validation passed, completing quiz')
        handleCompleteQuiz();
      } else {
        console.log('🔍 DEBUG EnhancedQuizComponent - Validation failed, showing feedback')
        // Mostrar feedback de validação
      }
    }
  }, [currentQuestionIndex, questions.length, selectedAnswer, validateQuizCompletion, isAnswerConfirmed])

  // Handle previous question
  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setSelectedAnswer(null) // Reset selected answer for previous question
      setShowResult(false) // Reset result display
      setShowHint(false) // Reset hint display
      setIsAnswerConfirmed(false) // Reset confirmation state
      setQuestionStartTime(Date.now()) // Reset timer for previous question
    }
  }, [currentQuestionIndex])

  // Save quiz progress to database
  const saveQuizProgress = useCallback(async (lessonId: string, userId: string, stageIndex: number) => {
    try {
      const stats = calculateStats();
      const quizResultsData = quizResults.reduce((acc, result, index) => {
        acc[`question_${index}`] = {
          questionId: result.question.id,
          selectedAnswer: result.selectedAnswer,
          correctAnswer: result.correctAnswer,
          isCorrect: result.isCorrect,
          timeSpent: result.timeSpent,
          pointsEarned: result.pointsEarned
        };
        return acc;
      }, {} as any);

      await fetch('/api/lessons/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          lessonId,
          stageIndex,
          completed: true,
          quizResults: quizResultsData,
          timeSpent: stats.totalTimeSpent
        })
      });
    } catch (error) {
      console.error('Erro ao salvar progresso do quiz:', error);
    }
  }, [calculateStats, quizResults]);

  // Handle manual quiz completion
  const handleCompleteQuiz = useCallback(async () => {
    console.log('🔍 DEBUG EnhancedQuizComponent - handleCompleteQuiz called')
    setIsCompleted(true)
    // Calculate final statistics
    const stats = calculateStats()
    console.log('🔍 DEBUG EnhancedQuizComponent - calculated stats:', stats)
    
    // Save quiz progress if lessonId and userId are available
    const lessonId = (window as any).currentLessonId;
    const userId = (window as any).currentUserId;
    if (lessonId && userId) {
      await saveQuizProgress(lessonId, userId, (window as any).currentStageIndex || 0);
    }
    
    // Call completion callback
    onComplete(stats.totalScore, stats.totalQuestions, quizResults)
  }, [calculateStats, onComplete, quizResults, saveQuizProgress])

  // Handle retry
  const handleRetry = useCallback(() => {
    console.log('🔍 DEBUG EnhancedQuizComponent - handleRetry called')
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setAnswers(new Array(questions.length).fill(null))
    setShowResult(false)
    setIsCompleted(false)
    setIsAnswerConfirmed(false)
    setTimeLeft(timeLimit)
    setQuizResults([])
    setShowHint(false)
  }, [questions.length, timeLimit])

  // Handle hint toggle
  const handleHintToggle = useCallback(() => {
    console.log('🔍 DEBUG EnhancedQuizComponent - handleHintToggle called')
    setShowHint(prev => !prev)
  }, [])

  // Get option label (A, B, C, D)
  const getOptionLabel = useCallback((index: number) => {
    const label = currentOptions[index]
    console.log('🔍 DEBUG EnhancedQuizComponent - getOptionLabel:', { index, label })
    return label
  }, [currentOptions])

  // Get option value from label
  const getOptionValue = useCallback((label: string) => {
    const value = currentQuestion.options[label as keyof typeof currentQuestion.options]
    console.log('🔍 DEBUG EnhancedQuizComponent - getOptionValue:', { 
      label, 
      value, 
      options: currentQuestion.options,
      questionId: currentQuestion.id 
    })
    return value
  }, [currentQuestion.options])

  // Format time
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    const formatted = `${mins}:${secs.toString().padStart(2, '0')}`
    console.log('🔍 DEBUG EnhancedQuizComponent - formatTime:', { seconds, formatted })
    return formatted
  }, [])

  // Get difficulty color
  const getDifficultyColor = useCallback((difficulty?: string) => {
    const color = (() => {
      switch (difficulty) {
        case 'EASY': return 'bg-green-100 text-green-800'
        case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
        case 'HARD': return 'bg-red-100 text-red-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    })()
    console.log('🔍 DEBUG EnhancedQuizComponent - getDifficultyColor:', { difficulty, color })
    return color
  }, [])

  // Get difficulty label
  const getDifficultyLabel = useCallback((difficulty?: string) => {
    const label = (() => {
      switch (difficulty) {
        case 'EASY': return 'Fácil'
        case 'MEDIUM': return 'Médio'
        case 'HARD': return 'Difícil'
        default: return 'Padrão'
      }
    })()
    console.log('🔍 DEBUG EnhancedQuizComponent - getDifficultyLabel:', { difficulty, label })
    return label
  }, [])

  // If completed, show results
  if (isCompleted) {
    const stats = calculateStats()
    
    return (
      <Card className={`w-full max-w-4xl mx-auto ${className}`}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Trophy className="h-8 w-8 text-yellow-500" />
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

          {/* Detailed Results */}
          {showExplanations && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resultados Detalhados</h3>
              {questions.map((question, index) => {
                const result = quizResults[index]
                const isCorrect = result?.isCorrect || false
                const selectedAnswer = result?.selectedAnswer || null
                
                return (
                  <Card key={index} className={`border-l-4 ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">Questão {index + 1}</span>
                              {question.difficulty && (
                                <Badge className={getDifficultyColor(question.difficulty)}>
                                  {getDifficultyLabel(question.difficulty)}
                                </Badge>
                              )}
                              {isCorrect ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                            <MarkdownRenderer content={question.question} />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Opções:</h4>
                            <div className="space-y-1">
                              {Object.entries(question.options).map(([key, value]) => (
                                <div key={key} className={`p-2 rounded text-sm ${
                                  key === question.correctAnswer 
                                    ? 'bg-green-100 text-green-800 border border-green-300' 
                                    : key === selectedAnswer && !isCorrect
                                    ? 'bg-red-100 text-red-800 border border-red-300'
                                    : 'bg-gray-50 text-gray-700'
                                }`}>
                                  <span className="font-medium">{key}:</span> {value}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Explicação:</h4>
                            <MarkdownRenderer content={question.explanation} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-4">
            {allowRetry && (
              <Button onClick={() => {
                console.log('🔍 DEBUG EnhancedQuizComponent - retry button clicked')
                handleRetry()
              }} variant="outline">
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
          value={((currentQuestionIndex + 1) / questions.length) * 100} 
          className="w-full"
        />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Question */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {currentQuestion.difficulty && (
              <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                {getDifficultyLabel(currentQuestion.difficulty)}
              </Badge>
            )}
            {currentQuestion.points && (
              <Badge variant="outline">
                {currentQuestion.points} pontos
              </Badge>
            )}
          </div>
          
          <div className="prose max-w-none">
            <MarkdownRenderer content={currentQuestion.question} />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentOptions.map((label, index) => {
            const optionValue = getOptionValue(label)
            const isSelected = selectedAnswer === label
            const isCorrect = showResult && label === currentQuestion.correctAnswer
            const isWrong = showResult && isSelected && !isCorrect
            
            console.log('🔍 DEBUG EnhancedQuizComponent - rendering option:', {
              label,
              index,
              optionValue,
              isSelected,
              isCorrect,
              isWrong,
              showResult,
              selectedAnswer,
              correctAnswer: currentQuestion.correctAnswer
            })
            
            return (
              <motion.button
                key={label}
                onClick={() => {
                  console.log('🔍 DEBUG EnhancedQuizComponent - option clicked:', label)
                  handleAnswerSelect(label)
                }}
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
                    {label}
                  </div>
                  <div className="flex-1">
                    <MarkdownRenderer content={optionValue} />
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

        {/* Hint */}
        {showHints && currentQuestion.hint && (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('🔍 DEBUG EnhancedQuizComponent - hint button clicked')
                handleHintToggle()
              }}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              💡 {showHint ? 'Ocultar Dica' : 'Mostrar Dica'}
            </Button>
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <MarkdownRenderer content={currentQuestion.hint} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Immediate Feedback */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border-2 ${
              selectedAnswer === currentQuestion.correctAnswer
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              {selectedAnswer === currentQuestion.correctAnswer ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <h4 className={`font-medium text-lg ${
                selectedAnswer === currentQuestion.correctAnswer
                  ? 'text-green-800'
                  : 'text-red-800'
              }`}>
                {selectedAnswer === currentQuestion.correctAnswer ? 'Correto! 🎉' : 'Incorreto 😔'}
              </h4>
            </div>
            
            {showExplanations && (
              <div>
                <h5 className="font-medium text-gray-800 mb-2">Explicação:</h5>
                <MarkdownRenderer content={currentQuestion.explanation} />
              </div>
            )}
          </motion.div>
        )}

        {/* Question Navigation Dots - Responsive Mobile Layout */}
        <div className="mb-4">
          {/* Desktop: Single row */}
          <div className="hidden md:flex justify-center gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  console.log('🔍 DEBUG EnhancedQuizComponent - navigation dot clicked:', index)
                  // Only allow navigation if current question is confirmed or if going to a question that's already answered
                  if (isAnswerConfirmed || answers[index] !== null || index === currentQuestionIndex) {
                    setCurrentQuestionIndex(index)
                  }
                }}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-blue-500 text-white'
                    : answers[index]
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } ${!isAnswerConfirmed && index !== currentQuestionIndex && answers[index] === null ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Mobile: Two rows when needed */}
          <div className="md:hidden">
            {/* First row of dots */}
            <div className="flex justify-center gap-1 mb-1">
              {questions.slice(0, Math.ceil(questions.length / 2)).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    console.log('🔍 DEBUG EnhancedQuizComponent - navigation dot clicked:', index)
                    // Only allow navigation if current question is confirmed or if going to a question that's already answered
                    if (isAnswerConfirmed || answers[index] !== null || index === currentQuestionIndex) {
                      setCurrentQuestionIndex(index)
                    }
                  }}
                  className={`w-6 h-6 rounded-full text-xs font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-blue-500 text-white'
                      : answers[index]
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  } ${!isAnswerConfirmed && index !== currentQuestionIndex && answers[index] === null ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            {/* Second row of dots (only if there are more than half the questions) */}
            {questions.length > Math.ceil(questions.length / 2) && (
              <div className="flex justify-center gap-1">
                {questions.slice(Math.ceil(questions.length / 2)).map((_, index) => {
                  const actualIndex = index + Math.ceil(questions.length / 2);
                  return (
                    <button
                      key={actualIndex}
                      onClick={() => {
                        console.log('🔍 DEBUG EnhancedQuizComponent - navigation dot clicked:', actualIndex)
                        // Only allow navigation if current question is confirmed or if going to a question that's already answered
                        if (isAnswerConfirmed || answers[actualIndex] !== null || actualIndex === currentQuestionIndex) {
                          setCurrentQuestionIndex(actualIndex)
                        }
                      }}
                      className={`w-6 h-6 rounded-full text-xs font-medium transition-colors ${
                        actualIndex === currentQuestionIndex
                          ? 'bg-blue-500 text-white'
                          : answers[actualIndex]
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      } ${!isAnswerConfirmed && actualIndex !== currentQuestionIndex && answers[actualIndex] === null ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {actualIndex + 1}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Navigation and Completion Buttons */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => {
              console.log('🔍 DEBUG EnhancedQuizComponent - previous button clicked')
              handlePrevious()
            }}
            disabled={currentQuestionIndex === 0 || !isAnswerConfirmed}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {answers.filter(answer => answer !== null).length} de {questions.length} respondidas
            </span>
          </div>

          {/* Show OK button when answer is selected but not confirmed */}
          {selectedAnswer && !isAnswerConfirmed ? (
            <Button
              onClick={() => {
                console.log('🔍 DEBUG EnhancedQuizComponent - OK button clicked')
                handleConfirmAnswer()
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="h-4 w-4" />
              OK
            </Button>
          ) : currentQuestionIndex === questions.length - 1 ? (
            <div className="flex flex-col items-end gap-2">
              {/* Validation feedback */}
              {validationResult && !validationResult.canProceed && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    {validationResult.unansweredQuestions.length > 0 
                      ? `${validationResult.unansweredQuestions.length} questão(ões) não respondida(s)`
                      : 'Algumas respostas precisam ser melhoradas'
                    }
                  </span>
                </div>
              )}
              
              <Button
                onClick={() => {
                  console.log('🔍 DEBUG EnhancedQuizComponent - next button clicked (last question)')
                  handleNext()
                }}
                disabled={!isAnswerConfirmed || isValidating}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {isValidating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Validando...
                  </>
                ) : (
                  <>
                    <Trophy className="h-4 w-4" />
                    Finalizar Quiz
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => {
                console.log('🔍 DEBUG EnhancedQuizComponent - next button clicked')
                handleNext()
              }}
              disabled={!isAnswerConfirmed}
              className="flex items-center gap-2"
            >
              Próxima
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
