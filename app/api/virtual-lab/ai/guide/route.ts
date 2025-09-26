import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { experimentId, question, context, parameters } = body;

    // Simular resposta da IA baseada no experimento
    const aiResponses = {
      'chemical-reaction': {
        'explicar': {
          content: 'Este experimento simula reações químicas reais. Você pode misturar diferentes compostos e observar as reações resultantes. Cada reação tem propriedades específicas como mudança de cor, liberação de gases ou formação de precipitados. A IA analisa os compostos selecionados e prevê o resultado da reação.',
          suggestions: [
            'Quais compostos posso misturar?',
            'Como interpretar os resultados?',
            'O que significam as mudanças de cor?',
            'Explique a equação química'
          ]
        },
        'parâmetros': {
          content: 'Você pode ajustar a temperatura (0-100°C) e concentração (0-100%). Temperaturas mais altas aceleram as reações, enquanto concentrações maiores podem alterar os resultados. A velocidade da reação também pode ser controlada para observar melhor os efeitos.',
          suggestions: [
            'Qual temperatura é ideal?',
            'Como a concentração afeta a reação?',
            'O que acontece em temperaturas extremas?',
            'Como controlar a velocidade?'
          ]
        },
        'resultados': {
          content: 'Os resultados mostram os produtos da reação, mudanças visuais e propriedades físicas. Observe as cores, estados físicos e qualquer liberação de gases. A IA explica o que cada mudança significa cientificamente.',
          suggestions: [
            'O que significa a mudança de cor?',
            'Por que se formam gases?',
            'Como interpretar os produtos?',
            'Quais são as propriedades dos compostos?'
          ]
        },
        'dica': {
          content: 'Comece com uma reação simples como HCl + NaOH. Ajuste a temperatura para 25°C e concentração para 50% para ver uma reação de neutralização clássica. Observe como a cor muda e os produtos se formam.',
          suggestions: [
            'Mostre-me outra reação',
            'Explique a neutralização',
            'Quais outras reações posso fazer?',
            'Como funciona a previsão da IA?'
          ]
        }
      },
      'pendulum': {
        'explicar': {
          content: 'Este experimento simula um pêndulo simples. O movimento é governado pela gravidade e segue um padrão harmônico. O período depende apenas do comprimento e da gravidade, não da massa. A IA explica os conceitos físicos em tempo real.',
          suggestions: [
            'Como funciona o movimento harmônico?',
            'Por que a massa não afeta o período?',
            'O que é amortecimento?',
            'Como calcular o período?'
          ]
        },
        'parâmetros': {
          content: 'Ajuste o comprimento (50-200cm), ângulo inicial (5-60°), massa (0.5-5kg), gravidade (1-20m/s²) e amortecimento (0-0.1). Cada parâmetro afeta o movimento de forma diferente.',
          suggestions: [
            'Qual comprimento é ideal?',
            'Como o ângulo afeta o movimento?',
            'O que acontece com gravidade zero?',
            'Como o amortecimento funciona?'
          ]
        },
        'resultados': {
          content: 'Observe o período, frequência, velocidade angular e trajetória. O período é calculado por T = 2π√(L/g). A IA analisa os dados e explica o que significam.',
          suggestions: [
            'Como interpretar o período?',
            'O que é frequência angular?',
            'Como a energia se conserva?',
            'Por que a amplitude diminui?'
          ]
        },
        'dica': {
          content: 'Comece com comprimento 100cm, ângulo 30° e gravidade 9.81m/s². Observe como o período muda quando você altera o comprimento. Experimente diferentes valores de amortecimento.',
          suggestions: [
            'Mostre-me outro exemplo',
            'Explique a fórmula do período',
            'Como funciona a conservação de energia?',
            'Quais são as aplicações práticas?'
          ]
        }
      },
      'bouncing-ball': {
        'explicar': {
          content: 'Este experimento simula uma bola saltitante. Explore conceitos de gravidade, elasticidade e resistência do ar. O coeficiente de restituição determina quanta energia é perdida a cada quique.',
          suggestions: [
            'Como funciona a elasticidade?',
            'O que é coeficiente de restituição?',
            'Como a resistência do ar afeta?',
            'Explique a conservação de energia'
          ]
        },
        'parâmetros': {
          content: 'Ajuste o coeficiente de restituição (0-1), gravidade (1-20m/s²), altura inicial (100-350px) e resistência do ar (0-0.1). Cada parâmetro afeta o comportamento da bola.',
          suggestions: [
            'Qual coeficiente é ideal?',
            'Como a gravidade afeta?',
            'O que acontece com restituição 0?',
            'Como funciona a resistência do ar?'
          ]
        },
        'resultados': {
          content: 'Observe o número de quiques, altura máxima, velocidade e tempo total. Uma restituição de 1 significa quique perfeito, 0 significa que a bola para imediatamente.',
          suggestions: [
            'Como interpretar os quiques?',
            'Por que a altura diminui?',
            'Como calcular a velocidade?',
            'O que significa o tempo total?'
          ]
        },
        'dica': {
          content: 'Comece com restituição 0.8, gravidade 9.81m/s² e altura 300px. Experimente diferentes valores de restituição para ver o efeito na duração dos quiques.',
          suggestions: [
            'Mostre-me outro exemplo',
            'Explique a física dos quiques',
            'Como funciona a energia cinética?',
            'Quais são as aplicações reais?'
          ]
        }
      },
      'color-mixing': {
        'explicar': {
          content: 'Este experimento explora a teoria das cores. Misture cores primárias (RGB) ou secundárias (CMYK) para criar novas cores. Cada modelo tem suas próprias propriedades e aplicações.',
          suggestions: [
            'Como funciona o RGB?',
            'Qual a diferença entre RGB e CMYK?',
            'O que é HSL?',
            'Como as cores se misturam?'
          ]
        },
        'parâmetros': {
          content: 'Ajuste os valores RGB (0-255) ou CMYK (0-100%). RGB é aditivo (usado em telas), CMYK é subtrativo (usado em impressão).',
          suggestions: [
            'Qual modelo usar?',
            'Como converter entre modelos?',
            'O que são cores primárias?',
            'Como funciona a saturação?'
          ]
        },
        'resultados': {
          content: 'Veja a cor resultante em RGB, HSL e HEX. Observe como diferentes combinações criam cores únicas e como a luminosidade afeta a percepção.',
          suggestions: [
            'Como interpretar o HSL?',
            'O que é luminosidade?',
            'Como funciona o contraste?',
            'Quais são as cores complementares?'
          ]
        },
        'dica': {
          content: 'Comece misturando vermelho (255,0,0) com verde (0,255,0) para criar amarelo. Experimente diferentes proporções para ver as variações de cor.',
          suggestions: [
            'Mostre-me outra mistura',
            'Explique a teoria das cores',
            'Como funciona a percepção?',
            'Quais são as aplicações práticas?'
          ]
        }
      }
    };

    // Detectar tipo de pergunta
    const questionLower = question.toLowerCase();
    let responseKey = 'explicar';
    
    if (questionLower.includes('parâmetro') || questionLower.includes('ajustar') || questionLower.includes('configurar')) {
      responseKey = 'parâmetros';
    } else if (questionLower.includes('resultado') || questionLower.includes('significa') || questionLower.includes('interpretar')) {
      responseKey = 'resultados';
    } else if (questionLower.includes('dica') || questionLower.includes('começar') || questionLower.includes('sugestão')) {
      responseKey = 'dica';
    }

    const experimentResponses = aiResponses[experimentId as keyof typeof aiResponses] || aiResponses['chemical-reaction'];
    const response = experimentResponses[responseKey as keyof typeof experimentResponses] || experimentResponses.explicar;

    return NextResponse.json({
      success: true,
      data: {
        response: response.content,
        suggestions: response.suggestions,
        experimentId,
        context: {
          parameters,
          question,
          responseType: responseKey
        },
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Error in AI guide:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}
