// lib/pixabay.ts - Serviço dedicado para API Pixabay com foco educacional
export interface PixabayImage {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  previewWidth: number;
  previewHeight: number;
  webformatURL: string;
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;
  fullHDURL: string;
  imageURL: string;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  views: number;
  downloads: number;
  favorites: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
}

export interface PixabaySearchResponse {
  total: number;
  totalHits: number;
  hits: PixabayImage[];
}

export interface PixabayVideo {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  duration: number;
  picture_id: string;
  videos: {
    large: {
      url: string;
      width: number;
      height: number;
      size: number;
    };
    medium: {
      url: string;
      width: number;
      height: number;
      size: number;
    };
    small: {
      url: string;
      width: number;
      height: number;
      size: number;
    };
    tiny: {
      url: string;
      width: number;
      height: number;
      size: number;
    };
  };
  views: number;
  downloads: number;
  favorites: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
}

export interface PixabayVideoResponse {
  total: number;
  totalHits: number;
  hits: PixabayVideo[];
}

class PixabayService {
  private apiKey: string;
  private baseUrl = 'https://pixabay.com/api';
  private educationalCategories = [
    'education', 'school', 'learning', 'study', 'classroom', 'teacher', 'student',
    'book', 'library', 'university', 'college', 'academic', 'research', 'science',
    'laboratory', 'experiment', 'mathematics', 'physics', 'chemistry', 'biology',
    'geography', 'history', 'literature', 'art', 'music', 'language', 'writing',
    'reading', 'knowledge', 'wisdom', 'intelligence', 'brain', 'thinking', 'idea',
    'innovation', 'technology', 'computer', 'digital', 'online', 'virtual',
    'presentation', 'lecture', 'seminar', 'workshop', 'training', 'course',
    'lesson', 'tutorial', 'guide', 'instruction', 'teaching', 'mentoring'
  ];

