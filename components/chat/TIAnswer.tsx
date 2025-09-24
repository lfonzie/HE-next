"use client"

import { Laptop } from 'lucide-react';
import { MarkdownRenderer } from "./MarkdownRenderer";

interface TIAnswerProps {
  question: string;
  answer: string;
}

export const TIAnswer: React.FC<TIAnswerProps> = ({ question, answer }) => {
  return (
    <div className="ti-answer">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <Laptop className="text-white text-sm w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">TI Educacional</h3>
            <p className="text-sm text-gray-700">Suporte técnico</p>
          </div>
        </div>
        
        {question && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-800 mb-1">Sua pergunta:</p>
            <p className="text-gray-700 bg-white/50 rounded p-2 text-sm">{question}</p>
          </div>
        )}
      </div>
      
      <div className="ti-content">
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
