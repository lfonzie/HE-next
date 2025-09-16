'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import QuizComponent from './QuizComponent'
import DrawingPrompt from './DrawingPrompt'
import AnimationSlide from './AnimationSlide'
import DiscussionBoard from './DiscussionBoard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Clock, Star, Trophy } from 'lucide-react'

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
    setIsCompleted(true)
    setStageResult(result)
    onComplete(stageIndex, result)
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
        return (
          <QuizComponent
            questions={activity.questions || []}
            onComplete={(score, total) => handleStageComplete({ score, total, type: 'quiz' })}
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
            media={activity.imageUrl ? [activity.imageUrl] : (activity.media || [])}
            animationSteps={activity.animationSteps || []}
            autoPlay={false}
            showControls={true}
            allowFullscreen={true}
            onComplete={() => handleStageComplete({ type: 'animation' })}
            isFirstSlide={stageIndex === 0}
            isLastSlide={stageIndex === totalStages - 1}
            lessonTheme={lessonTheme}
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

  const progress = ((stageIndex + 1) / totalStages) * 100

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
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso da Aula</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
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
        </motion.div>
      )}
    </motion.div>
  )
}
