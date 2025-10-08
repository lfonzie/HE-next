'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  BookOpen, 
  Lightbulb,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  Eye,
  EyeOff,
  CheckCircle
} from 'lucide-react';
import { Experiment } from '../types/experiment';
import { AIAssistant } from './AIAssistant';

interface EnhancedExperimentViewProps {
  experiment: Experiment;
}

export const EnhancedExperimentView: React.FC<EnhancedExperimentViewProps> = ({ experiment }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [experimentData, setExperimentData] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [showAI, setShowAI] = useState(true);

  const ExperimentComponent = experiment.component;

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    setCurrentStep(0);
    setProgress(0);
    setInsights([]);
    
    // Simular progresso do experimento
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          setShowResults(true);
          generateInsights();
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStep(0);
    setProgress(0);
    setShowResults(false);
    setInsights([]);
    setExperimentData(null);
  };

  const generateInsights = () => {
    const experimentInsights = {
      'chemical-reaction': [
        'A reação ocorreu com sucesso, formando novos compostos',
        'A temperatura afetou a velocidade da reação',
        'A concentração influenciou o rendimento do produto',
        'Observe as mudanças de cor e estado físico'
      ],
      'pendulum': [
        'O período do pêndulo segue a fórmula T = 2π√(L/g)',
        'A massa não afeta o período, apenas o comprimento e gravidade',
        'O amortecimento causa diminuição gradual da amplitude',
        'A energia se conserva em um sistema ideal'
      ],
      'bouncing-ball': [
        'O coeficiente de restituição determina a elasticidade',
        'A resistência do ar causa perda de energia',
        'A altura máxima diminui a cada quique',
        'A gravidade acelera a bola em direção ao solo'
      ],
      'color-mixing': [
        'RGB é um modelo aditivo usado em telas',
        'CMYK é um modelo subtrativo usado em impressão',
        'HSL representa matiz, saturação e luminosidade',
        'Cores complementares criam contraste visual'
      ]
    };

    const currentInsights = experimentInsights[experiment.id as keyof typeof experimentInsights] || experimentInsights['chemical-reaction'];
    setInsights(currentInsights);
  };

  const getExperimentSteps = () => {
    const steps = {
      'chemical-reaction': [
        'Selecionar compostos para reação',
        'Ajustar temperatura e concentração',
        'Iniciar reação química',
        'Observar mudanças visuais',
        'Analisar produtos formados'
      ],
      'pendulum': [
        'Configurar comprimento do pêndulo',
        'Definir ângulo inicial',
        'Ajustar parâmetros físicos',
        'Iniciar movimento pendular',
        'Analisar período e frequência'
      ],
      'bouncing-ball': [
        'Configurar altura inicial',
        'Ajustar coeficiente de restituição',
        'Definir parâmetros de física',
        'Iniciar simulação',
        'Observar comportamento da bola'
      ],
      'color-mixing': [
        'Selecionar modelo de cores',
        'Ajustar valores RGB/CMYK',
        'Misturar cores',
        'Observar resultado',
        'Analisar propriedades da cor'
      ]
    };

    return steps[experiment.id as keyof typeof steps] || steps['chemical-reaction'];
  };

  const steps = getExperimentSteps();

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header com informações do experimento */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <experiment.icon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-blue-900">{experiment.name}</CardTitle>
                <CardDescription className="text-blue-700">{experiment.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {experiment.category}
              </Badge>
              <Badge variant="outline" className="border-blue-300 text-blue-700">
                {experiment.difficulty}
              </Badge>
              <Badge variant="outline" className="border-blue-300 text-blue-700">
                {experiment.duration}min
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controles principais */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleStart}
                disabled={isRunning && !isPaused}
                variant="default"
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-5 w-5 mr-2" />
                Iniciar
              </Button>
              <Button
                onClick={handlePause}
                disabled={!isRunning}
                variant="outline"
                size="lg"
              >
                <Pause className="h-5 w-5 mr-2" />
                {isPaused ? 'Continuar' : 'Pausar'}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Resetar
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="outline"
                size="lg"
              >
                <Settings className="h-5 w-5 mr-2" />
                Configurações
              </Button>
              <Button
                onClick={() => setShowAI(!showAI)}
                variant="outline"
                size="lg"
              >
                {showAI ? <EyeOff className="h-5 w-5 mr-2" /> : <Eye className="h-5 w-5 mr-2" />}
                {showAI ? 'Ocultar IA' : 'Mostrar IA'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barra de progresso e steps */}
      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Progresso do Experimento</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Etapa atual:</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {steps[currentStep] || 'Preparando...'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Área principal do experimento */}
      <div className="flex-1 min-h-0">
        <Card className="h-full">
          <CardContent className="h-full p-6">
            <div className="h-full flex flex-col">
              {/* Status do experimento */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      isRunning ? (isPaused ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-400'
                    }`} />
                    <span className="text-sm text-gray-600">
                      {isRunning ? (isPaused ? 'Pausado' : 'Executando') : 'Parado'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Tempo: {Math.floor(progress / 2)}s
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {experiment.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="mr-1 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Componente do experimento */}
              <div className="flex-1 min-h-0">
                <ExperimentComponent />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resultados e insights */}
      {showResults && insights.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Lightbulb className="h-5 w-5" />
              <span>Insights e Resultados</span>
            </CardTitle>
            <CardDescription className="text-green-700">
              Análise automática dos resultados do experimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-white rounded-lg border border-green-200">
                  <div className="p-1 bg-green-100 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assistente IA */}
      {showAI && (
        <AIAssistant
          experimentId={experiment.id}
          experimentName={experiment.name}
          onSuggestion={(suggestion) => {
            console.log('Sugestão da IA:', suggestion);
          }}
          onQuestion={(question) => {
            console.log('Pergunta do usuário:', question);
          }}
        />
      )}
    </div>
  );
};
