#!/usr/bin/env node

/**
 * Teste da API de Chat - Verificação de Correções
 * 
 * Este script testa a API de chat para verificar se as correções
 * resolveram o erro HTTP 500.
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000';

async function testChatAPI() {
  console.log('🧪 Testando API de Chat...\n');

  try {
    // Teste 1: Verificar se a API está respondendo
    console.log('1️⃣ Testando endpoint básico...');
    const response = await fetch(`${API_BASE}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Olá! Como você está?',
        context: {
          module: 'atendimento',
          history: []
        }
      })
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   ❌ Erro: ${errorText}`);
      return false;
    }

    console.log('   ✅ API respondendo corretamente');

    // Teste 2: Verificar streaming
    console.log('\n2️⃣ Testando streaming...');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let hasContent = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              console.log('   ✅ Streaming concluído');
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                hasContent = true;
                console.log(`   📝 Conteúdo recebido: "${parsed.content.substring(0, 50)}..."`);
              }
              if (parsed.metadata) {
                console.log(`   🔧 Metadados: ${JSON.stringify(parsed.metadata)}`);
              }
            } catch (e) {
              // Ignorar linhas que não são JSON válido
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (hasContent) {
      console.log('   ✅ Streaming funcionando corretamente');
    } else {
      console.log('   ⚠️  Nenhum conteúdo recebido via streaming');
    }

    // Teste 3: Verificar diferentes módulos
    console.log('\n3️⃣ Testando diferentes módulos...');
    const modules = ['professor', 'ti', 'atendimento'];
    
    for (const module of modules) {
      try {
        const moduleResponse = await fetch(`${API_BASE}/api/chat/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Teste do módulo ${module}`,
            context: {
              module: module,
              history: []
            }
          })
        });

        if (moduleResponse.ok) {
          console.log(`   ✅ Módulo ${module}: OK`);
        } else {
          console.log(`   ❌ Módulo ${module}: ${moduleResponse.status}`);
        }
      } catch (error) {
        console.log(`   ❌ Módulo ${module}: ${error.message}`);
      }
    }

    console.log('\n🎉 Testes concluídos com sucesso!');
    return true;

  } catch (error) {
    console.log(`\n❌ Erro durante os testes: ${error.message}`);
    console.log('\n🔍 Possíveis causas:');
    console.log('   - Servidor não está rodando (npm run dev)');
    console.log('   - Variável OPENAI_API_KEY não configurada');
    console.log('   - Problemas de rede ou firewall');
    console.log('   - Erro interno no servidor');
    
    return false;
  }
}

// Verificar se está rodando como script principal
if (require.main === module) {
  testChatAPI().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testChatAPI };
