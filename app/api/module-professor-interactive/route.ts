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

    // Gerar aula interativa usando OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um professor especializado em criar aulas interativas e sequenciais. 
          Crie uma aula completa com os seguintes elementos:
          
          1. Título claro e atrativo
          2. Introdução explicativa
          3. Passos sequenciais (explicação, exemplo, pergunta)
          4. Teste final
          5. Resumo dos pontos principais
          6. Próximos passos sugeridos
          
          Formato de resposta em JSON:
          {
            "title": "Título da Aula",
            "subject": "Disciplina",
            "introduction": "Introdução explicativa",
            "steps": [
              {
                "type": "explanation|question|example|feedback",
                "content": "Conteúdo do passo",
                "question": "Pergunta (se aplicável)",
                "options": ["A", "B", "C", "D"],
                "correctOption": 0
              }
            ],
            "finalTest": {
              "question": "Pergunta final",
              "options": ["A", "B", "C", "D"],
              "correctOption": 0
            },
            "summary": "Resumo da aula",
            "nextSteps": ["Próximo passo 1", "Próximo passo 2"]
          }`
        },
        {
          role: "user",
          content: `Crie uma aula interativa sobre: ${query}. Disciplina: ${subject || 'Geral'}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('Resposta vazia da OpenAI');
    }

    // Tentar fazer parse do JSON
    let lesson;
    try {
      lesson = JSON.parse(responseText);
    } catch (parseError) {
      // Se não conseguir fazer parse, criar uma estrutura básica
      lesson = {
        title: `Aula sobre ${query}`,
        subject: subject || 'Geral',
        introduction: `Vamos aprender sobre ${query} de forma interativa e sequencial.`,
        steps: [
          {
            type: 'explanation',
            content: `Vamos começar entendendo o conceito de ${query}.`,
            question: `O que você já sabe sobre ${query}?`,
            options: ['Muito', 'Pouco', 'Nada', 'Quero aprender'],
            correctOption: 0
          }
        ],
        finalTest: {
          question: `Qual é a importância de ${query}?`,
          options: ['Muito importante', 'Importante', 'Pouco importante', 'Não sei'],
          correctOption: 0
        },
        summary: `Nesta aula aprendemos sobre ${query} e sua importância.`,
        nextSteps: ['Praticar mais', 'Aprofundar o tema', 'Aplicar na prática']
      };
    }

    return NextResponse.json({
      success: true,
      lesson: lesson
    });

  } catch (error: any) {
    console.error('Erro na API module-professor-interactive:', error);
    
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

