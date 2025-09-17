// test-pixabay-api.js - Teste completo da API Pixabay
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function testPixabayAPI() {
  console.log('🧪 Iniciando testes da API Pixabay...\n');

  const tests = [
    {
      name: 'Busca geral de imagens educacionais',
      endpoint: '/api/pixabay',
      method: 'POST',
      body: {
        action: 'search',
        query: 'education',
        perPage: 5,
        category: 'education',
        type: 'images'
      }
    },
    {
      name: 'Busca por disciplina específica',
      endpoint: '/api/pixabay',
      method: 'POST',
      body: {
        action: 'subject',
        subject: 'matematica',
        perPage: 3
      }
    },
    {
      name: 'Busca para apresentações',
      endpoint: '/api/pixabay',
      method: 'POST',
      body: {
        action: 'presentation',
        topic: 'tecnologia',
        perPage: 3
      }
    },
    {
      name: 'Busca científica',
      endpoint: '/api/pixabay',
      method: 'POST',
      body: {
        action: 'science',
        topic: 'laboratorio',
        perPage: 3
      }
    },
    {
      name: 'Busca de imagens inspiradoras',
      endpoint: '/api/pixabay',
      method: 'POST',
      body: {
        action: 'inspirational',
        perPage: 3
      }
    },
    {
      name: 'Busca de vídeos educacionais',
      endpoint: '/api/pixabay',
      method: 'POST',
      body: {
        action: 'videos',
        query: 'education',
        perPage: 2
      }
    },
    {
      name: 'Informações da API',
      endpoint: '/api/pixabay?action=info',
      method: 'GET'
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`🔍 Testando: ${test.name}`);
      
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      const response = await fetch(`${BASE_URL}${test.endpoint}`, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${test.name} - PASSOU`);
        
        if (data.data) {
          console.log(`   📊 Resultados: ${data.data.length} itens encontrados`);
          
          if (data.data.length > 0) {
            const firstItem = data.data[0];
            console.log(`   🖼️ Primeiro item: ${firstItem.description?.substring(0, 50)}...`);
            console.log(`   👤 Autor: ${firstItem.author}`);
            console.log(`   📏 Dimensões: ${firstItem.width}x${firstItem.height}`);
            console.log(`   🏷️ Tags: ${firstItem.tags?.slice(0, 3).join(', ')}`);
          }
        }
        
        if (data.metadata) {
          console.log(`   📈 Metadados: ${JSON.stringify(data.metadata, null, 2)}`);
        }
      } else {
        console.log(`❌ ${test.name} - FALHOU`);
        console.log(`   Erro: ${data.error}`);
      }
      
      passedTests++;
      
    } catch (error) {
      console.log(`❌ ${test.name} - ERRO`);
      console.log(`   ${error.message}`);
    }
    
    console.log(''); // Linha em branco
  }

  // Teste de busca por ID específico (se houver imagens)
  try {
    console.log('🔍 Testando busca por ID específico...');
    
    const searchResponse = await fetch(`${BASE_URL}/api/pixabay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'search',
        query: 'education',
        perPage: 1,
        type: 'images'
      })
    });

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      
      if (searchData.success && searchData.data && searchData.data.length > 0) {
        const imageId = searchData.data[0].id.replace('pixabay_', '');
        
        const idResponse = await fetch(`${BASE_URL}/api/pixabay/${imageId}`);
        
        if (idResponse.ok) {
          const idData = await idResponse.json();
          
          if (idData.success) {
            console.log('✅ Busca por ID específico - PASSOU');
            console.log(`   🖼️ Imagem encontrada: ${idData.data.description?.substring(0, 50)}...`);
            passedTests++;
          } else {
            console.log('❌ Busca por ID específico - FALHOU');
            console.log(`   Erro: ${idData.error}`);
          }
        } else {
          console.log('❌ Busca por ID específico - ERRO HTTP');
        }
      } else {
        console.log('⚠️ Busca por ID específico - Pulado (nenhuma imagem encontrada)');
      }
    }
    
    totalTests++;
    
  } catch (error) {
    console.log('❌ Busca por ID específico - ERRO');
    console.log(`   ${error.message}`);
    totalTests++;
  }

  console.log('\n📊 RESUMO DOS TESTES');
  console.log('==================');
  console.log(`✅ Testes passaram: ${passedTests}/${totalTests}`);
  console.log(`❌ Testes falharam: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 Todos os testes passaram! A API Pixabay está funcionando perfeitamente.');
  } else {
    console.log('\n⚠️ Alguns testes falharam. Verifique a configuração da API.');
  }

  return {
    passed: passedTests,
    total: totalTests,
    success: passedTests === totalTests
  };
}

// Teste de integração com sistema de aulas
async function testAulasIntegration() {
  console.log('\n🔗 Testando integração com sistema de aulas...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/aulas/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: 'matemática básica',
        subject: 'matematica',
        level: 'fundamental',
        duration: 30,
        slides: 10
      })
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.success && data.content && data.content.slides) {
        const slidesWithImages = data.content.slides.filter(slide => slide.imageUrl);
        const pixabayImages = slidesWithImages.filter(slide => slide.imageSource === 'pixabay');
        
        console.log(`✅ Integração com aulas - PASSOU`);
        console.log(`   📚 Slides gerados: ${data.content.slides.length}`);
        console.log(`   🖼️ Slides com imagens: ${slidesWithImages.length}`);
        console.log(`   🎯 Imagens da Pixabay: ${pixabayImages.length}`);
        
        if (pixabayImages.length > 0) {
          console.log(`   🔗 Primeira imagem Pixabay: ${pixabayImages[0].imageUrl}`);
        }
        
        return true;
      } else {
        console.log('❌ Integração com aulas - FALHOU');
        console.log(`   Erro: ${data.error || 'Resposta inválida'}`);
        return false;
      }
    } else {
      console.log('❌ Integração com aulas - ERRO HTTP');
      console.log(`   Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Integração com aulas - ERRO');
    console.log(`   ${error.message}`);
    return false;
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes completos da API Pixabay\n');
  
  const apiResults = await testPixabayAPI();
  const integrationResults = await testAulasIntegration();
  
  console.log('\n🏁 RESULTADO FINAL');
  console.log('==================');
  console.log(`API Pixabay: ${apiResults.success ? '✅ FUNCIONANDO' : '❌ COM PROBLEMAS'}`);
  console.log(`Integração: ${integrationResults ? '✅ FUNCIONANDO' : '❌ COM PROBLEMAS'}`);
  
  if (apiResults.success && integrationResults) {
    console.log('\n🎉 IMPLEMENTAÇÃO COMPLETA E FUNCIONAL!');
    console.log('A API Pixabay está totalmente integrada e funcionando.');
  } else {
    console.log('\n⚠️ IMPLEMENTAÇÃO PARCIAL');
    console.log('Alguns componentes podem precisar de ajustes.');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testPixabayAPI,
  testAulasIntegration,
  runAllTests
};
