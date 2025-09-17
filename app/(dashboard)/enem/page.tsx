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
  Brain,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EnemModeSelector } from '@/components/enem/EnemModeSelector';
import { EnemCustomizer } from '@/components/enem/EnemCustomizer';
import { EnemSimulatorV2 } from '@/components/enem/EnemSimulatorV2';
import { EnemResults } from '@/components/enem/EnemResults';
import { AuthGuard } from '@/components/AuthGuard';
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

interface LocalRecentSession {
  sessionId: string;
  createdAt: number;
  config: SimulationConfig;
  itemsCount: number;
}

function EnemSimulatorContent() {
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
  const [recentSessions, setRecentSessions] = useState<LocalRecentSession[]>([]);
  const { toast } = useToast();

  // Local persistence helpers
  const loadRecentSessions = useCallback(() => {
    try {
      const raw = localStorage.getItem('enem_recent_sessions');
      if (!raw) return [] as LocalRecentSession[];
      const parsed = JSON.parse(raw) as LocalRecentSession[];
      return Array.isArray(parsed) ? parsed.sort((a, b) => b.createdAt - a.createdAt) : [];
    } catch {
      return [];
    }
  }, []);

  const saveRecentSession = useCallback((entry: LocalRecentSession) => {
    try {
      const existing = loadRecentSessions();
      const filtered = existing.filter((s) => s.sessionId !== entry.sessionId);
      const next = [entry, ...filtered].slice(0, 5); // keep last 5
      localStorage.setItem('enem_recent_sessions', JSON.stringify(next));
      setRecentSessions(next);
    } catch {
      // ignore storage errors
    }
  }, [loadRecentSessions]);

  useEffect(() => {
    setRecentSessions(loadRecentSessions());
  }, [loadRecentSessions]);

  const handleModeSelect = useCallback(async (mode: EnemMode) => {
    setLoading(true);
    setError('');
    setLoadingProgress(0);
    setLoadingMessage('Iniciando simulado...');

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const handleCustomize = () => {
    setAppState('customization');
  };

  const handleCustomStart = async (config: SimulationConfig) => {
    setLoading(true);
    setError('');
    setLoadingProgress(0);
    setLoadingMessage('Iniciando simulado personalizado...');
    
    try {
      await startSimulation(config);
    } catch (err: any) {
      console.error('Error starting custom simulation:', err);
      setError(err.message || 'Falha ao iniciar simulado personalizado. Tente novamente.');
      toast({
        title: "Erro",
        description: err.message || "Falha ao iniciar simulado personalizado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startSimulation = useCallback(async (config: SimulationConfig) => {
    try {
      console.log('Creating session with config:', config);
      
      // Simulate progress updates
      const progressSteps = [
        { progress: 20, message: 'Configurando simulado...' },
        { progress: 40, message: 'Selecionando questões...' },
        { progress: 60, message: 'Preparando ambiente...' },
        { progress: 80, message: 'Finalizando configuração...' },
        { progress: 100, message: 'Simulado pronto!' }
      ];

      let currentStep = 0;
      const progressInterval = setInterval(() => {
        if (currentStep < progressSteps.length) {
          setLoadingProgress(progressSteps[currentStep].progress);
          setLoadingMessage(progressSteps[currentStep].message);
          currentStep++;
        } else {
          clearInterval(progressInterval);
        }
      }, 500);

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

      clearInterval(progressInterval);
      setLoadingProgress(100);

      console.log('Session creation response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Session creation error:', errorText);
        if (response.status === 401) {
          throw new Error('Please log in to access the ENEM simulator');
        }
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
      // Persist locally for resume
      saveRecentSession({
        sessionId: data.session_id,
        createdAt: Date.now(),
        config,
        itemsCount: Array.isArray(data.items) ? data.items.length : 0,
      });
      setAppState('simulation');
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }, [saveRecentSession]);

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
    setExamResponses([]);
    setError('');
  };

  const handleResumeLocal = useCallback(async (local: LocalRecentSession) => {
    try {
      // Attempt to fetch responses for cloud sessions; for local sessions, skip
      setSimulationConfig(local.config);
      setSessionId(local.sessionId);
      // We don't persist full items to localStorage to save space; regenerate a lightweight session by calling startSimulation
      // but to ensure resume UX is fast, we will try to call the sessions POST again with same config to get fresh items if needed.
      setLoading(true);
      setError('');
      await startSimulation(local.config);
    } catch (err: any) {
      console.error('Error resuming session:', err);
      setError(err.message || 'Falha ao retomar sessão.');
      toast({ title: 'Erro', description: 'Não foi possível retomar a sessão.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  // Render based on current state
  if (appState === 'simulation' && sessionId && simulationConfig) {
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
            items={examItems}
            responses={examResponses}
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
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Simulador ENEM
            </h1>
            <p className="text-lg text-gray-600">
              Prepare-se para o ENEM com questões oficiais de anos anteriores
            </p>
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
        <EnemModeSelector 
          onModeSelect={handleModeSelect}
          onCustomize={handleCustomize}
        />

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Sessões Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSessions.slice(0, 3).map((s) => (
                    <div key={s.sessionId} className="flex items-center justify-between border rounded-lg p-3">
                      <div className="text-sm">
                        <div className="font-medium">{s.config.mode} • {s.config.areas.join(', ')}</div>
                        <div className="text-gray-600">
                          {s.config.numQuestions} questões {s.config.timeLimit ? `• ${s.config.timeLimit} min` : ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(s.createdAt).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleResumeLocal(s)}>Continuar</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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

export default function EnemSimulatorPage() {
  return (
    <AuthGuard>
      <EnemSimulatorContent />
    </AuthGuard>
  );
}
