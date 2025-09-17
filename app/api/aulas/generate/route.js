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
  // Limpar o tópico para criar queries mais específicas
  const cleanTopic = topic.toLowerCase()
    .replace(/[?¿!¡.,;:]/g, '') // Remove pontuação
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
  
  // Queries específicas por tipo de slide e número
  const queries = {
    1: `${cleanTopic} introduction concept overview`, // Abertura - conceito geral
    2: `${cleanTopic} fundamentals basics principles`, // Conceitos fundamentais
    3: `${cleanTopic} process mechanism steps`, // Desenvolvimento - processo
    4: `${cleanTopic} quiz test question`, // Quiz 1
    5: `${cleanTopic} application examples real world`, // Aplicações práticas
    6: `${cleanTopic} variations adaptations types`, // Variações
    7: `${cleanTopic} advanced connections relationships`, // Conexões avançadas
    8: `${cleanTopic} analysis evaluation assessment`, // Quiz 2
    9: `${cleanTopic} summary conclusion recap` // Encerramento
  };
  
  // Fallback mais específico se não encontrar
  const fallbackQueries = {
    1: `${cleanTopic} concept`,
    2: `${cleanTopic} basics`,
    3: `${cleanTopic} process`,
    4: `${cleanTopic} quiz`,
    5: `${cleanTopic} examples`,
    6: `${cleanTopic} types`,
    7: `${cleanTopic} advanced`,
    8: `${cleanTopic} analysis`,
    9: `${cleanTopic} summary`
  };
  
  return queries[slideNumber] || fallbackQueries[slideNumber] || `${cleanTopic} education`;
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

ESTRUTURA DA AULA (45-60 minutos):
1. Abertura: Apresente o tema e objetivos de aprendizagem
2. Conceitos fundamentais: Explique os princípios básicos
3. Desenvolvimento: Detalhe os processos principais
4. Quiz 1: Questão de múltipla escolha sobre conceitos básicos
5. Aplicações práticas: Mostre exemplos reais e casos de uso
6. Variações e adaptações: Explore diferentes contextos
7. Conexões avançadas: Relacione com outros conhecimentos
8. Quiz 2: Questão situacional ou de análise
9. Encerramento: Síntese e próximos passos

FORMATO JSON OBRIGATÓRIO:
{
  "slides": [
    {
      "number": 1,
      "title": "Título do slide",
      "content": "Conteúdo educativo detalhado (mínimo 300 palavras)",
      "type": "content",
      "imageQuery": "query para busca de imagem no Unsplash",
      "tokenEstimate": 400
    }
  ]
}

Para slides de quiz (type: "quiz"), inclua:
{
  "number": 4,
  "title": "Quiz: Conceitos Básicos",
  "content": "Conteúdo do quiz",
  "type": "quiz",
  "imageQuery": "query para imagem",
  "tokenEstimate": 300,
  "questions": [
    {
      "q": "Pergunta clara e objetiva?",
      "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
      "correct": 0,
      "explanation": "Explicação detalhada da resposta correta"
    }
  ]
}

IMPORTANTE: 
- O campo "content" deve conter APENAS conteúdo educativo
- NÃO inclua instruções como "imagine uma tabela" ou "crie um gráfico"
- Use linguagem direta e objetiva
- Foque em explicações claras e exemplos práticos
- O campo "imageQuery" deve ser específico e relevante ao conteúdo do slide
- Para slide 1 (abertura): use termos como "introduction", "concept", "overview"
- Para slide 9 (encerramento): use termos como "summary", "conclusion", "recap"
- Evite termos genéricos como "education", "classroom", "learning"

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
  
  if (lessonData.slides.length !== 9) {
    issues.push(`Deve ter exatamente 9 slides, encontrados ${lessonData.slides.length}`);
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
    issues.push(`${shortSlides.length} slide(s) com menos de 500 tokens`);
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
    
    // Adicionar queries de imagem otimizadas (sem buscar imagens por enquanto)
    const slidesWithImageQueries = generatedContent.slides.map((slide, index) => ({
      ...slide,
      imageQuery: slide.imageQuery || generateImageQuery(topic, slide.number, slide.type),
      subject: topic // Para contexto educacional
    }));
    
    log.timeEnd(imageTimer, 'preparacao-imagens', baseContext);
    
    // Timer para cálculo de métricas
    const metricsTimer = log.timeStart('calculo-metricas', baseContext);
    
    log.info('📈 Calculando métricas de qualidade', baseContext, {
      slidesCount: slidesWithImageQueries.length
    });
    
    // Usar slides sem imagens por enquanto (para evitar problemas de API)
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
    
    // TODO: Salvar no Neo4j
    // const saveQuery = `
    //   CREATE (l:Lesson {id: apoc.create.uuid(), topic: $topic, content: $content, tokens: $tokens, createdAt: datetime()})
    //   MERGE (s:School {id: $schoolId})-[:HAS_LESSON]->(l)
    //   RETURN l.id as id
    // `;
    // await queryNeo4j(saveQuery, { 
    //   topic, 
    //   content: JSON.stringify(slidesWithImages), 
    //   tokens: metrics.totalTokens, 
    //   schoolId 
    // });
    
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
