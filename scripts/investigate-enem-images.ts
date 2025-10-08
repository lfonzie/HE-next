import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ExtractedImage {
  url: string;
  alt?: string;
  originalMarkdown: string;
}

/**
 * Extract image URLs from markdown text
 * Handles both standard markdown syntax and malformed syntax like "!(url)"
 */
function extractImagesFromMarkdown(text: string): ExtractedImage[] {
  if (!text) return [];

  const images: ExtractedImage[] = [];
  
  // Pattern 1: Standard markdown syntax ![alt](url)
  const standardPattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = standardPattern.exec(text)) !== null) {
    images.push({
      url: match[2],
      alt: match[1] || undefined,
      originalMarkdown: match[0]
    });
  }
  
  // Pattern 2: Malformed syntax !(url) - common in ENEM questions
  const malformedPattern = /!\(([^)]+)\)/g;
  
  while ((match = malformedPattern.exec(text)) !== null) {
    images.push({
      url: match[1],
      alt: undefined,
      originalMarkdown: match[0]
    });
  }
  
  // Pattern 3: Direct image URLs (png, jpg, jpeg, gif, bmp, webp, svg)
  const urlPattern = /(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|bmp|webp|svg)(?:\?[^\s]*)?)/gi;
  
  while ((match = urlPattern.exec(text)) !== null) {
    // Only add if not already captured by markdown patterns
    const alreadyCaptured = images.some(img => img.url === match[1]);
    if (!alreadyCaptured) {
      images.push({
        url: match[1],
        alt: undefined,
        originalMarkdown: match[1]
      });
    }
  }
  
  // Pattern 4: Relative paths to local images
  const relativePattern = /!\[([^\]]*)\]\((\/[^)]+\.(?:png|jpg|jpeg|gif|bmp|webp|svg))\)/gi;
  
  while ((match = relativePattern.exec(text)) !== null) {
    const alreadyCaptured = images.some(img => img.url === match[2]);
    if (!alreadyCaptured) {
      images.push({
        url: match[2],
        alt: match[1] || undefined,
        originalMarkdown: match[0]
      });
    }
  }
  
  return images;
}

interface ImageReference {
  questionId: string;
  area: string;
  year: number;
  disciplina: string;
  field: string;
  url: string;
  alt?: string;
  markdown: string;
}

