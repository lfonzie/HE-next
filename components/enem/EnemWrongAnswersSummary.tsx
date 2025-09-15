"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Brain,
  Award
} from 'lucide-react'

interface WrongAnswerSummary {
  area: string
  count: number
  percentage: number
  difficulty: string
  concepts: string[]
}

interface EnemWrongAnswersSummaryProps {
  questions: any[]
  answers: Record<number, string>
  onViewDetailedAnalysis: () => void
}

export function EnemWrongAnswersSummary({ 
  questions, 
  answers, 
  onViewDetailedAnalysis 
}: EnemWrongAnswersSummaryProps) {
  
  // Calcular estatísticas das questões erradas
  const wrongAnswers = questions.filter((question, index) => {
    const userAnswer = answers[index]
    const correctAnswer = question.correctAnswer
    return userAnswer !== correctAnswer
  })

  if (wrongAnswers.length === 0) {
    return (
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-2">
            Parabéns! Nenhuma questão errada!
          </h3>
          <p className="text-green-700">
            Você acertou todas as questões do simulado. Continue assim!
          </p>
        </CardContent>
      </Card>
    )
  }

  // Agrupar por área
  const areaStats = wrongAnswers.reduce((acc, question) => {
    const area = question.area || question.subject || 'Geral'
    if (!acc[area]) {
      acc[area] = { count: 0, concepts: new Set(), difficulties: new Set() }
    }
    acc[area].count++
    if (question.topics) {
      question.topics.forEach((topic: string) => acc[area].concepts.add(topic))
    }
    if (question.difficulty) {
      acc[area].difficulties.add(question.difficulty)
    }
    return acc
  }, {} as Record<string, { count: number, concepts: Set<string>, difficulties: Set<string> }>)

  // Converter para array e calcular percentuais
  const areaSummary = Object.entries(areaStats).map(([area, stats]: [string, any]) => ({
    area,
    count: stats.count,
    percentage: Math.round((stats.count / wrongAnswers.length) * 100),
    concepts: Array.from(stats.concepts),
    difficulties: Array.from(stats.difficulties)
  })).sort((a, b) => b.count - a.count)

  // Calcular conceitos mais frequentes
  const allConcepts = wrongAnswers.flatMap(q => q.topics || q.concepts || [])
  const conceptFrequency = allConcepts.reduce((acc, concept) => {
    acc[concept] = (acc[concept] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topConcepts = Object.entries(conceptFrequency)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([concept, count]) => ({ concept, count: count as number }))

  // Calcular dificuldades
  const difficultyStats = wrongAnswers.reduce((acc, question) => {
    const difficulty = question.difficulty || 'Médio'
    acc[difficulty] = (acc[difficulty] || 0) + 1
    return acc
  }, {} as Record<string, number>)

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="h-6 w-6 text-red-600" />
            Resumo das Questões Incorretas
          </CardTitle>
          <p className="text-gray-600">
            {wrongAnswers.length} questão{wrongAnswers.length !== 1 ? 'ões' : ''} para revisar
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{wrongAnswers.length}</div>
              <div className="text-sm text-gray-600">Questões Erradas</div>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{areaSummary.length}</div>
              <div className="text-sm text-gray-600">Áreas Afetadas</div>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{topConcepts.length}</div>
              <div className="text-sm text-gray-600">Conceitos Principais</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análise por Área */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Análise por Área de Conhecimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {areaSummary.map(({ area, count, percentage, concepts, difficulties }) => {
              const areaColor = getAreaColor(area)
              return (
                <div key={area} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={`bg-${areaColor}-50 text-${areaColor}-700 border-${areaColor}-200`}
                      >
                        {area}
                      </Badge>
                      <span className="font-semibold">{count} questão{count !== 1 ? 'ões' : ''}</span>
                    </div>
                    <div className="text-sm text-gray-600">{percentage}% do total</div>
                  </div>
                  
                  <div className="mb-3">
                    <Progress value={percentage} className="h-2" />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {concepts.slice(0, 3).map((concept, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {concept as string}
                      </Badge>
                    ))}
                    {concepts.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{concepts.length - 3} mais
                      </Badge>
                    )}
                  </div>
                  
                  {difficulties.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {difficulties.map((diff, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className={`text-xs bg-${getDifficultyColor(diff as string)}-50 text-${getDifficultyColor(diff as string)}-700 border-${getDifficultyColor(diff as string)}-200`}
                        >
                          {diff as string}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Conceitos Mais Frequentes */}
      {topConcepts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Conceitos que Precisam de Atenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topConcepts.map(({ concept, count }, index) => (
                <div key={concept} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-700">
                      {index + 1}
                    </div>
                    <span className="font-medium">{concept}</span>
                  </div>
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                    {count} questão{count !== 1 ? 'ões' : ''}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análise de Dificuldade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Distribuição por Dificuldade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(difficultyStats).map(([difficulty, count]) => {
              const percentage = Math.round(((count as number) / wrongAnswers.length) * 100)
              const difficultyColor = getDifficultyColor(difficulty)
              return (
                <div key={difficulty} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline"
                      className={`bg-${difficultyColor}-50 text-${difficultyColor}-700 border-${difficultyColor}-200`}
                    >
                      {difficulty}
                    </Badge>
                    <span className="font-medium">{count as number} questão{(count as number) !== 1 ? 'ões' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={percentage} className="w-20 h-2" />
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            Recomendações de Estudo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Prioridades:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Foque na área com mais erros: <strong>{areaSummary[0]?.area}</strong></li>
                  <li>• Revise os conceitos mais frequentes</li>
                  <li>• Pratique questões de dificuldade média</li>
                  <li>• Faça simulados regulares</li>
                </ul>
              </div>
              
              <div className="p-4 bg-white/50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Próximos Passos:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Estude os conceitos identificados</li>
                  <li>• Pratique exercícios específicos</li>
                  <li>• Revise material teórico</li>
                  <li>• Faça novo simulado em 1 semana</li>
                </ul>
              </div>
            </div>
            
            <div className="text-center pt-4">
              <Button 
                onClick={onViewDetailedAnalysis}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Ver Análise Detalhada
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
