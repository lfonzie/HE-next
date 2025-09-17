#!/usr/bin/env node

/**
 * Teste específico para Google Gemini 2.0 Flash Lite
 */

const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:3000'

async function testGoogleGemini() {
  console.log('🔍 TESTE DO GOOGLE GEMINI 2.0 FLASH LITE')
  console.log('========================================\n')

  // Verificar se o servidor está rodando
  try {
    const healthResponse = await fetch(`${BASE_URL}/api/health`)
    if (!healthResponse.ok) {
      throw new Error('Servidor não está respondendo')
    }
    console.log('✅ Servidor está rodando\n')
  } catch (error) {
    console.log('❌ Servidor não está rodando. Execute "npm run dev" primeiro.\n')
    return
  }

  // Testar com a API original primeiro
  console.log('📝 Teste 1: API Original (AI SDK)')
  try {
    const response = await fetch(`${BASE_URL}/api/chat/ai-sdk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Explique o conceito de inteligência artificial de forma simples'
          }
        ],
        module: 'professor'
      })
    })

    if (response.ok) {
      const text = await response.text()
      console.log(`   ✅ Resposta recebida: ${text.substring(0, 100)}...`)
    } else {
      const errorText = await response.text()
      console.log(`   ❌ Erro HTTP ${response.status}: ${errorText}`)
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`)
  }

  console.log('')

  // Testar com Smart Router
  console.log('📝 Teste 2: Smart Router com Google')
  try {
    const response = await fetch(`${BASE_URL}/api/chat/smart-router`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Pesquise informações sobre machine learning'
          }
        ],
        preferredProvider: 'google',
        enableRouting: true
      })
    })

    if (response.ok) {
      const text = await response.text()
      const provider = response.headers.get('X-Provider')
      const model = response.headers.get('X-Model')
      const useCase = response.headers.get('X-UseCase')
      const complexity = response.headers.get('X-Complexity')
      
      console.log(`   ✅ Resposta recebida`)
      console.log(`   🎯 Provedor: ${provider}`)
      console.log(`   🤖 Modelo: ${model}`)
      console.log(`   📋 Caso de uso: ${useCase}`)
      console.log(`   🧠 Complexidade: ${complexity}`)
      console.log(`   📄 Resposta: ${text.substring(0, 100)}...`)
    } else {
      const errorText = await response.text()
      console.log(`   ❌ Erro HTTP ${response.status}: ${errorText}`)
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`)
  }

  console.log('')

  // Testar com Multi-Provider
  console.log('📝 Teste 3: Multi-Provider com Google')
  try {
    const response = await fetch(`${BASE_URL}/api/chat/multi-provider`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Crie uma história criativa sobre um robô'
          }
        ],
        provider: 'google',
        complexity: 'creative'
      })
    })

    if (response.ok) {
      const text = await response.text()
      const provider = response.headers.get('X-Provider')
      const model = response.headers.get('X-Model')
      
      console.log(`   ✅ Resposta recebida`)
      console.log(`   🎯 Provedor: ${provider}`)
      console.log(`   🤖 Modelo: ${model}`)
      console.log(`   📄 Resposta: ${text.substring(0, 100)}...`)
    } else {
      const errorText = await response.text()
      console.log(`   ❌ Erro HTTP ${response.status}: ${errorText}`)
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`)
  }

  console.log('')

  // Verificar configuração
  console.log('📊 Verificando configuração do Google:')
  try {
    const response = await fetch(`${BASE_URL}/api/chat/smart-router`)
    if (response.ok) {
      const data = await response.json()
      console.log(`   ✅ Provedores disponíveis: ${data.stats?.availableProviders?.join(', ') || 'Nenhum'}`)
      
      if (data.stats?.availableProviders?.includes('google')) {
        console.log(`   ✅ Google Gemini configurado e disponível`)
      } else {
        console.log(`   ⚠️  Google Gemini não está disponível`)
        console.log(`   💡 Verifique se GOOGLE_API_KEY está configurado no .env.local`)
      }
    } else {
      console.log(`   ❌ Erro ao verificar configuração: ${response.status}`)
    }
  } catch (error) {
    console.log(`   ❌ Erro ao verificar configuração: ${error.message}`)
  }

  console.log('\n🎯 Para testar a interface web:')
  console.log('   Acesse: http://localhost:3000/multi-provider')
  console.log('   Acesse: http://localhost:3000/smart-router')

  console.log('\n📚 Configuração do Google Gemini:')
  console.log('   Modelo: gemini-2.0-flash-exp')
  console.log('   Chave: AIzaSyD1SDmMlsj3fLhY-a5rFT5xhcVUqYxBwXg')
  console.log('   Configuração: temperature=0.7, maxTokens=4000')
}

async function main() {
  try {
    await testGoogleGemini()
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = { testGoogleGemini }
