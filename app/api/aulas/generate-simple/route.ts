import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { topic, mode = 'sync' } = await request.json();
    
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
        const model = google('gemini-1.5-flash');
        
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
          model: usedProvider === 'openai' ? 'gpt-4o-mini' : 'gemini-1.5-flash'
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
