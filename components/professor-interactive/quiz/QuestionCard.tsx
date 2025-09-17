"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, CheckCircle, XCircle } from 'lucide-react';

interface QuestionCardProps {
  question: string;
  options: string[];
  correctOption: number;
  helpMessage?: string;
  correctAnswer?: string;
  onAnswer: (selectedOption: number, isCorrect: boolean) => void;
  showHelp?: boolean;
  onToggleHelp?: () => void;
  disabled?: boolean;
}

export default function QuestionCard({
  question,
  options,
  correctOption,
  helpMessage,
  correctAnswer,
  onAnswer,
  showHelp = false,
  onToggleHelp,
  disabled = false
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleOptionSelect = (optionIndex: number) => {
    if (disabled || showResult) return;
    setSelectedOption(optionIndex);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === correctOption;
    setShowResult(true);
    onAnswer(selectedOption, isCorrect);
  };

  const getOptionStyle = (index: number) => {
    if (!showResult) {
      return selectedOption === index 
        ? "bg-blue-100 border-blue-500 text-blue-900" 
        : "hover:bg-gray-50";
    }
    
    if (index === correctOption) {
      return "bg-green-100 border-green-500 text-green-900";
    }
    
    if (selectedOption === index && index !== correctOption) {
      return "bg-red-100 border-red-500 text-red-900";
    }
    
    return "bg-gray-50";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-lg font-semibold" style={{ color: '#111111' }}>
            {question}
          </span>
          {helpMessage && onToggleHelp && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleHelp}
              className="p-1"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {showHelp && helpMessage && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">{helpMessage}</p>
          </div>
        )}
        
        <div className="space-y-2">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(index)}
              disabled={disabled || showResult}
              className={`w-full p-3 text-left border rounded-lg transition-colors ${getOptionStyle(index)} ${
                disabled || showResult ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">
                  {String.fromCharCode(65 + index)})
                </span>
                <span className="flex-1">{option}</span>
                {showResult && index === correctOption && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {showResult && selectedOption === index && index !== correctOption && (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            </button>
          ))}
        </div>
        
        {selectedOption !== null && !showResult && (
          <Button 
            onClick={handleSubmit}
            className="w-full"
            disabled={disabled}
          >
            Confirmar Resposta
          </Button>
        )}
        
        {showResult && correctAnswer && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Explicação:</strong> {correctAnswer}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
