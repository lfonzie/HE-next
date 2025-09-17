#!/usr/bin/env node

/**
 * Script para remover propriedades duplicadas do arquivo wikimedia/search/route.ts
 * 
 * Execução: node fix-duplicate-properties.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Removendo propriedades duplicadas...\n');

const filePath = path.join(__dirname, 'app/api/wikimedia/search/route.ts');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Encontrar todas as propriedades duplicadas
  const propertyRegex = /'([^']+)':\s*'([^']+)',/g;
  const properties = new Map();
  const duplicates = new Set();
  
  let match;
  while ((match = propertyRegex.exec(content)) !== null) {
    const key = match[1];
    if (properties.has(key)) {
      duplicates.add(key);
    } else {
      properties.set(key, match[2]);
    }
  }
  
  console.log(`📊 Propriedades duplicadas encontradas: ${duplicates.size}`);
  
  if (duplicates.size > 0) {
    console.log('🔍 Duplicatas:', Array.from(duplicates).join(', '));
    
    // Remover todas as ocorrências duplicadas (manter apenas a primeira)
    duplicates.forEach(duplicateKey => {
      const regex = new RegExp(`'${duplicateKey}':\\s*'[^']+',\\s*`, 'g');
      const matches = content.match(regex);
      
      if (matches && matches.length > 1) {
        // Manter apenas a primeira ocorrência
        let firstOccurrence = true;
        content = content.replace(regex, (match) => {
          if (firstOccurrence) {
            firstOccurrence = false;
            return match;
          }
          return '';
        });
        console.log(`✅ Removidas ${matches.length - 1} duplicatas de '${duplicateKey}'`);
      }
    });
    
    // Limpar linhas vazias extras
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Arquivo corrigido com sucesso!');
  } else {
    console.log('ℹ️  Nenhuma propriedade duplicada encontrada.');
  }
  
} catch (error) {
  console.error('❌ Erro ao processar arquivo:', error.message);
}
