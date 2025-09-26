import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();

    if (!urls || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs are required' },
        { status: 400 }
      );
    }

    // Create a prompt to generate initial suggestions based on the URLs
    const urlContext = urls.map((url: string) => `URL: ${url}`).join('\n');
    
    const prompt = `Based on the following documentation URLs, generate 4 helpful question suggestions that a user might ask:

${urlContext}

Please respond with a JSON object containing an array of suggestions:
{
  "suggestions": [
    "Question 1",
    "Question 2", 
    "Question 3",
    "Question 4"
  ]
}

Make the questions specific, helpful, and relevant to the documentation content.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the JSON response
    try {
      let jsonStr = text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      
      const parsed = JSON.parse(jsonStr);
      return NextResponse.json(parsed);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return NextResponse.json({
        suggestions: [
          "What is this documentation about?",
          "How do I get started?",
          "What are the main features?",
          "How do I configure this?"
        ]
      });
    }

  } catch (error) {
    console.error('Error in chat-docs suggestions API:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
