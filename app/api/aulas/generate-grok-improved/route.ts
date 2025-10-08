// app/api/aulas/generate-grok-improved/route.ts
// Improved Grok lesson generation with parallel processing and optimized image search

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { callGrok } from '@/lib/providers/grok';
import { ensureQuizFormat } from '@/lib/quiz-validation';
import { log } from '@/lib/lesson-logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { classifyContentWithAI } from '@/lib/ai-content-classifier';

// Constants for Grok configuration - optimized for ultra-fast performance
const TOTAL_SLIDES = 14;
const QUIZ_SLIDE_NUMBERS = [5, 11];
const IMAGE_SLIDE_NUMBERS = [1, 3, 6, 9, 12, 14];
const GROK_MODEL = 'grok-4-fast-reasoning'; // Ultra-fast Grok model for lesson generation
const MAX_TIMEOUT = 90000; // 1.5 minutes (reduced from 2 minutes)
const IMAGE_SEARCH_TIMEOUT = 10000; // 10 seconds (reduced from 60 seconds)

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

// Função para gerar query educacional de imagem
function generateEducationalImageQuery(topic: string, slideNumber: number, slideType: string): string {
  const baseTopic = topic.toLowerCase();
  const educationalQuery = `${baseTopic} educational concept learning study`;
  
  log.debug('Generated specific image query', { 
    slideNumber, 
    educationalQuery
  });
  
  return educationalQuery;
}

// Função para validar estrutura da aula
function validateLessonStructure(lessonData: any) {
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
 * Handles POST requests to generate a lesson using Grok with parallel processing and optimized image search.
 */
export async function POST(request: Request) {
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
    log.info('Starting improved Grok lesson generation', { topic, mode, schoolId });

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

    // Enhanced lesson generation prompt optimized for Grok
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

ESTRUTURA DOS QUIZZES (Slides 5 e 12):
- Slide 5: Quiz intermediário com 3 perguntas sobre conceitos básicos
- Slide 12: Quiz final com 3 perguntas sobre aplicações e conceitos avançados
- Cada pergunta deve ter: question, options (array com 4 opções), correct (índice 0-3), explanation
- Use perguntas que testem compreensão, não apenas memorização
- As opções devem ser realistas e desafiadoras
- A explicação deve ser educativa e detalhada

EXEMPLO DE SLIDE DE QUIZ:
{
  "slideNumber": 5,
  "title": "Quiz: Verificação de Compreensão",
  "content": "Agora vamos testar seu entendimento dos conceitos aprendidos. Responda as 3 perguntas abaixo para continuar.",
  "type": "quiz",
  "questions": [
    {
      "question": "Qual é a principal força que mantém os planetas em órbita?",
      "options": ["Força centrípeta", "Gravidade", "Força magnética", "Força elétrica"],
      "correct": 1,
      "explanation": "A gravidade é a força fundamental que mantém os planetas em órbita ao redor do Sol, conforme descrito pela Lei da Gravitação Universal de Newton."
    },
    {
      "question": "O que acontece com a força gravitacional quando a distância entre dois objetos dobra?",
      "options": ["Dobra", "Diminui pela metade", "Diminui para 1/4", "Permanece igual"],
      "correct": 2,
      "explanation": "Segundo a Lei da Gravitação Universal, a força gravitacional é inversamente proporcional ao quadrado da distância. Quando a distância dobra, a força diminui para 1/4."
    },
    {
      "question": "Qual cientista formulou a Lei da Gravitação Universal?",
      "options": ["Einstein", "Galileu", "Newton", "Darwin"],
      "correct": 2,
      "explanation": "Isaac Newton formulou a Lei da Gravitação Universal em 1687, descrevendo como a força gravitacional funciona entre objetos com massa."
    }
  ],
  "timeEstimate": 4
}

FORMATO JSON:
{
  "title": "Aula sobre ${topic}",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Introdução ao ${topic}",
      "content": "Defina claramente o que é ${topic} de forma simples mas completa, explicando sua natureza fundamental e importância histórica.\\n\\nDesenvolva o contexto histórico relevante, destacando descobertas importantes e cientistas que contribuíram para o entendimento atual.\\n\\nExplique por que este tema é crucial para os estudantes, conectando com aplicações práticas no cotidiano e profissões relacionadas.",
      "type": "content",
      "imageQuery": "${topic}",
      "timeEstimate": 5
    }
  ]
}

Tópico: ${topic}

