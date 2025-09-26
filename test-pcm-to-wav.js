import dotenv from 'dotenv'
import fs from 'fs'
dotenv.config({ path: '.env.local' })

// Function to convert PCM to WAV
function convertPCMToWAV(pcmData, sampleRate, channels, bitsPerSample) {
  const length = pcmData.length
  const arrayBuffer = new ArrayBuffer(44 + length)
  const view = new DataView(arrayBuffer)
  
  // WAV header
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }
  
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + length, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM format
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * channels * bitsPerSample / 8, true)
  view.setUint16(32, channels * bitsPerSample / 8, true)
  view.setUint16(34, bitsPerSample, true)
  writeString(36, 'data')
  view.setUint32(40, length, true)
  
  // Copy PCM data
  const wavData = new Uint8Array(arrayBuffer)
  wavData.set(pcmData, 44)
  
  return wavData
}

async function testPCMToWAV() {
  try {
    console.log('🧪 Testando conversão PCM para WAV...')
    
    const response = await fetch('http://localhost:3000/api/tts/gemini-native', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Teste de conversão PCM para WAV.',
        voice: 'Zephyr'
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na API:', response.status, errorText)
      return
    }
    
    const reader = response.body?.getReader()
    if (!reader) {
      console.error('❌ No reader available')
      return
    }
    
    let chunkCount = 0
    const audioChunks = []
    let detectedMimeType = 'audio/mpeg'
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = new TextDecoder().decode(value)
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'audio' && data.data) {
              chunkCount++
              
              if (chunkCount === 1 && data.mimeType) {
                detectedMimeType = data.mimeType
                console.log(`🎵 MIME type detectado: ${detectedMimeType}`)
              }
              
              // Convert base64 to Uint8Array
              const binaryString = atob(data.data)
              const audioData = new Uint8Array(binaryString.length)
              for (let i = 0; i < binaryString.length; i++) {
                audioData[i] = binaryString.charCodeAt(i)
              }
              audioChunks.push(audioData)
              
            } else if (data.type === 'done') {
              break
            }
          } catch (e) {
            console.warn('Erro ao parsear SSE:', e)
          }
        }
      }
    }
    
    console.log(`🎵 Total de chunks: ${chunkCount}`)
    
    // Combinar chunks
    const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const combinedAudio = new Uint8Array(totalLength)
    let offset = 0
    
    for (const chunk of audioChunks) {
      combinedAudio.set(chunk, offset)
      offset += chunk.length
    }
    
    console.log(`🔗 Áudio PCM combinado: ${combinedAudio.length} bytes`)
    
    // Salvar PCM original
    fs.writeFileSync('test-pcm-raw.bin', combinedAudio)
    console.log('💾 PCM original salvo: test-pcm-raw.bin')
    
    // Converter PCM para WAV
    if (detectedMimeType.includes('pcm')) {
      console.log('🔄 Convertendo PCM para WAV...')
      const wavData = convertPCMToWAV(combinedAudio, 24000, 1, 16) // 24kHz, mono, 16-bit
      
      fs.writeFileSync('test-pcm-converted.wav', wavData)
      console.log(`💾 WAV convertido salvo: test-pcm-converted.wav (${wavData.length} bytes)`)
      
      // Verificar header WAV
      const wavBuffer = fs.readFileSync('test-pcm-converted.wav')
      const header = wavBuffer.slice(0, 12)
      const riff = String.fromCharCode(...header.slice(0, 4))
      const wave = String.fromCharCode(...header.slice(8, 12))
      
      console.log(`🔍 Header RIFF: "${riff}"`)
      console.log(`🔍 Header WAVE: "${wave}"`)
      
      if (riff === 'RIFF' && wave === 'WAVE') {
        console.log('✅ Arquivo WAV válido criado!')
      } else {
        console.log('❌ Arquivo WAV inválido!')
      }
    }
    
    console.log('\n✅ Teste de conversão concluído!')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testPCMToWAV()
