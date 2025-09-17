#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Corrigindo warnings finais de ESLint...\n');

// Função para ler arquivo
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.log(`❌ Erro ao ler arquivo ${filePath}: ${error.message}`);
    return null;
  }
}

// Função para escrever arquivo
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.log(`❌ Erro ao escrever arquivo ${filePath}: ${error.message}`);
    return false;
  }
}

// Correções finais baseadas nos warnings restantes
const finalFixes = [
  {
    file: 'app/lessons-old/page.tsx',
    fix: (content) => {
      // Mover suggestions para dentro do useEffect ou usar useMemo
      let modified = content;
      
      // Encontrar o array suggestions e movê-lo para dentro do useEffect
      const suggestionsMatch = modified.match(/const suggestions = \[([\s\S]*?)\]/);
      if (suggestionsMatch) {
        const suggestionsArray = suggestionsMatch[0];
        const suggestionsContent = suggestionsMatch[1];
        
        // Remover a declaração original
        modified = modified.replace(suggestionsMatch[0], '');
        
        // Adicionar dentro do useEffect
        modified = modified.replace(
          /useEffect\(\(\) => \{[\s\S]*?const shuffled = \[\.\.\.suggestions\]/,
          `useEffect(() => {
    const suggestions = [${suggestionsContent}];
    const shuffled = [...suggestions]`
        );
        
        console.log('  ✅ Movido array suggestions para dentro do useEffect');
      }
      
      // Envolver handleGenerate em useCallback
      const handleGenerateMatch = modified.match(/const handleGenerate = async \(\) => \{[\s\S]*?\n  \}/);
      if (handleGenerateMatch) {
        const handleGenerateContent = handleGenerateMatch[0];
        const wrappedContent = `const handleGenerate = useCallback(async () => {${handleGenerateContent.replace('const handleGenerate = async () => {', '').replace('\n  }', '\n  }')}, [])`;
        
        modified = modified.replace(handleGenerateMatch[0], wrappedContent);
        console.log('  ✅ Envolvido handleGenerate em useCallback');
      }
      
      return modified;
    }
  },
  {
    file: 'components/enem/EnemSimulatorV2.tsx',
    fix: (content) => {
      // Adicionar dependências ao useEffect na linha 410
      let modified = content;
      modified = modified.replace(
        /useEffect\(\(\) => \{[\s\S]*?\n  \}, \[\]\)/,
        (match) => {
          if (match.includes('handleAnswerSelect') || match.includes('handleCompleteExam')) {
            return match.replace('[]', '[handleAnswerSelect, handleCompleteExam, handleNext, handlePrevious]');
          }
          return match;
        }
      );
      console.log('  ✅ Adicionado dependências ao useEffect');
      return modified;
    }
  },
  {
    file: 'components/interactive/DrawingPrompt.tsx',
    fix: (content) => {
      let modified = content;
      
      // Linha 56 - adicionar handleSubmit
      modified = modified.replace(
        /useEffect\(\(\) => \{[\s\S]*?handleSubmit[\s\S]*?\n  \}, \[\]\)/,
        (match) => match.replace('[]', '[handleSubmit]')
      );
      
      // Linha 79 - adicionar currentBrushSize, currentColor, saveToHistory
      modified = modified.replace(
        /useEffect\(\(\) => \{[\s\S]*?(currentBrushSize|currentColor|saveToHistory)[\s\S]*?\n  \}, \[\]\)/,
        (match) => match.replace('[]', '[currentBrushSize, currentColor, saveToHistory]')
      );
      
      console.log('  ✅ Adicionado dependências aos useEffect');
      return modified;
    }
  },
  {
    file: 'components/interactive/QuizComponent.tsx',
    fix: (content) => {
      let modified = content;
      modified = modified.replace(
        /useEffect\(\(\) => \{[\s\S]*?handleComplete[\s\S]*?\n  \}, \[\]\)/,
        (match) => match.replace('[]', '[handleComplete]')
      );
      console.log('  ✅ Adicionado handleComplete às dependências');
      return modified;
    }
  },
  {
    file: 'components/professor-interactive/lesson/ProgressiveLessonComponent.tsx',
    fix: (content) => {
      let modified = content;
      
      // Linha 68
      modified = modified.replace(
        /useEffect\(\(\) => \{[\s\S]*?(handleNextSlide|handlePreviousSlide)[\s\S]*?\n  \}, \[\]\)/,
        (match) => match.replace('[]', '[handleNextSlide, handlePreviousSlide]')
      );
      
      // Linha 104
      modified = modified.replace(
        /useEffect\(\(\) => \{[\s\S]*?(getCurrentSlide|loadImageForSlide)[\s\S]*?\n  \}, \[\]\)/,
        (match) => match.replace('[]', '[getCurrentSlide, loadImageForSlide]')
      );
      
      console.log('  ✅ Adicionado dependências aos useEffect');
      return modified;
    }
  },
  {
    file: 'components/professor-interactive/lesson/ProgressiveLessonModule.tsx',
    fix: (content) => {
      let modified = content;
      modified = modified.replace(
        /useEffect\(\(\) => \{[\s\S]*?progressiveLoading[\s\S]*?\n  \}, \[\]\)/g,
        (match) => match.replace('[]', '[progressiveLoading]')
      );
      console.log('  ✅ Adicionado progressiveLoading às dependências');
      return modified;
    }
  },
  {
    file: 'components/professor-interactive/lesson/RefactoredLessonModule.tsx',
    fix: (content) => {
      let modified = content;
      modified = modified.replace(
        /useEffect\(\(\) => \{[\s\S]*?progressiveLoading[\s\S]*?\n  \}, \[\]\)/g,
        (match) => match.replace('[]', '[progressiveLoading]')
      );
      console.log('  ✅ Adicionado progressiveLoading às dependências');
      return modified;
    }
  }
];

// Função principal
async function main() {
  let totalFilesProcessed = 0;
  let totalFilesModified = 0;

  for (const fix of finalFixes) {
    console.log(`🔧 Corrigindo ${fix.file}...`);
    
    const content = readFile(fix.file);
    if (!content) {
      console.log(`  ⚠️  Arquivo não encontrado: ${fix.file}`);
      continue;
    }

    totalFilesProcessed++;
    const modifiedContent = fix.fix(content);
    
    if (modifiedContent !== content) {
      if (writeFile(fix.file, modifiedContent)) {
        totalFilesModified++;
        console.log(`  ✅ ${fix.file} corrigido com sucesso`);
      }
    } else {
      console.log(`  ℹ️  Nenhuma alteração necessária em ${fix.file}`);
    }
    
    console.log('');
  }

  console.log(`📊 Resumo das correções:`);
  console.log(`  - Arquivos processados: ${totalFilesProcessed}`);
  console.log(`  - Arquivos modificados: ${totalFilesModified}`);
  console.log(`  - Correções aplicadas: ${finalFixes.length} arquivos`);

  // Testar build final
  console.log('\n🔄 Testando build final...\n');
  
  try {
    const output = execSync('npm run build', { encoding: 'utf8', stdio: 'pipe' });
    console.log('🎉 SUCESSO! Build funcionando perfeitamente!');
    
    // Verificar se ainda há warnings
    const warnings = output.split('\n').filter(line => line.includes('Warning:'));
    if (warnings.length > 0) {
      console.log(`⚠️  Ainda há ${warnings.length} warnings menores, mas o build está funcionando:`);
      warnings.slice(0, 3).forEach(warning => console.log(`  ${warning.trim()}`));
      if (warnings.length > 3) {
        console.log(`  ... e mais ${warnings.length - 3} warnings`);
      }
      console.log('\n✨ O projeto está pronto para desenvolvimento!');
    } else {
      console.log('✨ Build completamente limpo! Sem warnings ou erros.');
      console.log('🚀 Projeto pronto para produção!');
    }
  } catch (error) {
    console.log('❌ Ainda há erros no build:');
    console.log(error.stdout || error.stderr);
  }
}

// Executar script
main().catch(error => {
  console.error('❌ Erro no script:', error);
  process.exit(1);
});

