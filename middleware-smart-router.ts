import { NextRequest, NextResponse } from 'next/server';

// Middleware inteligente para roteamento automático de endpoints
export async function middleware(request: NextRequest) {
  // Apenas para endpoints de chat
  if (!request.nextUrl.pathname.startsWith('/api/chat/')) {
    return NextResponse.next();
  }
  
  // Apenas para POST requests
  if (request.method !== 'POST') {
    return NextResponse.next();
  }
  
  try {
    // Ler o body da requisição
    const body = await request.json();
    const { message } = body;
    
    if (!message) {
      return NextResponse.next();
    }
    
    // Detectar tipo de mensagem e rotear para endpoint otimizado
    const messageType = detectMessageType(message);
    
    switch (messageType) {
      case 'trivial':
        // Redirecionar para endpoint trivial ultra-rápido
        const trivialUrl = new URL('/api/chat/trivial-fast', request.url);
        return NextResponse.rewrite(trivialUrl);
        
      case 'simple':
        // Redirecionar para endpoint ultra-rápido
        const ultraUrl = new URL('/api/chat/ultra-fast', request.url);
        return NextResponse.rewrite(ultraUrl);
        
      case 'complex':
      default:
        // Usar endpoint otimizado padrão
        const multiUrl = new URL('/api/chat/ai-sdk-multi', request.url);
        return NextResponse.rewrite(multiUrl);
    }
    
  } catch (error) {
    // Em caso de erro, usar endpoint padrão
    console.warn('⚠️ [SMART-ROUTER] Error, using default endpoint:', error);
    const defaultUrl = new URL('/api/chat/ai-sdk-multi', request.url);
    return NextResponse.rewrite(defaultUrl);
  }
}

// Função para detectar tipo de mensagem
function detectMessageType(message: string): 'trivial' | 'simple' | 'complex' {
  const lowerMessage = message.toLowerCase().trim();
  
  // Trivial: saudações simples e mensagens muito curtas
  if (message.length < 25) {
    const trivialPatterns = [
      /^(oi|olá|olá!|oi!)$/i,
      /^(tudo bem|td bem|tudo bom|td bom)$/i,
      /^(bom dia|boa tarde|boa noite)$/i,
      /^(ok|okay|sim|não|nao)$/i,
      /^(obrigado|obrigada|valeu|vlw)$/i,
      /^(tchau|até logo|até mais|bye)$/i
    ];
    
    if (trivialPatterns.some(pattern => pattern.test(lowerMessage))) {
      return 'trivial';
    }
  }
  
  // Complex: perguntas educacionais ou com indicadores de complexidade
  if (/\b(como|por que|quando|onde|qual|quais|quem|explique|demonstre|prove|calcule|resolva|desenvolva|analise|compare|discuta|avalie|me ajude|ajuda|dúvida|dúvidas|não entendo|não sei|preciso|quero|gostaria|poderia|pode|tirar|tirar uma|fazer|entender|aprender|estudar|escrever|escreva|produzir|produza|elaborar|elabore|criar|crie|desenvolver|desenvolva|construir|construa|formular|formule|argumentar|argumente|defender|defenda|justificar|justifique|fundamentar|fundamente|sustentar|sustente|comprovar|comprove|demonstrar|demonstre|mostrar|mostre|apresentar|apresente|expor|exponha|discorrer|discorra|abordar|aborde|tratar|trate|analisar|analise|examinar|examine|investigar|investigue|pesquisar|pesquise|estudar|estude|aprender|aprenda|compreender|compreenda|entender|entenda|interpretar|interprete|explicar|explique|descrever|descreva|narrar|narre|relatar|relate|contar|conte|expor|exponha|apresentar|apresente|mostrar|mostre|demonstrar|demonstre|provar|prove|comprovar|comprove|sustentar|sustente|fundamentar|fundamente|justificar|justifique|argumentar|argumente|defender|defenda|convencer|convença|persuadir|persuada|influenciar|influencie|motivar|motive|inspirar|inspire|estimular|estimule|incentivar|incentive|promover|promova|fomentar|fomente|desenvolver|desenvolva|cultivar|cultive|formar|forme|construir|construa|edificar|edifique|estabelecer|estabeleça|criar|crie|gerar|gere|produzir|produza|elaborar|elabore|construir|construa|desenvolver|desenvolva|formular|formule|estruturar|estruture|organizar|organize|sistematizar|sistematize|planejar|planeje|programar|programe|projetar|projete|desenhar|desenhe|esboçar|esboce|rascunhar|rascunhe|escrever|escreva|redigir|redija|compor|componha|produzir|produza|elaborar|elabore|construir|construa|desenvolver|desenvolva|formular|formule|estruturar|estruture|organizar|organize|sistematizar|sistematize|planejar|planeje|programar|programe|projetar|projete|desenhar|desenhe|esboçar|esboce|rascunhar|rascunhe)\b/i.test(message) && message.length > 30) {
    return 'complex';
  }
  
  return 'simple';
}

export const config = {
  matcher: '/api/chat/:path*'
};
