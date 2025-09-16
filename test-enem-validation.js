#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Função para verificar se uma URL de imagem está funcionando
function checkImageUrl(url) {
    return new Promise((resolve) => {
        if (!url || !url.startsWith('http')) {
            resolve(false);
            return;
        }

        const client = url.startsWith('https') ? https : http;
        const req = client.request(url, { method: 'HEAD' }, (res) => {
            resolve(res.statusCode === 200);
        });

        req.on('error', () => resolve(false));
        req.setTimeout(5000, () => {
            req.destroy();
            resolve(false);
        });
        req.end();
    });
}

// Função para verificar se uma questão tem apenas imagem (sem texto)
function isImageOnlyQuestion(question) {
    if (!question.context) return false;
    
    // Remove markdown de imagem e espaços
    const cleanContext = question.context
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    
    return cleanContext.length < 10; // Menos de 10 caracteres de texto
}

// Função para verificar se a pergunta está sendo usada como resposta
function isQuestionAsAnswer(question) {
    if (!question.alternativesIntroduction) return false;
    
    const intro = question.alternativesIntroduction.toLowerCase();
    const context = question.context ? question.context.toLowerCase() : '';
    
    // Verifica se a introdução das alternativas contém palavras que indicam pergunta
    const questionWords = ['qual', 'quando', 'onde', 'como', 'por que', 'porque', 'quem', 'o que'];
    const hasQuestionWords = questionWords.some(word => intro.includes(word));
    
    // Verifica se o contexto contém a resposta
    const hasAnswerInContext = question.alternatives.some(alt => 
        context.includes(alt.text.toLowerCase().substring(0, 20))
    );
    
    return hasQuestionWords && hasAnswerInContext;
}

// Função para verificar se uma questão tem problemas
async function validateQuestion(question, year, questionPath) {
    const problems = [];
    
    // 1. Verificar se tem apenas imagem
    if (isImageOnlyQuestion(question)) {
        problems.push('IMAGE_ONLY');
    }
    
    // 2. Verificar se tem contexto vazio
    if (!question.context || question.context.trim().length < 10) {
        problems.push('EMPTY_CONTEXT');
    }
    
    // 3. Verificar se pergunta está sendo usada como resposta
    if (isQuestionAsAnswer(question)) {
        problems.push('QUESTION_AS_ANSWER');
    }
    
    // 4. Verificar se tem alternativas válidas
    if (!question.alternatives || question.alternatives.length !== 5) {
        problems.push('MISSING_ALTERNATIVES');
    }
    
    // 5. Verificar imagens quebradas
    if (question.files && question.files.length > 0) {
        for (const fileUrl of question.files) {
            const isWorking = await checkImageUrl(fileUrl);
            if (!isWorking) {
                problems.push('BROKEN_IMAGE');
                break; // Só conta uma vez por questão
            }
        }
    }
    
    return problems;
}

// Função para testar algumas questões específicas
async function testSpecificQuestions() {
    console.log('=== TESTE DE VALIDAÇÃO DE QUESTÕES ENEM ===\n');
    
    const testCases = [
        {
            name: 'Questão com imagem (2023, questão 1-ingles)',
            path: '/Users/lf/Documents/HE-next/QUESTOES_ENEM/public/2023/questions/1-ingles/details.json'
        },
        {
            name: 'Questão sem imagem (2023, questão 25)',
            path: '/Users/lf/Documents/HE-next/QUESTOES_ENEM/public/2023/questions/25/details.json'
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n--- ${testCase.name} ---`);
        
        if (!fs.existsSync(testCase.path)) {
            console.log('❌ Arquivo não encontrado');
            continue;
        }
        
        try {
            const content = fs.readFileSync(testCase.path, 'utf8');
            const question = JSON.parse(content);
            
            console.log(`Título: ${question.title}`);
            console.log(`Disciplina: ${question.discipline}`);
            console.log(`Contexto: ${question.context ? question.context.substring(0, 100) + '...' : 'N/A'}`);
            console.log(`Arquivos: ${question.files ? question.files.length : 0}`);
            console.log(`Alternativas: ${question.alternatives ? question.alternatives.length : 0}`);
            
            // Testar validações específicas
            const isImageOnly = isImageOnlyQuestion(question);
            const isQuestionAsAnswerResult = isQuestionAsAnswer(question);
            
            console.log(`Apenas imagem: ${isImageOnly ? '❌ SIM' : '✅ NÃO'}`);
            console.log(`Pergunta como resposta: ${isQuestionAsAnswerResult ? '❌ SIM' : '✅ NÃO'}`);
            
            // Testar URLs de imagem
            if (question.files && question.files.length > 0) {
                console.log('Testando URLs de imagem...');
                for (const fileUrl of question.files) {
                    const isWorking = await checkImageUrl(fileUrl);
                    console.log(`  ${fileUrl}: ${isWorking ? '✅ OK' : '❌ QUEBRADA'}`);
                }
            }
            
            // Validação completa
            const problems = await validateQuestion(question, '2023', testCase.path);
            if (problems.length > 0) {
                console.log(`❌ PROBLEMAS ENCONTRADOS: ${problems.join(', ')}`);
            } else {
                console.log('✅ Nenhum problema encontrado');
            }
            
        } catch (error) {
            console.log(`❌ Erro ao processar: ${error.message}`);
        }
    }
}

// Função para testar um ano específico
async function testYear(year) {
    console.log(`\n=== TESTE DO ANO ${year} ===\n`);
    
    const yearPath = path.join(__dirname, 'QUESTOES_ENEM', 'public', year.toString());
    
    if (!fs.existsSync(yearPath)) {
        console.log(`❌ Ano ${year} não encontrado`);
        return;
    }
    
    const questionsDir = path.join(yearPath, 'questions');
    if (!fs.existsSync(questionsDir)) {
        console.log(`❌ Diretório de questões não encontrado para ${year}`);
        return;
    }
    
    const questionDirs = fs.readdirSync(questionsDir).slice(0, 10); // Testar apenas as primeiras 10
    let problematicCount = 0;
    
    for (const questionDir of questionDirs) {
        const questionPath = path.join(questionsDir, questionDir);
        if (fs.statSync(questionPath).isDirectory()) {
            const detailsFile = path.join(questionPath, 'details.json');
            if (fs.existsSync(detailsFile)) {
                try {
                    const content = fs.readFileSync(detailsFile, 'utf8');
                    const question = JSON.parse(content);
                    
                    const problems = await validateQuestion(question, year, detailsFile);
                    if (problems.length > 0) {
                        console.log(`❌ ${questionDir}: ${problems.join(', ')}`);
                        problematicCount++;
                    } else {
                        console.log(`✅ ${questionDir}: OK`);
                    }
                } catch (error) {
                    console.log(`❌ ${questionDir}: Erro - ${error.message}`);
                    problematicCount++;
                }
            }
        }
    }
    
    console.log(`\nResumo: ${problematicCount}/${questionDirs.length} questões problemáticas encontradas`);
}

// Função principal
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        await testSpecificQuestions();
    } else if (args[0] === 'year' && args[1]) {
        await testYear(parseInt(args[1]));
    } else {
        console.log('Uso:');
        console.log('  node test-enem-validation.js           # Testar questões específicas');
        console.log('  node test-enem-validation.js year 2023  # Testar um ano específico');
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error('Erro:', error.message);
        process.exit(1);
    });
}