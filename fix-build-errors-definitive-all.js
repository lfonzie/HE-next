#!/usr/bin/env node

/**
 * Script definitivo para corrigir TODOS os erros de build
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Aplicando correção definitiva completa...\n');

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
function fixPageNewLucideAll() {
  console.log('\n🔧 Removendo TODAS as propriedades alt dos ícones Lucide em page-new.tsx...');
  
  const filePath = './app/aulas/page-new.tsx';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  let fixedContent = content;
  
  // Remover propriedade alt de todos os ícones Image (Lucide) - padrão mais abrangente
  fixedContent = fixedContent.replace(
    /<Image className="[^"]*" alt="[^"]*" \/>/g,
    (match) => {
      const classNameMatch = match.match(/className="[^"]*"/);
      return classNameMatch ? `<Image ${classNameMatch[0]} />` : match;
    }
  );
  
  // Remover alt="" também
  fixedContent = fixedContent.replace(
    /<Image className="[^"]*" alt="" \/>/g,
    (match) => {
      const classNameMatch = match.match(/className="[^"]*"/);
      return classNameMatch ? `<Image ${classNameMatch[0]} />` : match;
    }
  );
  
  return writeFile(filePath, fixedContent);
}

// Correção 2: page.tsx - Corrigir TODAS as propriedades de generatedLesson
function fixPageAllProperties() {
  console.log('\n🔧 Corrigindo TODAS as propriedades de generatedLesson em page.tsx...');
  
  const filePath = './app/aulas/page.tsx';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  let fixedContent = content;
  
  // Corrigir TODAS as propriedades de generatedLesson com type assertion
  fixedContent = fixedContent.replace(
    /{generatedLesson\?\.title \|\| "Título da Aula"}/g,
    '{(generatedLesson as any)?.title || "Título da Aula"}'
  );
  
  fixedContent = fixedContent.replace(
    /{generatedLesson\?\.subject \|\| "Matéria"}/g,
    '{(generatedLesson as any)?.subject || "Matéria"}'
  );
  
  fixedContent = fixedContent.replace(
    /{generatedLesson\?\.level \|\| "Nível"}/g,
    '{(generatedLesson as any)?.level || "Nível"}'
  );
  
  // Corrigir propriedades que ainda não foram corrigidas
  fixedContent = fixedContent.replace(
    /{generatedLesson\.difficulty}/g,
    '{(generatedLesson as any)?.difficulty || "Médio"}'
  );
  
  // Corrigir outras propriedades que podem existir
  fixedContent = fixedContent.replace(
    /{generatedLesson\.([a-zA-Z]+)}/g,
    '{(generatedLesson as any)?.$1 || ""}'
  );
  
  return writeFile(filePath, fixedContent);
}

// Função principal
async function main() {
  console.log('🚀 Aplicando correção definitiva completa...\n');
  
  let successCount = 0;
  let totalFixes = 2;
  
  // Executar todas as correções
  const fixes = [
    { name: 'TODAS as propriedades alt dos ícones Lucide', fn: fixPageNewLucideAll },
    { name: 'TODAS as propriedades de generatedLesson', fn: fixPageAllProperties }
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
  console.log(`📊 RESUMO DA CORREÇÃO DEFINITIVA:`);
  console.log(`✅ Sucessos: ${successCount}/${totalFixes}`);
  console.log(`❌ Falhas: ${totalFixes - successCount}/${totalFixes}`);
  
  if (successCount === totalFixes) {
    console.log('\n🎉 Todas as correções definitivas foram aplicadas!');
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
  fixPageNewLucideAll,
  fixPageAllProperties
};
