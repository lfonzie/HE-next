import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { classifyComplexity, classifyComplexityLocal } from '@/lib/complexity-classifier';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Função para classificar complexidade usando OpenAI
async function classifyComplexityWithOpenAI(message: string): Promise<'trivial' | 'simples' | 'complexa'> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      max_tokens: 15,
      messages: [
        {
          role: "system",
          content: `Você é um classificador de complexidade de mensagens educacionais. 
          
Classifique a mensagem como:
- "trivial": para saudações simples, cumprimentos básicos, mensagens muito curtas (menos de 20 caracteres)
- "simples": para perguntas básicas, definições simples, consultas rápidas, dúvidas diretas
- "complexa": para perguntas que requerem explicações detalhadas, análises, comparações, processos complexos, tópicos acadêmicos avançados

Responda apenas com "trivial", "simples" ou "complexa".`
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    const classification = completion.choices[0]?.message?.content?.trim().toLowerCase();
    
    if (classification === 'trivial' || classification === 'simples' || classification === 'complexa') {
      return classification;
    } else {
      console.warn(`⚠️ OpenAI classification unclear: "${classification}", defaulting to complexa`);
      return 'complexa';
    }
  } catch (error) {
    console.error('OpenAI classification error:', error);
    // Fallback para classificação local em caso de erro
    return classifyComplexityLocal(message);
  }
}


export async function POST(request: NextRequest) {
  try {
    const { message, module } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Usar função utilitária para classificação (com cache integrado)
    const complexityResult = classifyComplexity(message, module);
    
    console.log(`⚡ [COMPLEXITY CLASSIFIER] Classification: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}" -> ${complexityResult.classification} (${complexityResult.method}${complexityResult.cached ? ', cached' : ''})`);
    
    return NextResponse.json({ 
      classification: complexityResult.classification,
      cached: complexityResult.cached,
      method: complexityResult.method,
      timestamp: Date.now()
    });

  } catch (error: any) {
    console.error('Classifier route error:', error);
    
    // Em caso de erro, usar classificação local como fallback
    const fallbackClassification = classifyComplexityLocal(message, module);
    
    return NextResponse.json({ 
      classification: fallbackClassification,
      cached: false,
      method: 'fallback',
      timestamp: Date.now()
    });
  }
}