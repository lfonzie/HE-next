'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Sparkles, BookOpen, Target, Users, Send, Lightbulb, TrendingUp, AlertCircle, CheckCircle, Clock, RefreshCw, Timer, BarChart3, FileText, AlertTriangle, Mic, Volume2, Accessibility, Star, Bug } from 'lucide-react'
import { useDynamicSuggestions } from '@/hooks/useDynamicSuggestions'
import { SessionGuard } from '@/components/auth/SessionGuard'
import { LessonDebugger } from '@/components/debug/LessonDebugger'

// Mock components for demo (replace with actual imports)
const toast = {
  success: (msg: string) => console.log('Success:', msg),
  error: (msg: string) => console.log('Error:', msg)
}

interface LessonProgressProps {
  progress: number
  status: string
  isGenerating: boolean
  elapsedTime: number
  className?: string
}

const LessonProgress = ({ progress, status, isGenerating, elapsedTime, className }: LessonProgressProps) => {
  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000)
    const ms = Math.floor((milliseconds % 1000) / 100)
    
    if (seconds < 60) {
      return `${seconds}.${ms}s`
    }
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (remainingSeconds === 0) {
      return `${minutes}m`
    }
    
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className={`min-h-[400px] flex items-center justify-center ${className}`}>
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center animate-pulse">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Preparando sua aula...
          </h2>
          <p className="text-gray-600">
            {status}
          </p>
        </div>
        
        <div className="w-64 mx-auto space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{progress}%</span>
            <div className="flex items-center gap-1">
              <Timer className="h-4 w-4" />
              <span>{formatTime(elapsedTime)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      </div>
    </div>
  )
}

// Componente para exibir métricas de pacing profissional
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

