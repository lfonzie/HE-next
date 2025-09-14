import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { EnemQuestion, EnemSession } from '@/types'
import { useEnemProgressiveLoading } from './useEnemProgressiveLoading'

export function useEnem() {
  const [questions, setQuestions] = useState<EnemQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [score, setScore] = useState<number>()
  const [isLoading, setIsLoading] = useState(false)
  const [useProgressiveLoading, setUseProgressiveLoading] = useState(true)
  const { data: session } = useSession()

  // Hook para carregamento progressivo
  const progressiveLoading = useEnemProgressiveLoading()
  const { startProgressiveLoading } = progressiveLoading

  const loadQuestions = useCallback(async (area: string, numQuestions: number, useRealQuestions = true) => {
    if (!session) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/enem/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for NextAuth
        body: JSON.stringify({ area, numQuestions, useRealQuestions })
      })

      if (!response.ok) throw new Error('Failed to load questions')

      const data = await response.json()
      setQuestions(data.questions)
      setCurrentQuestion(0)
      setAnswers({})
      setIsFinished(false)
      setScore(undefined)
      
      // Log da fonte das questões
      console.log(`Questions loaded from: ${data.source}`)
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session])

  const loadRealQuestions = useCallback(async (area: string, numQuestions: number, year?: number) => {
    if (!session) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/enem/real-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for NextAuth
        body: JSON.stringify({ area, count: numQuestions, year, random: true })
      })

      if (!response.ok) throw new Error('Failed to load real questions')

      const data = await response.json()
      setQuestions(data.questions)
      setCurrentQuestion(0)
      setAnswers({})
      setIsFinished(false)
      setScore(undefined)
      
      console.log(`Real ENEM questions loaded: ${data.total} questions`)
    } catch (error) {
      console.error('Error loading real questions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session])

  const loadQuestionsProgressive = useCallback(async (
    area: string, 
    numQuestions: number, 
    useRealQuestions = true, 
    year?: number
  ) => {
    if (!session) {
      console.warn('No session available for progressive loading')
      return
    }

    const loadQuestionsFn = async (): Promise<EnemQuestion[]> => {
      try {
        console.log(`🔄 Carregando questões: área=${area}, num=${numQuestions}, real=${useRealQuestions}`)
        const response = await fetch('/api/enem/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Include cookies for NextAuth
          body: JSON.stringify({ area, numQuestions, useRealQuestions, year })
        })

        console.log(`📡 Resposta da API: ${response.status} ${response.statusText}`)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ Erro na API: ${response.status} ${errorText}`)
          throw new Error(`Failed to load questions: ${response.status} ${errorText}`)
        }

        const data = await response.json()
        console.log(`📊 Dados recebidos:`, data)
        
        if (!data.questions || !Array.isArray(data.questions)) {
          console.error('❌ Formato de resposta inválido:', data)
          throw new Error('Invalid response format from API')
        }
        
        console.log(`✅ ${data.questions.length} questões carregadas com sucesso`)
        return data.questions
      } catch (error) {
        console.error('❌ Erro no carregamento de questões:', error)
        throw error // Re-throw to let the progressive loading handle it
      }
    }

    try {
      await startProgressiveLoading(numQuestions, loadQuestionsFn)
    } catch (error) {
      console.error('Progressive loading failed:', error)
      // Don't do fallback loading to avoid duplicate questions
      // The progressive loading hook will handle the error state
      setIsLoading(false)
    }
  }, [session, startProgressiveLoading, loadQuestions, loadRealQuestions])

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
    useProgressiveLoading,
    setUseProgressiveLoading,
    loadQuestions,
    loadRealQuestions,
    loadQuestionsProgressive,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    finishSimulation,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    resetSimulation,
    setTimeLeft,
    // Estado do carregamento progressivo
    progressiveLoading: progressiveLoading.loadingState,
    getCurrentProgressiveQuestion: progressiveLoading.getCurrentQuestion,
    getAvailableProgressiveQuestions: progressiveLoading.getAvailableQuestions,
    canNavigateToProgressiveQuestion: progressiveLoading.canNavigateToQuestion
  }
}
