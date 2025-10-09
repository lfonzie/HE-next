"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { GeneralWelcome } from "@/components/chat/GeneralWelcome";
import { ModuleWelcome } from "@/components/chat/ModuleWelcome";
import { ModuleWelcomeScreen } from "@/components/chat/ModuleWelcomeScreen";
import { ClassificationIndicator } from "@/components/chat/ClassificationIndicator";
import { useUnifiedChat } from "@/hooks/useUnifiedChat";
import { ModuleId, MODULES, convertModuleId, convertToOldModuleId } from "@/lib/modules";
import { ModuleType, Message as ChatMessageType, Conversation as ChatConversation } from "@/types";
import { getRandomSuggestions, ModuleSuggestion } from "@/lib/module-suggestions";
import { ModuleSuggestions } from "@/components/chat/ModuleSuggestions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, Headphones, Settings, Download, Search, Square, Sparkles, Target, MessageSquare, Brain } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useChatContext } from "@/components/providers/ChatContext";
import { useQuota } from "@/components/providers/QuotaProvider";
import { SupportModal } from "@/components/modals/SupportModal";
import { WeatherModal } from "@/components/chat/WeatherModal";
import { detectIntent } from "@/lib/intent-detection";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { useNavigationLoading } from "@/hooks/useNavigationLoading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import "@/components/chat/ChatInput.css";

