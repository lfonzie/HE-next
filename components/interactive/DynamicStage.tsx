'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import EnhancedQuizComponent from './EnhancedQuizComponent'
import DrawingPrompt from './DrawingPrompt'
import AnimationSlide from './AnimationSlide'
import DiscussionBoard from './DiscussionBoard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Star, Trophy, XCircle, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react'

interface StageActivity {
  component: string
  content?: string
  prompt?: string
  questions?: Array<{
    q: string
    options: string[]
    correct: number
    explanation?: string
  }>
  media?: string[]
  animationSteps?: Array<{
    id: string
    title: string
    description: string
    duration: number
    element?: string
  }>
  prompts?: string[]
  time?: number
  points?: number
  feedback?: string
  realTime?: boolean
}

interface Stage {
  etapa: string
  type: string
  activity: StageActivity
  route: string
}

interface DynamicStageProps {
  stage: Stage
  stageIndex: number
  totalStages: number
  onComplete: (stageIndex: number, result: any) => void
  onNext: () => void
  onPrevious: () => void
  canGoNext?: boolean
  canGoPrevious?: boolean
  timeSpent?: number
  pointsEarned?: number
  lessonTheme?: string
  lessonData?: {
    title: string
    totalPoints: number
    totalTimeSpent: number
    stageResults: any[]
  }
  onRestart?: () => void
  onNewLesson?: () => void
}

