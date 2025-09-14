"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  Target, 
  Clock, 
  Users, 
  Zap, 
  Play,
  Trophy,
  BarChart3,
  Settings,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Brain,
  Award,
  History,
  Bookmark,
  RefreshCw,
  Download,
  Share2,
  Calendar,
  Timer,
  FileText,
  User,
  Globe,
  CheckSquare
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { EnemSetup } from '@/components/enem/EnemSetup'
import { EnemSimulator } from '@/components/enem/EnemSimulator'
import { AuthGuard } from '@/components/AuthGuard'

function SimuladorContent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [simulationConfig, setSimulationConfig] = useState<{
    area: string
    numQuestions: number
    duration: number
    useRealQuestions: boolean
    year?: number
    useProgressiveLoading?: boolean
  } | null>(null)
  const { toast } = useToast()

  const areasConfig = [
    {
      area: 'Linguagens',
      icon: <BookOpen className="h-6 w-6" />,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600',
      description: 'Português, Literatura, Inglês/Espanhol',
      competencies: ['Leitura', 'Interpretação', 'Gramática', 'Redação'],
      typicalQuestions: 45,
      suggestedTime: 90
    },
    {
      area: 'Ciências Humanas',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600',
      description: 'História, Geografia, Filosofia, Sociologia',
      competencies: ['Análise Histórica', 'Geografia', 'Filosofia', 'Sociologia'],
      typicalQuestions: 45,
      suggestedTime: 90
    },
    {
      area: 'Ciências da Natureza',
      icon: <Zap className="h-6 w-6" />,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600',
      description: 'Física, Química, Biologia',
      competencies: ['Física', 'Química', 'Biologia', 'Meio Ambiente'],
      typicalQuestions: 45,
      suggestedTime: 90
    },
    {
      area: 'Matemática',
      icon: <Target className="h-6 w-6" />,
      color: 'bg-orange-500',
      gradient: 'from-orange-500 to-orange-600',
      description: 'Álgebra, Geometria, Estatística',
      competencies: ['Álgebra', 'Geometria', 'Estatística', 'Funções'],
      typicalQuestions: 45,
      suggestedTime: 90
    }
  ]

  const handleStartSimulation = async (params: { 
    area: string; 
    numQuestions: number; 
    duration: number; 
    useRealQuestions: boolean; 
    year?: number; 
    useProgressiveLoading?: boolean 
  }) => {
    setLoading(true)
    setError('')
    
    try {
      // Mapear áreas para o formato esperado pelos componentes
      const areaMapping: Record<string, string> = {
        'Linguagens': 'linguagens',
        'Ciências Humanas': 'ciencias-humanas', 
        'Ciências da Natureza': 'ciencias-natureza',
        'Matemática': 'matematica'
      }
      
      const mappedArea = areaMapping[params.area] || params.area.toLowerCase()
      
      // Generate unique simulator ID
      const simulatorId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Store session data in localStorage for the new architecture
      const sessionData = {
        area: mappedArea,
        numQuestions: params.numQuestions,
        duration: params.duration,
        useRealQuestions: params.useRealQuestions,
        year: params.year,
        useProgressiveLoading: params.useProgressiveLoading || true
      }
      
      localStorage.setItem(`simulator_${simulatorId}`, JSON.stringify(sessionData))
      
      // Redirect to the new simulator page
      window.location.href = `/simulador/${simulatorId}`
      
    } catch (err: any) {
      console.error('Error starting simulation:', err)
      setError(err.message || 'Falha ao gerar simulado. Tente novamente.')
      toast({
        title: "Erro",
        description: err.message || "Falha ao gerar simulado",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBackToSetup = () => {
    setSimulationConfig(null)
    setError('')
  }


  // Se o simulado foi configurado, mostrar o simulador
  if (simulationConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Simulado ENEM - {simulationConfig.area}
                </h1>
                <p className="text-sm text-gray-600">
                  {simulationConfig.numQuestions} questões • {simulationConfig.duration} minutos
                  {simulationConfig.useRealQuestions && ' • Questões Reais'}
                  {simulationConfig.year && ` • ${simulationConfig.year}`}
                </p>
              </div>
              <Button onClick={handleBackToSetup} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Voltar à Configuração
              </Button>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto p-6">
          <EnemSimulator 
            area={simulationConfig.area}
            numQuestions={simulationConfig.numQuestions}
            duration={simulationConfig.duration}
            useRealQuestions={simulationConfig.useRealQuestions}
            year={simulationConfig.year}
            useProgressiveLoading={simulationConfig.useProgressiveLoading}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Simulador ENEM Avançado
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Prepare-se para o ENEM com simulados inteligentes, análise detalhada de desempenho 
              e questões baseadas em exames reais. Sistema adaptativo com IA especializada.
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto p-6">
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold">Questões Reais</h3>
              <p className="text-sm text-gray-600">Questões reais do ENEM</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Brain className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold">IA Avançada</h3>
              <p className="text-sm text-gray-600">Análise adaptativa e personalizada</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold">TRI Real</h3>
              <p className="text-sm text-gray-600">Correção oficial do ENEM</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <History className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold">Histórico</h3>
              <p className="text-sm text-gray-600">Evolução do desempenho</p>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="mb-6">
            <CardContent className="py-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-3 text-blue-600 mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-lg font-semibold">Gerando Simulado...</span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>🧠 Selecionando questões personalizadas</p>
                  <p>⚡ Calibrando nível de dificuldade</p>
                  <p>📊 Preparando sistema de correção TRI</p>
                </div>
                <div className="mt-4">
                  <Progress value={75} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuration Panel */}
        <EnemSetup onStart={handleStartSimulation} />

        {/* Footer Info */}
        <div className="mt-8 text-center space-y-4 text-sm text-gray-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              💡 <strong>Dica Profissional:</strong> Para máxima precisão, use 45 questões 
              e 150 minutos por área, simulando as condições reais do ENEM.
            </div>
            <div>
              🎯 <strong>Sistema Adaptativo:</strong> O simulador aprende com seu desempenho 
              e sugere áreas de foco personalizado.
            </div>
          </div>
          
          <p className="text-blue-600 font-medium">
            🤖 Sistema IA Especializada • Questões de alta qualidade geradas automaticamente
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SimuladorPage() {
  return (
    <AuthGuard>
      <SimuladorContent />
    </AuthGuard>
  )
}