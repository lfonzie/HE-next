import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  ensureConversation, 
  getHistory, 
  appendMessage, 
  updateConversation 
} from "@/lib/chat-repository";
import { streamOpenAI } from "@/lib/providers/openai";
import { streamGPT5 } from "@/lib/providers/gpt5";
import { streamGemini } from "@/lib/providers/gemini";
import { streamPerplexity } from "@/lib/providers/perplexity";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

type Body = {
  provider: "openai" | "gpt5" | "gemini" | "perplexity";
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
    const conv = await ensureConversation(conversationId, userId, provider, module);
    const finalConversationId = conv.id;

    // 2) Recuperar histórico
    const history = await getHistory(finalConversationId);
    console.log(`📚 [CHAT-STREAM] History loaded: ${history.length} messages`);

    // 3) Adicionar mensagem do usuário
    await appendMessage(finalConversationId, "user", input, provider, model);

    // 4) Criar stream baseado no provedor
    let stream: any;
    
    console.log(`🔧 [CHAT-STREAM] Creating stream for provider: ${provider}, model: ${model}`);
    
    switch (provider) {
      case "openai":
        stream = await streamOpenAI(model, history, input, system);
        console.log(`✅ [CHAT-STREAM] OpenAI stream created successfully`);
        break;
      case "gpt5":
        stream = await streamGPT5(model, history, input, system);
        console.log(`✅ [CHAT-STREAM] GPT5 stream created successfully`);
        break;
      case "gemini":
        stream = await streamGemini(model, history, input, system);
        console.log(`✅ [CHAT-STREAM] Gemini stream created successfully`);
        break;
      case "perplexity":
        stream = await streamPerplexity(model, history, input, system);
        console.log(`✅ [CHAT-STREAM] Perplexity stream created successfully`);
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
            provider,
            model
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`));
          console.log(`📤 [CHAT-STREAM] Metadata sent:`, metadata);

          // Processar stream baseado no provedor
          if (provider === "openai" || provider === "gpt5" || provider === "groq") {
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
          } else if (provider === "gemini") {
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
          } else if (provider === "perplexity") {
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
              provider, 
              model
            );
            
            await updateConversation(finalConversationId, {
              updated_at: new Date(),
              model: model
            });
            
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
