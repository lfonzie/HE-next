import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        error: 'Gemini API key not configured'
      }, { status: 500 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    console.log(`🎤 [LIVE-AUDIO-SERVER] Processing audio file: ${audioFile.name} (${audioFile.size} bytes)`);

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    let mimeType = audioFile.type;
    if (!mimeType || mimeType === '') {
      const fileName = audioFile.name.toLowerCase();
      if (fileName.includes('.webm')) mimeType = 'audio/webm';
      else if (fileName.includes('.mp3')) mimeType = 'audio/mpeg';
      else if (fileName.includes('.wav')) mimeType = 'audio/wav';
      else if (fileName.includes('.ogg')) mimeType = 'audio/ogg';
      else mimeType = 'audio/webm';
    }

    console.log(`🔗 [LIVE-AUDIO-SERVER] Transcribing audio with Gemini 2.5... (${mimeType})`);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Audio
        }
      },
      'Transcreva este áudio em português brasileiro. Seja preciso e mantenha a formatação natural da fala.'
    ]);

    const response = await result.response;
    const transcriptionText = response.text();

    if (!transcriptionText || transcriptionText.trim() === '') {
      console.log('⚠️ [LIVE-AUDIO-SERVER] Empty transcription received from Gemini');
      return NextResponse.json({
        error: 'Falha na transcrição do áudio - resposta vazia',
        details: 'O áudio pode estar muito curto ou com qualidade insuficiente'
      }, { status: 500 });
    }

    console.log(`✅ [LIVE-AUDIO-SERVER] Audio transcribed successfully with Gemini 2.5 (${transcriptionText.length} chars)`);

    return NextResponse.json({
      success: true,
      transcription: transcriptionText,
      audioInfo: {
        name: audioFile.name,
        size: audioFile.size,
        type: audioFile.type
      },
      timestamp: new Date().toISOString(),
      aiProvider: 'gemini-2.5-flash'
    });

  } catch (error: any) {
    console.error('❌ [LIVE-AUDIO-SERVER] Processing error:', error);
    return NextResponse.json({
      error: 'Failed to process audio',
      details: error.message
    }, { status: 500 });
  }
}
