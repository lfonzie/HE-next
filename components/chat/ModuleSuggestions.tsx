"use client";

import React from 'react';
import { ModuleSuggestion } from '@/lib/module-suggestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ModuleSuggestionsProps {
  suggestions: ModuleSuggestion[];
  onSuggestionClick: (suggestion: ModuleSuggestion) => void;
  onClose: () => void;
  moduleName: string;
  moduleIcon: string;
}

export function ModuleSuggestions({
  suggestions,
  onSuggestionClick,
  onClose,
  moduleName,
  moduleIcon
}: ModuleSuggestionsProps) {
  return (
    <div className="module-suggestions-container absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 w-full max-w-2xl">
      <Card className="shadow-lg border border-yellow-200 dark:border-yellow-600 bg-white dark:bg-slate-800">
        <CardContent className="p-2">
          {/* Botão de fechar */}
          <div className="flex justify-end mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-5 w-5 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Suggestions em linha horizontal */}
          <div className="flex gap-2 overflow-x-auto">
            {suggestions.map((suggestion, index) => (
              <Card
                key={suggestion.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 border border-gray-200 dark:border-slate-600 hover:border-yellow-300 dark:hover:border-yellow-600 flex-shrink-0 w-48 bg-white dark:bg-slate-700"
                onClick={() => onSuggestionClick(suggestion)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-yellow-100 dark:bg-yellow-900/30 rounded-sm flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">{suggestion.icon}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 px-2 py-1">
                      {suggestion.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-gray-100 leading-tight">
                    {suggestion.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
