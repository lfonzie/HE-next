// app/api/aulas/generate-ai-sdk/route.ts
// Temporary route to handle the 404 error - redirects to generate-gemini

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Forward the request to the correct endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/aulas/generate-gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ 
        error: errorData.error || 'Erro ao gerar aula',
        success: false 
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in generate-ai-sdk route:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      success: false 
    }, { status: 500 });
  }
}
