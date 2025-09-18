'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  BarChart3,
  Clock,
  BookOpen
} from 'lucide-react'
import { useNotifications } from '@/components/providers/NotificationProvider'

interface CompetenciaScore {
  comp1: number
  comp2: number
  comp3: number
  comp4: number
  comp5: number
}

interface RedacaoResult {
  id: string
  theme: string
  themeYear: number
  content: string
  wordCount: number
  scores: CompetenciaScore
  totalScore: number
  feedback: string
  suggestions: string[]
  highlights: {
    grammar: string[]
    structure: string[]
    content: string[]
  }
  createdAt: string
}

const COMPETENCIAS = [
  {
    id: 'comp1',
    name: 'Domínio da Norma Padrão',
    description: 'Gramática, ortografia, pontuação e uso adequado da língua portuguesa',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    id: 'comp2',
    name: 'Compreensão do Tema',
    description: 'Entendimento da proposta e desenvolvimento com conhecimentos de várias áreas',
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    id: 'comp3',
    name: 'Organização de Argumentos',
    description: 'Estrutura dissertativa-argumentativa com coerência e coesão',
    icon: BarChart3,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    id: 'comp4',
    name: 'Mecanismos Linguísticos',
    description: 'Uso adequado de conectivos e recursos de coesão textual',
    icon: BookOpen,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  },
  {
    id: 'comp5',
    name: 'Proposta de Intervenção',
    description: 'Solução clara, viável e respeitando os direitos humanos',
    icon: Lightbulb,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20'
  }
]

export default function RedacaoResultadoPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { addNotification } = useNotifications()
  
  const [result, setResult] = useState<RedacaoResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showFullContent, setShowFullContent] = useState(false)

  useEffect(() => {
    const loadResult = async () => {
      try {
        const response = await fetch(`/api/redacao/resultado/${params.sessionId}`)
        if (!response.ok) {
          throw new Error('Resultado não encontrado')
        }
        
        const data = await response.json()
        setResult(data.result)
      } catch (error) {
        console.error('Erro ao carregar resultado:', error)
        addNotification({ type: 'error', title: 'Erro', message: 'Falha ao carregar resultado da redação' })
        router.push('/redacao')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.sessionId) {
      loadResult()
    }
  }, [params.sessionId, addNotification, router])

  const getScoreColor = (score: number) => {
    if (score >= 160) return 'text-green-600'
    if (score >= 120) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 160) return 'success'
    if (score >= 120) return 'warning'
    return 'destructive'
  }

  const getTotalScoreColor = (totalScore: number) => {
    if (totalScore >= 800) return 'text-green-600'
    if (totalScore >= 600) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTotalScoreLabel = (totalScore: number) => {
    if (totalScore >= 800) return 'Excelente'
    if (totalScore >= 600) return 'Bom'
    if (totalScore >= 400) return 'Regular'
    return 'Precisa Melhorar'
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando resultado...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Resultado não encontrado</h2>
          <p className="text-gray-600 mb-4">O resultado da redação não foi encontrado.</p>
          <Button onClick={() => router.push('/redacao')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Redação
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => router.push('/redacao')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Resultado da Redação
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Avaliação baseada nas 5 competências do ENEM
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-3xl font-bold ${getTotalScoreColor(result.totalScore)}`}>
              {result.totalScore}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {getTotalScoreLabel(result.totalScore)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações da Redação */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Informações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  Tema ({result.themeYear})
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {result.theme}
                </p>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Palavras:
                </span>
                <Badge variant="outline">
                  {result.wordCount}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Data:
                </span>
                <span className="text-sm font-medium">
                  {new Date(result.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Horário:
                </span>
                <span className="text-sm font-medium">
                  {new Date(result.createdAt).toLocaleTimeString('pt-BR')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Notas por Competência */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Notas por Competência
              </CardTitle>
              <CardDescription>
                Avaliação detalhada baseada nos critérios oficiais do ENEM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {COMPETENCIAS.map((competencia) => {
                  const score = result.scores[competencia.id as keyof CompetenciaScore]
                  const Icon = competencia.icon
                  
                  return (
                    <div key={competencia.id} className={`p-4 rounded-lg ${competencia.bgColor}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Icon className={`h-5 w-5 mr-2 ${competencia.color}`} />
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {competencia.name}
                          </h4>
                        </div>
                        <Badge variant={getScoreBadge(score)}>
                          {score}/200
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {competencia.description}
                      </p>
                      
                      <Progress 
                        value={(score / 200) * 100} 
                        className="h-2"
                      />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback e Sugestões */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Detalhado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {result.feedback}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sugestões de Melhoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {suggestion}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo da Redação */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Sua Redação</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullContent(!showFullContent)}
              >
                {showFullContent ? 'Ocultar' : 'Mostrar'} Texto
              </Button>
            </CardTitle>
          </CardHeader>
          {showFullContent && (
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {result.content}
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Ações */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => router.push('/redacao')}
            size="lg"
            className="mr-4"
          >
            <FileText className="h-4 w-4 mr-2" />
            Nova Redação
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/redacao/historico')}
            size="lg"
          >
            <Clock className="h-4 w-4 mr-2" />
            Ver Histórico
          </Button>
        </div>
      </div>
    </div>
  )
}
