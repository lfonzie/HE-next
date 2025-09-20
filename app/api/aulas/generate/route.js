// app/api/aulas/generate/route.js
// Dedicated API route for generating educational lessons with professional pacing

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ensureQuizFormat } from '@/lib/quiz-validation';
import { log } from '@/lib/lesson-logger';
import { logTokens } from '@/lib/token-logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Constants for configuration
const TOTAL_SLIDES = 14;
const QUIZ_SLIDE_NUMBERS = [7, 12];
const IMAGE_SLIDE_NUMBERS = [1, 8, 14];
const MIN_TOKENS_PER_SLIDE = 130; // Reduced from 500 to 130 for more realistic content generation
const OPENAI_MODEL = 'gpt-4o-mini';
const MAX_TOKENS = 10000;
const TEMPERATURE = 0.7;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
 * Expands an image query for fallback searches.
 * @param {string} originalQuery - The original image query.
 * @param {string} topic - The lesson topic.
 * @returns {string} The expanded query.
 */
function expandImageQuery(originalQuery, topic) {
  const words = originalQuery.split(' ');
  return words.length > 2 ? words[0] : `${originalQuery} education`;
}

/**
 * Generates a lesson prompt template.
 * @param {string} topic - The lesson topic.
 * @param {string} [systemPrompt=''] - Custom system prompt.
 * @returns {string} The formatted prompt.
 */
function getLessonPromptTemplate(topic, systemPrompt = '') {
  return `
Você é um professor especialista em ${topic}. Crie uma aula completa e envolvente estruturada em exatamente ${TOTAL_SLIDES} slides.

REGRAS CRÍTICAS:
- Responda APENAS com JSON válido, sem texto adicional.
- Cada slide deve ter conteúdo educativo DIRETO e DETALHADO, com mínimo ${MIN_TOKENS_PER_SLIDE} tokens (≈98 palavras).
- Use linguagem clara e didática em português brasileiro.
- Use \\n\\n para quebras de linha entre parágrafos.
- Para quizzes, inclua "correct" (0-3) e "options" com 4 strings sem prefixos (A, B, etc.).
- Crie títulos específicos e únicos para cada slide, evitando termos genéricos.

CONTEÚDO OBRIGATÓRIO POR SLIDE:
- Mínimo 3-4 parágrafos por slide de conteúdo
- Cada parágrafo deve ter 3-4 frases completas
- Inclua exemplos práticos e explicações detalhadas
- Use conectivos para fluidez: "Além disso", "Por exemplo", "Dessa forma", "Portanto"
- Para slides de conteúdo: explique conceitos, mecanismos, aplicações e conexões
- Para quizzes: contexto detalhado + pergunta + alternativas explicativas

ESTRUTURA:
1. Abertura: [Título introdutório]
2-6. [Títulos sobre conceitos, desenvolvimento, aplicações, variações, conexões]
7. Quiz: [Título sobre conceitos básicos]
8-11. [Títulos sobre aprofundamento, exemplos, análise crítica, síntese]
12. Quiz: [Título sobre análise situacional]
13-14. [Títulos sobre aplicações futuras e síntese final]

FORMATO JSON:
{
  "slides": [
    {
      "number": 1,
      "title": "[Título específico e descritivo]",
      "content": "Primeiro parágrafo com introdução detalhada do conceito.\\n\\nSegundo parágrafo com explicação dos mecanismos principais.\\n\\nTerceiro parágrafo com exemplos práticos e aplicações.\\n\\nQuarto parágrafo com conexões e importância do tema.",
      "type": "content",
      "imageQuery": "[query específica ou null]",
      "tokenEstimate": ${MIN_TOKENS_PER_SLIDE}
    },
    ...
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
          "q": "Pergunta clara que exige aplicação dos conceitos aprendidos?",
          "options": ["Alternativa A com explicação do porquê está incorreta", "Alternativa B com explicação do porquê está incorreta", "Alternativa C com explicação do porquê está incorreta", "Alternativa D com explicação do porquê está correta"],
          "correct": 3,
          "explanation": "Explicação detalhada da resposta correta com justificativa completa e conexão com os conceitos anteriores"
        }
      ]
    },
    ...
  ]
}

Tópico: ${topic}
${systemPrompt ? `[Custom Prompt: ${systemPrompt}]` : ''}
`;
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
 * @param {string} content - The raw content from OpenAI.
 * @returns {Object} The parsed lesson object.
 */
function parseGeneratedContent(content) {
  try {
    // Clean the content to extract JSON
    let cleanContent = content.trim();
    
    // Remove markdown code blocks if present
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```\n?/g, '').replace(/```\n?/g, '');
    }
    
    // Try direct parsing first
    if (cleanContent.startsWith('{')) {
      try {
        const parsed = JSON.parse(cleanContent);
        if (parsed.slides && Array.isArray(parsed.slides)) {
          return { slides: parsed.slides.map(validateAndFixQuizSlide) };
        }
      } catch (directParseError) {
        log.debug('Direct JSON parse failed, attempting to fix malformed JSON', { error: directParseError.message });
      }
    }

    // Try to extract JSON from the content
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      let jsonContent = jsonMatch[0];
      
      try {
        const parsed = JSON.parse(jsonContent);
        if (parsed.slides && Array.isArray(parsed.slides)) {
          return { slides: parsed.slides.map(validateAndFixQuizSlide) };
        }
      } catch (extractParseError) {
        log.debug('Extracted JSON parse failed, attempting to fix malformed JSON', { error: extractParseError.message });
        
        // Try to fix common JSON malformation issues
        try {
          let fixedContent = jsonContent
            // Remove control characters
            .replace(/[\x00-\x1F\x7F]/g, '')
            // Fix unquoted property names
            .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
            // Fix unquoted string values (be careful not to break numbers/booleans)
            .replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([,}])/g, ': "$1"$2')
            // Remove trailing commas before } or ]
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']')
            // Fix escaped quotes in strings
            .replace(/\\"/g, '"')
            // Fix missing quotes around string values that contain special characters
            .replace(/:\s*([^",{\[\s][^",{\[\]]*?)\s*([,}])/g, (match, value, ending) => {
              // Only quote if it looks like a string (contains letters or special chars, not pure numbers)
              if (/[a-zA-Z\u00C0-\u017F]/.test(value)) {
                return `: "${value}"${ending}`;
              }
              return match;
            });
          
          const parsed = JSON.parse(fixedContent);
          if (parsed.slides && Array.isArray(parsed.slides)) {
            log.info('Successfully fixed malformed JSON', { originalError: extractParseError.message });
            return { slides: parsed.slides.map(validateAndFixQuizSlide) };
          }
        } catch (fixError) {
          log.debug('JSON fixing failed', { error: fixError.message });
        }
      }
    }

    log.warn('Failed to parse AI content, using fallback');
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
    log.error('Error parsing AI content', { 
      error: error.message,
      contentPreview: content.substring(0, 500),
      contentLength: content.length
    });
    throw new Error('Failed to process AI response');
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
 * Handles POST requests to generate a lesson.
 * @param {Request} request - The incoming request.
 * @returns {Promise<NextResponse>} The response object.
 */
