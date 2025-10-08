import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  ensureConversation, 
  getHistory, 
  appendMessage, 
  conversationManager 
} from "@/lib/conversation-manager";
import { streamOpenAI } from "@/lib/providers/openai";
import { streamGPT5 } from "@/lib/providers/gpt5";
import { streamGemini } from "@/lib/providers/gemini";
import { streamPerplexity } from "@/lib/providers/perplexity";
import { streamGrok } from "@/lib/providers/grok";
import { randomUUID } from "crypto";
import { getSystemPrompt as loadSystemPrompt } from "@/lib/system-message-loader";

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
    const contextualSystemPrompt = createContextualSystemPrompt(intelligentContext, system, module);
    
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
          stream = await streamGrok(model, intelligentContext, input, contextualSystemPrompt);
          console.log(`✅ [CHAT-STREAM] Grok stream created successfully`);
        } catch (grokError) {
          console.error(`❌ [CHAT-STREAM] Grok failed, falling back to Gemini:`, grokError);
          // Fallback to Gemini if Grok fails
          stream = await streamGemini("gemini-2.0-flash-exp", intelligentContext, input, contextualSystemPrompt);
          console.log(`✅ [CHAT-STREAM] Gemini fallback stream created successfully`);
          // Update provider for metadata
          finalProvider = "gemini";
          finalModel = "gemini-2.0-flash-exp";
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
              fullResponse, 
              finalProvider, 
              finalModel
            );
            
            console.log(`✅ [CHAT-STREAM] Response saved: ${fullResponse.length} chars`);
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
function createContextualSystemPrompt(
  history: any[], 
  customSystem?: string, 
  module: string = "chat"
): string {
  try {
    // Carregar prompt do sistema do arquivo system-message.json
    let basePrompt = loadSystemPrompt(module);
    
    console.log(`✅ [SYSTEM-PROMPT] Loaded from system-message.json for module: ${module}`);
    
    // Se há histórico, adicionar instrução de continuidade
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
    
    return customSystem || basePrompt;
    
  } catch (error) {
    console.error(`❌ [SYSTEM-PROMPT] Error loading for module ${module}:`, error);
    
    // Fallback simples apenas em caso de erro crítico
    return customSystem || `Você é um assistente educacional brasileiro. Responda SEMPRE em português brasileiro.`;
  }
}
