'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import QuizComponent from './QuizComponent'
import NewQuizComponent from './NewQuizComponent'
import DrawingPrompt from './DrawingPrompt'
import AnimationSlide from './AnimationSlide'
import DiscussionBoard from './DiscussionBoard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Star, Trophy, XCircle } from 'lucide-react'
import { randomizeQuizQuestions } from '@/lib/quiz-randomization'

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
  lessonTheme = 'education'
}: DynamicStageProps) {
  const [isCompleted, setIsCompleted] = useState(false)
  const [stageResult, setStageResult] = useState<any>(null)
  const [startTime] = useState(Date.now())

  const handleStageComplete = (result: any) => {
    if (!isCompleted) {
      setIsCompleted(true)
      setStageResult(result)
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
        // First randomize the quiz questions to shuffle the options
        const originalQuestions = activity.questions || []
        const randomizedQuestions = randomizeQuizQuestions(originalQuestions)
        
        // Transform randomized questions to the format expected by NewQuizComponent
        const transformedQuestions = randomizedQuestions.map((q: any, index: number) => {
          console.log(`🔍 DEBUG Randomized Question ${index + 1}:`, {
            randomizedCorrect: q.correct,
            randomizedType: typeof q.correct,
            randomizedOptions: q.options,
            originalCorrect: q.originalCorrect
          });

          // Normalize options by stripping any leading letters like "A) "
          const cleanOption = (text: string | undefined, fallback: string) => {
            const raw = (text || fallback)
            return raw.replace(/^[A-D]\)\s*/, '').trim()
          }

          // Determine correct answer letter from q.correct which should be an index after randomize
          let correctAnswer: 'a' | 'b' | 'c' | 'd' = 'a'
          
          // After randomization, q.correct should always be a number (0-3)
          if (typeof q.correct === 'number' && q.correct >= 0 && q.correct <= 3) {
            correctAnswer = ['a', 'b', 'c', 'd'][q.correct] as 'a' | 'b' | 'c' | 'd'
            console.log(`🔍 DEBUG: Question ${index + 1} - Correct index: ${q.correct}, Correct letter: ${correctAnswer}`)
          } else {
            // Fallback for edge cases - log warning and default to 'a'
            console.warn(`⚠️ Invalid correct answer after randomization: "${q.correct}" (type: ${typeof q.correct}). Defaulting to 'a'.`)
            correctAnswer = 'a'
          }

          const transformed = {
            question: q.q || q.question || 'Pergunta não disponível',
            options: {
              a: cleanOption(q.options?.[0], 'Opção A'),
              b: cleanOption(q.options?.[1], 'Opção B'),
              c: cleanOption(q.options?.[2], 'Opção C'),
              d: cleanOption(q.options?.[3], 'Opção D')
            },
            correct: correctAnswer,
            explanation: (q.explanation || '').trim() || 'Explicação não disponível'
          }

          console.log(`🔍 DEBUG: Final transformed question ${index + 1}:`, {
            correct: transformed.correct,
            options: transformed.options
          })

          return transformed
        })
        
        return (
          <NewQuizComponent
            questions={transformedQuestions}
            onComplete={(score, total) => handleStageComplete({ score, total, total: total, type: 'quiz' })}
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
            title={stage.etapa}
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
      {/* Stage Header */}
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
          
          {/* Progress removed as requested */}
        </CardHeader>
      </Card>

      {/* Activity Content */}
      <div className="mb-6">
        {renderActivity()}
      </div>

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <Button
              onClick={onPrevious}
              disabled={!canGoPrevious}
              variant="outline"
            >
              Anterior
            </Button>
            
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
            
            <Button
              onClick={handleNext}
              disabled={!canGoNext && !isCompleted && !['OpenQuestion', 'AnimationSlide', 'DiscussionBoard', 'UploadTask'].includes(stage.activity.component)}
            >
              {stageIndex === totalStages - 1 ? 'Finalizar' : 'Próxima'}
            </Button>
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
    </motion.div>
  )
}
