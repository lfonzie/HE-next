#!/usr/bin/env node

/**
 * Script adicional para corrigir erros restantes após primeira correção
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Aplicando correções adicionais...\n');

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

// Correção 1: page-new.tsx - Remover propriedade alt do ícone Lucide
function fixPageNewLucideImage() {
  console.log('\n🔧 Corrigindo ícone Lucide em page-new.tsx...');
  
  const filePath = './app/aulas/page-new.tsx';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  // Remover propriedade alt do ícone Lucide (não é necessário)
  const fixedContent = content.replace(
    /<Image className="h-5 w-5 text-orange-600 mr-1" alt="Ícone de imagens" \/>/g,
    '<Image className="h-5 w-5 text-orange-600 mr-1" />'
  );
  
  return writeFile(filePath, fixedContent);
}

// Correção 2: AuthenticTask.tsx - Corrigir dependências do useEffect
function fixAuthenticTaskDeps() {
  console.log('\n🔧 Corrigindo dependências do useEffect em AuthenticTask.tsx...');
  
  const filePath = './components/professor-interactive/curipod/AuthenticTask.tsx';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  let fixedContent = content;
  
  // Adicionar useCallback se não existir
  if (!content.includes('useCallback')) {
    fixedContent = fixedContent.replace(
      /import React, { useState, useEffect } from ['"]react['"];?\s*/,
      "import React, { useState, useEffect, useCallback } from 'react';\n"
    );
  }
  
  // Envolver handleSubmit com useCallback
  fixedContent = fixedContent.replace(
    /const handleSubmit = \(\) => \{[\s\S]*?\};/,
    (match) => {
      return `const handleSubmit = useCallback(() => {${match.slice(match.indexOf('{') + 1, match.lastIndexOf('}'))}}, [onComplete, timeSpent]);`;
    }
  );
  
  // Adicionar handleSubmit às dependências do useEffect
  fixedContent = fixedContent.replace(
    /}, \[isActive, timeRemaining\]\);$/gm,
    '}, [isActive, timeRemaining, handleSubmit]);'
  );
  
  return writeFile(filePath, fixedContent);
}

// Correção 3: ExitTicket.tsx - Corrigir dependências do useEffect
function fixExitTicketDeps() {
  console.log('\n🔧 Corrigindo dependências do useEffect em ExitTicket.tsx...');
  
  const filePath = './components/professor-interactive/curipod/ExitTicket.tsx';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  let fixedContent = content;
  
  // Adicionar useCallback se não existir
  if (!content.includes('useCallback')) {
    fixedContent = fixedContent.replace(
      /import React, { useState, useEffect } from ['"]react['"];?\s*/,
      "import React, { useState, useEffect, useCallback } from 'react';\n"
    );
  }
  
  // Envolver handleFinish com useCallback
  fixedContent = fixedContent.replace(
    /const handleFinish = \(\) => \{[\s\S]*?\};/,
    (match) => {
      return `const handleFinish = useCallback(() => {${match.slice(match.indexOf('{') + 1, match.lastIndexOf('}'))}}, [onComplete, timeSpent]);`;
    }
  );
  
  // Adicionar handleFinish às dependências do useEffect
  fixedContent = fixedContent.replace(
    /}, \[isActive, timeRemaining\]\);$/gm,
    '}, [isActive, timeRemaining, handleFinish]);'
  );
  
  return writeFile(filePath, fixedContent);
}

// Correção 4: InteractiveCheckpoint.tsx - Corrigir dependências do useCallback
function fixInteractiveCheckpointCallbackDeps() {
  console.log('\n🔧 Corrigindo dependências do useCallback em InteractiveCheckpoint.tsx...');
  
  const filePath = './components/professor-interactive/curipod/InteractiveCheckpoint.tsx';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  // Corrigir dependências do useCallback
  const fixedContent = content.replace(
    /}, \[selectedOption, onSubmit\]\);$/gm,
    '}, [selectedOption, onSubmit, checkpoint.correctOption, onComplete, timeSpent]);'
  );
  
  return writeFile(filePath, fixedContent);
}

// Função principal
async function main() {
  console.log('🚀 Aplicando correções adicionais...\n');
  
  let successCount = 0;
  let totalFixes = 4;
  
  // Executar todas as correções
  const fixes = [
    { name: 'Ícone Lucide sem alt', fn: fixPageNewLucideImage },
    { name: 'Dependências AuthenticTask', fn: fixAuthenticTaskDeps },
    { name: 'Dependências ExitTicket', fn: fixExitTicketDeps },
    { name: 'Dependências InteractiveCheckpoint', fn: fixInteractiveCheckpointCallbackDeps }
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
  console.log(`📊 RESUMO DAS CORREÇÕES ADICIONAIS:`);
  console.log(`✅ Sucessos: ${successCount}/${totalFixes}`);
  console.log(`❌ Falhas: ${totalFixes - successCount}/${totalFixes}`);
  
  if (successCount === totalFixes) {
    console.log('\n🎉 Todas as correções adicionais foram aplicadas!');
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
  fixPageNewLucideImage,
  fixAuthenticTaskDeps,
  fixExitTicketDeps,
  fixInteractiveCheckpointCallbackDeps
};
