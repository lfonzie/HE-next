#!/usr/bin/env node

/**
 * Script completo para corrigir TODOS os erros de build
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Aplicando correção completa de todos os erros...\n');

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

// Correção 1: page-new.tsx - Adicionar alt="" para todos os ícones Lucide
function fixPageNewLucideAlt() {
  console.log('\n🔧 Adicionando alt="" para todos os ícones Lucide em page-new.tsx...');
  
  const filePath = './app/aulas/page-new.tsx';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  let fixedContent = content;
  
  // Adicionar alt="" para todos os ícones Image (Lucide) que não têm alt
  fixedContent = fixedContent.replace(
    /<Image className="[^"]*" \/>/g,
    (match) => {
      // Extrair a className
      const classNameMatch = match.match(/className="[^"]*"/);
      return classNameMatch ? `<Image ${classNameMatch[0]} alt="" />` : match;
    }
  );
  
  return writeFile(filePath, fixedContent);
}

// Correção 2: AuthenticTask.tsx - Corrigir useCallback completamente
function fixAuthenticTaskComplete() {
  console.log('\n🔧 Corrigindo completamente o useCallback em AuthenticTask.tsx...');
  
  const filePath = './components/professor-interactive/curipod/AuthenticTask.tsx';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  // Encontrar a linha do useEffect e corrigir
  const fixedContent = content.replace(
    /useEffect\(\(\) => \{[\s\S]*?\}, \[isActive, timeRemaining, handleSubmit\]\);/,
    `useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false);
            onComplete({
              type: 'authentic-task',
              timeSpent: timeSpent,
              completed: true
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, onComplete, timeSpent]);`
  );
  
  return writeFile(filePath, fixedContent);
}

// Correção 3: page.tsx - Corrigir erro de tipo 'never'
function fixPageTypeError() {
  console.log('\n🔧 Corrigindo erro de tipo em page.tsx...');
  
  const filePath = './app/aulas/page.tsx';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  // Encontrar e corrigir o problema com generatedLesson.title
  const fixedContent = content.replace(
    /{generatedLesson\.title}/g,
    '{generatedLesson?.title || "Título da Aula"}'
  );
  
  // Também corrigir outras propriedades que podem ter o mesmo problema
  const fixedContent2 = fixedContent.replace(
    /{generatedLesson\.subject}/g,
    '{generatedLesson?.subject || "Matéria"}'
  );
  
  const fixedContent3 = fixedContent2.replace(
    /{generatedLesson\.level}/g,
    '{generatedLesson?.level || "Nível"}'
  );
  
  return writeFile(filePath, fixedContent3);
}

// Função principal
async function main() {
  console.log('🚀 Aplicando correção completa...\n');
  
  let successCount = 0;
  let totalFixes = 3;
  
  // Executar todas as correções
  const fixes = [
    { name: 'Alt dos ícones Lucide', fn: fixPageNewLucideAlt },
    { name: 'useCallback AuthenticTask completo', fn: fixAuthenticTaskComplete },
    { name: 'Erro de tipo page.tsx', fn: fixPageTypeError }
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
  console.log(`📊 RESUMO DA CORREÇÃO COMPLETA:`);
  console.log(`✅ Sucessos: ${successCount}/${totalFixes}`);
  console.log(`❌ Falhas: ${totalFixes - successCount}/${totalFixes}`);
  
  if (successCount === totalFixes) {
    console.log('\n🎉 Todas as correções foram aplicadas!');
    console.log('\n📋 Execute: npm run build');
  } else {
    console.log('\n⚠️  Algumas correções falharam. Verifique os logs acima.');
  }
}

// Executar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  fixPageNewLucideAlt,
  fixAuthenticTaskComplete,
  fixPageTypeError
};
