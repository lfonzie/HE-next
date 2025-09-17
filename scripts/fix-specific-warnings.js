#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo warnings específicos de ESLint...\n');

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

// Correções específicas baseadas no log de erros
const specificFixes = [
  {
    file: 'app/(dashboard)/enem/page.tsx',
    line: 145,
    issue: 'useCallback missing dependency: startSimulation',
    fix: (content) => {
      // Encontrar o useCallback na linha 145 e adicionar startSimulation às dependências
      const lines = content.split('\n');
      if (lines[144]) { // linha 145 (índice 144)
        const line = lines[144];
        if (line.includes('useCallback') && line.includes('[]')) {
          lines[144] = line.replace('[]', '[startSimulation]');
          console.log('  ✅ Adicionado startSimulation às dependências do useCallback');
        }
      }
      return lines.join('\n');
    }
  },
  {
    file: 'app/aulas/page-new.tsx',
    lines: [260, 318, 364],
    issue: 'Image elements must have an alt prop',
    fix: (content) => {
      // Adicionar alt="" para todas as tags img sem alt
      let modified = content;
      const imgRegex = /<img([^>]*?)(?:\s+alt\s*=\s*["'][^"']*["'])?([^>]*?)>/g;
      modified = modified.replace(imgRegex, (match, before, after) => {
        if (match.includes('alt=')) return match;
        return `<img${before} alt=""${after}>`;
      });
      console.log('  ✅ Adicionado alt prop para todas as imagens');
      return modified;
    }
  },
  {
    file: 'app/aulas/page.tsx',
    line: 410,
    issue: 'useCallback missing dependency: isGenerating',
    fix: (content) => {
      const lines = content.split('\n');
      if (lines[409]) { // linha 410 (índice 409)
        const line = lines[409];
        if (line.includes('useCallback') && line.includes('[]')) {
          lines[409] = line.replace('[]', '[isGenerating]');
          console.log('  ✅ Adicionado isGenerating às dependências do useCallback');
        }
      }
      return lines.join('\n');
    }
  },
  {
    file: 'app/aulas-enhanced/page.tsx',
    line: 268,
    issue: 'Using <img> instead of <Image />',
    fix: (content) => {
      // Substituir img por Image do Next.js
      let modified = content;
      const imgRegex = /<img([^>]*?)>/g;
      modified = modified.replace(imgRegex, (match, attrs) => {
        if (match.includes('next/image')) return match;
        return `<Image${attrs} />`;
      });
      
      // Adicionar import do Image se não existir
      if (!modified.includes("import Image from 'next/image'")) {
        const importRegex = /(import.*from.*['"]next\/image['"];?\s*\n?)/;
        if (!importRegex.test(modified)) {
          modified = modified.replace(
            /(import.*from.*['"]react['"];?\s*\n?)/,
            `$1import Image from 'next/image';\n`
          );
        }
      }
      
      console.log('  ✅ Substituído img por Image do Next.js');
      return modified;
    }
  },
  {
    file: 'app/lessons-old/page.tsx',
    lines: [63, 79],
    issue: 'useEffect/useCallback missing dependencies',
    fix: (content) => {
      const lines = content.split('\n');
      
      // Linha 63 - useEffect missing suggestions
      if (lines[62]) {
        const line = lines[62];
        if (line.includes('useEffect') && line.includes('[]')) {
          lines[62] = line.replace('[]', '[suggestions]');
          console.log('  ✅ Adicionado suggestions às dependências do useEffect');
        }
      }
      
      // Linha 79 - useCallback missing handleGenerate
      if (lines[78]) {
        const line = lines[78];
        if (line.includes('useCallback') && line.includes('[]')) {
          lines[78] = line.replace('[]', '[handleGenerate]');
          console.log('  ✅ Adicionado handleGenerate às dependências do useCallback');
        }
      }
      
      return lines.join('\n');
    }
  },
  {
    file: 'components/enem/EnemSimulatorV2.tsx',
    line: 410,
    issue: 'useEffect missing dependencies',
    fix: (content) => {
      const lines = content.split('\n');
      if (lines[409]) {
        const line = lines[409];
        if (line.includes('useEffect') && line.includes('[]')) {
          lines[409] = line.replace('[]', '[handleAnswerSelect, handleCompleteExam, handleNext, handlePrevious]');
          console.log('  ✅ Adicionado dependências ao useEffect');
        }
      }
      return lines.join('\n');
    }
  },
  {
    file: 'components/interactive/DrawingPrompt.tsx',
    lines: [56, 79],
    issue: 'useEffect missing dependencies',
    fix: (content) => {
      const lines = content.split('\n');
      
      // Linha 56 - missing handleSubmit
      if (lines[55]) {
        const line = lines[55];
        if (line.includes('useEffect') && line.includes('[]')) {
          lines[55] = line.replace('[]', '[handleSubmit]');
          console.log('  ✅ Adicionado handleSubmit às dependências do useEffect');
        }
      }
      
      // Linha 79 - missing currentBrushSize, currentColor, saveToHistory
      if (lines[78]) {
        const line = lines[78];
        if (line.includes('useEffect') && line.includes('[]')) {
          lines[78] = line.replace('[]', '[currentBrushSize, currentColor, saveToHistory]');
          console.log('  ✅ Adicionado dependências ao useEffect');
        }
      }
      
      return lines.join('\n');
    }
  },
  {
    file: 'components/interactive/QuizComponent.tsx',
    line: 68,
    issue: 'useEffect missing dependency: handleComplete',
    fix: (content) => {
      const lines = content.split('\n');
      if (lines[67]) {
        const line = lines[67];
        if (line.includes('useEffect') && line.includes('[]')) {
          lines[67] = line.replace('[]', '[handleComplete]');
          console.log('  ✅ Adicionado handleComplete às dependências do useEffect');
        }
      }
      return lines.join('\n');
    }
  },
  {
    file: 'components/professor-interactive/lesson/ProgressiveLessonComponent.tsx',
    lines: [68, 104],
    issue: 'useEffect missing dependencies',
    fix: (content) => {
      const lines = content.split('\n');
      
      // Linha 68 - missing handleNextSlide, handlePreviousSlide
      if (lines[67]) {
        const line = lines[67];
        if (line.includes('useEffect') && line.includes('[]')) {
          lines[67] = line.replace('[]', '[handleNextSlide, handlePreviousSlide]');
          console.log('  ✅ Adicionado dependências ao useEffect');
        }
      }
      
      // Linha 104 - missing getCurrentSlide, loadImageForSlide
      if (lines[103]) {
        const line = lines[103];
        if (line.includes('useEffect') && line.includes('[]')) {
          lines[103] = line.replace('[]', '[getCurrentSlide, loadImageForSlide]');
          console.log('  ✅ Adicionado dependências ao useEffect');
        }
      }
      
      return lines.join('\n');
    }
  },
  {
    file: 'components/professor-interactive/lesson/ProgressiveLessonModule.tsx',
    lines: [123, 134],
    issue: 'useEffect missing dependency: progressiveLoading',
    fix: (content) => {
      const lines = content.split('\n');
      
      // Linha 123
      if (lines[122]) {
        const line = lines[122];
        if (line.includes('useEffect') && line.includes('[]')) {
          lines[122] = line.replace('[]', '[progressiveLoading]');
          console.log('  ✅ Adicionado progressiveLoading às dependências do useEffect');
        }
      }
      
      // Linha 134
      if (lines[133]) {
        const line = lines[133];
        if (line.includes('useEffect') && line.includes('[]')) {
          lines[133] = line.replace('[]', '[progressiveLoading]');
          console.log('  ✅ Adicionado progressiveLoading às dependências do useEffect');
        }
      }
      
      return lines.join('\n');
    }
  },
  {
    file: 'components/professor-interactive/lesson/RefactoredLessonModule.tsx',
    lines: [121, 132],
    issue: 'useEffect missing dependency: progressiveLoading',
    fix: (content) => {
      const lines = content.split('\n');
      
      // Linha 121
      if (lines[120]) {
        const line = lines[120];
        if (line.includes('useEffect') && line.includes('[]')) {
          lines[120] = line.replace('[]', '[progressiveLoading]');
          console.log('  ✅ Adicionado progressiveLoading às dependências do useEffect');
        }
      }
      
      // Linha 132
      if (lines[131]) {
        const line = lines[131];
        if (line.includes('useEffect') && line.includes('[]')) {
          lines[131] = line.replace('[]', '[progressiveLoading]');
          console.log('  ✅ Adicionado progressiveLoading às dependências do useEffect');
        }
      }
      
      return lines.join('\n');
    }
  }
];

// Função principal
async function main() {
  let totalFilesProcessed = 0;
  let totalFilesModified = 0;

  for (const fix of specificFixes) {
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
  console.log(`  - Correções aplicadas: ${specificFixes.length} arquivos`);

  // Testar build
  console.log('\n🔄 Testando build após correções...\n');
  
  const { execSync } = require('child_process');
  try {
    const output = execSync('npm run build', { encoding: 'utf8', stdio: 'pipe' });
    console.log('🎉 Sucesso! Build funcionando sem erros críticos!');
    
    // Verificar se ainda há warnings
    if (output.includes('Warning:')) {
      console.log('⚠️  Ainda há alguns warnings, mas o build está funcionando:');
      const warnings = output.split('\n').filter(line => line.includes('Warning:'));
      warnings.forEach(warning => console.log(`  ${warning.trim()}`));
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

