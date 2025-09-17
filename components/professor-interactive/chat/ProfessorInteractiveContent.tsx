"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { detectSubject } from '@/utils/professor-interactive/subjectDetection';


interface InteractiveStep {
  type: 'explanation' | 'question' | 'example' | 'feedback';
  content: string;
  question?: string;
  expectedAnswer?: string;
  helpMessage?: string;
  correctAnswer?: string;
  nextQuestion?: string;
  // Novas propriedades para múltipla escolha
  options?: string[];
  correctOption?: number; // Índice da opção correta (0-3)
  // Sistema de perguntas dinâmicas
  questionPool?: Array<{
    question: string;
    options: string[];
    correctOption: number;
    helpMessage?: string;
    correctAnswer?: string;
  }>;
}

interface InteractiveLesson {
  title: string;
  subject: string;
  introduction: string;
  steps: InteractiveStep[];
  finalTest: {
    question: string;
    expectedAnswer: string;
    helpMessage: string;
    correctAnswer: string;
    // Novas propriedades para múltipla escolha no teste final
    options?: string[];
    correctOption?: number;
  };
  summary: string;
  nextSteps: string[];
}

interface LessonState {
  currentStep: number;
  userAnswers: { [key: number]: string | number | undefined; final?: number };
  showHelp: { [key: number]: boolean; final?: boolean };
  completed: boolean;
  score: number;
  showNavigationButtons: { [key: number]: boolean };
  currentQuestionIndex: { [key: number]: number }; // Controla qual pergunta está sendo exibida
  // Novas funcionalidades avançadas
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  startTime: number;
  showStats: boolean;
  achievements: string[];
  questionTimer: { [key: number]: number };
  currentQuestionStartTime: number;
}

interface ProfessorInteractiveContentProps {
  initialQuery?: string;
}

