"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { BookOpen, Clock, Target, Play, Database, Sparkles, Zap } from 'lucide-react'

interface EnemSetupProps {
  onStart: (config: { area: string; numQuestions: number; duration: number; useRealQuestions: boolean; year?: number; useProgressiveLoading?: boolean }) => void
}

const areas = [
  { id: 'linguagens', name: 'Linguagens e Códigos', color: 'blue' },
  { id: 'matematica', name: 'Matemática', color: 'green' },
  { id: 'ciencias-humanas', name: 'Ciências Humanas', color: 'purple' },
  { id: 'ciencias-natureza', name: 'Ciências da Natureza', color: 'orange' },
  { id: 'geral', name: 'Simulado Geral', color: 'gray' }
]

const questionCounts = [10, 20, 30, 45, 90]
const durations = [30, 60, 90, 180, 270]
const years = Array.from({ length: 15 }, (_, i) => 2023 - i) // 2009-2023

export function EnemSetup({ onStart }: EnemSetupProps) {
  const [selectedArea, setSelectedArea] = useState('geral')
  const [selectedQuestions, setSelectedQuestions] = useState(20)
  const [selectedDuration, setSelectedDuration] = useState(60)
  const [useRealQuestions, setUseRealQuestions] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined)
  const [useProgressiveLoading, setUseProgressiveLoading] = useState(true)

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
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Configurar Simulado ENEM
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Área de Conhecimento */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Área de Conhecimento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {areas.map((area) => (
                <Card 
                  key={area.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedArea === area.id ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedArea(area.id)}
                >
                  <CardContent className="p-4 text-center">
                    <Badge variant={selectedArea === area.id ? "default" : "secondary"} className="mb-2">
                      {area.name}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Número de Questões */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Número de Questões</h3>
            <div className="grid grid-cols-5 gap-3">
              {questionCounts.map((count) => (
                <Button
                  key={count}
                  variant={selectedQuestions === count ? "default" : "outline"}
                  onClick={() => setSelectedQuestions(count)}
                  className="h-12"
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>

          {/* Duração */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Duração (minutos)</h3>
            <div className="grid grid-cols-5 gap-3">
              {durations.map((duration) => (
                <Button
                  key={duration}
                  variant={selectedDuration === duration ? "default" : "outline"}
                  onClick={() => setSelectedDuration(duration)}
                  className="h-12"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {duration}
                </Button>
              ))}
            </div>
          </div>

          {/* Tipo de Questões */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tipo de Questões</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Questões Reais do ENEM</p>
                    <p className="text-sm text-muted-foreground">
                      Questões oficiais de provas anteriores (2009-2023)
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Fallback para IA se API indisponível
                    </p>
                  </div>
                </div>
                <Switch
                  checked={useRealQuestions}
                  onCheckedChange={setUseRealQuestions}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Questões Geradas por IA</p>
                    <p className="text-sm text-muted-foreground">
                      Questões criadas automaticamente baseadas no padrão ENEM
                    </p>
                  </div>
                </div>
                <Switch
                  checked={!useRealQuestions}
                  onCheckedChange={(checked) => setUseRealQuestions(!checked)}
                />
              </div>
            </div>
          </div>

          {/* Ano Específico (apenas para questões reais) */}
          {useRealQuestions && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Ano da Prova (opcional)</h3>
              <div className="space-y-3">
                <Button
                  variant={selectedYear === undefined ? "default" : "outline"}
                  onClick={() => setSelectedYear(undefined)}
                  className="mr-2"
                >
                  Todos os anos
                </Button>
                <div className="grid grid-cols-5 gap-2">
                  {years.slice(0, 10).map((year) => (
                    <Button
                      key={year}
                      variant={selectedYear === year ? "default" : "outline"}
                      onClick={() => setSelectedYear(year)}
                      size="sm"
                    >
                      {year}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {years.slice(10).map((year) => (
                    <Button
                      key={year}
                      variant={selectedYear === year ? "default" : "outline"}
                      onClick={() => setSelectedYear(year)}
                      size="sm"
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Carregamento Progressivo */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Modo de Carregamento</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Carregamento Progressivo</p>
                    <p className="text-sm text-muted-foreground">
                      Questões carregam 1 por segundo - você pode começar a responder imediatamente
                    </p>
                  </div>
                </div>
                <Switch
                  checked={useProgressiveLoading}
                  onCheckedChange={setUseProgressiveLoading}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Carregamento Tradicional</p>
                    <p className="text-sm text-muted-foreground">
                      Aguarda todas as questões carregarem antes de começar
                    </p>
                  </div>
                </div>
                <Switch
                  checked={!useProgressiveLoading}
                  onCheckedChange={(checked) => setUseProgressiveLoading(!checked)}
                />
              </div>
            </div>
          </div>

          {/* Resumo */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Resumo do Simulado:</h4>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>{areas.find(a => a.id === selectedArea)?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{selectedQuestions} questões</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{selectedDuration} minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  {useRealQuestions ? (
                    <Database className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-purple-500" />
                  )}
                  <span>
                    {useRealQuestions ? 'Questões Reais' : 'Questões IA'}
                    {useRealQuestions && selectedYear && ` (${selectedYear})`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {useProgressiveLoading ? (
                    <Zap className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-500" />
                  )}
                  <span>
                    {useProgressiveLoading ? 'Progressivo' : 'Tradicional'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleStart} size="lg" className="w-full">
            <Play className="h-4 w-4 mr-2" />
            Iniciar Simulado
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
