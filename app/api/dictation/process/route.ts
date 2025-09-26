import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const action = formData.get('action') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    if (action === 'transcribe') {
      // Transcription
      const contents = [
        { text: 'Generate a complete, detailed transcript of this audio.' },
        { 
          inlineData: { 
            mimeType: audioFile.type, 
            data: base64Audio 
          } 
        },
      ];

      const result = await model.generateContent(contents);
      const response = await result.response;
      const transcriptionText = response.text();

      return NextResponse.json({
        transcription: transcriptionText
      });

    } else if (action === 'polish') {
      // Polish transcription
      const rawTranscription = formData.get('rawTranscription') as string;
      
      if (!rawTranscription) {
        return NextResponse.json(
          { error: 'Raw transcription is required for polishing' },
          { status: 400 }
        );
      }

      const prompt = `Take this raw transcription and create a polished, well-formatted note.
                    Remove filler words (um, uh, like), repetitions, and false starts.
                    Format any lists or bullet points properly. Use markdown formatting for headings, lists, etc.
                    Maintain all the original content and meaning.

                    Raw transcription:
                    ${rawTranscription}`;

      const contents = [{ text: prompt }];
      const result = await model.generateContent(contents);
      const response = await result.response;
      const polishedText = response.text();

      return NextResponse.json({
        polishedNote: polishedText
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "transcribe" or "polish"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in dictation API:', error);
    return NextResponse.json(
      { error: 'Failed to process audio' },
      { status: 500 }
    );
  }
}
