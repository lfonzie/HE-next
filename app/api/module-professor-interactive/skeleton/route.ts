import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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

    console.log(`🎯 Gerando esqueleto da aula para: ${query}, Disciplina: ${subject || 'Geral'}`);

    const systemPrompt = `Você é um professor especializado em criar estruturas de aulas educativas.

Crie um esqueleto detalhado para uma aula de 8 slides sobre ${query}.

ESTRUTURA OBRIGATÓRIA:
- Slide 1: Introdução e motivação
- Slide 2: Conceitos fundamentais  
- Slide 3: Desenvolvimento do conteúdo
- Slide 4: PERGUNTA DE VERIFICAÇÃO
- Slide 5: Aplicações práticas
- Slide 6: Exemplos e exercícios
- Slide 7: ATIVIDADE INTERATIVA
- Slide 8: Resumo e conclusão

Para cada slide, forneça:
- Título do slide
- Objetivo específico
- Conteúdo principal (resumo de 2-3 frases)
- Tipo de slide (explanation/question)
- Para perguntas: tema da pergunta e resposta esperada
- imagePrompt: Descrição ESPECÍFICA para imagem (NÃO use termos genéricos como "educação", "aprendizado", "ensino". Use termos específicos relacionados ao conteúdo do slide)

IMPORTANTE: Para imagePrompt, use termos específicos e concretos relacionados ao conteúdo específico de cada slide, não termos genéricos de educação.

Responda APENAS com JSON válido:
{
  "title": "Título da Aula",
  "subject": "${subject || 'Geral'}",
  "theme": "${query}",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Título do Slide",
      "type": "explanation",
      "objective": "Objetivo específico do slide",
      "contentSummary": "Resumo do conteúdo principal",
      "imagePrompt": "Termo específico e concreto para busca de imagem"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Crie um esqueleto detalhado para uma aula sobre ${query}. 
          
          A aula deve ser educativa, envolvente e seguir uma progressão lógica.
          Slides 4 e 7 devem ser perguntas de múltipla escolha.
          Slides 1 e 8 devem incluir imagens.
          
          IMPORTANTE: Para cada imagePrompt, use termos específicos e concretos relacionados ao conteúdo específico de cada slide. 
          NÃO use termos genéricos como "educação", "aprendizado", "ensino", "estudante", "professor", "escola", "sala de aula".
          Use termos específicos do tema da aula e do conteúdo de cada slide.
          
          Exemplos de imagePrompts específicos:
          - Para slide sobre "Fotosíntese": "folhas verdes clorofila"
          - Para slide sobre "Gravidade": "maçã caindo Newton"
          - Para slide sobre "História do Brasil": "independência Brasil 1822"
          
          Responda APENAS com JSON válido.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
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

    // Tentar fazer parse do JSON
    let skeleton;
    try {
      skeleton = JSON.parse(cleanedResponse);
      console.log(`✅ Esqueleto da aula gerado com sucesso`);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      
      // Fallback para esqueleto básico
      skeleton = {
        title: `Aula sobre ${query}`,
        subject: subject || 'Geral',
        theme: query,
        slides: [
          {
            slideNumber: 1,
            title: "Introdução ao Tópico",
            type: "explanation",
            objective: "Apresentar o tema e motivar o aprendizado",
            contentSummary: "Contexto histórico e relevância atual do tema",
            imagePrompt: `${query} conceitos básicos`
          },
          {
            slideNumber: 2,
            title: "Conceitos Fundamentais",
            type: "explanation", 
            objective: "Estabelecer os conceitos básicos",
            contentSummary: "Definições importantes e termos-chave",
            imagePrompt: `${query} fundamentos teoria`
          }
        ]
      };
    }

    return NextResponse.json({
      success: true,
      skeleton: skeleton
    });

  } catch (error: any) {
    console.error('❌ Erro na API skeleton:', error);
    
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
