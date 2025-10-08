// app/api/aulas/generate-grok/route.ts
// Grok-specific lesson generation route for ultra-fast performance

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { callGrok } from '@/lib/providers/grok';
import { ensureQuizFormat } from '@/lib/quiz-validation';
import { log } from '@/lib/lesson-logger';
import { logTokens } from '@/lib/token-logger';
import { selectThreeDistinctImages, validateImageSelection } from '@/lib/image-selection-enhanced';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkMessageSafety, logInappropriateContentAttempt } from '@/lib/safety-middleware';
import { classifyContentWithAI } from '@/lib/ai-content-classifier';

// Constants for Grok configuration - optimized for speed
const TOTAL_SLIDES = 14;
const QUIZ_SLIDE_NUMBERS = [5, 11];
const IMAGE_SLIDE_NUMBERS = [1, 3, 6, 9, 12, 14];
const MIN_TOKENS_PER_SLIDE = 200; // Reduced for faster generation
const GROK_MODEL = 'grok-4-fast-reasoning'; // Ultra-fast Grok model
const MAX_TOKENS = 8000; // Increased for richer content
const TEMPERATURE = 0.7;

// Grok model configuration
const GROK_MODEL_NAME = GROK_MODEL;

// Função para limpar JSON malformado
function cleanJsonString(jsonString: string): string {
  try {
    // Remove caracteres de controle e quebras de linha problemáticas
    let cleaned = jsonString
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/\n/g, '\\n') // Escape newlines
      .replace(/\r/g, '\\r') // Escape carriage returns
      .replace(/\t/g, '\\t'); // Escape tabs
    
    // Corrigir vírgulas duplas ou ausentes
    cleaned = cleaned
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/([{\[,])\s*([}\]])/g, '$1$2') // Remove empty objects/arrays
      .replace(/([^\\])\\([^"\\\/bfnrt])/g, '$1\\\\$2'); // Fix escaped characters
    
    // Tentar corrigir aspas não fechadas
    const quoteCount = (cleaned.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) {
      // Adicionar aspas de fechamento se necessário
      cleaned += '"';
    }
    
    return cleaned;
  } catch (error) {
    console.error('Error cleaning JSON:', error);
    return jsonString; // Return original if cleaning fails
  }
}

// Função para reconstruir aula a partir de texto estruturado
function reconstructLessonFromText(text: string, topic: string): any {
  const slides: any[] = [];
  
  // Extrair slides usando regex para encontrar padrões de slide
  const slidePattern = /slide\s*(\d+)[:\-]?\s*(.*?)(?=slide\s*\d+[:\-]?|$)/gi;
  const slideMatches = text.match(slidePattern);
  
  if (slideMatches) {
    slideMatches.forEach((match, index) => {
      const slideNumber = index + 1;
      const content = match.replace(/slide\s*\d+[:\-]?\s*/i, '').trim();
      
      slides.push({
        slideNumber,
        title: `Slide ${slideNumber}`,
        type: slideNumber === 5 || slideNumber === 11 ? 'quiz' : 'content',
        content: content || `Conteúdo do slide ${slideNumber}`,
        timeEstimate: 5,
        imageQuery: '',
        questions: []
      });
    });
  } else {
    // Fallback: criar slides básicos
    for (let i = 1; i <= TOTAL_SLIDES; i++) {
      slides.push({
        slideNumber: i,
        title: `Slide ${i}`,
        type: i === 5 || i === 11 ? 'quiz' : 'content',
        content: `Conteúdo do slide ${i} sobre ${topic}`,
        timeEstimate: 5,
        imageQuery: '',
        questions: []
      });
    }
  }
  
  return {
    title: `Aula sobre ${topic}`,
    slides
  };
}

// Função para gerar termos semânticos relacionados
function generateSemanticTerms(topic: string, slideNumber: number, slideType: string): string[] {
  const topicLower = topic.toLowerCase();
  const terms: string[] = [];
  
  // Mapeamento semântico por área de conhecimento
  const semanticMappings: Record<string, string[]> = {
    // Biologia e Ciências da Vida
    'respiração': ['lungs', 'breathing', 'respiratory system', 'pulmonary', 'oxygen', 'carbon dioxide', 'alveoli', 'diaphragm', 'chest', 'anatomy'],
    'respiratory': ['lungs', 'breathing', 'respiratory system', 'pulmonary', 'oxygen', 'carbon dioxide', 'alveoli', 'diaphragm', 'chest', 'anatomy'],
    'pulmão': ['lungs', 'breathing', 'respiratory system', 'pulmonary', 'oxygen', 'carbon dioxide', 'alveoli', 'diaphragm', 'chest', 'anatomy'],
    'coração': ['heart', 'cardiac', 'circulation', 'blood', 'cardiovascular', 'pulse', 'artery', 'vein', 'anatomy'],
    'cérebro': ['brain', 'neural', 'neuron', 'nervous system', 'synapse', 'cerebral', 'anatomy', 'psychology'],
    'digestão': ['digestion', 'stomach', 'intestine', 'gastrointestinal', 'enzymes', 'metabolism', 'nutrition'],
    'fotossíntese': ['photosynthesis', 'chlorophyll', 'plants', 'leaves', 'sunlight', 'carbon dioxide', 'oxygen', 'biology'],
    
    // Química
    'química': ['chemistry', 'laboratory', 'molecules', 'atoms', 'reactions', 'chemical', 'experiment', 'science'],
    'alimentos': ['food', 'nutrition', 'ingredients', 'cooking', 'kitchen', 'diet', 'healthy', 'organic'],
    'reação': ['reaction', 'chemical', 'laboratory', 'experiment', 'molecules', 'atoms', 'science'],
    'molécula': ['molecule', 'atoms', 'chemical', 'structure', 'bonding', 'chemistry', 'science'],
    
    // Química Ambiental
    'meio ambiente': ['environment', 'environmental', 'ecology', 'ecosystem', 'sustainability', 'green', 'nature', 'conservation'],
    'ambiental': ['environmental', 'ecology', 'ecosystem', 'sustainability', 'green', 'nature', 'conservation', 'pollution'],
    'poluição': ['pollution', 'contamination', 'toxic', 'waste', 'emissions', 'environmental damage', 'cleanup'],
    'sustentabilidade': ['sustainability', 'sustainable', 'renewable', 'green energy', 'eco-friendly', 'conservation'],
    'ecologia': ['ecology', 'ecosystem', 'biodiversity', 'habitat', 'environmental science', 'nature conservation'],
    'reciclagem': ['recycling', 'waste management', 'sustainable', 'environmental protection', 'green practices'],
    'energia renovável': ['renewable energy', 'solar power', 'wind energy', 'green energy', 'sustainable energy'],
    'aquecimento global': ['global warming', 'climate change', 'greenhouse effect', 'carbon emissions', 'environmental impact'],
    
    // Física
    'física': ['physics', 'energy', 'force', 'motion', 'wave', 'particle', 'experiment', 'science'],
    'energia': ['energy', 'power', 'electricity', 'battery', 'solar', 'wind', 'renewable', 'physics'],
    'fotografia': ['photography', 'camera', 'lens', 'light', 'exposure', 'shutter', 'aperture', 'digital'],
    'internet': ['internet', 'network', 'computer', 'digital', 'technology', 'web', 'connection', 'data'],
    
    // História
    'revolução': ['revolution', 'history', 'freedom', 'independence', 'war', 'battle', 'historical', 'france'],
    'francesa': ['french', 'france', 'paris', 'history', 'culture', 'europe', 'revolution', 'historical'],
    'história': ['history', 'historical', 'ancient', 'medieval', 'civilization', 'culture', 'heritage', 'past'],
    
    // Matemática
    'matemática': ['mathematics', 'math', 'equation', 'formula', 'graph', 'chart', 'calculation', 'geometry', 'algebra'],
    'algoritmo': ['algorithm', 'programming', 'computer', 'code', 'logic', 'data', 'processing', 'technology'],
    
    // Geografia
    'geografia': ['geography', 'landscape', 'nature', 'environment', 'climate', 'terrain', 'geological', 'earth'],
    'clima': ['climate', 'weather', 'temperature', 'rain', 'sun', 'environment', 'nature', 'geography']
  };
  
  // Encontrar termos relacionados baseados no tópico
  for (const [key, relatedTerms] of Object.entries(semanticMappings)) {
    if (topicLower.includes(key)) {
      terms.push(...relatedTerms);
    }
  }
  
  // Termos gerais baseados no tipo de slide
  const slideTypeTerms: Record<string, string[]> = {
    'introduction': ['introduction', 'overview', 'beginning', 'start', 'concept'],
    'content': ['education', 'learning', 'study', 'knowledge', 'information'],
    'quiz': ['quiz', 'test', 'question', 'assessment', 'evaluation'],
    'closing': ['conclusion', 'ending', 'summary', 'final', 'complete']
  };
  
  if (slideTypeTerms[slideType]) {
    terms.push(...slideTypeTerms[slideType]);
  }
  
  // Termos específicos por número do slide
  const slideSpecificTerms: Record<number, string[]> = {
    1: ['introduction', 'overview', 'beginning'],
    2: ['fundamentals', 'basics', 'principles'],
    3: ['theory', 'concepts', 'development'],
    4: ['application', 'practice', 'examples'],
    5: ['quiz', 'test', 'assessment'],
    6: ['examples', 'cases', 'real world'],
    7: ['analysis', 'critical', 'thinking'],
    8: ['interdisciplinary', 'connections', 'integration'],
    9: ['future', 'trends', 'development'],
    10: ['synthesis', 'reflection', 'summary'],
    11: ['quiz', 'test', 'evaluation'],
    12: ['conclusions', 'findings', 'results'],
    13: ['next steps', 'continuation', 'progress'],
    14: ['motivation', 'inspiration', 'closing']
  };
  
  if (slideSpecificTerms[slideNumber]) {
    terms.push(...slideSpecificTerms[slideNumber]);
  }
  
  // Remover duplicatas e limitar a 8 termos mais relevantes
  const uniqueTerms = [...new Set(terms)];
  
  // Priorizar termos mais específicos e relevantes
  const prioritizedTerms = uniqueTerms
    .filter(term => term.length > 2) // Filtrar termos muito curtos
    .slice(0, 8);
  
  // Se não encontrou termos específicos, usar termos gerais educacionais
  if (prioritizedTerms.length === 0) {
    return ['education', 'learning', 'study', 'knowledge', 'science', 'research', 'academic', 'teaching'];
  }
  
  return prioritizedTerms;
}

// Translation dictionary for image query generation
const imageQueryTranslations = {
  'matemática': 'mathematics',
  'mathematics': 'mathematics',
  'física': 'physics',
  'physics': 'physics',
  'química': 'chemistry',
  'chemistry': 'chemistry',
  'biologia': 'biology',
  'biology': 'biology',
  'história': 'history',
  'history': 'history',
  'geografia': 'geography',
  'geography': 'geography',
  'português': 'portuguese language',
  'literatura': 'literature',
  'literature': 'literature',
  'filosofia': 'philosophy',
  'philosophy': 'philosophy',
  'sociologia': 'sociology',
  'sociology': 'sociology',
  'artes': 'arts',
  'arts': 'arts',
  'educação física': 'physical education',
  'inglês': 'english language',
  'espanhol': 'spanish language',
  'fotografia': 'photography',
  'photography': 'photography'
};

function generateEducationalImageQuery(topic, slideNumber, slideType, slideContent = '') {
  const baseTopic = topic.toLowerCase();
  const translatedTopic = imageQueryTranslations[baseTopic] || baseTopic;
  
  const educationalQuery = `${translatedTopic} educational concept learning study`;
  
  log.debug('Generated specific image query', { 
    slideNumber, 
    educationalQuery
  });
  
  return educationalQuery;
}

// Função para traduzir tema usando IA
async function translateTopicToEnglish(topic: string): Promise<string> {
  try {
    // Usar Gemini para extrair o tema principal e traduzi-lo
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `
Você é um especialista em tradução e análise de temas educacionais. 

TAREFA: Analise o tópico em português e extraia o tema principal, traduzindo-o para inglês de forma otimizada para busca de imagens educacionais.

TÓPICO: "${topic}"

INSTRUÇÕES:
1. Identifique o TEMA PRINCIPAL (conceito científico, processo, sistema, etc.)
2. Traduza APENAS o tema principal para inglês
3. Use termos científicos/educacionais apropriados
4. Foque em palavras-chave que funcionem bem em buscas de imagens
5. Seja conciso (máximo 3 palavras)

EXEMPLOS:
- "Como funciona a eletricidade?" → "electricity physics"
- "Como funciona a fotossíntese?" → "photosynthesis process"  
- "Como funciona a vacinação?" → "vaccination process"
- "Sistema nervoso" → "nervous system"
- "Fotossíntese" → "photosynthesis"

Responda APENAS com a tradução do tema principal, sem explicações adicionais.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedTopic = response.text().trim();
    
    log.info('AI translation completed', { 
      originalTopic: topic, 
      translatedTopic 
    });
    
    return translatedTopic;
  } catch (error) {
    log.warn('AI translation failed, using fallback', { 
      topic, 
      error: (error as Error).message 
    });
    
    // Fallback: extrair palavras-chave principais e traduzir manualmente
    const cleanTopic = topic.toLowerCase().replace(/[?¿!¡.,;:]/g, '').trim();
    const words = cleanTopic.split(' ').filter(word => 
      word.length > 2 && 
      !['como', 'funciona', 'a', 'o', 'as', 'os', 'de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos'].includes(word)
    );
    
    return words.join(' ');
  }
}

// Função para gerar queries otimizadas de imagens baseadas no tópico
async function generateOptimizedImageQueries(topic: string): Promise<string[]> {
  // Traduzir o tópico para inglês usando IA
  const translatedTopic = await translateTopicToEnglish(topic);
  
  // Usar apenas o tema traduzido para busca de imagens
  const queries = [translatedTopic];
  
  log.info('Generated optimized image queries', { 
    topic, 
    translatedTopic,
    queriesCount: queries.length,
    queries: queries
  });
  
  return queries;
}

/**
 * Selects the best educational image based on slide context and educational value.
 */
function selectBestEducationalImage(images, slideNumber, slideType, usedImageUrls = new Set()) {
  if (!images || images.length === 0) return null;

  // Prioritize providers by educational quality
  const providerPriority = {
    'wikimedia': 3, // Highest priority - reliable educational content
    'unsplash': 2,  // Good visual quality
    'pixabay': 1    // Good variety
  };

  // Calculate combined educational score
  const preferredProvider = getPreferredProviderForSlide(slideNumber);
  const scoredImages = images.map(image => {
    let educationalScore = image.score || 0;
    
    // Boost score for preferred provider
    if (image.provider === preferredProvider) {
      educationalScore += 0.3;
    }
    
    // Boost score for educational keywords
    const educationalKeywords = ['education', 'learning', 'study', 'school', 'classroom', 'student', 'teacher'];
    const hasEducationalKeywords = educationalKeywords.some(keyword => 
      (image.title + ' ' + image.description).toLowerCase().includes(keyword)
    );
    
    if (hasEducationalKeywords) {
      educationalScore += 0.2;
    }
    
    // Provider priority boost
    educationalScore += (providerPriority[image.provider] || 0) * 0.1;
    
    return {
      ...image,
      educationalScore
    };
  });

  // Sort by educational score and select best unused image
  scoredImages.sort((a, b) => b.educationalScore - a.educationalScore);
  
  for (const image of scoredImages) {
    if (!usedImageUrls.has(image.url)) {
      return image;
    }
  }
  
  return scoredImages[0] || null;
}

function getPreferredProviderForSlide(slideNumber) {
  // Prefer Wikimedia for educational content
  if (slideNumber <= 3) return 'wikimedia';
  if (slideNumber <= 6) return 'unsplash';
  if (slideNumber <= 9) return 'wikimedia';
  return 'pixabay';
}

function validateLessonStructure(lessonData) {
  const requiredFields = ['title', 'slides'];
  const missingFields = requiredFields.filter(field => !lessonData[field]);
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      issues: [`Missing required fields: ${missingFields.join(', ')}`],
      recommendations: ['Ensure all required fields are present in the lesson data']
    };
  }
  
  if (!Array.isArray(lessonData.slides) || lessonData.slides.length === 0) {
    return {
      isValid: false,
      issues: ['No slides found in lesson data'],
      recommendations: ['Generate at least one slide for the lesson']
    };
  }
  
  return {
    isValid: true,
    issues: [],
    recommendations: []
  };
}

/**
 * Handles POST requests to generate a lesson using Grok for ultra-fast performance.
 * Now with parallel processing and improved timeout handling.
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

    // Create mutable schoolId variable
    let schoolId = originalSchoolId;

    log.setSharedContext({ requestId, topic, schoolId, mode, timestamp: new Date().toISOString() });
    log.info('Starting Grok lesson generation', { topic, mode, schoolId });

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

    // Use default school profile if no schoolId provided
    if (!schoolId || schoolId.trim() === '') {
      log.warn('SchoolId is empty for sync mode', { topic, schoolId, mode });
      schoolId = 'default-school-profile';
      log.info('Using default school profile', { 
        topic, 
        schoolId, 
        mode, 
        originalSchoolId: originalSchoolId,
        defaultSchoolId: schoolId
      });
    }

    // Enhanced lesson generation prompt optimized for Grok - SAME QUALITY AS GEMINI
    const lessonPrompt = `Crie uma aula completa e didática sobre "${topic}" com exatamente 14 slides em JSON.

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

ESTRUTURA DETALHADA E ESPECÍFICA:
- Slide 1: Introdução clara com definição básica e importância do tema
- Slides 2-4: Conceitos fundamentais desenvolvidos progressivamente (do básico ao intermediário)
- Slide 5: Quiz sobre conceitos básicos aprendidos (perguntas específicas e objetivas)
- Slides 6-11: Aplicações práticas, exemplos reais e aprofundamento temático
- Slide 12: Quiz sobre aplicações e análise crítica (perguntas que testam compreensão prática)
- Slides 13-14: Síntese clara e perspectivas futuras (conclusões objetivas)

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
      "number": 5,
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

    // PARALLEL PROCESSING: Generate lesson and prepare image prompts simultaneously
    log.info('Starting parallel processing: lesson generation + image preparation', { topic });
    
    const parallelStartTime = Date.now();
    
    // 1. Generate lesson using Grok with timeout
    const lessonPromise = Promise.race([
      callGrok(GROK_MODEL_NAME, [], lessonPrompt, undefined),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Lesson generation timeout (180s)')), 180000)
      )
    ]);
    
    // 2. Prepare optimized image search queries based on topic
    const imageQueriesPromise = generateOptimizedImageQueries(topic);
    
    // Wait for both to complete
    const [response, imageQueries] = await Promise.all([lessonPromise, imageQueriesPromise]) as [any, string[]];
    
    const parallelEndTime = Date.now();
    log.info('Parallel processing completed', { 
      topic, 
      duration: Math.round((parallelEndTime - parallelStartTime) / 1000),
      usage: response.usage,
      finishReason: 'stop',
      contentLength: response.text.length,
      provider: 'grok',
      imageQueriesPrepared: imageQueries.length
    });

    // Parse and validate lesson content - USING SAME PARSING AS GEMINI
    const parseStartTime = Date.now();
    let lessonData;
    try {
      // Extract JSON from response - same method as Gemini
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      // Clean JSON before parsing
      const cleanedJson = cleanJsonString(jsonMatch[0]);
      lessonData = JSON.parse(cleanedJson);
      
      // Ensure slides array exists and has correct structure
      if (!lessonData.slides || !Array.isArray(lessonData.slides)) {
        throw new Error('Invalid slides structure');
      }
      
      // Add title if missing
      if (!lessonData.title) {
        lessonData.title = `Aula sobre ${topic}`;
      }
      
      // Process slides to ensure correct format
      lessonData.slides = lessonData.slides.map((slide, index) => ({
        slideNumber: slide.number || index + 1,
        title: slide.title || `Slide ${index + 1}`,
        type: slide.type || 'content',
        content: slide.content || '',
        timeEstimate: slide.timeEstimate || 5,
        imageQuery: slide.imageQuery || '',
        questions: slide.questions || []
      }));
      
    } catch (parseError) {
      log.error('Failed to parse lesson JSON', { error: (parseError as Error).message, response: response.text });
      
      // Try alternative parsing methods
      try {
        // Method 1: Try to extract JSON with more flexible regex
        const flexibleMatch = response.text.match(/\{(?:[^{}]|{[^{}]*})*\}/);
        if (flexibleMatch) {
          const alternativeCleaned = cleanJsonString(flexibleMatch[0]);
          lessonData = JSON.parse(alternativeCleaned);
          log.info('Successfully parsed JSON with alternative method');
        } else {
          throw new Error('No valid JSON structure found');
        }
      } catch (alternativeError) {
        // Method 2: Try to reconstruct JSON from structured text
        try {
          lessonData = reconstructLessonFromText(response.text, topic);
          log.info('Successfully reconstructed lesson from text');
        } catch (reconstructError) {
          log.error('All parsing methods failed', { 
            originalError: (parseError as Error).message,
            alternativeError: (alternativeError as Error).message,
            reconstructError: (reconstructError as Error).message
          });
          throw new Error('Failed to parse lesson content with all methods');
        }
      }
    }
    
    const parseEndTime = Date.now();

    // Validate lesson structure
    const validation = validateLessonStructure(lessonData);
    if (!validation.isValid) {
      log.error('Lesson validation failed', { issues: validation.issues });
      throw new Error(`Lesson validation failed: ${validation.issues.join(', ')}`);
    }

    // Process images for slides that need them - IMPROVED WITH OPTIMIZED QUERIES
    const imageStartTime = Date.now();
    
    // Sistema melhorado de seleção de imagens com queries otimizadas
    let selectedImages = [];
    try {
      // NOVO: Usar queries otimizadas preparadas anteriormente
      // Usar apenas a primeira query e buscar 6 imagens
      const mainQuery = imageQueries[0];
      
      log.info('🔍 Starting single-query image search', { 
        topic, 
        translatedTopic: mainQuery,
        requestedImages: 6
      });
      
      try {
        log.info('📡 Calling image search API', {
          query: mainQuery,
          count: 6,
          context: 'aula_educacional',
          endpoint: '/api/internal/images/search'
        });
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/internal/images/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            topic: mainQuery, 
            count: 6,
            context: 'aula_educacional'
          }),
        });
        
        log.info('📥 Image search API response received', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });
        
        if (response.ok) {
          const data = await response.json();
          
          log.info('📊 Image search data parsed', {
            success: data.success,
            imagesCount: data.images?.length || 0,
            hasImages: !!data.images,
            searchMethod: data.searchMethod,
            provider: data.provider
          });
          
          if (data.success && data.images?.length > 0) {
            const foundImages = data.images.map((img: any, index: number) => ({
              ...img,
              queryUsed: mainQuery,
              queryIndex: 0,
              imageIndex: index
            }));
            
            log.info('✅ Images found and processed', {
              totalImages: foundImages.length,
              imageUrls: foundImages.map((img: any) => img.url),
              imageTitles: foundImages.map((img: any) => img.title),
              providers: [...new Set(foundImages.map((img: any) => img.source || img.provider))]
            });
            
            // Usar as imagens encontradas
            selectedImages = foundImages.slice(0, 6).map((img: any) => ({
              url: img.url,
              title: img.title,
              description: img.description,
              provider: img.source || img.provider,
              attribution: img.attribution || '',
              license: img.license || '',
              author: img.author || '',
              sourceUrl: img.sourceUrl || '',
              score: img.relevanceScore || 80,
              queryUsed: img.queryUsed
            }));
            
            log.info('✨ Using single-query search results', { 
              totalImages: selectedImages.length,
              providers: [...new Set(selectedImages.map(img => img.provider))],
              query: mainQuery
            });
          } else {
            log.warn('⚠️ No images found in successful response', {
              dataSuccess: data.success,
              imagesArray: data.images
            });
          }
        } else {
          log.error('❌ Image search API response not OK', {
            status: response.status,
            statusText: response.statusText
          });
        }
      } catch (searchError) {
        log.error('❌ Image search failed with error', {
          error: (searchError as Error).message,
          stack: (searchError as Error).stack
        });
      }
      
      // Se não encontrou imagens suficientes, tentar fallback
      if (selectedImages.length < 3) {
        // FALLBACK: Usar API Unificada com timeout reduzido
        log.info('⚠️ Optimized search insufficient, trying unified API fallback', { 
          selectedImagesCount: selectedImages.length,
          topic 
        });
        
        const unifiedImageResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/internal/images/unified`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            topic: topic, 
            count: 6,
            context: 'aula_educacional',
            strategy: 'search_first',
            fallback: true
          }),
        });
        
        if (unifiedImageResponse.ok) {
          const unifiedImageData = await unifiedImageResponse.json();
          log.info('Unified image response received (fallback)', { 
            success: unifiedImageData.success, 
            imagesCount: unifiedImageData.images?.length || 0,
            strategy: unifiedImageData.strategy,
            processingTime: unifiedImageData.processingTime
          });
          
          if (unifiedImageData.success && unifiedImageData.images?.length > 0) {
            // Converter formato unificado para formato esperado
            selectedImages = unifiedImageData.images.map(img => ({
              url: img.url,
              title: img.title,
              description: img.description,
              provider: img.source === 'search' ? 'unified_search' : img.source === 'generation' ? 'unified_generation' : 'unified_placeholder',
              attribution: img.metadata?.provider || '',
              license: img.source === 'generation' ? 'Generated' : 'Various',
              author: img.metadata?.provider || 'AI Generated',
              sourceUrl: img.url,
              score: Math.round(img.relevance * 100) || 80
            }));
            
            log.info('Unified images selected for lesson (fallback)', {
              totalImages: selectedImages.length,
              strategy: unifiedImageData.strategy,
              searchResults: unifiedImageData.searchResults,
              generationResults: unifiedImageData.generationResults
            });
          }
        }
      }
    } catch (error) {
      log.error('Image selection failed', { error: (error as Error).message });
      selectedImages = [];
    }
    
    const imageEndTime = Date.now();

    // Processar slides com imagens selecionadas
    const usedImageUrls = new Set();
    
    // Distribuir imagens de forma equilibrada pelos slides que precisam
    const slidesNeedingImages = lessonData.slides.filter((slide: any) => 
      IMAGE_SLIDE_NUMBERS.includes(slide.slideNumber)
    );
    
    // Process slides with selected images
    const finalSlides = lessonData.slides.map((slide: any) => {
      if (IMAGE_SLIDE_NUMBERS.includes(slide.slideNumber)) {
        const imageQuery = slide.imageQuery || generateEducationalImageQuery(topic, slide.slideNumber, slide.type, slide.content);
        slide.imageQuery = imageQuery;
        
        // Distribuir imagens de forma equilibrada
        if (selectedImages.length > 0) {
          const slideIndex = slidesNeedingImages.findIndex(s => s.slideNumber === slide.slideNumber);
          const imageIndex = slideIndex % selectedImages.length; // Usar módulo para distribuir
          const selectedImage = selectedImages[imageIndex];
          
          slide.imageUrl = selectedImage.url;
          slide.imageAttribution = selectedImage.attribution;
          slide.imageLicense = selectedImage.license;
          slide.imageAuthor = selectedImage.author;
          slide.imageSource = selectedImage.provider;
          usedImageUrls.add(selectedImage.url);
        } else {
          // Fallback: usar placeholder
          slide.imageUrl = `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=${encodeURIComponent(imageQuery)}`;
        }
      }
      return slide;
    });

    // Calculate metrics
    const metricsStartTime = Date.now();
    const totalTokens = response.usage?.totalTokens || 0;
    const totalWords = response.text.split(' ').length;
    const synchronousTime = Math.ceil(totalWords / 150); // ~150 words per minute
    const asynchronousTime = Math.ceil(totalWords / 100); // ~100 words per minute for reading
    const tokenPerSlide = Math.ceil(totalTokens / TOTAL_SLIDES);
    const wordsPerSlide = Math.ceil(totalWords / TOTAL_SLIDES);

    const metrics = {
      totalTokens,
      totalWords,
      synchronousTime,
      asynchronousTime,
      tokenPerSlide,
      wordsPerSlide,
      duration: {
        sync: synchronousTime,
        async: asynchronousTime,
        total: synchronousTime + asynchronousTime
      },
    };
    const metricsEndTime = Date.now();

    const responseData = {
      success: true,
      lesson: {
        id: `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        title: lessonData.title || topic,
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
          provider: 'grok',
          model: GROK_MODEL,
          optimizedQueries: imageQueries.slice(0, 5), // Incluir queries usadas
          parallelProcessing: true, // Indicar que usou processamento paralelo
        },
      },
      topic,
      mode,
      slides: finalSlides,
      metrics,
      validation,
      usage: {
        promptTokens: (response.usage as any)?.promptTokens || 0,
        completionTokens: (response.usage as any)?.completionTokens || 0,
        totalTokens: (response.usage as any)?.totalTokens || 0,
      },
      provider: 'grok',
      generationTime: Math.round((Date.now() - startTime) / 1000),
      pacingMetrics: metrics,
      warnings: [],
      performance: {
        parallelProcessing: true,
        optimizedImageQueries: imageQueries.length,
        totalTimeout: 180, // 3 minutos
        imageSearchTimeout: 60 // 1 minuto para imagens
      }
    };

    // Log successful generation
    log.info('Grok lesson generated successfully', { 
      topic, 
      totalDuration: Math.round((Date.now() - startTime) / 1000),
      slides: finalSlides.length,
      provider: 'grok',
      costEstimate: '0.000000' // Grok is currently free
    });

    return NextResponse.json(responseData);

  } catch (error) {
    log.error('Grok lesson generation failed', { 
      topic: 'unknown',
      error: (error as Error).message,
      stack: (error as Error).stack 
    });

    return NextResponse.json({ 
      error: (error as Error).message || 'Erro ao gerar aula com Grok',
      success: false 
    }, { status: 500 });
  }
}
