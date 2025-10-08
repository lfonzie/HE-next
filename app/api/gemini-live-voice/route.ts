import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import textToSpeech from '@google-cloud/text-to-speech';

export const dynamic = 'force-dynamic';

/**
 * API Route: Gemini Live Voice
 * 
 * Processa áudio do usuário e retorna resposta em texto e áudio
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Arquivo de áudio é obrigatório' },
        { status: 400 }
      );
    }

    // Get API key
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || 
                   process.env.GEMINI_API_KEY || 
                   process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave da API Gemini não configurada' },
        { status: 500 }
      );
    }

    console.log('🎤 [LIVE-VOICE] Processando áudio:', audioFile.size, 'bytes');

    // Convert audio to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Step 1: Transcrever áudio com Gemini
    console.log('🔄 [LIVE-VOICE] Transcrevendo áudio...');
    const transcriptionModel = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash' 
    });

    const transcriptionResult = await transcriptionModel.generateContent([
      {
        inlineData: {
          mimeType: audioFile.type || 'audio/webm',
          data: base64Audio
        }
      },
      'Transcreva este áudio em português brasileiro. Retorne apenas a transcrição, sem comentários adicionais.'
    ]);

    const transcription = transcriptionResult.response.text().trim();
    console.log('📝 [LIVE-VOICE] Transcrição:', transcription);

    if (!transcription) {
      return NextResponse.json(
        { error: 'Não foi possível transcrever o áudio' },
        { status: 500 }
      );
    }

    // Step 2: Gerar resposta inteligente
    console.log('🤖 [LIVE-VOICE] Gerando resposta...');
    const responseModel = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2048,
      },
    });

    const prompt = `Você é um assistente de voz amigável e conversacional. 
O usuário disse: "${transcription}"

Responda de forma natural, conversacional e concisa (máximo 3-4 frases). 
Se for uma pergunta, responda diretamente. 
Se for uma saudação, responda de forma amigável.
Seja útil e empático.`;

    const responseResult = await responseModel.generateContent(prompt);
    const textResponse = responseResult.response.text();
    console.log('✅ [LIVE-VOICE] Resposta gerada:', textResponse.substring(0, 100));

    // Step 3: Gerar áudio da resposta
    console.log('🔊 [LIVE-VOICE] Gerando áudio da resposta...');
    let audioBase64: string | null = null;

    try {
      const ttsClient = new textToSpeech.TextToSpeechClient({
        apiKey: apiKey,
      });

      const [ttsResponse] = await ttsClient.synthesizeSpeech({
        input: { text: textResponse },
        voice: {
          languageCode: 'pt-BR',
          name: 'pt-BR-Neural2-A',
          ssmlGender: 'FEMALE' as const,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.1,
          pitch: 0,
        },
      });

      if (ttsResponse.audioContent) {
        audioBase64 = Buffer.from(ttsResponse.audioContent as Uint8Array).toString('base64');
        console.log('🎵 [LIVE-VOICE] Áudio gerado com sucesso');
      }
    } catch (ttsError: any) {
      console.error('⚠️ [LIVE-VOICE] Erro ao gerar áudio:', ttsError.message);
      // Continuar sem áudio
    }

    return NextResponse.json({
      transcription,
      text: textResponse,
      audio: audioBase64,
      audioFormat: 'audio/mp3',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ [LIVE-VOICE] Erro:', error);
    
    return NextResponse.json(
      {
        error: 'Erro ao processar áudio',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'gemini-live-voice',
    version: '1.0.0',
  });
}

