import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { ultraFastClassify } from '@/lib/ultra-fast-classifier';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Schema ultra-simplificado
const UltraFastRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  module: z.string().optional().default('auto'),
  conversationId: z.string().optional(),
  history: z.array(z.any()).optional().default([]),
  useGoogle: z.boolean().optional().default(true)
});

// Configuração de modelos otimizada
const MODEL_CONFIGS = {
  trivial: {
    google: 'gemini-1.5-flash',
    openai: 'gpt-4o-mini'
  },
  simples: {
    google: 'gemini-1.5-flash', 
    openai: 'gpt-4o-mini'
  },
  complexa: {
    google: 'gemini-1.5-pro',
    openai: 'gpt-4o-mini'
  }
};

// System prompts otimizados
const SYSTEM_PROMPTS = {
  professor: `Você é um professor especialista e paciente. Responda de forma didática e clara, sempre incentivando o aprendizado.`,
  enem: `Você é um especialista em ENEM e vestibulares. Forneça respostas objetivas e estratégicas para questões e simulados.`,
  aula_interativa: `Você é um facilitador de aulas interativas. Crie conteúdo dinâmico e envolvente para o aprendizado.`,
  ti: `Você é um especialista em TI. Resolva problemas técnicos de forma prática e eficiente.`,
  financeiro: `Você é um especialista financeiro. Forneça informações claras sobre valores, pagamentos e procedimentos.`,
  rh: `Você é um especialista em RH. Ajude com questões trabalhistas, benefícios e procedimentos administrativos.`,
  social_media: `Você é um especialista em redes sociais e marketing digital. Ajude com estratégias e conteúdo.`,
  bem_estar: `Você é um especialista em bem-estar e saúde mental. Ofereça apoio emocional de forma empática e profissional.`,
  coordenacao: `Você é um coordenador pedagógico. Ajude com questões acadêmicas, calendários e gestão educacional.`,
  secretaria: `Você é um especialista em procedimentos administrativos. Ajude com documentos e processos.`,
  conteudo_midia: `Você é um especialista em conteúdo visual. Ajude com imagens, diagramas e materiais educacionais.`,
  atendimento: `Você é um assistente educacional amigável e prestativo. Ajude com dúvidas gerais e direcionamento.`
};

// Função para detectar complexidade ultra-rápida
function detectComplexityUltraFast(message: string): 'trivial' | 'simples' | 'complexa' {
  const lowerMessage = message.toLowerCase();
  
  // Trivial: saudações simples e mensagens muito curtas
  if (message.length < 20 || /\b(oi|olá|tudo bem|td bem|ok|sim|não|nao)\b/i.test(lowerMessage)) {
    return 'trivial';
  }
  
  // Complexa: perguntas educacionais ou com indicadores de complexidade
  if (/\b(como|por que|quando|onde|qual|quais|quem|explique|demonstre|prove|calcule|resolva|desenvolva|analise|compare|discuta|avalie|me ajude|ajuda|dúvida|dúvidas|não entendo|não sei|preciso|quero|gostaria|poderia|pode|tirar|tirar uma|fazer|entender|aprender|estudar|escrever|escreva|produzir|produza|elaborar|elabore|criar|crie|desenvolver|desenvolva|construir|construa|formular|formule|argumentar|argumente|defender|defenda|justificar|justifique|fundamentar|fundamente|sustentar|sustente|comprovar|comprove|demonstrar|demonstre|mostrar|mostre|apresentar|apresente|expor|exponha|discorrer|discorra|abordar|aborde|tratar|trate|analisar|analise|examinar|examine|investigar|investigue|pesquisar|pesquise|estudar|estude|aprender|aprenda|compreender|compreenda|entender|entenda|interpretar|interprete|explicar|explique|descrever|descreva|narrar|narre|relatar|relate|contar|conte|expor|exponha|apresentar|apresente|mostrar|mostre|demonstrar|demonstre|provar|prove|comprovar|comprove|sustentar|sustente|fundamentar|fundamente|justificar|justifique|argumentar|argumente|defender|defenda|convencer|convença|persuadir|persuada|influenciar|influencie|motivar|motive|inspirar|inspire|estimular|estimule|incentivar|incentive|promover|promova|fomentar|fomente|desenvolver|desenvolva|cultivar|cultive|formar|forme|construir|construa|edificar|edifique|estabelecer|estabeleça|criar|crie|gerar|gere|produzir|produza|elaborar|elabore|construir|construa|desenvolver|desenvolva|formular|formule|estruturar|estruture|organizar|organize|sistematizar|sistematize|planejar|planeje|programar|programe|projetar|projete|desenhar|desenhe|esboçar|esboce|rascunhar|rascunhe|escrever|escreva|redigir|redija|compor|componha|produzir|produza|elaborar|elabore|construir|construa|desenvolver|desenvolva|formular|formule|estruturar|estruture|organizar|organize|sistematizar|sistematize|planejar|planeje|programar|programe|projetar|projete|desenhar|desenhe|esboçar|esboce|rascunhar|rascunhe)\b/i.test(message) && message.length > 30) {
    return 'complexa';
  }
  
  return 'simples';
}

