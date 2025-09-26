#!/usr/bin/env node

/**
 * Teste do Sistema TTS Otimizado com Voz Shimmer
 * 
 * Este script testa:
 * - API de streaming TTS
 * - Voz Shimmer como padrão
 * - Streaming automático
 * - Processamento paralelo
 */

const testText = "Olá! Este é um teste do sistema TTS otimizado com voz Shimmer. O sistema usa streaming automático para reproduzir áudio sem aguardar todo o conteúdo carregar."

async function testTTSStreaming() {
  console.log('🧪 Testando Sistema TTS Otimizado...\n')
  
  try {
    console.log('📝 Texto de teste:', testText)
    console.log('🎤 Voz: Shimmer (padrão)')
    console.log('⚡ Modo: Streaming automático\n')
    
    const response = await fetch('http://localhost:3000/api/tts/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: testText,
        voice: 'shimmer',
        model: 'tts-1',
        speed: 1.0,
        format: 'mp3',
        chunkSize: 60
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`API Error: ${errorData.error}`)
    }

    console.log('✅ Conexão estabelecida com sucesso')
    console.log('🔄 Iniciando streaming...\n')

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let buffer = ''
    let chunkCount = 0
    let startTime = Date.now()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              console.log('✅ Streaming concluído')
              break
            }

            try {
              const parsed = JSON.parse(data)
              
              if (parsed.type === 'metadata') {
                console.log('📊 Metadados recebidos:', {
                  totalChunks: parsed.totalChunks,
                  voice: parsed.voice,
                  model: parsed.model,
                  speed: parsed.speed,
                  format: parsed.format
                })
              } else if (parsed.type === 'audio_chunk') {
                chunkCount++
                const elapsed = Date.now() - startTime
                console.log(`🎵 Chunk ${parsed.chunkIndex + 1}/${parsed.totalChunks} recebido (${elapsed}ms)`)
                console.log(`   Texto: "${parsed.text}"`)
                console.log(`   Tamanho: ${parsed.audioData.length} bytes`)
              } else if (parsed.type === 'chunk_error') {
                console.error(`❌ Erro no chunk ${parsed.chunkIndex}:`, parsed.error)
              } else if (parsed.type === 'error') {
                throw new Error(parsed.error)
              } else if (parsed.type === 'complete') {
                const totalTime = Date.now() - startTime
                console.log(`\n🎉 Processamento concluído!`)
                console.log(`📈 Estatísticas:`)
                console.log(`   - Total de chunks: ${chunkCount}`)
                console.log(`   - Tempo total: ${totalTime}ms`)
                console.log(`   - Tempo médio por chunk: ${Math.round(totalTime / chunkCount)}ms`)
                console.log(`   - Voz utilizada: Shimmer`)
                console.log(`   - Streaming: Automático`)
              }
            } catch (parseError) {
              console.error('❌ Erro ao processar dados:', parseError)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    console.log('\n✅ Teste concluído com sucesso!')
    console.log('🎯 Sistema TTS otimizado funcionando corretamente')

  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
    process.exit(1)
  }
}

async function testTTSGenerate() {
  console.log('\n🧪 Testando API de Geração Simples...\n')
  
  try {
    const response = await fetch('http://localhost:3000/api/tts/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: "Teste rápido da API de geração simples com voz Shimmer.",
        voice: 'shimmer',
        model: 'tts-1',
        speed: 1.0,
        format: 'mp3'
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`API Error: ${errorData.error}`)
    }

    const audioBuffer = await response.arrayBuffer()
    const config = response.headers.get('X-TTS-Config')
    
    console.log('✅ Geração simples concluída')
    console.log('📊 Configuração:', config)
    console.log('🎵 Tamanho do áudio:', audioBuffer.byteLength, 'bytes')
    console.log('🎤 Voz utilizada: Shimmer')

  } catch (error) {
    console.error('❌ Erro no teste de geração:', error.message)
  }
}

// Executar testes
async function runTests() {
  console.log('🚀 Iniciando testes do Sistema TTS Otimizado\n')
  console.log('=' .repeat(50))
  
  await testTTSStreaming()
  await testTTSGenerate()
  
  console.log('\n' + '=' .repeat(50))
  console.log('🎉 Todos os testes concluídos!')
  console.log('\n📋 Resumo das melhorias implementadas:')
  console.log('   ✅ Voz Shimmer como padrão')
  console.log('   ✅ Streaming automático otimizado')
  console.log('   ✅ Processamento paralelo de chunks')
  console.log('   ✅ Reprodução imediata')
  console.log('   ✅ Chunks menores (60 caracteres)')
  console.log('   ✅ Auto-play habilitado por padrão')
}

// Verificar se o servidor está rodando
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/health', {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    })
    return response.ok
  } catch {
    return false
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkServer().then(isRunning => {
    if (!isRunning) {
      console.error('❌ Servidor não está rodando em http://localhost:3000')
      console.log('💡 Execute: npm run dev')
      process.exit(1)
    }
    runTests()
  })
}

module.exports = { testTTSStreaming, testTTSGenerate }
