// lib/unsplash.ts
export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
  };
  width: number;
  height: number;
  color: string;
  likes: number;
}

export interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashImage[];
}

export interface UnsplashPhotoResponse {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
  };
  width: number;
  height: number;
  color: string;
  likes: number;
}

class UnsplashService {
  private accessKey: string;
  private baseUrl = 'https://api.unsplash.com';

  constructor() {
    this.accessKey = process.env.UNSPLASH_ACCESS_KEY || '';
    if (!this.accessKey) {
      console.warn('UNSPLASH_ACCESS_KEY não configurada');
    }
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (!this.accessKey) {
      throw new Error('Unsplash API key não configurada');
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Client-ID ${this.accessKey}`,
        'Accept-Version': 'v1',
      },
    });

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Busca imagens por termo de pesquisa
   */
  async searchPhotos(query: string, page: number = 1, perPage: number = 20): Promise<UnsplashSearchResponse> {
    const params = {
      query,
      page: page.toString(),
      per_page: perPage.toString(),
      orientation: 'landscape', // Prioriza imagens horizontais
    };

    return this.makeRequest<UnsplashSearchResponse>('/search/photos', params);
  }

  /**
   * Busca imagens por categoria/tópico
   */
  async getPhotosByTopic(topic: string, page: number = 1, perPage: number = 20): Promise<UnsplashSearchResponse> {
    const params = {
      query: topic,
      page: page.toString(),
      per_page: perPage.toString(),
      orientation: 'landscape',
    };

    return this.makeRequest<UnsplashSearchResponse>('/search/photos', params);
  }

  /**
   * Obtém uma imagem específica por ID
   */
  async getPhoto(photoId: string): Promise<UnsplashPhotoResponse> {
    return this.makeRequest<UnsplashPhotoResponse>(`/photos/${photoId}`);
  }

  /**
   * Busca imagens relacionadas à educação
   */
  async getEducationPhotos(page: number = 1, perPage: number = 20): Promise<UnsplashSearchResponse> {
    const educationTerms = [
      'education',
      'school',
      'classroom',
      'learning',
      'students',
      'teacher',
      'books',
      'study',
      'university',
      'academic'
    ];

    const randomTerm = educationTerms[Math.floor(Math.random() * educationTerms.length)];
    return this.searchPhotos(randomTerm, page, perPage);
  }

  /**
   * Busca imagens por disciplina específica
   */
  async getSubjectPhotos(subject: string, page: number = 1, perPage: number = 20): Promise<UnsplashSearchResponse> {
    const subjectTerms: Record<string, string[]> = {
      'matematica': ['mathematics', 'math', 'numbers', 'geometry', 'algebra'],
      'portugues': ['literature', 'books', 'reading', 'writing', 'language'],
      'historia': ['history', 'ancient', 'historical', 'museum', 'heritage'],
      'geografia': ['geography', 'world', 'map', 'landscape', 'nature'],
      'ciencias': ['science', 'laboratory', 'experiment', 'chemistry', 'biology'],
      'fisica': ['physics', 'science', 'experiment', 'laboratory', 'technology'],
      'quimica': ['chemistry', 'laboratory', 'science', 'molecules', 'experiment'],
      'biologia': ['biology', 'nature', 'plants', 'animals', 'microscope'],
      'artes': ['art', 'painting', 'drawing', 'creative', 'artistic'],
      'educacao-fisica': ['sports', 'fitness', 'exercise', 'athletics', 'gym'],
    };

    const terms = subjectTerms[subject.toLowerCase()] || [subject];
    const randomTerm = terms[Math.floor(Math.random() * terms.length)];
    
    return this.searchPhotos(randomTerm, page, perPage);
  }

  /**
   * Busca imagens inspiradoras para apresentações
   */
  async getPresentationPhotos(page: number = 1, perPage: number = 20): Promise<UnsplashSearchResponse> {
    const presentationTerms = [
      'presentation',
      'business',
      'professional',
      'office',
      'meeting',
      'conference',
      'workspace',
      'modern',
      'minimalist',
      'clean'
    ];

    const randomTerm = presentationTerms[Math.floor(Math.random() * presentationTerms.length)];
    return this.searchPhotos(randomTerm, page, perPage);
  }
}

export const unsplashService = new UnsplashService();
