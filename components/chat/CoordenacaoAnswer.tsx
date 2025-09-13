"use client"

import React from "react";
import { MessageRenderer } from "./MessageRenderer";

interface CoordenacaoAnswerProps {
  question: string;
  answer: string;
}

export const CoordenacaoAnswer: React.FC<CoordenacaoAnswerProps> = ({ question, answer }) => {
  return (
    <div className="coordenacao-answer">
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
            <i className="fas fa-chart-line text-white text-sm"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-indigo-900">Coordenação</h3>
            <p className="text-sm text-indigo-700">Gestão pedagógica especializada</p>
          </div>
        </div>
        
        {question && (
          <div className="mb-3">
            <p className="text-sm font-medium text-indigo-800 mb-1">Sua pergunta:</p>
            <p className="text-indigo-700 bg-white/50 rounded p-2 text-sm">{question}</p>
          </div>
        )}
      </div>
      
      <div className="coordenacao-content">
        <MessageRenderer content={answer} moduleId="COORDENACAO" />
      </div>
    </div>
  );
};
