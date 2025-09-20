import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import OpenAI from 'openai';


import { AutoImageService } from '@/lib/autoImageService';



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { query, subject } = await request.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query é obrigatória' },
        { status: 400 }
      );
    }

    console.log('⚡ Quick Start - Gerando slide 1 para:', query, 'Subject:', subject);

    // Buscar imagem em paralelo (não bloquear)
    const imagePromise = AutoImageService.getImagesForSlides(query, subject);
    
    // Gerar apenas o slide 1 primeiro
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um professor especializado em criar conteúdo educativo sobre ${query}.

          Crie APENAS o SLIDE 1 (APRESENTAÇÃO E MOTIVAÇÃO) seguindo esta estrutura:
          - Card 1: Contexto histórico e relevância atual do tema
          - Card 2: Impacto no mundo real e curiosidades interessantes
          - Foco em despertar curiosidade e mostrar a importância prática
          - Linguagem envolvente com exemplos do cotidiano
          - Cada card deve ter aproximadamente 100-150 palavras
          
          IMPORTANTE: Responda APENAS com JSON válido, sem markdown, sem texto adicional.
          Use aspas duplas para todas as propriedades e valores.
          Exemplo de formato correto:
          {
            "type": "explanation",
            "card1": {
              "title": "Título do Card 1",
              "content": "Contexto histórico e relevância atual"
            },
            "card2": {
              "title": "Título do Card 2", 
              "content": "Impacto real e curiosidades"
            }
          }`
        },
        {
          role: "user",
          content: `Crie um slide de APRESENTAÇÃO E MOTIVAÇÃO sobre ${query}. Este slide deve apresentar o contexto histórico do tema, sua relevância atual, impacto no mundo real e curiosidades interessantes. Use exemplos do cotidiano para despertar curiosidade. NÃO fale sobre conceitos ou definições - apenas apresente o tema de forma motivacional.`
        }
      ],
      temperature: 0.7,
      max_tokens: 800, // Reduzido para resposta mais rápida
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('Resposta vazia da OpenAI');
    }

    // Limpar possível formatação markdown
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Log da resposta para debug
    console.log('📝 Resposta da IA (primeiros 200 chars):', cleanedResponse.substring(0, 200));

    // Tentar fazer parse do JSON
    let slide1;
    try {
      // Tentar corrigir JSON malformado comum
      cleanedResponse = cleanedResponse
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":') // Adicionar aspas em propriedades sem aspas
        .replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([,}])/g, ': "$1"$2') // Adicionar aspas em valores sem aspas
        .replace(/,\s*}/g, '}') // Remover vírgulas antes de }
        .replace(/,\s*]/g, ']'); // Remover vírgulas antes de ]
      
      slide1 = JSON.parse(cleanedResponse);
      console.log('✅ Slide 1 gerado com sucesso');
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.error('📝 Resposta problemática:', cleanedResponse);
      
      // Fallback para slide básico
      slide1 = {
        type: 'explanation',
        card1: {
          title: 'Introdução ao Tópico',
          content: `Vamos explorar os conceitos fundamentais de ${query}. Este tópico é importante porque nos ajuda a compreender melhor o mundo ao nosso redor e desenvolve nosso pensamento crítico.`
        },
        card2: {
          title: 'Por que Estudar Este Tema?',
          content: `Este tema é essencial para desenvolver habilidades importantes como análise crítica, síntese de informações e aplicação prática do conhecimento.`
        }
      };
    }

    // Aguardar imagem (com timeout)
    let imageResult = null;
    try {
      imageResult = await Promise.race([
        imagePromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
      ]);
    } catch (error) {
      console.log('⚠️ Imagem não carregada a tempo, continuando sem ela');
    }

    // Adicionar imagem se disponível
    if (imageResult && (imageResult as any).introImage && slide1.card2) {
      slide1.card2.imageUrl = (imageResult as any).introImage.urls.regular;
    }

    return NextResponse.json({
      success: true,
      slide1: slide1,
      imageInfo: (imageResult as any)?.introImage ? {
        theme: (imageResult as any).theme,
        imageUrl: (imageResult as any).introImage.urls.regular,
        imageId: (imageResult as any).introImage.id,
        description: (imageResult as any).introImage.alt_description,
        author: (imageResult as any).introImage.user.name
      } : null
    });

  } catch (error: any) {
    console.error('❌ Erro na API quick-start:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
