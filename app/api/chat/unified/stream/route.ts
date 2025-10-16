import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  ensureConversation, 
  getHistory, 
  appendMessage, 
  conversationManager 
} from "@/lib/conversation-manager";
import { updateConversation } from "@/lib/chat-repository";
import { streamOpenAI } from "@/lib/providers/openai";
import { streamGPT5 } from "@/lib/providers/gpt5";
import { streamGemini } from "@/lib/providers/gemini";
import { streamPerplexity } from "@/lib/providers/perplexity";
import { streamGrok } from "@/lib/providers/grok";
import { randomUUID } from "crypto";
import { getSystemPrompt as loadSystemPrompt } from "@/lib/system-message-loader";
import { loadTIResources } from "@/lib/ti-framework";
import { cleanPerplexityResponse, isPerplexityResponse } from "@/lib/utils/perplexity-cleaner";

// Função para extrair sugestões de follow-up da resposta da IA
function extractFollowUpSuggestions(aiResponse: string): string[] {
  const suggestions: string[] = [];

  // Procurar pela seção de sugestões na resposta - mais flexível para diferentes formatos
  const suggestionSectionRegex = /💡 Sugestões para continuar a conversa:\s*(.+)$/i;
  const match = aiResponse.match(suggestionSectionRegex);

  console.log('🔍 [SUGGESTIONS] Regex match:', match);

  if (match) {
    // Extrair cada sugestão numerada
    const suggestionRegex = /\d+\.\s*([^0-9]+)/g;
    let suggestionMatch;

    while ((suggestionMatch = suggestionRegex.exec(match[1])) !== null) {
      const suggestion = suggestionMatch[1].trim();
      console.log('💡 [SUGGESTIONS] Found suggestion:', suggestion);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }
  }

  return suggestions;
}

// Função para remover as sugestões da resposta principal da IA
function cleanAIResponse(aiResponse: string): string {
  // Remover a seção de sugestões da resposta principal - considerando quebras de linha
  const cleanedResponse = aiResponse.replace(/💡 Sugestões para continuar a conversa:[\s\S]*$/i, '').trim();

  return cleanedResponse;
}

export const runtime = "nodejs";

