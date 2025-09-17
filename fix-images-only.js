#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script específico para corrigir problemas de imagens
 * Substitui todas as tags <img> por <Image> do Next.js
 */

class ImageFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      imagesFixed: 0,
      errors: 0
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async fixImagesInFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        this.log(`Arquivo não encontrado: ${filePath}`, 'error');
        return false;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      let imageCount = 0;

      // Verificar se já tem import do Image
      const hasImageImport = content.includes("import Image from 'next/image'");
      
      // Substituir todas as tags <img> por <Image>
      const imgRegex = /<img\s+([^>]*?)src={([^}]+)}([^>]*?)>/g;
      content = content.replace(imgRegex, (match, beforeSrc, srcValue, afterSrc) => {
        imageCount++;
        
        // Extrair atributos importantes
        const altMatch = match.match(/alt={([^}]+)}/);
        const classNameMatch = match.match(/className={([^}]+)}/);
        const widthMatch = match.match(/width={([^}]+)}/);
        const heightMatch = match.match(/height={([^}]+)}/);
        const loadingMatch = match.match(/loading={([^}]+)}/);
        const styleMatch = match.match(/style={([^}]+)}/);
        
        const alt = altMatch ? altMatch[1] : '"Image"';
        const className = classNameMatch ? classNameMatch[1] : '""';
        const width = widthMatch ? widthMatch[1] : '500';
        const height = heightMatch ? heightMatch[1] : '300';
        const loading = loadingMatch ? loadingMatch[1] : '"lazy"';
        const style = styleMatch ? styleMatch[1] : 'undefined';
        
        let imageTag = `<Image\n        src={${srcValue}}\n        alt={${alt}}\n        width={${width}}\n        height={${height}}\n        className={${className}}\n        loading={${loading}}`;
        
        if (style !== 'undefined') {
          imageTag += `\n        style={${style}}`;
        }
        
        imageTag += '\n      />';
        
        return imageTag;
      });

      // Adicionar import do Image se necessário
      if (!hasImageImport && imageCount > 0) {
        // Procurar por imports existentes do React
        const reactImportMatch = content.match(/import { ([^}]+) } from 'react';/);
        if (reactImportMatch) {
          content = content.replace(
            /import { ([^}]+) } from 'react';/,
            `import { ${reactImportMatch[1]} } from 'react';\nimport Image from 'next/image';`
          );
        } else {
          // Se não há import do React, adicionar no topo
          const lines = content.split('\n');
          const firstImportIndex = lines.findIndex(line => line.startsWith('import'));
          if (firstImportIndex >= 0) {
            lines.splice(firstImportIndex, 0, "import Image from 'next/image';");
            content = lines.join('\n');
          } else {
            content = "import Image from 'next/image';\n" + content;
          }
        }
      }

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.log(`Corrigido ${filePath} (${imageCount} imagens)`, 'success');
        this.stats.imagesFixed += imageCount;
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
      'app/(dashboard)/apresentacao/index/page.tsx',
      'app/(dashboard)/apresentacao/page-backup.tsx',
      'app/(dashboard)/apresentacao/page-new.tsx',
      'app/(dashboard)/apresentacao/page-old.tsx',
      'app/(dashboard)/apresentacao/page-original.tsx',
      'app/(dashboard)/apresentacao/page.tsx',
      'app/(dashboard)/layout.tsx',
      'app/unsplash-demo/page.tsx',
      'components/professor-interactive/lesson/EnhancedLessonModule.tsx',
      'components/professor-interactive/lesson/RefactoredLessonModule.tsx',
      'components/ui/UnsplashImagePicker.tsx',
      'components/ui/UnsplashImageSearch.tsx'
    ];

    this.log('Iniciando correção de imagens...');
    this.log(`Arquivos a serem processados: ${filesToFix.length}`);

    for (const file of filesToFix) {
      const fullPath = path.join(process.cwd(), file);
      await this.fixImagesInFile(fullPath);
    }

    this.log('Correção de imagens concluída!');
    this.log(`Arquivos processados: ${this.stats.filesProcessed}`);
    this.log(`Imagens corrigidas: ${this.stats.imagesFixed}`);
    this.log(`Erros encontrados: ${this.stats.errors}`);
  }
}

// Executar o script
if (require.main === module) {
  const fixer = new ImageFixer();
  fixer.processFiles().catch(console.error);
}

module.exports = ImageFixer;
