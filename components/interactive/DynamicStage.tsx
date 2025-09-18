'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import QuizComponent from './QuizComponent'
import NewQuizComponent from './NewQuizComponent'
import EnhancedQuizComponent from './EnhancedQuizComponent'
import ImprovedQuizComponent from './ImprovedQuizComponent'
import DrawingPrompt from './DrawingPrompt'
import AnimationSlide from './AnimationSlide'
import DiscussionBoard from './DiscussionBoard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Clock, Star, Trophy, XCircle } from 'lucide-react'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer'

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
  isLoading?: boolean
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
  lessonTheme = 'education',
  isLoading = false
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
    // Show loading state if isLoading is true
    if (isLoading) {
      return (
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700">Carregando conteúdo...</h3>
              <p className="text-gray-600">
                Preparando o slide {stageIndex + 1} para você.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Add defensive checks for stage and activity
    if (!stage) {
      console.error('[ERROR] Stage is undefined:', stage);
      return (
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <h3 className="text-lg font-semibold mb-2">Erro: Etapa não encontrada</h3>
              <p className="text-sm">A etapa não foi carregada corretamente.</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Handle missing activity by creating a default one
    let activity = stage.activity;
    if (!activity) {
      console.warn('[WARN] Stage missing activity property, creating default:', stage);
      activity = {
        component: 'ContentComponent',
        content: stage.content || 'Conteúdo não disponível para esta etapa.',
        time: 5,
        points: 5,
        imageUrl: stage.imageUrl || null
      };
    }

    // Handle missing component by defaulting to ContentComponent
    if (!activity.component) {
      console.warn('[WARN] Activity missing component, defaulting to ContentComponent:', activity);
      activity.component = 'ContentComponent';
    }

    // Handle missing content
    if (!activity.content && !activity.prompt) {
      console.warn('[WARN] Activity missing content, using stage title:', activity);
      activity.content = stage.etapa || 'Conteúdo não disponível';
    }

    console.log('[DEBUG] Rendering activity:', { component: activity.component, stage: stage.etapa });

    switch (activity.component) {
      case 'QuizComponent':
        // Convert old format to new format
        const enhancedQuestions = (activity.questions || []).map((q: any) => ({
          q: q.q || q.question || 'Pergunta não disponível',
          options: q.options || [
            q.a || 'Opção A',
            q.b || 'Opção B', 
            q.c || 'Opção C',
            q.d || 'Opção D'
          ],
          correct: q.correct || 0,
          explanation: q.explanation || 'Explicação não disponível'
        }))

        return (
          <ImprovedQuizComponent
            questions={enhancedQuestions}
            onComplete={(score, total, results) => handleStageComplete({ 
              score, 
              total, 
              results,
              type: 'quiz' 
            })}
            timeLimit={activity.time ? activity.time * 60 : 0}
            showExplanations={true}
            allowRetry={true}
            showHints={true}
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

      case 'ContentComponent':
        return (
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                {stage.etapa}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <MarkdownRenderer 
                  content={activity.content || ''} 
                  className="text-gray-700 leading-relaxed"
                />
              </div>
              
              {/* Show image if available */}
              {activity.imageUrl && (
                <div className="mt-6">
                  <img 
                    src={activity.imageUrl} 
                    alt={stage.etapa}
                    className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                  />
                </div>
              )}
              
              {/* Auto-complete after a short delay for content slides */}
              <div className="mt-6 text-center">
                <Button
                  onClick={() => handleStageComplete({ type: 'content' })}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
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

      case 'ClosingComponent':
      case 'closing':
        return (
          <Card className="w-full max-w-4xl mx-auto border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-green-800 text-center">
                🎉 {stage.etapa}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none text-center">
                <MarkdownRenderer 
                  content={activity.content || 'Parabéns! Você completou esta aula com sucesso!'} 
                  className="text-green-700 leading-relaxed"
                />
              </div>
              
              {/* Show image if available */}
              {activity.imageUrl && (
                <div className="mt-6">
                  <img 
                    src={activity.imageUrl} 
                    alt={stage.etapa}
                    className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                  />
                </div>
              )}
              
              {/* Completion button */}
              <div className="mt-6 text-center">
                <Button
                  onClick={() => handleStageComplete({ type: 'closing' })}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                >
                  Finalizar Aula
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      default:
        console.warn('[WARN] Unknown activity component:', activity.component);
        console.warn('[WARN] Full activity data:', activity);
        console.warn('[WARN] Full stage data:', stage);
        
        // Try to render as ContentComponent if it's a content-type slide
        if (activity.component === 'ContentComponent' || 
            activity.component === 'content' || 
            activity.component === 'explanation' ||
            !activity.component) {
          return (
            <Card className="w-full max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {stage.etapa}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose max-w-none">
                  <MarkdownRenderer 
                    content={activity.content || ''} 
                    className="text-gray-700 leading-relaxed"
                  />
                </div>
                
                {/* Show image if available */}
                {activity.imageUrl && (
                  <div className="mt-6">
                    <img 
                      src={activity.imageUrl} 
                      alt={stage.etapa}
                      className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                    />
                  </div>
                )}
                
                {/* Auto-complete after a short delay for content slides */}
                <div className="mt-6 text-center">
                  <Button
                    onClick={() => handleStageComplete({ type: 'content' })}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Continuar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        }
        
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="text-center text-orange-600">
                <h3 className="text-lg font-semibold mb-2">Componente não suportado</h3>
                <p className="text-sm mb-4">Tipo: {activity.component}</p>
                <div className="text-xs text-gray-500 mb-4">
                  <p>Debug info:</p>
                  <p>Stage: {stage.etapa}</p>
                  <p>Activity component: {activity.component}</p>
                  <p>Activity content: {activity.content ? 'Present' : 'Missing'}</p>
                </div>
                {activity.content && (
                  <div className="prose max-w-none text-left">
                    <p>{activity.content}</p>
                  </div>
                )}
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
