import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Script para filtrar e analisar imagens do domínio enem.dev
 */

interface UniqueUrlReport {
  url: string;
  occurrences: number;
  questions: number;
  fields: string[];
  years: number[];
  disciplines: string[];
}

interface ImageReference {
  questionId: string;
  year: number;
  discipline: string;
  language: string;
  field: string;
  url: string;
  alt: string;
  markdown: string;
}

async function filterEnemDevImages() {
  console.log('🔍 Filtrando imagens do domínio enem.dev...\n');

  const reportsDir = path.join(process.cwd(), 'scripts', 'reports');

  try {
    // Ler URLs únicas
    const uniqueUrlsData = await fs.readFile(
      path.join(reportsDir, 'enem-local-unique-urls.json'),
      'utf-8'
    );
    const uniqueUrls: UniqueUrlReport[] = JSON.parse(uniqueUrlsData);

    // Ler todas as referências
    const allRefsData = await fs.readFile(
      path.join(reportsDir, 'enem-local-all-image-references.json'),
      'utf-8'
    );
    const allReferences: ImageReference[] = JSON.parse(allRefsData);

    // Filtrar apenas enem.dev
    const enemDevUrls = uniqueUrls.filter(u => u.url.includes('enem.dev'));
    const enemDevRefs = allReferences.filter(r => r.url.includes('enem.dev'));

    console.log('📊 Estatísticas do domínio enem.dev:\n');
    console.log(`   Total de URLs únicas: ${enemDevUrls.length}`);
    console.log(`   Total de referências: ${enemDevRefs.length}`);
    console.log(`   Total de questões: ${[...new Set(enemDevRefs.map(r => r.questionId))].length}\n`);

    // Separar broken-image das válidas
    const brokenImage = enemDevUrls.filter(u => u.url.includes('broken-image'));
    const validUrls = enemDevUrls.filter(u => !u.url.includes('broken-image'));

    console.log(`   ✅ URLs válidas: ${validUrls.length}`);
    console.log(`   ⚠️  Broken image: ${brokenImage.length}\n`);

    // Analisar estrutura de URLs
    const urlPatterns = {
      year2023: enemDevUrls.filter(u => u.url.includes('/2023/')),
      year2022: enemDevUrls.filter(u => u.url.includes('/2022/')),
      year2021: enemDevUrls.filter(u => u.url.includes('/2021/')),
      year2020: enemDevUrls.filter(u => u.url.includes('/2020/')),
      year2019: enemDevUrls.filter(u => u.url.includes('/2019/')),
      year2018: enemDevUrls.filter(u => u.url.includes('/2018/')),
      year2017: enemDevUrls.filter(u => u.url.includes('/2017/')),
      year2016: enemDevUrls.filter(u => u.url.includes('/2016/')),
      year2015: enemDevUrls.filter(u => u.url.includes('/2015/')),
      year2014: enemDevUrls.filter(u => u.url.includes('/2014/')),
      year2013: enemDevUrls.filter(u => u.url.includes('/2013/')),
      year2012: enemDevUrls.filter(u => u.url.includes('/2012/')),
      year2011: enemDevUrls.filter(u => u.url.includes('/2011/')),
      year2010: enemDevUrls.filter(u => u.url.includes('/2010/')),
      year2009: enemDevUrls.filter(u => u.url.includes('/2009/')),
    };

    console.log('📅 Distribuição por ano:\n');
    Object.entries(urlPatterns)
      .sort(([a], [b]) => b.localeCompare(a))
      .forEach(([year, urls]) => {
        if (urls.length > 0) {
          const yearNum = year.replace('year', '');
          console.log(`   ${yearNum}: ${urls.length} URLs`);
        }
      });
    console.log();

    // Analisar tipos de arquivo
    const fileTypes = enemDevUrls.reduce((acc, u) => {
      const ext = u.url.match(/\.(png|jpg|jpeg|gif|bmp|webp|svg)(\?|$)/i)?.[1]?.toLowerCase() || 'unknown';
      acc[ext] = (acc[ext] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📁 Tipos de arquivo:\n');
    Object.entries(fileTypes)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`   .${type}: ${count} arquivos`);
      });
    console.log();

    // Salvar listas separadas
    await fs.writeFile(
      path.join(reportsDir, 'enem-dev-urls.txt'),
      enemDevUrls.map(u => u.url).join('\n')
    );

    await fs.writeFile(
      path.join(reportsDir, 'enem-dev-valid-urls.txt'),
      validUrls.map(u => u.url).join('\n')
    );

    if (brokenImage.length > 0) {
      await fs.writeFile(
        path.join(reportsDir, 'enem-dev-broken-urls.txt'),
        brokenImage.map(u => u.url).join('\n')
      );
    }

    // Salvar JSON detalhado
    await fs.writeFile(
      path.join(reportsDir, 'enem-dev-unique-urls.json'),
      JSON.stringify(enemDevUrls, null, 2)
    );

    await fs.writeFile(
      path.join(reportsDir, 'enem-dev-all-references.json'),
      JSON.stringify(enemDevRefs, null, 2)
    );

    // Criar CSV
    const csvLines = [
      'Question ID,Year,Discipline,Language,Field,URL,Alt Text',
      ...enemDevRefs.map(ref => 
        `"${ref.questionId}",${ref.year},"${ref.discipline}","${ref.language}","${ref.field}","${ref.url}","${ref.alt}"`
      )
    ];

    await fs.writeFile(
      path.join(reportsDir, 'enem-dev-references.csv'),
      csvLines.join('\n')
    );

    // Gerar relatório por ano
    const byYear = enemDevRefs.reduce((acc, ref) => {
      if (!acc[ref.year]) {
        acc[ref.year] = {
          year: ref.year,
          totalRefs: 0,
          uniqueUrls: new Set<string>(),
          questions: new Set<string>(),
          disciplines: new Set<string>(),
        };
      }
      acc[ref.year].totalRefs++;
      acc[ref.year].uniqueUrls.add(ref.url);
      acc[ref.year].questions.add(ref.questionId);
      acc[ref.year].disciplines.add(ref.discipline);
      return acc;
    }, {} as Record<number, any>);

    const yearReport = Object.values(byYear).map((y: any) => ({
      year: y.year,
      totalRefs: y.totalRefs,
      uniqueUrls: y.uniqueUrls.size,
      questions: y.questions.size,
      disciplines: Array.from(y.disciplines),
    }));

    await fs.writeFile(
      path.join(reportsDir, 'enem-dev-by-year.json'),
      JSON.stringify(yearReport.sort((a, b) => b.year - a.year), null, 2)
    );

    console.log('✅ Arquivos gerados:\n');
    console.log('   📄 enem-dev-urls.txt');
    console.log(`      └─ ${enemDevUrls.length} URLs do enem.dev`);
    console.log();
    console.log('   ✅ enem-dev-valid-urls.txt');
    console.log(`      └─ ${validUrls.length} URLs válidas (sem broken-image)`);
    console.log();
    
    if (brokenImage.length > 0) {
      console.log('   ⚠️  enem-dev-broken-urls.txt');
      console.log(`      └─ ${brokenImage.length} URL(s) quebrada(s)`);
      console.log();
    }

    console.log('   📊 enem-dev-unique-urls.json');
    console.log(`      └─ URLs únicas com estatísticas`);
    console.log();
    console.log('   📋 enem-dev-all-references.json');
    console.log(`      └─ Todas as ${enemDevRefs.length} referências`);
    console.log();
    console.log('   📁 enem-dev-references.csv');
    console.log(`      └─ Formato CSV para planilhas`);
    console.log();
    console.log('   📅 enem-dev-by-year.json');
    console.log(`      └─ Estatísticas por ano`);
    console.log();

    // Mostrar amostras
    console.log('📌 Exemplos de URLs válidas (primeiras 10):\n');
    validUrls.slice(0, 10).forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.url}`);
    });
    console.log();

    if (brokenImage.length > 0) {
      console.log('⚠️  URLs Quebradas:\n');
      brokenImage.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.url}`);
        console.log(`      Usado em ${u.questions} questões (${u.occurrences} ocorrências)`);
        console.log(`      Anos: ${u.years.join(', ')}`);
        console.log(`      Disciplinas: ${u.disciplines.join(', ')}`);
        console.log();
      });
    }

    // Análise de padrões de URL
    console.log('🔍 Análise de Padrões de URL:\n');
    const questionUrls = validUrls.filter(u => u.url.match(/\/questions\/\d+\//));
    const withUuid = validUrls.filter(u => u.url.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i));
    
    console.log(`   URLs com padrão /questions/: ${questionUrls.length}`);
    console.log(`   URLs com UUID: ${withUuid.length}`);
    console.log();

    console.log('✨ Filtro concluído!');
    console.log('   Todos os arquivos salvos em: scripts/reports/\n');

  } catch (error) {
    console.error('❌ Erro ao filtrar imagens:', error);
    throw error;
  }
}

// Executar o script
filterEnemDevImages()
  .then(() => {
    console.log('🎉 Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });


