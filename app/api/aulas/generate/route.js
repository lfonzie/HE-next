// app/api/aulas/generate/route.js
// Rota API dedicada para geração de aulas com pacing profissional

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { randomizeQuizQuestions } from '@/lib/quiz-randomization';
import { ensureQuizFormat } from '@/lib/quiz-validation';
import { log } from '@/lib/lesson-logger';
import { logTokens } from '@/lib/token-logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
  // Tradução simples local sem usar APIs externas
  const translations = {
    'eletricidade': 'electricity', 'corrente': 'current', 'voltagem': 'voltage',
    'resistência': 'resistance', 'circuito': 'circuit', 'matemática': 'mathematics',
    'álgebra': 'algebra', 'geometria': 'geometry', 'história': 'history',
    'brasil': 'brazil', 'independência': 'independence', 'física': 'physics',
    'química': 'chemistry', 'biologia': 'biology', 'fotossíntese': 'photosynthesis',
    'célula': 'cell', 'dna': 'dna', 'genética': 'genetics', 'evolução': 'evolution',
    'geografia': 'geography', 'clima': 'climate', 'relevo': 'relief',
    'literatura': 'literature', 'português': 'portuguese', 'gramática': 'grammar',
    'redação': 'writing', 'filosofia': 'philosophy', 'sociologia': 'sociology',
    'arte': 'art', 'música': 'music', 'educação': 'education',
    'aprendizado': 'learning', 'ensino': 'teaching', 'estudo': 'study',
    'como': 'how', 'funciona': 'works', 'o que é': 'what is', 'definição': 'definition',
    'introdução': 'introduction', 'conceito': 'concept', 'fundamentos': 'fundamentals',
    'básico': 'basic', 'princípios': 'principles', 'teoria': 'theory',
    'prática': 'practice', 'aplicação': 'application', 'exemplo': 'example'
  };
  
  // Limpar e traduzir o tópico
  const cleanTopic = topic.toLowerCase()
    .replace(/[?¿!¡.,;:]/g, '') // Remove pontuação
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
  
  const englishTopic = cleanTopic.split(' ')
    .map(word => translations[word] || word)
    .join(' ');
  
  // Gerar query baseada no tipo de slide
  let query = '';
  
  if (slideNumber === 1) {
    // Slide de abertura - usar termos mais gerais e conceituais
    const mainKeyword = englishTopic.split(' ').filter(word => 
      word.length > 2 && 
      !['about', 'for', 'how', 'when', 'where', 'why', 'what', 'a', 'an', 'the', 'of', 'in', 'on', 'at', 'to', 'from'].includes(word)
    )[0] || englishTopic.split(' ')[0];
    
    query = `${mainKeyword} concept introduction`;
  } else if (slideNumber === 8) {
    // Slide de aprofundamento - usar termos mais específicos e técnicos
    const mainKeyword = englishTopic.split(' ').filter(word => 
      word.length > 2 && 
      !['about', 'for', 'how', 'when', 'where', 'why', 'what', 'a', 'an', 'the', 'of', 'in', 'on', 'at', 'to', 'from'].includes(word)
    )[0] || englishTopic.split(' ')[0];
    
    query = `${mainKeyword} diagram illustration`;
  } else if (slideNumber === 14) {
    // Slide de encerramento - usar termos de síntese
    const mainKeyword = englishTopic.split(' ').filter(word => 
      word.length > 2 && 
      !['about', 'for', 'how', 'when', 'where', 'why', 'what', 'a', 'an', 'the', 'of', 'in', 'on', 'at', 'to', 'from'].includes(word)
    )[0] || englishTopic.split(' ')[0];
    
    query = `${mainKeyword} summary conclusion`;
  } else {
    // Outros slides
    const mainKeyword = englishTopic.split(' ').filter(word => 
      word.length > 2 && 
      !['about', 'for', 'how', 'when', 'where', 'why', 'what', 'a', 'an', 'the', 'of', 'in', 'on', 'at', 'to', 'from'].includes(word)
    )[0] || englishTopic.split(' ')[0];
    
    query = mainKeyword;
  }
  
  console.log(`🔍 Query de imagem gerada para slide ${slideNumber}: ${query}`);
  
  return query;
}

function expandImageQuery(originalQuery, topic) {
  // Para fallback, tentar apenas com termos mais simples
  // Se a query original já tem múltiplas palavras, usar apenas a primeira palavra-chave
  const words = originalQuery.split(' ');
  if (words.length > 2) {
    return words[0]; // Usar apenas a primeira palavra
  }
  
  // Se a query é muito simples, adicionar apenas um termo educacional
  return `${originalQuery} education`;
}

