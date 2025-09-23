#!/usr/bin/env node

/**
 * Teste para verificar a melhoria na busca por imagem
 * Testa especificamente o caso "física do terremoto" -> "terremoto"
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function testImageSearch(query, description) {
  console.log(`\n🔍 Testando: ${description}`);
  console.log(`Query: "${query}"`);
  
  try {
    const response = await fetch(`${API_BASE}/api/semantic-images?q=${encodeURIComponent(query)}&perProvider=6`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`✅ Resultados encontrados: ${data.count}`);
    console.log(`📊 Termo principal extraído: "${data.mainTerm}"`);
    console.log(`🔧 Consultas otimizadas: [${data.optimizedQueries.join(', ')}]`);
    
    if (data.items && data.items.length > 0) {
      console.log(`\n📸 Top ${Math.min(3, data.items.length)} imagens:`);
      data.items.slice(0, 3).forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.provider} - ${item.title || item.alt || 'Sem título'}`);
        console.log(`     Score: ${item.score ? (item.score * 100).toFixed(1) + '%' : 'N/A'}`);
        console.log(`     URL: ${item.url}`);
      });
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Teste de Melhoria na Busca por Imagem');
  console.log('=====================================');
  
  // Teste 1: Consulta educacional complexa
  await testImageSearch(
    'física do terremoto',
    'Consulta educacional complexa (deve extrair "terremoto")'
  );
  
  // Teste 2: Termo principal direto
  await testImageSearch(
    'terremoto',
    'Termo principal direto (para comparação)'
  );
  
  // Teste 3: Outro exemplo educacional
  await testImageSearch(
    'biologia da fotossíntese',
    'Outro exemplo educacional (deve extrair "fotossíntese")'
  );
  
  // Teste 4: Consulta com contexto
  await testImageSearch(
    'terremoto em geografia',
    'Consulta com contexto disciplinar'
  );
  
  // Teste 5: Termo simples
  await testImageSearch(
    'vulcão',
    'Termo simples para comparação'
  );
  
  console.log('\n✨ Testes concluídos!');
  console.log('\n📋 Resumo das melhorias:');
  console.log('• Extração automática de termos principais de consultas educacionais');
  console.log('• Busca otimizada com múltiplas consultas relacionadas');
  console.log('• Rerank semântico focado no termo principal');
  console.log('• Sugestões contextuais por disciplina');
  console.log('• Melhor precisão para temas específicos como "terremoto"');
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testImageSearch, runTests };
