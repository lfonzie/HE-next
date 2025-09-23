'use client';

import React, { useState, useEffect } from 'react';
import { X, ClipboardList, Clock, Target, Zap, Play, Pause, RotateCcw, CheckCircle, AlertCircle, Loader2, Award, BarChart3, BookOpen } from 'lucide-react';

interface EnemModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface SimulatorSession {
  id: string;
  type: 'quick' | 'full';
  questions: Question[];
  currentQuestion: number;
  answers: (number | null)[];
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  score?: number;
}

export function EnemModal({ isOpen, onClose, className = '' }: EnemModalProps) {
  const [activeTab, setActiveTab] = useState<'simulator' | 'history' | 'stats'>('simulator');
  const [simulatorType, setSimulatorType] = useState<'quick' | 'full' | null>(null);
  const [session, setSession] = useState<SimulatorSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('simulator');
      setSimulatorType(null);
      setSession(null);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            handleFinishSimulator();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const startSimulator = async (type: 'quick' | 'full') => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call to get questions
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockQuestions: Question[] = [
        {
          id: '1',
          question: 'Qual é a fórmula da área de um círculo?',
          options: ['A = πr²', 'A = 2πr', 'A = πd', 'A = r²'],
          correctAnswer: 0,
          explanation: 'A área de um círculo é calculada pela fórmula A = πr², onde r é o raio.',
          subject: 'Matemática',
          difficulty: 'easy'
        },
        {
          id: '2',
          question: 'Qual é a capital do Brasil?',
          options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
          correctAnswer: 2,
          explanation: 'Brasília é a capital federal do Brasil desde 1960.',
          subject: 'Geografia',
          difficulty: 'easy'
        },
        {
          id: '3',
          question: 'Quem escreveu "Os Lusíadas"?',
          options: ['Fernando Pessoa', 'Luís de Camões', 'Machado de Assis', 'Castro Alves'],
          correctAnswer: 1,
          explanation: 'Luís de Camões é o autor da epopeia "Os Lusíadas".',
          subject: 'Literatura',
          difficulty: 'medium'
        }
      ];

      const questionCount = type === 'quick' ? 10 : 45;
      const timeLimit = type === 'quick' ? 20 * 60 : 90 * 60; // 20 min or 90 min

      const newSession: SimulatorSession = {
        id: `session-${Date.now()}`,
        type,
        questions: mockQuestions.slice(0, questionCount),
        currentQuestion: 0,
        answers: new Array(questionCount).fill(null),
        startTime: new Date(),
        isCompleted: false
      };

      setSession(newSession);
      setSimulatorType(type);
      setTimeLeft(timeLimit);
      setIsRunning(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar simulado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!session) return;

    const newAnswers = [...session.answers];
    newAnswers[session.currentQuestion] = answerIndex;
    
    setSession(prev => prev ? { ...prev, answers: newAnswers } : null);
  };

  const handleNextQuestion = () => {
    if (!session) return;
    
    if (session.currentQuestion < session.questions.length - 1) {
      setSession(prev => prev ? { ...prev, currentQuestion: prev.currentQuestion + 1 } : null);
    }
  };

  const handlePreviousQuestion = () => {
    if (!session) return;
    
    if (session.currentQuestion > 0) {
      setSession(prev => prev ? { ...prev, currentQuestion: prev.currentQuestion - 1 } : null);
    }
  };

  const handleFinishSimulator = () => {
    if (!session) return;

    const correctAnswers = session.answers.filter((answer, index) => 
      answer === session.questions[index].correctAnswer
    ).length;

    const score = Math.round((correctAnswers / session.questions.length) * 1000);

    setSession(prev => prev ? {
      ...prev,
      endTime: new Date(),
      isCompleted: true,
      score
    } : null);
    
    setIsRunning(false);
  };

  const resetSimulator = () => {
    setSession(null);
    setSimulatorType(null);
    setTimeLeft(0);
    setIsRunning(false);
    setError(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      default: return 'N/A';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${className}`}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Simulador ENEM</h2>
              <p className="text-sm opacity-90">Pratique com questões reais do ENEM</p>
            </div>
          </div>

          {/* Timer */}
          {isRunning && (
            <div className="mt-4 p-3 bg-white/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Tempo restante:</span>
                </div>
                <div className={`text-lg font-bold ${timeLeft < 300 ? 'text-red-300' : ''}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('simulator')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'simulator' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Play className="w-4 h-4 inline mr-2" />
                Simulador
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'history' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                Histórico
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'stats' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Estatísticas
              </button>
            </div>

            {/* Question Navigation */}
            {session && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3">Questões</h3>
                <div className="grid grid-cols-5 gap-1">
                  {session.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSession(prev => prev ? { ...prev, currentQuestion: index } : null)}
                      className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                        index === session.currentQuestion
                          ? 'bg-green-600 text-white'
                          : session.answers[index] !== null
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'simulator' && (
              <div className="p-6">
                {!session ? (
                  <div className="text-center py-12">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Escolha o tipo de simulado
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Pratique com questões reais do ENEM e melhore seu desempenho
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      {/* Quick Simulator */}
                      <button
                        onClick={() => startSimulator('quick')}
                        disabled={isLoading}
                        className="p-6 bg-white border-2 border-green-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 group"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                            <Zap className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-semibold text-gray-900">Simulado Rápido</h4>
                            <p className="text-sm text-gray-600">10 questões • 20 minutos</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 text-left">
                          Ideal para revisão rápida e prática diária
                        </p>
                      </button>

                      {/* Full Simulator */}
                      <button
                        onClick={() => startSimulator('full')}
                        disabled={isLoading}
                        className="p-6 bg-white border-2 border-green-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 group"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                            <Target className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-semibold text-gray-900">Simulado Completo</h4>
                            <p className="text-sm text-gray-600">45 questões • 90 minutos</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 text-left">
                          Simulação completa do exame oficial
                        </p>
                      </button>
                    </div>

                    {isLoading && (
                      <div className="mt-6 flex items-center justify-center gap-2 text-green-600">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Preparando simulado...</span>
                      </div>
                    )}

                    {error && (
                      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                          <span className="text-red-700">{error}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : session.isCompleted ? (
                  <div className="text-center py-12">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Simulado Concluído!
                      </h3>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {session.score} pontos
                      </div>
                      <p className="text-gray-600">
                        Você acertou {session.answers.filter((answer, index) => 
                          answer === session.questions[index].correctAnswer
                        ).length} de {session.questions.length} questões
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">
                          {Math.round((session.answers.filter((answer, index) => 
                            answer === session.questions[index].correctAnswer
                          ).length / session.questions.length) * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Taxa de acerto</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">
                          {session.endTime && session.startTime ? 
                            Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000) : 0}min
                        </div>
                        <div className="text-sm text-gray-600">Tempo total</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">
                          {session.type === 'quick' ? 'Rápido' : 'Completo'}
                        </div>
                        <div className="text-sm text-gray-600">Tipo de simulado</div>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={resetSimulator}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Novo Simulado
                      </button>
                      <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Question Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          {session.questions[session.currentQuestion].subject}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(session.questions[session.currentQuestion].difficulty)}`}>
                          {getDifficultyText(session.questions[session.currentQuestion].difficulty)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Questão {session.currentQuestion + 1} de {session.questions.length}
                      </div>
                    </div>

                    {/* Question */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {session.questions[session.currentQuestion].question}
                      </h3>

                      <div className="space-y-3">
                        {session.questions[session.currentQuestion].options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                              session.answers[session.currentQuestion] === index
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                session.answers[session.currentQuestion] === index
                                  ? 'border-green-500 bg-green-500'
                                  : 'border-gray-300'
                              }`}>
                                {session.answers[session.currentQuestion] === index && (
                                  <CheckCircle className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <span className="font-medium">{String.fromCharCode(65 + index)})</span>
                              <span>{option}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={handlePreviousQuestion}
                        disabled={session.currentQuestion === 0}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Anterior
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsRunning(!isRunning)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          {isRunning ? 'Pausar' : 'Continuar'}
                        </button>
                        
                        {session.currentQuestion === session.questions.length - 1 ? (
                          <button
                            onClick={handleFinishSimulator}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Finalizar
                          </button>
                        ) : (
                          <button
                            onClick={handleNextQuestion}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Próxima
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Simulados</h3>
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum simulado realizado ainda</p>
                  <p className="text-sm">Complete um simulado para ver seu histórico aqui</p>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Estatísticas não disponíveis</p>
                  <p className="text-sm">Complete simulados para ver suas estatísticas</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
