'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Play, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Slide, SlideGenerationRequest } from '@/types/slides';
import SlideComponent from '@/components/Slide';
import { useLoading } from '@/lib/loading';

interface ProfessorState {
  slides: Slide[];
  currentSlide: number;
  answers: Record<number, string>;
  isLoading: boolean;
  error: string;
  topic: string;
}

export default function ProfessorOptimized() {
  const [state, setState] = useState<ProfessorState>({
    slides: [],
    currentSlide: 0,
    answers: {},
    isLoading: false,
    error: '',
    topic: ''
  });

  const { start: startLoading, end: endLoading, isVisible: isGlobalLoading } = useLoading();

  const generateSlide = useCallback(async (topic: string, position: number, previousSlides: Slide[]) => {
    const loadingKey = `slide-${position}`;
    startLoading(loadingKey, { message: `Gerando slide ${position} de 9...` });

    try {
      const response = await fetch('/api/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, position, previousSlides })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.slide) {
        throw new Error(data.error || 'Failed to generate slide');
      }

      endLoading(loadingKey);
      return data.slide;
    } catch (error) {
      console.error('Error generating slide:', error);
      endLoading(loadingKey);
      throw error;
    }
  }, [startLoading, endLoading]);

  const generateAllSlides = useCallback(async (topic: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: '' }));
    
    try {
      const slides: Slide[] = [];
      
      // Generate slides sequentially to ensure anti-repetition works
      for (let i = 1; i <= 9; i++) {
        const slide = await generateSlide(topic, i, slides);
        slides.push(slide);
        
        // Update state with each new slide
        setState(prev => ({
          ...prev,
          slides: [...slides],
          currentSlide: 0
        }));
      }

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Error generating slides:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Erro ao gerar slides: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }));
    }
  }, [generateSlide]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!state.topic.trim()) return;

    await generateAllSlides(state.topic.trim());
  }, [state.topic, generateAllSlides]);

  const handleAnswerSelect = (slideIndex: number, answer: string) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [slideIndex]: answer }
    }));
  };

  const handleNext = () => {
    if (state.currentSlide < state.slides.length - 1) {
      setState(prev => ({ ...prev, currentSlide: prev.currentSlide + 1 }));
    }
  };

  const handlePrevious = () => {
    if (state.currentSlide > 0) {
      setState(prev => ({ ...prev, currentSlide: prev.currentSlide - 1 }));
    }
  };

  const handleRestart = () => {
    setState({
      slides: [],
      currentSlide: 0,
      answers: {},
      isLoading: false,
      error: '',
      topic: ''
    });
  };

  const currentSlide = state.slides[state.currentSlide];
  const canGoNext = state.currentSlide < state.slides.length - 1;
  const canGoPrevious = state.currentSlide > 0;
  const isCompleted = state.slides.length === 9 && state.currentSlide === state.slides.length - 1;

  // Calculate progress
  const progress = state.slides.length > 0 ? ((state.currentSlide + 1) / 9) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Professor Interativo - Aulas Otimizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  value={state.topic}
                  onChange={(e) => setState(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="Digite o tema da aula (ex: Funções Quadráticas, Revolução Francesa, etc.)..."
                  className="w-full"
                  disabled={state.isLoading}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={state.isLoading || !state.topic.trim()}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  {state.isLoading ? 'Gerando aula...' : 'Gerar Aula Interativa'}
                </Button>
                
                {state.slides.length > 0 && (
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleRestart}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Nova Aula
                  </Button>
                )}
              </div>
            </form>
            
            {state.error && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Progress */}
        {state.slides.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progresso da Aula
                </span>
                <span className="text-sm text-gray-500">
                  {state.currentSlide + 1} de 9 slides
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between mt-2">
                <Badge variant="outline">
                  {state.slides.filter((_, i) => state.answers[i]).length} respondidas
                </Badge>
                <Badge variant="secondary">
                  {Math.round(progress)}% completo
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Slide Display */}
        {currentSlide ? (
          <div className="mb-6">
            <SlideComponent
              slide={currentSlide}
              slideNumber={state.currentSlide + 1}
              totalSlides={9}
            />
          </div>
        ) : state.isLoading ? (
          /* Loading State */
          <Card className="mb-6">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-3 text-blue-600">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-lg font-semibold">Gerando slides únicos...</span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>🧠 Criando conteúdo educativo personalizado</p>
                  <p>🎯 Garantindo slides únicos e não repetitivos</p>
                  <p>🖼️ Selecionando imagens de alta qualidade</p>
                </div>
                <div className="mt-4">
                  <Progress value={75} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Navigation */}
        {state.slides.length > 0 && (
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Button>

            <div className="flex items-center gap-2">
              {isCompleted && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Aula Concluída!</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleNext}
              disabled={!canGoNext}
              className="flex items-center gap-2"
            >
              Próximo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Completion Summary */}
        {isCompleted && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl text-center">Aula Concluída!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-2xl font-bold text-green-600">
                  Parabéns! Você completou a aula sobre &quot;{state.topic}&quot;
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">9</div>
                    <div className="text-sm text-blue-600">Slides Únicos</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {state.slides.filter((_, i) => state.answers[i]).length}
                    </div>
                    <div className="text-sm text-green-600">Questões Respondidas</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {state.slides.filter(slide => slide.image_confidence && slide.image_confidence >= 0.7).length}
                    </div>
                    <div className="text-sm text-purple-600">Imagens de Qualidade</div>
                  </div>
                </div>
                <Button onClick={handleRestart} className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Criar Nova Aula
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
