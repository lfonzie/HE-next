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
        <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
            Sua Aula Gerada
          </CardTitle>
          <p className="text-gray-200">
            Preview da experiência de aprendizado
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-12 text-gray-500">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 opacity-50" />
            </div>
            <p className="text-xl font-semibold mb-3">Aguardando sua aula</p>
            <p className="text-gray-600">Descreva um tópico para ver o preview aqui</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`h-fit sticky top-4 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <CheckCircle className="h-5 w-5" />
          </div>
          Sua Aula Gerada
        </CardTitle>
        <p className="text-yellow-100">
          Preview da experiência de aprendizado
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8">
          <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl border border-emerald-200">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-3">
              {generatedLesson.title || "Título da Aula"}
            </h3>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <Badge className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1">
                {generatedLesson.subject || "Matéria"}
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 border border-purple-200 px-3 py-1">
                {generatedLesson.level || "Nível"}
              </Badge>
              <Badge className="bg-orange-100 text-orange-800 border border-orange-200 px-3 py-1">
                {generatedLesson.difficulty || "Médio"}
              </Badge>
            </div>
            <div className="flex justify-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {generatedLesson.estimatedDuration || ""} min
              </span>
              <span className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                {generatedLesson.stages?.length || 0} etapas
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Target className="h-3 w-3 text-white" />
              </div>
              Objetivos de Aprendizagem:
            </h4>
            <div className="space-y-3">
              {(generatedLesson.objectives || []).map((objective: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">{objective}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-3 w-3 text-white" />
              </div>
              Estrutura da Aula:
            </h4>
            <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-yellow-800 text-lg">
                  {generatedLesson.stages?.length || 0} etapas interativas
                </span>
              </div>
              <p className="text-yellow-700 font-medium">
                Aula completa com conteúdo personalizado e atividades adaptadas ao seu nível
              </p>
            </div>
          </div>

          {/* Métricas de Pacing Profissional */}
          <PacingMetrics 
            metrics={pacingMetrics} 
            warnings={pacingWarnings}
            className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200"
          />

          <div className="grid grid-cols-1 gap-4 pt-4">
            <Button 
              onClick={onStartLesson} 
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
            >
              <Users className="mr-3 h-5 w-5" />
              Iniciar Aula
            </Button>
            <Button 
              onClick={onSaveLesson} 
              variant="outline" 
              className="w-full h-12 border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500 transition-all duration-200 rounded-xl"
            >
              💾 Salvar Aula
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

AulaPreview.displayName = 'AulaPreview'

export default AulaPreview


