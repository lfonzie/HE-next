#!/usr/bin/env node

/**
 * Script para corrigir todos os erros de build encontrados
 * Executa correções automáticas nos arquivos com problemas
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Iniciando correção de erros de build...\n');

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

// Função para fazer backup do arquivo
function backupFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const backupPath = filePath + '.backup';
    fs.writeFileSync(backupPath, content, 'utf8');
    console.log(`📁 Backup criado: ${backupPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao criar backup de ${filePath}:`, error.message);
    return false;
  }
}

// Correção 1: HookComponent.tsx - Aspas não escapadas
function fixHookComponentQuotes() {
  console.log('\n🔧 Corrigindo aspas não escapadas em HookComponent.tsx...');
  
  const filePath = './components/professor-interactive/curipod/HookComponent.tsx';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  // Criar backup
  backupFile(filePath);
  
  // Corrigir aspas não escapadas na linha 151
  const fixedContent = content.replace(
    /Ou clique em "Pular" se já refletiu sobre o tema/g,
    'Ou clique em &quot;Pular&quot; se já refletiu sobre o tema'
  );
  
  return writeFile(filePath, fixedContent);
}

// Correção 2: page-new.tsx - Adicionar alt ao Image
function fixPageNewImageAlt() {
  console.log('\n🔧 Corrigindo propriedade alt em page-new.tsx...');
  
  const filePath = './app/aulas/page-new.tsx';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  // Criar backup
  backupFile(filePath);
  
  // Adicionar propriedade alt ao componente Image
  const fixedContent = content.replace(
    /<Image className="h-5 w-5 text-orange-600 mr-1" \/>/g,
    '<Image className="h-5 w-5 text-orange-600 mr-1" alt="Ícone de imagens" />'
  );
  
  return writeFile(filePath, fixedContent);
}

// Correção 3: demo-enhanced/page.tsx - Substituir img por Image
function fixDemoEnhancedImage() {
  console.log('\n🔧 Substituindo img por Image em demo-enhanced/page.tsx...');
  
  const filePath = './app/demo-enhanced/page.tsx';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  // Criar backup
  backupFile(filePath);
  
  // Verificar se já tem import do Image
  let fixedContent = content;
  
  if (!content.includes("import Image from 'next/image'")) {
    // Adicionar import do Image
    fixedContent = content.replace(
      /import { Card, CardContent } from ['"]@\/components\/ui\/card['"];?\s*/,
      "import { Card, CardContent } from '@/components/ui/card';\nimport Image from 'next/image';\n"
    );
  }
  
  // Substituir img por Image
  fixedContent = fixedContent.replace(
    /<img\s+src={image\.imageUrl}\s+alt={image\.description}\s+className="w-full h-48 object-cover rounded-lg mb-2"\s+\/>/g,
    '<Image\n                                src={image.imageUrl}\n                                alt={image.description}\n                                width={400}\n                                height={192}\n                                className="w-full h-48 object-cover rounded-lg mb-2"\n                              />'
  );
  
  return writeFile(filePath, fixedContent);
}

// Correção 4: InteractiveCheckpoint.tsx - Corrigir dependências do useEffect
function fixInteractiveCheckpointDeps() {
  console.log('\n🔧 Corrigindo dependências do useEffect em InteractiveCheckpoint.tsx...');
  
  const filePath = './components/professor-interactive/curipod/InteractiveCheckpoint.tsx';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  // Criar backup
  backupFile(filePath);
  
  // Adicionar useCallback para handleSubmit se não existir
  let fixedContent = content;
  
  if (!content.includes('useCallback')) {
    // Adicionar import do useCallback
    fixedContent = fixedContent.replace(
      /import React, { useState, useEffect } from ['"]react['"];?\s*/,
      "import React, { useState, useEffect, useCallback } from 'react';\n"
    );
  }
  
  // Envolver handleSubmit com useCallback
  fixedContent = fixedContent.replace(
    /const handleSubmit = \(optionIndex: number\) => \{[\s\S]*?\};/,
    (match) => {
      return `const handleSubmit = useCallback((optionIndex: number) => {${match.slice(match.indexOf('{') + 1, match.lastIndexOf('}'))}}, [selectedOption, onSubmit]);`;
    }
  );
  
  // Adicionar handleSubmit às dependências do useEffect
  fixedContent = fixedContent.replace(
    /}, \[isActive, timeRemaining\]\);$/gm,
    '}, [isActive, timeRemaining, handleSubmit]);'
  );
  
  return writeFile(filePath, fixedContent);
}

// Função principal
async function main() {
  console.log('🚀 Iniciando correção automática de erros de build...\n');
  
  let successCount = 0;
  let totalFixes = 4;
  
  // Executar todas as correções
  const fixes = [
    { name: 'Aspas não escapadas', fn: fixHookComponentQuotes },
    { name: 'Propriedade alt do Image', fn: fixPageNewImageAlt },
    { name: 'Substituição img por Image', fn: fixDemoEnhancedImage },
    { name: 'Dependências do useEffect', fn: fixInteractiveCheckpointDeps }
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
  console.log(`📊 RESUMO DAS CORREÇÕES:`);
  console.log(`✅ Sucessos: ${successCount}/${totalFixes}`);
  console.log(`❌ Falhas: ${totalFixes - successCount}/${totalFixes}`);
  
  if (successCount === totalFixes) {
    console.log('\n🎉 Todas as correções foram aplicadas com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Execute: npm run build');
    console.log('2. Verifique se não há mais erros');
    console.log('3. Se necessário, ajuste manualmente os arquivos');
  } else {
    console.log('\n⚠️  Algumas correções falharam. Verifique os logs acima.');
  }
  
  console.log('\n💡 Dica: Os arquivos originais foram salvos com extensão .backup');
}

// Executar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  fixHookComponentQuotes,
  fixPageNewImageAlt,
  fixDemoEnhancedImage,
  fixInteractiveCheckpointDeps
};
