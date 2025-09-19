'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  BarChart3
} from 'lucide-react';

interface VirtualLabProps {
  subject: 'chemistry' | 'physics' | 'biology' | 'mathematics';
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  onComplete?: (results: LabResults) => void;
}

interface LabResults {
  score: number;
  timeSpent: number;
  attempts: number;
  conceptsLearned: string[];
  recommendations: string[];
}

interface Experiment {
  id: string;
  name: string;
  description: string;
  steps: ExperimentStep[];
  expectedResults: any;
  variables: LabVariable[];
  safetyNotes: string[];
}

interface ExperimentStep {
  id: string;
  title: string;
  description: string;
  action: string;
  expectedOutcome: string;
  isCompleted: boolean;
}

interface LabVariable {
  name: string;
  type: 'numeric' | 'categorical' | 'boolean';
  value: any;
  min?: number;
  max?: number;
  options?: string[];
  unit?: string;
}

const EXPERIMENTS: Record<string, Experiment[]> = {
  chemistry: [
    {
      id: 'acid-base-titration',
      name: 'Titulação Ácido-Base',
      description: 'Determine a concentração de uma solução ácida usando titulação com base conhecida.',
      steps: [
        {
          id: 'prepare-solutions',
          title: 'Preparar Soluções',
          description: 'Prepare a solução ácida desconhecida e a solução básica padrão.',
          action: 'Adicionar reagentes aos béqueres',
          expectedOutcome: 'Soluções preparadas com concentrações conhecidas',
          isCompleted: false
        },
        {
          id: 'add-indicator',
          title: 'Adicionar Indicador',
          description: 'Adicione algumas gotas de fenolftaleína à solução ácida.',
          action: 'Adicionar 2-3 gotas de indicador',
          expectedOutcome: 'Solução ácida com indicador',
          isCompleted: false
        },
        {
          id: 'titration',
          title: 'Realizar Titulação',
          description: 'Adicione a base gota a gota até o ponto de viragem.',
          action: 'Adicionar base lentamente',
          expectedOutcome: 'Mudança de cor no ponto de equivalência',
          isCompleted: false
        }
      ],
      expectedResults: {
        concentration: 0.1,
        pH: 7.0,
        volumeUsed: 25.0
      },
      variables: [
        { name: 'acidVolume', type: 'numeric', value: 25.0, min: 10, max: 50, unit: 'mL' },
        { name: 'baseConcentration', type: 'numeric', value: 0.1, min: 0.05, max: 0.2, unit: 'M' },
        { name: 'temperature', type: 'numeric', value: 25, min: 20, max: 30, unit: '°C' }
      ],
      safetyNotes: [
        'Use óculos de proteção',
        'Mantenha o ambiente ventilado',
        'Não misture ácidos e bases diretamente'
      ]
    }
  ],
  physics: [
    {
      id: 'pendulum-experiment',
      name: 'Experimento do Pêndulo',
      description: 'Investigue a relação entre o período e o comprimento de um pêndulo simples.',
      steps: [
        {
          id: 'setup-pendulum',
          title: 'Montar Pêndulo',
          description: 'Monte o pêndulo com massa conhecida e comprimento variável.',
          action: 'Ajustar comprimento do fio',
          expectedOutcome: 'Pêndulo montado corretamente',
          isCompleted: false
        },
        {
          id: 'measure-period',
          title: 'Medir Período',
          description: 'Meça o tempo de 10 oscilações completas.',
          action: 'Cronometrar oscilações',
          expectedOutcome: 'Período calculado com precisão',
          isCompleted: false
        },
        {
          id: 'analyze-data',
          title: 'Analisar Dados',
          description: 'Compare os resultados com a fórmula T = 2π√(L/g).',
          action: 'Calcular e comparar',
          expectedOutcome: 'Confirmação da lei do pêndulo',
          isCompleted: false
        }
      ],
      expectedResults: {
        period: 2.0,
        length: 1.0,
        gravity: 9.81
      },
      variables: [
        { name: 'length', type: 'numeric', value: 1.0, min: 0.5, max: 2.0, unit: 'm' },
        { name: 'mass', type: 'numeric', value: 0.1, min: 0.05, max: 0.2, unit: 'kg' },
        { name: 'angle', type: 'numeric', value: 15, min: 5, max: 30, unit: '°' }
      ],
      safetyNotes: [
        'Mantenha distância segura durante oscilações',
        'Use massa adequada para evitar acidentes'
      ]
    }
  ],
  biology: [
    {
      id: 'microscopy-cell',
      name: 'Observação de Células',
      description: 'Observe diferentes tipos de células ao microscópio e identifique suas estruturas.',
      steps: [
        {
          id: 'prepare-slides',
          title: 'Preparar Lâminas',
          description: 'Prepare lâminas com diferentes tipos de células.',
          action: 'Colocar células nas lâminas',
          expectedOutcome: 'Lâminas preparadas corretamente',
          isCompleted: false
        },
        {
          id: 'focus-microscope',
          title: 'Focar Microscópio',
          description: 'Ajuste o foco para visualizar as células claramente.',
          action: 'Ajustar objetiva e foco',
          expectedOutcome: 'Células visíveis com clareza',
          isCompleted: false
        },
        {
          id: 'identify-structures',
          title: 'Identificar Estruturas',
          description: 'Identifique núcleo, membrana e outras organelas.',
          action: 'Observar e identificar',
          expectedOutcome: 'Estruturas celulares identificadas',
          isCompleted: false
        }
      ],
      expectedResults: {
        cellType: 'eukaryotic',
        organelles: ['nucleus', 'membrane', 'cytoplasm'],
        magnification: 400
      },
      variables: [
        { name: 'magnification', type: 'numeric', value: 400, min: 100, max: 1000, unit: 'x' },
        { name: 'cellType', type: 'categorical', value: 'plant', options: ['plant', 'animal', 'bacterial'] },
        { name: 'stain', type: 'categorical', value: 'methylene_blue', options: ['methylene_blue', 'iodine', 'none'] }
      ],
      safetyNotes: [
        'Mantenha o microscópio limpo',
        'Não toque nas lentes',
        'Descarte adequadamente as lâminas usadas'
      ]
    }
  ],
  mathematics: [
    {
      id: 'function-graphing',
      name: 'Gráficos de Funções',
      description: 'Explore diferentes tipos de funções e seus gráficos interativamente.',
      steps: [
        {
          id: 'define-function',
          title: 'Definir Função',
          description: 'Escolha um tipo de função para explorar.',
          action: 'Selecionar tipo de função',
          expectedOutcome: 'Função definida com parâmetros',
          isCompleted: false
        },
        {
          id: 'plot-graph',
          title: 'Plotar Gráfico',
          description: 'Visualize o gráfico da função escolhida.',
          action: 'Gerar gráfico',
          expectedOutcome: 'Gráfico visualizado corretamente',
          isCompleted: false
        },
        {
          id: 'analyze-properties',
          title: 'Analisar Propriedades',
          description: 'Identifique domínio, imagem, zeros e outras propriedades.',
          action: 'Analisar características',
          expectedOutcome: 'Propriedades identificadas',
          isCompleted: false
        }
      ],
      expectedResults: {
        domain: 'all real numbers',
        range: 'y ≥ 0',
        zeros: [0],
        vertex: [0, 0]
      },
      variables: [
        { name: 'functionType', type: 'categorical', value: 'quadratic', options: ['linear', 'quadratic', 'exponential', 'logarithmic'] },
        { name: 'coefficientA', type: 'numeric', value: 1, min: -5, max: 5 },
        { name: 'coefficientB', type: 'numeric', value: 0, min: -5, max: 5 },
        { name: 'coefficientC', type: 'numeric', value: 0, min: -5, max: 5 }
      ],
      safetyNotes: [
        'Verifique os cálculos',
        'Use escala apropriada nos eixos'
      ]
    }
  ]
};

