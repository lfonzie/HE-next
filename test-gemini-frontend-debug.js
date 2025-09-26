import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY não configurada')
  process.exit(1)
}

console.log('🔑 GEMINI_API_KEY configurada')

// Teste direto da API do Gemini
async function testGeminiDirect() {
  try {
    console.log('🧪 Testando API direta do Gemini...')
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-native-audio-preview-09-2025:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Convert this text to speech in Portuguese Brazilian: 'Olá, este é um teste de áudio.'"
          }]
        }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          mediaResolution: "MEDIA_RESOLUTION_MEDIUM",
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Zephyr"
              }
            }
          }
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na API:', response.status, errorText)
      return
    }

    const data = await response.json()
    console.log('✅ Resposta da API:', JSON.stringify(data, null, 2))

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

// Teste da nossa API local
async function testLocalAPI() {
  try {
    console.log('🧪 Testando API local...')
    
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
      console.error('❌ Erro na API local:', response.status, errorText)
      return
    }

    console.log('✅ Resposta da API local recebida')
    
    // Ler o stream
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
              const audioData = Uint8Array.from(atob(data.data), c => c.charCodeAt(0))
              audioChunks.push(audioData)
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
    console.log(`🎵 Total de bytes: ${audioChunks.reduce((sum, chunk) => sum + chunk.length, 0)}`)

  } catch (error) {
    console.error('❌ Erro no teste local:', error)
  }
}

// Executar testes
async function runTests() {
  console.log('🚀 Iniciando testes...')
  
  // Teste 1: API direta do Gemini
  await testGeminiDirect()
  
  console.log('\n' + '='.repeat(50) + '\n')
  
  // Teste 2: Nossa API local
  await testLocalAPI()
  
  console.log('\n✅ Testes concluídos')
}

runTests().catch(console.error)
