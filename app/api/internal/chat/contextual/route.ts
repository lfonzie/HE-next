import { NextRequest, NextResponse } from 'next/server';

// Interface para requisição de chat contextual
interface ContextualChatRequest {
  message: string;
  context?: string;
  needsVisual?: boolean;
  imageStrategy?: 'search_first' | 'generate_first' | 'hybrid';
}

// Interface para resposta de chat contextual
interface ContextualChatResponse {
  success: boolean;
  response: {
    text: string;
    hasImage: boolean;
    image?: ContextualImage;
  };
  processingTime: number;
  visualContext?: {
    topic: string;
    strategy: string;
    processingTime: number;
  };
  error?: string;
}

// Interface para imagem contextual
interface ContextualImage {
  id: string;
  url: string;
  title: string;
  description: string;
  type: string;
  style: string;
  source: 'search' | 'generation' | 'placeholder';
  relevance: number;
  quality: number;
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/internal/images/unified`, {
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

// Função para gerar resposta contextual (simulada)
function generateContextualResponse(message: string, hasImage: boolean, image?: ContextualImage): string {
  const topic = extractTopicFromMessage(message);
  
  if (hasImage && image) {
    return `Aqui está uma explicação sobre ${topic} com uma imagem que pode ajudar na compreensão. A imagem mostra ${image.description} e pode facilitar o entendimento do conceito.`;
  } else {
    return `Vou explicar sobre ${topic}. Este é um conceito importante que envolve diversos aspectos que precisamos compreender.`;
  }
}

// Handler principal da API
export async function POST(request: NextRequest) {
  try {
    const body: ContextualChatRequest = await request.json();
    const { 
      message, 
      context = 'educacional',
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
    
    let contextualImage: ContextualImage | undefined;
    let visualContext: any = undefined;

    if (shouldShowVisual) {
      console.log(`🖼️ Detectada necessidade de contexto visual`);
      
      // 2. Extrair tópico da mensagem
      const topic = extractTopicFromMessage(message);
      console.log(`🎯 Tópico extraído: "${topic}"`);
      
      // 3. Obter imagem contextual
      const imageStartTime = Date.now();
      const imagesResponse = await getContextualImage(topic, context, imageStrategy);
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
    const responseText = generateContextualResponse(message, shouldShowVisual, contextualImage);

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

// Handler para GET (informações da API)
export async function GET() {
  return NextResponse.json({
    name: 'API de Chat Contextual',
    version: '1.0.0',
    description: 'API para chat com contexto visual automático',
    endpoints: {
      POST: {
        description: 'Processar mensagem com contexto visual',
        body: {
          message: 'string (obrigatório)',
          context: 'string (opcional, padrão: educacional)',
          needsVisual: 'boolean (opcional)',
          imageStrategy: 'string (opcional: search_first, generate_first, hybrid)'
        }
      }
    },
    features: [
      'Detecção automática de necessidade visual',
      'Extração inteligente de tópicos',
      'Imagens contextuais automáticas',
      'Respostas enriquecidas com visual',
      'Integração com sistema de imagens'
    ],
    visualKeywords: [
      'processos', 'ciclos', 'estruturas', 'sistemas',
      'conceitos científicos', 'geografia', 'história',
      'arte', 'tecnologia', 'como funciona'
    ],
    contexts: {
      educacional: 'Contexto educacional geral',
      cientifico: 'Contexto científico específico',
      historico: 'Contexto histórico',
      artistico: 'Contexto artístico',
      tecnico: 'Contexto técnico'
    }
  });
}
