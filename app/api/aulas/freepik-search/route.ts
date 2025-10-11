import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { detectTheme } from '@/lib/themeDetection';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

interface FreepikImageResult {
  id: string;
  title: string;
  preview_url: string;
  download_url?: string;
  type: string;
  premium: boolean;
  author: {
    name: string;
    avatar_url?: string;
  };
  tags: string[];
  dimensions?: {
    width: number;
    height: number;
  };
}

interface SearchResult {
  success: boolean;
  images: Array<{
    url: string;
    title: string;
    description: string;
    provider: string;
    attribution: string;
    license: string;
    author: string;
    sourceUrl: string;
    score: number;
    id: string;
    premium: boolean;
    dimensions?: {
      width: number;
      height: number;
    };
  }>;
  totalFound: number;
  query: string;
  optimizedQuery: string;
  fallbackUsed: boolean;
  searchMethod: string;
}

/**
 * Busca imagens educacionais usando apenas a API do Freepik
 * Otimizada especificamente para conteúdo educacional
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, subject, count = 3 } = body;

    // Check authentication
    const { getServerSession } = await import('next-auth/next');
    const { authOptions } = await import('@/lib/auth');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Implement parental controls when available
    // For now, just check authentication

    if (!process.env.FREEPIK_API_KEY) {
      return NextResponse.json({ 
        success: false,
        error: 'Freepik API key not configured' 
      }, { status: 500 });
    }

    if (!query?.trim()) {
      return NextResponse.json({ 
        success: false,
        error: 'Query parameter is required' 
      }, { status: 400 });
    }

    console.log(`🔍 Buscando imagens no Freepik para: "${query}"`);

    // Extrair apenas o TEMA da query usando IA
    const theme = await extractTheme(query, subject);
    console.log(`📝 Tema extraído: "${theme}"`);

    // Buscar no Freepik Stock Content API com múltiplas tentativas
    let freepikResults: any[] = [];
    const queries = [
      enhanceQueryForEducation(theme),
      theme, // Query original
      translateToEnglish(theme) // Query traduzida
    ];
    
    for (const query of queries) {
      console.log(`🔍 Tentando Freepik com query: "${query}"`);
      const results = await searchFreepikImages(query, count);
      
      // Verificar se os resultados são relevantes
      const hasRelevantResults = results.some(img => {
        const title = img.title?.toLowerCase() || '';
        const veryIrrelevantTerms = ['pumpkin', 'instagram', 'concrete', 'wall', 'abstract surface'];
        return !veryIrrelevantTerms.some(term => title.includes(term));
      });
      
      if (hasRelevantResults) {
        freepikResults = results;
        console.log(`✅ Freepik encontrou resultados relevantes com query: "${query}"`);
        break;
      } else {
        console.log(`❌ Freepik retornou resultados irrelevantes com query: "${query}"`);
      }
    }
    
    // Verificar se as imagens são relevantes com análise rigorosa
    const irrelevantTerms = ['pumpkin', 'instagram', 'concrete', 'wall', 'texture', 'surface', 'abstract', 'pattern', 'background', 'generic', 'placeholder', 'transport', 'vehicle', 'metal', 'scrap'];
    
    // Análise mais inteligente de relevância para Freepik
    const relevantImages = freepikResults.filter(img => {
      const title = img.title?.toLowerCase() || '';
      const description = img.description?.toLowerCase() || '';
      const allText = `${title} ${description}`;
      
      // Verificar se tem termos irrelevantes
      const hasIrrelevantTerms = irrelevantTerms.some(term => allText.includes(term));
      
      // Verificar se tem termos específicos do tema
      const themeWords = theme.toLowerCase().split(' ');
      const hasThemeTerms = themeWords.some(word => allText.includes(word));
      
      // Verificar score de relevância
      const relevanceScore = calculateRelevanceScore(img, theme);
      
      // Lógica mais inteligente e permissiva para Freepik:
      // 1. Se tem score alto (>0.3), aceitar independente de outros critérios
      // 2. Se tem termos do tema E não tem termos irrelevantes, aceitar
      // 3. Se não tem termos irrelevantes E score > 0.2, aceitar
      // 4. Para temas educacionais, ser muito mais permissivo
      // 5. Se é do Freepik e não tem termos muito irrelevantes, aceitar
      
      const isEducationalTheme = theme.toLowerCase().includes('photosynthesis') || 
                                 theme.toLowerCase().includes('solar') ||
                                 theme.toLowerCase().includes('revolution') || 
                                 theme.toLowerCase().includes('history') || 
                                 theme.toLowerCase().includes('war') ||
                                 theme.toLowerCase().includes('ancient') ||
                                 theme.toLowerCase().includes('recycling');
      
      // Termos muito irrelevantes que devem ser rejeitados sempre
      const veryIrrelevantTerms = ['instagram', 'pumpkin', 'concrete', 'wall'];
      const hasVeryIrrelevantTerms = veryIrrelevantTerms.some(term => allText.includes(term));
      
      if (hasVeryIrrelevantTerms) {
        return false; // Rejeitar imagens muito irrelevantes
      }
      
      if (relevanceScore > 0.3) {
        return true; // Score alto sempre aceito
      }
      
      if (hasThemeTerms && !hasIrrelevantTerms) {
        return true; // Tem termos do tema e não é irrelevante
      }
      
      if (!hasIrrelevantTerms && relevanceScore > 0.2) {
        return true; // Não é irrelevante e tem score decente
      }
      
      // Para temas educacionais, ser muito mais permissivo
      if (isEducationalTheme && !hasIrrelevantTerms && relevanceScore > 0.1) {
        return true;
      }
      
      // Se é do Freepik e não tem termos muito irrelevantes, aceitar com score baixo
      if (!hasIrrelevantTerms && relevanceScore > 0.05) {
        return true;
      }
      
      return false;
    });
    
    const hasEnoughRelevantImages = relevantImages.length >= Math.min(count, 1);
    
    // Detectar se Freepik está retornando resultados completamente irrelevantes
    const hasVeryIrrelevantResults = freepikResults.some(img => {
      const title = img.title?.toLowerCase() || '';
      const veryIrrelevantTerms = ['pumpkin', 'instagram', 'concrete', 'wall', 'abstract surface'];
      return veryIrrelevantTerms.some(term => title.includes(term));
    });
    
    // Detectar se Freepik está retornando sempre as mesmas imagens (problema da API)
    const isFreepikBroken = freepikResults.length > 0 && 
      freepikResults.every(img => 
        img.title?.toLowerCase().includes('pumpkin') || 
        img.title?.toLowerCase().includes('instagram') || 
        img.title?.toLowerCase().includes('abstract surface')
      );
    
    console.log(`📊 Análise de relevância: ${freepikResults.length} total, ${relevantImages.length} relevantes`);
    console.log(`🔍 [FREEPIK DECISION] Count solicitado: ${count}, Imagens relevantes: ${relevantImages.length}, Tem imagens suficientes: ${hasEnoughRelevantImages}`);
    console.log(`🔍 [FREEPIK QUALITY] Tem resultados muito irrelevantes: ${hasVeryIrrelevantResults}`);
    console.log(`🔍 [FREEPIK BROKEN] API retornando sempre as mesmas imagens: ${isFreepikBroken}`);
    
    // Log detalhado para debug do Freepik
    if (freepikResults.length > 0) {
      console.log(`🔍 [FREEPIK DEBUG] Tema: "${theme}"`);
      freepikResults.forEach((img, index) => {
        const title = img.title?.toLowerCase() || '';
        const description = img.description?.toLowerCase() || '';
        const allText = `${title} ${description}`;
        const relevanceScore = calculateRelevanceScore(img, theme);
        const themeWords = theme.toLowerCase().split(' ');
        const hasThemeTerms = themeWords.some(word => allText.includes(word));
        const hasIrrelevantTerms = irrelevantTerms.some(term => allText.includes(term));
        
        console.log(`  📸 Imagem ${index + 1}: "${img.title}"`);
        console.log(`     Score: ${relevanceScore.toFixed(2)}, Tema: ${hasThemeTerms}, Irrelevante: ${hasIrrelevantTerms}`);
        console.log(`     Texto: "${allText.substring(0, 100)}..."`);
      });
    }
    
    if (!hasEnoughRelevantImages || hasVeryIrrelevantResults || isFreepikBroken) {
      // Fallback: usar sistema antigo com múltiplos provedores
      let reason = 'imagens insuficientes';
      if (hasVeryIrrelevantResults) reason = 'resultados muito irrelevantes';
      if (isFreepikBroken) reason = 'API retornando sempre as mesmas imagens (FREEPIK QUEBRADO)';
      
      console.log(`🔄 ${reason} no Freepik (${freepikResults.length} encontradas, ${relevantImages.length} relevantes), usando sistema antigo com múltiplos provedores...`);
      const fallbackResults = await searchMultipleProviders(theme, count);
      
      if (fallbackResults.length > 0) {
        console.log(`✅ Sistema antigo encontrou ${fallbackResults.length} imagens`);
        return NextResponse.json({
          success: true,
          images: fallbackResults,
          totalFound: fallbackResults.length,
          query,
          optimizedQuery: theme,
          fallbackUsed: true,
          searchMethod: 'multi-provider-fallback',
          freepikSkipped: hasVeryIrrelevantResults || isFreepikBroken,
          freepikBroken: isFreepikBroken
        });
      }
    }

    console.log(`✅ [FREEPIK SUCCESS] Usando ${relevantImages.length} imagens relevantes do Freepik`);
    console.log(`📊 Resultados Freepik: ${freepikResults.length} imagens encontradas`);

    return NextResponse.json({
      success: true,
      images: freepikResults,
      totalFound: freepikResults.length,
      query,
      optimizedQuery: theme,
      fallbackUsed: false,
      searchMethod: 'freepik-semantic'
    });

  } catch (error: any) {
    console.error('Erro na busca Freepik para aulas:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to search Freepik images',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * Busca imagens no Freepik Stock Content API
 */
