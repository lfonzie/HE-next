#!/usr/bin/env node

import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testGeminiNativeAudio() {
  console.log('🎤 Testando Gemini 2.5 Native Audio...\n');

  try {
    const response = await fetch('http://localhost:3000/api/tts/gemini-native', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Olá! Este é um teste do Gemini 2.5 Native Audio para o sistema de aulas.',
        voice: 'Zephyr'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ Conexão estabelecida, processando stream...');

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const audioChunks = [];
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'audio' && data.data) {
              console.log('🎵 Chunk de áudio recebido');
              // Convert base64 to Uint8Array
              const audioData = Uint8Array.from(atob(data.data), c => c.charCodeAt(0));
              audioChunks.push(audioData);
            } else if (data.type === 'done') {
              console.log('✅ Stream completo');
              break;
            } else if (data.type === 'error') {
              throw new Error(data.content || 'Streaming error');
            }
          } catch (e) {
            console.warn('Erro ao processar linha:', e.message);
          }
        }
      }
    }

    if (audioChunks.length === 0) {
      throw new Error('Nenhum dado de áudio recebido');
    }

    // Combine all audio chunks
    const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const combinedAudio = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of audioChunks) {
      combinedAudio.set(chunk, offset);
      offset += chunk.length;
    }

    console.log(`✅ Áudio gerado: ${totalLength} bytes`);
    console.log(`📊 Chunks recebidos: ${audioChunks.length}`);
    
    // Save to file
    const fs = await import('fs');
    fs.writeFileSync('test-gemini-native-audio.wav', combinedAudio);
    
    console.log('💾 Arquivo salvo: test-gemini-native-audio.wav');
    
    // Check file
    const stats = fs.statSync('test-gemini-native-audio.wav');
    console.log(`📁 Tamanho do arquivo: ${stats.size} bytes`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testGeminiNativeAudio();