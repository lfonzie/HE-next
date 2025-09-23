/**
 * Google Image Search API Alternatives Service
 * Implements multiple providers to replace Google Image Search functionality
 */

export interface ImageSearchResult {
  id: string;
  url: string;
  thumbnail?: string;
  title: string;
  description: string;
  author: string;
  authorUrl?: string;
  source: 'bing' | 'pexels' | 'unsplash' | 'pixabay' | 'wikimedia';
  width: number;
  height: number;
  tags: string[];
  relevanceScore: number;
  educationalSuitability: number;
  qualityScore: number;
  license?: string;
  downloadUrl?: string;
  sourceUrl?: string;
}

export interface SearchOptions {
  query: string;
  subject?: string;
  count?: number;
  safeSearch?: boolean;
  imageType?: 'photo' | 'illustration' | 'clipart' | 'lineart' | 'animated';
  color?: 'color' | 'grayscale' | 'transparent';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  aspectRatio?: 'square' | 'wide' | 'tall';
  orientation?: 'horizontal' | 'vertical' | 'square';
}

export interface SearchResponse {
  success: boolean;
  images: ImageSearchResult[];
  totalFound: number;
  sourcesUsed: string[];
  query: string;
  optimizedQuery: string;
  fallbackUsed: boolean;
  searchTime: number;
}

class GoogleImageAlternativesService {
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private cache: Map<string, { data: SearchResponse; timestamp: number }> = new Map();

  /**
   * Main search method that tries multiple providers
   */
  async searchImages(options: SearchOptions): Promise<SearchResponse> {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey(options);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return { ...cached.data, searchTime: Date.now() - startTime };
    }

    const { query, subject, count = 3, safeSearch = true } = options;
    const optimizedQuery = this.optimizeQueryForEducation(query, subject);
    const sourcesUsed: string[] = [];
    let allImages: ImageSearchResult[] = [];

    console.log(`🔍 Google Image Alternatives search for: "${query}" (${subject || 'general'})`);

    // Try providers in order of preference - Bing and Pexels
    const searchPromises = [
      this.searchBingImages(query, subject, count),
      this.searchPexels(query, subject, count)
    ];

