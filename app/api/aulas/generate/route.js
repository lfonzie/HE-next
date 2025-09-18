// app/api/aulas/generate/route.js
// Rota API dedicada para geração de aulas com pacing profissional

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { randomizeQuizQuestions } from '@/lib/quiz-randomization';
import { log } from '@/lib/lesson-logger';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Funções auxiliares simplificadas (para evitar problemas de importação)
function estimateTokens(text) {
  if (!text || typeof text !== 'string') return 0;
  return Math.ceil(text.length / 4);
}

function estimateWords(tokens) {
  return Math.round(tokens * 0.75);
}

function calculateLessonDuration(slides, mode = 'sync') {
  if (!Array.isArray(slides) || slides.length === 0) {
    return { totalMinutes: 0, totalTokens: 0, totalWords: 0 };
  }
  
  const totalTokens = slides.reduce((sum, slide) => {
    return sum + estimateTokens(slide.content || '');
  }, 0);
  
  const totalWords = estimateWords(totalTokens);
  
  if (mode === 'sync') {
    const expositionTime = totalWords / 130;
    const pauses = expositionTime * 0.4;
    const quizzesTime = 4 * 2;
    const closingTime = 2.5;
    const totalMinutes = Math.round(expositionTime + pauses + quizzesTime + closingTime);
    
    return { totalMinutes, totalTokens, totalWords };
  } else {
    const readingTime = totalWords / 210;
    const quizzesTime = 9;
    const interactionsTime = 6.5;
    const totalMinutes = Math.round(readingTime + quizzesTime + interactionsTime);
    
    return { totalMinutes, totalTokens, totalWords };
  }
}

function generateImageQuery(topic, slideNumber, slideType) {
  // Limpar o tópico para criar queries mais específicas e precisas
  const cleanTopic = topic.toLowerCase()
    .replace(/[?¿!¡.,;:]/g, '') // Remove pontuação
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
  
  // Extrair palavras-chave principais do tópico
  const topicKeywords = cleanTopic.split(' ').filter(word => 
    word.length > 2 && 
    !['sobre', 'para', 'como', 'quando', 'onde', 'porque', 'que', 'uma', 'um', 'de', 'da', 'do', 'das', 'dos'].includes(word)
  );
  
  const mainKeyword = topicKeywords[0] || cleanTopic;
  const secondaryKeyword = topicKeywords[1] || '';
  
  // Queries específicas e precisas por tipo de slide e número com palavras-chave relevantes
  const queries = {
    1: `${mainKeyword} ${secondaryKeyword} introduction concept overview`, // Abertura
    2: `${mainKeyword} ${secondaryKeyword} fundamentals basics principles`, // Conceitos fundamentais
    3: `${mainKeyword} ${secondaryKeyword} process mechanism steps`, // Desenvolvimento
    4: `${mainKeyword} ${secondaryKeyword} application examples real world`, // Aplicações práticas
    5: `${mainKeyword} ${secondaryKeyword} variations adaptations types`, // Variações
    6: `${mainKeyword} ${secondaryKeyword} advanced connections relationships`, // Conexões avançadas
    7: `${mainKeyword} ${secondaryKeyword} quiz test question`, // Quiz 1
    8: `${mainKeyword} ${secondaryKeyword} deep dive analysis`, // Aprofundamento
    9: `${mainKeyword} ${secondaryKeyword} practical examples demonstration`, // Exemplos práticos
    10: `${mainKeyword} ${secondaryKeyword} critical analysis evaluation`, // Análise crítica
    11: `${mainKeyword} ${secondaryKeyword} synthesis summary`, // Síntese intermediária
    12: `${mainKeyword} ${secondaryKeyword} situational analysis quiz`, // Quiz 2
    13: `${mainKeyword} ${secondaryKeyword} future applications innovation`, // Aplicações futuras
    14: `${mainKeyword} ${secondaryKeyword} conclusion summary recap` // Encerramento
  };
  
  // Fallback mais específico se não encontrar
  const fallbackQueries = {
    1: `${mainKeyword} concept introduction`,
    2: `${mainKeyword} basics fundamentals`,
    3: `${mainKeyword} process mechanism`,
    4: `${mainKeyword} examples applications`,
    5: `${mainKeyword} types variations`,
    6: `${mainKeyword} advanced connections`,
    7: `${mainKeyword} quiz test`,
    8: `${mainKeyword} analysis deep`,
    9: `${mainKeyword} practical demonstration`,
    10: `${mainKeyword} critical evaluation`,
    11: `${mainKeyword} synthesis summary`,
    12: `${mainKeyword} situational quiz`,
    13: `${mainKeyword} future innovation`,
    14: `${mainKeyword} conclusion recap`
  };
  
  return queries[slideNumber] || fallbackQueries[slideNumber] || `${mainKeyword} concept`;
}

