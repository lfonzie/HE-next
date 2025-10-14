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
import { ModuleType, Message as ChatMessageType, Conversation as ChatConversation, Message } from "@/types";
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
import { StudyPackModal } from "@/components/chat/StudyPackModal";
import { StudyPlanModal } from "@/components/chat/StudyPlanModal";
import { TIResolutionSteps } from "@/components/chat/TIResolutionSteps";
import { TIModal } from "@/components/chat/TIModal";
import { detectIntent } from "@/lib/intent-detection";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { useNavigationLoading } from "@/hooks/useNavigationLoading";
import { FollowUpSuggestions } from "@/components/chat/FollowUpSuggestions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import "@/components/chat/ChatInput.css";

/* Estilos específicos para dark mode no chat */
const chatDarkModeStyles = `
  .dark .chat-gradient-bg {
    background: linear-gradient(135deg, #000000 0%, #0f172a 50%, #000000 100%);
  }

  .dark .chat-message-user {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }

  .dark .chat-message-assistant {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    border: 1px solid #475569;
  }

  .dark .chat-avatar-user {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border-color: rgba(245, 158, 11, 0.3);
  }

  .dark .chat-avatar-assistant {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-color: rgba(59, 130, 246, 0.3);
  }

  .dark .chat-header {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-bottom: 1px solid #334155;
  }
`;

