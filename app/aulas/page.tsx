'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Sparkles, BookOpen, Target, Users, Send, Lightbulb, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react'

// Mock components for demo (replace with actual imports)
const toast = {
  success: (msg: string) => console.log('Success:', msg),
  error: (msg: string) => console.log('Error:', msg)
}

interface LessonProgressProps {
  progress: number
  status: string
  isGenerating: boolean
  className?: string
}

const LessonProgress = ({ progress, status, isGenerating, className }: LessonProgressProps) => (
  <div className={`space-y-4 ${className}`}>
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div 
        className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
    <div className="flex items-center gap-2">
      {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
      <span className="text-sm text-gray-600">{status}</span>
    </div>
  </div>
)

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

interface Suggestion {
  text: string
  category: string
  level: string
}

// Enhanced constants
const SUGGESTIONS = [
  { text: 'Como funciona a fotossíntese?', category: 'Biologia', level: '6º-8º ano' },
  { text: 'Explique a teoria da evolução', category: 'Biologia', level: '9º ano' },
  { text: 'Como calcular área de um triângulo?', category: 'Matemática', level: '7º ano' },
  { text: 'História do Brasil colonial', category: 'História', level: '8º-9º ano' },
  { text: 'Química orgânica básica', category: 'Química', level: 'Ensino Médio' },
  { text: 'Física: leis de Newton', category: 'Física', level: 'Ensino Médio' },
  { text: 'Literatura brasileira romântica', category: 'Literatura', level: 'Ensino Médio' },
  { text: 'Geografia: clima e vegetação', category: 'Geografia', level: '6º-7º ano' },
  { text: 'Equações do segundo grau', category: 'Matemática', level: '9º ano' },
  { text: 'Revolução Industrial', category: 'História', level: '8º ano' }
]

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
  // State management
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLesson | null>(null)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState('')
  const [formData, setFormData] = useState<FormData>({ topic: '' })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [recentLessons, setRecentLessons] = useState<GeneratedLesson[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Memoized random suggestions to prevent unnecessary re-renders
  const randomSuggestions = useMemo(() => {
    const shuffled = [...SUGGESTIONS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3)
  }, [])

  // Load recent lessons from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recent_lessons')
      if (saved) {
        setRecentLessons(JSON.parse(saved).slice(0, 3))
      }
    } catch (error) {
      console.error('Error loading recent lessons:', error)
    }
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

  // Save lesson to recent lessons
  const saveToRecentLessons = useCallback((lesson: GeneratedLesson) => {
    try {
      const updated = [lesson, ...recentLessons.filter(l => l.id !== lesson.id)].slice(0, 5)
      setRecentLessons(updated)
      localStorage.setItem('recent_lessons', JSON.stringify(updated))
    } catch (error) {
      console.error('Error saving to recent lessons:', error)
    }
  }, [recentLessons])

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

    const startTime = Date.now()
    const estimatedDuration = 25000 // 25 seconds for more realistic timing

    // Enhanced progress simulation
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
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
      // Chamar API real para gerar aula
      console.log('Chamando API para gerar aula:', { topic })
      
      const response = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic,
          demoMode: true, // Usar modo demo para evitar problemas de autenticação
          subject: 'Geral', // Será inferido pela IA
          grade: '5' // Será inferido pela IA
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao gerar aula')
      }

      const result = await response.json()
      console.log('Resposta da API:', result)
      
      if (!result.success || !result.lesson) {
        throw new Error('Resposta inválida da API')
      }

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
      saveToRecentLessons(generatedLesson)

      // Store in localStorage for demo mode
      console.log('Salvando aula no localStorage:', generatedLesson.id, generatedLesson)
      localStorage.setItem(`demo_lesson_${generatedLesson.id}`, JSON.stringify(generatedLesson))
      
      // Verificar se foi salvo corretamente
      const saved = localStorage.getItem(`demo_lesson_${generatedLesson.id}`)
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
  }, [formData.topic, validateForm, saveToRecentLessons])

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
      localStorage.setItem(`demo_lesson_${generatedLesson.id}`, JSON.stringify(generatedLesson))
      console.log('Aula salva no localStorage para modo demo')
    }
    
    // Navegar para a página da aula
    window.location.href = `/aulas/${generatedLesson.id}`
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
      {/* Enhanced Header */}
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

      {/* Demo Mode Alert */}
      <Alert className="mb-8 border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Modo Demo Ativo:</strong> Teste todas as funcionalidades gratuitamente. 
          Aulas são salvas localmente para esta sessão.
        </AlertDescription>
      </Alert>

      {/* Recent Lessons */}
      {recentLessons.length > 0 && (
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Clock className="h-5 w-5" />
              Aulas Recentes
            </CardTitle>
            <CardDescription className="text-green-700">
              Continue de onde parou ou gere uma nova aula
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentLessons.slice(0, 3).map((lesson, index) => (
                <div key={lesson.id} className="p-4 bg-white border border-green-200 rounded-lg">
                  <h4 className="font-medium text-sm mb-1 truncate">{lesson.title}</h4>
                  <div className="flex gap-1 mb-2">
                    <Badge variant="outline" className="text-xs">{lesson.subject}</Badge>
                    <Badge variant="outline" className="text-xs">{lesson.level}</Badge>
                  </div>
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    Continuar Aula
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Suggestions */}
      <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 mb-8">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center gap-2 justify-center text-2xl">
            <Lightbulb className="h-7 w-7 text-yellow-500" />
            Sugestões Inteligentes
          </CardTitle>
          <CardDescription className="text-base">
            Clique em qualquer sugestão para gerar sua aula automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {randomSuggestions.map((suggestion, index) => (
              <button
                key={index}
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
            ))}
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

      {/* Main Content Grid */}
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
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{generatedLesson.title}</h3>
                    <div className="flex flex-wrap justify-center gap-2 mb-3">
                      <Badge className="bg-blue-100 text-blue-800">{generatedLesson.subject}</Badge>
                      <Badge className="bg-purple-100 text-purple-800">{generatedLesson.level}</Badge>
                      <Badge className="bg-orange-100 text-orange-800">{generatedLesson.difficulty}</Badge>
                    </div>
                    <div className="flex justify-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {generatedLesson.estimatedDuration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {generatedLesson.stages.length} etapas
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      Objetivos de Aprendizagem:
                    </h4>
                    <ul className="space-y-2">
                      {generatedLesson.objectives.map((objective: string, index: number) => (
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
                    <div className="space-y-3">
                      {generatedLesson.stages.map((stage: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-white">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">{stage.etapa}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">{stage.type}</Badge>
                              <span className="text-xs text-gray-500">{stage.estimatedTime} min</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

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

      {/* Enhanced Features Section */}
      <Card className="mt-12 border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Por que escolher nossas Aulas Interativas?</CardTitle>
          <CardDescription className="text-lg">
            Tecnologia educacional de ponta para resultados excepcionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-3">IA Educacional Avançada</h3>
              <p className="text-gray-600 leading-relaxed">
                Nossa IA analisa o tópico e cria automaticamente objetivos, atividades e avaliações 
                personalizadas para o nível ideal do estudante.
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-3">Gamificação Inteligente</h3>
              <p className="text-gray-600 leading-relaxed">
                Sistema completo de pontos, conquistas e progressão que mantém os alunos 
                engajados e motivados durante toda a jornada de aprendizado.
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-3">Experiência Interativa</h3>
              <p className="text-gray-600 leading-relaxed">
                Quizzes dinâmicos, simulações, atividades práticas e feedback em tempo real 
                para uma aprendizagem ativa e envolvente.
              </p>
            </div>
          </div>
          
          {/* Additional stats section */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">10k+</div>
              <div className="text-sm text-gray-600">Aulas Geradas</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-sm text-gray-600">Satisfação</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-sm text-gray-600">Matérias</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Disponível</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Educational Benefits Section */}
      <Card className="mt-8 border-2 border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-6 w-6 text-green-600" />
            Benefícios Pedagógicos Comprovados
          </CardTitle>
          <CardDescription>
            Baseado em metodologias educacionais modernas e pesquisa científica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Aprendizagem Ativa</h4>
                  <p className="text-sm text-gray-600">Metodologia que coloca o aluno como protagonista do seu aprendizado</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Personalização Adaptativa</h4>
                  <p className="text-sm text-gray-600">Conteúdo que se ajusta ao ritmo e estilo de cada estudante</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Feedback Imediato</h4>
                  <p className="text-sm text-gray-600">Correções e orientações em tempo real para otimizar o aprendizado</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Microlearning</h4>
                  <p className="text-sm text-gray-600">Conteúdo dividido em pequenas doses para melhor retenção</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Avaliação Formativa</h4>
                  <p className="text-sm text-gray-600">Acompanhamento contínuo do progresso e identificação de lacunas</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Conectivismo Digital</h4>
                  <p className="text-sm text-gray-600">Integração com recursos digitais e redes de conhecimento</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action Footer */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium">
          <Sparkles className="h-5 w-5" />
          Pronto para revolucionar seu aprendizado?
        </div>
        <p className="text-gray-600 mt-2">
          Comece agora mesmo - é grátis e sem compromisso!
        </p>
      </div>
    </div>
  )
}