// app/api/chat/contextual-with-images/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

interface ContextualChatRequest {
  message: string;
  provider?: string;
  model?: string;
  conversationId?: string;
  needsVisual?: boolean;
  imageStrategy?: 'search_first' | 'generate_first' | 'hybrid';
}

interface ContextualChatResponse {
  success: boolean;
  response: {
    text: string;
    hasImage: boolean;
    image?: {
      id: string;
      url: string;
      title: string;
      description: string;
      type: string;
      style: string;
      source: 'search' | 'generation' | 'placeholder';
      relevance: number;
      quality: number;
    };
  };
  processingTime: number;
  visualContext?: {
    topic: string;
    strategy: string;
    processingTime: number;
  };
  error?: string;
}

// Função para detectar se a mensagem precisa de contexto visual
function needsVisualContext(message: string): boolean {
  const visualKeywords = [
    // Processos e ciclos
    'como funciona', 'processo', 'ciclo', 'fluxo', 'etapas',
    'fotossíntese', 'respiração', 'digestão', 'circulação',
    
    // Estruturas e sistemas
    'estrutura', 'sistema', 'organização', 'arquitetura',
    'dna', 'célula', 'órgão', 'sistema solar', 'galáxia',
    
    // Conceitos científicos
    'molecular', 'atômico', 'químico', 'físico',
    'biologia', 'química', 'física', 'matemática',
    
    // Geografia e história
    'mapa', 'continente', 'país', 'cidade',
    'revolução', 'guerra', 'império', 'civilização',
    
    // Arte e cultura
    'arte', 'pintura', 'escultura', 'arquitetura',
    'renascimento', 'barroco', 'impressionismo',
    
    // Tecnologia
    'computador', 'internet', 'rede', 'algoritmo',
    'programação', 'software', 'hardware'
  ];
  
  const messageLower = message.toLowerCase();
  return visualKeywords.some(keyword => messageLower.includes(keyword));
}

// Função para extrair tópico da mensagem
function extractTopicFromMessage(message: string): string {
  // Remover palavras comuns e extrair o tópico principal
  const commonWords = [
    'como', 'funciona', 'o que', 'é', 'são', 'para', 'com', 'em', 'de', 'da', 'do',
    'me', 'explica', 'pode', 'me', 'ajudar', 'entender', 'compreender'
  ];
  
  const words = message.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(word => word.length > 2 && !commonWords.includes(word));
  
  // Retornar as primeiras palavras significativas
  return words.slice(0, 3).join(' ');
}

// Função para chamar API unificada de imagens
async function getContextualImage(topic: string, context: string, strategy: string = 'search_first'): Promise<any> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003'}/api/internal/images/unified`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        count: 1,
        context: `chat_${context}`,
        strategy,
        fallback: true
      })
    });

    if (!response.ok) {
      throw new Error(`Images API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Erro ao chamar API de imagens:', error);
    return { success: false, images: [], strategy: 'error' };
  }
}

// Função para gerar resposta contextual
async function generateContextualResponse(message: string, hasImage: boolean, image?: any): Promise<string> {
  try {
    const topic = extractTopicFromMessage(message);
    
    let prompt = `Responda à seguinte pergunta de forma educacional e clara: "${message}"`;
    
    if (hasImage && image) {
      prompt += `\n\nUma imagem explicativa sobre ${topic} foi incluída para ajudar na compreensão. Use isso para enriquecer sua resposta.`;
    }
    
    const result = await generateText({
      model: google('gemini-2.0-flash-exp'),
      prompt,
      temperature: 0.7,
      maxTokens: 1000,
    });

    return result.text;
  } catch (error) {
    console.error('❌ Erro ao gerar resposta contextual:', error);
    return `Aqui está uma explicação sobre ${extractTopicFromMessage(message)}. ${hasImage && image ? 'Uma imagem explicativa foi incluída para ajudar na compreensão.' : ''}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ContextualChatRequest = await request.json();
    const { 
      message, 
      provider = 'gemini',
      model = 'gemini-2.0-flash-exp',
      conversationId,
      needsVisual,
      imageStrategy = 'search_first'
    } = body;

    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Mensagem é obrigatória'
      }, { status: 400 });
    }

    const startTime = Date.now();
    console.log(`💬 Chat contextual iniciado: "${message}"`);

    // 1. Detectar se precisa de contexto visual
    const shouldShowVisual = needsVisual !== undefined ? needsVisual : needsVisualContext(message);
    
    let contextualImage: any = undefined;
    let visualContext: any = undefined;

    if (shouldShowVisual) {
      console.log(`🖼️ Detectada necessidade de contexto visual`);
      
      // 2. Extrair tópico da mensagem
      const topic = extractTopicFromMessage(message);
      console.log(`🎯 Tópico extraído: "${topic}"`);
      
      // 3. Obter imagem contextual
      const imageStartTime = Date.now();
      const imagesResponse = await getContextualImage(topic, 'educacional', imageStrategy);
      const imageProcessingTime = Date.now() - imageStartTime;
      
      if (imagesResponse.success && imagesResponse.images.length > 0) {
        const image = imagesResponse.images[0];
        contextualImage = {
          id: image.id,
          url: image.url,
          title: image.title,
          description: image.description,
          type: image.type,
          style: image.style,
          source: image.source,
          relevance: image.relevance,
          quality: image.quality
        };
        
        visualContext = {
          topic,
          strategy: imagesResponse.strategy,
          processingTime: imageProcessingTime
        };
        
        console.log(`✅ Imagem contextual obtida: ${image.source} (${image.type})`);
      } else {
        console.log(`⚠️ Não foi possível obter imagem contextual`);
      }
    }

    // 4. Gerar resposta contextual
    const responseText = await generateContextualResponse(message, shouldShowVisual, contextualImage);

    const processingTime = Date.now() - startTime;

    const result: ContextualChatResponse = {
      success: true,
      response: {
        text: responseText,
        hasImage: shouldShowVisual,
        image: contextualImage
      },
      processingTime,
      visualContext
    };

    console.log(`✅ Chat contextual concluído em ${processingTime}ms`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Erro no chat contextual:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      processingTime: Date.now() - Date.now()
    }, { status: 500 });
  }
}