export default function VirtualLab({ subject, topic, difficulty, onComplete }: VirtualLabProps) {
  const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>({});
  const [variables, setVariables] = useState<LabVariable[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initializeExperiment();
  }, [subject, topic]);

  const initializeExperiment = () => {
    const availableExperiments = EXPERIMENTS[subject] || [];
    const experiment = availableExperiments[0]; // Por simplicidade, pega o primeiro
    
    if (experiment) {
      setCurrentExperiment(experiment);
      setVariables([...experiment.variables]);
      setResults({});
      setCurrentStep(0);
      setAttempts(0);
      setShowResults(false);
    }
  };

  const startExperiment = () => {
    setIsRunning(true);
    setStartTime(new Date());
    setAttempts(prev => prev + 1);
  };

  const completeStep = () => {
    if (!currentExperiment) return;

    const updatedSteps = [...currentExperiment.steps];
    updatedSteps[currentStep].isCompleted = true;
    
    setCurrentExperiment({
      ...currentExperiment,
      steps: updatedSteps
    });

    if (currentStep < currentExperiment.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeExperiment();
    }
  };

  const completeExperiment = () => {
    setIsRunning(false);
    const timeSpent = startTime ? Date.now() - startTime.getTime() : 0;
    
    const labResults: LabResults = {
      score: calculateScore(),
      timeSpent: Math.floor(timeSpent / 1000),
      attempts,
      conceptsLearned: currentExperiment?.steps.map(s => s.title) || [],
      recommendations: generateRecommendations()
    };

    setResults(labResults);
    setShowResults(true);
    onComplete?.(labResults);
  };

  const calculateScore = (): number => {
    if (!currentExperiment) return 0;
    
    const completedSteps = currentExperiment.steps.filter(s => s.isCompleted).length;
    const totalSteps = currentExperiment.steps.length;
    const baseScore = (completedSteps / totalSteps) * 100;
    
    // Bonus por completar rapidamente
    const timeBonus = startTime ? Math.max(0, 10 - Math.floor((Date.now() - startTime.getTime()) / 60000)) : 0;
    
    return Math.min(100, baseScore + timeBonus);
  };

  const generateRecommendations = (): string[] => {
    const recommendations = [];
    
    if (results.score < 70) {
      recommendations.push('Revise os conceitos básicos antes de prosseguir');
      recommendations.push('Pratique mais exercícios similares');
    } else if (results.score >= 90) {
      recommendations.push('Excelente! Você pode avançar para tópicos mais avançados');
      recommendations.push('Considere explorar variações do experimento');
    } else {
      recommendations.push('Bom trabalho! Continue praticando para melhorar');
    }
    
    return recommendations;
  };

  const updateVariable = (variableName: string, value: any) => {
    setVariables(prev => prev.map(v => 
      v.name === variableName ? { ...v, value } : v
    ));
  };

  const resetExperiment = () => {
    initializeExperiment();
    setIsRunning(false);
    setStartTime(null);
    setShowResults(false);
  };

  const getSubjectIcon = () => {
    switch (subject) {
      case 'chemistry': return <Beaker className="w-8 h-8" />;
      case 'physics': return <Atom className="w-8 h-8" />;
      case 'biology': return <Microscope className="w-8 h-8" />;
      case 'mathematics': return <Calculator className="w-8 h-8" />;
      default: return <BookOpen className="w-8 h-8" />;
    }
  };

  const getSubjectColor = () => {
    switch (subject) {
      case 'chemistry': return 'from-green-500 to-emerald-600';
      case 'physics': return 'from-blue-500 to-cyan-600';
      case 'biology': return 'from-purple-500 to-violet-600';
      case 'mathematics': return 'from-orange-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (!currentExperiment) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Carregando laboratório virtual...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${getSubjectColor()} text-white p-6 rounded-2xl`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getSubjectIcon()}
            <div>
              <h2 className="text-2xl font-bold">{currentExperiment.name}</h2>
              <p className="text-white/80">{currentExperiment.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{attempts}</div>
              <div className="text-sm text-white/80">Tentativas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : 0}s
              </div>
              <div className="text-sm text-white/80">Tempo</div>
            </div>
            <button
              onClick={resetExperiment}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controles do Experimento */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-2xl shadow-lg border"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            Controles
          </h3>
          
          <div className="space-y-4">
            <button
              onClick={startExperiment}
              disabled={isRunning}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Executando...' : 'Iniciar Experimento'}
            </button>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Progresso</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(currentStep / currentExperiment.steps.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {currentStep}/{currentExperiment.steps.length}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Dificuldade</label>
              <div className="p-2 bg-gray-50 rounded-lg">
                <span className="capitalize font-medium">{difficulty}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Passos do Experimento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-lg border"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            Passos do Experimento
          </h3>
          
          <div className="space-y-4">
            {currentExperiment.steps.map((step, index) => (
              <div
                key={step.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  index === currentStep
                    ? 'border-blue-300 bg-blue-50'
                    : step.isCompleted
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.isCompleted
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step.isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    {index === currentStep && isRunning && (
                      <button
                        onClick={completeStep}
                        className="mt-2 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors"
                      >
                        Completar Passo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Variáveis e Simulação */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-2xl shadow-lg border"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            Variáveis
          </h3>
          
          <div className="space-y-4">
            {variables.map((variable) => (
              <div key={variable.name} className="space-y-2">
                <label className="text-sm font-medium text-gray-600 capitalize">
                  {variable.name.replace(/([A-Z])/g, ' $1').trim()}
                  {variable.unit && ` (${variable.unit})`}
                </label>
                
                {variable.type === 'numeric' ? (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={variable.min}
                      max={variable.max}
                      value={variable.value}
                      onChange={(e) => updateVariable(variable.name, parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center text-sm font-medium">
                      {variable.value}{variable.unit}
                    </div>
                  </div>
                ) : variable.type === 'categorical' ? (
                  <select
                    value={variable.value}
                    onChange={(e) => updateVariable(variable.name, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {variable.options?.map((option) => (
                      <option key={option} value={option}>
                        {option.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="checkbox"
                    checked={variable.value}
                    onChange={(e) => updateVariable(variable.name, e.target.checked)}
                    className="w-4 h-4"
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* Canvas para simulação visual */}
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-600 mb-2 block">Simulação Visual</label>
            <canvas
              ref={canvasRef}
              width={300}
              height={200}
              className="w-full border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
        </motion.div>
      </div>

      {/* Notas de Segurança */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg"
      >
        <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Notas de Segurança
        </h4>
        <ul className="space-y-1 text-sm text-yellow-700">
          {currentExperiment.safetyNotes.map((note, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">•</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Resultados */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-2xl shadow-lg border"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Resultados do Experimento
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">{results.score}%</div>
                <div className="text-sm text-gray-600">Pontuação</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">{results.timeSpent}s</div>
                <div className="text-sm text-gray-600">Tempo Gasto</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500">{results.attempts}</div>
                <div className="text-sm text-gray-600">Tentativas</div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-bold mb-2">Conceitos Aprendidos:</h4>
              <div className="flex flex-wrap gap-2">
                {results.conceptsLearned?.map((concept, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {concept}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-bold mb-2">Recomendações:</h4>
              <ul className="space-y-1">
                {results.recommendations?.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
