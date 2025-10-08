import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Script simples para listar todas as URLs de imagens das questões do ENEM
 * Gera uma lista de URLs únicas e uma lista de todas as URLs
 */

interface UniqueUrlReport {
  url: string;
  occurrences: number;
  questions: number;
  fields: string[];
  years: number[];
  disciplines: string[];
}

async function listImageUrls() {
  console.log('📋 Listando URLs de imagens das questões ENEM...\n');

  const reportsDir = path.join(process.cwd(), 'scripts', 'reports');
  const uniqueUrlsPath = path.join(reportsDir, 'enem-local-unique-urls.json');

  try {
    // Ler URLs únicas
    const data = await fs.readFile(uniqueUrlsPath, 'utf-8');
    const uniqueUrls: UniqueUrlReport[] = JSON.parse(data);

    console.log(`✅ Total de URLs únicas: ${uniqueUrls.length}\n`);

    // Separar por tipo
    const httpUrls = uniqueUrls.filter(u => u.url.startsWith('http'));
    const localUrls = uniqueUrls.filter(u => u.url.startsWith('/'));
    const otherUrls = uniqueUrls.filter(u => !u.url.startsWith('http') && !u.url.startsWith('/'));

    console.log('📊 Distribuição:');
    console.log(`   - URLs HTTP/HTTPS: ${httpUrls.length}`);
    console.log(`   - Caminhos locais: ${localUrls.length}`);
    console.log(`   - Outros: ${otherUrls.length}\n`);

    // Gerar lista simples de URLs
    const urlList = uniqueUrls.map(u => u.url);

    // Salvar lista completa (uma URL por linha)
    await fs.writeFile(
      path.join(reportsDir, 'all-image-urls.txt'),
      urlList.join('\n')
    );

    // Salvar apenas URLs HTTP/HTTPS
    await fs.writeFile(
      path.join(reportsDir, 'http-image-urls.txt'),
      httpUrls.map(u => u.url).join('\n')
    );

    // Salvar apenas caminhos locais
    await fs.writeFile(
      path.join(reportsDir, 'local-image-paths.txt'),
      localUrls.map(u => u.url).join('\n')
    );

    // Gerar lista com domínios únicos
    const domains = httpUrls.map(u => {
      try {
        const url = new URL(u.url);
        return url.hostname;
      } catch {
        return 'invalid';
      }
    });
    const uniqueDomains = [...new Set(domains)];

    await fs.writeFile(
      path.join(reportsDir, 'unique-domains.txt'),
      uniqueDomains.join('\n')
    );

    // Estatísticas por domínio
    const domainStats = httpUrls.reduce((acc, u) => {
      try {
        const url = new URL(u.url);
        const domain = url.hostname;
        if (!acc[domain]) {
          acc[domain] = {
            domain,
            count: 0,
            urls: []
          };
        }
        acc[domain].count += u.occurrences;
        acc[domain].urls.push(u.url);
        return acc;
      } catch {
        return acc;
      }
    }, {} as Record<string, { domain: string; count: number; urls: string[] }>);

    await fs.writeFile(
      path.join(reportsDir, 'urls-by-domain.json'),
      JSON.stringify(Object.values(domainStats), null, 2)
    );

    console.log('✅ Arquivos gerados:\n');
    console.log('   📄 all-image-urls.txt');
    console.log(`      └─ ${urlList.length} URLs únicas (uma por linha)`);
    console.log();
    console.log('   🌐 http-image-urls.txt');
    console.log(`      └─ ${httpUrls.length} URLs HTTP/HTTPS`);
    console.log();
    console.log('   📁 local-image-paths.txt');
    console.log(`      └─ ${localUrls.length} caminhos locais`);
    console.log();
    console.log('   🌐 unique-domains.txt');
    console.log(`      └─ ${uniqueDomains.length} domínios únicos`);
    console.log();
    console.log('   📊 urls-by-domain.json');
    console.log(`      └─ URLs agrupadas por domínio\n`);

    // Mostrar alguns exemplos
    console.log('📌 Exemplos de URLs HTTP/HTTPS (primeiras 10):\n');
    httpUrls.slice(0, 10).forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.url}`);
    });
    console.log();

    console.log('📌 Exemplos de caminhos locais (primeiros 10):\n');
    localUrls.slice(0, 10).forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.url}`);
    });
    console.log();

    console.log('🌐 Domínios encontrados:\n');
    uniqueDomains.forEach((domain, i) => {
      const stats = Object.values(domainStats).find(d => d.domain === domain);
      console.log(`   ${i + 1}. ${domain} (${stats?.urls.length || 0} URLs únicas)`);
    });
    console.log();

    console.log('✨ Lista de URLs gerada com sucesso!');
    console.log('   Arquivos salvos em: scripts/reports/\n');

  } catch (error) {
    console.error('❌ Erro ao listar URLs:', error);
    
    // Verificar se o arquivo de relatório existe
    console.log('\n💡 Dica: Execute primeiro o script de investigação:');
    console.log('   npm run investigate:enem-local-images\n');
    
    throw error;
  }
}

// Executar o script
listImageUrls()
  .then(() => {
    console.log('🎉 Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });


