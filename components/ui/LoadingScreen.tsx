"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  Brain, 
  BookOpen, 
  Target,
  Settings, 
  Zap, 
  CheckCircle,
  Clock,
  Users,
  Award,
  TrendingUp
} from 'lucide-react';

interface LoadingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: number;
}

interface LoadingScreenProps {
  isLoading: boolean;
  progress: number;
  message: string;
  steps?: LoadingStep[];
  showDetailedProgress?: boolean;
  className?: string;
}

const defaultSteps: LoadingStep[] = [
  {
    id: 'config',
    title: 'Configurando Simulado',
    description: 'Preparando ambiente e configurações',
    icon: <Settings className="h-5 w-5" />,
    duration: 1000
  },
  {
    id: 'select',
    title: 'Selecionando Questões',
    description: 'Escolhendo questões personalizadas para você',
    icon: <BookOpen className="h-5 w-5" />,
    duration: 2000
  },
  {
    id: 'analyze',
    title: 'Analisando Dificuldade',
    description: 'Calibrando nível de dificuldade',
    icon: <Brain className="h-5 w-5" />,
    duration: 1500
  },
  {
    id: 'prepare',
    title: 'Preparando Sistema TRI',
    description: 'Configurando correção oficial do ENEM',
    icon: <Award className="h-5 w-5" />,
    duration: 1200
  },
  {
    id: 'finalize',
    title: 'Finalizando',
    description: 'Últimos ajustes e validações',
    icon: <CheckCircle className="h-5 w-5" />,
    duration: 800
  }
];

export function LoadingScreen({ 
  isLoading, 
  progress, 
  message, 
  steps = defaultSteps,
  showDetailedProgress = true,
  className = ""
}: LoadingScreenProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isLoading) return;

    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setCurrentStepIndex(stepIndex);
        stepIndex++;
      } else {
        clearInterval(stepInterval);
      }
    }, 1000);

    return () => clearInterval(stepInterval);
  }, [isLoading, steps.length]);

  useEffect(() => {
    if (progress >= 100) {
      setCompletedSteps(new Set(steps.map(step => step.id)));
    } else {
      const completedCount = Math.floor((progress / 100) * steps.length);
      const newCompletedSteps = new Set();
      for (let i = 0; i < completedCount; i++) {
        newCompletedSteps.add(steps[i].id);
      }
      setCompletedSteps(newCompletedSteps);
    }
  }, [progress, steps]);

  if (!isLoading) return null;

  const currentStep = steps[currentStepIndex] || steps[0];

  return (
    <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center ${className}`}>
      <Card className="w-full max-w-2xl mx-4 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardContent className="py-12 px-8">
          <div className="text-center space-y-8">
            {/* Main Loading Animation */}
            <div className="relative">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 relative overflow-hidden">
                <Loader2 className="h-12 w-12 text-white animate-spin z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse opacity-75"></div>
                <div className="absolute inset-2 bg-white rounded-full opacity-20 animate-ping"></div>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                <Target className="h-3 w-3 text-white" />
              </div>
            </div>

            {/* Main Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {message}
              </h2>
              <p className="text-gray-600">
                Preparando seu simulado personalizado...
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-4" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full animate-pulse"></div>
              </div>
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((dot) => (
                  <div
                    key={dot}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      progress >= (dot * 20) 
                        ? 'bg-blue-500 animate-pulse' 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Detailed Steps */}
            {showDetailedProgress && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Etapas do Processamento
                </h3>
                
                <div className="space-y-3">
                  {steps.map((step, index) => {
                    const isCompleted = completedSteps.has(step.id);
                    const isCurrent = currentStepIndex === index;
                    const isUpcoming = index > currentStepIndex;
                    
                    return (
                      <div
                        key={step.id}
                        className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-green-50 border border-green-200' 
                            : isCurrent 
                            ? 'bg-blue-50 border border-blue-200' 
                            : isUpcoming
                            ? 'bg-gray-50 border border-gray-200'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isCurrent 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : isCurrent ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            step.icon
                          )}
                        </div>
                        
                        <div className="flex-1 text-left">
                          <h4 className={`font-medium ${
                            isCompleted 
                              ? 'text-green-800' 
                              : isCurrent 
                              ? 'text-blue-800' 
                              : 'text-gray-600'
                          }`}>
                            {step.title}
                          </h4>
                          <p className={`text-sm ${
                            isCompleted 
                              ? 'text-green-600' 
                              : isCurrent 
                              ? 'text-blue-600' 
                              : 'text-gray-500'
                          }`}>
                            {step.description}
                          </p>
                        </div>
                        
                        {isCompleted && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fun Facts */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Dica Profissional</span>
              </div>
              <p className="text-sm text-blue-700">
                🧠 Nossa IA analisa seu perfil de aprendizado para selecionar questões que maximizam seu desenvolvimento
              </p>
            </div>

            {/* Estimated Time */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Tempo estimado: 15-30 segundos</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente específico para loading do ENEM
export function EnemLoadingScreen({ 
  isLoading, 
  progress, 
  message, 
  className = "" 
}: Omit<LoadingScreenProps, 'steps' | 'showDetailedProgress'>) {
  const enemSteps: LoadingStep[] = [
    {
      id: 'config',
      title: 'Configurando Simulado ENEM',
      description: 'Preparando ambiente oficial do ENEM',
      icon: <Target className="h-5 w-5" />,
      duration: 1000
    },
    {
      id: 'select',
      title: 'Selecionando Questões Oficiais',
      description: 'Escolhendo questões reais do ENEM',
      icon: <BookOpen className="h-5 w-5" />,
      duration: 2000
    },
    {
      id: 'analyze',
      title: 'Analisando Competências',
      description: 'Mapeando habilidades do ENEM',
      icon: <Brain className="h-5 w-5" />,
      duration: 1500
    },
    {
      id: 'prepare',
      title: 'Preparando Sistema TRI',
      description: 'Configurando correção oficial',
      icon: <Award className="h-5 w-5" />,
      duration: 1200
    },
    {
      id: 'finalize',
      title: 'Finalizando Simulado',
      description: 'Últimas validações e ajustes',
      icon: <CheckCircle className="h-5 w-5" />,
      duration: 800
    }
  ];

  return (
    <LoadingScreen
      isLoading={isLoading}
      progress={progress}
      message={message}
      steps={enemSteps}
      showDetailedProgress={true}
      className={className}
    />
  );
}