#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script para corrigir erros de sintaxe causados pelos scripts anteriores
 */

class SyntaxFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      errorsFixed: 0,
      errors: 0
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async fixSyntaxInFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        this.log(`Arquivo não encontrado: ${filePath}`, 'error');
        return false;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      let errorsFixed = 0;

      // 1. Corrigir problemas com style={{ filter: ... } sem fechamento
      content = content.replace(
        /style=\{\{\s*filter:\s*"([^"]*)"\s*\}\s*\/>/g,
        'style={{ filter: "$1" }}\n      />'
      );

      // 2. Corrigir problemas com className={""} sem fechamento
      content = content.replace(
        /className=\{\{\s*""\s*\}\s*\/>/g,
        'className={""}\n      />'
      );

      // 3. Corrigir problemas com loading={"lazy"} sem fechamento
      content = content.replace(
        /loading=\{\{\s*"lazy"\s*\}\s*\/>/g,
        'loading={"lazy"}\n      />'
      );

      // 4. Corrigir problemas com useCallback mal formado
      content = content.replace(
        /useCallback\(async \(\) => \{([^}]+)\}, \[([^\]]*)\];/g,
        (match, body, deps) => {
          errorsFixed++;
          return `useCallback(async () => {${body}}, [${deps}]);`;
        }
      );

      // 5. Corrigir problemas com useMemo mal formado
      content = content.replace(
        /useMemo\(\(\) => \[([^\]]+)\], \[\]\);/g,
        (match, body) => {
          errorsFixed++;
          return `useMemo(() => [${body}], []);`;
        }
      );

      // 6. Corrigir problemas com imports mal formados
      content = content.replace(
        /import { ([^}]+), useCallback, useMemo } from 'react';/g,
        (match, imports) => {
          errorsFixed++;
          return `import { ${imports}, useCallback, useMemo } from 'react';`;
        }
      );

      // 7. Corrigir problemas com Image mal formado
      content = content.replace(
        /<Image\n\s*src=\{([^}]+)\}\n\s*alt=\{([^}]+)\}\n\s*width=\{([^}]+)\}\n\s*height=\{([^}]+)\}\n\s*className=\{([^}]+)\}\n\s*loading=\{([^}]+)\}\n\s*\/>/g,
        (match, src, alt, width, height, className, loading) => {
          errorsFixed++;
          return `<Image\n        src={${src}}\n        alt={${alt}}\n        width={${width}}\n        height={${height}}\n        className={${className}}\n        loading={${loading}}\n      />`;
        }
      );

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.log(`Corrigido ${filePath} (${errorsFixed} erros)`, 'success');
        this.stats.errorsFixed += errorsFixed;
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
      'app/(dashboard)/apresentacao/page-backup.tsx',
      'app/(dashboard)/apresentacao/page-new.tsx',
      'app/(dashboard)/apresentacao/page-old.tsx',
      'app/(dashboard)/apresentacao/page-original.tsx',
      'app/(dashboard)/apresentacao/page.tsx',
      'components/enem/EnemPerformanceAnalysis.tsx',
      'components/enem/EnemResults.tsx',
      'components/professor-interactive/lesson/EnhancedLessonModule.tsx',
      'components/professor-interactive/lesson/RefactoredLessonModule.tsx'
    ];

    this.log('Iniciando correção de erros de sintaxe...');
    this.log(`Arquivos a serem processados: ${filesToFix.length}`);

    for (const file of filesToFix) {
      const fullPath = path.join(process.cwd(), file);
      await this.fixSyntaxInFile(fullPath);
    }

    this.log('Correção de erros de sintaxe concluída!');
    this.log(`Arquivos processados: ${this.stats.filesProcessed}`);
    this.log(`Erros corrigidos: ${this.stats.errorsFixed}`);
    this.log(`Erros encontrados: ${this.stats.errors}`);
  }
}

// Executar o script
if (require.main === module) {
  const fixer = new SyntaxFixer();
  fixer.processFiles().catch(console.error);
}

module.exports = SyntaxFixer;