// Função para gerar URL de imagem dinâmica baseada no tema
function generateDynamicImageUrl(topic, slideNumber, slideType) {
  const imageQuery = generateImageQuery(topic, slideNumber, slideType);
  
  // Usar API Unsplash oficial através do endpoint interno
  // Retorna um placeholder que será substituído pela API
  return `PLACEHOLDER_UNSPLASH_${encodeURIComponent(imageQuery)}`;
}

/**
 * Template plug-and-play para prompts do pipeline
 * @param {string} topic - Tópico da aula
 * @param {string} systemPrompt - Prompt customizado da escola
 * @returns {string} - Template formatado
 */
function getLessonPromptTemplate(topic, systemPrompt = '') {
  return `Você é um professor especialista em ${topic}. Crie uma aula completa e envolvente estruturada em exatamente 9 slides.

REGRAS IMPORTANTES:
- Responda APENAS com JSON válido, sem texto adicional
- NÃO inclua instruções, metadados ou explicações no conteúdo dos slides
- Cada slide deve ter conteúdo educativo direto e objetivo
- Use linguagem clara e didática em português brasileiro
- NÃO use frases como "imagine uma tabela", "crie um gráfico" ou "desenhe um diagrama"
- Use \\n\\n para quebras de linha entre parágrafos no conteúdo dos slides
- Para quiz, NÃO inclua campo "correct" - apenas forneça as opções e explicação
- CADA SLIDE DEVE TER MÍNIMO 500 TOKENS DE CONTEÚDO (conteúdo extenso e detalhado)

ESTRUTURA DA AULA (45-60 minutos) - EXATAMENTE 14 SLIDES:
Crie títulos ESPECÍFICOS e únicos para cada slide baseados no tema "${topic}". 
NÃO use títulos genéricos como "Conceitos Fundamentais" ou "Aplicações Práticas".
Cada título deve ser específico ao conteúdo do slide e ao tema da aula.

Exemplos de títulos específicos para diferentes temas:
- Para "Como funciona a eletricidade?": "O que é Corrente Elétrica?", "Lei de Ohm na Prática", "Circuitos em Casa"
- Para "História do Brasil": "O Descobrimento Português", "A Era Colonial", "Independência de 1822"

1. Abertura: [Título específico sobre introdução ao tema] (Conteúdo)
2. [Título específico sobre conceito principal] (Conteúdo)
3. [Título específico sobre desenvolvimento] (Conteúdo)
4. [Título específico sobre aplicações] (Conteúdo)
5. [Título específico sobre variações] (Conteúdo)
6. [Título específico sobre conexões] (Conteúdo)
7. Quiz: [Título específico sobre conceitos básicos] (Avaliação, 0 pontos)
8. [Título específico sobre aprofundamento] (Conteúdo)
9. [Título específico sobre exemplos] (Conteúdo)
10. [Título específico sobre análise crítica] (Conteúdo)
11. [Título específico sobre síntese] (Conteúdo)
12. Quiz: [Título específico sobre análise situacional] (Avaliação, 0 pontos)
13. [Título específico sobre aplicações futuras] (Conteúdo)
14. Encerramento: [Título específico sobre síntese final] (Conteúdo)

FORMATO JSON OBRIGATÓRIO - EXATAMENTE 14 SLIDES:
{
  "slides": [
    {
      "number": 1,
      "title": "[Título específico sobre introdução ao tema]",
      "content": "Conteúdo educativo detalhado com quebras de linha usando \\n\\n para parágrafos\\n\\nExemplo de segundo parágrafo com mais informações detalhadas.\\n\\nTerceiro parágrafo com exemplos práticos e aplicações reais.",
      "type": "content",
      "imageQuery": "eletricidade corrente introdução conceito",
      "tokenEstimate": 500
    },
    {
      "number": 2,
      "title": "[Título específico sobre conceito principal]",
      "content": "Conteúdo educativo detalhado sem imagem.",
      "type": "content",
      "imageQuery": null,
      "tokenEstimate": 500
    },
    {
      "number": 3,
      "title": "[Título específico sobre desenvolvimento]",
      "content": "Conteúdo educativo detalhado sem imagem.",
      "type": "content",
      "imageQuery": null,
      "tokenEstimate": 500
    },
    {
      "number": 4,
      "title": "[Título específico sobre aplicações]",
      "content": "Conteúdo educativo detalhado sem imagem.",
      "type": "content",
      "imageQuery": null,
      "tokenEstimate": 500
    },
    {
      "number": 5,
      "title": "[Título específico sobre variações]",
      "content": "Conteúdo educativo detalhado sem imagem.",
      "type": "content",
      "imageQuery": null,
      "tokenEstimate": 500
    },
    {
      "number": 6,
      "title": "[Título específico sobre conexões]",
      "content": "Conteúdo educativo detalhado sem imagem.",
      "type": "content",
      "imageQuery": null,
      "tokenEstimate": 500
    },
    {
      "number": 7,
      "title": "Quiz: [Título específico sobre conceitos básicos]",
      "content": "Conteúdo educativo detalhado com imagem.",
      "type": "quiz",
      "imageQuery": "eletricidade quiz teste conceitos",
      "tokenEstimate": 500,
      "points": 0
    },
    {
      "number": 8,
      "title": "[Título específico sobre aprofundamento]",
      "content": "Conteúdo educativo detalhado sem imagem.",
      "type": "content",
      "imageQuery": null,
      "tokenEstimate": 500
    },
    {
      "number": 9,
      "title": "[Título específico sobre exemplos]",
      "content": "Conteúdo educativo detalhado sem imagem.",
      "type": "content",
      "imageQuery": null,
      "tokenEstimate": 500
    },
    {
      "number": 10,
      "title": "[Título específico sobre análise crítica]",
      "content": "Conteúdo educativo detalhado sem imagem.",
      "type": "content",
      "imageQuery": null,
      "tokenEstimate": 500
    },
    {
      "number": 11,
      "title": "[Título específico sobre síntese]",
      "content": "Conteúdo educativo detalhado sem imagem.",
      "type": "content",
      "imageQuery": null,
      "tokenEstimate": 500
    },
    {
      "number": 12,
      "title": "Quiz: [Título específico sobre análise situacional]",
      "content": "Conteúdo educativo detalhado sem imagem.",
      "type": "quiz",
      "imageQuery": null,
      "tokenEstimate": 500,
      "points": 0
    },
    {
      "number": 13,
      "title": "[Título específico sobre aplicações futuras]",
      "content": "Conteúdo educativo detalhado sem imagem.",
      "type": "content",
      "imageQuery": null,
      "tokenEstimate": 500
    },
    {
      "number": 14,
      "title": "Encerramento: [Título específico sobre síntese final]",
      "content": "Conteúdo educativo detalhado com imagem de encerramento.",
      "type": "content",
      "imageQuery": "eletricidade conclusão síntese final",
      "tokenEstimate": 500
    }
  ]
}

Para slides de quiz (type: "quiz"), inclua:
{
  "number": 7,
  "title": "Quiz: [Título específico sobre conceitos básicos]",
  "content": "Conteúdo do quiz",
  "type": "quiz",
  "imageQuery": null,
  "tokenEstimate": 500,
  "points": 0,
  "questions": [
    {
      "q": "Pergunta clara e objetiva relacionada ao tema específico?",
      "options": ["A) Alternativa A detalhada", "B) Alternativa B detalhada", "C) Alternativa C detalhada", "D) Alternativa D detalhada"],
      "explanation": "Explicação detalhada da resposta correta"
    }
  ]
}

IMPORTANTE: 
- O campo "content" deve conter APENAS conteúdo educativo
- Use \\n\\n para separar parágrafos no conteúdo
- NÃO inclua instruções como "imagine uma tabela" ou "crie um gráfico"
- Use linguagem direta e objetiva
- Foque em explicações claras e exemplos práticos
- CADA SLIDE DEVE TER MÍNIMO 500 TOKENS DE CONTEÚDO
- O campo "imageQuery" deve ser específico e relevante ao conteúdo do slide
- APENAS slides 1, 7 e 14 devem ter imageQuery (outros slides devem ter imageQuery: null)
- Para slides 1, 7 e 14: use termos específicos do tema sem palavras genéricas
- Evite termos genéricos como "education", "classroom", "learning", "educational"
- Use apenas palavras-chave específicas do conteúdo (ex: "eletricidade corrente", "matemática álgebra", "história independência")
- Para quiz: "correct" deve ser uma letra (A, B, C, D) indicando a resposta correta
- As alternativas devem ser claramente identificadas como A), B), C), D) no conteúdo das opções
- Use quebras de linha \\n\\n para separar parágrafos e melhorar a legibilidade
- Para diagramas e tabelas, use a sintaxe especial: <<<criar um diagrama da fotossíntese, sem letras somente imagem>>> ou <<<criar uma tabela comparativa>>>
- CRÍTICO: Cada slide deve ter um título ÚNICO e ESPECÍFICO ao tema "${topic}". NÃO use títulos genéricos como "Conceitos Fundamentais", "Aplicações Práticas", etc. Crie títulos que sejam específicos ao conteúdo de cada slide.
- GERE EXATAMENTE 14 SLIDES - NÃO MAIS, NÃO MENOS

Tópico: ${topic}

${systemPrompt ? `[SISTEMA PROMPT CUSTOMIZADO: ${systemPrompt}]` : ''}

Responda apenas com o JSON válido:`;
}

