#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Iniciando correção automática de erros de build...\n');

// Função para executar comandos
function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout || error.stderr };
  }
}

// Função para ler arquivo
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.log(`❌ Erro ao ler arquivo ${filePath}: ${error.message}`);
    return null;
  }
}

// Função para escrever arquivo
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.log(`❌ Erro ao escrever arquivo ${filePath}: ${error.message}`);
    return false;
  }
}

// Função para encontrar arquivos por padrão
function findFiles(pattern, directory = '.') {
  try {
    const output = execSync(`find ${directory} -name "${pattern}" -type f`, { encoding: 'utf8' });
    return output.trim().split('\n').filter(f => f);
  } catch (error) {
    return [];
  }
}

// Correções automáticas baseadas nos erros encontrados
const fixes = [
  {
    name: 'Corrigir sintaxe TypeScript incorreta (string: any[])',
    pattern: /(\w+):\s*string:\s*any\[\]/g,
    replacement: '$1: string[]',
    description: 'Corrigindo sintaxe incorreta de arrays TypeScript'
  },
  {
    name: 'Corrigir aspas não escapadas em JSX',
    pattern: /([^&])"([^"]*)"([^&])/g,
    replacement: '$1&quot;$2&quot;$3',
    description: 'Escapando aspas em JSX'
  },
  {
    name: 'Adicionar alt prop para imagens',
    pattern: /<img([^>]*?)(?:\s+alt\s*=\s*["'][^"']*["'])?([^>]*?)>/g,
    replacement: (match, before, after) => {
      if (match.includes('alt=')) return match;
      return `<img${before} alt=""${after}>`;
    },
    description: 'Adicionando alt prop para imagens sem alt'
  },
  {
    name: 'Corrigir chamadas de função com argumentos incorretos',
    pattern: /google\(([^,)]+),\s*\{[^}]*\}\)/g,
    replacement: 'google($1)',
    description: 'Removendo segundo parâmetro da função google'
  },
  {
    name: 'Corrigir chamadas de função openai com argumentos incorretos',
    pattern: /openai\(([^,)]+),\s*\{[^}]*\}\)/g,
    replacement: 'openai($1)',
    description: 'Removendo segundo parâmetro da função openai'
  },
  {
    name: 'Corrigir declarações const duplicadas',
    pattern: /const\s+(\w+)\s*=\s*await\s+(\w+)\(/g,
    replacement: '$1 = await $2(',
    description: 'Convertendo const duplicado para atribuição'
  },
  {
    name: 'Corrigir tipos de parâmetros em funções de callback',
    pattern: /\(\{\s*name,\s*percent\s*\}\s*:\s*\{\s*name:\s*string;\s*percent:\s*number\s*\}\)/g,
    replacement: '({ name, percent }: { name?: string; percent?: number })',
    description: 'Tornando parâmetros opcionais em callbacks'
  }
];

// Função para aplicar correções em um arquivo
function applyFixesToFile(filePath) {
  const content = readFile(filePath);
  if (!content) return false;

  let modifiedContent = content;
  let changesMade = 0;

  fixes.forEach(fix => {
    const originalContent = modifiedContent;
    
    if (typeof fix.replacement === 'function') {
      modifiedContent = modifiedContent.replace(fix.pattern, fix.replacement);
    } else {
      modifiedContent = modifiedContent.replace(fix.pattern, fix.replacement);
    }
    
    if (modifiedContent !== originalContent) {
      changesMade++;
      console.log(`  ✅ ${fix.description}`);
    }
  });

  if (changesMade > 0) {
    if (writeFile(filePath, modifiedContent)) {
      console.log(`📝 ${filePath}: ${changesMade} correções aplicadas`);
      return true;
    }
  }
  
  return false;
}

// Função principal
async function main() {
  console.log('🔍 Investigando erros de build...\n');
  
  // Primeiro, tentar fazer o build para ver os erros
  const buildResult = runCommand('npm run build', 'Executando build para identificar erros');
  
  if (buildResult.success) {
    console.log('✅ Build já está funcionando! Não há erros para corrigir.');
    return;
  }

  console.log('📋 Erros encontrados no build:');
  console.log(buildResult.output);
  console.log('\n🔧 Aplicando correções automáticas...\n');

  // Encontrar todos os arquivos TypeScript/JavaScript
  const filePatterns = [
    '**/*.ts',
    '**/*.tsx',
    '**/*.js',
    '**/*.jsx'
  ];

  let totalFilesProcessed = 0;
  let totalFilesModified = 0;

  for (const pattern of filePatterns) {
    const files = findFiles(pattern);
    
    for (const file of files) {
      // Pular node_modules e .next
      if (file.includes('node_modules') || file.includes('.next')) {
        continue;
      }

      totalFilesProcessed++;
      if (applyFixesToFile(file)) {
        totalFilesModified++;
      }
    }
  }

  console.log(`\n📊 Resumo das correções:`);
  console.log(`  - Arquivos processados: ${totalFilesProcessed}`);
  console.log(`  - Arquivos modificados: ${totalFilesModified}`);
  console.log(`  - Correções aplicadas: ${fixes.length} tipos diferentes`);

  // Tentar build novamente
  console.log('\n🔄 Testando build após correções...\n');
  const finalBuildResult = runCommand('npm run build', 'Testando build final');

  if (finalBuildResult.success) {
    console.log('🎉 Sucesso! Build funcionando após correções automáticas!');
  } else {
    console.log('⚠️  Ainda há erros que precisam de correção manual:');
    console.log(finalBuildResult.output);
    
    // Salvar erros restantes em arquivo
    const errorLogPath = 'build-errors.log';
    writeFile(errorLogPath, finalBuildResult.output);
    console.log(`\n📄 Erros salvos em: ${errorLogPath}`);
  }
}

// Executar script
main().catch(error => {
  console.error('❌ Erro no script:', error);
  process.exit(1);
});

