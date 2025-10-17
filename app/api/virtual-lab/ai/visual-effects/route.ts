import { NextRequest, NextResponse } from 'next/server';
import { callGrok } from '@/lib/providers/grok';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiCache, cacheUtils } from '@/lib/cache/aiCache';

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

    const { reaction, step, parameters } = await request.json();

    if (!reaction) {
      return NextResponse.json({ error: 'Reaction data is required' }, { status: 400 });
    }

    // Tentar obter do cache primeiro
    const cacheKey = cacheUtils.generateVisualEffectsKey(reaction, step, parameters);
    const cachedResult = await aiCache.getVisualEffects(reaction, step, parameters);
    
    if (cachedResult) {
      console.log(`✅ [VIRTUAL-LAB] Visual effects retrieved from cache`);
      return NextResponse.json({
        success: true,
        visualEffects: cachedResult,
        reaction,
        step,
        parameters,
        timestamp: new Date().toISOString(),
        aiProvider: 'grok-4-fast-reasoning',
        cached: true
      });
    }

    console.log(`🎨 [VIRTUAL-LAB] Generating visual effects with Grok 4 Fast:`, {
      reactionType: reaction.type,
      step,
      parameters
    });

    const prompt = `Como especialista em simulações de laboratório virtual, gere efeitos visuais realistas para esta reação química:

REAÇÃO: ${reaction.equation || 'Reação química'}
TIPO: ${reaction.type || 'Desconhecido'}
ETAPA: ${step || 'Início'}
PARÂMETROS: ${JSON.stringify(parameters || {})}

Gere uma descrição detalhada dos efeitos visuais que devem aparecer no laboratório virtual:

1. **CORES**: Mudanças de cor dos reagentes e produtos
2. **PARTÍCULAS**: Formação de precipitados, bolhas, cristais
3. **MOVIMENTO**: Agitação, turbulência, fluxo de líquidos
4. **TEMPERATURA**: Indicadores visuais de mudança de temperatura
5. **GASES**: Liberação de vapores, bolhas de gás
6. **ANIMAÇÕES**: Sequência temporal dos efeitos
7. **INTENSIDADE**: Duração e intensidade de cada efeito
8. **EQUIPAMENTOS**: Estado visual dos equipamentos (béqueres, tubos de ensaio, etc.)

Responda em formato JSON estruturado para facilitar a implementação visual.`;

    try {
      const result = await callGrok(
        'grok-4-fast-reasoning',
        [],
        prompt,
        'Você é um especialista em design de laboratórios virtuais e efeitos visuais científicos. Sempre forneça descrições detalhadas e realistas dos efeitos que devem aparecer durante experimentos químicos.'
      );

      const text = result.text;

      console.log(`✅ [VIRTUAL-LAB] Visual effects generated successfully with Grok 4 Fast`);

      // Tentar extrair JSON da resposta
      let visualEffects;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          visualEffects = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback se não conseguir fazer parse do JSON
          visualEffects = {
            colors: ['Sem mudança de cor identificada'],
            particles: ['Sem partículas identificadas'],
            movement: ['Sem movimento identificado'],
            temperature: 'Sem mudança de temperatura',
            gases: ['Sem gases identificados'],
            animations: ['Animação básica'],
            intensity: 'Média',
            equipment: ['Estado normal dos equipamentos'],
            rawResponse: text
          };
        }
      } catch (parseError) {
        visualEffects = {
          colors: ['Sem mudança de cor identificada'],
          particles: ['Sem partículas identificadas'],
          movement: ['Sem movimento identificado'],
          temperature: 'Sem mudança de temperatura',
          gases: ['Sem gases identificados'],
          animations: ['Animação básica'],
          intensity: 'Média',
          equipment: ['Estado normal dos equipamentos'],
          rawResponse: text
        };
      }

      // Salvar no cache
      await aiCache.setVisualEffects(reaction, step, parameters, visualEffects, 3600);

      return NextResponse.json({
        success: true,
        visualEffects,
        reaction,
        step,
        parameters,
        timestamp: new Date().toISOString(),
        aiProvider: 'grok-4-fast-reasoning',
        cached: false
      });

    } catch (error: any) {
      console.error('❌ [VIRTUAL-LAB] Error generating visual effects:', error);
      return NextResponse.json({
        error: 'Failed to generate visual effects',
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