export async function POST(request) {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  try {
    const { topic, schoolId, mode = 'sync', customPrompt } = await request.json();
    const session = await getServerSession(authOptions);

    log.setSharedContext({ requestId, topic, schoolId, mode, timestamp: new Date().toISOString() });
    log.info('Starting lesson generation', { topic, mode, schoolId });

    // Validate inputs
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      log.error('Validation failed', { field: 'topic', value: topic });
      return NextResponse.json({ error: 'Topic is required and must be a non-empty string' }, { status: 400 });
    }
    if (!['sync', 'async'].includes(mode)) {
      log.error('Validation failed', { field: 'mode', value: mode });
      return NextResponse.json({ error: 'Mode must be "sync" or "async"' }, { status: 400 });
    }

    const promptTimer = log.aulaTimer('prompt-preparation');
    const systemPrompt = customPrompt || 'Generate detailed educational content in Brazilian Portuguese.';
    const generationPrompt = getLessonPromptTemplate(topic, systemPrompt);
    log.aulaTimerEnd(promptTimer, 'prompt-preparation');

    const openaiTimer = log.aulaTimer('openai-generation');
    const openaiStartTime = Date.now();
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: 'system', content: generationPrompt }],
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
    });
    const openaiDuration = Math.round((Date.now() - openaiStartTime) / 1000);
    log.aulaTimerEnd(openaiTimer, 'openai-generation');

    log.info('OpenAI response', {
      duration: openaiDuration,
      usage: response.usage,
      finishReason: response.choices[0]?.finish_reason,
    });

    // Log token usage
    const totalTokens = response.usage?.total_tokens || 0;
    if (session?.user?.id && totalTokens > 0) {
      await logTokens({
        userId: session.user.id,
        moduleGroup: 'Aulas',
        model: OPENAI_MODEL,
        totalTokens,
        subject: topic,
        messages: { requestId, mode },
      });
    }

    const parsingTimer = log.aulaTimer('content-parsing');
    const rawContent = response.choices[0]?.message?.content || '';
    
    // Log raw content for debugging (first 500 chars)
    log.debug('Raw AI response content', { 
      contentPreview: rawContent.substring(0, 500),
      contentLength: rawContent.length 
    });
    
    const generatedContent = parseGeneratedContent(rawContent);
    log.aulaTimerEnd(parsingTimer, 'content-parsing');

    const validationTimer = log.aulaTimer('structure-validation');
    const validation = validateLessonStructure(generatedContent);
    log.aulaTimerEnd(validationTimer, 'structure-validation');

    if (!validation.isValid) {
      log.error('Structure validation failed', { issues: validation.issues });
    }

    const imageTimer = log.aulaTimer('image-preparation');
    const slidesWithImageQueries = await Promise.all(
      generatedContent.slides.map(async slide => {
        if (IMAGE_SLIDE_NUMBERS.includes(slide.number)) {
          const imageQuery = slide.imageQuery || generateImageQuery(topic, slide.number, slide.type);
          let imageUrl = null;
          let imageSource = 'fallback';

          try {
            const wikiResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/wikimedia/search`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: imageQuery, subject: topic, count: 3 }),
            });
            if (wikiResponse.ok) {
              const wikiData = await wikiResponse.json();
              if (wikiData.success && wikiData.photos?.length > 0) {
                imageUrl = wikiData.photos[0].urls?.regular || wikiData.photos[0].url;
                imageSource = 'wikimedia';
                log.info('Wikimedia image selected', { slideNumber: slide.number, imageUrl });
              }
            }
          } catch (error) {
            log.warn('Failed to fetch Wikimedia image', { slideNumber: slide.number, error: error.message });
          }

          if (!imageUrl) {
            const expandedQuery = expandImageQuery(imageQuery, topic);
            try {
              const wikiResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/wikimedia/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: expandedQuery, subject: topic, count: 3 }),
              });
              if (wikiResponse.ok) {
                const wikiData = await wikiResponse.json();
                if (wikiData.success && wikiData.photos?.length > 0) {
                  imageUrl = wikiData.photos[0].urls?.regular || wikiData.photos[0].url;
                  imageSource = 'wikimedia';
                  log.info('Wikimedia expanded image selected', { slideNumber: slide.number, imageUrl });
                }
              }
            } catch (error) {
              log.warn('Failed to fetch expanded Wikimedia image', { slideNumber: slide.number, error: error.message });
            }
          }

          if (!imageUrl) {
            imageUrl = 'https://commons.wikimedia.org/wiki/Special:FilePath/Education%20-%20The%20Noun%20Project.svg?width=800&height=400';
            log.info('Using Wikimedia placeholder', { slideNumber: slide.number });
          }

          return { ...slide, imageQuery, imageUrl, imageSource, subject: topic };
        }
        return { ...slide, imageQuery: null, imageUrl: null, imageSource: null, subject: topic };
      })
    );
    log.aulaTimerEnd(imageTimer, 'image-preparation');

    const metricsTimer = log.aulaTimer('metrics-calculation');
    const finalSlides = slidesWithImageQueries;
    const duration = calculateLessonDuration(finalSlides, mode);
    const slideValidations = finalSlides.map(slide => ({
      isValid: estimateTokens(slide.content) >= MIN_TOKENS_PER_SLIDE,
      tokens: estimateTokens(slide.content),
    }));
    const validSlides = slideValidations.filter(v => v.isValid).length;

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
      quality: {
        score: Math.round((validSlides / finalSlides.length) * 100),
        validSlides,
        totalSlides: finalSlides.length,
      },
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
        feedback: { pacing: metrics, validation },
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
        },
      },
      topic,
      mode,
      slides: finalSlides,
      metrics,
      validation: {
        isValid: validation.isValid,
        issues: validation.issues,
        recommendations: [],
      },
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens,
        costEstimate: (totalTokens * 0.000015).toFixed(4),
      },
    };

    const totalDuration = Math.round((Date.now() - startTime) / 1000);
    log.info('Lesson generated successfully', {
      totalDuration,
      slides: finalSlides.length,
      qualityScore: metrics.quality.score,
      costEstimate: responseData.usage.costEstimate,
    });

    if (process.env.NEO4J_URI && process.env.NEO4J_USER && process.env.NEO4J_PASSWORD) {
      try {
        const { saveLessonToNeo4j } = await import('@/lib/neo4j');
        const lessonId = await saveLessonToNeo4j(responseData.lesson, session?.user?.id || 'default-user');
        responseData.lesson.id = lessonId;
        log.info('Lesson saved to Neo4j', { lessonId });
      } catch (error) {
        log.warn('Failed to save to Neo4j', { error: error.message });
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    const totalDuration = Math.round((Date.now() - startTime) / 1000);
    log.error('Lesson generation failed', { error: error.message, duration: totalDuration });

    let statusCode = 500;
    let friendlyError = 'Internal server error';

    if (error.message.includes('API key')) {
      friendlyError = 'Invalid API key configuration';
      statusCode = 500;
    } else if (error.message.includes('rate limit')) {
      friendlyError = 'Rate limit exceeded. Please try again later.';
      statusCode = 429;
    } else if (error.message.includes('Topic')) {
      friendlyError = error.message;
      statusCode = 400;
    }

    return NextResponse.json(
      { error: friendlyError, details: error.message, timestamp: new Date().toISOString() },
      { status: statusCode }
    );
  }
}

export const runtime = 'nodejs';