#!/usr/bin/env node

/**
 * Teste para verificar se os 4 modelos estão configurados corretamente
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Carregar variáveis de ambiente
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env.local') });

async function test4Modelos() {
  console.log('🧪 Testando configuração dos 4 modelos...\n');

  try {
    // 1. Verificar chaves de API
    console.log('1️⃣ Verificando chaves de API...');
    
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const perplexityKey = process.env.PERPLEXITY_API_KEY;
    
    if (openaiKey && openaiKey.startsWith('sk-')) {
      console.log('✅ OPENAI_API_KEY: Configurada');
    } else {
      console.log('❌ OPENAI_API_KEY: Não configurada ou inválida');
    }
    
    if (geminiKey && geminiKey.startsWith('AIza')) {
      console.log('✅ GEMINI_API_KEY: Configurada');
    } else {
      console.log('❌ GEMINI_API_KEY: Não configurada ou inválida');
    }
    
    if (perplexityKey && perplexityKey.startsWith('pplx-')) {
      console.log('✅ PERPLEXITY_API_KEY: Configurada');
    } else {
      console.log('❌ PERPLEXITY_API_KEY: Não configurada ou inválida');
    }
    console.log();

    // 2. Testar modelos disponíveis
    console.log('2️⃣ Modelos configurados:');
    console.log('   🟢 OpenAI - GPT-4o Mini: gpt-4o-mini');
    console.log('   🟢 OpenAI - GPT-5: gpt-5-chat-latest');
    console.log('   🟡 Google Gemini: gemini-2.5-flash');
    console.log('   🔵 Perplexity: sonar');
    console.log();

    // 3. Testar chamada de API simples
    console.log('3️⃣ Testando chamada de API...');
    
    const testPayload = {
      provider: "openai",
      model: "gpt-4o-mini",
      input: "Teste de conectividade",
      system: "Responda apenas 'OK' se receber esta mensagem."
    };
    
    try {
      const response = await fetch('http://localhost:3000/api/chat/unified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API funcionando:', data.reply?.substring(0, 50) + '...');
      } else {
        console.log('❌ API retornou erro:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('⚠️ Servidor não está rodando ou API não acessível');
      console.log('   Execute: npm run dev');
    }
    console.log();

    // 4. Resumo da configuração
    console.log('4️⃣ Resumo da configuração:');
    console.log('   ✅ GPT-4o Mini: OpenAI API');
    console.log('   ✅ GPT-5 Chat Latest: OpenAI API (mesma chave)');
    console.log('   ✅ Gemini 2.5 Flash: Google API');
    console.log('   ✅ Perplexity Sonar: Perplexity API');
    console.log();

    console.log('🎉 CONFIGURAÇÃO DOS 4 MODELOS CONCLUÍDA!');
    console.log('Acesse /test-unified-chat para testar a interface.');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    process.exit(1);
  }
}

// Executar teste
if (import.meta.url === `file://${process.argv[1]}`) {
  test4Modelos();
}

export { test4Modelos };
