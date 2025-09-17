"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, BookOpen, Award, CheckCircle } from 'lucide-react';

// Importar componentes Curipod
import HookComponent from './HookComponent';
import InteractiveCheckpoint from './InteractiveCheckpoint';
import AuthenticTask from './AuthenticTask';
import ExitTicket from './ExitTicket';
import InstructionSlides from './InstructionSlides';

interface CuripodLesson {
  title: string;
  subject: string;
  introduction: string;
  themeImage: string;
  timing: {
    hook: string;
    instruction: string;
    task: string;
    exit: string;
  };
  steps: Array<{
    type: 'hook' | 'explanation' | 'checkpoint' | 'task';
    card1: {
      title: string;
      content: string;
    };
    card2: {
      title: string;
      content: string;
      imageUrl?: string;
      options?: string[];
      correctOption?: number;
      helpMessage?: string;
      correctAnswer?: string;
    };
  }>;
  finalTest: {
    questions: Array<{
      question: string;
      options: string[];
      correctOption: number;
      explanation: string;
    }>;
  };
  summary: string;
  nextSteps: string[];
}

interface CuripodLessonModuleProps {
  lesson: CuripodLesson;
  onComplete: (results: {
    hookCompleted: boolean;
    checkpointsPassed: number;
    taskCompleted: boolean;
    exitScore: number;
    totalTime: number;
  }) => void;
}

type LessonPhase = 'hook' | 'instruction' | 'instruction-checkpoint' | 'task' | 'exit' | 'completed';

