"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Timer, BookOpen, Target, Play, Pause, RotateCcw, Clock, CheckCircle } from 'lucide-react'
import { useEnem } from '@/hooks/useEnem'
import { formatTime } from '@/lib/utils'
import { EnemQuestion } from '@/types'
import { EnemResults } from './EnemResults'
import { QuestionRenderer } from './QuestionRenderer'
import { AlternativeButton } from './AlternativeButton'
import { SimulatorErrorBoundary } from './SimulatorErrorBoundary'
import { sanitizeQuestion, SanitizedQuestion } from '@/lib/enem-data-sanitizer'

// Função para determinar o texto do chip baseado na origem da pergunta
function getQuestionSourceChip(question: any): { text: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  // Check metadata first for explicit source information
  if (question.metadata?.source) {
    switch (question.metadata.source) {
      case 'DATABASE':
        return {
          text: `ENEM ${question.year || question.metadata.original_year || 'API'}`,
          variant: "default"
        }
      case 'LOCAL_DATABASE':
        return {
          text: `ENEM ${question.year || question.metadata.original_year || 'Local'}`,
          variant: "default"
        }
      case 'AI':
        return {
          text: "IA",
          variant: "secondary"
        }
    }
  }
  
  // Check if it's an official ENEM question
  if (question.metadata?.is_official_enem) {
    return {
      text: `ENEM ${question.year || question.metadata.original_year || 'API'}`,
      variant: "default"
    }
  }
  
  // Check if it's AI generated
  if (question.metadata?.is_ai_generated) {
    return {
      text: "IA",
      variant: "secondary"
    }
  }
  
  // Se tem year definido e não é o ano atual, provavelmente é da API do ENEM
  if (question.year && question.year !== new Date().getFullYear()) {
    return {
      text: `ENEM ${question.year}`,
      variant: "default"
    }
  }
  
  // Se tem ID que começa com "enem_" ou "ai_generated_", podemos inferir a origem
  if (question.id) {
    if (question.id.startsWith('enem_')) {
      const year = question.year || 'API'
      return {
        text: `ENEM ${year}`,
        variant: "default"
      }
    }
    if (question.id.startsWith('ai_generated_') || question.id.startsWith('generated_')) {
      return {
        text: "IA",
        variant: "secondary"
      }
    }
  }
  
  // Se tem source definido na resposta da API
  if (question.source) {
    if (question.source === 'enem.dev' || question.source === 'api' || question.source === 'DATABASE') {
      return {
        text: `ENEM ${question.year || 'API'}`,
        variant: "default"
      }
    }
    if (question.source === 'ai' || question.source === 'generated' || question.source === 'AI') {
      return {
        text: "IA",
        variant: "secondary"
      }
    }
  }
  
  // Se tem explanation que menciona IA
  if (question.explanation && question.explanation.includes('gerada por IA')) {
    return {
      text: "IA",
      variant: "secondary"
    }
  }
  
  // Default: assumir que é IA se não conseguir determinar
  return {
    text: "IA",
    variant: "secondary"
  }
}

interface EnemSimulatorProps {
  area: string
  numQuestions: number
  duration: number
  useRealQuestions?: boolean
  year?: number
  useProgressiveLoading?: boolean
}

