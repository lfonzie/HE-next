"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Clock, 
  Target,
  Zap,
  Brain,
  Award
} from 'lucide-react';

interface OptimizedQuestionCardProps {
  question: string;
  options: string[];
  correctOption: number;
  onAnswer: (selected: number, isCorrect: boolean) => void;
  userAnswer?: number;
  showHelp?: boolean;
  helpMessage?: string;
  correctAnswer?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  className?: string;
}

// Componente de opção otimizado
const OptimizedOption = React.memo(({ 
  option, 
  index, 
  isSelected, 
  isCorrect, 
  isWrong, 
  isRevealed, 
  onClick, 
  disabled 
}: {
  option: string;
  index: number;
  isSelected: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  isRevealed: boolean;
  onClick: () => void;
  disabled: boolean;
}) => {
  const getOptionStyle = useCallback(() => {
    if (!isRevealed) {
      return isSelected 
        ? 'border-blue-500 bg-blue-50 text-blue-700' 
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
    }
    
    if (isCorrect) {
      return 'border-green-500 bg-green-50 text-green-700';
    }
    
    if (isWrong) {
      return 'border-red-500 bg-red-50 text-red-700';
    }
    
    return 'border-gray-200 bg-gray-50 text-gray-500';
  }, [isSelected, isCorrect, isWrong, isRevealed]);

  const getIcon = useCallback(() => {
    if (!isRevealed) return null;
    
    if (isCorrect) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    if (isWrong) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    return null;
  }, [isRevealed, isCorrect, isWrong]);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full p-4 text-left border-2 rounded-lg transition-all duration-200
        ${getOptionStyle()}
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${!disabled && !isRevealed ? 'hover:shadow-md' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className={`w-8 h-8 flex items-center justify-center text-sm font-bold ${
              isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {String.fromCharCode(65 + index)}
          </Badge>
          <span className="text-sm font-medium">{option}</span>
        </div>
        {getIcon()}
      </div>
    </button>
  );
});

OptimizedOption.displayName = 'OptimizedOption';

// Componente de timer otimizado
const OptimizedTimer = React.memo(({ 
  timeLeft, 
  timeLimit, 
  onTimeUp 
}: {
  timeLeft: number;
  timeLimit: number;
  onTimeUp: () => void;
}) => {
  const [isWarning, setIsWarning] = useState(false);

  React.useEffect(() => {
    if (timeLeft <= 10) {
      setIsWarning(true);
    } else {
      setIsWarning(false);
    }
  }, [timeLeft]);

  React.useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
    }
  }, [timeLeft, onTimeUp]);

  const progress = (timeLeft / timeLimit) * 100;

  return (
    <div className="flex items-center gap-2">
      <Clock className={`h-4 w-4 ${isWarning ? 'text-red-500' : 'text-gray-500'}`} />
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ${
            isWarning ? 'bg-red-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className={`text-sm font-medium ${isWarning ? 'text-red-500' : 'text-gray-600'}`}>
        {timeLeft}s
      </span>
    </div>
  );
});

OptimizedTimer.displayName = 'OptimizedTimer';

export default function OptimizedQuestionCard({
  question,
  options,
  correctOption,
  onAnswer,
  userAnswer,
  showHelp = false,
  helpMessage,
  correctAnswer,
  difficulty = 'medium',
  timeLimit,
  className = ''
}: OptimizedQuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(userAnswer ?? null);
  const [isAnswered, setIsAnswered] = useState(!!userAnswer);
  const [timeLeft, setTimeLeft] = useState(timeLimit || 0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime] = useState(Date.now());

  // Timer effect
  React.useEffect(() => {
    if (!timeLimit || isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit, isAnswered]);

  const handleOptionClick = useCallback((index: number) => {
    if (isAnswered) return;
    
    setSelectedOption(index);
    setIsAnswered(true);
    setShowFeedback(true);
    
    const isCorrect = index === correctOption;
    const responseTime = Date.now() - startTime;
    
    // Callback com tempo de resposta
    onAnswer(index, isCorrect);
    
    // Auto-hide feedback after delay
    setTimeout(() => {
      setShowFeedback(false);
    }, 3000);
  }, [isAnswered, correctOption, onAnswer, startTime]);

  const handleTimeUp = useCallback(() => {
    if (isAnswered) return;
    
    // Auto-select first option if time runs out
    handleOptionClick(0);
  }, [isAnswered, handleOptionClick]);

  const getDifficultyColor = useCallback(() => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  }, [difficulty]);

  const getDifficultyIcon = useCallback(() => {
    switch (difficulty) {
      case 'easy': return <Zap className="h-3 w-3" />;
      case 'hard': return <Brain className="h-3 w-3" />;
      default: return <Target className="h-3 w-3" />;
    }
  }, [difficulty]);

  const isCorrect = useMemo(() => {
    return selectedOption === correctOption;
  }, [selectedOption, correctOption]);

  const isWrong = useMemo(() => {
    return selectedOption !== null && selectedOption !== correctOption;
  }, [selectedOption, correctOption]);

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{question}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`flex items-center gap-1 ${getDifficultyColor()}`}>
              {getDifficultyIcon()}
              {difficulty.toUpperCase()}
            </Badge>
            {showHelp && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                AJUDA
              </Badge>
            )}
          </div>
        </div>
        
        {timeLimit && !isAnswered && (
          <OptimizedTimer 
            timeLeft={timeLeft}
            timeLimit={timeLimit}
            onTimeUp={handleTimeUp}
          />
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Opções */}
        <div className="space-y-3">
          {options.map((option, index) => (
            <OptimizedOption
              key={index}
              option={option}
              index={index}
              isSelected={selectedOption === index}
              isCorrect={index === correctOption}
              isWrong={index === selectedOption && index !== correctOption}
              isRevealed={isAnswered}
              onClick={() => handleOptionClick(index)}
              disabled={isAnswered}
            />
          ))}
        </div>

        {/* Feedback */}
        {showFeedback && isAnswered && (
          <div className="space-y-3">
            {isCorrect ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Correto!</strong> {correctAnswer || 'Parabéns pela resposta correta!'}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Incorreto.</strong> A resposta correta é: {options[correctOption]}
                  {correctAnswer && (
                    <div className="mt-2 text-sm">
                      <strong>Explicação:</strong> {correctAnswer}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Ajuda */}
        {showHelp && helpMessage && (
          <Alert className="border-blue-200 bg-blue-50">
            <HelpCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Dica:</strong> {helpMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Estatísticas da questão */}
        {isAnswered && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.round((Date.now() - startTime) / 1000)}s
              </span>
              <span className="flex items-center gap-1">
                {isCorrect ? (
                  <>
                    <Award className="h-3 w-3 text-green-500" />
                    +10 pontos
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 text-red-500" />
                    0 pontos
                  </>
                )}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