async function searchFreepikImages(query: string, limit: number): Promise<any[]> {
  try {
    console.log(`🔍 [FREEPIK API] Buscando: "${query}" com limite: ${limit}`);
    console.log(`🔍 [FREEPIK API] API Key configurada: ${!!process.env.FREEPIK_API_KEY}`);
    
    const response = await axios.get('https://api.freepik.com/v1/resources', {
      headers: {
        'x-freepik-api-key': process.env.FREEPIK_API_KEY,
        'Content-Type': 'application/json',
      },
      params: {
        query,
        limit: Math.min(limit, 20), // Limite máximo da API
        type: 'images',
        premium: false, // Apenas conteúdo gratuito
        safe_search: true,
        sort: 'relevance',
      },
    });

    console.log(`🔍 [FREEPIK API] Status da resposta: ${response.status}`);
    console.log(`🔍 [FREEPIK API] Dados recebidos:`, JSON.stringify(response.data, null, 2));

    const data = response.data;
    
    if (!data.data || !Array.isArray(data.data)) {
      console.log('❌ [FREEPIK API] Formato inesperado:', data);
      return [];
    }

    console.log(`🔍 [FREEPIK API] ${data.data.length} imagens encontradas na API`);

    // Converter resultados do Freepik para formato padrão e filtrar por relevância
    const mappedResults = data.data.map((item: any) => ({
      url: item.image?.source?.url || item.url,
      title: item.title,
      description: item.title,
      provider: 'freepik',
      attribution: `Freepik - ${item.author.name}`,
      license: item.licenses?.[0]?.type === 'freemium' ? 'Free' : 'Premium',
      author: item.author.name,
      sourceUrl: item.url,
      score: calculateRelevanceScore(item, query),
      id: item.id.toString(),
      premium: item.licenses?.[0]?.type !== 'freemium',
      dimensions: item.image?.source ? {
        width: parseInt(item.image.source.size.split('x')[0]),
        height: parseInt(item.image.source.size.split('x')[1])
      } : undefined,
      tags: item.related?.keywords || []
    }));
    
    console.log(`🔍 [FREEPIK API] ${mappedResults.length} imagens mapeadas`);
    
    // Busca semântica: aceitar todas as imagens retornadas pela API
    console.log(`📊 Resultados semânticos: ${mappedResults.length} imagens encontradas`);
    
    return mappedResults;

  } catch (error: any) {
    console.error('❌ [FREEPIK API] Erro detalhado:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params
      }
    });
    
    if (error.response?.status === 401) {
      console.error('❌ [FREEPIK API] API Key inválida ou expirada');
      throw new Error('Invalid Freepik API key');
    }
    if (error.response?.status === 429) {
      console.error('❌ [FREEPIK API] Rate limit excedido');
      throw new Error('Freepik rate limit exceeded');
    }
    if (error.response?.status === 402) {
      console.error('❌ [FREEPIK API] Pagamento necessário - créditos insuficientes');
      throw new Error('Freepik payment required - insufficient credits');
    }
    if (error.response?.status === 400) {
      console.error('❌ [FREEPIK API] Requisição inválida - verificar parâmetros');
      throw new Error('Freepik invalid request - check parameters');
    }
    
    return [];
  }
}