export function EnemSimulator({ area, numQuestions, duration, useRealQuestions = true, year, useProgressiveLoading = true }: EnemSimulatorProps) {
  const sessionId = `session_${typeof window !== 'undefined' ? Date.now() : 0}`;
  const {
    questions,
    currentQuestion,
    answers,
    timeLeft,
    isActive,
    isFinished,
    score,
    isLoading,
    useProgressiveLoading: hookUseProgressiveLoading,
    setUseProgressiveLoading,
    loadQuestions,
    loadRealQuestions,
    loadQuestionsProgressive,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    finishSimulation,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    resetSimulation,
    setTimeLeft,
    // Estado do carregamento progressivo
    progressiveLoading,
    getCurrentProgressiveQuestion,
    getAvailableProgressiveQuestions,
    canNavigateToProgressiveQuestion
  } = useEnem()

  useEffect(() => {
    if (useProgressiveLoading) {
      // Usar carregamento progressivo
      loadQuestionsProgressive(area, numQuestions, useRealQuestions, year)
    } else {
      // Usar carregamento tradicional
      if (useRealQuestions && year) {
        loadRealQuestions(area, numQuestions, year)
      } else {
        loadQuestions(area, numQuestions, useRealQuestions)
      }
    }
  }, [area, numQuestions, useRealQuestions, year, useProgressiveLoading, loadQuestions, loadRealQuestions, loadQuestionsProgressive])

  // Auto-save answers to localStorage
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      const sessionKey = `enem_answers_${area}_${numQuestions}_${sessionId}`
      localStorage.setItem(sessionKey, JSON.stringify(answers))
    }
  }, [answers, area, numQuestions, sessionId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      finishSimulation()
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft, finishSimulation, setTimeLeft])

  const handleStart = () => {
    startSimulation(duration)
  }

  const handleFinish = () => {
    finishSimulation()
  }

  const handleReset = () => {
    resetSimulation()
    if (useRealQuestions && year) {
      loadRealQuestions(area, numQuestions, year)
    } else {
      loadQuestions(area, numQuestions, useRealQuestions)
    }
  }

  // Mostrar carregamento progressivo se ativo
  if (progressiveLoading.isLoading || progressiveLoading.error) {
    const isError = !!progressiveLoading.error
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-6 w-6 text-blue-600" />
              {isError ? 'Erro no Carregamento' : 'Preparando Simulado ENEM'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              {!isError && (
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-blue-600 font-bold text-lg">
                      {progressiveLoading.progress}%
                    </div>
                  </div>
                </div>
              )}
              {isError && (
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
              )}
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-800">{progressiveLoading.message}</h3>
                {!isError && (
                  <div className="space-y-2">
                    <Progress value={progressiveLoading.progress} className="w-full h-3" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{progressiveLoading.loadedQuestions.length} de {progressiveLoading.totalQuestions} questões</span>
                      <span>{progressiveLoading.loadingSpeed.toFixed(1)} questões/s</span>
                    </div>
                    {progressiveLoading.estimatedTimeRemaining > 0 && (
                      <p className="text-sm text-gray-500">
                        Tempo estimado restante: {progressiveLoading.estimatedTimeRemaining}s
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {progressiveLoading.canStart && !isError && (
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Pronto para começar!</span>
                  </div>
                  <p className="text-sm text-green-600">
                    Você pode começar a responder enquanto as questões continuam carregando
                  </p>
                </div>
                <Button 
                  onClick={() => setUseProgressiveLoading(false)} 
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-3"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Começar Simulado
                </Button>
              </div>
            )}
            
            {isError && (
              <div className="text-center space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 mb-2">
                    Ocorreu um erro ao carregar as questões. Verifique sua conexão e tente novamente.
                  </p>
                  <p className="text-xs text-red-500">
                    Erro: {progressiveLoading.error}
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={() => {
                      // Recarregar com carregamento progressivo
                      loadQuestionsProgressive(area, numQuestions, useRealQuestions, year)
                    }} 
                    size="lg"
                    variant="default"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Tentar Novamente
                  </Button>
                  <Button 
                    onClick={() => setUseProgressiveLoading(false)} 
                    size="lg"
                    variant="outline"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Carregamento Tradicional
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando questões...</p>
        </div>
      </div>
    )
  }

  // Usar questões do carregamento progressivo se disponíveis, senão usar questões tradicionais
  const availableQuestions = progressiveLoading.loadedQuestions.length > 0 
    ? progressiveLoading.loadedQuestions 
    : questions

  if (availableQuestions.length === 0 && !progressiveLoading.isLoading) {
    return (
      <div className="text-center p-8">
        <p>Não foi possível carregar as questões. Tente novamente.</p>
        <Button onClick={handleReset} className="mt-4">
          <RotateCcw className="h-4 w-4 mr-2" />
          Recarregar
        </Button>
      </div>
    )
  }
  
  const question = availableQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / availableQuestions.length) * 100
  const answeredQuestions = Object.keys(answers).length

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Simulado ENEM - {area}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span className="font-mono text-lg">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Questão {currentQuestion + 1} de {availableQuestions.length}</span>
            <div className="flex gap-2">
              <Badge variant="secondary">{area}</Badge>
              <Badge variant="outline">{answeredQuestions} respondidas</Badge>
              {currentQuestion === availableQuestions.length - 1 && (
                <Badge variant="default" className="bg-green-500">
                  Última questão
                </Badge>
              )}
              {progressiveLoading.loadedQuestions.length > 0 && (
                <Badge variant="default" className="bg-green-500">
                  {progressiveLoading.loadedQuestions.length}/{progressiveLoading.totalQuestions} carregadas
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {!isActive && !isFinished && (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {progressiveLoading.canStart ? 'Simulado Pronto!' : 'Carregando questões...'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {numQuestions} questões de {area} • {duration} minutos
                {progressiveLoading.loadedQuestions.length > 0 && (
                  <span className="block text-sm text-green-600 mt-2">
                    {progressiveLoading.loadedQuestions.length} questões carregadas
                  </span>
                )}
              </p>
              <Button 
                onClick={handleStart} 
                size="lg"
                disabled={!progressiveLoading.canStart}
              >
                <Play className="h-4 w-4 mr-2" />
                {progressiveLoading.canStart ? 'Iniciar Simulado' : 'Aguarde...'}
              </Button>
            </div>
          )}

          {isActive && question && (
            <SimulatorErrorBoundary>
              <div className="space-y-6">
                {/* Question Header with Question Number and Source Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-sm font-semibold">
                      Questão {currentQuestion + 1}
                    </Badge>
                    <Badge variant={getQuestionSourceChip(question).variant} className="text-xs">
                      {getQuestionSourceChip(question).text}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {question.difficulty || question.estimated_difficulty || 'Médio'}
                  </Badge>
                </div>

                {/* Question Content with Markdown Support */}
                <QuestionRenderer
                  question={question.stem}
                  imageUrl={question.image_url}
                  imageAlt={question.image_alt}
                />

                {/* Alternatives with Improved Design */}
                <div className="space-y-3">
                  {(() => {
                    // Sanitize question data
                    const sanitizedResult = sanitizeQuestion(question)
                    const sanitizedQuestion = sanitizedResult.sanitizedData || question
                    
                    return sanitizedQuestion.alternatives?.map((alternative, index) => {
                      const label = typeof alternative === 'string' ? alternative : alternative.label;
                      const text = typeof alternative === 'string' ? alternative : alternative.text;
                      return (
                        <AlternativeButton
                          key={index}
                          label={label}
                          text={text}
                          index={index}
                          isSelected={answers[currentQuestion] === label.toLowerCase()}
                          onClick={() => selectAnswer(label.toLowerCase())}
                        />
                      );
                    }) || (
                      // Fallback for old format
                      ['a', 'b', 'c', 'd', 'e'].map((alt, index) => {
                        const text = question[alt as keyof EnemQuestion] as string
                        if (!text) return null
                        
                        return (
                          <AlternativeButton
                            key={alt}
                            label={String.fromCharCode(65 + index)}
                            text={text}
                            index={index}
                            isSelected={answers[currentQuestion] === alt}
                            onClick={() => selectAnswer(alt)}
                          />
                        )
                      })
                    )
                  })()}
                </div>

              {currentQuestion === availableQuestions.length - 1 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Esta é a última questão! Clique em &quot;Finalizar&quot; para ver seus resultados.
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                >
                  Anterior
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={pauseSimulation}
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </Button>
                  <Button 
                    onClick={nextQuestion}
                    className={currentQuestion === availableQuestions.length - 1 ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {currentQuestion === availableQuestions.length - 1 ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Finalizar
                      </>
                    ) : (
                      "Próxima"
                    )}
                  </Button>
                </div>
              </div>
              </div>
            </SimulatorErrorBoundary>
          )}

          {isFinished && (
            <EnemResults
              score={score ? {
                score_id: `score_${Date.now()}`,
                session_id: sessionId || '',
                area_scores: {
                  CN: { raw_score: score, percentage: score, correct: Math.floor(score / 10), total: 10 },
                  CH: { raw_score: score, percentage: score, correct: Math.floor(score / 10), total: 10 },
                  LC: { raw_score: score, percentage: score, correct: Math.floor(score / 10), total: 10 },
                  MT: { raw_score: score, percentage: score, correct: Math.floor(score / 10), total: 10 }
                },
                total_score: score,
                tri_estimated: {
                  score: score * 0.8,
                  confidence_interval: { lower: score * 0.7, upper: score * 0.9 },
                  disclaimer: 'Estimativa baseada em dados históricos'
                },
                stats: {
                  total_time_spent: 0,
                  average_time_per_question: 0,
                  accuracy_by_topic: {},
                  difficulty_breakdown: { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } }
                }
              } : {
                score_id: `score_${Date.now()}`,
                session_id: sessionId || '',
                area_scores: {
                  CN: { raw_score: 0, percentage: 0, correct: 0, total: 0 },
                  CH: { raw_score: 0, percentage: 0, correct: 0, total: 0 },
                  LC: { raw_score: 0, percentage: 0, correct: 0, total: 0 },
                  MT: { raw_score: 0, percentage: 0, correct: 0, total: 0 }
                },
                total_score: 0,
                tri_estimated: {
                  score: 0,
                  confidence_interval: { lower: 0, upper: 0 },
                  disclaimer: 'Estimativa baseada em dados históricos'
                },
                stats: {
                  total_time_spent: 0,
                  average_time_per_question: 0,
                  accuracy_by_topic: {},
                  difficulty_breakdown: { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } }
                }
              }}
              sessionId={sessionId || ''}
              onRetake={handleReset}
              onRefocus={(topics: string[]) => {
                // Implementar foco em tópicos específicos
                console.log('Refocus on topics:', topics);
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
