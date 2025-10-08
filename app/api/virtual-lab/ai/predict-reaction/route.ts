import { NextRequest, NextResponse } from 'next/server';
import { callGrok } from '@/lib/providers/grok';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.GROK_API_KEY) {
      return NextResponse.json({
        error: 'Grok API key not configured'
      }, { status: 500 });
    }

    const { reactants, conditions, experimentType } = await request.json();

    if (!reactants || !Array.isArray(reactants) || reactants.length === 0) {
      return NextResponse.json({ error: 'Reactants are required' }, { status: 400 });
    }

    console.log(`🧪 [VIRTUAL-LAB] Predicting reaction with Grok 4 Fast:`, {
      reactants: reactants.map(r => r.compound),
      conditions,
      experimentType
    });

    // Preparar prompt para previsão de reação
    const reactantsList = reactants.map(r => `${r.compound} (${r.state || 'aqueous'})`).join(' + ');
    
    const prompt = `Como especialista em química, analise a seguinte reação proposta e forneça uma previsão detalhada:

REAGENTES: ${reactantsList}
CONDIÇÕES: ${conditions || 'Temperatura ambiente, pressão atmosférica'}
TIPO DE EXPERIMENTO: ${experimentType || 'Reação química geral'}

Por favor, forneça:

1. **EQUAÇÃO QUÍMICA BALANCEADA**: Mostre a reação completa com coeficientes
2. **PRODUTOS ESPERADOS**: Liste todos os produtos possíveis com seus estados físicos
3. **TIPO DE REAÇÃO**: Classifique o tipo (neutralização, precipitação, oxidação-redução, etc.)
4. **EFEITOS VISUAIS**: Descreva o que o estudante verá (mudança de cor, formação de precipitado, liberação de gás, etc.)
5. **CONDIÇÕES DE SEGURANÇA**: Alertas importantes para o experimento
6. **EXPLICAÇÃO CIENTÍFICA**: Por que essa reação acontece?
7. **VARIAÇÕES**: Sugestões para modificar o experimento

Responda em formato JSON estruturado para facilitar a integração com o laboratório virtual.`;

    try {
      const result = await callGrok(
        'grok-4-fast-reasoning',
        [],
        prompt,
        'Você é um especialista em química educacional com vasta experiência em laboratórios virtuais. Sempre forneça previsões precisas e seguras para experimentos químicos, com foco na experiência educacional do estudante.'
      );

      const text = result.text;

      console.log(`✅ [VIRTUAL-LAB] Reaction prediction generated successfully with Grok 4 Fast`);

      // Tentar extrair JSON da resposta
      let predictionData;
      try {
        // Procurar por JSON na resposta
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          predictionData = JSON.parse(jsonMatch[0]);
        } else {
          // Se não encontrar JSON, criar estrutura baseada no texto
          predictionData = {
            equation: 'Reação não identificada',
            products: [],
            reactionType: 'Desconhecida',
            visualEffects: ['Sem efeitos visuais identificados'],
            safetyWarnings: ['Sempre use equipamentos de proteção'],
            scientificExplanation: text,
            variations: [],
            rawResponse: text
          };
        }
      } catch (parseError) {
        // Fallback se não conseguir fazer parse do JSON
        predictionData = {
          equation: 'Reação não identificada',
          products: [],
          reactionType: 'Desconhecida',
          visualEffects: ['Sem efeitos visuais identificados'],
          safetyWarnings: ['Sempre use equipamentos de proteção'],
          scientificExplanation: text,
          variations: [],
          rawResponse: text
        };
      }

      return NextResponse.json({
        success: true,
        prediction: predictionData,
        reactants,
        conditions,
        experimentType,
        timestamp: new Date().toISOString(),
        aiProvider: 'grok-4-fast-reasoning'
      });

    } catch (error: any) {
      console.error('❌ [VIRTUAL-LAB] Error generating reaction prediction:', error);
      return NextResponse.json({
        error: 'Failed to generate reaction prediction',
        details: error.message
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ [VIRTUAL-LAB] Processing error:', error);
    return NextResponse.json({
      error: 'Failed to process request',
      details: error.message
    }, { status: 500 });
  }
}
