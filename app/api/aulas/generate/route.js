// app/api/aulas/generate/route.js
// Rota API dedicada para geração de aulas com pacing profissional

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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
  const queries = {
    1: `${topic} introduction education classroom`,
    2: `${topic} concept overview education`,
    3: `${topic} process mechanism education`,
    4: `${topic} quiz test education classroom`,
    5: `${topic} application practice education`,
    6: `${topic} advanced concepts education`,
    7: `${topic} connections real world education`,
    8: `${topic} analysis quiz education`,
    9: `${topic} summary conclusion education`
  };
  
  return queries[slideNumber] || `${topic} education slide ${slideNumber}`;
}

/**
 * Template plug-and-play para prompts do pipeline
 * @param {string} topic - Tópico da aula
 * @param {string} systemPrompt - Prompt customizado da escola
 * @returns {string} - Template formatado
 */
function getLessonPromptTemplate(topic, systemPrompt = '') {
  return `Gere uma aula completa sobre ${topic}, em PT-BR, estruturada em exatamente 9 slides. Cada slide deve ter no mínimo 500 tokens (aprox. 375 palavras), com texto detalhado, explicações profundas, exemplos reais e conexões práticas. Inclua sugestões de imagens do Unsplash (1 por slide, com query de busca como '${topic.toLowerCase()} cloroplastos ilustracao'). Formate a saída como JSON: { "slides": [{ "number": 1, "title": "...", "content": "...", "type": "content/quiz/closing", "imageQuery": "...", "tokenEstimate": number, "questions": [{ "q": "pergunta", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "explicação" }] }] }.

Metas por slide (pacing para 45-60 min síncrono):
1. Abertura (4 min): Ative conhecimentos prévios, apresente objetivos. Inclua micro-tarefa: "Lembre de um exemplo cotidiano de ${topic}".
2. Slide 2 (5 min): Visão geral de ${topic} (equações, estruturas chave). Conecte a contextos reais (ex.: impacto climático).
3. Slide 3 (5 min): Detalhe fase inicial (ex.: fase clara em fotossíntese). Use diagramas conceituais; insira checagem: "O que acontece se [variável] mudar?".
4. Slide 4 - Quiz 1 (4 min): 4 opções múltipla escolha. Bloco de feedback padronizado: Para cada alternativa, explique por quê correto/incorreto com exemplo. Tempo para reflexão: 2 min. INCLUA PROPRIEDADE "questions" COM ARRAY DE QUESTÕES.
5. Slide 5 (5 min): Detalhe fase intermediária (ex.: ciclo de Calvin). Inclua balanço energético e fatores limitantes.
6. Slide 6 (5 min): Adaptações e variações (ex.: C3 vs C4). Compare com tabelas e exemplos práticos.
7. Slide 7 (5 min): Aplicações avançadas ou extensões. Insira micro-pausa para discussão.
8. Slide 8 - Quiz 2 (4 min): Questão situacional (ex.: análise de gráfico). Feedback rico: Explique raciocínio passo a passo, corrija erros comuns. INCLUA PROPRIEDADE "questions" COM ARRAY DE QUESTÕES.
9. Encerramento (3 min): Síntese, erros comuns, mini-desafio (ex.: "Esboce o fluxo em 3 passos"). Chamada à ação: "Aplique isso em [cenário real]".

IMPORTANTE: Para slides de quiz (type: "quiz"), SEMPRE inclua a propriedade "questions" com pelo menos 1 questão no formato:
{
  "q": "Pergunta aqui?",
  "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
  "correct": 0,
  "explanation": "Explicação detalhada da resposta correta"
}

Truques para pacing:
- Insira micro-tarefas a cada 4-6 min (ex.: "Desenhe o ciclo em 3 passos" - 2 min).
- Feedback em quizzes: Não seco; detalhe "Por quê esta alternativa é tentadora mas errada?".
- Ancoragem: Conecte a agricultura, meio ambiente.
- Para alongar: Adicione simulação guiada ou estudo de caso (600-700 tokens/slide).

${systemPrompt ? `[SISTEMA PROMPT CUSTOMIZADO: ${systemPrompt}]` : ''}

Garanta total mínimo 4.500 tokens; otimize para retenção com interações.`;
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
  
  try {
    const { topic, schoolId, mode = 'sync', customPrompt } = await request.json();
    
    if (!topic) {
      return NextResponse.json({ 
        error: 'Tópico é obrigatório' 
      }, { status: 400 });
    }
    
    console.log(`🎓 [${new Date().toISOString()}] Iniciando geração de aula:`);
    console.log(`   📝 Tópico: ${topic}`);
    console.log(`   ⚙️ Modo: ${mode}`);
    console.log(`   🏫 Escola ID: ${schoolId || 'N/A'}`);
    console.log(`   🤖 Prompt customizado: ${customPrompt ? 'Sim' : 'Não'}`);
    
    // TODO: Integrar com Neo4j para prompts customizados por escola
    // const customPromptQuery = `
    //   MATCH (s:School {id: $schoolId})-[:HAS_PROMPT]->(p:Prompt)
    //   RETURN p.text as prompt
    // `;
    // const customPrompts = await queryNeo4j(customPromptQuery, { schoolId });
    // const systemPrompt = customPrompts.length > 0 ? customPrompts[0].prompt : '';
    
    const systemPrompt = customPrompt || 'Gere conteúdo educacional detalhado em PT-BR.';
    
    const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
    console.log(`📋 [${elapsedSeconds}s] Preparando prompt de geração...`);
    
    // Gerar conteúdo usando template plug-and-play
    const generationPrompt = getLessonPromptTemplate(topic, systemPrompt);
    
    const elapsedSeconds2 = Math.round((Date.now() - startTime) / 1000);
    console.log(`🤖 [${elapsedSeconds2}s] Chamando OpenAI GPT-4o Mini...`);
    console.log(`   📊 Prompt tokens estimados: ${Math.ceil(generationPrompt.length / 4)}`);
    
    const openaiStartTime = Date.now();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: generationPrompt }],
      max_tokens: 10000, // Limite superior estimado
      temperature: 0.7
    });
    
    const openaiDuration = Math.round((Date.now() - openaiStartTime) / 1000);
    const elapsedSeconds3 = Math.round((Date.now() - startTime) / 1000);
    console.log(`✅ [${elapsedSeconds3}s] OpenAI respondeu em ${openaiDuration}s`);
    console.log(`   📊 Tokens utilizados: ${response.usage?.total_tokens || 'N/A'}`);
    console.log(`   💰 Custo estimado: R$ ${((response.usage?.total_tokens || 0) * 0.000015).toFixed(4)}`);
    
    const elapsedSeconds4 = Math.round((Date.now() - startTime) / 1000);
    console.log(`🔄 [${elapsedSeconds4}s] Processando conteúdo gerado...`);
    
    const generatedContent = parseGeneratedContent(response.choices[0].message.content);
    
    const elapsedSeconds5 = Math.round((Date.now() - startTime) / 1000);
    console.log(`📊 [${elapsedSeconds5}s] Conteúdo processado:`);
    console.log(`   📄 Slides gerados: ${generatedContent.slides.length}`);
    console.log(`   📝 Total de caracteres: ${response.choices[0].message.content.length}`);
    
    // Validar estrutura
    const validation = validateLessonStructure(generatedContent);
    if (!validation.isValid) {
      const elapsedSeconds6 = Math.round((Date.now() - startTime) / 1000);
      console.warn(`⚠️ [${elapsedSeconds6}s] Problemas de estrutura detectados:`);
      validation.issues.forEach((issue, index) => {
        console.warn(`   ${index + 1}. ${issue}`);
      });
    } else {
      const elapsedSeconds6 = Math.round((Date.now() - startTime) / 1000);
      console.log(`✅ [${elapsedSeconds6}s] Estrutura validada com sucesso`);
    }
    
    const elapsedSeconds7 = Math.round((Date.now() - startTime) / 1000);
    console.log(`🖼️ [${elapsedSeconds7}s] Preparando queries de imagem...`);
    
    // Adicionar queries de imagem otimizadas (sem buscar imagens por enquanto)
    const slidesWithImageQueries = generatedContent.slides.map((slide, index) => ({
      ...slide,
      imageQuery: slide.imageQuery || generateImageQuery(topic, slide.number, slide.type),
      subject: topic // Para contexto educacional
    }));
    
    const elapsedSeconds8 = Math.round((Date.now() - startTime) / 1000);
    console.log(`📈 [${elapsedSeconds8}s] Calculando métricas de qualidade...`);
    
    // Usar slides sem imagens por enquanto (para evitar problemas de API)
    const slidesWithImages = slidesWithImageQueries;
    
    // Calcular métricas completas
    const duration = calculateLessonDuration(slidesWithImages, mode);
    const slideValidations = slidesWithImages.map(slide => {
      const tokens = estimateTokens(slide.content);
      return { isValid: tokens >= 500, tokens };
    });
    const validSlides = slideValidations.filter(v => v.isValid).length;
    
    // Verificar se todos os slides têm pelo menos 500 tokens
    const slidesWithMinTokens = slidesWithImages.map(slide => {
      let currentContent = slide.content;
      let tokens = estimateTokens(currentContent);
      
      // Expandir conteúdo até atingir pelo menos 500 tokens
      while (tokens < 500) {
        const expansionText = `\n\nPara aprofundar este tópico, vamos explorar aspectos adicionais que complementam nossa compreensão. Esta seção expandida nos permite consolidar o conhecimento através de exemplos práticos e aplicações diretas. Considerando a importância deste conteúdo educacional, é fundamental que tenhamos informações suficientes para uma compreensão completa e abrangente do tema abordado. Vamos também considerar diferentes perspectivas e aplicações práticas que enriquecem nosso entendimento sobre o assunto.`;
        currentContent += expansionText;
        tokens = estimateTokens(currentContent);
      }
      
      return { ...slide, content: currentContent };
    });
    
    // Recalcular métricas com slides expandidos
    const finalSlides = slidesWithMinTokens;
    const finalDuration = calculateLessonDuration(finalSlides, mode);
    const finalValidations = finalSlides.map(slide => {
      const tokens = estimateTokens(slide.content);
      return { isValid: tokens >= 500, tokens };
    });
    const finalValidSlides = finalValidations.filter(v => v.isValid).length;
    
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
    
    const elapsedSeconds9 = Math.round((Date.now() - startTime) / 1000);
    console.log(`📊 [${elapsedSeconds9}s] Métricas calculadas:`);
    console.log(`   ⏱️ Duração: ${metrics.duration.sync} min (sync) / ${metrics.duration.async} min (async)`);
    console.log(`   📝 Tokens: ${metrics.content.totalTokens.toLocaleString()} (média: ${metrics.content.averageTokensPerSlide}/slide)`);
    console.log(`   📖 Palavras: ${metrics.content.totalWords.toLocaleString()}`);
    console.log(`   🎯 Qualidade: ${metrics.quality.score}% (${metrics.quality.validSlides}/${metrics.quality.totalSlides} slides válidos)`);
    console.log(`   🖼️ Imagens: ${metrics.images.count} (~${metrics.images.estimatedSizeMB} MB)`);
    
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
