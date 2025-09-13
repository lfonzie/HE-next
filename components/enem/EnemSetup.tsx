"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Clock, Target, Play } from 'lucide-react'

interface EnemSetupProps {
  onStart: (config: { area: string; numQuestions: number; duration: number }) => void
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

export function EnemSetup({ onStart }: EnemSetupProps) {
  const [selectedArea, setSelectedArea] = useState('geral')
  const [selectedQuestions, setSelectedQuestions] = useState(20)
  const [selectedDuration, setSelectedDuration] = useState(60)

  const handleStart = () => {
    onStart({
      area: selectedArea,
      numQuestions: selectedQuestions,
      duration: selectedDuration
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
