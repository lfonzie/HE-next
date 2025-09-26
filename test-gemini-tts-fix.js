#!/usr/bin/env node

/**
 * Test script to verify Gemini TTS fix
 * Tests the /api/tts/gemini-native endpoint to ensure controller state is properly handled
 */

const fetch = require('node-fetch')

async function testGeminiTTS() {
  console.log('🧪 Testing Gemini TTS fix...')
  
  try {
    const response = await fetch('http://localhost:3000/api/tts/gemini-native', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Olá, este é um teste do sistema de TTS corrigido.',
        voice: 'Zephyr',
        speed: 1.0,
        pitch: 0.0
      })
    })

    console.log(`📊 Response status: ${response.status}`)
    console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ HTTP Error:', errorData)
      return false
    }

    // Test streaming response
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let chunkCount = 0
    let audioChunks = 0
    let errorChunks = 0
    let doneChunks = 0

    console.log('🔄 Reading stream...')

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        console.log('✅ Stream reading complete')
        break
      }

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            chunkCount++
            
            if (data.type === 'audio') {
              audioChunks++
              console.log(`🎵 Audio chunk ${audioChunks} received: ${data.data ? data.data.length : 0} chars`)
            } else if (data.type === 'done') {
              doneChunks++
              console.log('✅ Done signal received')
            } else if (data.type === 'error') {
              errorChunks++
              console.error('❌ Error chunk received:', data.content)
            }
          } catch (e) {
            console.warn('⚠️ Failed to parse chunk:', e.message)
          }
        }
      }
    }

    console.log('\n📊 Test Results:')
    console.log(`- Total chunks: ${chunkCount}`)
    console.log(`- Audio chunks: ${audioChunks}`)
    console.log(`- Done chunks: ${doneChunks}`)
    console.log(`- Error chunks: ${errorChunks}`)

    if (errorChunks === 0 && audioChunks > 0) {
      console.log('✅ Test PASSED - No controller errors detected!')
      return true
    } else {
      console.log('❌ Test FAILED - Errors detected')
      return false
    }

  } catch (error) {
    console.error('❌ Test error:', error.message)
    return false
  }
}

// Run test
testGeminiTTS()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
