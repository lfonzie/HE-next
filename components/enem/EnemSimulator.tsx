"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Timer, BookOpen, Target, Play, Pause, RotateCcw, Clock } from 'lucide-react'
import { useEnem } from '@/hooks/useEnem'
import { formatTime } from '@/lib/utils'
import { EnemQuestion } from '@/types'
import { EnemResults } from './EnemResults'

// Função para determinar o texto do chip baseado na origem da pergunta
function getQuestionSourceChip(question: any): { text: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  // Se tem year definido e não é o ano atual, provavelmente é da API do ENEM
  if (question.year && question.year !== new Date().getFullYear()) {
    return {
      text: `ENEM ${question.year}`,
      variant: "default"
    }
  }
  
  // Se tem ID que começa com "enem_" ou "generated_", podemos inferir a origem
  if (question.id) {
    if (question.id.startsWith('enem_')) {
      const year = question.year || 'API'
      return {
        text: `ENEM ${year}`,
        variant: "default"
      }
    }
    if (question.id.startsWith('generated_')) {
      return {
        text: "IA",
        variant: "secondary"
      }
    }
  }
  
  // Se tem source definido na resposta da API
  if (question.source) {
    if (question.source === 'enem.dev' || question.source === 'api') {
      return {
        text: `ENEM ${question.year || 'API'}`,
        variant: "default"
      }
    }
    if (question.source === 'ai' || question.source === 'generated') {
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
  if (progressiveLoading.isLoading || progressiveLoading.message.includes('Erro ao carregar')) {
    const isError = progressiveLoading.message.includes('Erro ao carregar')
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {isError ? 'Erro no Carregamento' : 'Preparando Simulado ENEM'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              {!isError && (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              )}
              {isError && (
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
              )}
              <h3 className="text-lg font-semibold mb-2">{progressiveLoading.message}</h3>
              {!isError && (
                <Progress value={progressiveLoading.progress} className="w-full mb-4" />
              )}
              <p className="text-sm text-muted-foreground">
                {progressiveLoading.loadedQuestions.length} de {progressiveLoading.totalQuestions} questões carregadas
              </p>
            </div>
            
            {progressiveLoading.canStart && !isError && (
              <div className="text-center">
                <p className="text-sm text-green-600 mb-4">
                  ✅ Você pode começar a responder enquanto as questões carregam!
                </p>
                <Button onClick={() => setUseProgressiveLoading(false)} size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Começar Simulado
                </Button>
              </div>
            )}
            
            {isError && (
              <div className="text-center space-y-4">
                <p className="text-sm text-red-600 mb-4">
                  Ocorreu um erro ao carregar as questões. Verifique sua conexão e tente novamente.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={() => {
                      // Recarregar com carregamento progressivo
                      loadQuestionsProgressive(area, numQuestions, useRealQuestions, year)
                    }} 
                    size="lg"
                    variant="default"
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
              <h3 className="text-lg font-semibold mb-2">Simulado Pronto!</h3>
              <p className="text-muted-foreground mb-4">
                {numQuestions} questões de {area} • {duration} minutos
              </p>
              <Button onClick={handleStart} size="lg">
                <Play className="h-4 w-4 mr-2" />
                Iniciar Simulado
              </Button>
            </div>
          )}

          {isActive && question && (
            <div className="space-y-6">
              <div className="prose max-w-none">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-medium flex-1">
                    {question.stem}
                  </h3>
                  <Badge variant={getQuestionSourceChip(question).variant} className="text-xs">
                    {getQuestionSourceChip(question).text}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                {question.alternatives ? (
                  // Formato com alternatives array
                  question.alternatives.map((option: string, index: number) => (
                    <Button
                      key={index}
                      variant={answers[currentQuestion] === index.toString() ? "default" : "outline"}
                      className="w-full justify-start h-auto p-4 text-left"
                      onClick={() => selectAnswer(index.toString())}
                    >
                      <span className="font-semibold mr-3">
                        {String.fromCharCode(65 + index)})
                      </span>
                      {option}
                    </Button>
                  ))
                ) : (
                  // Formato antigo do banco de dados
                  ['a', 'b', 'c', 'd', 'e'].map((alt, index) => (
                    <Button
                      key={alt}
                      variant={answers[currentQuestion] === alt ? "default" : "outline"}
                      className="w-full justify-start h-auto p-4 text-left"
                      onClick={() => selectAnswer(alt)}
                    >
                      <span className="font-semibold mr-3">
                        {alt.toUpperCase()})
                      </span>
                      {question[alt as keyof EnemQuestion] as string}
                    </Button>
                  ))
                )}
              </div>

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
                    disabled={currentQuestion === availableQuestions.length - 1}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isFinished && (
            <EnemResults
              questions={availableQuestions}
              answers={answers}
              score={score || 0}
              totalQuestions={availableQuestions.length}
              onRestart={handleReset}
              onBackToSetup={() => {
                // Voltar para a configuração inicial
                window.location.reload()
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
