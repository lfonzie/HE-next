import { NextRequest, NextResponse } from 'next/server';
import { processQueryWithAI } from '@/lib/query-processor';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

// Interface para requisição de geração de imagens
interface ImageGenerationRequest {
  topic: string;
  count?: number;
  context?: string;
  style?: string;
  fallback?: boolean;
}

// Interface para resposta da API
interface ImageGenerationResponse {
  success: boolean;
  images: GeneratedImage[];
  processingTime: number;
  aiStrategy?: {
    type: string;
    style: string;
    reasoning: string;
    context: string;
  };
  aiProcessing?: {
    originalQuery: string;
    correctedQuery: string;
    extractedTheme: string;
    translatedTheme: string;
    confidence: number;
    corrections: string[];
    language: string;
  };
  error?: string;
}

// Interface para imagem gerada
interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  type: string;
  style: string;
  generatedAt: string;
  processingTime: number;
  isPlaceholder?: boolean;
}

// Configuração do Gemini 2.5 Flash Image Preview
const GEMINI_CONFIG = {
  model: 'gemini-2.5-flash-image-preview',
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  maxRetries: 3,
  timeout: 30000
};

// Função para gerar placeholder SVG
function generatePlaceholderImage(type: string, style: string, index: number): string {
  const colors = {
    educational: '#4F46E5',
    scientific: '#059669',
    artistic: '#DC2626',
    modern: '#7C3AED',
    classic: '#D97706'
  };
  
  const color = colors[style as keyof typeof colors] || '#4F46E5';
  
  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill="${color}" opacity="0.1"/>
      <rect x="50" y="50" width="700" height="500" fill="white" stroke="${color}" stroke-width="2" rx="10"/>
      <circle cx="400" cy="200" r="60" fill="${color}" opacity="0.3"/>
      <rect x="300" y="280" width="200" height="100" fill="${color}" opacity="0.2" rx="5"/>
      <text x="400" y="450" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="${color}">
        ${type.toUpperCase()} - ${style.toUpperCase()}
      </text>
      <text x="400" y="480" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="${color}" opacity="0.7">
        Imagem ${index} - Placeholder
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Função para IA decidir a melhor estratégia de imagem
async function determineImageStrategy(translatedTheme: string, extractedTheme: string): Promise<{
  type: string;
  style: string;
  reasoning: string;
  context: string;
}> {
  try {
    console.log(`🎯 IA analisando estratégia para: "${translatedTheme}"`);
    
    const theme = translatedTheme.toLowerCase();
    
    let type = 'illustration';
    let style = 'educational';
    let reasoning = '';
    let context = '';
    
    // Análise de contexto específico
    if (theme.includes('metallica')) {
      type = 'illustration';
      style = 'artistic';
      context = 'banda de heavy metal';
      reasoning = 'Metallica detectado - banda de heavy metal, melhor representado como ilustração artística';
    } else if (theme.includes('pokemon') || theme.includes('mario') || theme.includes('zelda')) {
      type = 'illustration';
      style = 'artistic';
      context = 'jogo/videogame';
      reasoning = 'Jogo/videogame detectado - melhor representado como ilustração artística';
    } else if (theme.includes('star wars') || theme.includes('marvel') || theme.includes('dc comics')) {
      type = 'illustration';
      style = 'artistic';
      context = 'franquia de entretenimento';
      reasoning = 'Franquia de entretenimento detectada - melhor representado como ilustração artística';
    } else {
      // Análise geral
      if (theme.includes('process') || theme.includes('how') || theme.includes('work') || 
          theme.includes('step') || theme.includes('cycle') || theme.includes('flow')) {
        type = 'diagram';
        reasoning = 'Processo ou fluxo detectado - melhor representado como diagrama';
      } else if (theme.includes('data') || theme.includes('statistic') || theme.includes('chart') ||
                 theme.includes('graph') || theme.includes('number') || theme.includes('percentage')) {
        type = 'chart';
        reasoning = 'Dados ou estatísticas detectadas - melhor representado como gráfico';
      } else if (theme.includes('science') || theme.includes('biology') || theme.includes('chemistry') ||
                 theme.includes('physics') || theme.includes('molecule') || theme.includes('cell')) {
        type = 'diagram';
        reasoning = 'Tema científico detectado - melhor representado como diagrama científico';
      }
    }
    
    // Determinar estilo
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
    
    return {
      type,
      style,
      reasoning: reasoning || `Tipo ${type} e estilo ${style} escolhidos automaticamente pela IA`,
      context: context || 'tema geral'
    };
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

// Função para construir prompt otimizado
function buildOptimizedPrompt(topic: string, type: string, style: string, context: string, variation: number = 1): string {
  const basePrompt = topic.toLowerCase();
  
  // Prompts específicos por contexto
  if (context.includes('banda') || context.includes('heavy metal') || context.includes('musical')) {
    return buildMusicPrompt(topic, type, style, variation);
  } else if (context.includes('jogo') || context.includes('videogame')) {
    return buildGamePrompt(topic, type, style, variation);
  } else if (context.includes('franquia') || context.includes('entretenimento')) {
    return buildEntertainmentPrompt(topic, type, style, variation);
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

// Prompts gerais para temas educacionais/científicos
function buildGeneralPrompt(topic: string, type: string, style: string, variation: number): string {
  const basePrompt = topic.toLowerCase();
  
  const typePrompts: { [key: string]: string } = {
    diagram: `Create a detailed visual diagram showing ${basePrompt}. Use only visual elements, shapes, colors, and symbols to explain the concept. NO TEXT, NO LABELS, NO WORDS - pure visual communication. Use clean, scientific style with high contrast colors.`,
    illustration: `Create a beautiful visual illustration of ${basePrompt}. Use only visual elements, colors, and artistic composition to tell the story. NO TEXT, NO LABELS, NO WORDS - pure visual storytelling. Use vibrant colors and clear visual elements.`,
    chart: `Create a professional visual chart representing ${basePrompt}. Use only visual elements like bars, lines, shapes, and colors to show data. NO TEXT, NO LABELS, NO WORDS - pure visual data representation. Use clean, modern design.`,
    infographic: `Create an informative visual infographic about ${basePrompt}. Use only visual elements, icons, shapes, and colors to convey information. NO TEXT, NO LABELS, NO WORDS - pure visual communication. Use modern design principles.`,
    photo: `Create a realistic visual representation of ${basePrompt}. Use only visual elements, colors, and composition. NO TEXT, NO LABELS, NO WORDS - pure visual imagery. Make it look like a high-quality visual suitable for educational materials.`
  };

  const stylePrompts: { [key: string]: string } = {
    educational: 'Use clear, educational visual design principles. Focus on visual clarity and learning through pure imagery. NO TEXT.',
    scientific: 'Use scientific accuracy and precision through visual elements only. Include technical visual details and professional presentation. NO TEXT.',
    artistic: 'Use creative and artistic visual elements while maintaining educational value. Focus on visual appeal through pure imagery. NO TEXT.',
    modern: 'Use contemporary visual design trends, clean lines, and modern color schemes. Pure visual communication. NO TEXT.',
    classic: 'Use traditional educational visual design with timeless visual elements. Pure visual storytelling. NO TEXT.'
  };

  let prompt = typePrompts[type] || typePrompts.diagram;
  
  if (stylePrompts[style]) {
    prompt += ` ${stylePrompts[style]}`;
  }

  // Adicionar variação
  const variationSuffixes = [
    ' Use dynamic composition with movement and energy.',
    ' Show different perspective or angle.',
    ' Include additional visual elements and details.',
    ' Use alternative color scheme and visual style.'
  ];
  
  if (variation > 1 && variation <= variationSuffixes.length) {
    prompt += variationSuffixes[variation - 1];
  }

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
    console.log(`🎨 Gerando ${type} com Gemini 2.5 Flash: "${prompt}"`);
    
    if (!GEMINI_CONFIG.apiKey) {
      throw new Error('API key não configurada');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CONFIG.model}:generateContent?key=${GEMINI_CONFIG.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API Gemini: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const imagePart = data.candidates[0].content.parts.find((part: any) => part.inlineData);
      
      if (imagePart && imagePart.inlineData) {
        const base64Image = imagePart.inlineData.data;
        const mimeType = imagePart.inlineData.mimeType || 'image/png';
        
        const processingTime = Date.now() - startTime;
        
        return {
          id: `gemini-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: `data:${mimeType};base64,${base64Image}`,
          prompt,
          type,
          style,
          generatedAt: new Date().toISOString(),
          processingTime,
          isPlaceholder: false
        };
      }
    }
    
    throw new Error('Resposta da API não contém imagem válida');
    
  } catch (error) {
    console.error(`❌ Erro ao gerar imagem com Gemini:`, error);
    
    // Fallback para placeholder
    const placeholder = generatePlaceholderImage(type, style, 1);
    const processingTime = Date.now() - startTime;
    
    return {
      id: `placeholder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: placeholder,
      prompt: `Placeholder para ${prompt}`,
      type,
      style,
      generatedAt: new Date().toISOString(),
      processingTime,
      isPlaceholder: true
    };
  }
}

// Função para gerar múltiplas imagens com estratégia da IA
async function generateMultipleImagesWithStrategy(
  topic: string,
  strategy: { type: string; style: string; reasoning: string; context: string },
  count: number = 3
): Promise<GeneratedImage[]> {
  const images: GeneratedImage[] = [];
  
  console.log(`🎨 Gerando ${count} imagens com estratégia: ${strategy.type} + ${strategy.style} (${strategy.context})`);
  
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

// Handler principal da API
export async function POST(request: NextRequest) {
  try {
    const body: ImageGenerationRequest = await request.json();
    const { topic, count = 6, context = 'aula_educacional', style, fallback = true } = body;

    if (!topic) {
      return NextResponse.json({
        success: false,
        error: 'Tópico é obrigatório'
      }, { status: 400 });
    }

    const startTime = Date.now();
    console.log(`🚀 API Interna de Geração de Imagens iniciada para: "${topic}"`);

    // 1. Processar query com IA
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

    // 2. Determinar estratégia de imagem
    const imageStrategy = await determineImageStrategy(
      processedQuery.translatedTheme,
      processedQuery.extractedTheme
    );

    console.log(`🎯 Estratégia determinada:`, imageStrategy);

    // 3. Gerar imagens
    const finalTopic = processedQuery.translatedTheme;
    const images = await generateMultipleImagesWithStrategy(finalTopic, imageStrategy, count);

    const processingTime = Date.now() - startTime;

    const result: ImageGenerationResponse = {
      success: true,
      images,
      processingTime,
      aiProcessing: {
        originalQuery: processedQuery.originalQuery,
        correctedQuery: processedQuery.correctedQuery,
        extractedTheme: processedQuery.extractedTheme,
        translatedTheme: processedQuery.translatedTheme,
        confidence: processedQuery.confidence,
        corrections: processedQuery.corrections,
        language: processedQuery.language
      },
      aiStrategy: {
        type: imageStrategy.type,
        style: imageStrategy.style,
        reasoning: imageStrategy.reasoning,
        context: imageStrategy.context
      }
    };

    console.log(`✅ API Interna concluída: ${images.length}/${count} imagens geradas em ${processingTime}ms`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Erro na API Interna de Geração de Imagens:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      processingTime: Date.now() - Date.now()
    }, { status: 500 });
  }
}

// Handler para GET (informações da API)
export async function GET() {
  return NextResponse.json({
    name: 'API Interna de Geração de Imagens',
    version: '1.0.0',
    description: 'API interna para geração de imagens educacionais',
    endpoints: {
      POST: {
        description: 'Gerar imagens baseadas em tema',
        body: {
          topic: 'string (obrigatório)',
          count: 'number (opcional, padrão: 6)',
          context: 'string (opcional, padrão: aula_educacional)',
          style: 'string (opcional)',
          fallback: 'boolean (opcional, padrão: true)'
        }
      }
    },
    features: [
      'Processamento inteligente com IA',
      'Estratégia automática de imagem',
      'Geração contextualizada',
      'Imagens puras (sem texto)',
      'Fallback para placeholders',
      'Integração com aulas e chat'
    ]
  });
}
