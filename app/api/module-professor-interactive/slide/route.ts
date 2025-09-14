import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { query, subject, slideIndex } = await request.json();

    if (!query || !slideIndex) {
      return NextResponse.json(
        { success: false, error: 'Query e slideIndex são obrigatórios' },
        { status: 400 }
      );
    }

    console.log(`🎓 Gerando slide ${slideIndex} para:`, query, 'Subject:', subject);

    // Determinar tipo de slide baseado no índice (slides 4 e 7 são perguntas)
    const isQuestionSlide = slideIndex === 4 || slideIndex === 7;
    const isFinalSlide = slideIndex === 8;
    
    // Determinar contexto do progresso da aula
    const progressContext = slideIndex <= 2 ? 'início' : 
                           slideIndex <= 4 ? 'desenvolvimento inicial' :
                           slideIndex <= 6 ? 'desenvolvimento avançado' :
                           slideIndex <= 8 ? 'conclusão' : 'final';
    
    console.log(`📝 Gerando slide ${slideIndex}, tipo: ${isQuestionSlide ? 'pergunta' : 'explicação'}, contexto: ${progressContext}`);

    const slideType = isQuestionSlide ? 'question' : 'explanation';
    
    // Prompts específicos para cada tipo de slide
    let systemPrompt = '';
    let userPrompt = '';

    if (isQuestionSlide) {
      systemPrompt = `Você é um professor especializado em criar perguntas educativas sobre ${query}.

      Crie uma pergunta de múltipla escolha ÚNICA com 4 opções (A, B, C, D) seguindo esta estrutura:
      - Pergunta contextualizada e desafiadora específica para o slide ${slideIndex}
      - 4 opções de resposta bem elaboradas e únicas
      - Uma resposta correta bem fundamentada
      - Explicação detalhada da resposta correta
      - NÃO repita conteúdo de slides anteriores
      - Foque em aspectos específicos do slide ${slideIndex}
      
      Responda APENAS com JSON válido:
      {
        "type": "question",
        "card1": {
          "title": "Pergunta",
          "content": "Texto da pergunta detalhada e contextualizada"
        },
        "card2": {
          "title": "Opções de Resposta",
          "content": "Escolha a resposta que melhor representa seu entendimento:",
          "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
          "correctOption": 0,
          "helpMessage": "Dica para ajudar na resposta",
          "correctAnswer": "Explicação detalhada da resposta correta"
        }
      }`;

      userPrompt = `Crie uma pergunta ÚNICA sobre ${query} para o slide ${slideIndex} (contexto: ${progressContext}). Esta pergunta deve ser específica para este momento da aula e testar conhecimentos específicos do slide ${slideIndex}. NÃO repita conteúdo de slides anteriores. A pergunta deve ter nível de dificuldade apropriado para o progresso da aula (${progressContext}).`;
    } else if (isFinalSlide) {
      systemPrompt = `Você é um professor especializado em criar resumos e conclusões educativas sobre ${query}.

      Crie um slide de conclusão seguindo esta estrutura:
      - Resumo abrangente do conteúdo estudado
      - Conclusões importantes e aplicações práticas
      - Recomendações para continuar aprendendo
      - O slide 8 deve incluir uma imagem diferente relacionada ao tema
      
      Responda APENAS com JSON válido:
      {
        "type": "explanation",
        "card1": {
          "title": "Resumo do Conteúdo",
          "content": "Resumo detalhado dos principais pontos aprendidos"
        },
        "card2": {
          "title": "Conclusão e Próximos Passos",
          "content": "Conclusões importantes e recomendações para continuar aprendendo",
          "imageUrl": "URL de uma imagem diferente relacionada ao tema"
        }
      }`;

      userPrompt = `Crie um slide de conclusão ÚNICO para ${query}. Este é o slide final da aula e deve resumir todo o conteúdo estudado de forma específica e não repetitiva. Inclua uma imagem diferente relacionada ao tema no segundo card.`;
    } else {
      systemPrompt = `Você é um professor especializado em criar conteúdo educativo sobre ${query}.

      Crie um slide explicativo ÚNICO seguindo esta estrutura:
      - Conteúdo principal claro e educativo específico para o slide ${slideIndex}
      - Informações complementares e aplicações práticas únicas
      - Cada card deve ter aproximadamente 100-150 palavras de conteúdo bem estruturado
      - Incluir exemplos práticos únicos e explicações claras específicas
      - Usar linguagem didática e envolvente
      - NÃO repetir conteúdo de slides anteriores
      - Focar em aspectos específicos do slide ${slideIndex}
      
      Responda APENAS com JSON válido:
      {
        "type": "explanation",
        "card1": {
          "title": "Título do Card 1",
          "content": "Conteúdo claro e educativo do primeiro card (100-150 palavras)"
        },
        "card2": {
          "title": "Título do Card 2",
          "content": "Conteúdo claro e educativo do segundo card (100-150 palavras)"
        }
      }`;

      userPrompt = `Crie um slide explicativo ÚNICO sobre ${query} para o slide ${slideIndex} (contexto: ${progressContext}). O conteúdo deve ser específico para este momento da aula, educativo, claro (100-150 palavras por card) e NÃO repetir conteúdo de slides anteriores. Inclua exemplos práticos únicos e explicações concisas específicas para o slide ${slideIndex}. O nível de complexidade deve ser apropriado para o contexto ${progressContext}.`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
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
    let slide;
    try {
      slide = JSON.parse(cleanedResponse);
      console.log(`✅ Slide ${slideIndex} gerado com sucesso`);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      
      // Fallback para slide básico com conteúdo reduzido
      slide = {
        type: slideType,
        card1: {
          title: isQuestionSlide ? 'Pergunta' : 'Conteúdo Principal',
          content: isQuestionSlide 
            ? `Agora vamos testar nosso entendimento com uma pergunta prática sobre ${query}. Esta pergunta foi elaborada para avaliar nossa compreensão dos conceitos estudados e nossa capacidade de aplicá-los em situações práticas.`
            : `Vamos explorar os aspectos fundamentais de ${query} neste slide ${slideIndex}. Este conteúdo foi elaborado para proporcionar uma compreensão sólida dos conceitos estudados através de explicações claras e exemplos práticos.`
        },
        card2: {
          title: isQuestionSlide ? 'Opções de Resposta' : 'Detalhes Adicionais',
          content: isQuestionSlide 
            ? 'Analise cuidadosamente cada opção apresentada abaixo. Considere qual melhor representa uma compreensão sólida dos conceitos que estudamos.'
            : `Este segundo card complementa o conteúdo apresentado no primeiro card, oferecendo informações adicionais e exemplos práticos de ${query}.`,
          ...(isQuestionSlide && {
            options: ['Opção A: Conceito fundamental', 'Opção B: Aplicação prática', 'Opção C: Exemplo específico', 'Opção D: Definição técnica'],
            correctOption: 0,
            helpMessage: 'Pense no que aprendemos sobre os conceitos fundamentais de ${query}.',
            correctAnswer: 'A resposta correta é a Opção A, pois representa uma compreensão sólida dos conceitos fundamentais.'
          })
        }
      };
    }

    return NextResponse.json({
      success: true,
      slide: slide
    });

  } catch (error: any) {
    console.error('❌ Erro na API slide:', error);
    
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
