import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  ensureConversation, 
  getHistory, 
  appendMessage, 
  updateConversation 
} from "@/lib/chat-repository";
import { callOpenAI } from "@/lib/providers/openai";
import { callGPT5 } from "@/lib/providers/gpt5";
import { callGemini } from "@/lib/providers/gemini";
import { callPerplexity } from "@/lib/providers/perplexity";
import { callGrok } from "@/lib/providers/grok";
import { ChatMessage } from "@/lib/chat-history";

export const runtime = "nodejs"; // Para compatibilidade com Prisma

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
    const userId = session?.user?.id || "anonymous";
    
    const body = (await req.json()) as Body;
    const { provider, model, input, system, module = "chat", conversationId } = body;

    console.log(`🚀 [CHAT-UNIFIED] START - Provider: ${provider}, Model: ${model}, User: ${userId}`);

    if (!input?.trim()) {
      return NextResponse.json({ error: "Input é obrigatório" }, { status: 400 });
    }

    // 1) Garantir conversa
    const conv = await ensureConversation(conversationId, userId, provider, module);
    const finalConversationId = conv.id;

    console.log(`📝 [CHAT-UNIFIED] Conversation ID: ${finalConversationId}`);

    // 2) Recuperar histórico
    let history = await getHistory(finalConversationId);
    console.log(`📚 [CHAT-UNIFIED] History loaded: ${history.length} messages`);

    // 3) Adicionar mensagem do usuário ANTES de chamar a IA
    await appendMessage(finalConversationId, "user", input, provider, model);
    console.log(`✅ [CHAT-UNIFIED] User message saved`);

    // 4) Roteamento por provedor
    let result: { text: string; raw: any; usage?: any };
    
    const providerStart = Date.now();
    switch (provider) {
      case "openai":
        result = await callOpenAI(model, history, input, system);
        break;
      case "gpt5":
        result = await callGPT5(model, history, input, system);
        break;
      case "gemini":
        result = await callGemini(model, history, input, system);
        break;
      case "perplexity":
        result = await callPerplexity(model, history, input, system);
        break;
      case "grok":
        result = await callGrok(model, history, input, system);
        break;
      default:
        return NextResponse.json({ error: "Provider inválido" }, { status: 400 });
    }
    const providerTime = Date.now() - providerStart;
    
    console.log(`⚡ [CHAT-UNIFIED] Provider ${provider} completed in ${providerTime}ms`);

    // 5) Persistir resposta da IA
    await appendMessage(
      finalConversationId, 
      "assistant", 
      result.text, 
      provider, 
      model, 
      result.raw
    );
    console.log(`✅ [CHAT-UNIFIED] Assistant message saved`);

    // 6) Atualizar estatísticas da conversa
    const totalTime = Date.now() - startTime;
    await updateConversation(finalConversationId, {
      updated_at: new Date(),
      model: model
    });

    console.log(`🎉 [CHAT-UNIFIED] SUCCESS - Total time: ${totalTime}ms`);

    return NextResponse.json({
      conversationId: finalConversationId,
      reply: result.text,
      provider,
      model,
      usage: result.usage,
      timing: {
        total: totalTime,
        provider: providerTime
      }
    });

  } catch (err: any) {
    console.error("❌ [CHAT-UNIFIED] ERROR:", err);
    return NextResponse.json({ 
      error: err?.message ?? "Erro interno do servidor" 
    }, { status: 500 });
  }
}

// GET para recuperar histórico de uma conversa
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || "anonymous";
    
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId é obrigatório" }, { status: 400 });
    }

    const history = await getHistory(conversationId);
    
    return NextResponse.json({
      conversationId,
      messages: history
    });

  } catch (err: any) {
    console.error("❌ [CHAT-UNIFIED-GET] ERROR:", err);
    return NextResponse.json({ 
      error: err?.message ?? "Erro ao recuperar histórico" 
    }, { status: 500 });
  }
}
