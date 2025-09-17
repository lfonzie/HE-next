"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  Target,
  TrendingUp,
  AlertCircle,
  GraduationCap,
  Brain,
  Zap,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff
} from 'lucide-react'

interface WrongAnswer {
  questionId: string
  questionIndex: number
  question: string
  options: string[]
  correctAnswer: number
  userAnswer: number
  explanation: string
  concepts: string[]
  tips: string[]
  difficulty: string
  area: string
  year?: number
  source?: string
  timeSpent?: number
}

interface EnemWrongAnswersAnalysisProps {
  questions: any[]
  answers: Record<number, string>
  onClose?: () => void
}

export function EnemWrongAnswersAnalysis({ 
  questions, 
  answers, 
  onClose 
}: EnemWrongAnswersAnalysisProps) {
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  const [showOnlyConcepts, setShowOnlyConcepts] = useState(false)
  const [selectedArea, setSelectedArea] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')

  // Identificar questões erradas
  useEffect(() => {
    const wrongQuestions: WrongAnswer[] = []
    
    questions.forEach((question, index) => {
      const userAnswer = answers[index]
      const correctAnswer = question.correctAnswer
      
      if (userAnswer !== correctAnswer) {
        wrongQuestions.push({
          questionId: question.id,
          questionIndex: index + 1,
          question: question.question,
          options: question.options || [],
          correctAnswer: correctAnswer,
          userAnswer: parseInt(userAnswer) || 0,
          explanation: question.explanation || 'Explicação não disponível.',
          concepts: question.topics || question.concepts || [],
          tips: question.tips || [],
          difficulty: question.difficulty || 'Médio',
          area: question.area || question.subject || 'Geral',
          year: question.year,
          source: question.source || 'local_database',
          timeSpent: Math.random() * 120 + 30 // Simulado
        })
      }
    })
    
    setWrongAnswers(wrongQuestions)
  }, [questions, answers])

  const loadDetailedExplanations = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/enem/explanations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: wrongAnswers.map(wa => ({
            id: wa.questionId,
            question: wa.question,
            options: wa.options,
            correctAnswer: wa.correctAnswer,
            userAnswer: wa.userAnswer,
            area: wa.area,
            difficulty: wa.difficulty
          }))
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.explanations) {
          setWrongAnswers(prev => prev.map(wa => {
            const detailed = data.explanations.find((exp: any) => exp.questionId === wa.questionId)
            return detailed ? { ...wa, ...detailed } : wa
          }))
        }
      }
    } catch (error) {
      console.error('Error loading detailed explanations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [wrongAnswers])

  // Carregar explicações detalhadas via IA se necessário
  useEffect(() => {
    if (wrongAnswers.length > 0) {
      loadDetailedExplanations()
    }
  }, [wrongAnswers.length, loadDetailedExplanations])

  const toggleCardExpansion = (index: number) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedCards(newExpanded)
  }

  const getAreaColor = (area: string) => {
    const colors = {
      'linguagens': 'blue',
      'matematica': 'green', 
      'ciencias-humanas': 'purple',
      'ciencias-natureza': 'orange',
      'geral': 'gray'
    }
    return colors[area as keyof typeof colors] || 'gray'
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'Fácil': 'green',
      'Médio': 'yellow',
      'Difícil': 'red',
      'easy': 'green',
      'medium': 'yellow', 
      'hard': 'red'
    }
    return colors[difficulty as keyof typeof colors] || 'yellow'
  }

  const filteredAnswers = wrongAnswers.filter(wa => {
    const areaMatch = selectedArea === 'all' || wa.area === selectedArea
    const difficultyMatch = selectedDifficulty === 'all' || wa.difficulty === selectedDifficulty
    return areaMatch && difficultyMatch
  })

  const areas = Array.from(new Set(wrongAnswers.map(wa => wa.area)))
  const difficulties = Array.from(new Set(wrongAnswers.map(wa => wa.difficulty)))

  if (wrongAnswers.length === 0) {
    return (
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-green-800 mb-2">
            Parabéns! Nenhuma questão errada!
          </h3>
          <p className="text-green-700 mb-6">
            Você acertou todas as questões do simulado. Continue assim!
          </p>
          {onClose && (
            <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
              <Award className="h-4 w-4 mr-2" />
              Voltar aos Resultados
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BookOpen className="h-6 w-6 text-red-600" />
                Análise das Questões Incorretas
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Revise e aprenda com {wrongAnswers.length} questão{wrongAnswers.length !== 1 ? 'ões' : ''} errada{wrongAnswers.length !== 1 ? 's' : ''}
              </p>
            </div>
            {onClose && (
              <Button onClick={onClose} variant="outline" size="sm">
                <XCircle className="h-4 w-4 mr-2" />
                Fechar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{wrongAnswers.length}</div>
              <div className="text-sm text-gray-600">Questões Erradas</div>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{areas.length}</div>
              <div className="text-sm text-gray-600">Áreas Afetadas</div>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{difficulties.length}</div>
              <div className="text-sm text-gray-600">Níveis de Dificuldade</div>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(wrongAnswers.reduce((acc, wa) => acc + (wa.timeSpent || 0), 0) / wrongAnswers.length)}
              </div>
              <div className="text-sm text-gray-600">Tempo Médio (s)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros e Visualização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Área:</label>
              <select 
                value={selectedArea} 
                onChange={(e) => setSelectedArea(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">Todas ({wrongAnswers.length})</option>
                {areas.map(area => (
                  <option key={area} value={area}>
                    {area} ({wrongAnswers.filter(wa => wa.area === area).length})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Dificuldade:</label>
              <select 
                value={selectedDifficulty} 
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">Todas ({wrongAnswers.length})</option>
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>
                    {diff} ({wrongAnswers.filter(wa => wa.difficulty === diff).length})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={showOnlyConcepts ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyConcepts(!showOnlyConcepts)}
              >
                {showOnlyConcepts ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showOnlyConcepts ? 'Mostrar Tudo' : 'Apenas Conceitos'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards das Questões Erradas */}
      <div className="space-y-4">
        {isLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-blue-600 font-medium">Carregando explicações detalhadas...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredAnswers.map((wrongAnswer, index) => {
          const isExpanded = expandedCards.has(index)
          const areaColor = getAreaColor(wrongAnswer.area)
          const difficultyColor = getDifficultyColor(wrongAnswer.difficulty)
          
          return (
            <Card 
              key={wrongAnswer.questionId} 
              className={`border-l-4 border-l-red-500 hover:shadow-lg transition-shadow ${
                isExpanded ? 'shadow-lg' : ''
              }`}
            >
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleCardExpansion(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Questão {wrongAnswer.questionIndex}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`bg-${areaColor}-50 text-${areaColor}-700 border-${areaColor}-200`}
                      >
                        {wrongAnswer.area}
                      </Badge>
                      <Badge 
                        variant="outline"
                        className={`bg-${difficultyColor}-50 text-${difficultyColor}-700 border-${difficultyColor}-200`}
                      >
                        {wrongAnswer.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-500">
                      {wrongAnswer.timeSpent && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.round(wrongAnswer.timeSpent)}s
                        </span>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-6">
                  {/* Enunciado da Questão */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Enunciado:</h4>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {wrongAnswer.question}
                    </p>
                    
                    {/* Alternativas */}
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-800 mb-2">Alternativas:</h5>
                      {wrongAnswer.options.map((option, i) => (
                        <div 
                          key={i} 
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            i === wrongAnswer.correctAnswer 
                              ? 'bg-green-50 border-green-300 text-green-800' 
                              : i === wrongAnswer.userAnswer
                              ? 'bg-red-50 border-red-300 text-red-800'
                              : 'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-lg">
                              {String.fromCharCode(65 + i)})
                            </span>
                            <span className="flex-1">{option}</span>
                            <div className="flex items-center gap-2">
                              {i === wrongAnswer.correctAnswer && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-sm font-medium">Correta</span>
                                </div>
                              )}
                              {i === wrongAnswer.userAnswer && i !== wrongAnswer.correctAnswer && (
                                <div className="flex items-center gap-1 text-red-600">
                                  <XCircle className="h-4 w-4" />
                                  <span className="text-sm font-medium">Sua resposta</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explicação Detalhada */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      Explicação Detalhada:
                    </h4>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-gray-700 leading-relaxed">
                        {wrongAnswer.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Conceitos Envolvidos */}
                  {wrongAnswer.concepts.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        Conceitos Envolvidos:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {wrongAnswer.concepts.map((concept, i) => (
                          <Badge 
                            key={i} 
                            variant="secondary" 
                            className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                          >
                            {concept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dicas de Estudo */}
                  {wrongAnswer.tips.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-600" />
                        Dicas para Melhorar:
                      </h4>
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <ul className="space-y-2">
                          {wrongAnswer.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-700">
                              <span className="text-yellow-600 font-bold mt-1">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Sugestões de Estudo */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Próximos Passos:
                    </h4>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>• Revise os conceitos relacionados a esta questão</p>
                        <p>• Pratique exercícios similares na área de {wrongAnswer.area}</p>
                        <p>• Consulte materiais de estudo sobre os tópicos mencionados</p>
                        <p>• Faça um novo simulado para testar seu aprendizado</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Resumo de Melhorias */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            Plano de Estudos Personalizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Áreas que Precisam de Atenção:</h4>
              <div className="space-y-2">
                {areas.map(area => {
                  const count = wrongAnswers.filter(wa => wa.area === area).length
                  const percentage = Math.round((count / wrongAnswers.length) * 100)
                  return (
                    <div key={area} className="flex items-center justify-between p-2 bg-white/50 rounded">
                      <span className="capitalize">{area}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={percentage} className="w-20 h-2" />
                        <span className="text-sm font-medium">{count} ({percentage}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Níveis de Dificuldade:</h4>
              <div className="space-y-2">
                {difficulties.map(diff => {
                  const count = wrongAnswers.filter(wa => wa.difficulty === diff).length
                  const percentage = Math.round((count / wrongAnswers.length) * 100)
                  return (
                    <div key={diff} className="flex items-center justify-between p-2 bg-white/50 rounded">
                      <span className="capitalize">{diff}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={percentage} className="w-20 h-2" />
                        <span className="text-sm font-medium">{count} ({percentage}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white/50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Recomendações:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Foque nas áreas com maior número de erros</li>
              <li>• Pratique questões de dificuldade média antes de avançar</li>
              <li>• Revise os conceitos fundamentais das disciplinas</li>
              <li>• Faça simulados regulares para acompanhar o progresso</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
