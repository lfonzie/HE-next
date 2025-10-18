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
  Printer,
  BookOpen,
  Star,
  Award,
  Calendar,
  Clock,
  Users,
  Brain,
  PenTool,
  Zap
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
    icon: PenTool,
    color: 'text-emerald-600',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800'
  },
  {
    id: 'comp2',
    name: 'Compreensão do Tema',
    description: 'Entendimento da proposta e desenvolvimento com conhecimentos de várias áreas',
    icon: Brain,
    color: 'text-blue-600',
    bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  {
    id: 'comp3',
    name: 'Organização de Argumentos',
    description: 'Estrutura dissertativa-argumentativa com coerência e coesão',
    icon: BarChart3,
    color: 'text-purple-600',
    bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  {
    id: 'comp4',
    name: 'Mecanismos Linguísticos',
    description: 'Uso adequado de conectivos e recursos de coesão textual',
    icon: Zap,
    color: 'text-amber-600',
    bgColor: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800'
  },
  {
    id: 'comp5',
    name: 'Proposta de Intervenção',
    description: 'Solução clara, viável e respeitando os direitos humanos',
    icon: Lightbulb,
    color: 'text-rose-600',
    bgColor: 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20',
    borderColor: 'border-rose-200 dark:border-rose-800'
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
        
        // Definir título da página
        if (typeof document !== 'undefined') {
          document.title = `Resultado da Redação | HubEdu.ia`
        }
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

  const handlePrint = () => {
    window.print()
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
    <div>
      {/* CSS para impressão otimizada em A4 */}
      <style jsx global>{`
        /* Ocultar seções de impressão na web */
        .print-section {
          display: none;
        }
        
        .print-header {
          display: none;
        }
        
        @media print {
          /* Mostrar seções de impressão apenas na impressão */
          .print-section {
            display: block;
          }
          
          .print-header {
            display: block;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            font-size: 10pt;
            line-height: 1.3;
            color: #000 !important;
            background: white !important;
          }
          
          .print-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 15mm;
            background: white !important;
            box-shadow: none !important;
          }
          
          .print-header {
            text-align: center;
            margin-bottom: 15pt;
            border-bottom: 2pt solid #000;
            padding-bottom: 8pt;
          }
          
          .print-title {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 5pt;
            color: #000 !important;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
          }
          
          .print-subtitle {
            font-size: 11pt;
            color: #333 !important;
            font-style: italic;
          }
          
          .print-score {
            font-size: 20pt;
            font-weight: bold;
            color: #000 !important;
            text-align: center;
            margin: 10pt 0;
            padding: 8pt;
            border: 1pt solid #000;
            border-radius: 5pt;
            background: #f8f9fa !important;
          }
          
          .print-section {
            margin-bottom: 12pt;
            page-break-inside: avoid;
          }
          
          .print-section-title {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 8pt;
            color: #000 !important;
            border-bottom: 1pt solid #000;
            padding-bottom: 3pt;
            text-transform: uppercase;
            letter-spacing: 0.3pt;
          }
          
          .print-content {
            font-size: 10pt;
            line-height: 1.3;
            color: #000 !important;
            margin-bottom: 6pt;
          }
          
          .print-competencies {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 8pt;
            margin-bottom: 12pt;
          }
          
          .print-competency {
            border: 1pt solid #000;
            padding: 6pt;
            page-break-inside: avoid;
            border-radius: 4pt;
            background: #f8f9fa !important;
          }
          
          .print-competency-title {
            font-weight: bold;
            font-size: 9pt;
            margin-bottom: 3pt;
            color: #000 !important;
            text-transform: uppercase;
            letter-spacing: 0.3pt;
          }
          
          .print-competency-score {
            font-weight: bold;
            font-size: 10pt;
            color: #000 !important;
            text-align: right;
            margin-top: 3pt;
          }
          
          .print-feedback {
            font-size: 9pt;
            line-height: 1.3;
            color: #000 !important;
            white-space: pre-wrap;
            margin-bottom: 8pt;
            padding: 8pt;
            border: 1pt solid #ccc;
            border-radius: 4pt;
            background: #f8f9fa !important;
          }
          
          .print-suggestions {
            font-size: 9pt;
            color: #000 !important;
            padding: 8pt;
            border: 1pt solid #ccc;
            border-radius: 4pt;
            background: #f8f9fa !important;
          }
          
          .print-suggestions li {
            margin-bottom: 4pt;
            list-style-type: disc;
            margin-left: 12pt;
            line-height: 1.3;
          }
          
          .print-essay {
            font-size: 10pt;
            line-height: 1.5;
            color: #000 !important;
            white-space: pre-wrap;
            border: 1pt solid #000;
            padding: 12pt;
            margin-top: 8pt;
            border-radius: 4pt;
            background: #f8f9fa !important;
            text-align: justify;
            font-family: 'Times New Roman', serif;
          }
          
          .print-info {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 8pt;
            margin-bottom: 12pt;
            font-size: 9pt;
            color: #000 !important;
            padding: 8pt;
            border: 1pt solid #ccc;
            border-radius: 4pt;
            background: #f8f9fa !important;
          }
          
          .print-info-item {
            display: flex;
            justify-content: space-between;
            border-bottom: 1pt dotted #666;
            padding-bottom: 3pt;
            margin-bottom: 3pt;
          }
          
          .print-info-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          
          /* Ocultar elementos não necessários na impressão */
          .no-print {
            display: none !important;
          }
          
          /* Quebras de página */
          .page-break {
            page-break-before: always;
          }
          
          /* Evitar quebras de página em elementos importantes */
          .no-break {
            page-break-inside: avoid;
          }
          
          /* Melhorar espaçamento geral */
          h1, h2, h3, h4, h5, h6 {
            margin-top: 0;
            margin-bottom: 6pt;
          }
          
          p {
            margin-bottom: 4pt;
          }
          
          /* Rodapé da página */
          @page {
            margin: 15mm;
            @bottom-center {
              content: "Página " counter(page) " de " counter(pages);
              font-size: 8pt;
              color: #666;
            }
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8 max-w-7xl print-container">
        {/* Header para impressão */}
        <div className="print-header">
          <h1 className="print-title">
            Resultado da Redação - ENEM
          </h1>
          <div className="print-score">
            Nota Final: {result.totalScore} pontos ({getTotalScoreLabel(result.totalScore)})
          </div>
        </div>
        
        {/* Header moderno para web */}
        <div className="no-print">
          {/* Navegação */}
        <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/redacao')}
              className="mr-4 hover:bg-white/50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>

          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-slate-800 dark:to-gray-900 p-8 mb-8 shadow-2xl border border-white/20">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="flex-1 mb-6 lg:mb-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
            <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Resultado da Redação
              </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                        Avaliação detalhada das 5 competências do ENEM
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Score Display */}
                <div className="flex flex-col items-center lg:items-end">
                  <div className="relative">
                    <div className={`text-6xl font-bold ${getTotalScoreColor(result.totalScore)} mb-2`}>
                      {result.totalScore}
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="text-center lg:text-right">
                    <Badge 
                      variant="default"
                      className="text-lg px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0"
                    >
                      {getTotalScoreLabel(result.totalScore)}
                    </Badge>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      de 1000 pontos
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
          
        {/* Informações para impressão */}
        <div className="print-section">
          <h2 className="print-section-title">Detalhes da Redação</h2>
          <div className="print-info">
            <div className="print-info-item">
              <span>Tema ({result.themeYear}):</span>
              <span>{result.theme}</span>
            </div>
            <div className="print-info-item">
              <span>Palavras:</span>
              <span>{result.wordCount}</span>
            </div>
            <div className="print-info-item">
              <span>Data:</span>
              <span>{new Date(result.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="print-info-item">
              <span>Horário:</span>
              <span>{new Date(result.createdAt).toLocaleTimeString('pt-BR')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
          {/* Detalhes da Redação */}
          <Card className="lg:col-span-1 border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-3">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                Detalhes da Redação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Tema ({result.themeYear})</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {result.theme}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Palavras</span>
                  </div>
                  <Badge variant="outline" className="bg-white dark:bg-gray-800">
                  {result.wordCount}
                </Badge>
              </div>
              
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Data</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {new Date(result.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Horário</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {new Date(result.createdAt).toLocaleTimeString('pt-BR')}
                </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notas por Competência */}
          <Card className="lg:col-span-2 border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center text-xl">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl mr-3">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                Notas por Competência
              </CardTitle>
              <CardDescription className="text-base">
                Análise detalhada por competência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {COMPETENCIAS.map((competencia) => {
                  const score = result.scores[competencia.id as keyof CompetenciaScore]
                  const Icon = competencia.icon
                  const percentage = (score / 200) * 100
                  
                  return (
                    <div key={competencia.id} className={`p-6 rounded-2xl border-2 ${competencia.bgColor} ${competencia.borderColor} hover:shadow-lg transition-all duration-300`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl ${competencia.bgColor}`}>
                            <Icon className={`h-6 w-6 ${competencia.color}`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                            {competencia.name}
                          </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {competencia.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${competencia.color} mb-1`}>
                            {score}
                          </div>
                          <Badge 
                            variant={percentage >= 80 ? 'default' : percentage >= 60 ? 'secondary' : 'destructive'}
                            className="text-sm px-3 py-1"
                          >
                            {percentage.toFixed(0)}%
                        </Badge>
                        </div>
                      </div>
                      
                      <div className="relative">
                      <Progress 
                          value={percentage} 
                          className="h-3 bg-gray-200 dark:bg-gray-700"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {score}/200 pontos
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Competências para impressão - Layout compacto */}
        <div className="print-section">
          <h2 className="print-section-title">Avaliação por Competência</h2>
          <div className="print-competencies">
            {COMPETENCIAS.map((competencia) => {
              const score = result.scores[competencia.id as keyof CompetenciaScore]
              
              return (
                <div key={competencia.id} className="print-competency">
                  <div className="print-competency-title">
                    {competencia.name} - {score}/200
                  </div>
                  <div className="print-content">
                    {competencia.description}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Feedback e Sugestões combinados para impressão */}
        <div className="print-section">
          <h2 className="print-section-title">Análise e Recomendações</h2>
          <div className="print-feedback">
            <strong>Análise Detalhada:</strong><br/>
            {result.feedback}
          </div>
          <div className="print-suggestions">
            <strong>Recomendações:</strong>
            <ul>
              {result.suggestions.map((suggestion, index) => (
                <li key={index}>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Feedback e Sugestões */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 no-print">
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center text-xl">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mr-3">
                  <Star className="h-5 w-5 text-white" />
                </div>
                Análise Detalhada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800">
              <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-base">
                  {result.feedback}
                </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center text-xl">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl mr-3">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg mr-3 flex-shrink-0">
                      <Lightbulb className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {suggestion}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo da Redação para impressão - Versão completa */}
        <div className="print-section">
          <h2 className="print-section-title">Texto da Redação</h2>
          <div className="print-essay">
            ${result.content}
          </div>
        </div>

        {/* Conteúdo da Redação */}
        <Card className="mt-8 border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm no-print">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center justify-between text-xl">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mr-3">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                Texto da Redação
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullContent(!showFullContent)}
                className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              >
                {showFullContent ? 'Ocultar' : 'Mostrar'} Texto
              </Button>
            </CardTitle>
          </CardHeader>
          {showFullContent && (
            <CardContent>
              <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-700/50 dark:to-slate-700/50 rounded-2xl border border-gray-200 dark:border-gray-600">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                    {result.content}
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12 no-print">
          <Button
            onClick={() => router.push('/redacao')}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3"
          >
            <FileText className="h-5 w-5 mr-2" />
            Nova Redação
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            size="lg"
            className="border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3"
          >
            <Printer className="h-5 w-5 mr-2" />
            Imprimir Resultado
          </Button>
        </div>
        </div>
      </div>
    </div>
  )
}
