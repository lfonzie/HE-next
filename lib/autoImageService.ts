// lib/autoImageService.ts
import { detectTheme, ThemeDetectionResult } from './themeDetection';
import { unsplashService, UnsplashImage } from './unsplash';

export interface AutoImageResult {
  success: boolean;
  theme?: string;
  englishTheme?: string;
  image?: UnsplashImage;
  error?: string;
}

/**
 * Serviço para buscar automaticamente imagens baseadas no tema da aula
 */
export class AutoImageService {
  
  /**
   * Busca automaticamente uma imagem para o tema da aula
   */
  static async getImageForLesson(query: string, subject?: string): Promise<AutoImageResult> {
    try {
      console.log('🖼️ Iniciando busca automática de imagem para:', query);
      
      // 1. Detectar tema da aula
      const themeDetection = await detectTheme(query, subject);
      console.log('🎯 Tema detectado:', themeDetection);
      
      // 2. Buscar imagem no Unsplash usando o tema em inglês
      const searchResults = await unsplashService.searchPhotos(
        themeDetection.englishTheme, 
        1, 
        10 // Buscar 10 imagens para ter opções
      );
      
      if (!searchResults.results || searchResults.results.length === 0) {
        console.log('⚠️ Nenhuma imagem encontrada, tentando busca alternativa...');
        
        // Tentar busca alternativa com categoria
        const alternativeResults = await this.getAlternativeImage(themeDetection);
        if (alternativeResults.image) {
          return alternativeResults;
        }
        
        return {
          success: false,
          theme: themeDetection.theme,
          englishTheme: themeDetection.englishTheme,
          error: 'Nenhuma imagem encontrada para o tema'
        };
      }
      
      // 3. Selecionar a melhor imagem
      const bestImage = this.selectBestImage(searchResults.results, themeDetection);
      console.log('✅ Melhor imagem selecionada:', bestImage.id);
      
      return {
        success: true,
        theme: themeDetection.theme,
        englishTheme: themeDetection.englishTheme,
        image: bestImage
      };
      
    } catch (error: any) {
      console.error('❌ Erro na busca automática de imagem:', error);
      return {
        success: false,
        error: error.message || 'Erro na busca de imagem'
      };
    }
  }
  
  /**
   * Seleciona a melhor imagem baseada em critérios de qualidade
   */
  private static selectBestImage(images: UnsplashImage[], themeDetection: ThemeDetectionResult): UnsplashImage {
    // Critérios de seleção:
    // 1. Priorizar imagens com mais curtidas (popularidade)
    // 2. Priorizar imagens com descrição relevante
    // 3. Priorizar imagens com boa resolução
    // 4. Evitar imagens muito pequenas
    
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
      const themeWords = themeDetection.englishTheme.toLowerCase().split(' ');
      const relevantWords = themeWords.filter(word => 
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
  
  /**
   * Busca imagem alternativa usando categoria
   */
  private static async getAlternativeImage(themeDetection: ThemeDetectionResult): Promise<AutoImageResult> {
    try {
      let searchResults;
      
      // Tentar busca por categoria
      switch (themeDetection.category) {
        case 'ciencias':
          searchResults = await unsplashService.searchPhotos('science laboratory', 1, 5);
          break;
        case 'matematica':
          searchResults = await unsplashService.searchPhotos('mathematics numbers', 1, 5);
          break;
        case 'historia':
          searchResults = await unsplashService.searchPhotos('history ancient', 1, 5);
          break;
        case 'geografia':
          searchResults = await unsplashService.searchPhotos('geography world map', 1, 5);
          break;
        case 'portugues':
          searchResults = await unsplashService.searchPhotos('literature books reading', 1, 5);
          break;
        default:
          searchResults = await unsplashService.getEducationPhotos(1, 5);
      }
      
      if (searchResults.results && searchResults.results.length > 0) {
        const bestImage = this.selectBestImage(searchResults.results, themeDetection);
        return {
          success: true,
          theme: themeDetection.theme,
          englishTheme: themeDetection.englishTheme,
          image: bestImage
        };
      }
      
      return {
        success: false,
        theme: themeDetection.theme,
        englishTheme: themeDetection.englishTheme,
        error: 'Nenhuma imagem alternativa encontrada'
      };
      
    } catch (error: any) {
      return {
        success: false,
        theme: themeDetection.theme,
        englishTheme: themeDetection.englishTheme,
        error: error.message
      };
    }
  }
  
  /**
   * Busca imagem específica para slides de introdução e conclusão
   */
  static async getImagesForSlides(query: string, subject?: string): Promise<{
    introImage?: UnsplashImage;
    conclusionImage?: UnsplashImage;
    theme?: string;
  }> {
    try {
      const result = await this.getImageForLesson(query, subject);
      
      if (result.success && result.image) {
        // Para slides 1 e 8, usar a mesma imagem ou buscar uma segunda
        return {
          introImage: result.image,
          conclusionImage: result.image, // Mesma imagem para consistência
          theme: result.theme
        };
      }
      
      return {};
      
    } catch (error) {
      console.error('Erro ao buscar imagens para slides:', error);
      return {};
    }
  }
}
