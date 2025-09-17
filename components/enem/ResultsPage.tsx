"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target, 
  Trophy, 
  RotateCcw, 
  Share2,
  BookOpen,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { QuestionRenderer } from './QuestionRenderer'
import { formatTime } from '@/lib/utils'

interface Question {
  id: string
  stem: string
  alternatives?: string[]
  a?: string
  b?: string
  c?: string
  d?: string
  e?: string
  correct: string
  rationale: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  image_url?: string
  image_alt?: string
  area: string
  disciplina: string
  skill_tag: string[]
  year: number
}

interface UserAnswer {
  questionId: string
  answer: string
  timeSpent: number
}

interface ResultsData {
  questions: Question[]
  answers: Record<string, UserAnswer>
  totalTime: number
  startTime: number
  endTime: number
}

interface ResultsPageProps {
  resultsData: ResultsData
  onRetry: () => void
  onClose: () => void
}

export function ResultsPage({ resultsData, onRetry, onClose }: ResultsPageProps) {
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)

  // Calculate statistics
  const totalQuestions = resultsData.questions.length
  const correctAnswers = resultsData.questions.filter(question => {
    const userAnswer = resultsData.answers[question.id]
    return userAnswer && userAnswer.answer === question.correct
  }).length
  
  const wrongAnswers = resultsData.questions.filter(question => {
    const userAnswer = resultsData.answers[question.id]
    return userAnswer && userAnswer.answer !== question.correct
  })

  const unansweredQuestions = resultsData.questions.filter(question => {
    const userAnswer = resultsData.answers[question.id]
    return !userAnswer || !userAnswer.answer
  })

  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100)
  const averageTimePerQuestion = Math.round(resultsData.totalTime / totalQuestions)

  // Performance analysis
  const getPerformanceLevel = (score: number) => {
    if (score >= 80) return { level: 'Excelente', color: 'bg-green-500', icon: Trophy }
    if (score >= 60) return { level: 'Bom', color: 'bg-blue-500', icon: Target }
    if (score >= 40) return { level: 'Regular', color: 'bg-yellow-500', icon: AlertCircle }
    return { level: 'Precisa melhorar', color: 'bg-red-500', icon: BookOpen }
  }

  const performance = getPerformanceLevel(scorePercentage)
  const PerformanceIcon = performance.icon

  // Difficulty analysis
  const difficultyStats = {
    EASY: resultsData.questions.filter(q => q.difficulty === 'EASY').length,
    MEDIUM: resultsData.questions.filter(q => q.difficulty === 'MEDIUM').length,
    HARD: resultsData.questions.filter(q => q.difficulty === 'HARD').length
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HARD': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'Fácil'
      case 'MEDIUM': return 'Médio'
      case 'HARD': return 'Difícil'
      default: return 'Indefinido'
    }
  }

  const getAlternatives = (question: Question) => {
    if (question.alternatives) {
      return question.alternatives
    }
    return [question.a, question.b, question.c, question.d, question.e].filter(Boolean) as string[]
  }

  const handleShare = async () => {
    const shareText = `Acabei de completar um simulado ENEM e obtive ${scorePercentage}% de acertos! 🎓`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Resultado do Simulado ENEM',
          text: shareText,
        })
      } catch (error) {
        console.log('Erro ao compartilhar:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText)
        // You could show a toast here
      } catch (error) {
        console.log('Erro ao copiar:', error)
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <PerformanceIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Resultado do Simulado</h1>
        </div>
        <p className="text-gray-600">Análise completa do seu desempenho</p>
      </div>

      {/* Overall Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Desempenho Geral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="text-6xl font-bold text-gray-900">{scorePercentage}%</div>
              <Badge className={`absolute -top-2 -right-2 ${performance.color} text-white`}>
                {performance.level}
              </Badge>
            </div>
            <Progress value={scorePercentage} className="w-full max-w-md mx-auto" />
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">{correctAnswers}</div>
              <div className="text-sm text-green-600">Corretas</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-700">{wrongAnswers.length}</div>
              <div className="text-sm text-red-600">Incorretas</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-700">{unansweredQuestions.length}</div>
              <div className="text-sm text-gray-600">Sem resposta</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">{formatTime(resultsData.totalTime)}</div>
              <div className="text-sm text-blue-600">Tempo total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Análise Detalhada
            </div>
            <Button
              variant="outline"
              onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
            >
              {showDetailedAnalysis ? 'Ocultar' : 'Mostrar'} Detalhes
            </Button>
          </CardTitle>
        </CardHeader>
        {showDetailedAnalysis && (
          <CardContent className="space-y-6">
            {/* Difficulty Breakdown */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Distribuição por Dificuldade</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(difficultyStats).map(([difficulty, count]) => (
                  <div key={difficulty} className="text-center p-3 rounded-lg border">
                    <Badge className={getDifficultyColor(difficulty)}>
                      {getDifficultyLabel(difficulty)}
                    </Badge>
                    <div className="text-xl font-bold mt-2">{count}</div>
                    <div className="text-sm text-gray-600">questões</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wrong Answers */}
            {wrongAnswers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Questões Incorretas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {wrongAnswers.slice(0, 6).map((question, index) => {
                    const userAnswer = resultsData.answers[question.id]
                    const alternatives = getAlternatives(question)
                    const correctIndex = alternatives.findIndex(alt => 
                      alt === (question as any)[question.correct.toLowerCase()]
                    )
                    
                    return (
                      <Card key={question.id} className="border-l-4 border-l-red-500">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="destructive" className="text-xs">Incorreta</Badge>
                            <Badge className={`${getDifficultyColor(question.difficulty)} text-xs`}>
                              {getDifficultyLabel(question.difficulty)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <QuestionRenderer
                            question={question.stem}
                            imageUrl={question.image_url}
                            imageAlt={question.image_alt}
                          />
                          
                          <div className="space-y-1">
                            <h4 className="font-medium text-gray-900 text-sm">Alternativas:</h4>
                            {alternatives.map((alt, altIndex) => {
                              const isUserAnswer = userAnswer?.answer === String.fromCharCode(65 + altIndex)
                              const isCorrectAnswer = altIndex === correctIndex
                              
                              return (
                                <div
                                  key={altIndex}
                                  className={`p-2 rounded border ${
                                    isCorrectAnswer
                                      ? 'bg-green-50 border-green-200 text-green-800'
                                      : isUserAnswer
                                        ? 'bg-red-50 border-red-200 text-red-800'
                                        : 'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-xs flex-shrink-0">
                                      {String.fromCharCode(65 + altIndex)})
                                    </span>
                                    <span className="text-xs flex-1">{alt}</span>
                                    <div className="flex-shrink-0">
                                      {isCorrectAnswer && (
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                      )}
                                      {isUserAnswer && !isCorrectAnswer && (
                                        <XCircle className="h-3 w-3 text-red-600" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Explanation */}
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-1 text-sm">Explicação:</h4>
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              className="text-blue-800 prose-sm max-w-none text-xs"
                            >
                              {question.rationale}
                            </ReactMarkdown>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                  
                  {wrongAnswers.length > 5 && (
                    <div className="text-center">
                      <Button
                        variant="outline"
                        onClick={() => setShowDetailedAnalysis(true)}
                      >
                        Ver todas as {wrongAnswers.length} questões incorretas
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onRetry} size="lg" className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Fazer Novo Simulado
        </Button>
        <Button 
          variant="outline" 
          onClick={handleShare}
          size="lg"
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Compartilhar Resultado
        </Button>
        <Button 
          variant="outline" 
          onClick={onClose}
          size="lg"
        >
          Voltar ao Início
        </Button>
      </div>
    </div>
  )
}
