// app/api/unsplash/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { getServerSession } from 'next-auth';


import { authOptions } from '@/lib/auth';


import { unsplashService } from '@/lib/unsplash';



export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');
    const type = searchParams.get('type') || 'search';

    if (!query && type === 'search') {
      return NextResponse.json(
        { error: 'Query parameter is required for search' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'education':
        result = await unsplashService.getEducationPhotos(page, perPage);
        break;
      case 'subject':
        result = await unsplashService.getSubjectPhotos(query || '', page, perPage);
        break;
      case 'presentation':
        result = await unsplashService.getPresentationPhotos(page, perPage);
        break;
      case 'search':
      default:
        result = await unsplashService.searchPhotos(query || '', page, perPage);
        break;
    }

    return NextResponse.json({
      success: true,
      data: result,
      pagination: {
        page,
        per_page: perPage,
        total: result.total,
        total_pages: result.total_pages,
        has_next: page < result.total_pages,
        has_prev: page > 1
      }
    });

  } catch (error: any) {
    console.error('Unsplash search API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search images',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, count = 1 } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // For interactive lessons, we don't require authentication
    // This allows the HubEduLessonModule to fetch images
    const result = await unsplashService.searchPhotos(query, 1, count);

    return NextResponse.json({
      success: true,
      photos: result.results.map(photo => ({
        id: photo.id,
        urls: photo.urls,
        alt_description: photo.alt_description,
        description: photo.description,
        user: photo.user,
        width: photo.width,
        height: photo.height,
        color: photo.color,
        likes: photo.likes
      }))
    });

  } catch (error: any) {
    console.error('Unsplash POST API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search images',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
