"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { GeneralWelcome } from "@/components/chat/GeneralWelcome";
import { ModuleWelcome } from "@/components/chat/ModuleWelcome";
import { ModuleWelcomeScreen } from "@/components/chat/ModuleWelcomeScreen";
import { ClassificationIndicator } from "@/components/chat/ClassificationIndicator";
import { useChat } from "@/hooks/useChat";
import { ModuleId, MODULES, convertModuleId, convertToOldModuleId } from "@/lib/modules";
import { ModuleType, Message as ChatMessageType, Conversation as ChatConversation } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, Headphones, Settings, History, Download, Search, Square } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useChatContext } from "@/components/providers/ChatContext";
import { useQuota } from "@/components/providers/QuotaProvider";
import { SupportModal } from "@/components/modals/SupportModal";
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
    options?: {
      onStreamingStart?: () => void;
      onStreamingEnd?: () => void;
      onError?: (error: Error) => void;
    }
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
  
  // Chat state
  const {
    conversations,
    currentConversation,
    sendMessage,
    createConversation,
    deleteConversation,
    updateConversation,
    clearCurrentConversation,
    setCurrentConversation,
    refreshConversations,
    isStreaming,
    cancelStream,
    error,
    retry
  } = useChat();

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isDeletingConversation, setIsDeletingConversation] = useState<string | null>(null);
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const [showModuleWelcome, setShowModuleWelcome] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleType | null>(null);
  const [showClassificationIndicator, setShowClassificationIndicator] = useState(false);
  const [classificationData, setClassificationData] = useState<{
    module: string;
    confidence: number;
    rationale: string;
  } | null>(null);

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
      await sendMessage(message, module, options);
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
    setShowConversationHistory(false);
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
  }, []);

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
        case "k":
          e.preventDefault();
          setShowConversationHistory(true);
          break;
        case "s":
          e.preventDefault();
          handleSupport();
          break;
        case "e":
          e.preventDefault();
          handleExportConversation();
          break;
        case "c":
          e.preventDefault();
          handleClearConversation();
          break;
      }
    }
  }, [handleCreateConversation, handleSupport, handleExportConversation, handleClearConversation]);

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
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.messages.some(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [conversations, searchQuery]);

  const hasMessages = currentConversation?.messages && currentConversation.messages.length > 0;
  const isQuotaExceeded = quota.used >= quota.limit;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-yellow-50 to-orange-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/90 backdrop-blur-sm border-b border-yellow-200">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Chat IA</h1>
          <Badge variant="outline" className="text-yellow-600 border-yellow-300">
            {quota.used}/{quota.limit} mensagens
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConversationHistory(true)}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            Histórico
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateConversation}
            disabled={isCreatingConversation}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Conversa
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSupport}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Suporte
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
            onScroll={handleScroll}
          >
            {!hasMessages ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                    <Headphones className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Bem-vindo ao Chat IA
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Comece uma conversa digitando uma mensagem abaixo.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {Object.entries(MODULES).map(([id, module]) => (
                        <Button
                          key={id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleModuleSelect(convertToOldModuleId(id as ModuleId) as ModuleType)}
                          className="text-xs"
                        >
                          <i className={module.icon}></i> {module.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {currentConversation?.messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onRetry={handleRetry}
                    onExport={handleExportConversation}
                  />
                ))}
                {isStreaming && (
                  <div className="flex items-center gap-3 mb-3 justify-start">
                    <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-white/70 backdrop-blur-sm border border-yellow-200 rounded-2xl px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
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

          {/* Input */}
          <div className="p-4 bg-white/90 backdrop-blur-sm border-t border-yellow-200">
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isStreaming || isLimitReached}
              placeholder={isLimitReached ? "Limite de mensagens atingido" : "Digite sua mensagem..."}
            />
          </div>
        </div>
      </div>

      {/* Classification Indicator */}
      {showClassificationIndicator && classificationData && (
        <ClassificationIndicator
          module={classificationData.module}
          confidence={classificationData.confidence}
          rationale={classificationData.rationale}
          onClose={() => setShowClassificationIndicator(false)}
        />
      )}

      {/* Module Welcome */}
      {showModuleWelcome && selectedModule && (
        <ModuleWelcomeScreen
          module={selectedModule}
          onClose={() => setShowModuleWelcome(false)}
          onStart={() => setShowModuleWelcome(false)}
        />
      )}

      {/* Support Modal */}
      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />

      {/* Conversation History */}
      {showConversationHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Histórico de Conversas</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConversationHistory(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{conversation.title}</h3>
                    <p className="text-sm text-gray-500">
                      {conversation.messages.length} mensagens
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      Abrir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteConversation(conversation.id)}
                      disabled={isDeletingConversation === conversation.id}
                    >
                      {isDeletingConversation === conversation.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Excluir"
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
