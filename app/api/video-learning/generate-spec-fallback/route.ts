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

    const { description, videoTitle } = await request.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Descrição do vídeo é obrigatória' }, { status: 400 });
    }

    console.log(`🎥 [VIDEO-LEARNING-FALLBACK] Processing video description with Grok 4 Fast:`, {
      title: videoTitle,
      descriptionLength: description.length
    });

    const prompt = `Você é um pedagogista e designer de produtos com profunda experiência em criar experiências de aprendizado envolventes via aplicações web interativas.

Com base na seguinte descrição de vídeo, crie uma especificação detalhada para uma aplicação web interativa que complemente o conteúdo e reforce as ideias principais:

TÍTULO DO VÍDEO: ${videoTitle || 'Vídeo educacional'}
DESCRIÇÃO: ${description}

A especificação deve ser completa e autocontida. Aqui está um exemplo de especificação:

"Na música, acordes criam expectativas de movimento em direção a certos outros acordes e resolução em direção a um centro tonal. Isso é chamado de harmonia funcional.

Construa uma aplicação web interativa para ajudar um aprendiz a entender o conceito de harmonia funcional.

ESPECIFICAÇÕES:
1. A aplicação deve apresentar um teclado interativo.
2. A aplicação deve mostrar todos os 7 tríades diatônicas que podem ser criadas em uma tonalidade maior.
3. A aplicação deve descrever a função de cada uma das tríades diatônicas.
4. A aplicação deve fornecer uma maneira para os usuários tocarem diferentes acordes em sequência e ver os resultados.

O objetivo da aplicação é melhorar o entendimento através de design simples e lúdico. A especificação não deve ser excessivamente complexa - um desenvolvedor web júnior deve ser capaz de implementá-la em um único arquivo HTML.

Forneça o resultado como um objeto JSON contendo um único campo chamado "spec", cujo valor é a especificação para a aplicação web.`;

    try {
      const result = await callGrok(
        'grok-4-fast-reasoning',
        [],
        prompt,
        'Você é um especialista em design de experiências de aprendizado interativas. Sempre crie especificações claras, práticas e pedagogicamente eficazes para aplicações web educacionais.'
      );

      const text = result.text;

      console.log(`✅ [VIDEO-LEARNING-FALLBACK] Specification generated successfully with Grok 4 Fast`);

      // Tentar extrair JSON da resposta
      let specData;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          specData = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback se não conseguir fazer parse do JSON
          specData = {
            spec: text,
            rawResponse: text
          };
        }
      } catch (parseError) {
        specData = {
          spec: text,
          rawResponse: text
        };
      }

      return NextResponse.json({
        success: true,
        spec: specData.spec,
        videoTitle,
        description,
        timestamp: new Date().toISOString(),
        aiProvider: 'grok-4-fast-reasoning',
        method: 'fallback-description'
      });

    } catch (error: any) {
      console.error('❌ [VIDEO-LEARNING-FALLBACK] Error generating specification:', error);
      return NextResponse.json({
        error: 'Failed to generate specification from description',
        details: error.message
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ [VIDEO-LEARNING-FALLBACK] Processing error:', error);
    return NextResponse.json({
      error: 'Failed to process request',
      details: error.message
    }, { status: 500 });
  }
}
