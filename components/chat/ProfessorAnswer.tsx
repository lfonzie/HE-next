"use client"

import React from "react";
import { MessageRenderer } from "./MessageRenderer";

interface ProfessorAnswerProps {
  question: string;
  answer: string;
}

export const ProfessorAnswer: React.FC<ProfessorAnswerProps> = ({ question, answer }) => {
  return (
    <div className="professor-answer">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <i className="fas fa-chalkboard-teacher text-white text-sm"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Professor IA</h3>
            <p className="text-sm text-blue-700">Assistente de estudos</p>
          </div>
        </div>
        
        {question && (
          <div className="mb-3">
            <p className="text-sm font-medium text-blue-800 mb-1">Sua pergunta:</p>
            <p className="text-blue-700 bg-white/50 rounded p-2 text-sm">{question}</p>
          </div>
        )}
      </div>
      
      <div className="professor-content">
        <MessageRenderer content={answer} moduleId="PROFESSOR" />
      </div>
    </div>
  );
};
