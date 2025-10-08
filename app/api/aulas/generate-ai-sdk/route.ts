// app/api/aulas/generate-ai-sdk/route.ts
// Temporary route to handle the 404 error - redirects to generate-gemini

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Check authentication first
    const { getServerSession } = await import('next-auth/next');
    const { authOptions } = await import('@/lib/auth');
    const { checkMessageSafety, logInappropriateContentAttempt } = await import('@/lib/safety-middleware');
    const { classifyContentWithAI } = await import('@/lib/ai-content-classifier');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for inappropriate content using AI classification
    const { topic } = body;
    if (topic) {
      console.log('Starting AI content classification in AI SDK route', { topic });
      const aiClassification = await classifyContentWithAI(topic);
      
      if (aiClassification.isInappropriate && aiClassification.confidence > 0.6) {
        console.warn('Inappropriate topic detected by AI in AI SDK route', { 
          topic, 
          categories: aiClassification.categories,
          confidence: aiClassification.confidence,
          reasoning: aiClassification.reasoning,
          userId: session.user.id 
        });
        
        // Log the attempt for monitoring
        logInappropriateContentAttempt(session.user.id, topic, aiClassification.categories);
        
        return NextResponse.json({ 
          error: 'Tópico inadequado detectado',
          message: aiClassification.suggestedResponse,
          categories: aiClassification.categories,
          confidence: aiClassification.confidence,
          reasoning: aiClassification.reasoning,
          educationalAlternative: aiClassification.educationalAlternative
        }, { status: 400 });
      }
      
      console.log('Content approved by AI classification in AI SDK route', { 
        topic, 
        confidence: aiClassification.confidence,
        reasoning: aiClassification.reasoning 
      });
    }
    
    // MUDANÇA CRÍTICA: Usar Gemini primeiro (mais confiável que Grok atualmente)
    // Grok estava tendo timeout consistente (90s+), Gemini funciona bem
    let response;
    let usedProvider = 'gemini';
    
    console.log('🚀 Using Gemini as primary provider (most reliable)...');
    
    try {
      response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/aulas/generate-gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '',
        },
        body: JSON.stringify(body),
      });
      
      if (response.ok) {
        console.log('✅ Gemini generation successful!');
        usedProvider = 'gemini';
      } else {
        throw new Error('Gemini failed');
      }
    } catch (geminiError) {
      console.log('❌ Gemini failed:', (geminiError as Error).message);
      
      // Fallback to Grok only if Gemini fails
      if (process.env.GROK_API_KEY) {
        console.log('🔄 Falling back to Grok improved...');
        
        try {
          response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/aulas/generate-grok-improved`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': request.headers.get('cookie') || '',
            },
            body: JSON.stringify(body),
          });
          
          if (response.ok) {
            console.log('✅ Grok improved generation successful!');
            usedProvider = 'grok-improved';
          } else {
            throw new Error('Grok improved failed');
          }
        } catch (grokImprovedError) {
          console.log('❌ Grok improved failed:', (grokImprovedError as Error).message);
          console.log('🔄 Trying original Grok as last resort...');
          
          response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/aulas/generate-grok`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': request.headers.get('cookie') || '',
            },
            body: JSON.stringify(body),
          });
          
          if (response.ok) {
            console.log('✅ Original Grok generation successful!');
            usedProvider = 'grok';
          } else {
            throw new Error('All providers failed');
          }
        }
      } else {
        throw new Error('Gemini failed and no Grok API key available');
      }
    }

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ 
        error: errorData.error || 'Erro ao gerar aula',
        success: false 
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Add provider information to the response
    const enhancedData = {
      ...data,
      provider: usedProvider,
      generationTime: Math.round((Date.now() - Date.now()) / 1000), // This will be calculated properly in the actual routes
    };
    
    console.log(`🎉 Lesson generated successfully using ${usedProvider.toUpperCase()}!`);
    return NextResponse.json(enhancedData);

  } catch (error) {
    console.error('Error in generate-ai-sdk route:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      success: false 
    }, { status: 500 });
  }
}