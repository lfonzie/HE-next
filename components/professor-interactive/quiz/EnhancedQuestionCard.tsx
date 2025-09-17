"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: Array<{
    id: string;
    label: string;
    text: string;
  }>;
  correctId: string;
  helpMessage?: string;
  correctAnswer?: string;
}

interface EnhancedQuestionCardProps {
  question: Question;
  onAnswer: (payload: {
    questionId: string;
    selectedId: string;
    isCorrect: boolean;
    timeSpent: number;
  }) => void;
  resetKey: string;
  disabled?: boolean;
  showTimer?: boolean;
}

export default function EnhancedQuestionCard({
  question,
  onAnswer,
  resetKey,
  disabled = false,
  showTimer = true
}: EnhancedQuestionCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [startTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);

  // Reset state when resetKey changes
  useEffect(() => {
    setSelectedId(null);
    setShowResult(false);
    setShowHelp(false);
    setTimeSpent(0);
  }, [resetKey]);

  // Timer effect
  useEffect(() => {
    if (!showResult && !disabled) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showResult, disabled, startTime]);

  const handleOptionSelect = (optionId: string) => {
    if (disabled || showResult) return;
    setSelectedId(optionId);
  };

  const handleSubmit = () => {
    if (selectedId === null) return;
    
    const isCorrect = selectedId === question.correctId;
    setShowResult(true);
    
    onAnswer({
      questionId: question.id,
      selectedId,
      isCorrect,
      timeSpent: Math.floor((Date.now() - startTime) / 1000)
    });
  };

  const getOptionStyle = (optionId: string) => {
    if (!showResult) {
      return selectedId === optionId 
        ? "bg-blue-100 border-blue-500 text-blue-900 shadow-md" 
        : "hover:bg-gray-50 hover:shadow-sm";
    }
    
    if (optionId === question.correctId) {
      return "bg-green-100 border-green-500 text-green-900 shadow-md";
    }
    
    if (selectedId === optionId && optionId !== question.correctId) {
      return "bg-red-100 border-red-500 text-red-900 shadow-md";
    }
    
    return "bg-gray-50";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg font-semibold" style={{ color: '#111111' }}>
              {question.text}
            </span>
            {question.helpMessage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(!showHelp)}
                className="p-1"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
          
          {showTimer && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(timeSpent)}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {showHelp && question.helpMessage && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg animate-in slide-in-from-top-2 duration-300">
            <p className="text-sm text-blue-800">{question.helpMessage}</p>
          </div>
        )}
        
        <div className="space-y-2">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={disabled || showResult}
              className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ${getOptionStyle(option.id)} ${
                disabled || showResult ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg">
                  {option.label})
                </span>
                <span className="flex-1 text-base">{option.text}</span>
                {showResult && option.id === question.correctId && (
                  <CheckCircle className="h-6 w-6 text-green-600 animate-in zoom-in-50 duration-300" />
                )}
                {showResult && selectedId === option.id && option.id !== question.correctId && (
                  <XCircle className="h-6 w-6 text-red-600 animate-in zoom-in-50 duration-300" />
                )}
              </div>
            </button>
          ))}
        </div>
        
        {selectedId !== null && !showResult && (
          <Button 
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            disabled={disabled}
          >
            Confirmar Resposta
          </Button>
        )}
        
        {showResult && question.correctAnswer && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg animate-in slide-in-from-bottom-2 duration-300">
            <p className="text-sm text-gray-700">
              <strong>Explicação:</strong> {question.correctAnswer}
            </p>
          </div>
        )}
        
        {showResult && (
          <div className="text-center">
            <Badge 
              variant={selectedId === question.correctId ? "default" : "destructive"}
              className="text-sm"
            >
              {selectedId === question.correctId ? "Correto!" : "Incorreto"}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
