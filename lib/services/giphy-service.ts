export interface GiphyGif {
  id: string;
  title: string;
  url: string;
  embedUrl: string;
  images: {
    original: {
      url: string;
      width: string;
      height: string;
    };
    fixedWidth: {
      url: string;
      width: string;
      height: string;
    };
    fixedHeight: {
      url: string;
      width: string;
      height: string;
    };
  };
  rating: string;
  trendingDatetime?: string;
  username?: string;
}

export interface GiphySearchResult {
  gifs: GiphyGif[];
  totalResults: number;
  hasMore: boolean;
}

export class GiphyAPIService {
  private static readonly BASE_URL = 'https://api.giphy.com/v1/gifs';
  private static readonly API_KEY = process.env.GIPHY_API_KEY || '';

  static async searchGifs(query: string, limit: number = 10, rating: string = 'g'): Promise<GiphySearchResult> {
    try {
      if (!this.API_KEY) {
        throw new Error('API key não configurada para Giphy');
      }

      const response = await fetch(
        `${this.BASE_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}&rating=${rating}&api_key=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      const gifs: GiphyGif[] = data.data?.map((gif: any) => ({
        id: gif.id || '',
        title: gif.title || 'GIF sem título',
        url: gif.url || '',
        embedUrl: gif.embed_url || '',
        images: {
          original: {
            url: gif.images?.original?.url || '',
            width: gif.images?.original?.width || '0',
            height: gif.images?.original?.height || '0'
          },
          fixedWidth: {
            url: gif.images?.fixed_width?.url || '',
            width: gif.images?.fixed_width?.width || '0',
            height: gif.images?.fixed_width?.height || '0'
          },
          fixedHeight: {
            url: gif.images?.fixed_height?.url || '',
            width: gif.images?.fixed_height?.width || '0',
            height: gif.images?.fixed_height?.height || '0'
          }
        },
        rating: gif.rating || 'g',
        trendingDatetime: gif.trending_datetime,
        username: gif.username
      })) || [];

      return {
        gifs,
        totalResults: data.pagination?.total_count || 0,
        hasMore: gifs.length === limit
      };
    } catch (error) {
      console.error('Erro ao buscar GIFs:', error);
      throw new Error('Erro ao buscar GIFs na Giphy');
    }
  }

  static async getTrendingGifs(limit: number = 10, rating: string = 'g'): Promise<GiphySearchResult> {
    try {
      if (!this.API_KEY) {
        throw new Error('API key não configurada para Giphy');
      }

      const response = await fetch(
        `${this.BASE_URL}/trending?limit=${limit}&rating=${rating}&api_key=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      const gifs: GiphyGif[] = data.data?.map((gif: any) => ({
        id: gif.id || '',
        title: gif.title || 'GIF sem título',
        url: gif.url || '',
        embedUrl: gif.embed_url || '',
        images: {
          original: {
            url: gif.images?.original?.url || '',
            width: gif.images?.original?.width || '0',
            height: gif.images?.original?.height || '0'
          },
          fixedWidth: {
            url: gif.images?.fixed_width?.url || '',
            width: gif.images?.fixed_width?.width || '0',
            height: gif.images?.fixed_width?.height || '0'
          },
          fixedHeight: {
            url: gif.images?.fixed_height?.url || '',
            width: gif.images?.fixed_height?.width || '0',
            height: gif.images?.fixed_height?.height || '0'
          }
        },
        rating: gif.rating || 'g',
        trendingDatetime: gif.trending_datetime,
        username: gif.username
      })) || [];

      return {
        gifs,
        totalResults: data.pagination?.total_count || 0,
        hasMore: gifs.length === limit
      };
    } catch (error) {
      console.error('Erro ao buscar GIFs em tendência:', error);
      throw new Error('Erro ao buscar GIFs em tendência na Giphy');
    }
  }

  static async getRandomGif(tag?: string, rating: string = 'g'): Promise<GiphyGif | null> {
    try {
      if (!this.API_KEY) {
        throw new Error('API key não configurada para Giphy');
      }

      let url = `${this.BASE_URL}/random?rating=${rating}&api_key=${this.API_KEY}`;
      
      if (tag) {
        url += `&tag=${encodeURIComponent(tag)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.data) {
        return null;
      }

      const gif = data.data;
      
      return {
        id: gif.id || '',
        title: gif.title || 'GIF sem título',
        url: gif.url || '',
        embedUrl: gif.embed_url || '',
        images: {
          original: {
            url: gif.images?.original?.url || '',
            width: gif.images?.original?.width || '0',
            height: gif.images?.original?.height || '0'
          },
          fixedWidth: {
            url: gif.images?.fixed_width?.url || '',
            width: gif.images?.fixed_width?.width || '0',
            height: gif.images?.fixed_width?.height || '0'
          },
          fixedHeight: {
            url: gif.images?.fixed_height?.url || '',
            width: gif.images?.fixed_height?.width || '0',
            height: gif.images?.fixed_height?.height || '0'
          }
        },
        rating: gif.rating || 'g',
        trendingDatetime: gif.trending_datetime,
        username: gif.username
      };
    } catch (error) {
      console.error('Erro ao buscar GIF aleatório:', error);
      throw new Error('Erro ao buscar GIF aleatório na Giphy');
    }
  }

  static getRatingLabel(rating: string): string {
    const ratings: { [key: string]: string } = {
      'g': 'Geral',
      'pg': 'Pais orientam',
      'pg-13': 'Pais orientam fortemente',
      'r': 'Restrito'
    };
    
    return ratings[rating] || rating;
  }

  static formatTitle(title: string): string {
    if (!title) return 'GIF sem título';
    
    // Remove caracteres especiais e limita o tamanho
    return title.replace(/[^\w\s]/g, '').substring(0, 50).trim();
  }

  static getOptimalImageSize(width: number, height: number): 'original' | 'fixedWidth' | 'fixedHeight' {
    const aspectRatio = width / height;
    
    if (aspectRatio > 1.5) {
      return 'fixedHeight';
    } else if (aspectRatio < 0.7) {
      return 'fixedWidth';
    } else {
      return 'original';
    }
  }
}
