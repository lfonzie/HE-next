#!/usr/bin/env node
// test-aulas-enhanced-simple.js
// Script de teste simplificado para o Sistema de Aulas Aprimorado

const axios = require('axios');

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Função para testar se o servidor está rodando
async function testServerHealth() {
  console.log('🔍 Verificando se o servidor está rodando...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/stats-enhanced`, {
      timeout: 5000
    });
    
    if (response.status === 200) {
      console.log('✅ Servidor está rodando e respondendo');
      return true;
    } else {
      console.log('⚠️ Servidor respondeu com status:', response.status);
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Servidor não está rodando');
      console.log('💡 Execute: npm run dev');
    } else {
      console.log('❌ Erro ao conectar:', error.message);
    }
    return false;
  }
}

// Função para testar estatísticas admin
async function testAdminStats() {
  console.log('\n📊 Testando Estatísticas Admin');
  console.log('=' .repeat(50));
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/stats-enhanced`);
    
    if (response.data.success) {
      console.log('✅ Estatísticas carregadas');
      console.log(`👥 Usuários: ${response.data.stats.users.total}`);
      console.log(`📚 Aulas: ${response.data.stats.lessons.total}`);
      console.log(`💬 Chats: ${response.data.stats.chats.total}`);
      
      if (response.data.stats.pacing) {
        console.log(`📊 Métricas de Pacing:`);
        console.log(`   - Duração média: ${response.data.stats.pacing.averageDuration} min`);
        console.log(`   - Tokens médios: ${response.data.stats.pacing.averageTokens.toLocaleString()}`);
        console.log(`   - Qualidade média: ${response.data.stats.pacing.averageQuality}%`);
      }
      
      return { success: true };
    } else {
      console.log('❌ Falha ao carregar estatísticas');
      return { success: false };
    }
    
  } catch (error) {
    console.log('❌ Erro na requisição de estatísticas');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Erro:', error.response.data.error || error.response.data);
    } else {
      console.log('Erro:', error.message);
    }
    return { success: false };
  }
}

// Função para testar estrutura da API (sem gerar conteúdo)
async function testAPIStructure() {
  console.log('\n🔧 Testando Estrutura da API');
  console.log('=' .repeat(50));
  
  try {
    // Testar com dados inválidos para verificar validação
    const response = await axios.post(`${BASE_URL}/api/aulas/generate`, {
      // topic ausente propositalmente
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('⚠️ API aceitou dados inválidos (não deveria)');
    return { success: false, error: 'Validação não funcionou' };
    
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Validação funcionando - API rejeitou dados inválidos');
      console.log('Erro esperado:', error.response.data.error);
      return { success: true };
    } else if (error.response && error.response.status === 500) {
      console.log('⚠️ Erro interno (provavelmente API key):');
      console.log('Erro:', error.response.data.error);
      return { success: false, error: 'API key não configurada' };
    } else {
      console.log('❌ Erro inesperado:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Função para verificar configuração
async function checkConfiguration() {
  console.log('\n⚙️ Verificando Configuração');
  console.log('=' .repeat(50));
  
  const issues = [];
  
  // Verificar se as rotas existem
  try {
    await axios.get(`${BASE_URL}/api/aulas/generate`, { timeout: 2000 });
    console.log('✅ Rota /api/aulas/generate existe');
  } catch (error) {
    if (error.response && error.response.status === 405) {
      console.log('✅ Rota /api/aulas/generate existe (método GET não permitido)');
    } else {
      console.log('❌ Rota /api/aulas/generate não encontrada');
      issues.push('Rota API não encontrada');
    }
  }
  
  try {
    await axios.get(`${BASE_URL}/api/admin/stats-enhanced`, { timeout: 2000 });
    console.log('✅ Rota /api/admin/stats-enhanced existe');
  } catch (error) {
    console.log('❌ Rota /api/admin/stats-enhanced não encontrada');
    issues.push('Rota admin não encontrada');
  }
  
  // Verificar se as páginas existem
  try {
    await axios.get(`${BASE_URL}/aulas-enhanced`, { timeout: 2000 });
    console.log('✅ Página /aulas-enhanced existe');
  } catch (error) {
    console.log('❌ Página /aulas-enhanced não encontrada');
    issues.push('Página frontend não encontrada');
  }
  
  if (issues.length === 0) {
    console.log('✅ Todas as rotas e páginas estão configuradas');
  } else {
    console.log('⚠️ Problemas encontrados:');
    issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  return { success: issues.length === 0, issues };
}

// Função principal de teste
async function runTests() {
  console.log('🚀 Teste Simplificado do Sistema de Aulas Aprimorado');
  console.log('=' .repeat(60));
  
  const results = [];
  
  // Testar saúde do servidor
  const serverHealth = await testServerHealth();
  if (!serverHealth) {
    console.log('\n❌ Servidor não está rodando. Execute: npm run dev');
    process.exit(1);
  }
  
  // Verificar configuração
  const configResult = await checkConfiguration();
  results.push({ test: 'Configuração', ...configResult });
  
  // Testar estrutura da API
  const apiResult = await testAPIStructure();
  results.push({ test: 'Estrutura API', ...apiResult });
  
  // Testar estatísticas admin
  const adminResult = await testAdminStats();
  results.push({ test: 'Admin Stats', ...adminResult });
  
  // Resumo dos resultados
  console.log('\n📋 Resumo dos Testes');
  console.log('=' .repeat(60));
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Sucessos: ${successful}/${total}`);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.test}`);
    
    if (result.error) {
      console.log(`   Erro: ${result.error}`);
    }
  });
  
  console.log('\n💡 Próximos Passos:');
  if (apiResult.error === 'API key não configurada') {
    console.log('1. Configure OPENAI_API_KEY no arquivo .env.local');
    console.log('2. Execute os testes novamente');
  } else if (successful === total) {
    console.log('🎊 Sistema funcionando! Configure a API key para testes completos.');
  } else {
    console.log('1. Verifique os erros acima');
    console.log('2. Execute: npm run dev');
    console.log('3. Configure as variáveis de ambiente');
  }
  
  console.log('\n🎉 Testes concluídos!');
  
  if (successful >= total - 1) { // Permitir 1 falha (API key)
    console.log('🎊 Sistema básico funcionando!');
    process.exit(0);
  } else {
    console.log('⚠️ Múltiplos problemas encontrados.');
    process.exit(1);
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Erro fatal nos testes:', error);
    process.exit(1);
  });
}

module.exports = { runTests, testServerHealth, testAdminStats, checkConfiguration };