IMPORTANTE: 
- Cada slide deve ter conteúdo rico e detalhado (400-500 tokens)
- Use apenas termos específicos do tópico em inglês para imageQuery
- Evite termos genéricos educacionais
- Desenvolva parágrafos explicativos completos e substanciais
- Responda APENAS com JSON válido`;

    // PARALLEL PROCESSING: Generate lesson and prepare image prompts simultaneously
    log.info('🚀 Starting parallel processing: lesson generation + image preparation', { 
      topic,
      model: GROK_MODEL,
      maxTimeout: MAX_TIMEOUT / 1000 + 's',
      imageSearchTimeout: IMAGE_SEARCH_TIMEOUT / 1000 + 's'
    });
    
    const parallelStartTime = Date.now();
    
    // 1. Generate lesson using Grok with timeout
    log.info('📝 Initiating Grok lesson generation', {
      model: GROK_MODEL,
      promptLength: lessonPrompt.length,
      timeout: MAX_TIMEOUT / 1000 + 's'
    });
    
    const lessonPromise = Promise.race([
      callGrok(GROK_MODEL, [], lessonPrompt, undefined),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Lesson generation timeout (${MAX_TIMEOUT/1000}s)`)), MAX_TIMEOUT)
      )
    ]);
    
    // 2. Prepare optimized image search queries based on topic
    log.info('🖼️ Preparing image search queries', { topic });
    const imageQueriesPromise = generateOptimizedImageQueries(topic);
    
    // Wait for both to complete
    log.info('⏳ Waiting for parallel tasks to complete...');
    const [response, imageQueries] = await Promise.all([lessonPromise, imageQueriesPromise]) as [any, string[]];
    
    const parallelEndTime = Date.now();
    log.info('✅ Parallel processing completed', { 
      topic, 
      duration: Math.round((parallelEndTime - parallelStartTime) / 1000),
      usage: response.usage,
      finishReason: 'stop',
      contentLength: response.text.length,
      provider: 'grok',
      imageQueriesPrepared: imageQueries.length
    });

    // Parse and validate lesson content
    log.info('🔍 Parsing lesson JSON', {
      responseLength: response.text.length,
      responsePreview: response.text.substring(0, 200) + '...'
    });
    
    const parseStartTime = Date.now();
    let lessonData: any;
    try {
      // Extract JSON from response
      log.info('🔎 Extracting JSON from response...');
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      lessonData = JSON.parse(jsonMatch[0]);
      
      log.info('✅ JSON parsed successfully', {
        hasSlides: !!lessonData.slides,
        slidesCount: lessonData.slides?.length || 0,
        hasTitle: !!lessonData.title,
        hasTopics: !!lessonData.topics
      });
      
      // Ensure slides array exists and has correct structure
      if (!lessonData.slides || !Array.isArray(lessonData.slides)) {
        throw new Error('Invalid slides structure');
      }
      
      // Add title if missing
      if (!lessonData.title) {
        lessonData.title = `Aula sobre ${topic}`;
      }
      
      // Process slides to ensure correct format
      lessonData.slides = lessonData.slides.map((slide: any, index: number) => ({
        slideNumber: slide.slideNumber || slide.number || index + 1,
        title: slide.title || `Slide ${index + 1}`,
        type: slide.type || 'content',
        content: slide.content || '',
        timeEstimate: slide.timeEstimate || 5,
        imageQuery: slide.imageQuery || '',
        questions: slide.questions || []
      }));
      
    } catch (parseError) {
      log.error('Failed to parse lesson JSON', { error: (parseError as Error).message, response: response.text });
      throw new Error('Failed to parse lesson content');
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
    
    // ULTRA-FAST image search - single API call, no filtering, cached results
    let selectedImages: any[] = [];
    try {
      // Use translated query directly (already optimized)
      const mainQuery = imageQueries[0];
      
      log.info('⚡ Starting ULTRA-FAST image search', { 
        topic, 
        translatedQuery: mainQuery,
        requestedImages: 6,
        endpoint: '/api/internal/images/fast-search'
      });
      
      const imageSearchStart = Date.now();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/internal/images/fast-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: mainQuery, 
          count: 6
        }),
      });
      
      const imageSearchDuration = Date.now() - imageSearchStart;
      
      if (response.ok) {
        const data = await response.json();
        
        log.info('✅ FAST image search completed', {
          success: data.success,
          imagesCount: data.images?.length || 0,
          provider: data.provider,
          cached: data.cached,
          duration: imageSearchDuration + 'ms',
          processingTime: data.processingTime + 'ms'
        });
        
        if (data.success && data.images?.length > 0) {
          selectedImages = data.images.map((img: any, index: number) => ({
            url: img.url,
            title: img.title,
            description: img.description,
            provider: img.provider,
            attribution: img.attribution || '',
            license: img.license || '',
            author: img.author || '',
            sourceUrl: img.sourceUrl || '',
            score: 90, // High score for fast-search results
            queryUsed: mainQuery
          }));
          
          log.info('✨ Images ready for lesson', { 
            totalImages: selectedImages.length,
            providers: [...new Set(selectedImages.map(img => img.provider))],
            cached: data.cached,
            query: mainQuery
          });
        }
      } else {
        log.error('❌ Fast image search failed', {
          status: response.status,
          statusText: response.statusText,
          duration: imageSearchDuration + 'ms'
        });
      }
    } catch (error) {
      log.error('❌ Image search error', { 
        error: (error as Error).message,
        stack: (error as Error).stack
      });
      // Continue without images - slides will use placeholders
      selectedImages = [];
    }
    
    const imageEndTime = Date.now();

    // Processar slides com imagens selecionadas
    const usedImageUrls = new Set();
    
    // Distribuir imagens de forma equilibrada pelos slides que precisam
    const slidesNeedingImages = lessonData.slides.filter((slide: any) => 
      IMAGE_SLIDE_NUMBERS.includes(slide.slideNumber)
    );
    
    log.info('Image distribution analysis', {
      totalImages: selectedImages.length,
      slidesNeedingImages: slidesNeedingImages.length,
      slideNumbers: slidesNeedingImages.map(s => s.slideNumber),
      imageUrls: selectedImages.map(img => img.url)
    });
    
    // Process slides with selected images
    const finalSlides = lessonData.slides.map((slide: any) => {
      if (IMAGE_SLIDE_NUMBERS.includes(slide.slideNumber)) {
        const imageQuery = slide.imageQuery || generateEducationalImageQuery(topic, slide.slideNumber, slide.type);
        slide.imageQuery = imageQuery;
        
        // Distribuir imagens de forma equilibrada
        if (selectedImages.length > 0) {
          const slideIndex = slidesNeedingImages.findIndex(s => s.slideNumber === slide.slideNumber);
          
          // Distribuição mais inteligente: usar todas as imagens disponíveis
          let imageIndex;
          if (selectedImages.length >= slidesNeedingImages.length) {
            // Se temos mais imagens que slides, usar uma imagem por slide
            imageIndex = slideIndex;
          } else {
            // Se temos menos imagens que slides, distribuir de forma equilibrada
            imageIndex = Math.floor((slideIndex * selectedImages.length) / slidesNeedingImages.length);
          }
          
          // Garantir que não excedemos o índice das imagens disponíveis
          imageIndex = Math.min(imageIndex, selectedImages.length - 1);
          
          const selectedImage = selectedImages[imageIndex];
          
          slide.imageUrl = selectedImage.url;
          slide.imageAttribution = selectedImage.attribution;
          slide.imageLicense = selectedImage.license;
          slide.imageAuthor = selectedImage.author;
          slide.imageSource = selectedImage.provider;
          usedImageUrls.add(selectedImage.url);
          
          log.debug('Image assigned to slide', {
            slideNumber: slide.slideNumber,
            slideIndex,
            imageIndex,
            imageUrl: selectedImage.url,
            imageTitle: selectedImage.title
          });
        } else {
          // Fallback: usar placeholder
          slide.imageUrl = `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=${encodeURIComponent(imageQuery)}`;
        }
      }
      return slide;
    });

    // Log final da distribuição de imagens
    log.info('Final image distribution summary', {
      totalImagesAvailable: selectedImages.length,
      uniqueImagesUsed: usedImageUrls.size,
      usedImageUrls: Array.from(usedImageUrls),
      distributionEfficiency: `${usedImageUrls.size}/${selectedImages.length} images used`
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
        stages: finalSlides.map((slide: any, index: number) => {
          // Debug das perguntas do quiz
          if (slide.type === 'quiz') {
            log.info('Processing quiz slide', {
              slideNumber: slide.slideNumber,
              originalQuestions: slide.questions,
              questionsLength: slide.questions?.length || 0,
              questionsType: typeof slide.questions
            });
            
            const processedQuestions = ensureQuizFormat(slide.questions);
            log.info('Quiz questions processed', {
              slideNumber: slide.slideNumber,
              processedQuestions,
              processedLength: processedQuestions?.length || 0
            });
          }
          
          return {
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
          };
        }),
        feedback: { pacing: metrics },
        slides: finalSlides.map((slide: any) => ({
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
        totalTimeout: MAX_TIMEOUT / 1000, // 1.5 minutes
        imageSearchTimeout: IMAGE_SEARCH_TIMEOUT / 1000, // 10 seconds
        ultraFastMode: true,
        cachedImages: selectedImages.length > 0 && selectedImages[0]?.provider === 'cache'
      }
    };

    // Log successful generation
    const totalDuration = Math.round((Date.now() - startTime) / 1000);
    log.info('Improved Grok lesson generated successfully', { 
      topic, 
      totalDuration,
      slides: finalSlides.length,
      provider: 'grok',
      costEstimate: '0.000000', // Grok is currently free
      optimizedQueries: imageQueries.length,
      imagesFound: selectedImages.length
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
          provider: 'grok',
          metadata: {
            model: GROK_MODEL,
            usage: {
              inputTokens: 0,
              outputTokens: 0,
              totalTokens: 0
            },
            costEstimate: '0.000000',
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
    log.error('Improved Grok lesson generation failed', { 
      topic: 'unknown',
      error: (error as Error).message,
      stack: (error as Error).stack 
    });

    return NextResponse.json({ 
      error: (error as Error).message || 'Erro ao gerar aula com Grok melhorado',
      success: false 
    }, { status: 500 });
  }
}