/**
 * Sistema antigo de busca com múltiplos provedores (fallback)
 */
async function searchMultipleProviders(query: string, count: number): Promise<any[]> {
  const results: any[] = [];
  const usedUrls = new Set<string>();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    // Buscar em paralelo em múltiplos provedores
    const searchPromises = [
      searchWikimedia(query, Math.ceil(count / 2)),
      searchUnsplash(query, Math.ceil(count / 2)),
      searchPixabay(query, Math.ceil(count / 2))
    ];

    const providerResults = await Promise.allSettled(searchPromises);
    
    providerResults.forEach((result, index) => {
      const providerNames = ['wikimedia', 'unsplash', 'pixabay'];
      const providerName = providerNames[index];
      
      if (result.status === 'fulfilled' && result.value.length > 0) {
        // Filtrar duplicatas e adicionar apenas imagens únicas
        const uniqueImages = result.value.filter(img => {
          if (!img.url || usedUrls.has(img.url)) {
            return false;
          }
          usedUrls.add(img.url);
          return true;
        });
        
        results.push(...uniqueImages);
        console.log(`✅ ${providerName}: ${uniqueImages.length} imagens únicas encontradas`);
      } else {
        console.log(`❌ ${providerName}: busca falhou`);
      }
    });

    // Aplicar análise de relevância rigorosa também no fallback
    const relevantResults = results.filter(img => {
      const title = img.title?.toLowerCase() || '';
      const description = img.description?.toLowerCase() || '';
      const allText = `${title} ${description}`;
      
      // Verificar se tem termos irrelevantes
      const irrelevantTerms = ['transport', 'vehicle', 'metal', 'scrap', 'business', 'office', 'abstract', 'pattern', 'background', 'texture'];
      const hasIrrelevantTerms = irrelevantTerms.some(term => allText.includes(term));
      
      // Verificar se tem termos específicos do tema
      const themeWords = query.toLowerCase().split(' ');
      const hasThemeTerms = themeWords.some(word => allText.includes(word));
      
      // Critérios para considerar relevante no fallback:
      // 1. Não deve ter termos irrelevantes OU deve ter termos do tema
      // 2. Deve ter termos do tema OU ser de provedor confiável (unsplash)
      return (!hasIrrelevantTerms || hasThemeTerms) && (hasThemeTerms || img.provider === 'unsplash');
    });
    
    // Ordenar por relevância e retornar apenas o necessário
    const sortedResults = relevantResults
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, count);
    
    console.log(`📊 Análise de relevância no fallback: ${results.length} total, ${relevantResults.length} relevantes, ${sortedResults.length} selecionadas`);
    
    return sortedResults;
  } catch (error) {
    console.error('Erro no sistema antigo de múltiplos provedores:', error);
    return [];
  }
}

