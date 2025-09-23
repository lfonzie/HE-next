'use client';

import { useMemo } from 'react';
import { DetectedIntent } from '../../lib/intent-detection';
import { BookOpen, ClipboardList, FileText, Lightbulb, Cloud } from 'lucide-react';

interface SmartSuggestion {
  type: 'aula' | 'enem' | 'redacao' | 'weather';
  title: string;
  description: string;
  action: () => void;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface Props {
  message: string;
  context?: any; // Replace with specific context type
  onAulaClick: (topic: string) => void;
  onEnemClick: () => void;
  onRedacaoClick: () => void;
  onWeatherClick: (city: string) => void;
  className?: string;
}

export function SmartSuggestions({ 
  message, 
  context, 
  onAulaClick, 
  onEnemClick, 
  onRedacaoClick,
  onWeatherClick,
  className = ''
}: Props) {
  const suggestions = useMemo(() => {
    const intent = detectIntent(message);
    const suggestions: SmartSuggestion[] = [];

    if (intent.type === 'weather' && intent.city) {
      suggestions.push({
        type: 'weather',
        title: `Clima em ${intent.city}`,
        description: 'Veja informações detalhadas sobre temperatura, umidade, vento e condições atuais.',
        action: () => onWeatherClick(intent.city!),
        icon: <Cloud className="w-6 h-6" />,
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50 hover:bg-cyan-100'
      });
    } else if (intent.type === 'aula' && intent.topic) {
      suggestions.push({
        type: 'aula',
        title: `Aula sobre ${intent.topic}`,
        description: 'Crie uma aula personalizada com explicações detalhadas e atividades interativas.',
        action: () => onAulaClick(intent.topic!),
        icon: <BookOpen className="w-6 h-6" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 hover:bg-blue-100'
      });
    } else if (intent.type === 'enem') {
      suggestions.push({
        type: 'enem',
        title: 'Simulador ENEM',
        description: 'Pratique com questões reais do ENEM e simulados personalizados.',
        action: onEnemClick,
        icon: <ClipboardList className="w-6 h-6" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50 hover:bg-green-100'
      });
    } else if (intent.type === 'redacao') {
      suggestions.push({
        type: 'redacao',
        title: 'Correção de Redação',
        description: 'Avalie sua redação com critérios oficiais do ENEM e receba feedback detalhado.',
        action: onRedacaoClick,
        icon: <FileText className="w-6 h-6" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 hover:bg-purple-100'
      });
    }

    // Add general suggestions if no specific intent detected
    if (suggestions.length === 0) {
      suggestions.push(
        {
          type: 'aula',
          title: 'Criar Aula Personalizada',
          description: 'Gere uma aula completa sobre qualquer tema com atividades interativas.',
          action: () => onAulaClick('tópico personalizado'),
          icon: <BookOpen className="w-6 h-6" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 hover:bg-blue-100'
        },
        {
          type: 'enem',
          title: 'Simulador ENEM',
          description: 'Pratique com questões oficiais e simulados personalizados.',
          action: onEnemClick,
          icon: <ClipboardList className="w-6 h-6" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50 hover:bg-green-100'
        },
        {
          type: 'redacao',
          title: 'Correção de Redação',
          description: 'Avalie sua redação com critérios oficiais do ENEM.',
          action: onRedacaoClick,
          icon: <FileText className="w-6 h-6" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 hover:bg-purple-100'
        }
      );
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }, [message, context, onAulaClick, onEnemClick, onRedacaoClick]);

  if (suggestions.length === 0) return null;

  return (
    <div
      className={`mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 ${className}`}
      role="region"
      aria-label="Sugestões baseadas na sua mensagem"
    >
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <h4 className="text-sm font-medium text-gray-900">
          💡 Sugestões baseadas na sua mensagem:
        </h4>
      </div>
      
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={suggestion.action}
            className={`w-full text-left p-3 ${suggestion.bgColor} rounded-md border border-gray-200 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group`}
            aria-label={suggestion.title}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${suggestion.bgColor} ${suggestion.color} group-hover:scale-110 transition-transform duration-200`}>
                {suggestion.icon}
              </div>
              <div className="flex-1">
                <div className={`font-medium ${suggestion.color} mb-1`}>
                  {suggestion.title}
                </div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  {suggestion.description}
                </div>
              </div>
              <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Clique em qualquer sugestão para começar imediatamente
        </p>
      </div>
    </div>
  );
}

// Helper function to detect intent (imported from lib)
function detectIntent(message: string): DetectedIntent {
  const lowerMessage = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  const intents = [
    {
      type: 'aula',
      patterns: [
        /aula sobre/i,
        /explicar/i,
        /quero aprender/i,
        /ensinar/i,
        /como funciona/i,
        /o que é/i,
        /conceito de/i,
        /entender sobre/i,
        /estudar sobre/i,
        /aprender sobre/i
      ],
      confidence: 0.8,
      extractTopic: true,
    },
    {
      type: 'enem',
      patterns: [
        /simulador enem/i,
        /fazer simulado/i,
        /questoes.*enem/i,
        /prova enem/i,
        /exame nacional/i,
        /vestibular/i,
        /simulado/i
      ],
      confidence: 0.9,
    },
    {
      type: 'redacao',
      patterns: [
        /corrigir redacao/i,
        /avaliar texto/i,
        /redacao.*enem/i,
        /escrever redação/i,
        /texto dissertativo/i,
        /dissertação/i
      ],
      confidence: 0.9,
    },
  ];

  for (const intent of intents) {
    for (const pattern of intent.patterns) {
      if (pattern.test(lowerMessage)) {
        return {
          type: intent.type,
          confidence: intent.confidence,
          topic: intent.extractTopic ? extractTopic(message) : undefined,
          context: intent.type === 'aula' ? 'educational' : intent.type === 'enem' ? 'exam' : 'writing',
          metadata: { source: 'pattern_match' },
        };
      }
    }
  }

  return {
    type: 'general',
    confidence: 0.5,
    metadata: { source: 'fallback' },
  };
}

function extractTopic(message: string): string {
  const patterns = [
    /aula sobre (.+)/i,
    /explicar (.+)/i,
    /quero aprender sobre (.+)/i,
    /ensinar (.+)/i,
    /como funciona (.+)/i,
    /o que é (.+)/i,
    /conceito de (.+)/i,
    /entender sobre (.+)/i,
    /estudar sobre (.+)/i,
    /aprender sobre (.+)/i
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return match[1].trim();
  }

  return 'tópico não identificado';
}
