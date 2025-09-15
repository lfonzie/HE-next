import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Verificar se a API key está disponível
    if (!process.env.XAI_API_KEY) {
      console.warn('⚠️ XAI_API_KEY not configured, using default classification');
      return NextResponse.json({ classification: 'simples' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Classifique a mensagem como "simples" (resposta curta, consulta factual, resumo, cálculos básicos) ou "complexa" (resposta longa, análise, geração estruturada, múltiplos passos). Responda apenas com a label: "simples" ou "complexa".'
            },
            { role: 'user', content: message }
          ],
          max_tokens: 10,
          temperature: 0.1
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Classifier API error: ${response.status} ${response.statusText} - ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const classification = data.choices[0]?.message?.content?.trim().toLowerCase();
      
      // Validate classification
      if (classification === 'simples' || classification === 'complexa') {
        return NextResponse.json({ classification });
      } else {
        // Fallback to simple if classification is unclear
        console.warn(`⚠️ Invalid classification received: "${classification}", defaulting to simple`);
        return NextResponse.json({ classification: 'simples' });
      }

    } catch (error: any) {
      clearTimeout(timeout);
      
      if (error.name === 'AbortError') {
        console.warn('Classifier timeout, defaulting to simple');
        return NextResponse.json({ classification: 'simples' });
      }
      
      console.error('Classifier API error:', error);
      return NextResponse.json({ classification: 'simples' });
    }

  } catch (error: any) {
    console.error('Classifier route error:', error);
    return NextResponse.json({ classification: 'simples' });
  }
}