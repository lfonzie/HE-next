"use client"

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bot, Zap, Brain } from "lucide-react";

export type ProviderType = 'auto' | 'openai' | 'google' | 'anthropic' | 'mistral' | 'groq';
export type ComplexityType = 'simple' | 'complex' | 'fast';

interface ProviderSelectorProps {
  provider: ProviderType;
  complexity: ComplexityType;
  onProviderChange: (provider: ProviderType) => void;
  onComplexityChange: (complexity: ComplexityType) => void;
  availableProviders?: ProviderType[];
}

const providerInfo = {
  auto: { name: 'Auto', icon: Bot, description: 'Escolha automática', color: 'bg-blue-100 text-blue-800' },
  openai: { name: 'OpenAI', icon: Brain, description: 'GPT-4o Mini', color: 'bg-green-100 text-green-800' },
  google: { name: 'Google', icon: Zap, description: 'Gemini 2.0', color: 'bg-purple-100 text-purple-800' },
  anthropic: { name: 'Anthropic', icon: Brain, description: 'Claude 3', color: 'bg-orange-100 text-orange-800' },
  mistral: { name: 'Mistral', icon: Zap, description: 'Mistral AI', color: 'bg-red-100 text-red-800' },
  groq: { name: 'Groq', icon: Zap, description: 'Llama 3.1', color: 'bg-yellow-100 text-yellow-800' }
};

const complexityInfo = {
  simple: { name: 'Simples', description: 'Respostas rápidas e diretas' },
  complex: { name: 'Complexo', description: 'Análises detalhadas e profundas' },
  fast: { name: 'Rápido', description: 'Máxima velocidade de resposta' }
};

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  provider,
  complexity,
  onProviderChange,
  onComplexityChange,
  availableProviders = ['auto', 'openai', 'google']
}) => {
  const currentProvider = providerInfo[provider];
  const currentComplexity = complexityInfo[complexity];

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      {/* Provider Selection */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Provedor:</span>
        <Select value={provider} onValueChange={onProviderChange}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableProviders.map((p) => {
              const info = providerInfo[p];
              const Icon = info.icon;
              return (
                <SelectItem key={p} value={p}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{info.name}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        
        <Badge variant="secondary" className={currentProvider.color}>
          {currentProvider.description}
        </Badge>
      </div>

      {/* Complexity Selection */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Modo:</span>
        <Select value={complexity} onValueChange={onComplexityChange}>
          <SelectTrigger className="w-24 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(complexityInfo).map(([key, info]) => (
              <SelectItem key={key} value={key}>
                <div className="flex flex-col">
                  <span className="font-medium">{info.name}</span>
                  <span className="text-xs text-gray-500">{info.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
