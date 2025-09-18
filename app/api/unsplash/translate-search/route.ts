// app/api/unsplash/translate-search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { detectTheme, translateThemeToEnglish } from '@/lib/themeDetection';
import { unsplashService } from '@/lib/unsplash';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, subject, count = 1 } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log('🖼️ Buscando imagem com tradução para:', query);

    // Verificar se a API key está configurada
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      console.warn('⚠️ UNSPLASH_ACCESS_KEY não configurada, usando fallback');
      return getFallbackResponse(query, count);
    }

    // 1. Detectar e traduzir o tema
    let englishQuery: string;
    let themeInfo: any = {};

    try {
      const themeDetection = await detectTheme(query, subject);
      englishQuery = themeDetection.englishTheme;
      themeInfo = themeDetection;
      console.log('🎯 Tema detectado:', themeDetection);
    } catch (error) {
      console.warn('⚠️ Erro na detecção de tema, usando tradução simples:', error);
      // Fallback: tradução simples
      englishQuery = await translateThemeToEnglish(query);
    }

    // 2. Expandir a query com termos relacionados
    const expandedQuery = expandSearchQuery(englishQuery, themeInfo.category);
    console.log('🔍 Query expandida:', expandedQuery);

    // 3. Buscar imagens no Unsplash
    let searchResults;
    try {
      searchResults = await unsplashService.searchPhotos(expandedQuery, 1, count);
    } catch (error) {
      console.error('❌ Erro na API Unsplash:', error);
      return getFallbackResponse(query, count);
    }

    if (!searchResults.results || searchResults.results.length === 0) {
      console.log('⚠️ Nenhuma imagem encontrada, tentando busca alternativa...');
      
      // Tentar busca alternativa por categoria
      const alternativeQuery = getAlternativeQuery(themeInfo.category);
      let alternativeResults;
      
      try {
        alternativeResults = await unsplashService.searchPhotos(alternativeQuery, 1, count);
      } catch (error) {
        console.error('❌ Erro na busca alternativa:', error);
        return getFallbackResponse(query, count);
      }
      
      if (alternativeResults.results && alternativeResults.results.length > 0) {
        return NextResponse.json({
          success: true,
          photos: alternativeResults.results.map(photo => ({
            id: photo.id,
            urls: photo.urls,
            alt_description: photo.alt_description,
            description: photo.description,
            user: photo.user,
            width: photo.width,
            height: photo.height,
            color: photo.color,
            likes: photo.likes
          })),
          query: alternativeQuery,
          theme: themeInfo.theme || query,
          englishTheme: alternativeQuery,
          fallback: true
        });
      }

      // Último fallback: imagens educacionais genéricas
      let educationResults;
      try {
        educationResults = await unsplashService.getEducationPhotos(1, count);
      } catch (error) {
        console.error('❌ Erro na busca educacional:', error);
        return getFallbackResponse(query, count);
      }
      
      return NextResponse.json({
        success: true,
        photos: educationResults.results.map(photo => ({
          id: photo.id,
          urls: photo.urls,
          alt_description: photo.alt_description,
          description: photo.description,
          user: photo.user,
          width: photo.width,
          height: photo.height,
          color: photo.color,
          likes: photo.likes
        })),
        query: '',
        theme: themeInfo.theme || query,
        englishTheme: '',
        fallback: true,
        generic: true
      });
    }

    // 4. Selecionar a melhor imagem
    const bestImage = selectBestImage(searchResults.results, englishQuery);

    return NextResponse.json({
      success: true,
      photos: [bestImage].map(photo => ({
        id: photo.id,
        urls: photo.urls,
        alt_description: photo.alt_description,
        description: photo.description,
        user: photo.user,
        width: photo.width,
        height: photo.height,
        color: photo.color,
        likes: photo.likes
      })),
      query: expandedQuery,
      theme: themeInfo.theme || query,
      englishTheme: englishQuery,
      fallback: false
    });

  } catch (error: any) {
    console.error('❌ Erro na busca de imagem com tradução:', error);
    return getFallbackResponse('education', 1);
  }
}

/**
 * Resposta de fallback quando a API Unsplash não está disponível
 */
function getFallbackResponse(query: string, count: number) {
  const fallbackImages = Array.from({ length: count }, (_, index) => ({
    id: `fallback-${index}`,
    urls: {
      raw: `https://commons.wikimedia.org/wiki/Special:FilePath/Education%20-%20The%20Noun%20Project.svg?width=800&height=400`,
      full: `https://commons.wikimedia.org/wiki/Special:FilePath/Education%20-%20The%20Noun%20Project.svg?width=800&height=400`,
      regular: `https://commons.wikimedia.org/wiki/Special:FilePath/Education%20-%20The%20Noun%20Project.svg?width=800&height=400`,
      small: `https://commons.wikimedia.org/wiki/Special:FilePath/Education%20-%20The%20Noun%20Project.svg?width=400&height=200`,
      thumb: `https://commons.wikimedia.org/wiki/Special:FilePath/Education%20-%20The%20Noun%20Project.svg?width=200&height=100`
    },
    alt_description: query,
    description: `Fallback image for ${query}`,
    user: { name: 'Placeholder', username: 'placeholder' },
    width: 800,
    height: 400,
    color: '#cccccc',
    likes: 0
  }));

  return NextResponse.json({
    success: true,
    photos: fallbackImages,
    query: query,
    theme: query,
    englishTheme: query,
    fallback: true,
    error: 'Unsplash API unavailable, using fallback images'
  });
}

