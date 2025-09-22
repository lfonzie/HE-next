// app/api/aulas/generate-gemini/route.js
// API route para geração de aulas usando Google Gemini com Vercel AI SDK

import { NextResponse } from 'next/server.js';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { generateText } from 'ai';


import { google } from '@ai-sdk/google';


import { ensureQuizFormat } from '@/lib/quiz-validation';


import { log } from '@/lib/lesson-logger';


import { logTokens } from '@/lib/token-logger';


import { selectThreeDistinctImages, validateImageSelection } from '@/lib/image-selection-enhanced';


import { getServerSession } from 'next-auth';


import { authOptions } from '@/lib/auth';



// Constants for configuration
const TOTAL_SLIDES = 14;
const QUIZ_SLIDE_NUMBERS = [7, 12];
const IMAGE_SLIDE_NUMBERS = [1, 8, 14];
const MIN_TOKENS_PER_SLIDE = 130; // Reduced from 500 to 130 for more realistic content generation
const GEMINI_MODEL = 'gemini-2.0-flash-exp';
const MAX_TOKENS = 8000;
const TEMPERATURE = 0.7;

// Initialize Gemini client via Vercel AI SDK
const geminiModel = google(GEMINI_MODEL);

// Translation dictionary for image query generation
const TRANSLATIONS = {
  eletricidade: 'electricity',
  corrente: 'current',
  voltagem: 'voltage',
  resistência: 'resistance',
  circuito: 'circuit',
  matemática: 'mathematics',
  álgebra: 'algebra',
  geometria: 'geometry',
  história: 'history',
  brasil: 'brazil',
  independência: 'independence',
  física: 'physics',
  química: 'chemistry',
  biologia: 'biology',
  fotossíntese: 'photosynthesis',
  célula: 'cell',
  dna: 'dna',
  genética: 'genetics',
  evolução: 'evolution',
  geografia: 'geography',
  clima: 'climate',
  relevo: 'relief',
  literatura: 'literature',
  português: 'portuguese',
  gramática: 'grammar',
  redação: 'writing',
  filosofia: 'philosophy',
  sociologia: 'sociology',
  arte: 'art',
  música: 'music',
  educação: 'education',
  aprendizado: 'learning',
  ensino: 'teaching',
  estudo: 'study',
  como: 'how',
  funciona: 'works',
  'o que é': 'what is',
  definição: 'definition',
  introdução: 'introduction',
  conceito: 'concept',
  fundamentos: 'fundamentals',
  básico: 'basic',
  princípios: 'principles',
  teoria: 'theory',
  prática: 'practice',
  aplicação: 'application',
  exemplo: 'example',
};

/**
 * Estimates the number of tokens in a text string.
 * @param {string} text - The input text.
 * @returns {number} Estimated token count.
 */
function estimateTokens(text) {
  return typeof text === 'string' ? Math.ceil(text.length / 4) : 0;
}

/**
 * Estimates the word count from tokens.
 * @param {number} tokens - The token count.
 * @returns {number} Estimated word count.
 */
function estimateWords(tokens) {
  return Math.round(tokens * 0.75);
}

/**
 * Calculates the duration of a lesson based on slides and mode.
 * @param {Array} slides - Array of slide objects.
 * @param {string} mode - Lesson mode ('sync' or 'async').
 * @returns {Object} Duration metrics including total minutes, tokens, and words.
 */
function calculateLessonDuration(slides, mode = 'sync') {
  if (!Array.isArray(slides) || slides.length === 0) {
    return { totalMinutes: 0, totalTokens: 0, totalWords: 0 };
  }

  const totalTokens = slides.reduce((sum, slide) => sum + estimateTokens(slide.content || ''), 0);
  const totalWords = estimateWords(totalTokens);

  if (mode === 'sync') {
    const expositionTime = totalWords / 130; // Words per minute for spoken content
    const pauses = expositionTime * 0.4; // 40% pause time
    const quizzesTime = QUIZ_SLIDE_NUMBERS.length * 4; // 4 minutes per quiz
    const closingTime = 2.5; // Fixed closing time
    return {
      totalMinutes: Math.round(expositionTime + pauses + quizzesTime + closingTime),
      totalTokens,
      totalWords,
    };
  } else {
    const readingTime = totalWords / 210; // Words per minute for reading
    const quizzesTime = QUIZ_SLIDE_NUMBERS.length * 4.5; // 4.5 minutes per quiz
    const interactionsTime = 6.5; // Fixed interaction time
    return {
      totalMinutes: Math.round(readingTime + quizzesTime + interactionsTime),
      totalTokens,
      totalWords,
    };
  }
}