type MinimalChatHook = {
  conversations: ChatConversation[];
  currentConversation: ChatConversation | null;
  sendMessage: (
    message: string,
    module?: string,
    subject?: string,
    grade?: string,
    conversationId?: string,
    image?: string,
    attachment?: File,
    useWebSearch?: boolean,
    provider?: 'auto' | 'openai' | 'google' | 'anthropic' | 'mistral' | 'groq' | 'grok',
    complexity?: 'simple' | 'complex' | 'fast'
  ) => Promise<void>;
  createConversation: (title?: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  updateConversation: (id: string, updates: Partial<ChatConversation>) => Promise<void>;
  clearCurrentConversation: () => void;
  setCurrentConversation: (conversation: ChatConversation | null) => void;
  refreshConversations: () => Promise<void>;
  isStreaming: boolean;
  cancelStream: () => void;
  error: string | null;
  retry: () => void;
};

export default function ChatComponent() {
  const router = useRouter();
  const { toast } = useToast();
  const { quota, isLimitReached, consumeQuota } = useQuota();
  const { startLoading, stopLoading } = useGlobalLoading();
  const { isNavigating } = useNavigationLoading();
  
  // Chat state - usando o novo sistema unificado
  const {
    conversationId,
    messages,
    send,
    sendStream,
    loading,
    error,
    newConversation,
    provider,
    setProvider,
    model,
    setModel,
    autoSelection
  } = useUnifiedChat("grok", "grok-4-fast-reasoning");

  // Garantir que sempre inicie com conversa limpa ao montar o componente
  useEffect(() => {
    console.log("🧹 [CHAT-COMPONENT] Component mounted, ensuring clean ephemeral chat");
    // O useUnifiedChat já limpa automaticamente, mas garantimos aqui também
    newConversation();
  }, []);

  // Adaptar para interface existente
  const currentConversation = conversationId ? {
    id: conversationId,
    title: "Conversa Atual",
    messages: messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      isStreaming: false,
      blocks: [],
      actions: [],
      trace: {},
      image: undefined,
      attachment: undefined,
      // Preservar metadados do modelo
      model: msg.model,
      provider: msg.provider,
      tier: msg.tier as "IA" | "IA_SUPER" | "IA_ECO" | undefined,
      complexity: msg.complexity,
      module: msg.module,
      tokens: msg.tokens,
      meta: msg.meta
    })),
    createdAt: new Date(),
    updatedAt: new Date()
  } : null;

  const conversations = currentConversation ? [currentConversation] : [];
  const isStreaming = loading;

  // Debug log para verificar dados das mensagens
  if (process.env.NODE_ENV === 'development') {
    console.log('ChatComponent messages debug:', {
      messagesCount: messages.length,
      lastMessage: messages[messages.length - 1],
      currentConversationMessages: currentConversation?.messages
    });
  }

  // Funções adaptadas
  const sendMessage = async (
    message: string,
    module?: string,
    subject?: string,
    grade?: string,
    conversationId?: string,
    image?: string,
    attachment?: File,
    useWebSearch?: boolean,
    provider?: 'auto' | 'openai' | 'google' | 'anthropic' | 'mistral' | 'groq' | 'grok',
    complexity?: 'simple' | 'complex' | 'fast'
  ) => {
    await sendStream(message); // Usar streaming em vez de send normal
  };

  const createConversation = async (title?: string) => {
    newConversation();
  };

  const deleteConversation = async (id: string) => {
    // Não implementado no sistema unificado ainda
  };

  const updateConversation = async (id: string, updates: Partial<ChatConversation>) => {
    // Não implementado no sistema unificado ainda
  };

  const clearCurrentConversation = () => {
    newConversation();
  };

  const setCurrentConversation = (conversation: ChatConversation | null) => {
    // Não implementado no sistema unificado ainda
  };

  const refreshConversations = async () => {
    // Não implementado no sistema unificado ainda
  };

  const cancelStream = () => {
    // Não implementado no sistema unificado ainda
  };

  const retry = () => {
    // Não implementado no sistema unificado ainda
  };

  // Função para definir modelo padrão baseado no provedor
  const getDefaultModel = (provider: string) => {
    switch (provider) {
      case "openai": return "gpt-4o-mini";
      case "gpt5": return "gpt-5-chat-latest";
      case "gemini": return "gemini-2.5-flash";
      case "perplexity": return "sonar";
      default: return "gpt-4o-mini";
    }
  };

  // Atualizar modelo quando provedor muda
  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider as any);
    setModel(getDefaultModel(newProvider));
  };

  // UI state
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [weatherCity, setWeatherCity] = useState('');
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isDeletingConversation, setIsDeletingConversation] = useState<string | null>(null);
  const [showModuleWelcome, setShowModuleWelcome] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleType | null>(null);
  const [showModuleSuggestions, setShowModuleSuggestions] = useState(false);
  const [currentModuleSuggestions, setCurrentModuleSuggestions] = useState<ModuleSuggestion[]>([]);
  const [currentModuleInfo, setCurrentModuleInfo] = useState<{name: string, icon: string} | null>(null);
  const [showClassificationIndicator, setShowClassificationIndicator] = useState(false);
  const [classificationData, setClassificationData] = useState<{
    module: string;
    confidence: number;
    rationale: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Check if user is scrolled to bottom
  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setIsScrolledToBottom(isAtBottom);
    }
  }, []);

  // Handle message sending
  const handleSendMessage = useCallback(async (
    message: string,
    module?: string,
    options?: {
      onStreamingStart?: () => void;
      onStreamingEnd?: () => void;
      onError?: (error: Error) => void;
    }
  ) => {
    if (!message.trim()) return;
    
    // Detect weather intent before sending message with AI validation
    const intent = detectIntent(message);
    if (intent.type === 'weather' && intent.city) {
      // Validar usando IA se realmente é sobre clima (não "tempo de viagem", etc)
      const { validateWeatherIntent } = await import('@/lib/intent-detection');
      const isWeatherQuery = await validateWeatherIntent(message);
      
      if (isWeatherQuery) {
        console.log('✅ [CHAT] Opening weather modal for:', intent.city);
        setWeatherCity(intent.city);
        setShowWeatherModal(true);
        return; // Don't send to chat, show weather modal instead
      } else {
        console.log('🚫 [CHAT] Not a weather query, processing normally:', message);
        // Continuar processamento normal - não é sobre clima
      }
    }
    
    if (isLimitReached) {
      toast({
        title: "Limite atingido",
        description: "Você atingiu o limite de mensagens. Faça upgrade do seu plano.",
        variant: "destructive",
      });
      return;
    }

    try {
      startLoading("Enviando mensagem...", "data");
      // Usar streaming com seleção automática baseada na complexidade
      await sendStream(message, undefined, true); // useAutoSelection = true
      consumeQuota();
      
      if (isScrolledToBottom) {
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro",
        description: "Falha ao enviar mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      stopLoading();
    }
  }, [sendMessage, isLimitReached, consumeQuota, startLoading, stopLoading, toast, isScrolledToBottom, scrollToBottom]);

  // Handle conversation creation
  const handleCreateConversation = useCallback(async () => {
    if (isCreatingConversation) return;
    
    try {
      setIsCreatingConversation(true);
      await createConversation();
      toast({
        title: "Nova conversa",
        description: "Conversa criada com sucesso!",
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Erro",
        description: "Falha ao criar conversa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingConversation(false);
    }
  }, [createConversation, isCreatingConversation, toast]);

  // Handle conversation deletion
  const handleDeleteConversation = useCallback(async (id: string) => {
    if (isDeletingConversation) return;
    
    try {
      setIsDeletingConversation(id);
      await deleteConversation(id);
      toast({
        title: "Conversa excluída",
        description: "Conversa excluída com sucesso!",
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Erro",
        description: "Falha ao excluir conversa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingConversation(null);
    }
  }, [deleteConversation, isDeletingConversation, toast]);

  // Handle conversation selection
  const handleSelectConversation = useCallback((conversation: ChatConversation) => {
    setCurrentConversation(conversation);
  }, [setCurrentConversation]);

  // Handle conversation clear
  const handleClearConversation = useCallback(() => {
    clearCurrentConversation();
    toast({
      title: "Conversa limpa",
      description: "Conversa atual foi limpa.",
    });
  }, [clearCurrentConversation, toast]);

  // Handle conversation export
  const handleExportConversation = useCallback(() => {
    if (!currentConversation) return;
    
    const data = {
      title: currentConversation.title,
      messages: currentConversation.messages,
      createdAt: currentConversation.createdAt,
      updatedAt: currentConversation.updatedAt
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentConversation.title || "conversa"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Conversa exportada",
      description: "Conversa exportada com sucesso!",
    });
  }, [currentConversation, toast]);

  // Handle module selection
  const handleModuleSelect = useCallback((module: ModuleType) => {
    setSelectedModule(module);
    setShowModuleWelcome(true);
    
    // Iniciar nova conversa sempre que um módulo for selecionado
    createConversation();
    
    toast({
      title: "Nova conversa iniciada",
      description: `Módulo ${module} selecionado - conversa limpa`,
    });
  }, [createConversation, toast]);

  // Handle module click with suggestions
  const handleModuleClick = useCallback((moduleId: ModuleId) => {
    const module = MODULES[moduleId];
    const suggestions = getRandomSuggestions(moduleId, 3);
    
    setSelectedModule(convertToOldModuleId(moduleId) as ModuleType);
    setCurrentModuleInfo({
      name: module.label,
      icon: module.icon
    });
    setCurrentModuleSuggestions(suggestions);
    setShowModuleSuggestions(true);
    
    // Iniciar nova conversa sempre que um módulo for clicado
    createConversation();
    
    toast({
      title: "Nova conversa iniciada",
      description: `Módulo ${module.label} selecionado - conversa limpa`,
    });
  }, [createConversation, toast]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: ModuleSuggestion) => {
    setShowModuleSuggestions(false);
    // Send the suggestion as a message
    handleSendMessage(suggestion.text, selectedModule);
  }, [handleSendMessage, selectedModule]);

  // Handle close suggestions
  const handleCloseSuggestions = useCallback(() => {
    setShowModuleSuggestions(false);
    setCurrentModuleSuggestions([]);
    setCurrentModuleInfo(null);
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showModuleSuggestions) {
        const target = event.target as HTMLElement;
        if (!target.closest('.module-suggestions-container')) {
          handleCloseSuggestions();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModuleSuggestions, handleCloseSuggestions]);

  // Handle classification
  const handleClassification = useCallback((data: {
    module: string;
    confidence: number;
    rationale: string;
  }) => {
    setClassificationData(data);
    setShowClassificationIndicator(true);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowClassificationIndicator(false);
    }, 5000);
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    retry();
    toast({
      title: "Tentando novamente",
      description: "Tentando enviar mensagem novamente...",
    });
  }, [retry, toast]);

  // Handle support
  const handleSupport = useCallback(() => {
    setShowSupportModal(true);
  }, []);

  // Handle navigation
  const handleNavigation = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "n":
          e.preventDefault();
          handleCreateConversation();
          break;
        case "s":
          e.preventDefault();
          handleSupport();
          break;
        case "e":
          e.preventDefault();
          handleExportConversation();
          break;
        // Removed Command+C shortcut to avoid conflict with copy/paste
      }
    }
  }, [handleCreateConversation, handleSupport, handleExportConversation]);

  // Effects
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isScrolledToBottom) {
      scrollToBottom();
    }
  }, [currentConversation?.messages, isScrolledToBottom, scrollToBottom]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Computed values
  const hasMessages = currentConversation?.messages && currentConversation.messages.length > 0;
  const isQuotaExceeded = quota.used >= quota.limit;

  return (
    <div className="bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-100 flex flex-col">
      {/* Chat Container - Fixed at bottom */}
      <div className="flex-1 flex flex-col pb-0" role="main">
        {/* Enhanced Header - Mostrar apenas quando não há mensagens */}
        {!hasMessages && (
          <header className="text-center mb-16">
            <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-red-400/20 to-pink-400/20 rounded-3xl blur-3xl"></div>
              
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-6">
                    <MessageSquare className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white fill-current" />
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Chat Inteligente com IA
                </h1>
                <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
                  Converse com assistentes especializados para diferentes áreas e necessidades
                </p>
                
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-100 text-orange-800 border border-orange-200">
                    <Sparkles className="h-4 w-4" />
                    IA Avançada
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-red-100 text-red-800 border border-red-200">
                    <Target className="h-4 w-4" />
                    Especializado
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-pink-100 text-pink-800 border border-pink-200">
                    <MessageSquare className="h-4 w-4" />
                    Interativo
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-rose-100 text-rose-800 border border-rose-200">
                    <Brain className="h-4 w-4" />
                    Inteligente
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200">
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-orange-800 mb-2">Assistentes Especializados</h3>
                    <p className="text-sm text-orange-700">Professores, TI, Secretaria e mais módulos especializados</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-red-800 mb-2">Respostas Contextuais</h3>
                    <p className="text-sm text-red-700">IA treinada para cada área específica de conhecimento</p>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-2xl border border-pink-200">
                    <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-pink-800 mb-2">Conversação Natural</h3>
                    <p className="text-sm text-pink-700">Interface intuitiva para diálogos fluidos e eficientes</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Chat Interface - Fixed at bottom */}
        <div className="flex-1 flex flex-col min-h-0 px-4 md:px-8 lg:px-16 xl:px-24">
          <div className="flex-1 bg-white/90 backdrop-blur-sm border-2 border-yellow-200 shadow-xl rounded-3xl overflow-hidden flex flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-yellow-500 to-yellow-600 text-white flex-shrink-0">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">Chat IA</h1>
                
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateConversation}
                  disabled={isCreatingConversation}
                  className="text-black border-yellow-300 hover:bg-white/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Conversa
                </Button>
                
              </div>
            </div>

            {/* Messages - Scrollable area */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 pb-14 space-y-4 min-h-0"
              onScroll={handleScroll}
            >
              {!hasMessages ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Olá! Como posso ajudar?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Digite sua mensagem abaixo e receba sugestões inteligentes para aulas, simulados ENEM e correção de redações.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center relative">
                    {Object.entries(MODULES).map(([id, module]) => (
                      <Button
                        key={id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleModuleClick(id as ModuleId)}
                        className="text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:scale-105 transition-all duration-200"
                      >
                        <i className={module.icon}></i> {module.label}
                      </Button>
                    ))}
                    
                    {/* Module Suggestions */}
                    {showModuleSuggestions && currentModuleInfo && (
                      <div className="module-suggestions-container">
                        <ModuleSuggestions
                          suggestions={currentModuleSuggestions}
                          onSuggestionClick={handleSuggestionClick}
                          onClose={handleCloseSuggestions}
                          moduleName={currentModuleInfo.name}
                          moduleIcon={currentModuleInfo.icon}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {currentConversation?.messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isUser={message.role === 'user'}
                    />
                  ))}
                  {isStreaming && (
                    <div className="flex items-center gap-3 mb-3 justify-start">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            <span className="text-sm">Gerando resposta...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Input at Bottom */}
      <div className="chat-input-fixed">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isStreaming || isLimitReached}
          placeholder={isLimitReached ? "Limite de mensagens atingido" : "Digite sua mensagem..."}
        />
      </div>

      {/* Classification Indicator */}
      {showClassificationIndicator && classificationData && (
        <ClassificationIndicator
          module={classificationData.module}
          confidence={classificationData.confidence}
          rationale={classificationData.rationale}
          isVisible={showClassificationIndicator}
        />
      )}


      {/* Support Modal */}
      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />

      {/* Weather Modal */}
      <WeatherModal
        isOpen={showWeatherModal}
        onClose={() => setShowWeatherModal(false)}
        city={weatherCity}
      />
    </div>
  );
}
