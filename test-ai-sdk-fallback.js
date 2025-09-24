#!/usr/bin/env node

/**
 * Teste do AI SDK com múltiplos provedores
 * Este script testa a funcionalidade de fallback automático
 */

import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Schema simples para teste
const TestSchema = z.object({
  message: z.string(),
  provider: z.string(),
  timestamp: z.string()
});

const PROVIDERS = [
  {
    name: 'gemini',
    model: google('gemini-2.0-flash-exp'),
    description: 'Google Gemini - Rápido e eficiente'
  },
  {
    name: 'gpt-4o-mini',
    model: openai('gpt-4o-mini'),
    description: 'OpenAI GPT-4o Mini - Equilibrio entre velocidade e qualidade'
  },
  {
    name: 'gpt-5',
    model: openai('gpt-5'),
    description: 'OpenAI GPT-5 - Máxima qualidade e capacidade'
  }
];

async function testProvider(provider: any, topic: string) {
  try {
    console.log(`\n🧪 Testando ${provider.name} (${provider.description})...`);
    
    const startTime = Date.now();
    
    const result = await generateObject({
      model: provider.model,
      schema: TestSchema,
      prompt: `Responda sobre o tópico "${topic}" em uma mensagem curta e educativa.`,
      maxTokens: 100,
      temperature: 0.7,
    });

    const duration = Date.now() - startTime;
    
    console.log(`✅ Sucesso com ${provider.name} em ${duration}ms`);
    console.log(`📝 Resposta: ${result.object.message}`);
    console.log(`🔧 Provedor: ${result.object.provider}`);
    console.log(`⏰ Timestamp: ${result.object.timestamp}`);
    
    return {
      success: true,
      provider: provider.name,
      duration,
      result: result.object,
      usage: result.usage
    };

  } catch (error) {
    console.error(`❌ Erro com ${provider.name}:`, error instanceof Error ? error.message : 'Erro desconhecido');
    return {
      success: false,
      provider: provider.name,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

async function testFallback(topic: string) {
  console.log(`\n🚀 Iniciando teste de fallback para tópico: "${topic}"`);
  console.log('=' .repeat(60));
  
  const results = [];
  
  for (const provider of PROVIDERS) {
    const result = await testProvider(provider, topic);
    results.push(result);
    
    if (result.success) {
      console.log(`\n🎉 Teste concluído com sucesso usando ${provider.name}!`);
      break;
    }
    
    if (provider !== PROVIDERS[PROVIDERS.length - 1]) {
      const nextProvider = PROVIDERS[PROVIDERS.indexOf(provider) + 1];
      console.log(`\n🔄 Fallback: Tentando ${nextProvider.name}...`);
    }
  }
  
  console.log('\n📊 Resumo dos Resultados:');
  console.log('=' .repeat(60));
  
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`✅ ${result.provider}: Sucesso em ${result.duration}ms`);
    } else {
      console.log(`❌ ${result.provider}: ${result.error}`);
    }
  });
  
  const successfulResults = results.filter(r => r.success);
  if (successfulResults.length > 0) {
    console.log(`\n🎯 Teste concluído com sucesso! Provedor usado: ${successfulResults[0].provider}`);
  } else {
    console.log(`\n💥 Todos os provedores falharam!`);
  }
  
  return results;
}

// Executar teste
async function main() {
  const topic = process.argv[2] || 'fotossíntese';
  
  try {
    await testFallback(topic);
  } catch (error) {
    console.error('💥 Erro no teste:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { testFallback, testProvider };
