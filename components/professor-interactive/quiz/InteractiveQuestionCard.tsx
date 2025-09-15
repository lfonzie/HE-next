"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Send, Loader2, Lightbulb } from 'lucide-react';
import { MarkdownRenderer } from '@/components/chat/MarkdownRenderer';

interface InteractiveQuestionCardProps {
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

export default function InteractiveQuestionCard({
  question,
  options,
  correctOption,
  helpMessage,
  correctAnswer,
  onAnswer,
  showHelp = false,
  onToggleHelp,
  disabled = false
}: InteractiveQuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string>('');

  const handleOptionSelect = (optionIndex: number) => {
    if (disabled || showResult) return;
    setSelectedOption(optionIndex);
  };

  const handleSubmit = async () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === correctOption;
    setShowResult(true);
    
    // Se a resposta estiver incorreta, gerar explicação via IA
    if (!isCorrect && !aiExplanation) {
      setIsGeneratingExplanation(true);
      try {
        const response = await fetch('/api/ai-explanation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: question,
            userAnswer: options[selectedOption],
            correctAnswer: options[correctOption]
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setAiExplanation(data.explanation);
        }
      } catch (error) {
        console.error('Erro ao gerar explicação:', error);
        setAiExplanation('Não foi possível gerar uma explicação personalizada no momento.');
      } finally {
        setIsGeneratingExplanation(false);
      }
    }
    
    onAnswer(selectedOption, isCorrect);
  };

  const getOptionStyle = (index: number) => {
    if (!showResult) {
      return selectedOption === index 
        ? "bg-blue-100 border-blue-500 text-blue-900" 
        : "hover:bg-gray-50 border-gray-200";
    }
    
    if (index === correctOption) {
      return "bg-green-100 border-green-500 text-green-900";
    }
    
    if (selectedOption === index && index !== correctOption) {
      return "bg-red-100 border-red-500 text-red-900";
    }
    
    return "bg-gray-50 border-gray-200";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">
            {question}
          </span>
          {helpMessage && onToggleHelp && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleHelp}
              className="p-1"
            >
              <Lightbulb className="h-4 w-4" />
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
            <Send className="h-4 w-4 mr-2" />
            Enviar Resposta
          </Button>
        )}
        
        {/* Explicação padrão */}
        {showResult && correctAnswer && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Explicação:</strong> {correctAnswer}
            </p>
          </div>
        )}

        {/* Explicação gerada por IA */}
        {showResult && aiExplanation && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">
                Explicação Detalhada
              </span>
            </div>
            <div className="text-sm text-gray-700">
              <MarkdownRenderer content={aiExplanation} />
            </div>
          </div>
        )}

        {/* Loading da explicação IA */}
        {isGeneratingExplanation && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-800">
                Gerando explicação personalizada...
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