/**
 * Parseia conteúdo gerado pela IA em slides estruturados
 * @param {string} content - Conteúdo retornado pela IA
 * @returns {Object} - Objeto com slides estruturados
 */
function parseGeneratedContent(content) {
  try {
    // Tentar parsear como JSON primeiro
    if (content.trim().startsWith('{')) {
      const parsed = JSON.parse(content);
      if (parsed.slides && Array.isArray(parsed.slides)) {
        return parsed;
      }
    }
    
    // Se não for JSON válido, tentar extrair JSON do texto
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.slides && Array.isArray(parsed.slides)) {
        return parsed;
      }
    }
    
    // Fallback: criar estrutura básica
    console.warn('Não foi possível parsear o conteúdo da IA, usando fallback');
    return {
      slides: Array.from({ length: 9 }, (_, i) => ({
        number: i + 1,
        title: `Slide ${i + 1}`,
        content: `Conteúdo do slide ${i + 1}`,
        type: i === 3 || i === 7 ? 'quiz' : i === 8 ? 'closing' : 'content',
        imageQuery: generateImageQuery('tópico', i + 1, 'content')
      }))
    };
  } catch (error) {
    console.error('Erro ao parsear conteúdo da IA:', error);
    throw new Error('Erro ao processar resposta da IA');
  }
}

