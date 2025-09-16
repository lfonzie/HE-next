"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { StreamingMessage } from "@/components/chat/StreamingMessage";
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
import { useLoading } from "@/lib/loading";
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
    module: string,
    subject?: string,
    grade?: string,
    conversationId?: string,
    image?: string,
    attachment?: File,
    useWebSearch?: boolean
  ) => Promise<{ conversationId: string | undefined; response: string; tokens: number; model: string }>;
  isStreaming: boolean;
  lastClassification: { module: string; confidence: number; rationale: string } | null;
  startNewConversation: (module: string) => void;
  fetchConversations: () => Promise<void>;
  setCurrentConversation: (conv: ChatConversation) => void;
  cancelCurrentRequest: () => void;
};

export default function ChatPage() {
  const router = useRouter();
  const { start: startLoading, end: endLoading } = useLoading();
  const { stopLoading: stopNavLoading } = useNavigationLoading();
  const { 
    conversations,
    currentConversation, 
    sendMessage, 
    isStreaming, 
    lastClassification,
    startNewConversation,
    fetchConversations,
    setCurrentConversation,
    cancelCurrentRequest
  } = useChat(() => endLoading('message')) as unknown as MinimalChatHook; // Pass endLoading callback to hide overlay when streaming starts
  const { toast } = useToast();
  const { selectedModule, setSelectedModule, highlightActiveModule } = useChatContext();
  const { quota, maxQuota, decrementQuota, resetQuota } = useQuota();
  
  // Clear navigation loading when page loads
  useEffect(() => {
    stopNavLoading('navigation');
  }, [stopNavLoading]);
  
  // State
  const [inputMessage, setInputMessage] = useState("");
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  
  // Memoized values
  const currentModuleId = useMemo(
    () => selectedModule ? convertModuleId(selectedModule) : null,
    [selectedModule]
  );

  const messages = useMemo(() => currentConversation?.messages || [], [currentConversation?.messages]);
  const hasMessages = messages.length > 0;
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((conv: ChatConversation) =>
      (conv.title || '').toLowerCase().includes(q) ||
      conv.messages.some((m: ChatMessageType) => (m.content || '').toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);


  // Handle module selection
  const handleSelectModule = useCallback((moduleId: string) => {
    setSelectedModule(moduleId as ModuleType);
    startNewConversation(moduleId);
  }, [setSelectedModule, startNewConversation]);

  // Handle new conversation
  const handleNewConversation = useCallback(() => {
    startNewConversation(selectedModule || "");
    setSelectedModule(null);
  }, [startNewConversation, selectedModule, setSelectedModule]);

  // Handle send message with optimized loading
  const handleSendMessage = useCallback(async (message: string) => {
    console.log('🚀 handleSendMessage called with:', { message, selectedModule, currentConversationId: currentConversation?.id });
    
    if (!message.trim()) {
      console.log('❌ Empty message, returning');
      return;
    }
    
    // Start loading with optimized system
    const loadingKey = startLoading('message', {
      message: 'Carregando…',
      cancelable: true,
      priority: 'normal',
      timeout: 12000 // 12s timeout
    });
    
    try {
      console.log('📤 Calling sendMessage API...');
      await (sendMessage as any)(
        message, 
        selectedModule || "atendimento",
        undefined,
        undefined,
        currentConversation?.id,
        undefined,
        undefined,
        undefined,
        'auto',
        'simple'
      );
      console.log('✅ Message sent successfully');
      setInputMessage("");
      
      // Destacar o módulo ativo após enviar a mensagem
      highlightActiveModule();
      
    } catch (error: any) {
      console.error('❌ Error sending message:', error);
      endLoading(loadingKey, 'error'); // Hide overlay on error
      
      // Show retry option for network errors
      if (error.message?.includes('rede') || error.message?.includes('network')) {
        startLoading('retry', {
          message: 'Conexão lenta, tentando novamente...',
          cancelable: true,
          priority: 'normal',
          timeout: 8000
        });
        
        // Auto-retry once after delay
        setTimeout(async () => {
          try {
            await sendMessage(
              message, 
              selectedModule || "atendimento",
              undefined,
              undefined,
              currentConversation?.id
            );
            setInputMessage("");
            highlightActiveModule();
          } catch (retryError: any) {
            endLoading('retry', 'error');
            toast({
              title: "Erro",
              description: "Falha na conexão. Tente novamente.",
              variant: "destructive"
            });
          }
        }, 2000);
      } else {
        toast({
          title: "Erro",
          description: error.message || "Falha ao enviar mensagem",
          variant: "destructive"
        });
      }
    }
  }, [sendMessage, selectedModule, currentConversation?.id, toast, highlightActiveModule, startLoading, endLoading]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback(async (suggestion: string) => {
    console.log('🎯 handleSuggestionClick called with:', suggestion);
    await handleSendMessage(`Me ajude com: ${suggestion}`);
  }, [handleSendMessage]);

  // Stop streaming
  const handleStopStreaming = useCallback(() => {
    try {
      cancelCurrentRequest();
      toast({ title: "Interrompido", description: "Geração cancelada." });
    } catch (e) {
      // noop
    }
  }, [cancelCurrentRequest, toast]);

  // Handle conversation export
  const handleExportConversation = useCallback(async () => {
    if (!currentConversation) return;
    
    setIsExporting(true);
    try {
      const exportData = {
        conversation: {
          id: currentConversation.id,
          title: currentConversation.title,
          module: currentConversation.module,
          createdAt: currentConversation.createdAt,
          updatedAt: currentConversation.updatedAt,
          tokenCount: currentConversation.tokenCount
        },
        messages: currentConversation.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          model: msg.model,
          tokens: msg.tokens,
          tier: msg.tier
        }))
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversa-${currentConversation.id}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Sucesso",
        description: "Conversa exportada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao exportar conversa",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  }, [currentConversation, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        handleNewConversation();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleNewConversation]);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming]);

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-zinc-900">
        {/* Header */}
        <div className="bg-white dark:bg-zinc-900 shadow-sm border-b border-gray-200 dark:border-zinc-700 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">
                  {currentModuleId ? MODULES[currentModuleId]?.label : "Chat"}
                </h1>
                {currentModuleId && (
                  <p className="text-sm text-gray-600 dark:text-zinc-400">
                    {MODULES[currentModuleId]?.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <Button
                  onClick={handleNewConversation}
                  variant="outline"
                  size="sm"
                  className="border-yellow-500 text-yellow-700 hover:bg-yellow-100 bg-yellow-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Conversa
                </Button>
                {hasMessages && (
                  <Button
                    onClick={handleExportConversation}
                    variant="outline"
                    size="sm"
                    disabled={isExporting}
                    className="border-blue-500 text-blue-700 hover:bg-blue-100 bg-blue-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? "Exportando..." : "Exportar"}
                  </Button>
                )}
                <Button
                  onClick={() => setShowConversationHistory(!showConversationHistory)}
                  variant="outline"
                  size="sm"
                  className="border-purple-500 text-purple-700 hover:bg-purple-100 bg-purple-50"
                >
                  <History className="w-4 h-4 mr-2" />
                  Histórico
                </Button>
                <Button
                  onClick={() => setIsSupportModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Headphones className="w-4 h-4 mr-2" />
                  Suporte
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Conversation History Sidebar */}
        {showConversationHistory && (
          <div className="w-80 bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-zinc-700 space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-zinc-100">Histórico de Conversas</h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                {conversations.length} conversa{conversations.length !== 1 ? 's' : ''}
              </p>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar no histórico..."
                  className="pl-8 h-9 text-sm"
                  aria-label="Buscar conversas"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredConversations.map((conv: ChatConversation) => (
                <Card 
                  key={conv.id}
                  className={`cursor-pointer transition-colors ${
                    currentConversation?.id === conv.id 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50 dark:hover:bg-zinc-700'
                  }`}
                  onClick={() => {
                    setCurrentConversation(conv);
                    setShowConversationHistory(false);
                  }}
                >
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm truncate">
                        {conv.title || 'Nova Conversa'}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {MODULES[convertModuleId(conv.module) || 'PROFESSOR']?.label || conv.module}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {conv.messages.length} mensagens
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(conv.updatedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredConversations.length === 0 && (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Nenhuma conversa encontrada</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages Container - Reading Column Layout */}
        <main className="flex-1 overflow-y-auto chat-messages-container chat-content-with-fixed-input bg-gray-50 dark:bg-zinc-900" ref={messagesContainerRef}>
          {hasMessages ? (
            <div className="mx-auto max-w-screen-md px-4 md:px-6 lg:px-8 leading-relaxed text-pretty">
              <div 
                className="flex flex-col gap-4 md:gap-6 pb-16"
                role="log"
                aria-live="polite"
              >
                {/* Classification Indicator */}
                {lastClassification && (
                  <ClassificationIndicator
                    module={lastClassification.module}
                    confidence={lastClassification.confidence}
                    rationale={lastClassification.rationale}
                    isVisible={true}
                  />
                )}
                
                {messages.map((message, index) => {
                  const isLastMessage = index === messages.length - 1;
                  const shouldRenderStreaming = message.isStreaming;
                  
                  // Debug log para verificar streaming (remover em produção)
                  if (process.env.NODE_ENV === 'development') {
                    console.log('🔍 Message render debug:', {
                      messageId: message.id,
                      index,
                      isLastMessage,
                      isStreaming: message.isStreaming,
                      shouldRenderStreaming,
                      globalIsStreaming: isStreaming,
                      content: message.content?.substring(0, 50) + '...',
                      renderType: shouldRenderStreaming ? 'StreamingMessage' : 'ChatMessage'
                    });
                  }
                  
                  return shouldRenderStreaming ? (
                    <StreamingMessage
                      key={`streaming-${message.id || index}`}
                      content={message.content}
                      userInitials="U"
                      isComplete={!message.isStreaming}
                      currentModuleId={currentModuleId}
                      tier={message.tier}
                      model={message.model}
                      tokens={message.tokens}
                      provider={message.provider}
                      complexity={message.complexity}
                    />
                  ) : (
                    <ChatMessage
                      key={`message-${message.id || index}-${message.isStreaming ? 'streaming' : 'complete'}`}
                      message={message}
                      isUser={message.role === "user"}
                      userInitials="U"
                      currentModuleId={currentModuleId}
                      conversationId={currentConversation?.id || ''}
                      messageIndex={index}
                    />
                  );
                })}
                {/* Scroll sentinel */}
                <div ref={endRef} />
              </div>
            </div>
          ) : currentModuleId ? (
            <ModuleWelcomeScreen
              moduleId={currentModuleId}
              onSuggestionClick={handleSuggestionClick}
              quotaAvailable={true}
            />
          ) : (
            <GeneralWelcome
              selectedModule={selectedModule}
              selectedModuleLabel={null}
              onModuleSelect={(moduleId: string) => handleSelectModule(moduleId)}
              onSuggestionClick={handleSuggestionClick}
              quotaAvailable={true}
            />
          )}
        </main>

        {/* Chat Input - Fixed Composer with Blur */}
        <div className="sticky bottom-0 left-0 right-0 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-zinc-900/60 border-t border-zinc-200/60 dark:border-zinc-700/50 shadow-[0_-1px_0_0_rgba(0,0,0,0.04)] px-4 md:px-6 lg:px-8 py-3">
          <div className="mx-auto max-w-screen-md">
            
            {isStreaming && (
              <div className="flex justify-end pb-2">
                <Button
                  onClick={handleStopStreaming}
                  variant="destructive"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Parar
                </Button>
              </div>
            )}
            <ChatInput
              message={inputMessage}
              onMessageChange={setInputMessage}
              onSendMessage={handleSendMessage}
              isStreaming={isStreaming}
              disabled={false}
              placeholder={
                currentModuleId 
                  ? `Digite sua pergunta sobre ${MODULES[currentModuleId]?.label?.toLowerCase()}...`
                  : "Digite sua pergunta ou escolha um módulo..."
              }
            />
          </div>
        </div>

        {/* Support Modal */}
        <SupportModal
          isOpen={isSupportModalOpen}
          onClose={() => setIsSupportModalOpen(false)}
        />
    </div>
  );
}
