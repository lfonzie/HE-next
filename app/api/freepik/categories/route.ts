import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'images'; // images, templates, videos, icons

  if (!process.env.FREEPIK_API_KEY) {
    return NextResponse.json({ error: 'Freepik API key not configured' }, { status: 500 });
  }

  try {
    // Using Stock Content API for categories
    const response = await axios.get('https://api.freepik.com/v1/stock-content/categories', {
      headers: {
        'Authorization': `Bearer ${process.env.FREEPIK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      params: {
        type, // images, templates, videos, icons
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Freepik Stock Content categories error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    return NextResponse.json({ 
      error: 'Failed to fetch categories from Freepik Stock Content API',
      details: error.response?.data || error.message 
    }, { status: 500 });
  }
}
