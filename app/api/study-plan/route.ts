import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { callGrok } from "@/lib/providers/grok";

export const runtime = "nodejs";

interface StudyPlanRequest {
  model: string;
  response_format: {
    type: 'json_schema';
    json_schema: {
      name: string;
      schema: any;
    };
  };
  messages: Array<{
    role: 'system' | 'user';
    content: string;
  }>;
  input_placeholders: {
    profile: string;
    duration: string;
    focus_area: string;
    hours_per_week: string;
    exam_date: string;
    current_level: string;
    target_score: string;
    learning_style: string;
  };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || "anonymous";

    const body: StudyPlanRequest = await req.json();
    const { model, response_format, messages, input_placeholders } = body;

    console.log(`📚 [STUDY-PLAN] START - User: ${userId}, Model: ${model}`);

    if (!messages?.length) {
      return NextResponse.json({ error: "Messages são obrigatórias" }, { status: 400 });
    }

    // Usar apenas o Grok 4 Fast para geração de trilhas de estudo
    if (model !== 'grok-4-fast') {
      console.log(`🔄 [STUDY-PLAN] Forcing Grok 4 Fast for study plan generation`);
    }

    // Preparar as mensagens para o Grok
    const systemMessage = messages.find(msg => msg.role === 'system')?.content || '';
    const userMessage = messages.find(msg => msg.role === 'user')?.content || '';

    console.log(`📝 [STUDY-PLAN] System message length: ${systemMessage.length}`);
    console.log(`📝 [STUDY-PLAN] User message length: ${userMessage.length}`);

    // Chamar o Grok com o formato estruturado
    const result = await callGrok('grok-4-fast', [], userMessage, systemMessage);

    console.log(`⚡ [STUDY-PLAN] Grok response received, length: ${result.text.length}`);

    // Tentar fazer parse do JSON retornado
    let studyPlanData;
    try {
      // Limpar a resposta para extrair apenas o JSON
      let jsonText = result.text.trim();

      // Se a resposta começar com ```json, remover
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      studyPlanData = JSON.parse(jsonText);
      console.log(`✅ [STUDY-PLAN] JSON parsed successfully`);

      // Validar estrutura básica
      if (!studyPlanData.metadata || !studyPlanData.phases || !studyPlanData.weekly_schedule) {
        throw new Error('Estrutura JSON inválida');
      }

    } catch (parseError) {
      console.error(`❌ [STUDY-PLAN] JSON parse error:`, parseError);
      console.error(`❌ [STUDY-PLAN] Raw response:`, result.text);

      return NextResponse.json({
        error: "Erro ao processar resposta da IA. Tente novamente.",
        details: parseError instanceof Error ? parseError.message : "Erro desconhecido"
      }, { status: 500 });
    }

    const totalTime = Date.now() - startTime;
    console.log(`🎉 [STUDY-PLAN] SUCCESS - Total time: ${totalTime}ms`);

    return NextResponse.json(studyPlanData);

  } catch (err: any) {
    console.error("❌ [STUDY-PLAN] ERROR:", err);
    return NextResponse.json({
      error: err?.message ?? "Erro interno do servidor"
    }, { status: 500 });
  }
}
