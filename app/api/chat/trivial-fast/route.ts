import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';

export const dynamic = 'force-dynamic';

// Schema ultra-simplificado para mensagens triviais
const TrivialRequestSchema = {
  message: 'string',
  conversationId: 'string?',
  history: 'array?'
};

// Detecção ultra-rápida de mensagens triviais
function isTrivialMessage(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim();
  
  // Mensagens muito curtas
  if (message.length < 25) {
    return true;
  }
  
  // Saudações simples
  const trivialPatterns = [
    /^(oi|olá|olá!|oi!)$/i,
    /^(tudo bem|td bem|tudo bom|td bom)$/i,
    /^(bom dia|boa tarde|boa noite)$/i,
    /^(ok|okay|sim|não|nao)$/i,
    /^(obrigado|obrigada|valeu|vlw)$/i,
    /^(tchau|até logo|até mais|bye)$/i,
    /^(oi tudo bem|olá tudo bem)$/i,
    /^(tudo bem\?|td bem\?)$/i
  ];
  
  return trivialPatterns.some(pattern => pattern.test(lowerMessage));
}

// Respostas pré-definidas para mensagens triviais
const TRIVIAL_RESPONSES = {
  greeting: [
    "Olá! Tudo bem sim, obrigado! Como posso te ajudar hoje?",
    "Oi! Tudo ótimo, obrigado! Em que posso te auxiliar?",
    "Olá! Estou bem, obrigado! Como posso te ajudar?",
    "Oi! Tudo bem sim! Como posso te ajudar hoje?"
  ],
  goodbye: [
    "Tchau! Foi um prazer te ajudar!",
    "Até logo! Qualquer coisa, estou aqui!",
    "Tchau! Volte sempre que precisar!",
    "Até mais! Foi ótimo conversar com você!"
  ],
  thanks: [
    "De nada! Foi um prazer ajudar!",
    "Por nada! Estou aqui sempre que precisar!",
    "De nada! Qualquer coisa, só chamar!",
    "Por nada! Foi um prazer te ajudar!"
  ],
  default: [
    "Olá! Como posso te ajudar hoje?",
    "Oi! Em que posso te auxiliar?",
    "Olá! Como posso te ajudar?",
    "Oi! Como posso te ajudar hoje?"
  ]
};

// Função para gerar resposta trivial ultra-rápida
function generateTrivialResponse(message: string): string {
  const lowerMessage = message.toLowerCase().trim();
  
  if (/^(oi|olá|olá!|oi!)$/i.test(lowerMessage)) {
    return TRIVIAL_RESPONSES.greeting[Math.floor(Math.random() * TRIVIAL_RESPONSES.greeting.length)];
  }
  
  if (/^(tchau|até logo|até mais|bye)$/i.test(lowerMessage)) {
    return TRIVIAL_RESPONSES.goodbye[Math.floor(Math.random() * TRIVIAL_RESPONSES.goodbye.length)];
  }
  
  if (/^(obrigado|obrigada|valeu|vlw)$/i.test(lowerMessage)) {
    return TRIVIAL_RESPONSES.thanks[Math.floor(Math.random() * TRIVIAL_RESPONSES.thanks.length)];
  }
  
  if (/^(tudo bem|td bem|tudo bom|td bom)$/i.test(lowerMessage)) {
    return "Que bom! Como posso te ajudar hoje?";
  }
  
  if (/^(bom dia|boa tarde|boa noite)$/i.test(lowerMessage)) {
    return `${lowerMessage.charAt(0).toUpperCase() + lowerMessage.slice(1)}! Como posso te ajudar?`;
  }
  
  return TRIVIAL_RESPONSES.default[Math.floor(Math.random() * TRIVIAL_RESPONSES.default.length)];
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { message, conversationId, history = [] } = body;
    
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    console.log(`🚀 [TRIVIAL-FAST] Processing: "${message}"`);
    
    // 1. Verificar se é mensagem trivial
    if (!isTrivialMessage(message)) {
      // Redirecionar para endpoint normal
      console.log(`🔄 [TRIVIAL-FAST] Not trivial, redirecting to ai-sdk-multi`);
      return NextResponse.json({ 
        redirect: '/api/chat/ai-sdk-multi',
        reason: 'not_trivial'
      }, { status: 307 });
    }
    
    // 2. Gerar resposta trivial ultra-rápida
    const responseStart = Date.now();
    const trivialResponse = generateTrivialResponse(message);
    const responseTime = Date.now() - responseStart;
    
    console.log(`⚡ [TRIVIAL-RESPONSE] Generated in ${responseTime}ms`);
    
    // 3. Simular streaming para manter compatibilidade
    const streamStart = Date.now();
    
    // Criar um stream simples com a resposta
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Simular streaming palavra por palavra
        const words = trivialResponse.split(' ');
        let index = 0;
        
        const sendNextWord = () => {
          if (index < words.length) {
            const word = words[index] + (index < words.length - 1 ? ' ' : '');
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: word })}\n\n`));
            index++;
            setTimeout(sendNextWord, 50); // Simular delay de streaming
          } else {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          }
        };
        
        sendNextWord();
      }
    });
    
    const streamTime = Date.now() - streamStart;
    const totalTime = Date.now() - startTime;
    
    console.log(`⏱️ [STREAM] Started in ${streamTime}ms`);
    console.log(`✅ [TRIVIAL-FAST] Completed in ${totalTime}ms`);
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Module': 'atendimento',
        'X-Provider': 'trivial',
        'X-Model': 'predefined',
        'X-Complexity': 'trivial',
        'X-Classification-Method': 'trivial_detection',
        'X-Total-Time': `${totalTime}ms`,
        'X-Response-Time': `${responseTime}ms`,
        'X-Stream-Time': `${streamTime}ms`
      }
    });

  } catch (error: any) {
    console.error('❌ [TRIVIAL-FAST] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
