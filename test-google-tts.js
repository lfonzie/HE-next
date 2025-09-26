#!/usr/bin/env node

/**
 * Teste da implementação do Google TTS
 * Verifica se a API está funcionando corretamente
 */

const testGoogleTTS = async () => {
  console.log('🧪 Testando implementação do Google TTS com Fallback...\n')

  // Verificar se as API keys estão configuradas
  const googleApiKey = process.env.GOOGLE_API_KEY
  const openaiApiKey = process.env.OPENAI_API_KEY
  
  console.log('📋 Verificando configuração das APIs:')
  console.log(`   Google API Key: ${googleApiKey ? '✅ Configurada' : '❌ Não encontrada'}`)
  console.log(`   OpenAI API Key: ${openaiApiKey ? '✅ Configurada' : '❌ Não encontrada'}`)
  
  if (!googleApiKey && !openaiApiKey) {
    console.error('❌ Nenhuma API key encontrada!')
    console.log('📋 Configure pelo menos uma das variáveis:')
    console.log('   - GOOGLE_API_KEY (recomendado)')
    console.log('   - OPENAI_API_KEY (fallback)')
    return
  }

  // Teste da API
  const testText = 'Olá! Este é um teste da síntese de voz do Google em português brasileiro. A voz feminina está funcionando perfeitamente!'
  
  // Teste Google TTS
  if (googleApiKey) {
    try {
      console.log('🔄 Testando API do Google TTS...')
      
      const response = await fetch('http://localhost:3000/api/tts/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testText,
          voice: 'pt-BR-Standard-A',
          speed: 1.0,
          pitch: 0.0
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro na API')
      }

      const audioBlob = await response.blob()
      console.log('✅ API do Google TTS funcionando!')
      console.log(`📊 Tamanho do áudio: ${Math.round(audioBlob.size / 1024)} KB`)
      console.log(`🎵 Tipo do áudio: ${audioBlob.type}`)

      // Verificar se o áudio tem conteúdo válido
      if (audioBlob.size > 0) {
        console.log('✅ Áudio Google TTS gerado com sucesso!')
      } else {
        console.error('❌ Áudio vazio gerado')
      }

    } catch (error) {
      console.error('❌ Erro ao testar Google TTS:', error.message)
      
      if (error.message.includes('API key')) {
        console.log('📋 Verifique se a GOOGLE_API_KEY está correta')
      } else if (error.message.includes('quota')) {
        console.log('📋 Verifique se há cota disponível na Google Cloud')
      } else if (error.message.includes('rate limit')) {
        console.log('📋 Aguarde um momento e tente novamente')
      }
    }
  } else {
    console.log('⚠️ Google TTS não testado (API key não configurada)')
  }

  // Teste OpenAI TTS (Fallback)
  if (openaiApiKey) {
    try {
      console.log('\n🔄 Testando API do OpenAI TTS (Fallback)...')
      
      const response = await fetch('http://localhost:3000/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testText,
          voice: 'shimmer',
          model: 'tts-1'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro na API')
      }

      const audioBlob = await response.blob()
      console.log('✅ API do OpenAI TTS funcionando!')
      console.log(`📊 Tamanho do áudio: ${Math.round(audioBlob.size / 1024)} KB`)
      console.log(`🎵 Tipo do áudio: ${audioBlob.type}`)

      // Verificar se o áudio tem conteúdo válido
      if (audioBlob.size > 0) {
        console.log('✅ Áudio OpenAI TTS gerado com sucesso!')
      } else {
        console.error('❌ Áudio vazio gerado')
      }

    } catch (error) {
      console.error('❌ Erro ao testar OpenAI TTS:', error.message)
      
      if (error.message.includes('API key')) {
        console.log('📋 Verifique se a OPENAI_API_KEY está correta')
      } else if (error.message.includes('quota')) {
        console.log('📋 Verifique se há cota disponível na OpenAI')
      } else if (error.message.includes('rate limit')) {
        console.log('📋 Aguarde um momento e tente novamente')
      }
    }
  } else {
    console.log('⚠️ OpenAI TTS não testado (API key não configurada)')
  }

  console.log('\n🎯 Resumo do Sistema de Fallback:')
  console.log('   1. Google TTS é usado como provedor principal')
  console.log('   2. OpenAI TTS é usado automaticamente como fallback')
  console.log('   3. Sistema garante que o áudio sempre funcione')
  console.log('   4. Interface mostra qual provedor está sendo usado')
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testGoogleTTS().catch(console.error)
}

module.exports = { testGoogleTTS }
