"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Timer, BookOpen, Target, Play, Pause, RotateCcw } from 'lucide-react'
import { useEnem } from '@/hooks/useEnem'
import { formatTime } from '@/lib/utils'
import { EnemQuestion } from '@/types'

interface EnemSimulatorProps {
  area: string
  numQuestions: number
  duration: number
}

export function EnemSimulator({ area, numQuestions, duration }: EnemSimulatorProps) {
  const {
    questions,
    currentQuestion,
    answers,
    timeLeft,
    isActive,
    isFinished,
    score,
    isLoading,
    loadQuestions,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    finishSimulation,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    resetSimulation,
    setTimeLeft
  } = useEnem()

  useEffect(() => {
    loadQuestions(area, numQuestions)
  }, [area, numQuestions, loadQuestions])

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
  }, [isActive, timeLeft, finishSimulation])

  const handleStart = () => {
    startSimulation(duration)
  }

  const handleFinish = () => {
    finishSimulation()
  }

  const handleReset = () => {
    resetSimulation()
    loadQuestions(area, numQuestions)
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

  if (questions.length === 0) {
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

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100
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
            <span>Questão {currentQuestion + 1} de {questions.length}</span>
            <div className="flex gap-2">
              <Badge variant="secondary">{area}</Badge>
              <Badge variant="outline">{answeredQuestions} respondidas</Badge>
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
                <h3 className="text-lg font-medium mb-4">
                  {question.stem}
                </h3>
              </div>

              <div className="space-y-3">
                {['a', 'b', 'c', 'd', 'e'].map((alt, index) => (
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
                ))}
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
                    disabled={currentQuestion === questions.length - 1}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isFinished && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold mb-2">Simulado Finalizado!</h3>
              <p className="text-muted-foreground mb-4">
                Suas respostas foram salvas.
              </p>
              {score !== undefined && (
                <div className="mb-4">
                  <Badge variant="default" className="text-lg px-4 py-2">
                    Pontuação: {score}
                  </Badge>
                </div>
              )}
              <div className="flex gap-2 justify-center">
                <Button onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Novo Simulado
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
