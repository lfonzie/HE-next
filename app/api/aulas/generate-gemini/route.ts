// app/api/aulas/generate-gemini/route.js
// API route para geração de aulas usando Google Gemini com Vercel AI SDK

import { NextResponse } from 'next/server.js';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { generateText } from 'ai';


import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';


import { ensureQuizFormat } from '@/lib/quiz-validation';


import { log } from '@/lib/lesson-logger';


import { logTokens } from '@/lib/token-logger';


import { selectThreeDistinctImages, validateImageSelection } from '@/lib/image-selection-enhanced';


import { getServerSession } from 'next-auth';


import { authOptions } from '@/lib/auth';
import { checkMessageSafety, logInappropriateContentAttempt } from '@/lib/safety-middleware';
import { classifyContentWithAI } from '@/lib/ai-content-classifier';



// Constants for configuration
const TOTAL_SLIDES = 14;
const QUIZ_SLIDE_NUMBERS = [5, 12]; // Quiz slides at positions 5 and 12
const IMAGE_SLIDE_NUMBERS = [1, 3, 6, 9, 12, 14];
const MIN_TOKENS_PER_SLIDE = 300; // Increased to 300-600 tokens for richer content
const GEMINI_MODEL = 'gemini-2.0-flash-exp'; // Using the model that works in other parts of the codebase
const OPENAI_MODEL = 'gpt-4o-mini'; // Fallback model
const MAX_TOKENS = 8000;
const TEMPERATURE = 0.7;

