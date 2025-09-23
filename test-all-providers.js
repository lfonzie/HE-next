#!/usr/bin/env node

/**
 * Script de Teste para Todos os Provedores de Imagens
 * Testa individualmente cada provedor e o sistema de busca inteligente
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

interface TestResult {
  provider: string;
  success: boolean;
  images: any[];
  count: number;
  error?: string;
  responseTime: number;
}

interface SmartSearchResult {
  success: boolean;
  images: any[];
  totalFound: number;
  sourcesUsed: string[];
  query: string;
  optimizedQuery: string;
  fallbackUsed: boolean;
}

async function testProvider(provider: string, query: string, subject: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    console.log(`\n🔍 Testando ${provider}...`);
    
    const response = await fetch(`${BASE_URL}/api/images/test-provider`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider,
        query,
        subject,
        count: 3
      }),
    });

    const data = await response.json();
    const responseTime = Date.now() - startTime;

    if (data.success) {
      console.log(`✅ ${provider}: ${data.count} imagens encontradas em ${responseTime}ms`);
      data.images.forEach((img: any, index: number) => {
        console.log(`   ${index + 1}. ${img.title || 'Sem título'} (${img.width}x${img.height})`);
      });
    } else {
      console.log(`❌ ${provider}: Falha - ${data.error}`);
    }

    return {
      provider,
      success: data.success,
      images: data.images || [],
      count: data.images?.length || 0,
      error: data.error,
      responseTime
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log(`❌ ${provider}: Erro de conexão - ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    
    return {
      provider,
      success: false,
      images: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      responseTime
    };
  }
}

async function testSmartSearch(query: string, subject: string): Promise<SmartSearchResult> {
  const startTime = Date.now();
  
  try {
    console.log(`\n🧠 Testando Busca Inteligente...`);
    
    const response = await fetch(`${BASE_URL}/api/images/smart-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        subject,
        count: 5
      }),
    });

    const data = await response.json();
    const responseTime = Date.now() - startTime;

    if (data.success) {
      console.log(`✅ Busca Inteligente: ${data.images.length} imagens encontradas em ${responseTime}ms`);
      console.log(`   Provedores utilizados: ${data.sourcesUsed.join(', ')}`);
      console.log(`   Query otimizada: "${data.optimizedQuery}"`);
      
      data.images.forEach((img: any, index: number) => {
        console.log(`   ${index + 1}. [${img.source}] ${img.title || 'Sem título'} (Score: ${img.relevanceScore})`);
      });
    } else {
      console.log(`❌ Busca Inteligente: Falha - ${data.error}`);
    }

    return data;
  } catch (error) {
    console.log(`❌ Busca Inteligente: Erro de conexão - ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    
    return {
      success: false,
      images: [],
      totalFound: 0,
      sourcesUsed: [],
      query,
      optimizedQuery: query,
      fallbackUsed: true
    };
  }
}

async function testEnvironmentVariables(): Promise<void> {
  console.log('\n🔧 Verificando Variáveis de Ambiente...');
  
  const envVars = [
    'UNSPLASH_ACCESS_KEY',
    'PIXABAY_API_KEY',
    'BING_SEARCH_API_KEY',
    'PEXELS_API_KEY'
  ];
  
  envVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      console.log(`✅ ${envVar}: Configurada (${value.substring(0, 8)}...)`);
    } else {
      console.log(`❌ ${envVar}: Não configurada`);
    }
  });
  
  console.log(`ℹ️  Wikimedia: Não requer API key (gratuito)`);
}

async function runAllTests(): Promise<void> {
  console.log('🧪 TESTE COMPLETO DE PROVEDORES DE IMAGENS');
  console.log('==========================================');
  
  // Verificar variáveis de ambiente
  await testEnvironmentVariables();
  
  // Configurações de teste
  const testQueries = [
    { query: 'photosynthesis biology', subject: 'biologia' },
    { query: 'mathematics equations', subject: 'matemática' },
    { query: 'chemistry laboratory', subject: 'química' }
  ];
  
  const providers = ['unsplash', 'pixabay', 'wikimedia', 'bing', 'pexels'];
  
  for (const testCase of testQueries) {
    console.log(`\n\n📚 TESTE: "${testCase.query}" (${testCase.subject})`);
    console.log('='.repeat(50));
    
    // Testar cada provedor individualmente
    const providerResults: TestResult[] = [];
    for (const provider of providers) {
      const result = await testProvider(provider, testCase.query, testCase.subject);
      providerResults.push(result);
    }
    
    // Testar busca inteligente
    const smartResult = await testSmartSearch(testCase.query, testCase.subject);
    
    // Resumo dos resultados
    console.log(`\n📊 RESUMO DOS RESULTADOS:`);
    console.log(`   Query: "${testCase.query}"`);
    console.log(`   Assunto: ${testCase.subject}`);
    
    const successfulProviders = providerResults.filter(r => r.success);
    const totalImages = providerResults.reduce((sum, r) => sum + r.count, 0);
    const avgResponseTime = providerResults.reduce((sum, r) => sum + r.responseTime, 0) / providerResults.length;
    
    console.log(`   Provedores funcionando: ${successfulProviders.length}/5`);
    console.log(`   Total de imagens encontradas: ${totalImages}`);
    console.log(`   Tempo médio de resposta: ${Math.round(avgResponseTime)}ms`);
    console.log(`   Busca inteligente: ${smartResult.success ? '✅ Sucesso' : '❌ Falha'}`);
    
    if (smartResult.success) {
      console.log(`   Provedores utilizados pela busca inteligente: ${smartResult.sourcesUsed.join(', ')}`);
    }
    
    // Aguardar um pouco entre os testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n\n🎉 TESTE COMPLETO FINALIZADO!');
  console.log('==========================================');
}

// Executar testes se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { testProvider, testSmartSearch, runAllTests };

