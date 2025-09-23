// lib/enhanced-image-service.ts - Enhanced image service for aulas with dynamic relevance

import { unsplashService } from './unsplash';
import { detectTheme, translateThemeToEnglish } from './themeDetection';
import { googleImageAlternativesService } from './services/google-image-alternatives';

export interface ImageSearchResult {
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
  relevanceScore: number;
  tags: string[];
}

export interface ImageSearchResponse {
  success: boolean;
  photos: ImageSearchResult[];
  query: string;
  theme: string;
  englishTheme: string;
  fallback: boolean;
  error?: string;
  searchTime: number;
  cacheHit?: boolean;
}

export interface ImageCacheEntry {
  query: string;
  theme: string;
  results: ImageSearchResult[];
  timestamp: number;
  expiresAt: number;
}

class EnhancedImageService {
  private cache: Map<string, ImageCacheEntry> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CACHE_SIZE = 100;
  private readonly MIN_RELEVANCE_SCORE = 0.3;

  /**
   * Enhanced image search with dynamic relevance scoring
   */
  async searchImages(
    query: string, 
    subject?: string, 
    count: number = 1,
    forceRefresh: boolean = false,
    useGoogleAlternatives: boolean = true
  ): Promise<ImageSearchResponse> {
    const startTime = Date.now();
    
    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = this.getCachedResult(query, subject);
        if (cached) {
          return {
            ...cached,
            searchTime: Date.now() - startTime,
            cacheHit: true
          };
        }
      }

      // Try Google alternatives first if enabled
      if (useGoogleAlternatives) {
        try {
          const googleResults = await googleImageAlternativesService.searchImages({
            query,
            subject,
            count,
            safeSearch: true,
            imageType: 'photo',
            color: 'color',
            size: 'large',
            aspectRatio: 'wide',
            orientation: 'horizontal'
          });

          if (googleResults.success && googleResults.images.length > 0) {
            console.log('✅ Google alternatives found results:', googleResults.images.length);
            
            // Convert to our format
            const convertedResults = googleResults.images.map(img => ({
              id: img.id,
              urls: {
                raw: img.url,
                full: img.url,
                regular: img.url,
                small: img.thumbnail || img.url,
                thumb: img.thumbnail || img.url
              },
              alt_description: img.title,
              description: img.description,
              user: {
                name: img.author,
                username: img.author.toLowerCase().replace(/\s+/g, '')
              },
              width: img.width,
              height: img.height,
              color: '#4F46E5',
              likes: 0,
              relevanceScore: img.relevanceScore,
              tags: img.tags
            }));

            // Cache the results
            this.cacheResult(query, subject, convertedResults, { 
              theme: query, 
              englishTheme: query, 
              confidence: 0.8 
            });

            return {
              success: true,
              photos: convertedResults,
              query: query,
              theme: query,
              englishTheme: query,
              fallback: false,
              searchTime: Date.now() - startTime
            };
          }
        } catch (error) {
          console.warn('⚠️ Google alternatives failed, falling back to original method:', error);
        }
      }

      // 1. Enhanced theme detection
      const themeInfo = await this.detectEnhancedTheme(query, subject);
      console.log('🎯 Enhanced theme detection:', themeInfo);

      // 2. Generate multiple search queries for better results
      const searchQueries = this.generateSearchQueries(themeInfo);
      console.log('🔍 Generated search queries:', searchQueries);

      // 3. Search with multiple queries and combine results
      const allResults = await this.searchMultipleQueries(searchQueries, count * 3);
      
      // 4. Score and rank results by relevance
      const scoredResults = this.scoreResultsByRelevance(allResults, themeInfo);
      
      // 5. Filter and select best results
      const selectedResults = this.selectBestResults(scoredResults, count);

      // 6. Cache the results
      this.cacheResult(query, subject, selectedResults, themeInfo);

      const response: ImageSearchResponse = {
        success: true,
        photos: selectedResults,
        query: themeInfo.englishTheme,
        theme: themeInfo.theme,
        englishTheme: themeInfo.englishTheme,
        fallback: false,
        searchTime: Date.now() - startTime
      };

      console.log('✅ Enhanced image search completed:', {
        query,
        resultsCount: selectedResults.length,
        searchTime: response.searchTime,
        avgRelevanceScore: selectedResults.reduce((sum, r) => sum + r.relevanceScore, 0) / selectedResults.length
      });

