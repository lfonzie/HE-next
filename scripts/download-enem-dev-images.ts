import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';

/**
 * Script para baixar todas as imagens do enem.dev para o servidor local
 * As imagens serão salvas em QUESTOES_ENEM/public/ seguindo a estrutura da URL
 */

interface DownloadResult {
  url: string;
  localPath: string;
  status: 'downloaded' | 'exists' | 'failed';
  error?: string;
  size?: number;
}

async function downloadImage(url: string, localPath: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    await fs.writeFile(localPath, Buffer.from(buffer));
    
    return true;
  } catch (error) {
    console.error(`   ❌ Erro ao baixar ${url}:`, error);
    return false;
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadEnemDevImages() {
  console.log('📥 Iniciando download de imagens do enem.dev...\n');

  const reportsDir = path.join(process.cwd(), 'scripts', 'reports');
  const validUrlsPath = path.join(reportsDir, 'enem-dev-valid-urls.txt');
  const baseLocalPath = path.join(process.cwd(), 'QUESTOES_ENEM', 'public');

  try {
    // Ler URLs válidas
    const urlsContent = await fs.readFile(validUrlsPath, 'utf-8');
    const urls = urlsContent.trim().split('\n').filter(u => u.length > 0);

    console.log(`📋 Total de URLs a processar: ${urls.length}\n`);

    const results: DownloadResult[] = [];
    let downloaded = 0;
    let alreadyExists = 0;
    let failed = 0;

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      
      // Extrair caminho relativo da URL
      // De: https://enem.dev/2023/questions/100/image.jpg
      // Para: 2023/questions/100/image.jpg
      const relativePath = url.replace('https://enem.dev/', '');
      const localPath = path.join(baseLocalPath, relativePath);
      const localDir = path.dirname(localPath);

      // Mostrar progresso a cada 50 imagens
      if ((i + 1) % 50 === 0) {
        console.log(`   Processando... ${i + 1}/${urls.length} (${Math.round((i + 1) / urls.length * 100)}%)`);
      }

      const result: DownloadResult = {
        url,
        localPath,
        status: 'failed',
      };

      try {
        // Verificar se já existe
        if (existsSync(localPath)) {
          const stats = await fs.stat(localPath);
          result.status = 'exists';
          result.size = stats.size;
          alreadyExists++;
        } else {
          // Criar diretório se não existir
          await fs.mkdir(localDir, { recursive: true });

          // Baixar imagem
          const success = await downloadImage(url, localPath);
          
          if (success) {
            const stats = await fs.stat(localPath);
            result.status = 'downloaded';
            result.size = stats.size;
            downloaded++;
            
            // Delay para não sobrecarregar o servidor
            await sleep(100); // 100ms entre downloads
          } else {
            result.status = 'failed';
            result.error = 'Download failed';
            failed++;
          }
        }
      } catch (error) {
        result.status = 'failed';
        result.error = error instanceof Error ? error.message : String(error);
        failed++;
      }

      results.push(result);
    }

    console.log('\n✅ Download concluído!\n');

    // Estatísticas
    console.log('📊 Resultados:\n');
    console.log(`   ✅ Baixadas: ${downloaded}`);
    console.log(`   📁 Já existiam: ${alreadyExists}`);
    console.log(`   ❌ Falhas: ${failed}`);
    console.log(`   📊 Total: ${urls.length}\n`);

    // Calcular tamanho total
    const totalSize = results
      .filter(r => r.size)
      .reduce((sum, r) => sum + (r.size || 0), 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

    console.log(`💾 Tamanho total: ${totalSizeMB} MB\n`);

    // Salvar relatório
    await fs.writeFile(
      path.join(reportsDir, 'download-report.json'),
      JSON.stringify({
        summary: {
          total: urls.length,
          downloaded,
          alreadyExists,
          failed,
          totalSizeMB,
        },
        results,
      }, null, 2)
    );

    // Salvar lista de falhas
    const failures = results.filter(r => r.status === 'failed');
    if (failures.length > 0) {
      await fs.writeFile(
        path.join(reportsDir, 'download-failures.json'),
        JSON.stringify(failures, null, 2)
      );

      console.log('⚠️  Falhas detectadas:\n');
      failures.slice(0, 10).forEach((f, i) => {
        console.log(`   ${i + 1}. ${f.url}`);
        console.log(`      Erro: ${f.error || 'Unknown'}\n`);
      });

      if (failures.length > 10) {
        console.log(`   ... e mais ${failures.length - 10} falhas\n`);
      }

      console.log('   Veja detalhes em: scripts/reports/download-failures.json\n');
    }

    // Salvar lista de downloads bem-sucedidos
    const downloaded_list = results
      .filter(r => r.status === 'downloaded')
      .map(r => r.localPath);

    if (downloaded_list.length > 0) {
      await fs.writeFile(
        path.join(reportsDir, 'downloaded-files.txt'),
        downloaded_list.join('\n')
      );

      console.log('📄 Lista de arquivos baixados salva em:');
      console.log('   scripts/reports/downloaded-files.txt\n');
    }

    // Verificar integridade
    console.log('🔍 Verificando integridade dos arquivos...\n');
    let validFiles = 0;
    let invalidFiles = 0;

    for (const result of results) {
      if (result.status !== 'failed') {
        try {
          const stats = await fs.stat(result.localPath);
          if (stats.size > 0) {
            validFiles++;
          } else {
            invalidFiles++;
            console.log(`   ⚠️  Arquivo vazio: ${result.localPath}`);
          }
        } catch {
          invalidFiles++;
        }
      }
    }

    console.log(`   ✅ Arquivos válidos: ${validFiles}`);
    console.log(`   ⚠️  Arquivos inválidos: ${invalidFiles}\n`);

    console.log('✅ Relatório completo salvo em:');
    console.log('   scripts/reports/download-report.json\n');

    // Próximos passos
    console.log('📝 Próximos passos:\n');
    console.log('   1. Verificar se houve falhas no download');
    console.log('   2. Atualizar código para buscar imagens localmente');
    console.log('   3. Testar carregamento de questões\n');

  } catch (error) {
    console.error('❌ Erro durante o download:', error);
    throw error;
  }
}

// Executar o script
downloadEnemDevImages()
  .then(() => {
    console.log('🎉 Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });


