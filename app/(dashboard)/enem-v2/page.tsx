"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Target, 
  Clock, 
  Users, 
  Zap, 
  Play,
  Trophy,
  BarChart3,
  Settings,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Brain,
  Award,
  History,
  Bookmark,
  RefreshCw,
  Download,
  Share2,
  Calendar,
  Timer,
  FileText,
  User,
  Globe,
  CheckSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EnemModeSelector } from '@/components/enem/EnemModeSelector';
import { EnemCustomizer } from '@/components/enem/EnemCustomizer';
import { EnemSimulatorV2 } from '@/components/enem/EnemSimulatorV2';
import { EnemResults } from '@/components/enem/EnemResults';
import { AuthGuard } from '@/components/AuthGuard';
import { EnemMode, EnemArea, EnemScore } from '@/types/enem';

type AppState = 'mode-selection' | 'customization' | 'simulation' | 'results';

interface SimulationConfig {
  mode: EnemMode;
  areas: EnemArea[];
  numQuestions: number;
  timeLimit?: number;
  difficultyDistribution?: {
    easy: number;
    medium: number;
    hard: number;
  };
  year?: number;
}

function EnemSimulatorContent() {
  const [appState, setAppState] = useState<AppState>('mode-selection');
  const [simulationConfig, setSimulationConfig] = useState<SimulationConfig | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [examItems, setExamItems] = useState<any[]>([]);
  const [score, setScore] = useState<EnemScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const areasConfig = [
    {
      area: 'Linguagens',
      icon: <BookOpen className="h-6 w-6" />,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600',
      description: 'Português, Literatura, Inglês/Espanhol',
      competencies: ['Leitura', 'Interpretação', 'Gramática', 'Redação'],
      typicalQuestions: 45,
      suggestedTime: 90
    },
    {
      area: 'Ciências Humanas',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600',
      description: 'História, Geografia, Filosofia, Sociologia',
      competencies: ['Análise Histórica', 'Geografia', 'Filosofia', 'Sociologia'],
      typicalQuestions: 45,
      suggestedTime: 90
    },
    {
      area: 'Ciências da Natureza',
      icon: <Zap className="h-6 w-6" />,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600',
      description: 'Física, Química, Biologia',
      competencies: ['Física', 'Química', 'Biologia', 'Meio Ambiente'],
      typicalQuestions: 45,
      suggestedTime: 90
    },
    {
      area: 'Matemática',
      icon: <Target className="h-6 w-6" />,
      color: 'bg-orange-500',
      gradient: 'from-orange-500 to-orange-600',
      description: 'Álgebra, Geometria, Estatística',
      competencies: ['Álgebra', 'Geometria', 'Estatística', 'Funções'],
      typicalQuestions: 45,
      suggestedTime: 90
    }
  ];

  const handleModeSelect = async (mode: EnemMode) => {
    setLoading(true);
    setError('');

    try {
      // Create session based on mode
      let config: SimulationConfig;
      
      switch (mode) {
        case 'QUICK':
          config = {
            mode: 'QUICK',
            areas: ['CN', 'CH', 'LC', 'MT'],
            numQuestions: 15,
            timeLimit: 30
          };
          break;
        case 'OFFICIAL':
          config = {
            mode: 'OFFICIAL',
            areas: ['CN', 'CH', 'LC', 'MT'],
            numQuestions: 180,
            timeLimit: 330,
            year: 2023
          };
          break;
        case 'ADAPTIVE':
          config = {
            mode: 'ADAPTIVE',
            areas: ['CN', 'CH', 'LC', 'MT'],
            numQuestions: 30,
            timeLimit: 90
          };
          break;
        default:
          throw new Error('Invalid mode');
      }

      await startSimulation(config);
    } catch (err: any) {
      console.error('Error starting simulation:', err);
      setError(err.message || 'Falha ao iniciar simulado. Tente novamente.');
      toast({
        title: "Erro",
        description: err.message || "Falha ao iniciar simulado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomize = () => {
    setAppState('customization');
  };

  const handleCustomStart = async (config: SimulationConfig) => {
    await startSimulation(config);
  };

  const startSimulation = async (config: SimulationConfig) => {
    try {
      const response = await fetch('/api/enem/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: config.mode,
          area: config.areas,
          config: {
            num_questions: config.numQuestions,
            time_limit: config.timeLimit,
            difficulty_distribution: config.difficultyDistribution,
            year: config.year
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      
      setSimulationConfig(config);
      setSessionId(data.session_id);
      setExamItems(data.items);
      setAppState('simulation');
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const handleComplete = (finalScore: EnemScore) => {
    setScore(finalScore);
    setAppState('results');
  };

  const handleRetake = () => {
    setScore(null);
    setAppState('mode-selection');
  };

  const handleRefocus = (topics: string[]) => {
    // Create a new session focused on weak topics
    const refocusConfig: SimulationConfig = {
      mode: 'CUSTOM',
      areas: simulationConfig?.areas || ['CN', 'CH', 'LC', 'MT'],
      numQuestions: Math.min(20, topics.length * 3),
      timeLimit: 60,
      difficultyDistribution: { easy: 0, medium: 1, hard: 0 }
    };
    
    startSimulation(refocusConfig);
  };

  const handleBackToSetup = () => {
    setAppState('mode-selection');
    setSimulationConfig(null);
    setSessionId(null);
    setExamItems([]);
    setScore(null);
    setError('');
  };

  // Render based on current state
  if (appState === 'simulation' && sessionId && examItems.length > 0 && simulationConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Simulado ENEM - {simulationConfig.mode}
                </h1>
                <p className="text-sm text-gray-600">
                  {simulationConfig.numQuestions} questões • {simulationConfig.areas.join(', ')}
                  {simulationConfig.timeLimit && ` • ${simulationConfig.timeLimit} minutos`}
                </p>
              </div>
              <Button onClick={handleBackToSetup} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Voltar à Configuração
              </Button>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto p-6">
          <EnemSimulatorV2 
            sessionId={sessionId}
            items={examItems}
            config={simulationConfig}
            onComplete={handleComplete}
          />
        </div>
      </div>
    );
  }

  if (appState === 'results' && score) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Resultados do Simulado
                </h1>
                <p className="text-sm text-gray-600">
                  Análise detalhada do seu desempenho
                </p>
              </div>
              <Button onClick={handleBackToSetup} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Novo Simulado
              </Button>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto p-6">
          <EnemResults 
            score={score}
            sessionId={sessionId!}
            onRetake={handleRetake}
            onRefocus={handleRefocus}
          />
        </div>
      </div>
    );
  }

  if (appState === 'customization') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Personalizar Simulado
                </h1>
                <p className="text-sm text-gray-600">
                  Configure seu simulado personalizado
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto p-6">
          <EnemCustomizer 
            onBack={() => setAppState('mode-selection')}
            onStart={handleCustomStart}
          />
        </div>
      </div>
    );
  }

  // Default: Mode Selection
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Simulador ENEM Avançado
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Prepare-se para o ENEM com simulados inteligentes, análise detalhada de desempenho 
              e questões baseadas em exames reais. Sistema adaptativo com IA especializada.
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto p-6">
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold">Questões Reais</h3>
              <p className="text-sm text-gray-600">Questões reais do ENEM</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Brain className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold">IA Avançada</h3>
              <p className="text-sm text-gray-600">Análise adaptativa e personalizada</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold">TRI Real</h3>
              <p className="text-sm text-gray-600">Correção oficial do ENEM</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <History className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold">Histórico</h3>
              <p className="text-sm text-gray-600">Evolução do desempenho</p>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="mb-6">
            <CardContent className="py-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-3 text-blue-600 mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-lg font-semibold">Gerando Simulado...</span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>🧠 Selecionando questões personalizadas</p>
                  <p>⚡ Calibrando nível de dificuldade</p>
                  <p>📊 Preparando sistema de correção TRI</p>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mode Selection */}
        <EnemModeSelector 
          onModeSelect={handleModeSelect}
          onCustomize={handleCustomize}
        />

        {/* Footer Info */}
        <div className="mt-8 text-center space-y-4 text-sm text-gray-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              💡 <strong>Dica Profissional:</strong> Para máxima precisão, use 45 questões 
              e 150 minutos por área, simulando as condições reais do ENEM.
            </div>
            <div>
              🎯 <strong>Sistema Adaptativo:</strong> O simulador aprende com seu desempenho 
              e sugere áreas de foco personalizado.
            </div>
          </div>
          
          <p className="text-blue-600 font-medium">
            🤖 Sistema IA Especializada • Questões de alta qualidade geradas automaticamente
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EnemSimulatorPage() {
  return (
    <AuthGuard>
      <EnemSimulatorContent />
    </AuthGuard>
  );
}
