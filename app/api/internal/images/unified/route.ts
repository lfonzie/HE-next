import { NextRequest, NextResponse } from 'next/server';

// Interface para requisição unificada
interface UnifiedImageRequest {
  topic: string;
  count?: number;
  context?: string;
  strategy?: 'search_first' | 'generate_first' | 'hybrid';
  fallback?: boolean;
}

// Interface para resposta unificada
interface UnifiedImageResponse {
  success: boolean;
  images: UnifiedImage[];
  strategy: string;
  processingTime: number;
  searchResults?: {
    found: number;
    sources: string[];
  };
  generationResults?: {
    generated: number;
    aiStrategy: any;
  };
  error?: string;
}

// Interface para imagem unificada
interface UnifiedImage {
  id: string;
  url: string;
  title: string;
  description: string;
  source: 'search' | 'generation' | 'placeholder';
  type: string;
  style: string;
  relevance: number;
  quality: number;
  isPlaceholder?: boolean;
  metadata?: {
    prompt?: string;
    provider?: string;
    generatedAt?: string;
    processingTime?: number;
  };
}

// Função para chamar API de busca
async function callSearchAPI(topic: string, count: number, context: string): Promise<any> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/internal/images/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        count,
        context
      })
    });

    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Erro ao chamar API de busca:', error);
    return { success: false, images: [], found: 0 };
  }
}

