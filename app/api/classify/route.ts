import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { MODULE_CLASSIFICATION_PROMPT } from '@/lib/system-prompts/classification';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiting simples
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minuto
    return true;
  }
  
  if (userLimit.count >= 10) { // 10 requests por minuto
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { userMessage } = await request.json();

    if (!userMessage) {
      return NextResponse.json(
        { error: 'userMessage is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 [CLASSIFY] "${userMessage.substring(0, 30)}${userMessage.length > 30 ? '...' : ''}"`);

    // Chamar OpenAI para classificação
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      max_tokens: 100,
      messages: [
        {
          role: "system",
          content: MODULE_CLASSIFICATION_PROMPT
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      response_format: { type: "json_object" }
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);

    // Sanitização e validação
    const MODULE_LIST = [
      "PROFESSOR", "TI", "SECRETARIA", "FINANCEIRO", "RH", "ATENDIMENTO", 
      "COORDENACAO", "BEM_ESTAR", "SOCIAL_MEDIA"
    ];

    if (!MODULE_LIST.includes(parsed.module)) {
      parsed.module = "ATENDIMENTO";
    }
    parsed.confidence = Math.max(0, Math.min(1, Number(parsed.confidence || 0)));
    
    // Chat geral não deve ter imagens
    if (parsed.module === "ATENDIMENTO") {
      parsed.needsImages = false;
    }

    console.log(`✅ [CLASSIFY] ${parsed.module} (${Math.round(parsed.confidence * 100)}%) - ${parsed.rationale}`);

    return NextResponse.json({
      success: true,
      classification: parsed,
      model: "gpt-4o-mini",
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [CLASSIFY] Erro na classificação:', error);
    
    return NextResponse.json({
      success: false,
      classification: {
        module: "ATENDIMENTO",
        confidence: 0.0,
        rationale: "fallback",
        needsImages: false
      },
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
