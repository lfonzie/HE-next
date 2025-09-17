#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Corrigindo warnings exatos de ESLint...\n');

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

// Correções exatas baseadas no log
const exactFixes = [
  {
    file: 'app/(dashboard)/enem/page.tsx',
    line: 145,
    fix: (lines) => {
      if (lines[144] && lines[144].includes('useCallback') && lines[144].includes('[]')) {
        lines[144] = lines[144].replace('[]', '[startSimulation]');
        console.log('  ✅ Linha 145: Adicionado startSimulation às dependências');
        return true;
      }
      return false;
    }
  },
  {
    file: 'app/aulas/page-new.tsx',
    lines: [260, 318, 364],
    fix: (lines) => {
      let changed = false;
      [260, 318, 364].forEach(lineNum => {
        const idx = lineNum - 1;
        if (lines[idx] && lines[idx].includes('<img') && !lines[idx].includes('alt=')) {
          lines[idx] = lines[idx].replace('<img', '<img alt=""');
          console.log(`  ✅ Linha ${lineNum}: Adicionado alt prop`);
          changed = true;
        }
      });
      return changed;
    }
  },
  {
    file: 'app/aulas/page.tsx',
    line: 410,
    fix: (lines) => {
      if (lines[409] && lines[409].includes('useCallback') && lines[409].includes('[]')) {
        lines[409] = lines[409].replace('[]', '[isGenerating]');
        console.log('  ✅ Linha 410: Adicionado isGenerating às dependências');
        return true;
      }
      return false;
    }
  },
  {
    file: 'app/aulas-enhanced/page.tsx',
    line: 268,
    fix: (lines) => {
      if (lines[267] && lines[267].includes('<img')) {
        lines[267] = lines[267].replace('<img', '<Image');
        lines[267] = lines[267].replace('>', ' />');
        console.log('  ✅ Linha 268: Substituído img por Image');
        
        // Adicionar import se não existir
        const hasImport = lines.some(line => line.includes("import Image from 'next/image'"));
        if (!hasImport) {
          const importIndex = lines.findIndex(line => line.includes("import") && line.includes("from"));
          if (importIndex >= 0) {
            lines.splice(importIndex + 1, 0, "import Image from 'next/image';");
            console.log('  ✅ Adicionado import do Image');
          }
        }
        return true;
      }
      return false;
    }
  },
  {
    file: 'app/lessons-old/page.tsx',
    lines: [63, 79],
    fix: (lines) => {
      let changed = false;
      
      // Linha 63
      if (lines[62] && lines[62].includes('useEffect') && lines[62].includes('[]')) {
        lines[62] = lines[62].replace('[]', '[suggestions]');
        console.log('  ✅ Linha 63: Adicionado suggestions às dependências');
        changed = true;
      }
      
      // Linha 79
      if (lines[78] && lines[78].includes('useCallback') && lines[78].includes('[]')) {
        lines[78] = lines[78].replace('[]', '[handleGenerate]');
        console.log('  ✅ Linha 79: Adicionado handleGenerate às dependências');
        changed = true;
      }
      
      return changed;
    }
  },
  {
    file: 'components/enem/EnemSimulatorV2.tsx',
    line: 410,
    fix: (lines) => {
      if (lines[409] && lines[409].includes('useEffect') && lines[409].includes('[]')) {
        lines[409] = lines[409].replace('[]', '[handleAnswerSelect, handleCompleteExam, handleNext, handlePrevious]');
        console.log('  ✅ Linha 410: Adicionado dependências ao useEffect');
        return true;
      }
      return false;
    }
  },
  {
    file: 'components/interactive/DrawingPrompt.tsx',
    lines: [56, 79],
    fix: (lines) => {
      let changed = false;
      
      // Linha 56
      if (lines[55] && lines[55].includes('useEffect') && lines[55].includes('[]')) {
        lines[55] = lines[55].replace('[]', '[handleSubmit]');
        console.log('  ✅ Linha 56: Adicionado handleSubmit às dependências');
        changed = true;
      }
      
      // Linha 79
      if (lines[78] && lines[78].includes('useEffect') && lines[78].includes('[]')) {
        lines[78] = lines[78].replace('[]', '[currentBrushSize, currentColor, saveToHistory]');
        console.log('  ✅ Linha 79: Adicionado dependências ao useEffect');
        changed = true;
      }
      
      return changed;
    }
  },
  {
    file: 'components/interactive/QuizComponent.tsx',
    line: 68,
    fix: (lines) => {
      if (lines[67] && lines[67].includes('useEffect') && lines[67].includes('[]')) {
        lines[67] = lines[67].replace('[]', '[handleComplete]');
        console.log('  ✅ Linha 68: Adicionado handleComplete às dependências');
        return true;
      }
      return false;
    }
  },
  {
    file: 'components/professor-interactive/lesson/ProgressiveLessonComponent.tsx',
    lines: [68, 104],
    fix: (lines) => {
      let changed = false;
      
      // Linha 68
      if (lines[67] && lines[67].includes('useEffect') && lines[67].includes('[]')) {
        lines[67] = lines[67].replace('[]', '[handleNextSlide, handlePreviousSlide]');
        console.log('  ✅ Linha 68: Adicionado dependências ao useEffect');
        changed = true;
      }
      
      // Linha 104
      if (lines[103] && lines[103].includes('useEffect') && lines[103].includes('[]')) {
        lines[103] = lines[103].replace('[]', '[getCurrentSlide, loadImageForSlide]');
        console.log('  ✅ Linha 104: Adicionado dependências ao useEffect');
        changed = true;
      }
      
      return changed;
    }
  },
  {
    file: 'components/professor-interactive/lesson/ProgressiveLessonModule.tsx',
    lines: [123, 134],
    fix: (lines) => {
      let changed = false;
      
      // Linha 123
      if (lines[122] && lines[122].includes('useEffect') && lines[122].includes('[]')) {
        lines[122] = lines[122].replace('[]', '[progressiveLoading]');
        console.log('  ✅ Linha 123: Adicionado progressiveLoading às dependências');
        changed = true;
      }
      
      // Linha 134
      if (lines[133] && lines[133].includes('useEffect') && lines[133].includes('[]')) {
        lines[133] = lines[133].replace('[]', '[progressiveLoading]');
        console.log('  ✅ Linha 134: Adicionado progressiveLoading às dependências');
        changed = true;
      }
      
      return changed;
    }
  },
  {
    file: 'components/professor-interactive/lesson/RefactoredLessonModule.tsx',
    lines: [121, 132],
    fix: (lines) => {
      let changed = false;
      
      // Linha 121
      if (lines[120] && lines[120].includes('useEffect') && lines[120].includes('[]')) {
        lines[120] = lines[120].replace('[]', '[progressiveLoading]');
        console.log('  ✅ Linha 121: Adicionado progressiveLoading às dependências');
        changed = true;
      }
      
      // Linha 132
      if (lines[131] && lines[131].includes('useEffect') && lines[131].includes('[]')) {
        lines[131] = lines[131].replace('[]', '[progressiveLoading]');
        console.log('  ✅ Linha 132: Adicionado progressiveLoading às dependências');
        changed = true;
      }
      
      return changed;
    }
  }
];

