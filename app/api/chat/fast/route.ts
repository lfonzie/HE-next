import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { Message, streamText } from 'ai'


import { openai } from '@ai-sdk/openai'


import { fastClassify } from '@/lib/fast-classifier'


import { z } from 'zod'



// Schema simplificado - apenas campos essenciais
const FastRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  module: z.string().optional().default('auto'),
  conversationId: z.string().optional(),
  history: z.array(z.any()).optional().default([])
});

// Configuração simplificada de modelos
const MODEL_CONFIG = {
  default: 'gpt-4o-mini',
  fast: 'gpt-4o-mini',
  complex: 'gpt-4o-mini' // Mesmo modelo para simplificar
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Validação rápida
    const body = await request.json();
    const validationResult = FastRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request format', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { message, module, history, conversationId } = validationResult.data;
    
    console.log(`🚀 [FAST-CHAT] Processing: "${message.substring(0, 30)}..." module=${module}`);
    
    // 1. Classificação rápida local (sem chamadas externas)
    let targetModule = module;
    let classificationSource = 'client_override';
    
    if (module === 'auto') {
      const classification = fastClassify(message, history.length);
      targetModule = classification.module;
      classificationSource = 'fast_local';
      console.log(`🎯 [FAST-CLASSIFY] ${targetModule} (confidence: ${classification.confidence})`);
    }
    
    // 2. Preparar mensagens (sem validações complexas)
    const finalMessages: Message[] = [
      ...(history || []).slice(-5).map((msg: any) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: message
      }
    ];
    
    // 3. Configuração direta do modelo (sem seleção complexa)
    const modelInstance = openai(MODEL_CONFIG.default);
    
    // 4. Headers simplificados
    const headers = new Headers({
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Provider': 'openai',
      'X-Model': MODEL_CONFIG.default,
      'X-Module': targetModule,
      'X-Source': classificationSource,
      'X-Latency': `${Date.now() - startTime}ms`
    });
    
    // 5. Streaming direto (sem configurações complexas)
    try {
      const result = await streamText({
        model: modelInstance,
        messages: finalMessages,
        maxTokens: 1000,
        temperature: 0.7,
      });

      return result.toTextStreamResponse({
        headers,
        onFinish: async () => {
          const totalTime = Date.now() - startTime;
          console.log(`✅ [FAST-CHAT] Completed in ${totalTime}ms`);
        }
      });
    } catch (streamingError: any) {
      console.error('❌ [FAST-CHAT] Streaming error:', streamingError);
      
      return new NextResponse(
        `Desculpe, houve um problema ao processar sua mensagem. Tente novamente.`,
        {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Provider': 'error',
            'X-Module': targetModule,
            'X-Source': classificationSource
          }
        }
      );
    }

  } catch (error: any) {
    const totalLatency = Date.now() - startTime;
    console.error(`❌ [FAST-CHAT] Fatal error: ${error.message} latency=${totalLatency}ms`);
    
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
