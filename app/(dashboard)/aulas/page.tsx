'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ContentBlockedModal } from '@/components/ui/content-blocked-modal'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Sparkles, BookOpen, Target, Users, Send, Lightbulb, TrendingUp, AlertCircle, CheckCircle, Clock, RefreshCw, Timer, BarChart3, FileText, AlertTriangle, Mic, Accessibility, Coffee, Brain, Zap, Star, Heart, Rocket, Image as ImageIcon, Shield, X } from 'lucide-react'
import { useDynamicSuggestions } from '@/hooks/useDynamicSuggestions'
// Removido: seleção manual de imagens - agora é automática
import Link from 'next/link'

// Mock components for demo (replace with actual imports)
const toast = {
  success: (msg: string) => console.log('Success:', msg),
  error: (msg: string) => console.log('Error:', msg)
}

// Function to clean old lessons from localStorage
const cleanOldLessons = (aggressive = false) => {
  // Verificar se estamos no browser antes de acessar localStorage
  if (typeof window === 'undefined') return
  
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

// Componente de entretenimento durante o loading - Design melhorado com card único
const LoadingEntertainment = ({ elapsedTime, curiosities, topic }: { 
  elapsedTime: number
  curiosities: Array<{ text: string; category: string }>
  topic: string
}) => {
  // Fallback para curiosidades genéricas se não houver curiosidades específicas
  const fallbackCuriosities = [
    "🧠 O cérebro humano processa informações 200.000 vezes mais rápido que um computador",
    "📚 A leitura regular pode aumentar a expectativa de vida em até 2 anos",
    "🎯 Objetivos claros aumentam a probabilidade de sucesso em até 40%",
    "⚡ Aprendizagem ativa é 6 vezes mais eficaz que aprendizagem passiva",
    "🎨 Cores podem influenciar o humor e a produtividade no aprendizado",
    "🏆 Reconhecimento e feedback positivo aumentam a motivação intrínseca",
    "📊 Repetição espaçada é a técnica mais eficaz para memorização duradoura",
    "🌱 A curiosidade é o combustível natural do aprendizado e da descoberta",
    "🎮 Gamificação pode aumentar o engajamento em atividades educacionais em até 90%",
    "💡 Cada pessoa tem um estilo de aprendizado único - visual, auditivo ou cinestésico"
  ]

  // Combinar curiosidades específicas com fallback
  const allCuriosities = curiosities.length > 0 
    ? [...curiosities.map(c => c.text), ...fallbackCuriosities]
    : fallbackCuriosities

  // Selecionar curiosidade atual baseada no tempo
  const currentCuriosity = allCuriosities[Math.floor(elapsedTime / 8000) % allCuriosities.length]

  return (
    <div className="space-y-8 p-8">
      {/* Header melhorado */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Coffee className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white fill-current" />
            </div>
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Criando sua Aula Personalizada
            </h2>
            <p className="text-lg text-gray-600 mt-1">
              Nossa IA está trabalhando intensamente para você!
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          <p className="text-gray-700 font-medium">
            <strong className="text-yellow-600">Tempo estimado:</strong> até 2 minutos para garantir qualidade máxima
          </p>
        </div>
      </div>
      
      {/* Card único "Você Sabia?" */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-2xl"></div>
          
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 border-2 border-blue-200 shadow-xl">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Lightbulb className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">Você Sabia?</h3>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                  </div>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed font-medium">
                  {currentCuriosity}
                </p>
                {curiosities.length > 0 && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Curiosidade específica sobre: <strong>{topic}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animações melhoradas */}
      <div className="flex justify-center gap-8 text-5xl">
        <div className="animate-bounce" style={{ animationDelay: '0ms' }}>
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
            🎯
          </div>
        </div>
        <div className="animate-bounce" style={{ animationDelay: '200ms' }}>
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            ✨
          </div>
        </div>
        <div className="animate-bounce" style={{ animationDelay: '400ms' }}>
          <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            🚀
          </div>
        </div>
        <div className="animate-bounce" style={{ animationDelay: '600ms' }}>
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            💡
          </div>
        </div>
        <div className="animate-bounce" style={{ animationDelay: '800ms' }}>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            🎮
          </div>
        </div>
        <div className="animate-bounce" style={{ animationDelay: '1000ms' }}>
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            🏆
          </div>
        </div>
      </div>
      
      {/* Progress indicators */}
      <div className="flex justify-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          <span>Analisando conteúdo</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <span>Gerando atividades</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <span>Otimizando experiência</span>
        </div>
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
    <div className={`space-y-6 ${className}`}>
      {/* Barra de progresso melhorada */}
      <div className="relative">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
          <div 
            className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 h-4 rounded-full transition-all duration-500 ease-out shadow-lg relative"
            style={{ width: `${progress}%` }}
          >
            {/* Efeito de brilho na barra */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
        </div>
        
        {/* Indicador de progresso */}
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm text-gray-500 font-medium">
            {Math.round(progress)}% concluído
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Tempo estimado: ~120s
          </div>
        </div>
      </div>
      
      {/* Status e tempo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isGenerating && (
            <div className="relative">
              <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
              <div className="absolute inset-0 h-5 w-5 animate-ping rounded-full bg-yellow-400 opacity-20"></div>
            </div>
          )}
          <span className={`text-lg font-medium ${status.includes('Erro') ? 'text-red-600' : 'text-gray-700'}`}>
            {status}
          </span>
        </div>
        <div className="flex items-center gap-2 text-lg text-yellow-600 font-semibold bg-yellow-50 px-3 py-1 rounded-full">
          <Timer className="h-5 w-5" />
          <span>{formatTime(elapsedTime)}</span>
        </div>
      </div>
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
}

interface FormData {
  topic: string
  targetLevel?: string
  focusArea?: string
}

interface FormErrors {
  topic?: string
}

interface SafetyCheckResult {
  isInappropriate: boolean
  inappropriateTopics: string[]
  suggestedResponse?: string
  educationalAlternative?: string
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
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState('')
  const [formData, setFormData] = useState<FormData>({ topic: '' })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [safetyWarning, setSafetyWarning] = useState<SafetyCheckResult | null>(null)
  const [contentBlockedModal, setContentBlockedModal] = useState<{
    isOpen: boolean
    blockedContent: any | null
  }>({
    isOpen: false,
    blockedContent: null
  })
  const [curiosities, setCuriosities] = useState<Array<{ text: string; category: string }>>([])
  const [currentTopic, setCurrentTopic] = useState('')
  const [topicIntroduction, setTopicIntroduction] = useState<string>('')
  
  // Hook para buscar sugestões do banco de dados
  const { suggestions, loading: suggestionsLoading, error: suggestionsError, refreshSuggestions } = useDynamicSuggestions()

  // Debug log para verificar estado inicial
  console.log('AulasPageContent render - isGenerating:', isGenerating, 'generatedLesson:', !!generatedLesson)

  // OPTIMIZED: Removed redundant checkContentSafety function - now handled by backend

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
    setGenerationProgress(0)
    setGenerationStatus('')
    setFormData({ topic: '' })
    setFormErrors({})
    setStartTime(null)
    setElapsedTime(0)
    setCuriosities([])
    setCurrentTopic('')
    setTopicIntroduction('')
    
    // Limpar localStorage
    const keys = Object.keys(localStorage).filter(key => key.startsWith('demo_lesson_'))
    keys.forEach(key => localStorage.removeItem(key))
    console.log('localStorage limpo')
  }, [])

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


  // Função para buscar curiosidades sobre o tópico
  const fetchCuriosities = useCallback(async (topic: string) => {
    try {
      console.log('🎯 Buscando curiosidades para:', topic)
      
      const response = await fetch('/api/aulas/generate-curiosities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic })
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar curiosidades')
      }

      const result = await response.json()
      
      if (result.success && result.curiosities) {
        console.log('✅ Curiosidades obtidas:', result.curiosities.length)
        setCuriosities(result.curiosities)
        setCurrentTopic(topic)
        return result.curiosities
      } else {
        throw new Error('Resposta inválida da API de curiosidades')
      }
    } catch (error) {
      console.warn('⚠️ Erro ao buscar curiosidades, usando fallback:', error)
      setCuriosities([])
      setCurrentTopic(topic)
      return []
    }
  }, [])

  // Função para buscar introdução específica sobre o tópico
  const fetchTopicIntroduction = useCallback(async (topic: string) => {
    try {
      console.log('📚 Buscando introdução para:', topic)
      
      const response = await fetch('/api/aulas/generate-curiosities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          topic,
          type: 'introduction' // Novo parâmetro para diferenciar da busca de curiosidades
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar introdução')
      }

      const result = await response.json()
      
      if (result.success && result.introduction) {
        console.log('✅ Introdução obtida:', result.introduction)
        setTopicIntroduction(result.introduction)
        return result.introduction
      } else {
        throw new Error('Resposta inválida da API de introdução')
      }
    } catch (error) {
      console.warn('⚠️ Erro ao buscar introdução, usando fallback:', error)
      // Fallback para introdução genérica baseada no tópico
      const fallbackIntroduction = `Esta aula foi cuidadosamente elaborada para proporcionar uma compreensão completa e interativa sobre ${topic}. Você será guiado através de conceitos fundamentais, exemplos práticos e atividades que facilitam o aprendizado e a retenção do conhecimento. Prepare-se para uma experiência educacional envolvente e personalizada!`
      setTopicIntroduction(fallbackIntroduction)
      return fallbackIntroduction
    }
  }, [])

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

    // Verificar segurança do conteúdo
    // OPTIMIZED: Safety check now handled by backend
    // Remove safety check logic since it's handled by backend

    setIsGenerating(true)
    setGenerationProgress(0)
    setGenerationStatus(STATUS_MESSAGES[0].message)
    setGeneratedLesson(null)
    setStartTime(Date.now())
    
    // Pré-chamada para buscar curiosidades e introdução sobre o tópico
    console.log('🎯 Iniciando busca de curiosidades e introdução...')
    await Promise.all([
      fetchCuriosities(topic),
      fetchTopicIntroduction(topic)
    ])

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
      const timeoutId = setTimeout(() => {
        console.log('⏰ Request timeout after 5 minutes, aborting...')
        controller.abort()
      }, 300000) // 5 minutos timeout para sistema híbrido
      
      const response = await fetch('/api/aulas/generate-ai-sdk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
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
        
        // OPTIMIZED: Handle content blocking with modal
        if (errorData.blocked && response.status === 400) {
          setContentBlockedModal({
            isOpen: true,
            blockedContent: {
              topic: topic,
              categories: errorData.categories || [],
              confidence: errorData.confidence || 0,
              reasoning: errorData.reasoning || '',
              educationalAlternative: errorData.educationalAlternative,
              message: errorData.message || 'Este conteúdo não é adequado para ambiente educacional.'
            }
          })
          setIsGenerating(false)
          return
        }
        
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
      

      // Store in localStorage for demo mode with quota management
      console.log('Salvando aula no localStorage:', generatedLesson.id, generatedLesson)
      try {
        // Clean old lessons before saving new one
        cleanOldLessons()
        
        // Try to save the lesson
        const lessonKey = `demo_lesson_${(generatedLesson as any)?.id || ""}`
        const lessonData = JSON.stringify(generatedLesson)
        
        // Check if data is too large
        if (lessonData.length > 4 * 1024 * 1024) { // 4MB limit (aumentado de 2MB)
          console.warn('Aula muito grande para localStorage, salvando versão otimizada')
          // Manter TODOS os slides, mas remover dados pesados (imagens base64)
          const compactLesson = {
            id: generatedLesson.id,
            title: generatedLesson.title,
            subject: generatedLesson.subject,
            grade: (generatedLesson as any).grade,
            objectives: (generatedLesson as any).objectives,
            // ✅ MANTER TODOS OS STAGES - apenas otimizar imagens
            stages: (generatedLesson as any).stages?.map((stage: any) => ({
              ...stage,
              activity: stage.activity ? {
                ...stage.activity,
                // Remover imagens base64 pesadas, manter apenas URLs HTTP
                imageData: undefined,
                imageUrl: stage.activity.imageUrl?.startsWith('http') ? stage.activity.imageUrl : undefined
              } : stage.activity
            })),
            // ✅ MANTER TODOS OS SLIDES - apenas otimizar imagens
            slides: (generatedLesson as any).slides?.map((slide: any) => ({
              ...slide,
              // Remover dados base64, manter apenas URLs HTTP externas
              imageData: undefined,
              imageMimeType: undefined,
              imageUrl: slide.imageUrl?.startsWith('http') ? slide.imageUrl : undefined
            })),
            metadata: { 
              ...(generatedLesson as any).metadata, 
              compact: true,
              originalSlidesCount: (generatedLesson as any).slides?.length,
              optimizationApplied: 'removed_base64_images'
            }
          }
          console.log(`✅ Otimizando aula: ${compactLesson.slides?.length} slides mantidos (imagens base64 removidas)`)
          localStorage.setItem(lessonKey, JSON.stringify(compactLesson))
        } else {
          localStorage.setItem(lessonKey, lessonData)
        }
        
        // Verificar se foi salvo corretamente
        const saved = localStorage.getItem(lessonKey)
        console.log('Aula salva no localStorage:', saved ? 'SIM' : 'NÃO')
        if (saved) {
          const parsed = JSON.parse(saved)
          console.log(`✅ Confirmado: ${parsed.slides?.length || 0} slides salvos`)
        }
      } catch (error) {
        console.warn('Erro ao salvar no localStorage:', error)
        // Try to clean more aggressively and retry
        cleanOldLessons(true)
        try {
          const lessonKey = `demo_lesson_${(generatedLesson as any)?.id || ""}`
          // Versão ultra-compacta: manter todos os slides mas remover TUDO que não é essencial
          const compactLesson = {
            id: generatedLesson.id,
            title: generatedLesson.title,
            subject: generatedLesson.subject,
            grade: (generatedLesson as any).grade,
            objectives: (generatedLesson as any).objectives?.slice(0, 3),
            // ✅ AINDA MANTER TODOS OS STAGES
            stages: (generatedLesson as any).stages?.map((stage: any) => ({
              etapa: stage.etapa,
              type: stage.type,
              route: stage.route,
              activity: {
                component: stage.activity?.component,
                content: stage.activity?.content,
                prompt: stage.activity?.prompt?.substring(0, 200), // Truncar prompts longos
                questions: stage.activity?.questions,
                time: stage.activity?.time,
                points: stage.activity?.points
              }
            })),
            // ✅ MANTER TODOS OS SLIDES (essenciais apenas)
            slides: (generatedLesson as any).slides?.map((slide: any) => ({
              slideNumber: slide.slideNumber,
              type: slide.type,
              title: slide.title,
              content: slide.content,
              timeEstimate: slide.timeEstimate,
              questions: slide.questions,
              question: slide.question,
              options: slide.options,
              correctAnswer: slide.correctAnswer,
              explanation: slide.explanation
            })),
            metadata: { 
              ...(generatedLesson as any).metadata, 
              compact: true,
              ultraCompact: true,
              originalSlidesCount: (generatedLesson as any).slides?.length
            }
          }
          console.log(`⚠️ Ultra-compactação: ${compactLesson.slides?.length} slides mantidos (sem imagens)`)
          localStorage.setItem(lessonKey, JSON.stringify(compactLesson))
          console.log('Aula salva em versão ultra-compacta após limpeza')
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
          errorMessage = 'Timeout: O sistema híbrido (Grok + Gemini) está processando muitas imagens. Tente novamente.'
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Erro de conexão: Verifique sua internet e tente novamente.'
        } else if (error.message.includes('ERR_NETWORK_IO_SUSPENDED')) {
          errorMessage = 'Conexão suspensa: Verifique sua internet e tente novamente.'
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
  }, [formData.topic, validateForm, isGenerating, fetchCuriosities])

// Removido: manipulação manual de imagens - agora é automática

  // Função para lidar com clique nas sugestões
  const handleSuggestionClick = useCallback(async (suggestion: { text: string; category: string; level: string }) => {
    setFormData({ topic: suggestion.text })
    setFormErrors({})
    
    // Auto-gerar após clique na sugestão
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
    
    // Salvar aula no localStorage para modo demo with quota management
    if (generatedLesson.demoMode) {
      try {
        // Clean old lessons before saving
        cleanOldLessons()
        
        const lessonKey = `demo_lesson_${(generatedLesson as any)?.id || ""}`
        const lessonData = JSON.stringify(generatedLesson)
        
        // Check if data is too large
        if (lessonData.length > 4 * 1024 * 1024) { // 4MB limit (aumentado de 2MB)
          console.warn('Aula muito grande para localStorage, salvando versão otimizada')
          // Manter TODOS os slides, mas remover dados pesados (imagens base64)
          const compactLesson = {
            id: generatedLesson.id,
            title: generatedLesson.title,
            subject: generatedLesson.subject,
            grade: (generatedLesson as any).grade,
            objectives: (generatedLesson as any).objectives,
            // ✅ MANTER TODOS OS STAGES
            stages: (generatedLesson as any).stages?.map((stage: any) => ({
              ...stage,
              activity: stage.activity ? {
                ...stage.activity,
                imageData: undefined,
                imageUrl: stage.activity.imageUrl?.startsWith('http') ? stage.activity.imageUrl : undefined
              } : stage.activity
            })),
            // ✅ MANTER TODOS OS SLIDES
            slides: (generatedLesson as any).slides?.map((slide: any) => ({
              ...slide,
              imageData: undefined,
              imageMimeType: undefined,
              imageUrl: slide.imageUrl?.startsWith('http') ? slide.imageUrl : undefined
            })),
            metadata: { 
              ...(generatedLesson as any).metadata, 
              compact: true,
              originalSlidesCount: (generatedLesson as any).slides?.length
            }
          }
          console.log(`✅ handleStartLesson: ${compactLesson.slides?.length} slides mantidos`)
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
          // Versão ultra-compacta: manter todos os slides mas remover TUDO que não é essencial
          const compactLesson = {
            id: generatedLesson.id,
            title: generatedLesson.title,
            subject: generatedLesson.subject,
            grade: (generatedLesson as any).grade,
            objectives: (generatedLesson as any).objectives?.slice(0, 3),
            // ✅ MANTER TODOS OS STAGES (ultra-compactados)
            stages: (generatedLesson as any).stages?.map((stage: any) => ({
              etapa: stage.etapa,
              type: stage.type,
              route: stage.route,
              activity: {
                component: stage.activity?.component,
                content: stage.activity?.content,
                questions: stage.activity?.questions,
                time: stage.activity?.time,
                points: stage.activity?.points
              }
            })),
            // ✅ MANTER TODOS OS SLIDES (ultra-compactados)
            slides: (generatedLesson as any).slides?.map((slide: any) => ({
              slideNumber: slide.slideNumber,
              type: slide.type,
              title: slide.title,
              content: slide.content,
              timeEstimate: slide.timeEstimate,
              questions: slide.questions,
              question: slide.question,
              options: slide.options,
              correctAnswer: slide.correctAnswer,
              explanation: slide.explanation
            })),
            metadata: { 
              ...(generatedLesson as any).metadata, 
              compact: true,
              ultraCompact: true
            }
          }
          console.log(`⚠️ handleStartLesson ultra-compactação: ${compactLesson.slides?.length} slides mantidos`)
          localStorage.setItem(lessonKey, JSON.stringify(compactLesson))
          console.log('Aula salva em versão ultra-compacta após limpeza')
        } catch (retryError) {
          console.error('Falha ao salvar mesmo após limpeza:', retryError)
        }
      }
    }
    
    // Navegar para a página da aula
    window.location.href = `/aulas/${(generatedLesson as any)?.id || ""}`
  }


  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl" role="main">
        {/* Header quando aula foi gerada */}
        {generatedLesson && (
          <header className="text-center mb-12">
            <div className="relative">
              {/* Background decoration */}
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
                      Aula Criada com Sucesso!
                    </h1>
                    <p className="text-lg text-gray-600">Sua experiência de aprendizado personalizada está pronta</p>
                  </div>
                </div>
                
                {/* Seção "Sobre este tema" */}
                {topicIntroduction && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700 mb-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-3 w-3 text-white" />
                      </div>
                      Sobre este tema
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {topicIntroduction}
                    </p>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button 
                    onClick={() => {
                      setGeneratedLesson(null)
                      setFormData({ topic: '' })
                      setFormErrors({})
                      setCuriosities([])
                      setCurrentTopic('')
                      setTopicIntroduction('')
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
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
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
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-teal-400/20 to-cyan-400/20 rounded-3xl blur-3xl"></div>
            
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-6">
                  <BookOpen className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white fill-current" />
                </div>
              </div>
              
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Aulas Interativas com IA
              </h1>
              <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
                Transforme qualquer tópico em uma experiência de aprendizado envolvente e personalizada
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-green-100 text-green-800 border border-green-200">
                  <Sparkles className="h-4 w-4" />
                  IA Avançada
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-teal-100 text-teal-800 border border-teal-200">
                  <Target className="h-4 w-4" />
                  Personalizado
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-cyan-100 text-cyan-800 border border-cyan-200">
                  <BookOpen className="h-4 w-4" />
                  Interativo
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Brain className="h-4 w-4" />
                  Inteligente
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-green-800 mb-2">IA Inteligente</h3>
                  <p className="text-sm text-green-700">Algoritmos avançados que adaptam o conteúdo ao seu nível</p>
                </div>
                <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200">
                  <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-teal-800 mb-2">Geração Rápida</h3>
                  <p className="text-sm text-teal-700">Aulas completas em menos de 2 minutos</p>
                </div>
                <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-200">
                  <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Rocket className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-cyan-800 mb-2">Experiência Única</h3>
                  <p className="text-sm text-cyan-700">Cada aula é única e adaptada ao seu interesse</p>
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
            
            <Card className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-2 border-yellow-200 dark:border-yellow-800 shadow-xl rounded-3xl overflow-hidden">
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
                        
                        // Verificar segurança do conteúdo
                        // OPTIMIZED: Safety check now handled by backend
                        // Remove safety check logic since it's handled by backend
                        
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
                        formErrors.topic || safetyWarning ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-blue-200 focus:border-blue-400 bg-white'
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

                  {/* Safety Warning */}
                  {safetyWarning && (
                    <Alert className="border-red-200 bg-red-50">
                      <Shield className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold mb-2">⚠️ Conteúdo inadequado detectado</p>
                            <p className="mb-2">{safetyWarning.suggestedResponse}</p>
                            <p className="text-sm text-red-600">
                              Tópicos detectados: {safetyWarning.inappropriateTopics.join(', ')}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSafetyWarning(null)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-100"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      Quanto mais específico, melhor será sua aula!
                    </span>
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
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 rounded-3xl blur-3xl"></div>
            
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20">
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
              suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.text}-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="group p-6 text-left border-2 border-blue-200 dark:border-blue-700 rounded-2xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-900/20 transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isGenerating}
                  aria-label={`Gerar aula sobre ${suggestion.text}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 border-2 border-blue-400 dark:border-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 bg-blue-50 dark:bg-blue-900/20">
                        <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-800 dark:group-hover:text-blue-300 line-clamp-2 leading-relaxed">
                          {suggestion.text}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                        {suggestion.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300">
                        {suggestion.level}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Send className="h-3 w-3" />
                      <span>Clique para gerar automaticamente</span>
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
          </div>
        </div>
      )}


      {/* Enhanced Loading State */}
      {isGenerating && (
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 rounded-3xl blur-3xl"></div>
            
            <Card className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-2 border-yellow-200 dark:border-yellow-800 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white p-8 text-center relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-6 mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                        <Loader2 className="h-10 w-10 animate-spin" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-yellow-800 fill-current animate-pulse" />
                      </div>
                    </div>
                    <div className="text-left">
                      <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
                        Criando sua Aula
                      </h1>
                      <p className="text-2xl text-yellow-100 font-medium">
                        IA trabalhando intensamente para você!
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress indicators */}
                  <div className="flex justify-center gap-6 mt-6">
                    <div className="flex items-center gap-2 text-yellow-100">
                      <div className="w-3 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Analisando</span>
                    </div>
                    <div className="flex items-center gap-2 text-yellow-100">
                      <div className="w-3 h-3 bg-orange-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      <span className="text-sm font-medium">Gerando</span>
                    </div>
                    <div className="flex items-center gap-2 text-yellow-100">
                      <div className="w-3 h-3 bg-red-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                      <span className="text-sm font-medium">Otimizando</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Enhanced Progress Section */}
                <div className="space-y-8">
                  <LessonProgress 
                    progress={generationProgress}
                    status={generationStatus}
                    isGenerating={isGenerating}
                    elapsedTime={elapsedTime}
                  />
                  
                  {/* Mensagem de erro específica */}
                  {generationStatus.includes('Erro') && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <AlertTriangle className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-red-800 text-lg mb-2">Erro na Geração</h4>
                          <p className="text-red-700 font-medium">
                            {generationStatus.replace('Erro: ', '')}
                          </p>
                          <div className="mt-3">
                            <Button
                              onClick={() => handleGenerate()}
                              variant="outline"
                              size="sm"
                              className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Tentar Novamente
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Enhanced Entertainment Section */}
                <LoadingEntertainment 
                  elapsedTime={elapsedTime} 
                  curiosities={curiosities}
                  topic={currentTopic}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}



      {/* Content Blocked Modal */}
      <ContentBlockedModal
        isOpen={contentBlockedModal.isOpen}
        onClose={() => setContentBlockedModal({ isOpen: false, blockedContent: null })}
      />

    </div>
  )
}

export default function AulasPage() {
  return <AulasPageContent />
}