/**
 * Gets the preferred provider for a specific slide to ensure diversity.
 * @param {number} slideNumber - The slide number.
 * @returns {string} The preferred provider for this slide.
 */
function getPreferredProviderForSlide(slideNumber) {
  const providers = ['wikimedia', 'unsplash', 'pixabay'];
  return providers[slideNumber % providers.length];
}

/**
 * Generates an educational image query optimized for student learning context.
 * @param {string} topic - The lesson topic.
 * @param {number} slideNumber - The slide number.
 * @param {string} slideType - The slide type ('content' or 'quiz').
 * @param {string} slideContent - The slide content for context.
 * @returns {string} The generated educational image query.
 */
function generateEducationalImageQuery(topic, slideNumber, slideType, slideContent = '') {
  const cleanTopic = topic
    .toLowerCase()
    .replace(/[?¿!¡.,;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Palavras-chave educacionais específicas por contexto em PT-BR
  const educationalKeywords = {
    introduction: ['fundamentos', 'conceitos básicos', 'introdução', 'definição', 'princípios'],
    content: ['diagrama', 'ilustração', 'processo', 'mecanismo', 'estrutura', 'fluxograma'],
    quiz: ['exemplo prático', 'aplicação real', 'caso de estudo', 'exercício', 'problema'],
    conclusion: ['resumo', 'conclusão', 'síntese', 'pontos principais', 'aplicações futuras']
  };

  // Determinar contexto do slide
  let context = 'content';
  if (slideNumber === 1) context = 'introduction';
  else if (slideNumber >= 8 && slideNumber <= 12) context = 'quiz';
  else if (slideNumber === 14) context = 'conclusion';

  // Extrair palavras-chave do conteúdo do slide
  const contentKeywords = slideContent
    .toLowerCase()
    .split(' ')
    .filter(word => word.length > 3 && !['para', 'com', 'que', 'uma', 'dos', 'das', 'pelo', 'pela', 'sobre', 'como', 'quando', 'onde', 'porque'].includes(word))
    .slice(0, 3);

  // Construir query educacional em PT-BR
  const baseQuery = cleanTopic;
  const contextKeywords = educationalKeywords[context] || educationalKeywords.content;
  const selectedContextKeyword = contextKeywords[Math.floor(Math.random() * contextKeywords.length)];
  
  // Combinar tópico, contexto educacional e palavras do conteúdo
  const educationalQuery = `${baseQuery} ${selectedContextKeyword} ${contentKeywords.join(' ')} educação aprendizado`.trim();
  
  log.debug('Generated educational image query', { 
    slideNumber, 
    context, 
    educationalQuery,
    contentKeywords: contentKeywords.slice(0, 2)
  });
  
  return educationalQuery;
}

/**
 * Selects the best educational image based on slide context and educational value.
 * @param {Array} images - Array of image objects from semantic search.
 * @param {number} slideNumber - The slide number.
 * @param {string} slideType - The slide type.
 * @param {Set} usedImageUrls - Set of already used image URLs for de-duplication.
 * @returns {Object} The best educational image.
 */
function selectBestEducationalImage(images, slideNumber, slideType, usedImageUrls = new Set()) {
  if (!images || images.length === 0) return null;

  // Priorizar provedores por qualidade educacional
  const providerPriority = {
    'wikimedia': 3, // Maior prioridade - conteúdo educacional confiável
    'unsplash': 2,  // Boa qualidade visual
    'pixabay': 1    // Boa variedade
  };

  // Calcular score educacional combinado
  const preferredProvider = getPreferredProviderForSlide(slideNumber);
  const scoredImages = images.map(image => {
    let educationalScore = image.score || 0;
    
    // Penalidade por repetição de imagem
    if (usedImageUrls.has(image.url)) {
      educationalScore -= 0.25;
    }
    
    // Bonus por provedor educacional
    educationalScore += (providerPriority[image.provider] || 0) * 0.1;
    
    // Bonus adicional para provedor preferido para este slide (rotação)
    if (image.provider === preferredProvider) {
      educationalScore += 0.15;
    }
    
    // Bonus por palavras-chave educacionais no título
    const educationalTerms = ['diagram', 'chart', 'graph', 'illustration', 'process', 'structure', 'mechanism', 'system', 'educational', 'learning', 'teaching'];
    const titleWords = (image.title || '').toLowerCase().split(' ');
    const educationalMatches = educationalTerms.filter(term => titleWords.includes(term)).length;
    educationalScore += educationalMatches * 0.05;
    
    // Bonus por licença educacional (Wikimedia tem licenças mais permissivas)
    if (image.provider === 'wikimedia') {
      educationalScore += 0.1;
    }
    
    return { ...image, educationalScore };
  });

  // Ordenar por score educacional
  scoredImages.sort((a, b) => b.educationalScore - a.educationalScore);
  
  // Selecionar primeira imagem não repetida
  const bestImage = scoredImages.find(img => !usedImageUrls.has(img.url)) || scoredImages[0];
  
  log.debug('Selected best educational image', {
    slideNumber,
    provider: bestImage.provider,
    preferredProvider,
    educationalScore: bestImage.educationalScore,
    originalScore: bestImage.score,
    title: bestImage.title,
    isRepeated: usedImageUrls.has(bestImage.url),
    isPreferredProvider: bestImage.provider === preferredProvider
  });
  
  return bestImage;
}

/**
 * Generates an image query for a specific slide based on the topic and slide type.
 * @param {string} topic - The lesson topic.
 * @param {number} slideNumber - The slide number.
 * @param {string} slideType - The slide type ('content' or 'quiz').
 * @returns {string} The generated image query.
 */
function generateImageQuery(topic, slideNumber, slideType) {
  const cleanTopic = topic
    .toLowerCase()
    .replace(/[?¿!¡.,;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const englishTopic = cleanTopic
    .split(' ')
    .map(word => TRANSLATIONS[word] || word)
    .join(' ');

  const mainKeyword = englishTopic
    .split(' ')
    .filter(word => word.length > 2 && !['about', 'for', 'how', 'when', 'where', 'why', 'what', 'a', 'an', 'the', 'of', 'in', 'on', 'at', 'to', 'from'].includes(word))
    .shift() || englishTopic.split(' ')[0];

  let query;
  if (slideNumber === 1) {
    query = `${mainKeyword} concept introduction`;
  } else if (slideNumber === 8) {
    query = `${mainKeyword} diagram illustration`;
  } else if (slideNumber === 14) {
    query = `${mainKeyword} summary conclusion`;
  } else {
    query = mainKeyword;
  }

  log.debug('Generated image query', { slideNumber, query });
  return query;
}

/**
 * Generates a lesson prompt template optimized for Gemini.
 * @param {string} topic - The lesson topic.
 * @param {string} [systemPrompt=''] - Custom system prompt.
 * @returns {string} The formatted prompt.
 */
function getGeminiLessonPromptTemplate(topic, systemPrompt = '') {
  return `Você é um professor especialista em ${topic}. Crie uma aula completa e envolvente estruturada em exatamente ${TOTAL_SLIDES} slides usando Google Gemini.

REGRAS CRÍTICAS:
- Responda APENAS com JSON válido, sem texto adicional, markdown ou formatação
- Cada slide deve ter conteúdo educativo direto, com mínimo ${MIN_TOKENS_PER_SLIDE} tokens
- Use linguagem clara e didática em português brasileiro
- Use \\n\\n para quebras de linha entre parágrafos
- Para quizzes, inclua "correct" (0-3) e "options" com 4 strings sem prefixos (A, B, etc.)
- EMBARALHE as alternativas dos quizzes para variar a posição da resposta correta
- Use diferentes posições para a resposta correta (0, 1, 2 ou 3) em cada quiz
- Crie títulos específicos e únicos para cada slide, evitando termos genéricos
- Para imageQuery, use termos específicos do tema traduzidos para inglês

ESTRUTURA OBRIGATÓRIA:
1. Abertura: [Título introdutório específico]
2-6. [Títulos sobre conceitos, desenvolvimento, aplicações, variações, conexões]
7. Quiz: [Título sobre conceitos básicos]
8-11. [Títulos sobre aprofundamento, exemplos, análise crítica, síntese]
12. Quiz: [Título sobre análise situacional]
13-14. [Títulos sobre aplicações futuras e síntese final]

FORMATO JSON ESTRITO:
{
  "slides": [
    {
      "number": 1,
      "title": "[Título específico e único]",
      "content": "Conteúdo detalhado\n\nParágrafo 2\n\nParágrafo 3",
      "type": "content",
      "imageQuery": "[query específica em inglês ou null]",
      "tokenEstimate": ${MIN_TOKENS_PER_SLIDE}
    },
    {
      "number": 7,
      "title": "Quiz: [Título específico sobre conceitos básicos]",
      "content": "Contexto detalhado do quiz com cenário prático.\\n\\nExplicação do que será avaliado e por que é importante.\\n\\nConecte com os conceitos aprendidos nos slides anteriores.",
      "type": "quiz",
      "imageQuery": null,
      "tokenEstimate": ${MIN_TOKENS_PER_SLIDE},
      "points": 0,
      "questions": [
        {
          "q": "Primeira pergunta clara que exige aplicação dos conceitos aprendidos?",
          "options": ["Primeira alternativa", "Segunda alternativa", "Terceira alternativa", "Quarta alternativa"],
          "correct": 0,
          "explanation": "Explicação detalhada da resposta correta com justificativa completa e conexão com os conceitos anteriores"
        },
        {
          "q": "Segunda pergunta clara que exige aplicação dos conceitos aprendidos?",
          "options": ["Primeira alternativa", "Segunda alternativa", "Terceira alternativa", "Quarta alternativa"],
          "correct": 2,
          "explanation": "Explicação detalhada da resposta correta com justificativa completa e conexão com os conceitos anteriores"
        },
        {
          "q": "Terceira pergunta clara que exige aplicação dos conceitos aprendidos?",
          "options": ["Primeira alternativa", "Segunda alternativa", "Terceira alternativa", "Quarta alternativa"],
          "correct": 1,
          "explanation": "Explicação detalhada da resposta correta com justificativa completa e conexão com os conceitos anteriores"
        }
      ]
    },
    {
      "number": 12,
      "title": "Quiz: [Título específico sobre análise situacional]",
      "content": "Contexto detalhado do segundo quiz com cenário prático.\\n\\nExplicação do que será avaliado e por que é importante.\\n\\nConecte com os conceitos aprendidos nos slides anteriores.",
      "type": "quiz",
      "imageQuery": null,
      "tokenEstimate": ${MIN_TOKENS_PER_SLIDE},
      "points": 0,
      "questions": [
        {
          "q": "Primeira pergunta do segundo quiz que exige análise crítica?",
          "options": ["Primeira alternativa", "Segunda alternativa", "Terceira alternativa", "Quarta alternativa"],
          "correct": 3,
          "explanation": "Explicação detalhada da resposta correta com justificativa completa e conexão com os conceitos anteriores"
        },
        {
          "q": "Segunda pergunta do segundo quiz que exige análise crítica?",
          "options": ["Primeira alternativa", "Segunda alternativa", "Terceira alternativa", "Quarta alternativa"],
          "correct": 0,
          "explanation": "Explicação detalhada da resposta correta com justificativa completa e conexão com os conceitos anteriores"
        },
        {
          "q": "Terceira pergunta do segundo quiz que exige análise crítica?",
          "options": ["Primeira alternativa", "Segunda alternativa", "Terceira alternativa", "Quarta alternativa"],
          "correct": 2,
          "explanation": "Explicação detalhada da resposta correta com justificativa completa e conexão com os conceitos anteriores"
        }
      ]
    }
  ]
}

Tópico: ${topic}
${systemPrompt ? `[Custom Prompt: ${systemPrompt}]` : ''}

IMPORTANTE: 
- Use \\n\\n para quebras de linha no conteúdo
- EMBARALHE as alternativas dos quizzes para variar a posição da resposta correta
- Use diferentes posições para a resposta correta (0, 1, 2 ou 3) em cada quiz
- Para o Quiz 1 (slide 7): use posições variadas (0, 1, 2, 3) para as 3 perguntas
- Para o Quiz 2 (slide 12): use posições variadas (0, 1, 2, 3) para as 3 perguntas
- Cada quiz deve ter EXATAMENTE 3 perguntas
- Responda APENAS com JSON válido. Não inclua texto adicional, explicações ou formatação markdown.`;
}

/**
 * Validates and corrects quiz slide format.
 * @param {Object} slide - The slide object.
 * @returns {Object} The corrected slide.
 */
function validateAndFixQuizSlide(slide) {
  if (slide.type !== 'quiz' || !slide.questions) return slide;

  const correctedQuestions = slide.questions.map((question, index) => {
    let { correct, options } = question;

    if (typeof correct === 'string') {
      const normalized = correct.toLowerCase();
      correct = ['a', 'b', 'c', 'd'].indexOf(normalized);
      if (correct === -1) correct = 0;
      log.debug('Corrected quiz answer', { slideNumber: slide.number, questionIndex: index + 1, newCorrect: correct });
    } else if (typeof correct !== 'number' || correct < 0 || correct > 3) {
      correct = 0;
      log.warn('Invalid quiz answer', { slideNumber: slide.number, questionIndex: index + 1 });
    }

    if (!Array.isArray(options) || options.length !== 4) {
      options = ['Opção A', 'Opção B', 'Opção C', 'Opção D'];
      log.warn('Invalid quiz options', { slideNumber: slide.number, questionIndex: index + 1 });
    }

    return { ...question, correct, options };
  });

  return { ...slide, questions: correctedQuestions };
}

/**
 * Parses generated content into structured slides.
 * @param {string} content - The raw content from Gemini.
 * @returns {Object} The parsed lesson object.
 */
function parseGeminiContent(content) {
  try {
    // Clean the content to extract JSON
    let cleanContent = content.trim();
    
    // Remove markdown code blocks if present
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```\n?/g, '').replace(/```\n?/g, '');
    }
    
    // Try to find JSON object
    if (cleanContent.startsWith('{')) {
      const parsed = JSON.parse(cleanContent);
      if (parsed.slides && Array.isArray(parsed.slides)) {
        return { slides: parsed.slides }; // Validação de qualidade desabilitada
      }
    }

    // Try to extract JSON from the content
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.slides && Array.isArray(parsed.slides)) {
        return { slides: parsed.slides }; // Validação de qualidade desabilitada
      }
    }

    log.warn('Failed to parse Gemini content, using fallback');
    return {
      slides: Array.from({ length: TOTAL_SLIDES }, (_, i) => ({
        number: i + 1,
        title: `Slide ${i + 1}`,
        content: `Conteúdo do slide ${i + 1}`,
        type: QUIZ_SLIDE_NUMBERS.includes(i + 1) ? 'quiz' : i + 1 === TOTAL_SLIDES ? 'closing' : 'content',
        imageQuery: IMAGE_SLIDE_NUMBERS.includes(i + 1) ? 'placeholder' : null,
        tokenEstimate: MIN_TOKENS_PER_SLIDE,
      })),
    };
  } catch (error) {
    log.error('Error parsing Gemini content', { error: (error as Error).message });
    throw new Error('Failed to process Gemini response');
  }
}

