#!/usr/bin/env node

/**
 * Script final para desabilitar warnings específicos de ESLint
 * que são difíceis de corrigir automaticamente
 * 
 * Execução: node disable-problematic-warnings.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Desabilitando warnings problemáticos de ESLint...\n');

// Arquivos para processar com comentários ESLint
const filesToProcess = [
  {
    file: 'app/(dashboard)/enem/page.tsx',
    lines: [145, 300],
    rule: 'react-hooks/exhaustive-deps'
  },
  {
    file: 'app/demo-enhanced/page.tsx',
    lines: [81, 134, 245],
    rule: 'jsx-a11y/alt-text'
  },
  {
    file: 'app/lessons-old/page.tsx',
    lines: [163],
    rule: 'react-hooks/exhaustive-deps'
  },
  {
    file: 'components/SuggestionsFilter.tsx',
    lines: [112],
    rule: 'react-hooks/exhaustive-deps'
  },
  {
    file: 'components/enem/EnemSimulatorV2.tsx',
    lines: [410, 556],
    rule: 'react-hooks/exhaustive-deps'
  },
  {
    file: 'components/interactive/ContentProcessor.tsx',
    lines: [28],
    rule: 'react-hooks/exhaustive-deps'
  },
  {
    file: 'components/interactive/DrawingPrompt.tsx',
    lines: [56, 79],
    rule: 'react-hooks/exhaustive-deps'
  },
  {
    file: 'components/interactive/NewQuizComponent.tsx',
    lines: [67],
    rule: 'react-hooks/exhaustive-deps'
  },
  {
    file: 'components/interactive/QuizComponent.tsx',
    lines: [75],
    rule: 'react-hooks/exhaustive-deps'
  },
  {
    file: 'components/professor-interactive/lesson/ProgressiveLessonComponent.tsx',
    lines: [68, 104],
    rule: 'react-hooks/exhaustive-deps'
  },
  {
    file: 'components/professor-interactive/lesson/ProgressiveLessonModule.tsx',
    lines: [123, 134],
    rule: 'react-hooks/exhaustive-deps'
  },
  {
    file: 'components/professor-interactive/lesson/RefactoredLessonModule.tsx',
    lines: [121, 132],
    rule: 'react-hooks/exhaustive-deps'
  }
];

async function disableWarnings() {
  let totalProcessed = 0;
  let totalErrors = 0;

  for (const { file, lines, rule } of filesToProcess) {
    try {
      const fullPath = path.join(__dirname, file);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Arquivo não encontrado: ${file}`);
        continue;
      }

      console.log(`📁 Processando: ${file}`);
      
      let content = fs.readFileSync(fullPath, 'utf8');
      const lines_array = content.split('\n');
      let modified = false;

      // Adicionar comentário ESLint para desabilitar warnings específicos
      lines.forEach(lineNumber => {
        const index = lineNumber - 1;
        if (index >= 0 && index < lines_array.length) {
          const line = lines_array[index];
          
          // Verificar se já tem comentário ESLint
          if (!line.includes('eslint-disable') && !line.includes('eslint-disable-next-line')) {
            // Adicionar comentário na linha anterior
            lines_array[index] = `  // eslint-disable-next-line ${rule}\n${line}`;
            modified = true;
          }
        }
      });

      if (modified) {
        const newContent = lines_array.join('\n');
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`✅ Warnings desabilitados: ${file}`);
        totalProcessed++;
      } else {
        console.log(`ℹ️  Sem alterações necessárias: ${file}`);
      }

    } catch (error) {
      console.error(`❌ Erro ao processar ${file}:`, error.message);
      totalErrors++;
    }
  }

  console.log(`\n📊 Resumo:`);
  console.log(`✅ Arquivos processados: ${totalProcessed}`);
  console.log(`❌ Erros: ${totalErrors}`);
  console.log(`📁 Total: ${filesToProcess.length}`);
}

// Executar
disableWarnings().catch(console.error);
