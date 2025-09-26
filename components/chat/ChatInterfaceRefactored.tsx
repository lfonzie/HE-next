'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Mic, MoreHorizontal, Trash2, Download, Share2, Settings } from 'lucide-react';
import { detectIntent, DetectedIntent } from '../../lib/intent-detection';
import { SmartSuggestions } from './SmartSuggestions';
import { AulaModal } from './AulaModal';
import { EnemSuggestion } from './EnemSuggestion';
import { RedacaoSuggestion } from './RedacaoSuggestion';
import { WeatherModal } from './WeatherModal';
import { OpenLibraryModal } from './OpenLibraryModal';
import { NewsModal } from './NewsModal';
import { NumbersAPIModal } from './NumbersAPIModal';
import { CurrentsAPIModal } from './CurrentsAPIModal';
import { GiphyModal } from './GiphyModal';
import { WorldBankModal } from './WorldBankModal';
import { CalculatorModal } from './CalculatorModal';
import { TranslatorModal } from './TranslatorModal';
import { TimerModal } from './TimerModal';
import { CalendarModal } from './CalendarModal';
import { ImageSearchModal } from './ImageSearchModal';
import { EnemModal } from './EnemModal';
import { RedacaoModal } from './RedacaoModal';
import { AulasModal } from './AulasModal';
import { useChat } from '../../hooks/useChat';
import { useToast } from '../../hooks/use-toast';
import { ChatMessage } from './ChatMessage';

interface ModalState {
  aula: { isOpen: boolean; topic: string };
  enem: boolean;
  redacao: boolean;
  weather: { isOpen: boolean; city: string };
  openLibrary: { isOpen: boolean; searchQuery: string };
  newsAPI: { isOpen: boolean; searchQuery: string };
  numbersAPI: { isOpen: boolean; searchQuery: string };
  currentsAPI: { isOpen: boolean; searchQuery: string };
  giphy: { isOpen: boolean; searchQuery: string };
  worldBank: { isOpen: boolean; searchQuery: string };
  calculator: { isOpen: boolean; expression?: string };
  translator: { isOpen: boolean; text?: string };
  timer: { isOpen: boolean; minutes?: number };
  calendar: { isOpen: boolean; date?: Date };
  imageSearch: { isOpen: boolean; query?: string };
  enemModal: boolean;
  redacaoModal: boolean;
  aulasModal: { isOpen: boolean; topic?: string };
}

interface ChatInterfaceRefactoredProps {
  className?: string;
}

