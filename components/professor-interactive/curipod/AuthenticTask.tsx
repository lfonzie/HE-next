"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, Target, HelpCircle, Lightbulb, Award } from 'lucide-react';

interface AuthenticTaskProps {
  task: {
    title: string;
    content: string;
    scenario: string;
    question: string;
    options: string[];
    correctOption: number;
    explanation: string;
    realWorldConnection: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit?: number; // em segundos
  };
  onComplete: (isCorrect: boolean, timeSpent: number) => void;
  onNext: () => void;
}

export default function AuthenticTask({ 
  task, 
  onComplete, 
  onNext 
}: AuthenticTaskProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(task.timeLimit || 120); // 2 minutos padrão
  const [timeSpent, setTimeSpent] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          setTimeSpent(prev => prev + 1);
          if (prev <= 1) {
            setIsActive(false);
            handleSubmit(-1); // Timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  const handleSubmit = (optionIndex: number) => {
    if (selectedOption !== null || optionIndex !== -1) {
      const answer = optionIndex === -1 ? -1 : selectedOption;
      const correct = answer === task.correctOption;
      
      setIsCorrect(correct);
      setShowFeedback(true);
      setIsActive(false);
      
      onComplete(correct, timeSpent);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tarefa Autêntica</h2>
            <p className="text-sm text-gray-600">Desafio prático do mundo real</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge className={getDifficultyColor(task.difficulty)}>
            {getDifficultyIcon(task.difficulty)} {task.difficulty.toUpperCase()}
          </Badge>
          
          {task.timeLimit && (
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg border border-purple-200">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo da Tarefa */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Award className="h-6 w-6 text-purple-600" />
            {task.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Cenário */}
            <div className="bg-white/60 rounded-lg p-6 border border-purple-200">
              <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Cenário Real
              </h3>
              <p className="text-gray-800 leading-relaxed mb-4">
                {task.scenario}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  Conexão com o Mundo Real:
                </h4>
                <p className="text-sm text-blue-800">
                  {task.realWorldConnection}
                </p>
              </div>
            </div>

            {/* Contexto */}
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-800 leading-relaxed">
                {task.content}
              </p>
            </div>

            {/* Pergunta */}
            <div className="bg-white/60 rounded-lg p-6 border border-purple-200">
              <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-purple-600" />
                {task.question}
              </h3>
              
              {/* Opções */}
              <div className="space-y-3">
                {task.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedOption(index)}
                    disabled={showFeedback}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      selectedOption === index
                        ? 'border-purple-500 bg-purple-50 text-purple-900'
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-25'
                    } ${
                      showFeedback
                        ? index === task.correctOption
                          ? 'border-green-500 bg-green-50 text-green-900'
                          : selectedOption === index && index !== task.correctOption
                          ? 'border-red-500 bg-red-50 text-red-900'
                          : 'border-gray-200 bg-gray-50'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedOption === index
                          ? 'border-purple-500 bg-purple-500 text-white'
                          : 'border-gray-300'
                      } ${
                        showFeedback && index === task.correctOption
                          ? 'border-green-500 bg-green-500 text-white'
                          : ''
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            {showFeedback && (
              <Alert className={`border-2 ${
                isCorrect 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <AlertDescription className={`${
                    isCorrect ? 'text-green-800' : 'text-red-800'
                  }`}>
                    <div className="font-semibold mb-2">
                      {isCorrect ? '🎉 Excelente! Resposta Correta!' : '❌ Resposta Incorreta'}
                    </div>
                    <p className="text-sm mb-3">
                      {task.explanation}
                    </p>
                    <div className="bg-white/60 rounded-lg p-3 border border-gray-200">
                      <h5 className="font-semibold text-gray-900 mb-1">💡 Aplicação Prática:</h5>
                      <p className="text-sm text-gray-700">
                        {task.realWorldConnection}
                      </p>
                    </div>
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* Progress bar */}
            {task.timeLimit && (
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${((task.timeLimit - timeRemaining) / task.timeLimit) * 100}%` 
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <div className="flex justify-center">
        {!showFeedback ? (
          <Button 
            onClick={() => handleSubmit(selectedOption || 0)}
            disabled={selectedOption === null}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 text-lg"
          >
            Responder Desafio
          </Button>
        ) : (
          <Button 
            onClick={onNext}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8 py-3 text-lg"
          >
            Continuar para Exit Ticket
          </Button>
        )}
      </div>
    </div>
  );
}