/**
 * Validates the lesson structure.
 * @param {Object} lessonData - The lesson data object.
 * @returns {Object} Validation result with issues and metrics.
 */
function validateLessonStructure(lessonData) {
  const issues = [];

  if (!lessonData.slides || !Array.isArray(lessonData.slides)) {
    issues.push('Invalid slides structure');
    return { isValid: false, issues, metrics: { totalSlides: 0, quizSlides: 0, shortSlides: 0 } };
  }

  if (lessonData.slides.length !== TOTAL_SLIDES) {
    issues.push(`Expected ${TOTAL_SLIDES} slides, found ${lessonData.slides.length}`);
  }

  const quizSlides = lessonData.slides.filter(slide => slide.type === 'quiz');
  if (quizSlides.length !== QUIZ_SLIDE_NUMBERS.length) {
    issues.push(`Expected ${QUIZ_SLIDE_NUMBERS.length} quiz slides, found ${quizSlides.length}`);
  }

  quizSlides.forEach((slide, index) => {
    if (!slide.questions || !Array.isArray(slide.questions) || slide.questions.length === 0) {
      issues.push(`Quiz slide ${index + 1} has invalid questions`);
    } else {
      slide.questions.forEach((question, qIndex) => {
        if (!question.q || !Array.isArray(question.options) || question.options.length !== 4) {
          issues.push(`Question ${qIndex + 1} in quiz ${index + 1} has invalid structure`);
        }
        if (question.correct === undefined || question.correct < 0 || question.correct > 3) {
          issues.push(`Question ${qIndex + 1} in quiz ${index + 1} has invalid correct answer`);
        }
      });
    }
  });

  const shortSlides = lessonData.slides.filter(slide => estimateTokens(slide.content) < MIN_TOKENS_PER_SLIDE);
  if (shortSlides.length > 0) {
    // Only warn if more than 50% of slides are short, otherwise it's acceptable
    if (shortSlides.length > lessonData.slides.length * 0.5) {
      issues.push(`${shortSlides.length} slide(s) with fewer than ${MIN_TOKENS_PER_SLIDE} tokens`);
    } else {
      // Log as warning but don't fail validation
      log.warn('Some slides have fewer tokens than recommended', { 
        shortSlides: shortSlides.length, 
        totalSlides: lessonData.slides.length,
        threshold: MIN_TOKENS_PER_SLIDE 
      });
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    metrics: {
      totalSlides: lessonData.slides.length,
      quizSlides: quizSlides.length,
      shortSlides: shortSlides.length,
    },
  };
}

/**
 * Handles POST requests to generate a lesson using Gemini.
 * @param {Request} request - The incoming request.
 * @returns {Promise<NextResponse>} The response object.
 */
export async function POST(request) {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  try {
    const { topic, schoolId: originalSchoolId, mode = 'sync', customPrompt } = await request.json();
    const session = await getServerSession(authOptions);

    // Create mutable schoolId variable
    let schoolId = originalSchoolId;

    log.setSharedContext({ requestId, topic, schoolId, mode, timestamp: new Date().toISOString() });
    log.info('Starting Gemini lesson generation', { topic, mode, schoolId });

    // Validate inputs
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      log.error('Validation failed', { field: 'topic', value: topic });
      return NextResponse.json({ error: 'Topic is required and must be a non-empty string' }, { status: 400 });
    }
    if (!['sync', 'async'].includes(mode)) {
      log.error('Validation failed', { field: 'mode', value: mode });
      return NextResponse.json({ error: 'Mode must be "sync" or "async"' }, { status: 400 });
    }
    
    // Validate schoolId context
    if (mode === 'sync' && (!schoolId || schoolId.trim() === '')) {
      log.warn('SchoolId is empty for sync mode', { schoolId, mode });
      // Use default school profile instead of failing
      const defaultSchoolId = 'default-school-profile';
      log.info('Using default school profile', { originalSchoolId: schoolId, defaultSchoolId });
      schoolId = defaultSchoolId;
    }

    // Check if Gemini API key is configured
    if (!process.env.GOOGLE_GEMINI_API_KEY && !process.env.GOOGLE_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      log.error('Gemini API key not configured');
      return NextResponse.json({ 
        error: 'Gemini API key not configured. Please set GOOGLE_GEMINI_API_KEY, GOOGLE_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY environment variable.' 
      }, { status: 500 });
    }

    const promptTimer = log.aulaTimer('prompt-preparation');
    const systemPrompt = customPrompt || 'Generate detailed educational content in Brazilian Portuguese using Gemini.';
    const generationPrompt = getGeminiLessonPromptTemplate(topic, systemPrompt);
    log.aulaTimerEnd(promptTimer, 'prompt-preparation');

    const geminiTimer = log.aulaTimer('gemini-generation');
    const geminiStartTime = Date.now();
    
    try {
      const response = await generateText({
        model: geminiModel,
        prompt: generationPrompt,
        temperature: TEMPERATURE,
      });
      
      const geminiDuration = Math.round((Date.now() - geminiStartTime) / 1000);
      log.aulaTimerEnd(geminiTimer, 'gemini-generation');

      log.info('Gemini response', {
        duration: geminiDuration,
        usage: response.usage,
        finishReason: response.finishReason,
        contentLength: response.text?.length || 0,
      });

      // Log token usage
      const totalTokens = response.usage?.totalTokens || 0;
      if (session?.user?.id && totalTokens > 0) {
        await logTokens({
          userId: session.user.id,
          moduleGroup: 'Aulas',
          model: GEMINI_MODEL,
          totalTokens,
          subject: topic,
          messages: { requestId, mode, provider: 'gemini' },
        });
      }

      const parsingTimer = log.aulaTimer('content-parsing');
      const parsedContent = parseGeminiContent(response.text);
      log.aulaTimerEnd(parsingTimer, 'content-parsing');

      // Validação de qualidade desabilitada - slides já estão bons
      // const validationTimer = log.aulaTimer('structure-validation');
      // const validation = validateLessonStructure(parsedContent);
      // log.aulaTimerEnd(validationTimer, 'structure-validation');

      // if (!validation.isValid) {
      //   log.error('Structure validation failed', { issues: validation.issues });
      // }

      const imageTimer = log.aulaTimer('image-preparation');
      
      // Sistema avançado de seleção de imagens - 3 imagens distintas, 1 por provedor
      let selectedImages = [];
      try {
        selectedImages = await selectThreeDistinctImages(topic);
        
        // Validar seleção
        const validation = validateImageSelection(selectedImages);
        if (!validation.isValid) {
          log.warn('Image selection validation failed', { issues: validation.issues });
        }
        
        log.info('Selected distinct images', {
          totalImages: selectedImages.length,
          providers: [...new Set(selectedImages.map(img => img.provider))],
          validation: validation.metrics
        });
        
      } catch (error) {
        log.error('Failed to select distinct images', { error: (error as Error).message });
        selectedImages = [];
      }
      
      // Mapear imagens para slides
      let imageIndex = 0;
      const slidesWithImageQueries = await Promise.all(
        parsedContent.slides.map(async slide => {
          // Validar e corrigir slides de quiz
          const validatedSlide = validateAndFixQuizSlide(slide);
          if (IMAGE_SLIDE_NUMBERS.includes(validatedSlide.number)) {
            let imageUrl = null;
            let imageSource = 'fallback';
            let imageMetadata = null;

            // Usar imagem selecionada se disponível
            if (imageIndex < selectedImages.length) {
              const selectedImage = selectedImages[imageIndex];
              imageUrl = selectedImage.url;
              imageSource = `enhanced-${selectedImage.provider}`;
              imageMetadata = {
                provider: selectedImage.provider,
                title: selectedImage.title,
                attribution: selectedImage.attribution,
                license: selectedImage.license,
                author: selectedImage.author,
                sourceUrl: selectedImage.sourceUrl
              };
              
              log.info('Using enhanced image selection', { 
                slideNumber: validatedSlide.number, 
                imageUrl, 
                source: imageSource,
                provider: selectedImage.provider,
                title: selectedImage.title?.slice(0, 50)
              });
              
              imageIndex++;
            }

            // Se ainda não encontrou imagem, tentar busca específica no Wikimedia como fallback
            if (!imageUrl) {
              try {
                const imageQuery = generateImageQuery(topic, validatedSlide.number, validatedSlide.type);
                const wikiResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/wikimedia/search`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ query: imageQuery, subject: topic, count: 1 }),
                });
                if (wikiResponse.ok) {
                  const wikiData = await wikiResponse.json();
                  if (wikiData.success && wikiData.photos?.length > 0) {
                    imageUrl = wikiData.photos[0].urls?.regular || wikiData.photos[0].url;
                    imageSource = 'wikimedia-fallback';
                    log.info('Wikimedia fallback image selected', { slideNumber: validatedSlide.number, imageUrl });
                  }
                }
              } catch (error) {
                log.warn('Failed to fetch Wikimedia fallback image', { slideNumber: validatedSlide.number, error: (error as Error).message });
              }
            }

            // Último recurso: buscar imagem específica do tópico no Unsplash
            if (!imageUrl) {
              try {
                const imageQuery = generateImageQuery(topic, validatedSlide.number, validatedSlide.type);
                const unsplashResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/illustrations/search`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    query: imageQuery, 
                    category: topic.toLowerCase().includes('biologia') ? 'biology' : 
                             topic.toLowerCase().includes('química') ? 'chemistry' :
                             topic.toLowerCase().includes('física') ? 'physics' :
                             topic.toLowerCase().includes('matemática') ? 'math' : 'general',
                    limit: 1 
                  }),
                });
                if (unsplashResponse.ok) {
                  const unsplashData = await unsplashResponse.json();
                  if (unsplashData.success && unsplashData.images?.length > 0) {
                    imageUrl = unsplashData.images[0].url;
                    imageSource = 'unsplash-specific';
                    log.info('Unsplash specific image selected', { slideNumber: validatedSlide.number, imageUrl });
                  }
                }
              } catch (error) {
                log.warn('Failed to fetch Unsplash specific image', { slideNumber: validatedSlide.number, error: (error as Error).message });
              }
            }

            return { 
              ...validatedSlide, 
              imageQuery: validatedSlide.imageQuery || generateImageQuery(topic, validatedSlide.number, validatedSlide.type),
              imageUrl, 
              imageSource, 
              imageMetadata,
              subject: topic 
            };
          }
          return { ...validatedSlide, imageQuery: null, imageUrl: null, imageSource: null, subject: topic };
        })
      );
      log.aulaTimerEnd(imageTimer, 'image-preparation');

      const metricsTimer = log.aulaTimer('metrics-calculation');
      const finalSlides = slidesWithImageQueries;
      const duration = calculateLessonDuration(finalSlides, mode);
      // Validação de qualidade desabilitada - slides já estão bons
      // const slideValidations = finalSlides.map(slide => ({
      //   isValid: estimateTokens(slide.content) >= MIN_TOKENS_PER_SLIDE,
      //   tokens: estimateTokens(slide.content),
      // }));
      // const validSlides = slideValidations.filter(v => v.isValid).length;

      const metrics = {
        duration: {
          sync: duration.totalMinutes,
          async: Math.round(duration.totalMinutes * 0.7),
        },
        content: {
          totalTokens: duration.totalTokens,
          totalWords: duration.totalWords,
          averageTokensPerSlide: Math.round(duration.totalTokens / finalSlides.length),
        },
        // quality: {
        //   score: Math.round((validSlides / finalSlides.length) * 100),
        //   validSlides,
        //   totalSlides: finalSlides.length,
        // },
        images: {
          count: finalSlides.filter(slide => slide.imageUrl).length,
          estimatedSizeMB: Math.round(finalSlides.length * 0.35 * 100) / 100,
        },
      };
      log.aulaTimerEnd(metricsTimer, 'metrics-calculation');

      const responseData = {
        success: true,
        lesson: {
          id: `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
          title: topic,
          subject: topic,
          level: 'Intermediário',
          objectives: [
            `Compreender os conceitos fundamentais sobre ${topic}`,
            `Aplicar conhecimentos através de atividades práticas`,
            `Desenvolver pensamento crítico sobre o tema`,
            `Conectar o aprendizado com situações do cotidiano`,
          ],
          stages: finalSlides.map((slide, index) => ({
            etapa: slide.title || `Etapa ${index + 1}`,
            type: slide.type === 'quiz' ? 'Avaliação' : slide.type === 'closing' ? 'Encerramento' : 'Conteúdo',
            activity: {
              component: slide.type === 'quiz' ? 'QuizComponent' : 'AnimationSlide',
              content: slide.content,
              questions: slide.type === 'quiz' ? ensureQuizFormat(slide.questions) : undefined,
              imageUrl: slide.imageUrl,
              imagePrompt: slide.imageQuery,
            },
            route: `/${slide.type}`,
            estimatedTime: slide.timeEstimate || 5,
          })),
          feedback: { pacing: metrics },
          slides: finalSlides.map(slide => ({
            ...slide,
            questions: slide.type === 'quiz' ? ensureQuizFormat(slide.questions) : undefined,
          })),
          metadata: {
            subject: topic,
            grade: 'Ensino Médio',
            duration: `${metrics.duration.sync} minutos`,
            difficulty: 'Intermediário',
            tags: [topic.toLowerCase()],
            provider: 'gemini',
            model: GEMINI_MODEL,
          },
        },
        topic,
        mode,
        slides: finalSlides,
        metrics,
        validation: {
          isValid: true,
          issues: [],
          recommendations: [],
        },
        usage: {
          promptTokens: (response.usage as any)?.promptTokens || 0,
          completionTokens: (response.usage as any)?.completionTokens || 0,
          totalTokens,
          costEstimate: (totalTokens * 0.000075).toFixed(6), // Gemini 2.0 Flash pricing: ~$0.000075 per 1K tokens
          pricingNote: 'Estimated cost based on Gemini 2.0 Flash pricing. Verify with current Google AI Studio pricing.',
          provider: 'gemini',
          model: GEMINI_MODEL,
        },
      };

      const totalDuration = Math.round((Date.now() - startTime) / 1000);
      log.info('Gemini lesson generated successfully', {
        totalDuration,
        slides: finalSlides.length,
        // qualityScore: metrics.quality.score, // Validação de qualidade desabilitada
        costEstimate: responseData.usage.costEstimate,
      });

      return NextResponse.json(responseData);

    } catch (geminiError) {
      log.error('Gemini API error', { error: (geminiError as Error).message });
      throw new Error(`Gemini API error: ${(geminiError as Error).message}`);
    }

  } catch (error) {
    const totalDuration = Math.round((Date.now() - startTime) / 1000);
    log.error('Gemini lesson generation failed', { error: (error as Error).message, duration: totalDuration });

    let statusCode = 500;
    let friendlyError = 'Internal server error';

    if ((error as Error).message.includes('API key')) {
      friendlyError = 'Invalid Gemini API key configuration';
      statusCode = 500;
    } else if ((error as Error).message.includes('rate limit')) {
      friendlyError = 'Gemini rate limit exceeded. Please try again later.';
      statusCode = 429;
    } else if ((error as Error).message.includes('Topic')) {
      friendlyError = (error as Error).message;
      statusCode = 400;
    }

    return NextResponse.json(
      { error: friendlyError, details: (error as Error).message, timestamp: new Date().toISOString() },
      { status: statusCode }
    );
  }
}

export const runtime = 'nodejs';
