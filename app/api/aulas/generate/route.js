// app/api/aulas/generate/route.js
// Rota API dedicada para geração de aulas com pacing profissional

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
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
    1: `${mainKeyword} ${secondaryKeyword} beginning start learning education classroom students`, // Abertura - mais específico
    2: `${mainKeyword} ${secondaryKeyword} fundamentals basics principles educational`, // Conceitos fundamentais
    3: `${mainKeyword} ${secondaryKeyword} process mechanism steps educational`, // Desenvolvimento
    4: `${mainKeyword} ${secondaryKeyword} application examples real world educational`, // Aplicações práticas
    5: `${mainKeyword} ${secondaryKeyword} variations adaptations types educational`, // Variações
    6: `${mainKeyword} ${secondaryKeyword} advanced connections relationships educational`, // Conexões avançadas
    7: `${mainKeyword} ${secondaryKeyword} quiz test question educational`, // Quiz 1
    8: `${mainKeyword} ${secondaryKeyword} deep dive analysis educational`, // Aprofundamento
    9: `${mainKeyword} ${secondaryKeyword} practical examples demonstration educational`, // Exemplos práticos
    10: `${mainKeyword} ${secondaryKeyword} critical analysis evaluation educational`, // Análise crítica
    11: `${mainKeyword} ${secondaryKeyword} synthesis summary educational`, // Síntese intermediária
    12: `${mainKeyword} ${secondaryKeyword} situational analysis quiz educational`, // Quiz 2
    13: `${mainKeyword} ${secondaryKeyword} future applications innovation educational`, // Aplicações futuras
    14: `${mainKeyword} ${secondaryKeyword} completion finish achievement success education` // Encerramento - mais específico
  };
  
  // Fallback mais específico se não encontrar
  const fallbackQueries = {
    1: `${mainKeyword} learning education classroom students beginning`,
    2: `${mainKeyword} basics educational`,
    3: `${mainKeyword} process educational`,
    4: `${mainKeyword} examples educational`,
    5: `${mainKeyword} types educational`,
    6: `${mainKeyword} advanced educational`,
    7: `${mainKeyword} quiz educational`,
    8: `${mainKeyword} analysis educational`,
    9: `${mainKeyword} practical educational`,
    10: `${mainKeyword} critical educational`,
    11: `${mainKeyword} synthesis educational`,
    12: `${mainKeyword} situational educational`,
    13: `${mainKeyword} future educational`,
    14: `${mainKeyword} completion success achievement education finish`
  };
  
  return queries[slideNumber] || fallbackQueries[slideNumber] || `${mainKeyword} education learning`;
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
  return `Crie uma aula sobre "${topic}" com exatamente 14 slides em JSON válido.

ESTRUTURA (14 slides):
1. Abertura: Tema e Objetivos (content)
2. Conceitos Fundamentais (content)  
3. Desenvolvimento dos Processos (content)
4. Aplicações Práticas (content)
5. Variações e Adaptações (content)
6. Conexões Avançadas (content)
7. Quiz: Conceitos Básicos (quiz)
8. Aprofundamento (content)
9. Exemplos Práticos (content)
10. Análise Crítica (content)
11. Síntese Intermediária (content)
12. Quiz: Análise Situacional (quiz)
13. Aplicações Futuras (content)
14. Encerramento: Síntese Final (content)

FORMATO JSON:
{
  "slides": [
    {
      "number": 1,
      "title": "Abertura: Tema e Objetivos",
      "content": "Conteúdo educativo detalhado com \\n\\n para parágrafos",
      "type": "content",
      "imageQuery": "query específica para imagem",
      "tokenEstimate": 500
    }
  ]
}

Para quiz (slides 7 e 12):
{
  "number": 7,
  "title": "Quiz: Conceitos Básicos", 
  "content": "Conteúdo do quiz",
  "type": "quiz",
  "imageQuery": null,
  "tokenEstimate": 500,
  "points": 0,
  "questions": [
    {
      "q": "Pergunta clara?",
      "options": ["A) Alternativa A", "B) Alternativa B", "C) Alternativa C", "D) Alternativa D"],
      "correct": "A",
      "explanation": "Explicação da resposta"
    }
  ]
}

REGRAS:
- Responda APENAS com JSON válido
- Conteúdo educativo direto em português brasileiro
- Mínimo 500 tokens por slide
- Apenas slides 1, 7 e 14 têm imageQuery
- Quiz: "correct" deve ser A, B, C ou D
- Use \\n\\n para quebras de linha

Tópico: ${topic}
${systemPrompt ? `[CUSTOM: ${systemPrompt}]` : ''}

JSON:`;
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
      slides: Array.from({ length: 14 }, (_, i) => ({
        number: i + 1,
        title: `Slide ${i + 1}`,
        content: `Conteúdo do slide ${i + 1}`,
        type: i === 6 || i === 11 ? 'quiz' : i === 13 ? 'closing' : 'content',
        imageQuery: generateImageQuery('tópico', i + 1, 'content')
      }))
    };
  } catch (error) {
    console.error('Erro ao parsear conteúdo da IA:', error);
    throw new Error('Erro ao processar resposta da IA');
  }
}

