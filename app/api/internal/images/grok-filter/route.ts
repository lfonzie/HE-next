import { NextRequest, NextResponse } from 'next/server';

interface GrokImageAnalysisRequest {
  images: Array<{
    id: string;
    title: string;
    description: string;
    url: string;
    provider: string;
  }>;
  topic: string;
  context?: string;
}

interface GrokImageAnalysisResponse {
  success: boolean;
  filteredImages: Array<{
    id: string;
    title: string;
    description: string;
    url: string;
    provider: string;
    relevanceScore: number;
    reasoning: string;
  }>;
  analysis: {
    totalAnalyzed: number;
    relevantFound: number;
    irrelevantRejected: number;
    processingTime: number;
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: GrokImageAnalysisRequest = await request.json();
    const { images, topic, context = 'aula_educacional' } = body;

    console.log(`🤖 Grok 4 Fast iniciando análise de ${images.length} imagens para: "${topic}"`);

    // Preparar prompt para análise com Grok
    const analysisPrompt = `
Você é um especialista em análise de imagens educacionais. Sua tarefa é analisar uma lista de imagens e determinar quais são relevantes para o tema educacional especificado.

TEMA: "${topic}"
CONTEXTO: ${context}

IMAGENS PARA ANALISAR:
${images.map((img, index) => `
${index + 1}. ID: ${img.id}
   Título: "${img.title}"
   Descrição: "${img.description}"
   Provedor: ${img.provider}
`).join('')}

CRITÉRIOS DE RELEVÂNCIA:
1. A imagem deve estar diretamente relacionada ao tema educacional
2. Deve ser apropriada para uso em material educacional
3. Deve ter valor pedagógico claro
4. Deve ser visualmente clara e informativa

CRITÉRIOS DE REJEIÇÃO:
1. Imagens de lugares geográficos irrelevantes (ex: Lake Como para "Como funciona a eletricidade")
2. Placas, sinais ou letreiros com apenas texto
3. Conteúdo turístico ou comercial não educacional
4. Imagens genéricas sem contexto específico
5. Conteúdo não relacionado ao tema

INSTRUÇÕES:
- Analise cada imagem individualmente
- Dê uma pontuação de 0-100 para relevância
- Explique brevemente sua decisão
- Retorne APENAS imagens com pontuação >= 70
- Seja rigoroso na filtragem

FORMATO DE RESPOSTA (JSON):
{
  "analysis": [
    {
      "id": "imagem_id",
      "relevanceScore": 85,
      "reasoning": "Imagem mostra componentes elétricos específicos relevantes para o tema",
      "accepted": true
    },
    {
      "id": "imagem_id", 
      "relevanceScore": 25,
      "reasoning": "Imagem de lugar geográfico sem relação com eletricidade",
      "accepted": false
    }
  ]
}

Analise todas as imagens e retorne apenas o JSON válido, sem texto adicional.
`;

    // Chamar Grok 4 Fast
    const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-4-fast-reasoning',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em análise de imagens educacionais. Sempre retorne JSON válido conforme solicitado.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    if (!grokResponse.ok) {
      throw new Error(`Grok API error: ${grokResponse.status}`);
    }

    const grokData = await grokResponse.json();
    const analysisText = grokData.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error('No analysis content received from Grok');
    }

    console.log(`🤖 Grok análise recebida: ${analysisText.length} caracteres`);

    // Extrair JSON da resposta
    let analysisResult;
    try {
      // Tentar encontrar JSON na resposta
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in Grok response');
      }
    } catch (parseError) {
      console.error('❌ Erro ao parsear resposta do Grok:', parseError);
      throw new Error('Failed to parse Grok analysis response');
    }

    // Processar resultados da análise
    const filteredImages = [];
    let relevantFound = 0;
    let irrelevantRejected = 0;

    for (const item of analysisResult.analysis || []) {
      const originalImage = images.find(img => img.id === item.id);
      if (!originalImage) continue;

      if (item.accepted && item.relevanceScore >= 70) {
        filteredImages.push({
          id: originalImage.id,
          title: originalImage.title,
          description: originalImage.description,
          url: originalImage.url,
          provider: originalImage.provider,
          relevanceScore: item.relevanceScore,
          reasoning: item.reasoning
        });
        relevantFound++;
        console.log(`✅ Imagem aceita: "${originalImage.title}" (Score: ${item.relevanceScore}) - ${item.reasoning}`);
      } else {
        irrelevantRejected++;
        console.log(`❌ Imagem rejeitada: "${originalImage.title}" (Score: ${item.relevanceScore}) - ${item.reasoning}`);
      }
    }

    const processingTime = Date.now() - startTime;

    const response: GrokImageAnalysisResponse = {
      success: true,
      filteredImages,
      analysis: {
        totalAnalyzed: images.length,
        relevantFound,
        irrelevantRejected,
        processingTime
      }
    };

    console.log(`🤖 Grok análise concluída: ${relevantFound}/${images.length} imagens relevantes encontradas em ${processingTime}ms`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Erro na análise Grok:', error);
    
    const processingTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      filteredImages: [],
      analysis: {
        totalAnalyzed: 0,
        relevantFound: 0,
        irrelevantRejected: 0,
        processingTime
      }
    }, { status: 500 });
  }
}
