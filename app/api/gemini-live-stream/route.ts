import { GoogleGenAI, LiveServerMessage, MediaResolution, Modality } from '@google/genai';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Função para converter PCM para WAV
function convertPCMToWAV(pcmData: string, mimeType: string): string {
  try {
    // Parsear parâmetros do MIME type
    const params = mimeType.split(';').map(s => s.trim());
    let sampleRate = 16000;
    let channels = 1;
    let bitsPerSample = 16;
    
    for (const param of params) {
      if (param.startsWith('rate=')) {
        sampleRate = parseInt(param.split('=')[1]);
      } else if (param.startsWith('channels=')) {
        channels = parseInt(param.split('=')[1]);
      } else if (param.includes('L')) {
        const bits = parseInt(param.match(/L(\d+)/)?.[1] || '16');
        bitsPerSample = bits;
      }
    }
    
    // Decodificar base64 PCM
    const pcmBytes = Buffer.from(pcmData, 'base64');
    
    // Criar header WAV
    const byteRate = sampleRate * channels * bitsPerSample / 8;
    const blockAlign = channels * bitsPerSample / 8;
    const dataLength = pcmBytes.length;
    const fileSize = 36 + dataLength;
    
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);                      // ChunkID
    header.writeUInt32LE(fileSize, 4);            // ChunkSize
    header.write('WAVE', 8);                      // Format
    header.write('fmt ', 12);                     // Subchunk1ID
    header.writeUInt32LE(16, 16);                 // Subchunk1Size (PCM)
    header.writeUInt16LE(1, 20);                  // AudioFormat (1 = PCM)
    header.writeUInt16LE(channels, 22);           // NumChannels
    header.writeUInt32LE(sampleRate, 24);         // SampleRate
    header.writeUInt32LE(byteRate, 28);           // ByteRate
    header.writeUInt16LE(blockAlign, 32);         // BlockAlign
    header.writeUInt16LE(bitsPerSample, 34);      // BitsPerSample
    header.write('data', 36);                     // Subchunk2ID
    header.writeUInt32LE(dataLength, 40);         // Subchunk2Size
    
    // Combinar header + dados PCM
    const wavBuffer = Buffer.concat([header, pcmBytes]);
    
    // Retornar como base64
    return wavBuffer.toString('base64');
    
  } catch (error) {
    console.error('Erro ao converter PCM para WAV:', error);
    return pcmData; // Retornar dados originais em caso de erro
  }
}

/**
 * API Route: Gemini Live Stream with Native Audio
 * 
 * Esta rota estabelece uma conexão de streaming com o Gemini Live API
 * para conversação em tempo real com áudio nativo.
 */
export async function POST(req: Request) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY || 
                       process.env.GEMINI_API_KEY || 
                       process.env.GOOGLE_GENERATIVE_AI_API_KEY;

        if (!apiKey) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'error', 
            message: 'API key não configurada' 
          })}\n\n`));
          controller.close();
          return;
        }

        const { audioData, mimeType } = await req.json();

        if (!audioData) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'error', 
            message: 'Dados de áudio não fornecidos' 
          })}\n\n`));
          controller.close();
          return;
        }

        console.log('🎤 [LIVE-STREAM] Iniciando sessão Gemini Live...');

        const ai = new GoogleGenAI({
          apiKey: apiKey,
        });

        const model = 'models/gemini-2.5-flash-native-audio-preview-09-2025';

        const config = {
          responseModalities: [Modality.AUDIO],
          mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Zephyr',
              }
            }
          },
          contextWindowCompression: {
            triggerTokens: '25600',
            slidingWindow: { targetTokens: '12800' },
          },
        };

        const responseQueue: LiveServerMessage[] = [];

        const session = await ai.live.connect({
          model,
          callbacks: {
            onopen: function () {
              console.log('✅ [LIVE-STREAM] Conexão aberta');
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'connected' 
              })}\n\n`));
            },
            onmessage: function (message: LiveServerMessage) {
              responseQueue.push(message);
              
              // Processar mensagem imediatamente
              if (message.serverContent?.modelTurn?.parts) {
                const part = message.serverContent.modelTurn.parts[0];
                
                if (part?.text) {
                  console.log('💬 [LIVE-STREAM] Texto:', part.text);
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                    type: 'text', 
                    content: part.text 
                  })}\n\n`));
                }
                
                if (part?.inlineData) {
                  console.log('🔊 [LIVE-STREAM] Áudio recebido:', part.inlineData.mimeType);
                  
                  // Converter para WAV se necessário
                  let audioData = part.inlineData.data;
                  let mimeType = part.inlineData.mimeType || 'audio/wav';
                  
                  // Se for PCM, converter para WAV
                  if (mimeType.includes('pcm')) {
                    console.log('🔄 [LIVE-STREAM] Convertendo PCM para WAV');
                    audioData = convertPCMToWAV(audioData, mimeType);
                    mimeType = 'audio/wav';
                  }
                  
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                    type: 'audio', 
                    data: audioData,
                    mimeType: mimeType
                  })}\n\n`));
                }
              }
              
              if (message.serverContent?.turnComplete) {
                console.log('✅ [LIVE-STREAM] Turno completo');
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'turn_complete' 
                })}\n\n`));
              }
            },
            onerror: function (e: ErrorEvent) {
              console.error('❌ [LIVE-STREAM] Erro:', e.message);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'error', 
                message: e.message 
              })}\n\n`));
            },
            onclose: function (e: CloseEvent) {
              console.log('🔌 [LIVE-STREAM] Conexão fechada:', e.reason);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'closed' 
              })}\n\n`));
              controller.close();
            },
          },
          config
        });

        // Enviar áudio para o modelo
        console.log('📤 [LIVE-STREAM] Enviando áudio...');
        session.sendClientContent({
          turns: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType || 'audio/pcm',
                    data: audioData
                  }
                }
              ]
            }
          ]
        });

        // Aguardar resposta completa
        let turnComplete = false;
        while (!turnComplete) {
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const message = responseQueue.shift();
          if (message?.serverContent?.turnComplete) {
            turnComplete = true;
          }
        }

        // Fechar sessão
        session.close();

      } catch (error: any) {
        console.error('❌ [LIVE-STREAM] Erro fatal:', error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'error', 
          message: error.message 
        })}\n\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'gemini-live-stream',
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
  });
}

