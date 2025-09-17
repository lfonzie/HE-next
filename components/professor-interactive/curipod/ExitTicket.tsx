"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, Target, HelpCircle, Trophy, BarChart3 } from 'lucide-react';

interface ExitTicketQuestion {
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

interface ExitTicketProps {
  questions: ExitTicketQuestion[];
  onComplete: (score: number, totalQuestions: number, timeSpent: number) => void;
  onNext: () => void;
}

export default function ExitTicket({ 
  questions, 
  onComplete, 
  onNext 
}: ExitTicketProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutos
  const [timeSpent, setTimeSpent] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          setTimeSpent(prev => prev + 1);
          if (prev <= 1) {
            setIsActive(false);
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, handleFinish]);

  const handleAnswerSelect = (optionIndex: number) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestion] = optionIndex;
    setSelectedOptions(newSelectedOptions);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowFeedback(false);
    } else {
      handleFinish();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowFeedback(false);
    }
  };

  const handleFinish = useCallback(() => {
    setIsActive(false);
    setIsCompleted(true);
    
    // Calcular score
    const correctAnswers = selectedOptions.filter(
      (option, index) => option === questions[index].correctOption
    ).length;
    
    setScore(correctAnswers);
    onComplete(correctAnswers, questions.length, timeSpent);
  }, [questions, selectedOptions, onComplete, timeSpent]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return '🎉 Excelente! Você dominou o conteúdo!';
    if (percentage >= 80) return '👏 Muito bem! Você compreendeu bem o tema!';
    if (percentage >= 60) return '👍 Bom trabalho! Continue praticando!';
    return '💪 Continue estudando! Você está no caminho certo!';
  };

  const currentQ = questions[currentQuestion];

  if (isCompleted) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Exit Ticket Concluído!</h2>
            <p className="text-lg text-gray-600">Avaliação final da aula</p>
          </div>
        </div>

        {/* Resultado */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Score */}
              <div className="space-y-4">
                <div className={`text-6xl font-bold ${getScoreColor(score, questions.length)}`}>
                  {score}/{questions.length}
                </div>
                <div className="text-2xl font-semibold text-gray-800">
                  {getScoreMessage(score, questions.length)}
                </div>
                <div className="text-lg text-gray-600">
                  {Math.round((score / questions.length) * 100)}% de acerto
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                <div className="bg-white/60 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Tempo:</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatTime(600 - timeSpent)}
                  </div>
                </div>
                <div className="bg-white/60 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-gray-900">Questões:</span>
                  </div>
                  <div className="text-lg font-bold text-purple-600">
                    {questions.length}
                  </div>
                </div>
              </div>

              {/* Feedback detalhado */}
              <div className="bg-white/60 rounded-lg p-6 border border-green-200">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">
                  📊 Análise do Seu Desempenho:
                </h3>
                <div className="space-y-3 text-left">
                  {questions.map((question, index) => {
                    const isCorrect = selectedOptions[index] === question.correctOption;
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            Questão {index + 1}: {isCorrect ? 'Correta' : 'Incorreta'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {question.explanation}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Próximos passos */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-lg text-blue-900 mb-3">
                  🎯 Próximos Passos Recomendados:
                </h3>
                <ul className="text-left space-y-2 text-blue-800">
                  <li>• Revise os conceitos que você teve dificuldade</li>
                  <li>• Pratique com exercícios similares</li>
                  <li>• Explore aplicações práticas do tema</li>
                  <li>• Continue aprendendo com novas aulas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão de ação */}
        <div className="flex justify-center">
          <Button 
            onClick={onNext}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8 py-3 text-lg"
          >
            🎉 Finalizar Aula
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Exit Ticket</h2>
            <p className="text-sm text-gray-600">Avaliação final da aula</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Questão {currentQuestion + 1} de {questions.length}
          </Badge>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
            <Clock className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
          style={{ 
            width: `${((600 - timeRemaining) / 600) * 100}%` 
          }}
        />
      </div>

      {/* Pergunta atual */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Target className="h-6 w-6 text-green-600" />
            Questão {currentQuestion + 1}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Pergunta */}
            <div className="bg-white/60 rounded-lg p-6 border border-green-200">
              <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-green-600" />
                {currentQ.question}
              </h3>
              
              {/* Opções */}
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      selectedOptions[currentQuestion] === index
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-25'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedOptions[currentQuestion] === index
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navegação */}
      <div className="flex justify-between">
        <Button 
          onClick={handlePreviousQuestion}
          disabled={currentQuestion === 0}
          variant="outline"
        >
          ← Anterior
        </Button>
        
        <div className="flex gap-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentQuestion
                  ? 'bg-green-500'
                  : selectedOptions[index] !== null
                  ? 'bg-blue-300'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        <Button 
          onClick={handleNextQuestion}
          disabled={selectedOptions[currentQuestion] === null}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Próxima →'}
        </Button>
      </div>
    </div>
  );
}
