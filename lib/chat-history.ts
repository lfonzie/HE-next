export type ChatMessage = { 
  role: "system" | "user" | "assistant" | "tool"; 
  content: any;
  id?: string;
  timestamp?: Date;
};

/**
 * Mapeia mensagens para formato OpenAI (role + content como string)
 */
export function mapToOpenAIMessages(history: ChatMessage[]) {
  return history.map(m => ({
    role: m.role,
    content: typeof m.content === "string" ? m.content : JSON.stringify(m.content)
  }));
}

/**
 * Mapeia mensagens para formato Gemini (contents/parts)
 */
export function mapToGeminiMessages(history: ChatMessage[]) {
  return history.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }]
  }));
}

/**
 * Limita histórico por caracteres (estimativa grosseira de tokens)
 * Preserva o primeiro system message e corta do fim para o começo
 */
export function trimHistory(messages: ChatMessage[], maxChars = 12000): ChatMessage[] {
  const jsonSize = (m: ChatMessage) =>
    (typeof m.content === "string" ? m.content.length : JSON.stringify(m.content).length) + 20;

  let acc = 0;
  const kept: ChatMessage[] = [];
  
  // Preserve o primeiro system message
  const system = messages.find(m => m.role === "system");
  const rest = messages.filter(m => m !== system);

  // Varre do fim para o começo para manter contexto recente
  for (let i = rest.length - 1; i >= 0; i--) {
    const size = jsonSize(rest[i]);
    if (acc + size > maxChars) break;
    acc += size;
    kept.unshift(rest[i]);
  }
  
  return system ? [system, ...kept] : kept;
}

/**
 * Gera sumário de conversa para contexto longo
 */
export function generateConversationSummary(messages: ChatMessage[]): string {
  const userMessages = messages.filter(m => m.role === "user");
  const assistantMessages = messages.filter(m => m.role === "assistant");
  
  if (userMessages.length === 0) return "";
  
  const topics = userMessages.slice(0, 3).map(m => 
    typeof m.content === "string" ? m.content.substring(0, 100) : "Mensagem com conteúdo complexo"
  );
  
  return `Resumo da conversa: ${topics.join("; ")}${userMessages.length > 3 ? "..." : ""}`;
}

/**
 * Converte mensagens do banco para formato ChatMessage
 */
export function convertDbMessagesToChatMessages(dbMessages: any[]): ChatMessage[] {
  return dbMessages.map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.createdAt
  }));
}

/**
 * Converte ChatMessage para formato do banco
 */
export function convertChatMessageToDb(message: ChatMessage, conversationId: string, index: number, provider?: string, model?: string) {
  return {
    conversationId,
    role: message.role,
    content: message.content,
    index,
    provider,
    model,
    tokenCount: typeof message.content === "string" ? Math.ceil(message.content.length / 4) : null
  };
}

/**
 * Valida se uma mensagem está no formato correto
 */
export function validateChatMessage(message: any): message is ChatMessage {
  return (
    message &&
    typeof message === "object" &&
    ["system", "user", "assistant", "tool"].includes(message.role) &&
    message.content !== undefined
  );
}

/**
 * Estima tokens de uma mensagem (aproximação grosseira)
 */
export function estimateTokens(message: ChatMessage): number {
  const content = typeof message.content === "string" ? message.content : JSON.stringify(message.content);
  return Math.ceil(content.length / 4); // ~4 caracteres por token
}

/**
 * Calcula tokens totais de um histórico
 */
export function calculateTotalTokens(messages: ChatMessage[]): number {
  return messages.reduce((total, msg) => total + estimateTokens(msg), 0);
}
