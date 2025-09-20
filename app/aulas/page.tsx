'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Sparkles, BookOpen, Target, Users, Send, Lightbulb, TrendingUp, AlertCircle, CheckCircle, Clock, RefreshCw, Timer, BarChart3, FileText, AlertTriangle, Mic, Volume2, Accessibility, Coffee, Brain, Zap, Star, Heart, Rocket } from 'lucide-react'
import { useDynamicSuggestions } from '@/hooks/useDynamicSuggestions'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

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

// Componente de entretenimento durante o loading
const LoadingEntertainment = ({ elapsedTime }: { elapsedTime: number }) => {
  const tips = [
    "💡 Dica: Quanto mais específico for seu tópico, melhor será sua aula personalizada!",
    "🎯 Nossa IA analisa o contexto educacional para criar objetivos de aprendizagem precisos",
    "🎮 Cada aula inclui atividades interativas e sistema de gamificação",
    "📊 O pacing é otimizado profissionalmente para máxima eficácia pedagógica",
    "🎨 Imagens e recursos visuais são gerados automaticamente para cada tópico",
    "🏆 Sistema de conquistas motiva o aprendizado contínuo",
    "📚 Metodologia baseada em pesquisa científica em educação",
    "⚡ IA processa milhares de padrões educacionais para personalizar sua experiência"
  ]
  
  const facts = [
    "🧠 O cérebro aprende melhor com intervalos de 25-30 minutos",
    "🎯 Objetivos claros aumentam a retenção em até 40%",
    "🎮 Gamificação pode melhorar o engajamento em até 90%",
    "📊 Feedback imediato acelera o aprendizado significativamente",
    "🎨 Recursos visuais melhoram a compreensão em até 65%",
    "⚡ Aprendizagem ativa é 6x mais eficaz que passiva",
    "🏆 Reconhecimento aumenta a motivação intrínseca",
    "📚 Repetição espaçada é a chave para memorização duradoura"
  ]

  const currentTip = tips[Math.floor(elapsedTime / 10000) % tips.length]
  const currentFact = facts[Math.floor(elapsedTime / 15000) % facts.length]

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Coffee className="h-5 w-5 text-blue-600" />
          <span className="text-lg font-semibold text-blue-800">Enquanto aguardamos...</span>
        </div>
        <p className="text-sm text-blue-700">
          Nossa IA está trabalhando intensamente para criar sua aula perfeita! 
          <br />
          <strong>Pode levar até 2 minutos e meio</strong> para garantir qualidade máxima.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white/60 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Dica do Dia</h4>
              <p className="text-sm text-gray-700">{currentTip}</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-white/60 rounded-lg border border-purple-200">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Fato Científico</h4>
              <p className="text-sm text-gray-700">{currentFact}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center gap-4 text-2xl">
        <div className="animate-bounce" style={{ animationDelay: '0ms' }}>🎯</div>
        <div className="animate-bounce" style={{ animationDelay: '200ms' }}>✨</div>
        <div className="animate-bounce" style={{ animationDelay: '400ms' }}>🚀</div>
        <div className="animate-bounce" style={{ animationDelay: '600ms' }}>💡</div>
        <div className="animate-bounce" style={{ animationDelay: '800ms' }}>🎮</div>
      </div>
    </div>
  )
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
    <div className={`space-y-4 ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
          <span className="text-sm text-gray-600">{status}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-blue-600 font-medium">
          <Timer className="h-4 w-4" />
          <span>{formatTime(elapsedTime)}</span>
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
  { progress: 8, message: 'Identificando matéria, série e nível de dificuldade...' },
  { progress: 18, message: 'Criando objetivos de aprendizagem personalizados...' },
  { progress: 28, message: 'Estruturando conteúdo pedagógico...' },
  { progress: 38, message: 'Gerando atividades interativas e avaliações...' },
  { progress: 48, message: 'Aplicando técnicas de gamificação...' },
  { progress: 58, message: 'Criando imagens e recursos visuais...' },
  { progress: 68, message: 'Desenvolvendo sistema de avaliação...' },
  { progress: 78, message: 'Otimizando pacing e sequência didática...' },
  { progress: 88, message: 'Aplicando metodologias pedagógicas avançadas...' },
  { progress: 95, message: 'Finalizando aula e preparando interface...' }
]

/**
 * Enhanced AulasPage component with improved UX, performance, and accessibility
 */
function AulasPageContent() {
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


  // Enhanced lesson generation with better error handling and progress tracking
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
    setGenerationStatus(STATUS_MESSAGES[0].message)
    setGeneratedLesson(null)
    setStartTime(Date.now())

    const generationStartTime = Date.now()
    const estimatedDuration = 150000 // 150 seconds (2 minutes and 30 seconds) for realistic timing

    // Enhanced progress simulation
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - generationStartTime
      const progress = Math.min((elapsed / estimatedDuration) * 95, 95)
      setGenerationProgress(progress)

      const currentStatus = STATUS_MESSAGES.find(
        (status) => progress >= status.progress
      ) || STATUS_MESSAGES[STATUS_MESSAGES.length - 1]
      setGenerationStatus(currentStatus.message)

      if (progress >= 95) {
        clearInterval(progressInterval)
      }
    }, 300)

    try {
      // Chamar API do Gemini para gerar aula
      console.log('Chamando API do Gemini para gerar aula:', { topic })
      
      const response = await fetch('/api/aulas/generate-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic,
          mode: 'sync',
          schoolId: '',
          customPrompt: ''
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao gerar aula')
      }

      const result = await response.json()
      console.log('Resposta da API:', result)
      console.log('result.success:', result.success)
      console.log('result.lesson:', result.lesson)
      console.log('typeof result.lesson:', typeof result.lesson)
      
      if (!result.success || !result.lesson) {
        console.error('Validação falhou:', {
          success: result.success,
          hasLesson: !!result.lesson,
          lessonType: typeof result.lesson
        })
        throw new Error('Resposta inválida da API')
      }

      // Lesson is now saved in database, no need for localStorage

      const generatedLesson: GeneratedLesson = {
        id: result.lesson.id,
        title: result.lesson.title,
        subject: result.lesson.subject,
        level: result.lesson.level,
        estimatedDuration: 45,
        difficulty: 'Intermediário' as const,
        objectives: result.lesson.objectives || [
          `Compreender os conceitos fundamentais sobre ${topic}`,
          `Aplicar conhecimentos através de atividades práticas`,
          `Desenvolver pensamento crítico sobre o tema`,
          `Conectar o aprendizado com situações do cotidiano`
        ],
        stages: result.lesson.stages || [
          { etapa: 'Introdução e Contextualização', type: 'Apresentação', activity: {}, route: '/intro', estimatedTime: 8 },
          { etapa: 'Conteúdo Principal', type: 'Lição Interativa', activity: {}, route: '/content', estimatedTime: 20 },
          { etapa: 'Atividade Prática', type: 'Exercício', activity: {}, route: '/activity', estimatedTime: 12 },
          { etapa: 'Quiz de Fixação', type: 'Avaliação', activity: {}, route: '/quiz', estimatedTime: 5 }
        ],
        feedback: result.lesson.feedback || {},
        demoMode: result.lesson.demoMode || true,
        createdAt: new Date().toISOString()
      }

      setGenerationProgress(100)
      setGenerationStatus('Aula gerada com sucesso!')
      setGeneratedLesson(generatedLesson)
      
      // Capturar métricas de pacing profissional
      if (result.pacingMetrics) {
        setPacingMetrics(result.pacingMetrics)
      }
      if (result.warnings) {
        setPacingWarnings(result.warnings)
      }

      // Store in localStorage for demo mode
      console.log('Salvando aula no localStorage:', generatedLesson.id, generatedLesson)
      localStorage.setItem(`demo_lesson_${(generatedLesson as any)?.id || ""}`, JSON.stringify(generatedLesson))
      
      // Verificar se foi salvo corretamente
      const saved = localStorage.getItem(`demo_lesson_${(generatedLesson as any)?.id || ""}`)
      console.log('Aula salva no localStorage:', saved ? 'SIM' : 'NÃO')
      
      toast.success('Aula gerada com sucesso!')
    } catch (error) {
      console.error('Generation error:', error)
      setGenerationStatus('Erro na geração da aula')
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar aula. Tente novamente.')
    } finally {
      clearInterval(progressInterval)
      setIsGenerating(false)
      
      // Clear progress after delay
      setTimeout(() => {
        if (!isGenerating) {
          setGenerationProgress(0)
          setGenerationStatus('')
        }
      }, 2000)
    }
  }, [formData.topic, validateForm, isGenerating])

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
    if (!generatedLesson) {
      console.error('Nenhuma aula gerada para iniciar')
      toast.error('Nenhuma aula foi gerada ainda')
      return
    }
    
    console.log('Iniciando aula com ID:', generatedLesson.id)
    console.log('Dados da aula:', generatedLesson)
    
    // Salvar aula no localStorage para modo demo
    if (generatedLesson.demoMode) {
      localStorage.setItem(`demo_lesson_${(generatedLesson as any)?.id || ""}`, JSON.stringify(generatedLesson))
      console.log('Aula salva no localStorage para modo demo')
    }
    
    // Navegar para a página da aula
    window.location.href = `/aulas/${(generatedLesson as any)?.id || ""}`
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
    <div className="container mx-auto px-4 py-8 max-w-6xl" role="main">
      {/* Header quando aula foi gerada */}
      {generatedLesson && (
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                Aula Gerada com Sucesso!
              </h1>
              {/* Título removido */}
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
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Iniciar Aula
            </Button>
          </div>
        </header>
      )}

      {/* Enhanced Header - Oculto durante carregamento E quando aula foi gerada */}
      {!isGenerating && !generatedLesson && (
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl mb-6">
            <BookOpen className="h-10 w-10 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
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

      {/* Lesson Generator - Moved right after header */}
      {!isGenerating && !generatedLesson && (
        <div className="max-w-2xl mx-auto mb-8">
          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-6 w-6 text-yellow-600" />
                Gerador de Aulas Personalizado
              </CardTitle>
              <p className="text-sm text-gray-600">
                Descreva qualquer tópico e nossa IA criará uma experiência de aprendizado completa
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="topic" className="text-sm font-semibold flex items-center gap-2">
                  O que você quer aprender hoje? 
                  <span className="text-red-500">*</span>
                </label>
                
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

              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  O que nossa IA fará automaticamente:
                </h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>✨ Identificar a matéria e série ideais</li>
                  <li>🎯 Criar objetivos de aprendizagem específicos</li>
                  <li>🎮 Desenvolver atividades interativas e gamificadas</li>
                  <li>📊 Gerar avaliações personalizadas</li>
                  <li>🏆 Implementar sistema de conquistas</li>
                </ul>
              </div>

              <Button
                onClick={() => handleGenerate()}
                disabled={isGenerating || !formData.topic.trim()}
                className="w-full h-12 text-lg font-medium bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
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
            </CardContent>
          </Card>
        </div>
      )}




      {/* Minimalist Suggestions */}
      {!isGenerating && !generatedLesson && (
        <div className="max-w-4xl mx-auto mb-8">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">💡 Sugestões Rápidas</h3>
            <p className="text-sm text-gray-600">Clique em qualquer sugestão para gerar automaticamente</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestionsLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50 animate-pulse">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))
            ) : (
              suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.text}-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isGenerating}
                  aria-label={`Gerar aula sobre ${suggestion.text}`}
                >
                  <p className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">
                    {suggestion.text}
                  </p>
                  <div className="flex gap-1">
                    <Badge variant="secondary" className="text-xs px-1 py-0">{suggestion.category}</Badge>
                    <Badge variant="outline" className="text-xs px-1 py-0">{suggestion.level}</Badge>
                  </div>
                </button>
              ))
            )}
          </div>
          
          <div className="text-center mt-4">
            <Button
              onClick={refreshSuggestions}
              variant="outline"
              size="sm"
              disabled={suggestionsLoading}
              className="text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${suggestionsLoading ? 'animate-spin' : ''}`} />
              Atualizar Sugestões
            </Button>
          </div>
        </div>
      )}

      {/* Loading State - Mostra entretenimento e progresso */}
      {isGenerating && (
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                    Gerando sua Aula Personalizada
                  </h1>
                  <p className="text-lg text-gray-600">Nossa IA está trabalhando intensamente para você!</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <LessonProgress
                progress={generationProgress}
                status={generationStatus}
                isGenerating={isGenerating}
                elapsedTime={elapsedTime}
                className="min-h-[120px]"
              />
              
              {/* Entertainment Section */}
              <LoadingEntertainment elapsedTime={elapsedTime} />
            </CardContent>
          </Card>
        </div>
      )}


      {/* Aula Gerada - Layout completo quando aula está presente */}
      {generatedLesson && (
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Informações principais da aula removidas (título, badges e estatísticas) */}

                {/* Objetivos de Aprendizagem */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-yellow-600" />
                    Objetivos de Aprendizagem
                  </h3>
                  <ul className="space-y-3">
                    {generatedLesson.objectives.map((objective: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Estrutura da Aula */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-yellow-600" />
                    Estrutura da Aula
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedLesson.stages.map((stage: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{stage.etapa}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{stage.type}</Badge>
                            <span className="text-xs text-gray-500">{stage.estimatedTime} min</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Métricas de Pacing Profissional */}
                <PacingMetrics 
                  metrics={pacingMetrics} 
                  warnings={pacingWarnings}
                  className="bg-yellow-50 p-6 rounded-lg border border-yellow-200"
                />

                {/* Botões de ação */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    onClick={handleStartLesson} 
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 h-12 text-lg"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Iniciar Aula Agora
                  </Button>
                  <Button 
                    onClick={handleSaveLesson} 
                    variant="outline" 
                    className="sm:w-auto h-12 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
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




    </div>
  )
}

export default function AulasPage() {
  return (
    <ProtectedRoute>
      <AulasPageContent />
    </ProtectedRoute>
  )
}