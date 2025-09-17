#!/usr/bin/env node

/**
 * Script final completo para corrigir TODOS os erros de build restantes
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

// Correção 1: page-new.tsx - Adicionar alt="" para todos os ícones Lucide (para resolver warnings)
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
      const classNameMatch = match.match(/className="[^"]*"/);
      return classNameMatch ? `<Image ${classNameMatch[0]} alt="" />` : match;
    }
  );
  
  return writeFile(filePath, fixedContent);
}

// Correção 2: route.ts - Corrigir erro de tipo com process.env
function fixRouteEnvError() {
  console.log('\n🔧 Corrigindo erro de tipo com process.env em route.ts...');
  
  const filePath = './app/api/illustrations/processes/route.ts';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  // Corrigir o erro de tipo com process.env
  const fixedContent = content.replace(
    /`\${process\.env\.NEXT_PUBLIC_BASE_URL \|\| 'http:\/\/localhost:3000'}\/api\/illustrations\/search`/g,
    '`${(process.env.NEXT_PUBLIC_BASE_URL as string) || \'http://localhost:3000\'}/api/illustrations/search`'
  );
  
  return writeFile(filePath, fixedContent);
}

// Correção 3: IllustrationSearch.tsx - Substituir img por Image
function fixIllustrationSearchImg() {
  console.log('\n🔧 Substituindo img por Image em IllustrationSearch.tsx...');
  
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
  
  // Substituir img por Image
  fixedContent = fixedContent.replace(
    /<img\s+src={image\.url}\s+alt={image\.description}\s+className="w-full h-48 object-cover rounded-lg mb-2"\s+\/>/g,
    '<Image\n                                src={image.url}\n                                alt={image.description}\n                                width={400}\n                                height={192}\n                                className="w-full h-48 object-cover rounded-lg mb-2"\n                              />'
  );
  
  return writeFile(filePath, fixedContent);
}

// Função principal
async function main() {
  console.log('🚀 Aplicando correção final completa...\n');
  
  let successCount = 0;
  let totalFixes = 3;
  
  // Executar todas as correções
  const fixes = [
    { name: 'Alt dos ícones Lucide', fn: fixPageNewLucideAlt },
    { name: 'Erro de tipo process.env', fn: fixRouteEnvError },
    { name: 'Substituição img por Image', fn: fixIllustrationSearchImg }
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
  fixPageNewLucideAlt,
  fixRouteEnvError,
  fixIllustrationSearchImg
};
