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
  TrendingUp,
  BarChart3,
  Clock,
  Award,
  Zap,
  History
} from 'lucide-react'
import { EnemPerformanceAnalysis } from './EnemPerformanceAnalysis'
import { EnemHistory } from './EnemHistory'
import { useEnemHistory } from '@/hooks/useEnemHistory'
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
  const [showPerformanceAnalysis, setShowPerformanceAnalysis] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const { toast } = useToast()
  const { saveSimulation } = useEnemHistory()

  // Calcular estatísticas
  const correctAnswers = questions.reduce((acc, question, index) => {
    return acc + (answers[index] === question.correctAnswer ? 1 : 0)
  }, 0)
  
  const wrongAnswers = totalQuestions - correctAnswers
  const percentage = Math.round((correctAnswers / totalQuestions) * 100)

  // Simular tempo gasto (em produção, seria real)
  useEffect(() => {
    const estimatedTime = totalQuestions * 90 // 90 segundos por questão em média
    setTimeSpent(estimatedTime)
  }, [totalQuestions])

  // Salvar simulado no histórico
  useEffect(() => {
    if (questions.length > 0 && score !== undefined) {
      const simulationData = {
        area: questions[0]?.area || 'geral',
        numQuestions: totalQuestions,
        duration: Math.round(timeSpent / 60),
        score: score,
        correctAnswers,
        totalQuestions,
        percentage: Math.round((correctAnswers / totalQuestions) * 100),
        timeSpent,
        useRealQuestions: questions[0]?.year ? true : false,
        year: questions[0]?.year,
        questions: questions.map(q => q.id),
        answers
      }
      
      saveSimulation(simulationData)
    }
  }, [questions, score, totalQuestions, correctAnswers, timeSpent, answers, saveSimulation])

  const loadExplanations = useCallback(async () => {
    setIsLoadingExplanations(true)
    try {
      // Preparar dados das questões com respostas do usuário
      const questionsWithAnswers = questions.map((question, index) => ({
        ...question,
        userAnswer: answers[index]
      }));

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
  }, [answers, questions, toast]);

  // Carregar explicações quando o componente monta
  useEffect(() => {
    if (wrongAnswers > 0) {
      loadExplanations()
    }
  }, [wrongAnswers, loadExplanations])

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

  // Se mostrar análise de performance, renderizar o componente
  if (showPerformanceAnalysis) {
    return (
      <EnemPerformanceAnalysis
        questions={questions}
        answers={answers}
        timeSpent={timeSpent}
        onClose={() => setShowPerformanceAnalysis(false)}
      />
    )
  }

  // Se mostrar histórico, renderizar o componente
  if (showHistory) {
    return (
      <EnemHistory
        onClose={() => setShowHistory(false)}
      />
    )
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
          
          {/* Botões de Ação Rápida */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Button
              onClick={() => setShowPerformanceAnalysis(true)}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              Análise Detalhada
            </Button>
            <Button
              onClick={() => setShowHistory(true)}
              size="lg"
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <History className="h-5 w-5 mr-2" />
              Histórico
            </Button>
            <Button
              onClick={() => setShowExplanations(true)}
              variant="outline"
              size="lg"
              disabled={wrongAnswers === 0}
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Explicações ({wrongAnswers})
            </Button>
          </div>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Resumo por Área
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(questions.reduce((acc, question, index) => {
                const area = question.area || question.subject || 'Geral'
                if (!acc[area]) {
                  acc[area] = { total: 0, correct: 0 }
                }
                acc[area].total++
                if (answers[index] === question.correctAnswer) {
                  acc[area].correct++
                }
                return acc
              }, {} as Record<string, { total: number, correct: number }>)).map(([area, stats]) => (
                <div key={area} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{area}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {(stats as any).correct}/{(stats as any).total}
                    </span>
                    <Badge variant="outline">
                      {Math.round(((stats as any).correct / (stats as any).total) * 100)}%
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
              Performance Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-semibold">{correctAnswers} acertos</div>
                  <div className="text-sm text-gray-600">{percentage}% de aproveitamento</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <div className="font-semibold">{wrongAnswers} erros</div>
                  <div className="text-sm text-gray-600">{100 - percentage}% para melhorar</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-semibold">{Math.round(timeSpent / 60)} minutos</div>
                  <div className="text-sm text-gray-600">Tempo total gasto</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Insights Rápidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">{score}</div>
                <div className="text-sm text-gray-600">Pontuação TRI</div>
                <Badge className={getScoreBadge(score)}>
                  {score >= 800 ? 'Excelente' : 
                   score >= 600 ? 'Bom' : 
                   score >= 400 ? 'Regular' : 'Precisa melhorar'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={() => setShowPerformanceAnalysis(true)}
                  size="sm"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Análise Completa
                </Button>
                <Button
                  onClick={() => setShowExplanations(true)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={wrongAnswers === 0}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Explicações ({wrongAnswers})
                </Button>
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
