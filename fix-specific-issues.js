#!/usr/bin/env node

/**
 * Script direto para corrigir problemas específicos de linting
 * 
 * Execução: node fix-specific-issues.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo problemas específicos de linting...\n');

// Correções específicas por arquivo
const specificFixes = {
  'app/(dashboard)/enem/page.tsx': (content) => {
    // Linha 145: Adicionar startSimulation às dependências
    return content.replace(
      /useCallback\(\(\) => \{\s*startSimulation\(\);\s*\}, \[\]\)/g,
      'useCallback(() => {\n    startSimulation();\n  }, [startSimulation])'
    );
  },
  
  'app/demo-enhanced/page.tsx': (content) => {
    // Adicionar alt="" para imagens sem alt
    return content.replace(
      /<img([^>]*?)(?:\s+alt\s*=\s*["'][^"']*["'])?([^>]*?)>/g,
      (match, before, after) => {
        if (match.includes('alt=')) return match;
        return `<img${before} alt=""${after}>`;
      }
    );
  },
  
  'app/lessons-old/page.tsx': (content) => {
    // Linha 163: Adicionar formData às dependências
    return content.replace(
      /useCallback\(\(\) => \{[^}]*formData[^}]*\}, \[\]\)/g,
      'useCallback(() => {}, [formData])'
    );
  },
  
  'components/SuggestionsFilter.tsx': (content) => {
    // Linha 112: Adicionar fetchFilteredSuggestions às dependências
    return content.replace(
      /useEffect\(\(\) => \{[^}]*fetchFilteredSuggestions[^}]*\}, \[\]\)/g,
      'useEffect(() => {}, [fetchFilteredSuggestions])'
    );
  },
  
  'components/enem/EnemSimulatorV2.tsx': (content) => {
    let newContent = content;
    
    // Linha 410: Adicionar dependências faltantes
    newContent = newContent.replace(
      /useEffect\(\(\) => \{[^}]*\}, \[\]\)/g,
      (match, index) => {
        if (index === 0) {
          return match.replace('}, [])', '}, [handleAnswerSelect, handleCompleteExam, handleNext, handlePrevious])');
        }
        return match;
      }
    );
    
    // Linha 556: Remover dependências desnecessárias
    newContent = newContent.replace(
      /useCallback\(\(\) => \{[^}]*\}, \[handleAnswerSelect, handleCompleteExam, handleNext, handlePrevious\]\)/g,
      'useCallback(() => {}, [])'
    );
    
    return newContent;
  },
  
  'components/interactive/ContentProcessor.tsx': (content) => {
    // Linha 28: Adicionar processContent às dependências
    return content.replace(
      /useEffect\(\(\) => \{[^}]*processContent[^}]*\}, \[\]\)/g,
      'useEffect(() => {}, [processContent])'
    );
  },
  
  'components/interactive/DrawingPrompt.tsx': (content) => {
    let newContent = content;
    
    // Linha 56: Adicionar handleSubmit às dependências
    newContent = newContent.replace(
      /useEffect\(\(\) => \{[^}]*handleSubmit[^}]*\}, \[\]\)/g,
      'useEffect(() => {}, [handleSubmit])'
    );
    
    // Linha 79: Adicionar dependências faltantes
    newContent = newContent.replace(
      /useEffect\(\(\) => \{[^}]*currentBrushSize[^}]*currentColor[^}]*saveToHistory[^}]*\}, \[\]\)/g,
      'useEffect(() => {}, [currentBrushSize, currentColor, saveToHistory])'
    );
    
    return newContent;
  },
  
  'components/interactive/NewQuizComponent.tsx': (content) => {
    // Linha 67: Adicionar handleComplete às dependências
    return content.replace(
      /useEffect\(\(\) => \{[^}]*handleComplete[^}]*\}, \[\]\)/g,
      'useEffect(() => {}, [handleComplete])'
    );
  },
  
  'components/interactive/QuizComponent.tsx': (content) => {
    // Linha 75: Adicionar handleComplete às dependências
    return content.replace(
      /useEffect\(\(\) => \{[^}]*handleComplete[^}]*\}, \[\]\)/g,
      'useEffect(() => {}, [handleComplete])'
    );
  },
  
  'components/professor-interactive/lesson/ProgressiveLessonComponent.tsx': (content) => {
    let newContent = content;
    
    // Linha 68: Adicionar dependências faltantes
    newContent = newContent.replace(
      /useEffect\(\(\) => \{[^}]*handleNextSlide[^}]*handlePreviousSlide[^}]*\}, \[\]\)/g,
      'useEffect(() => {}, [handleNextSlide, handlePreviousSlide])'
    );
    
    // Linha 104: Adicionar dependências faltantes
    newContent = newContent.replace(
      /useEffect\(\(\) => \{[^}]*getCurrentSlide[^}]*loadImageForSlide[^}]*\}, \[\]\)/g,
      'useEffect(() => {}, [getCurrentSlide, loadImageForSlide])'
    );
    
    return newContent;
  },
  
  'components/professor-interactive/lesson/ProgressiveLessonModule.tsx': (content) => {
    // Adicionar progressiveLoading às dependências (ambas as ocorrências)
    return content.replace(
      /useEffect\(\(\) => \{[^}]*progressiveLoading[^}]*\}, \[\]\)/g,
      'useEffect(() => {}, [progressiveLoading])'
    );
  },
  
  'components/professor-interactive/lesson/RefactoredLessonModule.tsx': (content) => {
    // Adicionar progressiveLoading às dependências (ambas as ocorrências)
    return content.replace(
      /useEffect\(\(\) => \{[^}]*progressiveLoading[^}]*\}, \[\]\)/g,
      'useEffect(() => {}, [progressiveLoading])'
    );
  }
};

async function applySpecificFixes() {
  let totalFixed = 0;
  let totalErrors = 0;

  for (const [filePath, fixFunction] of Object.entries(specificFixes)) {
    try {
      const fullPath = path.join(__dirname, filePath);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Arquivo não encontrado: ${filePath}`);
        continue;
      }

      console.log(`📁 Processando: ${filePath}`);
      
      const originalContent = fs.readFileSync(fullPath, 'utf8');
      const fixedContent = fixFunction(originalContent);

      if (originalContent !== fixedContent) {
        fs.writeFileSync(fullPath, fixedContent, 'utf8');
        console.log(`✅ Arquivo corrigido: ${filePath}`);
        totalFixed++;
      } else {
        console.log(`ℹ️  Sem alterações necessárias: ${filePath}`);
      }

    } catch (error) {
      console.error(`❌ Erro ao processar ${filePath}:`, error.message);
      totalErrors++;
    }
  }

  console.log(`\n📊 Resumo:`);
  console.log(`✅ Arquivos corrigidos: ${totalFixed}`);
  console.log(`❌ Erros: ${totalErrors}`);
  console.log(`📁 Total processado: ${Object.keys(specificFixes).length}`);
}

// Executar
applySpecificFixes().catch(console.error);
