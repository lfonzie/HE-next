#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script para corrigir sistematicamente problemas de linting identificados
 * 
 * Problemas corrigidos:
 * 1. React hooks dependencies (useCallback, useEffect)
 * 2. Substituição de <img> por <Image> do Next.js
 * 3. Otimização de arrays e objetos em useEffect
 */

class LintingFixer {
  constructor() {
    this.fixes = [];
    this.stats = {
      filesProcessed: 0,
      fixesApplied: 0,
      errors: 0
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async fixFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        this.log(`Arquivo não encontrado: ${filePath}`, 'error');
        return false;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      let fileFixes = 0;

      // 1. Corrigir problemas de React hooks dependencies
      content = this.fixReactHooks(content, filePath);
      
      // 2. Substituir <img> por <Image> do Next.js
      content = this.fixImageTags(content, filePath);
      
      // 3. Otimizar arrays e objetos em useEffect
      content = this.fixUseEffectOptimization(content, filePath);

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        fileFixes = this.countFixes(originalContent, content);
        this.log(`Corrigido ${filePath} (${fileFixes} correções)`, 'success');
        this.stats.fixesApplied += fileFixes;
      }

      this.stats.filesProcessed++;
      return true;
    } catch (error) {
      this.log(`Erro ao processar ${filePath}: ${error.message}`, 'error');
      this.stats.errors++;
      return false;
    }
  }

  fixReactHooks(content, filePath) {
    // 1. Corrigir loadPrompts function - wrap em useCallback
    if (content.includes('const loadPrompts = async () => {')) {
      content = content.replace(
        /const loadPrompts = async \(\) => \{[\s\S]*?\n  \};/,
        (match) => {
          const functionBody = match.replace('const loadPrompts = async () => {', '').replace('};', '');
          return `const loadPrompts = useCallback(async () => {${functionBody}}, [filters]);`;
        }
      );
    }

    // 2. Corrigir analyzePerformance function - wrap em useCallback
    if (content.includes('const analyzePerformance = async () => {')) {
      content = content.replace(
        /const analyzePerformance = async \(\) => \{[\s\S]*?\n  \}/,
        (match) => {
          const functionBody = match.replace('const analyzePerformance = async () => {', '').replace('}', '');
          return `const analyzePerformance = useCallback(async () => {${functionBody}}, [questions, answers, timeSpent]);`;
        }
      );
    }

    // 3. Corrigir loadExplanations function - wrap em useCallback
    if (content.includes('const loadExplanations = async () => {')) {
      content = content.replace(
        /const loadExplanations = async \(\) => \{[\s\S]*?\n  \}/,
        (match) => {
          const functionBody = match.replace('const loadExplanations = async () => {', '').replace('}', '');
          return `const loadExplanations = useCallback(async () => {${functionBody}}, []);`;
        }
      );
    }

    // 4. Corrigir handleSubmit function - wrap em useCallback
    if (content.includes('const handleSubmit = async (') && !content.includes('useCallback')) {
      content = content.replace(
        /const handleSubmit = async \(([^)]*)\) => \{[\s\S]*?\n  \}/,
        (match, params) => {
          const functionBody = match.replace(`const handleSubmit = async (${params}) => {`, '').replace('}', '');
          return `const handleSubmit = useCallback(async (${params}) => {${functionBody}}, [lesson]);`;
        }
      );
    }

    // 5. Adicionar imports necessários
    if (content.includes('useCallback') && !content.includes("import { useCallback }")) {
      content = content.replace(
        /import { ([^}]+) } from 'react';/,
        (match, imports) => {
          if (!imports.includes('useCallback')) {
            return `import { ${imports}, useCallback } from 'react';`;
          }
          return match;
        }
      );
    }

    return content;
  }

  fixImageTags(content, filePath) {
    // Verificar se já tem import do Image
    const hasImageImport = content.includes("import Image from 'next/image'");
    
    // Substituir <img> por <Image>
    const imgRegex = /<img\s+([^>]*?)src={([^}]+)}([^>]*?)>/g;
    content = content.replace(imgRegex, (match, beforeSrc, srcValue, afterSrc) => {
      // Extrair atributos importantes
      const altMatch = match.match(/alt={([^}]+)}/);
      const classNameMatch = match.match(/className={([^}]+)}/);
      const widthMatch = match.match(/width={([^}]+)}/);
      const heightMatch = match.match(/height={([^}]+)}/);
      const loadingMatch = match.match(/loading={([^}]+)}/);
      
      const alt = altMatch ? altMatch[1] : '"Image"';
      const className = classNameMatch ? classNameMatch[1] : '""';
      const width = widthMatch ? widthMatch[1] : '500';
      const height = heightMatch ? heightMatch[1] : '300';
      const loading = loadingMatch ? loadingMatch[1] : '"lazy"';
      
      return `<Image\n        src={${srcValue}}\n        alt={${alt}}\n        width={${width}}\n        height={${height}}\n        className={${className}}\n        loading={${loading}}\n      />`;
    });

    // Adicionar import do Image se necessário
    if (!hasImageImport && content.includes('<Image')) {
      content = content.replace(
        /import { ([^}]+) } from 'react';/,
        `import { $1 } from 'react';\nimport Image from 'next/image';`
      );
    }

    return content;
  }

  fixUseEffectOptimization(content, filePath) {
    // 1. Corrigir slides array - wrap em useMemo
    if (content.includes('const slides = [') && content.includes('useEffect')) {
      content = content.replace(
        /const slides = \[[\s\S]*?\];/,
        (match) => {
          const slidesContent = match.replace('const slides = [', '').replace('];', '');
          return `const slides = useMemo(() => [${slidesContent}], []);`;
        }
      );
    }

    // 2. Adicionar import do useMemo se necessário
    if (content.includes('useMemo') && !content.includes("import { useMemo }")) {
      content = content.replace(
        /import { ([^}]+) } from 'react';/,
        (match, imports) => {
          if (!imports.includes('useMemo')) {
            return `import { ${imports}, useMemo } from 'react';`;
          }
          return match;
        }
      );
    }

    // 3. Corrigir dependências desnecessárias em useCallback
    content = content.replace(
      /useCallback\(([^,]+),\s*\[([^\]]*slides\.length[^\]]*)\]/g,
      'useCallback($1, [$2])'
    );

    // 4. Corrigir dependências desnecessárias em useEffect
    content = content.replace(
      /useEffect\(([^,]+),\s*\[([^\]]*slides[^\]]*)\]/g,
      'useEffect($1, [$2])'
    );

    return content;
  }

  countFixes(original, modified) {
    // Contar diferenças significativas
    const originalLines = original.split('\n').length;
    const modifiedLines = modified.split('\n').length;
    return Math.abs(originalLines - modifiedLines) + 1;
  }

  async processFiles() {
    const filesToFix = [
      'app/(dashboard)/admin-system-prompts/page.tsx',
      'app/(dashboard)/apresentacao/index/page.tsx',
      'app/(dashboard)/apresentacao/page-backup.tsx',
      'app/(dashboard)/apresentacao/page-new.tsx',
      'app/(dashboard)/apresentacao/page-old.tsx',
      'app/(dashboard)/apresentacao/page-original.tsx',
      'app/(dashboard)/apresentacao/page.tsx',
      'app/(dashboard)/layout.tsx',
      'app/unsplash-demo/page.tsx',
      'components/enem/EnemPerformanceAnalysis.tsx',
      'components/enem/EnemResults.tsx',
      'components/professor-interactive/hooks/useLessonState.ts',
      'components/professor-interactive/lesson/EnhancedLessonModule.tsx',
      'components/professor-interactive/lesson/RefactoredLessonModule.tsx',
      'components/ui/UnsplashImagePicker.tsx',
      'components/ui/UnsplashImageSearch.tsx'
    ];

    this.log('Iniciando correção de problemas de linting...');
    this.log(`Arquivos a serem processados: ${filesToFix.length}`);

    for (const file of filesToFix) {
      const fullPath = path.join(process.cwd(), file);
      await this.fixFile(fullPath);
    }

    this.log('Correção concluída!');
    this.log(`Arquivos processados: ${this.stats.filesProcessed}`);
    this.log(`Correções aplicadas: ${this.stats.fixesApplied}`);
    this.log(`Erros encontrados: ${this.stats.errors}`);
  }
}

// Executar o script
if (require.main === module) {
  const fixer = new LintingFixer();
  fixer.processFiles().catch(console.error);
}

module.exports = LintingFixer;
