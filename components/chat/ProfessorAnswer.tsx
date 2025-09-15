"use client"

import React from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ProfessorAnswerProps {
  question: string;
  answer: string;
}

export const ProfessorAnswer: React.FC<ProfessorAnswerProps> = ({ question, answer }) => {
  return (
    <div className="professor-answer">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-blue-900">Professor IA</h3>
        <p className="text-sm text-blue-700">Assistente de estudos</p>
      </div>
      
      <div className="professor-content">
        {answer ? (
          <div className="prose prose-sm max-w-none">
            <MarkdownRenderer 
              content={answer} 
              className="text-gray-700 dark:text-gray-300"
            />
          </div>
        ) : (
          <div className="text-gray-500 italic">
            Aguardando resposta...
          </div>
        )}
      </div>
    </div>
  );
};