/**
 * Busca no Wikimedia Commons
 */
async function searchWikimedia(query: string, limit: number): Promise<any[]> {
  try {
    // Criar queries alternativas para melhor cobertura
    const alternativeQueries = [
      query,
      query.replace(/causes? of the?/gi, '').trim(),
      query.replace(/french/gi, 'france').trim(),
      query.replace(/revolution/gi, 'revolutionary').trim()
    ].filter(q => q.length > 0);
    
    const allResults: any[] = [];
    
    // Tentar cada query alternativa
    for (const altQuery of alternativeQueries) {
      if (allResults.length >= limit) break;
      
      console.log(`🔍 [WIKIMEDIA] Buscando: "${altQuery}"`);
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(altQuery)}&srnamespace=6&srlimit=${Math.ceil(limit/alternativeQueries.length)}&srprop=size&srwhat=text`);
      const data = await response.json();
      
      if (data.query?.search) {
        data.query.search.forEach((item: any) => {
          const cleanTitle = item.title.replace(/^File:/, '');
          
          // Filtrar apenas arquivos de imagem válidos
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff'];
          const hasValidImageExtension = imageExtensions.some(ext => 
            cleanTitle.toLowerCase().includes(ext)
          );
          
          // Filtrar documentos e arquivos não-imagem
          const invalidExtensions = ['.pdf', '.djvu', '.txt', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
          const hasInvalidExtension = invalidExtensions.some(ext => 
            cleanTitle.toLowerCase().includes(ext)
          );
          
          // Filtrar títulos muito longos ou truncados (indicam problemas)
          const isTitleTooLong = cleanTitle.length > 100;
          
          // Apenas adicionar se for uma imagem válida
          if (hasValidImageExtension && !hasInvalidExtension && !isTitleTooLong) {
            // Criar URL direta para a imagem (não para a página)
            const encodedTitle = encodeURIComponent(item.title);
            const imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodedTitle}?width=800`;
            
            // Evitar duplicatas baseadas no título limpo
            const existingResult = allResults.find(r => r.title === cleanTitle);
            if (!existingResult) {
              allResults.push({
                url: imageUrl,
                title: cleanTitle,
                description: item.snippet,
                provider: 'wikimedia',
                attribution: 'Wikimedia Commons',
                license: 'CC BY-SA',
                score: 0.8,
                id: item.title
              });
            }
          }
        });
      }
    }
    
    console.log(`🔍 [WIKIMEDIA] Total encontrado: ${allResults.length} imagens válidas`);
    return allResults.slice(0, limit);
  } catch (error) {
    console.warn('Erro ao buscar no Wikimedia:', error);
    return [];
  }
}

