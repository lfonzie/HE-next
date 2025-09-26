import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { query, urls } = await request.json();

    if (!query || !urls || urls.length === 0) {
      return NextResponse.json(
        { error: 'Query and URLs are required' },
        { status: 400 }
      );
    }

    // Create a prompt that includes the URLs as context
    const urlContext = urls.map((url: string) => `URL: ${url}`).join('\n');
    
    const prompt = `You are a helpful assistant that can answer questions based on documentation from the following URLs:

${urlContext}

Question: ${query}

Please provide a comprehensive answer based on the documentation from these URLs. If the information is not available in the provided URLs, please mention that and suggest where the user might find more information.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      text,
      urlContextMetadata: {
        urls: urls,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in chat-docs API:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
