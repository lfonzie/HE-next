"use client"

import React from "react";
import { MessageRenderer } from "./MessageRenderer";

interface BemEstarAnswerProps {
  question: string;
  answer: string;
}

export const BemEstarAnswer: React.FC<BemEstarAnswerProps> = ({ question, answer }) => {
  return (
    <div className="bem-estar-answer">
      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
            <i className="fas fa-heart text-white text-sm"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-emerald-900">Bem-Estar</h3>
            <p className="text-sm text-emerald-700">Suporte socioemocional</p>
          </div>
        </div>
        
        {question && (
          <div className="mb-3">
            <p className="text-sm font-medium text-emerald-800 mb-1">Sua pergunta:</p>
            <p className="text-emerald-700 bg-white/50 rounded p-2 text-sm">{question}</p>
          </div>
        )}
      </div>
      
      <div className="bem-estar-content">
        <MessageRenderer content={answer} moduleId="BEM_ESTAR" />
      </div>
    </div>
  );
};
