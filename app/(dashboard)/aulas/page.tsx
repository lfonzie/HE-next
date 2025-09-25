'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Sparkles, BookOpen, Target, Users, Send, Lightbulb, TrendingUp, AlertCircle, CheckCircle, Clock, RefreshCw, Timer, BarChart3, FileText, AlertTriangle, Mic, Accessibility, Coffee, Brain, Zap, Star, Heart, Rocket, Image as ImageIcon } from 'lucide-react'
import { useEnhancedSuggestions } from '@/hooks/useEnhancedSuggestions'
// Removido: seleção manual de imagens - agora é automática
import Link from 'next/link'

// Mock components for demo (replace with actual imports)
const toast = {
  success: (msg: string) => console.log('Success:', msg),
  error: (msg: string) => console.log('Error:', msg)
}

// Function to clean old lessons from localStorage
const cleanOldLessons = (aggressive = false) => {
  try {
    const keys = Object.keys(localStorage)
    const lessonKeys = keys.filter(key => key.startsWith('demo_lesson_'))
    
    if (lessonKeys.length === 0) return
    
    // Sort by key (which includes timestamp) to get oldest first
    lessonKeys.sort()
    
    // Calculate how many to remove
    const maxLessons = aggressive ? 3 : 5 // Keep only 3-5 most recent lessons
    const toRemove = lessonKeys.slice(0, Math.max(0, lessonKeys.length - maxLessons))
    
    console.log(`🧹 Limpando ${toRemove.length} aulas antigas do localStorage`)
    
    // Remove old lessons
    toRemove.forEach(key => {
      localStorage.removeItem(key)
      console.log(`🗑️ Removido: ${key}`)
    })
    
    // Also clean other large items if aggressive
    if (aggressive) {
      const otherKeys = keys.filter(key => 
        key.startsWith('tts_') || 
        key.startsWith('lesson_cache') ||
        key.startsWith('audio_cache')
      )
      
      otherKeys.forEach(key => {
        try {
          const item = localStorage.getItem(key)
          if (item && item.length > 100000) { // Remove items > 100KB
            localStorage.removeItem(key)
            console.log(`🗑️ Removido item grande: ${key}`)
          }
        } catch (e) {
          localStorage.removeItem(key)
        }
      })
    }
    
    console.log(`✅ Limpeza concluída. Restam ${lessonKeys.length - toRemove.length} aulas`)
  } catch (error) {
    console.warn('Erro durante limpeza do localStorage:', error)
  }
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
    <div className="space-y-8 p-8 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl border border-yellow-200">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Coffee className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-800">Enquanto aguardamos...</span>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Nossa IA está trabalhando intensamente para criar sua aula perfeita! 
          <br />
          <strong className="text-yellow-600">Pode levar até 1 minuto e meio</strong> para garantir qualidade máxima.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-yellow-200 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Dica do Dia</h4>
              <p className="text-gray-700 leading-relaxed">{currentTip}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-orange-200 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Fato Científico</h4>
              <p className="text-gray-700 leading-relaxed">{currentFact}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center gap-6 text-4xl">
        <div className="animate-bounce" style={{ animationDelay: '0ms' }}>🎯</div>
        <div className="animate-bounce" style={{ animationDelay: '200ms' }}>✨</div>
        <div className="animate-bounce" style={{ animationDelay: '400ms' }}>🚀</div>
        <div className="animate-bounce" style={{ animationDelay: '600ms' }}>💡</div>
        <div className="animate-bounce" style={{ animationDelay: '800ms' }}>🎮</div>
        <div className="animate-bounce" style={{ animationDelay: '1000ms' }}>🏆</div>
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
          className="bg-yellow-600 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
          <span className="text-sm text-gray-600">{status}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-yellow-600 font-medium">
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
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">📊 Métricas de Pacing Profissional</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo Síncrono</p>
              <p className="text-2xl font-bold text-green-600">{metrics.synchronousTime} min</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Timer className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo Assíncrono</p>
              <p className="text-2xl font-bold text-yellow-600">{metrics.asynchronousTime} min</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Tokens</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.totalTokens.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Palavras por Slide</p>
              <p className="text-2xl font-bold text-red-600">{metrics.wordsPerSlide}</p>
            </div>
          </div>
        </div>
      </div>
      
      {warnings && warnings.length > 0 && (
        <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div className="text-xl font-bold text-yellow-800">⚠️ Avisos de Qualidade</div>
          </div>
          <ul className="space-y-2">
            {warnings.map((warning, index) => (
              <li key={index} className="flex items-start gap-3 text-yellow-800">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="font-medium">{warning}</span>
              </li>
            ))}
          </ul>
        </div>
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
  id: number
  text: string
  category: string
  level: string
  description: string
  tags: string[]
  difficulty: 'básico' | 'intermediário' | 'avançado'
  estimatedTime: number
  popularity: number
}

// Removido: SUGGESTIONS estáticas - agora usando sugestões dinâmicas do Gemini

const STATUS_MESSAGES = [
  { progress: 0, message: 'Analisando o tópico e contexto educacional...' },
  { progress: 8, message: 'Identificando matéria, série e nível de dificuldade...' },
  { progress: 18, message: 'Criando objetivos de aprendizagem personalizados...' },
  { progress: 28, message: 'Estruturando conteúdo pedagógico...' },
  { progress: 38, message: 'Gerando atividades interativas e avaliações...' },
  { progress: 48, message: 'Aplicando técnicas de gamificação...' },
  { progress: 58, message: 'Selecionando imagens educacionais automaticamente...' },
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
  

  // Debug log para verificar estado inicial
  console.log('AulasPageContent render - isGenerating:', isGenerating, 'generatedLesson:', !!generatedLesson)

  // Verificar se há aula salva no localStorage que pode estar causando problemas
  useEffect(() => {
    const checkLocalStorage = () => {
      try {
        // Clean old lessons on component mount to prevent quota issues
        cleanOldLessons()
        
        const keys = Object.keys(localStorage)
        const lessonKeys = keys.filter(key => key.startsWith('demo_lesson_'))
        
        if (lessonKeys.length > 0) {
          console.log(`📚 Encontradas ${lessonKeys.length} aulas salvas no localStorage`)
          
          // Check if any lesson is too large
          lessonKeys.forEach(key => {
            try {
              const lesson = localStorage.getItem(key)
              if (lesson && lesson.length > 5 * 1024 * 1024) { // 5MB
                console.warn(`⚠️ Aula muito grande encontrada: ${key} (${Math.round(lesson.length / 1024 / 1024)}MB)`)
                // Remove oversized lessons
                localStorage.removeItem(key)
                console.log(`🗑️ Removida aula muito grande: ${key}`)
              }
            } catch (e) {
              console.warn(`Erro ao verificar aula ${key}:`, e)
              localStorage.removeItem(key)
            }
          })
        }
      } catch (error) {
        console.warn('Erro ao verificar localStorage:', error)
      }
    }
    
    checkLocalStorage()
  }, [])

  // Função para limpar estado e localStorage (debug)
  const clearAllState = useCallback(() => {
    console.log('Limpando todo o estado e localStorage')
    setIsGenerating(false)
    setGeneratedLesson(null)
    setPacingMetrics(null)
    setPacingWarnings([])
    setGenerationProgress(0)
    setGenerationStatus('')
    setFormData({ topic: '' })
    setFormErrors({})
    setStartTime(null)
    setElapsedTime(0)
    
    // Limpar localStorage
    const keys = Object.keys(localStorage).filter(key => key.startsWith('demo_lesson_'))
    keys.forEach(key => localStorage.removeItem(key))
    console.log('localStorage limpo')
  }, [])

  // Usar sugestões melhoradas
  const { suggestions, loading: suggestionsLoading, error: suggestionsError, refreshSuggestions } = useEnhancedSuggestions({
    limit: 6, // Mostrar apenas 6 sugestões na página principal
    sortBy: 'popularity'
  })

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
    const estimatedDuration = 90000 // 90 seconds (1 minute and 30 seconds) for realistic timing

    // Enhanced progress simulation with streaming text updates
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
      // Chamar API com AI SDK (fallback automático)
      console.log('Chamando API com AI SDK para gerar aula:', { topic })
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minutos timeout
      
      const response = await fetch('/api/aulas/generate-ai-sdk', {
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
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Erro da API:', errorData)
        
        // Tratar diferentes tipos de erro
        if (response.status === 429 || errorData.error?.includes('overloaded')) {
          throw new Error('A API está sobrecarregada. O sistema tentará automaticamente outro provedor.')
        } else if (response.status === 500) {
          throw new Error('Erro interno do servidor. O sistema tentará automaticamente outro provedor.')
        } else {
          throw new Error(errorData.error || 'Erro ao gerar aula')
        }
      }

      const result = await response.json()
      console.log('Resposta da API:', result)
      console.log('result.success:', result.success)
      console.log('result.lesson:', result.lesson)
      console.log('result.provider:', result.provider)
      console.log('result.generationTime:', result.generationTime)
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
      setGenerationStatus(`Aula gerada com sucesso usando ${result.provider}!`)
      setGeneratedLesson(generatedLesson)
      
      // Capturar métricas de pacing profissional
      if (result.pacingMetrics) {
        setPacingMetrics(result.pacingMetrics)
      }
      if (result.warnings) {
        setPacingWarnings(result.warnings)
      }

      // Store in localStorage for demo mode with quota management
      console.log('Salvando aula no localStorage:', generatedLesson.id, generatedLesson)
      try {
        // Clean old lessons before saving new one
        cleanOldLessons()
        
        // Try to save the lesson
        const lessonKey = `demo_lesson_${(generatedLesson as any)?.id || ""}`
        const lessonData = JSON.stringify(generatedLesson)
        
        // Check if data is too large
        if (lessonData.length > 2 * 1024 * 1024) { // 2MB limit
          console.warn('Aula muito grande para localStorage, salvando versão compacta')
          const compactLesson = {
            id: generatedLesson.id,
            title: generatedLesson.title,
            subject: generatedLesson.subject,
            grade: (generatedLesson as any).grade,
            objectives: (generatedLesson as any).objectives,
            stages: (generatedLesson as any).stages?.slice(0, 3), // Keep only first 3 stages
            slides: (generatedLesson as any).slides?.slice(0, 5), // Keep only first 5 slides
            metadata: { ...(generatedLesson as any).metadata, compact: true }
          }
          localStorage.setItem(lessonKey, JSON.stringify(compactLesson))
        } else {
          localStorage.setItem(lessonKey, lessonData)
        }
        
        // Verificar se foi salvo corretamente
        const saved = localStorage.getItem(lessonKey)
        console.log('Aula salva no localStorage:', saved ? 'SIM' : 'NÃO')
      } catch (error) {
        console.warn('Erro ao salvar no localStorage:', error)
        // Try to clean more aggressively and retry
        cleanOldLessons(true)
        try {
          const lessonKey = `demo_lesson_${(generatedLesson as any)?.id || ""}`
          const compactLesson = {
            id: generatedLesson.id,
            title: generatedLesson.title,
            subject: generatedLesson.subject,
            grade: (generatedLesson as any).grade,
            objectives: (generatedLesson as any).objectives?.slice(0, 3),
            stages: (generatedLesson as any).stages?.slice(0, 2),
            slides: (generatedLesson as any).slides?.slice(0, 3),
            metadata: { ...(generatedLesson as any).metadata, compact: true }
          }
          localStorage.setItem(lessonKey, JSON.stringify(compactLesson))
          console.log('Aula salva em versão compacta após limpeza')
        } catch (retryError) {
          console.error('Falha ao salvar mesmo após limpeza:', retryError)
        }
      }
      
      toast.success(`Aula gerada com sucesso usando ${result.provider}!`)
    } catch (error) {
      console.error('Generation error:', error)
      
      // Determinar mensagem de erro específica
      let errorMessage = 'Erro ao gerar aula. Tente novamente.'
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Timeout: A geração da aula demorou muito. Tente novamente.'
        } else if (error.message.includes('sobrecarregada')) {
          errorMessage = 'Todos os provedores estão sobrecarregados. Tente novamente em alguns minutos.'
        } else if (error.message.includes('servidor')) {
          errorMessage = 'Erro interno em todos os provedores. Tente novamente em alguns minutos.'
        } else if (error.message.includes('Todos os provedores falharam')) {
          errorMessage = 'Todos os provedores de IA falharam. Tente novamente em alguns minutos.'
        } else {
          errorMessage = error.message
        }
      }
      
      setGenerationStatus(`Erro: ${errorMessage}`)
      toast.error(errorMessage)
    } finally {
      clearInterval(progressInterval)
      setIsGenerating(false)
      
      // Clear progress after delay
      setTimeout(() => {
        setGenerationProgress(0)
        setGenerationStatus('')
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

// Removido: manipulação manual de imagens - agora é automática

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
    
    // Salvar aula no localStorage para modo demo with quota management
    if (generatedLesson.demoMode) {
      try {
        // Clean old lessons before saving
        cleanOldLessons()
        
        const lessonKey = `demo_lesson_${(generatedLesson as any)?.id || ""}`
        const lessonData = JSON.stringify(generatedLesson)
        
        // Check if data is too large
        if (lessonData.length > 2 * 1024 * 1024) { // 2MB limit
          console.warn('Aula muito grande para localStorage, salvando versão compacta')
          const compactLesson = {
            id: generatedLesson.id,
            title: generatedLesson.title,
            subject: generatedLesson.subject,
            grade: (generatedLesson as any).grade,
            objectives: (generatedLesson as any).objectives,
            stages: (generatedLesson as any).stages?.slice(0, 3),
            slides: (generatedLesson as any).slides?.slice(0, 5),
            metadata: { ...(generatedLesson as any).metadata, compact: true }
          }
          localStorage.setItem(lessonKey, JSON.stringify(compactLesson))
        } else {
          localStorage.setItem(lessonKey, lessonData)
        }
        
        console.log('Aula salva no localStorage para modo demo')
      } catch (error) {
        console.warn('Erro ao salvar no localStorage:', error)
        // Try to clean more aggressively and retry
        cleanOldLessons(true)
        try {
          const lessonKey = `demo_lesson_${(generatedLesson as any)?.id || ""}`
          const compactLesson = {
            id: generatedLesson.id,
            title: generatedLesson.title,
            subject: generatedLesson.subject,
            grade: (generatedLesson as any).grade,
            objectives: (generatedLesson as any).objectives?.slice(0, 3),
            stages: (generatedLesson as any).stages?.slice(0, 2),
            slides: (generatedLesson as any).slides?.slice(0, 3),
            metadata: { ...(generatedLesson as any).metadata, compact: true }
          }
          localStorage.setItem(lessonKey, JSON.stringify(compactLesson))
          console.log('Aula salva em versão compacta após limpeza')
        } catch (retryError) {
          console.error('Falha ao salvar mesmo após limpeza:', retryError)
        }
      }
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
    <div className="container mx-auto px-4 py-8 max-w-7xl" role="main">
        {/* Header quando aula foi gerada */}
        {generatedLesson && (
          <header className="text-center mb-12">
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 rounded-3xl blur-3xl"></div>
              
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
                <div className="flex items-center justify-center gap-6 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Star className="h-3 w-3 text-white fill-current" />
                    </div>
                  </div>
                  <div className="text-left">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent mb-2">
                      Aula Criada com Sucesso!
                    </h1>
                    <p className="text-lg text-gray-600">Sua experiência de aprendizado personalizada está pronta</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button 
                    onClick={() => {
                      setGeneratedLesson(null)
                      setFormData({ topic: '' })
                      setFormErrors({})
                      setPacingMetrics(null)
                      setPacingWarnings([])
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
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                  >
                    <Users className="h-5 w-5" />
                    Iniciar Aula Agora
                  </Button>
                </div>
              </div>
            </div>
          </header>
        )}

      {/* Enhanced Header - Oculto durante carregamento E quando aula foi gerada */}
      {!isGenerating && !generatedLesson && (
        <header className="text-center mb-16">
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 rounded-3xl blur-3xl"></div>
            
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-6">
                  <BookOpen className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white fill-current" />
                </div>
              </div>
              
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                Aulas Interativas com IA
              </h1>
              <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Transforme qualquer tópico em uma experiência de aprendizado envolvente e personalizada
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-yellow-100 text-yellow-800 border border-yellow-200">
                  <Sparkles className="h-4 w-4" />
                  IA Avançada
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-100 text-orange-800 border border-orange-200">
                  <Target className="h-4 w-4" />
                  Personalizado
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-red-100 text-red-800 border border-red-200">
                  <Users className="h-4 w-4" />
                  Interativo
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-green-100 text-green-800 border border-green-200">
                  <Heart className="h-4 w-4" />
                  Gamificado
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200">
                  <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-yellow-900 mb-2">IA Inteligente</h3>
                  <p className="text-sm text-yellow-700">Algoritmos avançados que adaptam o conteúdo ao seu nível</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-orange-900 mb-2">Geração Rápida</h3>
                  <p className="text-sm text-orange-700">Aulas completas em menos de 2 minutos</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Rocket className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-red-900 mb-2">Experiência Única</h3>
                  <p className="text-sm text-red-700">Cada aula é única e adaptada ao seu interesse</p>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Lesson Generator - Moved right after header */}
      {!isGenerating && !generatedLesson && (
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-400/10 to-red-400/10 rounded-3xl blur-2xl"></div>
            
            <Card className="relative bg-white/90 backdrop-blur-sm border-2 border-yellow-200 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-8">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  Gerador de Aulas Personalizado
                </CardTitle>
                <p className="text-yellow-100 text-lg mt-2">
                  Descreva qualquer tópico e nossa IA criará uma experiência de aprendizado completa
                </p>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <label htmlFor="topic" className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    O que você quer aprender hoje? 
                    <span className="text-red-500 text-xl">*</span>
                  </label>
                  
                  <div className="relative">
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
                      className={`resize-none transition-all duration-200 text-lg border-2 rounded-2xl p-4 ${
                        formErrors.topic ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-blue-200 focus:border-blue-400 bg-white'
                      }`}
                      aria-invalid={!!formErrors.topic}
                      aria-describedby={formErrors.topic ? 'topic-error' : undefined}
                    />
                    
                    {/* Character counter */}
                    <div className="absolute bottom-3 right-4 text-sm text-gray-400">
                      {formData.topic.length}/500
                    </div>
                  </div>
                  
                  {formErrors.topic && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <p id="topic-error" className="text-red-700 font-medium">
                        {formErrors.topic}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      Quanto mais específico, melhor será sua aula!
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border border-yellow-200 rounded-2xl p-6">
                  <h4 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Target className="h-3 w-3 text-white" />
                    </div>
                    O que nossa IA fará automaticamente:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-700">Identificar matéria e série ideais</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                        <Target className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-700">Criar objetivos específicos</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-700">Desenvolver atividades interativas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                        <Heart className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-700">Implementar gamificação</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-700">Selecionar imagens educacionais automaticamente</span>
                    </div>
                  </div>
                </div>


                <div className="space-y-4">

                  <Button
                    onClick={() => handleGenerate()}
                    disabled={isGenerating || !formData.topic.trim()}
                    className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="mr-4 h-6 w-6 animate-spin rounded-full border-3 border-white border-t-transparent" />
                        Gerando sua aula personalizada...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-4 h-6 w-6" />
                        Gerar Aula Interativa
                      </>
                    )}
                  </Button>
                  
                  {/* Botão para tentar novamente quando há erro */}
                  {generationStatus.includes('Erro') && (
                    <Button
                      onClick={() => handleGenerate()}
                      variant="outline"
                      size="sm"
                      className="w-full text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      🔄 Tentar Novamente
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}




      {/* Enhanced Suggestions */}
      {!isGenerating && !generatedLesson && (
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              Sugestões Inteligentes
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore nossa biblioteca de tópicos educacionais com filtros inteligentes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestionsLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="p-6 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm animate-pulse">
                  <div className="h-6 bg-gray-300 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded-lg w-2/3 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
                    <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
              ))
            ) : (
              suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="group p-6 text-left border-2 border-gray-200 rounded-2xl hover:border-yellow-300 hover:bg-gradient-to-br hover:from-yellow-50 hover:to-orange-50 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isGenerating}
                  aria-label={`Gerar aula sobre ${suggestion.text}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-gray-800 group-hover:text-yellow-800 line-clamp-2 leading-relaxed">
                          {suggestion.text}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200">
                        {suggestion.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs px-2 py-1 border-orange-200 text-orange-700">
                        {suggestion.level}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-1 ${
                          suggestion.difficulty === 'básico' ? 'bg-green-100 text-green-800 border-green-200' :
                          suggestion.difficulty === 'intermediário' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-red-100 text-red-800 border-red-200'
                        }`}
                      >
                        {suggestion.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{suggestion.estimatedTime}min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{suggestion.popularity}%</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {suggestion.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {suggestion.tags.length > 3 && (
                        <span className="text-xs text-gray-400 px-2 py-1">
                          +{suggestion.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          
          <div className="text-center mt-8 space-y-4">
            <Button
              onClick={refreshSuggestions}
              variant="outline"
              size="lg"
              disabled={suggestionsLoading}
              className="border-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${suggestionsLoading ? 'animate-spin' : ''}`} />
              Atualizar Sugestões
            </Button>
            
            <div className="text-sm text-gray-500">
              <p>Quer ver mais opções? 
                <Link href="/suggestions-library" className="text-blue-600 hover:text-blue-800 underline ml-1">
                  Acesse nossa biblioteca completa de sugestões
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Loading State */}
      {isGenerating && (
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 rounded-3xl blur-3xl"></div>
            
            <Card className="relative bg-white/90 backdrop-blur-sm border-2 border-yellow-200 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-8 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold mb-2">
                      Gerando sua Aula Personalizada
                    </h1>
                    <p className="text-xl text-yellow-100">Nossa IA está trabalhando intensamente para você!</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Enhanced Progress Bar */}
                <div className="space-y-6">
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-orange-600 h-4 rounded-full transition-all duration-500 ease-out shadow-lg"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isGenerating && <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />}
                      <span className={`text-lg font-medium ${generationStatus.includes('Erro') ? 'text-red-600' : 'text-gray-700'}`}>
                        {generationStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-lg text-yellow-600 font-semibold">
                      <Timer className="h-5 w-5" />
                      <span>{formatTime(elapsedTime)}</span>
                    </div>
                  </div>
                  
                  {/* Mensagem de erro específica */}
                  {generationStatus.includes('Erro') && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">⚠️</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-red-800">Erro na Geração</h4>
                          <p className="text-red-700 text-sm mt-1">
                            {generationStatus.replace('Erro: ', '')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Enhanced Entertainment Section */}
                <LoadingEntertainment elapsedTime={elapsedTime} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}


      {/* Enhanced Generated Lesson Display */}
      {generatedLesson && (
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 rounded-3xl blur-3xl"></div>
            
            <Card className="relative bg-white/90 backdrop-blur-sm border-2 border-yellow-200 shadow-xl rounded-3xl overflow-hidden">
              <CardContent className="p-12">
                <div className="space-y-12">

                  {/* Estrutura da Aula */}
                  <div>
                    <h3 className="text-3xl font-bold mb-8 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      Estrutura da Aula
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {generatedLesson.stages.map((stage: any, index: number) => (
                        <div key={index} className="group p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-200">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                              <span className="text-lg font-bold text-white">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-lg">{stage.etapa}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800 border border-orange-200">
                                  {stage.type}
                                </Badge>
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {stage.estimatedTime} min
                                </span>
                              </div>
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
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-2xl border border-yellow-200"
                  />

                  {/* Botões de ação */}
                  <div className="flex flex-col sm:flex-row gap-6 pt-8">
                    <Button 
                      onClick={handleStartLesson} 
                      className="flex-1 h-16 text-xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl"
                    >
                      <Users className="mr-3 h-6 w-6" />
                      Iniciar Aula Agora
                    </Button>
                    <Button 
                      onClick={handleSaveLesson} 
                      variant="outline" 
                      className="sm:w-auto h-16 text-lg border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500 transition-all duration-200 rounded-2xl"
                    >
                      <FileText className="mr-2 h-5 w-5" />
                      Salvar Aula
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      </div>
  )
}

export default function AulasPage() {
  return <AulasPageContent />
}