/**
 * Busca no Unsplash
 */
async function searchUnsplash(query: string, limit: number): Promise<any[]> {
  try {
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      return [];
    }
    
    // Criar queries alternativas para melhor cobertura
    const alternativeQueries = [
      query,
      query.replace(/causes? of the?/gi, '').trim(),
      query.replace(/french/gi, 'france').trim(),
      query.replace(/revolution/gi, 'historical').trim(),
      query.replace(/revolution/gi, 'war').trim()
    ].filter(q => q.length > 0);
    
    const allResults: any[] = [];
    
    // Tentar cada query alternativa
    for (const altQuery of alternativeQueries) {
      if (allResults.length >= limit) break;
      
      console.log(`🔍 [UNSPLASH] Buscando: "${altQuery}"`);
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(altQuery)}&per_page=${Math.ceil(limit/alternativeQueries.length)}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`);
      const data = await response.json();
      
      if (data.results) {
        data.results.forEach((item: any) => {
          // Evitar duplicatas
          const existingResult = allResults.find(r => r.id === item.id);
          if (!existingResult) {
            allResults.push({
              url: item.urls.regular,
              title: item.description || item.alt_description || altQuery,
              description: item.description || item.alt_description || '',
              provider: 'unsplash',
              attribution: `Unsplash - ${item.user.name}`,
              license: 'Unsplash License',
              score: 0.7,
              id: item.id,
              author: item.user.name
            });
          }
        });
      }
    }
    
    console.log(`🔍 [UNSPLASH] Total encontrado: ${allResults.length} imagens`);
    return allResults.slice(0, limit);
  } catch (error) {
    console.warn('Erro ao buscar no Unsplash:', error);
    return [];
  }
}

/**
 * Busca no Pixabay
 */
async function searchPixabay(query: string, limit: number): Promise<any[]> {
  try {
    if (!process.env.PIXABAY_API_KEY) {
      return [];
    }
    
    const response = await fetch(`https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=${limit}&safesearch=true`);
    
    // Verificar se a resposta é válida antes de tentar fazer parse JSON
    if (!response.ok) {
      console.warn(`Pixabay API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const responseText = await response.text();
    
    // Verificar se a resposta contém erro antes de fazer parse JSON
    if (responseText.includes('[ERROR') || responseText.includes('error')) {
      console.warn('Pixabay API returned error response:', responseText);
      return [];
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.warn('Failed to parse Pixabay response as JSON:', responseText);
      return [];
    }
    
    if (data.hits && Array.isArray(data.hits)) {
      return data.hits.map((item: any) => ({
        url: item.webformatURL,
        title: item.tags || query,
        description: item.tags || '',
        provider: 'pixabay',
        attribution: `Pixabay - ${item.user}`,
        license: 'Pixabay License',
        score: 0.6,
        id: item.id,
        author: item.user
      }));
    }
    return [];
  } catch (error) {
    console.warn('Erro ao buscar no Pixabay:', error);
    return [];
  }
}

/**
 * Extrai o tema usando IA para análise inteligente da consulta
 */
async function extractTheme(query: string, subject?: string): Promise<string> {
  try {
    console.log(`🤖 Usando IA para extrair tema de: "${query}"`);
    
    // Usar o sistema de detecção de tema com IA
    const themeDetection = await detectTheme(query, subject);
    
    console.log(`🎯 Tema detectado pela IA:`, {
      theme: themeDetection.theme,
      englishTheme: themeDetection.englishTheme,
      confidence: themeDetection.confidence,
      category: themeDetection.category
    });
    
    // Retornar a versão em inglês para busca de imagens
    return themeDetection.englishTheme;
    
  } catch (error) {
    console.error('❌ Erro na extração de tema com IA:', error);
    
    // Fallback: extração simples sem IA
    console.log('🔄 Usando fallback para extração de tema...');
    return extractThemeFallback(query);
  }
}

