"use client"

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  XCircle,
  Flag,
  RotateCcw,
  Download,
  Share2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { EnemItem, EnemResponse, EnemScore, EnemMode, EnemArea } from '@/types/enem';
import { useToast } from '@/hooks/use-toast';
import { EnemLoadingScreen } from '@/components/ui/LoadingScreen';
import { ExamGenerationLoading } from '@/components/enem/EnemLoadingStates';

// Função para determinar o texto do chip baseado na origem da pergunta
function getQuestionSourceChip(question: EnemItem | null): { text: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  if (!question) {
    return { text: "ENEM Local", variant: "default" };
  }
  
  // Check metadata first for explicit source information
  if (question.metadata?.source) {
    switch (question.metadata.source) {
      case 'LOCAL_DATABASE':
        return {
          text: `ENEM ${question.year || question.metadata.original_year || 'Local'}`,
          variant: "default"
        }
      case 'DATABASE':
        return {
          text: `ENEM ${question.year || question.metadata.original_year || 'API'}`,
          variant: "default"
        }
      case 'AI':
        return {
          text: "IA",
          variant: "secondary"
        }
    }
  }
  
  // Check if it's an official ENEM question
  if (question.metadata?.is_official_enem) {
    return {
      text: `ENEM ${question.year || question.metadata.original_year || 'Local'}`,
      variant: "default"
    }
  }
  
  // Check if it's AI generated
  if (question.metadata?.is_ai_generated) {
    return {
      text: "IA",
      variant: "secondary"
    }
  }
  
  // Se tem year definido e não é o ano atual, provavelmente é do banco local
  if (question.year && question.year !== new Date().getFullYear()) {
    return {
      text: `ENEM ${question.year}`,
      variant: "default"
    }
  }
  
  // Se tem ID que começa com "enem_", é do banco local
  if (question.item_id) {
    if (question.item_id.startsWith('enem_')) {
      const year = question.year || 'Local'
      return {
        text: `ENEM ${year}`,
        variant: "default"
      }
    }
    if (question.item_id.startsWith('ai_generated_') || question.item_id.startsWith('generated_')) {
      return {
        text: "IA",
        variant: "secondary"
      }
    }
  }
  
  // Default: assumir que é do banco local do ENEM
  return {
    text: "ENEM Local",
    variant: "default"
  }
}

interface EnemSimulatorV2Props {
  sessionId: string;
  items: EnemItem[];
  config: {
    mode: EnemMode;
    areas: EnemArea[];
    numQuestions: number;
    timeLimit?: number;
  };
  onComplete: (score: EnemScore, items: EnemItem[], responses: EnemResponse[]) => void;
}

