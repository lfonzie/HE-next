"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, Target, HelpCircle, Lightbulb } from 'lucide-react';

interface InteractiveCheckpointProps {
  checkpoint: {
    title: string;
    content: string;
    question: string;
    options: string[];
    correctOption: number;
    helpMessage?: string;
    correctAnswer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit?: number; // em segundos
  };
  onComplete: (isCorrect: boolean, timeSpent: number) => void;
  onNext: () => void;
}

export default function InteractiveCheckpoint({ 
  checkpoint, 
  onComplete, 
  onNext 
}: InteractiveCheckpointProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(checkpoint.timeLimit || 60);
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
  }, [isActive, timeRemaining, handleSubmit]);

  const handleSubmit = useCallback((optionIndex: number) => {
    if (selectedOption !== null || optionIndex !== -1) {
      const answer = optionIndex === -1 ? -1 : selectedOption;
      const correct = answer === checkpoint.correctOption;
      
      setIsCorrect(correct);
      setShowFeedback(true);
      setIsActive(false);
      
      onComplete(correct, timeSpent);
    }
  }, [selectedOption, checkpoint.correctOption, onComplete, timeSpent]);

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
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Checkpoint Interativo</h2>
            <p className="text-sm text-gray-600">Checking your understanding</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge className={getDifficultyColor(checkpoint.difficulty)}>
            {getDifficultyIcon(checkpoint.difficulty)} {checkpoint.difficulty.toUpperCase()}
          </Badge>
          
          {checkpoint.timeLimit && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo do Checkpoint */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Target className="h-6 w-6 text-blue-600" />
            {checkpoint.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Contexto */}
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-800 leading-relaxed">
                {checkpoint.content}
              </p>
            </div>

            {/* Pergunta */}
            <div className="bg-white/60 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                {checkpoint.question}
              </h3>
              
              {/* Opções */}
              <div className="space-y-3">
                {checkpoint.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedOption(index)}
                    disabled={showFeedback}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      selectedOption === index
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25'
                    } ${
                      showFeedback
                        ? index === checkpoint.correctOption
                          ? 'border-green-500 bg-green-50 text-green-900'
                          : selectedOption === index && index !== checkpoint.correctOption
                          ? 'border-red-500 bg-red-50 text-red-900'
                          : 'border-gray-200 bg-gray-50'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedOption === index
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300'
                      } ${
                        showFeedback && index === checkpoint.correctOption
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
                      {isCorrect ? '✅ Resposta Correta!' : '❌ Resposta Incorreta'}
                    </div>
                    <p className="text-sm">
                      {checkpoint.correctAnswer}
                    </p>
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* Dica */}
            {checkpoint.helpMessage && !showFeedback && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">Dica:</span>
                </div>
                <p className="text-sm text-yellow-700">{checkpoint.helpMessage}</p>
              </div>
            )}

            {/* Progress bar */}
            {checkpoint.timeLimit && (
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${((checkpoint.timeLimit - timeRemaining) / checkpoint.timeLimit) * 100}%` 
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
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg"
          >
            Responder Pergunta
          </Button>
        ) : (
          <Button 
            onClick={onNext}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8 py-3 text-lg"
          >
            Continuar Aula
          </Button>
        )}
      </div>
    </div>
  );
}