// Função para gerar URL de imagem dinâmica baseada no tema
function generateDynamicImageUrl(topic, slideNumber, slideType) {
  const imageQuery = generateImageQuery(topic, slideNumber, slideType);
  
  // Usar Wikimedia Commons como fonte principal
  // Retorna um placeholder que será substituído pela API
  return `PLACEHOLDER_WIKIMEDIA_${encodeURIComponent(imageQuery)}`;
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
- Para quiz, INCLUA o campo "correct" como índice 0, 1, 2 ou 3 indicando a alternativa correta (0=A, 1=B, 2=C, 3=D); "options" deve conter exatamente 4 strings SEM prefixos de letras (A), B), etc.)
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
      "options": ["Alternativa A detalhada", "Alternativa B detalhada", "Alternativa C detalhada", "Alternativa D detalhada"],
      "correct": 0,
      "explanation": "Explicação detalhada da resposta correta e por que as outras alternativas estão incorretas"
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
- Para quiz: "correct" deve ser um número de 0 a 3 indicando a resposta correta (0=A, 1=B, 2=C, 3=D)
- As alternativas devem ser strings limpas SEM prefixos de letras (A), B), C), D) - apenas o texto da alternativa
- Use quebras de linha \\n\\n para separar parágrafos e melhorar a legibilidade
- Para diagramas e tabelas, use a sintaxe especial: <<<criar um diagrama da fotossíntese, sem letras somente imagem>>> ou <<<criar uma tabela comparativa>>>
- CRÍTICO: Cada slide deve ter um título ÚNICO e ESPECÍFICO ao tema "${topic}". NÃO use títulos genéricos como "Conceitos Fundamentais", "Aplicações Práticas", etc. Crie títulos que sejam específicos ao conteúdo de cada slide.
- GERE EXATAMENTE 14 SLIDES - NÃO MAIS, NÃO MENOS

Tópico: ${topic}

${systemPrompt ? `[SISTEMA PROMPT CUSTOMIZADO: ${systemPrompt}]` : ''}