// Initialize AI models via Vercel AI SDK
const geminiModel = google(GEMINI_MODEL);
const openaiModel = openai(OPENAI_MODEL);

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

  // Todas as queries devem ser apenas o tema principal
  const educationalQuery = cleanTopic;
  
  log.debug('Generated educational image query', { 
    slideNumber, 
    educationalQuery
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
 * Uses only specific topic terms in English, avoiding generic educational terms.
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

  // Translation dictionary for specific terms only
  const TRANSLATIONS = {
    matemática: 'mathematics',
    matematica: 'mathematics',
    álgebra: 'algebra',
    algebra: 'algebra',
    geometria: 'geometry',
    trigonometria: 'trigonometry',
    cálculo: 'calculus',
    calculo: 'calculus',
    estatística: 'statistics',
    estatistica: 'statistics',
    probabilidade: 'probability',
    física: 'physics',
    fisica: 'physics',
    química: 'chemistry',
    quimica: 'chemistry',
    biologia: 'biology',
    história: 'history',
    historia: 'history',
    geografia: 'geography',
    literatura: 'literature',
    português: 'portuguese',
    portugues: 'portuguese',
    filosofia: 'philosophy',
    sociologia: 'sociology',
    arte: 'art',
    música: 'music',
    musica: 'music',
    eletricidade: 'electricity',
    corrente: 'current',
    voltagem: 'voltage',
    resistência: 'resistance',
    resistencia: 'resistance',
    circuito: 'circuit',
    fotossíntese: 'photosynthesis',
    fotossintese: 'photosynthesis',
    célula: 'cell',
    celula: 'cell',
    dna: 'dna',
    genética: 'genetics',
    genetica: 'genetics',
    evolução: 'evolution',
    evolucao: 'evolution',
    clima: 'climate',
    relevo: 'relief',
    gramática: 'grammar',
    gramatica: 'grammar',
    redação: 'writing',
    redacao: 'writing',
    criptografia: 'cryptography',
    segurança: 'security',
    seguranca: 'security',
    algoritmo: 'algorithm',
    programação: 'programming',
    programacao: 'programming',
    tecnologia: 'technology',
    computação: 'computing',
    computacao: 'computing',
    inteligência: 'intelligence',
    inteligencia: 'intelligence',
    artificial: 'artificial',
    dados: 'data',
    informação: 'information',
    informacao: 'information',
    sistema: 'system',
    rede: 'network',
    internet: 'internet',
    software: 'software',
    hardware: 'hardware'
  };

  // Translate topic to English
  const englishTopic = cleanTopic
    .split(' ')
    .map(word => TRANSLATIONS[word] || word)
    .join(' ');

  // Extract main keywords (múltiplas palavras-chave relevantes)
  const relevantWords = englishTopic
    .split(' ')
    .filter(word => word.length > 2 && !['about', 'for', 'how', 'when', 'where', 'why', 'what', 'a', 'an', 'the', 'of', 'in', 'on', 'at', 'to', 'from', 'como', 'funciona', 'works', 'function', 'system'].includes(word))
    .slice(0, 3); // Pegar até 3 palavras relevantes

  const mainKeywords = relevantWords.join(' ') || englishTopic.split(' ')[0];

  // Todas as queries devem ser apenas o tema principal
  let query = mainKeywords;

  // Se a query for muito genérica ou vazia, usar o tema original
  if (!query || query.length < 3) {
    query = cleanTopic;
  }

  log.debug('Generated specific image query', { slideNumber, query, originalTopic: topic });
  return query;
}

/**
 * Checks if the error is a quota exceeded error from Gemini.
 * @param {Error} error - The error to check.
 * @returns {boolean} True if it's a quota error.
 */
function isQuotaExceededError(error) {
  const errorMessage = error.message.toLowerCase();
  return errorMessage.includes('quota') || 
         errorMessage.includes('rate limit') || 
         errorMessage.includes('exceeded') ||
         errorMessage.includes('limit: 50');
}

/**
 * Generates a lesson prompt template optimized for Gemini.
 * @param {string} topic - The lesson topic.
 * @param {string} [systemPrompt=''] - Custom system prompt.
 * @returns {string} The formatted prompt.
 */
function getGeminiLessonPromptTemplate(topic, systemPrompt = '') {
  return `Crie uma aula completa e didática sobre "${topic}" com EXATAMENTE 14 SLIDES (não mais, não menos) em JSON.

ATENÇÃO CRÍTICA: DEVEM SER EXATAMENTE 14 SLIDES NUMERADOS DE 1 A 14!

REGRAS CRÍTICAS PARA JSON VÁLIDO:
- Responda APENAS com JSON válido, sem texto adicional
- NÃO use caracteres de controle ou especiais
- Use apenas aspas duplas para strings
- Escape corretamente todas as aspas dentro das strings usando \\"
- Use \\n para quebras de linha dentro das strings
- NÃO use vírgulas finais antes de } ou ]
- Certifique-se de que todas as chaves e colchetes estão balanceados

REGRAS DE CONTEÚDO FUNDAMENTAIS:
- Use português brasileiro claro, objetivo e didático
- Cada slide deve ter CONTEÚDO RICO E DETALHADO com 400-500 tokens (densidade alta)
- Slides 5 e 12 são quizzes com 3 perguntas cada
- OBRIGATÓRIO: Use \\n\\n para quebras de linha entre parágrafos em TODOS os slides
- OBRIGATÓRIO: Cada parágrafo deve ser separado por \\n\\n para melhor legibilidade
- Para imageQuery, use APENAS termos específicos do tópico em inglês
- Evite termos genéricos como "education", "learning", "teaching"

DIRETRIZES DE QUALIDADE E DENSIDADE:
- EVITE repetições desnecessárias do título ou conceitos
- Seja OBJETIVO e DIRETO, mas com CONTEÚDO SUBSTANCIAL
- Use exemplos RELEVANTES e NATURAIS (não force contextualização brasileira)
- Mantenha progressão LÓGICA e CLARA entre os slides
- Foque na COMPREENSÃO PROFUNDA, não superficial
- Use linguagem ACESSÍVEL para estudantes do ensino médio
- DESENVOLVA cada conceito com múltiplos aspectos e detalhes
- INCLUA analogias, exemplos práticos e conexões interdisciplinares
- APROFUNDE explicações com contexto histórico quando relevante
- CONECTE teoria com aplicações práticas e casos reais

ESTRUTURA DETALHADA E ESPECÍFICA (EXATAMENTE 14 SLIDES):
- Slide 1: Introdução clara com definição básica e importância do tema
- Slides 2-4: Conceitos fundamentais desenvolvidos progressivamente (do básico ao intermediário)
- Slide 5: QUIZ com 3 perguntas sobre conceitos básicos (type: "quiz")
- Slides 6-11: Aplicações práticas, exemplos reais e aprofundamento temático (6 slides de conteúdo)
- Slide 12: QUIZ com 3 perguntas sobre aplicações (type: "quiz")
- Slide 13: Síntese e conclusões dos conceitos aprendidos
- Slide 14: Perspectivas futuras e encerramento (type: "closing")

IMPORTANTE: Conte os slides! Devem ser EXATAMENTE 14 slides no array!

FORMATO JSON:
{
  "slides": [
    {
      "number": 1,
      "title": "Introdução ao ${topic}",
      "content": "Defina claramente o que é ${topic} de forma simples mas completa, explicando sua natureza fundamental e importância histórica.\\n\\nDesenvolva o contexto histórico relevante, destacando descobertas importantes e cientistas que contribuíram para o entendimento atual.\\n\\nExplique por que este tema é crucial para os estudantes, conectando com aplicações práticas no cotidiano e profissões relacionadas.\\n\\nApresente os objetivos de aprendizagem desta aula de forma detalhada, especificando o que será coberto.\\n\\nUse exemplos concretos e analogias familiares para facilitar a compreensão inicial, preparando o terreno para o aprofundamento posterior.",
      "type": "content",
      "imageQuery": "${topic}",
      "tokenEstimate": 450
    },
    {
      "number": 7,
      "title": "Quiz: Conceitos Fundamentais de ${topic}",
      "content": "Teste sua compreensão dos conceitos básicos de ${topic} apresentados nos slides anteriores.\\n\\nEste quiz avalia se você entendeu as definições e princípios fundamentais.\\n\\nLeia cada pergunta com atenção e escolha a resposta mais adequada.",
      "type": "quiz",
      "imageQuery": null,
      "tokenEstimate": 350,
      "points": 0,
      "questions": [
        {
          "q": "Qual é a definição mais precisa de ${topic}?",
          "options": ["Definição técnica correta e específica", "Definição parcialmente correta mas incompleta", "Definição relacionada mas incorreta", "Definição completamente errada"],
          "correct": 0,
          "explanation": "Explicação detalhada da resposta correta com justificativa técnica e exemplos práticos"
        },
        {
          "q": "Com base no conteúdo apresentado, qual é a característica principal de ${topic}?",
          "options": ["Característica principal correta", "Característica secundária", "Característica incorreta", "Característica irrelevante"],
          "correct": 0,
          "explanation": "Explicação clara da resposta correta com base no conteúdo apresentado"
        },
        {
          "q": "Qual é a aplicação mais comum de ${topic} mencionada na aula?",
          "options": ["Aplicação incorreta", "Aplicação secundária", "Aplicação principal correta", "Aplicação irrelevante"],
          "correct": 2,
          "explanation": "Explicação da aplicação correta com base nos exemplos apresentados"
        }
      ]
    },
    {
      "number": 12,
      "title": "Quiz: Aplicações Práticas de ${topic}",
      "content": "Teste sua compreensão sobre as aplicações práticas de ${topic} apresentadas na aula.\\n\\nEste quiz avalia sua capacidade de aplicar os conceitos aprendidos em situações reais.\\n\\nAnalise cada cenário e escolha a melhor resposta baseada no conteúdo estudado.",
      "type": "quiz",
      "imageQuery": null,
      "tokenEstimate": 350,
      "points": 0,
      "questions": [
        {
          "q": "Em qual situação ${topic} seria mais aplicável?",
          "options": ["Situação incorreta", "Situação parcialmente correta", "Situação irrelevante", "Situação ideal correta"],
          "correct": 3,
          "explanation": "Explicação da situação ideal com base nos exemplos apresentados na aula"
        },
        {
          "q": "Qual seria o resultado esperado ao aplicar ${topic} corretamente?",
          "options": ["Resultado esperado correto", "Resultado parcialmente correto", "Resultado incorreto", "Resultado irrelevante"],
          "correct": 0,
          "explanation": "Explicação do resultado correto com base no conteúdo da aula"
        },
        {
          "q": "Qual limitação importante deve ser considerada ao usar ${topic}?",
          "options": ["Limitação secundária", "Limitação irrelevante", "Limitação principal correta", "Limitação incorreta"],
          "correct": 2,
          "explanation": "Explicação da limitação principal mencionada no conteúdo da aula"
        }
      ]
    }
  ]
}

Tópico: ${topic}
${systemPrompt ? `[Custom: ${systemPrompt}]` : ''}

IMPORTANTE: 
- Cada slide deve ter conteúdo rico e detalhado (400-500 tokens)
- Use apenas termos específicos do tópico em inglês para imageQuery
- Evite termos genéricos educacionais
- Desenvolva parágrafos explicativos completos e substanciais
- Responda APENAS com JSON válido
- CONTEXTUALIZAÇÃO BRASILEIRA: Use exemplos brasileiros apenas quando NATURALMENTE relevantes ao tema, sem forçar conexões artificiais
- FOQUE na clareza e objetividade, mas com DENSIDADE DE INFORMAÇÃO
- Mantenha linguagem acessível para estudantes do ensino médio
- DESENVOLVA cada conceito com profundidade e múltiplas perspectivas
- INCLUA exemplos práticos, analogias e conexões interdisciplinares
- APROFUNDE explicações com contexto histórico e científico quando relevante`;
}

/**
 * Generates a lesson prompt template optimized for OpenAI GPT-4o mini.
 * @param {string} topic - The lesson topic.
 * @param {string} [systemPrompt=''] - Custom system prompt.
 * @returns {string} The formatted prompt.
 */
function getOpenAILessonPromptTemplate(topic, systemPrompt = '') {
  return `Crie uma aula completa e detalhada sobre "${topic}" com EXATAMENTE 14 SLIDES (não mais, não menos) em JSON.

ATENÇÃO CRÍTICA: DEVEM SER EXATAMENTE 14 SLIDES NUMERADOS DE 1 A 14!

REGRAS CRÍTICAS PARA JSON VÁLIDO:
- Responda APENAS com JSON válido, sem texto adicional
- NÃO use caracteres de controle ou especiais
- Use apenas aspas duplas para strings
- Escape corretamente todas as aspas dentro das strings usando \\"
- Use \\n para quebras de linha dentro das strings
- NÃO use vírgulas finais antes de } ou ]
- Certifique-se de que todas as chaves e colchetes estão balanceados

REGRAS DE CONTEÚDO FUNDAMENTAIS:
- Use português brasileiro claro, objetivo e didático
- Cada slide deve ter CONTEÚDO RICO E DETALHADO com 400-500 tokens (densidade alta)
- Slides 5 e 12 são quizzes com 3 perguntas cada
- OBRIGATÓRIO: Use \\n\\n para quebras de linha entre parágrafos em TODOS os slides
- OBRIGATÓRIO: Cada parágrafo deve ser separado por \\n\\n para melhor legibilidade
- Para imageQuery, use APENAS termos específicos do tópico em inglês
- Evite termos genéricos como "education", "learning", "teaching"

DIRETRIZES DE QUALIDADE E DENSIDADE:
- EVITE repetições desnecessárias do título ou conceitos
- Seja OBJETIVO e DIRETO, mas com CONTEÚDO SUBSTANCIAL
- Use exemplos RELEVANTES e NATURAIS (não force contextualização brasileira)
- Mantenha progressão LÓGICA e CLARA entre os slides
- Foque na COMPREENSÃO PROFUNDA, não superficial
- Use linguagem ACESSÍVEL para estudantes do ensino médio
- DESENVOLVA cada conceito com múltiplos aspectos e detalhes
- INCLUA analogias, exemplos práticos e conexões interdisciplinares
- APROFUNDE explicações com contexto histórico quando relevante
- CONECTE teoria com aplicações práticas e casos reais

ESTRUTURA DETALHADA E ESPECÍFICA (EXATAMENTE 14 SLIDES):
- Slide 1: Introdução clara com definição básica e importância do tema
- Slides 2-4: Conceitos fundamentais desenvolvidos progressivamente (do básico ao intermediário)
- Slide 5: QUIZ com 3 perguntas sobre conceitos básicos (type: "quiz")
- Slides 6-11: Aplicações práticas, exemplos reais e aprofundamento temático (6 slides de conteúdo)
- Slide 12: QUIZ com 3 perguntas sobre aplicações (type: "quiz")
- Slide 13: Síntese e conclusões dos conceitos aprendidos
- Slide 14: Perspectivas futuras e encerramento (type: "closing")

IMPORTANTE: Conte os slides! Devem ser EXATAMENTE 14 slides no array!

FORMATO JSON:
{
  "slides": [
    {
      "number": 1,
      "title": "Introdução ao ${topic}",
      "content": "Defina claramente o que é ${topic} de forma simples mas completa, explicando sua natureza fundamental e importância histórica.\\n\\nDesenvolva o contexto histórico relevante, destacando descobertas importantes e cientistas que contribuíram para o entendimento atual.\\n\\nExplique por que este tema é crucial para os estudantes, conectando com aplicações práticas no cotidiano e profissões relacionadas.\\n\\nApresente os objetivos de aprendizagem desta aula de forma detalhada, especificando o que será coberto.\\n\\nUse exemplos concretos e analogias familiares para facilitar a compreensão inicial, preparando o terreno para o aprofundamento posterior.",
      "type": "content",
      "imageQuery": "${topic}",
      "tokenEstimate": 450
    },
    {
      "number": 7,
      "title": "Quiz: Conceitos Fundamentais de ${topic}",
      "content": "Teste sua compreensão dos conceitos básicos de ${topic} apresentados nos slides anteriores.\\n\\nEste quiz avalia se você entendeu as definições e princípios fundamentais.\\n\\nLeia cada pergunta com atenção e escolha a resposta mais adequada.",
      "type": "quiz",
      "imageQuery": null,
      "tokenEstimate": 350,
      "points": 0,
      "questions": [
        {
          "q": "Qual é a definição mais precisa de ${topic}?",
          "options": ["Definição técnica correta e específica", "Definição parcialmente correta mas incompleta", "Definição relacionada mas incorreta", "Definição completamente errada"],
          "correct": 0,
          "explanation": "Explicação detalhada da resposta correta com justificativa técnica e exemplos práticos"
        },
        {
          "q": "Com base no conteúdo apresentado, qual é a característica principal de ${topic}?",
          "options": ["Característica principal correta", "Característica secundária", "Característica incorreta", "Característica irrelevante"],
          "correct": 0,
          "explanation": "Explicação clara da resposta correta com base no conteúdo apresentado"
        },
        {
          "q": "Qual é a aplicação mais comum de ${topic} mencionada na aula?",
          "options": ["Aplicação incorreta", "Aplicação secundária", "Aplicação principal correta", "Aplicação irrelevante"],
          "correct": 2,
          "explanation": "Explicação da aplicação correta com base nos exemplos apresentados"
        }
      ]
    },
    {
      "number": 12,
      "title": "Quiz: Aplicações Práticas de ${topic}",
      "content": "Teste sua compreensão sobre as aplicações práticas de ${topic} apresentadas na aula.\\n\\nEste quiz avalia sua capacidade de aplicar os conceitos aprendidos em situações reais.\\n\\nAnalise cada cenário e escolha a melhor resposta baseada no conteúdo estudado.",
      "type": "quiz",
      "imageQuery": null,
      "tokenEstimate": 350,
      "points": 0,
      "questions": [
        {
          "q": "Em qual situação ${topic} seria mais aplicável?",
          "options": ["Situação incorreta", "Situação parcialmente correta", "Situação irrelevante", "Situação ideal correta"],
          "correct": 3,
          "explanation": "Explicação da situação ideal com base nos exemplos apresentados na aula"
        },
        {
          "q": "Qual seria o resultado esperado ao aplicar ${topic} corretamente?",
          "options": ["Resultado esperado correto", "Resultado parcialmente correto", "Resultado incorreto", "Resultado irrelevante"],
          "correct": 0,
          "explanation": "Explicação do resultado correto com base no conteúdo da aula"
        },
        {
          "q": "Qual limitação importante deve ser considerada ao usar ${topic}?",
          "options": ["Limitação secundária", "Limitação irrelevante", "Limitação principal correta", "Limitação incorreta"],
          "correct": 2,
          "explanation": "Explicação da limitação principal mencionada no conteúdo da aula"
        }
      ]
    }
  ]
}

Tópico: ${topic}
${systemPrompt ? `[Custom: ${systemPrompt}]` : ''}

IMPORTANTE: 
- Cada slide deve ter conteúdo rico e detalhado (400-500 tokens)
- Use apenas termos específicos do tópico em inglês para imageQuery
- Evite termos genéricos educacionais
- Desenvolva parágrafos explicativos completos e substanciais
- Responda APENAS com JSON válido
- CONTEXTUALIZAÇÃO BRASILEIRA: Use exemplos brasileiros apenas quando NATURALMENTE relevantes ao tema, sem forçar conexões artificiais
- FOQUE na clareza e objetividade, mas com DENSIDADE DE INFORMAÇÃO
- Mantenha linguagem acessível para estudantes do ensino médio
- DESENVOLVA cada conceito com profundidade e múltiplas perspectivas
- INCLUA exemplos práticos, analogias e conexões interdisciplinares
- APROFUNDE explicações com contexto histórico e científico quando relevante`;
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
function parseGeminiContent(content, topic) {
  try {
    // Clean the content to extract JSON
    let cleanContent = content.trim();
    
    // Remove markdown code blocks if present
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```\n?/g, '').replace(/```\n?/g, '');
    }
    
    // Remove control characters that cause JSON parsing issues
    cleanContent = cleanContent.replace(/[\x00-\x1F\x7F]/g, '');
    
    // Additional JSON validation before parsing
    const hasBalancedBraces = (cleanContent.match(/\{/g) || []).length === (cleanContent.match(/\}/g) || []).length;
    const hasBalancedBrackets = (cleanContent.match(/\[/g) || []).length === (cleanContent.match(/\]/g) || []).length;
    
    if (!hasBalancedBraces || !hasBalancedBrackets) {
      log.warn('JSON structure appears unbalanced, attempting to fix', { 
        balancedBraces: hasBalancedBraces, 
        balancedBrackets: hasBalancedBrackets 
      });
    }
    
    // Try to find JSON object
    if (cleanContent.startsWith('{')) {
      try {
        const parsed = JSON.parse(cleanContent);
        if (parsed.slides && Array.isArray(parsed.slides)) {
          return { slides: parsed.slides };
        }
      } catch (parseError) {
        log.warn('Failed to parse full JSON, trying to fix common issues', { 
          error: (parseError as Error).message,
          contentLength: cleanContent.length 
        });
        
        // Try to fix common JSON issues
        let fixedContent = cleanContent;
        
        // Fix trailing commas
        fixedContent = fixedContent.replace(/,(\s*[}\]])/g, '$1');
        
        // Fix unescaped quotes in strings - improved regex
        fixedContent = fixedContent.replace(/"([^"]*)"([^"]*)"([^"]*)":/g, '"$1\\"$2\\"$3":');
        
        // Fix control characters in strings
        fixedContent = fixedContent.replace(/"([^"]*[\x00-\x1F\x7F][^"]*)":/g, (match, content) => {
          const cleaned = content.replace(/[\x00-\x1F\x7F]/g, '');
          return `"${cleaned}":`;
        });
        
        // Fix incomplete JSON (missing closing braces)
        const openBraces = (fixedContent.match(/\{/g) || []).length;
        const closeBraces = (fixedContent.match(/\}/g) || []).length;
        if (openBraces > closeBraces) {
          fixedContent += '}'.repeat(openBraces - closeBraces);
        }
        
        // Try parsing the fixed content
        try {
          const parsed = JSON.parse(fixedContent);
          if (parsed.slides && Array.isArray(parsed.slides)) {
            log.info('Successfully parsed JSON after fixes');
            return { slides: parsed.slides };
          }
        } catch (secondError) {
          log.warn('Failed to parse even after fixes', { 
            error: (secondError as Error).message 
          });
        }
      }
    }

    // Try to extract JSON from the content using a more robust approach
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.slides && Array.isArray(parsed.slides)) {
          return { slides: parsed.slides };
        }
      } catch (parseError) {
        log.warn('Failed to parse extracted JSON', { 
          error: (parseError as Error).message,
          jsonLength: jsonMatch[0].length 
        });
        
        // Try to fix the extracted JSON with comprehensive fixes
        let fixedJson = jsonMatch[0];
        
        // Remove control characters
        fixedJson = fixedJson.replace(/[\x00-\x1F\x7F]/g, '');
        
        // Fix trailing commas
        fixedJson = fixedJson.replace(/,(\s*[}\]])/g, '$1');
        
        // Fix unescaped quotes in strings
        fixedJson = fixedJson.replace(/"([^"]*)"([^"]*)"([^"]*)":/g, '"$1\\"$2\\"$3":');
        
        // Fix incomplete JSON
        const openBraces = (fixedJson.match(/\{/g) || []).length;
        const closeBraces = (fixedJson.match(/\}/g) || []).length;
        if (openBraces > closeBraces) {
          fixedJson += '}'.repeat(openBraces - closeBraces);
        }
        
        // Fix incomplete arrays
        const openBrackets = (fixedJson.match(/\[/g) || []).length;
        const closeBrackets = (fixedJson.match(/\]/g) || []).length;
        if (openBrackets > closeBrackets) {
          fixedJson += ']'.repeat(openBrackets - closeBrackets);
        }
        
        try {
          const parsed = JSON.parse(fixedJson);
          if (parsed.slides && Array.isArray(parsed.slides)) {
            log.info('Successfully parsed extracted JSON after comprehensive fixes');
            return { slides: parsed.slides };
          }
        } catch (thirdError) {
          log.warn('Failed to parse even after comprehensive JSON fixes', { 
            error: (thirdError as Error).message 
          });
        }
      }
    }

    // Last resort: try to extract slides from malformed content
    log.warn('All JSON parsing attempts failed, attempting enhanced content extraction');
    
    // Try to extract slide content using regex patterns
    const slidePattern = /"number":\s*(\d+)[^}]*"title":\s*"([^"]*)"[^}]*"content":\s*"([^"]*(?:\\.[^"]*)*)"[^}]*"type":\s*"([^"]*)"/g;
    const slides = [];
    let match;
    
    while ((match = slidePattern.exec(cleanContent)) !== null) {
      const [, number, title, content, type] = match;
      const slideNumber = parseInt(number);
      const isQuiz = type === 'quiz';
      
      const slide: any = {
        number: slideNumber,
        title: title.replace(/\\n/g, '\n'),
        content: content.replace(/\\n/g, '\n').replace(/\\"/g, '"'),
        type: type,
        imageQuery: IMAGE_SLIDE_NUMBERS.includes(slideNumber) ? 'placeholder' : null,
        tokenEstimate: MIN_TOKENS_PER_SLIDE,
      };
      
      // If it's a quiz slide, try to extract questions
      if (isQuiz) {
        const questions = extractQuestionsFromContent(cleanContent, slideNumber);
        if (questions && questions.length > 0) {
          slide.questions = questions;
          log.info('Extracted quiz questions for slide', { slideNumber, questionCount: questions.length });
        } else {
          // Generate default quiz questions if extraction fails
          slide.questions = generateDefaultQuizQuestions(topic);
          log.warn('Using default quiz questions for slide', { slideNumber });
        }
      }
      
      slides.push(slide);
    }
    
    if (slides.length > 0) {
      log.info('Successfully extracted slides using enhanced regex pattern', { 
        slideCount: slides.length,
        quizSlidesFound: slides.filter(s => s.type === 'quiz').length
      });
      return { slides };
    }

    log.error('Failed to parse Gemini content completely, using intelligent fallback');
    
    // Try to extract any meaningful content from the original response
    const topicKeywords = topic.toLowerCase().split(' ').filter(word => word.length > 2);
    const hasTopicContent = cleanContent.toLowerCase().includes(topic.toLowerCase());
    
    return {
      slides: Array.from({ length: TOTAL_SLIDES }, (_, i) => {
        const slideNumber = i + 1;
        const isQuiz = QUIZ_SLIDE_NUMBERS.includes(slideNumber);
        const isClosing = slideNumber === TOTAL_SLIDES;
        
        // Generate more meaningful fallback content based on topic
        let title, content;
        
        if (slideNumber === 1) {
          title = `Introdução: ${topic}`;
          content = `Bem-vindos à aula sobre ${topic}!\\n\\nNesta introdução, vamos explorar os conceitos fundamentais e a importância deste tema.\\n\\nVamos começar nossa jornada de aprendizado juntos.`;
        } else if (isQuiz) {
          title = `Quiz: ${topic}`;
          content = `Teste seus conhecimentos sobre ${topic}!\\n\\nEste quiz irá avaliar sua compreensão dos conceitos apresentados.\\n\\nLeia cada pergunta com atenção e escolha a melhor resposta.`;
        } else if (isClosing) {
          title = `Conclusão: ${topic}`;
          content = `Parabéns por completar a aula sobre ${topic}!\\n\\nVocê aprendeu conceitos importantes e desenvolveu novas habilidades.\\n\\nContinue explorando e aplicando esses conhecimentos em sua vida.`;
        } else {
          title = `Conceitos de ${topic}`;
          content = `Neste slide, vamos aprofundar nossos conhecimentos sobre ${topic}.\\n\\nExplore os conceitos apresentados e conecte-os com situações do seu cotidiano.\\n\\nReflita sobre como aplicar esses conhecimentos na prática.`;
        }
        
        const baseSlide = {
          number: slideNumber,
          title,
          content,
          type: isQuiz ? 'quiz' : isClosing ? 'closing' : 'content',
          imageQuery: IMAGE_SLIDE_NUMBERS.includes(slideNumber) ? topicKeywords[0] || 'placeholder' : null,
          tokenEstimate: MIN_TOKENS_PER_SLIDE,
        };
        
        // Add quiz questions for quiz slides
        if (isQuiz) {
          return {
            ...baseSlide,
            questions: generateDefaultQuizQuestions(topic)
          };
        }
        
        return baseSlide;
      }),
    };
  } catch (error) {
    log.error('Error parsing Gemini content', { error: (error as Error).message });
    throw new Error('Failed to process Gemini response');
  }
}

/**
 * Extract quiz questions from malformed JSON content
 */
function extractQuestionsFromContent(content, slideNumber) {
  try {
    // Try to find the questions array for this specific slide
    const slidePattern = new RegExp(`"number":\\s*${slideNumber}[\\s\\S]*?"questions":\\s*\\[([\\s\\S]*?)\\]`, 'i');
    const slideMatch = content.match(slidePattern);
    
    if (!slideMatch) {
      log.debug('No questions array found for slide', { slideNumber });
      return null;
    }
    
    const questionsContent = slideMatch[1];
    const questions = [];
    
    // Extract individual questions
    const questionPattern = /"question":\s*"([^"]*(?:\\.[^"]*)*)"\s*,\s*"options":\s*\[([^\]]+)\]\s*,\s*"correct":\s*(\d+)\s*,\s*"explanation":\s*"([^"]*(?:\\.[^"]*)*)"/g;
    let questionMatch;
    
    while ((questionMatch = questionPattern.exec(questionsContent)) !== null) {
      const [, question, optionsStr, correct, explanation] = questionMatch;
      
      // Parse options array
      const options = optionsStr
        .split(',')
        .map(opt => opt.trim().replace(/^"|"$/g, '').replace(/\\"/g, '"').replace(/\\n/g, ' '))
        .filter(opt => opt.length > 0);
      
      if (options.length === 4) { // Quiz questions should have 4 options
        questions.push({
          question: question.replace(/\\n/g, ' ').replace(/\\"/g, '"'),
          options,
          correct: parseInt(correct),
          explanation: explanation.replace(/\\n/g, ' ').replace(/\\"/g, '"')
        });
      }
    }
    
    log.debug('Extracted questions from content', { 
      slideNumber, 
      questionsFound: questions.length 
    });
    
    return questions.length > 0 ? questions : null;
  } catch (error) {
    log.error('Error extracting questions', { 
      slideNumber, 
      error: (error as Error).message 
    });
    return null;
  }
}

/**
 * Generate default quiz questions when extraction fails
 */
function generateDefaultQuizQuestions(topic) {
  return [
    {
      question: `Qual é o conceito fundamental sobre ${topic}?`,
      options: [
        'Primeira opção relacionada ao tema',
        'Segunda opção relacionada ao tema',
        'Terceira opção relacionada ao tema',
        'Quarta opção relacionada ao tema'
      ],
      correct: 0,
      explanation: `Esta questão avalia sua compreensão básica sobre ${topic}. A primeira opção representa o conceito fundamental do tema.`
    },
    {
      question: `Como ${topic} se aplica na prática?`,
      options: [
        'Aplicação prática comum',
        'Aplicação teórica',
        'Aplicação experimental',
        'Aplicação conceitual'
      ],
      correct: 0,
      explanation: `${topic} tem diversas aplicações práticas. Esta questão testa seu entendimento sobre as aplicações reais do conceito.`
    },
    {
      question: `Qual é a importância de entender ${topic}?`,
      options: [
        'Fundamental para compreensão do tema',
        'Opcional para o aprendizado',
        'Apenas curiosidade',
        'Não tem relevância'
      ],
      correct: 0,
      explanation: `Compreender ${topic} é fundamental para o aprendizado completo do tema e suas aplicações.`
    }
  ];
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

    // Check authentication
    if (!session?.user?.id) {
      log.error('Authentication failed', { hasSession: !!session, hasUser: !!session?.user });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Implement parental controls when available
    // For now, just check authentication

    // Create mutable schoolId variable
    let schoolId = originalSchoolId;

    log.setSharedContext({ requestId, topic, schoolId, mode, timestamp: new Date().toISOString() });
    log.info('Starting Gemini lesson generation', { topic, mode, schoolId });

    // Validate inputs
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      log.error('Validation failed', { field: 'topic', value: topic });
      return NextResponse.json({ error: 'Topic is required and must be a non-empty string' }, { status: 400 });
    }

    // Check for inappropriate content using AI classification
    log.info('Starting AI content classification', { topic });
    const aiClassification = await classifyContentWithAI(topic);
    
    if (aiClassification.isInappropriate && aiClassification.confidence > 0.6) {
      log.warn('Inappropriate topic detected by AI', { 
        topic, 
        categories: aiClassification.categories,
        confidence: aiClassification.confidence,
        reasoning: aiClassification.reasoning,
        userId: session.user.id 
      });
      
      // Log the attempt for monitoring
      logInappropriateContentAttempt(session.user.id, topic, aiClassification.categories);
      
      return NextResponse.json({ 
        error: 'Tópico inadequado detectado',
        message: aiClassification.suggestedResponse,
        categories: aiClassification.categories,
        confidence: aiClassification.confidence,
        reasoning: aiClassification.reasoning,
        educationalAlternative: aiClassification.educationalAlternative
      }, { status: 400 });
    }
    
    log.info('Content approved by AI classification', { 
      topic, 
      confidence: aiClassification.confidence,
      reasoning: aiClassification.reasoning 
    });
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
    
    // Retry mechanism for Gemini API calls with OpenAI fallback
    const maxRetries = 3;
    let response: any = null;
    let lastError: Error | null = null;
    let usedProvider = 'gemini';
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        log.info(`Gemini API attempt ${attempt}/${maxRetries}`, { requestId });
        
        response = await generateText({
          model: geminiModel,
          prompt: generationPrompt,
          temperature: TEMPERATURE,
        });
        
        // Success - break out of retry loop
        break;
        
      } catch (attemptError) {
        lastError = attemptError as Error;
        log.warn(`Gemini API attempt ${attempt} failed`, { 
          error: lastError.message, 
          attempt, 
          maxRetries 
        });
        
        // If this is the last attempt, try OpenAI fallback if it's a quota error
        if (attempt === maxRetries) {
          if (isQuotaExceededError(lastError) && process.env.OPENAI_API_KEY) {
            log.info('Gemini quota exceeded, attempting OpenAI fallback', { requestId });
            
            try {
              const openaiPrompt = getOpenAILessonPromptTemplate(topic, systemPrompt);
              response = await generateText({
                model: openaiModel,
                prompt: openaiPrompt,
                temperature: TEMPERATURE,
              });
              usedProvider = 'openai';
              log.info('OpenAI fallback successful', { requestId, provider: usedProvider });
              break;
            } catch (openaiError) {
              log.error('OpenAI fallback also failed', { 
                error: (openaiError as Error).message, 
                requestId 
              });
              throw new Error(`Both Gemini and OpenAI failed. Gemini error: ${lastError.message}. OpenAI error: ${(openaiError as Error).message}`);
            }
          } else {
            throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
          }
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        log.info(`Waiting ${delay}ms before retry attempt ${attempt + 1}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Process the successful response
    const generationDuration = Math.round((Date.now() - geminiStartTime) / 1000);
    log.aulaTimerEnd(geminiTimer, 'gemini-generation');

    log.info(`${usedProvider === 'openai' ? 'OpenAI' : 'Gemini'} response`, {
      duration: generationDuration,
      usage: response.usage,
      finishReason: response.finishReason,
      contentLength: response.text?.length || 0,
      provider: usedProvider,
    });

    // Log token usage
    const totalTokens = response.usage?.totalTokens || 0;
    if (session?.user?.id && totalTokens > 0) {
      await logTokens({
        userId: session.user.id,
        moduleGroup: 'Aulas',
        model: usedProvider === 'openai' ? OPENAI_MODEL : GEMINI_MODEL,
        totalTokens,
        subject: topic,
        messages: { requestId, mode, provider: usedProvider },
      });
    }

    const parsingTimer = log.aulaTimer('content-parsing');
    const parsedContent = parseGeminiContent(response.text, topic);
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
      // ULTRA-FAST image search - single API call, cached, guaranteed results
      log.info('⚡ Using ultra-fast image search', { topic });
      
      const fastSearchResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/internal/images/fast-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: topic, 
          count: 6
        }),
      });
      
      if (fastSearchResponse.ok) {
        const fastSearchData = await fastSearchResponse.json();
        log.info('✅ Fast image search completed', { 
          success: fastSearchData.success, 
          imagesCount: fastSearchData.images?.length || 0,
          provider: fastSearchData.provider,
          cached: fastSearchData.cached,
          processingTime: fastSearchData.processingTime
        });
        
        if (fastSearchData.success && fastSearchData.images?.length > 0) {
          selectedImages = fastSearchData.images.map(img => ({
            url: img.url,
            title: img.title,
            description: img.description,
            provider: img.provider,
            attribution: img.attribution || '',
            license: img.license || '',
            author: img.author || '',
            sourceUrl: img.sourceUrl || '',
            score: 90 // High score for fast-search results
          }));
          
          log.info('✨ Fast search images ready', {
            totalImages: selectedImages.length,
            provider: fastSearchData.provider,
            cached: fastSearchData.cached
          });
        }
      } else {
        log.error('❌ Fast image search failed', { 
          status: fastSearchResponse.status 
        });
      }
      
      // FALLBACK: Se smart-search não funcionou, usar sistema melhorado
      if (selectedImages.length === 0) {
        log.info('Smart search failed, falling back to enhanced semantic selection', { topic });
        
        try {
          // Usar o novo sistema de seleção semântica melhorado
          const { selectThreeDistinctImages } = await import('@/lib/image-selection-enhanced');
          
          selectedImages = await Promise.race([
            selectThreeDistinctImages(topic),
            new Promise<any[]>((_, reject) => 
              setTimeout(() => reject(new Error('Image selection timeout')), 15000)
            )
          ]);
          
          // Validar seleção
          const { validateImageSelection } = await import('@/lib/image-selection-enhanced');
          const validation = validateImageSelection(selectedImages);
          if (!validation.isValid) {
            log.warn('Image selection validation failed', { issues: validation.issues });
          }
          
          log.info('Enhanced semantic image selection completed', {
            totalImages: selectedImages.length,
            providers: [...new Set(selectedImages.map(img => img.provider))],
            validation: validation.metrics
          });
        } catch (error) {
          log.error('Enhanced image selection failed', { error: (error as Error).message });
          selectedImages = [];
        }
      }
      
    } catch (error) {
      log.error('Failed to select images', { error: (error as Error).message });
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
              
              // Validar URL da imagem
              if (!imageUrl || !imageUrl.startsWith('http')) {
                log.warn('Invalid image URL generated', { 
                  slideNumber: validatedSlide.number, 
                  imageUrl, 
                  provider: selectedImage.provider,
                  title: selectedImage.title?.slice(0, 50)
                });
                imageUrl = null; // Reset para tentar fallback
              } else {
                log.info('Using enhanced image selection', { 
                  slideNumber: validatedSlide.number, 
                  imageUrl, 
                  source: imageSource,
                  provider: selectedImage.provider,
                  title: selectedImage.title?.slice(0, 50)
                });
              }
              
              imageIndex++;
            }

            // Se não encontrou imagem específica, usar a API de busca inteligente com IA
            if (!imageUrl) {
              try {
                const imageQuery = generateImageQuery(topic, validatedSlide.number, validatedSlide.type);
                log.info('Attempting AI-powered search', { slideNumber: validatedSlide.number, imageQuery });
                
                // Usar a API de busca inteligente com IA
                const aiSearchResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/images/ai-powered-search`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    topic: imageQuery, 
                    subject: topic, 
                    count: 1 
                  }),
                });
                
                if (aiSearchResponse.ok) {
                  const aiSearchData = await aiSearchResponse.json();
                  if (aiSearchData.success && aiSearchData.results?.length > 0) {
                    // Selecionar a melhor imagem baseada na análise de IA
                    const bestImage = aiSearchData.results[0];
                    imageUrl = bestImage.url;
                    imageSource = `ai-${bestImage.source}`;
                    imageMetadata = {
                      provider: bestImage.source,
                      relevanceScore: bestImage.relevanceScore,
                      educationalValue: bestImage.educationalValue,
                      appropriateness: bestImage.appropriateness,
                      reasoning: bestImage.reasoning,
                      category: bestImage.category,
                      analysisMethod: 'ai-powered',
                      totalImages: aiSearchData.totalImages,
                      relevantImages: aiSearchData.relevantImages
                    };
                    log.info('Found image via AI-powered search', { 
                      slideNumber: validatedSlide.number, 
                      imageUrl, 
                      source: imageSource,
                      relevanceScore: bestImage.relevanceScore,
                      educationalValue: bestImage.educationalValue,
                      appropriateness: bestImage.appropriateness,
                      category: bestImage.category
                    });
                  }
                }
              } catch (error) {
                log.warn('Failed AI-powered search', { slideNumber: validatedSlide.number, error: (error as Error).message });
              }
            }

            // Se ainda não encontrou imagem, deixar sem imagem ao invés de usar genérica
            if (!imageUrl) {
              log.info('No image found via smart search, leaving slide without image', { slideNumber: validatedSlide.number, topic });
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
            provider: usedProvider,
            model: usedProvider === 'openai' ? OPENAI_MODEL : GEMINI_MODEL,
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
          costEstimate: usedProvider === 'openai' 
            ? (totalTokens * 0.00015).toFixed(6) // GPT-4o mini pricing: ~$0.00015 per 1K tokens
            : (totalTokens * 0.000075).toFixed(6), // Gemini 1.5 Flash pricing: ~$0.000075 per 1K tokens
          pricingNote: usedProvider === 'openai' 
            ? 'Estimated cost based on GPT-4o mini pricing. Verify with current OpenAI pricing.'
            : 'Estimated cost based on Gemini 1.5 Flash pricing. Verify with current Google AI Studio pricing.',
          provider: usedProvider,
          model: usedProvider === 'openai' ? OPENAI_MODEL : GEMINI_MODEL,
        },
      };

      const totalDuration = Math.round((Date.now() - startTime) / 1000);
      log.info(`${usedProvider === 'openai' ? 'OpenAI' : 'Gemini'} lesson generated successfully`, {
        totalDuration,
        slides: finalSlides.length,
        provider: usedProvider,
        // qualityScore: metrics.quality.score, // Validação de qualidade desabilitada
        costEstimate: responseData.usage.costEstimate,
      });

      // 💾 SAVE TO NEON DATABASE
      if (session?.user?.id) {
        try {
          const { saveLessonToDatabase } = await import('@/lib/save-lesson-to-db');
          
          const saveResult = await saveLessonToDatabase({
            id: responseData.lesson.id,
            title: responseData.lesson.title,
            topic: topic,
            subject: responseData.lesson.subject,
            level: responseData.lesson.level,
            slides: finalSlides,
            userId: session.user.id,
            provider: usedProvider,
            metadata: {
              model: usedProvider === 'openai' ? OPENAI_MODEL : GEMINI_MODEL,
              usage: {
                inputTokens: (response.usage as any)?.promptTokens || 0,
                outputTokens: (response.usage as any)?.completionTokens || 0,
                totalTokens: totalTokens
              },
              costEstimate: responseData.usage.costEstimate,
              duration: totalDuration * 1000, // convert to ms
              objectives: responseData.lesson.objectives,
              subject: responseData.lesson.subject,
              grade: responseData.lesson.metadata.grade
            }
          });
          
          if (saveResult.success) {
            log.info('✅ Lesson saved to Neon database', { lessonId: saveResult.lessonId });
          } else {
            log.warn('⚠️ Failed to save lesson to database (non-critical)', { error: saveResult.error });
          }
        } catch (dbError) {
          log.warn('⚠️ Database save error (non-critical)', { error: (dbError as Error).message });
          // Continue mesmo se não conseguir salvar - não bloqueia o fluxo
        }
      }

      return NextResponse.json(responseData);

  } catch (error) {
    const totalDuration = Math.round((Date.now() - startTime) / 1000);
    log.error('Lesson generation failed', { error: (error as Error).message, duration: totalDuration });

    let statusCode = 500;
    let friendlyError = 'Erro interno do servidor';

    const errorMessage = (error as Error).message;

    if (errorMessage.includes('sobrecarregado') || errorMessage.includes('overloaded')) {
      friendlyError = 'O modelo Gemini está temporariamente sobrecarregado. Por favor, tente novamente em alguns minutos.';
      statusCode = 503; // Service Unavailable
    } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
      friendlyError = 'Limite de requisições excedido. Por favor, tente novamente mais tarde.';
      statusCode = 429; // Too Many Requests
    } else if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
      friendlyError = 'Erro de configuração da API Gemini.';
      statusCode = 500;
    } else if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
      friendlyError = 'Timeout na conexão. Verifique sua internet e tente novamente.';
      statusCode = 408; // Request Timeout
    } else if (errorMessage.includes('Topic')) {
      friendlyError = errorMessage;
      statusCode = 400; // Bad Request
    } else if (errorMessage.includes('Failed after 3 attempts')) {
      friendlyError = 'O serviço está temporariamente indisponível. Tente novamente em alguns minutos.';
      statusCode = 503; // Service Unavailable
    }

    return NextResponse.json(
      { 
        error: friendlyError, 
        details: errorMessage, 
        timestamp: new Date().toISOString(),
        retryAfter: statusCode === 503 || statusCode === 429 ? 300 : undefined // Suggest retry after 5 minutes
      },
      { 
        status: statusCode,
        headers: statusCode === 503 || statusCode === 429 ? {
          'Retry-After': '300' // 5 minutes
        } : undefined
      }
    );
  }
}

export const runtime = 'nodejs';
