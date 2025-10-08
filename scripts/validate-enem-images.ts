import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';

interface UniqueUrlReport {
  url: string;
  occurrences: number;
  questions: number;
  fields: string[];
  years: number[];
  disciplines: string[];
}

interface ValidationResult {
  url: string;
  status: 'valid' | 'missing' | 'external' | 'broken';
  error?: string;
  occurrences: number;
  questions: number;
}

async function validateLocalFile(url: string): Promise<boolean> {
  // Remove o prefixo /QUESTOES_ENEM/ se existir
  let filePath = url;
  
  if (filePath.startsWith('/QUESTOES_ENEM/')) {
    filePath = filePath.replace('/QUESTOES_ENEM/', '');
  }
  
  const fullPath = path.join(process.cwd(), 'QUESTOES_ENEM', filePath);
  
  try {
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

async function validateImageUrls() {
  console.log('🔍 Iniciando validação de URLs de imagens...\n');

  const reportsDir = path.join(process.cwd(), 'scripts', 'reports');
  const uniqueUrlsPath = path.join(reportsDir, 'enem-local-unique-urls.json');

  try {
    const data = await fs.readFile(uniqueUrlsPath, 'utf-8');
    const uniqueUrls: UniqueUrlReport[] = JSON.parse(data);

    console.log(`📊 Total de URLs únicas a validar: ${uniqueUrls.length}\n`);

    const results: ValidationResult[] = [];
    const categories = {
      valid: [] as ValidationResult[],
      missing: [] as ValidationResult[],
      external: [] as ValidationResult[],
      broken: [] as ValidationResult[],
    };

    let processed = 0;
    const total = uniqueUrls.length;

    for (const urlReport of uniqueUrls) {
      processed++;
      
      if (processed % 100 === 0) {
        console.log(`   Processando... ${processed}/${total} (${Math.round(processed/total*100)}%)`);
      }

      const result: ValidationResult = {
        url: urlReport.url,
        status: 'valid',
        occurrences: urlReport.occurrences,
        questions: urlReport.questions,
      };

      // URLs externas (http/https)
      if (urlReport.url.startsWith('http://') || urlReport.url.startsWith('https://')) {
        // Verificar se é enem.dev
        if (urlReport.url.includes('enem.dev')) {
          // Verificar se é a imagem quebrada conhecida
          if (urlReport.url.includes('broken-image.svg')) {
            result.status = 'broken';
            result.error = 'URL conhecida como broken-image.svg';
          } else {
            result.status = 'external';
          }
        } else {
          result.status = 'external';
          result.error = 'URL hospedada em domínio externo (não enem.dev)';
        }
      }
      // URLs locais
      else if (urlReport.url.startsWith('/')) {
        const exists = await validateLocalFile(urlReport.url);
        if (!exists) {
          result.status = 'missing';
          result.error = 'Arquivo local não encontrado';
        }
      }
      // Outras URLs
      else {
        result.status = 'broken';
        result.error = 'Formato de URL não reconhecido';
      }

      results.push(result);
      categories[result.status].push(result);
    }

    console.log('\n✅ Validação concluída!\n');

    // Estatísticas
    console.log('📊 Resultados da Validação:\n');
    console.log(`   ✅ Válidas: ${categories.valid.length} (${Math.round(categories.valid.length/total*100)}%)`);
    console.log(`   🌐 Externas (enem.dev): ${categories.external.length} (${Math.round(categories.external.length/total*100)}%)`);
    console.log(`   ❌ Ausentes: ${categories.missing.length} (${Math.round(categories.missing.length/total*100)}%)`);
    console.log(`   ⚠️  Quebradas: ${categories.broken.length} (${Math.round(categories.broken.length/total*100)}%)\n`);

    // Mostrar detalhes dos problemas
    if (categories.broken.length > 0) {
      console.log('⚠️  URLs Quebradas:\n');
      categories.broken.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.url}`);
        console.log(`      Erro: ${result.error}`);
        console.log(`      Ocorrências: ${result.occurrences} em ${result.questions} questões\n`);
      });
    }

    if (categories.missing.length > 0) {
      console.log('❌ Arquivos Locais Ausentes:\n');
      const top10Missing = categories.missing
        .sort((a, b) => b.occurrences - a.occurrences)
        .slice(0, 10);
      
      top10Missing.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.url}`);
        console.log(`      Ocorrências: ${result.occurrences} em ${result.questions} questões\n`);
      });

      if (categories.missing.length > 10) {
        console.log(`   ... e mais ${categories.missing.length - 10} arquivos ausentes\n`);
      }
    }

    // URLs externas não enem.dev
    const externalNonEnemDev = results.filter(r => 
      r.status === 'external' && 
      r.error?.includes('não enem.dev')
    );

    if (externalNonEnemDev.length > 0) {
      console.log('🌐 URLs Hospedadas Fora do enem.dev:\n');
      externalNonEnemDev.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.url}`);
        console.log(`      Ocorrências: ${result.occurrences} em ${result.questions} questões\n`);
      });
    }

    // Salvar resultados
    await fs.writeFile(
      path.join(reportsDir, 'enem-validation-results.json'),
      JSON.stringify({
        summary: {
          total: total,
          valid: categories.valid.length,
          external: categories.external.length,
          missing: categories.missing.length,
          broken: categories.broken.length,
        },
        details: results,
        categories: {
          valid: categories.valid,
          external: categories.external,
          missing: categories.missing,
          broken: categories.broken,
        }
      }, null, 2)
    );

    console.log('✅ Relatório de validação salvo em:');
    console.log('   scripts/reports/enem-validation-results.json\n');

    // Criar relatório de ações recomendadas
    const recommendations: string[] = [];

    if (categories.broken.length > 0) {
      recommendations.push(`🔴 URGENTE: ${categories.broken.length} URLs quebradas precisam ser corrigidas`);
    }

    if (categories.missing.length > 0) {
      recommendations.push(`⚠️  ATENÇÃO: ${categories.missing.length} arquivos locais ausentes precisam ser baixados`);
    }

    if (externalNonEnemDev.length > 0) {
      recommendations.push(`💡 RECOMENDADO: ${externalNonEnemDev.length} imagens externas devem ser migradas para enem.dev`);
    }

    if (recommendations.length > 0) {
      console.log('📝 Ações Recomendadas:\n');
      recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
      console.log();
    }

    // Criar script de correção para arquivos ausentes
    if (categories.missing.length > 0) {
      const fixScript = categories.missing.map(result => {
        const localPath = result.url.replace('/QUESTOES_ENEM/', '');
        const fullPath = path.join(process.cwd(), 'QUESTOES_ENEM', localPath);
        return `# TODO: Verificar e restaurar arquivo\n# ${result.url}\n# Usado em ${result.questions} questões (${result.occurrences} ocorrências)`;
      }).join('\n\n');

      await fs.writeFile(
        path.join(reportsDir, 'missing-files-todo.txt'),
        `# Arquivos de Imagem Ausentes\n# Total: ${categories.missing.length} arquivos\n\n${fixScript}`
      );

      console.log('📄 Lista de arquivos ausentes salva em:');
      console.log('   scripts/reports/missing-files-todo.txt\n');
    }

  } catch (error) {
    console.error('❌ Erro durante a validação:', error);
    throw error;
  }
}

// Executar o script
validateImageUrls()
  .then(() => {
    console.log('🎉 Validação finalizada com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });


