"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  BookOpen, 
  Clock, 
  Target, 
  Play, 
  Database, 
  Sparkles, 
  Zap, 
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  TrendingUp,
  Award,
  Brain,
  Globe,
  Settings,
  Star
} from 'lucide-react'

interface EnemSetupProps {
  onStart: (config: { area: string; numQuestions: number; duration: number; useRealQuestions: boolean; year?: number; useProgressiveLoading?: boolean }) => void
}

const areas = [
  { 
    id: 'linguagens', 
    name: 'Linguagens e Códigos', 
    color: 'blue',
    icon: BookOpen,
    description: 'Português, Literatura, Inglês/Espanhol',
    competencies: ['Leitura', 'Interpretação', 'Gramática', 'Redação'],
    typicalQuestions: 45,
    suggestedTime: 90,
    difficulty: 'Médio'
  },
  { 
    id: 'matematica', 
    name: 'Matemática', 
    color: 'green',
    icon: Target,
    description: 'Álgebra, Geometria, Estatística',
    competencies: ['Álgebra', 'Geometria', 'Estatística', 'Funções'],
    typicalQuestions: 45,
    suggestedTime: 90,
    difficulty: 'Alto'
  },
  { 
    id: 'ciencias-humanas', 
    name: 'Ciências Humanas', 
    color: 'purple',
    icon: Globe,
    description: 'História, Geografia, Filosofia, Sociologia',
    competencies: ['Análise Histórica', 'Geografia', 'Filosofia', 'Sociologia'],
    typicalQuestions: 45,
    suggestedTime: 90,
    difficulty: 'Médio'
  },
  { 
    id: 'ciencias-natureza', 
    name: 'Ciências da Natureza', 
    color: 'orange',
    icon: Brain,
    description: 'Física, Química, Biologia',
    competencies: ['Física', 'Química', 'Biologia', 'Meio Ambiente'],
    typicalQuestions: 45,
    suggestedTime: 90,
    difficulty: 'Alto'
  },
  { 
    id: 'geral', 
    name: 'Simulado Geral', 
    color: 'gray',
    icon: Award,
    description: 'Todas as áreas do conhecimento',
    competencies: ['Todas as competências'],
    typicalQuestions: 180,
    suggestedTime: 360,
    difficulty: 'Variado'
  }
]

const questionCounts = [
  { count: 10, label: '10 questões', description: 'Simulado rápido', recommended: false },
  { count: 20, label: '20 questões', description: 'Simulado médio', recommended: true },
  { count: 30, label: '30 questões', description: 'Simulado completo', recommended: true },
  { count: 45, label: '45 questões', description: 'Simulado oficial', recommended: true },
  { count: 90, label: '90 questões', description: 'Simulado duplo', recommended: false }
]

const durations = [
  { duration: 30, label: '30 min', description: 'Rápido', recommended: false },
  { duration: 60, label: '60 min', description: 'Médio', recommended: true },
  { duration: 90, label: '90 min', description: 'Completo', recommended: true },
  { duration: 180, label: '180 min', description: 'Oficial', recommended: true },
  { duration: 270, label: '270 min', description: 'Estendido', recommended: false }
]

const years = Array.from({ length: 15 }, (_, i) => 2023 - i) // 2009-2023

export function EnemSetup({ onStart }: EnemSetupProps) {
  const [selectedArea, setSelectedArea] = useState('geral')
  const [selectedQuestions, setSelectedQuestions] = useState(20)
  const [selectedDuration, setSelectedDuration] = useState(60)
  const [useRealQuestions, setUseRealQuestions] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined)
  const [useProgressiveLoading, setUseProgressiveLoading] = useState(true)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [autoSuggestions, setAutoSuggestions] = useState(true)

  // Função para aplicar sugestões automáticas baseadas na área
  const applyAutoSuggestions = (areaId: string) => {
    if (!autoSuggestions) return
    
    const area = areas.find(a => a.id === areaId)
    if (area) {
      setSelectedQuestions(area.typicalQuestions)
      setSelectedDuration(area.suggestedTime)
    }
  }

  // Aplicar sugestões quando área muda
  const handleAreaChange = (areaId: string) => {
    setSelectedArea(areaId)
    applyAutoSuggestions(areaId)
  }

  const handleStart = () => {
    onStart({
      area: selectedArea,
      numQuestions: selectedQuestions,
      duration: selectedDuration,
      useRealQuestions,
      year: selectedYear,
      useProgressiveLoading
    })
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header com informações */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
            <Settings className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Configurar Simulado ENEM
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Configure seu simulado personalizado com questões reais do ENEM ou geradas por IA especializada
        </p>
      </div>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="h-6 w-6 text-blue-600" />
              Configurações do Simulado
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {showAdvancedSettings ? 'Ocultar' : 'Avançado'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Área de Conhecimento */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Área de Conhecimento
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Switch
                  checked={autoSuggestions}
                  onCheckedChange={setAutoSuggestions}
                />
                <span>Sugestões automáticas</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areas.map((area) => {
                const IconComponent = area.icon
                const isSelected = selectedArea === area.id
                return (
                  <Card 
                    key={area.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                      isSelected 
                        ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleAreaChange(area.id)}
                  >
                    <CardContent className="p-6">
                      <div className="text-center space-y-3">
                        <div className={`mx-auto p-3 rounded-full ${
                          isSelected ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <IconComponent className={`h-6 w-6 ${
                            isSelected ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg mb-1">{area.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{area.description}</p>
                          <div className="flex justify-center gap-2 mb-2">
                            <Badge variant={isSelected ? "default" : "secondary"} className="text-xs">
                              {area.typicalQuestions} questões
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {area.suggestedTime} min
                            </Badge>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              area.difficulty === 'Alto' ? 'border-red-200 text-red-600' :
                              area.difficulty === 'Médio' ? 'border-yellow-200 text-yellow-600' :
                              'border-green-200 text-green-600'
                            }`}
                          >
                            {area.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Número de Questões */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Número de Questões
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {questionCounts.map((option) => {
                const isSelected = selectedQuestions === option.count
                const isRecommended = option.recommended
                return (
                  <Card
                    key={option.count}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected 
                        ? 'ring-2 ring-green-500 bg-gradient-to-br from-green-50 to-emerald-50' 
                        : 'hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedQuestions(option.count)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`text-2xl font-bold ${
                            isSelected ? 'text-green-600' : 'text-gray-700'
                          }`}>
                            {option.count}
                          </span>
                          {isRecommended && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-700">{option.label}</p>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Duração */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Duração do Simulado
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {durations.map((option) => {
                const isSelected = selectedDuration === option.duration
                const isRecommended = option.recommended
                return (
                  <Card
                    key={option.duration}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected 
                        ? 'ring-2 ring-orange-500 bg-gradient-to-br from-orange-50 to-amber-50' 
                        : 'hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedDuration(option.duration)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <Clock className={`h-5 w-5 ${
                            isSelected ? 'text-orange-600' : 'text-gray-600'
                          }`} />
                          <span className={`text-xl font-bold ${
                            isSelected ? 'text-orange-600' : 'text-gray-700'
                          }`}>
                            {option.duration}
                          </span>
                          {isRecommended && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-700">{option.label}</p>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Tipo de Questões */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Fonte das Questões
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  useRealQuestions 
                    ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setUseRealQuestions(true)}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-full ${
                        useRealQuestions ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Database className={`h-6 w-6 ${
                          useRealQuestions ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">Questões Reais do ENEM</h4>
                        <p className="text-sm text-gray-600">Questões oficiais de provas anteriores</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Questões oficiais (2009-2023)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Padrão oficial do ENEM</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Correção TRI real</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Fallback para IA se API indisponível</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  !useRealQuestions 
                    ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setUseRealQuestions(false)}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-full ${
                        !useRealQuestions ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        <Sparkles className={`h-6 w-6 ${
                          !useRealQuestions ? 'text-purple-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">Questões Geradas por IA</h4>
                        <p className="text-sm text-gray-600">IA especializada em ENEM</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Questões personalizadas</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Adaptadas ao seu nível</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Sempre disponível</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 p-2 rounded">
                      <Info className="h-3 w-3" />
                      <span>IA treinada especificamente para ENEM</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Ano Específico (apenas para questões reais) */}
          {useRealQuestions && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Ano da Prova (opcional)
              </h3>
              <div className="space-y-4">
                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedYear === undefined 
                      ? 'ring-2 ring-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50' 
                      : 'hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedYear(undefined)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        selectedYear === undefined ? 'bg-indigo-100' : 'bg-gray-100'
                      }`}>
                        <Globe className={`h-5 w-5 ${
                          selectedYear === undefined ? 'text-indigo-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">Todos os anos</h4>
                        <p className="text-sm text-gray-600">Questões de todas as provas (2009-2023)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {years.map((year) => {
                    const isSelected = selectedYear === year
                    const isRecent = year >= 2020
                    return (
                      <Card
                        key={year}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          isSelected 
                            ? 'ring-2 ring-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50' 
                            : 'hover:shadow-sm'
                        }`}
                        onClick={() => setSelectedYear(year)}
                      >
                        <CardContent className="p-3 text-center">
                          <div className="space-y-1">
                            <span className={`text-lg font-bold ${
                              isSelected ? 'text-indigo-600' : 'text-gray-700'
                            }`}>
                              {year}
                            </span>
                            {isRecent && (
                              <div className="flex justify-center">
                                <Badge variant="outline" className="text-xs">
                                  Recente
                                </Badge>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Configurações Avançadas */}
          {showAdvancedSettings && (
            <div>
              <Separator className="my-6" />
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                Configurações Avançadas
              </h3>
              
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Zap className="h-5 w-5 text-yellow-500" />
                          <div>
                            <p className="font-medium">Carregamento Progressivo</p>
                            <p className="text-sm text-gray-600">
                              Questões carregam 1 por segundo - você pode começar a responder imediatamente
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={useProgressiveLoading}
                          onCheckedChange={setUseProgressiveLoading}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium">Análise de Performance</p>
                            <p className="text-sm text-gray-600">
                              Análise detalhada do desempenho com sugestões personalizadas
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={true}
                          disabled
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}


          {/* Resumo */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Award className="h-6 w-6 text-blue-600" />
                Resumo do Simulado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Área</p>
                      <p className="text-sm text-gray-600">{areas.find(a => a.id === selectedArea)?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <BookOpen className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Questões</p>
                      <p className="text-sm text-gray-600">{selectedQuestions} questões</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Duração</p>
                      <p className="text-sm text-gray-600">{selectedDuration} minutos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      useRealQuestions ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      {useRealQuestions ? (
                        <Database className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Sparkles className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Fonte</p>
                      <p className="text-sm text-gray-600">
                        {useRealQuestions ? 'Questões Reais' : 'Questões IA'}
                        {useRealQuestions && selectedYear && ` (${selectedYear})`}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      useProgressiveLoading ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      {useProgressiveLoading ? (
                        <Zap className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Carregamento</p>
                      <p className="text-sm text-gray-600">
                        {useProgressiveLoading ? 'Progressivo' : 'Tradicional'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Status</p>
                      <p className="text-sm text-gray-600">Pronto para iniciar</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white/50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Info className="h-4 w-4" />
                  <span className="font-medium">Dica:</span>
                  <span>
                    Para máxima precisão, use 45 questões e 90 minutos por área, simulando as condições reais do ENEM.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <Button 
              onClick={handleStart} 
              size="lg" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Play className="h-5 w-5 mr-2" />
              Iniciar Simulado ENEM
            </Button>
            
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Questões validadas</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Correção TRI</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Análise detalhada</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
