#!/usr/bin/env node

/**
 * Script para testar o endpoint de estatísticas do ENEM
 */

const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testStatsEndpoint() {
  console.log('🧪 Testando endpoint de estatísticas do ENEM...\n');

  try {
    // Teste 1: GET /api/enem/stats
    console.log('1️⃣ Testando GET /api/enem/stats...');
    const getResponse = await makeRequest('/api/enem/stats');
    
    if (getResponse.status === 200) {
      console.log('   ✅ Endpoint funcionando');
      console.log(`   📊 Status: ${getResponse.data.summary?.status || 'unknown'}`);
      console.log(`   📊 Taxa de disponibilidade: ${getResponse.data.questions?.availabilityRate?.toFixed(1) || 'N/A'}%`);
      console.log(`   📊 Questões disponíveis: ${getResponse.data.questions?.totalAvailable || 'N/A'}/${getResponse.data.questions?.totalListed || 'N/A'}`);
      console.log(`   📊 Anos disponíveis: ${getResponse.data.database?.totalYears || 'N/A'}`);
    } else {
      console.log(`   ❌ Erro ${getResponse.status}:`, getResponse.data);
    }

    // Teste 2: POST /api/enem/stats (refresh)
    console.log('\n2️⃣ Testando POST /api/enem/stats (refresh)...');
    const postResponse = await makeRequest('/api/enem/stats', 'POST', { action: 'refresh' });
    
    if (postResponse.status === 200) {
      console.log('   ✅ Refresh funcionando');
      console.log(`   📊 Taxa após refresh: ${postResponse.data.stats?.availabilityRate?.toFixed(1) || 'N/A'}%`);
    } else {
      console.log(`   ❌ Erro ${postResponse.status}:`, postResponse.data);
    }

    // Teste 3: POST com ação inválida
    console.log('\n3️⃣ Testando POST com ação inválida...');
    const invalidResponse = await makeRequest('/api/enem/stats', 'POST', { action: 'invalid' });
    
    if (invalidResponse.status === 400) {
      console.log('   ✅ Validação de ação funcionando');
    } else {
      console.log(`   ❌ Esperado erro 400, recebido ${invalidResponse.status}:`, invalidResponse.data);
    }

    console.log('\n✅ Testes do endpoint concluídos!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    console.log('\n💡 Dica: Certifique-se de que o servidor Next.js está rodando na porta 3000');
  }
}

// Executa o teste
if (require.main === module) {
  testStatsEndpoint().then(() => {
    console.log('\n🏁 Teste finalizado.');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Erro fatal no teste:', error);
    process.exit(1);
  });
}

module.exports = { testStatsEndpoint };
