import dotenv from 'dotenv';
import { Buffer } from 'buffer';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const API_URL = 'http://localhost:3000/api/tts/gemini-native';
const TEST_TEXT = "Teste rápido para debug do frontend.";

async function testFrontendDebug() {
    console.log('🔍 Testando debug do frontend...');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: TEST_TEXT,
                voice: 'Zephyr',
                speed: 1.0,
                pitch: 0.0
            }),
        });

        console.log('✅ Resposta recebida');
        console.log(`📡 Status: ${response.status}`);
        console.log(`📡 Content-Type: ${response.headers.get('content-type')}`);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Erro na API:', response.status, errorData);
            return;
        }

        const reader = response.body.getReader();
        const audioChunks = [];
        let chunkCount = 0;
        let detectedMimeType = null;
        let totalLines = 0;

        console.log('🔄 Iniciando leitura do stream...');

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                console.log('✅ Stream reading complete');
                break;
            }

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n');
            totalLines += lines.length;

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        console.log(`📨 [${chunkCount + 1}] Data type: ${data.type}`);
                        
                        if (data.type === 'audio' && data.data) {
                            chunkCount++;
                            console.log(`🎵 [${chunkCount}] Audio chunk received: ${data.data.length} chars`);
                            
                            if (chunkCount === 1 && data.mimeType) {
                                detectedMimeType = data.mimeType;
                                console.log(`🎵 [${chunkCount}] MIME type: ${detectedMimeType}`);
                            }
                            
                            // Teste de decodificação base64
                            try {
                                const binaryString = atob(data.data);
                                const audioData = new Uint8Array(binaryString.length);
                                for (let i = 0; i < binaryString.length; i++) {
                                    audioData[i] = binaryString.charCodeAt(i);
                                }
                                audioChunks.push(audioData);
                                console.log(`✅ [${chunkCount}] Chunk added to array, total chunks: ${audioChunks.length}`);
                            } catch (e) {
                                console.error(`❌ [${chunkCount}] Error decoding base64:`, e);
                            }
                        } else if (data.type === 'done') {
                            console.log('✅ [DONE] Streaming complete signal received');
                            break;
                        } else if (data.type === 'error') {
                            console.error('❌ [ERROR] Stream error:', data.content);
                            throw new Error(data.content || 'Streaming error');
                        } else {
                            console.log(`📨 [${chunkCount + 1}] Unknown data type: ${data.type}`);
                        }
                    } catch (e) {
                        console.warn(`❌ [${chunkCount + 1}] Failed to parse SSE data:`, e);
                        console.warn(`❌ [${chunkCount + 1}] Raw line:`, line);
                    }
                } else if (line.trim()) {
                    console.log(`📨 [${chunkCount + 1}] Non-data line: ${line}`);
                }
            }
        }

        console.log(`\n📊 Resumo:`);
        console.log(`📨 Total lines processed: ${totalLines}`);
        console.log(`🎵 Total chunks received: ${chunkCount}`);
        console.log(`🎵 Audio chunks array length: ${audioChunks.length}`);
        console.log(`🎵 MIME type: ${detectedMimeType}`);

        if (audioChunks.length === 0) {
            console.error('❌ Nenhum chunk de áudio recebido!');
            return;
        }

        const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
        console.log(`🔗 Total audio bytes: ${totalLength}`);

        const combinedAudio = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of audioChunks) {
            combinedAudio.set(chunk, offset);
            offset += chunk.length;
        }

        // Salvar arquivo para teste
        fs.writeFileSync('test-frontend-debug.bin', combinedAudio);
        console.log(`💾 Áudio salvo: test-frontend-debug.bin (${combinedAudio.length} bytes)`);

        // Verificar se é PCM
        if (detectedMimeType && detectedMimeType.includes('pcm')) {
            console.log('🔄 Convertendo PCM para WAV...');
            
            // Função convertPCMToWAV (copiada do componente)
            const convertPCMToWAV = (pcmData, sampleRate, channels, bitsPerSample) => {
                const length = pcmData.length;
                const arrayBuffer = new ArrayBuffer(44 + length);
                const view = new DataView(arrayBuffer);
                
                const writeString = (offset, string) => {
                    for (let i = 0; i < string.length; i++) {
                        view.setUint8(offset + i, string.charCodeAt(i));
                    }
                };
                
                writeString(0, 'RIFF');
                view.setUint32(4, 36 + length, true);
                writeString(8, 'WAVE');
                writeString(12, 'fmt ');
                view.setUint32(16, 16, true);
                view.setUint16(20, 1, true); // PCM format
                view.setUint16(22, channels, true);
                view.setUint32(24, sampleRate, true);
                view.setUint32(28, sampleRate * channels * bitsPerSample / 8, true);
                view.setUint16(32, channels * bitsPerSample / 8, true);
                view.setUint16(34, bitsPerSample, true);
                writeString(36, 'data');
                view.setUint32(40, length, true);
                
                const wavData = new Uint8Array(arrayBuffer);
                wavData.set(pcmData, 44);
                
                return wavData;
            };

            const wavData = convertPCMToWAV(combinedAudio, 24000, 1, 16);
            fs.writeFileSync('test-frontend-debug.wav', wavData);
            console.log(`💾 WAV convertido salvo: test-frontend-debug.wav (${wavData.length} bytes)`);

            // Verificar WAV header
            const fileBuffer = fs.readFileSync('test-frontend-debug.wav');
            const riffHeader = fileBuffer.toString('ascii', 0, 4);
            const waveHeader = fileBuffer.toString('ascii', 8, 12);
            console.log(`🔍 Header RIFF: "${riffHeader}"`);
            console.log(`🔍 Header WAVE: "${waveHeader}"`);

            if (riffHeader === 'RIFF' && waveHeader === 'WAVE') {
                console.log('✅ Arquivo WAV válido criado!');
            } else {
                console.error('❌ Arquivo WAV inválido!');
            }
        }

        console.log('\n✅ Teste de debug do frontend concluído!');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

testFrontendDebug();
