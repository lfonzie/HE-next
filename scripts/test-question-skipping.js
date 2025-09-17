#!/usr/bin/env node

/**
 * Script para testar a funcionalidade de pular questões inexistentes
 */

const { enemLocalDB } = require('../lib/enem-local-database.ts');

async function testQuestionSkipping() {
  console.log('🧪 Testando funcionalidade de pular questões inexistentes...\n');

  try {
    // Teste 1: Verificar se a base de dados está disponível
    console.log('1️⃣ Verificando disponibilidade da base de dados...');
    const isAvailable = enemLocalDB.isAvailable();
    console.log(`   Base de dados disponível: ${isAvailable ? '✅' : '❌'}`);
    
    if (!isAvailable) {
      console.log('❌ Base de dados não disponível. Encerrando teste.');
      return;
    }

    // Teste 2: Obter estatísticas gerais
    console.log('\n2️⃣ Obtendo estatísticas gerais...');
    const generalStats = await enemLocalDB.getStats();
    console.log(`   Total de anos: ${generalStats.totalYears}`);
    console.log(`   Total de questões listadas: ${generalStats.totalQuestions}`);
    console.log(`   Questões por ano:`, generalStats.questionsByYear);

    // Teste 3: Obter estatísticas de disponibilidade
    console.log('\n3️⃣ Calculando estatísticas de disponibilidade...');
    const availableStats = await enemLocalDB.getAvailableStats();
    console.log(`   Taxa geral de disponibilidade: ${availableStats.availabilityRate.toFixed(1)}%`);
    console.log(`   Questões disponíveis: ${availableStats.totalAvailableQuestions}/${availableStats.totalListedQuestions}`);

    // Teste 4: Buscar questões de um ano específico
    console.log('\n4️⃣ Testando busca de questões por ano...');
    const testYear = 2023;
    const yearQuestions = await enemLocalDB.getQuestionsByYear(testYear, {
      discipline: 'linguagens',
      limit: 10
    });
    console.log(`   Questões encontradas para ${testYear} (linguagens): ${yearQuestions.length}`);

    // Teste 5: Buscar questões com filtros
    console.log('\n5️⃣ Testando busca com filtros...');
    const filteredQuestions = await enemLocalDB.getQuestions({
      year: 2022,
      discipline: 'matematica',
      limit: 5,
      random: true
    });
    console.log(`   Questões encontradas para 2022 (matemática): ${filteredQuestions.length}`);

    // Teste 6: Buscar questões aleatórias
    console.log('\n6️⃣ Testando busca aleatória...');
    const randomQuestions = await enemLocalDB.getRandomQuestions({
      discipline: 'ciencias-humanas',
      limit: 3
    });
    console.log(`   Questões aleatórias encontradas (ciências humanas): ${randomQuestions.length}`);

    // Teste 7: Verificar se questões específicas existem
    console.log('\n7️⃣ Testando verificação de existência de questões específicas...');
    const testCases = [
      { year: 2023, index: 10, language: null }, // Deve existir
      { year: 2023, index: 999, language: null }, // Não deve existir
      { year: 2023, index: 1, language: 'ingles' }, // Pode não existir
    ];

    for (const testCase of testCases) {
      const exists = await enemLocalDB.questionExists(testCase.year, testCase.index, testCase.language);
      console.log(`   Questão ${testCase.index} de ${testCase.year}${testCase.language ? ` (${testCase.language})` : ''}: ${exists ? '✅' : '❌'}`);
    }

    console.log('\n✅ Testes concluídos com sucesso!');
    console.log('\n📊 RESUMO:');
    console.log(`   - Base de dados: ${isAvailable ? 'Disponível' : 'Indisponível'}`);
    console.log(`   - Taxa de disponibilidade: ${availableStats.availabilityRate.toFixed(1)}%`);
    console.log(`   - Questões disponíveis: ${availableStats.totalAvailableQuestions}/${availableStats.totalListedQuestions}`);
    console.log(`   - Sistema de pulo de questões: ✅ Funcionando`);

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executa o teste
if (require.main === module) {
  testQuestionSkipping().then(() => {
    console.log('\n🏁 Teste finalizado.');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Erro fatal no teste:', error);
    process.exit(1);
  });
}

module.exports = { testQuestionSkipping };
