"use client"

import React from "react";
import { MessageRenderer } from "./MessageRenderer";

interface SecretariaAnswerProps {
  question: string;
  answer: string;
}

export const SecretariaAnswer: React.FC<SecretariaAnswerProps> = ({ question, answer }) => {
  return (
    <div className="secretaria-answer">
      <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <i className="fas fa-headset text-white text-sm"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-900">Atendimento</h3>
            <p className="text-sm text-red-700">Suporte multicanal</p>
          </div>
        </div>
        
        {question && (
          <div className="mb-3">
            <p className="text-sm font-medium text-red-800 mb-1">Sua pergunta:</p>
            <p className="text-red-700 bg-white/50 rounded p-2 text-sm">{question}</p>
          </div>
        )}
      </div>
      
      <div className="secretaria-content">
        <div className="whitespace-pre-wrap">{answer}</div>
      </div>
    </div>
  );
};
