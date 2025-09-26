#!/usr/bin/env node

/**
 * Script para testar a integração com a API do Freepik
 * Testa a nova API específica para aulas
 */

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

/**
 * Testa a API do Freepik diretamente
 */
async function testFreepikDirectAPI() {
  log('\n🔍 Testando API do Freepik diretamente...', 'bold');
  
  const testQueries = [
    'mathematics education',
    'science laboratory',
    'biology cell',
    'chemistry molecules',
    'physics experiment'
  ];

  for (const query of testQueries) {
    try {
      logInfo(`Testando query: "${query}"`);
      
      const url = new URL('https://api.freepik.com/v1/resources');
      url.searchParams.set('query', query);
      url.searchParams.set('limit', '3');
      url.searchParams.set('type', 'images');
      url.searchParams.set('premium', 'false');
      url.searchParams.set('safe_search', 'true');
      url.searchParams.set('sort', 'relevance');
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'x-freepik-api-key': process.env.FREEPIK_API_KEY || 'FPSXadeac0afae95aa5f843f43e6682fd15f',
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          logSuccess(`Encontradas ${data.data.length} imagens para "${query}"`);
          data.data.forEach((item, index) => {
            const license = item.licenses?.[0]?.type === 'freemium' ? 'Free' : 'Premium';
            log(`  ${index + 1}. ${item.title} (${license})`, 'blue');
          });
        } else {
          logWarning(`Nenhuma imagem encontrada para "${query}"`);
        }
      } else {
        const errorData = await response.json();
        logError(`Erro na API Freepik: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      logError(`Erro ao testar "${query}": ${error.message}`);
    }
    
    // Pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

/**
 * Testa a nova API específica para aulas
 */
async function testAulasFreepikAPI() {
  log('\n🎓 Testando API específica para aulas...', 'bold');
  
  const testCases = [
    { query: 'matemática', subject: 'matemática' },
    { query: 'ciência', subject: 'ciências' },
    { query: 'história do Brasil', subject: 'história' },
    { query: 'fotossíntese', subject: 'biologia' },
    { query: 'tabela periódica', subject: 'química' }
  ];

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  for (const testCase of testCases) {
    try {
      logInfo(`Testando: "${testCase.query}" (assunto: ${testCase.subject})`);
      
      const response = await fetch(`${BASE_URL}/api/aulas/freepik-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: testCase.query,
          subject: testCase.subject,
          count: 3
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.images && data.images.length > 0) {
          logSuccess(`API aulas encontrou ${data.images.length} imagens`);
          log(`  Método: ${data.searchMethod}`, 'blue');
          log(`  Fallback usado: ${data.fallbackUsed ? 'Sim' : 'Não'}`, 'blue');
          log(`  Query otimizada: "${data.optimizedQuery}"`, 'blue');
          
          data.images.forEach((img, index) => {
            log(`  ${index + 1}. ${img.title} (Score: ${img.score.toFixed(2)})`, 'blue');
          });
        } else {
          logWarning(`API aulas não encontrou imagens para "${testCase.query}"`);
          if (data.error) {
            logError(`Erro: ${data.error}`);
          }
        }
      } else {
        const errorData = await response.json();
        logError(`Erro na API aulas: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      logError(`Erro ao testar API aulas: ${error.message}`);
    }
    
    // Pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

/**
 * Função principal
 */
async function main() {
  log('🚀 Iniciando testes de integração Freepik para aulas', 'bold');
  log(`Chave API: ${(process.env.FREEPIK_API_KEY || 'FPSXadeac0afae95aa5f843f43e6682fd15f').substring(0, 10)}...`, 'blue');
  log(`Base URL: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}`, 'blue');
  
  // Verificar se a chave está configurada
  const apiKey = process.env.FREEPIK_API_KEY || 'FPSXadeac0afae95aa5f843f43e6682fd15f';
  if (!apiKey || apiKey === 'your-freepik-api-key-here') {
    logError('Chave da API do Freepik não configurada!');
    log('Configure a variável FREEPIK_API_KEY no arquivo .env.local', 'yellow');
    process.exit(1);
  }

  try {
    // Teste 1: API direta do Freepik
    await testFreepikDirectAPI();
    
    // Teste 2: API específica para aulas
    await testAulasFreepikAPI();
    
    log('\n🎉 Todos os testes concluídos!', 'green');
    
  } catch (error) {
    logError(`Erro geral: ${error.message}`);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  testFreepikDirectAPI,
  testAulasFreepikAPI
};
