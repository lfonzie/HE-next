import { NextRequest, NextResponse } from 'next/server';
import { googleImageAlternativesService, SearchOptions } from '@/lib/services/google-image-alternatives';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      query, 
      subject, 
      count = 3, 
      safeSearch = true,
      imageType = 'photo',
      color = 'color',
      size = 'large',
      aspectRatio = 'wide',
      orientation = 'horizontal'
    } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    const searchOptions: SearchOptions = {
      query,
      subject,
      count: Math.min(count, 20), // Limit to 20 results max
      safeSearch,
      imageType,
      color,
      size,
      aspectRatio,
      orientation
    };

    console.log(`🔍 Google Image Alternatives API called with:`, searchOptions);

    const result = await googleImageAlternativesService.searchImages(searchOptions);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ Google Image Alternatives API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Google Image Alternatives search failed',
        images: [],
        totalFound: 0,
        sourcesUsed: [],
        fallbackUsed: true,
        searchTime: 0
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const subject = searchParams.get('subject');
    const count = parseInt(searchParams.get('count') || '3');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const searchOptions: SearchOptions = {
      query,
      subject: subject || undefined,
      count: Math.min(count, 20),
      safeSearch: true,
      imageType: 'photo',
      color: 'color',
      size: 'large',
      aspectRatio: 'wide',
      orientation: 'horizontal'
    };

    const result = await googleImageAlternativesService.searchImages(searchOptions);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ Google Image Alternatives GET API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Google Image Alternatives search failed',
        images: [],
        totalFound: 0,
        sourcesUsed: [],
        fallbackUsed: true,
        searchTime: 0
      },
      { status: 500 }
    );
  }
}
