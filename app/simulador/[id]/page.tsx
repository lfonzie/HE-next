"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Timer, BookOpen, Target, Play, Pause, RotateCcw, Clock, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatTime } from '@/lib/utils'

interface Question {
  id: string
  subject: string
  area: string
  difficulty: string
  year: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  topics: string[]
  competencies: string[]
  source: string
}

interface SimulatorState {
  questions: Question[]
  currentQuestion: number
  answers: Record<number, string>
  timeLeft: number
  isActive: boolean
  isFinished: boolean
  score?: number
  isLoading: boolean
  totalQuestions: number
  loadedQuestions: number
  canStart: boolean
}

export default function SimulatorPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const simulatorId = params.id as string

  const [state, setState] = useState<SimulatorState>({
    questions: [],
    currentQuestion: 0,
    answers: {},
    timeLeft: 0,
    isActive: false,
    isFinished: false,
    score: undefined,
    isLoading: true,
    totalQuestions: 20,
    loadedQuestions: 0,
    canStart: false
  })

  const [sessionData, setSessionData] = useState<{
    area: string
    numQuestions: number
    duration: number
    useRealQuestions: boolean
    year?: number
  } | null>(null)

  // Load session data from localStorage or API
  useEffect(() => {
    const loadSessionData = () => {
      try {
        const stored = localStorage.getItem(`simulator_${simulatorId}`)
        if (stored) {
          const data = JSON.parse(stored)
          setSessionData(data)
          setState(prev => ({
            ...prev,
            totalQuestions: data.numQuestions,
            timeLeft: data.duration * 60
          }))
        } else {
          // If no stored data, redirect to setup
          router.push('/simulador')
          return
        }
      } catch (error) {
        console.error('Error loading session data:', error)
        router.push('/simulador')
      }
    }

    loadSessionData()
  }, [simulatorId, router])

  // Progressive loading implementation
  const loadQuestionsProgressive = useCallback(async () => {
    if (!sessionData) return

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      // Load initial batch of 2 questions
      const response = await fetch('/api/enem/progressive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area: sessionData.area,
          totalQuestions: sessionData.numQuestions,
          currentBatch: 0,
          batchSize: 2
        })
      })

      if (!response.ok) throw new Error('Failed to load questions')

      const data = await response.json()
      
      setState(prev => ({
        ...prev,
        questions: data.questions,
        loadedQuestions: data.totalGenerated,
        canStart: data.canStart,
        isLoading: false
      }))

      toast({
        title: "Questões Carregadas",
        description: `${data.questions.length} questões carregadas. ${data.canStart ? 'Pode começar!' : 'Carregando mais...'}`,
        variant: "default"
      })

    } catch (error) {
      console.error('Error loading questions:', error)
      setState(prev => ({ ...prev, isLoading: false }))
      toast({
        title: "Erro",
        description: "Falha ao carregar questões",
        variant: "destructive"
      })
    }
  }, [sessionData, toast])

  // Load next question when user navigates
  const loadNextQuestion = async () => {
    if (!sessionData || state.loadedQuestions >= state.totalQuestions) return

    try {
      const nextBatch = Math.floor(state.loadedQuestions / 2)
      const response = await fetch('/api/enem/progressive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area: sessionData.area,
          totalQuestions: sessionData.numQuestions,
          currentBatch: nextBatch,
          batchSize: 1 // Load one at a time after initial batch
        })
      })

      if (!response.ok) throw new Error('Failed to load next question')

      const data = await response.json()
      
      setState(prev => ({
        ...prev,
        questions: [...prev.questions, ...data.questions],
        loadedQuestions: data.totalGenerated
      }))

    } catch (error) {
      console.error('Error loading next question:', error)
    }
  }

  const finishSimulation = useCallback(() => {
    setState(prev => ({ ...prev, isActive: false, isFinished: true }))
    
    // Calculate score
    const correctAnswers = state.questions.reduce((acc, question, index) => {
      return acc + (state.answers[index] === question.correctAnswer.toString() ? 1 : 0)
    }, 0)
    
    const calculatedScore = Math.round((correctAnswers / state.questions.length) * 1000)
    setState(prev => ({ ...prev, score: calculatedScore }))
  }, [state.questions, state.answers])

  // Initialize progressive loading
  useEffect(() => {
    if (sessionData && state.questions.length === 0) {
      loadQuestionsProgressive()
    }
  }, [sessionData, state.questions.length, loadQuestionsProgressive])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (state.isActive && state.timeLeft > 0) {
      interval = setInterval(() => {
        setState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }))
      }, 1000)
    } else if (state.timeLeft === 0 && state.isActive) {
      finishSimulation()
    }
    return () => clearInterval(interval)
  }, [state.isActive, state.timeLeft, finishSimulation])

  const startSimulation = () => {
    setState(prev => ({ ...prev, isActive: true }))
  }

  const pauseSimulation = () => {
    setState(prev => ({ ...prev, isActive: false }))
  }

  const resumeSimulation = () => {
    setState(prev => ({ ...prev, isActive: true }))
  }

  const selectAnswer = (answer: string) => {
    setState(prev => ({ ...prev, answers: { ...prev.answers, [prev.currentQuestion]: answer } }))
  }

  const nextQuestion = async () => {
    if (state.currentQuestion < state.questions.length - 1) {
      setState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }))
    } else if (state.loadedQuestions < state.totalQuestions) {
      // Load next question if available
      await loadNextQuestion()
      setState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }))
    }
  }

  const prevQuestion = () => {
    if (state.currentQuestion > 0) {
      setState(prev => ({ ...prev, currentQuestion: prev.currentQuestion - 1 }))
    }
  }

  const resetSimulation = () => {
    setState(prev => ({
      ...prev,
      currentQuestion: 0,
      answers: {},
      timeLeft: sessionData?.duration ? sessionData.duration * 60 : 0,
      isActive: false,
      isFinished: false,
      score: undefined
    }))
  }

  const getQuestionSourceChip = (question: Question) => {
    if (question.source === 'enem.dev') {
      return { text: `ENEM ${question.year}`, variant: "default" as const }
    }
    if (question.source.includes('AI')) {
      return { text: "IA", variant: "secondary" as const }
    }
    return { text: "Mock", variant: "outline" as const }
  }

  if (!sessionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando configuração do simulado...</p>
        </div>
      </div>
    )
  }

  if (state.isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Preparando Simulado ENEM
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-blue-600 font-bold text-lg">
                    {Math.round((state.loadedQuestions / state.totalQuestions) * 100)}%
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-800">Carregando questões...</h3>
                <Progress value={(state.loadedQuestions / state.totalQuestions) * 100} className="w-full h-3" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{state.loadedQuestions} de {state.totalQuestions} questões</span>
                  <span>Carregamento progressivo</span>
                </div>
              </div>
            </div>
            
            {state.canStart && (
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Pronto para começar!</span>
                  </div>
                  <p className="text-sm text-green-600">
                    Você pode começar a responder enquanto as questões continuam carregando
                  </p>
                </div>
                <Button 
                  onClick={startSimulation} 
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-3"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Começar Simulado
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state.questions.length === 0) {
    return (
      <div className="text-center p-8">
        <p>Não foi possível carregar as questões. Tente novamente.</p>
        <Button onClick={() => router.push('/simulador')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar à Configuração
        </Button>
      </div>
    )
  }

  const question = state.questions[state.currentQuestion]
  const progress = ((state.currentQuestion + 1) / state.totalQuestions) * 100
  const answeredQuestions = Object.keys(state.answers).length

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white shadow-sm border-b mb-6">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Simulado ENEM - {sessionData.area}
              </h1>
              <p className="text-sm text-gray-600">
                {sessionData.numQuestions} questões • {sessionData.duration} minutos
                {sessionData.useRealQuestions && ' • Questões Reais'}
                {sessionData.year && ` • ${sessionData.year}`}
              </p>
            </div>
            <Button onClick={() => router.push('/simulador')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Simulado ENEM - {sessionData.area}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span className="font-mono text-lg">
                {formatTime(state.timeLeft)}
              </span>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Questão {state.currentQuestion + 1} de {state.totalQuestions}</span>
            <div className="flex gap-2">
              <Badge variant="secondary">{sessionData.area}</Badge>
              <Badge variant="outline">{answeredQuestions} respondidas</Badge>
              <Badge variant="default" className="bg-green-500">
                {state.loadedQuestions}/{state.totalQuestions} carregadas
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {!state.isActive && !state.isFinished && (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {state.canStart ? 'Simulado Pronto!' : 'Carregando questões...'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {sessionData.numQuestions} questões de {sessionData.area} • {sessionData.duration} minutos
                {state.loadedQuestions > 0 && (
                  <span className="block text-sm text-green-600 mt-2">
                    {state.loadedQuestions} questões carregadas
                  </span>
                )}
              </p>
              <Button 
                onClick={startSimulation} 
                size="lg"
                disabled={!state.canStart}
              >
                <Play className="h-4 w-4 mr-2" />
                {state.canStart ? 'Iniciar Simulado' : 'Aguarde...'}
              </Button>
            </div>
          )}

          {state.isActive && question && (
            <div className="space-y-6">
              <div className="prose max-w-none">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-medium flex-1">
                    {question.question}
                  </h3>
                  <Badge variant={getQuestionSourceChip(question).variant} className="text-xs">
                    {getQuestionSourceChip(question).text}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                {question.options.map((option: string, index: number) => (
                  <Button
                    key={index}
                    variant={state.answers[state.currentQuestion] === index.toString() ? "default" : "outline"}
                    className="w-full justify-start h-auto p-4 text-left"
                    onClick={() => selectAnswer(index.toString())}
                  >
                    <span className="font-semibold mr-3">
                      {String.fromCharCode(65 + index)})
                    </span>
                    {option}
                  </Button>
                ))}
              </div>

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={prevQuestion}
                  disabled={state.currentQuestion === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={pauseSimulation}
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </Button>
                  <Button 
                    onClick={nextQuestion}
                    disabled={state.currentQuestion === state.totalQuestions - 1}
                  >
                    Próxima
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {state.isFinished && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-2xl font-bold mb-2">Simulado Concluído!</h3>
              <p className="text-lg mb-4">Sua pontuação: {state.score}/1000</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={resetSimulation} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Refazer
                </Button>
                <Button onClick={() => router.push('/simulador')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Novo Simulado
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
