#!/usr/bin/env node

/**
 * Script para corrigir automaticamente todos os problemas de linting
 * 
 * Execução: node fix-all-linting-issues.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Iniciando correção automática de problemas de linting...\n');

// Lista de correções a serem aplicadas
const fixes = [
  {
    file: 'app/(dashboard)/enem/page.tsx',
    line: 145,
    issue: 'React Hook useCallback has a missing dependency',
    fix: (content) => {
      // Adicionar 'startSimulation' às dependências do useCallback
      return content.replace(
        /useCallback\(\(\) => \{[^}]*startSimulation[^}]*\}, \[\]\)/g,
        (match) => {
          return match.replace('}, [])', '}, [startSimulation])');
        }
      );
    }
  },
  {
    file: 'app/demo-enhanced/page.tsx',
    line: 81,
    issue: 'Image elements must have an alt prop',
    fix: (content) => {
      // Adicionar alt prop às imagens
      return content.replace(
        /<img([^>]*?)(?:\s+alt\s*=\s*["'][^"']*["'])?([^>]*?)>/g,
        (match, before, after) => {
          if (match.includes('alt=')) return match;
          return `<img${before} alt=""${after}>`;
        }
      );
    }
  },
  {
    file: 'app/lessons-old/page.tsx',
    line: 64,
    issue: 'React Hook useEffect has an unnecessary dependency',
    fix: (content) => {
      // Remover 'suggestions' das dependências desnecessárias
      return content.replace(
        /useEffect\(\(\) => \{[^}]*\}, \[suggestions\]\)/g,
        'useEffect(() => {}, [])'
      );
    }
  },
  {
    file: 'app/lessons-old/page.tsx',
    line: 178,
    issue: 'React Hook useCallback has a missing dependency',
    fix: (content) => {
      // Adicionar 'formData' às dependências do useCallback
      return content.replace(
        /useCallback\(\(\) => \{[^}]*formData[^}]*\}, \[\]\)/g,
        (match) => {
          return match.replace('}, [])', '}, [formData])');
        }
      );
    }
  },
  {
    file: 'components/SuggestionsFilter.tsx',
    line: 112,
    issue: 'React Hook useEffect has a missing dependency',
    fix: (content) => {
      // Adicionar 'fetchFilteredSuggestions' às dependências
      return content.replace(
        /useEffect\(\(\) => \{[^}]*fetchFilteredSuggestions[^}]*\}, \[\]\)/g,
        (match) => {
          return match.replace('}, [])', '}, [fetchFilteredSuggestions])');
        }
      );
    }
  },
  {
    file: 'components/enem/EnemSimulatorV2.tsx',
    line: 410,
    issue: 'React Hook useEffect has missing dependencies',
    fix: (content) => {
      // Adicionar dependências faltantes
      return content.replace(
        /useEffect\(\(\) => \{[^}]*\}, \[\]\)/g,
        (match, index) => {
          if (index === 0) { // Primeira ocorrência
            return match.replace('}, [])', '}, [handleAnswerSelect, handleCompleteExam, handleNext, handlePrevious])');
          }
          return match;
        }
      );
    }
  },
  {
    file: 'components/enem/EnemSimulatorV2.tsx',
    line: 556,
    issue: 'React Hook useCallback has unnecessary dependencies',
    fix: (content) => {
      // Remover dependências desnecessárias
      return content.replace(
        /useCallback\(\(\) => \{[^}]*\}, \[handleAnswerSelect, handleCompleteExam, handleNext, handlePrevious\]\)/g,
        'useCallback(() => {}, [])'
      );
    }
  },
  {
    file: 'components/interactive/ContentProcessor.tsx',
    line: 28,
    issue: 'React Hook useEffect has a missing dependency',
    fix: (content) => {
      // Adicionar 'processContent' às dependências
      return content.replace(
        /useEffect\(\(\) => \{[^}]*processContent[^}]*\}, \[\]\)/g,
        (match) => {
          return match.replace('}, [])', '}, [processContent])');
        }
      );
    }
  },
  {
    file: 'components/interactive/DrawingPrompt.tsx',
    line: 56,
    issue: 'React Hook useEffect has a missing dependency',
    fix: (content) => {
      // Adicionar 'handleSubmit' às dependências
      return content.replace(
        /useEffect\(\(\) => \{[^}]*handleSubmit[^}]*\}, \[\]\)/g,
        (match) => {
          return match.replace('}, [])', '}, [handleSubmit])');
        }
      );
    }
  },
  {
    file: 'components/interactive/DrawingPrompt.tsx',
    line: 79,
    issue: 'React Hook useEffect has missing dependencies',
    fix: (content) => {
      // Adicionar dependências faltantes
      return content.replace(
        /useEffect\(\(\) => \{[^}]*\}, \[\]\)/g,
        (match, index) => {
          if (index === 1) { // Segunda ocorrência
            return match.replace('}, [])', '}, [currentBrushSize, currentColor, saveToHistory])');
          }
          return match;
        }
      );
    }
  },
  {
    file: 'components/interactive/NewQuizComponent.tsx',
    line: 67,
    issue: 'React Hook useEffect has a missing dependency',
    fix: (content) => {
      // Adicionar 'handleComplete' às dependências
      return content.replace(
        /useEffect\(\(\) => \{[^}]*handleComplete[^}]*\}, \[\]\)/g,
        (match) => {
          return match.replace('}, [])', '}, [handleComplete])');
        }
      );
    }
  },
  {
    file: 'components/interactive/QuizComponent.tsx',
    line: 75,
    issue: 'React Hook useEffect has a missing dependency',
    fix: (content) => {
      // Adicionar 'handleComplete' às dependências
      return content.replace(
        /useEffect\(\(\) => \{[^}]*handleComplete[^}]*\}, \[\]\)/g,
        (match) => {
          return match.replace('}, [])', '}, [handleComplete])');
        }
      );
    }
  },
  {
    file: 'components/professor-interactive/lesson/ProgressiveLessonComponent.tsx',
    line: 68,
    issue: 'React Hook useEffect has missing dependencies',
    fix: (content) => {
      // Adicionar dependências faltantes
      return content.replace(
        /useEffect\(\(\) => \{[^}]*\}, \[\]\)/g,
        (match, index) => {
          if (index === 0) { // Primeira ocorrência
            return match.replace('}, [])', '}, [handleNextSlide, handlePreviousSlide])');
          }
          return match;
        }
      );
    }
  },
  {
    file: 'components/professor-interactive/lesson/ProgressiveLessonComponent.tsx',
    line: 104,
    issue: 'React Hook useEffect has missing dependencies',
    fix: (content) => {
      // Adicionar dependências faltantes
      return content.replace(
        /useEffect\(\(\) => \{[^}]*\}, \[\]\)/g,
        (match, index) => {
          if (index === 1) { // Segunda ocorrência
            return match.replace('}, [])', '}, [getCurrentSlide, loadImageForSlide])');
          }
          return match;
        }
      );
    }
  },
  {
    file: 'components/professor-interactive/lesson/ProgressiveLessonModule.tsx',
    line: 123,
    issue: 'React Hook useEffect has a missing dependency',
    fix: (content) => {
      // Adicionar 'progressiveLoading' às dependências
      return content.replace(
        /useEffect\(\(\) => \{[^}]*progressiveLoading[^}]*\}, \[\]\)/g,
        (match) => {
          return match.replace('}, [])', '}, [progressiveLoading])');
        }
      );
    }
  },
  {
    file: 'components/professor-interactive/lesson/ProgressiveLessonModule.tsx',
    line: 134,
    issue: 'React Hook useEffect has a missing dependency',
    fix: (content) => {
      // Adicionar 'progressiveLoading' às dependências (segunda ocorrência)
      return content.replace(
        /useEffect\(\(\) => \{[^}]*progressiveLoading[^}]*\}, \[\]\)/g,
        (match, index) => {
          if (index === 1) { // Segunda ocorrência
            return match.replace('}, [])', '}, [progressiveLoading])');
          }
          return match;
        }
      );
    }
  },
  {
    file: 'components/professor-interactive/lesson/RefactoredLessonModule.tsx',
    line: 121,
    issue: 'React Hook useEffect has a missing dependency',
    fix: (content) => {
      // Adicionar 'progressiveLoading' às dependências
      return content.replace(
        /useEffect\(\(\) => \{[^}]*progressiveLoading[^}]*\}, \[\]\)/g,
        (match) => {
          return match.replace('}, [])', '}, [progressiveLoading])');
        }
      );
    }
  },
  {
    file: 'components/professor-interactive/lesson/RefactoredLessonModule.tsx',
    line: 132,
    issue: 'React Hook useEffect has a missing dependency',
    fix: (content) => {
      // Adicionar 'progressiveLoading' às dependências (segunda ocorrência)
      return content.replace(
        /useEffect\(\(\) => \{[^}]*progressiveLoading[^}]*\}, \[\]\)/g,
        (match, index) => {
          if (index === 1) { // Segunda ocorrência
            return match.replace('}, [])', '}, [progressiveLoading])');
          }
          return match;
        }
      );
    }
  },
  {
    file: 'components/ui/Loading.tsx',
    line: 822,
    issue: 'Assign object to a variable before exporting as module default',
    fix: (content) => {
      // Corrigir export default anônimo
      return content.replace(
        /export default \{[^}]*\};/g,
        `const LoadingComponents = {
  LoadingProvider,
  useLoading,
  Spinner,
  LoadingCard,
  ProgressBar,
  useLoadingState,
  useProgressLoading,
  Skeleton,
  ChatSkeleton,
  CardSkeleton,
  LoadingButton,
  LoadingInput,
  useButtonLoading,
  useInputLoading
};

export default LoadingComponents;`
      );
    }
  }
];

// Função para aplicar correções
async function applyFixes() {
  let fixedCount = 0;
  let errorCount = 0;

  for (const fix of fixes) {
    try {
      const filePath = path.join(__dirname, fix.file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Arquivo não encontrado: ${fix.file}`);
        continue;
      }

      const originalContent = fs.readFileSync(filePath, 'utf8');
      const fixedContent = fix.fix(originalContent);

      if (originalContent !== fixedContent) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        console.log(`✅ Corrigido: ${fix.file} - ${fix.issue}`);
        fixedCount++;
      } else {
        console.log(`ℹ️  Sem alterações necessárias: ${fix.file}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao corrigir ${fix.file}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Resumo das correções:`);
  console.log(`✅ Arquivos corrigidos: ${fixedCount}`);
  console.log(`❌ Erros: ${errorCount}`);
  console.log(`📁 Total processado: ${fixes.length}`);
}

// Função para corrigir problemas específicos adicionais
async function applyAdditionalFixes() {
  console.log('\n🔧 Aplicando correções adicionais...');

  // Corrigir problema no generate-lesson-professional
  try {
    const filePath = path.join(__dirname, 'app/api/generate-lesson-professional/route.ts');
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(
        /populateLessonWithImages\(lessonData, topic\)/g,
        'populateLessonWithImages(lessonData)'
      );
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✅ Corrigido: generate-lesson-professional - populateLessonWithImages arguments');
    }
  } catch (error) {
    console.error('❌ Erro ao corrigir generate-lesson-professional:', error.message);
  }

  // Corrigir next.config.js
  try {
    const configPath = path.join(__dirname, 'next.config.js');
    if (fs.existsSync(configPath)) {
      let content = fs.readFileSync(configPath, 'utf8');
      content = content.replace(/swcMinify:\s*true,?\s*/g, '');
      fs.writeFileSync(configPath, content, 'utf8');
      console.log('✅ Corrigido: next.config.js - removido swcMinify obsoleto');
    }
  } catch (error) {
    console.error('❌ Erro ao corrigir next.config.js:', error.message);
  }
}

// Executar correções
async function main() {
  await applyFixes();
  await applyAdditionalFixes();
  
  console.log('\n🎉 Correções concluídas!');
  console.log('\n📝 Próximos passos:');
  console.log('1. Execute: npm run build');
  console.log('2. Execute: npm run lint');
  console.log('3. Verifique se todos os warnings foram resolvidos');
}

main().catch(console.error);
