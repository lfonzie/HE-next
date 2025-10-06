import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { processQueryWithAI } from '@/lib/query-processor';

export const dynamic = 'force-dynamic';

interface GeneratedImage {
  url: string;
  prompt: string;
  type: string;
  style: string;
  description: string;
  generationTime: number;
  success: boolean;
  error?: string;
}

interface TestResult {
  success: boolean;
  topic: string;
  subject?: string;
  totalImagesGenerated: number;
  successfulImages: GeneratedImage[];
  failedImages: { image: GeneratedImage; reason: string }[];
  generationTime: number;
  averageGenerationTime: number;
  recommendations: string[];
  errors?: string[];
  aiProcessing?: {
    originalTopic: string;
    correctedQuery: string;
    extractedTheme: string;
    translatedTheme: string;
    confidence: number;
    corrections: string[];
    language: string;
    processingTime: number;
  };
  imageStrategy?: {
    type: string;
    style: string;
    reasoning: string;
    context: string;
  };
}

// Configuração do Gemini 2.5 Flash Image Preview
const GEMINI_CONFIG = {
  model: 'gemini-2.5-flash-image-preview', // Modelo correto para geração de imagens
  maxRetries: 3,
  timeout: 30000
};

// Função para gerar placeholder base64 confiável
function generatePlaceholderImage(type: string, prompt: string): string {
  const colors = {
    diagram: '#4F46E5',
    illustration: '#059669', 
    chart: '#DC2626',
    infographic: '#EA580C',
    photo: '#7C3AED'
  };
  
  const color = colors[type as keyof typeof colors] || '#6B7280';
  const text = type.toUpperCase();
  
  // Gerar SVG base64 para evitar dependência de serviços externos
  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <rect x="50" y="50" width="700" height="500" fill="white" stroke="${color}" stroke-width="4" rx="20"/>
      <text x="400" y="280" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
            text-anchor="middle" fill="${color}">${text}</text>
      <text x="400" y="340" font-family="Arial, sans-serif" font-size="16" 
            text-anchor="middle" fill="#6B7280">Generated with Gemini 2.5 Flash</text>
      <text x="400" y="480" font-family="Arial, sans-serif" font-size="12" 
            text-anchor="middle" fill="#9CA3AF" width="600">${prompt.substring(0, 60)}${prompt.length > 60 ? '...' : ''}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Função para IA decidir a melhor estratégia de imagem com contexto específico
async function determineImageStrategy(translatedTheme: string, extractedTheme: string): Promise<{
  type: string;
  style: string;
  reasoning: string;
  context: string;
}> {
  try {
    console.log(`🎯 IA analisando estratégia para: "${translatedTheme}"`);
    
    // Análise inteligente baseada no tema com contexto específico
    const theme = translatedTheme.toLowerCase();
    
    // Determinar tipo baseado no conteúdo e contexto
    let type = 'illustration'; // padrão
    let style = 'educational'; // padrão
    let reasoning = '';
    let context = '';
    
    // Análise de contexto específico primeiro
    if (theme.includes('metallica')) {
      type = 'illustration';
      style = 'artistic';
      context = 'banda de heavy metal';
      reasoning = 'Metallica detectado - banda de heavy metal, melhor representado como ilustração artística com elementos musicais';
    } else if (theme.includes('beatles') || theme.includes('queen') || theme.includes('led zeppelin')) {
      type = 'illustration';
      style = 'artistic';
      context = 'banda musical';
      reasoning = 'Banda musical detectada - melhor representado como ilustração artística com elementos musicais';
    } else if (theme.includes('michael jackson') || theme.includes('madonna') || theme.includes('elvis')) {
      type = 'illustration';
      style = 'artistic';
      context = 'artista musical';
      reasoning = 'Artista musical detectado - melhor representado como ilustração artística';
    } else if (theme.includes('star wars') || theme.includes('marvel') || theme.includes('dc comics')) {
      type = 'illustration';
      style = 'artistic';
      context = 'franquia de entretenimento';
      reasoning = 'Franquia de entretenimento detectada - melhor representado como ilustração artística';
    } else if (theme.includes('pokemon') || theme.includes('mario') || theme.includes('zelda')) {
      type = 'illustration';
      style = 'artistic';
      context = 'jogo/videogame';
      reasoning = 'Jogo/videogame detectado - melhor representado como ilustração artística';
    } else if (theme.includes('harry potter') || theme.includes('lord of the rings') || theme.includes('game of thrones')) {
      type = 'illustration';
      style = 'artistic';
      context = 'série/livro';
      reasoning = 'Série/livro detectado - melhor representado como ilustração artística';
    } else {
      // Análise de tipo baseado no conteúdo geral
      if (theme.includes('process') || theme.includes('how') || theme.includes('work') || 
          theme.includes('step') || theme.includes('cycle') || theme.includes('flow')) {
        type = 'diagram';
        reasoning = 'Processo ou fluxo detectado - melhor representado como diagrama';
      } else if (theme.includes('data') || theme.includes('statistic') || theme.includes('chart') ||
                 theme.includes('graph') || theme.includes('number') || theme.includes('percentage')) {
        type = 'chart';
        reasoning = 'Dados ou estatísticas detectadas - melhor representado como gráfico';
      } else if (theme.includes('history') || theme.includes('war') || theme.includes('battle') ||
                 theme.includes('revolution') || theme.includes('ancient') || theme.includes('medieval')) {
        type = 'illustration';
        reasoning = 'Tema histórico detectado - melhor representado como ilustração';
      } else if (theme.includes('science') || theme.includes('biology') || theme.includes('chemistry') ||
                 theme.includes('physics') || theme.includes('molecule') || theme.includes('cell')) {
        type = 'diagram';
        reasoning = 'Tema científico detectado - melhor representado como diagrama científico';
      } else if (theme.includes('art') || theme.includes('painting') || theme.includes('artist') ||
                 theme.includes('creative') || theme.includes('design')) {
        type = 'illustration';
        reasoning = 'Tema artístico detectado - melhor representado como ilustração artística';
      }
    }
    
    // Determinar estilo baseado no tipo e tema
    if (type === 'diagram') {
      if (theme.includes('science') || theme.includes('biology') || theme.includes('chemistry') ||
          theme.includes('physics') || theme.includes('medical') || theme.includes('anatomy')) {
        style = 'scientific';
        reasoning += ' - Estilo científico para precisão técnica';
      } else {
        style = 'educational';
        reasoning += ' - Estilo educacional para clareza';
      }
    } else if (type === 'chart') {
      style = 'modern';
      reasoning += ' - Estilo moderno para visualização de dados';
    } else if (type === 'illustration') {
      if (theme.includes('history') || theme.includes('ancient') || theme.includes('classical')) {
        style = 'classic';
        reasoning += ' - Estilo clássico para temas históricos';
      } else if (theme.includes('art') || theme.includes('creative') || theme.includes('design')) {
        style = 'artistic';
        reasoning += ' - Estilo artístico para temas criativos';
      } else {
        style = 'educational';
        reasoning += ' - Estilo educacional para clareza';
      }
    }
    
    const strategy = {
      type,
      style,
      reasoning: reasoning || `Tipo ${type} e estilo ${style} escolhidos automaticamente pela IA`,
      context: context || 'tema geral'
    };
    
    console.log(`✅ Estratégia determinada:`, strategy);
    return strategy;
    
  } catch (error) {
    console.error('Erro ao determinar estratégia:', error);
    return {
      type: 'illustration',
      style: 'educational',
      reasoning: 'Estratégia padrão aplicada devido a erro na análise',
      context: 'tema geral'
    };
  }
}

// Função para construir prompt otimizado baseado no tipo e contexto
function buildOptimizedPrompt(topic: string, type: string, style: string, context: string, variation: number = 1): string {
  const basePrompt = `Create a ${type} about ${topic}`;
  
  // Prompts específicos por contexto
  if (context.includes('banda') || context.includes('heavy metal') || context.includes('musical')) {
    return buildMusicPrompt(topic, type, style, variation);
  } else if (context.includes('jogo') || context.includes('videogame')) {
    return buildGamePrompt(topic, type, style, variation);
  } else if (context.includes('franquia') || context.includes('entretenimento')) {
    return buildEntertainmentPrompt(topic, type, style, variation);
  } else if (context.includes('série') || context.includes('livro')) {
    return buildStoryPrompt(topic, type, style, variation);
  } else {
    return buildGeneralPrompt(topic, type, style, variation);
  }
}

// Prompts específicos para música/bandas
function buildMusicPrompt(topic: string, type: string, style: string, variation: number): string {
  const variations = [
    `Create a powerful visual illustration of ${topic}. Use dark, metallic colors, lightning effects, and musical symbols. Show guitars, drums, and stage elements. Use dramatic lighting and bold visual composition. NO TEXT, NO LABELS, NO WORDS - pure visual storytelling through music imagery.`,
    `Create an artistic visual representation of ${topic}. Use electric blues, purples, and silver tones. Include musical instruments, sound waves, and concert atmosphere. Use dynamic composition with energy and movement. NO TEXT, NO LABELS, NO WORDS - pure visual music experience.`,
    `Create a striking visual depiction of ${topic}. Use black, red, and gold color scheme. Show stage lights, amplifiers, and musical energy. Use bold contrasts and dramatic visual effects. NO TEXT, NO LABELS, NO WORDS - pure visual rock and roll.`,
    `Create a dynamic visual illustration of ${topic}. Use metallic grays, electric blues, and bright accents. Include musical elements, concert stage, and performance energy. Use strong visual composition with movement and power. NO TEXT, NO LABELS, NO WORDS - pure visual heavy metal.`
  ];
  
  return variations[variation - 1] || variations[0];
}

// Prompts específicos para jogos/videogames
function buildGamePrompt(topic: string, type: string, style: string, variation: number): string {
  const variations = [
    `Create a vibrant visual illustration of ${topic}. Use bright, colorful game-style graphics with pixel art elements. Include game characters, power-ups, and interactive elements. Use playful composition and gaming aesthetics. NO TEXT, NO LABELS, NO WORDS - pure visual gaming experience.`,
    `Create an artistic visual representation of ${topic}. Use neon colors, digital effects, and futuristic elements. Include game world, characters, and adventure elements. Use dynamic composition with gaming atmosphere. NO TEXT, NO LABELS, NO WORDS - pure visual game world.`,
    `Create a detailed visual depiction of ${topic}. Use rich colors, detailed characters, and fantasy elements. Include magical effects, adventure scenes, and interactive elements. Use immersive composition with gaming spirit. NO TEXT, NO LABELS, NO WORDS - pure visual adventure.`,
    `Create a dynamic visual illustration of ${topic}. Use bold colors, action elements, and gaming graphics. Include characters, environments, and interactive features. Use energetic composition with gaming excitement. NO TEXT, NO LABELS, NO WORDS - pure visual gaming action.`
  ];
  
  return variations[variation - 1] || variations[0];
}

// Prompts específicos para entretenimento/franquias
function buildEntertainmentPrompt(topic: string, type: string, style: string, variation: number): string {
  const variations = [
    `Create a cinematic visual illustration of ${topic}. Use dramatic colors, epic scenes, and movie-style composition. Include iconic elements, characters, and memorable moments. Use cinematic lighting and storytelling visuals. NO TEXT, NO LABELS, NO WORDS - pure visual cinema.`,
    `Create an artistic visual representation of ${topic}. Use rich colors, detailed characters, and epic atmosphere. Include iconic symbols, scenes, and dramatic elements. Use powerful composition with entertainment value. NO TEXT, NO LABELS, NO WORDS - pure visual entertainment.`,
    `Create a striking visual depiction of ${topic}. Use bold colors, iconic elements, and dramatic composition. Include memorable characters, scenes, and visual storytelling. Use cinematic effects and entertainment aesthetics. NO TEXT, NO LABELS, NO WORDS - pure visual storytelling.`,
    `Create a dynamic visual illustration of ${topic}. Use vibrant colors, action elements, and entertainment graphics. Include iconic moments, characters, and dramatic scenes. Use energetic composition with entertainment excitement. NO TEXT, NO LABELS, NO WORDS - pure visual entertainment experience.`
  ];
  
  return variations[variation - 1] || variations[0];
}

// Prompts específicos para séries/livros
function buildStoryPrompt(topic: string, type: string, style: string, variation: number): string {
  const variations = [
    `Create a magical visual illustration of ${topic}. Use mystical colors, fantasy elements, and story atmosphere. Include magical creatures, enchanted settings, and adventure elements. Use enchanting composition with storytelling magic. NO TEXT, NO LABELS, NO WORDS - pure visual fantasy.`,
    `Create an artistic visual representation of ${topic}. Use rich colors, detailed characters, and epic atmosphere. Include story elements, characters, and dramatic scenes. Use immersive composition with narrative power. NO TEXT, NO LABELS, NO WORDS - pure visual storytelling.`,
    `Create a detailed visual depiction of ${topic}. Use atmospheric colors, fantasy elements, and story world. Include magical settings, characters, and adventure scenes. Use captivating composition with story immersion. NO TEXT, NO LABELS, NO WORDS - pure visual adventure.`,
    `Create a dynamic visual illustration of ${topic}. Use vibrant colors, fantasy elements, and story graphics. Include magical moments, characters, and dramatic scenes. Use energetic composition with story excitement. NO TEXT, NO LABELS, NO WORDS - pure visual fantasy world.`
  ];
  
  return variations[variation - 1] || variations[0];
}

// Prompts gerais para temas educacionais/científicos
function buildGeneralPrompt(topic: string, type: string, style: string, variation: number): string {
  const basePrompt = topic.toLowerCase();
  
  // Prompts específicos por tipo - SEM TEXTO, APENAS IMAGENS VISUAIS
  const typePrompts: { [key: string]: string } = {
    diagram: `Create a detailed visual diagram showing ${basePrompt}. Use only visual elements, shapes, colors, and symbols to explain the concept. NO TEXT, NO LABELS, NO WORDS - pure visual communication. Use clean, scientific style with high contrast colors.`,
    illustration: `Create a beautiful visual illustration of ${basePrompt}. Use only visual elements, colors, and artistic composition to tell the story. NO TEXT, NO LABELS, NO WORDS - pure visual storytelling. Use vibrant colors and clear visual elements.`,
    chart: `Create a professional visual chart representing ${basePrompt}. Use only visual elements like bars, lines, shapes, and colors to show data. NO TEXT, NO LABELS, NO WORDS - pure visual data representation. Use clean, modern design.`,
    infographic: `Create an informative visual infographic about ${basePrompt}. Use only visual elements, icons, shapes, and colors to convey information. NO TEXT, NO LABELS, NO WORDS - pure visual communication. Use modern design principles.`,
    photo: `Create a realistic visual representation of ${basePrompt}. Use only visual elements, colors, and composition. NO TEXT, NO LABELS, NO WORDS - pure visual imagery. Make it look like a high-quality visual suitable for educational materials.`
  };

  // Estilos específicos - SEM TEXTO
  const stylePrompts: { [key: string]: string } = {
    educational: 'Use clear, educational visual design principles. Focus on visual clarity and learning through pure imagery. NO TEXT.',
    scientific: 'Use scientific accuracy and precision through visual elements only. Include technical visual details and professional presentation. NO TEXT.',
    artistic: 'Use creative and artistic visual elements while maintaining educational value. Focus on visual appeal through pure imagery. NO TEXT.',
    modern: 'Use contemporary visual design trends, clean lines, and modern color schemes. Pure visual communication. NO TEXT.',
    classic: 'Use traditional educational visual design with timeless visual elements. Pure visual storytelling. NO TEXT.'
  };

  let prompt = typePrompts[type] || typePrompts.diagram;
  
  // Adicionar estilo
  if (stylePrompts[style]) {
    prompt += ` ${stylePrompts[style]}`;
  }

  // Adicionar variação para criar imagens diferentes
  const variationSuffixes = [
    ' Use dynamic composition with movement and energy.',
    ' Show different perspective or angle.',
    ' Include additional visual elements and details.',
    ' Use alternative color scheme and visual style.'
  ];
  
  if (variation > 1 && variation <= variationSuffixes.length) {
    prompt += variationSuffixes[variation - 1];
  }

  // Adicionar especificações técnicas - SEM TEXTO
  prompt += ' Generate a high-quality visual image suitable for educational materials. IMPORTANT: NO TEXT, NO LABELS, NO WORDS - only pure visual elements, shapes, colors, and symbols.';

  return prompt;
}

// Função para gerar imagem usando Gemini 2.5 Flash
async function generateImageWithGemini(
  prompt: string, 
  type: string, 
  style: string
): Promise<GeneratedImage> {
  const startTime = Date.now();
  
  try {
    // Verificar se a API key está configurada
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    );
    
    const model = genAI.getGenerativeModel({ model: GEMINI_CONFIG.model });

    console.log(`🎨 Gerando ${type} com Gemini 2.5 Flash Image Preview: "${prompt}"`);

    // Para o Gemini 2.5 Flash Image Preview, usamos o método generateContent
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    const generationTime = Date.now() - startTime;
    
    // Verificar se a resposta contém uma imagem
    if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      const content = response.candidates[0].content;
      
      console.log(`📊 Resposta do Gemini:`, {
        candidates: response.candidates.length,
        hasContent: !!content,
        partsCount: content.parts?.length || 0
      });
      
      // Procurar por imagens na resposta
      if (content.parts && content.parts.length > 0) {
        for (let i = 0; i < content.parts.length; i++) {
          const part = content.parts[i];
          console.log(`Parte ${i}:`, {
            hasInlineData: !!part.inlineData,
            mimeType: part.inlineData?.mimeType,
            dataLength: part.inlineData?.data?.length || 0
          });
          
          if (part.inlineData && part.inlineData.data) {
            // Imagem encontrada como base64
            const imageData = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            const imageUrl = `data:${mimeType};base64,${imageData}`;
            
            console.log(`✅ Imagem gerada com sucesso! Tipo: ${mimeType}, Tamanho: ${imageData.length} caracteres`);
            
            return {
              url: imageUrl,
              prompt,
              type,
              style,
              description: `Generated ${type} for: ${prompt.substring(0, 50)}...`,
              generationTime,
              success: true
            };
          }
        }
      }
    }
    
    // Se não encontrou imagem na resposta, usar placeholder
    console.warn('Nenhuma imagem encontrada na resposta do Gemini, usando placeholder');
    const mockImageUrl = generatePlaceholderImage(type, prompt);
    
    return {
      url: mockImageUrl,
      prompt,
      type,
      style,
      description: `Generated ${type} for: ${prompt.substring(0, 50)}... (placeholder)`,
      generationTime,
      success: false,
      error: 'No image generated by Gemini API'
    };

  } catch (error) {
    const generationTime = Date.now() - startTime;
    console.error('Erro ao gerar imagem com Gemini:', error);
    
    return {
      url: generatePlaceholderImage(type, prompt),
      prompt,
      type,
      style,
      description: `Failed to generate ${type} - using placeholder`,
      generationTime,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Função para gerar múltiplas imagens com estratégia escolhida pela IA
async function generateMultipleImagesWithStrategy(
  topic: string,
  strategy: { type: string; style: string; reasoning: string; context: string },
  count: number = 3
): Promise<GeneratedImage[]> {
  const images: GeneratedImage[] = [];
  
  console.log(`🎨 Gerando ${count} imagens com estratégia: ${strategy.type} + ${strategy.style} (${strategy.context})`);
  
  // Gerar imagens com pequenas variações no prompt baseadas no contexto
  for (let i = 0; i < count; i++) {
    const variationPrompt = buildOptimizedPrompt(topic, strategy.type, strategy.style, strategy.context, i + 1);
    
    const image = await generateImageWithGemini(variationPrompt, strategy.type, strategy.style);
    images.push(image);
    
    // Pausa entre gerações para evitar rate limits
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return images;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic } = body;

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Tópico é obrigatório e deve ser uma string' },
        { status: 400 }
      );
    }

    console.log(`🧪 Teste de geração de imagens para: "${topic}"`);

    const startTime = Date.now();
    
    // 1. Processar query com IA para classificação e tradução
    console.log(`🧠 Processando query com IA: "${topic}"`);
    const aiProcessingStart = Date.now();
    const processedQuery = await processQueryWithAI(topic);
    const aiProcessingTime = Date.now() - aiProcessingStart;
    
    console.log(`✅ Query processada pela IA:`, {
      original: processedQuery.originalQuery,
      corrected: processedQuery.correctedQuery,
      extracted: processedQuery.extractedTheme,
      translated: processedQuery.translatedTheme,
      confidence: processedQuery.confidence,
      corrections: processedQuery.corrections
    });
    
    // 2. IA decide automaticamente o melhor tipo e estilo de imagem
    const imageStrategy = await determineImageStrategy(processedQuery.translatedTheme, processedQuery.extractedTheme);
    console.log(`🎯 Estratégia de imagem escolhida pela IA:`, imageStrategy);
    
    // Usar o tema traduzido pela IA para geração de imagens
    const finalTopic = processedQuery.translatedTheme;
    
    // Gerar múltiplas imagens para teste usando a estratégia escolhida pela IA
    const images = await generateMultipleImagesWithStrategy(finalTopic, imageStrategy, 4);
    
    // Separar sucessos e falhas
    const successfulImages = images.filter(img => img.success);
    const failedImages = images.filter(img => !img.success).map(img => ({
      image: img,
      reason: img.error || 'Geração falhou'
    }));
    
    // Calcular métricas
    const totalGenerationTime = Date.now() - startTime;
    const averageGenerationTime = successfulImages.length > 0 
      ? Math.round(successfulImages.reduce((sum, img) => sum + img.generationTime, 0) / successfulImages.length)
      : 0;
    
    // Gerar recomendações
    const recommendations: string[] = [];
    
    if (successfulImages.length === 0) {
      recommendations.push('Verificar se a API key do Gemini está configurada corretamente');
      recommendations.push('Tentar com um prompt mais simples ou específico');
    } else if (successfulImages.length < images.length) {
      recommendations.push('Algumas imagens falharam - verificar logs para detalhes');
    }
    
    if (averageGenerationTime > 10000) {
      recommendations.push('Tempo de geração alto - considerar otimizar prompts');
    }
    
    if (successfulImages.length > 0) {
      recommendations.push('Imagens geradas com sucesso! Teste diferentes tipos e estilos');
    }
    
    // Recomendações baseadas no processamento com IA
    if (processedQuery.confidence < 70) {
      recommendations.push('Confiança baixa na classificação - considerar usar termos mais específicos');
    }
    
    if (processedQuery.corrections.length > 0) {
      recommendations.push(`IA corrigiu ${processedQuery.corrections.length} erro(s) na query`);
    }
    
    const result: TestResult = {
      success: successfulImages.length > 0,
      topic,
      totalImagesGenerated: images.length,
      successfulImages,
      failedImages,
      generationTime: totalGenerationTime,
      averageGenerationTime,
      recommendations,
      aiProcessing: {
        originalTopic: processedQuery.originalQuery,
        correctedQuery: processedQuery.correctedQuery,
        extractedTheme: processedQuery.extractedTheme,
        translatedTheme: processedQuery.translatedTheme,
        confidence: processedQuery.confidence,
        corrections: processedQuery.corrections,
        language: processedQuery.language,
        processingTime: aiProcessingTime
      },
      imageStrategy: {
        type: imageStrategy.type,
        style: imageStrategy.style,
        reasoning: imageStrategy.reasoning,
        context: imageStrategy.context
      }
    };

    console.log(`✅ Teste concluído: ${successfulImages.length}/${images.length} imagens geradas com sucesso`);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ Erro no teste de geração de imagens:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Erro desconhecido',
        topic: '',
        subject: '',
        totalImagesGenerated: 0,
        successfulImages: [],
        failedImages: [],
        generationTime: 0,
        averageGenerationTime: 0,
        recommendations: ['Verificar configuração da API', 'Tentar novamente'],
        errors: [error.message || 'Erro desconhecido']
      },
      { status: 500 }
    );
  }
}