export default function ProfessorInteractiveContent({ 
  initialQuery = ""
}: ProfessorInteractiveContentProps) {
  const [query, setQuery] = useState(initialQuery);
  const [lesson, setLesson] = useState<InteractiveLesson | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    // Iniciar loading e barra de progresso
    setIsLoading(true);
    setProgress(0);
    setLoadingMessage('Iniciando processamento...');
    setLoadingStartTime(Date.now());

    try {
      // Simular progresso inicial
      setProgress(10);
      setLoadingMessage('Analisando conteúdo...');
      
      // Simular delay para processamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProgress(30);
      setLoadingMessage('Gerando aula interativa...');
      
      // Simular mais processamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setProgress(60);
      setLoadingMessage('Criando exercícios...');
      
      // Simular finalização
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProgress(90);
      setLoadingMessage('Finalizando...');
      
      // Simular aula interativa gerada
      const mockLesson: InteractiveLesson = {
        title: `Aula Interativa: ${query}`,
        subject: 'Matemática', // Default subject, will be updated when detectSubject resolves
        introduction: `Vamos explorar o tema "${query}" de forma interativa e envolvente!`,
        steps: [
          {
            type: 'explanation',
            content: `Este é o primeiro passo para entender "${query}". Aqui você aprenderá os conceitos fundamentais.`,
            question: `Qual é o conceito principal relacionado a "${query}"?`,
            expectedAnswer: 'Conceito fundamental',
            helpMessage: 'Pense nos elementos básicos que compõem este tema.',
            correctAnswer: 'O conceito principal é...',
            options: ['Conceito fundamental', 'Aplicação prática', 'Exemplo específico', 'Definição técnica'],
            correctOption: 0
          },
          {
            type: 'question',
            content: `Agora vamos praticar com "${query}". Este exercício ajudará você a consolidar o conhecimento.`,
            question: `Como você aplicaria "${query}" em uma situação prática?`,
            expectedAnswer: 'Aplicação prática',
            helpMessage: 'Considere como este conceito pode ser usado no mundo real.',
            correctAnswer: 'A aplicação prática seria...',
            options: ['Aplicação prática', 'Teoria abstrata', 'Exemplo histórico', 'Definição formal'],
            correctOption: 0
          }
        ],
        finalTest: {
          question: `Qual é a importância de "${query}"?`,
          expectedAnswer: 'Importância fundamental',
          helpMessage: 'Pense nos benefícios e impactos deste conceito.',
          correctAnswer: 'A importância é fundamental porque...',
          options: ['Importância fundamental', 'Relevância secundária', 'Aplicação limitada', 'Uso específico'],
          correctOption: 0
        },
        summary: `Você completou a aula interativa sobre "${query}"! Parabéns pelo progresso.`,
        nextSteps: [
          'Continue praticando com exercícios similares',
          'Explore tópicos relacionados',
          'Aplique o conhecimento em projetos práticos'
        ]
      };

      setLesson(mockLesson);
      setProgress(100);
      setLoadingMessage('Aula interativa gerada com sucesso!');
      
      // Limpar loading após um tempo
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
        setLoadingMessage('');
        setLoadingStartTime(null);
      }, 1000);
    } catch (error: any) {
      console.error('❌ Erro ao gerar aula interativa:', error);
      setError(`Falha ao gerar aula interativa: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Tente novamente.`);
    }
  }, [query, setIsLoading, setProgress, setLoadingMessage, setLoadingStartTime, setError]);
  
  // Verificar se há dados de auto-start vindos da navegação
  useEffect(() => {
    // Auto-submit se necessário (implementação simplificada)
    if (query && query.includes('auto-start')) {
      setTimeout(() => {
        handleSubmit();
      }, 500);
    }
  }, [query, handleSubmit]);
  
  const [, setLessonState] = useState<LessonState>({
    currentStep: 0,
    userAnswers: {},
    showHelp: {},
    completed: false,
    score: 0,
    showNavigationButtons: {},
    currentQuestionIndex: {},
    // Novas funcionalidades avançadas
    totalQuestions: 0,
    correctAnswers: 0,
    timeSpent: 0,
    startTime: Date.now(),
    showStats: false,
    achievements: [],
    questionTimer: {},
    currentQuestionStartTime: Date.now()
  });

  // Função para gerar aula usando a API module-professor-interactive
  const generateSequentialLesson = async (query: string, subject: string) => {
    try {
      console.log('🎓 Gerando aula interativa para:', query, 'Subject:', subject);
      
      const response = await fetch('/api/module-professor-interactive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: query,
          subject: subject
        }),
      });

      if (!response.ok) {
        throw new Error(`Falha na resposta da API: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.lesson) {
        console.log('✅ Aula interativa gerada com sucesso');
        setLesson(data.lesson);
      } else {
        console.error('❌ Resposta da API inválida:', data);
        setError('Falha ao gerar aula interativa. Tente novamente.');
      }
    } catch (error: any) {
      console.error('❌ Erro ao gerar aula interativa:', error);
      setError(`Falha ao gerar aula interativa: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Tente novamente.`);
    }
  };


  // Auto-start se houver query inicial
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setQuery(initialQuery);
      handleSubmit();
    }
  }, [initialQuery, handleSubmit]);

  // Renderização simplificada para teste
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-blue-600">📚</span>
              Aulas Expandidas - Professor Interativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Digite sua pergunta para gerar uma aula interativa..."
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={isLoading || !query.trim()}>
                {isLoading ? 'Gerando aula...' : 'Gerar Aula Interativa'}
              </Button>
            </form>
            
            {error && (
              <Alert className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {isLoading && (
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">{loadingMessage}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {lesson && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">{lesson.title}</h3>
                <p className="text-gray-700 mb-4">{lesson.introduction}</p>
                
                <div className="space-y-4">
                  {lesson.steps.map((step, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{step.type}</Badge>
                        <span className="text-sm text-gray-500">Passo {index + 1}</span>
                      </div>
                      <div className="prose max-w-none">
                        <p>{step.content}</p>
                        {step.question && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold mb-2">{step.question}</h4>
                            {step.options && (
                              <div className="space-y-2">
                                {step.options.map((option, optIndex) => (
                                  <div key={optIndex} className="text-sm">
                                    {option}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
                
                {lesson.finalTest && (
                  <Card className="mt-6 p-4 bg-green-50">
                    <h4 className="font-semibold mb-2">Teste Final</h4>
                    <p>{lesson.finalTest.question}</p>
                  </Card>
                )}
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Resumo</h4>
                  <p className="text-sm text-gray-700">{lesson.summary}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

