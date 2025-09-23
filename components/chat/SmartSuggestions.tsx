'use client';

import { useMemo } from 'react';
import { DetectedIntent } from '../../lib/intent-detection';
import { BookOpen, ClipboardList, FileText, Lightbulb, Cloud, Search, Newspaper, Calculator, Globe, Image, BarChart3, Languages, Timer, Calendar, Target, PenTool } from 'lucide-react';

interface SmartSuggestion {
  type: 'aula' | 'enem' | 'redacao' | 'weather' | 'openlibrary' | 'newsapi' | 'numbersapi' | 'currentsapi' | 'giphy' | 'worldbank' | 'calculator' | 'translator' | 'timer' | 'calendar' | 'imagesearch' | 'enemModal' | 'redacaoModal' | 'aulasModal';
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
  onOpenLibraryClick: (searchQuery: string) => void;
  onNewsAPIClick: (searchQuery: string) => void;
  onNumbersAPIClick: (searchQuery: string) => void;
  onCurrentsAPIClick: (searchQuery: string) => void;
  onGiphyClick: (searchQuery: string) => void;
  onWorldBankClick: (searchQuery: string) => void;
  onCalculatorClick: (expression?: string) => void;
  onTranslatorClick: (text?: string) => void;
  onTimerClick: (minutes?: number) => void;
  onCalendarClick: (date?: Date) => void;
  onImageSearchClick: (query?: string) => void;
  onEnemModalClick: () => void;
  onRedacaoModalClick: () => void;
  onAulasModalClick: (topic?: string) => void;
  className?: string;
}

export function SmartSuggestions({ 
  message, 
  context, 
  onAulaClick, 
  onEnemClick, 
  onRedacaoClick,
  onWeatherClick,
  onOpenLibraryClick,
  onNewsAPIClick,
  onNumbersAPIClick,
  onCurrentsAPIClick,
  onGiphyClick,
  onWorldBankClick,
  onCalculatorClick,
  onTranslatorClick,
  onTimerClick,
  onCalendarClick,
  onImageSearchClick,
  onEnemModalClick,
  onRedacaoModalClick,
  onAulasModalClick,
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
    } else if (intent.type === 'openlibrary' && intent.searchQuery) {
      suggestions.push({
        type: 'openlibrary',
        title: `Buscar Livros: ${intent.searchQuery}`,
        description: 'Encontre livros na biblioteca digital mundial com informações detalhadas.',
        action: () => onOpenLibraryClick(intent.searchQuery!),
        icon: <Search className="w-6 h-6" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 hover:bg-blue-100'
      });
    } else if (intent.type === 'newsapi' && intent.searchQuery) {
      suggestions.push({
        type: 'newsapi',
        title: `Notícias: ${intent.searchQuery}`,
        description: 'Acompanhe as últimas notícias e mantenha-se informado sobre os acontecimentos.',
        action: () => onNewsAPIClick(intent.searchQuery!),
        icon: <Newspaper className="w-6 h-6" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50 hover:bg-red-100'
      });
    } else if (intent.type === 'numbersapi' && intent.searchQuery) {
      suggestions.push({
        type: 'numbersapi',
        title: `Curiosidade: ${intent.searchQuery}`,
        description: 'Descubra fatos interessantes sobre números, datas e matemática.',
        action: () => onNumbersAPIClick(intent.searchQuery!),
        icon: <Calculator className="w-6 h-6" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50 hover:bg-green-100'
      });
    } else if (intent.type === 'currentsapi' && intent.searchQuery) {
      suggestions.push({
        type: 'currentsapi',
        title: `Notícias Globais: ${intent.searchQuery}`,
        description: 'Explore notícias mundiais e tendências em tempo real.',
        action: () => onCurrentsAPIClick(intent.searchQuery!),
        icon: <Globe className="w-6 h-6" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 hover:bg-purple-100'
      });
    } else if (intent.type === 'giphy' && intent.searchQuery) {
      suggestions.push({
        type: 'giphy',
        title: `GIFs: ${intent.searchQuery}`,
        description: 'Encontre GIFs animados perfeitos para suas aulas e apresentações.',
        action: () => onGiphyClick(intent.searchQuery!),
        icon: <Image className="w-6 h-6" />,
        color: 'text-pink-600',
        bgColor: 'bg-pink-50 hover:bg-pink-100'
      });
    } else if (intent.type === 'worldbank' && intent.searchQuery) {
      suggestions.push({
        type: 'worldbank',
        title: `Dados Mundiais: ${intent.searchQuery}`,
        description: 'Explore indicadores socioeconômicos globais e dados oficiais.',
        action: () => onWorldBankClick(intent.searchQuery!),
        icon: <BarChart3 className="w-6 h-6" />,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 hover:bg-indigo-100'
      });
    } else if (intent.type === 'calculator') {
      suggestions.push({
        type: 'calculator',
        title: 'Calculadora',
        description: 'Abrir calculadora para realizar cálculos matemáticos',
        action: () => onCalculatorClick(),
        icon: <Calculator className="w-6 h-6" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 hover:bg-blue-100'
      });
    } else if (intent.type === 'translator') {
      suggestions.push({
        type: 'translator',
        title: 'Tradutor',
        description: 'Traduzir texto entre diferentes idiomas',
        action: () => onTranslatorClick(),
        icon: <Languages className="w-6 h-6" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50 hover:bg-green-100'
      });
    } else if (intent.type === 'timer') {
      suggestions.push({
        type: 'timer',
        title: 'Cronômetro',
        description: 'Abrir cronômetro para gerenciar tempo de estudo',
        action: () => onTimerClick(),
        icon: <Timer className="w-6 h-6" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 hover:bg-orange-100'
      });
    } else if (intent.type === 'calendar') {
      suggestions.push({
        type: 'calendar',
        title: 'Calendário',
        description: 'Abrir calendário para datas e eventos',
        action: () => onCalendarClick(),
        icon: <Calendar className="w-6 h-6" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 hover:bg-purple-100'
      });
    } else if (intent.type === 'imagesearch') {
      suggestions.push({
        type: 'imagesearch',
        title: 'Busca de Imagens',
        description: 'Buscar imagens educacionais relacionadas ao tópico',
        action: () => onImageSearchClick(),
        icon: <Image className="w-6 h-6" />,
        color: 'text-pink-600',
        bgColor: 'bg-pink-50 hover:bg-pink-100'
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
          type: 'enemModal',
          title: 'Simulador ENEM Completo',
          description: 'Abrir simulador completo com cronômetro e análise de performance.',
          action: onEnemModalClick,
          icon: <Target className="w-6 h-6" />,
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
        },
        {
          type: 'redacaoModal',
          title: 'Editor de Redação',
          description: 'Abrir editor completo com avaliação automática e feedback.',
          action: onRedacaoModalClick,
          icon: <PenTool className="w-6 h-6" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 hover:bg-purple-100'
        }
      );
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }, [message, context, onAulaClick, onEnemClick, onRedacaoClick, onWeatherClick, onOpenLibraryClick, onNewsAPIClick, onNumbersAPIClick, onCurrentsAPIClick, onGiphyClick, onWorldBankClick, onCalculatorClick, onTranslatorClick, onTimerClick, onCalendarClick, onImageSearchClick, onEnemModalClick, onRedacaoModalClick, onAulasModalClick]);

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