  constructor() {
    this.apiKey = process.env.PIXABAY_API_KEY || '';
    if (!this.apiKey) {
      console.warn('PIXABAY_API_KEY não configurada');
    }
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Pixabay API key não configurada');
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Adicionar parâmetros padrão para imagens educacionais
    const defaultParams = {
      key: this.apiKey,
      safesearch: 'true',
      lang: 'pt',
      image_type: 'photo',
      orientation: 'horizontal',
      min_width: '640',
      min_height: '480',
      editors_choice: 'true',
      ...params
    };

    Object.entries(defaultParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Pixabay API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Busca imagens educacionais por termo de pesquisa
   */
  async searchEducationalImages(
    query: string, 
    page: number = 1, 
    perPage: number = 20,
    category?: string
  ): Promise<PixabaySearchResponse> {
    // Otimizar query para contexto educacional
    const educationalQuery = this.optimizeQueryForEducation(query, category);
    
    const params = {
      q: educationalQuery,
      page: page.toString(),
      per_page: perPage.toString(),
      category: category || 'education',
      order: 'popular'
    };

    return this.makeRequest<PixabaySearchResponse>('/', params);
  }

  /**
   * Busca imagens por disciplina específica
   */
  async getSubjectImages(
    subject: string, 
    page: number = 1, 
    perPage: number = 20
  ): Promise<PixabaySearchResponse> {
    const subjectTerms: Record<string, string[]> = {
      'matematica': ['mathematics', 'math', 'numbers', 'geometry', 'algebra', 'calculus', 'formula'],
      'portugues': ['literature', 'books', 'reading', 'writing', 'language', 'grammar', 'poetry'],
      'historia': ['history', 'ancient', 'historical', 'museum', 'heritage', 'civilization', 'culture'],
      'geografia': ['geography', 'world', 'map', 'landscape', 'nature', 'earth', 'globe'],
      'ciencias': ['science', 'laboratory', 'experiment', 'chemistry', 'biology', 'physics', 'research'],
      'fisica': ['physics', 'science', 'experiment', 'laboratory', 'technology', 'energy', 'force'],
      'quimica': ['chemistry', 'laboratory', 'science', 'molecules', 'experiment', 'reaction', 'formula'],
      'biologia': ['biology', 'nature', 'plants', 'animals', 'microscope', 'cell', 'evolution'],
      'artes': ['art', 'painting', 'drawing', 'creative', 'artistic', 'design', 'sculpture'],
      'educacao-fisica': ['sports', 'fitness', 'exercise', 'athletics', 'gym', 'health', 'movement'],
      'filosofia': ['philosophy', 'thinking', 'wisdom', 'knowledge', 'mind', 'ethics', 'logic'],
      'sociologia': ['society', 'community', 'social', 'culture', 'people', 'group', 'interaction'],
      'psicologia': ['psychology', 'mind', 'brain', 'behavior', 'mental', 'cognitive', 'therapy']
    };

    const terms = subjectTerms[subject.toLowerCase()] || [subject];
    const randomTerm = terms[Math.floor(Math.random() * terms.length)];
    
    return this.searchEducationalImages(randomTerm, page, perPage, 'education');
  }

  /**
   * Busca imagens para apresentações educacionais
   */
  async getPresentationImages(
    topic: string, 
    page: number = 1, 
    perPage: number = 20
  ): Promise<PixabaySearchResponse> {
    const presentationTerms = [
      'presentation', 'business', 'professional', 'office', 'meeting', 'conference',
      'workspace', 'modern', 'minimalist', 'clean', 'corporate', 'boardroom',
      'lecture', 'seminar', 'workshop', 'training', 'education', 'learning'
    ];

    const randomTerm = presentationTerms[Math.floor(Math.random() * presentationTerms.length)];
    const combinedQuery = `${topic} ${randomTerm}`;
    
    return this.searchEducationalImages(combinedQuery, page, perPage, 'business');
  }

  /**
   * Busca imagens inspiradoras para educação
   */
  async getInspirationalImages(
    page: number = 1, 
    perPage: number = 20
  ): Promise<PixabaySearchResponse> {
    const inspirationalTerms = [
      'success', 'achievement', 'goal', 'dream', 'motivation', 'inspiration',
      'growth', 'progress', 'development', 'improvement', 'excellence',
      'creativity', 'innovation', 'breakthrough', 'discovery', 'knowledge'
    ];

    const randomTerm = inspirationalTerms[Math.floor(Math.random() * inspirationalTerms.length)];
    
    return this.searchEducationalImages(randomTerm, page, perPage, 'backgrounds');
  }

  /**
   * Busca imagens científicas e tecnológicas
   */
  async getScienceImages(
    topic: string, 
    page: number = 1, 
    perPage: number = 20
  ): Promise<PixabaySearchResponse> {
    const scienceTerms = [
      'science', 'technology', 'research', 'laboratory', 'experiment',
      'innovation', 'discovery', 'analysis', 'data', 'microscope',
      'computer', 'digital', 'artificial intelligence', 'robotics'
    ];

    const randomTerm = scienceTerms[Math.floor(Math.random() * scienceTerms.length)];
    const combinedQuery = `${topic} ${randomTerm}`;
    
    return this.searchEducationalImages(combinedQuery, page, perPage, 'science');
  }

  /**
   * Busca vídeos educacionais
   */
  async searchEducationalVideos(
    query: string, 
    page: number = 1, 
    perPage: number = 20
  ): Promise<PixabayVideoResponse> {
    const educationalQuery = this.optimizeQueryForEducation(query);
    
    const params = {
      q: educationalQuery,
      page: page.toString(),
      per_page: perPage.toString(),
      video_type: 'all',
      min_duration: '10',
      max_duration: '300', // Máximo 5 minutos
      order: 'popular'
    };

    return this.makeRequest<PixabayVideoResponse>('/videos/', params);
  }

  /**
   * Obtém uma imagem específica por ID
   */
  async getImage(imageId: number): Promise<PixabayImage | null> {
    try {
      const response = await this.makeRequest<PixabaySearchResponse>('/', {
        id: imageId.toString()
      });
      
      return response.hits[0] || null;
    } catch (error) {
      console.error('Erro ao buscar imagem por ID:', error);
      return null;
    }
  }

  /**
   * Otimiza query para contexto educacional
   */
  private optimizeQueryForEducation(query: string, category?: string): string {
    // Limpar e normalizar a query
    let cleanQuery = query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Adicionar termos educacionais se não estiverem presentes
    const hasEducationalTerm = this.educationalCategories.some(term => 
      cleanQuery.includes(term)
    );

    if (!hasEducationalTerm && category !== 'education') {
      const educationalTerms = ['education', 'learning', 'study', 'academic'];
      const randomTerm = educationalTerms[Math.floor(Math.random() * educationalTerms.length)];
      cleanQuery = `${cleanQuery} ${randomTerm}`;
    }

    return cleanQuery;
  }

  /**
   * Converte resultado Pixabay para formato padronizado
   */
  static formatImageResult(image: PixabayImage): any {
    return {
      id: `pixabay_${image.id}`,
      url: image.webformatURL,
      thumbnail: image.previewURL,
      largeUrl: image.largeImageURL,
      fullHdUrl: image.fullHDURL,
      description: image.tags,
      author: image.user,
      authorUrl: `https://pixabay.com/users/${image.user}-${image.user_id}/`,
      source: 'pixabay',
      downloadUrl: image.pageURL,
      width: image.webformatWidth,
      height: image.webformatHeight,
      tags: image.tags.split(', '),
      quality: 'good',
      educational: true,
      views: image.views,
      downloads: image.downloads,
      likes: image.likes,
      comments: image.comments,
      userImage: image.userImageURL
    };
  }

  /**
   * Converte resultado de vídeo Pixabay para formato padronizado
   */
  static formatVideoResult(video: PixabayVideo): any {
    return {
      id: `pixabay_video_${video.id}`,
      url: video.videos.medium.url,
      thumbnail: `https://i.vimeocdn.com/video/${video.picture_id}_640x360.jpg`,
      largeUrl: video.videos.large.url,
      smallUrl: video.videos.small.url,
      tinyUrl: video.videos.tiny.url,
      description: video.tags,
      author: video.user,
      authorUrl: `https://pixabay.com/users/${video.user}-${video.user_id}/`,
      source: 'pixabay',
      downloadUrl: video.pageURL,
      width: video.videos.medium.width,
      height: video.videos.medium.height,
      duration: video.duration,
      tags: video.tags.split(', '),
      quality: 'good',
      educational: true,
      views: video.views,
      downloads: video.downloads,
      likes: video.likes,
      comments: video.comments,
      userImage: video.userImageURL
    };
  }
}

export const pixabayService = new PixabayService();