/**
 * Fallback para extração de tema sem IA (método simples)
 */
function extractThemeFallback(query: string): string {
  const queryLower = query.toLowerCase().trim();
  
  // Palavras a remover (interrogativas e de contexto)
  const wordsToRemove = [
    'como', 'funciona', 'o que é', 'o que', 'qual', 'quais', 'quando', 'onde', 'por que', 'porque',
    'para que', 'para que serve', 'definição', 'conceito', 'explicar', 'explica', 'entender',
    'aprender', 'estudar', 'aula', 'sobre', 'a respeito de', 'acerca de', 'relacionado a',
    'quero', 'preciso', 'gostaria', 'me ajude', 'ajuda', 'ajude', 'dúvida', 'duvida',
    'questão', 'questao', 'exercício', 'exercicio', 'problema', 'resolver',
    'uma', 'um', 'de', 'da', 'do', 'das', 'dos', 'com', 'para', 'por', 'em', 'na', 'no', 'nas', 'nos',
    'detalhadamente', 'detalhada', 'detalhado', 'melhor', 'forma', 'maneira', 'jeito'
  ];
  
  // Remover pontuação e dividir em palavras
  let words = queryLower
    .replace(/[?!.,;:]/g, '')
    .split(' ')
    .filter(word => word.length > 0);
  
  // Remover palavras desnecessárias
  words = words.filter(word => !wordsToRemove.includes(word));
  
  // Se sobrou algo significativo, usar as primeiras 2-3 palavras
  if (words.length > 0) {
    const theme = words.slice(0, 3).join(' ');
    if (theme.length > 2) {
      console.log(`🎯 Tema extraído (fallback): "${theme}"`);
      return theme;
    }
  }
  
  console.log(`🎯 Usando query original (fallback): "${query}"`);
  return query.trim();
}

/**
 * Melhora a query para busca educacional no Freepik
 */
function enhanceQueryForEducation(theme: string): string {
  const educationalEnhancements: { [key: string]: string[] } = {
    'photosynthesis': ['plant leaf', 'green leaf', 'nature biology', 'plant science', 'chlorophyll'],
    'solar system': ['space planets', 'astronomy planets', 'universe space', 'planets orbit', 'space science', 'planets solar', 'astronomy space', 'planets universe'],
    'revolution': ['historical revolution', 'war history', 'battle freedom', 'revolutionary war'],
    'french revolution': ['france history', 'revolution france', 'historical france', 'french history'],
    'recycling': ['environment green', 'eco sustainability', 'waste management', 'green environment'],
    'war': ['historical war', 'battle military', 'war history', 'military battle'],
    'roman empire': ['rome ancient', 'ancient rome', 'roman history', 'empire rome'],
    'renaissance': ['art history', 'historical art', 'renaissance art', 'art culture'],
    'industrial revolution': ['industry history', 'industrial history', 'revolution industry']
  };
  
  const themeLower = theme.toLowerCase();
  
  // Encontrar melhorias específicas para o tema
  for (const [key, enhancements] of Object.entries(educationalEnhancements)) {
    if (themeLower.includes(key)) {
      const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
      return `${theme} ${randomEnhancement}`;
    }
  }
  
  // Fallback: adicionar termos educacionais genéricos
  const genericEnhancements = ['education science', 'learning study', 'science education', 'educational'];
  const randomGeneric = genericEnhancements[Math.floor(Math.random() * genericEnhancements.length)];
  return `${theme} ${randomGeneric}`;
}

/**
 * Traduz query para inglês (Freepik funciona melhor em inglês)
 */
