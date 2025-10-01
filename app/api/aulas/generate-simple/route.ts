import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { topic, mode = 'sync' } = await request.json();
    
    // Check authentication
    const { getServerSession } = await import('next-auth/next');
    const { authOptions } = await import('@/lib/auth');
    const { checkMessageSafety, logInappropriateContentAttempt } = await import('@/lib/safety-middleware');
    const { classifyContentWithAI } = await import('@/lib/ai-content-classifier');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for inappropriate content using AI classification
    console.log('Starting AI content classification in simple route', { topic });
    const aiClassification = await classifyContentWithAI(topic);
    
    if (aiClassification.isInappropriate && aiClassification.confidence > 0.6) {
      console.warn('Inappropriate topic detected by AI in simple route', { 
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
    
    console.log('Content approved by AI classification in simple route', { 
      topic, 
      confidence: aiClassification.confidence,
      reasoning: aiClassification.reasoning 
    });
    
    console.log('🚀 Lesson generation started for:', topic);
    
    // Simple prompt for testing
    const simplePrompt = `Create a simple educational lesson about "${topic}" in Portuguese. 
    Include:
    1. Introduction
    2. Main concepts
    3. Examples
    4. Conclusion
    
    Keep it educational and clear.`;
    
    let response: any = null;
    let usedProvider = 'unknown';
    
    // Try OpenAI first
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('🤖 Trying OpenAI...');
        const model = openai('gpt-4o-mini');
        
        response = await generateText({
          model: model,
          prompt: simplePrompt,
          temperature: 0.7,
          maxTokens: 1000, // Reduced for faster response
        });
        
        usedProvider = 'openai';
        console.log('✅ OpenAI success');
        
      } catch (openaiError) {
        console.log('❌ OpenAI failed:', (openaiError as Error).message);
      }
    }
    
    // Try Google if OpenAI failed
    if (!response && (process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY)) {
      try {
        console.log('🤖 Trying Google...');
        const model = google('gemini-2.0-flash-exp');
        
        response = await generateText({
          model: model,
          prompt: simplePrompt,
          temperature: 0.7,
          maxTokens: 1000, // Reduced for faster response
        });
        
        usedProvider = 'google';
        console.log('✅ Google success');
        
      } catch (googleError) {
        console.log('❌ Google failed:', (googleError as Error).message);
      }
    }
    
    if (!response) {
      throw new Error('Both providers failed');
    }
    
    console.log('🎉 Lesson generated successfully with:', usedProvider);
    
    return NextResponse.json({
      success: true,
      topic,
      mode,
      provider: usedProvider,
      lesson: {
        title: `Aula sobre ${topic}`,
        content: response.text,
        metadata: {
          provider: usedProvider,
          tokens: response.usage?.totalTokens || 0,
          model: usedProvider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.0-flash-exp'
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Lesson generation failed:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
