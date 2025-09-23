export interface NewsArticle {
  title: string;
  description?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: string;
  author?: string;
  content?: string;
}

export interface NewsSearchResult {
  articles: NewsArticle[];
  totalResults: number;
  hasMore: boolean;
}

export class NewsAPIService {
  private static readonly BASE_URL = 'https://newsapi.org/v2';
  private static readonly API_KEY = process.env.NEWS_API_KEY || '';

  static async getTopHeadlines(country: string = 'br', category?: string, pageSize: number = 10): Promise<NewsSearchResult> {
    try {
      if (!this.API_KEY) {
        throw new Error('API key não configurada para NewsAPI');
      }

      let url = `${this.BASE_URL}/top-headlines?country=${country}&pageSize=${pageSize}&apiKey=${this.API_KEY}`;
      
      if (category) {
        url += `&category=${category}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      const articles: NewsArticle[] = data.articles?.map((article: any) => ({
        title: article.title || 'Título não disponível',
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source?.name || 'Fonte não disponível',
        author: article.author,
        content: article.content
      })) || [];

      return {
        articles,
        totalResults: data.totalResults || 0,
        hasMore: articles.length === pageSize
      };
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
      throw new Error('Erro ao buscar notícias na NewsAPI');
    }
  }

  static async searchNews(query: string, language: string = 'pt', pageSize: number = 10): Promise<NewsSearchResult> {
    try {
      if (!this.API_KEY) {
        throw new Error('API key não configurada para NewsAPI');
      }

      const response = await fetch(
        `${this.BASE_URL}/everything?q=${encodeURIComponent(query)}&language=${language}&pageSize=${pageSize}&sortBy=publishedAt&apiKey=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      const articles: NewsArticle[] = data.articles?.map((article: any) => ({
        title: article.title || 'Título não disponível',
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source?.name || 'Fonte não disponível',
        author: article.author,
        content: article.content
      })) || [];

      return {
        articles,
        totalResults: data.totalResults || 0,
        hasMore: articles.length === pageSize
      };
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
      throw new Error('Erro ao buscar notícias na NewsAPI');
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
      'technology': 'Tecnologia'
    };
    
    return categories[category] || category;
  }
}
