#!/usr/bin/env node

/**
 * Script de teste para verificar se todos os providers do chat estão funcionando
 * Testa: Google Gemini, OpenAI GPT, Perplexity Sonar
 */

import { config } from 'dotenv'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { perplexity } from '@ai-sdk/perplexity'
import { generateText } from 'ai'

// Carregar variáveis de ambiente
config({ path: '.env.local' })

const providers = [
  {
    name: 'Google Gemini',
    enabled: !!(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    models: ['gemini-1.5-flash', 'gemini-2.0-flash-exp']
  },
  {
    name: 'OpenAI',
    enabled: !!process.env.OPENAI_API_KEY,
    apiKey: process.env.OPENAI_API_KEY,
    models: ['gpt-4o-mini', 'gpt-5-chat-latest']
  },
  {
    name: 'Perplexity Sonar',
    enabled: !!process.env.PERPLEXITY_API_KEY,
    apiKey: process.env.PERPLEXITY_API_KEY,
    models: ['sonar']
  }
]

async function testProvider(provider) {
  if (!provider.enabled) {
    console.log(`❌ ${provider.name}: Não configurado (API key ausente)`)
    return
  }

  console.log(`\n🧪 Testando ${provider.name}...`)
  
  for (const model of provider.models) {
    try {
      console.log(`  📝 Testando modelo: ${model}`)
      
      const startTime = Date.now()
      
      let client
      let prompt = 'Olá! Responda brevemente: "Teste funcionando"'
      
      switch (provider.name) {
        case 'Google Gemini':
          client = google(model)
          break
        case 'OpenAI':
          client = openai(model)
          break
        case 'Perplexity Sonar':
          client = perplexity(model, { apiKey: provider.apiKey })
          prompt = 'Pesquise e responda brevemente: Qual é a capital do Brasil?'
          break
        default:
          throw new Error(`Provider não reconhecido: ${provider.name}`)
      }
      
      const result = await generateText({
        model: client,
        prompt: prompt,
        maxTokens: 100,
        temperature: 0.1
      })
      
      const latency = Date.now() - startTime
      
      provider.testResult = {
        success: true,
        model: model,
        response: result.text.trim(),
        latency: latency
      }
      
      console.log(`  ✅ ${model}: OK (${latency}ms)`)
      console.log(`  📄 Resposta: "${result.text.trim().substring(0, 50)}..."`)
      
      // Se um modelo funcionou, não testar os outros
      break
      
    } catch (error) {
      console.log(`  ❌ ${model}: ERRO - ${error.message}`)
      
      if (!provider.testResult) {
        provider.testResult = {
          success: false,
          model: model,
          response: '',
          latency: 0,
          error: error.message
        }
      }
    }
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes dos providers do chat...\n')
  
  // Verificar configuração
  console.log('📋 Status da configuração:')
  providers.forEach(provider => {
    const status = provider.enabled ? '✅ Configurado' : '❌ Não configurado'
    console.log(`  ${provider.name}: ${status}`)
  })
  
  // Testar cada provider
  for (const provider of providers) {
    await testProvider(provider)
  }
  
  // Resumo dos resultados
  console.log('\n📊 RESUMO DOS TESTES:')
  console.log('=' .repeat(50))
  
  const successfulProviders = providers.filter(p => p.testResult?.success)
  const failedProviders = providers.filter(p => p.testResult && !p.testResult.success)
  const notConfiguredProviders = providers.filter(p => !p.enabled)
  
  console.log(`✅ Providers funcionando: ${successfulProviders.length}`)
  successfulProviders.forEach(p => {
    console.log(`  - ${p.name} (${p.testResult?.model}): ${p.testResult?.latency}ms`)
  })
  
  if (failedProviders.length > 0) {
    console.log(`\n❌ Providers com erro: ${failedProviders.length}`)
    failedProviders.forEach(p => {
      console.log(`  - ${p.name} (${p.testResult?.model}): ${p.testResult?.error}`)
    })
  }
  
  if (notConfiguredProviders.length > 0) {
    console.log(`\n⚠️  Providers não configurados: ${notConfiguredProviders.length}`)
    notConfiguredProviders.forEach(p => {
      console.log(`  - ${p.name}: API key ausente`)
    })
  }
  
  // Recomendações
  console.log('\n💡 RECOMENDAÇÕES:')
  
  if (successfulProviders.length === 0) {
    console.log('  🚨 Nenhum provider funcionando! Configure pelo menos uma API key.')
  } else if (successfulProviders.length === 1) {
    console.log('  ⚠️  Apenas um provider funcionando. Configure mais providers para fallback.')
  } else {
    console.log('  ✅ Múltiplos providers funcionando! Sistema com fallback ativo.')
  }
  
  if (notConfiguredProviders.length > 0) {
    console.log('  📝 Para configurar providers ausentes, adicione as API keys no .env.local')
  }
  
  // Instruções específicas
  console.log('\n🔧 CONFIGURAÇÃO:')
  console.log('  Google: GOOGLE_GENERATIVE_AI_API_KEY')
  console.log('  OpenAI: OPENAI_API_KEY') 
  console.log('  Perplexity: PERPLEXITY_API_KEY')
  
  console.log('\n✨ Teste concluído!')
}

// Executar testes
runTests().catch(error => {
  console.error('❌ Erro durante os testes:', error)
  process.exit(1)
})
