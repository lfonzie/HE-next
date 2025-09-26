import dotenv from 'dotenv'
import fs from 'fs'
dotenv.config({ path: '.env.local' })

async function testAudioCombination() {
  try {
    console.log('🧪 Testando combinação de áudio...')
    
    const response = await fetch('http://localhost:3000/api/tts/gemini-native', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Olá, este é um teste de áudio.',
        voice: 'Zephyr'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na API:', response.status, errorText)
      return
    }

    console.log('✅ Resposta recebida')
    
    const reader = response.body?.getReader()
    if (!reader) {
      console.error('❌ No reader available')
      return
    }

    let chunkCount = 0
    const audioChunks = []

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
              console.log(`🎵 Chunk ${chunkCount} recebido: ${data.data.length} chars`)
              // Convert base64 to Uint8Array - fix for proper decoding
              try {
                const binaryString = atob(data.data)
                const audioData = new Uint8Array(binaryString.length)
                for (let i = 0; i < binaryString.length; i++) {
                  audioData[i] = binaryString.charCodeAt(i)
                }
                audioChunks.push(audioData)
              } catch (e) {
                console.error('❌ Error decoding base64:', e)
              }
            } else if (data.type === 'done') {
              console.log('✅ Stream completo')
              break
            }
          } catch (e) {
            console.warn('Erro ao parsear:', e)
          }
        }
      }
    }

    console.log(`🎵 Total de chunks: ${chunkCount}`)
    
    // Combinar chunks
    const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0)
    console.log(`🔗 Combinando ${audioChunks.length} chunks, total length: ${totalLength} bytes`)
    
    const combinedAudio = new Uint8Array(totalLength)
    let offset = 0
    
    for (const chunk of audioChunks) {
      combinedAudio.set(chunk, offset)
      offset += chunk.length
    }

    // Salvar arquivo
    const audioBlob = new Blob([combinedAudio], { type: 'audio/wav' })
    const buffer = Buffer.from(combinedAudio)
    
    fs.writeFileSync('test-audio.wav', buffer)
    console.log(`💾 Áudio salvo: test-audio.wav (${buffer.length} bytes)`)
    
    // Verificar se é um arquivo WAV válido
    const header = buffer.slice(0, 12)
    const riff = header.slice(0, 4).toString()
    const wave = header.slice(8, 12).toString()
    
    console.log(`🔍 Header RIFF: ${riff}`)
    console.log(`🔍 Header WAVE: ${wave}`)
    
    if (riff === 'RIFF' && wave === 'WAVE') {
      console.log('✅ Arquivo WAV válido!')
    } else {
      console.log('❌ Arquivo WAV inválido!')
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

testAudioCombination()
