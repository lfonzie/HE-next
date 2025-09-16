#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configurações
const ENEM_BASE_PATH = path.join(__dirname, 'QUESTOES_ENEM', 'public');
const BACKUP_PATH = path.join(__dirname, 'QUESTOES_ENEM_BACKUP');
const LOG_FILE = path.join(__dirname, 'enem-cleanup-log.txt');

// Contadores para estatísticas
let stats = {
    totalQuestions: 0,
    problematicQuestions: 0,
    imageOnlyQuestions: 0,
    brokenImageQuestions: 0,
    questionAsAnswerQuestions: 0,
    emptyContextQuestions: 0,
    missingAlternativesQuestions: 0,
    processedYears: 0,
    processedFiles: 0
};

// Função para log
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

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
function isQuestionAsAnswerQuestion(question) {
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
        stats.imageOnlyQuestions++;
    }
    
    // 2. Verificar se tem contexto vazio
    if (!question.context || question.context.trim().length < 10) {
        problems.push('EMPTY_CONTEXT');
        stats.emptyContextQuestions++;
    }
    
    // 3. Verificar se pergunta está sendo usada como resposta
    if (isQuestionAsAnswerQuestion(question)) {
        problems.push('QUESTION_AS_ANSWER');
        stats.questionAsAnswerQuestions++;
    }
    
    // 4. Verificar se tem alternativas válidas
    if (!question.alternatives || question.alternatives.length !== 5) {
        problems.push('MISSING_ALTERNATIVES');
        stats.missingAlternativesQuestions++;
    }
    
    // 5. Verificar imagens quebradas
    if (question.files && question.files.length > 0) {
        for (const fileUrl of question.files) {
            const isWorking = await checkImageUrl(fileUrl);
            if (!isWorking) {
                problems.push('BROKEN_IMAGE');
                stats.brokenImageQuestions++;
                break; // Só conta uma vez por questão
            }
        }
    }
    
    return problems;
}

// Função para processar um arquivo de questão
async function processQuestionFile(filePath, year) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const question = JSON.parse(content);
        
        stats.totalQuestions++;
        stats.processedFiles++;
        
        const problems = await validateQuestion(question, year, filePath);
        
        if (problems.length > 0) {
            stats.problematicQuestions++;
            log(`PROBLEMÁTICA: ${filePath} - Problemas: ${problems.join(', ')}`);
            return { question, problems, filePath };
        }
        
        return null;
    } catch (error) {
        log(`ERRO ao processar ${filePath}: ${error.message}`);
        return null;
    }
}

// Função para processar um ano
async function processYear(yearPath) {
    const year = path.basename(yearPath);
    log(`Processando ano ${year}...`);
    
    const detailsPath = path.join(yearPath, 'details.json');
    if (!fs.existsSync(detailsPath)) {
        log(`Arquivo details.json não encontrado para ${year}`);
        return [];
    }
    
    const details = JSON.parse(fs.readFileSync(detailsPath, 'utf8'));
    const problematicQuestions = [];
    
    // Processar questões individuais
    const questionsDir = path.join(yearPath, 'questions');
    if (fs.existsSync(questionsDir)) {
        const questionDirs = fs.readdirSync(questionsDir);
        
        for (const questionDir of questionDirs) {
            const questionPath = path.join(questionsDir, questionDir);
            if (fs.statSync(questionPath).isDirectory()) {
                const detailsFile = path.join(questionPath, 'details.json');
                if (fs.existsSync(detailsFile)) {
                    const result = await processQuestionFile(detailsFile, year);
                    if (result) {
                        problematicQuestions.push(result);
                    }
                }
            }
        }
    }
    
    stats.processedYears++;
    log(`Ano ${year} processado: ${problematicQuestions.length} questões problemáticas encontradas`);
    
    return problematicQuestions;
}

// Função para criar backup
function createBackup() {
    if (!fs.existsSync(BACKUP_PATH)) {
        log('Criando backup...');
        fs.mkdirSync(BACKUP_PATH, { recursive: true });
        
        // Copiar estrutura
        const years = fs.readdirSync(ENEM_BASE_PATH);
        for (const year of years) {
            const yearPath = path.join(ENEM_BASE_PATH, year);
            if (fs.statSync(yearPath).isDirectory()) {
                const backupYearPath = path.join(BACKUP_PATH, year);
                fs.mkdirSync(backupYearPath, { recursive: true });
                
                // Copiar details.json
                const detailsPath = path.join(yearPath, 'details.json');
                if (fs.existsSync(detailsPath)) {
                    fs.copyFileSync(detailsPath, path.join(backupYearPath, 'details.json'));
                }
                
                // Copiar questões
                const questionsDir = path.join(yearPath, 'questions');
                if (fs.existsSync(questionsDir)) {
                    const backupQuestionsDir = path.join(backupYearPath, 'questions');
                    fs.mkdirSync(backupQuestionsDir, { recursive: true });
                    
                    const questionDirs = fs.readdirSync(questionsDir);
                    for (const questionDir of questionDirs) {
                        const questionPath = path.join(questionsDir, questionDir);
                        if (fs.statSync(questionPath).isDirectory()) {
                            const backupQuestionPath = path.join(backupQuestionsDir, questionDir);
                            fs.mkdirSync(backupQuestionPath, { recursive: true });
                            
                            const detailsFile = path.join(questionPath, 'details.json');
                            if (fs.existsSync(detailsFile)) {
                                fs.copyFileSync(detailsFile, path.join(backupQuestionPath, 'details.json'));
                            }
                        }
                    }
                }
            }
        }
        log('Backup criado com sucesso!');
    } else {
        log('Backup já existe, pulando criação...');
    }
}

