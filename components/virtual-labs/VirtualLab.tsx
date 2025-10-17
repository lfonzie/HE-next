'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FixedSizeList } from 'react-window';
import { motion, AnimatePresence } from 'framer-motion';
import DebouncedControls from './DebouncedControls';
import { 
  Microscope, 
  Atom, 
  Calculator, 
  Beaker, 
  Zap, 
  Play, 
  Pause, 
  RotateCcw,
  Settings,
  BookOpen,
  Target,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  BarChart3,
  Bot,
  Sparkles,
  TrendingUp,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface VirtualLabProps {
  subject: 'chemistry' | 'physics' | 'biology' | 'mathematics';
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  onComplete?: (results: LabResults) => void;
  showSidebar?: boolean;
  enableFullscreen?: boolean;
  enableAI?: boolean;
  onExperimentChange?: (experiment: Experiment) => void;
}

interface LabResults {
  score: number;
  timeSpent: number;
  attempts: number;
  conceptsLearned: string[];
}

interface Experiment {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  tags: string[];
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  component: React.FC;
}

interface LabVariable {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  description: string;
}

// Hook para debounce
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Componente de card de experimento otimizado
const ExperimentCard = React.memo(({ experiment, onClick, isSelected }: {
  experiment: Experiment;
  onClick: () => void;
  isSelected: boolean;
}) => {
  const IconComponent = experiment.icon;
  
  return (
    <motion.div
      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <IconComponent className="w-8 h-8 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {experiment.name}
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {experiment.description}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              experiment.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
              experiment.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {experiment.difficulty}
            </span>
            <span className="text-xs text-gray-400">
              {experiment.duration}min
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ExperimentCard.displayName = 'ExperimentCard';

// Lista virtualizada de experimentos
const VirtualizedExperimentList = React.memo(({ 
  experiments, 
  selectedExperiment, 
  onExperimentSelect 
}: {
  experiments: Experiment[];
  selectedExperiment: Experiment | null;
  onExperimentSelect: (experiment: Experiment) => void;
}) => {
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style} className="px-2">
      <ExperimentCard
        experiment={experiments[index]}
        onClick={() => onExperimentSelect(experiments[index])}
        isSelected={selectedExperiment?.id === experiments[index].id}
      />
    </div>
  ), [experiments, selectedExperiment, onExperimentSelect]);

  Row.displayName = 'ExperimentRow';

  return (
    <div className="h-full">
                <FixedSizeList
        height={600}
        itemCount={experiments.length}
        itemSize={120}
        width="100%"
        overscanCount={5}
      >
        {Row}
      </List>
    </div>
  );
});

VirtualizedExperimentList.displayName = 'VirtualizedExperimentList';

const EXPERIMENTS: Record<string, Experiment[]> = {
  chemistry: [
    {
      id: 'acid-base-titration',
      name: 'Titulação Ácido-Base',
      description: 'Determine a concentração de uma solução ácida usando titulação',
      category: 'chemistry',
      difficulty: 'intermediate',
      duration: 20,
      tags: ['química', 'titulação', 'pH', 'concentração'],
      icon: Beaker,
      component: () => <div>Titulação Component</div>
    },
    {
      id: 'chemical-reaction',
      name: 'Reação Química',
      description: 'Misture compostos e observe as reações com efeitos visuais',
      category: 'chemistry',
      difficulty: 'beginner',
      duration: 15,
      tags: ['química', 'reações', 'compostos', 'laboratório'],
      icon: Zap,
      component: () => <div>Reação Component</div>
    },
    {
      id: 'ph-measurement',
      name: 'Medição de pH',
      description: 'Meça o pH de diferentes soluções usando indicadores',
      category: 'chemistry',
      difficulty: 'beginner',
      duration: 10,
      tags: ['química', 'pH', 'indicadores', 'medição'],
      icon: Target,
      component: () => <div>pH Component</div>
    }
  ],
  physics: [
    {
      id: 'pendulum-motion',
      name: 'Movimento Pendular',
      description: 'Estude o movimento harmônico simples do pêndulo',
      category: 'physics',
      difficulty: 'beginner',
      duration: 15,
      tags: ['física', 'movimento', 'pêndulo', 'harmônico'],
      icon: Atom,
      component: () => <div>Pêndulo Component</div>
    },
    {
      id: 'bouncing-ball',
      name: 'Bola Saltitante',
      description: 'Explore gravidade e elasticidade com simulação de bola',
      category: 'physics',
      difficulty: 'beginner',
      duration: 12,
      tags: ['física', 'gravidade', 'elasticidade', 'movimento'],
      icon: Calculator,
      component: () => <div>Bola Component</div>
    },
    {
      id: 'wave-simulation',
      name: 'Simulação de Ondas',
      description: 'Visualize propriedades de ondas mecânicas',
      category: 'physics',
      difficulty: 'intermediate',
      duration: 18,
      tags: ['física', 'ondas', 'frequência', 'amplitude'],
      icon: BarChart3,
      component: () => <div>Ondas Component</div>
    }
  ],
  biology: [
    {
      id: 'cell-microscopy',
      name: 'Microscopia Celular',
      description: 'Observe diferentes tipos de células ao microscópio',
      category: 'biology',
      difficulty: 'beginner',
      duration: 20,
      tags: ['biologia', 'células', 'microscópio', 'estruturas'],
      icon: Microscope,
      component: () => <div>Microscopia Component</div>
    },
    {
      id: 'dna-extraction',
      name: 'Extração de DNA',
      description: 'Simule o processo de extração de DNA de células',
      category: 'biology',
      difficulty: 'intermediate',
      duration: 25,
      tags: ['biologia', 'DNA', 'extração', 'genética'],
      icon: BookOpen,
      component: () => <div>DNA Component</div>
    }
  ],
  mathematics: [
    {
      id: 'function-graphing',
      name: 'Gráficos de Funções',
      description: 'Explore propriedades de funções matemáticas',
      category: 'mathematics',
      difficulty: 'intermediate',
      duration: 15,
      tags: ['matemática', 'funções', 'gráficos', 'propriedades'],
      icon: TrendingUp,
      component: () => <div>Funções Component</div>
    },
    {
      id: 'color-mixing',
      name: 'Mistura de Cores',
      description: 'Explore teoria das cores RGB e CMYK',
      category: 'mathematics',
      difficulty: 'beginner',
      duration: 12,
      tags: ['matemática', 'cores', 'RGB', 'CMYK', 'teoria'],
      icon: Sparkles,
      component: () => <div>Cores Component</div>
    }
  ]
};

export default function VirtualLab({ 
  subject, 
  topic, 
  difficulty, 
  onComplete, 
  showSidebar = true, 
  enableFullscreen = true, 
  enableAI = true,
  onExperimentChange 
}: VirtualLabProps) {
  const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>({});
  const [variables, setVariables] = useState<LabVariable[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAI, setShowAI] = useState(enableAI);
  const [showSettings, setShowSettings] = useState(false);
  const [experimentData, setExperimentData] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Debounced values for performance
  const debouncedTemperature = useDebounce(variables.find(v => v.name === 'temperature')?.value || 25, 300);
  const debouncedConcentration = useDebounce(variables.find(v => v.name === 'concentration')?.value || 50, 300);

  // Memoized experiment list
  const availableExperiments = useMemo(() => {
    return EXPERIMENTS[subject] || [];
  }, [subject]);

  // Memoized filtered experiments
  const filteredExperiments = useMemo(() => {
    return availableExperiments.filter(exp => 
      exp.difficulty === difficulty || 
      (difficulty === 'beginner' && exp.difficulty === 'intermediate') ||
      (difficulty === 'intermediate' && exp.difficulty === 'advanced')
    );
  }, [availableExperiments, difficulty]);

  useEffect(() => {
    initializeExperiment();
  }, [subject, topic]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Update simulation when debounced values change
  useEffect(() => {
    if (isRunning && (debouncedTemperature !== 25 || debouncedConcentration !== 50)) {
      updateSimulation({ temperature: debouncedTemperature, concentration: debouncedConcentration });
    }
  }, [debouncedTemperature, debouncedConcentration, isRunning]);

  const initializeExperiment = useCallback(() => {
    const availableExperiments = EXPERIMENTS[subject];
    if (availableExperiments && availableExperiments.length > 0) {
      const experiment = availableExperiments.find(exp => exp.topic === topic) || availableExperiments[0];
      setCurrentExperiment(experiment);
      
      if (onExperimentChange) {
        onExperimentChange(experiment);
      }
      
      // Initialize variables based on experiment
      const defaultVariables: LabVariable[] = [
        { name: 'temperature', value: 25, min: 0, max: 100, step: 1, unit: '°C', description: 'Temperatura do ambiente' },
        { name: 'concentration', value: 50, min: 0, max: 100, step: 5, unit: '%', description: 'Concentração da solução' },
        { name: 'pressure', value: 1, min: 0.5, max: 2, step: 0.1, unit: 'atm', description: 'Pressão atmosférica' }
      ];
      setVariables(defaultVariables);
    }
  }, [subject, topic, onExperimentChange]);

  const updateSimulation = useCallback(async (params: any) => {
    try {
      const response = await fetch('/api/virtual-lab/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentId: currentExperiment?.id,
          parameters: params,
          action: 'update_parameters'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setExperimentData(data.data);
      }
    } catch (error) {
      console.error('Error updating simulation:', error);
    }
  }, [currentExperiment]);

  const startExperiment = useCallback(async () => {
    setIsRunning(true);
    setStartTime(new Date());
    setAttempts(prev => prev + 1);
    
    try {
      const response = await fetch('/api/virtual-lab/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentId: currentExperiment?.id,
          parameters: variables.reduce((acc, v) => ({ ...acc, [v.name]: v.value }), {}),
          action: 'start'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setExperimentData(data.data);
      }
    } catch (error) {
      console.error('Error starting experiment:', error);
    }
  }, [currentExperiment, variables]);

  const pauseExperiment = useCallback(async () => {
    setIsRunning(false);
    
    try {
      const response = await fetch('/api/virtual-lab/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentId: currentExperiment?.id,
          action: 'pause'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setExperimentData(data.data);
      }
    } catch (error) {
      console.error('Error pausing experiment:', error);
    }
  }, [currentExperiment]);

  const resetExperiment = useCallback(async () => {
    setIsRunning(false);
    setCurrentStep(0);
    setResults({});
    setShowResults(false);
    
    try {
      const response = await fetch('/api/virtual-lab/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentId: currentExperiment?.id,
          action: 'reset'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setExperimentData(data.data);
      }
    } catch (error) {
      console.error('Error resetting experiment:', error);
    }
  }, [currentExperiment]);

  const completeExperiment = useCallback(() => {
    const endTime = new Date();
    const timeSpent = startTime ? (endTime.getTime() - startTime.getTime()) / 1000 : 0;
    
    const labResults: LabResults = {
      score: Math.min(100, Math.max(0, 100 - attempts * 10 + Math.floor(timeSpent / 60) * 5)),
      timeSpent,
      attempts,
      conceptsLearned: currentExperiment?.tags || []
    };

    setResults(labResults);
    setShowResults(true);
    
    if (onComplete) {
      onComplete(labResults);
    }
  }, [startTime, attempts, currentExperiment, onComplete]);

  const toggleFullscreen = useCallback(async () => {
    if (!enableFullscreen) return;
    
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  }, [enableFullscreen]);

  const generateInsights = useCallback(async () => {
    if (!enableAI || !currentExperiment) return;
    
    try {
      const response = await fetch('/api/virtual-lab/ai/visual-effects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reaction: {
            type: currentExperiment.category,
            equation: currentExperiment.name
          },
          step: 'analysis',
          parameters: variables.reduce((acc, v) => ({ ...acc, [v.name]: v.value }), {})
        })
      });
      
      const data = await response.json();
      if (data.success && data.visualEffects) {
        const newInsights = [
          `Insight sobre ${currentExperiment.name}: ${data.visualEffects.rawResponse || 'Análise completa'}`,
          `Parâmetros otimizados: temperatura ${debouncedTemperature}°C, concentração ${debouncedConcentration}%`,
          `Próximo passo recomendado: ${currentStep < 5 ? 'Continue o experimento' : 'Analise os resultados'}`
        ];
        setInsights(newInsights);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  }, [enableAI, currentExperiment, variables, debouncedTemperature, debouncedConcentration, currentStep]);

  const updateVariable = useCallback((name: string, value: number) => {
    setVariables(prev => prev.map(v => 
      v.name === name ? { ...v, value } : v
    ));
  }, []);

  const selectExperiment = useCallback((experiment: Experiment) => {
    setCurrentExperiment(experiment);
    setCurrentStep(0);
    setIsRunning(false);
    setResults({});
    setShowResults(false);
    
    if (onExperimentChange) {
      onExperimentChange(experiment);
    }
  }, [onExperimentChange]);

  if (!currentExperiment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando laboratório virtual...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="flex h-full">
      {/* Sidebar */}
      {showSidebar && (
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Laboratório Virtual
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Matéria:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {subject}
                </span>
                <span className="text-sm text-gray-600">Dificuldade:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {difficulty}
                </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <VirtualizedExperimentList
                experiments={filteredExperiments}
                selectedExperiment={currentExperiment}
                onExperimentSelect={selectExperiment}
              />
                  </div>
            </div>
      )}
      
      {/* Main Content */}
        <div className="flex-1 flex flex-col">
      {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <currentExperiment.icon className="w-6 h-6 text-blue-600" />
                  <h1 className="text-xl font-semibold text-gray-900">
                    {currentExperiment.name}
                  </h1>
            </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currentExperiment.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    currentExperiment.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {currentExperiment.difficulty}
                  </span>
                  <span className="text-sm text-gray-500">
                    {currentExperiment.duration}min
                  </span>
          </div>
            </div>
              
              <div className="flex items-center space-x-2">
            {enableAI && (
              <button
                onClick={() => setShowAI(!showAI)}
                    className={`p-2 rounded-lg transition-colors ${
                      showAI ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}
              >
                    <Bot className="w-5 h-5" />
              </button>
            )}
                
            <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
                  <Settings className="w-5 h-5" />
            </button>
                
                {enableFullscreen && (
            <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
                )}
                </div>
              </div>
            </div>
            
          {/* Content Area */}
          <div className="flex-1 flex">
            {/* Experiment Area */}
            <div className="flex-1 p-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {currentExperiment.description}
          </h3>
          
                  {/* Experiment Controls */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={isRunning ? pauseExperiment : startExperiment}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isRunning 
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span>{isRunning ? 'Pausar' : 'Iniciar'}</span>
                      </button>
                      
                      <button
                        onClick={resetExperiment}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Resetar</span>
                      </button>
                      
                      {currentStep > 0 && (
                        <button
                          onClick={completeExperiment}
                          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Concluir</span>
                      </button>
                    )}
                  </div>
                    
                    {/* Progress */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / 10) * 100}%` }}
                      ></div>
                </div>
              </div>

                  {/* Variables with Debounced Controls */}
                  <DebouncedControls
                    parameters={variables.map(v => ({
                      name: v.name,
                      label: v.description,
                      type: 'slider' as const,
                      min: v.min,
                      max: v.max,
                      step: v.step,
                      unit: v.unit,
                      description: v.description,
                      defaultValue: v.value,
                      validator: (value) => ({
                        isValid: value >= v.min && value <= v.max,
                        error: value < v.min || value > v.max ? `Valor deve estar entre ${v.min} e ${v.max}` : undefined
                      })
                    }))}
                    onParameterChange={updateVariable}
                    onSave={(params) => {
                      console.log('Parâmetros salvos:', params);
                    }}
                    onReset={() => {
                      setVariables(prev => prev.map(v => ({ ...v, value: v.defaultValue || 25 })));
                    }}
                    onStart={startExperiment}
                    onPause={pauseExperiment}
                    isRunning={isRunning}
                    debounceDelay={300}
                    showValidation={true}
                    showTimestamps={false}
                    className="mb-6"
                  />
          
                  {/* Canvas Area */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <canvas
              ref={canvasRef}
                      className="w-full h-64 bg-white rounded border"
            />
          </div>
                </div>
              </div>
      </div>

            {/* AI Assistant */}
      {showAI && enableAI && (
              <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <span>Assistente IA</span>
            </h3>
                </div>
                
                <div className="flex-1 p-4 space-y-4">
            <button
                    onClick={generateInsights}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
            >
                    <Lightbulb className="w-4 h-4" />
                    <span>Gerar Insights</span>
            </button>
                  
                  {insights.length > 0 && (
              <div className="space-y-2">
                {insights.map((insight, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                    {insight}
                  </div>
                ))}
              </div>
                  )}
            </div>
              </div>
            )}
          </div>

          {/* Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
                className="bg-white border-t border-gray-200 p-6"
          >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resultados do Experimento
            </h3>
            
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-800">
                      {results.score}
              </div>
                    <div className="text-sm text-green-600">Pontuação</div>
              </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-800">
                      {Math.round(results.timeSpent)}s
              </div>
                    <div className="text-sm text-blue-600">Tempo Gasto</div>
            </div>
            
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-800">
                      {results.attempts}
              </div>
                    <div className="text-sm text-yellow-600">Tentativas</div>
            </div>
            
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-800">
                      {results.conceptsLearned.length}
                    </div>
                    <div className="text-sm text-purple-600">Conceitos</div>
                  </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
        </div>
      </div>
    </div>
  );
}