// Função para chamar API de geração
async function callGenerationAPI(topic: string, count: number, context: string, usePlaceholders: boolean = true): Promise<any> {
  try {
    // ✅ FIX: Sempre usar placeholders para evitar base64 pesado no localStorage
    console.log(`🎨 Chamando API de geração com usePlaceholders=${usePlaceholders}`);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/internal/images/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        count,
        context,
        usePlaceholders // Usar SVG placeholders ao invés de base64
      })
    });

    if (!response.ok) {
      throw new Error(`Generation API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Erro ao chamar API de geração:', error);
    return { success: false, images: [], aiStrategy: null };
  }
}

// Função para converter imagem de busca para formato unificado
function convertSearchImage(searchImage: any): UnifiedImage {
  return {
    id: searchImage.id,
    url: searchImage.url,
    title: searchImage.title,
    description: searchImage.description,
    source: 'search',
    type: searchImage.type || 'photo',
    style: searchImage.style || 'modern',
    relevance: searchImage.relevance || 0.8,
    quality: searchImage.quality || 0.8,
    isPlaceholder: searchImage.isPlaceholder || false,
    metadata: {
      provider: searchImage.source
    }
  };
}

// Função para converter imagem gerada para formato unificado
function convertGeneratedImage(generatedImage: any): UnifiedImage {
  return {
    id: generatedImage.id,
    url: generatedImage.url,
    title: generatedImage.prompt || 'Imagem gerada',
    description: generatedImage.prompt || '',
    source: 'generation',
    type: generatedImage.type || 'illustration',
    style: generatedImage.style || 'educational',
    relevance: 0.9,
    quality: generatedImage.isPlaceholder ? 0.6 : 0.9,
    isPlaceholder: generatedImage.isPlaceholder || false,
    metadata: {
      prompt: generatedImage.prompt,
      generatedAt: generatedImage.generatedAt,
      processingTime: generatedImage.processingTime
    }
  };
}

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

// Função para criar placeholders finais
function createFinalPlaceholders(count: number, topic: string): UnifiedImage[] {
  const placeholders: UnifiedImage[] = [];
  
  for (let i = 0; i < count; i++) {
    const placeholder = generatePlaceholderImage('photo', 'modern', i + 1);
    
    placeholders.push({
      id: `placeholder-final-${Date.now()}-${i}`,
      url: placeholder,
      title: `${topic} - Imagem ${i + 1}`,
      description: `Placeholder final para ${topic}`,
      source: 'placeholder',
      type: 'photo',
      style: 'modern',
      relevance: 0.5,
      quality: 0.6,
      isPlaceholder: true
    });
  }
  
  return placeholders;
}

// Handler principal da API
export async function POST(request: NextRequest) {
  try {
    const body: UnifiedImageRequest = await request.json();
    const { 
      topic, 
      count = 6, 
      context = 'aula_educacional', 
      strategy = 'search_first',
      fallback = true 
    } = body;

    if (!topic) {
      return NextResponse.json({
        success: false,
        error: 'Tópico é obrigatório'
      }, { status: 400 });
    }

    const startTime = Date.now();
    console.log(`🚀 API Unificada de Imagens iniciada para: "${topic}" (${strategy})`);

    let allImages: UnifiedImage[] = [];
    let searchResults: any = null;
    let generationResults: any = null;
    const usedStrategy = strategy;

    // Estratégia: Buscar primeiro
    if (strategy === 'search_first') {
      console.log(`🔍 Estratégia: Buscar primeiro`);
      
      // 1. Buscar imagens
      searchResults = await callSearchAPI(topic, count, context);
      
      if (searchResults.success && searchResults.images.length > 0) {
        const searchImages = searchResults.images.map(convertSearchImage);
        allImages.push(...searchImages);
        
        console.log(`✅ Busca: ${searchImages.length} imagens encontradas`);
        
        // 2. Se não encontrou o suficiente, gerar as faltantes
        if (searchImages.length < count) {
          const missingCount = count - searchImages.length;
          console.log(`🎨 Gerando ${missingCount} imagens faltantes`);
          
          generationResults = await callGenerationAPI(topic, missingCount, context);
          
          if (generationResults.success && generationResults.images.length > 0) {
            const generatedImages = generationResults.images.map(convertGeneratedImage);
            allImages.push(...generatedImages);
            
            console.log(`✅ Geração: ${generatedImages.length} imagens geradas`);
          }
        }
      } else {
        // Se busca falhou, tentar geração
        console.log(`⚠️ Busca falhou, tentando geração`);
        generationResults = await callGenerationAPI(topic, count, context);
        
        if (generationResults.success && generationResults.images.length > 0) {
          const generatedImages = generationResults.images.map(convertGeneratedImage);
          allImages.push(...generatedImages);
          
          console.log(`✅ Geração: ${generatedImages.length} imagens geradas`);
        }
      }
    }
    
    // Estratégia: Gerar primeiro
    else if (strategy === 'generate_first') {
      console.log(`🎨 Estratégia: Gerar primeiro`);
      
      // 1. Gerar imagens
      generationResults = await callGenerationAPI(topic, count, context);
      
      if (generationResults.success && generationResults.images.length > 0) {
        const generatedImages = generationResults.images.map(convertGeneratedImage);
        allImages.push(...generatedImages);
        
        console.log(`✅ Geração: ${generatedImages.length} imagens geradas`);
        
        // 2. Se não gerou o suficiente, buscar as faltantes
        if (generatedImages.length < count) {
          const missingCount = count - generatedImages.length;
          console.log(`🔍 Buscando ${missingCount} imagens faltantes`);
          
          searchResults = await callSearchAPI(topic, missingCount, context);
          
          if (searchResults.success && searchResults.images.length > 0) {
            const searchImages = searchResults.images.map(convertSearchImage);
            allImages.push(...searchImages);
            
            console.log(`✅ Busca: ${searchImages.length} imagens encontradas`);
          }
        }
      } else {
        // Se geração falhou, tentar busca
        console.log(`⚠️ Geração falhou, tentando busca`);
        searchResults = await callSearchAPI(topic, count, context);
        
        if (searchResults.success && searchResults.images.length > 0) {
          const searchImages = searchResults.images.map(convertSearchImage);
          allImages.push(...searchImages);
          
          console.log(`✅ Busca: ${searchImages.length} imagens encontradas`);
        }
      }
    }
    
    // Estratégia: Híbrida (paralela)
    else if (strategy === 'hybrid') {
      console.log(`🔄 Estratégia: Híbrida (paralela)`);
      
      // Buscar e gerar em paralelo
      const [searchResult, generationResult] = await Promise.allSettled([
        callSearchAPI(topic, Math.ceil(count / 2), context),
        callGenerationAPI(topic, Math.ceil(count / 2), context)
      ]);
      
      // Processar resultados da busca
      if (searchResult.status === 'fulfilled' && searchResult.value.success) {
        searchResults = searchResult.value;
        const searchImages = searchResults.images.map(convertSearchImage);
        allImages.push(...searchImages);
        console.log(`✅ Busca paralela: ${searchImages.length} imagens encontradas`);
      }
      
      // Processar resultados da geração
      if (generationResult.status === 'fulfilled' && generationResult.value.success) {
        generationResults = generationResult.value;
        const generatedImages = generationResults.images.map(convertGeneratedImage);
        allImages.push(...generatedImages);
        console.log(`✅ Geração paralela: ${generatedImages.length} imagens geradas`);
      }
    }

    // 3. Se ainda não tem imagens suficientes, tentar busca adicional com termos específicos
    if (allImages.length < count && fallback) {
      const missingCount = count - allImages.length;
      console.log(`🔍 Buscando ${missingCount} imagens adicionais com termos específicos`);
      
      // Tentar busca adicional com termos mais específicos
      try {
        const additionalResponse = await callSearchAPI(topic, missingCount * 2, context);
        if (additionalResponse.success && additionalResponse.images?.length > 0) {
          const newImages = additionalResponse.images
            .filter(img => !allImages.some(existing => existing.url === img.url))
            .slice(0, missingCount);
          
          allImages.push(...newImages);
          console.log(`✅ Adicionadas ${newImages.length} imagens específicas`);
        }
      } catch (error) {
        console.warn('⚠️ Busca adicional falhou:', (error as Error).message);
      }
    }

    // 4. Limitar ao número solicitado
    allImages = allImages.slice(0, count);

    const processingTime = Date.now() - startTime;

    const result: UnifiedImageResponse = {
      success: true,
      images: allImages,
      strategy: usedStrategy,
      processingTime,
      searchResults: searchResults ? {
        found: searchResults.found || 0,
        sources: searchResults.searchStrategy?.sources || []
      } : undefined,
      generationResults: generationResults ? {
        generated: generationResults.images?.length || 0,
        aiStrategy: generationResults.aiStrategy
      } : undefined
    };

    console.log(`✅ API Unificada concluída: ${allImages.length}/${count} imagens em ${processingTime}ms`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Erro na API Unificada de Imagens:', error);
    
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
    name: 'API Unificada de Imagens',
    version: '1.0.0',
    description: 'API unificada que combina busca e geração de imagens',
    endpoints: {
      POST: {
        description: 'Buscar e/ou gerar imagens baseadas em tema',
        body: {
          topic: 'string (obrigatório)',
          count: 'number (opcional, padrão: 6)',
          context: 'string (opcional, padrão: aula_educacional)',
          strategy: 'string (opcional: search_first, generate_first, hybrid)',
          fallback: 'boolean (opcional, padrão: true)'
        }
      }
    },
    strategies: {
      search_first: 'Busca primeiro, gera se necessário',
      generate_first: 'Gera primeiro, busca se necessário',
      hybrid: 'Busca e gera em paralelo'
    },
    features: [
      'Estratégias múltiplas de busca/geração',
      'Fallback inteligente',
      'Processamento paralelo',
      'Integração com aulas e chat',
      'Formato unificado de resposta'
    ]
  });
}