function translateToEnglish(query: string): string {
  const translations: { [key: string]: string } = {
    // Termos de IA e tecnologia
    'inteligência artificial': 'artificial intelligence',
    'inteligencia artificial': 'artificial intelligence',
    'ia': 'artificial intelligence',
    'machine learning': 'machine learning',
    'aprendizado de máquina': 'machine learning',
    'algoritmo': 'algorithm',
    'algoritmos': 'algorithms',
    'programação': 'programming',
    'programação de computadores': 'computer programming',
    'computador': 'computer',
    'computadores': 'computers',
    'software': 'software',
    'hardware': 'hardware',
    'robô': 'robot',
    'robôs': 'robots',
    'automação': 'automation',
    'digital': 'digital',
    'virtual': 'virtual',
    'cibernético': 'cyber',
    'neural': 'neural',
    'rede neural': 'neural network',
    'redes neurais': 'neural networks',
    'dados': 'data',
    'big data': 'big data',
    'ciência de dados': 'data science',
    
    // Termos gerais
    'como funciona': 'how does work',
    'como': 'how',
    'funciona': 'works',
    'funcionamento': 'functioning',
    'tecnologia': 'technology',
    'ciência': 'science',
    'matemática': 'mathematics',
    'física': 'physics',
    'química': 'chemistry',
    'biologia': 'biology',
    'história': 'history',
    'geografia': 'geography',
    'literatura': 'literature',
    'arte': 'art',
    'educação': 'education',
    'aprendizado': 'learning',
    'ensino': 'teaching',
    'escola': 'school',
    'aula': 'classroom',
    'estudante': 'student',
    'professor': 'teacher'
  };

  let translatedQuery = query.toLowerCase();
  
  // Aplicar traduções
  Object.entries(translations).forEach(([pt, en]) => {
    const regex = new RegExp(`\\b${pt}\\b`, 'gi');
    translatedQuery = translatedQuery.replace(regex, en);
  });

  // Limpar espaços extras
  translatedQuery = translatedQuery.replace(/\s+/g, ' ').trim();
  
  return translatedQuery;
}

/**
 * Gera uma query com termos relacionados ao tema
 */
function generateRelatedQuery(query: string): string {
  // Mapear termos relacionados para busca semântica
  const relatedTerms: { [key: string]: string[] } = {
    'inteligência artificial': ['artificial intelligence', 'AI', 'machine learning', 'neural network'],
    'artificial intelligence': ['AI', 'machine learning', 'neural network', 'deep learning'],
    'machine learning': ['artificial intelligence', 'AI', 'algorithm', 'data science'],
    'algoritmo': ['algorithm', 'programming', 'code', 'software'],
    'programação': ['programming', 'coding', 'software', 'development'],
    'computador': ['computer', 'technology', 'digital', 'electronic'],
    'tecnologia': ['technology', 'digital', 'innovation', 'modern'],
    'ciência': ['science', 'research', 'study', 'knowledge'],
    'matemática': ['mathematics', 'math', 'numbers', 'calculation'],
    'física': ['physics', 'science', 'energy', 'matter'],
    'química': ['chemistry', 'science', 'molecules', 'reactions'],
    'biologia': ['biology', 'science', 'life', 'nature']
  };

  const queryLower = query.toLowerCase();
  
  // Encontrar termos relacionados
  for (const [term, related] of Object.entries(relatedTerms)) {
    if (queryLower.includes(term)) {
      const randomRelated = related[Math.floor(Math.random() * related.length)];
      return randomRelated;
    }
  }
  
  // Se não encontrar termos específicos, usar o tema original
  return query;
}


/**
 * Calcula score de relevância baseado no título e tags com análise rigorosa
 */
function calculateRelevanceScore(item: any, query: string): number {
  const queryLower = query.toLowerCase();
  const titleLower = item.title?.toLowerCase() || '';
  const descriptionLower = item.description?.toLowerCase() || '';
  const tagsLower = (item.tags || []).join(' ').toLowerCase();
  
  const allText = `${titleLower} ${descriptionLower} ${tagsLower}`;
  
  let score = 0;
  
  // 1. CORRESPONDÊNCIA EXATA - Peso máximo
  const queryWords = queryLower.split(' ').filter(word => word.length > 2);
  let exactMatches = 0;
  
  queryWords.forEach(word => {
    if (allText.includes(word)) {
      exactMatches++;
      score += 0.4; // Peso ainda mais alto para correspondência exata
    }
  });
  
  // Bonus por ter múltiplas correspondências
  if (exactMatches > 1) {
    score += 0.2;
  }
  
  // 2. ANÁLISE DE RELEVÂNCIA TEMÁTICA
  const themeRelevance = analyzeThemeRelevance(queryLower, allText);
  score += themeRelevance.score;
  
  // 3. PENALIDADES POR CONTEÚDO IRRELEVANTE
  const irrelevantPenalty = calculateIrrelevantPenalty(allText, queryLower);
  score -= irrelevantPenalty;
  
  // 4. BONUS POR CONTEÚDO EDUCACIONAL ESPECÍFICO
  const educationalBonus = calculateEducationalBonus(allText, queryLower);
  score += educationalBonus;
  
  // 5. BONUS BASE PARA IMAGENS DO FREEPIK (são geralmente de qualidade)
  score += 0.1;
  
  // Normalizar para 0-1
  return Math.max(0, Math.min(1, score));
}

