"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Target, 
  BookOpen, 
  RotateCcw, 
  Download, 
  Share2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lightbulb,
  GraduationCap,
  TrendingUp
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Explanation {
  questionId: string
  question: string
  options: string[]
  correctAnswer: number
  userAnswer: number
  explanation: string
  concepts: string[]
  tips: string[]
  difficulty: string
  area: string
}

interface EnemResultsProps {
  questions: any[]
  answers: Record<number, string>
  score: number
  totalQuestions: number
  onRestart: () => void
  onBackToSetup: () => void
}

export function EnemResults({ 
  questions, 
  answers, 
  score, 
  totalQuestions, 
  onRestart, 
  onBackToSetup 
}: EnemResultsProps) {
  const [explanations, setExplanations] = useState<Explanation[]>([])
  const [isLoadingExplanations, setIsLoadingExplanations] = useState(false)
  const [showExplanations, setShowExplanations] = useState(false)
  const { toast } = useToast()

  // Calcular estatísticas
  const correctAnswers = questions.reduce((acc, question, index) => {
    return acc + (answers[index] === question.correctAnswer ? 1 : 0)
  }, 0)
  
  const wrongAnswers = totalQuestions - correctAnswers
  const percentage = Math.round((correctAnswers / totalQuestions) * 100)

  // Carregar explicações quando o componente monta
  useEffect(() => {
    if (wrongAnswers > 0) {
      loadExplanations()
    }
  }, [])

  const loadExplanations = async () => {
    setIsLoadingExplanations(true)
    try {
      // Preparar dados das questões com respostas do usuário
      const questionsWithAnswers = questions.map((question, index) => ({
        ...question,
        userAnswer: answers[index]
      }))

      const response = await fetch('/api/enem/explanations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for NextAuth
        body: JSON.stringify({
          questions: questionsWithAnswers,
          answers: Object.values(answers)
        })
      })

      if (!response.ok) throw new Error('Failed to load explanations')

      const data = await response.json()
      setExplanations(data.explanations || [])
      
      toast({
        title: "Explicações carregadas!",
        description: `${data.totalWrong} questões com explicações detalhadas.`,
      })
    } catch (error) {
      console.error('Error loading explanations:', error)
      toast({
        title: "Erro ao carregar explicações",
        description: "Não foi possível carregar as explicações das questões.",
        variant: "destructive"
      })
    } finally {
      setIsLoadingExplanations(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-600'
    if (score >= 600) return 'text-blue-600'
    if (score >= 400) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 800) return 'bg-green-100 text-green-800'
    if (score >= 600) return 'bg-blue-100 text-blue-800'
    if (score >= 400) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header de Resultados */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">
            Simulado Finalizado!
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Parabéns por completar o simulado ENEM
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {/* Pontuação */}
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-600">
                {score}
              </div>
              <div className="text-sm text-gray-600">Pontuação</div>
              <Badge className={getScoreBadge(score)}>
                {score >= 800 ? 'Excelente' : 
                 score >= 600 ? 'Bom' : 
                 score >= 400 ? 'Regular' : 'Precisa melhorar'}
              </Badge>
            </div>

            {/* Acertos */}
            <div className="space-y-2">
              <div className="text-4xl font-bold text-green-600">
                {correctAnswers}
              </div>
              <div className="text-sm text-gray-600">Acertos</div>
              <div className="text-lg font-semibold text-green-600">
                {percentage}%
              </div>
            </div>

            {/* Erros */}
            <div className="space-y-2">
              <div className="text-4xl font-bold text-red-600">
                {wrongAnswers}
              </div>
              <div className="text-sm text-gray-600">Erros</div>
              <div className="text-lg font-semibold text-red-600">
                {100 - percentage}%
              </div>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progresso</span>
              <span>{correctAnswers} de {totalQuestions}</span>
            </div>
            <Progress value={percentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Resumo por Área
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {questions.reduce((acc, question, index) => {
                const area = question.area || question.subject || 'Geral'
                if (!acc[area]) {
                  acc[area] = { total: 0, correct: 0 }
                }
                acc[area].total++
                if (answers[index] === question.correctAnswer) {
                  acc[area].correct++
                }
                return acc
              }, {} as Record<string, { total: number, correct: number }>)
              .map(([area, stats]: [string, { total: number, correct: number }]) => (
                <div key={area} className="flex justify-between items-center">
                  <span className="font-medium">{area}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {stats.correct}/{stats.total}
                    </span>
                    <Badge variant="outline">
                      {Math.round((stats.correct / stats.total) * 100)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Análise de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Questões corretas: {correctAnswers}</span>
              </div>
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-500" />
                <span>Questões incorretas: {wrongAnswers}</span>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <span>Taxa de acerto: {percentage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Explicações das Questões Erradas */}
      {wrongAnswers > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              Explicações das Questões Incorretas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showExplanations ? (
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Revise as questões que você errou com explicações detalhadas
                </p>
                <Button 
                  onClick={() => setShowExplanations(true)}
                  disabled={isLoadingExplanations}
                  size="lg"
                >
                  {isLoadingExplanations ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Carregando Explicações...
                    </>
                  ) : (
                    <>
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Ver Explicações ({wrongAnswers})
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {explanations.map((explanation, index) => (
                  <Card key={explanation.questionId} className="border-l-4 border-l-red-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          Questão {questions.findIndex(q => q.id === explanation.questionId) + 1}
                        </CardTitle>
                        <Badge variant="outline">{explanation.area}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Questão */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium mb-3">{explanation.question}</p>
                        <div className="space-y-2">
                          {explanation.options.map((option, i) => (
                            <div 
                              key={i} 
                              className={`p-2 rounded ${
                                i === explanation.correctAnswer 
                                  ? 'bg-green-100 border border-green-300' 
                                  : i === explanation.userAnswer
                                  ? 'bg-red-100 border border-red-300'
                                  : 'bg-gray-100'
                              }`}
                            >
                              <span className="font-semibold mr-2">
                                {String.fromCharCode(65 + i)})
                              </span>
                              {option}
                              {i === explanation.correctAnswer && (
                                <CheckCircle className="h-4 w-4 text-green-600 inline ml-2" />
                              )}
                              {i === explanation.userAnswer && i !== explanation.correctAnswer && (
                                <XCircle className="h-4 w-4 text-red-600 inline ml-2" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Explicação */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">Explicação:</h4>
                        <p className="text-gray-700 leading-relaxed">
                          {explanation.explanation}
                        </p>
                      </div>

                      {/* Conceitos */}
                      {explanation.concepts.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-800">Conceitos Envolvidos:</h4>
                          <div className="flex flex-wrap gap-2">
                            {explanation.concepts.map((concept, i) => (
                              <Badge key={i} variant="secondary">
                                {concept}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dicas */}
                      {explanation.tips.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            Dicas:
                          </h4>
                          <ul className="space-y-1">
                            {explanation.tips.map((tip, i) => (
                              <li key={i} className="text-gray-700 text-sm">
                                • {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onRestart}
              size="lg"
              variant="default"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Fazer Novo Simulado
            </Button>
            <Button 
              onClick={onBackToSetup}
              size="lg"
              variant="outline"
            >
              <Target className="h-4 w-4 mr-2" />
              Configurar Outro Simulado
            </Button>
            <Button 
              size="lg"
              variant="outline"
              disabled
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar Relatório
            </Button>
            <Button 
              size="lg"
              variant="outline"
              disabled
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
