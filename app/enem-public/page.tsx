"use client"

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Target, 
  Clock, 
  Users, 
  Zap, 
  Play,
  Settings,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EnemPublicModeSelector } from '@/components/enem/EnemPublicModeSelector';
import { EnemCustomizer } from '@/components/enem/EnemCustomizer';
import { EnemSimulatorV2 } from '@/components/enem/EnemSimulatorV2';
import { EnemResults } from '@/components/enem/EnemResults';
import { EnemMode, EnemArea, EnemScore } from '@/types/enem';
import { ExamGenerationLoading } from '@/components/enem/EnemLoadingStates';

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

function EnemPublicSimulatorContent() {
  const [appState, setAppState] = useState<AppState>('mode-selection');
  const [simulationConfig, setSimulationConfig] = useState<SimulationConfig | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [examItems, setExamItems] = useState<any[]>([]);
  const [score, setScore] = useState<EnemScore | null>(null);
  const [examResponses, setExamResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const handleModeSelect = useCallback(async (mode: EnemMode) => {
    setLoading(true);
    setError('');
    setLoadingProgress(0);
    setLoadingMessage('Iniciando simulado...');

    try {
      let config: SimulationConfig;

      switch (mode) {
        case 'QUICK':
          config = {
            mode: 'QUICK',
            areas: ['CN', 'CH', 'LC', 'MT'],
            numQuestions: 15,
            timeLimit: 30,
            difficultyDistribution: { easy: 0.2, medium: 0.6, hard: 0.2 }
          };
          break;
        case 'OFFICIAL':
          config = {
            mode: 'OFFICIAL',
            areas: ['CN', 'CH', 'LC', 'MT'],
            numQuestions: 180,
            timeLimit: 330, // 5h30min
            difficultyDistribution: { easy: 0.1, medium: 0.7, hard: 0.2 }
          };
          break;
        default:
          throw new Error('Modo não suportado');
      }

      await startSimulation(config);
    } catch (error: any) {
      console.error('Error in mode selection:', error);
      setError(error.message || 'Erro ao iniciar simulado');
      toast({ 
        title: 'Erro', 
        description: error.message || 'Não foi possível iniciar o simulado', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleCustomize = useCallback(() => {
    setAppState('customization');
  }, []);

  const startSimulation = useCallback(async (config: SimulationConfig) => {
    setLoading(true);
    setError('');
    setLoadingProgress(0);
    setLoadingMessage('Gerando questões...');

    // Simulate progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const response = await fetch('/api/enem-public/sessions', {
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

      clearInterval(progressInterval);
      setLoadingProgress(100);

      console.log('Session creation response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Session creation error:', errorText);
        throw new Error(`Failed to create session: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Session created successfully:', {
        sessionId: data.session_id,
        itemsCount: data.items?.length
      });
      
      setSimulationConfig(config);
      setSessionId(data.session_id);
      setExamItems(data.items);
      setAppState('simulation');
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }, []);

  const handleComplete = (finalScore: EnemScore, items: any[], responses: any[]) => {
    setScore(finalScore);
    setExamItems(items);
    setExamResponses(responses);
    setAppState('results');
  };

  const handleRetake = () => {
    setScore(null);
    setAppState('mode-selection');
  };

  const handleBackToSetup = () => {
    setAppState('mode-selection');
    setSimulationConfig(null);
    setSessionId(null);
    setExamItems([]);
    setScore(null);
    setExamResponses([]);
    setError('');
  };

  // Render based on current state
  if (appState === 'simulation' && sessionId && simulationConfig && examItems.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackToSetup}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                  Voltar
                </Button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-800">
                    Simulado ENEM - {simulationConfig.mode}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {simulationConfig.numQuestions} questões • {simulationConfig.areas.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <EnemSimulatorV2
          sessionId={sessionId}
          items={examItems}
          config={simulationConfig}
          onComplete={handleComplete}
        />
      </div>
    );
  }

  if (appState === 'results' && score) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackToSetup}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                  Voltar
                </Button>
                <h1 className="text-lg font-semibold text-gray-800">Resultados do Simulado</h1>
              </div>
            </div>
          </div>
        </div>
        
        <EnemResults
          score={score}
          sessionId={sessionId || ''}
          items={examItems}
          responses={examResponses}
          onRetake={handleRetake}
          onRefocus={() => {}}
        />
      </div>
    );
  }

  if (appState === 'customization') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setAppState('mode-selection')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                  Voltar
                </Button>
                <h1 className="text-lg font-semibold text-gray-800">Personalizar Simulado</h1>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto p-6">
          <EnemCustomizer
            onStart={(config) => startSimulation(config)}
            onBack={() => setAppState('mode-selection')}
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
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Simulador ENEM Público
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Prepare-se para o ENEM com questões oficiais de anos anteriores
            </p>
            
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-gray-800">Banco Completo de Questões</h2>
                  <p className="text-gray-600">15 anos de provas oficiais do ENEM</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">2009-2023</div>
                  <div className="text-sm text-gray-600">Anos de provas</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-green-600">15</div>
                  <div className="text-sm text-gray-600">Anos de história</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">2800+</div>
                  <div className="text-sm text-gray-600">Questões disponíveis</div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mt-4">
                Todas as questões são oficiais e foram aplicadas nas provas reais do ENEM, 
                garantindo uma preparação autêntica e eficaz para o exame.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto p-6">
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
          <ExamGenerationLoading
            currentStep={Math.ceil((loadingProgress / 100) * 3)}
            message={loadingMessage}
            showSteps={true}
          />
        )}

        {/* Mode Selection */}
        <EnemPublicModeSelector 
          onModeSelect={handleModeSelect}
          onCustomize={handleCustomize}
        />

        {/* Simple Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="text-blue-600 font-medium">
            📚 Questões reais do ENEM • Banco completo 2009-2023
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EnemPublicSimulatorPage() {
  return <EnemPublicSimulatorContent />;
}
