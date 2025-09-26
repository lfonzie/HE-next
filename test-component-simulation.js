import dotenv from 'dotenv';
import { Buffer } from 'buffer';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const API_URL = 'http://localhost:3000/api/tts/gemini-native';
const TEST_TEXT = "Teste rápido para simular o componente.";

// Simular exatamente o que o componente React faz
async function simulateComponent() {
    console.log('🔍 Simulando componente React...');

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

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Erro na API:', response.status, errorData);
            return;
        }

        // Simular exatamente o que o componente faz
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('No response body');
        }

        console.log('🔄 Iniciando leitura do stream (simulando componente)...');
        const audioChunks = [];
        let chunkCount = 0;
        let detectedMimeType = null;

        while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
                console.log('✅ Stream reading complete');
                break;
            }

            // Parse SSE data (exatamente como no componente)
            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        console.log(`📨 [${chunkCount + 1}] Received data type: ${data.type}`);
                        
                        if (data.type === 'audio' && data.data) {
                            chunkCount++;
                            console.log(`🎵 [${chunkCount}] Audio chunk received: ${data.data.length} chars`);
                            
                            // Store mimeType from first chunk
                            if (chunkCount === 1 && data.mimeType) {
                                detectedMimeType = data.mimeType;
                                console.log(`🎵 [${chunkCount}] Detected MIME type: ${detectedMimeType}`);
                            }
                            
                            // Convert base64 to Uint8Array - fix for proper decoding
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

        console.log(`🎵 [GEMINI-NATIVE] Total chunks received: ${chunkCount}`);
        console.log(`🎵 [GEMINI-NATIVE] Audio chunks array length: ${audioChunks.length}`);

        if (audioChunks.length === 0) {
            console.error('❌ [GEMINI-NATIVE] No audio chunks received!');
            console.error('❌ [GEMINI-NATIVE] Chunk count:', chunkCount);
            console.error('❌ [GEMINI-NATIVE] Audio chunks:', audioChunks);
            throw new Error('No audio data received from Gemini Native Audio');
        }

        // Combine all audio chunks
        const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
        console.log(`🔗 [GEMINI-NATIVE] Combining ${audioChunks.length} chunks, total length: ${totalLength} bytes`);
        
        const combinedAudio = new Uint8Array(totalLength);
        let offset = 0;
        
        for (const chunk of audioChunks) {
            combinedAudio.set(chunk, offset);
            offset += chunk.length;
        }

        // Convert PCM to WAV if needed
        let finalAudioData = combinedAudio;
        let mimeType = detectedMimeType || 'audio/mpeg';
        
        if (detectedMimeType && detectedMimeType.includes('pcm')) {
            console.log('🔄 [GEMINI-NATIVE] Converting PCM to WAV...');
            
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

            finalAudioData = convertPCMToWAV(combinedAudio, 24000, 1, 16); // 24kHz, mono, 16-bit
            mimeType = 'audio/wav';
            console.log(`🎵 [GEMINI-NATIVE] PCM converted to WAV: ${finalAudioData.length} bytes`);
        }
        
        // Create blob and URL (simular)
        console.log(`🎵 [GEMINI-NATIVE] Created audio blob: ${finalAudioData.length} bytes, type: ${mimeType}`);

        // Salvar arquivo para teste
        fs.writeFileSync('test-component-simulation.wav', finalAudioData);
        console.log(`💾 Áudio salvo: test-component-simulation.wav (${finalAudioData.length} bytes)`);

        // Verificar WAV header
        const fileBuffer = fs.readFileSync('test-component-simulation.wav');
        const riffHeader = fileBuffer.toString('ascii', 0, 4);
        const waveHeader = fileBuffer.toString('ascii', 8, 12);
        console.log(`🔍 Header RIFF: "${riffHeader}"`);
        console.log(`🔍 Header WAVE: "${waveHeader}"`);

        if (riffHeader === 'RIFF' && waveHeader === 'WAVE') {
            console.log('✅ Arquivo WAV válido criado!');
        } else {
            console.error('❌ Arquivo WAV inválido!');
        }

        console.log('\n✅ Simulação do componente concluída com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante a simulação:', error);
    }
}

simulateComponent();