const PacingMetrics = ({ metrics, warnings, className }: PacingMetricsProps) => {
  if (!metrics) return null

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">📊 Métricas de Pacing Profissional</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-green-600" />
          <span className="font-medium">Tempo Síncrono:</span>
          <span className="text-green-600 font-semibold">{metrics.synchronousTime} min</span>
        </div>
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-blue-600" />
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
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="font-medium mb-2">⚠️ Avisos de Qualidade:</div>
            <ul className="list-disc list-inside space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="text-sm">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Enhanced interfaces
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

interface FormData {
  topic: string
  targetLevel?: string
  focusArea?: string
  schoolId?: string
}

interface FormErrors {
  topic?: string
}

interface Suggestion {
  text: string
  category: string
  level: string
}

// Removido: SUGGESTIONS estáticas - agora usando sugestões dinâmicas do Gemini

const STATUS_MESSAGES = [
  { progress: 0, message: 'Analisando o tópico e contexto educacional...' },
  { progress: 15, message: 'Identificando matéria, série e nível de dificuldade...' },
  { progress: 35, message: 'Criando objetivos de aprendizagem personalizados...' },
  { progress: 55, message: 'Estruturando conteúdo pedagógico...' },
  { progress: 75, message: 'Gerando atividades interativas e avaliações...' },
  { progress: 90, message: 'Aplicando técnicas de gamificação...' },
  { progress: 95, message: 'Finalizando aula e preparando interface...' }
]

/**
 * Enhanced AulasPage component with improved UX, performance, and accessibility
 */
export default function AulasPage() {
  // Router para navegação
  const router = useRouter()
  
  // State management
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLesson | null>(null)
  const [pacingMetrics, setPacingMetrics] = useState<any>(null)
  const [pacingWarnings, setPacingWarnings] = useState<string[]>([])
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState('')
  const [formData, setFormData] = useState<FormData>({ topic: '' })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showDebugger, setShowDebugger] = useState(false)

  // Usar sugestões dinâmicas do Gemini
  const { suggestions, loading: suggestionsLoading, error: suggestionsError, refreshSuggestions } = useDynamicSuggestions()

  // Cronômetro
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

  // Função para formatar tempo
  const formatTime = useCallback((milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000)
    const ms = Math.floor((milliseconds % 1000) / 100)
    
    if (seconds < 60) {
      return `${seconds}.${ms}s`
    }
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (remainingSeconds === 0) {
      return `${minutes}m`
    }
    
    return `${minutes}m ${remainingSeconds}s`
  }, [])

  // Form validation
  const validateForm = useCallback(() => {
    const errors: FormErrors = {}
    const trimmedTopic = formData.topic.trim()
    
    console.log('Validando formulário:', { topic: formData.topic, trimmedTopic, length: trimmedTopic.length })
    
    if (!trimmedTopic) {
      errors.topic = 'Por favor, descreva o tópico da aula'
    } else if (trimmedTopic.length < 5) {
      errors.topic = 'Descreva o tópico com mais detalhes (mínimo 5 caracteres)'
    } else if (trimmedTopic.length > 500) {
      errors.topic = 'Descrição muito longa (máximo 500 caracteres)'
    }

    console.log('Erros de validação:', errors)
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData.topic])


  // Progressive lesson generation with skeleton UI and initial slides
  const handleGenerate = useCallback(async (topicOverride: string | null = null) => {
    const topic = topicOverride || formData.topic
    
    // Se não há topicOverride, validar o formulário normalmente
    if (!topicOverride) {
      if (!validateForm()) {
        toast.error('Por favor, corrija os erros no formulário')
        return
      }
    } else {
      // Se há topicOverride, apenas verificar se não está vazio
      if (!topic.trim()) {
        toast.error('Tópico inválido')
        return
      }
    }

    setIsGenerating(true)
    setGenerationProgress(0)
    setGenerationStatus('Iniciando geração da aula...')
    setGeneratedLesson(null)
    setStartTime(Date.now())

    try {
      // Step 1: Generate skeleton (immediate)
      setGenerationProgress(10)
      setGenerationStatus('Gerando estrutura da aula...')
      
      const skeletonResponse = await fetch('/api/aulas/skeleton', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, schoolId: formData.schoolId })
      })

      if (!skeletonResponse.ok) {
        throw new Error('Erro ao gerar estrutura da aula')
      }

      const skeletonData = await skeletonResponse.json()
      const skeleton = skeletonData.skeleton

      // Step 2: Generate initial slides (5-10 seconds)
      setGenerationProgress(30)
      setGenerationStatus('Gerando primeiros slides...')
      
      const initialSlidesResponse = await fetch('/api/aulas/initial-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, schoolId: formData.schoolId })
      })

      if (!initialSlidesResponse.ok) {
        throw new Error('Erro ao gerar slides iniciais')
      }

      const initialSlidesData = await initialSlidesResponse.json()
      const initialSlides = initialSlidesData.slides

      // Step 3: Update skeleton with initial slides
      setGenerationProgress(60)
      setGenerationStatus('Preparando aula inicial...')
      
      const updatedStages = skeleton.stages.map((stage: any, index: number) => {
        if (index < 2 && initialSlides[index]) {
          return {
            ...stage,
            activity: {
              ...stage.activity,
              content: initialSlides[index].content,
              imageUrl: initialSlides[index].imageUrl,
              imagePrompt: initialSlides[index].imageQuery
            },
            loading: false
          }
        }
        return stage
      })

      const lessonData = {
        ...skeleton,
        id: skeleton.id, // Ensure the ID is preserved
        stages: updatedStages,
        slides: initialSlides,
        metadata: {
          ...skeleton.metadata,
          status: 'initial_ready',
          initialSlidesLoaded: 2,
          totalSlides: 14,
          backgroundGenerationStarted: true,
          backgroundGenerationTimestamp: new Date().toISOString()
        }
      }

      // Log lesson data for debugging
      console.log('📋 Lesson data created with ID:', lessonData.id)
      console.log('🔍 Full lesson data:', lessonData)

      setGenerationProgress(80)
      setGenerationStatus('Carregando todos os slides...')
      
      // Step 4: Set the initial lesson data first
      setGeneratedLesson(lessonData)
      console.log('🎯 Initial lesson set with ID:', lessonData.id)
      
      // Step 5: Load ALL remaining slides before showing the lesson
      await loadRemainingSlides(topic, lessonData)
      
      // Verify lesson was set with proper ID
      console.log('✅ Lesson generation completed, final lesson ID:', lessonData.id)
      
      setGenerationProgress(100)
      setGenerationStatus('Aula completa pronta!')
      
      toast.success('Aula completa carregada!')

    } catch (error) {
      console.error('Error generating lesson:', error)
      toast.error(`Erro ao gerar aula: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      setGenerationProgress(0)
      setGenerationStatus('Erro na geração')
    } finally {
      setIsGenerating(false)
    }
  }, [formData.topic, formData.schoolId, validateForm])

  // Background loading of remaining slides - AGUARDA TODOS OS SLIDES CARREGAREM
  const loadRemainingSlides = useCallback(async (topic: string, lessonData: any) => {
    try {
      setGenerationStatus('Carregando todos os slides...')
      
      // Load slides 3-14 in batches
      const slidePromises = []
      for (let i = 3; i <= 14; i++) {
        const requestBody = { 
          topic, 
          slideNumber: i, 
          schoolId: formData.schoolId 
        };
        
        // Validate request body before sending
        if (!topic || !i) {
          console.error(`❌ Invalid request body for slide ${i}:`, requestBody);
          continue;
        }
        
        slidePromises.push(
          fetch('/api/aulas/next-slide', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          }).then(res => {
            if (!res.ok) {
              console.error(`❌ Failed to load slide ${i}:`, res.status, res.statusText);
              return { error: `Failed to load slide ${i}` };
            }
            return res.json();
          }).catch(error => {
            console.error(`❌ Error loading slide ${i}:`, error);
            return { error: `Error loading slide ${i}: ${error.message}` };
          })
        )
      }

      // Process slides as they become available
      const results = await Promise.allSettled(slidePromises)
      
      const updatedStages = [...lessonData.stages]
      const loadedSlides = [...lessonData.slides]
      
      results.forEach((result, index) => {
        const slideNumber = index + 3
        console.log(`🔍 Processing slide ${slideNumber}:`, {
          status: result.status,
          hasValue: result.status === 'fulfilled' && !!result.value,
          hasSuccess: result.status === 'fulfilled' && result.value?.success,
          hasSlide: result.status === 'fulfilled' && !!result.value?.slide
        })
        
        if (result.status === 'fulfilled' && result.value.success) {
          const slide = result.value.slide
          console.log(`✅ Adding slide ${slideNumber}:`, {
            number: slide.number,
            title: slide.title,
            hasContent: !!slide.content,
            contentLength: slide.content?.length
          })
          
          loadedSlides.push(slide)
          
          // Update the corresponding stage
          if (updatedStages[slideNumber - 1]) {
            console.log(`🔄 Updating stage ${slideNumber - 1} for slide ${slideNumber}`)
            updatedStages[slideNumber - 1] = {
              ...updatedStages[slideNumber - 1],
              activity: {
                ...updatedStages[slideNumber - 1].activity,
                content: slide.content,
                imageUrl: slide.imageUrl,
                imagePrompt: slide.imageQuery,
                questions: slide.questions
              },
              loading: false
            }
          } else {
            console.error(`❌ No stage found for slide ${slideNumber} (index ${slideNumber - 1})`)
          }
        } else {
          console.error(`❌ Failed to process slide ${slideNumber}:`, result)
        }
      })

      // Update the lesson with all loaded slides
      console.log('🔄 Updating lesson with loaded slides:', {
        totalSlides: loadedSlides.length,
        totalStages: updatedStages.length,
        slidesLoaded: loadedSlides.map(s => s.number),
        stagesUpdated: updatedStages.map((s, i) => ({ index: i, loading: s.loading }))
      })
      
      setGeneratedLesson(prev => {
        const updatedLesson = {
          ...prev,
          id: prev?.id, // Ensure ID is preserved
          stages: updatedStages,
          slides: loadedSlides,
          metadata: {
            ...prev?.metadata,
            status: 'complete',
            allSlidesLoaded: true
          }
        }
        
        console.log('✅ Final lesson state:', {
          id: updatedLesson.id,
          stagesCount: updatedLesson.stages?.length,
          slidesCount: updatedLesson.slides?.length,
          stages: updatedLesson.stages?.map((s, i) => ({ index: i, loading: s.loading, hasContent: !!s.activity?.content }))
        })
        
        return updatedLesson
      })

      setGenerationStatus('Todos os slides carregados!')
      toast.success('Aula completa carregada!')
      
    } catch (error) {
      console.error('Error loading remaining slides:', error)
      setGenerationStatus('Erro ao carregar slides restantes')
    }
  }, [formData.schoolId])

  // Enhanced suggestion handler with analytics
  const handleSuggestionClick = useCallback(async (suggestion: Suggestion) => {
    setFormData({ topic: suggestion.text })
    setFormErrors({})
    
    // Simulate analytics tracking
    console.log('Suggestion clicked:', { text: suggestion.text, category: suggestion.category })
    
    // Auto-generate after suggestion click
    await handleGenerate(suggestion.text)
  }, [handleGenerate])

  // Enhanced form submission handler
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isGenerating) {
      e.preventDefault()
      handleGenerate()
    }
  }, [isGenerating, handleGenerate])

  const handleStartLesson = () => {
    console.log('🔍 handleStartLesson called')
    console.log('🔍 generatedLesson state:', generatedLesson)
    console.log('🔍 generatedLesson type:', typeof generatedLesson)
    console.log('🔍 generatedLesson keys:', generatedLesson ? Object.keys(generatedLesson) : 'null')
    
    if (!generatedLesson) {
      console.error('Nenhuma aula gerada para iniciar')
      toast.error('Nenhuma aula foi gerada ainda')
      return
    }
    
    console.log('🚀 Iniciando aula com ID:', generatedLesson.id)
    console.log('📊 Dados da aula:', generatedLesson)
    
    // Verificar se o ID existe e é válido
    const lessonId = (generatedLesson as any)?.id
    console.log('🔍 Extracted lessonId:', lessonId)
    console.log('🔍 lessonId type:', typeof lessonId)
    
    if (!lessonId || lessonId === '') {
      console.error('❌ ID da aula inválido:', lessonId)
      console.error('❌ Full generatedLesson object:', JSON.stringify(generatedLesson, null, 2))
      toast.error('ID da aula inválido. Tente gerar uma nova aula.')
      return
    }
    
    // Salvar aula no localStorage para modo demo
    try {
      localStorage.setItem(`demo_lesson_${lessonId}`, JSON.stringify(generatedLesson))
      console.log('💾 Aula salva no localStorage:', lessonId)
    } catch (storageError) {
      console.warn('⚠️ Erro ao salvar no localStorage:', storageError)
    }
    
    // Aula gerada e salva no banco de dados
    console.log('✅ Aula gerada e salva no banco de dados:', lessonId)
    
    try {
      const targetUrl = `/aulas/${lessonId}`
      console.log('🎯 Navegando para:', targetUrl)
      
      // Navegar para a página da aula usando router do Next.js
      // Isso preserva a sessão de autenticação
      router.push(targetUrl)
      
      // Log adicional para debug
      setTimeout(() => {
        console.log('📍 Verificando navegação após 1s...')
      }, 1000)
      
    } catch (error) {
      console.error('❌ Erro ao navegar para a aula:', error)
      toast.error('Erro ao iniciar a aula. Tente novamente.')
    }
  }

  const handleSaveLesson = async () => {
    if (!generatedLesson) return

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Aula salva com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar aula. Tente novamente.')
    }
  }

  return (
    <SessionGuard>
      <div className="container mx-auto px-4 py-8 max-w-6xl" role="main">
      {/* Header quando aula foi gerada */}
      {generatedLesson && (
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Aula Gerada com Sucesso!
              </h1>
              <p className="text-lg text-gray-600">{(generatedLesson as any)?.title || "Título da Aula"}</p>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => {
                setGeneratedLesson(null)
                setFormData({ topic: '' })
                setFormErrors({})
                setPacingMetrics(null)
                setPacingWarnings([])
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Gerar Nova Aula
            </Button>
            <Button 
              onClick={handleStartLesson}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Iniciar Aula
            </Button>
            <Button 
              onClick={() => setShowDebugger(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Bug className="h-4 w-4" />
              Debug
            </Button>
          </div>
        </header>
      )}

      {/* Enhanced Header - Oculto durante carregamento E quando aula foi gerada */}
      {!isGenerating && !generatedLesson && (
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
            <BookOpen className="h-10 w-10 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Aulas Interativas com IA
          </h1>
          <p className="text-xl text-gray-600 mb-2 max-w-2xl mx-auto">
            Transforme qualquer tópico em uma experiência de aprendizado envolvente e personalizada
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              IA Avançada
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Personalizado
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Interativo
            </Badge>
          </div>
        </header>
      )}




      {/* Enhanced Suggestions - Oculto durante carregamento E quando aula foi gerada */}
      {!generatedLesson && (
        <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 mb-8">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-3">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Lightbulb className="h-7 w-7 text-yellow-500" />
              Sugestões Inteligentes
            </CardTitle>
            <Button
              onClick={refreshSuggestions}
              variant="outline"
              size="sm"
              className="ml-2"
              disabled={suggestionsLoading}
            >
              <RefreshCw className={`h-4 w-4 ${suggestionsLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <CardDescription className="text-base">
            Sugestões geradas por IA que mudam a cada carregamento
          </CardDescription>
          {suggestionsError && (
            <Alert className="mt-4 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Usando sugestões de fallback. Recarregue para tentar novamente.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {suggestionsLoading ? (
              // Show loading skeleton while suggestions are being generated
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="p-6 border-2 border-gray-200 rounded-xl bg-gray-50 animate-pulse"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-2/3 mb-3"></div>
                      <div className="flex gap-2 mb-3">
                        <div className="h-5 bg-gray-300 rounded w-16"></div>
                        <div className="h-5 bg-gray-300 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.text}-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="group p-6 text-left border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-white hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isGenerating}
                  aria-label={`Gerar aula sobre ${suggestion.text}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-sm font-bold text-white">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 group-hover:text-blue-800 leading-relaxed mb-2">
                        {suggestion.text}
                      </p>
                      <div className="flex gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs">{suggestion.category}</Badge>
                        <Badge variant="outline" className="text-xs">{suggestion.level}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Send className="h-3 w-3" />
                        <span>Clique para gerar automaticamente</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full border border-blue-200">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-700">
                Ou descreva seu próprio tópico abaixo
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Main Content Grid - Oculto quando aula foi gerada */}
      {!generatedLesson && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Generation Form - Larger */}
        <div className="lg:col-span-3">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-6 w-6 text-blue-600" />
                Gerador de Aulas Personalizado
              </CardTitle>
              <CardDescription>
                Descreva qualquer tópico e nossa IA criará uma experiência de aprendizado completa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="topic" className="text-sm font-semibold flex items-center gap-2">
                  O que você quer aprender hoje? 
                  <span className="text-red-500">*</span>
                </label>
                
                {/* Accessibility Features */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md border border-blue-200">
                    <Accessibility className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-blue-700 font-medium">Acessibilidade</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={() => {
                      // Mock speech-to-text functionality
                      console.log('Speech-to-text activated')
                      toast.success('Funcionalidade de voz ativada! Fale seu tópico.')
                    }}
                    title="Ativar entrada por voz"
                  >
                    <Mic className="h-3 w-3 mr-1" />
                    Voz
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={() => {
                      // Mock text-to-speech functionality
                      if (formData.topic) {
                        console.log('Text-to-speech activated for:', formData.topic)
                        toast.success('Lendo o texto em voz alta...')
                      } else {
                        toast.error('Digite algo primeiro para ouvir')
                      }
                    }}
                    title="Ouvir o texto em voz alta"
                  >
                    <Volume2 className="h-3 w-3 mr-1" />
                    Ouvir
                  </Button>
                </div>

                <Textarea
                  id="topic"
                  placeholder="Exemplo: Como a fotossíntese transforma luz solar em energia química, incluindo as reações e fatores que influenciam o processo..."
                  value={formData.topic}
                  onChange={(e) => {
                    const newValue = e.target.value
                    console.log('Mudança no campo topic:', { oldValue: formData.topic, newValue })
                    setFormData({ ...formData, topic: newValue })
                    
                    // Limpar erro se o campo não estiver mais vazio
                    if (formErrors.topic && newValue.trim().length >= 5) {
                      console.log('Limpando erro de validação')
                      const newErrors = { ...formErrors }
                      delete newErrors.topic
                      setFormErrors(newErrors)
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  rows={6}
                  className={`resize-none transition-colors ${
                    formErrors.topic ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  aria-invalid={!!formErrors.topic}
                  aria-describedby={formErrors.topic ? 'topic-error' : undefined}
                />
                {formErrors.topic && (
                  <p id="topic-error" className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.topic}
                  </p>
                )}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>💡 Quanto mais específico, melhor será sua aula!</span>
                  <span>{formData.topic.length}/500</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  O que nossa IA fará automaticamente:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✨ Identificar a matéria e série ideais</li>
                  <li>🎯 Criar objetivos de aprendizagem específicos</li>
                  <li>🎮 Desenvolver atividades interativas e gamificadas</li>
                  <li>📊 Gerar avaliações personalizadas</li>
                  <li>🏆 Implementar sistema de conquistas</li>
                </ul>
              </div>

              {/* Multi-Subject Support */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Suporte Multidisciplinar Completo
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-purple-800">Matemática</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-purple-800">Ciências</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-purple-800">Humanidades</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-purple-800">Programação</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-purple-800">Estudos Sociais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-purple-800">Linguagens</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-purple-800">Artes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span className="text-purple-800">Educação Física</span>
                  </div>
                </div>
                <p className="text-xs text-purple-700 mt-2">
                  Da educação básica ao ensino superior, cobrimos todas as disciplinas com metodologias adaptadas.
                </p>
              </div>

              <Button
                onClick={() => handleGenerate()}
                disabled={isGenerating || !formData.topic.trim()}
                className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Gerando sua aula personalizada...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-3 h-5 w-5" />
                    Gerar Aula Interativa
                  </>
                )}
              </Button>

              {isGenerating && (
                <div className="mt-6">
                  <LessonProgress
                    progress={generationProgress}
                    status={generationStatus}
                    isGenerating={isGenerating}
                    elapsedTime={elapsedTime}
                    className="min-h-[120px]"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Generated Lesson Preview - Smaller but detailed */}
        <div className="lg:col-span-2">
          <Card className="h-fit sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Sua Aula Gerada
              </CardTitle>
              <CardDescription>
                Preview da experiência de aprendizado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedLesson ? (
                <div className="space-y-6">
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{(generatedLesson as any)?.title || "Título da Aula"}</h3>
                    <div className="flex flex-wrap justify-center gap-2 mb-3">
                      <Badge className="bg-blue-100 text-blue-800">{(generatedLesson as any)?.subject || "Matéria"}</Badge>
                      <Badge className="bg-purple-100 text-purple-800">{(generatedLesson as any)?.level || "Nível"}</Badge>
                      <Badge className="bg-orange-100 text-orange-800">{(generatedLesson as any)?.difficulty || "Médio"}</Badge>
                    </div>
                    <div className="flex justify-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {(generatedLesson as any)?.estimatedDuration || ""} min
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
                        <span className="font-medium text-purple-800">{generatedLesson.stages?.length || 0} etapas interativas</span>
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
                      onClick={handleStartLesson} 
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Iniciar
                    </Button>
                    <Button onClick={handleSaveLesson} variant="outline">
                      💾 Salvar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 opacity-50" />
                  </div>
                  <p className="text-lg font-medium mb-2">Aguardando sua aula</p>
                  <p className="text-sm">Descreva um tópico para ver o preview aqui</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      )}

      {/* Aula Gerada - Layout completo quando aula está presente */}
      {generatedLesson && (
        <div className="max-w-4xl mx-auto">
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-4 bg-gray-100 rounded-lg text-xs">
              <strong>Debug Info:</strong>
              <br />ID: {generatedLesson.id}
              <br />Stages: {generatedLesson.stages?.length || 0}
              <br />Slides: {generatedLesson.slides?.length || 0}
              <br />Status: {generatedLesson.metadata?.status}
              <br />All Slides Loaded: {generatedLesson.metadata?.allSlidesLoaded ? 'Yes' : 'No'}
              <br />Stages Loading Status: {generatedLesson.stages?.map((s, i) => `${i+1}:${s.loading ? 'L' : 'R'}`).join(', ')}
            </div>
          )}
          
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Informações principais da aula */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{(generatedLesson as any)?.title || "Título da Aula"}</h2>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <Badge className="bg-blue-100 text-blue-800">{(generatedLesson as any)?.subject || "Matéria"}</Badge>
                    <Badge className="bg-purple-100 text-purple-800">{(generatedLesson as any)?.level || "Nível"}</Badge>
                    <Badge className="bg-orange-100 text-orange-800">{(generatedLesson as any)?.difficulty || "Médio"}</Badge>
                  </div>
                  <div className="flex justify-center gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {(generatedLesson as any)?.estimatedDuration || ""} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {generatedLesson.stages?.length || 0} etapas
                    </span>
                  </div>
                </div>

                {/* Objetivos de Aprendizagem */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Objetivos de Aprendizagem
                  </h3>
                  <ul className="space-y-3">
                    {(generatedLesson.objectives || []).map((objective: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Estrutura da Aula */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    Estrutura da Aula
                  </h3>
                  <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <Target className="h-6 w-6 text-purple-600" />
                      <span className="text-xl font-semibold text-purple-800">{generatedLesson.stages?.length || 0} etapas interativas</span>
                    </div>
                    <p className="text-purple-700 mb-4">
                      Aula completa com conteúdo personalizado e atividades adaptadas ao seu nível
                    </p>
                    <div className="flex justify-center gap-4 text-sm text-purple-600">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        Conteúdo educacional
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        Avaliações interativas
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        Gamificação
                      </span>
                    </div>
                  </div>
                </div>

                {/* Métricas de Pacing Profissional */}
                <PacingMetrics 
                  metrics={pacingMetrics} 
                  warnings={pacingWarnings}
                  className="bg-blue-50 p-6 rounded-lg border border-blue-200"
                />

                {/* Botões de ação */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    onClick={handleStartLesson} 
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-12 text-lg"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Iniciar Aula Agora
                  </Button>
                  <Button 
                    onClick={handleSaveLesson} 
                    variant="outline" 
                    className="sm:w-auto h-12"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Salvar Aula
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Debugger Modal */}
      {showDebugger && generatedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <LessonDebugger 
            lessonId={(generatedLesson as any)?.id || ""} 
            onClose={() => setShowDebugger(false)}
          />
        </div>
      )}

      </div>
    </SessionGuard>
  )
}