export function ChatInterfaceRefactored({ className = '' }: ChatInterfaceRefactoredProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  // State
  const [inputMessage, setInputMessage] = useState('');
  const [lastMessage, setLastMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({
    aula: { isOpen: false, topic: '' },
    enem: false,
    redacao: false,
    weather: { isOpen: false, city: '' },
    openLibrary: { isOpen: false, searchQuery: '' },
    newsAPI: { isOpen: false, searchQuery: '' },
    numbersAPI: { isOpen: false, searchQuery: '' },
    currentsAPI: { isOpen: false, searchQuery: '' },
    giphy: { isOpen: false, searchQuery: '' },
    worldBank: { isOpen: false, searchQuery: '' },
    calculator: { isOpen: false },
    translator: { isOpen: false },
    timer: { isOpen: false },
    calendar: { isOpen: false },
    imageSearch: { isOpen: false },
    enemModal: false,
    redacaoModal: false,
    aulasModal: { isOpen: false },
  });

  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Chat hook
  const {
    currentConversation,
    sendMessage,
    isStreaming,
    startNewConversation,
    lastClassification,
    error,
    retryCount
  } = useChat();

  const messages = currentConversation?.messages || [];

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  // Handle message sending
  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    setLastMessage(message);
    setShowSuggestions(true);

    try {
      // Passar o ID da conversa atual para manter o histórico
      await sendMessage(
        message,
        "auto", // module
        undefined, // subject
        undefined, // grade
        currentConversation?.id // conversationId - CRÍTICO para manter histórico
      );
      
      // Detect intent and show appropriate suggestions
      const intent = detectIntent(message);
      if (intent.type !== 'general') {
        setShowSuggestions(true);
        
        // Auto-open modals based on intent
        if (intent.type === 'enem') {
          handleEnemModalClick();
        } else if (intent.type === 'redacao') {
          handleRedacaoModalClick();
        } else if (intent.type === 'aula' && intent.topic) {
          handleAulasModalClick(intent.topic);
        } else if (intent.type === 'calculator') {
          handleCalculatorClick();
        } else if (intent.type === 'translator') {
          handleTranslatorClick();
        } else if (intent.type === 'timer') {
          handleTimerClick();
        } else if (intent.type === 'calendar') {
          handleCalendarClick();
        } else if (intent.type === 'imagesearch') {
          handleImageSearchClick();
        } else if (intent.type === 'newsapi') {
          handleNewsAPIClick(intent.searchQuery || '');
        }
      }

    } catch (error) {
      toast({
        title: 'Erro ao enviar mensagem',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    }
  }, [sendMessage, toast]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isStreaming) return;

    await handleSendMessage(inputMessage);
    setInputMessage('');
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Modal handlers
  const handleAulaClick = (topic: string) => {
    setModalState(prev => ({ 
      ...prev, 
      aula: { isOpen: true, topic } 
    }));
  };

  const handleAulaCreated = (aula: { id: string; title: string }) => {
    // Add system message to conversation
    const systemMessage = {
      type: 'system' as const,
      content: `Aula criada: ${aula.title}`,
      timestamp: new Date().toISOString(),
      metadata: {
        action: 'aula_created',
        aulaId: aula.id,
        aulaTitle: aula.title
      }
    };

    // This would typically be handled by the chat context
    toast({
      title: 'Aula criada!',
      description: `Aula "${aula.title}" foi criada com sucesso.`,
    });
  };

  const handleEnemClick = () => {
    setModalState(prev => ({ ...prev, enem: true }));
  };

  const handleRedacaoClick = () => {
    setModalState(prev => ({ ...prev, redacao: true }));
  };

  const handleWeatherClick = (city: string) => {
    setModalState(prev => ({ 
      ...prev, 
      weather: { isOpen: true, city } 
    }));
  };

  const handleOpenLibraryClick = (searchQuery: string) => {
    setModalState(prev => ({ 
      ...prev, 
      openLibrary: { isOpen: true, searchQuery } 
    }));
  };

  const handleNewsAPIClick = (searchQuery: string) => {
    setModalState(prev => ({ 
      ...prev, 
      newsAPI: { isOpen: true, searchQuery } 
    }));
  };

  const handleNumbersAPIClick = (searchQuery: string) => {
    setModalState(prev => ({ 
      ...prev, 
      numbersAPI: { isOpen: true, searchQuery } 
    }));
  };

  const handleCurrentsAPIClick = (searchQuery: string) => {
    setModalState(prev => ({ 
      ...prev, 
      currentsAPI: { isOpen: true, searchQuery } 
    }));
  };

  const handleGiphyClick = (searchQuery: string) => {
    setModalState(prev => ({ 
      ...prev, 
      giphy: { isOpen: true, searchQuery } 
    }));
  };

  const handleWorldBankClick = (searchQuery: string) => {
    setModalState(prev => ({ 
      ...prev, 
      worldBank: { isOpen: true, searchQuery } 
    }));
  };

  // New modal handlers
  const handleCalculatorClick = (expression?: string) => {
    setModalState(prev => ({ 
      ...prev, 
      calculator: { isOpen: true, expression } 
    }));
  };

  const handleTranslatorClick = (text?: string) => {
    setModalState(prev => ({ 
      ...prev, 
      translator: { isOpen: true, text } 
    }));
  };

  const handleTimerClick = (minutes?: number) => {
    setModalState(prev => ({ 
      ...prev, 
      timer: { isOpen: true, minutes } 
    }));
  };

  const handleCalendarClick = (date?: Date) => {
    setModalState(prev => ({ 
      ...prev, 
      calendar: { isOpen: true, date } 
    }));
  };

  const handleImageSearchClick = (query?: string) => {
    setModalState(prev => ({ 
      ...prev, 
      imageSearch: { isOpen: true, query } 
    }));
  };

  const handleEnemModalClick = () => {
    setModalState(prev => ({ ...prev, enemModal: true }));
  };

  const handleRedacaoModalClick = () => {
    setModalState(prev => ({ ...prev, redacaoModal: true }));
  };

  const handleAulasModalClick = (topic?: string) => {
    setModalState(prev => ({ 
      ...prev, 
      aulasModal: { isOpen: true, topic } 
    }));
  };

  const handleStartSimulator = (type: 'quick' | 'full') => {
    router.push(`/enem?mode=${type}`);
    setModalState(prev => ({ ...prev, enem: false }));
  };

  const handleStartCorrection = (type: 'write' | 'upload') => {
    router.push(`/redacao?mode=${type}`);
    setModalState(prev => ({ ...prev, redacao: false }));
  };

  // Close modals
  const closeAulaModal = () => {
    setModalState(prev => ({ 
      ...prev, 
      aula: { ...prev.aula, isOpen: false } 
    }));
  };

  const closeEnemModal = () => {
    setModalState(prev => ({ ...prev, enem: false }));
  };

  const closeRedacaoModal = () => {
    setModalState(prev => ({ ...prev, redacao: false }));
  };

  const closeWeatherModal = () => {
    setModalState(prev => ({ 
      ...prev, 
      weather: { ...prev.weather, isOpen: false } 
    }));
  };

  const closeOpenLibraryModal = () => {
    setModalState(prev => ({ 
      ...prev, 
      openLibrary: { ...prev.openLibrary, isOpen: false } 
    }));
  };

  const closeNewsAPIModal = () => {
    setModalState(prev => ({ 
      ...prev, 
      newsAPI: { ...prev.newsAPI, isOpen: false } 
    }));
  };

  const closeNumbersAPIModal = () => {
    setModalState(prev => ({ 
      ...prev, 
      numbersAPI: { ...prev.numbersAPI, isOpen: false } 
    }));
  };

  const closeCurrentsAPIModal = () => {
    setModalState(prev => ({ 
      ...prev, 
      currentsAPI: { ...prev.currentsAPI, isOpen: false } 
    }));
  };

  const closeGiphyModal = () => {
    setModalState(prev => ({ 
      ...prev, 
      giphy: { ...prev.giphy, isOpen: false } 
    }));
  };

  const closeWorldBankModal = () => {
    setModalState(prev => ({ 
      ...prev, 
      worldBank: { ...prev.worldBank, isOpen: false } 
    }));
  };

  // New modal close handlers
  const closeCalculatorModal = () => {
    setModalState(prev => ({ 
      ...prev, 
      calculator: { ...prev.calculator, isOpen: false } 
    }));
  };

  const closeTranslatorModal = () => {
    setModalState(prev => ({ 
      ...prev, 
      translator: { ...prev.translator, isOpen: false } 
    }));
  };

  const closeTimerModal = () => {
    setModalState(prev => ({ 
      ...prev, 
      timer: { ...prev.timer, isOpen: false } 
    }));
  };

  const closeCalendarModal = () => {
    setModalState(prev => ({ 
      ...prev, 
      calendar: { ...prev.calendar, isOpen: false } 
    }));
  };

  const closeImageSearchModal = () => {
    setModalState(prev => ({ 
      ...prev, 
      imageSearch: { ...prev.imageSearch, isOpen: false } 
    }));
  };

  const closeEnemModal = () => {
    setModalState(prev => ({ ...prev, enemModal: false }));
  };

  const closeRedacaoModal = () => {
    setModalState(prev => ({ ...prev, redacaoModal: false }));
  };

  const closeAulasModal = () => {
    setModalState(prev => ({ 
      ...prev, 
      aulasModal: { ...prev.aulasModal, isOpen: false } 
    }));
  };

  // Clear suggestions
  const clearSuggestions = () => {
    setShowSuggestions(false);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Chat Inteligente</h2>
            <p className="text-sm text-gray-500">
              {isStreaming ? 'Digitando...' : 'Pronto para ajudar'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => startNewConversation()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Nova conversa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Configurações"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Olá! Como posso ajudar?
            </h3>
            <p className="text-gray-600 mb-6">
              Digite sua mensagem abaixo e receba sugestões inteligentes para aulas, simulados ENEM e correção de redações.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={{
                id: `msg-${index}`,
                content: message.content,
                role: message.type === 'user' ? 'user' : 'assistant',
                timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
                module: message.module || undefined
              }}
              isUser={message.type === 'user'}
            />
          ))
        )}

        {/* Smart Suggestions */}
        {showSuggestions && lastMessage && (
          <div className="space-y-4">
            <SmartSuggestions
              message={lastMessage}
              context={currentConversation}
              onAulaClick={handleAulaClick}
              onEnemClick={handleEnemClick}
              onRedacaoClick={handleRedacaoClick}
              onWeatherClick={handleWeatherClick}
              onOpenLibraryClick={handleOpenLibraryClick}
              onNewsAPIClick={handleNewsAPIClick}
              onNumbersAPIClick={handleNumbersAPIClick}
              onCurrentsAPIClick={handleCurrentsAPIClick}
              onGiphyClick={handleGiphyClick}
              onWorldBankClick={handleWorldBankClick}
              onCalculatorClick={handleCalculatorClick}
              onTranslatorClick={handleTranslatorClick}
              onTimerClick={handleTimerClick}
              onCalendarClick={handleCalendarClick}
              onImageSearchClick={handleImageSearchClick}
              onEnemModalClick={handleEnemModalClick}
              onRedacaoModalClick={handleRedacaoModalClick}
              onAulasModalClick={handleAulasModalClick}
            />
            
            <button
              onClick={clearSuggestions}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Ocultar sugestões
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
            {retryCount > 0 && (
              <p className="text-red-600 text-xs mt-1">
                Tentativas: {retryCount}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem aqui..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={1}
              disabled={isStreaming}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {inputMessage.length}/1000
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Gravar áudio"
            >
              <Mic className="w-5 h-5" />
            </button>
            
            <button
              type="submit"
              disabled={!inputMessage.trim() || isStreaming}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Enviar mensagem"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Modals */}
      <AulaModal
        isOpen={modalState.aula.isOpen}
        onClose={closeAulaModal}
        topic={modalState.aula.topic}
        onAulaCreated={handleAulaCreated}
      />

      {/* ENEM Modal */}
      {modalState.enem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Simulador ENEM</h3>
              <button
                onClick={closeEnemModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <EnemSuggestion onStartSimulator={handleStartSimulator} />
          </div>
        </div>
      )}

      {/* Redação Modal */}
      {modalState.redacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Correção de Redação</h3>
              <button
                onClick={closeRedacaoModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <RedacaoSuggestion onStartCorrection={handleStartCorrection} />
          </div>
        </div>
      )}

      {/* Weather Modal */}
      <WeatherModal
        isOpen={modalState.weather.isOpen}
        onClose={closeWeatherModal}
        city={modalState.weather.city}
      />

      {/* OpenLibrary Modal */}
      <OpenLibraryModal
        isOpen={modalState.openLibrary.isOpen}
        onClose={closeOpenLibraryModal}
        searchQuery={modalState.openLibrary.searchQuery}
      />

      {/* News Modal */}
      <NewsModal
        isOpen={modalState.newsAPI.isOpen}
        onClose={closeNewsAPIModal}
        searchQuery={modalState.newsAPI.searchQuery}
      />

      {/* NumbersAPI Modal */}
      <NumbersAPIModal
        isOpen={modalState.numbersAPI.isOpen}
        onClose={closeNumbersAPIModal}
        searchQuery={modalState.numbersAPI.searchQuery}
      />

      {/* CurrentsAPI Modal */}
      <CurrentsAPIModal
        isOpen={modalState.currentsAPI.isOpen}
        onClose={closeCurrentsAPIModal}
        searchQuery={modalState.currentsAPI.searchQuery}
      />

      {/* Giphy Modal */}
      <GiphyModal
        isOpen={modalState.giphy.isOpen}
        onClose={closeGiphyModal}
        searchQuery={modalState.giphy.searchQuery}
      />

      {/* WorldBank Modal */}
      <WorldBankModal
        isOpen={modalState.worldBank.isOpen}
        onClose={closeWorldBankModal}
        searchQuery={modalState.worldBank.searchQuery}
      />

      {/* New Modals */}
      <CalculatorModal
        isOpen={modalState.calculator.isOpen}
        onClose={closeCalculatorModal}
        initialExpression={modalState.calculator.expression}
      />

      <TranslatorModal
        isOpen={modalState.translator.isOpen}
        onClose={closeTranslatorModal}
        initialText={modalState.translator.text}
      />

      <TimerModal
        isOpen={modalState.timer.isOpen}
        onClose={closeTimerModal}
        initialMinutes={modalState.timer.minutes}
      />

      <CalendarModal
        isOpen={modalState.calendar.isOpen}
        onClose={closeCalendarModal}
        initialDate={modalState.calendar.date}
      />

      <ImageSearchModal
        isOpen={modalState.imageSearch.isOpen}
        onClose={closeImageSearchModal}
        initialQuery={modalState.imageSearch.query}
      />

      {/* Enhanced Modals */}
      <EnemModal
        isOpen={modalState.enemModal}
        onClose={closeEnemModal}
      />

      <RedacaoModal
        isOpen={modalState.redacaoModal}
        onClose={closeRedacaoModal}
      />

      <AulasModal
        isOpen={modalState.aulasModal.isOpen}
        onClose={closeAulasModal}
        initialTopic={modalState.aulasModal.topic}
      />
    </div>
  );
}