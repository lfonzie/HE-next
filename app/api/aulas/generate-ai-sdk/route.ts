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
    
    // OTIMIZAÇÃO DE CUSTO: Usar Grok 4 Fast primeiro (mais rápido e econômico)
    // Grok 4 Fast Reasoning é mais barato que Gemini e tem boa performance
    let response;
    let usedProvider = 'grok';
    
    console.log('🚀 Using Grok 4 Fast as primary provider (faster and more cost-effective)...');
    
    // Try Grok first if API key is available
    if (process.env.GROK_API_KEY) {
      try {
        console.log('🔄 Attempting Grok improved generation...');
        response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/aulas/generate-grok-improved`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '',
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(120000), // 2 minutes timeout
        });
        
        if (response.ok) {
          console.log('✅ Grok 4 Fast generation successful!');
          usedProvider = 'grok-improved';
        } else {
          throw new Error('Grok improved failed');
        }
      } catch (grokError) {
        console.log('❌ Grok improved failed:', (grokError as Error).message);
        console.log('🔄 Trying original Grok implementation...');
        
        try {
          console.log('🔄 Attempting original Grok generation...');
          response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/aulas/generate-grok`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': request.headers.get('cookie') || '',
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(120000), // 2 minutes timeout
          });
          
          if (response.ok) {
            console.log('✅ Original Grok generation successful!');
            usedProvider = 'grok';
          } else {
            throw new Error('Grok failed');
          }
        } catch (originalGrokError) {
          console.log('❌ Original Grok failed:', (originalGrokError as Error).message);
          // Fallback to Gemini if all Grok attempts fail
          console.log('🔄 Falling back to Gemini...');
          
          response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/aulas/generate-gemini`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': request.headers.get('cookie') || '',
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(120000), // 2 minutes timeout
          });
          
          if (response.ok) {
            console.log('✅ Gemini generation successful (fallback)!');
            usedProvider = 'gemini';
          } else {
            throw new Error('All providers failed');
          }
        }
      }
    } else {
      // No Grok API key, use Gemini directly
      console.log('⚠️ No Grok API key found, using Gemini directly...');
      response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/aulas/generate-gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000), // 2 minutes timeout
      });
      
      if (response.ok) {
        console.log('✅ Gemini generation successful!');
        usedProvider = 'gemini';
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