// Função para remover questões problemáticas
function removeProblematicQuestions(problematicQuestions) {
    log('Removendo questões problemáticas...');
    
    for (const { filePath, problems } of problematicQuestions) {
        try {
            // Remover arquivo da questão
            fs.unlinkSync(filePath);
            
            // Remover diretório se estiver vazio
            const questionDir = path.dirname(filePath);
            const files = fs.readdirSync(questionDir);
            if (files.length === 0) {
                fs.rmdirSync(questionDir);
            }
            
            log(`Removida: ${filePath} (Problemas: ${problems.join(', ')})`);
        } catch (error) {
            log(`Erro ao remover ${filePath}: ${error.message}`);
        }
    }
}

// Função para atualizar arquivos details.json
function updateDetailsFiles(problematicQuestions) {
    log('Atualizando arquivos details.json...');
    
    const yearGroups = {};
    
    // Agrupar por ano
    for (const { filePath } of problematicQuestions) {
        const year = path.basename(path.dirname(path.dirname(filePath)));
        if (!yearGroups[year]) {
            yearGroups[year] = [];
        }
        yearGroups[year].push(filePath);
    }
    
    // Atualizar cada ano
    for (const [year, files] of Object.entries(yearGroups)) {
        const detailsPath = path.join(ENEM_BASE_PATH, year, 'details.json');
        if (fs.existsSync(detailsPath)) {
            try {
                const details = JSON.parse(fs.readFileSync(detailsPath, 'utf8'));
                
                // Remover questões problemáticas da lista
                const removedIndices = new Set();
                files.forEach(filePath => {
                    const questionDir = path.basename(path.dirname(filePath));
                    const index = details.questions.findIndex(q => 
                        q.index === parseInt(questionDir) || 
                        q.title.includes(questionDir)
                    );
                    if (index !== -1) {
                        removedIndices.add(index);
                    }
                });
                
                // Filtrar questões removidas
                details.questions = details.questions.filter((_, index) => !removedIndices.has(index));
                
                // Salvar arquivo atualizado
                fs.writeFileSync(detailsPath, JSON.stringify(details, null, 4));
                log(`Atualizado details.json para ${year}: ${removedIndices.size} questões removidas`);
            } catch (error) {
                log(`Erro ao atualizar details.json para ${year}: ${error.message}`);
            }
        }
    }
}

// Função principal
async function main() {
    log('=== INICIANDO LIMPEZA DO BANCO DE DADOS ENEM ===');
    
    // Verificar se o diretório existe
    if (!fs.existsSync(ENEM_BASE_PATH)) {
        log(`ERRO: Diretório ${ENEM_BASE_PATH} não encontrado!`);
        process.exit(1);
    }
    
    // Criar backup
    createBackup();
    
    // Processar todos os anos
    const years = fs.readdirSync(ENEM_BASE_PATH).filter(year => 
        fs.statSync(path.join(ENEM_BASE_PATH, year)).isDirectory() && 
        /^\d{4}$/.test(year)
    );
    
    const allProblematicQuestions = [];
    
    for (const year of years) {
        const yearPath = path.join(ENEM_BASE_PATH, year);
        const problematicQuestions = await processYear(yearPath);
        allProblematicQuestions.push(...problematicQuestions);
    }
    
    // Mostrar estatísticas
    log('\n=== ESTATÍSTICAS ===');
    log(`Total de questões processadas: ${stats.totalQuestions}`);
    log(`Questões problemáticas encontradas: ${stats.problematicQuestions}`);
    log(`- Apenas imagem: ${stats.imageOnlyQuestions}`);
    log(`- Imagens quebradas: ${stats.brokenImageQuestions}`);
    log(`- Pergunta sendo resposta: ${stats.questionAsAnswerQuestions}`);
    log(`- Contexto vazio: ${stats.emptyContextQuestions}`);
    log(`- Alternativas faltando: ${stats.missingAlternativesQuestions}`);
    log(`Anos processados: ${stats.processedYears}`);
    log(`Arquivos processados: ${stats.processedFiles}`);
    
    if (allProblematicQuestions.length > 0) {
        log(`\n=== QUESTÕES PROBLEMÁTICAS ENCONTRADAS ===`);
        allProblematicQuestions.forEach(({ filePath, problems }) => {
            log(`${filePath}: ${problems.join(', ')}`);
        });
        
        // Perguntar se deve remover
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question(`\nDeseja remover ${allProblematicQuestions.length} questões problemáticas? (s/N): `, async (answer) => {
            if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim') {
                removeProblematicQuestions(allProblematicQuestions);
                updateDetailsFiles(allProblematicQuestions);
                log('\n=== LIMPEZA CONCLUÍDA ===');
                log(`Backup salvo em: ${BACKUP_PATH}`);
                log(`Log salvo em: ${LOG_FILE}`);
            } else {
                log('Operação cancelada pelo usuário.');
            }
            rl.close();
        });
    } else {
        log('\nNenhuma questão problemática encontrada!');
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(error => {
        log(`ERRO FATAL: ${error.message}`);
        console.error(error);
        process.exit(1);
    });
}

module.exports = {
    validateQuestion,
    checkImageUrl,
    isImageOnlyQuestion,
    isQuestionAsAnswer: isQuestionAsAnswerQuestion
};
