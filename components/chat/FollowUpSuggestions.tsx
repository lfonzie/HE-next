'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, MessageCircle } from 'lucide-react';

interface FollowUpSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  className?: string;
}

export function FollowUpSuggestions({
  suggestions,
  onSuggestionClick,
  className = ''
}: FollowUpSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div
      className={`mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-blue-200 dark:border-slate-600 shadow-sm ${className}`}
      role="region"
      aria-label="Sugestões para continuar a conversa"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-full">
          <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          💡 Sugestões para continuar a conversa:
        </h4>
      </div>

      <div className="grid gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick(suggestion)}
            className="justify-start text-left h-auto py-3 px-4 bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 border-blue-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-slate-500 transition-all duration-200 group"
            aria-label={`Sugestão ${index + 1}: ${suggestion}`}
          >
            <div className="flex items-start gap-3 w-full">
              <div className="flex-shrink-0 mt-0.5">
                <MessageCircle className="w-4 h-4 text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 leading-relaxed">
                  {suggestion}
                </div>
              </div>
              <div className="flex-shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Button>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-blue-100 dark:border-slate-600">
        <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
          Clique em qualquer sugestão para explorar mais sobre o tema
        </p>
      </div>
    </div>
  );
}

export default FollowUpSuggestions;

