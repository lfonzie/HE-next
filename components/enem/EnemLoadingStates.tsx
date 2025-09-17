"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  BookOpen, 
  Brain, 
  CheckCircle,
  Clock,
  Zap,
  Target,
  Award,
  Users,
  TrendingUp,
  Settings
} from 'lucide-react';

interface EnemLoadingStateProps {
  type: 'exam-generation' | 'question-loading' | 'score-calculation' | 'session-creation';
  isLoading: boolean;
  progress?: number;
  message?: string;
  currentStep?: number;
  totalSteps?: number;
  className?: string;
}

const loadingConfigs = {
  'exam-generation': {
    title: 'Gerando Simulado ENEM',
    subtitle: 'Preparando questões personalizadas',
    steps: [
      { icon: Settings, title: 'Configurando', description: 'Preparando ambiente' },
      { icon: BookOpen, title: 'Selecionando', description: 'Escolhendo questões' },
      { icon: Brain, title: 'Analisando', description: 'Calibrando dificuldade' },
      { icon: Award, title: 'Preparando TRI', description: 'Sistema de correção' },
      { icon: CheckCircle, title: 'Finalizando', description: 'Últimos ajustes' }
    ]
  },
  'question-loading': {
    title: 'Carregando Questão',
    subtitle: 'Preparando próxima questão',
    steps: [
      { icon: BookOpen, title: 'Carregando', description: 'Buscando questão' },
      { icon: Brain, title: 'Processando', description: 'Analisando conteúdo' },
      { icon: CheckCircle, title: 'Pronto', description: 'Questão disponível' }
    ]
  },
  'score-calculation': {
    title: 'Calculando Pontuação',
    subtitle: 'Processando seus resultados',
    steps: [
      { icon: Brain, title: 'Analisando', description: 'Processando respostas' },
      { icon: Award, title: 'Calculando TRI', description: 'Aplicando correção oficial' },
      { icon: TrendingUp, title: 'Gerando relatório', description: 'Preparando análise' },
      { icon: CheckCircle, title: 'Concluído', description: 'Resultados prontos' }
    ]
  },
  'session-creation': {
    title: 'Criando Sessão',
    subtitle: 'Configurando seu simulado',
    steps: [
      { icon: Settings, title: 'Configurando', description: 'Preparando sessão' },
      { icon: Users, title: 'Validando', description: 'Verificando dados' },
      { icon: CheckCircle, title: 'Criada', description: 'Sessão ativa' }
    ]
  }
};

export function EnemLoadingState({ 
  type, 
  isLoading, 
  progress = 0, 
  message, 
  currentStep = 0,
  totalSteps,
  className = ""
}: EnemLoadingStateProps) {
  const config = loadingConfigs[type];
  const steps = config.steps;
  const effectiveTotalSteps = totalSteps || steps.length;
  const currentStepIndex = Math.min(currentStep, steps.length - 1);
  const currentStepData = steps[currentStepIndex];

  if (!isLoading) return null;

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 z-50 flex items-center justify-center ${className}`}>
      <Card className="w-full max-w-2xl mx-4 shadow-2xl border-0">
        <CardContent className="py-12 px-8">
          <div className="text-center space-y-8">
            {/* Main Animation */}
            <div className="relative">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 relative overflow-hidden">
                <div className="z-10">
                  {type === 'exam-generation' && <BookOpen className="h-12 w-12 text-white animate-pulse" />}
                  {type === 'question-loading' && <Brain className="h-12 w-12 text-white animate-pulse" />}
                  {type === 'score-calculation' && <Award className="h-12 w-12 text-white animate-pulse" />}
                  {type === 'session-creation' && <Settings className="h-12 w-12 text-white animate-pulse" />}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse opacity-75"></div>
                <div className="absolute inset-2 bg-white rounded-full opacity-20 animate-ping"></div>
              </div>
              
              {/* Floating Icons */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                <Target className="h-3 w-3 text-white" />
              </div>
            </div>

            {/* Title and Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {message || config.title}
              </h2>
              <p className="text-gray-600">
                {config.subtitle}
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-4" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Current Step */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <currentStepData.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-blue-800">
                    {currentStepData.title}
                  </h4>
                  <p className="text-sm text-blue-600">
                    {currentStepData.description}
                  </p>
                </div>
              </div>
            </div>

            {/* All Steps */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">
                Etapas do Processo
              </h3>
              
              <div className="space-y-2">
                {steps.map((step, index) => {
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isUpcoming = index > currentStepIndex;
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-green-50 border border-green-200' 
                          : isCurrent 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isCurrent 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : isCurrent ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <step.icon className="h-4 w-4" />
                        )}
                      </div>
                      
                      <div className="flex-1 text-left">
                        <h4 className={`text-sm font-medium ${
                          isCompleted 
                            ? 'text-green-800' 
                            : isCurrent 
                            ? 'text-blue-800' 
                            : 'text-gray-600'
                        }`}>
                          {step.title}
                        </h4>
                        <p className={`text-xs ${
                          isCompleted 
                            ? 'text-green-600' 
                            : isCurrent 
                            ? 'text-blue-600' 
                            : 'text-gray-500'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fun Facts */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 text-purple-800 mb-2">
                <Zap className="h-4 w-4" />
                <span className="font-medium">Dica Profissional</span>
              </div>
              <p className="text-sm text-purple-700">
                {type === 'exam-generation' && '🧠 Nossa IA seleciona questões que maximizam seu aprendizado'}
                {type === 'question-loading' && '📚 Leia com atenção todas as alternativas antes de responder'}
                {type === 'score-calculation' && '📊 O sistema TRI é o mesmo usado na correção oficial do ENEM'}
                {type === 'session-creation' && '⚡ Sua sessão é salva automaticamente para continuar depois'}
              </p>
            </div>

            {/* Time Estimate */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>
                {type === 'exam-generation' && 'Tempo estimado: 15-30 segundos'}
                {type === 'question-loading' && 'Tempo estimado: 2-5 segundos'}
                {type === 'score-calculation' && 'Tempo estimado: 5-10 segundos'}
                {type === 'session-creation' && 'Tempo estimado: 3-8 segundos'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componentes específicos para cada tipo
export function ExamGenerationLoading({ isLoading, progress, message }: { isLoading: boolean; progress: number; message?: string }) {
  return (
    <EnemLoadingState
      type="exam-generation"
      isLoading={isLoading}
      progress={progress}
      message={message}
    />
  );
}

export function QuestionLoading({ isLoading, progress, message }: { isLoading: boolean; progress: number; message?: string }) {
  return (
    <EnemLoadingState
      type="question-loading"
      isLoading={isLoading}
      progress={progress}
      message={message}
    />
  );
}

export function ScoreCalculationLoading({ isLoading, progress, message }: { isLoading: boolean; progress: number; message?: string }) {
  return (
    <EnemLoadingState
      type="score-calculation"
      isLoading={isLoading}
      progress={progress}
      message={message}
    />
  );
}

export function SessionCreationLoading({ isLoading, progress, message }: { isLoading: boolean; progress: number; message?: string }) {
  return (
    <EnemLoadingState
      type="session-creation"
      isLoading={isLoading}
      progress={progress}
      message={message}
    />
  );
}
