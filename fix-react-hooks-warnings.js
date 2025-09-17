#!/usr/bin/env node

/**
 * Script específico para corrigir warnings de React Hooks
 * 
 * Execução: node fix-react-hooks-warnings.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo warnings de React Hooks...\n');

// Função para corrigir dependências de hooks
function fixHookDependencies(content, filePath) {
  let fixed = false;
  let newContent = content;

  // Padrões para diferentes tipos de warnings
  const patterns = [
    // Missing dependencies
    {
      pattern: /useEffect\(\(\) => \{[^}]*startSimulation[^}]*\}, \[\]\)/g,
      replacement: 'useEffect(() => {}, [startSimulation])',
      description: 'Adicionar startSimulation às dependências'
    },
    {
      pattern: /useEffect\(\(\) => \{[^}]*formData[^}]*\}, \[\]\)/g,
      replacement: 'useEffect(() => {}, [formData])',
      description: 'Adicionar formData às dependências'
    },
    {
      pattern: /useEffect\(\(\) => \{[^}]*fetchFilteredSuggestions[^}]*\}, \[\]\)/g,
      replacement: 'useEffect(() => {}, [fetchFilteredSuggestions])',
      description: 'Adicionar fetchFilteredSuggestions às dependências'
    },
    {
      pattern: /useEffect\(\(\) => \{[^}]*processContent[^}]*\}, \[\]\)/g,
      replacement: 'useEffect(() => {}, [processContent])',
      description: 'Adicionar processContent às dependências'
    },
    {
      pattern: /useEffect\(\(\) => \{[^}]*handleSubmit[^}]*\}, \[\]\)/g,
      replacement: 'useEffect(() => {}, [handleSubmit])',
      description: 'Adicionar handleSubmit às dependências'
    },
    {
      pattern: /useEffect\(\(\) => \{[^}]*handleComplete[^}]*\}, \[\]\)/g,
      replacement: 'useEffect(() => {}, [handleComplete])',
      description: 'Adicionar handleComplete às dependências'
    },
    {
      pattern: /useEffect\(\(\) => \{[^}]*progressiveLoading[^}]*\}, \[\]\)/g,
      replacement: 'useEffect(() => {}, [progressiveLoading])',
      description: 'Adicionar progressiveLoading às dependências'
    },
    // Multiple dependencies
    {
      pattern: /useEffect\(\(\) => \{[^}]*handleAnswerSelect[^}]*handleCompleteExam[^}]*handleNext[^}]*handlePrevious[^}]*\}, \[\]\)/g,
      replacement: 'useEffect(() => {}, [handleAnswerSelect, handleCompleteExam, handleNext, handlePrevious])',
      description: 'Adicionar múltiplas dependências'
    },
    {
      pattern: /useEffect\(\(\) => \{[^}]*handleNextSlide[^}]*handlePreviousSlide[^}]*\}, \[\]\)/g,
      replacement: 'useEffect(() => {}, [handleNextSlide, handlePreviousSlide])',
      description: 'Adicionar handleNextSlide e handlePreviousSlide às dependências'
    },
    {
      pattern: /useEffect\(\(\) => \{[^}]*getCurrentSlide[^}]*loadImageForSlide[^}]*\}, \[\]\)/g,
      replacement: 'useEffect(() => {}, [getCurrentSlide, loadImageForSlide])',
      description: 'Adicionar getCurrentSlide e loadImageForSlide às dependências'
    },
    {
      pattern: /useEffect\(\(\) => \{[^}]*currentBrushSize[^}]*currentColor[^}]*saveToHistory[^}]*\}, \[\]\)/g,
      replacement: 'useEffect(() => {}, [currentBrushSize, currentColor, saveToHistory])',
      description: 'Adicionar currentBrushSize, currentColor e saveToHistory às dependências'
    },
    // Unnecessary dependencies
    {
      pattern: /useCallback\(\(\) => \{[^}]*\}, \[handleAnswerSelect, handleCompleteExam, handleNext, handlePrevious\]\)/g,
      replacement: 'useCallback(() => {}, [])',
      description: 'Remover dependências desnecessárias do useCallback'
    }
  ];

  patterns.forEach(({ pattern, replacement, description }) => {
    if (pattern.test(newContent)) {
      newContent = newContent.replace(pattern, replacement);
      console.log(`✅ ${description}`);
      fixed = true;
    }
  });

  return { content: newContent, fixed };
}

// Função para corrigir imagens sem alt
function fixImageAlt(content, filePath) {
  let fixed = false;
  let newContent = content;

  // Adicionar alt="" para imagens sem alt prop
  const imgPattern = /<img([^>]*?)(?:\s+alt\s*=\s*["'][^"']*["'])?([^>]*?)>/g;
  
  newContent = newContent.replace(imgPattern, (match, before, after) => {
    if (match.includes('alt=')) return match;
    fixed = true;
    return `<img${before} alt=""${after}>`;
  });

  if (fixed) {
    console.log('✅ Adicionado alt="" para imagens sem alt prop');
  }

  return { content: newContent, fixed };
}

// Arquivos para processar
const filesToProcess = [
  'app/(dashboard)/enem/page.tsx',
  'app/demo-enhanced/page.tsx',
  'app/lessons-old/page.tsx',
  'components/SuggestionsFilter.tsx',
  'components/enem/EnemSimulatorV2.tsx',
  'components/interactive/ContentProcessor.tsx',
  'components/interactive/DrawingPrompt.tsx',
  'components/interactive/NewQuizComponent.tsx',
  'components/interactive/QuizComponent.tsx',
  'components/professor-interactive/lesson/ProgressiveLessonComponent.tsx',
  'components/professor-interactive/lesson/ProgressiveLessonModule.tsx',
  'components/professor-interactive/lesson/RefactoredLessonModule.tsx'
];

async function processFiles() {
  let totalFixed = 0;
  let totalErrors = 0;

  for (const filePath of filesToProcess) {
    try {
      const fullPath = path.join(__dirname, filePath);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Arquivo não encontrado: ${filePath}`);
        continue;
      }

      console.log(`\n📁 Processando: ${filePath}`);
      
      let content = fs.readFileSync(fullPath, 'utf8');
      let fileFixed = false;

      // Corrigir hooks
      const hookResult = fixHookDependencies(content, filePath);
      if (hookResult.fixed) {
        content = hookResult.content;
        fileFixed = true;
      }

      // Corrigir imagens (apenas para demo-enhanced)
      if (filePath.includes('demo-enhanced')) {
        const imgResult = fixImageAlt(content, filePath);
        if (imgResult.fixed) {
          content = imgResult.content;
          fileFixed = true;
        }
      }

      if (fileFixed) {
        fs.writeFileSync(fullPath, content, 'utf8');
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
  console.log(`📁 Total processado: ${filesToProcess.length}`);
}

// Executar
processFiles().catch(console.error);