export default function DynamicStage({
  stage,
  stageIndex,
  totalStages,
  onComplete,
  onNext,
  onPrevious,
  canGoNext = false,
  canGoPrevious = true,
  timeSpent = 0,
  pointsEarned = 0,
  lessonTheme = 'geral',
  lessonData,
  onRestart,
  onNewLesson
}: DynamicStageProps) {
  const [isCompleted, setIsCompleted] = useState(false)
  const [stageResult, setStageResult] = useState<any>(null)
  const [startTime] = useState(Date.now())

  // Memoize quiz questions to prevent re-processing on re-renders
  const processedQuizQuestions = useMemo(() => {
    console.log('🔍 DEBUG DynamicStage - useMemo triggered for stage:', stageIndex)
    console.log('🔍 DEBUG DynamicStage - stage.activity.component:', stage.activity.component)
    console.log('🔍 DEBUG DynamicStage - stage.activity.questions:', stage.activity.questions)
    
    if (stage.activity.component === 'QuizComponent' && stage.activity.questions) {
      const originalQuestions = stage.activity.questions || []
      
      console.log('🔍 DEBUG Original questions from API:', originalQuestions)
      
      // Transform questions to the format expected by EnhancedQuizComponent
      return originalQuestions.map((q: any, index: number) => {
        console.log(`🔍 DEBUG Processing Question ${index + 1}:`, {
          originalCorrect: q.correct,
          originalType: typeof q.correct,
          originalOptions: q.options
        });

        // Normalize options by stripping any leading letters like "A) "
        const cleanOption = (text: string | undefined, fallback: string) => {
          const raw = (text || fallback)
          return raw.replace(/^[A-D]\)\s*/, '').trim()
        }

        // Determine correct answer - EnhancedQuizComponent expects string ('A','B','C','D')
        let correctAnswer: 'A' | 'B' | 'C' | 'D' = 'A'
        
        if (typeof q.correct === 'number' && q.correct >= 0 && q.correct <= 3) {
          // Convert number to letter
          const letters = ['A', 'B', 'C', 'D']
          correctAnswer = letters[q.correct] as 'A' | 'B' | 'C' | 'D'
          console.log(`🔍 DEBUG: Question ${index + 1} - Correct index: ${q.correct} -> ${correctAnswer}`)
        } else if (typeof q.correct === 'string') {
          // If it's a string, normalize it
          const normalized = q.correct.toUpperCase()
          if (['A', 'B', 'C', 'D'].includes(normalized)) {
            correctAnswer = normalized as 'A' | 'B' | 'C' | 'D'
            console.log(`🔍 DEBUG: Question ${index + 1} - Correct string: ${q.correct}`)
          } else {
            console.warn(`⚠️ Invalid correct answer string: "${q.correct}". Defaulting to 'A'.`)
            correctAnswer = 'A'
          }
        } else {
          console.warn(`⚠️ Invalid correct answer type: ${typeof q.correct}. Defaulting to 'A'.`)
          correctAnswer = 'A'
        }

        const transformed = {
          id: `q${index + 1}`,
          question: q.q || q.question || 'Pergunta não disponível',
          options: {
            A: cleanOption(q.options?.[0], 'Opção A'),
            B: cleanOption(q.options?.[1], 'Opção B'),
            C: cleanOption(q.options?.[2], 'Opção C'),
            D: cleanOption(q.options?.[3], 'Opção D')
          },
          correctAnswer: correctAnswer,
          explanation: (q.explanation || '').trim() || 'Explicação não disponível',
          difficulty: 'MEDIUM' as const,
          points: 10,
          timeEstimate: 60
        }

        console.log(`🔍 DEBUG: Final transformed question ${index + 1}:`, {
          correct: transformed.correct,
          options: transformed.options
        })

        return transformed
      })
    }
    return null
  }, [stage.activity.component, stage.activity.questions])

  const handleStageComplete = (result: any) => {
    console.log('🔍 DEBUG DynamicStage - handleStageComplete called with result:', result)
    console.log('🔍 DEBUG DynamicStage - isCompleted:', isCompleted)
    
    if (!isCompleted) {
      setIsCompleted(true)
      setStageResult(result)
      console.log('🔍 DEBUG DynamicStage - calling onComplete with stageIndex:', stageIndex, 'result:', result)
      onComplete(stageIndex, result)
    }
  }

  const handleNext = () => {
    // Allow navigation for these component types without requiring completion
    const alwaysAllowNext = [
      'OpenQuestion',
      'AnimationSlide',
      'DiscussionBoard',
      'UploadTask'
    ]
    
    // For QuizComponent, only allow navigation if the quiz is completed
    if (stage.activity.component === 'QuizComponent') {
      if (isCompleted) {
        onNext()
      }
      // Don't navigate if quiz is not completed
      return
    }
    
    // For other components, allow navigation if completed or always allowed
    if (isCompleted || alwaysAllowNext.includes(stage.activity.component)) {
      onNext()
    }
  }

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStageIcon = (type: string) => {
    switch (type) {
      case 'quiz': return '🧠'
      case 'interactive': return '🎮'
      case 'visual': return '👁️'
      case 'debate': return '💬'
      case 'assessment': return '📝'
      case 'project': return '🎯'
      default: return '📚'
    }
  }

  const getStageColor = (type: string) => {
    switch (type) {
      case 'quiz': return 'bg-blue-100 text-blue-800'
      case 'interactive': return 'bg-green-100 text-green-800'
      case 'visual': return 'bg-purple-100 text-purple-800'
      case 'debate': return 'bg-orange-100 text-orange-800'
      case 'assessment': return 'bg-red-100 text-red-800'
      case 'project': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderActivity = () => {
    const { activity } = stage

    switch (activity.component) {
      case 'QuizComponent':
        // Use the memoized processed questions to prevent re-processing on re-renders
        if (!processedQuizQuestions) {
          return (
            <Card className="w-full max-w-2xl mx-auto">
              <CardContent className="text-center py-8">
                <div className="text-gray-500">
                  <p className="text-lg mb-2">Nenhuma questão disponível</p>
                  <p className="text-sm">Este quiz não possui questões para exibir.</p>
                </div>
              </CardContent>
            </Card>
          )
        }
        
        return (
          <EnhancedQuizComponent
            questions={processedQuizQuestions}
            onComplete={(score, total, results) => handleStageComplete({ score, total, total: total, type: 'quiz' })}
            timeLimit={activity.time ? activity.time * 60 : 0}
            showExplanations={true}
            allowRetry={true}
          />
        )

      case 'DrawingPrompt':
        return (
          <DrawingPrompt
            prompt={activity.prompt || 'Desenhe sua resposta'}
            onSubmit={(drawingData) => handleStageComplete({ drawingData, type: 'drawing' })}
            timeLimit={activity.time ? activity.time * 60 : 0}
            allowUpload={true}
            showColorPicker={true}
          />
        )

      case 'AnimationSlide':
        return (
          <AnimationSlide
            title="" // Remove duplicate title - already shown in DynamicStage header
            content={activity.content || ''}
            media={activity.media || []}
            animationSteps={activity.animationSteps || []}
            autoPlay={false}
            showControls={true}
            allowFullscreen={true}
            onComplete={() => handleStageComplete({ type: 'animation' })}
            isFirstSlide={stageIndex === 0}
            isLastSlide={stageIndex === totalStages - 1}
            lessonTheme={lessonTheme}
            imageUrl={activity.imageUrl} // Pass dynamic image URL
          />
        )

      case 'DiscussionBoard':
        return (
          <DiscussionBoard
            prompts={activity.prompts || [activity.prompt || 'Compartilhe seus pensamentos']}
            realTime={activity.realTime || false}
            allowReplies={true}
            showLikes={true}
            moderationEnabled={false}
            onPost={(post) => handleStageComplete({ post, type: 'discussion' })}
          />
        )

      case 'OpenQuestion':
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">{activity.prompt}</h3>
              <div className="space-y-4">
                <textarea
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={4}
                  placeholder="Digite sua resposta aqui..."
                  onChange={(e) => {
                    if (e.target.value.trim()) {
                      handleStageComplete({ 
                        answer: e.target.value, 
                        type: 'open_question' 
                      })
                    }
                  }}
                />
                <div className="text-sm text-gray-500">
                  💡 Sua resposta será salva automaticamente conforme você digita
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'MixedQuiz':
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Avaliação Mista</h3>
              <div className="space-y-4">
                {activity.questions?.map((question: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">
                      {question.type === 'mcq' ? 'Múltipla Escolha' : 'Questão Aberta'}
                    </h4>
                    <p className="text-sm text-gray-600">{question.q || question.prompt}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case 'UploadTask':
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tarefa de Upload</h3>
              <p className="mb-4">{activity.prompt}</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    if (files.length > 0) {
                      handleStageComplete({ 
                        files: files.map(f => f.name), 
                        type: 'upload' 
                      })
                    }
                  }}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-700"
                >
                  Clique para fazer upload de arquivos
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Formatos aceitos: Imagens, Vídeos, PDF, Word
                </p>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">{stage.etapa}</h3>
              <div className="prose max-w-none">
                <p>{activity.content}</p>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  // Progress bar removed from stage header

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Stage Header - Apenas título principal da lição */}
      {lessonData && stageIndex === 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{lessonData.title}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {totalStages} etapas
                  </div>
                </div>
              </CardTitle>
            
            <div className="flex items-center gap-4">
              {/* Estatísticas da lição no título principal */}
            </div>
          </div>
          
          {/* Progress removed as requested */}
        </CardHeader>
      </Card>
      )}

      {/* Stage info for non-first stages */}
      {stageIndex > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">{getStageIcon(stage.type)}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span>{stage.etapa}</span>
                    <Badge className={getStageColor(stage.type)}>
                      {stage.type}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Etapa {stageIndex + 1} de {totalStages}
                  </div>
                </div>
              </CardTitle>
              
              <div className="flex items-center gap-4">
                {pointsEarned > 0 && (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Star className="h-4 w-4" />
                    <span className="text-sm font-medium">{pointsEarned}</span>
                  </div>
                )}
                
                {timeSpent > 0 && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{formatTime(timeSpent)}</span>
                  </div>
                )}
                
                {isCompleted && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Concluído</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Activity Content */}
      <div className="mb-6">
        {renderActivity()}
      </div>

      {/* Stage Info - apenas informações, sem botões de navegação */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-center items-center">
            <div className="flex items-center gap-2">
              {stage.activity.time && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {stage.activity.time}min
                </Badge>
              )}
              {stage.activity.points && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  {stage.activity.points}pts
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      {isCompleted && stage.activity.feedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          {(() => {
            // Verificar se é um quiz e se a resposta está correta
            const isQuiz = stage.activity.component === 'QuizComponent'
            const isCorrectAnswer = isQuiz && stageResult?.type === 'quiz' 
              ? stageResult.score > 0 // Se acertou pelo menos uma pergunta
              : true // Para outros tipos de atividade, sempre mostrar feedback positivo
            
            if (isCorrectAnswer) {
              return (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800 mb-1">Ótimo trabalho!</h4>
                        <p className="text-sm text-green-700">{stage.activity.feedback}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            } else {
              return (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-800 mb-1">Continue praticando!</h4>
                        <p className="text-sm text-orange-700">
                          Você acertou {stageResult?.score || 0} de {stageResult?.total || 0} questões. 
                          Revise o conteúdo e tente novamente!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            }
          })()}
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <Button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Anterior
        </Button>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {stageIndex + 1} de {totalStages}
          </span>
          
          {onRestart && (
            <Button
              onClick={onRestart}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Reiniciar
            </Button>
          )}
          
          {onNewLesson && (
            <Button
              onClick={onNewLesson}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Nova Aula
            </Button>
          )}
        </div>

        <Button
          onClick={handleNext}
          disabled={
            stage.activity.component === 'QuizComponent' 
              ? !isCompleted 
              : !canGoNext
          }
          className="flex items-center gap-2"
        >
          {stageIndex === totalStages - 1 ? 'Finalizar' : 'Próxima'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}
