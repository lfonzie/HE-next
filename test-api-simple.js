import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function testAPI() {
  try {
    console.log('🧪 Testando API Gemini Native...')
    
    const response = await fetch('http://localhost:3000/api/tts/gemini-native', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Teste simples de áudio.',
        voice: 'Zephyr'
      })
    })
    
    console.log('📡 Status:', response.status)
    console.log('📡 Headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro:', errorText)
      return
    }
    
    console.log('✅ Resposta recebida, iniciando leitura do stream...')
    
    const reader = response.body?.getReader()
    if (!reader) {
      console.error('❌ No reader available')
      return
    }
    
    let chunkCount = 0
    let totalBytes = 0
    
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
              const audioData = atob(data.data)
              totalBytes += audioData.length
              console.log(`🎵 Chunk ${chunkCount}: ${data.data.length} chars base64 = ${audioData.length} bytes`)
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
    
    console.log(`🎵 Total: ${chunkCount} chunks, ${totalBytes} bytes`)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

testAPI()
