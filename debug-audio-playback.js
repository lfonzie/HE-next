import dotenv from 'dotenv'
import fs from 'fs'
dotenv.config({ path: '.env.local' })

async function debugAudioPlayback() {
  try {
    console.log('🔍 Investigando problema de reprodução de áudio...')
    
    const response = await fetch('http://localhost:3000/api/tts/gemini-native', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Teste de áudio para debug.',
        voice: 'Zephyr'
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na API:', response.status, errorText)
      return
    }
    
    console.log('✅ Resposta recebida')
    console.log('📡 Content-Type:', response.headers.get('content-type'))
    console.log('📡 Transfer-Encoding:', response.headers.get('transfer-encoding'))
    
    const reader = response.body?.getReader()
    if (!reader) {
      console.error('❌ No reader available')
      return
    }
    
    let chunkCount = 0
    const audioChunks = []
    let detectedMimeType = 'audio/mpeg'
    let firstChunkData = null
    
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
              console.log(`🎵 Chunk ${chunkCount} recebido: ${data.data.length} chars base64`)
              
              if (chunkCount === 1) {
                firstChunkData = data.data
                if (data.mimeType) {
                  detectedMimeType = data.mimeType
                  console.log(`🎵 MIME type detectado: ${detectedMimeType}`)
                }
              }
              
              // Convert base64 to Uint8Array
              const binaryString = atob(data.data)
              const audioData = new Uint8Array(binaryString.length)
              for (let i = 0; i < binaryString.length; i++) {
                audioData[i] = binaryString.charCodeAt(i)
              }
              audioChunks.push(audioData)
              
            } else if (data.type === 'done') {
              console.log('✅ Stream completo')
              break
            }
          } catch (e) {
            console.warn('Erro ao parsear SSE:', e)
          }
        }
      }
    }
    
    console.log(`🎵 Total de chunks: ${chunkCount}`)
    console.log(`🎵 Total de bytes: ${audioChunks.reduce((sum, chunk) => sum + chunk.length, 0)}`)
    
    if (audioChunks.length === 0) {
      console.error('❌ Nenhum chunk de áudio recebido')
      return
    }
    
    // Analisar primeiro chunk
    if (firstChunkData) {
      console.log('\n🔍 Analisando primeiro chunk...')
      const firstBinary = atob(firstChunkData)
      const firstBytes = new Uint8Array(firstBinary.length)
      for (let i = 0; i < firstBinary.length; i++) {
        firstBytes[i] = firstBinary.charCodeAt(i)
      }
      
      // Verificar header do arquivo
      const header = firstBytes.slice(0, 12)
      console.log('🔍 Primeiros 12 bytes (hex):', Array.from(header).map(b => b.toString(16).padStart(2, '0')).join(' '))
      console.log('🔍 Primeiros 12 bytes (ascii):', String.fromCharCode(...header.map(b => b > 31 && b < 127 ? b : 46)))
      
      // Verificar se é WAV
      const riff = String.fromCharCode(...header.slice(0, 4))
      const wave = String.fromCharCode(...header.slice(8, 12))
      console.log(`🔍 RIFF: "${riff}"`)
      console.log(`🔍 WAVE: "${wave}"`)
      
      if (riff === 'RIFF' && wave === 'WAVE') {
        console.log('✅ Arquivo WAV válido detectado')
      } else {
        console.log('❌ Não é um arquivo WAV válido')
        
        // Verificar se é MP3
        const mp3Header = firstBytes.slice(0, 3)
        const mp3Hex = Array.from(mp3Header).map(b => b.toString(16).padStart(2, '0')).join('')
        console.log(`🔍 MP3 header: ${mp3Hex}`)
        
        if (mp3Hex.startsWith('fffb') || mp3Hex.startsWith('fff3')) {
          console.log('✅ Possível arquivo MP3 detectado')
          detectedMimeType = 'audio/mpeg'
        }
      }
    }
    
    // Combinar todos os chunks
    const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const combinedAudio = new Uint8Array(totalLength)
    let offset = 0
    
    for (const chunk of audioChunks) {
      combinedAudio.set(chunk, offset)
      offset += chunk.length
    }
    
    // Salvar arquivo com MIME type correto
    const extension = detectedMimeType.includes('wav') ? 'wav' : 'mp3'
    const filename = `debug-audio.${extension}`
    
    fs.writeFileSync(filename, combinedAudio)
    console.log(`💾 Áudio salvo: ${filename} (${combinedAudio.length} bytes)`)
    
    // Verificar arquivo salvo
    const stats = fs.statSync(filename)
    console.log(`📊 Tamanho do arquivo: ${stats.size} bytes`)
    
    // Testar se o arquivo é válido
    const fileBuffer = fs.readFileSync(filename)
    const fileHeader = fileBuffer.slice(0, 12)
    const fileHeaderHex = Array.from(fileHeader).map(b => b.toString(16).padStart(2, '0')).join(' ')
    console.log(`🔍 Header do arquivo salvo: ${fileHeaderHex}`)
    
    console.log('\n✅ Debug concluído!')
    console.log(`📁 Arquivo salvo: ${filename}`)
    console.log(`🎵 MIME type: ${detectedMimeType}`)
    console.log(`📊 Tamanho: ${combinedAudio.length} bytes`)
    
  } catch (error) {
    console.error('❌ Erro no debug:', error)
  }
}

debugAudioPlayback()
