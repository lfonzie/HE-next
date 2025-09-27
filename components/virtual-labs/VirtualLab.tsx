'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
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
  category: 'chemistry' | 'physics' | 'biology' | 'mathematics';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // em minutos
  tags: string[];
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  component?: React.FC;
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
      ],
      category: 'chemistry',
      difficulty: 'intermediate',
      duration: 15,
      tags: ['química', 'titulação', 'ácido-base', 'laboratório']
    },
    {
      id: 'chemical-reaction',
      name: 'Reação Química',
      description: 'Misture compostos químicos e veja a IA prever o resultado, com explicações científicas e efeitos visuais.',
      steps: [
        {
          id: 'select-compounds',
          title: 'Selecionar Compostos',
          description: 'Escolha os compostos químicos para misturar.',
          action: 'Selecionar reagentes',
          expectedOutcome: 'Compostos selecionados',
          isCompleted: false
        },
        {
          id: 'mix-compounds',
          title: 'Misturar Compostos',
          description: 'Combine os compostos e observe a reação.',
          action: 'Misturar reagentes',
          expectedOutcome: 'Reação química observada',
          isCompleted: false
        },
        {
          id: 'analyze-result',
          title: 'Analisar Resultado',
          description: 'Analise o produto da reação e suas propriedades.',
          action: 'Examinar produto',
          expectedOutcome: 'Produto identificado e analisado',
          isCompleted: false
        }
      ],
      expectedResults: {
        product: 'NaCl + H2O',
        reactionType: 'neutralization',
        pH: 7.0
      },
      variables: [
        { name: 'temperature', type: 'numeric', value: 25, min: 0, max: 100, unit: '°C' },
        { name: 'concentration', type: 'numeric', value: 50, min: 10, max: 100, unit: '%' },
        { name: 'volume', type: 'numeric', value: 50, min: 10, max: 100, unit: 'mL' }
      ],
      safetyNotes: [
        'Use equipamentos de proteção',
        'Mantenha ventilação adequada',
        'Descarte produtos adequadamente'
      ],
      category: 'chemistry',
      difficulty: 'beginner',
      duration: 12,
      tags: ['química', 'reações', 'compostos', 'laboratório']
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
      ],
      category: 'physics',
      difficulty: 'beginner',
      duration: 10,
      tags: ['física', 'movimento', 'pêndulo', 'harmônico']
    },
    {
      id: 'bouncing-ball',
      name: 'Bola Saltitante',
      description: 'Explore gravidade e elasticidade. Ajuste o coeficiente de restituição e observe o comportamento da bola.',
      steps: [
        {
          id: 'setup-ball',
          title: 'Configurar Bola',
          description: 'Configure a bola com diferentes propriedades físicas.',
          action: 'Ajustar propriedades da bola',
          expectedOutcome: 'Bola configurada',
          isCompleted: false
        },
        {
          id: 'drop-ball',
          title: 'Soltar Bola',
          description: 'Solte a bola e observe seu movimento.',
          action: 'Soltar bola',
          expectedOutcome: 'Movimento da bola observado',
          isCompleted: false
        },
        {
          id: 'analyze-motion',
          title: 'Analisar Movimento',
          description: 'Analise o movimento e calcule a energia.',
          action: 'Calcular energia',
          expectedOutcome: 'Energia calculada',
          isCompleted: false
        }
      ],
      expectedResults: {
        restitution: 0.8,
        energyLoss: 0.2,
        bounceHeight: 0.64
      },
      variables: [
        { name: 'restitution', type: 'numeric', value: 0.8, min: 0.1, max: 1.0, unit: '' },
        { name: 'gravity', type: 'numeric', value: 9.81, min: 5, max: 15, unit: 'm/s²' },
        { name: 'airResistance', type: 'numeric', value: 0.1, min: 0, max: 0.5, unit: '' }
      ],
      safetyNotes: [
        'Mantenha distância segura',
        'Use bola adequada'
      ],
      category: 'physics',
      difficulty: 'beginner',
      duration: 8,
      tags: ['física', 'gravidade', 'elasticidade', 'movimento']
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
      ],
      category: 'biology',
      difficulty: 'beginner',
      duration: 15,
      tags: ['biologia', 'células', 'microscópio', 'organelas']
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
      ],
      category: 'mathematics',
      difficulty: 'intermediate',
      duration: 20,
      tags: ['matemática', 'funções', 'gráficos', 'análise']
    },
    {
      id: 'color-mixing',
      name: 'Mistura de Cores',
      description: 'Explore a teoria das cores e como diferentes combinações criam novas cores. Experimente com RGB e CMYK.',
      steps: [
        {
          id: 'select-colors',
          title: 'Selecionar Cores',
          description: 'Escolha as cores primárias para misturar.',
          action: 'Selecionar cores',
          expectedOutcome: 'Cores selecionadas',
          isCompleted: false
        },
        {
          id: 'mix-colors',
          title: 'Misturar Cores',
          description: 'Combine as cores e observe o resultado.',
          action: 'Misturar cores',
          expectedOutcome: 'Cores misturadas',
          isCompleted: false
        },
        {
          id: 'analyze-result',
          title: 'Analisar Resultado',
          description: 'Analise a cor resultante e suas propriedades.',
          action: 'Analisar cor',
          expectedOutcome: 'Cor analisada',
          isCompleted: false
        }
      ],
      expectedResults: {
        rgb: { red: 128, green: 128, blue: 128 },
        hsl: { hue: 0, saturation: 0, lightness: 50 },
        hex: '#808080'
      },
      variables: [
        { name: 'red', type: 'numeric', value: 128, min: 0, max: 255, unit: '' },
        { name: 'green', type: 'numeric', value: 128, min: 0, max: 255, unit: '' },
        { name: 'blue', type: 'numeric', value: 128, min: 0, max: 255, unit: '' }
      ],
      safetyNotes: [
        'Use cores adequadas',
        'Verifique acessibilidade'
      ],
      category: 'mathematics',
      difficulty: 'beginner',
      duration: 12,
      tags: ['matemática', 'cores', 'RGB', 'CMYK', 'teoria']
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
      setInsights([]);
      setExperimentData(null);
      
      // Notify parent component about experiment change
      if (onExperimentChange) {
        onExperimentChange(experiment);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!enableFullscreen) return;
    
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleExperimentChange = (experimentId: string) => {
    const availableExperiments = EXPERIMENTS[subject] || [];
    const experiment = availableExperiments.find(exp => exp.id === experimentId);
    
    if (experiment) {
      setCurrentExperiment(experiment);
      setVariables([...experiment.variables]);
      setResults({});
      setCurrentStep(0);
      setShowResults(false);
      setInsights([]);
      setExperimentData(null);
      
      if (onExperimentChange) {
        onExperimentChange(experiment);
      }
    }
  };

  const startExperiment = () => {
    setIsRunning(true);
    setStartTime(new Date());
    setAttempts(prev => prev + 1);
    setInsights([]);
    
    // Generate initial insights based on experiment
    const initialInsights = generateInsights();
    setInsights(initialInsights);
  };

  const generateInsights = (): string[] => {
    if (!currentExperiment) return [];
    
    const insights = [];
    
    // Subject-specific insights
    switch (currentExperiment.category) {
      case 'chemistry':
        insights.push('💡 Dica: Observe as mudanças de cor e temperatura durante a reação');
        insights.push('🔬 Lembre-se: Sempre use equipamentos de proteção');
        break;
      case 'physics':
        insights.push('⚡ Dica: Meça com precisão para obter resultados confiáveis');
        insights.push('📊 Lembre-se: Registre todas as observações');
        break;
      case 'biology':
        insights.push('🔍 Dica: Ajuste o foco gradualmente para melhor visualização');
        insights.push('📝 Lembre-se: Desenhe o que você observa');
        break;
      case 'mathematics':
        insights.push('📈 Dica: Varie os parâmetros para entender melhor o comportamento');
        insights.push('🧮 Lembre-se: Verifique seus cálculos');
        break;
    }
    
    // Difficulty-specific insights
    if (currentExperiment.difficulty === 'beginner') {
      insights.push('🌟 Você está no nível iniciante - não se preocupe com erros!');
    } else if (currentExperiment.difficulty === 'advanced') {
      insights.push('🚀 Nível avançado - você pode explorar variações complexas');
    }
    
    return insights;
  };

  const completeStep = () => {
    if (!currentExperiment) return;

    const updatedSteps = [...currentExperiment.steps];
    updatedSteps[currentStep].isCompleted = true;
    
    setCurrentExperiment({
      ...currentExperiment,
      steps: updatedSteps
    });

    // Add step-specific insights
    const stepInsights = generateStepInsights(currentStep);
    setInsights(prev => [...prev, ...stepInsights]);

    if (currentStep < currentExperiment.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeExperiment();
    }
  };

  const generateStepInsights = (stepIndex: number): string[] => {
    if (!currentExperiment) return [];
    
    const step = currentExperiment.steps[stepIndex];
    const insights = [];
    
    // Step-specific insights based on the step title
    if (step.title.includes('Preparar') || step.title.includes('Configurar')) {
      insights.push('✅ Preparação concluída! Agora você pode prosseguir');
    } else if (step.title.includes('Medir') || step.title.includes('Observar')) {
      insights.push('📏 Medição realizada! Registre o valor obtido');
    } else if (step.title.includes('Analisar') || step.title.includes('Calcular')) {
      insights.push('🧠 Análise concluída! Compare com os valores esperados');
    }
    
    return insights;
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
    <div className={`flex h-full font-sans antialiased overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''
    }`}>
      {/* Sidebar */}
      {showSidebar && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 bg-gray-900 text-white p-6 overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Laboratório Virtual</h2>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Tela cheia"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-2">{getSubjectIcon()} {subject.charAt(0).toUpperCase() + subject.slice(1)}</h3>
              <p className="text-sm text-gray-300">{currentExperiment?.name}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 text-xs rounded ${
                  currentExperiment?.difficulty === 'beginner' ? 'bg-green-600' :
                  currentExperiment?.difficulty === 'intermediate' ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                  {currentExperiment?.difficulty}
                </span>
                <span className="text-xs text-gray-400">{currentExperiment?.duration} min</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Experimentos Disponíveis</h4>
              {EXPERIMENTS[subject]?.map((experiment) => (
                <button
                  key={experiment.id}
                  onClick={() => handleExperimentChange(experiment.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentExperiment?.id === experiment.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="font-medium">{experiment.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{experiment.description}</div>
                  <div className="flex gap-1 mt-2">
                    {experiment.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-700 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
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
            {enableAI && (
              <button
                onClick={() => setShowAI(!showAI)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                title="Assistente IA"
              >
                <Bot className="w-4 h-4" />
                IA
              </button>
            )}
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

      {/* AI Assistant Panel */}
      {showAI && enableAI && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Assistente IA
            </h3>
            <button
              onClick={() => setShowAI(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Insights Inteligentes
              </h4>
              <div className="space-y-2">
                {insights.map((insight, index) => (
                  <div key={index} className="text-sm bg-white/10 p-2 rounded">
                    {insight}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Sugestões de Melhoria
              </h4>
              <div className="text-sm space-y-1">
                <p>• Varie os parâmetros para explorar diferentes cenários</p>
                <p>• Registre suas observações em um caderno</p>
                <p>• Compare seus resultados com os valores esperados</p>
                <p>• Experimente diferentes configurações</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

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
      </main>
    </div>
  );
}
