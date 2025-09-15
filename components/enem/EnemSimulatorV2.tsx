"use client"

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
  AlertTriangle
} from 'lucide-react';
import { EnemItem, EnemResponse, EnemScore, EnemMode, EnemArea } from '@/types/enem';
import { useToast } from '@/hooks/use-toast';

interface EnemSimulatorV2Props {
  sessionId: string;
  items: EnemItem[];
  config: {
    mode: EnemMode;
    areas: EnemArea[];
    numQuestions: number;
    timeLimit?: number;
  };
  onComplete: (score: EnemScore) => void;
}

export function EnemSimulatorV2({ sessionId, items, config, onComplete }: EnemSimulatorV2Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<string, EnemResponse>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const { toast } = useToast();

  const currentItem = items[currentQuestionIndex];
  const currentResponse = responses.get(currentItem?.item_id);

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

    // Save to server
    try {
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

      if (!serverResponse.ok) {
        throw new Error('Failed to save response');
      }
    } catch (error) {
      console.error('Error saving response:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar resposta. Tente novamente.",
        variant: "destructive"
      });
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
      const response = await fetch('/api/enem/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate score');
      }

      const data = await response.json();
      onComplete(data.score);
    } catch (error) {
      console.error('Error calculating score:', error);
      toast({
        title: "Erro",
        description: "Falha ao calcular pontuação. Tente novamente.",
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
                Questão {currentQuestionIndex + 1} de {items.length}
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
          <div className="flex items-center justify-between">
            <Badge variant="outline">{currentItem?.area}</Badge>
            <Badge variant="secondary">{currentItem?.estimated_difficulty}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="prose max-w-none">
              <p className="text-lg leading-relaxed">{currentItem?.text}</p>
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
                    <span>{value}</span>
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

            <div className="flex items-center gap-2">
              {currentResponse && (
                <Badge variant={currentResponse.is_correct ? "default" : "destructive"}>
                  {currentResponse.is_correct ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  Respondida
                </Badge>
              )}
            </div>

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
