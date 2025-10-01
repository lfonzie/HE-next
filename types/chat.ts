export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  module?: string;
  model?: string;
  tokens?: number;
  tier?: "IA" | "IA_SUPER" | "IA_ECO";
  isStreaming?: boolean;
  originalQuery?: string;
  structured?: boolean;
  webSearchUsed?: boolean;
  citations?: Citation[];
  searchTime?: number;
  attachment?: Attachment;
  // Informações de roteamento do modelo
  provider?: string;
  complexity?: string;
  routingReasoning?: string;
  // Metadados padronizados do modelo efetivo
  meta?: {
    provider?: 'openai' | 'google' | 'anthropic' | 'local';
    model?: string;           // ex: 'gpt-4o-mini' ou 'gemini-2.0-flash-exp'
    routedFrom?: string;      // opcional: 'preferred:gpt-4o' -> 'used:gpt-4o-mini'
    timestamp?: number;
  };
}

export interface Citation {
  title: string;
  url: string;
  snippet: string;
}

export interface Attachment {
  name: string;
  size: number;
  url?: string;
  type: string;
}

export interface Conversation {
  id: string;
  userId: string;
  module: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  title?: string;
}

export interface ChatState {
  currentConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  isStreaming: boolean;
}

export interface ChatContextType extends ChatState {
  sendMessage: (
    message: string,
    module: string,
    conversationId?: string,
    image?: string,
    attachment?: File
  ) => Promise<void>;
  startNewConversation: (module: string) => void;
  clearMessages: () => void;
  stopStreaming: () => void;
}