Responda apenas com o JSON válido:`;
}

/**
 * Valida e corrige formato de quiz se necessário
 * @param {Object} slide - Slide de quiz
 * @returns {Object} - Slide corrigido
 */
function validateAndFixQuizSlide(slide) {
  if (slide.type !== 'quiz' || !slide.questions) {
    return slide;
  }
  
  const correctedQuestions = slide.questions.map(question => {
    const corrected = { ...question };
    
    // Validar e corrigir campo "correct"
    if (typeof corrected.correct === 'string') {
      const normalized = corrected.correct.toLowerCase();
      if (['a', 'b', 'c', 'd'].includes(normalized)) {
        corrected.correct = ['a', 'b', 'c', 'd'].indexOf(normalized);
        console.log(`🔧 Corrigido campo "correct" de "${question.correct}" para ${corrected.correct}`);
      } else if (/^[0-3]$/.test(normalized)) {
        corrected.correct = parseInt(normalized, 10);
        console.log(`🔧 Corrigido campo "correct" de "${question.correct}" para ${corrected.correct}`);
      } else {
        console.warn(`⚠️ Campo "correct" inválido: "${question.correct}", usando padrão 0`);
        corrected.correct = 0;
      }
    } else if (typeof corrected.correct === 'number') {
      if (corrected.correct < 0 || corrected.correct > 3) {
        console.warn(`⚠️ Campo "correct" fora do range: ${corrected.correct}, usando padrão 0`);
        corrected.correct = 0;
      }
    } else {
      console.warn(`⚠️ Campo "correct" tipo inválido: ${typeof corrected.correct}, usando padrão 0`);
      corrected.correct = 0;
    }
    
    // Validar opções
    if (!corrected.options || !Array.isArray(corrected.options) || corrected.options.length !== 4) {
      console.warn(`⚠️ Campo "options" inválido na questão: "${corrected.q}", usando opções padrão`);
      corrected.options = [
        "A) Opção A",
        "B) Opção B", 
        "C) Opção C",
        "D) Opção D"
      ];
    }
    
    return corrected;
  });
  
  return {
    ...slide,
    questions: correctedQuestions
  };
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
        // Validar e corrigir slides de quiz
        parsed.slides = parsed.slides.map(slide => validateAndFixQuizSlide(slide));
        return parsed;
      }
    }
    
    // Se não for JSON válido, tentar extrair JSON do texto
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.slides && Array.isArray(parsed.slides)) {
        // Validar e corrigir slides de quiz
        parsed.slides = parsed.slides.map(slide => validateAndFixQuizSlide(slide));
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
    const session = await getServerSession(authOptions).catch(() => null);
    
    // Contexto base para todos os logs desta requisição
    const baseContext = {
      requestId,
      topic,
      schoolId,
      mode,
      timestamp: new Date().toISOString()
    };
    
    // Define contexto compartilhado para reduzir repetição
    log.setSharedContext(baseContext);
    
    log.aulaStart(topic, mode, schoolId);
    
    if (!topic) {
      log.validationError('topic', topic, 'string não vazia');
      return NextResponse.json({ 
        error: 'Tópico é obrigatório' 
      }, { status: 400 });
    }
    
    // Timer para preparação do prompt
    const promptTimer = log.aulaTimer('preparacao-prompt');
    
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
    
    log.aulaTimerEnd(promptTimer, 'preparacao-prompt');
    
    log.aulaStep('📋 Prompt preparado', {
      promptLength: generationPrompt.length,
      estimatedTokens: Math.ceil(generationPrompt.length / 4),
      hasCustomPrompt: !!customPrompt
    });
    
    // Timer para chamada OpenAI
    const openaiTimer = log.aulaTimer('openai-generation');
    
    log.aulaOpenAI('gpt-4o-mini', Math.ceil(generationPrompt.length / 4), 0.7);
    
    const openaiStartTime = Date.now();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: generationPrompt }],
      max_tokens: 10000, // Limite superior estimado
      temperature: 0.7
    });
    
    const openaiDuration = Math.round((Date.now() - openaiStartTime) / 1000);
    log.aulaTimerEnd(openaiTimer, 'openai-generation');
    
    log.aulaResponse(
      openaiDuration,
      response.usage,
      response.choices[0]?.finish_reason,
      response.choices[0]?.message?.content?.length || 0
    );

    // Persist token usage (per module: Aulas)
    try {
      const totalTokens = (response.usage?.total_tokens) || ((response.usage?.prompt_tokens || 0) + (response.usage?.completion_tokens || 0)) || 0;
      const userId = session?.user?.id;
      if (userId && totalTokens > 0) {
        logTokens({
          userId,
          moduleGroup: 'Aulas',
          model: 'gpt-4o-mini',
          totalTokens,
          subject: topic,
          grade: undefined,
          messages: { requestId, mode }
        });
      }
    } catch (e) {
      console.warn('⚠️ [AULAS] Failed to log tokens:', e);
    }
    // Timer para parsing do conteúdo
    const parsingTimer = log.aulaTimer('parsing-conteudo');
    
    log.aulaParsing(
      response.choices[0]?.message?.content?.length || 0,
      ((response.usage?.total_tokens || 0) * 0.000015).toFixed(4)
    );
    
    const rawContent = response.choices[0]?.message?.content || '';
    const generatedContent = parseGeneratedContent(rawContent);
    
    log.aulaTimerEnd(parsingTimer, 'parsing-conteudo');
    
    log.parsing('conteudo-ia', true, {
      slidesCount: generatedContent.slides?.length || 0,
      rawContentLength: rawContent.length,
      parsedSuccessfully: !!generatedContent.slides
    });
    
    // Timer para validação
    const validationTimer = log.aulaTimer('validacao-estrutura');
    
    log.aulaStep('🔍 Validando estrutura da aula', {
      slidesCount: generatedContent.slides?.length || 0
    });
    
    const validation = validateLessonStructure(generatedContent);
    
    log.aulaTimerEnd(validationTimer, 'validacao-estrutura');
    
    if (!validation.isValid) {
      log.validationError('lesson-structure', generatedContent, 'estrutura válida');
      log.error('❌ Validação da estrutura falhou', {}, {
        errors: validation.errors,
        warnings: validation.warnings
      });
    } else {
      log.success('✅ Validação da estrutura passou', {}, {
        warnings: validation.warnings?.length || 0
      });
    }
    
    // Timer para preparação de imagens
    const imageTimer = log.aulaTimer('preparacao-imagens');
    
    log.aulaStep('🖼️ Preparando queries de imagem', {
      slidesCount: generatedContent.slides?.length || 0
    });
    
    // Adicionar queries de imagem otimizadas e URLs dinâmicas APENAS para slides 1, 8 e 14
    const slidesWithImageQueries = await Promise.all(generatedContent.slides.map(async (slide, index) => {
      // Apenas slides 1, 8 e 14 devem ter imagens (slide 7 é quiz, não tem imagem)
      if (slide.number === 1 || slide.number === 8 || slide.number === 14) {
        const imageQuery = slide.imageQuery || generateImageQuery(topic, slide.number, slide.type);
        
        // Usar apenas Wikimedia Commons para busca de imagens
        let imageUrl = null;
        let imageSource = 'fallback';

        // 1. Wikimedia Commons (prioritário) - buscar as 3 melhores imagens
        try {
          const wikiResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/wikimedia/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: imageQuery, subject: topic, count: 3 })
          });
          if (wikiResponse.ok) {
            const wikiData = await wikiResponse.json();
            if (wikiData.success && wikiData.photos && wikiData.photos.length > 0) {
              // Selecionar a melhor imagem das 3 (primeira é geralmente a melhor classificada)
              const bestImage = wikiData.photos[0];
              imageUrl = bestImage.urls?.regular || bestImage.url;
              imageSource = 'wikimedia';
              console.log(`✅ Melhor imagem Wikimedia Commons para slide ${slide.number} (de ${wikiData.photos.length} opções):`, imageUrl);
              console.log(`📊 Opções disponíveis:`, wikiData.photos.map((img, idx) => `${idx + 1}. ${img.title}`).join(', '));
            }
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao buscar imagem Wikimedia Commons para slide ${slide.number}:`, error);
        }

        // 2. Wikimedia Commons com query expandida (secundário) - buscar as 3 melhores imagens
        if (!imageUrl) {
          try {
            // Tentar com query expandida para melhor cobertura
            const expandedQuery = expandImageQuery(imageQuery, topic);
            const wikiResponse2 = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/wikimedia/search`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: expandedQuery, subject: topic, count: 3 })
            });
            if (wikiResponse2.ok) {
              const wikiData2 = await wikiResponse2.json();
              if (wikiData2.success && wikiData2.photos && wikiData2.photos.length > 0) {
                // Selecionar a melhor imagem das 3 (primeira é geralmente a melhor classificada)
                const bestImage = wikiData2.photos[0];
                imageUrl = bestImage.urls?.regular || bestImage.url;
                imageSource = 'wikimedia';
                console.log(`✅ Melhor imagem Wikimedia Commons (query expandida) para slide ${slide.number} (de ${wikiData2.photos.length} opções):`, imageUrl);
                console.log(`📊 Opções expandidas disponíveis:`, wikiData2.photos.map((img, idx) => `${idx + 1}. ${img.title}`).join(', '));
              }
            }
          } catch (error) {
            console.warn(`⚠️ Erro ao buscar imagem Wikimedia Commons expandida para slide ${slide.number}:`, error);
          }
        }

        // 3. Fallback final para Wikimedia placeholder
        if (!imageUrl) {
          imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/Education%20-%20The%20Noun%20Project.svg?width=800&height=400`;
          imageSource = 'wikimedia';
          console.log(`⚠️ Usando Wiki Commons placeholder para slide ${slide.number}`);
        }

        return {
          ...slide,
          imageQuery: imageQuery,
          imageUrl: imageUrl,
          imageSource: imageSource,
          subject: topic // Para contexto educacional
        };
      } else {
        // Slides intermediários não devem ter imagens (exceto 1, 8 e 14)
        return {
          ...slide,
          imageQuery: null,
          imageUrl: null,
          imageSource: null,
          subject: topic
        };
      }
    }));
    
    log.aulaTimerEnd(imageTimer, 'preparacao-imagens');
    
    // Timer para cálculo de métricas
    const metricsTimer = log.aulaTimer('calculo-metricas');
    
    log.aulaStep('📈 Calculando métricas de qualidade', {
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
    
    log.debug('📊 Validação inicial de tokens', {}, {
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
    
    log.debug('📊 Validação final de tokens', {}, {
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
    
    log.aulaTimerEnd(metricsTimer, 'calculo-metricas');
    
    log.performance('geracao-aula', metrics);
    
    log.success('📊 Métricas calculadas', {}, {
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
              // First normalize to strict format (q, options[4], correct index/letter, explanation)
              const normalized = ensureQuizFormat(slide.questions);
              
              // Check if questions are already randomized by looking for originalCorrect property
              const isAlreadyRandomized = normalized.some(q => q.hasOwnProperty('originalCorrect'));
              
              if (!isAlreadyRandomized) {
                processedQuestions = randomizeQuizQuestions(normalized);
                log.debug('🎲 Quiz questions randomized', {}, {
                  slideNumber: slide.number,
                  questionCount: processedQuestions.length
                });
              } else {
                log.debug('🎲 Quiz questions already randomized, skipping', {}, {
                  slideNumber: slide.number,
                  questionCount: normalized.length
                });
                processedQuestions = normalized;
              }
            } catch (error) {
              log.warn('⚠️ Failed to randomize quiz questions', {}, {
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
              const normalized = ensureQuizFormat(slide.questions);
              
              // Check if questions are already randomized by looking for originalCorrect property
              const isAlreadyRandomized = normalized.some(q => q.hasOwnProperty('originalCorrect'));
              
              if (!isAlreadyRandomized) {
                const randomizedQuestions = randomizeQuizQuestions(normalized);
                return {
                  ...slide,
                  questions: randomizedQuestions
                };
              } else {
                log.debug('🎲 Quiz questions already randomized in slides, skipping', {}, {
                  slideNumber: slide.number,
                  questionCount: normalized.length
                });
                return {
                  ...slide,
                  questions: normalized
                };
              }
            } catch (error) {
              log.warn('⚠️ Failed to randomize quiz questions in slides', {}, {
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

export const runtime = 'nodejs'
