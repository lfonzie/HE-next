import { NextRequest, NextResponse } from 'next/server';
import { callGrok } from '@/lib/providers/grok';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;

    if (action === 'transcribe') {
      // Para transcrição de áudio, Grok não suporta diretamente
      return NextResponse.json({
        error: 'Grok 4 Fast não suporta transcrição de áudio diretamente',
        suggestion: 'Use uma API de transcrição externa (como Whisper) primeiro',
        alternative: 'Para transcrição, use o endpoint /api/dictation/transcribe'
      }, { status: 400 });

    } else if (action === 'polish') {
      // Polish transcription usando Grok 4 Fast
      const rawTranscription = formData.get('rawTranscription') as string;
      
      if (!rawTranscription) {
        return NextResponse.json(
          { error: 'Raw transcription is required for polishing' },
          { status: 400 }
        );
      }

      const prompt = `Pegue esta transcrição bruta e crie uma nota polida e bem formatada.
                    Remova palavras de preenchimento (um, uh, tipo), repetições e falsos começos.
                    Formate listas ou pontos de bala adequadamente. Use formatação markdown para cabeçalhos, listas, etc.
                    Mantenha todo o conteúdo e significado originais.

                    Transcrição bruta:
                    ${rawTranscription}`;

      try {
        const result = await callGrok(
          'grok-4-fast-reasoning',
          [],
          prompt,
          'Você é um especialista em formatação e polimento de texto em português brasileiro.'
        );

        return NextResponse.json({
          polishedNote: result.text,
          model: 'grok-4-fast-reasoning'
        });

      } catch (error) {
        console.error('❌ [DICTATION] Error polishing with Grok:', error);
        return NextResponse.json(
          { error: 'Failed to polish transcription with Grok' },
          { status: 500 }
        );
      }

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "transcribe" or "polish"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in dictation API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}