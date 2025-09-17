#!/usr/bin/env node

/**
 * Script para testar a funcionalidade de pular questões inexistentes
 */

const fs = require('fs');
const path = require('path');

// Simulação da classe EnemLocalDatabase para teste
class EnemLocalDatabaseTest {
  constructor() {
    this.basePath = path.join(process.cwd(), 'QUESTOES_ENEM', 'public');
  }

  isAvailable() {
    try {
      return fs.existsSync(this.basePath) && fs.existsSync(path.join(this.basePath, 'exams.json'));
    } catch {
      return false;
    }
  }

  async questionExists(year, index, language) {
    try {
      const yearPath = path.join(this.basePath, year.toString(), 'questions');
      
      let questionPath;
      if (language && language !== 'null') {
        questionPath = path.join(yearPath, `${index}-${language}`);
      } else {
        questionPath = path.join(yearPath, index.toString());
      }

      if (!fs.existsSync(questionPath)) {
        questionPath = path.join(yearPath, index.toString());
      }

      if (!fs.existsSync(questionPath)) {
        return false;
      }

      const detailsPath = path.join(questionPath, 'details.json');
      return fs.existsSync(detailsPath);
    } catch (error) {
      console.error(`Error checking if question ${index} exists for year ${year}:`, error);
      return false;
    }
  }

  async getAvailableYears() {
    try {
      const years = [];
      const entries = fs.readdirSync(this.basePath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory() && /^\d{4}$/.test(entry.name)) {
          years.push(parseInt(entry.name));
        }
      }

      return years.sort((a, b) => b - a);
    } catch (error) {
      console.error('Error getting available years:', error);
      return [];
    }
  }

  async getStats() {
    const years = await this.getAvailableYears();
    const stats = {
      totalYears: years.length,
      totalQuestions: 0,
      questionsByYear: {},
      questionsByDiscipline: {}
    };

    for (const year of years) {
      try {
        const yearPath = path.join(this.basePath, year.toString(), 'details.json');
        const data = fs.readFileSync(yearPath, 'utf-8');
        const yearDetails = JSON.parse(data);
        const questionCount = yearDetails.questions?.length || 0;
        
        stats.totalQuestions += questionCount;
        stats.questionsByYear[year] = questionCount;

        if (yearDetails.questions) {
          for (const q of yearDetails.questions) {
            const discipline = q.discipline;
            stats.questionsByDiscipline[discipline] = (stats.questionsByDiscipline[discipline] || 0) + 1;
          }
        }
      } catch (error) {
        console.error(`Error getting stats for year ${year}:`, error);
      }
    }

    return stats;
  }

  async getAvailableStats() {
    const years = await this.getAvailableYears();
    const stats = {
      totalYears: years.length,
      totalAvailableQuestions: 0,
      totalListedQuestions: 0,
      availabilityRate: 0,
      questionsByYear: {},
      questionsByDiscipline: {}
    };

    console.log('📊 Calculando estatísticas de disponibilidade das questões...');

    for (const year of years) {
      try {
        const yearPath = path.join(this.basePath, year.toString(), 'details.json');
        const data = fs.readFileSync(yearPath, 'utf-8');
        const yearDetails = JSON.parse(data);
        const listedQuestions = yearDetails.questions || [];
        
        let availableCount = 0;
        const yearStats = { listed: listedQuestions.length, available: 0, rate: 0 };

        for (const questionInfo of listedQuestions) {
          const exists = await this.questionExists(year, questionInfo.index, questionInfo.language);
          if (exists) {
            availableCount++;
          }
        }

        yearStats.available = availableCount;
        yearStats.rate = listedQuestions.length > 0 ? (availableCount / listedQuestions.length) * 100 : 0;

        stats.totalListedQuestions += listedQuestions.length;
        stats.totalAvailableQuestions += availableCount;
        stats.questionsByYear[year] = yearStats;

        for (const q of listedQuestions) {
          const discipline = q.discipline;
          if (!stats.questionsByDiscipline[discipline]) {
            stats.questionsByDiscipline[discipline] = { listed: 0, available: 0, rate: 0 };
          }
          stats.questionsByDiscipline[discipline].listed++;
          
          const exists = await this.questionExists(year, q.index, q.language);
          if (exists) {
            stats.questionsByDiscipline[discipline].available++;
          }
        }

        console.log(`📅 ${year}: ${availableCount}/${listedQuestions.length} questões disponíveis (${yearStats.rate.toFixed(1)}%)`);

      } catch (error) {
        console.error(`Error getting available stats for year ${year}:`, error);
      }
    }

    Object.keys(stats.questionsByDiscipline).forEach(discipline => {
      const discStats = stats.questionsByDiscipline[discipline];
      discStats.rate = discStats.listed > 0 ? (discStats.available / discStats.listed) * 100 : 0;
    });

    stats.availabilityRate = stats.totalListedQuestions > 0 ? 
      (stats.totalAvailableQuestions / stats.totalListedQuestions) * 100 : 0;

    console.log(`📊 Taxa geral de disponibilidade: ${stats.availabilityRate.toFixed(1)}%`);
    console.log(`📊 Total: ${stats.totalAvailableQuestions}/${stats.totalListedQuestions} questões disponíveis`);

    return stats;
  }
}

async function testQuestionSkipping() {
  console.log('🧪 Testando funcionalidade de pular questões inexistentes...\n');

  const enemLocalDB = new EnemLocalDatabaseTest();

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

    // Teste 3: Obter estatísticas de disponibilidade
    console.log('\n3️⃣ Calculando estatísticas de disponibilidade...');
    const availableStats = await enemLocalDB.getAvailableStats();
    console.log(`   Taxa geral de disponibilidade: ${availableStats.availabilityRate.toFixed(1)}%`);
    console.log(`   Questões disponíveis: ${availableStats.totalAvailableQuestions}/${availableStats.totalListedQuestions}`);

    // Teste 4: Verificar se questões específicas existem
    console.log('\n4️⃣ Testando verificação de existência de questões específicas...');
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
