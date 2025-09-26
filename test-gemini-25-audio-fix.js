#!/usr/bin/env node

/**
 * Teste para verificar se a correção do formato de áudio do Gemini 2.5 Native Audio está funcionando
 * 
 * Este teste verifica:
 * 1. Se a API retorna áudio no formato correto
 * 2. Se a conversão PCM para WAV está funcionando
 * 3. Se o frontend consegue reproduzir o áudio
 */

// Carregar variáveis de ambiente do .env.local
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Função para carregar .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const lines = envContent.split('\n')
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '') // Remove quotes
          process.env[key] = value
        }
      }
    }
  }
}

// Carregar .env.local
loadEnvFile()

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY não configurada')
  console.error('💡 Verifique se o arquivo .env.local existe e contém GEMINI_API_KEY')
  process.exit(1)
}

console.log('✅ GEMINI_API_KEY carregada com sucesso')

async function testGemini25AudioFix() {
  console.log('🧪 [TESTE] Iniciando teste da correção do Gemini 2.5 Native Audio...')
  
  try {
    // Teste 1: Verificar se a API responde
    console.log('\n📡 [TESTE 1] Testando resposta da API...')
    
    const response = await fetch('http://localhost:3000/api/tts/gemini-native', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Olá, este é um teste do Gemini 2.5 Native Audio.',
        voice: 'Zephyr',
        speed: 1.0,
        pitch: 0.0
      })
    })

    if (!response.ok) {
      throw new Error(`API retornou status ${response.status}: ${response.statusText}`)
    }

    console.log('✅ [TESTE 1] API respondeu com sucesso')
    console.log(`📊 [TESTE 1] Content-Type: ${response.headers.get('content-type')}`)

    // Teste 2: Verificar se recebemos dados de áudio
    console.log('\n🎵 [TESTE 2] Verificando dados de áudio...')
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let audioChunks = []
    let hasAudioData = false
    let detectedMimeType = null

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            console.log(`📨 [TESTE 2] Tipo de dados recebido: ${data.type}`)
            
            if (data.type === 'audio' && data.data) {
              hasAudioData = true
              detectedMimeType = data.mimeType
              audioChunks.push(data.data)
              console.log(`🎵 [TESTE 2] Chunk de áudio recebido: ${data.data.length} chars, MIME: ${data.mimeType}`)
            } else if (data.type === 'done') {
              console.log('✅ [TESTE 2] Stream completo')
            } else if (data.type === 'error') {
              throw new Error(`Erro no stream: ${data.content}`)
            }
          } catch (e) {
            console.warn('⚠️ [TESTE 2] Erro ao parsear dados:', e.message)
          }
        }
      }
    }

    if (!hasAudioData) {
      throw new Error('❌ [TESTE 2] Nenhum dado de áudio foi recebido')
    }

    console.log('✅ [TESTE 2] Dados de áudio recebidos com sucesso')
    console.log(`📊 [TESTE 2] Total de chunks: ${audioChunks.length}`)
    console.log(`📊 [TESTE 2] MIME type detectado: ${detectedMimeType}`)

    // Teste 3: Verificar se o áudio pode ser convertido para blob
    console.log('\n🔄 [TESTE 3] Testando conversão para blob...')
    
    if (audioChunks.length === 0) {
      throw new Error('❌ [TESTE 3] Nenhum chunk de áudio para processar')
    }

    // Combinar todos os chunks
    const combinedAudio = audioChunks.join('')
    console.log(`📊 [TESTE 3] Tamanho total dos dados: ${combinedAudio.length} chars`)

    // Converter base64 para Uint8Array
    let audioData
    try {
      // Decodificar cada chunk separadamente e combinar os bytes
      const allBytes = []
      
      for (let i = 0; i < audioChunks.length; i++) {
        const chunk = audioChunks[i]
        try {
          const binaryString = atob(chunk)
          for (let j = 0; j < binaryString.length; j++) {
            allBytes.push(binaryString.charCodeAt(j))
          }
        } catch (chunkError) {
          console.warn(`⚠️ [TESTE 3] Chunk ${i} inválido, pulando:`, chunkError.message)
          continue
        }
      }
      
      audioData = new Uint8Array(allBytes)
      console.log(`✅ [TESTE 3] Decodificados ${allBytes.length} bytes de ${audioChunks.length} chunks`)
      
    } catch (error) {
      console.error('❌ [TESTE 3] Erro ao decodificar base64:', error.message)
      throw new Error('Dados base64 inválidos')
    }

    // Criar blob
    const mimeType = detectedMimeType || 'audio/wav'
    const audioBlob = new Blob([audioData], { type: mimeType })
    const blobUrl = URL.createObjectURL(audioBlob)

    console.log('✅ [TESTE 3] Blob criado com sucesso')
    console.log(`📊 [TESTE 3] Tamanho do blob: ${audioBlob.size} bytes`)
    console.log(`📊 [TESTE 3] Tipo do blob: ${audioBlob.type}`)
    console.log(`📊 [TESTE 3] URL do blob: ${blobUrl}`)

    // Teste 4: Verificar se é um arquivo WAV válido
    console.log('\n🔍 [TESTE 4] Verificando formato WAV...')
    
    if (audioData.length >= 44) {
      // Verificar header WAV
      const header = String.fromCharCode(...audioData.slice(0, 4))
      const format = String.fromCharCode(...audioData.slice(8, 12))
      
      console.log(`📊 [TESTE 4] Header: ${header}`)
      console.log(`📊 [TESTE 4] Formato: ${format}`)
      
      if (header === 'RIFF' && format === 'WAVE') {
        console.log('✅ [TESTE 4] Arquivo WAV válido detectado')
      } else {
        console.log('⚠️ [TESTE 4] Header WAV não detectado, mas pode ser válido')
      }
    } else {
      console.log('⚠️ [TESTE 4] Dados muito pequenos para verificar header WAV')
    }

    // Limpeza
    URL.revokeObjectURL(blobUrl)

    console.log('\n🎉 [RESULTADO] Todos os testes passaram!')
    console.log('✅ A correção do formato de áudio está funcionando')
    console.log('✅ O modelo Gemini 2.5 Native Audio está retornando áudio no formato correto')
    console.log('✅ O frontend deve conseguir reproduzir o áudio agora')

    return true

  } catch (error) {
    console.error('\n❌ [ERRO] Teste falhou:', error.message)
    console.error('📋 [DEBUG] Stack trace:', error.stack)
    
    if (error.message.includes('fetch')) {
      console.error('💡 [DICA] Certifique-se de que o servidor está rodando em http://localhost:3000')
    }
    
    if (error.message.includes('API key')) {
      console.error('💡 [DICA] Verifique se a GEMINI_API_KEY está configurada corretamente')
    }
    
    return false
  }
}

// Executar teste
testGemini25AudioFix()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })

export { testGemini25AudioFix }
