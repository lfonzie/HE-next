#!/usr/bin/env node

/**
 * Script para testar a integração com Perplexity
 * Execute: node test-perplexity-integration.js
 */

import { generateText } from 'ai'
import { perplexity } from '@ai-sdk/perplexity'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

async function testPerplexityIntegration() {
  console.log('🧪 Testando integração com Perplexity...\n')

  // Verificar se a chave da API está configurada
  if (!process.env.PERPLEXITY_API_KEY) {
    console.error('❌ PERPLEXITY_API_KEY não encontrada no arquivo .env')
    console.log('📝 Adicione sua chave da API do Perplexity no arquivo .env:')
    console.log('   PERPLEXITY_API_KEY=your-perplexity-api-key-here')
    process.exit(1)
  }

  console.log('✅ Chave da API encontrada')
  console.log(`📋 Modelo configurado: ${process.env.PERPLEXITY_MODEL_SELECTION || 'sonar'}`)

  try {
    // Configurar modelo Perplexity
    const model = perplexity(process.env.PERPLEXITY_MODEL_SELECTION || 'sonar', {
      apiKey: process.env.PERPLEXITY_API_KEY,
    })

    console.log('🔄 Enviando requisição de teste...')

    // Teste simples
    const result = await generateText({
      model,
      prompt: 'Olá! Você pode me ajudar com uma pergunta sobre educação? Responda brevemente.',
      maxTokens: 100,
      temperature: 0.7,
    })

    console.log('✅ Teste bem-sucedido!')
    console.log('\n📝 Resposta do Perplexity:')
    console.log('─'.repeat(50))
    console.log(result.text)
    console.log('─'.repeat(50))

    if (result.usage) {
      console.log('\n📊 Uso de tokens:')
      console.log(`   Total: ${result.usage.totalTokens}`)
      console.log(`   Prompt: ${result.usage.promptTokens}`)
      console.log(`   Completion: ${result.usage.completionTokens}`)
    }

    console.log('\n🎉 Integração com Perplexity funcionando corretamente!')
    console.log('\n📋 Próximos passos:')
    console.log('   1. Configure sua chave da API no arquivo .env.local')
    console.log('   2. Execute: npm run dev')
    console.log('   3. Acesse: http://localhost:3000/perplexity-demo')
    console.log('   4. Teste o chat com Perplexity')

  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
    
    if (error.message.includes('401')) {
      console.log('\n💡 Possíveis soluções:')
      console.log('   - Verifique se a chave da API está correta')
      console.log('   - Verifique se a chave tem permissões adequadas')
    } else if (error.message.includes('429')) {
      console.log('\n💡 Possíveis soluções:')
      console.log('   - Aguarde um momento e tente novamente')
      console.log('   - Verifique seus limites de API')
    } else {
      console.log('\n💡 Verifique:')
      console.log('   - Conexão com a internet')
      console.log('   - Configuração da chave da API')
      console.log('   - Modelo selecionado')
    }
    
    process.exit(1)
  }
}

// Executar teste
testPerplexityIntegration()