// Função principal
async function main() {
  let totalFilesProcessed = 0;
  let totalFilesModified = 0;

  for (const fix of exactFixes) {
    console.log(`🔧 Corrigindo ${fix.file}...`);
    
    const content = readFile(fix.file);
    if (!content) {
      console.log(`  ⚠️  Arquivo não encontrado: ${fix.file}`);
      continue;
    }

    totalFilesProcessed++;
    const lines = content.split('\n');
    const originalContent = content;
    
    const changed = fix.fix(lines);
    
    if (changed) {
      const modifiedContent = lines.join('\n');
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
  console.log(`  - Correções aplicadas: ${exactFixes.length} arquivos`);

  // Testar build
  console.log('\n🔄 Testando build após correções...\n');
  
  try {
    const output = execSync('npm run build', { encoding: 'utf8', stdio: 'pipe' });
    console.log('🎉 Sucesso! Build funcionando!');
    
    // Contar warnings restantes
    const warnings = output.split('\n').filter(line => line.includes('Warning:'));
    if (warnings.length > 0) {
      console.log(`⚠️  Ainda há ${warnings.length} warnings, mas o build está funcionando:`);
      warnings.slice(0, 5).forEach(warning => console.log(`  ${warning.trim()}`));
      if (warnings.length > 5) {
        console.log(`  ... e mais ${warnings.length - 5} warnings`);
      }
    } else {
      console.log('✨ Build completamente limpo! Sem warnings ou erros.');
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