export default function CuripodLessonModule({ lesson, onComplete }: CuripodLessonModuleProps) {
  const [currentPhase, setCurrentPhase] = useState<LessonPhase>('hook');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [results, setResults] = useState({
    hookCompleted: false,
    checkpointsPassed: 0,
    taskCompleted: false,
    exitScore: 0,
    totalTime: 0
  });

  // Timer geral da aula
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseInfo = (phase: LessonPhase) => {
    switch (phase) {
      case 'hook':
        return {
          title: 'Hook - Gancho Inicial',
          description: 'Capturando sua atenção',
          icon: <Target className="h-6 w-6" />,
          color: 'from-orange-500 to-red-500',
          progress: 0
        };
      case 'instruction':
        return {
          title: 'Instrução Interativa',
          description: 'Aprendendo com slides distribuídos',
          icon: <BookOpen className="h-6 w-6" />,
          color: 'from-blue-500 to-purple-500',
          progress: 25
        };
      case 'instruction-checkpoint':
        return {
          title: 'Checkpoint de Verificação',
          description: 'Testando sua compreensão',
          icon: <Target className="h-6 w-6" />,
          color: 'from-blue-500 to-purple-500',
          progress: 35
        };
      case 'task':
        return {
          title: 'Tarefa Autêntica',
          description: 'Desafio prático',
          icon: <Award className="h-6 w-6" />,
          color: 'from-purple-500 to-pink-500',
          progress: 50
        };
      case 'exit':
        return {
          title: 'Exit Ticket',
          description: 'Avaliação final',
          icon: <CheckCircle className="h-6 w-6" />,
          color: 'from-green-500 to-blue-500',
          progress: 75
        };
      case 'completed':
        return {
          title: 'Aula Concluída',
          description: 'Parabéns!',
          icon: <CheckCircle className="h-6 w-6" />,
          color: 'from-green-500 to-blue-500',
          progress: 100
        };
      default:
        return {
          title: 'Aula Interativa',
          description: 'Seguindo metodologia Curipod',
          icon: <Target className="h-6 w-6" />,
          color: 'from-gray-500 to-gray-600',
          progress: 0
        };
    }
  };

  const handleHookComplete = () => {
    setResults(prev => ({ ...prev, hookCompleted: true }));
    setCurrentPhase('instruction');
    setPhaseProgress(25);
  };

  const handleCheckpointComplete = (isCorrect: boolean, timeSpent: number) => {
    if (isCorrect) {
      setResults(prev => ({ ...prev, checkpointsPassed: prev.checkpointsPassed + 1 }));
    }
  };

  const handleTaskComplete = (isCorrect: boolean, timeSpent: number) => {
    setResults(prev => ({ ...prev, taskCompleted: true }));
    setCurrentPhase('exit');
    setPhaseProgress(75);
  };

  const handleExitComplete = (score: number, totalQuestions: number, timeSpent: number) => {
    setResults(prev => ({ 
      ...prev, 
      exitScore: score,
      totalTime: totalTime
    }));
    setCurrentPhase('completed');
    setPhaseProgress(100);
    
    // Chamar callback de conclusão
    onComplete({
      ...results,
      exitScore: score,
      totalTime: totalTime
    });
  };

  const getCurrentStep = () => {
    switch (currentPhase) {
      case 'hook':
        return lesson.steps.find(step => step.type === 'hook');
      case 'instruction':
        // Para instrução, vamos usar os slides 2-5 (conceitos e desenvolvimento)
        return lesson.steps.slice(1, 5);
      case 'task':
        return lesson.steps.find(step => step.type === 'task');
      case 'exit':
        return null; // Exit ticket tem estrutura diferente
      default:
        return null;
    }
  };

  const getCurrentCheckpoint = () => {
    // Primeiro checkpoint está no slide 6
    return lesson.steps.find(step => step.type === 'checkpoint');
  };

  const getSecondCheckpoint = () => {
    // Segundo checkpoint está no slide 10
    return lesson.steps.find((step, index) => step.type === 'checkpoint' && index > 5);
  };

  const phaseInfo = getPhaseInfo(currentPhase);

  if (currentPhase === 'completed') {
    return (
      <div className="space-y-8">
        {/* Header de conclusão */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Aula Concluída!
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {lesson.title}
          </p>
        </div>

        {/* Resumo dos resultados */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              📊 Seu Desempenho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {results.hookCompleted ? '✅' : '❌'}
                </div>
                <div className="text-sm text-gray-600">Hook</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {results.checkpointsPassed}
                </div>
                <div className="text-sm text-gray-600">Checkpoints</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {results.taskCompleted ? '✅' : '❌'}
                </div>
                <div className="text-sm text-gray-600">Tarefa</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {results.exitScore}
                </div>
                <div className="text-sm text-gray-600">Exit Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo da aula */}
        <Card>
          <CardHeader>
            <CardTitle>📚 Resumo da Aula</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-6">
              {lesson.summary}
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">
                🎯 Próximos Passos:
              </h3>
              <ul className="space-y-2 text-blue-800">
                {lesson.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com progresso */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${phaseInfo.color} rounded-full flex items-center justify-center`}>
            {phaseInfo.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {phaseInfo.title}
            </h2>
            <p className="text-sm text-gray-600">
              {phaseInfo.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            {lesson.subject}
          </Badge>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">
              {formatTime(totalTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de progresso geral */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progresso da Aula</span>
          <span>{phaseInfo.progress}%</span>
        </div>
        <Progress value={phaseInfo.progress} className="h-3" />
      </div>

      {/* Conteúdo da fase atual */}
      <div className="min-h-[600px]">
        {currentPhase === 'hook' && (
          <HookComponent
            hook={{
              title: lesson.steps[0]?.card1.title || 'Hook Inicial',
              content: lesson.steps[0]?.card1.content || '',
              type: 'question',
              duration: 5,
              engagementLevel: 'high'
            }}
            onComplete={handleHookComplete}
            onNext={() => setCurrentPhase('instruction')}
          />
        )}

        {currentPhase === 'instruction' && (
          <div className="space-y-6">
            {/* Usar o componente InstructionSlides para múltiplos slides */}
            {getCurrentStep() && Array.isArray(getCurrentStep()) && (
              <InstructionSlides
                slides={(getCurrentStep() as any[]).map(step => ({
                  card1: step.card1,
                  card2: step.card2
                }))}
                onComplete={() => {
                  // Após completar os slides de instrução, mostrar o checkpoint
                  setCurrentPhase('instruction-checkpoint');
                }}
              />
            )}
          </div>
        )}

        {currentPhase === 'instruction-checkpoint' && (
          <div className="space-y-6">
            {/* Primeiro Checkpoint */}
            {getCurrentCheckpoint() && (
              <InteractiveCheckpoint
                checkpoint={{
                  title: getCurrentCheckpoint()?.card1.title || 'Checkpoint',
                  content: getCurrentCheckpoint()?.card1.content || '',
                  question: getCurrentCheckpoint()?.card1.content || '',
                  options: getCurrentCheckpoint()?.card2.options || [],
                  correctOption: getCurrentCheckpoint()?.card2.correctOption || 0,
                  helpMessage: getCurrentCheckpoint()?.card2.helpMessage,
                  correctAnswer: getCurrentCheckpoint()?.card2.correctAnswer || '',
                  difficulty: 'medium',
                  timeLimit: 60
                }}
                onComplete={handleCheckpointComplete}
                onNext={() => setCurrentPhase('task')}
              />
            )}
          </div>
        )}

        {currentPhase === 'task' && (
          <AuthenticTask
            task={{
              title: lesson.steps[5]?.card1.title || 'Tarefa Autêntica',
              content: lesson.steps[5]?.card1.content || '',
              scenario: lesson.steps[5]?.card1.content || '',
              question: lesson.steps[5]?.card1.content || '',
              options: lesson.steps[5]?.card2.options || [],
              correctOption: lesson.steps[5]?.card2.correctOption || 0,
              explanation: lesson.steps[5]?.card2.correctAnswer || '',
              realWorldConnection: lesson.steps[5]?.card2.content || '',
              difficulty: 'medium',
              timeLimit: 120
            }}
            onComplete={handleTaskComplete}
            onNext={() => setCurrentPhase('exit')}
          />
        )}

        {currentPhase === 'exit' && (
          <ExitTicket
            questions={lesson.finalTest.questions}
            onComplete={handleExitComplete}
            onNext={() => setCurrentPhase('completed')}
          />
        )}
      </div>
    </div>
  );
}
