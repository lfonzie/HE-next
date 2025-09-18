"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  TrendingUp, 
  RotateCcw, 
  ArrowLeft,
  Award,
  BarChart3,
  Lightbulb
} from 'lucide-react'
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
  metadata?: {
    source?: string
    has_image?: boolean
    original_year?: number
    generated_at?: string
  }
}

interface ResultData {
  questions: Question[]
  answers: Record<number, string>
  score: number
  totalQuestions: number
  timeSpent: number
  correctAnswers: number
  wrongAnswers: number
  sessionData: {
    area: string
    numQuestions: number
    duration: number
    useRealQuestions: boolean
    year?: number
  }
}

export default function ResultPage() {
  const params = useParams()
  const router = useRouter()
  const simulatorId = params.id as string

  const [resultData, setResultData] = useState<ResultData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false)

  useEffect(() => {
    const loadResultData = async () => {
      try {
        // Load from localStorage (in a real app, this would come from an API)
        const stored = localStorage.getItem(`simulator_result_${simulatorId}`)
        if (stored) {
          const data = JSON.parse(stored)
          
          // Ensure all values are properly calculated
          const enhancedData = {
            ...data,
            // Ensure scores are properly calculated
            totalScore: data.totalScore || calculateTotalScore(data.questions, data.answers),
            correctAnswers: data.correctAnswers || calculateCorrectAnswers(data.questions, data.answers),
            totalQuestions: data.totalQuestions || data.questions?.length || 0,
            accuracy: data.accuracy || calculateAccuracy(data.questions, data.answers),
            timeSpent: data.timeSpent || 0,
            // Ensure all required fields exist
            questions: data.questions || [],
            answers: data.answers || {},
            metadata: data.metadata || {}
          }
          
          setResultData(enhancedData)
        } else {
          // If no result data, redirect to simulator
          router.push(`/enem/${simulatorId}`)
          return
        }
      } catch (error) {
        console.error('Error loading result data:', error)
        router.push(`/enem/${simulatorId}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadResultData()
  }, [simulatorId, router])

  // Helper functions to ensure proper calculations
  const calculateTotalScore = (questions: Question[], answers: Record<string, string>) => {
    if (!questions || !answers) return 0
    const correct = questions.filter(q => answers[q.id] === q.correct).length
    return Math.round((correct / questions.length) * 1000) // ENEM scale
  }

  const calculateCorrectAnswers = (questions: Question[], answers: Record<string, string>) => {
    if (!questions || !answers) return 0
    return questions.filter(q => answers[q.id] === q.correct).length
  }

  const calculateAccuracy = (questions: Question[], answers: Record<string, string>) => {
    if (!questions || !answers || questions.length === 0) return 0
    const correct = questions.filter(q => answers[q.id] === q.correct).length
    return Math.round((correct / questions.length) * 100)
  }

  const getPerformanceLevel = (score: number) => {
    if (score >= 800) return { level: 'Excelente', color: 'text-green-600', bgColor: 'bg-green-50' }
    if (score >= 600) return { level: 'Bom', color: 'text-blue-600', bgColor: 'bg-blue-50' }
    if (score >= 400) return { level: 'Regular', color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
    return { level: 'Precisa Melhorar', color: 'text-red-600', bgColor: 'bg-red-50' }
  }

  const getQuestionSourceChip = (question: Question) => {
    // Check metadata first for explicit source information
    if (question.metadata?.source) {
      switch (question.metadata.source) {
        case 'DATABASE':
          return { text: `ENEM ${question.year || question.metadata.original_year || 'API'}`, variant: "default" as const }
        case 'LOCAL_DATABASE':
          return { text: `ENEM ${question.year || question.metadata.original_year || 'Local'}`, variant: "default" as const }
        case 'AI':
          return { text: "IA", variant: "secondary" as const }
      }
    }
    
    // Legacy source checking
    if (question.source === 'enem.dev' || question.source === 'api' || question.source === 'DATABASE') {
      return { text: `ENEM ${question.year || 'API'}`, variant: "default" as const }
    }
    if (question.source.includes('AI') || question.source === 'ai' || question.source === 'generated') {
      return { text: "IA", variant: "secondary" as const }
    }
    
    // Check ID patterns
    if (question.id) {
      if (question.id.startsWith('enem_')) {
        return { text: `ENEM ${question.year || 'API'}`, variant: "default" as const }
      }
      if (question.id.startsWith('ai_generated_') || question.id.startsWith('generated_')) {
        return { text: "IA", variant: "secondary" as const }
      }
    }
    
    return { text: "IA", variant: "secondary" as const }
  }

  const handleRestart = () => {
    router.push(`/enem/${simulatorId}`)
  }

  const handleNewSimulator = () => {
        router.push('/enem')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando resultados...</p>
        </div>
      </div>
    )
  }

  if (!resultData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar resultados</h2>
          <p className="text-gray-600 mb-4">Não foi possível carregar os dados do simulado.</p>
          <Button onClick={() => router.push(`/enem/${simulatorId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Simulado
          </Button>
        </div>
      </div>
    )
  }

  const performance = getPerformanceLevel(resultData.score)
  const wrongAnswers = resultData.questions.filter((question, index) => 
    resultData.answers[index] !== question.correctAnswer.toString()
  )

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white shadow-sm border-b mb-6">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Resultados do Simulado ENEM
              </h1>
              <p className="text-sm text-gray-600">
                {resultData.sessionData.area} • {resultData.totalQuestions} questões • {resultData.sessionData.duration} minutos
              </p>
            </div>
            <Button onClick={() => router.push('/simulador')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>

      {/* Overall Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            Resumo Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${performance.color} mb-2`}>
                {resultData.score}
              </div>
              <div className="text-sm text-gray-600">Pontuação Total</div>
              <Badge className={`mt-2 ${performance.bgColor} ${performance.color}`}>
                {performance.level}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {resultData.correctAnswers}
              </div>
              <div className="text-sm text-gray-600">Acertos</div>
              <Progress 
                value={(resultData.correctAnswers / resultData.totalQuestions) * 100} 
                className="mt-2 h-2"
              />
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {resultData.wrongAnswers}
              </div>
              <div className="text-sm text-gray-600">Erros</div>
              <Progress 
                value={(resultData.wrongAnswers / resultData.totalQuestions) * 100} 
                className="mt-2 h-2"
              />
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatTime(resultData.timeSpent)}
              </div>
              <div className="text-sm text-gray-600">Tempo Gasto</div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((resultData.timeSpent / (resultData.sessionData.duration * 60)) * 100)}% do tempo total
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Analysis */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Análise de Desempenho
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((resultData.correctAnswers / resultData.totalQuestions) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Taxa de Acerto</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {resultData.correctAnswers}
              </div>
              <div className="text-sm text-gray-600">Questões Corretas</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {performance.level}
              </div>
              <div className="text-sm text-gray-600">Nível de Performance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Feedback Toggle */}
      <div className="text-center mb-6">
        <Button 
          onClick={() => setShowDetailedFeedback(!showDetailedFeedback)}
          variant="outline"
          size="lg"
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          {showDetailedFeedback ? 'Ocultar' : 'Mostrar'} Feedback Detalhado
        </Button>
      </div>

      {/* Detailed Feedback for Errors */}
      {showDetailedFeedback && wrongAnswers.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-600" />
              Feedback Detalhado - Questões Incorretas
            </CardTitle>
            <p className="text-sm text-gray-600">
              Revisão das {wrongAnswers.length} questões que você errou com explicações detalhadas
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {wrongAnswers.map((question, index) => {
                const questionIndex = resultData.questions.findIndex(q => q.id === question.id)
                const userAnswer = resultData.answers[questionIndex]
                const correctAnswerIndex = question.correctAnswer
                
                return (
                  <Card key={question.id} className="border-l-4 border-l-red-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                            Questão {questionIndex + 1}
                          </span>
                          <Badge variant={getQuestionSourceChip(question).variant} className="text-xs">
                            {getQuestionSourceChip(question).text}
                          </Badge>
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {question.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Question Statement */}
                      <div className="prose max-w-none">
                        <p className="text-gray-800 font-medium">{question.question}</p>
                      </div>

                      {/* Options */}
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => {
                          const isUserAnswer = userAnswer === optionIndex.toString()
                          const isCorrectAnswer = optionIndex === correctAnswerIndex
                          
                          return (
                            <div 
                              key={optionIndex}
                              className={`p-3 rounded-lg border ${
                                isCorrectAnswer 
                                  ? 'bg-green-50 border-green-200 text-green-800' 
                                  : isUserAnswer 
                                    ? 'bg-red-50 border-red-200 text-red-800'
                                    : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <span className="font-semibold mr-3">
                                {String.fromCharCode(65 + optionIndex)})
                              </span>
                              {option}
                              {isCorrectAnswer && (
                                <CheckCircle className="h-4 w-4 text-green-600 inline ml-2" />
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <XCircle className="h-4 w-4 text-red-600 inline ml-2" />
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Explanation */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Explicação
                        </h4>
                        <p className="text-blue-700">{question.explanation}</p>
                      </div>

                      {/* Topics and Competencies */}
                      {(question.topics.length > 0 || question.competencies.length > 0) && (
                        <div className="flex flex-wrap gap-2">
                          {question.topics.map((topic, topicIndex) => (
                            <Badge key={topicIndex} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {question.competencies.map((competency, compIndex) => (
                            <Badge key={compIndex} variant="outline" className="text-xs">
                              {competency}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button onClick={handleRestart} size="lg" variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Refazer Simulado
        </Button>
        <Button onClick={handleNewSimulator} size="lg">
          <BookOpen className="h-4 w-4 mr-2" />
          Novo Simulado
        </Button>
      </div>

      {/* Tips for Improvement */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-600" />
            Dicas para Melhorar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Estratégias de Estudo</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Revise os tópicos das questões erradas</li>
                <li>• Pratique mais questões similares</li>
                <li>• Foque nas competências com menor desempenho</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Próximos Passos</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Faça simulados regulares</li>
                <li>• Analise seu progresso ao longo do tempo</li>
                <li>• Mantenha um cronograma de estudos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
