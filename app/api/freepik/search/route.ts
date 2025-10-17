import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import axios from 'axios';



export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const limit = searchParams.get('limit') || '10';
  const type = searchParams.get('type') || 'images'; // images, templates, videos, icons

  if (!process.env.FREEPIK_API_KEY) {
    return NextResponse.json({ error: 'Freepik API key not configured' }, { status: 500 });
  }

  if (!query.trim()) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // Using Stock Content API for search
    const response = await axios.get('https://api.freepik.com/v1/resources', {
      headers: {
        'x-freepik-api-key': process.env.FREEPIK_API_KEY,
        'Content-Type': 'application/json',
      },
      params: {
        query,
        limit: parseInt(limit),
        type, // images, templates, videos, icons
        // Additional parameters for Stock Content API
        premium: false, // Set to true if you want premium content
        safe_search: true,
        sort: 'relevance', // relevance, date, downloads
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Freepik Stock Content API error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    if (error.response?.status === 429) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    if (error.response?.status === 400) {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to fetch from Freepik Stock Content API',
      details: error.response?.data || error.message 
    }, { status: 500 });
  }
}
