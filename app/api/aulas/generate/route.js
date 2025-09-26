// app/api/aulas/generate/route.js
// Dedicated API route for generating educational lessons with professional pacing using Vercel AI SDK

import { NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { generateText } from 'ai';


import { google } from '@ai-sdk/google';


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
const GOOGLE_MODEL = 'gemini-1.5-flash';
const MAX_TOKENS = 10000;
const TEMPERATURE = 0.7;

// Initialize Google AI client via Vercel AI SDK
const googleModel = google(GOOGLE_MODEL, {
  apiKey: process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
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

  // Extrair palavras-chave mais específicas e relevantes
  const keywords = englishTopic
    .split(' ')
    .filter(word => word.length > 2 && !['about', 'for', 'how', 'when', 'where', 'why', 'what', 'a', 'an', 'the', 'of', 'in', 'on', 'at', 'to', 'from', 'concept', 'introduction', 'summary', 'conclusion'].includes(word));

  // Usar múltiplas palavras-chave para maior especificidade
  const mainKeywords = keywords.slice(0, 3).join(' ');

  let query;
  if (slideNumber === 1) {
    // Para o primeiro slide, focar no conceito principal sem termos genéricos
    query = mainKeywords || englishTopic.split(' ')[0];
  } else if (slideNumber === 8) {
    // Para slide do meio, adicionar contexto visual específico
    query = `${mainKeywords} visual diagram`;
  } else if (slideNumber === 14) {
    // Para slide final, manter foco no tema
    query = mainKeywords || englishTopic.split(' ')[0];
  } else {
    query = mainKeywords || englishTopic.split(' ')[0];
  }

  log.debug('Generated image query', { slideNumber, query, originalTopic: topic });
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
  // Se a query já tem palavras suficientes, manter como está
  if (words.length > 2) {
    return originalQuery;
  }
  
  // Adicionar palavras específicas do tópico em vez de termos genéricos
  const topicWords = topic.toLowerCase().split(' ').filter(word => word.length > 2);
  const additionalWords = topicWords.slice(0, 2).join(' ');
  
  return additionalWords ? `${originalQuery} ${additionalWords}` : originalQuery;
}

/**
 * Finds a topic-specific educational image as last resort.
 * @param {string} topic - The lesson topic.
 * @param {string} imageQuery - The image query.
 * @returns {Object|null} Image object or null.
 */
async function findTopicSpecificImage(topic, imageQuery) {
  try {
    // Mapear tópicos para imagens educacionais específicas
    const topicImages = {
      'matemática': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1350&h=1080&fit=crop&auto=format',
      'matematica': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1350&h=1080&fit=crop&auto=format',
      'física': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1350&h=1080&fit=crop&auto=format',
      'fisica': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1350&h=1080&fit=crop&auto=format',
      'química': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1350&h=1080&fit=crop&auto=format',
      'quimica': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1350&h=1080&fit=crop&auto=format',
      'biologia': 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1350&h=1080&fit=crop&auto=format',
      'história': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1350&h=1080&fit=crop&auto=format',
      'historia': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1350&h=1080&fit=crop&auto=format',
      'geografia': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1350&h=1080&fit=crop&auto=format',
      'português': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1350&h=1080&fit=crop&auto=format',
      'portugues': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1350&h=1080&fit=crop&auto=format'
    };
    
    const topicLower = topic.toLowerCase().trim();
    
    // Procurar por correspondência exata
    if (topicImages[topicLower]) {
      return {
        url: topicImages[topicLower],
        source: 'topic-specific',
        title: `Imagem educacional sobre ${topic}`,
        description: `Imagem específica para o tópico ${topic}`
      };
    }
    
    // Procurar por correspondência parcial
    for (const [key, url] of Object.entries(topicImages)) {
      if (topicLower.includes(key) || key.includes(topicLower)) {
        return {
          url: url,
          source: 'topic-specific',
          title: `Imagem educacional sobre ${topic}`,
          description: `Imagem específica para o tópico ${topic}`
        };
      }
    }
    
    // Se não encontrou correspondência específica, retornar null em vez de imagem genérica
    // Isso força o sistema a usar outras APIs de busca específicas
    return null;
    
  } catch (error) {
    console.error('Erro ao buscar imagem específica do tópico:', error);
    return null;
  }
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
- Para quizzes: EXATAMENTE 3 questões por quiz, cada uma com 4 alternativas.
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
7. Quiz: [Título sobre conceitos básicos] - EXATAMENTE 3 questões
8-11. [Títulos sobre aprofundamento, exemplos, análise crítica, síntese]
12. Quiz: [Título sobre análise situacional] - EXATAMENTE 3 questões
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
          "q": "Primeira pergunta clara que exige aplicação dos conceitos aprendidos?",
          "options": ["Alternativa A com explicação do porquê está incorreta", "Alternativa B com explicação do porquê está incorreta", "Alternativa C com explicação do porquê está incorreta", "Alternativa D com explicação do porquê está correta"],
          "correct": 3,
          "explanation": "Explicação detalhada da resposta correta com justificativa completa e conexão com os conceitos anteriores"
        },
        {
          "q": "Segunda pergunta clara que exige aplicação dos conceitos aprendidos?",
          "options": ["Alternativa A com explicação do porquê está incorreta", "Alternativa B com explicação do porquê está incorreta", "Alternativa C com explicação do porquê está incorreta", "Alternativa D com explicação do porquê está correta"],
          "correct": 2,
          "explanation": "Explicação detalhada da resposta correta com justificativa completa e conexão com os conceitos anteriores"
        },
        {
          "q": "Terceira pergunta clara que exige aplicação dos conceitos aprendidos?",
          "options": ["Alternativa A com explicação do porquê está incorreta", "Alternativa B com explicação do porquê está incorreta", "Alternativa C com explicação do porquê está incorreta", "Alternativa D com explicação do porquê está correta"],
          "correct": 1,
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

    log.warn('Failed to parse AI content, using intelligent fallback');
    
    // Try to extract any meaningful content from the original response
    const topicKeywords = content.toLowerCase().split(' ').filter(word => word.length > 2);
    const hasTopicContent = cleanContent.toLowerCase().includes('topic') || cleanContent.toLowerCase().includes('aula');
    
    return {
      slides: Array.from({ length: TOTAL_SLIDES }, (_, i) => {
        const slideNumber = i + 1;
        const isQuiz = QUIZ_SLIDE_NUMBERS.includes(slideNumber);
        const isClosing = slideNumber === TOTAL_SLIDES;
        
        // Generate more meaningful fallback content
        let title, content;
        
        if (slideNumber === 1) {
          title = `Introdução`;
          content = `Bem-vindos à nossa aula!\\n\\nNesta introdução, vamos explorar os conceitos fundamentais e a importância deste tema.\\n\\nVamos começar nossa jornada de aprendizado juntos.`;
        } else if (isQuiz) {
          title = `Quiz de Avaliação`;
          content = `Teste seus conhecimentos!\\n\\nEste quiz irá avaliar sua compreensão dos conceitos apresentados.\\n\\nLeia cada pergunta com atenção e escolha a melhor resposta.`;
        } else if (isClosing) {
          title = `Conclusão`;
          content = `Parabéns por completar a aula!\\n\\nVocê aprendeu conceitos importantes e desenvolveu novas habilidades.\\n\\nContinue explorando e aplicando esses conhecimentos em sua vida.`;
        } else {
          title = `Conceitos Fundamentais`;
          content = `Neste slide, vamos aprofundar nossos conhecimentos.\\n\\nExplore os conceitos apresentados e conecte-os com situações do seu cotidiano.\\n\\nReflita sobre como aplicar esses conhecimentos na prática.`;
        }
        
        return {
          number: slideNumber,
          title,
          content,
          type: isQuiz ? 'quiz' : isClosing ? 'closing' : 'content',
          imageQuery: IMAGE_SLIDE_NUMBERS.includes(slideNumber) ? 'education' : null,
          tokenEstimate: MIN_TOKENS_PER_SLIDE,
        };
      }),
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

    const googleTimer = log.aulaTimer('google-generation');
    const googleStartTime = Date.now();
    
    // Check if Google API key is configured
    if (!process.env.GOOGLE_GEMINI_API_KEY && !process.env.GOOGLE_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      log.error('Google API key not configured');
      return NextResponse.json({ 
        error: 'Google API key not configured. Please set GOOGLE_GEMINI_API_KEY, GOOGLE_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY environment variable.' 
      }, { status: 500 });
    }

    const response = await generateText({
      model: googleModel,
      prompt: generationPrompt,
      maxTokens: MAX_TOKENS,
      temperature: TEMPERATURE,
    });
    
    const googleDuration = Math.round((Date.now() - googleStartTime) / 1000);
    log.aulaTimerEnd(googleTimer, 'google-generation');

    log.info('Google AI response', {
      duration: googleDuration,
      usage: response.usage,
      finishReason: response.finishReason,
    });

    // Log token usage
    const totalTokens = response.usage?.totalTokens || 0;
    if (session?.user?.id && totalTokens > 0) {
      await logTokens({
        userId: session.user.id,
        moduleGroup: 'Aulas',
        model: GOOGLE_MODEL,
        totalTokens,
        subject: topic,
        messages: { requestId, mode },
      });
    }

    const parsingTimer = log.aulaTimer('content-parsing');
    const rawContent = response.text || '';
    
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
            // Usar a nova API de busca inteligente que busca nos 3 melhores provedores
            const smartSearchResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/images/smart-search`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                query: imageQuery, 
                subject: topic, 
                count: 3 
              }),
            });
            
            if (smartSearchResponse.ok) {
              const smartSearchData = await smartSearchResponse.json();
              if (smartSearchData.success && smartSearchData.images?.length > 0) {
                // Selecionar a melhor imagem baseada no score de relevância
                const bestImage = smartSearchData.images[0];
                imageUrl = bestImage.url;
                imageSource = bestImage.source;
                log.info('Smart search image selected', { 
                  slideNumber: slide.number, 
                  imageUrl, 
                  source: imageSource,
                  relevanceScore: bestImage.relevanceScore,
                  sourcesUsed: smartSearchData.sourcesUsed
                });
              }
            }
          } catch (error) {
            log.warn('Failed to fetch smart search image', { slideNumber: slide.number, error: error.message });
          }

          // Se ainda não encontrou imagem, tentar busca específica no Wikimedia como fallback
          if (!imageUrl) {
            try {
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
                  log.info('Wikimedia fallback image selected', { slideNumber: slide.number, imageUrl });
                }
              }
            } catch (error) {
              log.warn('Failed to fetch Wikimedia fallback image', { slideNumber: slide.number, error: error.message });
            }
          }

          // Último recurso: buscar imagem específica do tópico no Unsplash
          if (!imageUrl) {
            try {
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
                  log.info('Unsplash specific image selected', { slideNumber: slide.number, imageUrl });
                }
              }
            } catch (error) {
              log.warn('Failed to fetch Unsplash specific image', { slideNumber: slide.number, error: error.message });
            }
          }

          // Se ainda não encontrou imagem, usar uma imagem educacional específica do tópico
          if (!imageUrl) {
            // Buscar uma imagem educacional específica baseada no tópico
            const topicSpecificImage = await findTopicSpecificImage(topic, imageQuery);
            if (topicSpecificImage) {
              imageUrl = topicSpecificImage.url;
              imageSource = 'topic-specific';
              log.info('Topic specific image selected', { slideNumber: slide.number, imageUrl });
            }
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
        promptTokens: response.usage?.promptTokens || 0,
        completionTokens: response.usage?.completionTokens || 0,
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

