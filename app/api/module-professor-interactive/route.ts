import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AutoImageService } from '@/lib/autoImageService';

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

    console.log('🎓 Gerando aula para:', query, 'Subject:', subject);
    console.log('🔑 OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);

    // Buscar imagem automaticamente para os slides
    console.log('🖼️ Buscando imagem automática para o tema...');
    const imageResult = await AutoImageService.getImagesForSlides(query, subject);
    
    if (imageResult.introImage) {
      console.log('✅ Imagem encontrada:', imageResult.introImage.id, 'Tema:', imageResult.theme);
    } else {
      console.log('⚠️ Nenhuma imagem encontrada para o tema');
    }

    // Gerar aula interativa usando OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um professor especializado em criar aulas interativas seguindo o padrão HubEdu de 8 slides.

          ESTRUTURA OBRIGATÓRIA DE 8 SLIDES COM 2 CARDS CADA:
          Slide 1: Introdução ao tópico (CARD 1: Texto explicativo detalhado | CARD 2: Imagem)
          Slide 2: Conceitos fundamentais (CARD 1: Conceito principal extenso | CARD 2: Definições importantes e termos-chave)
          Slide 3: Desenvolvimento do conteúdo (CARD 1: Teoria aprofundada | CARD 2: Aplicações práticas detalhadas)
          Slide 4: PERGUNTA DE VERIFICAÇÃO (CARD 1: Pergunta contextualizada | CARD 2: Opções de resposta)
          Slide 5: Aplicações práticas (CARD 1: Exemplos reais extensos | CARD 2: Casos de uso detalhados)
          Slide 6: Exemplos e exercícios (CARD 1: Exercício prático completo | CARD 2: Solução comentada detalhada)
          Slide 7: ATIVIDADE COM ALUNOS (CARD 1: Atividade prática simulando uso da plataforma por professor | CARD 2: Opções de resposta sobre estratégia pedagógica)
          Slide 8: Resumo e conclusão (CARD 1: Resumo completo do conteúdo | CARD 2: Imagem de conclusão)
          
          REGRAS IMPORTANTES PARA CONTEÚDO:
          - SEMPRE exatamente 8 slides
          - CADA SLIDE deve ter 2 cards lado a lado
          - Slides 4 e 7 DEVEM ser perguntas de múltipla escolha
          - Slides 1 e 8 devem incluir imagens no segundo card
          - Cada pergunta deve ter 4 opções (A, B, C, D)
          - CONTEÚDO DEVE SER DETALHADO E EDUCATIVO
          - Cada card deve ter aproximadamente 150-200 palavras de conteúdo bem estruturado
          - Incluir explicações claras, exemplos práticos relevantes e aplicações reais
          - Usar linguagem didática e envolvente
          - Incluir explicação clara da resposta correta
          
          IMPORTANTE: Responda APENAS com JSON válido, sem formatação markdown. Formato:
          {
            "title": "Título da Aula",
            "subject": "Disciplina",
            "introduction": "Introdução explicativa",
            "themeImage": "URL da imagem para slides 1 e 8",
            "steps": [
              {
                "type": "explanation",
                "card1": {
                  "title": "Título do Card 1",
                  "content": "Conteúdo detalhado do primeiro card"
                },
                "card2": {
                  "title": "Título do Card 2", 
                  "content": "Conteúdo detalhado do segundo card",
                  "imageUrl": "URL da imagem (apenas para slides 1 e 8)"
                }
              },
              {
                "type": "question",
                "card1": {
                  "title": "Pergunta",
                  "content": "Texto da pergunta detalhada"
                },
                "card2": {
                  "title": "Opções de Resposta",
                  "content": "Opções de resposta",
                  "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
                  "correctOption": 0,
                  "helpMessage": "Dica para ajudar",
                  "correctAnswer": "Explicação da resposta correta"
                }
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
          content: `Crie uma aula interativa sobre: ${query}. Disciplina: ${subject || 'Geral'}
          
          ${imageResult.introImage ? `
          IMAGEM DISPONÍVEL:
          - Tema detectado: ${imageResult.theme}
          - URL da imagem: ${imageResult.introImage.urls.regular}
          - Descrição: ${imageResult.introImage.alt_description || 'Imagem relacionada ao tema'}
          - Autor: ${imageResult.introImage.user.name}
          
          IMPORTANTE: Inclua esta imagem nos slides 1 e 8 usando o campo "imageUrl" quando disponível.
          ` : 'Nenhuma imagem específica encontrada para este tema.'}`
        }
      ],
      temperature: 0.7,
      max_tokens: 6000,
    });

    const responseText = completion.choices[0]?.message?.content;
    console.log('📝 OpenAI Response:', responseText?.substring(0, 200) + '...');
    
    if (!responseText) {
      throw new Error('Resposta vazia da OpenAI');
    }

    // Limpar possível formatação markdown
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Tentar fazer parse do JSON
    let lesson;
    try {
      lesson = JSON.parse(cleanedResponse);
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.error('Raw response:', responseText);
      
      // Se não conseguir fazer parse, criar uma estrutura básica melhorada com 2 cards
      lesson = {
        title: `Aula Interativa: ${query}`,
        subject: subject || 'Geral',
        introduction: `Vamos explorar o tema "${query}" de forma interativa e prática!`,
        steps: [
          {
            type: 'explanation',
            card1: {
              title: 'Introdução ao Tópico',
              content: `Vamos começar explorando os conceitos fundamentais de ${query}. Este tópico é importante porque nos ajuda a compreender melhor o mundo ao nosso redor e desenvolve nosso pensamento crítico. 

${query} combina teoria e prática de forma única, oferecendo insights valiosos sobre como diferentes elementos interagem. Ao estudarmos este tema, não apenas adquirimos conhecimento factual, mas também desenvolvemos habilidades analíticas essenciais.

A importância de ${query} transcende os limites acadêmicos, influenciando nossa capacidade de resolver problemas complexos e tomar decisões informadas. Este conhecimento nos capacita a entender fenômenos que envolvem múltiplas camadas de complexidade.`
            },
            card2: {
              title: 'Por que Estudar Este Tema?',
              content: `Este tema é essencial para desenvolver habilidades importantes como análise crítica, síntese de informações e aplicação prática do conhecimento. Vamos explorar suas principais características e aplicações.

A relevância de ${query} no mundo contemporâneo é significativa. Este campo oferece ferramentas poderosas para compreender e navegar pela complexidade do mundo moderno. Através do estudo de ${query}, desenvolvemos competências técnicas e habilidades transferíveis.

Além disso, ${query} nos proporciona uma base sólida para desenvolver pensamento crítico, capacidade de análise e competências para resolver problemas de forma criativa. Estas habilidades são valorizadas em qualquer área de atuação.`,
              imageUrl: imageResult.introImage?.urls.regular
            }
          },
          {
            type: 'explanation',
            card1: {
              title: 'Conceitos Fundamentais',
              content: `Os conceitos básicos de ${query} formam a base de todo o conhecimento nesta área. Estes fundamentos incluem definições precisas, princípios fundamentais e as relações entre diferentes componentes do sistema.

É crucial compreender estes fundamentos antes de avançar para conceitos mais complexos. Estes conceitos básicos funcionam como uma base sólida sobre a qual construímos nosso entendimento posterior.

Os princípios fundamentais de ${query} são universais e aplicam-se em diferentes contextos. Eles nos fornecem uma estrutura conceitual robusta para analisar e explicar fenômenos relacionados ao tema.`
            },
            card2: {
              title: 'Definições Importantes',
              content: `Vamos definir os termos-chave e estabelecer uma linguagem comum para nosso estudo. Estas definições nos ajudarão a comunicar ideias de forma precisa e clara.

As definições são fundamentais para garantir que todos compreendam os conceitos da mesma forma. Elas servem como pontos de referência claros que nos permitem construir conhecimento de forma consistente.

Estas definições abrangem diferentes aspectos do tema, desde conceitos básicos até termos mais especializados. Esta base terminológica sólida é essencial para o aprendizado eficaz.`
            }
          },
          {
            type: 'explanation',
            card1: {
              title: 'Desenvolvimento do Conteúdo',
              content: `Agora vamos aprofundar nosso conhecimento sobre ${query}, explorando aspectos mais complexos e suas interconexões com outros temas relacionados. Este aprofundamento nos permitirá compreender como os conceitos se relacionam em sistemas mais amplos.

O desenvolvimento do conteúdo de ${query} envolve a exploração de múltiplas camadas de complexidade, desde os fundamentos básicos até as aplicações mais avançadas. Esta progressão gradual nos permite construir uma compreensão sólida e abrangente.

Durante este processo, vamos descobrir como ${query} se conecta com outras áreas de conhecimento, criando uma rede rica de interconexões que enriquece nossa compreensão do tema.`
            },
            card2: {
              title: 'Aplicações Práticas',
              content: `Vamos explorar como ${query} é aplicado em diferentes contextos e situações reais, desde aplicações cotidianas até casos especializados. Esta exploração nos ajuda a entender a relevância e versatilidade do tema.

As aplicações práticas demonstram como o conhecimento teórico se traduz em soluções concretas para problemas reais. Estas aplicações abrangem diferentes setores, mostrando a universalidade do tema.

Cada aplicação será analisada explorando os desafios enfrentados, as soluções implementadas e os resultados obtidos. Esta análise nos permite entender como aplicar este conhecimento em situações similares.`
            }
          },
          {
            type: 'question',
            card1: {
              title: 'Pergunta de Verificação',
              content: `Agora vamos testar nosso entendimento com uma pergunta prática sobre ${query}. Esta pergunta foi elaborada para avaliar nossa compreensão dos conceitos fundamentais e nossa capacidade de aplicá-los em situações práticas.

A pergunta envolve a análise de um cenário específico onde os conceitos de ${query} se aplicam de forma concreta. Este tipo de avaliação nos ajuda a verificar se conseguimos compreender os princípios envolvidos e aplicá-los de forma eficaz.

Esta verificação é essencial para identificar áreas onde nosso entendimento está sólido e áreas onde precisamos de mais estudo e prática.`
            },
            card2: {
              title: 'Opções de Resposta',
              content: 'Analise cuidadosamente cada opção apresentada abaixo. Considere qual melhor representa uma compreensão sólida dos conceitos estudados:',
              options: ['Opção A: Conceito fundamental bem compreendido', 'Opção B: Aplicação prática adequada', 'Opção C: Exemplo específico correto', 'Opção D: Definição técnica precisa'],
              correctOption: 0,
              helpMessage: 'Pense no que aprendemos sobre os conceitos fundamentais de ${query}. Considere como estes conceitos se aplicam no contexto da pergunta.',
              correctAnswer: 'A resposta correta é a Opção A, pois representa uma compreensão sólida dos conceitos fundamentais de ${query} e sua aplicação correta no contexto apresentado.'
            }
          },
          {
            type: 'explanation',
            card1: {
              title: 'Exemplos Reais',
              content: `Vamos explorar exemplos reais que demonstram como ${query} é aplicado de forma concreta em diferentes áreas profissionais e contextos organizacionais. Estes exemplos mostram a aplicação prática e os resultados tangíveis de ${query}.

Cada exemplo será apresentado com contexto completo, incluindo o problema enfrentado, a solução implementada baseada em ${query}, os recursos utilizados e os resultados obtidos. Esta apresentação nos permite entender como foi feito e por que funcionou.

Estes exemplos abrangem diferentes setores e contextos, desde organizações pequenas até grandes corporações. Esta diversidade nos ajuda a entender a versatilidade de ${query} em diferentes situações.`
            },
            card2: {
              title: 'Casos de Uso',
              content: `Estes casos de uso demonstram a versatilidade e importância de ${query} em diferentes situações práticas. Cada caso representa uma situação específica onde ${query} foi aplicado com sucesso.

Os casos incluem diferentes tipos de aplicações, desde soluções simples até implementações complexas. Esta variedade nos permite entender como ${query} pode ser adaptado em diferentes níveis de complexidade.

Cada caso será analisado considerando o contexto específico, os objetivos a serem alcançados, os recursos disponíveis e os resultados obtidos. Esta análise nos permite desenvolver uma compreensão prática de como aplicar ${query} de forma eficaz.`
            }
          },
          {
            type: 'explanation',
            card1: {
              title: 'Exercício Prático',
              content: `Agora vamos praticar com um exercício prático que combina teoria e aplicação de ${query}. Este exercício foi elaborado para desafiar nossa compreensão e desenvolver nossa capacidade de aplicar os conceitos estudados.

O exercício envolve a análise de um cenário onde múltiplos aspectos de ${query} se interconectam. Este tipo de exercício nos permite desenvolver habilidades analíticas e competências para resolver problemas de forma criativa.

Durante o exercício, vamos aplicar os conceitos fundamentais estudados, conectando teoria e prática de forma significativa. Este processo nos ajuda a consolidar nosso conhecimento e desenvolver confiança na utilização de ${query}.`
            },
            card2: {
              title: 'Solução Comentada',
              content: `Vamos analisar a solução passo a passo, explorando o raciocínio por trás de cada etapa do processo. Esta análise nos permite entender não apenas o que foi feito, mas também por que foi feito dessa forma.

A solução comentada inclui explicações sobre cada etapa, desde a identificação do problema até a implementação da solução. Cada explicação é fundamentada nos princípios de ${query} que estudamos.

Vamos explorar alternativas possíveis, analisando diferentes abordagens e comparando suas vantagens. Esta análise nos ajuda a desenvolver uma compreensão mais flexível de ${query}.`
            }
          },
          {
            type: 'question',
            card1: {
              title: 'Atividade Prática',
              content: `Agora vamos propor uma atividade prática onde vocês, alunos, poderão aplicar o conhecimento adquirido sobre ${query}. Esta atividade foi pensada para simular como um professor usaria esta plataforma em sala de aula.

Como professor, você precisa criar uma atividade que envolva os alunos e permita que eles pratiquem os conceitos de ${query} de forma interativa. Esta atividade deve ser educativa, envolvente e prática.

A atividade deve demonstrar como ${query} pode ser aplicado em situações reais, permitindo que os alunos vejam a relevância prática do que aprenderam.`
            },
            card2: {
              title: 'Opções de Resposta',
              content: 'Como professor, qual seria a melhor abordagem para esta atividade com os alunos?',
              options: ['A) Explicar passo a passo e depois aplicar', 'B) Deixar os alunos descobrirem sozinhos', 'C) Aplicar diretamente sem explicação', 'D) Explicar apenas a teoria'],
              correctOption: 0,
              helpMessage: 'Pense na melhor estratégia pedagógica para envolver os alunos no aprendizado de ${query}. Considere como um professor eficaz conduziria esta atividade.',
              correctAnswer: 'A resposta correta é a Opção A, pois combina explicação clara com aplicação prática, garantindo que os alunos compreendam ${query} antes de aplicar.'
            }
          },
          {
            type: 'explanation',
            card1: {
              title: 'Resumo do Conteúdo',
              content: `Parabéns! Você concluiu esta aula interativa sobre ${query}. Vamos fazer um resumo dos principais pontos aprendidos e como aplicá-los de forma eficaz.

Durante nossa jornada, exploramos os conceitos fundamentais de ${query}, suas aplicações práticas, exemplos reais e casos de uso. Desenvolvemos uma compreensão sólida dos aspectos teóricos e práticos.

Os principais pontos aprendidos incluem: compreensão dos conceitos fundamentais, capacidade de identificar aplicações práticas, desenvolvimento de habilidades analíticas e consolidação de conhecimento integrado de ${query}.`
            },
            card2: {
              title: 'Conclusão',
              content: `Este tema é absolutamente fundamental para desenvolver habilidades cognitivas importantes, competências analíticas essenciais e capacidades de resolução de problemas que são altamente valorizadas em qualquer área de atuação. Continue praticando regularmente, explorando novas aplicações e aprofundando sua compreensão de ${query}.

O conhecimento que você adquiriu sobre ${query} representa uma base sólida para seu desenvolvimento contínuo e crescimento profissional. Este conhecimento não é estático, mas sim uma ferramenta dinâmica que pode ser aplicada, adaptada e expandida em diferentes contextos e situações.

Recomendamos que você continue explorando ${query} através de estudos adicionais, prática regular, participação em comunidades de profissionais e pesquisadores da área, e aplicação prática dos conceitos aprendidos em projetos e situações reais. Esta continuidade no aprendizado é essencial para manter e expandir seu conhecimento.

Lembre-se de que o aprendizado é um processo contínuo e evolutivo. Cada nova experiência, cada novo desafio e cada nova aplicação de ${query} contribui para seu desenvolvimento como profissional e como pessoa. Continue explorando, questionando e aplicando este conhecimento de forma criativa e eficaz!`,
              imageUrl: imageResult.introImage?.urls.regular
            }
          }
        ],
        finalTest: {
          question: `Para finalizar, qual é a melhor estratégia para continuar aprendendo sobre ${query}?`,
          options: ['Praticar regularmente', 'Apenas ler teoria', 'Decorar fórmulas', 'Evitar exercícios'],
          correctOption: 0
        },
        summary: `Parabéns! Você concluiu a aula sobre ${query}. Aprendemos os conceitos fundamentais, vimos exemplos práticos e praticamos com exercícios.`,
        nextSteps: [
          'Praticar com exercícios similares',
          'Explorar aplicações mais avançadas',
          'Buscar exemplos do mundo real',
          'Revisar os conceitos regularmente'
        ]
      };
    }

    return NextResponse.json({
      success: true,
      lesson: lesson,
      imageInfo: imageResult.introImage ? {
        theme: imageResult.theme,
        imageUrl: imageResult.introImage.urls.regular,
        imageId: imageResult.introImage.id,
        description: imageResult.introImage.alt_description,
        author: imageResult.introImage.user.name
      } : null
    });

  } catch (error: any) {
    console.error('❌ Erro na API module-professor-interactive:', error);
    
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

