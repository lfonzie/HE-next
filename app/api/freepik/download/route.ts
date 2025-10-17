import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import axios from 'axios';



export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resourceId = searchParams.get('id');
  const resourceType = searchParams.get('type') || 'images'; // images, templates, videos, icons

  if (!process.env.FREEPIK_API_KEY) {
    return NextResponse.json({ error: 'Freepik API key not configured' }, { status: 500 });
  }

  if (!resourceId) {
    return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
  }

  try {
    // Using Stock Content API for download
    const response = await axios.get(`https://api.freepik.com/v1/stock-content/${resourceType}/${resourceId}/download`, {
      headers: {
        'x-freepik-api-key': process.env.FREEPIK_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Freepik Stock Content download error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    if (error.response?.status === 404) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    if (error.response?.status === 403) {
      return NextResponse.json({ error: 'Access denied to resource' }, { status: 403 });
    }
    if (error.response?.status === 402) {
      return NextResponse.json({ error: 'Payment required - insufficient credits' }, { status: 402 });
    }

    return NextResponse.json({ 
      error: 'Failed to get download URL from Freepik Stock Content API',
      details: error.response?.data || error.message 
    }, { status: 500 });
  }
}