// Função para selecionar provider baseado na complexidade
function selectProvider(complexity: 'trivial' | 'simples' | 'complexa', useGoogle: boolean): 'google' | 'openai' {
  if (!useGoogle || !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return 'openai';
  }
  
  // Para trivial e simples, preferir Google (mais rápido)
  if (complexity === 'trivial' || complexity === 'simples') {
    return 'google';
  }
  
  // Para complexa, usar OpenAI (mais preciso)
  return 'openai';
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Validação ultra-rápida
    const body = await request.json();
    const validationResult = UltraFastRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request format', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { message, module, history, conversationId, useGoogle } = validationResult.data;
    
    console.log(`🚀 [ULTRA-FAST] Processing: "${message.substring(0, 30)}..." module=${module}`);
    
    // 1. Classificação ultra-rápida (Google direto ou local)
    let targetModule = module;
    let classificationSource = 'client_override';
    
    if (module === 'auto') {
      const classificationStart = Date.now();
      const classification = await ultraFastClassify(message, history.length, useGoogle);
      const classificationTime = Date.now() - classificationStart;
      
      targetModule = classification.module;
      classificationSource = classification.method;
      console.log(`🎯 [ULTRA-CLASSIFY] ${targetModule} (confidence: ${classification.confidence}, method: ${classification.method}) - ${classificationTime}ms`);
    }
    
    // 2. Detecção de complexidade ultra-rápida
    const complexityStart = Date.now();
    const complexity = detectComplexityUltraFast(message);
    const complexityTime = Date.now() - complexityStart;
    console.log(`⚡ [COMPLEXITY] ${complexity} (local, ${complexityTime}ms)`);
    
    // 3. Seleção de provider otimizada
    const providerStart = Date.now();
    const selectedProvider = selectProvider(complexity, useGoogle);
    const providerTime = Date.now() - providerStart;
    console.log(`🎯 [PROVIDER-SELECTION] ${selectedProvider} (reason: ${complexity}-${useGoogle ? 'google-enabled' : 'google-disabled'}) - ${providerTime}ms`);
    
    // 4. Configuração do modelo
    const modelStart = Date.now();
    let modelInstance;
    const modelName = MODEL_CONFIGS[complexity][selectedProvider];
    
    try {
      if (selectedProvider === 'google') {
        modelInstance = google(modelName);
      } else {
        modelInstance = openai(modelName);
      }
      const modelTime = Date.now() - modelStart;
      console.log(`✅ [MODEL] Using ${selectedProvider}:${modelName} - ${modelTime}ms`);
    } catch (error) {
      console.error('❌ [MODEL] Error:', error);
      // Fallback para OpenAI
      modelInstance = openai('gpt-4o-mini');
      console.log(`🔄 [MODEL] Fallback to OpenAI:gpt-4o-mini`);
    }
    
    // 5. Preparar mensagens
    const messagesStart = Date.now();
    const finalMessages = [
      {
        role: 'system' as const,
        content: SYSTEM_PROMPTS[targetModule as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.atendimento
      },
      ...(history || []).slice(-5).map((msg: any) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: message
      }
    ];
    const messagesTime = Date.now() - messagesStart;
    console.log(`⏱️ [MESSAGES] Prepared in ${messagesTime}ms`);
    
    // 6. Streaming direto
    const streamStart = Date.now();
    const result = await streamText({
      model: modelInstance,
      messages: finalMessages,
      temperature: complexity === 'complexa' ? 0.7 : 0.5,
      maxTokens: complexity === 'complexa' ? 500 : 150,
    });
    
    const streamTime = Date.now() - streamStart;
    const totalTime = Date.now() - startTime;
    
    console.log(`⏱️ [STREAM] Started in ${streamTime}ms`);
    console.log(`✅ [ULTRA-FAST] Completed in ${totalTime}ms (${selectedProvider}:${modelName})`);
    
    return result.toTextStreamResponse({
      headers: {
        'X-Module': targetModule,
        'X-Provider': selectedProvider,
        'X-Model': modelName,
        'X-Complexity': complexity,
        'X-Classification-Method': classificationSource,
        'X-Total-Time': `${totalTime}ms`,
        'X-Classification-Time': `${Date.now() - startTime - streamTime}ms`
      }
    });

  } catch (error: any) {
    console.error('❌ [ULTRA-FAST] Error:', error);
    
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
