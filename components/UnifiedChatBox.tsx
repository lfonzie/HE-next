"use client";
import { useUnifiedChat } from "@/hooks/useUnifiedChat";
import { useState } from "react";

export default function UnifiedChatBox() {
  const { 
    messages, 
    send, 
    sendStream,
    loading, 
    provider, 
    setProvider, 
    model, 
    setModel, 
    newConversation,
    error,
    clearError
  } = useUnifiedChat("grok", "grok-4-fast-reasoning");
  
  const [input, setInput] = useState("");
  const [useStreaming, setUseStreaming] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState("");

  // Função para definir modelo padrão baseado no provedor
  const getDefaultModel = (provider: string) => {
    switch (provider) {
      case "grok": return "grok-4-fast-reasoning";
      case "openai": return "gpt-4o-mini";
      case "gpt5": return "gpt-5-chat-latest";
      case "gemini": return "gemini-2.5-flash";
      case "perplexity": return "sonar";
      default: return "grok-4-fast-reasoning";
    }
  };

  // Atualizar modelo quando provedor muda
  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider as any);
    setModel(getDefaultModel(newProvider));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    const trimmedInput = input.trim();
    setInput("");
    
    if (useStreaming) {
      await sendStream(trimmedInput, systemPrompt || undefined);
    } else {
      await send(trimmedInput, systemPrompt || undefined);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Header com controles */}
      <div className="flex flex-wrap gap-2 items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex gap-2 items-center">
          <select 
            value={provider} 
            onChange={e => handleProviderChange(e.target.value)} 
            className="border rounded px-3 py-2 text-sm"
            disabled={loading}
          >
            <option value="grok">Grok (4 Fast Reasoning)</option>
            <option value="openai">OpenAI (GPT-4o Mini)</option>
            <option value="gpt5">OpenAI (GPT-5)</option>
            <option value="gemini">Gemini (2.5 Flash)</option>
            <option value="perplexity">Perplexity (Sonar)</option>
          </select>
          
          <input 
            value={model} 
            onChange={e => setModel(e.target.value)} 
            className="border rounded px-3 py-2 text-sm flex-1 min-w-[200px]"
            placeholder="Modelo (ex: grok-4-fast-reasoning, gpt-4o-mini, gpt-5-chat-latest, gemini-2.5-flash, sonar)"
            disabled={loading}
          />
        </div>
        
        <div className="flex gap-2 items-center">
          <label className="flex items-center gap-2 text-sm">
            <input 
              type="checkbox" 
              checked={useStreaming}
              onChange={e => setUseStreaming(e.target.checked)}
              disabled={loading}
            />
            Streaming
          </label>
          
          <button 
            className="border rounded px-3 py-2 text-sm bg-white hover:bg-gray-50"
            onClick={() => newConversation()}
            disabled={loading}
          >
            Nova conversa
          </button>
        </div>
      </div>

      {/* System prompt */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">System Prompt (opcional)</label>
        <textarea
          value={systemPrompt}
          onChange={e => setSystemPrompt(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Instruções do sistema para a IA..."
          rows={2}
          disabled={loading}
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 flex justify-between items-center">
          <span className="text-red-700 text-sm">{error}</span>
          <button 
            onClick={clearError}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="border rounded-lg p-4 h-[60vh] overflow-auto space-y-3 bg-white">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Inicie uma conversa enviando uma mensagem abaixo</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user" 
                    ? "bg-blue-500 text-white" 
                    : message.content.startsWith("⚠️")
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {useStreaming ? "Gerando resposta..." : "Processando..."}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="border rounded px-4 py-2 flex-1"
          placeholder="Escreva sua mensagem..."
          disabled={loading}
        />
        <button 
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={loading || !input.trim()}
        >
          {loading ? "..." : "Enviar"}
        </button>
      </form>

      {/* Debug info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>Provider: {provider} | Model: {model}</p>
        <p>Mensagens: {messages.length} | Streaming: {useStreaming ? "Sim" : "Não"}</p>
      </div>
    </div>
  );
}
