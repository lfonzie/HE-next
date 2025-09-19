'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle, Clock, Trophy, BookOpen, Play, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import LessonProgress from '@/components/aulas/LessonProgress'

interface LessonData {
  id: string
  title: string
  subject: string
  level: string
  duration: string
  points: number
  progress: string
  stages: Array<{
    etapa: number
    title: string
    type: string
    completed: boolean
    points: number
  }>
}

export default function AulasEnhancedPage() {
  const [topic, setTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [currentStage, setCurrentStage] = useState(0)
  const [error, setError] = useState('')

  const generateLesson = async () => {
    if (!topic.trim()) {
      setError('Por favor, insira um tópico para a aula')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      // 1. Gerar esqueleto da aula
      const skeletonResponse = await fetch('/api/aulas/skeleton', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      })

      if (!skeletonResponse.ok) {
        throw new Error('Erro ao gerar esqueleto da aula')
      }

      const skeletonData = await skeletonResponse.json()
      const skeleton = skeletonData.skeleton

      // 2. Gerar os 2 primeiros slides
      const initialSlidesResponse = await fetch('/api/aulas/initial-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      })

      if (!initialSlidesResponse.ok) {
        throw new Error('Erro ao gerar slides iniciais')
      }

      const initialSlidesData = await initialSlidesResponse.json()
      const initialSlides = initialSlidesData.slides

      // 3. Atualizar esqueleto com slides iniciais
      const updatedStages = skeleton.stages.map((stage: any, index: number) => {
        if (index < 2 && initialSlides[index]) {
          return {
            ...stage,
            content: initialSlides[index].content,
            imageUrl: initialSlides[index].imageUrl,
            imagePrompt: initialSlides[index].imageQuery
          }
        }
        return stage
      })

      const lessonData: LessonData = {
        ...skeleton,
        stages: updatedStages
      }

      setLesson(lessonData)
      setCurrentStage(0)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsGenerating(false)
    }
  }

  const loadNextSlide = async (slideNumber: number) => {
    console.log('🔍 DEBUG loadNextSlide called with slideNumber:', slideNumber)
    console.log('🔍 DEBUG current lesson:', lesson)
    console.log('🔍 DEBUG current topic:', topic)
    
    if (!lesson || !topic) return

    try {
      const previousSlides = lesson.stages
        .filter((_, index) => index < slideNumber - 1)
        .map(stage => ({
          title: stage.title,
          content: stage.content || ''
        }))

      const requestBody = {
        topic,
        slideNumber,
        previousSlides
      };
      
      console.log('🔍 DEBUG loadNextSlide request body:', requestBody)
      
      // Validate request body
      if (!topic || !slideNumber) {
        throw new Error('Topic and slide number are required');
      }
      
      console.log('🔍 DEBUG calling /api/aulas/next-slide API')
      
      const response = await fetch('/api/aulas/next-slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar próximo slide')
      }

      const data = await response.json()
      const newSlide = data.slide

      // Atualizar a etapa correspondente
      const updatedStages = lesson.stages.map((stage, index) => {
        if (index === slideNumber - 1) {
          return {
            ...stage,
            content: newSlide.content,
            imageUrl: newSlide.imageUrl,
            imagePrompt: newSlide.imageQuery,
            questions: newSlide.questions
          }
        }
        return stage
      })

      setLesson({
        ...lesson,
        stages: updatedStages
      })

    } catch (err) {
      console.error('Erro ao carregar próximo slide:', err)
    }
  }

  const completeStage = async (etapa: number) => {
    console.log('🔍 DEBUG completeStage called with etapa:', etapa)
    console.log('🔍 DEBUG current lesson:', lesson)
    
    if (!lesson) return

    // Marcar etapa como concluída
    const updatedStages = lesson.stages.map(stage => {
      if (stage.etapa === etapa) {
        console.log('🔍 DEBUG marking stage as completed:', stage)
        return { ...stage, completed: true, points: stage.type === 'Avaliação' ? 0 : 5 }
      }
      return stage
    })

    console.log('🔍 DEBUG updated stages:', updatedStages)

    setLesson({
      ...lesson,
      stages: updatedStages
    })

    // Salvar progresso no Neo4j
    try {
      await fetch('/api/aulas/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          etapa,
          completed: true,
          points: 5
        })
      })
    } catch (err) {
      console.error('Erro ao salvar progresso:', err)
    }

    // Carregar próximo slide se necessário
    if (etapa < 14) {
      setTimeout(() => {
        loadNextSlide(etapa + 1)
      }, 1000)
    }
  }

  const handleStageClick = (etapa: number) => {
    setCurrentStage(etapa - 1)
    
    // Carregar slide se não estiver carregado
    const stage = lesson?.stages[etapa - 1]
    if (stage && !stage.content) {
      loadNextSlide(etapa)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Sistema de Aulas Aprimorado</h1>
        <p className="text-lg text-gray-600">
          Estrutura mínima de 14 etapas com carregamento progressivo e salvamento no Neo4j
        </p>
      </div>

      {!lesson ? (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Criar Nova Aula</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Tópico da Aula</Label>
              <Input
                id="topic"
                placeholder="Ex: Física dos esportes, História do Brasil, Matemática financeira..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && generateLesson()}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            <Button 
              onClick={generateLesson} 
              disabled={!topic.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando Aula...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Gerar Aula
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progresso da Aula */}
          <div className="lg:col-span-1">
            <LessonProgress
              lessonId={lesson.id}
              title={lesson.title}
              duration={lesson.duration}
              points={lesson.points}
              progress={lesson.progress}
              stages={lesson.stages}
              onStageClick={handleStageClick}
            />
          </div>

          {/* Conteúdo da Etapa Atual */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {lesson.stages[currentStage] && (
                <motion.div
                  key={currentStage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {lesson.stages[currentStage].completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                        {lesson.stages[currentStage].title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Etapa {lesson.stages[currentStage].etapa}
                        </Badge>
                        <Badge 
                          variant="secondary"
                          className={lesson.stages[currentStage].type === 'Avaliação' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}
                        >
                          {lesson.stages[currentStage].type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {lesson.stages[currentStage].content ? (
                        <div className="space-y-4">
                          <div className="prose max-w-none">
                            {lesson.stages[currentStage].content.split('\n\n').map((paragraph, index) => (
                              <p key={index} className="mb-4">{paragraph}</p>
                            ))}
                          </div>
                          
                          {lesson.stages[currentStage].imageUrl && (
                            <div className="mt-6">
                              <img 
                                src={lesson.stages[currentStage].imageUrl} 
                                alt={lesson.stages[currentStage].title}
                                className="w-full rounded-lg shadow-md"
                              />
                            </div>
                          )}

                          {!lesson.stages[currentStage].completed && (
                            <div className="mt-6">
                              <Button 
                                onClick={() => completeStage(lesson.stages[currentStage].etapa)}
                                className="w-full"
                              >
                                Marcar como Concluída
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-500">Carregando conteúdo...</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navegação */}
            <div className="flex justify-between mt-6">
              <Button
                onClick={() => setCurrentStage(Math.max(0, currentStage - 1))}
                disabled={currentStage === 0}
                variant="outline"
              >
                Anterior
              </Button>
              <Button
                onClick={() => setCurrentStage(Math.min(lesson.stages.length - 1, currentStage + 1))}
                disabled={currentStage === lesson.stages.length - 1}
              >
                Próxima
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}