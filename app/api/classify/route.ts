import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { MODULE_CLASSIFICATION_PROMPT } from '@/lib/system-prompts/classification';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiting simples
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Cache de classificação para melhorar performance
const classificationCache = new Map<string, { 
  result: any; 
  timestamp: number; 
  ttl: number 
}>();

function checkRateLimit(ip: string): boolean {
  // Bypass rate limiting em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minuto
    return true;
  }
  
  if (userLimit.count >= 20) { // 20 requests por minuto (aumentado para testes)
    return false;
  }
  
  userLimit.count++;
  return true;
}

function getCachedClassification(message: string, historyLength: number): any | null {
  // Usar histórico como parte da chave para melhor precisão
  const cacheKey = `${message.toLowerCase().trim()}_${historyLength}`;
  const cached = classificationCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    console.log(`🚀 [CACHE HIT] Classificação encontrada no cache para: "${message.substring(0, 30)}..." (histórico: ${historyLength})`);
    return cached.result;
  }
  
  // Remove entrada expirada
  if (cached) {
    classificationCache.delete(cacheKey);
  }
  
  return null;
}

function setCachedClassification(message: string, historyLength: number, result: any): void {
  // Usar histórico como parte da chave para melhor precisão
  const cacheKey = `${message.toLowerCase().trim()}_${historyLength}`;
  const ttl = 5 * 60 * 1000; // 5 minutos
  
  classificationCache.set(cacheKey, {
    result,
    timestamp: Date.now(),
    ttl
  });
  
  // Limitar tamanho do cache (máximo 100 entradas)
  if (classificationCache.size > 100) {
    const firstKey = classificationCache.keys().next().value;
    if (firstKey) {
      classificationCache.delete(firstKey);
    }
  }
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

    const { userMessage, history = [], currentModule = 'atendimento' } = await request.json();

    if (!userMessage) {
      return NextResponse.json(
        { error: 'userMessage is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 [CLASSIFY] "${userMessage.substring(0, 30)}${userMessage.length > 30 ? '...' : ''}" (Histórico: ${history.length} msgs)`);

    // Verificar cache primeiro (usando histórico como parte da chave)
    const cachedResult = getCachedClassification(userMessage, history.length);
    if (cachedResult) {
      return NextResponse.json({
        success: true,
        classification: cachedResult,
        model: "gpt-4o-mini",
        timestamp: new Date().toISOString(),
        cached: true
      });
    }

    // Preparar contexto com histórico para classificação
    let contextWithHistory = userMessage;
    
    if (history.length > 0) {
      // Incluir mais contexto das últimas mensagens para melhor classificação
      const historyContext = history.slice(-3).map((msg: any) => {
        const content = msg.content || '';
        const truncated = content.length > 100 ? content.substring(0, 100) + '...' : content;
        return `${msg.role}: ${truncated}`;
      }).join('\n');
      
      // Adicionar informações sobre módulos mencionados anteriormente
      const mentionedModules = history.slice(-3).map((msg: any) => msg.module).filter(Boolean);
      const moduleContext = mentionedModules.length > 0 ? 
        `\nMódulos mencionados anteriormente: ${mentionedModules.join(', ')}` : '';
      
      contextWithHistory = `Histórico da conversa (últimas mensagens):\n${historyContext}${moduleContext}\n\nMensagem atual: ${userMessage}`;
    }

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
          content: contextWithHistory
        }
      ],
      response_format: { type: "json_object" }
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);

    // Sanitização e validação
    const MODULE_LIST = [
      "PROFESSOR", "AULA_EXPANDIDA", "ENEM_INTERATIVO", "TI", "SECRETARIA", 
      "FINANCEIRO", "RH", "ATENDIMENTO", "COORDENACAO", "BEM_ESTAR", "SOCIAL_MEDIA"
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

    // Salvar no cache
    setCachedClassification(userMessage, history.length, parsed);

    return NextResponse.json({
      success: true,
      classification: parsed,
      model: "gpt-4o-mini",
      timestamp: new Date().toISOString(),
      cached: false
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
