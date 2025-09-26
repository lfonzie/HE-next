"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { processMessageForDisplay, forceConvertMathToUnicode } from '@/utils/unicode';
import { normalizeFormulas } from '@/lib/utils/latex-normalization';
import { 
  BookOpen, 
  Lightbulb, 
  HelpCircle, 
  CheckCircle, 
  XCircle,
  Brain,
  Target
} from 'lucide-react';

interface MessageRendererProps {
  content: string;
  type: 'explanation' | 'question' | 'example' | 'feedback';
  question?: string;
  options?: string[];
  correctOption?: number;
  helpMessage?: string;
  correctAnswer?: string;
  onAnswer?: (selectedOption: number, isCorrect: boolean) => void;
  showHelp?: boolean;
  onToggleHelp?: () => void;
  disabled?: boolean;
}

export default function MessageRenderer({
  content,
  type,
  question,
  options,
  correctOption,
  helpMessage,
  correctAnswer,
  onAnswer,
  showHelp = false,
  onToggleHelp,
  disabled = false
}: MessageRendererProps) {
  const getTypeIcon = () => {
    switch (type) {
      case 'explanation':
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      case 'question':
        return <HelpCircle className="h-5 w-5 text-green-600" />;
      case 'example':
        return <Lightbulb className="h-5 w-5 text-yellow-600" />;
      case 'feedback':
        return <Brain className="h-5 w-5 text-purple-600" />;
      default:
        return <Target className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'explanation':
        return 'bg-blue-50 border-blue-200';
      case 'question':
        return 'bg-green-50 border-green-200';
      case 'example':
        return 'bg-yellow-50 border-yellow-200';
      case 'feedback':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'explanation':
        return 'Explicação';
      case 'question':
        return 'Pergunta';
      case 'example':
        return 'Exemplo';
      case 'feedback':
        return 'Feedback';
      default:
        return 'Conteúdo';
    }
  };

  return (
    <Card className={`w-full ${getTypeColor()}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          {getTypeIcon()}
          <Badge variant="outline" className="text-xs">
            {getTypeLabel()}
          </Badge>
        </div>
        
        <div className="prose max-w-none">
          <p className="text-gray-800 leading-relaxed">
            {(() => {
              // Processar Unicode para fórmulas matemáticas e químicas
              const processedContent = processMessageForDisplay(content);
              const latexNormalizedContent = normalizeFormulas(processedContent);
              const mathProcessedContent = forceConvertMathToUnicode(latexNormalizedContent);
              return mathProcessedContent;
            })()}
          </p>
        </div>
        
        {question && (
          <div className="mt-4 p-3 bg-white rounded-lg border">
            <h4 className="font-semibold mb-2 text-gray-900">
              {(() => {
                // Processar Unicode para fórmulas matemáticas e químicas
                const processedContent = processMessageForDisplay(question);
                const latexNormalizedContent = normalizeFormulas(processedContent);
                const mathProcessedContent = forceConvertMathToUnicode(latexNormalizedContent);
                return mathProcessedContent;
              })()}
            </h4>
            
            {helpMessage && onToggleHelp && (
              <button
                onClick={onToggleHelp}
                className="text-sm text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
              >
                <HelpCircle className="h-4 w-4" />
                {showHelp ? 'Ocultar dica' : 'Mostrar dica'}
              </button>
            )}
            
            {showHelp && helpMessage && (
              <div className="p-2 bg-blue-50 rounded text-sm text-blue-800 mb-3">
                {(() => {
                  // Processar Unicode para fórmulas matemáticas e químicas
                  const processedContent = processMessageForDisplay(helpMessage);
                  const latexNormalizedContent = normalizeFormulas(processedContent);
                  const mathProcessedContent = forceConvertMathToUnicode(latexNormalizedContent);
                  return mathProcessedContent;
                })()}
              </div>
            )}
            
            {options && (
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="text-sm text-gray-700">
                    <span className="font-medium">{String.fromCharCode(65 + index)})</span> {(() => {
                      // Processar Unicode para fórmulas matemáticas e químicas
                      const processedContent = processMessageForDisplay(option);
                      const latexNormalizedContent = normalizeFormulas(processedContent);
                      const mathProcessedContent = forceConvertMathToUnicode(latexNormalizedContent);
                      return mathProcessedContent;
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {correctAnswer && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Resposta Correta:</span>
            </div>
            <p className="text-sm text-gray-600">{correctAnswer}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
