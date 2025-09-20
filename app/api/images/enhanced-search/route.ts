// app/api/images/enhanced-search/route.ts - Enhanced image search endpoint
import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { enhancedImageService } from '@/lib/enhanced-image-service';



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, subject, count = 1, forceRefresh = false } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log('🖼️ Enhanced image search for:', query, 'subject:', subject);

    // Use enhanced image service for better relevance and dynamic results
    const result = await enhancedImageService.searchImages(query, subject, count, forceRefresh);
    
    // Log performance metrics
    console.log('📊 Image search metrics:', {
      query,
      subject,
      resultsCount: result.photos.length,
      searchTime: result.searchTime,
      cacheHit: result.cacheHit,
      fallback: result.fallback,
      avgRelevanceScore: result.photos.length > 0 
        ? result.photos.reduce((sum, photo) => sum + photo.relevanceScore, 0) / result.photos.length 
        : 0
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ Enhanced image search failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Image search service unavailable',
      photos: [],
      query: '',
      theme: '',
      englishTheme: '',
      fallback: true,
      searchTime: 0
    }, { status: 500 });
  }
}

// GET endpoint for cache management
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'cache-stats':
        const stats = enhancedImageService.getCacheStats();
        return NextResponse.json({ stats });
      
      case 'clear-cache':
        enhancedImageService.clearCache();
        return NextResponse.json({ message: 'Cache cleared successfully' });
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('❌ Cache management failed:', error);
    return NextResponse.json({ error: 'Cache management failed' }, { status: 500 });
  }
}