/**
 * Expande a query de busca com termos relacionados
 */
function expandSearchQuery(baseQuery: string, category?: string): string {
  const baseTerms = baseQuery.toLowerCase().split(' ');
  
  // Termos relacionados por categoria com mais opções
  const categoryTerms: Record<string, string[]> = {
    'ciencias': ['science', 'laboratory', 'research', 'experiment', 'discovery', 'scientific', 'microscope', 'chemistry', 'biology', 'physics'],
    'matematica': ['mathematics', 'math', 'numbers', 'geometry', 'algebra', 'calculation', 'formula', 'equation', 'graph', 'statistics'],
    'historia': ['history', 'ancient', 'historical', 'heritage', 'culture', 'museum', 'archaeology', 'civilization', 'past', 'tradition'],
    'geografia': ['geography', 'world', 'map', 'landscape', 'nature', 'earth', 'globe', 'continent', 'country', 'environment'],
    'portugues': ['literature', 'books', 'reading', 'writing', 'language', 'poetry', 'novel', 'story', 'text', 'grammar'],
    'fisica': ['physics', 'science', 'experiment', 'laboratory', 'technology', 'energy', 'force', 'motion', 'quantum', 'mechanics'],
    'quimica': ['chemistry', 'laboratory', 'science', 'molecules', 'experiment', 'reaction', 'compound', 'element', 'formula', 'test'],
    'biologia': ['biology', 'nature', 'plants', 'animals', 'microscope', 'life', 'cell', 'evolution', 'ecosystem', 'genetics'],
    'artes': ['art', 'painting', 'drawing', 'creative', 'artistic', 'design', 'sculpture', 'gallery', 'museum', 'canvas'],
    'educacao-fisica': ['sports', 'fitness', 'exercise', 'athletics', 'gym', 'health', 'training', 'competition', 'team', 'stadium']
  };

  // Termos contextuais adicionais por tema
  const contextualTerms: Record<string, string[]> = {
    'photosynthesis': ['plants', 'leaves', 'sunlight', 'green', 'nature', 'biology', 'chlorophyll'],
    'mitosis': ['cell', 'division', 'biology', 'microscope', 'science', 'laboratory'],
    'quadratic': ['equation', 'graph', 'parabola', 'mathematics', 'algebra', 'formula'],
    'revolution': ['history', 'change', 'movement', 'freedom', 'independence', 'war'],
    'ecosystem': ['nature', 'environment', 'animals', 'plants', 'balance', 'ecology'],
    'fotossintese': ['plants', 'leaves', 'sunlight', 'green', 'nature', 'biology', 'chlorophyll'],
    'divisao': ['cell', 'division', 'biology', 'microscope', 'science', 'laboratory'],
    'equacao': ['equation', 'graph', 'parabola', 'mathematics', 'algebra', 'formula'],
    'revolucao': ['history', 'change', 'movement', 'freedom', 'independence', 'war'],
    'ecossistema': ['nature', 'environment', 'animals', 'plants', 'balance', 'ecology']
  };

  // Adicionar termos da categoria
  const relatedTerms = categoryTerms[category || ''] || [];
  
  // Adicionar termos contextuais baseados na query
  const contextualTermsForQuery = contextualTerms[baseQuery.toLowerCase()] || [];
  
  // Combinar todos os termos
  const allTerms = [
    ...baseTerms, 
    ...relatedTerms.slice(0, 4), 
    ...contextualTermsForQuery.slice(0, 3)
  ];
  
  // Remover duplicatas e limitar tamanho
  const uniqueTerms = Array.from(new Set(allTerms)).slice(0, 6);
  
  return uniqueTerms.join(' ');
}

/**
 * Gera query alternativa baseada na categoria
 */
function getAlternativeQuery(category?: string): string {
  const alternatives: Record<string, string> = {
    'ciencias': 'science laboratory research',
    'matematica': 'mathematics numbers geometry',
    'historia': 'history ancient heritage',
    'geografia': 'geography world map',
    'portugues': 'literature books reading',
    'fisica': 'physics science technology',
    'quimica': 'chemistry laboratory science',
    'biologia': 'biology nature life',
    'artes': 'art creative design',
    'educacao-fisica': 'sports fitness health'
  };

  return alternatives[category || ''] || '';
}

/**
 * Seleciona a melhor imagem baseada em critérios de qualidade
 */
function selectBestImage(images: any[], query: string): any {
  const scoredImages = images.map(image => {
    let score = 0;
    
    // Score por curtidas (0-50 pontos)
    score += Math.min(image.likes / 100, 50);
    
    // Score por resolução (0-30 pontos)
    const totalPixels = image.width * image.height;
    if (totalPixels > 2000000) score += 30; // > 2MP
    else if (totalPixels > 1000000) score += 20; // > 1MP
    else if (totalPixels > 500000) score += 10; // > 0.5MP
    
    // Score por descrição relevante (0-20 pontos)
    const description = (image.alt_description || image.description || '').toLowerCase();
    const queryWords = query.toLowerCase().split(' ');
    const relevantWords = queryWords.filter(word => 
      description.includes(word) && word.length > 3
    );
    score += Math.min(relevantWords.length * 5, 20);
    
    return { image, score };
  });
  
  // Ordenar por score e retornar a melhor
  scoredImages.sort((a, b) => b.score - a.score);
  
  console.log('📊 Scores das imagens:', scoredImages.map(item => 
    `${item.image.id}: ${item.score.toFixed(1)}`
  ));
  
  return scoredImages[0].image;
}
