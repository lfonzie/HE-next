import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { image_url, text_content } = body;

  if (!process.env.FREEPIK_API_KEY) {
    return NextResponse.json({ error: 'Freepik API key not configured' }, { status: 500 });
  }

  if (!image_url && !text_content) {
    return NextResponse.json({ error: 'Either image_url or text_content is required' }, { status: 400 });
  }

  try {
    // Using Classifier API
    const response = await axios.post('https://api.freepik.com/v1/classifier/classify', {
      image_url: image_url || null,
      text_content: text_content || null,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.FREEPIK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Freepik Classifier API error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    if (error.response?.status === 429) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    if (error.response?.status === 400) {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }
    if (error.response?.status === 402) {
      return NextResponse.json({ error: 'Payment required - insufficient credits' }, { status: 402 });
    }

    return NextResponse.json({ 
      error: 'Failed to classify content with Freepik Classifier API',
      details: error.response?.data || error.message 
    }, { status: 500 });
  }
}
