export interface CurrentsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  image?: string;
  published: string;
  category: string[];
  language: string;
  source: string;
  author?: string;
}

export interface CurrentsSearchResult {
  news: CurrentsArticle[];
  page: number;
  totalResults: number;
  hasMore: boolean;
}

export class CurrentsAPIService {
  private static readonly BASE_URL = 'https://api.currentsapi.services/v1';
  private static readonly API_KEY = process.env.CURRENTS_API_KEY || '';

  static async getLatestNews(language: string = 'pt', pageSize: number = 10): Promise<CurrentsSearchResult> {
    try {
      if (!this.API_KEY) {
        throw new Error('API key não configurada para CurrentsAPI');
      }

      const response = await fetch(
        `${this.BASE_URL}/latest-news?language=${language}&pageSize=${pageSize}&apiKey=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      const news: CurrentsArticle[] = data.news?.map((article: any) => ({
        id: article.id || '',
        title: article.title || 'Título não disponível',
        description: article.description || '',
        url: article.url || '',
        image: article.image,
        published: article.published || '',
        category: article.category || [],
        language: article.language || language,
        source: article.source || 'Fonte não disponível',
        author: article.author
      })) || [];

      return {
        news,
        page: data.page || 1,
        totalResults: data.totalResults || 0,
        hasMore: news.length === pageSize
      };
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
      throw new Error('Erro ao buscar notícias na CurrentsAPI');
    }
  }

  static async searchNews(query: string, language: string = 'pt', pageSize: number = 10): Promise<CurrentsSearchResult> {
    try {
      if (!this.API_KEY) {
        throw new Error('API key não configurada para CurrentsAPI');
      }

      const response = await fetch(
        `${this.BASE_URL}/search?keywords=${encodeURIComponent(query)}&language=${language}&pageSize=${pageSize}&apiKey=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      const news: CurrentsArticle[] = data.news?.map((article: any) => ({
        id: article.id || '',
        title: article.title || 'Título não disponível',
        description: article.description || '',
        url: article.url || '',
        image: article.image,
        published: article.published || '',
        category: article.category || [],
        language: article.language || language,
        source: article.source || 'Fonte não disponível',
        author: article.author
      })) || [];

      return {
        news,
        page: data.page || 1,
        totalResults: data.totalResults || 0,
        hasMore: news.length === pageSize
      };
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
      throw new Error('Erro ao buscar notícias na CurrentsAPI');
    }
  }

  static async getNewsByCategory(category: string, language: string = 'pt', pageSize: number = 10): Promise<CurrentsSearchResult> {
    try {
      if (!this.API_KEY) {
        throw new Error('API key não configurada para CurrentsAPI');
      }

      const response = await fetch(
        `${this.BASE_URL}/search?category=${encodeURIComponent(category)}&language=${language}&pageSize=${pageSize}&apiKey=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      const news: CurrentsArticle[] = data.news?.map((article: any) => ({
        id: article.id || '',
        title: article.title || 'Título não disponível',
        description: article.description || '',
        url: article.url || '',
        image: article.image,
        published: article.published || '',
        category: article.category || [],
        language: article.language || language,
        source: article.source || 'Fonte não disponível',
        author: article.author
      })) || [];

      return {
        news,
        page: data.page || 1,
        totalResults: data.totalResults || 0,
        hasMore: news.length === pageSize
      };
    } catch (error) {
      console.error('Erro ao buscar notícias por categoria:', error);
      throw new Error('Erro ao buscar notícias por categoria na CurrentsAPI');
    }
  }

  static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data não disponível';
    }
  }

  static formatDescription(description: string, maxLength: number = 150): string {
    if (!description) return 'Descrição não disponível';
    
    if (description.length <= maxLength) {
      return description;
    }
    
    return description.substring(0, maxLength).trim() + '...';
  }

  static getCategoryLabel(category: string): string {
    const categories: { [key: string]: string } = {
      'business': 'Negócios',
      'entertainment': 'Entretenimento',
      'general': 'Geral',
      'health': 'Saúde',
      'science': 'Ciência',
      'sports': 'Esportes',
      'technology': 'Tecnologia',
      'politics': 'Política',
      'world': 'Mundo'
    };
    
    return categories[category] || category;
  }

  static getAvailableCategories(): string[] {
    return [
      'business',
      'entertainment',
      'general',
      'health',
      'science',
      'sports',
      'technology',
      'politics',
      'world'
    ];
  }
}
