// app/api/classify/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import OpenAI from 'openai';


import { PromptRequest } from '@/lib/system-prompts';



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple rate limiting cache
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // max 10 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitCache.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitCache.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
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

    // Construir requisição do prompt
    const promptRequest: PromptRequest = {
      key: 'router.intent.system',
      userMessage,
      context: {
        timestamp: new Date().toISOString(),
        source: 'api_classify'
      }
    };

    // Construir mensagens para OpenAI
    const messages = promptManager.buildMessages(promptRequest);
    const modelConfig = promptManager.getModelConfig(promptRequest.key);

    // Chamar OpenAI
    const completion = await openai.chat.completions.create({
      model: modelConfig.model,
      temperature: 0.1,
      max_tokens: 80,
      messages: messages as any,
      response_format: { type: "json_object" }
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);

    // Sanitização mínima
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

    console.log(`✅ [CLASSIFY] ${parsed.module} (${(parsed.confidence * 100).toFixed(0)}%) - "${parsed.rationale}"`);

    return NextResponse.json({
      success: true,
      classification: parsed,
      model: modelConfig.model,
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