/**
 * Analisa relevância temática específica
 */
function analyzeThemeRelevance(query: string, text: string): { score: number; reason: string } {
  const themePatterns: { [key: string]: { patterns: string[], score: number, reason: string } } = {
    'recycling': {
      patterns: ['recycling', 'recycle', 'waste', 'garbage', 'trash', 'bin', 'container', 'sorting', 'separation', 'environmental', 'sustainability'],
      score: 0.4,
      reason: 'recycling-specific'
    },
    'solar system': {
      patterns: ['solar', 'system', 'planet', 'sun', 'moon', 'earth', 'mars', 'jupiter', 'saturn', 'orbit', 'space', 'astronomy'],
      score: 0.4,
      reason: 'solar-system-specific'
    },
    'photosynthesis': {
      patterns: ['photosynthesis', 'plant', 'leaf', 'chlorophyll', 'oxygen', 'carbon dioxide', 'glucose', 'sunlight'],
      score: 0.4,
      reason: 'photosynthesis-specific'
    },
    'french revolution': {
      patterns: ['french', 'revolution', 'revolutionary', 'france', 'historical', 'history', 'ancient', 'war', 'battle', 'monarchy', 'democracy', 'freedom', 'liberty'],
      score: 0.4,
      reason: 'french-revolution-specific'
    },
    'revolution': {
      patterns: ['revolution', 'revolutionary', 'revolt', 'uprising', 'rebellion', 'change', 'transformation', 'movement', 'protest', 'freedom', 'liberty'],
      score: 0.3,
      reason: 'revolution-general'
    },
    'history': {
      patterns: ['history', 'historical', 'ancient', 'past', 'heritage', 'tradition', 'culture', 'civilization', 'timeline', 'chronology'],
      score: 0.3,
      reason: 'history-general'
    }
  };
  
  // Encontrar padrão mais relevante
  for (const [theme, config] of Object.entries(themePatterns)) {
    if (query.toLowerCase().includes(theme)) {
      const matches = config.patterns.filter(pattern => text.includes(pattern));
      if (matches.length > 0) {
        return { score: config.score, reason: config.reason };
      }
    }
  }
  
  return { score: 0, reason: 'no-specific-theme' };
}

/**
 * Calcula penalidade por conteúdo irrelevante
 */
function calculateIrrelevantPenalty(text: string, query: string): number {
  let penalty = 0;
  
  // Penalidades por conteúdo genérico/irrelevante
  const genericPenalties: { [key: string]: number } = {
    'transport': 0.3, // Transporte genérico
    'vehicle': 0.3,   // Veículos genéricos
    'metal': 0.2,     // Metais genéricos (sem contexto de reciclagem)
    'scrap': 0.1,     // Sucata genérica
    'business': 0.4,  // Conteúdo corporativo
    'office': 0.3,    // Escritório
    'abstract': 0.4,  // Abstrato
    'pattern': 0.3,   // Padrões genéricos
    'background': 0.3, // Fundos genéricos
    'texture': 0.3    // Texturas genéricas
  };
  
  // Aplicar penalidades
  Object.entries(genericPenalties).forEach(([term, penaltyValue]) => {
    if (text.includes(term)) {
      penalty += penaltyValue;
    }
  });
  
  // Penalidade especial: se tem termos genéricos mas não tem termos específicos do tema
  const hasGenericTerms = Object.keys(genericPenalties).some(term => text.includes(term));
  const hasSpecificTerms = query.split(' ').some(word => text.includes(word));
  
  if (hasGenericTerms && !hasSpecificTerms) {
    penalty += 0.5; // Penalidade alta por ser genérico sem relevância
  }
  
  return penalty;
}

/**
 * Calcula bonus por conteúdo educacional específico
 */
function calculateEducationalBonus(text: string, query: string): number {
  let bonus = 0;
  
  // Bonus por termos educacionais específicos do tema
  const educationalTerms: { [key: string]: string[] } = {
    'recycling': ['environmental education', 'sustainability', 'waste management', 'eco-friendly', 'green'],
    'solar system': ['astronomy education', 'space science', 'planetary science', 'cosmic'],
    'photosynthesis': ['biology education', 'plant science', 'botany', 'cellular process']
  };
  
  // Encontrar termos educacionais específicos
  for (const [theme, terms] of Object.entries(educationalTerms)) {
    if (query.includes(theme)) {
      const matches = terms.filter(term => text.includes(term));
      bonus += matches.length * 0.1;
    }
  }
  
  return bonus;
}
