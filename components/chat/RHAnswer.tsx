"use client"

import React from "react";
import { MessageRenderer } from "./MessageRenderer";

interface RHAnswerProps {
  question: string;
  answer: string;
}

export const RHAnswer: React.FC<RHAnswerProps> = ({ question, answer }) => {
  return (
    <div className="rh-answer">
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <i className="fas fa-users text-white text-sm"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-900">Recursos Humanos</h3>
            <p className="text-sm text-purple-700">Gestão de pessoas especializada</p>
          </div>
        </div>
        
        {question && (
          <div className="mb-3">
            <p className="text-sm font-medium text-purple-800 mb-1">Sua pergunta:</p>
            <p className="text-purple-700 bg-white/50 rounded p-2 text-sm">{question}</p>
          </div>
        )}
      </div>
      
      <div className="rh-content">
        <MessageRenderer content={answer} moduleId="RH" />
      </div>
    </div>
  );
};
