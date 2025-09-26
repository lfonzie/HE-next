import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'pt-BR-Wavenet-A', language = 'pt-BR' } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Texto é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se temos a API key do Google Cloud
    const GOOGLE_CLOUD_API_KEY = process.env.GOOGLE_TTS_KEY || process.env.GOOGLE_CLOUD_API_KEY;
    if (!GOOGLE_CLOUD_API_KEY) {
      return NextResponse.json(
        { error: 'GOOGLE_TTS_KEY ou GOOGLE_CLOUD_API_KEY não configurada' },
        { status: 500 }
      );
    }

    // URL da API do Google Text-to-Speech
    const ttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_CLOUD_API_KEY}`;

    // Configuração da requisição para o Google TTS
    const requestBody = {
      input: { text },
      voice: {
        languageCode: language,
        name: voice,
        ssmlGender: 'NEUTRAL'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0,
        volumeGainDb: 0.0
      }
    };

    // Fazer requisição para o Google TTS
    const response = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro na API do Google TTS:', errorData);
      return NextResponse.json(
        { error: `Erro na API do Google TTS: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.audioContent) {
      return NextResponse.json(
        { error: 'Resposta inválida da API do Google TTS' },
        { status: 500 }
      );
    }

    // Converter base64 para Buffer
    const audioBuffer = Buffer.from(data.audioContent, 'base64');

    // Retornar o áudio como resposta
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
      },
    });

  } catch (error) {
    console.error('Erro no endpoint TTS Google:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

