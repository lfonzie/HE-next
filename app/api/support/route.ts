import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import OpenAI from 'openai';



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }

    // System prompt para suporte
    const systemPrompt = `Você é um assistente de suporte especializado da plataforma HubEdu.ia, uma plataforma educacional completa com IA conversacional.

CONTEXTO DA PLATAFORMA:
- HubEdu.ia é uma plataforma educacional com 9 módulos especializados
- Módulos disponíveis: Professor (assistente de estudos), TI (suporte técnico), RH (recursos humanos), Financeiro (gestão financeira), Coordenação (gestão pedagógica), Atendimento (suporte multicanal), Bem-Estar (suporte socioemocional), Social Media (comunicação digital) e ENEM Interativo (simulador ENEM)
- A plataforma suporta renderização de fórmulas matemáticas com LaTeX
- Sistema de gamificação com pontos, badges e ranking
- Interface responsiva para dispositivos móveis
- Segurança com criptografia SSL e conformidade LGPD

INSTRUÇÕES:
1. Seja sempre prestativo, educado e profissional
2. Forneça respostas claras e detalhadas sobre a plataforma
3. Se não souber algo específico, sugira contatar o suporte técnico
4. Use linguagem simples e acessível
5. Inclua exemplos práticos quando possível
6. Se a pergunta for sobre problemas técnicos, forneça soluções passo a passo
7. Se for sobre funcionalidades, explique como usar cada módulo
8. Sempre mantenha o foco na plataforma educacional HubEdu.ia

Responda em português brasileiro de forma clara e útil.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua pergunta. Tente novamente.';

    return NextResponse.json({ response });

  } catch (error) {
    console.error('Erro na API de suporte:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
