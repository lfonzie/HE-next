'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

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

interface GenerationState {
  isGenerating: boolean
  generatedLesson: GeneratedLesson | null
  pacingMetrics: any
  pacingWarnings: string[]
  generationProgress: number
  generationStatus: string
  startTime: number | null
  elapsedTime: number
}

export function useAulaGeneration() {
  const [formData, setFormData] = useState<FormData>({ topic: '' })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    generatedLesson: null,
    pacingMetrics: null,
    pacingWarnings: [],
    generationProgress: 0,
    generationStatus: '',
    startTime: null,
    elapsedTime: 0
  })

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
  const generateLesson = useCallback(async (topicOverride: string | null = null) => {
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

    setGenerationState(prev => ({
      ...prev,
      isGenerating: true,
      generationProgress: 0,
      generationStatus: 'Iniciando geração da aula...',
      generatedLesson: null,
      startTime: Date.now()
    }))

    try {
      // Step 1: Generate skeleton (immediate)
      setGenerationState(prev => ({
        ...prev,
        generationProgress: 10,
        generationStatus: 'Gerando estrutura da aula...'
      }))
      
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
      setGenerationState(prev => ({
        ...prev,
        generationProgress: 30,
        generationStatus: 'Gerando primeiros slides...'
      }))
      
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
      setGenerationState(prev => ({
        ...prev,
        generationProgress: 60,
        generationStatus: 'Preparando aula inicial...'
      }))
      
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

      setGenerationState(prev => ({
        ...prev,
        generationProgress: 80,
        generationStatus: 'Carregando todos os slides...'
      }))
      
      // Step 4: Load ALL remaining slides before showing the lesson
      await loadRemainingSlides(topic, lessonData)
      
      setGenerationState(prev => ({
        ...prev,
        generationProgress: 100,
        generationStatus: 'Aula completa pronta!'
      }))
      
      toast.success('Aula completa carregada!')

    } catch (error) {
      console.error('Error generating lesson:', error)
      toast.error(`Erro ao gerar aula: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      setGenerationState(prev => ({
        ...prev,
        generationProgress: 0,
        generationStatus: 'Erro na geração'
      }))
    } finally {
      setGenerationState(prev => ({
        ...prev,
        isGenerating: false
      }))
    }
  }, [formData.topic, formData.schoolId, validateForm])

  // Background loading of remaining slides - AGUARDA TODOS OS SLIDES CARREGAREM
  const loadRemainingSlides = useCallback(async (topic: string, lessonData: any) => {
    try {
      setGenerationState(prev => ({
        ...prev,
        generationStatus: 'Carregando todos os slides...'
      }))
      
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
        if (result.status === 'fulfilled' && result.value.success) {
          const slide = result.value.slide
          loadedSlides.push(slide)
          
          // Update the corresponding stage
          if (updatedStages[slideNumber - 1]) {
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
          }
        }
      })

      // Update the lesson with all loaded slides
      setGenerationState(prev => ({
        ...prev,
        generatedLesson: {
          ...prev.generatedLesson,
          stages: updatedStages,
          slides: loadedSlides,
          metadata: {
            ...prev.generatedLesson?.metadata,
            status: 'complete',
            allSlidesLoaded: true
          }
        } as GeneratedLesson
      }))

      setGenerationState(prev => ({
        ...prev,
        generationStatus: 'Todos os slides carregados!'
      }))
      toast.success('Aula completa carregada!')
      
    } catch (error) {
      console.error('Error loading remaining slides:', error)
      setGenerationState(prev => ({
        ...prev,
        generationStatus: 'Erro ao carregar slides restantes'
      }))
    }
  }, [formData.schoolId])

  // Enhanced suggestion handler with analytics
  const handleSuggestionClick = useCallback(async (suggestion: { text: string; category: string; level: string }) => {
    setFormData({ topic: suggestion.text })
    setFormErrors({})
    
    // Simulate analytics tracking
    console.log('Suggestion clicked:', { text: suggestion.text, category: suggestion.category })
    
    // Auto-generate after suggestion click
    await generateLesson(suggestion.text)
  }, [generateLesson])

  // Enhanced form submission handler
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !generationState.isGenerating) {
      e.preventDefault()
      generateLesson()
    }
  }, [generationState.isGenerating, generateLesson])

  const resetGeneration = useCallback(() => {
    setGenerationState({
      isGenerating: false,
      generatedLesson: null,
      pacingMetrics: null,
      pacingWarnings: [],
      generationProgress: 0,
      generationStatus: '',
      startTime: null,
      elapsedTime: 0
    })
    setFormData({ topic: '' })
    setFormErrors({})
  }, [])

  return {
    // State
    formData,
    formErrors,
    generationState,
    
    // Actions
    setFormData,
    generateLesson,
    handleSuggestionClick,
    handleKeyPress,
    resetGeneration,
    validateForm,
    
    // Computed
    isGenerating: generationState.isGenerating,
    generatedLesson: generationState.generatedLesson,
    generationProgress: generationState.generationProgress,
    generationStatus: generationState.generationStatus,
    elapsedTime: generationState.elapsedTime
  }
}


