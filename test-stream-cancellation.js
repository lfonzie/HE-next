/**
 * Script para diagnosticar cancelamento prematuro do stream
 */

const testText = "Olá! Este é um teste para diagnosticar o cancelamento do stream.";

async function testStreamCancellation() {
  console.log('🔍 [CANCELLATION-TEST] Iniciando teste de cancelamento...');
  console.log('📝 [CANCELLATION-TEST] Texto:', testText);

  try {
    // Teste 1: Verificar se o stream é cancelado prematuramente
    console.log('\n🔍 [CANCELLATION-TEST] Teste 1: Monitorando stream...');
    
    const controller = new AbortController();
    let chunkCount = 0;
    let totalBytes = 0;
    let startTime = Date.now();
    
    const response = await fetch('/api/tts/gemini-native', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain'
      },
      body: JSON.stringify({
        text: testText,
        voice: 'Zephyr',
        speed: 1.0,
        pitch: 0.0
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      console.error('❌ [CANCELLATION-TEST] Erro na resposta:', response.status);
      return false;
    }

    if (!response.body) {
      console.error('❌ [CANCELLATION-TEST] Sem corpo de resposta');
      return false;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const audioChunks = [];

    console.log('📡 [CANCELLATION-TEST] Iniciando leitura do stream...');

    while (true) {
      // Verifica se foi cancelado
      if (controller.signal.aborted) {
        console.log('🚫 [CANCELLATION-TEST] Stream cancelado pelo AbortController');
        break;
      }

      const { value, done } = await reader.read();
      
      if (done) {
        console.log('✅ [CANCELLATION-TEST] Stream terminou naturalmente');
        break;
      }

      if (value) {
        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'audio' && data.data) {
                chunkCount++;
                const binaryString = atob(data.data);
                const audioData = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  audioData[i] = binaryString.charCodeAt(i);
                }
                
                audioChunks.push(audioData);
                totalBytes += audioData.length;
                
                const elapsed = Date.now() - startTime;
                console.log(`🎵 [CANCELLATION-TEST] Chunk ${chunkCount}: ${audioData.length} bytes (total: ${totalBytes}) - ${elapsed}ms`);
                
                // Simula cancelamento após 3 chunks para testar
                if (chunkCount >= 3) {
                  console.log('🚫 [CANCELLATION-TEST] Simulando cancelamento após 3 chunks...');
                  controller.abort();
                  break;
                }
              } else if (data.type === 'done') {
                console.log('✅ [CANCELLATION-TEST] Stream completo!');
                break;
              } else if (data.type === 'error') {
                console.error('❌ [CANCELLATION-TEST] Erro no stream:', data.content);
                return false;
              }
            } catch (e) {
              console.warn('⚠️ [CANCELLATION-TEST] Erro ao processar SSE:', e);
            }
          }
        }
      }
    }

    console.log(`📊 [CANCELLATION-TEST] Resultado: ${chunkCount} chunks, ${totalBytes} bytes`);
    
    if (chunkCount > 0) {
      console.log('✅ [CANCELLATION-TEST] Stream funcionou, mas foi cancelado prematuramente');
      return true;
    } else {
      console.log('❌ [CANCELLATION-TEST] Nenhum chunk recebido');
      return false;
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('🚫 [CANCELLATION-TEST] Stream cancelado (esperado)');
      return true;
    } else {
      console.error('❌ [CANCELLATION-TEST] Erro inesperado:', error);
      return false;
    }
  }
}

async function testWithoutCancellation() {
  console.log('\n🔍 [CANCELLATION-TEST] Teste 2: Stream sem cancelamento...');
  
  try {
    const response = await fetch('/api/tts/gemini-native', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain'
      },
      body: JSON.stringify({
        text: testText,
        voice: 'Zephyr',
        speed: 1.0,
        pitch: 0.0
      })
    });

    if (!response.ok) {
      console.error('❌ [CANCELLATION-TEST] Erro na resposta:', response.status);
      return false;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let chunkCount = 0;
    let totalBytes = 0;
    let startTime = Date.now();

    while (true) {
      const { value, done } = await reader.read();
      
      if (done) {
        console.log('✅ [CANCELLATION-TEST] Stream terminou naturalmente');
        break;
      }

      if (value) {
        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'audio' && data.data) {
                chunkCount++;
                const binaryString = atob(data.data);
                const audioData = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  audioData[i] = binaryString.charCodeAt(i);
                }
                
                totalBytes += audioData.length;
                
                const elapsed = Date.now() - startTime;
                console.log(`🎵 [CANCELLATION-TEST] Chunk ${chunkCount}: ${audioData.length} bytes (total: ${totalBytes}) - ${elapsed}ms`);
              } else if (data.type === 'done') {
                console.log('✅ [CANCELLATION-TEST] Stream completo!');
                break;
              }
            } catch (e) {
              console.warn('⚠️ [CANCELLATION-TEST] Erro ao processar SSE:', e);
            }
          }
        }
      }
    }

    console.log(`📊 [CANCELLATION-TEST] Resultado: ${chunkCount} chunks, ${totalBytes} bytes`);
    return chunkCount > 0;

  } catch (error) {
    console.error('❌ [CANCELLATION-TEST] Erro:', error);
    return false;
  }
}

async function runCancellationTests() {
  console.log('🚀 [CANCELLATION-TEST] Iniciando testes de cancelamento...\n');
  
  const test1 = await testStreamCancellation();
  const test2 = await testWithoutCancellation();
  
  console.log('\n📋 [CANCELLATION-TEST] Resultados:');
  console.log(`✅ Teste 1 (Com cancelamento): ${test1 ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Teste 2 (Sem cancelamento): ${test2 ? 'PASSOU' : 'FALHOU'}`);
  
  if (test1 && test2) {
    console.log('\n🎉 [CANCELLATION-TEST] Stream funciona, mas está sendo cancelado prematuramente!');
    console.log('💡 [CANCELLATION-TEST] Verifique se o AbortController está sendo chamado muito cedo.');
  } else if (test2) {
    console.log('\n⚠️ [CANCELLATION-TEST] Stream funciona sem cancelamento, mas falha com cancelamento.');
    console.log('💡 [CANCELLATION-TEST] O problema é o cancelamento prematuro.');
  } else {
    console.log('\n❌ [CANCELLATION-TEST] Stream não está funcionando corretamente.');
  }
}

// Executar testes se chamado diretamente
if (typeof window !== 'undefined') {
  // Browser
  window.testStreamCancellation = runCancellationTests;
  console.log('🧪 [CANCELLATION-TEST] Testes disponíveis em window.testStreamCancellation()');
} else {
  // Node.js
  runCancellationTests().catch(console.error);
}
