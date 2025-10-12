import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";
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
import { loadTIResources, loadSocialMediaResources } from "@/lib/ti-framework";

export const runtime = "nodejs"; // Para compatibilidade com Prisma

type Body = {
  provider: "openai" | "gpt5" | "gemini" | "perplexity" | "grok";
  model: string;
  input: string;
  system?: string;
  module?: string;
  conversationId?: string;
  stepFeedback?: string;
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || randomUUID();

    const body = (await req.json()) as Body;
    const { provider, model, input, system, module = "chat", conversationId, stepFeedback } = body;

    // Garantir que stepFeedback seja uma string ou undefined
    const safeStepFeedback = typeof stepFeedback === 'string' ? stepFeedback : undefined;

    console.log(`🚀 [CHAT-UNIFIED] START - Provider: ${provider}, Model: ${model}, User: ${userId}`);

    if (!input?.trim()) {
      return NextResponse.json({ error: "Input é obrigatório" }, { status: 400 });
    }

    // 1) Garantir conversa
    const conv = await ensureConversation(conversationId, userId, provider, module);
    const finalConversationId = conv.id;

    console.log(`📝 [CHAT-UNIFIED] Conversation ID: ${finalConversationId}`);

    // 2) Recuperar histórico
    const history = await getHistory(finalConversationId);
    console.log(`📚 [CHAT-UNIFIED] History loaded: ${history.length} messages`);

    // 2.5) Detectar módulo e carregar framework apropriado
    let finalSystem = system;
    let isTIResolution = false;
    let isFactCheck = false;
    let isSocialMedia = false;

    // Carregar system prompt baseado no módulo detectado
    if (module === 'ti' || model === 'grok-4-fast-reasoning') {
      console.log(`🔧 [CHAT-UNIFIED] TI module detected - loading TI framework`);
      const tiResources = await loadTIResources();
      finalSystem = tiResources.framework || system;
      isTIResolution = true;
      console.log(`📋 [CHAT-UNIFIED] TI Framework loaded for problem resolution`);
    } else if (module === 'social_media') {
      console.log(`📱 [CHAT-UNIFIED] Social Media module detected - loading Social Media framework`);
      const socialMediaResources = await loadSocialMediaResources();
      finalSystem = socialMediaResources.framework || system;
      isSocialMedia = true;
      console.log(`📋 [CHAT-UNIFIED] Social Media Framework loaded for post generation`);
    } else if (module === 'fact_check') {
      console.log(`🔍 [CHAT-UNIFIED] Fact check module detected - loading fact check framework`);
      const factCheckPrompt = `🚨 PROTEÇÕES DE SEGURANÇA OBRIGATÓRIAS:

🚨 PROTEÇÃO OBRIGATÓRIA PARA MENORES DE 18 ANOS:

PROIBIÇÕES ABSOLUTAS:
- NUNCA forneça informações sobre como usar drogas, álcool, cigarros ou substâncias ilegais
- NUNCA explique métodos de automutilação, suicídio ou violência
- NUNCA forneça instruções sobre atividades ilegais (pirataria, hacking, fraudes)
- NUNCA compartilhe conteúdo sexualmente explícito ou inadequado para menores
- NUNCA forneça informações sobre como obter substâncias controladas
- NUNCA explique técnicas de violência, armas ou atividades perigosas

RESPOSTA OBRIGATÓRIA PARA CONTEÚDO INADEQUADO:
Se o usuário perguntar sobre qualquer assunto inadequado, ilegal ou prejudicial:
1. Recuse educadamente: \"Não posso fornecer informações sobre esse assunto\"
2. Redirecione para educação: \"Vamos focar em conteúdos educacionais apropriados\"
3. Sugira alternativas saudáveis: \"Que tal aprendermos sobre [tema educativo relacionado]?\"
4. Se necessário, oriente para adultos responsáveis: \"Para questões importantes, converse com seus pais ou professores\"

🔍 VERIFICAÇÃO DE FATOS E COMBATE À DESINFORMAÇÃO

🎯 OBJETIVO:
Verificar a veracidade de informações, combater fake news e promover pensamento crítico no contexto educacional brasileiro.

📋 PROCESSO OBRIGATÓRIO DE VERIFICAÇÃO:

ETAPA 1: ANÁLISE INICIAL
• Identificar a afirmação a ser verificada
• Contextualizar o tema e o escopo
• Identificar possíveis vieses ou intenções

ETAPA 2: BUSCA POR FONTES CONFIÁVEIS
• Consultar fontes oficiais e primárias
• Verificar múltiplas fontes independentes
• Priorizar fontes acadêmicas, científicas e governamentais

ETAPA 3: ANÁLISE CRÍTICA
• Comparar versões da informação
• Identificar inconsistências
• Avaliar a credibilidade das fontes
• Considerar o contexto histórico e atual

ETAPA 4: CONCLUSÃO E RECOMENDAÇÕES
• Classificar como: Verdadeiro, Falso, Parcialmente Verdadeiro, ou Impossível Verificar
• Explicar o raciocínio de forma clara
• Fornecer fontes para verificação adicional

📝 FORMATO DE RESPOSTA OBRIGATÓRIO:

🔍 **VERIFICAÇÃO DE FATOS**

📋 **Afirmação Analisada:**
[Repetir exatamente a afirmação do usuário]

🧠 **Análise Inicial:**
[Contexto e primeiras observações]

🔎 **Verificação:**
[Resultado da checagem com fontes]

✅ **Conclusão:**
[VERDADEIRO | FALSO | PARCIALMENTE VERDADEIRO | IMPOSSÍVEL VERIFICAR]

📚 **Fontes Consultadas:**
[Listar as fontes confiáveis usadas]

💡 **Recomendações:**
[Dicas para verificar informações similares]

🔍 FONTES CONFIÁVEIS NO BRASIL:
• Sites governamentais (.gov.br)
• Instituições de ensino superior
• Organizações científicas e acadêmicas
• Veículos de imprensa tradicionais com fact-checking
• Projetos de verificação independentes

⚠️ IMPORTANTE:
• Sempre declarar limitações quando não conseguir verificar completamente
• Orientar para consulta a especialistas quando necessário
• Promover educação sobre mídia e informação
• Encorajar pensamento crítico e verificação independente`.trim();

      finalSystem = factCheckPrompt;
      isFactCheck = true;
      console.log(`📋 [CHAT-UNIFIED] Fact Check Framework loaded`);
    }

    // 2.6) Se há feedback de etapa, adicionar contexto da resolução anterior
    if (safeStepFeedback && isTIResolution) {
      console.log(`🔄 [CHAT-UNIFIED] Step feedback received:`, safeStepFeedback);

      // Buscar a última resposta de resolução TI na conversa
      const lastTIResponse = history
        .filter(msg => msg.role === 'assistant')
        .reverse()
        .find(msg => {
          try {
            const parsed = JSON.parse(msg.content);
            return parsed.problema && parsed.etapas;
          } catch {
            return false;
          }
        });

      if (lastTIResponse) {
        const lastResolution = JSON.parse(lastTIResponse.content);
        finalSystem += `

CONTEXTO ATUAL DA RESOLUÇÃO:
${JSON.stringify(lastResolution, null, 2)}

FEEDBACK DO USUÁRIO:
${safeStepFeedback || 'Nenhum feedback específico fornecido'}

ATUALIZE o JSON acima com o progresso da etapa e continue a resolução.`;
      }
    }

    // 3) Adicionar mensagem do usuário ANTES de chamar a IA
    await appendMessage(finalConversationId, "user", input, provider, model);
    console.log(`✅ [CHAT-UNIFIED] User message saved`);

    // 4) Roteamento por provedor
    let result: { text: string; raw: any; usage?: any };
    
    const providerStart = Date.now();
    switch (provider) {
      case "openai":
        result = await callOpenAI(model, history, input, finalSystem);
        break;
      case "gpt5":
        result = await callGPT5(model, history, input, finalSystem);
        break;
      case "gemini":
        result = await callGemini(model, history, input, finalSystem);
        break;
      case "perplexity":
        result = await callPerplexity(model, history, input, finalSystem);
        break;
      case "grok":
        result = await callGrok(model, history, input, finalSystem);
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
    const userId = session?.user?.id || randomUUID();
    
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