    try {
      const results = await Promise.allSettled(searchPromises);
      
      results.forEach((result, index) => {
        const providerNames = ['bing', 'pexels'];
        const providerName = providerNames[index];
        
        if (result.status === 'fulfilled' && result.value.length > 0) {
          allImages = allImages.concat(result.value);
          sourcesUsed.push(providerName);
          console.log(`✅ ${providerName}: ${result.value.length} images found`);
        } else {
          console.log(`❌ ${providerName}: search failed`);
        }
      });

      // If no results from Google alternatives, fallback to existing providers
      if (allImages.length === 0) {
        console.log('🔄 Falling back to existing providers...');
        const fallbackResults = await this.searchFallbackProviders(query, subject, count);
        allImages = fallbackResults.images;
        sourcesUsed.push(...fallbackResults.sourcesUsed);
      }

      // Score and rank results
      const scoredResults = this.scoreAndRankImages(allImages, query, subject);
      
      // Remove duplicates and select best results
      const uniqueImages = this.removeDuplicates(scoredResults);
      const bestImages = uniqueImages.slice(0, count);

      const response: SearchResponse = {
        success: bestImages.length > 0,
        images: bestImages,
        totalFound: uniqueImages.length,
        sourcesUsed,
        query,
        optimizedQuery,
        fallbackUsed: sourcesUsed.length === 0,
        searchTime: Date.now() - startTime
      };

      // Cache the result
      this.cache.set(cacheKey, { data: response, timestamp: Date.now() });

      console.log(`✅ Google Image Alternatives search completed: ${bestImages.length} results`);
      return response;

    } catch (error) {
      console.error('❌ Google Image Alternatives search failed:', error);
      return this.getFallbackResponse(query, count, Date.now() - startTime);
    }
  }


  /**
   * Bing Image Search API
   */
  private async searchBingImages(query: string, subject?: string, limit: number = 10): Promise<ImageSearchResult[]> {
    if (!process.env.BING_SEARCH_API_KEY) {
      console.log('⚠️ Bing Search API key not configured');
      return [];
    }

    try {
      const optimizedQuery = this.optimizeQueryForEducation(query, subject);
      const params = new URLSearchParams({
        q: optimizedQuery,
        count: Math.min(limit, 50).toString(),
        offset: '0',
        mkt: 'en-US',
        safeSearch: 'Moderate',
        imageType: 'Photo',
        size: 'Large',
        aspect: 'Wide'
      });

      const response = await fetch(`https://api.bing.microsoft.com/v7.0/images/search?${params}`, {
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.BING_SEARCH_API_KEY,
          'User-Agent': 'HubEdu-IA/1.0 (Educational Content Generator)'
        }
      });

      if (!response.ok) return [];

      const data = await response.json();
      if (!data.value || !Array.isArray(data.value)) return [];

      return data.value.map((image: any, index: number) => ({
        id: `bing_${image.imageId || index}`,
        url: image.contentUrl,
        thumbnail: image.thumbnailUrl,
        title: image.name || '',
        description: image.name || '',
        author: 'Bing Images',
        sourceUrl: image.hostPageUrl,
        source: 'bing' as const,
        width: image.width || 0,
        height: image.height || 0,
        tags: image.imageInsightsMetadata?.pagesIncludingCount ? [] : [],
        relevanceScore: this.calculateRelevanceScore(image, query, subject),
        educationalSuitability: this.calculateEducationalSuitability(image, subject),
        qualityScore: this.calculateQualityScore(image),
        license: 'Unknown'
      }));

    } catch (error) {
      console.error('❌ Bing Images search error:', error);
      return [];
    }
  }

  /**
   * Pexels API - High-quality stock photos
   */
  private async searchPexels(query: string, subject?: string, limit: number = 10): Promise<ImageSearchResult[]> {
    if (!process.env.PEXELS_API_KEY) {
      console.log('⚠️ Pexels API key not configured');
      return [];
    }

    try {
      const optimizedQuery = this.optimizeQueryForEducation(query, subject);
      const params = new URLSearchParams({
        query: optimizedQuery,
        per_page: Math.min(limit, 80).toString(),
        orientation: 'landscape',
        size: 'large',
        color: 'blue,green'
      });

      const response = await fetch(`https://api.pexels.com/v1/search?${params}`, {
        headers: {
          'Authorization': process.env.PEXELS_API_KEY,
          'User-Agent': 'HubEdu-IA/1.0 (Educational Content Generator)'
        }
      });

      if (!response.ok) return [];

      const data = await response.json();
      if (!data.photos || !Array.isArray(data.photos)) return [];

      return data.photos.map((photo: any, index: number) => ({
        id: `pexels_${photo.id}`,
        url: photo.src.large2x || photo.src.large,
        thumbnail: photo.src.medium,
        title: photo.alt || '',
        description: photo.alt || '',
        author: photo.photographer,
        authorUrl: photo.photographer_url,
        sourceUrl: photo.url,
        source: 'pexels' as const,
        width: photo.width,
        height: photo.height,
        tags: [],
        relevanceScore: this.calculateRelevanceScore(photo, query, subject),
        educationalSuitability: this.calculateEducationalSuitability(photo, subject),
        qualityScore: this.calculateQualityScore(photo),
        license: 'Pexels License'
      }));

    } catch (error) {
      console.error('❌ Pexels search error:', error);
      return [];
    }
  }


  /**
   * Fallback to existing providers
   */
  private async searchFallbackProviders(query: string, subject?: string, count: number = 3): Promise<{ images: ImageSearchResult[]; sourcesUsed: string[] }> {
    const sourcesUsed: string[] = [];
    let allImages: ImageSearchResult[] = [];

    try {
      // Use existing smart search API
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/images/smart-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, subject, count })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.images) {
          allImages = data.images.map((img: any) => ({
            ...img,
            source: img.source as ImageSearchResult['source']
          }));
          sourcesUsed.push(...data.sourcesUsed);
        }
      }
    } catch (error) {
      console.error('❌ Fallback search error:', error);
    }

    return { images: allImages, sourcesUsed };
  }

  /**
   * Optimize query for educational content
   */
  private optimizeQueryForEducation(query: string, subject?: string): string {
    const cleanQuery = query.toLowerCase().trim();
    
    // Educational keywords by subject
    const educationalKeywords: Record<string, string[]> = {
      'matemática': ['mathematics', 'math', 'equation', 'formula', 'calculation'],
      'ciências': ['science', 'scientific', 'experiment', 'research', 'laboratory'],
      'história': ['history', 'historical', 'ancient', 'civilization', 'heritage'],
      'geografia': ['geography', 'landscape', 'nature', 'environment', 'earth'],
      'português': ['literature', 'language', 'writing', 'grammar', 'text'],
      'física': ['physics', 'energy', 'force', 'motion', 'experiment'],
      'química': ['chemistry', 'molecule', 'atom', 'reaction', 'chemical'],
      'biologia': ['biology', 'nature', 'cell', 'organism', 'life'],
      'arte': ['art', 'painting', 'creative', 'artistic', 'design'],
      'educação': ['education', 'learning', 'teaching', 'school', 'student']
    };

    // Add subject-specific keywords
    let enhancedQuery = cleanQuery;
    if (subject && educationalKeywords[subject.toLowerCase()]) {
      const keywords = educationalKeywords[subject.toLowerCase()];
      enhancedQuery = `${cleanQuery} ${keywords[0]}`;
    }

    // Limit query length
    const words = enhancedQuery.split(' ').slice(0, 5);
    return words.join(' ');
  }

  /**
   * Calculate relevance score for an image
   */
  private calculateRelevanceScore(image: any, query: string, subject?: string): number {
    let score = 0.5; // Base score
    
    const text = `${image.title || ''} ${image.description || ''} ${image.alt || ''}`.toLowerCase();
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    
    // Exact matches
    queryWords.forEach(word => {
      if (text.includes(word)) {
        score += 0.2;
      }
    });
    
    // Subject-specific bonus
    if (subject) {
      const subjectWords = subject.toLowerCase().split(' ');
      subjectWords.forEach(word => {
        if (text.includes(word)) {
          score += 0.1;
        }
      });
    }
    
    // Educational content bonus
    const educationalTerms = ['education', 'learning', 'teaching', 'school', 'student', 'academic'];
    educationalTerms.forEach(term => {
      if (text.includes(term)) {
        score += 0.05;
      }
    });
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate educational suitability score
   */
  private calculateEducationalSuitability(image: any, subject?: string): number {
    let score = 0.3; // Base score
    
    // Source reliability
    const sourceScores: Record<string, number> = {
      'serpapi': 0.8, // Google results
      'bing': 0.7,   // Microsoft results
      'pexels': 0.6,  // Stock photos
      'unsplash': 0.6,
      'pixabay': 0.5,
      'wikimedia': 0.9 // Educational content
    };
    
    if (image.source && sourceScores[image.source]) {
      score += sourceScores[image.source];
    }
    
    // Quality bonus
    if (image.width && image.height) {
      if (image.width > 1200 && image.height > 800) {
        score += 0.2;
      } else if (image.width > 800 && image.height > 600) {
        score += 0.1;
      }
    }
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate quality score
   */
  private calculateQualityScore(image: any): number {
    let score = 0.5;
    
    // Resolution bonus
    if (image.width && image.height) {
      const megapixels = (image.width * image.height) / 1000000;
      if (megapixels > 2) score += 0.3;
      else if (megapixels > 1) score += 0.2;
      else if (megapixels > 0.5) score += 0.1;
    }
    
    // Aspect ratio bonus
    if (image.width && image.height) {
      const aspectRatio = image.width / image.height;
      if (aspectRatio >= 1.2 && aspectRatio <= 2.0) {
        score += 0.2; // Good for slides
      }
    }
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Score and rank images
   */
  private scoreAndRankImages(images: ImageSearchResult[], query: string, subject?: string): ImageSearchResult[] {
    return images
      .map(image => ({
        ...image,
        relevanceScore: this.calculateRelevanceScore(image, query, subject),
        educationalSuitability: this.calculateEducationalSuitability(image, subject),
        qualityScore: this.calculateQualityScore(image)
      }))
      .sort((a, b) => {
        const scoreA = (a.relevanceScore * 0.4) + (a.educationalSuitability * 0.4) + (a.qualityScore * 0.2);
        const scoreB = (b.relevanceScore * 0.4) + (b.educationalSuitability * 0.4) + (b.qualityScore * 0.2);
        return scoreB - scoreA;
      });
  }

  /**
   * Remove duplicate images
   */
  private removeDuplicates(images: ImageSearchResult[]): ImageSearchResult[] {
    const seen = new Set<string>();
    return images.filter(image => {
      if (seen.has(image.url)) return false;
      seen.add(image.url);
      return true;
    });
  }

  /**
   * Get cache key
   */
  private getCacheKey(options: SearchOptions): string {
    return `${options.query}_${options.subject || 'general'}_${options.count || 3}`;
  }

  /**
   * Fallback response when all searches fail
   */
  private getFallbackResponse(query: string, count: number, searchTime: number): SearchResponse {
    const fallbackImages: ImageSearchResult[] = Array.from({ length: count }, (_, index) => ({
      id: `fallback_${Date.now()}_${index}`,
      url: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop&auto=format&q=80`,
      title: `Educational image for: ${query}`,
      description: `Fallback educational content`,
      author: 'Educational Content',
      source: 'unsplash' as const,
      width: 800,
      height: 600,
      tags: ['education', 'fallback'],
      relevanceScore: 0.3,
      educationalSuitability: 0.7,
      qualityScore: 0.6,
      license: 'Unsplash License'
    }));

    return {
      success: true,
      images: fallbackImages,
      totalFound: fallbackImages.length,
      sourcesUsed: ['fallback'],
      query,
      optimizedQuery: query,
      fallbackUsed: true,
      searchTime
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Google Image Alternatives cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

export const googleImageAlternativesService = new GoogleImageAlternativesService();
