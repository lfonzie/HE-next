"use client"

import { DollarSign } from 'lucide-react';
import { MarkdownRenderer } from "./MarkdownRenderer";

interface FinanceiroAnswerProps {
  question: string;
  answer: string;
}

export const FinanceiroAnswer: React.FC<FinanceiroAnswerProps> = ({ question, answer }) => {
  return (
    <div className="financeiro-answer">
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <DollarSign className="text-white text-sm w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-yellow-900">Financeiro</h3>
            <p className="text-sm text-yellow-700">Gestão financeira escolar</p>
          </div>
        </div>
        
        {question && (
          <div className="mb-3">
            <p className="text-sm font-medium text-yellow-800 mb-1">Sua pergunta:</p>
            <p className="text-yellow-700 bg-white/50 rounded p-2 text-sm">{question}</p>
          </div>
        )}
      </div>
      
      <div className="financeiro-content">
        <div className="prose prose-sm max-w-none">
          <MarkdownRenderer 
            content={answer} 
            className="text-gray-700 dark:text-gray-300"
          />
        </div>
      </div>
    </div>
  );
};
