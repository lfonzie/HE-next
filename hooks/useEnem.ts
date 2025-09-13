import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { EnemQuestion, EnemSession } from '@/types'

export function useEnem() {
  const [questions, setQuestions] = useState<EnemQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [score, setScore] = useState<number>()
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()

  const loadQuestions = useCallback(async (area: string, numQuestions: number) => {
    if (!session) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/enem/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area, numQuestions })
      })

      if (!response.ok) throw new Error('Failed to load questions')

      const data = await response.json()
      setQuestions(data.questions)
      setCurrentQuestion(0)
      setAnswers({})
      setIsFinished(false)
      setScore(undefined)
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session])

  const startSimulation = useCallback((duration: number) => {
    setTimeLeft(duration * 60)
    setIsActive(true)
    setIsFinished(false)
  }, [])

  const pauseSimulation = useCallback(() => {
    setIsActive(false)
  }, [])

  const resumeSimulation = useCallback(() => {
    setIsActive(true)
  }, [])

  const finishSimulation = useCallback(async () => {
    setIsActive(false)
    setIsFinished(true)
    
    // Calculate score
    const correctAnswers = questions.reduce((acc, question, index) => {
      return acc + (answers[index] === question.correct ? 1 : 0)
    }, 0)
    
    const calculatedScore = Math.round((correctAnswers / questions.length) * 1000)
    setScore(calculatedScore)

    // Save session to database
    if (session) {
      try {
        await fetch('/api/enem/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            area: questions[0]?.area || 'geral',
            numQuestions: questions.length,
            durationMs: (questions.length * 3) * 60 * 1000, // 3 minutes per question
            questions: questions.map(q => q.id),
            answers,
            score: calculatedScore
          })
        })
      } catch (error) {
        console.error('Error saving session:', error)
      }
    }
  }, [questions, answers, session])

  const selectAnswer = useCallback((answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: answer }))
  }, [currentQuestion])

  const nextQuestion = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }, [currentQuestion, questions.length])

  const prevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }, [currentQuestion])

  const resetSimulation = useCallback(() => {
    setQuestions([])
    setCurrentQuestion(0)
    setAnswers({})
    setTimeLeft(0)
    setIsActive(false)
    setIsFinished(false)
    setScore(undefined)
  }, [])

  return {
    questions,
    currentQuestion,
    answers,
    timeLeft,
    isActive,
    isFinished,
    score,
    isLoading,
    loadQuestions,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    finishSimulation,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    resetSimulation,
    setTimeLeft
  }
}
