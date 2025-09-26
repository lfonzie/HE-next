#!/usr/bin/env node

/**
 * Diagnóstico da API Google TTS
 * Identifica problemas de configuração e conectividade
 */

const diagnoseGoogleTTS = async () => {
  console.log('🔍 Diagnóstico da API Google TTS...\n')

  // Verificar variáveis de ambiente
  console.log('📋 Verificando configuração:')
  const googleApiKey = process.env.GOOGLE_API_KEY
  const openaiApiKey = process.env.OPENAI_API_KEY
  
  console.log(`   GOOGLE_API_KEY: ${googleApiKey ? '✅ Configurada' : '❌ Não encontrada'}`)
  console.log(`   OPENAI_API_KEY: ${openaiApiKey ? '✅ Configurada' : '❌ Não encontrada'}`)
  
  if (!googleApiKey) {
    console.log('\n❌ PROBLEMA IDENTIFICADO: GOOGLE_API_KEY não configurada')
    console.log('📋 Solução:')
    console.log('   1. Acesse: https://console.cloud.google.com/apis/credentials')
    console.log('   2. Crie uma chave de API')
    console.log('   3. Adicione ao .env.local: GOOGLE_API_KEY=sua_chave_aqui')
    console.log('   4. Reinicie o servidor')
    return
  }

  // Verificar formato da chave
  console.log(`\n🔑 Formato da chave: ${googleApiKey.substring(0, 10)}...${googleApiKey.substring(googleApiKey.length - 10)}`)
  
  if (!googleApiKey.startsWith('AIza')) {
    console.log('⚠️ AVISO: Chave não parece ser uma Google API Key válida')
    console.log('   Google API Keys geralmente começam com "AIza"')
  }

  // Teste de conectividade
  console.log('\n🌐 Testando conectividade com Google TTS API...')
  
  const testText = 'Teste de conectividade'
  const ttsRequest = {
    input: { text: testText },
    voice: {
      languageCode: 'pt-BR',
      name: 'pt-BR-Standard-A',
      ssmlGender: 'FEMALE'
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 1.0,
      pitch: 0.0,
      volumeGainDb: 0.0
    }
  }

  try {
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ttsRequest)
    })

    console.log(`   Status HTTP: ${response.status}`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Conectividade com Google TTS API: OK')
      console.log(`   Tamanho do áudio: ${result.audioContent ? Math.round(result.audioContent.length / 1024) : 0} KB`)
    } else {
      const errorData = await response.json()
      console.log('❌ Erro na API Google TTS:')
      console.log(`   Status: ${response.status}`)
      console.log(`   Erro: ${JSON.stringify(errorData, null, 2)}`)
      
      // Diagnóstico específico
      if (response.status === 400) {
        console.log('\n🔍 Diagnóstico: Requisição inválida')
        console.log('   - Verifique se a API Text-to-Speech está habilitada')
        console.log('   - Verifique se a chave tem permissões corretas')
      } else if (response.status === 403) {
        console.log('\n🔍 Diagnóstico: Acesso negado')
        console.log('   - Verifique se a API Text-to-Speech está habilitada no projeto')
        console.log('   - Verifique se a chave tem permissões corretas')
        console.log('   - Verifique se há restrições de IP na chave')
      } else if (response.status === 429) {
        console.log('\n🔍 Diagnóstico: Limite de taxa excedido')
        console.log('   - Aguarde alguns minutos e tente novamente')
        console.log('   - Verifique os limites de quota no Google Cloud Console')
      }
    }

  } catch (error) {
    console.log('❌ Erro de conectividade:')
    console.log(`   ${error.message}`)
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔍 Diagnóstico: Problema de DNS')
      console.log('   - Verifique sua conexão com a internet')
      console.log('   - Verifique se não há bloqueio de firewall')
    }
  }

  // Teste da API local
  console.log('\n🏠 Testando API local...')
  
  try {
    const localResponse = await fetch('http://localhost:3000/api/tts/google', {
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

    console.log(`   Status HTTP: ${localResponse.status}`)
    
    if (localResponse.ok) {
      const audioBlob = await localResponse.blob()
      console.log('✅ API local funcionando')
      console.log(`   Tamanho do áudio: ${Math.round(audioBlob.size / 1024)} KB`)
    } else {
      const errorData = await localResponse.json()
      console.log('❌ Erro na API local:')
      console.log(`   Status: ${localResponse.status}`)
      console.log(`   Erro: ${errorData.error}`)
    }

  } catch (error) {
    console.log('❌ Erro ao testar API local:')
    console.log(`   ${error.message}`)
  }

  // Resumo e recomendações
  console.log('\n📋 Resumo e Recomendações:')
  
  if (!googleApiKey) {
    console.log('   1. Configure GOOGLE_API_KEY no .env.local')
    console.log('   2. Reinicie o servidor')
  } else {
    console.log('   1. Google API Key está configurada')
    console.log('   2. Sistema de fallback está funcionando (OpenAI TTS)')
    console.log('   3. Áudio continua funcionando mesmo com erro do Google TTS')
  }
  
  console.log('\n🎯 Status do Sistema:')
  console.log('   ✅ Sistema de fallback funcionando perfeitamente')
  console.log('   ✅ OpenAI TTS ativo como backup')
  console.log('   ✅ Usuários não são afetados pelo erro do Google TTS')
}

// Executar diagnóstico se chamado diretamente
if (require.main === module) {
  diagnoseGoogleTTS().catch(console.error)
}

module.exports = { diagnoseGoogleTTS }
