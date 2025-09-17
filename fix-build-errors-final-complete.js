#!/usr/bin/env node

/**
 * Script final completo para corrigir TODOS os erros restantes
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Aplicando correção final completa...\n');

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

// Correção 1: external/route.ts - Corrigir erro de tipo 'any'
function fixExternalRouteTypeError() {
  console.log('\n🔧 Corrigindo erro de tipo em external/route.ts...');
  
  const filePath = './app/api/illustrations/external/route.ts';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  // Corrigir o erro de tipo 'any' adicionando tipo explícito
  const fixedContent = content.replace(
    /\.filter\(img => img\.url\)/g,
    '.filter((img: any) => img.url)'
  );
  
  return writeFile(filePath, fixedContent);
}

// Correção 2: IllustrationSearch.tsx - Encontrar e corrigir o img específico na linha 343
function fixIllustrationSearchImgFinal() {
  console.log('\n🔧 Corrigindo img específico em IllustrationSearch.tsx de forma final...');
  
  const filePath = './components/illustrations/IllustrationSearch.tsx';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  let fixedContent = content;
  
  // Verificar se já tem import do Image
  if (!content.includes("import Image from 'next/image'")) {
    // Adicionar import do Image
    fixedContent = content.replace(
      /import React, { useState, useEffect, useCallback } from ['"]react['"];?\s*/,
      "import React, { useState, useEffect, useCallback } from 'react';\nimport Image from 'next/image';\n"
    );
  }
  
  // Encontrar e substituir o img específico na linha 343
  const lines = fixedContent.split('\n');
  if (lines[342]) { // linha 343 (índice 342)
    const originalLine = lines[342];
    console.log(`Linha original: ${originalLine}`);
    
    // Substituir img por Image
    lines[342] = originalLine.replace(
      /<img[^>]*\/>/g,
      (match) => {
        // Extrair src e alt se existirem
        const srcMatch = match.match(/src="([^"]*)"/);
        const altMatch = match.match(/alt="([^"]*)"/);
        const classNameMatch = match.match(/className="([^"]*)"/);
        
        const src = srcMatch ? srcMatch[1] : '';
        const alt = altMatch ? altMatch[1] : '';
        const className = classNameMatch ? classNameMatch[1] : '';
        
        return `<Image src="${src}" alt="${alt}" width={400} height={192} className="${className}" />`;
      }
    );
    
    console.log(`Linha corrigida: ${lines[342]}`);
  }
  
  fixedContent = lines.join('\n');
  
  return writeFile(filePath, fixedContent);
}

// Função principal
async function main() {
  console.log('🚀 Aplicando correção final completa...\n');
  
  let successCount = 0;
  let totalFixes = 2;
  
  // Executar todas as correções
  const fixes = [
    { name: 'Erro de tipo external/route.ts', fn: fixExternalRouteTypeError },
    { name: 'Img específico IllustrationSearch final', fn: fixIllustrationSearchImgFinal }
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
  console.log(`📊 RESUMO DA CORREÇÃO FINAL:`);
  console.log(`✅ Sucessos: ${successCount}/${totalFixes}`);
  console.log(`❌ Falhas: ${totalFixes - successCount}/${totalFixes}`);
  
  if (successCount === totalFixes) {
    console.log('\n🎉 Todas as correções finais foram aplicadas!');
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
  fixExternalRouteTypeError,
  fixIllustrationSearchImgFinal
};