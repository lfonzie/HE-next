#!/usr/bin/env node

/**
 * Script de diagnóstico para problemas de API no Render
 * Executa verificações específicas para identificar problemas de configuração
 */

import { createSafeModel, validateOpenAIKey, productionAIConfig } from './lib/ai-sdk-production-config.js'

async function runDiagnostics() {
  console.log('🔍 [DIAGNOSTIC] Starting AI SDK diagnostics...\n')
  
  // 1. Verificar variáveis de ambiente
  console.log('📋 [ENV-CHECK] Environment variables:')
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`)
  console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET'}`)
  console.log(`   GOOGLE_GENERATIVE_AI_API_KEY: ${process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'SET' : 'NOT SET'}`)
  
  if (process.env.OPENAI_API_KEY) {
    console.log(`   OPENAI_API_KEY length: ${process.env.OPENAI_API_KEY.length}`)
    console.log(`   OPENAI_API_KEY starts with sk-: ${process.env.OPENAI_API_KEY.startsWith('sk-')}`)
  }
  console.log('')
  
  // 2. Verificar validação da API key
  console.log('🔑 [API-KEY-VALIDATION] OpenAI API key validation:')
  const isValidKey = validateOpenAIKey()
  console.log(`   Valid: ${isValidKey}`)
  console.log('')
  
  // 3. Verificar configuração de produção
  console.log('⚙️ [PRODUCTION-CONFIG] Production configuration:')
  console.log(`   OpenAI available: ${productionAIConfig.openai.available}`)
  console.log(`   Google available: ${productionAIConfig.google.available}`)
  console.log('')
  
  // 4. Testar criação de modelos
  console.log('🧪 [MODEL-TEST] Testing model creation:')
  
  try {
    console.log('   Testing OpenAI gpt-4o-mini...')
    const openaiModel = createSafeModel('openai', 'simple')
    console.log('   ✅ OpenAI model created successfully')
  } catch (error: any) {
    console.log(`   ❌ OpenAI model failed: ${error.message}`)
  }
  
  try {
    console.log('   Testing Google gemini-1.5-flash...')
    const googleModel = createSafeModel('google', 'simple')
    console.log('   ✅ Google model created successfully')
  } catch (error: any) {
    console.log(`   ❌ Google model failed: ${error.message}`)
  }
  
  try {
    console.log('   Testing OpenAI gpt-5-chat-latest...')
    const openaiComplexModel = createSafeModel('openai', 'complex')
    console.log('   ✅ OpenAI complex model created successfully')
  } catch (error: any) {
    console.log(`   ❌ OpenAI complex model failed: ${error.message}`)
  }
  
  console.log('')
  
  // 5. Teste de conectividade com API
  console.log('🌐 [CONNECTIVITY-TEST] Testing API connectivity:')
  
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`   ✅ OpenAI API accessible (${data.data?.length || 0} models available)`)
        
        // Verificar se gpt-5-chat-latest está disponível
        const gpt5Available = data.data?.some((model: any) => model.id === 'gpt-5-chat-latest')
        console.log(`   GPT-5 available: ${gpt5Available}`)
      } else {
        console.log(`   ❌ OpenAI API error: ${response.status} ${response.statusText}`)
        const errorText = await response.text()
        console.log(`   Error details: ${errorText}`)
      }
    } catch (error: any) {
      console.log(`   ❌ OpenAI API connectivity failed: ${error.message}`)
    }
  }
  
  console.log('')
  console.log('✅ [DIAGNOSTIC] Diagnostics completed')
}

// Executar diagnósticos
runDiagnostics().catch(console.error)
