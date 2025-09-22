"use client"

import { Share2 } from 'lucide-react';
import { MarkdownRenderer } from "./MarkdownRenderer";

interface SocialMediaAnswerProps {
  question: string;
  answer: string;
}

export const SocialMediaAnswer: React.FC<SocialMediaAnswerProps> = ({ question, answer }) => {
  return (
    <div className="social-media-answer">
      <div className="bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
            <Share2 className="text-white text-sm w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-pink-900">Social Media</h3>
            <p className="text-sm text-pink-700">Comunicação digital especializada</p>
          </div>
        </div>
        
        {question && (
          <div className="mb-3">
            <p className="text-sm font-medium text-pink-800 mb-1">Sua pergunta:</p>
            <p className="text-pink-700 bg-white/50 rounded p-2 text-sm">{question}</p>
          </div>
        )}
      </div>
      
      <div className="social-media-content">
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
