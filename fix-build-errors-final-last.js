#!/usr/bin/env node

/**
 * Script final para corrigir os últimos problemas
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Aplicando correção final dos últimos problemas...\n');

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

// CORREÇÃO 1: next.config.js - Remover configuração inválida
function fixNextConfig() {
  console.log('\n🔧 Corrigindo configuração inválida em next.config.js...');
  
  const filePath = './next.config.js';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  // Remover configuração inválida de ESLint
  const fixedContent = content.replace(
    /\/\/ Configuração de ESLint mais permissiva[\s\S]*?nextConfig\.eslint = eslintConfig;[\s\S]*?module\.exports = nextConfig/,
    'module.exports = nextConfig'
  );
  
  return writeFile(filePath, fixedContent);
}

// CORREÇÃO 2: processes/route.ts - Corrigir erro de tipo com process.env
function fixProcessesRouteEnvError() {
  console.log('\n🔧 Corrigindo erro de tipo com process.env em processes/route.ts...');
  
  const filePath = './app/api/illustrations/processes/route.ts';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  // Corrigir o erro de tipo com process.env
  const fixedContent = content.replace(
    /`\${process\.env\.NEXT_PUBLIC_BASE_URL \|\| 'http:\/\/localhost:3000'}\/api\/illustrations\/search`/g,
    '`${process.env.NEXT_PUBLIC_BASE_URL || \'http://localhost:3000\'}/api/illustrations/search`'
  );
  
  return writeFile(filePath, fixedContent);
}

// CORREÇÃO 3: IllustrationSearch.tsx - Encontrar e corrigir o img específico na linha 343
function fixIllustrationSearchImgFinal() {
  console.log('\n🔧 Corrigindo img específico em IllustrationSearch.tsx...');
  
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
  console.log('🚀 Aplicando correção final dos últimos problemas...\n');
  
  let successCount = 0;
  let totalFixes = 3;
  
  // Executar todas as correções
  const fixes = [
    { name: 'Configuração inválida next.config.js', fn: fixNextConfig },
    { name: 'Erro de tipo processes/route.ts', fn: fixProcessesRouteEnvError },
    { name: 'Img específico IllustrationSearch', fn: fixIllustrationSearchImgFinal }
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
  fixNextConfig,
  fixProcessesRouteEnvError,
  fixIllustrationSearchImgFinal
};
