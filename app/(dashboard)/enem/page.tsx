"use client"

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Target, 
  Clock, 
  Users, 
  Sparkles,
  Zap, 
  Play,
  Settings,
  CheckCircle,
  AlertCircle,
  Brain,
  RefreshCw,
  ArrowRight,
  History
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EnemModeSelector } from '@/components/enem/EnemModeSelector';
import { EnemCustomizer } from '@/components/enem/EnemCustomizer';
import { EnemSimulatorV2 } from '@/components/enem/EnemSimulatorV2';
import { EnemResults } from '@/components/enem/EnemResults';
import { AuthGuard } from '@/components/AuthGuard';
import { EnemMode, EnemArea, EnemScore } from '@/types/enem';
import { ExamGenerationLoading } from '@/components/enem/EnemLoadingStates';
import { ModernHeader } from '@/components/layout/ModernHeader';

type AppState = 'mode-selection' | 'customization' | 'simulation' | 'results';

interface LocalRecentSession {
  sessionId: string;
  createdAt: number;
  config: SimulationConfig;
  itemsCount: number;
}

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
      setLoading(false); // Only set loading to false on error
    }
    // Note: setLoading(false) is handled in startSimulation on success
  };

  const startSimulation = useCallback(async (config: SimulationConfig) => {
    try {
      console.log('Creating session with config:', config);
      
      // Progress steps that reflect the actual process
      const progressSteps = [
        { progress: 10, message: 'Configurando simulado...' },
        { progress: 25, message: 'Acessando banco de questões...' },
        { progress: 40, message: 'Selecionando questões por área...' },
        { progress: 60, message: 'Aplicando distribuição de dificuldade...' },
        { progress: 75, message: 'Convertendo formato das questões...' },
        { progress: 90, message: 'Criando sessão no banco de dados...' },
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
      }, 800); // Increased interval to make progress more realistic

      // Start the actual API call
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

      // Clear progress interval and set final progress
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setLoadingMessage('Simulado pronto!');

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
      
      // Small delay to show completion message
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      
      // Set loading to false only after everything is ready
      setLoading(false);
      setAppState('simulation');
    } catch (error) {
      console.error('Error creating session:', error);
      setLoading(false); // Ensure loading is stopped on error
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


  // Render based on current state
  if (appState === 'simulation' && sessionId && simulationConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
        <ModernHeader showNavigation={true} showHome={true} />
        <div className="bg-white shadow-sm border-b border-yellow-200 pt-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                  Simulado ENEM - {simulationConfig.mode}
                </h1>
                <p className="text-sm text-gray-600">
                  {simulationConfig.numQuestions} questões • {simulationConfig.areas.join(', ')}
                  {simulationConfig.timeLimit && ` • ${simulationConfig.timeLimit} minutos`}
                </p>
              </div>
              <Button onClick={handleBackToSetup} variant="outline" className="border-yellow-400 text-yellow-700 hover:bg-yellow-50">
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
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
        <ModernHeader showNavigation={true} showHome={true} />
        <div className="bg-white shadow-sm border-b border-yellow-200 pt-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                  Resultados do Simulado
                </h1>
                <p className="text-sm text-gray-600">
                  Análise detalhada do seu desempenho
                </p>
              </div>
              <Button onClick={handleBackToSetup} variant="outline" className="border-yellow-400 text-yellow-700 hover:bg-yellow-50">
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
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
        <ModernHeader showNavigation={true} showHome={true} />
        <div className="bg-white shadow-sm border-b border-yellow-200 pt-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
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
            isCreating={loading}
          />
        </div>
      </div>
    );
  }

  // Default: Mode Selection
  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-100">
      <ModernHeader showNavigation={true} showHome={true} />
      <div className="container-fluid-lg mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-20 sm:pt-24" role="main">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-16">
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 rounded-2xl sm:rounded-3xl blur-3xl"></div>
            
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-xl border border-white/20">
              <div className="relative mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-4 sm:mb-6">
                  <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white fill-current" />
                </div>
              </div>
              
              <h1 className="type-display font-bold mb-4 sm:mb-6 bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                Simulador ENEM
              </h1>
              <p className="type-body-lg text-gray-600 mb-6 sm:mb-8 max-w-[65ch] mx-auto">
                Prepare-se para o ENEM com questões oficiais de anos anteriores
              </p>
              
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                <Badge variant="secondary" className="flex items-center gap-2 px-3 sm:px-4 py-2 type-small bg-yellow-100 text-yellow-800 border border-yellow-200">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  IA Avançada
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-3 sm:px-4 py-2 type-small bg-orange-100 text-orange-800 border border-orange-200">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  Personalizado
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-3 sm:px-4 py-2 type-small bg-red-100 text-red-800 border border-red-200">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  Interativo
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-3 sm:px-4 py-2 type-small bg-green-100 text-green-800 border border-green-200">
                  <Brain className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  Inteligente
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
                <div className="p-4 sm:p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl sm:rounded-2xl border border-yellow-200">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="type-h4 font-semibold text-yellow-900 mb-2">Questões Reais</h3>
                  <p className="type-small text-yellow-700">Banco completo com questões oficiais do ENEM</p>
                </div>
                <div className="p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl sm:rounded-2xl border border-orange-200">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="type-h4 font-semibold text-orange-900 mb-2">Simulados Personalizados</h3>
                  <p className="type-small text-orange-700">Configure seu simulado conforme suas necessidades</p>
                </div>
                <div className="p-4 sm:p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl sm:rounded-2xl border border-red-200">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="type-h4 font-semibold text-red-900 mb-2">Análise Inteligente</h3>
                  <p className="type-small text-red-700">Relatórios detalhados do seu desempenho</p>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-8">
            <ExamGenerationLoading
              currentStep={Math.ceil((loadingProgress / 100) * 3)}
              message={loadingMessage}
              showSteps={true}
            />
          </div>
        )}

        {/* Mode Selection */}
        <div className="mb-8 sm:mb-12">
          <EnemModeSelector 
            onModeSelect={handleModeSelect}
            onCustomize={handleCustomize}
          />
        </div>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="type-h2 font-bold text-gray-800 mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <History className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                Sessões Recentes
              </h3>
              <p className="type-body-lg text-gray-600 max-w-[65ch] mx-auto">
                Continue de onde parou ou revise seus simulados anteriores
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recentSessions.slice(0, 3).map((s) => (
                <Card key={s.sessionId} className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <Play className="h-4 w-4 text-white" />
                      </div>
                      {s.config.mode}
                    </CardTitle>
                    <CardDescription>
                      {s.config.areas.join(', ')} • {s.config.numQuestions} questões
                      {s.config.timeLimit && ` • ${s.config.timeLimit} min`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-500">
                        {new Date(s.createdAt).toLocaleString('pt-BR')}
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => handleResumeLocal(s)}
                        size="sm"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Continuar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200 rounded-2xl">
            <BookOpen className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">
              📚 Questões reais do ENEM • Banco completo 2009-2023
            </span>
          </div>
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