// Injetar estilos no componente
if (typeof document !== 'undefined') {
  const styleId = 'chat-dark-mode-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = chatDarkModeStyles;
    document.head.appendChild(style);
  }
}

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
  console.log('🎨 [CHAT-COMPONENT] Rendering ChatComponent');
  const router = useRouter();
  const { toast } = useToast();
  const { quota, isLimitReached, consumeQuota } = useQuota();
  const { startLoading, stopLoading } = useGlobalLoading();
  const { isNavigating } = useNavigationLoading();
  
  // Função para lidar com detecção automática de módulo (simplificada)
  const handleModuleDetected = useCallback((module: string, message: string) => {
    console.log(`🎯 [CHAT-COMPONENT] Module detected: ${module} for message: "${message}"`);
    // Módulos agora são tratados diretamente no chat, sem modais
  }, []);

  // Funções helper para detectar e parsear respostas de resolução TI
  const isTIResolutionMessage = useCallback((content: string): boolean => {
    try {
      console.log('🔍 [TI-DETECTION] Checking content for TI resolution. Full content:', content);
      console.log('🔍 [TI-DETECTION] Content length:', content.length);

      // Primeiro verificar se começa com { (JSON)
      if (!content.trim().startsWith('{')) {
        console.log('🔍 [TI-DETECTION] Content does not start with {, not JSON');
        return false;
      }

      const parsed = JSON.parse(content);
      const isValid = parsed.problema && parsed.etapas && Array.isArray(parsed.etapas);
      console.log('🔍 [TI-DETECTION] Parsed JSON:', parsed);
      console.log('🔍 [TI-DETECTION] Is valid TI JSON:', isValid);
      return isValid;
    } catch (error) {
      console.log('🔍 [TI-DETECTION] Failed to parse as JSON:', error);
      console.log('🔍 [TI-DETECTION] Raw content that failed:', content);

      // Tentar detectar se é uma resposta de TI mesmo que não seja JSON perfeito
      // Verificar se contém palavras-chave de TI
      const hasTIKeywords = /\b(problema|etapas?|solução|diagnóstico|resolver|passo)\b/i.test(content);
      const hasJSONStructure = /\{[\s\S]*"problema"[\s\S]*"etapas"[\s\S]*\}/i.test(content);

      console.log('🔍 [TI-DETECTION] Has TI keywords:', hasTIKeywords);
      console.log('🔍 [TI-DETECTION] Has JSON structure:', hasJSONStructure);

      if (hasTIKeywords && hasJSONStructure) {
        console.log('🔍 [TI-DETECTION] Attempting to extract JSON from mixed content');
        // Tentar extrair JSON de conteúdo misto
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const extractedJson = JSON.parse(jsonMatch[0]);
            const isValid = extractedJson.problema && extractedJson.etapas && Array.isArray(extractedJson.etapas);
            console.log('🔍 [TI-DETECTION] Extracted valid TI JSON:', isValid);
            return isValid;
          } catch (extractError) {
            console.log('🔍 [TI-DETECTION] Failed to extract JSON:', extractError);
          }
        }
      }

      return false;
    }
  }, []);

  const parseTIResolutionData = useCallback((content: string) => {
    try {
      // Tentar parse direto primeiro
      return JSON.parse(content);
    } catch (error) {
      console.log('🔄 [TI-PARSER] Failed to parse as direct JSON, creating structured data from text');

      // 🔧 PARSER INTELIGENTE: Extrair estrutura do texto normal
      const lines = content.split('\n').filter(line => line.trim().length > 0);

      // Identificar problema principal
      let problema = 'Problema técnico identificado';
      const firstLine = lines[0]?.toLowerCase() || '';
      if (firstLine.includes('pc') && firstLine.includes('lento')) {
        problema = 'Computador funcionando lentamente';
      } else if (firstLine.includes('internet')) {
        problema = 'Problemas de conexão com internet';
      } else if (firstLine.includes('impressora')) {
        problema = 'Impressora com problemas';
      }

      // Extrair etapas do texto
      const etapas = [];
      let stepId = 1;

      // Procurar por padrões comuns de listas numeradas - MODIFICADO PARA EVITAR COMANDOS PERIGOSOS
      const numberedSteps = content.match(/\d+\.\s*\*\*([^*]+)\*\*:\s*([^]*?)(?=\d+\.|$)/g);
      if (numberedSteps) {
        numberedSteps.forEach(step => {
          const titleMatch = step.match(/\d+\.\s*\*\*([^*]+)\*\*/);
          const descMatch = step.match(/\*\*:\s*([^]*?)(?=\d+\.|$)/);

          if (titleMatch && descMatch) {
            let titulo = titleMatch[1].trim();
            let descricao = descMatch[1].trim();

            // EVITAR comandos perigosos - substituir por instruções manuais
            if (titulo.toLowerCase().includes('reinici') || titulo.toLowerCase().includes('restart')) {
              titulo = 'Verificar programas abertos';
              descricao = 'Feche programas desnecessários antes de reinicializar manualmente se desejar';
            }

            etapas.push({
              id: stepId++,
              titulo,
              descricao,
              comando: null, // SEMPRE null - apenas instruções manuais
              status: 'pendente',
              validacao: 'Verificar se o problema foi resolvido'
            });
          }
        });
      }

      // Fallback: criar etapas básicas se não encontrou estrutura - APENAS INSTRUÇÕES MANUAIS
      if (etapas.length === 0) {
        // Procurar por palavras-chave comuns - SEM EXECUÇÃO AUTOMÁTICA
        if (content.toLowerCase().includes('reinici')) {
          etapas.push({
            id: 1,
            titulo: 'Preparar para reinicialização',
            descricao: 'Salve seus trabalhos e feche programas importantes antes de reinicializar',
            comando: null,
            status: 'pendente',
            validacao: 'Execute a reinicialização manualmente quando estiver pronto'
          });
        }

        if (content.toLowerCase().includes('limp')) {
          etapas.push({
            id: etapas.length + 1,
            titulo: 'Limpar arquivos temporários',
            descricao: 'Abra Configurações > Sistema > Armazenamento e execute a limpeza de disco',
            comando: null,
            status: 'pendente',
            validacao: 'Verificar se há mais espaço disponível no disco após a limpeza'
          });
        }

        if (content.toLowerCase().includes('atualiz')) {
          etapas.push({
            id: etapas.length + 1,
            titulo: 'Verificar atualizações',
            descricao: 'Abra Configurações > Atualização e Segurança > Windows Update para verificar atualizações',
            comando: null,
            status: 'pendente',
            validacao: 'Instalar as atualizações disponíveis quando conveniente'
          });
        }
      }

      // Garantir pelo menos uma etapa - SEM COMANDOS EXECUTÁVEIS
      if (etapas.length === 0) {
        etapas.push({
          id: 1,
          titulo: 'Verificar programas em execução',
          descricao: 'Abra o Gerenciador de Tarefas (Ctrl + Shift + Esc) e veja se há programas consumindo muitos recursos',
          comando: null, // SEMPRE null - apenas instruções manuais
          status: 'pendente',
          validacao: 'Feche programas desnecessários e verifique se o PC ficou mais rápido'
        });
      }

      const result = {
        problema,
        status: 'ativo' as const,
        etapas,
        proxima_acao: `Execute a etapa ${etapas.length > 0 ? '1' : ''} e me informe o resultado`
      };

      console.log('✅ [TI-PARSER] Created structured data from text:', result);
      return result;
    }
  }, []);

  // Chat state - usando o novo sistema unificado
  const {
    conversationId,
    messages,
    setMessages,
    send,
    sendStream,
    loading,
    error,
    newConversation,
    provider,
    setProvider,
    model,
    setModel,
    autoSelection,
    followUpSuggestions
  } = useUnifiedChat("grok", "grok-4-fast-reasoning", handleModuleDetected);

  // Debug: verificar se as funções estão disponíveis
  console.log('🔧 [CHAT] Hook functions availability:', {
    sendAvailable: !!send,
    sendStreamAvailable: !!sendStream,
    setMessagesAvailable: !!setMessages
  });

  // Funções para lidar com etapas de resolução TI
  const handleStepComplete = useCallback(async (stepId: number, success: boolean = true) => {
    if (!send) {
      console.warn('⚠️ [TI-STEP] Send function not available yet');
      return;
    }

    const message = success
      ? `Funcionou! O problema foi resolvido com a etapa ${stepId}.`
      : `A etapa ${stepId} foi tentada, mas ainda há problemas. Forneça a próxima solução em formato JSON estruturado.`;

    console.log(`✅ [TI-STEP] Step ${stepId} ${success ? 'succeeded' : 'failed'}`);

    if (success) {
      // Se funcionou, fechar modal e enviar mensagem normal
      setShowTIModal(false);
      setTiModalData(null);
      await send(message, undefined, false, `etapa_${stepId}_funcionou`);
    } else {
      // Se ainda há problemas, manter modal aberto e forçar resposta JSON
      await send(message, 'ti', false, `etapa_${stepId}_problemas`);
    }
  }, [send]);


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
  const [showStudyPackModal, setShowStudyPackModal] = useState(false);
  const [studyPackTopic, setStudyPackTopic] = useState('');
  const [isStudyPathModal, setIsStudyPathModal] = useState(false);
  const [showStudyPlanModal, setShowStudyPlanModal] = useState(false);
  const [studyPlanTopic, setStudyPlanTopic] = useState('');
  const [showTIModal, setShowTIModal] = useState(false);
  const [tiModalData, setTiModalData] = useState<any>(null);
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
    console.log('🚀 [CHAT] handleSendMessage called with:', { message, module });
    if (!message.trim()) {
      console.log('🚫 [CHAT] Empty message, returning');
      return;
    }

    // Verificar saudações simples e responder diretamente
    const greetingPatterns = [
      /^\s*oi\s*$/i,
      /^\s*olá\s*$/i,
      // /^\s*tudo\s+bem\s*\??\s*$/i, // Removido - "tudo bem?" merece resposta completa da IA
      /^\s*e\s*ai\s*$/i,
      /^\s*opa\s*$/i,
      /^\s*ei\s*$/i
    ];

    const isSimpleGreeting = greetingPatterns.some(pattern => pattern.test(message.trim()));
    console.log('🔍 [CHAT] Checking greeting patterns:', {
      message: message.trim(),
      isSimpleGreeting,
      patterns: greetingPatterns.map(p => p.toString())
    });

    if (isSimpleGreeting) {
      console.log('👋 [CHAT] Detected simple greeting, responding directly');
      // Para saudações simples, usar abordagem simples sem banco de dados
      const greetingResponse: Message = {
        id: `greeting-${Date.now()}`,
        role: 'assistant',
        content: 'Oi!',
        timestamp: new Date(),
        model: 'grok-4-fast-reasoning',
        provider: 'grok'
      };

      // Adicionar mensagem do usuário também
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date(),
        model: 'grok-4-fast-reasoning',
        provider: 'grok'
      };

      console.log('📝 [CHAT] Adding user message and greeting response to messages');
      // Apenas atualizar UI com a resposta (não salvar no banco para evitar problemas)
      setMessages(prev => {
        console.log('📊 [CHAT] Previous messages count:', prev.length);
        const newMessages = [...prev, userMessage, greetingResponse];
        console.log('📊 [CHAT] New messages count:', newMessages.length);
        return newMessages;
      });

      return; // Não enviar para AI
    }
    
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

    // Detect study pack intent
    if (intent.type === 'studypack') {
      console.log('✅ [CHAT] Opening study pack modal for topic:', intent.topic);
      setStudyPackTopic(intent.topic || '');
      setIsStudyPathModal(false);
      setShowStudyPackModal(true);
      return; // Don't send to chat, show study pack modal instead
    }

    // Detect study path intent (always open modal for ENEM trails)
    if (intent.type === 'studypath') {
      console.log('✅ [CHAT] Opening study path modal for ENEM trail, topic:', intent.topic);
      setStudyPackTopic(intent.topic || '');
      setIsStudyPathModal(true);
      setShowStudyPackModal(true);
      return; // Don't send to chat, show study pack modal instead
    }
    
    if (isLimitReached) {
      toast({
        title: "Limite atingido",
        description: "Você atingiu o limite de mensagens. Faça upgrade do seu plano.",
        variant: "destructive",
      });
      return;
    }

    // Adicionar mensagem do usuário ao estado antes de enviar
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
      model: 'grok-4-fast-reasoning',
      provider: 'grok'
    };

    console.log('📝 [CHAT] Adding user message to state');
    setMessages(prev => [...prev, userMessage]);

    try {
      console.log('🔄 [CHAT] Processing normal message - NOT a greeting, going to AI');
      console.log('📊 [CHAT] Message details:', { message, length: message.length, trimmed: message.trim() });
      startLoading("Enviando mensagem...", "data");
      // Usar streaming com seleção automática baseada na complexidade
      console.log('🤖 [CHAT] About to call sendStream:', { message, sendStreamAvailable: !!sendStream });
      if (!sendStream) {
        console.error('❌ [CHAT] sendStream function not available!');
        return;
      }
      try {
        await sendStream(message, undefined, true); // useAutoSelection = true
        console.log('✅ [CHAT] sendStream completed successfully');
        consumeQuota();
      } catch (error) {
        console.error('❌ [CHAT] sendStream failed:', error);
        throw error;
      }
      
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
    // Special handling for TI module - open modal directly
    if (moduleId === 'TI') {
      setShowTIModal(true);
      return;
    }

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

  // Handle follow-up suggestion click
  const handleFollowUpSuggestionClick = useCallback((suggestion: string) => {
    console.log(`💡 [FOLLOW-UP] Suggestion clicked: ${suggestion}`);
    handleSendMessage(suggestion, undefined, {
      onStreamingStart: () => {
        // Clear suggestions when starting a new message
        // This will be handled by newConversation in the hook
      }
    });
  }, [handleSendMessage]);

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

  // useEffect para gerenciar abertura do modal TI (evita loops de re-renderização)
  useEffect(() => {
    if (currentConversation?.messages && currentConversation.messages.length > 0) {
      const lastMessage = currentConversation.messages[currentConversation.messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        const hasTIKeywords = (text: string) => {
          const keywords = ['pc', 'computador', 'lento', 'internet', 'wifi', 'impressora', 'erro', 'problema', 'não funciona', 'travando', 'lento', 'conexão', 'rede', 'sistema', 'aplicativo', 'programa', 'software', 'hardware', 'dispositivo', 'equipamento'];
          return keywords.some(keyword => text.toLowerCase().includes(keyword));
        };

        // Verificar se há mensagens de usuário com problemas técnicos na conversa
        const hasTechnicalIssues = currentConversation.messages.some(m =>
          m.role === 'user' && hasTIKeywords(m.content)
        );

        // Verificar se é uma resposta TI baseada em múltiplos critérios
        const isTIJSON = lastMessage.content.trim().startsWith('{') && 
          (lastMessage.content.includes('"problema"') || lastMessage.content.includes('"etapas"'));
        
        const isTIMessage = hasTechnicalIssues && (
          lastMessage.module === 'ti' || // Módulo detectado como TI
          isTIJSON || // Resposta em formato JSON de TI
          (lastMessage.content.length > 200 && 
           !lastMessage.content.includes('😊') && 
           !lastMessage.content.includes('Tudo bem?') &&
           !lastMessage.content.includes('Olá') &&
           !lastMessage.content.includes('Como posso ajudar'))
        );

        if (isTIMessage) {
          console.log('✅ [MODAL-EFFECT] Processing TI Modal for message:', lastMessage.id);
          console.log('✅ [MODAL-EFFECT] Message module:', lastMessage.module);
          console.log('✅ [MODAL-EFFECT] Is TI JSON:', isTIJSON);
          console.log('✅ [MODAL-EFFECT] Has technical issues:', hasTechnicalIssues);
          
          const tiData = parseTIResolutionData(lastMessage.content);

          // Usar setTimeout para evitar re-renders imediatos
          setTimeout(() => {
            setTiModalData(tiData);
            if (!showTIModal) {
              console.log('✅ [MODAL-EFFECT] Opening TI Modal');
              setShowTIModal(true);
            } else {
              console.log('✅ [MODAL-EFFECT] Updating TI Modal with new data');
            }
          }, 100);
        }
      }
    }
  }, [currentConversation?.messages.length, showTIModal]); // Incluir showTIModal para evitar loops

  return (
    <div className="bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-100 dark:from-black dark:via-slate-900 dark:to-black chat-gradient-bg flex flex-col">
      {/* Chat Container - Fixed at bottom */}
      <div className="flex-1 flex flex-col pb-0" role="main">
        {/* Enhanced Header - Mostrar apenas quando não há mensagens */}
        {!hasMessages && (
          <header className="text-center mb-16">
            <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-red-400/20 to-pink-400/20 rounded-3xl blur-3xl"></div>
              
              <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20 dark:border-slate-700/20">
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
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-200 dark:border-orange-800">
                    <div className="w-12 h-12 bg-orange-500 dark:bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Assistentes Especializados</h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300">Professores, TI, Secretaria e mais módulos especializados</p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                    <div className="w-12 h-12 bg-red-500 dark:bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Respostas Contextuais</h3>
                    <p className="text-sm text-red-700 dark:text-red-300">IA treinada para cada área específica de conhecimento</p>
                  </div>
                  <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-2xl border border-pink-200 dark:border-pink-800">
                    <div className="w-12 h-12 bg-pink-500 dark:bg-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-pink-800 dark:text-pink-200 mb-2">Conversação Natural</h3>
                    <p className="text-sm text-pink-700 dark:text-pink-300">Interface intuitiva para diálogos fluidos e eficientes</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Chat Interface - Fixed at bottom */}
        <div className="flex-1 flex flex-col min-h-0 px-4 md:px-8 lg:px-16 xl:px-24">
          <div className="flex-1 bg-white/90 dark:bg-slate-900/95 backdrop-blur-sm border-2 border-yellow-200 dark:border-slate-600 shadow-xl rounded-3xl overflow-hidden flex flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-slate-800 dark:to-slate-900 dark:border-slate-700 text-white flex-shrink-0 chat-header">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-white dark:text-white">Chat IA</h1>

              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateConversation}
                  disabled={isCreatingConversation}
                  className="text-black dark:text-white border-yellow-300 dark:border-slate-600 hover:bg-white/20 dark:hover:bg-slate-700/50 shadow-sm"
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
                  <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Olá! Como posso ajudar?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Digite sua mensagem abaixo e receba sugestões inteligentes para aulas, simulados ENEM e correção de redações.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center relative">
                    {Object.entries(MODULES).map(([id, module]) => (
                      <Button
                        key={id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleModuleClick(id as ModuleId)}
                        className="text-xs border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-slate-700 hover:scale-105 transition-all duration-200"
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
                  {console.log('🔍 [CHAT-RENDER] Current conversation messages count:', currentConversation?.messages?.length)}
                  {currentConversation?.messages.map((message) => {
                    // Verificar se é uma resposta de resolução TI
                    console.log('🔍 [MESSAGE-RENDER] Processing message:', message.id, 'role:', message.role, 'content preview:', message.content.substring(0, 100));
            
            // 🔧 DETECÇÃO TI: Verificar se é módulo TI baseado no conteúdo e contexto
            const hasTIKeywords = (text: string) => {
              const keywords = ['pc', 'computador', 'lento', 'internet', 'wifi', 'impressora', 'erro', 'problema', 'não funciona', 'travando', 'lento', 'conexão', 'rede', 'sistema', 'aplicativo', 'programa', 'software', 'hardware', 'dispositivo', 'equipamento'];
              return keywords.some(keyword => text.toLowerCase().includes(keyword));
            };

            // Verificar se é uma mensagem TI baseada em:
            // 1. Módulo detectado como 'ti'
            // 2. Conteúdo JSON de resolução TI
            // 3. Contexto da conversa (usuário mencionou problema técnico)
            const isTIJSON = message.content.trim().startsWith('{') && 
              (message.content.includes('"problema"') || message.content.includes('"etapas"'));
            
            const hasUserTIContext = currentConversation?.messages.some(m => 
              m.role === 'user' && hasTIKeywords(m.content)
            );

            const isTIMessage = message.role === 'assistant' && (
              message.module === 'ti' || // Módulo detectado como TI
              isTIJSON || // Resposta em formato JSON de TI
              (hasUserTIContext && message.content.length > 200 && !message.content.includes('😊'))
            );

            console.log('🔍 [MESSAGE-RENDER] Is TI message (forced detection):', isTIMessage, 'for message:', message.id);

            // Não renderizar mensagens TI no chat - elas aparecem no modal
            if (isTIMessage) {
              console.log('🚫 [MESSAGE-RENDER] Skipping TI message in chat - will show in modal');
              return null;
            }

                    return (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        isUser={message.role === 'user'}
                      />
                    );
                  })}

                  {/* Follow-up Suggestions */}
                  {followUpSuggestions && followUpSuggestions.length > 0 && !isStreaming && (
                    <FollowUpSuggestions
                      suggestions={followUpSuggestions}
                      onSuggestionClick={handleFollowUpSuggestionClick}
                    />
                  )}

                  {isStreaming && (
                    <div className="flex items-center gap-3 mb-3 justify-start">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl px-4 py-3 shadow-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
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

      {/* Study Pack Modal */}
      <StudyPackModal
        isOpen={showStudyPackModal}
        onClose={() => setShowStudyPackModal(false)}
        topic={studyPackTopic}
        isStudyPath={isStudyPathModal}
      />

      {/* Study Plan Modal */}
      <StudyPlanModal
        isOpen={showStudyPlanModal}
        onClose={() => setShowStudyPlanModal(false)}
      />

      {/* TI Modal */}
      <TIModal
        isOpen={showTIModal}
        onClose={() => setShowTIModal(false)}
        data={tiModalData}
        onStepComplete={handleStepComplete}
        isLoading={isStreaming}
      />

    </div>
  );
}
