"use client";
import { useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { analyzeQuestion, getSelectionExplanation } from "@/lib/complexity-detector";
import { aiClassify } from "@/lib/ai-classifier";
import { fastClassify } from "@/lib/fast-classifier";

type Provider = "openai" | "gpt5" | "gemini" | "perplexity" | "grok";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  model?: string;
  provider?: string;
  tier?: string;
  complexity?: string;
  module?: string;
  tokens?: number;
  isStreaming?: boolean;
  meta?: {
    provider?: 'openai' | 'google' | 'anthropic' | 'local';
    model?: string;
    routedFrom?: string;
    timestamp?: number;
  };
}

interface ChatResponse {
  conversationId: string;
  reply: string;
  provider: string;
  model: string;
  usage?: any;
  timing?: {
    total: number;
    provider: number;
  };
}

export function useUnifiedChat(
  initialProvider: Provider = "openai",
  initialModel = "gpt-4o-mini",
  onModuleDetected?: (module: string, message: string) => void
) {
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider>(initialProvider);
  const [model, setModel] = useState<string>(initialModel);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSelection, setAutoSelection] = useState<string | null>(null);

  // Função para validar UUID
  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Boot: sempre limpar conversas antigas e iniciar nova conversa efêmera
  useEffect(() => {
    console.log("🚀 [UNIFIED-CHAT] Hook initializing...");
    // Limpar qualquer resquício de conversa anterior
    localStorage.removeItem("chat:cid");
    const url = new URL(window.location.href);
    url.searchParams.delete("cid");
    window.history.replaceState({}, "", url.toString());

    // Limpar estado atual
    setMessages([]);
    setError(null);

    // Gerar nova conversa efêmera
    const newId = uuidv4();
    setConversationId(newId);
    console.log("🧹 [UNIFIED-CHAT] Cleared old conversation, started new ephemeral chat:", newId);
  }, []);

  // Função removida: loadConversationHistory - conversas são efêmeras

  const ensureId = useCallback(() => {
    if (!conversationId || !isValidUUID(conversationId)) {
      const id = uuidv4();
      setConversationId(id);
      const url = new URL(window.location.href);
      url.searchParams.set("cid", id);
      window.history.replaceState({}, "", url.toString());
      localStorage.setItem("chat:cid", id);
      return id;
    }
    return conversationId;
  }, [conversationId, isValidUUID]);

  const send = useCallback(async (input: string, system?: string, useAutoSelection: boolean = true, stepFeedback?: string) => {
    setLoading(true);
    setError(null);
    
    // Análise automática da pergunta
    let currentProvider = provider;
    let currentModel = model;
    let selectionExplanation = null;
    
    if (useAutoSelection) {
      const analysis = analyzeQuestion(input);
      currentProvider = analysis.recommendedProvider;
      currentModel = analysis.recommendedModel;
      selectionExplanation = getSelectionExplanation(analysis);
      
      // Atualizar provider e model se diferentes
      if (currentProvider !== provider) {
        setProvider(currentProvider);
      }
      if (currentModel !== model) {
        setModel(currentModel);
      }
      
      setAutoSelection(selectionExplanation);
    }
    
    // ✨ NOVO: Detectar módulo automaticamente usando IA
    const moduleDetection = await aiClassify(input, messages.length);
    const detectedModule = moduleDetection.module;
    console.log(`🎯 [AI-CLASSIFIER] Module detected: ${detectedModule} (confidence: ${moduleDetection.confidence})`);

    // 🔧 Para problemas técnicos, forçar uso do Grok 4 Fast
    if (detectedModule === 'ti') {
      console.log(`🔧 [AUTO-TI] Technical problem detected, using Grok 4 Fast`);
      // Forçar uso do Grok 4 Fast para problemas técnicos
      currentProvider = 'grok';
      currentModel = 'grok-4-fast-reasoning';
      setProvider('grok');
      setModel('grok-4-fast-reasoning');
    }

    const cid = ensureId();
    // Mensagem do usuário agora adicionada no frontend
    
    try {
      const response = await fetch("/api/chat/unified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          provider: currentProvider, 
          model: currentModel, 
          input, 
          system,
          module: detectedModule, // ✨ NOVO: Passar módulo detectado
          conversationId: cid,
        })
      });
      
      const data: ChatResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.reply || "Erro na API");
      }
      
      // Atualizar conversationId se necessário
      if (data.conversationId && data.conversationId !== cid) {
        setConversationId(data.conversationId);
        localStorage.setItem("chat:cid", data.conversationId);
        const url = new URL(window.location.href);
        url.searchParams.set("cid", data.conversationId);
        window.history.replaceState({}, "", url.toString());
      }
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (e: any) {
      setError(e.message);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `⚠️ Erro: ${e.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [provider, model, ensureId]);

  const sendStream = useCallback(async (input: string, system?: string, useAutoSelection: boolean = true) => {
    console.log('🎬 [UNIFIED-CHAT] sendStream called:', { input: input.substring(0, 50) + '...', system, useAutoSelection });
    setLoading(true);
    setError(null);
    
    // Análise automática da pergunta
    let currentProvider = provider;
    let currentModel = model;
    let selectionExplanation = null;
    
    if (useAutoSelection) {
      const analysis = analyzeQuestion(input);
      currentProvider = analysis.recommendedProvider;
      currentModel = analysis.recommendedModel;
      selectionExplanation = getSelectionExplanation(analysis);
      
      // Atualizar provider e model se diferentes
      if (currentProvider !== provider) {
        setProvider(currentProvider);
      }
      if (currentModel !== model) {
        setModel(currentModel);
      }
      
      setAutoSelection(selectionExplanation);
    }
    
    // ✨ NOVO: Detectar módulo automaticamente usando IA
    const moduleDetection = await aiClassify(input, messages.length);
    const detectedModule = moduleDetection.module;
    console.log(`🎯 [AI-CLASSIFIER] Module detected: ${detectedModule} (confidence: ${moduleDetection.confidence})`);

    // 🔧 Para problemas técnicos, forçar uso do Grok 4 Fast
    if (detectedModule === 'ti') {
      console.log(`🔧 [AUTO-TI] Technical problem detected, using Grok 4 Fast`);
      // Forçar uso do Grok 4 Fast para problemas técnicos
      currentProvider = 'grok';
      currentModel = 'grok-4-fast-reasoning';
      setProvider('grok');
      setModel('grok-4-fast-reasoning');
    }

    const cid = ensureId();
    // Mensagem do usuário agora adicionada no frontend
    
    // Criar mensagem temporária para streaming
    const tempId = `temp-${Date.now()}`;
    const tempMessage: ChatMessage = {
      id: tempId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      const response = await fetch("/api/chat/unified/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          provider: currentProvider, 
          model: currentModel, 
          input, 
          system,
          module: detectedModule, // ✨ NOVO: Passar módulo detectado
          conversationId: cid,
        })
      });
      
      if (!response.ok) {
        throw new Error("Erro no streaming");
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      
      if (reader) {
        console.log(`📡 [UNIFIED-CHAT] Starting to read stream...`);
        let chunkCount = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  chunkCount++;
                  fullContent += data.content;
                  console.log(`📝 [UNIFIED-CHAT] Received chunk ${chunkCount}: "${data.content}"`);
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === tempId 
                        ? { ...msg, content: fullContent }
                        : msg
                    )
                  );
                } else if (data.type === 'content_replace') {
                  // Handle content replacement for Perplexity cleaning
                  fullContent = data.content;
                  console.log(`🔄 [UNIFIED-CHAT] Content replaced with cleaned version`);
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === tempId
                        ? { ...msg, content: fullContent }
                        : msg
                    )
                  );
                } else if (data.type === 'suggestions') {
                  // Handle follow-up suggestions
                  console.log(`💡 [UNIFIED-CHAT] Received suggestions:`, data.suggestions);
                  setFollowUpSuggestions(data.suggestions || []);
                } else if (data.metadata) {
                  console.log(`📊 [UNIFIED-CHAT] Received metadata:`, data.metadata);
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === tempId 
                        ? { 
                            ...msg, 
                            model: data.metadata.model,
                            provider: data.metadata.provider,
                            tier: data.metadata.tier,
                            complexity: data.metadata.complexity,
                            module: data.metadata.module,
                            tokens: data.metadata.tokens
                          }
                        : msg
                    )
                  );
                } else if (data.meta) {
                  console.log(`🏷️ [UNIFIED-CHAT] Received meta:`, data.meta);
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === tempId 
                        ? { 
                            ...msg, 
                            meta: data.meta
                          }
                        : msg
                    )
                  );
                } else if (data.type === "metadata" && data.conversationId !== cid) {
                  setConversationId(data.conversationId);
                  localStorage.setItem("chat:cid", data.conversationId);
                  const url = new URL(window.location.href);
                  url.searchParams.set("cid", data.conversationId);
                  window.history.replaceState({}, "", url.toString());
                }
              } catch (e) {
                console.warn(`⚠️ [UNIFIED-CHAT] Failed to parse line: ${line}`, e);
              }
            }
          }
        }
        console.log(`✅ [UNIFIED-CHAT] Stream completed. Total chunks: ${chunkCount}`);
      }
      
      // Finalizar mensagem temporária
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, id: `assistant-${Date.now()}`, content: fullContent, isStreaming: false }
            : msg
        )
      );
      
    } catch (e: any) {
      setError(e.message);
      setMessages(prev => 
        prev.filter(msg => msg.id !== tempId).concat({
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `⚠️ Erro: ${e.message}`,
          timestamp: new Date()
        })
      );
    } finally {
      setLoading(false);
    }
  }, [provider, model, ensureId]);

  const newConversation = useCallback((nextProvider?: Provider, nextModel?: string) => {
    const id = uuidv4();
    setConversationId(id);
    localStorage.setItem("chat:cid", id);
    const url = new URL(window.location.href);
    url.searchParams.set("cid", id);
    window.history.replaceState({}, "", url.toString());
    setMessages([]);
    setError(null);
    setFollowUpSuggestions([]);
    if (nextProvider) setProvider(nextProvider);
    if (nextModel) setModel(nextModel);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    conversationId,
    provider,
    setProvider,
    model,
    setModel,
    messages,
    setMessages,
    send,
    sendStream,
    loading,
    error,
    clearError,
    newConversation,
    autoSelection,
    followUpSuggestions
  };
}