/**
 * Valida estrutura da aula gerada
 * @param {Object} lessonData - Dados da aula
 * @returns {Object} - Resultado da validação
 */
function validateLessonStructure(lessonData) {
  const issues = [];
  
  if (!lessonData.slides || !Array.isArray(lessonData.slides)) {
    issues.push('Estrutura de slides inválida');
    return { isValid: false, issues };
  }
  
  if (lessonData.slides.length !== 14) {
    issues.push(`Deve ter exatamente 14 slides, encontrados ${lessonData.slides.length}`);
  }
  
  // Validar slides de quiz
  const quizSlides = lessonData.slides.filter(slide => slide.type === 'quiz');
  if (quizSlides.length !== 2) {
    issues.push(`Deve ter exatamente 2 slides de quiz, encontrados ${quizSlides.length}`);
  }
  
  // Validar estrutura dos slides de quiz
  quizSlides.forEach((slide, index) => {
    if (!slide.questions || !Array.isArray(slide.questions) || slide.questions.length === 0) {
      issues.push(`Slide de quiz ${index + 1} não possui questões válidas`);
    } else {
      slide.questions.forEach((question, qIndex) => {
        if (!question.q || !question.options || !Array.isArray(question.options) || question.options.length !== 4) {
          issues.push(`Questão ${qIndex + 1} do quiz ${index + 1} não possui estrutura válida`);
        }
        if (question.correct === undefined || question.correct < 0 || question.correct > 3) {
          issues.push(`Questão ${qIndex + 1} do quiz ${index + 1} não possui resposta correta válida`);
        }
      });
    }
  });
  
  // Validar tokens por slide
  const shortSlides = lessonData.slides.filter(slide => {
    const tokens = estimateTokens(slide.content || '');
    return tokens < 500;
  });
  
  if (shortSlides.length > 0) {
    issues.push(`${shortSlides.length} slide(s) com menos de 500 tokens (mínimo obrigatório)`);
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    metrics: {
      totalSlides: lessonData.slides.length,
      quizSlides: quizSlides.length,
      shortSlides: shortSlides.length
    }
  };
}

