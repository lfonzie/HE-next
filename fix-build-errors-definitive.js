#!/usr/bin/env node

/**
 * Script final definitivo para corrigir todos os erros
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Aplicando correção definitiva...\n');

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

// Correção definitiva: Remover TODAS as propriedades alt dos ícones Lucide
function fixLucideImagesDefinitive() {
  console.log('\n🔧 Removendo definitivamente todas as propriedades alt dos ícones Lucide...');
  
  const filePath = './app/aulas/page-new.tsx';
  const content = readFile(filePath);
  
  if (!content) return false;
  
  let fixedContent = content;
  
  // Remover propriedade alt de todos os ícones Image (Lucide) - padrão mais específico
  fixedContent = fixedContent.replace(
    /<Image className="[^"]*" alt="[^"]*" \/>/g,
    (match) => {
      // Extrair apenas a className
      const classNameMatch = match.match(/className="[^"]*"/);
      return classNameMatch ? `<Image ${classNameMatch[0]} />` : match;
    }
  );
  
  // Também remover alt="" se existir
  fixedContent = fixedContent.replace(
    /<Image className="[^"]*" alt="" \/>/g,
    (match) => {
      const classNameMatch = match.match(/className="[^"]*"/);
      return classNameMatch ? `<Image ${classNameMatch[0]} />` : match;
    }
  );
  
  return writeFile(filePath, fixedContent);
}

// Função principal
async function main() {
  console.log('🚀 Aplicando correção definitiva...\n');
  
  if (fixLucideImagesDefinitive()) {
    console.log('\n🎉 Correção definitiva aplicada!');
    console.log('\n📋 Execute: npm run build');
  } else {
    console.log('\n❌ Falha na correção definitiva!');
  }
}

// Executar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  fixLucideImagesDefinitive
};
