// API endpoint para classificação de mensagens usando IA
import { NextRequest, NextResponse } from 'next/server';
import { loadSystemMessages } from '@/lib/system-message-loader';
import { fastClassify } from '@/lib/fast-classifier';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ClassificationRequest {
  message: string;
  historyLength?: number;
}

interface ClassificationResult {
  module: string;
  confidence: number;
  rationale: string;
}

// Cache de classificações (30 minutos)
const classificationCache = new Map<string, { result: ClassificationResult; timestamp: number }>();
const CACHE_TTL = 1800000; // 30 minutos

export async function POST(req: NextRequest) {
  try {
    const { message, historyLength = 0 }: ClassificationRequest = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 [CLASSIFY-API] Classifying: "${message.substring(0, 50)}..."`);

    // Verificar cache
    const cacheKey = `${message.toLowerCase().trim()}_${historyLength}`;
    const cached = classificationCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`✅ [CLASSIFY-API] Cache hit`);
      return NextResponse.json(cached.result);
    }

    // Obter módulos disponíveis
    const config = loadSystemMessages();
    const modules = Object.entries(config.chat_modules || {})
      .filter(([_, mod]: [string, any]) => mod.is_active)
      .map(([key, mod]: [string, any]) => ({
        key,
        name: mod.name,
        description: mod.description
      }));

    if (modules.length === 0) {
      console.warn('⚠️ [CLASSIFY-API] No active modules found, using fallback');
      const fallback = fastClassify(message, historyLength);
      return NextResponse.json(fallback);
    }

    // Criar prompt para classificação
    const classificationPrompt = `Você é um classificador de mensagens. Analise a mensagem do usuário e escolha o módulo mais apropriado.

MÓDULOS DISPONÍVEIS:
${modules.map(m => `- ${m.key}: ${m.name} - ${m.description}`).join('\n')}

MENSAGEM DO USUÁRIO:
"${message}"

INSTRUÇÕES:
1. Analise o TEMA e INTENÇÃO da mensagem
2. Escolha o módulo mais apropriado baseado nas palavras-chave específicas
3. Retorne APENAS o código do módulo (ex: "ti", "social_media", "professor", "fact_check")
4. Use "chat" APENAS para saudações simples, conversas gerais ou quando não houver correspondência clara com nenhum módulo específico

IMPORTANTE - PALAVRAS-CHAVE POR MÓDULO:
TI (Suporte Técnico):
- "internet lenta", "sem internet", "wifi não funciona", "rede não conecta"
- "computador travando", "pc lento", "notebook lento", "computador não liga"
- "impressora não funciona", "impressora travada", "não imprime"
- "programa não abre", "app não funciona", "software erro"
- "vírus", "antivírus", "malware", "hackeado"
- "email não funciona", "não consigo enviar email"
- "tela azul", "erro", "crash", "travando"
- "não conecta", "sem conexão", "falha de rede"

SOCIAL_MEDIA:
- "crie um post", "faça um post", "gere um post"
- "instagram", "facebook", "twitter", "tiktok"
- "publicação", "story", "reel", "conteúdo"
- "marketing", "engajamento", "redes sociais"

FACT_CHECK (Verificação de Fatos):
- "é verdade", "é mentira", "informação errada"
- "verifique se", "confirme se", "é real"
- "fake news", "desinformação", "checagem"
- "verdadeiro", "falso", "correto", "incorreto"
- "dúvida sobre", "questiono se", "não acredito"

FINANCEIRO:
- "pagamento", "boleto", "mensalidade", "cobrança"
- "valor", "preço", "custo", "despesa"

PROFESSOR:
- "dúvida", "explicação", "matéria", "aula"
- "não entendi", "como fazer", "exercício"
- "matemática", "português", "história", "ciências"

BEM_ESTAR:
- "ansioso", "triste", "problema emocional"
- "estresse", "ansiedade", "depressão"

CHAT (usar apenas quando não houver correspondência específica):
- "oi", "olá", "bom dia", "boa tarde", "boa noite"
- "como vai", "tudo bem", "como está"
- "obrigado", "obrigada", "valeu", "vlw"
- "tchau", "até logo", "até mais"

Retorne APENAS o código do módulo (sem explicações):`;

    // Fazer chamada à API
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ [CLASSIFY-API] XAI_API_KEY not found, using fallback');
      const fallback = fastClassify(message, historyLength);
      return NextResponse.json(fallback);
    }

    console.log(`🔑 [CLASSIFY-API] Using API key: ${apiKey.substring(0, 10)}...`);

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-3',
        messages: [
          { role: 'system', content: classificationPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.1,
        max_tokens: 20
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [CLASSIFY-API] API error (${response.status}): ${errorText.substring(0, 200)}`);
      const fallback = fastClassify(message, historyLength);
      return NextResponse.json(fallback);
    }

    const data = await response.json();
    const detectedModule = data.choices[0]?.message?.content?.trim().toLowerCase();

    // Validar se o módulo existe
    const validModule = modules.find(m => m.key === detectedModule);
    
    if (!validModule) {
      console.warn(`⚠️ [CLASSIFY-API] Invalid module detected: "${detectedModule}", using fallback`);
      const fallback = fastClassify(message, historyLength);
      return NextResponse.json(fallback);
    }

    const result: ClassificationResult = {
      module: validModule.key,
      confidence: 0.95,
      rationale: `AI detected: ${validModule.name}`
    };

    // Cachear resultado
    classificationCache.set(cacheKey, { result, timestamp: Date.now() });
    
    // Limitar tamanho do cache
    if (classificationCache.size > 100) {
      const firstKey = classificationCache.keys().next().value;
      if (firstKey) classificationCache.delete(firstKey);
    }

    console.log(`✅ [CLASSIFY-API] Classified as: ${validModule.key} (${validModule.name})`);
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ [CLASSIFY-API] Error:', error);
    
    // Fallback em caso de erro
    try {
      const { message, historyLength = 0 } = await req.json();
      const fallback = fastClassify(message, historyLength);
      return NextResponse.json(fallback);
    } catch {
      return NextResponse.json(
        { error: 'Classification failed' },
        { status: 500 }
      );
    }
  }
}