      return response;

    } catch (error) {
      console.error('❌ Enhanced image search failed:', error);
      return this.getFallbackResponse(query, count, Date.now() - startTime);
    }
  }

  /**
   * Enhanced theme detection with better context understanding
   */
  private async detectEnhancedTheme(query: string, subject?: string) {
    try {
      const baseTheme = await detectTheme(query, subject);
      
      // Enhance with additional context
      const enhancedTheme = {
        ...baseTheme,
        context: this.extractContext(query),
        keywords: this.extractKeywords(query),
        subjectContext: subject ? this.getSubjectContext(subject) : null
      };

      return enhancedTheme;
    } catch (error) {
      console.warn('⚠️ Enhanced theme detection failed, using fallback:', error);
      return {
        theme: query,
        englishTheme: query,
        confidence: 0.5,
        category: subject || 'geral',
        context: [],
        keywords: [],
        subjectContext: null
      };
    }
  }

  /**
   * Generate multiple search queries for better image diversity
   */
  private generateSearchQueries(themeInfo: any): string[] {
    const queries: string[] = [];
    
    // Primary query
    queries.push(themeInfo.englishTheme);
    
    // Context-based queries
    if (themeInfo.context.length > 0) {
      queries.push(themeInfo.context.join(' '));
    }
    
    // Subject-specific queries
    if (themeInfo.subjectContext) {
      queries.push(themeInfo.subjectContext);
    }
    
    // Keyword combinations
    if (themeInfo.keywords.length > 0) {
      queries.push(themeInfo.keywords.slice(0, 3).join(' '));
    }
    
    // Category-based queries
    const categoryQueries = this.getCategoryQueries(themeInfo.category);
    queries.push(...categoryQueries.slice(0, 2));
    
    // Remove duplicates and limit
    return Array.from(new Set(queries)).slice(0, 5);
  }

  /**
   * Search multiple queries and combine results
   */
  private async searchMultipleQueries(queries: string[], maxResults: number): Promise<any[]> {
    const allResults: any[] = [];
    
    for (const query of queries) {
      try {
        const results = await unsplashService.searchPhotos(query, 1, Math.ceil(maxResults / queries.length));
        if (results.results) {
          allResults.push(...results.results.map(r => ({ ...r, searchQuery: query })));
        }
      } catch (error) {
        console.warn(`⚠️ Search failed for query "${query}":`, error);
      }
    }
    
    return allResults;
  }

  /**
   * Score results by relevance to the theme
   */
  private scoreResultsByRelevance(results: any[], themeInfo: any): ImageSearchResult[] {
    return results.map(result => {
      let relevanceScore = 0.5; // Base score
      
      // Score based on alt description
      if (result.alt_description) {
        const altText = result.alt_description.toLowerCase();
        const themeWords = themeInfo.englishTheme.toLowerCase().split(' ');
        const matchingWords = themeWords.filter(word => altText.includes(word));
        relevanceScore += (matchingWords.length / themeWords.length) * 0.3;
      }
      
      // Score based on description
      if (result.description) {
        const descText = result.description.toLowerCase();
        const themeWords = themeInfo.englishTheme.toLowerCase().split(' ');
        const matchingWords = themeWords.filter(word => descText.includes(word));
        relevanceScore += (matchingWords.length / themeWords.length) * 0.2;
      }
      
      // Score based on tags (if available)
      if (result.tags && Array.isArray(result.tags)) {
        const tagTexts = result.tags.map((tag: any) => tag.title?.toLowerCase() || '').join(' ');
        const themeWords = themeInfo.englishTheme.toLowerCase().split(' ');
        const matchingWords = themeWords.filter(word => tagTexts.includes(word));
        relevanceScore += (matchingWords.length / themeWords.length) * 0.2;
      }
      
      // Boost score for educational content
      const educationalTerms = ['education', 'school', 'learning', 'study', 'classroom', 'teacher', 'student'];
      const allText = [
        result.alt_description || '',
        result.description || '',
        ...(result.tags?.map((tag: any) => tag.title || '') || [])
      ].join(' ').toLowerCase();
      
      const hasEducationalContent = educationalTerms.some(term => allText.includes(term));
      if (hasEducationalContent) {
        relevanceScore += 0.1;
      }
      
      // Boost score for high-quality images
      if (result.likes > 100) {
        relevanceScore += 0.05;
      }
      
      // Ensure score is between 0 and 1
      relevanceScore = Math.min(1, Math.max(0, relevanceScore));
      
      return {
        ...result,
        relevanceScore,
        tags: result.tags || []
      };
    });
  }

  /**
   * Select best results based on relevance score
   */
  private selectBestResults(scoredResults: ImageSearchResult[], count: number): ImageSearchResult[] {
    // Sort by relevance score (descending)
    const sortedResults = scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Filter out low-relevance results
    const filteredResults = sortedResults.filter(r => r.relevanceScore >= this.MIN_RELEVANCE_SCORE);
    
    // If we don't have enough high-relevance results, include some lower-relevance ones
    if (filteredResults.length < count) {
      const additionalResults = sortedResults
        .filter(r => r.relevanceScore < this.MIN_RELEVANCE_SCORE)
        .slice(0, count - filteredResults.length);
      filteredResults.push(...additionalResults);
    }
    
    // Remove duplicates by ID
    const uniqueResults = filteredResults.filter((result, index, self) => 
      index === self.findIndex(r => r.id === result.id)
    );
    
    return uniqueResults.slice(0, count);
  }

  /**
   * Extract context from query
   */
  private extractContext(query: string): string[] {
    const contextMap: Record<string, string[]> = {
      'introduction': ['beginner', 'basic', 'overview', 'fundamentals'],
      'advanced': ['complex', 'detailed', 'in-depth', 'expert'],
      'practical': ['hands-on', 'application', 'real-world', 'practice'],
      'theoretical': ['concept', 'theory', 'principle', 'abstract'],
      'history': ['historical', 'past', 'evolution', 'development'],
      'modern': ['contemporary', 'current', 'today', 'present']
    };
    
    const contexts: string[] = [];
    const queryLower = query.toLowerCase();
    
    for (const [key, values] of Object.entries(contextMap)) {
      if (queryLower.includes(key)) {
        contexts.push(...values);
      }
    }
    
    return contexts;
  }

  /**
   * Extract keywords from query
   */
  private extractKeywords(query: string): string[] {
    const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return query.toLowerCase()
      .split(' ')
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 5);
  }

  /**
   * Get subject-specific context
   */
  private getSubjectContext(subject: string): string {
    const subjectContexts: Record<string, string> = {
      'matematica': 'mathematics numbers calculation',
      'ciencias': 'science laboratory experiment',
      'historia': 'history historical heritage',
      'geografia': 'geography world map',
      'portugues': 'literature language writing',
      'fisica': 'physics science energy',
      'quimica': 'chemistry laboratory molecules',
      'biologia': 'biology nature life',
      'artes': 'art creative artistic',
      'educacao': 'education learning teaching'
    };
    
    return subjectContexts[subject.toLowerCase()] || subject;
  }

  /**
   * Get category-specific queries
   */
  private getCategoryQueries(category: string): string[] {
    const categoryQueries: Record<string, string[]> = {
      'ciencias': ['science laboratory', 'scientific research', 'experiment discovery'],
      'matematica': ['mathematics numbers', 'geometry algebra', 'calculation formula'],
      'historia': ['history ancient', 'historical heritage', 'culture museum'],
      'geografia': ['geography world', 'map landscape', 'nature earth'],
      'portugues': ['literature books', 'reading writing', 'language poetry'],
      'fisica': ['physics science', 'energy force', 'experiment laboratory'],
      'quimica': ['chemistry laboratory', 'molecules experiment', 'science reaction'],
      'biologia': ['biology nature', 'plants animals', 'life cell'],
      'artes': ['art painting', 'creative artistic', 'design sculpture'],
      'educacao': ['education learning', 'school classroom', 'teaching student']
    };
    
    return categoryQueries[category] || ['education learning'];
  }

  /**
   * Cache management
   */
  private getCachedResult(query: string, subject?: string): ImageSearchResponse | null {
    const cacheKey = this.getCacheKey(query, subject);
    const cached = this.cache.get(cacheKey);
    
    if (cached && cached.expiresAt > Date.now()) {
      console.log('📦 Cache hit for query:', query);
      return {
        success: true,
        photos: cached.results,
        query: cached.query,
        theme: cached.theme,
        englishTheme: cached.query,
        fallback: false,
        searchTime: 0,
        cacheHit: true
      };
    }
    
    return null;
  }

  private cacheResult(query: string, subject: string | undefined, results: ImageSearchResult[], themeInfo: any): void {
    const cacheKey = this.getCacheKey(query, subject);
    
    // Clean old cache entries
    this.cleanCache();
    
    // Add new entry
    this.cache.set(cacheKey, {
      query: themeInfo.englishTheme,
      theme: themeInfo.theme,
      results,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_DURATION
    });
    
    console.log('💾 Cached result for query:', query);
  }

  private getCacheKey(query: string, subject?: string): string {
    return `${query.toLowerCase()}_${subject?.toLowerCase() || 'general'}`;
  }

  private cleanCache(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries
    entries.forEach(([key, entry]) => {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
      }
    });
    
    // Remove oldest entries if cache is too large
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const sortedEntries = entries
        .filter(([_, entry]) => entry.expiresAt > now)
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = sortedEntries.slice(0, this.cache.size - this.MAX_CACHE_SIZE);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Enhanced fallback response with educational images by subject
   */
  private getFallbackResponse(query: string, count: number, searchTime: number): ImageSearchResponse {
    // Detectar matéria baseada na query
    const subject = this.detectSubjectFromQuery(query);
    
    // Imagens educacionais específicas por matéria
    const educationalImages: Record<string, string[]> = {
      'matemática': [
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&h=400&fit=crop&auto=format&q=80'
      ],
      'ciências': [
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&auto=format&q=80'
      ],
      'história': [
        'https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=800&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&auto=format&q=80'
      ],
      'geografia': [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&auto=format&q=80'
      ],
      'português': [
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&auto=format&q=80'
      ],
      'física': [
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&auto=format&q=80'
      ],
      'química': [
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&auto=format&q=80'
      ],
      'biologia': [
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&auto=format&q=80'
      ],
      'geral': [
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&auto=format&q=80'
      ]
    };

    const subjectImages = educationalImages[subject] || educationalImages['geral'];
    const fallbackImages = Array.from({ length: count }, (_, index) => {
      const imageUrl = subjectImages[index % subjectImages.length];
      return {
        id: `fallback-${subject}-${Date.now()}-${index}`,
        urls: {
          raw: imageUrl,
          full: imageUrl,
          regular: imageUrl,
          small: imageUrl.replace('w=800&h=400', 'w=400&h=200'),
          thumb: imageUrl.replace('w=800&h=400', 'w=200&h=100')
        },
        alt_description: `Educational image for ${subject}: ${query}`,
        description: `Educational content image for ${subject}: ${query}`,
        user: {
          name: 'Educational Content',
          username: 'education'
        },
        width: 800,
        height: 400,
        color: '#4F46E5',
        likes: 0,
        relevanceScore: 0.2,
        tags: [subject, 'education']
      };
    });

    return {
      success: true,
      photos: fallbackImages,
      query: query,
      theme: query,
      englishTheme: query,
      fallback: true,
      error: `Enhanced image service unavailable, using educational fallback images for ${subject}`,
      searchTime
    };
  }

  /**
   * Detecta a matéria baseada na query
   */
  private detectSubjectFromQuery(query: string): string {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('matemática') || queryLower.includes('matematica') || 
        queryLower.includes('algebra') || queryLower.includes('geometria') || 
        queryLower.includes('calculo') || queryLower.includes('estatistica')) {
      return 'matemática';
    }
    
    if (queryLower.includes('física') || queryLower.includes('fisica') || 
        queryLower.includes('physics') || queryLower.includes('mecanica')) {
      return 'física';
    }
    
    if (queryLower.includes('química') || queryLower.includes('quimica') || 
        queryLower.includes('chemistry') || queryLower.includes('molecula')) {
      return 'química';
    }
    
    if (queryLower.includes('biologia') || queryLower.includes('biology') || 
        queryLower.includes('celula') || queryLower.includes('dna') || 
        queryLower.includes('genetica') || queryLower.includes('evolucao')) {
      return 'biologia';
    }
    
    if (queryLower.includes('história') || queryLower.includes('historia') || 
        queryLower.includes('history') || queryLower.includes('antiga') || 
        queryLower.includes('medieval') || queryLower.includes('moderna')) {
      return 'história';
    }
    
    if (queryLower.includes('geografia') || queryLower.includes('geography') || 
        queryLower.includes('clima') || queryLower.includes('relevo') || 
        queryLower.includes('paisagem') || queryLower.includes('continente')) {
      return 'geografia';
    }
    
    if (queryLower.includes('português') || queryLower.includes('portugues') || 
        queryLower.includes('literatura') || queryLower.includes('gramatica') || 
        queryLower.includes('redacao') || queryLower.includes('texto')) {
      return 'português';
    }
    
    if (queryLower.includes('ciências') || queryLower.includes('ciencias') || 
        queryLower.includes('science') || queryLower.includes('experimento') || 
        queryLower.includes('laboratorio') || queryLower.includes('pesquisa')) {
      return 'ciências';
    }
    
    return 'geral';
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Image cache cleared');
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

export const enhancedImageService = new EnhancedImageService();
