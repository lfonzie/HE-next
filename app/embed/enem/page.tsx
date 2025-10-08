"use client"

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EnemPublicModeSelector } from '@/components/enem/EnemPublicModeSelector';
import { EnemCustomizer } from '@/components/enem/EnemCustomizer';
import { EnemSimulatorV2 } from '@/components/enem/EnemSimulatorV2';
import { EnemResults } from '@/components/enem/EnemResults';
import { EnemMode, EnemArea, EnemScore } from '@/types/enem';
import { ExamGenerationLoading } from '@/components/enem/EnemLoadingStates';
import { EmbedWrapper } from '@/components/embed/EmbedWrapper';

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

function EnemEmbedContent() {
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
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackToSetup}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
                  Voltar
                </Button>
                <div>
                  <h1 className="text-base font-semibold text-gray-800">
                    Simulado ENEM - {simulationConfig.mode}
                  </h1>
                  <p className="text-xs text-gray-600">
                    {simulationConfig.numQuestions} questões
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
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackToSetup}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
                  Voltar
                </Button>
                <h1 className="text-base font-semibold text-gray-800">Resultados</h1>
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
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setAppState('mode-selection')}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
                Voltar
              </Button>
              <h1 className="text-base font-semibold text-gray-800">Personalizar Simulado</h1>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto p-4">
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
      {/* Header compacto para embed */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-blue-100 rounded-full p-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Simulador ENEM
            </h1>
            <p className="text-sm text-gray-600">
              Questões oficiais de anos anteriores
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto p-4">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
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
      </div>
    </div>
  );
}

export default function EnemEmbedPage() {
  return (
    <EmbedWrapper module="enem">
      <EnemEmbedContent />
    </EmbedWrapper>
  );
}

