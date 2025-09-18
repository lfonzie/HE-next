'use client'

import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Target, Users, FileText, BookOpen, Star } from 'lucide-react'

interface GeneratedLesson {
  id: string
  title: string
  subject: string
  level: string
  estimatedDuration: number
  difficulty: 'Básico' | 'Intermediário' | 'Avançado'
  objectives: string[]
  stages: Array<{
    etapa: string
    type: string
    activity: any
    route: string
    estimatedTime: number
  }>
  feedback: any
  demoMode?: boolean
  createdAt: string
  metadata?: {
    subject: string
    grade: string
    duration: string
    difficulty: string
    tags: string[]
    status?: string
    backgroundGenerationStarted?: boolean
    initialSlidesLoaded?: number
    totalSlides?: number
    backgroundGenerationTimestamp?: string
    backgroundGenerationCompleted?: boolean
    backgroundGenerationCompletedTimestamp?: string
    totalSlidesGenerated?: number
    allSlidesLoaded?: boolean
  }
  pacingMetrics?: {
    totalTokens: number
    totalWords: number
    synchronousTime: number
    asynchronousTime: number
    tokenPerSlide: number
    wordsPerSlide: number
  }
  pacingWarnings?: string[]
}

interface PacingMetricsProps {
  metrics?: {
    totalTokens: number
    totalWords: number
    synchronousTime: number
    asynchronousTime: number
    tokenPerSlide: number
    wordsPerSlide: number
  }
  warnings?: string[]
  className?: string
}

const PacingMetrics = memo(({ metrics, warnings, className }: PacingMetricsProps) => {
  if (!metrics) return null

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white text-xs">📊</span>
        </div>
        <h3 className="text-lg font-semibold">📊 Métricas de Pacing Profissional</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-green-600" />
          <span className="font-medium">Tempo Síncrono:</span>
          <span className="text-green-600 font-semibold">{metrics.synchronousTime} min</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-xs">⏱</span>
          </div>
          <span className="font-medium">Tempo Assíncrono:</span>
          <span className="text-blue-600 font-semibold">{metrics.asynchronousTime} min</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-purple-600" />
          <span className="font-medium">Total de Tokens:</span>
          <span className="text-purple-600 font-semibold">{metrics.totalTokens.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-orange-600" />
          <span className="font-medium">Palavras por Slide:</span>
          <span className="text-orange-600 font-semibold">{metrics.wordsPerSlide}</span>
        </div>
      </div>
      
      {warnings && warnings.length > 0 && (
        <div className="border-yellow-200 bg-yellow-50 border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-4 bg-yellow-600 rounded flex items-center justify-center">
              <span className="text-white text-xs">⚠</span>
            </div>
            <div className="font-medium text-yellow-800">⚠️ Avisos de Qualidade:</div>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
})

PacingMetrics.displayName = 'PacingMetrics'

interface AulaPreviewProps {
  generatedLesson: GeneratedLesson | null
  pacingMetrics?: any
  pacingWarnings?: string[]
  onStartLesson: () => void
  onSaveLesson: () => void
  className?: string
}

const AulaPreview = memo(({
  generatedLesson,
  pacingMetrics,
  pacingWarnings,
  onStartLesson,
  onSaveLesson,
  className
}: AulaPreviewProps) => {
  if (!generatedLesson) {
    return (
      <Card className={`h-fit sticky top-4 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Sua Aula Gerada
          </CardTitle>
          <p className="text-sm text-gray-600">
            Preview da experiência de aprendizado
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 opacity-50" />
            </div>
            <p className="text-lg font-medium mb-2">Aguardando sua aula</p>
            <p className="text-sm">Descreva um tópico para ver o preview aqui</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`h-fit sticky top-4 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Sua Aula Gerada
        </CardTitle>
        <p className="text-sm text-gray-600">
          Preview da experiência de aprendizado
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">
              {generatedLesson.title || "Título da Aula"}
            </h3>
            <div className="flex flex-wrap justify-center gap-2 mb-3">
              <Badge className="bg-blue-100 text-blue-800">
                {generatedLesson.subject || "Matéria"}
              </Badge>
              <Badge className="bg-purple-100 text-purple-800">
                {generatedLesson.level || "Nível"}
              </Badge>
              <Badge className="bg-orange-100 text-orange-800">
                {generatedLesson.difficulty || "Médio"}
              </Badge>
            </div>
            <div className="flex justify-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {generatedLesson.estimatedDuration || ""} min
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {generatedLesson.stages?.length || 0} etapas
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Objetivos de Aprendizagem:
            </h4>
            <ul className="space-y-2">
              {(generatedLesson.objectives || []).map((objective: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-600" />
              Estrutura da Aula:
            </h4>
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-800">
                  {generatedLesson.stages?.length || 0} etapas interativas
                </span>
              </div>
              <p className="text-sm text-purple-700">
                Aula completa com conteúdo personalizado e atividades adaptadas ao seu nível
              </p>
            </div>
          </div>

          {/* Métricas de Pacing Profissional */}
          <PacingMetrics 
            metrics={pacingMetrics} 
            warnings={pacingWarnings}
            className="bg-blue-50 p-4 rounded-lg border border-blue-200"
          />

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button 
              onClick={onStartLesson} 
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Users className="mr-2 h-4 w-4" />
              Iniciar
            </Button>
            <Button onClick={onSaveLesson} variant="outline">
              💾 Salvar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

AulaPreview.displayName = 'AulaPreview'

export default AulaPreview