export function EnemSimulatorV2({ sessionId, items, config, onComplete }: EnemSimulatorV2Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<string, EnemResponse>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationMessage, setGenerationMessage] = useState('');
  const { toast } = useToast();

  const currentItem = items[currentQuestionIndex];
  const currentResponse = responses.get(currentItem?.item_id);

  // Simulate exam generation loading when component mounts
  useEffect(() => {
    if (items.length === 0) {
      setIsGeneratingExam(true);
      setGenerationProgress(0);
      setGenerationMessage('Gerando simulado ENEM...');
      
      // Simulate progressive loading
      const progressSteps = [
        { progress: 20, message: 'Configurando simulado ENEM...' },
        { progress: 40, message: 'Selecionando questões oficiais...' },
        { progress: 60, message: 'Analisando competências...' },
        { progress: 80, message: 'Preparando sistema TRI...' },
        { progress: 100, message: 'Simulado pronto!' }
      ];

      let currentStep = 0;
      const progressInterval = setInterval(() => {
        if (currentStep < progressSteps.length) {
          setGenerationProgress(progressSteps[currentStep].progress);
          setGenerationMessage(progressSteps[currentStep].message);
          currentStep++;
        } else {
          clearInterval(progressInterval);
          setIsGeneratingExam(false);
        }
      }, 800);

      return () => clearInterval(progressInterval);
    }
  }, [items.length]);

  // Initialize timer
  useEffect(() => {
    if (config.timeLimit && !isCompleted) {
      setTimeRemaining(config.timeLimit * 60); // Convert to seconds
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [config.timeLimit, isCompleted]);

  // Track tab switches for anti-cheating
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        if (tabSwitchCount >= 3) {
          setShowWarning(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [tabSwitchCount]);

  const handleAnswerSelect = useCallback(async (answer: string) => {
    if (!currentItem || isCompleted) return;

    // Validate session ID
    if (!sessionId) {
      console.error('No session ID available');
      toast({
        title: "Erro",
        description: "ID da sessão não encontrado. Reinicie o simulado.",
        variant: "destructive"
      });
      return;
    }

    const startTime = Date.now();
    
    // Save response locally first
    const response: EnemResponse = {
      response_id: `resp_${Date.now()}`,
      session_id: sessionId,
      item_id: currentItem.item_id,
      selected_answer: answer as any,
      time_spent: 0, // Will be calculated when saved
      is_correct: answer === currentItem.correct_answer,
      timestamp: new Date()
    };

    setResponses(prev => new Map(prev.set(currentItem.item_id, response)));
    setIsSaving(true);

    // Save to server
    try {
      console.log('Saving response with session ID:', sessionId);
      const serverResponse = await fetch('/api/enem/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          item_id: currentItem.item_id,
          selected_answer: answer,
          time_spent: Math.floor((Date.now() - startTime) / 1000)
        })
      });

      console.log('Response status:', serverResponse.status);
      
      if (!serverResponse.ok) {
        const errorText = await serverResponse.text();
        console.error('Server response error:', errorText);
        
        // For 404 errors (item not found), don't throw error as response is saved locally
        if (serverResponse.status === 404) {
          console.log('Item not found in database, but response saved locally');
          return; // Exit successfully
        }
        
        throw new Error(`Failed to save response: ${serverResponse.status} - ${errorText}`);
      }
      
      const responseData = await serverResponse.json();
      console.log('Response saved successfully:', responseData);
    } catch (error) {
      console.error('Error saving response:', error);
      toast({
        title: "Erro",
        description: `Falha ao salvar resposta: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [currentItem, sessionId, isCompleted, toast]);

  const handleNext = () => {
    if (currentQuestionIndex < items.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleTimeUp = async () => {
    setIsCompleted(true);
    await calculateScore();
  };

  const handleCompleteExam = async () => {
    if (responses.size < items.length) {
      const confirmed = confirm(
        `Você respondeu apenas ${responses.size} de ${items.length} questões. ` +
        'Deseja finalizar mesmo assim?'
      );
      if (!confirmed) return;
    }

    setIsCompleted(true);
    await calculateScore();
  };

  const calculateScore = async () => {
    try {
      // Validações mais robustas
      if (!sessionId) {
        throw new Error('ID da sessão não encontrado');
      }

      if (responses.size === 0) {
        throw new Error('Nenhuma resposta foi registrada');
      }

      if (items.length === 0) {
        throw new Error('Nenhuma questão foi carregada');
      }

      // Preparar dados de forma mais segura
      const responseData = {
        session_id: sessionId,
        responses: Array.from(responses.values()).filter(r => r && r.item_id),
        items: items.filter(item => item && item.item_id),
        config: config
      };

      // Log apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log('Calculating score for session ID:', sessionId);
        console.log('Responses count:', responseData.responses.length);
        console.log('Items count:', responseData.items.length);
      }

      const response = await fetch('/api/enem/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Score calculation error:', errorText);
        throw new Error(`Failed to calculate score: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.score) {
        throw new Error('Resposta inválida da API de pontuação');
      }

      onComplete(data.score, items, Array.from(responses.values()));
    } catch (error) {
      console.error('Error calculating score:', error);
      toast({
        title: "Erro",
        description: `Falha ao calcular pontuação: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentQuestionIndex + 1) / items.length) * 100;
  const answeredCount = responses.size;

  // Show loading screen while generating exam
  if (isGeneratingExam) {
    return (
      <ExamGenerationLoading
        isLoading={isGeneratingExam}
        progress={generationProgress}
        message={generationMessage}
      />
    );
  }

  if (isCompleted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Simulado Concluído!</h2>
          <p className="text-gray-600 mb-4">
            Processando seus resultados...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Simulado ENEM - {config.mode}
                <Badge variant="secondary">{config.areas.join(', ')}</Badge>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Questão {currentQuestionIndex + 1} de {items.length} • {getQuestionSourceChip(currentItem).text}
              </p>
            </div>
            <div className="text-right">
              {timeRemaining !== null && (
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Clock className="h-5 w-5" />
                  {formatTime(timeRemaining)}
                </div>
              )}
              <div className="text-sm text-gray-600">
                Respondidas: {answeredCount}/{items.length}
                {isSaving && (
                  <span className="ml-2 text-blue-600 text-xs">
                    💾 Salvando...
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Tab Switch Warning */}
      {showWarning && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">
                Atenção: Você trocou de aba {tabSwitchCount} vezes. 
                Muitas trocas podem afetar a precisão do simulado.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm font-semibold">
                Questão {currentQuestionIndex + 1}
              </Badge>
              <Badge variant={getQuestionSourceChip(currentItem).variant} className="text-xs">
                {getQuestionSourceChip(currentItem).text}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{currentItem?.area}</Badge>
              <Badge variant="secondary">{currentItem?.estimated_difficulty}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="prose max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom styling for markdown elements
                  h1: ({ children }) => (
                    <h1 className="text-xl font-semibold mb-3 text-gray-900">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg font-semibold mb-3 text-gray-900">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-semibold mb-2 text-gray-900">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-800 mb-4 leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-4 space-y-1 text-gray-800">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-800">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="mb-1">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-900">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-gray-800">{children}</em>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-200 pl-4 italic text-gray-700 mb-4">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-4">
                      {children}
                    </pre>
                  ),
                }}
              >
                {currentItem?.text || ''}
              </ReactMarkdown>
            </div>

            {/* Alternatives */}
            <div className="space-y-3">
              {currentItem?.alternatives && Object.entries(currentItem.alternatives).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleAnswerSelect(key)}
                  className={`w-full p-4 text-left border rounded-lg transition-all ${
                    currentResponse?.selected_answer === key
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      currentResponse?.selected_answer === key
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300'
                    }`}>
                      {key}
                    </div>
                    <div className="flex-1">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Custom styling for markdown elements in alternatives
                          p: ({ children }) => (
                            <span className="inline">{children}</span>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-gray-900">{children}</strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic text-gray-800">{children}</em>
                          ),
                          code: ({ children }) => (
                            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">
                              {children}
                            </code>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside space-y-1 text-gray-800">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-inside space-y-1 text-gray-800">{children}</ol>
                          ),
                          li: ({ children }) => (
                            <li className="mb-1">{children}</li>
                          ),
                        }}
                      >
                        {value}
                      </ReactMarkdown>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>


            {currentQuestionIndex === items.length - 1 ? (
              <Button onClick={handleCompleteExam} className="bg-green-600 hover:bg-green-700">
                <Flag className="h-4 w-4 mr-2" />
                Finalizar Simulado
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Próxima
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Keyboard shortcuts info */}
      <Card className="bg-gray-50">
        <CardContent className="pt-4">
          <div className="text-sm text-gray-600 text-center">
            <strong>Atalhos:</strong> Use as teclas 1-5 para selecionar alternativas A-E, 
            ← → para navegar entre questões
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