type Body = {
  provider: "openai" | "gpt5" | "gemini" | "perplexity" | "grok";
  model: string;
  input: string;
  system?: string;
  module?: string;
  conversationId?: string;
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || randomUUID();
    
    const body = (await req.json()) as Body;
    const { provider, model, input, system, module = "chat", conversationId } = body;

    console.log(`🚀 [CHAT-STREAM] START - Provider: ${provider}, Model: ${model}, User: ${userId}`);

    if (!input?.trim()) {
      return NextResponse.json({ error: "Input é obrigatório" }, { status: 400 });
    }

    // 1) Garantir conversa
    const conv = await ensureConversation(conversationId, userId, module);
    const finalConversationId = conv.id;

    // 2) Recuperar histórico com contexto inteligente
    const history = await conversationManager.getConversationHistory(finalConversationId, userId);
    const intelligentContext = conversationManager.generateIntelligentContext(history, input);
    console.log(`📚 [CHAT-STREAM] History loaded: ${history.length} messages, intelligent context: ${intelligentContext.length} messages`);

    // 3) Adicionar mensagem do usuário
    await appendMessage(finalConversationId, "user", input, provider, model);

    // 4) Criar system prompt contextual baseado no histórico
    const contextualSystemPrompt = await createContextualSystemPrompt(intelligentContext, system, module);
    
    // 5) Criar stream baseado no provedor
    let stream: any;
    let finalProvider = provider;
    let finalModel = model;
    
    console.log(`🔧 [CHAT-STREAM] Creating stream for provider: ${provider}, model: ${model}`);
    
    switch (provider) {
      case "openai":
        stream = await streamOpenAI(model, intelligentContext, input, contextualSystemPrompt);
        console.log(`✅ [CHAT-STREAM] OpenAI stream created successfully`);
        break;
      case "gpt5":
        stream = await streamGPT5(model, intelligentContext, input, contextualSystemPrompt);
        console.log(`✅ [CHAT-STREAM] GPT5 stream created successfully`);
        break;
      case "gemini":
        stream = await streamGemini(model, intelligentContext, input, contextualSystemPrompt);
        console.log(`✅ [CHAT-STREAM] Gemini stream created successfully`);
        break;
      case "perplexity":
        stream = await streamPerplexity(model, intelligentContext, input, contextualSystemPrompt);
        console.log(`✅ [CHAT-STREAM] Perplexity stream created successfully`);
        break;
      case "grok":
        try {
          stream = await streamGrok(model, intelligentContext, input, contextualSystemPrompt, module);
          console.log(`✅ [CHAT-STREAM] Grok stream created successfully`);
        } catch (grokError) {
          console.error(`❌ [CHAT-STREAM] Grok failed, falling back to Gemini:`, grokError);
          // Fallback to Gemini if Grok fails
          stream = await streamGemini("gemini-2.5-flash", intelligentContext, input, contextualSystemPrompt);
          console.log(`✅ [CHAT-STREAM] Gemini fallback stream created successfully`);
          // Update provider for metadata
          finalProvider = "gemini";
          finalModel = "gemini-2.5-flash";
        }
        break;
      default:
        return NextResponse.json({ error: "Provider inválido" }, { status: 400 });
    }

    // 5) Criar ReadableStream para resposta
    const encoder = new TextEncoder();
    let fullResponse = "";
    let streamCompleted = false;

    console.log(`🔧 [CHAT-STREAM] Creating ReadableStream for response...`);

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          console.log(`🚀 [CHAT-STREAM] ReadableStream started`);
          
          // Enviar metadados iniciais
          const metadata = {
            type: "metadata",
            conversationId: finalConversationId,
            provider: finalProvider,
            model: finalModel
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`));
          console.log(`📤 [CHAT-STREAM] Metadata sent:`, metadata);

          // Processar stream baseado no provedor
          if (finalProvider === "openai" || finalProvider === "gpt5") {
            console.log(`📡 [CHAT-STREAM] Processing OpenAI/GPT5 stream...`);
            let chunkCount = 0;
            for await (const chunk of stream) {
              chunkCount++;
              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                const data = {
                  type: "content",
                  content
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                // Log removido para reduzir ruído no terminal
              }
            }
            console.log(`✅ [CHAT-STREAM] OpenAI/GPT5 stream completed. Total chunks: ${chunkCount}`);
          } else if (finalProvider === "gemini") {
            for await (const chunk of stream.stream) {
              const text = chunk.text();
              if (text) {
                fullResponse += text;
                const data = {
                  type: "content",
                  content: text
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
              }
            }
          } else if (finalProvider === "perplexity") {
            // Para Perplexity, stream normalmente sem limpeza em tempo real
            // A limpeza será aplicada apenas no final para salvar no banco
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                const data = {
                  type: "content",
                  content
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
              }
            }
          } else if (finalProvider === "grok") {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                const data = {
                  type: "content",
                  content
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
              }
            }
          }

          // Extrair sugestões de follow-up se aplicável (exceto para Perplexity)
          let followUpSuggestions: string[] = [];
          let finalCleanedResponse = fullResponse;

          // Só extrair sugestões para módulos conversacionais não-técnicos E não para Perplexity
          if ((module === 'chat' || module === 'professor') && finalProvider !== 'perplexity') {
            console.log(`🎯 [FOLLOW-UP] Checking for suggestions in AI response`);
            followUpSuggestions = extractFollowUpSuggestions(fullResponse);
            console.log(`💡 [FOLLOW-UP] Extracted suggestions:`, followUpSuggestions.length, 'suggestions');

            if (followUpSuggestions.length > 0) {
              // Limpar a resposta removendo a seção de sugestões
              finalCleanedResponse = cleanAIResponse(fullResponse);
              console.log(`🧹 [FOLLOW-UP] Cleaned response length:`, finalCleanedResponse.length, 'characters');

              // Enviar chunk especial com sugestões
              const suggestionsChunk = {
                type: "suggestions",
                suggestions: followUpSuggestions
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(suggestionsChunk)}\n\n`));
              console.log(`💡 [CHAT-STREAM] Suggestions sent:`, followUpSuggestions);
            }
          } else if (finalProvider === 'perplexity') {
            // Para Perplexity, sempre limpar sugestões (mesmo que não sejam extraídas para botões)
            finalCleanedResponse = cleanAIResponse(fullResponse);
            console.log(`🧹 [PERPLEXITY] Cleaned suggestions from response:`, finalCleanedResponse.length, 'characters');
          }

          // Para Perplexity, aplicar limpeza final e enviar para o frontend
          if (finalProvider === 'perplexity' && isPerplexityResponse(finalCleanedResponse)) {
            try {
              const fullyCleanedResponse = await cleanPerplexityResponse(finalCleanedResponse);
              // Update final response for both frontend and database
              finalCleanedResponse = fullyCleanedResponse;
              console.log(`🧹 [PERPLEXITY] Final cleaning applied and sent to frontend`);
            } catch (error) {
              console.error('❌ [CHAT-STREAM] Error cleaning with AI:', error);
              // Fallback to regex cleaning
              const fallbackCleaned = await cleanPerplexityResponse(finalCleanedResponse);
              finalCleanedResponse = fallbackCleaned;
            }
          }

          // Enviar metadados finais
          const finalMetadata = {
            metadata: {
              model: finalModel,
              provider: finalProvider,
              tier: finalProvider === 'gemini' ? 'IA_ECO' : 'IA',
              complexity: 'simple',
              module: module,
              tokens: 0
            },
            meta: {
              provider: finalProvider,
              model: finalModel,
              timestamp: Date.now()
            }
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalMetadata)}\n\n`));
          console.log(`📊 [CHAT-STREAM] Final metadata sent:`, finalMetadata);

          // Enviar sinal de fim
          console.log(`🏁 [CHAT-STREAM] Sending done signal...`);
          controller.enqueue(encoder.encode(`data: {"type": "done"}\n\n`));
          controller.close();
          console.log(`✅ [CHAT-STREAM] Stream closed successfully`);
          
          // Marcar stream como completo e salvar resposta
          streamCompleted = true;
          try {
            await appendMessage(
              finalConversationId,
              "assistant",
              finalCleanedResponse, // Use the fully cleaned response (suggestions + sources removed)
              finalProvider,
              finalModel
            );

            // Atualizar a conversa com o modelo correto usado
            await updateConversation(finalConversationId, {
              model: finalModel,
              updated_at: new Date()
            });

            console.log(`✅ [CHAT-STREAM] Response saved: ${finalCleanedResponse.length} chars`);
            console.log(`✅ [CHAT-STREAM] Conversation updated with model: ${finalModel}`);
          } catch (error) {
            console.error("❌ [CHAT-STREAM] Error saving response:", error);
          }

        } catch (error) {
          console.error("❌ [CHAT-STREAM] Stream error:", error);
          controller.error(error);
        }
      }
    });

    console.log(`📤 [CHAT-STREAM] Returning stream response with headers...`);
    
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (err: any) {
    console.error("❌ [CHAT-STREAM] ERROR:", err);
    return NextResponse.json({ 
      error: err?.message ?? "Erro interno do servidor" 
    }, { status: 500 });
  }
}

/**
 * Cria um system prompt contextual baseado no histórico da conversa
 * para evitar introduções desnecessárias e manter continuidade
 */
async function createContextualSystemPrompt(
  history: any[],
  customSystem?: string,
  module: string = "chat"
): Promise<string> {
  try {
    let basePrompt: string;

    // Para problemas técnicos (TI), usar framework estruturado SEM MODIFICAÇÕES
    if (module === 'ti') {
      console.log(`🔧 [SYSTEM-PROMPT] Loading TI framework for structured responses`);
      const tiResources = await loadTIResources();
      basePrompt = tiResources.framework;
      console.log(`📋 [SYSTEM-PROMPT] TI Framework loaded for streaming`);

      // 🔥 IMPORTANTE: Para TI, NÃO adicionar instruções de continuidade
      // pois elas quebram o formato JSON obrigatório
      return basePrompt;
    } else {
      // Para outros módulos, usar prompt normal
      basePrompt = loadSystemPrompt(module);
      console.log(`✅ [SYSTEM-PROMPT] Loaded from system-message.json for module: ${module}`);
    }

    // Se há histórico, adicionar instrução de continuidade (APENAS para módulos não-TI)
    if (history && history.length > 1) {
      const lastUserMessage = history.filter(m => m.role === 'user').pop();
      const lastAssistantMessage = history.filter(m => m.role === 'assistant').pop();

      const isContinuation = (lastUserMessage?.content || lastAssistantMessage?.content);

      if (isContinuation) {
        // Adicionar instruções de continuidade AO PROMPT DO MÓDULO
        basePrompt += `\n\n⚠️ CONTEXTO IMPORTANTE:
- Esta é uma CONTINUAÇÃO de uma conversa existente
- O usuário já está familiarizado com o tópico atual
- NÃO faça introduções longas ou repetitivas
- Seja DIRETO e FOQUE na resposta específica
- NÃO repita informações já dadas na conversa
- Responda APENAS o que foi perguntado`;
      }
    }

    const finalPrompt = customSystem || basePrompt;
    console.log(`📋 [SYSTEM-PROMPT] Final system prompt preview:`, finalPrompt.substring(0, 500) + '...');

    return finalPrompt;
    
  } catch (error) {
    console.error(`❌ [SYSTEM-PROMPT] Error loading for module ${module}:`, error);
    
    // Fallback simples apenas em caso de erro crítico
    return customSystem || `Você é um assistente educacional brasileiro. Responda SEMPRE em português brasileiro.`;
  }
}