/**
 * Valida estrutura da aula gerada com validação flexível e recuperação de erros
 * @param {Object} lessonData - Dados da aula
 * @returns {Object} - Resultado da validação
 */
function validateLessonStructure(lessonData) {
  const issues = [];
  const warnings = [];
  const fixedSlides = [];
  
  if (!lessonData.slides || !Array.isArray(lessonData.slides)) {
    issues.push('Estrutura de slides inválida');
    return { isValid: false, issues, warnings, fixedSlides: [] };
  }
  
  // Validar e corrigir cada slide individualmente
  lessonData.slides.forEach((slide, index) => {
    const slideIssues = [];
    const fixedSlide = { ...slide };
    
    // Validar campos obrigatórios
    if (!slide.number || typeof slide.number !== 'number') {
      fixedSlide.number = index + 1;
      slideIssues.push(`Slide ${index + 1}: número inválido, corrigido para ${index + 1}`);
    }
    
    if (!slide.title || typeof slide.title !== 'string') {
      fixedSlide.title = `Slide ${index + 1}`;
      slideIssues.push(`Slide ${index + 1}: título inválido, usando título padrão`);
    }
    
    if (!slide.content || typeof slide.content !== 'string') {
      fixedSlide.content = `Conteúdo do slide ${index + 1}`;
      slideIssues.push(`Slide ${index + 1}: conteúdo inválido, usando conteúdo padrão`);
    }
    
    if (!slide.type || !['content', 'quiz', 'closing'].includes(slide.type)) {
      // Determinar tipo baseado na posição
      if (index === 6 || index === 11) {
        fixedSlide.type = 'quiz';
      } else if (index === 13) {
        fixedSlide.type = 'closing';
      } else {
        fixedSlide.type = 'content';
      }
      slideIssues.push(`Slide ${index + 1}: tipo inválido, corrigido para ${fixedSlide.type}`);
    }
    
    // Validar e corrigir slides de quiz
    if (fixedSlide.type === 'quiz') {
      if (!slide.questions || !Array.isArray(slide.questions) || slide.questions.length === 0) {
        // Criar questão padrão se não existir
        fixedSlide.questions = [{
          q: `Pergunta sobre o tópico da aula?`,
          options: [
            "Alternativa A",
            "Alternativa B", 
            "Alternativa C",
            "Alternativa D"
          ],
          correct: "A",
          explanation: "Explicação da resposta correta"
        }];
        slideIssues.push(`Slide ${index + 1}: questões de quiz inválidas, criada questão padrão`);
      } else {
        // Validar e corrigir cada questão
        fixedSlide.questions = slide.questions.map((question, qIndex) => {
          const fixedQuestion = { ...question };
          
          if (!question.q || typeof question.q !== 'string') {
            fixedQuestion.q = `Pergunta ${qIndex + 1}?`;
            slideIssues.push(`Slide ${index + 1}, Questão ${qIndex + 1}: pergunta inválida`);
          }
          
          if (!question.options || !Array.isArray(question.options) || question.options.length !== 4) {
            fixedQuestion.options = [
              "Alternativa A",
              "Alternativa B",
              "Alternativa C", 
              "Alternativa D"
            ];
            slideIssues.push(`Slide ${index + 1}, Questão ${qIndex + 1}: opções inválidas`);
          }
          
          // Validar resposta correta
          if (question.correct === undefined || question.correct === null) {
            fixedQuestion.correct = "A";
            slideIssues.push(`Slide ${index + 1}, Questão ${qIndex + 1}: resposta correta inválida, definida como A`);
          } else if (typeof question.correct === 'string') {
            const normalizedCorrect = question.correct.toUpperCase();
            if (!['A', 'B', 'C', 'D'].includes(normalizedCorrect)) {
              fixedQuestion.correct = "A";
              slideIssues.push(`Slide ${index + 1}, Questão ${qIndex + 1}: resposta correta inválida (${question.correct}), corrigida para A`);
            } else {
              fixedQuestion.correct = normalizedCorrect;
            }
          } else if (typeof question.correct === 'number') {
            if (question.correct < 0 || question.correct > 3) {
              fixedQuestion.correct = "A";
              slideIssues.push(`Slide ${index + 1}, Questão ${qIndex + 1}: resposta correta inválida (${question.correct}), corrigida para A`);
            } else {
              fixedQuestion.correct = ['A', 'B', 'C', 'D'][question.correct];
            }
          }
          
          if (!question.explanation || typeof question.explanation !== 'string') {
            fixedQuestion.explanation = "Explicação da resposta correta";
          }
          
          return fixedQuestion;
        });
      }
    }
    
    // Validar tokens por slide (mais flexível)
    const tokens = estimateTokens(fixedSlide.content || '');
    if (tokens < 200) {
      warnings.push(`Slide ${index + 1}: conteúdo muito curto (${tokens} tokens), considere expandir`);
    }
    
    fixedSlides.push(fixedSlide);
    
    if (slideIssues.length > 0) {
      warnings.push(...slideIssues);
    }
  });
  
  // Garantir que temos pelo menos 14 slides
  while (fixedSlides.length < 14) {
    const slideNumber = fixedSlides.length + 1;
    const slideType = slideNumber === 7 || slideNumber === 12 ? 'quiz' : 
                     slideNumber === 14 ? 'closing' : 'content';
    
    fixedSlides.push({
      number: slideNumber,
      title: `Slide ${slideNumber}`,
      content: `Conteúdo do slide ${slideNumber}`,
      type: slideType,
      imageQuery: slideNumber === 1 || slideNumber === 7 || slideNumber === 14 ? 
                  `educational ${slideType} illustration` : null,
      tokenEstimate: 500,
      ...(slideType === 'quiz' && {
        questions: [{
          q: `Pergunta sobre o tópico da aula?`,
          options: ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
          correct: "A",
          explanation: "Explicação da resposta correta"
        }],
        points: 0
      })
    });
    warnings.push(`Slide ${slideNumber}: criado slide adicional para completar estrutura`);
  }
  
  // Limitar a 14 slides se houver mais
  if (fixedSlides.length > 14) {
    warnings.push(`Removidos ${fixedSlides.length - 14} slides extras para manter estrutura de 14 slides`);
    fixedSlides.splice(14);
  }
  
  const quizSlides = fixedSlides.filter(slide => slide.type === 'quiz');
  const shortSlides = fixedSlides.filter(slide => {
    const tokens = estimateTokens(slide.content || '');
    return tokens < 200;
  });
  
  return {
    isValid: true, // Sempre válido após correções
    issues: [], // Sem issues críticos após correções
    warnings,
    fixedSlides,
    metrics: {
      totalSlides: fixedSlides.length,
      quizSlides: quizSlides.length,
      shortSlides: shortSlides.length,
      correctionsApplied: warnings.length
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
      max_tokens: 4000, // Otimizado para reduzir tempo de geração
      temperature: 0.7,
      stream: false // Garantir que não seja streaming
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
    
    // Usar slides corrigidos se houver problemas
    const finalContent = validation.fixedSlides.length > 0 ? 
      { ...generatedContent, slides: validation.fixedSlides } : 
      generatedContent;
    
    if (validation.warnings && validation.warnings.length > 0) {
      log.warn('⚠️ Validação com correções aplicadas', baseContext, {
        warnings: validation.warnings,
        correctionsApplied: validation.metrics.correctionsApplied
      });
    } else {
      log.success('✅ Validação da estrutura passou sem correções', baseContext);
    }
    
    // Timer para preparação de imagens
    const imageTimer = log.timeStart('preparacao-imagens', baseContext);
    
    log.info('🖼️ Preparando queries de imagem', baseContext, {
      slidesCount: finalContent.slides?.length || 0
    });
    
    // Adicionar queries de imagem otimizadas e URLs dinâmicas APENAS para slides 1, 7 e 14
    const slidesWithImageQueries = await Promise.all(finalContent.slides.map(async (slide, index) => {
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

        // 3. Se Pixabay falhar, tentar Enhanced Image Service
        if (!imageUrl) {
          try {
            const enhancedResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/images/enhanced-search`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query: imageQuery,
                subject: topic,
                count: 1,
                forceRefresh: false // Allow caching for better performance
              }),
            });

            if (enhancedResponse.ok) {
              const enhancedData = await enhancedResponse.json();
              if (enhancedData.photos && enhancedData.photos.length > 0) {
                const selectedImage = enhancedData.photos[0];
                imageUrl = selectedImage.urls.regular;
                imageSource = 'enhanced-unsplash';
                
                // Log relevance information
                console.log(`✅ Enhanced image loaded for slide ${slide.number}:`, {
                  imageUrl,
                  relevanceScore: selectedImage.relevanceScore,
                  theme: enhancedData.theme,
                  englishTheme: enhancedData.englishTheme,
                  searchTime: enhancedData.searchTime,
                  cacheHit: enhancedData.cacheHit
                });
              }
            }
          } catch (error) {
            console.warn(`⚠️ Erro ao buscar imagem enhanced para slide ${slide.number}:`, error);
            
            // Fallback to original Unsplash endpoint
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
                  imageSource = 'unsplash-fallback';
                  console.log(`✅ Fallback Unsplash image loaded for slide ${slide.number}:`, imageUrl);
                }
              }
            } catch (fallbackError) {
              console.warn(`⚠️ Fallback Unsplash also failed for slide ${slide.number}:`, fallbackError);
            }
          }
        }

        // 3. Se ambas falharem, usar placeholder
        if (!imageUrl) {
          imageUrl = `https://picsum.photos/800/400?random=${slide.number}`;
          imageSource = 'placeholder';
          console.log(`⚠️ Usando placeholder para slide ${slide.number}`);
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
        stages: finalSlides.map((slide, index) => ({
          etapa: slide.title || `Etapa ${index + 1}`,
          type: slide.type === 'quiz' ? 'Avaliação' : slide.type === 'closing' ? 'Encerramento' : 'Conteúdo',
          activity: {
            component: slide.type === 'quiz' ? 'QuizComponent' : 'AnimationSlide',
            content: slide.content,
            questions: slide.type === 'quiz' ? slide.questions : undefined,
            imageUrl: slide.imageUrl,
            imagePrompt: slide.imageQuery
          },
          route: `/${slide.type}`,
          estimatedTime: slide.timeEstimate || 5
        })),
        feedback: {
          pacing: metrics,
          validation: validation
        },
        slides: finalSlides,
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