export async function POST(request) {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const { topic, schoolId, mode = 'sync', customPrompt } = await request.json();
    
    // Contexto base para todos os logs desta requisição
    const baseContext = {
      requestId,
      topic,
      schoolId,
      mode,
      timestamp: new Date().toISOString()
    };
    
    log.info('🎓 Iniciando geração de aula', baseContext, {
      topic,
      mode,
      schoolId: schoolId || 'N/A',
      hasCustomPrompt: !!customPrompt
    });
    
    if (!topic) {
      log.validationError('topic', topic, 'string não vazia', baseContext);
      return NextResponse.json({ 
        error: 'Tópico é obrigatório' 
      }, { status: 400 });
    }
    
    // Timer para preparação do prompt
    const promptTimer = log.timeStart('preparacao-prompt', baseContext);
    
    // TODO: Integrar com Neo4j para prompts customizados por escola
    // const customPromptQuery = `
    //   MATCH (s:School {id: $schoolId})-[:HAS_PROMPT]->(p:Prompt)
    //   RETURN p.text as prompt
    // `;
    // const customPrompts = await queryNeo4j(customPromptQuery, { schoolId });
    // const systemPrompt = customPrompts.length > 0 ? customPrompts[0].prompt : '';
    
    const systemPrompt = customPrompt || 'Gere conteúdo educacional detalhado em PT-BR.';
    
    // Gerar conteúdo usando template plug-and-play
    const generationPrompt = getLessonPromptTemplate(topic, systemPrompt);
    
    log.timeEnd(promptTimer, 'preparacao-prompt', baseContext);
    
    log.info('📋 Prompt preparado', baseContext, {
      promptLength: generationPrompt.length,
      estimatedTokens: Math.ceil(generationPrompt.length / 4),
      hasCustomPrompt: !!customPrompt
    });
    
    // Timer para chamada OpenAI
    const openaiTimer = log.timeStart('openai-generation', baseContext);
    
    log.info('🤖 Chamando OpenAI GPT-4o Mini', baseContext, {
      model: 'gpt-4o-mini',
      maxTokens: 10000,
      temperature: 0.7,
      estimatedPromptTokens: Math.ceil(generationPrompt.length / 4)
    });
    
    const openaiStartTime = Date.now();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: generationPrompt }],
      max_tokens: 10000, // Limite superior estimado
      temperature: 0.7
    });
    
    const openaiDuration = Math.round((Date.now() - openaiStartTime) / 1000);
    log.timeEnd(openaiTimer, 'openai-generation', baseContext);
    
    log.success('✅ Resposta OpenAI recebida', baseContext, {
      duration: openaiDuration,
      usage: response.usage,
      finishReason: response.choices[0]?.finish_reason,
      responseLength: response.choices[0]?.message?.content?.length || 0
    });
    // Timer para parsing do conteúdo
    const parsingTimer = log.timeStart('parsing-conteudo', baseContext);
    
    log.info('🔍 Parseando conteúdo da IA', baseContext, {
      responseLength: response.choices[0]?.message?.content?.length || 0,
      estimatedCost: ((response.usage?.total_tokens || 0) * 0.000015).toFixed(4)
    });
    
    const rawContent = response.choices[0]?.message?.content || '';
    const generatedContent = parseGeneratedContent(rawContent);
    
    log.timeEnd(parsingTimer, 'parsing-conteudo', baseContext);
    
    log.parsing('conteudo-ia', true, {
      slidesCount: generatedContent.slides?.length || 0,
      rawContentLength: rawContent.length,
      parsedSuccessfully: !!generatedContent.slides
    }, baseContext);
    
    // Timer para validação
    const validationTimer = log.timeStart('validacao-estrutura', baseContext);
    
    log.info('🔍 Validando estrutura da aula', baseContext, {
      slidesCount: generatedContent.slides?.length || 0
    });
    
    const validation = validateLessonStructure(generatedContent);
    
    log.timeEnd(validationTimer, 'validacao-estrutura', baseContext);
    
    if (!validation.isValid) {
      log.validationError('lesson-structure', generatedContent, 'estrutura válida', baseContext);
      log.error('❌ Validação da estrutura falhou', baseContext, {
        errors: validation.errors,
        warnings: validation.warnings
      });
    } else {
      log.success('✅ Validação da estrutura passou', baseContext, {
        warnings: validation.warnings?.length || 0
      });
    }
    
    // Timer para preparação de imagens
    const imageTimer = log.timeStart('preparacao-imagens', baseContext);
    
    log.info('🖼️ Preparando queries de imagem', baseContext, {
      slidesCount: generatedContent.slides?.length || 0
    });
    
    // Adicionar queries de imagem otimizadas e URLs dinâmicas APENAS para slides 1, 7 e 14
    const slidesWithImageQueries = await Promise.all(generatedContent.slides.map(async (slide, index) => {
      // Apenas slides 1, 7 e 14 devem ter imagens
      if (slide.number === 1 || slide.number === 7 || slide.number === 14) {
        const imageQuery = slide.imageQuery || generateImageQuery(topic, slide.number, slide.type);
        
        // Tentar múltiplas fontes de imagem
        let imageUrl = null;
        let imageSource = 'fallback';
        
        // 1. Usar nova API de classificação de imagens com múltiplas fontes
        try {
          const classifyResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/images/classify-source`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: imageQuery,
              subject: topic,
              grade: '5',
              count: 1
            }),
          });

          if (classifyResponse.ok) {
            const classifyData = await classifyResponse.json();
            if (classifyData.success && classifyData.images && classifyData.images.length > 0) {
              const bestImage = classifyData.images[0];
              imageUrl = bestImage.url;
              imageSource = bestImage.source.source;
              console.log(`✅ Imagem classificada para slide ${slide.number}:`, {
                source: bestImage.source.name,
                relevance: bestImage.relevanceScore,
                themeMatch: bestImage.themeMatch,
                educationalSuitability: bestImage.educationalSuitability
              });
            }
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao classificar imagem para slide ${slide.number}:`, error);
        }

        // 2. Se Wikimedia falhar, tentar Pixabay
        if (!imageUrl) {
          try {
            const pixabayResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/pixabay`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'search',
                query: imageQuery,
                perPage: 1,
                category: 'education',
                type: 'images'
              }),
            });

            if (pixabayResponse.ok) {
              const pixabayData = await pixabayResponse.json();
              if (pixabayData.success && pixabayData.data && pixabayData.data.length > 0) {
                imageUrl = pixabayData.data[0].url;
                imageSource = 'pixabay';
                console.log(`✅ Imagem Pixabay carregada para slide ${slide.number}:`, imageUrl);
              }
            }
          } catch (error) {
            console.warn(`⚠️ Erro ao buscar imagem Pixabay para slide ${slide.number}:`, error);
          }
        }

        // 3. Se Pixabay falhar, tentar Unsplash
        if (!imageUrl) {
          try {
            const unsplashResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/unsplash/translate-search`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query: imageQuery,
                subject: topic,
                count: 1
              }),
            });

            if (unsplashResponse.ok) {
              const unsplashData = await unsplashResponse.json();
              if (unsplashData.photos && unsplashData.photos.length > 0) {
                imageUrl = unsplashData.photos[0].urls.regular;
                imageSource = 'unsplash';
                console.log(`✅ Imagem Unsplash carregada para slide ${slide.number}:`, imageUrl);
              }
            }
          } catch (error) {
            console.warn(`⚠️ Erro ao buscar imagem Unsplash para slide ${slide.number}:`, error);
          }
        }

        // 3. Se ambas falharem, usar Wiki Commons como fallback
        // TODO: Preparar para integração com FreePik API
        // - Adicionar configuração de API key do FreePik
        // - Implementar busca de imagens educacionais específicas
        // - Manter Wiki Commons como fallback final
        if (!imageUrl) {
          // Usar Wiki Commons com uma imagem educacional genérica
          imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/Education%20-%20The%20Noun%20Project.svg?width=800&height=400`;
          imageSource = 'wikimedia';
          console.log(`⚠️ Usando Wiki Commons para slide ${slide.number}`);
        }

        return {
          ...slide,
          imageQuery: imageQuery,
          imageUrl: imageUrl,
          imageSource: imageSource,
          subject: topic // Para contexto educacional
        };
      } else {
        // Slides intermediários não devem ter imagens (exceto 1, 7 e 14)
        return {
          ...slide,
          imageQuery: null,
          imageUrl: null,
          imageSource: null,
          subject: topic
        };
      }
    }));
    
    log.timeEnd(imageTimer, 'preparacao-imagens', baseContext);
    
    // Timer para cálculo de métricas
    const metricsTimer = log.timeStart('calculo-metricas', baseContext);
    
    log.info('📈 Calculando métricas de qualidade', baseContext, {
      slidesCount: slidesWithImageQueries.length
    });
    
    // Usar slides com imagens para todos os slides
    const slidesWithImages = slidesWithImageQueries;
    
    // Calcular métricas completas
    const duration = calculateLessonDuration(slidesWithImages, mode);
    const slideValidations = slidesWithImages.map(slide => {
      const tokens = estimateTokens(slide.content);
      return { isValid: tokens >= 500, tokens };
    });
    const validSlides = slideValidations.filter(v => v.isValid).length;
    
    log.debug('📊 Validação inicial de tokens', baseContext, {
      totalSlides: slidesWithImages.length,
      validSlides,
      averageTokens: Math.round(slideValidations.reduce((sum, v) => sum + v.tokens, 0) / slideValidations.length)
    });
    
    // Usar slides originais sem expansão automática
    const finalSlides = slidesWithImages;
    const finalDuration = calculateLessonDuration(finalSlides, mode);
    const finalValidations = finalSlides.map(slide => {
      const tokens = estimateTokens(slide.content);
      return { isValid: tokens >= 500, tokens };
    });
    const finalValidSlides = finalValidations.filter(v => v.isValid).length;
    
    log.debug('📊 Validação final de tokens', baseContext, {
      totalSlides: finalSlides.length,
      validSlides: finalValidSlides,
      averageTokens: Math.round(finalValidations.reduce((sum, v) => sum + v.tokens, 0) / finalValidations.length),
      note: 'Usando conteúdo original sem expansão automática'
    });
    
    const metrics = {
      duration: {
        sync: finalDuration.totalMinutes,
        async: Math.round(finalDuration.totalMinutes * 0.7)
      },
      content: {
        totalTokens: finalDuration.totalTokens,
        totalWords: finalDuration.totalWords,
        averageTokensPerSlide: Math.round(finalDuration.totalTokens / finalSlides.length)
      },
      quality: {
        score: Math.round((finalValidSlides / finalSlides.length) * 100),
        validSlides: finalValidSlides,
        totalSlides: finalSlides.length
      },
      images: {
        count: finalSlides.length,
        estimatedSizeMB: Math.round(finalSlides.length * 0.35 * 100) / 100
      }
    };
    
    log.timeEnd(metricsTimer, 'calculo-metricas', baseContext);
    
    log.performance('geracao-aula', metrics, baseContext);
    
    log.success('📊 Métricas calculadas', baseContext, {
      duration: `${metrics.duration.sync} min (sync) / ${metrics.duration.async} min (async)`,
      tokens: `${metrics.content.totalTokens.toLocaleString()} (média: ${metrics.content.averageTokensPerSlide}/slide)`,
      words: metrics.content.totalWords.toLocaleString(),
      quality: `${metrics.quality.score}% (${metrics.quality.validSlides}/${metrics.quality.totalSlides} slides válidos)`,
      images: `${metrics.images.count} (~${metrics.images.estimatedSizeMB} MB)`
    });
    
    // Preparar resposta
    const responseData = {
      success: true,
      lesson: {
        id: `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: topic,
        subject: topic,
        level: 'Intermediário',
        objectives: [
          `Compreender os conceitos fundamentais sobre ${topic}`,
          `Aplicar conhecimentos através de atividades práticas`,
          `Desenvolver pensamento crítico sobre o tema`,
          `Conectar o aprendizado com situações do cotidiano`
        ],
        stages: finalSlides.map((slide, index) => {
          // Randomize quiz questions if this is a quiz slide
          let processedQuestions = slide.questions;
          if (slide.type === 'quiz' && slide.questions) {
            try {
              processedQuestions = randomizeQuizQuestions(slide.questions);
              log.debug('🎲 Quiz questions randomized', baseContext, {
                slideNumber: slide.number,
                questionCount: processedQuestions.length
              });
            } catch (error) {
              log.warn('⚠️ Failed to randomize quiz questions', baseContext, {
                slideNumber: slide.number,
                error: error.message
              });
              // Keep original questions if randomization fails
              processedQuestions = slide.questions;
            }
          }
          
          return {
            etapa: slide.title || `Etapa ${index + 1}`,
            type: slide.type === 'quiz' ? 'Avaliação' : slide.type === 'closing' ? 'Encerramento' : 'Conteúdo',
            activity: {
              component: slide.type === 'quiz' ? 'QuizComponent' : 'AnimationSlide',
              content: slide.content,
              questions: slide.type === 'quiz' ? processedQuestions : undefined,
              imageUrl: slide.imageUrl,
              imagePrompt: slide.imageQuery
            },
            route: `/${slide.type}`,
            estimatedTime: slide.timeEstimate || 5
          };
        }),
        feedback: {
          pacing: metrics,
          validation: validation
        },
        slides: finalSlides.map(slide => {
          // Randomize quiz questions if this is a quiz slide
          if (slide.type === 'quiz' && slide.questions) {
            try {
              const randomizedQuestions = randomizeQuizQuestions(slide.questions);
              return {
                ...slide,
                questions: randomizedQuestions
              };
            } catch (error) {
              log.warn('⚠️ Failed to randomize quiz questions in slides', baseContext, {
                slideNumber: slide.number,
                error: error.message
              });
              return slide;
            }
          }
          return slide;
        }),
        metadata: {
          subject: topic,
          grade: 'Ensino Médio',
          duration: `${metrics.duration.sync} minutos`,
          difficulty: 'Intermediário',
          tags: [topic.toLowerCase()]
        }
      },
      topic,
      mode,
      slides: finalSlides,
      metrics: {
        duration: {
          sync: metrics.duration.sync,
          async: metrics.duration.async
        },
        content: {
          totalTokens: metrics.content.totalTokens,
          totalWords: metrics.content.totalWords,
          averageTokensPerSlide: metrics.content.averageTokensPerSlide
        },
        quality: {
          score: metrics.quality.score,
          validSlides: metrics.quality.validSlides,
          totalSlides: metrics.quality.totalSlides
        },
        images: {
          count: metrics.images.count,
          estimatedSizeMB: metrics.images.estimatedSizeMB
        }
      },
      validation: {
        isValid: validation.isValid,
        issues: validation.issues,
        recommendations: []
      },
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
        costEstimate: ((response.usage?.total_tokens || 0) * 0.000015).toFixed(4) // Estimativa de custo GPT-4o Mini
      }
    };
    
    const totalDuration = Math.round((Date.now() - startTime) / 1000);
    console.log(`🎉 [${totalDuration}s] Aula gerada com sucesso!`);
    console.log(`   📊 Resumo final:`);
    console.log(`   ⏱️ Tempo total: ${totalDuration}s`);
    console.log(`   🤖 Tempo OpenAI: ${openaiDuration}s (${Math.round((openaiDuration / totalDuration) * 100)}%)`);
    console.log(`   📝 Slides: ${finalSlides.length}`);
    console.log(`   🎯 Qualidade: ${metrics.quality.score}%`);
    console.log(`   💰 Custo: R$ ${responseData.usage.costEstimate}`);
    
    // Salvar no Neo4j se configurado
    if (process.env.NEO4J_URI && process.env.NEO4J_USER && process.env.NEO4J_PASSWORD) {
      try {
        const { saveLessonToNeo4j } = await import('@/lib/neo4j');
        const lessonId = await saveLessonToNeo4j(responseData.lesson, 'default-user');
        console.log('✅ Aula salva no Neo4j com ID:', lessonId);
        responseData.lesson.id = lessonId;
      } catch (neo4jError) {
        console.warn('⚠️ Erro ao salvar no Neo4j:', neo4jError.message);
        // Continue mesmo se não conseguir salvar no Neo4j
      }
    }
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    const totalDuration = Math.round((Date.now() - startTime) / 1000);
    console.error(`❌ [${totalDuration}s] Erro na geração da aula:`, error);
    
    let friendlyError = 'Erro interno do servidor';
    let statusCode = 500;
    
    if (error.code === 'invalid_api_key' || error.message.includes('API key')) {
      console.error(`🔑 Erro de API Key: Verifique se OPENAI_API_KEY está configurada corretamente`);
      friendlyError = 'Problema de configuração da IA';
      statusCode = 500;
    } else if (error.message.includes('rate limit')) {
      console.error(`⏰ Rate limit atingido: Aguarde antes de tentar novamente`);
      friendlyError = 'Limite de uso da IA excedido. Tente novamente em alguns minutos.';
      statusCode = 429;
    } else if (error.message.includes('Tópico é obrigatório')) {
      console.error(`📝 Erro de validação: Tópico não fornecido`);
      friendlyError = 'Por favor, forneça um tópico para a aula.';
      statusCode = 400;
    } else {
      console.error(`🔧 Erro técnico: ${error.message}`);
    }
    
    return NextResponse.json({ 
      error: friendlyError,
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: statusCode });
  }
}
