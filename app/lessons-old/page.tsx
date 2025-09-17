'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, BookOpen, Target, Users, Send, Lightbulb, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { ProgressTimer } from '@/components/ui/timer'
import { LessonProgress } from '@/components/ui/lesson-progress'
import { motion } from 'framer-motion'

interface GeneratedLesson {
  id: string
  title: string
  subject: string
  level: string
  objectives: string[]
  stages: Array<{
    etapa: string
    type: string
    activity: any
    route: string
  }>
  feedback: any
}

export default function LessonsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLesson | null>(null)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState('')
  const [randomSuggestions, setRandomSuggestions] = useState<string[]>([])
  const [formData, setFormData] = useState({
    topic: ''
  })

  // Sugestões randômicas para o campo de chat
  

  // Gerar sugestões randômicas apenas no cliente para evitar hidratação
  useEffect(() => {}, [])

  // Verificar se há query na URL
  useEffect(() => {
    const query = searchParams.get('query')
    if (query) {
      setFormData(prev => ({ ...prev, topic: query }))
    }
  }, [searchParams])

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setFormData(prev => ({ ...prev, topic: suggestion }))
    // Enviar automaticamente após definir a sugestão
    setTimeout(() => {
      handleGenerate()
    }, 100)
  }, [handleGenerate])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  const handleGenerate = useCallback(async () => {
    if (!formData.topic) {
      toast.error('Por favor, descreva o que você quer aprender')
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)
    setGenerationStatus('Iniciando geração da aula...')
    
    // Simular progresso da geração baseado em tempo médio de 20s
    const startTime = Date.now()
    const estimatedDuration = 20000 // 20 segundos
    
    // Mensagens de status baseadas no progresso
    const statusMessages = [
      { progress: 0, message: 'Analisando o tópico...' },
      { progress: 10, message: 'Identificando matéria e série...' },
      { progress: 20, message: 'Criando objetivos de aprendizagem...' },
      { progress: 30, message: 'Estruturando os 9 slides...' },
      { progress: 40, message: 'Gerando conteúdo explicativo...' },
      { progress: 50, message: 'Criando perguntas interativas...' },
      { progress: 60, message: 'Buscando imagens no Unsplash...' },
      { progress: 70, message: 'Finalizando estrutura da aula...' },
      { progress: 80, message: 'Preparando para exibição...' }
    ]
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / estimatedDuration) * 85, 85) // Máximo 85% até a resposta
      
      setGenerationProgress(progress)
      
      // Atualizar mensagem de status baseada no progresso
      const currentStatus = statusMessages
        .slice()
        .reverse()
        .find(status => progress >= status.progress)
      
      if (currentStatus) {
        setGenerationStatus(currentStatus.message)
      }
      
      if (progress >= 85) {
        clearInterval(progressInterval)
        setGenerationStatus('Finalizando...')
      }
    }, 200) // Atualizar a cada 200ms para suavidade
    
    try {
      const response = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          demoMode: true // Enable demo mode to bypass authentication
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar aula')
      }

      setGenerationProgress(100)
      setGenerationStatus('Aula gerada com sucesso!')
      setGeneratedLesson(data.lesson)
      
      // Save lesson to localStorage for demo mode
      if (data.lesson.demoMode) {
        localStorage.setItem(`demo_lesson_${data.lesson.id}`, JSON.stringify(data.lesson))
      }
      
      toast.success('Aula gerada com sucesso! (Modo Demo)')
      
    } catch (error) {
      console.error('Erro na geração:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar aula')
    } finally {
      clearInterval(progressInterval)
      setIsGenerating(false)
      setTimeout(() => {
        setGenerationProgress(0)
        setGenerationStatus('')
      }, 1000)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStartLesson = () => {
    if (generatedLesson) {
      // Store the generated lesson in localStorage for demo mode
      localStorage.setItem(`demo_lesson_${generatedLesson.id}`, JSON.stringify(generatedLesson))
      router.push(`/lessons/${generatedLesson.id}`)
    }
  }

  const handleSaveLesson = async () => {
    if (!generatedLesson) return

    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generatedLesson),
      })

      if (response.ok) {
        toast.success('Aula salva com sucesso!')
      } else {
        throw new Error('Erro ao salvar aula')
      }
    } catch (error) {
      toast.error('Erro ao salvar aula')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Melhorado */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <BookOpen className="h-10 w-10 text-blue-600" />
          Aulas Interativas
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Escolha uma sugestão ou digite sobre o que você gostaria de aprender
        </p>
        <p className="text-sm text-gray-500">
          Nossa IA criará uma aula personalizada e interativa para você
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          Sugestões são enviadas automaticamente!
        </div>
      </div>

      {/* Sugestões Randômicas - Mais Proeminentes */}
      <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 mb-8">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center gap-2 text-center justify-center text-xl">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            Sugestões Populares
          </CardTitle>
          <CardDescription className="text-center text-base">
            Clique em uma sugestão para gerar sua aula automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {randomSuggestions.length > 0 ? (
              randomSuggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-6 text-left border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-white hover:shadow-lg transition-all duration-300 group bg-white/70 backdrop-blur-sm"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isGenerating}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                      <span className="text-sm font-bold text-white">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-medium text-gray-800 group-hover:text-blue-800 leading-relaxed">
                        {suggestion}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Send className="h-3 w-3" />
                        <span>Clique para gerar</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))
            ) : (
              // Placeholder enquanto carrega
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="p-6 border-2 border-blue-200 rounded-xl bg-white/70 animate-pulse"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 mt-1"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Dica adicional */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Ou digite sua própria pergunta abaixo e pressione Enter
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-blue-600" />
          Gerador de Aulas com IA
        </h2>
        <p className="text-gray-600">
          Descreva o que você quer aprender e deixe a IA criar uma aula completa e interativa
        </p>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Modo Demo:</strong> Teste a funcionalidade sem necessidade de login. 
            As aulas geradas não serão salvas permanentemente.
          </p>
          <p className="text-blue-700 text-xs mt-2">
            💡 <strong>Dica:</strong> Descreva apenas o que você quer aprender! A IA irá inferir automaticamente a matéria, série e metodologia apropriadas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Gerar Aula
            </CardTitle>
            <CardDescription>
              Descreva o que você quer aprender e deixe a IA criar uma aula personalizada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">O que você quer aprender? *</Label>
              <Textarea
                id="topic"
                placeholder="Ex: Como funciona a fotossíntese nas plantas, A Segunda Guerra Mundial e suas consequências, Resolver equações de segundo grau, A história do Brasil colonial, Como calcular área de triângulos, O ciclo da água na natureza..."
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                onKeyPress={handleKeyPress}
                rows={6}
                className="resize-none"
              />
              <p className="text-sm text-gray-500">
                Seja específico! A IA irá inferir automaticamente a matéria, série e criar objetivos apropriados.
              </p>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Aula...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar Aula Interativa
                </>
              )}
            </Button>

            {/* Cronômetro de Progresso */}
            {isGenerating && (
              <div className="mt-6">
                <LessonProgress
                  progress={generationProgress}
                  status={generationStatus}
                  isGenerating={isGenerating}
                  className="min-h-[300px]"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generated Lesson Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Aula Gerada
            </CardTitle>
            <CardDescription>
              A IA inferiu automaticamente a matéria, série e metodologia
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedLesson ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{generatedLesson.title}</h3>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{generatedLesson.subject}</Badge>
                    <Badge variant="outline">{generatedLesson.level}º ano</Badge>
                    <Badge variant="outline" className="text-xs">
                      🤖 Inferido pela IA
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Objetivos:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {generatedLesson.objectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Etapas da Aula:</h4>
                  <div className="space-y-2">
                    {generatedLesson.stages.map((stage, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Badge variant="outline" className="text-xs">
                          {index + 1}
                        </Badge>
                        <span className="text-sm font-medium">{stage.etapa}</span>
                        <Badge variant="secondary" className="text-xs">
                          {stage.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleStartLesson} className="flex-1">
                    <Users className="mr-2 h-4 w-4" />
                    Iniciar Aula
                  </Button>
                  <Button onClick={handleSaveLesson} variant="outline">
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Gere uma aula para ver o preview aqui</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recursos das Aulas Interativas</CardTitle>
          <CardDescription>
            Inspirado nas melhores plataformas educacionais do mundo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">IA Avançada</h3>
              <p className="text-sm text-gray-600">
                Geração automática de conteúdo interativo com IA, inspirado no Curipod e Teachy.ai
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Gamificação</h3>
              <p className="text-sm text-gray-600">
                Sistema de pontos, badges e progresso, como no Nearpod e Genially
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Interatividade</h3>
              <p className="text-sm text-gray-600">
                Quizzes, desenhos, discussões e feedback em tempo real
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}