async function investigateEnemImages() {
  console.log('🔍 Iniciando investigação de imagens nas questões do ENEM...\n');

  try {
    // Buscar todas as questões
    const questions = await prisma.enemQuestion.findMany({
      select: {
        id: true,
        area: true,
        year: true,
        disciplina: true,
        stem: true,
        a: true,
        b: true,
        c: true,
        d: true,
        e: true,
        rationale: true,
        source: true,
      },
      orderBy: [
        { year: 'desc' },
        { id: 'asc' }
      ]
    });

    console.log(`📚 Total de questões encontradas: ${questions.length}\n`);

    const imageReferences: ImageReference[] = [];
    let questionsWithImages = 0;

    // Processar cada questão
    for (const question of questions) {
      const fieldsToCheck = {
        'stem': question.stem,
        'a': question.a,
        'b': question.b,
        'c': question.c,
        'd': question.d,
        'e': question.e,
        'rationale': question.rationale,
      };

      let hasImages = false;

      for (const [fieldName, fieldValue] of Object.entries(fieldsToCheck)) {
        const images = extractImagesFromMarkdown(fieldValue);
        
        if (images.length > 0) {
          hasImages = true;
          images.forEach(img => {
            imageReferences.push({
              questionId: question.id,
              area: question.area,
              year: question.year,
              disciplina: question.disciplina,
              field: fieldName,
              url: img.url,
              alt: img.alt,
              markdown: img.originalMarkdown,
            });
          });
        }
      }

      if (hasImages) {
        questionsWithImages++;
      }
    }

    console.log(`📊 Estatísticas:`);
    console.log(`   - Questões com imagens: ${questionsWithImages}`);
    console.log(`   - Total de referências de imagens: ${imageReferences.length}\n`);

    // Agrupar por tipo de URL
    const urlTypes = {
      https: imageReferences.filter(ref => ref.url.startsWith('https://')),
      http: imageReferences.filter(ref => ref.url.startsWith('http://') && !ref.url.startsWith('https://')),
      relative: imageReferences.filter(ref => ref.url.startsWith('/')),
      other: imageReferences.filter(ref => !ref.url.startsWith('http') && !ref.url.startsWith('/')),
    };

    console.log(`📈 Distribuição por tipo de URL:`);
    console.log(`   - HTTPS: ${urlTypes.https.length}`);
    console.log(`   - HTTP: ${urlTypes.http.length}`);
    console.log(`   - Caminhos relativos: ${urlTypes.relative.length}`);
    console.log(`   - Outros: ${urlTypes.other.length}\n`);

    // Agrupar por ano
    const byYear = imageReferences.reduce((acc, ref) => {
      if (!acc[ref.year]) acc[ref.year] = 0;
      acc[ref.year]++;
      return acc;
    }, {} as Record<number, number>);

    console.log(`📅 Distribuição por ano:`);
    Object.entries(byYear)
      .sort(([a], [b]) => Number(b) - Number(a))
      .forEach(([year, count]) => {
        console.log(`   - ${year}: ${count} imagens`);
      });
    console.log();

    // Agrupar por área
    const byArea = imageReferences.reduce((acc, ref) => {
      if (!acc[ref.area]) acc[ref.area] = 0;
      acc[ref.area]++;
      return acc;
    }, {} as Record<string, number>);

    console.log(`🎯 Distribuição por área:`);
    Object.entries(byArea)
      .sort(([, a], [, b]) => b - a)
      .forEach(([area, count]) => {
        console.log(`   - ${area}: ${count} imagens`);
      });
    console.log();

    // Agrupar por campo
    const byField = imageReferences.reduce((acc, ref) => {
      if (!acc[ref.field]) acc[ref.field] = 0;
      acc[ref.field]++;
      return acc;
    }, {} as Record<string, number>);

    console.log(`📍 Distribuição por campo:`);
    Object.entries(byField)
      .sort(([, a], [, b]) => b - a)
      .forEach(([field, count]) => {
        console.log(`   - ${field}: ${count} imagens`);
      });
    console.log();

    // Listar URLs únicas
    const uniqueUrls = [...new Set(imageReferences.map(ref => ref.url))];
    console.log(`🔗 URLs únicas encontradas: ${uniqueUrls.length}\n`);

    // Exportar resultados detalhados
    console.log('📝 Gerando relatórios...\n');

    // Relatório 1: Todas as referências
    const allReferencesReport = imageReferences.map(ref => ({
      questionId: ref.questionId,
      year: ref.year,
      area: ref.area,
      disciplina: ref.disciplina,
      field: ref.field,
      url: ref.url,
      alt: ref.alt || '',
      markdown: ref.markdown,
    }));

    // Relatório 2: URLs únicas
    const uniqueUrlsReport = uniqueUrls.map(url => {
      const refs = imageReferences.filter(ref => ref.url === url);
      return {
        url,
        occurrences: refs.length,
        questions: [...new Set(refs.map(ref => ref.questionId))].length,
        fields: [...new Set(refs.map(ref => ref.field))],
        years: [...new Set(refs.map(ref => ref.year))].sort((a, b) => b - a),
      };
    });

    // Relatório 3: Questões com imagens
    const questionsWithImagesReport = questions
      .filter(q => imageReferences.some(ref => ref.questionId === q.id))
      .map(q => {
        const refs = imageReferences.filter(ref => ref.questionId === q.id);
        return {
          id: q.id,
          year: q.year,
          area: q.area,
          disciplina: q.disciplina,
          source: q.source,
          imageCount: refs.length,
          fields: [...new Set(refs.map(ref => ref.field))],
          urls: refs.map(ref => ref.url),
        };
      });

    // Salvar relatórios em JSON
    const fs = await import('fs/promises');
    const path = await import('path');

    const reportsDir = path.join(process.cwd(), 'scripts', 'reports');
    await fs.mkdir(reportsDir, { recursive: true });

    await fs.writeFile(
      path.join(reportsDir, 'enem-all-image-references.json'),
      JSON.stringify(allReferencesReport, null, 2)
    );

    await fs.writeFile(
      path.join(reportsDir, 'enem-unique-urls.json'),
      JSON.stringify(uniqueUrlsReport, null, 2)
    );

    await fs.writeFile(
      path.join(reportsDir, 'enem-questions-with-images.json'),
      JSON.stringify(questionsWithImagesReport, null, 2)
    );

    // Criar relatório CSV para fácil análise
    const csvLines = [
      'Question ID,Year,Area,Disciplina,Field,URL,Alt Text,Markdown',
      ...allReferencesReport.map(ref => 
        `"${ref.questionId}",${ref.year},"${ref.area}","${ref.disciplina}","${ref.field}","${ref.url}","${ref.alt}","${ref.markdown.replace(/"/g, '""')}"`
      )
    ];

    await fs.writeFile(
      path.join(reportsDir, 'enem-image-references.csv'),
      csvLines.join('\n')
    );

    console.log('✅ Relatórios salvos em scripts/reports/:');
    console.log('   - enem-all-image-references.json (todas as referências)');
    console.log('   - enem-unique-urls.json (URLs únicas com estatísticas)');
    console.log('   - enem-questions-with-images.json (questões com imagens)');
    console.log('   - enem-image-references.csv (formato CSV)\n');

    // Mostrar algumas amostras
    console.log('🔍 Amostras de URLs encontradas:\n');
    
    if (urlTypes.https.length > 0) {
      console.log('📌 HTTPS URLs (primeiras 5):');
      urlTypes.https.slice(0, 5).forEach(ref => {
        console.log(`   - ${ref.url}`);
        console.log(`     Questão: ${ref.questionId} (${ref.year}) - Campo: ${ref.field}`);
      });
      console.log();
    }

    if (urlTypes.relative.length > 0) {
      console.log('📌 Caminhos relativos (primeiros 5):');
      urlTypes.relative.slice(0, 5).forEach(ref => {
        console.log(`   - ${ref.url}`);
        console.log(`     Questão: ${ref.questionId} (${ref.year}) - Campo: ${ref.field}`);
      });
      console.log();
    }

    // Verificar domínios únicos
    const domains = imageReferences
      .filter(ref => ref.url.startsWith('http'))
      .map(ref => {
        try {
          const url = new URL(ref.url);
          return url.hostname;
        } catch {
          return 'invalid-url';
        }
      });

    const uniqueDomains = [...new Set(domains)];
    
    if (uniqueDomains.length > 0) {
      console.log(`🌐 Domínios únicos encontrados (${uniqueDomains.length}):`);
      const domainCounts = domains.reduce((acc, domain) => {
        acc[domain] = (acc[domain] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(domainCounts)
        .sort(([, a], [, b]) => b - a)
        .forEach(([domain, count]) => {
          console.log(`   - ${domain}: ${count} imagens`);
        });
      console.log();
    }

    console.log('✨ Investigação concluída!\n');

  } catch (error) {
    console.error('❌ Erro durante a investigação:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
investigateEnemImages()
  .then(() => {
    console.log('🎉 Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });


