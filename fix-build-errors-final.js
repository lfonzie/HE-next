#!/usr/bin/env node

/**
 * Script final para corrigir todos os erros restantes
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Aplicando correções finais...\n');

// Função para ler arquivo
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Erro ao ler arquivo ${filePath}:`, error.message);
    return null;
  }
}

// Função para escrever arquivo
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Arquivo corrigido: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao escrever arquivo ${filePath}:`, error.message);
    return false;
  }
}

// Correção 1: page-new.tsx - Remover TODAS as propriedades alt dos ícones Lucide
function fixAllLucideImages() {
  console.log('\n🔧 Removendo todas as propriedades alt dos ícones Lucide em page-new.tsx...');
  
  const filePath = './app/aulas/page-new.tsx';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  let fixedContent = content;
  
  // Remover propriedade alt de todos os ícones Image (Lucide)
  fixedContent = fixedContent.replace(
    /<Image className="[^"]*" alt="[^"]*" \/>/g,
    (match) => {
      // Extrair apenas a className
      const classNameMatch = match.match(/className="[^"]*"/);
      return classNameMatch ? `<Image ${classNameMatch[0]} />` : match;
    }
  );
  
  return writeFile(filePath, fixedContent);
}

// Correção 2: AuthenticTask.tsx - Corrigir useCallback
function fixAuthenticTaskCallback() {
  console.log('\n🔧 Corrigindo useCallback em AuthenticTask.tsx...');
  
  const filePath = './components/professor-interactive/curipod/AuthenticTask.tsx';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  // Encontrar e corrigir o handleSubmit
  const fixedContent = content.replace(
    /const handleSubmit = useCallback\(\(\) => \{[\s\S]*?\}, \[onComplete, timeSpent\]\);/,
    `const handleSubmit = useCallback(() => {
    if (isActive) {
      setIsActive(false);
      onComplete({
        type: 'authentic-task',
        timeSpent: timeSpent,
        completed: true
      });
    }
  }, [isActive, onComplete, timeSpent]);`
  );
  
  return writeFile(filePath, fixedContent);
}

// Correção 3: ExitTicket.tsx - Corrigir dependências do useCallback
function fixExitTicketCallback() {
  console.log('\n🔧 Corrigindo dependências do useCallback em ExitTicket.tsx...');
  
  const filePath = './components/professor-interactive/curipod/ExitTicket.tsx';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  // Corrigir dependências do useCallback
  const fixedContent = content.replace(
    /}, \[onComplete, timeSpent\]\);$/gm,
    '}, [questions, selectedOptions, onComplete, timeSpent]);'
  );
  
  return writeFile(filePath, fixedContent);
}

// Correção 4: InteractiveCheckpoint.tsx - Remover dependência desnecessária
function fixInteractiveCheckpointUnnecessaryDep() {
  console.log('\n🔧 Removendo dependência desnecessária em InteractiveCheckpoint.tsx...');
  
  const filePath = './components/professor-interactive/curipod/InteractiveCheckpoint.tsx';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  // Remover onSubmit das dependências
  const fixedContent = content.replace(
    /}, \[selectedOption, onSubmit, checkpoint\.correctOption, onComplete, timeSpent\]\);$/gm,
    '}, [selectedOption, checkpoint.correctOption, onComplete, timeSpent]);'
  );
  
  return writeFile(filePath, fixedContent);
}

// Função principal
async function main() {
  console.log('🚀 Aplicando correções finais...\n');
  
  let successCount = 0;
  let totalFixes = 4;
  
  // Executar todas as correções
  const fixes = [
    { name: 'Todas as propriedades alt dos ícones Lucide', fn: fixAllLucideImages },
    { name: 'useCallback AuthenticTask', fn: fixAuthenticTaskCallback },
    { name: 'Dependências ExitTicket', fn: fixExitTicketCallback },
    { name: 'Dependência desnecessária InteractiveCheckpoint', fn: fixInteractiveCheckpointUnnecessaryDep }
  ];
  
  for (const fix of fixes) {
    console.log(`\n📝 Aplicando correção: ${fix.name}`);
    if (fix.fn()) {
      successCount++;
      console.log(`✅ ${fix.name} - Corrigido com sucesso!`);
    } else {
      console.log(`❌ ${fix.name} - Falha na correção!`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 RESUMO DAS CORREÇÕES FINAIS:`);
  console.log(`✅ Sucessos: ${successCount}/${totalFixes}`);
  console.log(`❌ Falhas: ${totalFixes - successCount}/${totalFixes}`);
  
  if (successCount === totalFixes) {
    console.log('\n🎉 Todas as correções finais foram aplicadas!');
    console.log('\n📋 Execute novamente: npm run build');
  } else {
    console.log('\n⚠️  Algumas correções falharam. Verifique os logs acima.');
  }
}

// Executar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  fixAllLucideImages,
  fixAuthenticTaskCallback,
  fixExitTicketCallback,
  fixInteractiveCheckpointUnnecessaryDep
};
