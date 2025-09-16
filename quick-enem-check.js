#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Função para verificar questões problemáticas rapidamente
function quickCheck() {
    console.log('=== VERIFICAÇÃO RÁPIDA DO BANCO ENEM ===\n');
    
    const basePath = path.join(__dirname, 'QUESTOES_ENEM', 'public');
    
    if (!fs.existsSync(basePath)) {
        console.log('❌ Diretório QUESTOES_ENEM/public não encontrado!');
        return;
    }
    
    const years = fs.readdirSync(basePath).filter(year => 
        fs.statSync(path.join(basePath, year)).isDirectory() && 
        /^\d{4}$/.test(year)
    ).sort();
    
    console.log(`Anos encontrados: ${years.join(', ')}\n`);
    
    let totalQuestions = 0;
    let totalProblematic = 0;
    
    for (const year of years) {
        const yearPath = path.join(basePath, year);
        const questionsDir = path.join(yearPath, 'questions');
        
        if (!fs.existsSync(questionsDir)) {
            console.log(`❌ ${year}: Diretório questions não encontrado`);
            continue;
        }
        
        const questionDirs = fs.readdirSync(questionsDir);
        let yearProblematic = 0;
        
        for (const questionDir of questionDirs) {
            const questionPath = path.join(questionsDir, questionDir);
            if (fs.statSync(questionPath).isDirectory()) {
                const detailsFile = path.join(questionPath, 'details.json');
                if (fs.existsSync(detailsFile)) {
                    try {
                        const content = fs.readFileSync(detailsFile, 'utf8');
                        const question = JSON.parse(content);
                        
                        totalQuestions++;
                        
                        // Verificações básicas
                        const problems = [];
                        
                        // Contexto vazio
                        if (!question.context || question.context.trim().length < 10) {
                            problems.push('CONTEXTO_VAZIO');
                        }
                        
                        // Apenas imagem
                        if (question.context && question.context.replace(/!\[.*?\]\(.*?\)/g, '').trim().length < 10) {
                            problems.push('APENAS_IMAGEM');
                        }
                        
                        // Alternativas faltando
                        if (!question.alternatives || question.alternatives.length !== 5) {
                            problems.push('ALTERNATIVAS_FALTANDO');
                        }
                        
                        if (problems.length > 0) {
                            yearProblematic++;
                            totalProblematic++;
                        }
                        
                    } catch (error) {
                        yearProblematic++;
                        totalProblematic++;
                    }
                }
            }
        }
        
        const percentage = questionDirs.length > 0 ? ((yearProblematic / questionDirs.length) * 100).toFixed(1) : 0;
        console.log(`${year}: ${yearProblematic}/${questionDirs.length} problemáticas (${percentage}%)`);
    }
    
    console.log(`\n=== RESUMO GERAL ===`);
    console.log(`Total de questões: ${totalQuestions}`);
    console.log(`Questões problemáticas: ${totalProblematic}`);
    console.log(`Percentual problemático: ${totalQuestions > 0 ? ((totalProblematic / totalQuestions) * 100).toFixed(1) : 0}%`);
    
    if (totalProblematic > 0) {
        console.log(`\n💡 Execute 'node cleanup-enem-questions.js' para limpar as questões problemáticas`);
    } else {
        console.log(`\n✅ Nenhuma questão problemática encontrada!`);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    quickCheck();
}
