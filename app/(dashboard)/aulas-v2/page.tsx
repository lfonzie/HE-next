'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Sparkles, BookOpen, Target, Lightbulb, RefreshCw, Timer, AlertCircle, CheckCircle, Star, Brain, Zap, Rocket, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useLessonStorage } from '@/hooks/useLessonStorage'

interface GeneratedLesson {
  id: string
  title: string
  subject: string
  grade: number
  objectives: string[]
  introduction: string
  slides: any[]
  summary: string
  nextSteps: string[]
  metadata: any
  filteredTheme?: string
  curiosities?: any[]
  imagePrompts?: any[]
}

interface WorkflowStep {
  step: number
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  progress: number
  message: string
}

const WORKFLOW_STEPS: Omit<WorkflowStep, 'status' | 'progress' | 'message'>[] = [
  { step: 1, name: 'Filtragem de Tema' },
  { step: 2, name: 'Busca de Curiosidades' },
  { step: 3, name: 'Criação da Lição (14 Slides)' },
  { step: 4, name: 'Descrições de Imagens' },
  { step: 5, name: 'Geração de Imagens' },
  { step: 6, name: 'Montagem Final' }
]

export default function AulasV2Page() {
  const [topic, setTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLesson | null>(null)
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(
    WORKFLOW_STEPS.map(s => ({ ...s, status: 'pending', progress: 0, message: 'Aguardando...' }))
  )
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [currentCuriosity, setCurrentCuriosity] = useState('')
  const [curiosities, setCuriosities] = useState<string[]>([])
  const { saveLesson, isSaving } = useLessonStorage()

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isGenerating && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime)
      }, 100)
    } else if (!isGenerating) {
      setElapsedTime(0)
      setStartTime(null)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isGenerating, startTime])

  // Rotate curiosities during loading
  useEffect(() => {
    if (curiosities.length > 0 && isGenerating) {
      let index = 0
      const interval = setInterval(() => {
        setCurrentCuriosity(curiosities[index % curiosities.length])
        index++
      }, 8000)
      return () => clearInterval(interval)
    }
  }, [curiosities, isGenerating])

  const updateStep = useCallback((stepNumber: number, updates: Partial<WorkflowStep>) => {
    setWorkflowSteps(prev => prev.map(step => 
      step.step === stepNumber ? { ...step, ...updates } : step
    ))
  }, [])

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000)
    const ms = Math.floor((milliseconds % 1000) / 100)
    
    if (seconds < 60) {
      return `${seconds}.${ms}s`
    }
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    return `${minutes}m ${remainingSeconds}s`
  }

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      toast.error('Por favor, descreva o tópico da aula')
      return
    }

    setIsGenerating(true)
    setStartTime(Date.now())
    setGeneratedLesson(null)
    setWorkflowSteps(WORKFLOW_STEPS.map(s => ({ ...s, status: 'pending', progress: 0, message: 'Aguardando...' })))

    try {
      // Step 1: Theme Filtering
      updateStep(1, { status: 'in_progress', progress: 50, message: 'Filtrando tema com Grok 4...' })
      
      const filterResponse = await fetch('/api/aulas-v2/filter-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      })

      if (!filterResponse.ok) throw new Error('Erro ao filtrar tema')
      
      const { filteredTheme } = await filterResponse.json()
      updateStep(1, { status: 'completed', progress: 100, message: `Tema filtrado: ${filteredTheme}` })

      // Step 2: Search Curiosities
      updateStep(2, { status: 'in_progress', progress: 50, message: 'Buscando curiosidades...' })
      
      const curiositiesResponse = await fetch('/api/aulas-v2/curiosities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: filteredTheme })
      })

      if (!curiositiesResponse.ok) throw new Error('Erro ao buscar curiosidades')
      
      const { curiosities: fetchedCuriosities } = await curiositiesResponse.json()
      setCuriosities(fetchedCuriosities)
      updateStep(2, { status: 'completed', progress: 100, message: `${fetchedCuriosities.length} curiosidades encontradas` })

      // Steps 3 & 4 in parallel
      updateStep(3, { status: 'in_progress', progress: 30, message: 'Criando estrutura da lição...' })
      updateStep(4, { status: 'in_progress', progress: 30, message: 'Gerando prompts Gemini 2.5...' })

      const [lessonResponse, imagePromptsResponse] = await Promise.all([
        // Step 3: Create Lesson (14 slides)
        fetch('/api/aulas-v2/lesson-json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: filteredTheme })
        }),
        // Step 4: Create Gemini 2.5 Image Prompts
        fetch('/api/aulas-v2/image-descriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: filteredTheme })
        })
      ])

      if (!lessonResponse.ok || !imagePromptsResponse.ok) {
        throw new Error('Erro ao criar lição ou prompts de imagens')
      }

      const { lesson } = await lessonResponse.json()
      const { prompts } = await imagePromptsResponse.json()

      updateStep(3, { status: 'completed', progress: 100, message: '14 slides criados' })
      updateStep(4, { status: 'completed', progress: 100, message: '6 prompts Gemini gerados' })

      // Step 5: Generate Images
      updateStep(5, { status: 'in_progress', progress: 20, message: 'Gerando imagens com Gemini 2.5...' })
      
      const imagesResponse = await fetch('/api/aulas-v2/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          theme: filteredTheme,
          prompts 
        })
      })

      if (!imagesResponse.ok) throw new Error('Erro ao gerar imagens')
      
      const { images } = await imagesResponse.json()
      updateStep(5, { status: 'completed', progress: 100, message: `${images.length} imagens geradas com Gemini 2.5` })

      // Step 6: Assembly
      updateStep(6, { status: 'in_progress', progress: 50, message: 'Montando aula final...' })
      
      // Merge images into lesson
      const slideWithImages = lesson.slides.map((slide: any, index: number) => {
        const imageSlides = [1, 3, 6, 9, 11, 14]
        if (imageSlides.includes(slide.slideNumber)) {
          const imageIndex = imageSlides.indexOf(slide.slideNumber)
          return { ...slide, imageUrl: images[imageIndex] }
        }
        return slide
      })

      const finalLesson: GeneratedLesson = {
        ...lesson,
        slides: slideWithImages,
        filteredTheme,
        curiosities: fetchedCuriosities,
        imagePrompts: prompts,
        id: `lesson-v2-${Date.now()}`
      }

      updateStep(6, { status: 'completed', progress: 100, message: 'Aula montada com sucesso!' })
      
      setGeneratedLesson(finalLesson)
      toast.success('Aula V2 gerada com sucesso!')

    } catch (error) {
      console.error('Erro ao gerar aula:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error(errorMessage)
      
      // Mark current step as error
      const currentStep = workflowSteps.find(s => s.status === 'in_progress')
      if (currentStep) {
        updateStep(currentStep.step, { status: 'error', message: errorMessage })
      }
    } finally {
      setIsGenerating(false)
    }
  }, [topic, updateStep, workflowSteps])

  const handleStartLesson = async () => {
    if (!generatedLesson) return
    
    try {
      const success = await saveLesson(generatedLesson)
      if (success) {
        window.location.href = `/aulas-v2/${generatedLesson.id}`
      } else {
        toast.error('Erro ao salvar lição')
      }
    } catch (error) {
      console.error('Erro ao iniciar lição:', error)
      toast.error('Erro ao iniciar lição')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      {!isGenerating && !generatedLesson && (
        <header className="text-center mb-16">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-red-400/20 rounded-3xl blur-3xl"></div>
            
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20 dark:bg-black/80 dark:border-gray-700">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-600 rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-6">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
              
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Aulas V2 - Sistema Avançado
              </h1>
              <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed dark:text-gray-300">
                Sistema de geração de aulas com workflow em 6 etapas usando IA de última geração
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-100 text-purple-800 border border-purple-200">
                  <Brain className="h-4 w-4" />
                  Grok 4 Fast
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-pink-100 text-pink-800 border border-pink-200">
                  <ImageIcon className="h-4 w-4" />
                  Gemini 2.5
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-red-100 text-red-800 border border-red-200">
                  <Zap className="h-4 w-4" />
                  14 Slides
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-100 text-orange-800 border border-orange-200">
                  <Rocket className="h-4 w-4" />
                  6 Imagens
                </Badge>
              </div>

              {/* Workflow Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {WORKFLOW_STEPS.slice(0, 3).map((step) => (
                  <div key={step.step} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                        {step.step}
                      </div>
                      <h3 className="font-semibold text-gray-800">{step.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 ml-11">
                      {step.step === 1 && 'Filtragem inteligente do tema'}
                      {step.step === 2 && 'Curiosidades educacionais'}
                      {step.step === 3 && 'Estrutura completa em JSON'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Success Header */}
      {generatedLesson && (
        <header className="text-center mb-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-blue-400/20 to-purple-400/20 rounded-3xl blur-3xl"></div>
            
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Star className="h-3 w-3 text-white fill-current" />
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
                    Aula V2 Criada com Sucesso!
                  </h1>
                  <p className="text-lg text-gray-600">Sistema avançado de 6 etapas concluído</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  onClick={() => {
                    setGeneratedLesson(null)
                    setTopic('')
                  }}
                  variant="outline"
                  className="flex items-center gap-2 border-2 hover:bg-gray-50 transition-all duration-200"
                  size="lg"
                >
                  <RefreshCw className="h-5 w-5" />
                  Criar Nova Aula
                </Button>
                <Button 
                  onClick={handleStartLesson}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-5 w-5" />
                      Iniciar Aula V2
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Generator Form */}
      {!isGenerating && !generatedLesson && (
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-800 shadow-xl rounded-3xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-8">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6" />
                </div>
                Gerador de Aulas V2
              </CardTitle>
              <p className="text-purple-100 text-lg mt-2">
                Descreva o tema e nosso sistema criará uma aula completa em 6 etapas
              </p>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <label htmlFor="topic" className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                  <Target className="h-5 w-5 text-purple-600" />
                  Tema da Aula
                  <span className="text-red-500">*</span>
                </label>
                
                <Textarea
                  id="topic"
                  placeholder="Exemplo: Como funciona a fotossíntese nas plantas..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={6}
                  className="resize-none transition-all duration-200 text-lg border-2 rounded-2xl p-4 border-purple-200 focus:border-purple-400"
                />
                
                <div className="text-sm text-gray-500 text-right">
                  {topic.length}/500 caracteres
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-4 h-6 w-6 animate-spin" />
                    Gerando Aula V2...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-4 h-6 w-6" />
                    Gerar Aula com Sistema V2
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Workflow Progress */}
      {isGenerating && (
        <div className="max-w-6xl mx-auto">
          <Card className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl rounded-3xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <div>
                    <h2 className="text-3xl font-bold">Processando Workflow</h2>
                    <p className="text-purple-100">Sistema de 6 etapas em andamento</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xl bg-white/20 px-4 py-2 rounded-full">
                  <Timer className="h-5 w-5" />
                  {formatTime(elapsedTime)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              {/* Workflow Steps */}
              <div className="space-y-4">
                {workflowSteps.map((step) => (
                  <div key={step.step} className="border-2 border-gray-200 rounded-2xl p-6 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          step.status === 'completed' ? 'bg-green-500 text-white' :
                          step.status === 'in_progress' ? 'bg-purple-500 text-white animate-pulse' :
                          step.status === 'error' ? 'bg-red-500 text-white' :
                          'bg-gray-300 text-gray-600'
                        }`}>
                          {step.step}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{step.name}</h3>
                          <p className="text-sm text-gray-600">{step.message}</p>
                        </div>
                      </div>
                      <div>
                        {step.status === 'completed' && <CheckCircle className="h-6 w-6 text-green-500" />}
                        {step.status === 'in_progress' && <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />}
                        {step.status === 'error' && <AlertCircle className="h-6 w-6 text-red-500" />}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    {step.status !== 'pending' && (
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            step.status === 'completed' ? 'bg-green-500' :
                            step.status === 'error' ? 'bg-red-500' :
                            'bg-purple-500'
                          }`}
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Curiosities Display */}
              {currentCuriosity && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Você Sabia?</h3>
                      <p className="text-lg text-gray-700 leading-relaxed">{currentCuriosity}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Back to Original */}
      <div className="max-w-4xl mx-auto mt-8 text-center">
        <Link href="/aulas">
          <Button variant="outline" className="flex items-center gap-2 mx-auto">
            <RefreshCw className="h-4 w-4" />
            Voltar para Aulas Original
          </Button>
        </Link>
      </div>
    </div>
  )
}

