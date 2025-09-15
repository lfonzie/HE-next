"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChatMessage } from "@/components/chat/ChatMessage-simple";
import { StreamingMessage } from "@/components/chat/StreamingMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { GeneralWelcome } from "@/components/chat/GeneralWelcome";
import { ModuleWelcome } from "@/components/chat/ModuleWelcome";
import { ModuleWelcomeScreen } from "@/components/chat/ModuleWelcomeScreen";
import { ClassificationIndicator } from "@/components/chat/ClassificationIndicator";
import { useChat } from "@/hooks/useChat";
import { ModuleId, MODULES, convertModuleId, convertToOldModuleId } from "@/lib/modules";
import { ModuleType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, Headphones } from "lucide-react";
import { useChatContext } from "@/components/providers/ChatContext";
import { useQuota } from "@/components/providers/QuotaProvider";
import { SupportModal } from "@/components/modals/SupportModal";
import { useLoading } from "@/lib/loading";
import "@/components/chat/ChatInput.css";

export default function ChatPage() {
  const router = useRouter();
  const { start: startLoading, end: endLoading } = useLoading();
  const { 
    currentConversation, 
    sendMessage, 
    isStreaming, 
    lastClassification,
    startNewConversation,
    fetchConversations 
  } = useChat(() => endLoading('message')); // Pass endLoading callback to hide overlay when streaming starts
  const { toast } = useToast();
  const { selectedModule, setSelectedModule, highlightActiveModule } = useChatContext();
  const { quota, maxQuota, decrementQuota, resetQuota } = useQuota();
  
  // State
  const [inputMessage, setInputMessage] = useState("");
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  
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
    if (!message.trim()) return;
    
    // Start loading with optimized system
    const loadingKey = startLoading('message', {
      message: 'Carregando…',
      cancelable: true,
      priority: 'normal',
      timeout: 12000 // 12s timeout
    });
    
    try {
      await sendMessage(
        message, 
        selectedModule || "atendimento",
        undefined,
        undefined,
        currentConversation?.id
      );
      setInputMessage("");
      
      // Destacar o módulo ativo após enviar a mensagem
      highlightActiveModule();
      
    } catch (error: any) {
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
    await handleSendMessage(`Me ajude com: ${suggestion}`);
  }, [handleSendMessage]);

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
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Conversa
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

        {/* Messages Container - Reading Column Layout */}
        <main className="flex-1 overflow-y-auto chat-messages-container chat-content-with-fixed-input bg-gray-50 dark:bg-zinc-900" ref={messagesContainerRef}>
          {hasMessages ? (
            <div className="mx-auto max-w-screen-md px-4 md:px-6 lg:px-8 leading-relaxed text-pretty">
              <div 
                className="flex flex-col gap-4 md:gap-6 pb-28"
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
                
                {messages.map((message, index) =>
                  message.isStreaming ? (
                    <StreamingMessage
                      key={`streaming-${message.id || index}`}
                      content={message.content}
                      userInitials="U"
                      isComplete={!isStreaming && index === messages.length - 1}
                      currentModuleId={currentModuleId}
                      tier={message.tier}
                      model={message.model}
                      tokens={message.tokens}
                    />
                  ) : (
                    <ChatMessage
                      key={`message-${message.id || index}`}
                      message={message}
                      isUser={message.role === "user"}
                      userInitials="U"
                      currentModuleId={currentModuleId}
                      conversationId={currentConversation?.id || ''}
                      messageIndex={index}
                    />
                  )
                )}
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
