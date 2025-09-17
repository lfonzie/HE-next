import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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

// Função de fallback para classificação local
function classifyComplexityLocal(message: string): 'trivial' | 'simples' | 'complexa' {
  const lowerMessage = message.toLowerCase();
  
  // Palavras-chave que indicam trivialidade
  const trivialKeywords = [
    'oi', 'olá', 'tudo bem', 'td bem', 'bom dia', 'boa tarde', 'boa noite',
    'ok', 'okay', 'sim', 'não', 'nao', 'obrigado', 'obrigada'
  ];
  
  // Verificar se é uma mensagem trivial (muito curta ou saudação simples)
  if ((trivialKeywords.some(keyword => lowerMessage.includes(keyword)) && message.length < 30) || message.length < 15) {
    return 'trivial';
  }
  
  // Verificar se é uma pergunta educacional complexa
  const hasEducationalTerms = /\b(fotossíntese|divisão celular|revolução|guerra|independência|evolução|matemática|geografia|história|ciência|biologia|química|física|literatura|português|inglês|filosofia|sociologia|economia|política)\b/i.test(message);
  const isEducationalQuestion = /\b(como|por que|quando|onde|qual|quais|quem)\b/i.test(message);
  
  if (isEducationalQuestion && hasEducationalTerms && message.length > 30) {
    return 'complexa';
  }
  
  // Default para simples
  return 'simples';
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log(`🔍 [COMPLEXITY CLASSIFIER] Analyzing with OpenAI: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);

    // Verificar se a API key do OpenAI está disponível
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OpenAI API key not found, using local classification');
      const classification = classifyComplexityLocal(message);
      return NextResponse.json({ classification });
    }

    // Usar OpenAI para classificação
    const classification = await classifyComplexityWithOpenAI(message);
    
    console.log(`✅ [COMPLEXITY CLASSIFIER] OpenAI Result: ${classification}`);
    
    return NextResponse.json({ classification });

  } catch (error: any) {
    console.error('Classifier route error:', error);
    return NextResponse.json({ classification: 'simples' }); // Default para simples em caso de erro
  }
}