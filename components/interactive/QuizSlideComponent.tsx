'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer'

interface QuizQuestion {
  id?: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  points?: number
}

interface QuizSlideProps {
  question: QuizQuestion
  questionNumber: number
  totalQuestions: number
  onAnswer: (isCorrect: boolean, selectedAnswer: number) => void
  onNext: () => void
  onPrevious: () => void
  canGoNext: boolean
  canGoPrevious: boolean
  className?: string
}

export default function QuizSlideComponent({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  className = ""
}: QuizSlideProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswerConfirmed, setIsAnswerConfirmed] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null)
    setIsAnswerConfirmed(false)
    setShowResult(false)
    setIsCorrect(false)
  }, [question.id])

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswerConfirmed) return
    setSelectedAnswer(answerIndex)
  }

  const handleConfirmAnswer = () => {
    if (selectedAnswer === null) return
    
    const correct = selectedAnswer === question.correctAnswer
    setIsCorrect(correct)
    setShowResult(true)
    setIsAnswerConfirmed(true)
    
    // Call the onAnswer callback
    onAnswer(correct, selectedAnswer)
  }

  const handleNext = () => {
    if (!isAnswerConfirmed) return
    onNext()
  }

  const handlePrevious = () => {
    onPrevious()
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HARD': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty) {
      case 'EASY': return 'Fácil'
      case 'MEDIUM': return 'Médio'
      case 'HARD': return 'Difícil'
      default: return 'Padrão'
    }
  }

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>Questão {questionNumber} de {totalQuestions}</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            {question.difficulty && (
              <Badge className={getDifficultyColor(question.difficulty)}>
                {getDifficultyLabel(question.difficulty)}
              </Badge>
            )}
            {question.points && (
              <Badge variant="outline">
                {question.points} pontos
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Question */}
        <div className="space-y-4">
          <div className="prose max-w-none">
            <MarkdownRenderer content={question.question} />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrectOption = showResult && index === question.correctAnswer
            const isWrongSelected = showResult && isSelected && !isCorrectOption
            
            return (
              <motion.button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={isAnswerConfirmed}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  isCorrectOption
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : isWrongSelected
                    ? 'border-red-500 bg-red-50 text-red-800'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                } ${isAnswerConfirmed ? 'cursor-default' : 'cursor-pointer'}`}
                whileHover={!isAnswerConfirmed ? { scale: 1.02 } : {}}
                whileTap={!isAnswerConfirmed ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    isCorrectOption
                      ? 'bg-green-500 text-white'
                      : isWrongSelected
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
                      {isCorrectOption ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : isWrongSelected ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : null}
                    </div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Confirmation Button */}
        {selectedAnswer !== null && !isAnswerConfirmed && (
          <div className="text-center">
            <Button
              onClick={handleConfirmAnswer}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar Resposta
            </Button>
          </div>
        )}

        {/* Result Feedback */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-lg border-2 ${
                isCorrect
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                {isCorrect ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <h4 className={`font-medium text-lg ${
                  isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {isCorrect ? 'Correto! 🎉' : 'Incorreto 😔'}
                </h4>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-800 mb-2">Explicação:</h5>
                <MarkdownRenderer content={question.explanation} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="text-sm text-gray-600">
            {isAnswerConfirmed ? 'Resposta confirmada' : 'Selecione e confirme sua resposta'}
          </div>

          <Button
            onClick={handleNext}
            disabled={!canGoNext || !isAnswerConfirmed}
            className="flex items-center gap-2"
          >
            Próxima
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
