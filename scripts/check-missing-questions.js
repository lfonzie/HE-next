#!/usr/bin/env node

/**
 * Script para identificar questões que não existem mais nos arquivos JSON
 * Compara o arquivo details.json com os arquivos individuais das questões
 */

const fs = require('fs');
const path = require('path');

const QUESTOES_PATH = path.join(__dirname, '..', 'QUESTOES_ENEM', 'public');

function checkMissingQuestions() {
  console.log('🔍 Verificando questões que não existem mais nos arquivos JSON...\n');
  
  const years = getAvailableYears();
  const missingQuestions = [];
  const totalQuestions = [];
  
  for (const year of years) {
    console.log(`📅 Verificando ano ${year}...`);
    
    const yearPath = path.join(QUESTOES_PATH, year.toString());
    const detailsPath = path.join(yearPath, 'details.json');
    
    if (!fs.existsSync(detailsPath)) {
      console.log(`❌ Arquivo details.json não encontrado para ${year}`);
      continue;
    }
    
    try {
      const detailsData = fs.readFileSync(detailsPath, 'utf-8');
      const yearDetails = JSON.parse(detailsData);
      
      if (!yearDetails.questions || !Array.isArray(yearDetails.questions)) {
        console.log(`⚠️ Nenhuma questão encontrada no details.json para ${year}`);
        continue;
      }
      
      const questionsPath = path.join(yearPath, 'questions');
      if (!fs.existsSync(questionsPath)) {
        console.log(`❌ Pasta questions não encontrada para ${year}`);
        continue;
      }
      
      let yearMissing = [];
      let yearTotal = yearDetails.questions.length;
      
      for (const questionInfo of yearDetails.questions) {
        totalQuestions.push({
          year,
          index: questionInfo.index,
          discipline: questionInfo.discipline,
          language: questionInfo.language
        });
        
        // Determina o caminho da questão baseado no idioma
        let questionPath;
        if (questionInfo.language && questionInfo.language !== 'null') {
          questionPath = path.join(questionsPath, `${questionInfo.index}-${questionInfo.language}`);
        } else {
          questionPath = path.join(questionsPath, questionInfo.index.toString());
        }
        
        // Se não encontrou com idioma, tenta sem
        if (!fs.existsSync(questionPath)) {
          questionPath = path.join(questionsPath, questionInfo.index.toString());
        }
        
        if (!fs.existsSync(questionPath)) {
          yearMissing.push({
            year,
            index: questionInfo.index,
            discipline: questionInfo.discipline,
            language: questionInfo.language,
            expectedPath: questionPath
          });
          continue;
        }
        
        // Verifica se existe o arquivo details.json dentro da pasta da questão
        const questionDetailsPath = path.join(questionPath, 'details.json');
        if (!fs.existsSync(questionDetailsPath)) {
          yearMissing.push({
            year,
            index: questionInfo.index,
            discipline: questionInfo.discipline,
            language: questionInfo.language,
            expectedPath: questionPath,
            reason: 'details.json não encontrado'
          });
        }
      }
      
      if (yearMissing.length > 0) {
        console.log(`❌ ${yearMissing.length} questões não encontradas em ${year}:`);
        yearMissing.forEach(q => {
          console.log(`   - Questão ${q.index} (${q.discipline})${q.language ? ` - ${q.language}` : ''} - ${q.reason || 'pasta não encontrada'}`);
        });
        missingQuestions.push(...yearMissing);
      } else {
        console.log(`✅ Todas as ${yearTotal} questões encontradas em ${year}`);
      }
      
    } catch (error) {
      console.error(`❌ Erro ao processar ${year}:`, error.message);
    }
    
    console.log('');
  }
  
  // Relatório final
  console.log('📊 RELATÓRIO FINAL:');
  console.log(`Total de questões listadas: ${totalQuestions.length}`);
  console.log(`Questões não encontradas: ${missingQuestions.length}`);
  console.log(`Taxa de disponibilidade: ${((totalQuestions.length - missingQuestions.length) / totalQuestions.length * 100).toFixed(2)}%`);
  
  if (missingQuestions.length > 0) {
    console.log('\n❌ QUESTÕES NÃO ENCONTRADAS POR ANO:');
    const byYear = {};
    missingQuestions.forEach(q => {
      if (!byYear[q.year]) byYear[q.year] = [];
      byYear[q.year].push(q);
    });
    
    Object.keys(byYear).sort().forEach(year => {
      console.log(`\n${year}: ${byYear[year].length} questões`);
      byYear[year].forEach(q => {
        console.log(`  - Questão ${q.index} (${q.discipline})${q.language ? ` - ${q.language}` : ''}`);
      });
    });
    
    // Salva relatório em arquivo
    const reportPath = path.join(__dirname, '..', 'missing-questions-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalQuestions: totalQuestions.length,
      missingQuestions: missingQuestions.length,
      availabilityRate: ((totalQuestions.length - missingQuestions.length) / totalQuestions.length * 100).toFixed(2),
      missingByYear: byYear,
      missingQuestions: missingQuestions
    }, null, 2));
    
    console.log(`\n📄 Relatório detalhado salvo em: ${reportPath}`);
  }
  
  return missingQuestions;
}

function getAvailableYears() {
  try {
    const entries = fs.readdirSync(QUESTOES_PATH, { withFileTypes: true });
    const years = entries
      .filter(entry => entry.isDirectory() && /^\d{4}$/.test(entry.name))
      .map(entry => parseInt(entry.name))
      .sort((a, b) => b - a); // Ordem decrescente
    
    return years;
  } catch (error) {
    console.error('Erro ao listar anos disponíveis:', error.message);
    return [];
  }
}

// Executa o script
if (require.main === module) {
  try {
    const missingQuestions = checkMissingQuestions();
    process.exit(missingQuestions.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('Erro ao executar script:', error);
    process.exit(1);
  }
}

module.exports = { checkMissingQuestions };
