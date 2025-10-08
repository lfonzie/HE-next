import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import textToSpeech from '@google-cloud/text-to-speech';

export const dynamic = 'force-dynamic';

/**
 * API Route: Gemini Audio Generation
 * 
 * This endpoint uses Google Gemini 2.5 Flash to generate text responses
 * and Google Cloud Text-to-Speech to generate audio output.
 * 
 * @route POST /api/gemini-audio
 * @body {prompt: string, voice?: string} - The text prompt and optional voice selection
 * @returns {text: string, audio: string, audioFormat: string}
 */
export async function POST(req: NextRequest) {
  try {
    const { prompt, voice = 'pt-BR-Standard-A' } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || 
                   process.env.GEMINI_API_KEY || 
                   process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please set GEMINI_API_KEY in your environment variables.' },
        { status: 500 }
      );
    }

    console.log('🤖 [GEMINI-AUDIO] Generating response for prompt:', prompt.substring(0, 100));

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);

    // Use Gemini 2.5 Flash for text generation
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    // Generate text content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const textResponse = response.text();

    console.log('✅ [GEMINI-AUDIO] Text generated:', textResponse.substring(0, 100));

    // Generate audio using Google Cloud TTS
    let audioBase64: string | null = null;

    try {
      // Initialize Google Cloud TTS client
      const client = new textToSpeech.TextToSpeechClient({
        apiKey: apiKey, // Using the same Gemini API key
      });

      // Construct the request
      const [ttsResponse] = await client.synthesizeSpeech({
        input: { text: textResponse },
        voice: {
          languageCode: 'pt-BR',
          name: voice,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0,
        },
      });

      if (ttsResponse.audioContent) {
        // Convert audio content to base64
        audioBase64 = Buffer.from(ttsResponse.audioContent as Uint8Array).toString('base64');
        console.log('🔊 [GEMINI-AUDIO] Audio generated successfully');
      }
    } catch (ttsError: any) {
      console.error('⚠️ [GEMINI-AUDIO] TTS Error:', ttsError.message);
      // Continue without audio if TTS fails
    }

    // Return response
    return NextResponse.json({
      text: textResponse,
      audio: audioBase64,
      audioFormat: audioBase64 ? 'audio/mp3' : null,
      voice: voice,
      timestamp: new Date().toISOString(),
      aiProvider: 'gemini-2.5-flash',
    });

  } catch (error: any) {
    console.error('❌ [GEMINI-AUDIO] Error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate response',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'gemini-audio',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}

