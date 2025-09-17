#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script específico para corrigir problemas de React Hooks
 * Corrige dependências de useEffect, useCallback e useMemo
 */

class HooksFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      hooksFixed: 0,
      errors: 0
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async fixHooksInFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        this.log(`Arquivo não encontrado: ${filePath}`, 'error');
        return false;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      let hooksFixed = 0;

      // 1. Corrigir loadPrompts function
      if (content.includes('const loadPrompts = async () => {')) {
        content = content.replace(
          /const loadPrompts = async \(\) => \{[\s\S]*?\n  \};/,
          (match) => {
            hooksFixed++;
            const functionBody = match.replace('const loadPrompts = async () => {', '').replace('};', '');
            return `const loadPrompts = useCallback(async () => {${functionBody}}, [filters]);`;
          }
        );
      }

      // 2. Corrigir analyzePerformance function
      if (content.includes('const analyzePerformance = async () => {')) {
        content = content.replace(
          /const analyzePerformance = async \(\) => \{[\s\S]*?\n  \}/,
          (match) => {
            hooksFixed++;
            const functionBody = match.replace('const analyzePerformance = async () => {', '').replace('}', '');
            return `const analyzePerformance = useCallback(async () => {${functionBody}}, [questions, answers, timeSpent]);`;
          }
        );
      }

      // 3. Corrigir loadExplanations function
      if (content.includes('const loadExplanations = async () => {')) {
        content = content.replace(
          /const loadExplanations = async \(\) => \{[\s\S]*?\n  \}/,
          (match) => {
            hooksFixed++;
            const functionBody = match.replace('const loadExplanations = async () => {', '').replace('}', '');
            return `const loadExplanations = useCallback(async () => {${functionBody}}, []);`;
          }
        );
      }

      // 4. Corrigir handleSubmit function
      if (content.includes('const handleSubmit = async (') && !content.includes('useCallback')) {
        content = content.replace(
          /const handleSubmit = async \(([^)]*)\) => \{[\s\S]*?\n  \}/,
          (match, params) => {
            hooksFixed++;
            const functionBody = match.replace(`const handleSubmit = async (${params}) => {`, '').replace('}', '');
            return `const handleSubmit = useCallback(async (${params}) => {${functionBody}}, [lesson]);`;
          }
        );
      }

      // 5. Corrigir slides array - wrap em useMemo
      if (content.includes('const slides = [') && content.includes('useEffect')) {
        content = content.replace(
          /const slides = \[[\s\S]*?\];/,
          (match) => {
            hooksFixed++;
            const slidesContent = match.replace('const slides = [', '').replace('];', '');
            return `const slides = useMemo(() => [${slidesContent}], []);`;
          }
        );
      }

      // 6. Corrigir dependências desnecessárias em useCallback
      const unnecessaryCallbackDeps = content.match(/useCallback\([^,]+,\s*\[([^\]]*slides\.length[^\]]*)\]/g);
      if (unnecessaryCallbackDeps) {
        content = content.replace(
          /useCallback\(([^,]+),\s*\[([^\]]*slides\.length[^\]]*)\]/g,
          (match, callback, deps) => {
            hooksFixed++;
            const cleanDeps = deps.replace(/,\s*slides\.length/g, '').replace(/slides\.length\s*,?/g, '');
            return `useCallback(${callback}, [${cleanDeps}])`;
          }
        );
      }

      // 7. Corrigir dependências desnecessárias em useEffect
      const unnecessaryEffectDeps = content.match(/useEffect\([^,]+,\s*\[([^\]]*slides[^\]]*)\]/g);
      if (unnecessaryEffectDeps) {
        content = content.replace(
          /useEffect\(([^,]+),\s*\[([^\]]*slides[^\]]*)\]/g,
          (match, effect, deps) => {
            hooksFixed++;
            const cleanDeps = deps.replace(/,\s*slides/g, '').replace(/slides\s*,?/g, '');
            return `useEffect(${effect}, [${cleanDeps}])`;
          }
        );
      }

      // 8. Adicionar imports necessários
      const needsUseCallback = content.includes('useCallback') && !content.includes("import { useCallback }");
      const needsUseMemo = content.includes('useMemo') && !content.includes("import { useMemo }");
      
      if (needsUseCallback || needsUseMemo) {
        content = content.replace(
          /import { ([^}]+) } from 'react';/,
          (match, imports) => {
            let newImports = imports;
            if (needsUseCallback && !imports.includes('useCallback')) {
              newImports += ', useCallback';
            }
            if (needsUseMemo && !imports.includes('useMemo')) {
              newImports += ', useMemo';
            }
            return `import { ${newImports} } from 'react';`;
          }
        );
      }

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.log(`Corrigido ${filePath} (${hooksFixed} hooks)`, 'success');
        this.stats.hooksFixed += hooksFixed;
      }

      this.stats.filesProcessed++;
      return true;
    } catch (error) {
      this.log(`Erro ao processar ${filePath}: ${error.message}`, 'error');
      this.stats.errors++;
      return false;
    }
  }

  async processFiles() {
    const filesToFix = [
      'app/(dashboard)/admin-system-prompts/page.tsx',
      'app/(dashboard)/apresentacao/page-backup.tsx',
      'app/(dashboard)/apresentacao/page-new.tsx',
      'app/(dashboard)/apresentacao/page-old.tsx',
      'app/(dashboard)/apresentacao/page-original.tsx',
      'app/(dashboard)/apresentacao/page.tsx',
      'components/enem/EnemPerformanceAnalysis.tsx',
      'components/enem/EnemResults.tsx',
      'components/professor-interactive/hooks/useLessonState.ts',
      'components/professor-interactive/lesson/EnhancedLessonModule.tsx'
    ];

    this.log('Iniciando correção de React Hooks...');
    this.log(`Arquivos a serem processados: ${filesToFix.length}`);

    for (const file of filesToFix) {
      const fullPath = path.join(process.cwd(), file);
      await this.fixHooksInFile(fullPath);
    }

    this.log('Correção de React Hooks concluída!');
    this.log(`Arquivos processados: ${this.stats.filesProcessed}`);
    this.log(`Hooks corrigidos: ${this.stats.hooksFixed}`);
    this.log(`Erros encontrados: ${this.stats.errors}`);
  }
}

// Executar o script
if (require.main === module) {
  const fixer = new HooksFixer();
  fixer.processFiles().catch(console.error);
}

module.exports = HooksFixer;
