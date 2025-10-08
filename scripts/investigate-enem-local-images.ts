import * as fs from 'fs/promises';
import * as path from 'path';

interface ExtractedImage {
  url: string;
  alt?: string;
  originalMarkdown: string;
}

interface Alternative {
  letter: string;
  text: string;
  file: string | null;
  isCorrect: boolean;
}

interface QuestionDetails {
  title: string;
  index: number;
  year: number;
  language: string | null;
  discipline: string;
  context: string;
  files: string[];
  correctAlternative: string;
  alternativesIntroduction: string;
  alternatives: Alternative[];
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
  year: number;
  discipline: string;
  language: string | null;
  field: string;
  url: string;
  alt?: string;
  markdown: string;
}

interface QuestionImageInfo {
  questionId: string;
  year: number;
  discipline: string;
  language: string | null;
  imageCount: number;
  fields: string[];
  urls: string[];
  localFiles: string[];
}

async function getAllYears(basePath: string): Promise<number[]> {
  const items = await fs.readdir(basePath);
  const years: number[] = [];

  for (const item of items) {
    if (/^\d{4}$/.test(item)) {
      const itemPath = path.join(basePath, item);
      const stats = await fs.stat(itemPath);
      if (stats.isDirectory()) {
        years.push(parseInt(item));
      }
    }
  }

  return years.sort((a, b) => b - a);
}

async function getQuestionsForYear(basePath: string, year: number): Promise<string[]> {
  const questionsPath = path.join(basePath, year.toString(), 'questions');
  
  try {
    await fs.access(questionsPath);
  } catch {
    return [];
  }

  const items = await fs.readdir(questionsPath);
  const questions: string[] = [];

  for (const item of items) {
    const detailsPath = path.join(questionsPath, item, 'details.json');
    try {
      await fs.access(detailsPath);
      questions.push(item);
    } catch {
      // Skip if no details.json
    }
  }

  return questions;
}

async function loadQuestion(basePath: string, year: number, questionDir: string): Promise<QuestionDetails | null> {
  const detailsPath = path.join(basePath, year.toString(), 'questions', questionDir, 'details.json');
  
  try {
    const data = await fs.readFile(detailsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading question ${questionDir} from year ${year}:`, error);
    return null;
  }
}

async function getLocalImageFiles(basePath: string, year: number, questionDir: string): Promise<string[]> {
  const questionPath = path.join(basePath, year.toString(), 'questions', questionDir);
  
  try {
    const files = await fs.readdir(questionPath);
    return files.filter(file => 
      /\.(png|jpg|jpeg|gif|bmp|webp|svg)$/i.test(file)
    );
  } catch {
    return [];
  }
}

async function investigateLocalEnemImages() {
  console.log('🔍 Iniciando investigação de imagens nas questões locais do ENEM...\n');

  const basePath = path.join(process.cwd(), 'QUESTOES_ENEM', 'public');

  try {
    // Verificar se o diretório existe
    await fs.access(basePath);
  } catch {
    console.error('❌ Diretório QUESTOES_ENEM/public não encontrado!');
    process.exit(1);
  }

  try {
    const years = await getAllYears(basePath);
    console.log(`📅 Anos encontrados: ${years.join(', ')}\n`);

    const imageReferences: ImageReference[] = [];
    const questionsWithImages: QuestionImageInfo[] = [];
    let totalQuestions = 0;
    let questionsWithImagesCount = 0;
    let questionsWithLocalFiles = 0;

    for (const year of years) {
      console.log(`📖 Processando ano ${year}...`);
      const questions = await getQuestionsForYear(basePath, year);
      console.log(`   Encontradas ${questions.length} questões`);
      totalQuestions += questions.length;

      for (const questionDir of questions) {
        const question = await loadQuestion(basePath, year, questionDir);
        if (!question) continue;

        const questionId = `${year}-${questionDir}`;
        const fieldsToCheck: Record<string, string> = {
          'context': question.context,
          'alternativesIntroduction': question.alternativesIntroduction,
        };

        // Adicionar alternativas
        question.alternatives.forEach((alt, index) => {
          fieldsToCheck[`alternative_${alt.letter}`] = alt.text;
        });

        let hasImages = false;
        const questionUrls: string[] = [];
        const questionFields: string[] = [];

        // Extrair imagens do texto
        for (const [fieldName, fieldValue] of Object.entries(fieldsToCheck)) {
          const images = extractImagesFromMarkdown(fieldValue);
          
          if (images.length > 0) {
            hasImages = true;
            images.forEach(img => {
              imageReferences.push({
                questionId,
                year,
                discipline: question.discipline,
                language: question.language,
                field: fieldName,
                url: img.url,
                alt: img.alt,
                markdown: img.originalMarkdown,
              });
              questionUrls.push(img.url);
              if (!questionFields.includes(fieldName)) {
                questionFields.push(fieldName);
              }
            });
          }
        }

        // Verificar arquivos de imagem locais
        const localFiles = await getLocalImageFiles(basePath, year, questionDir);
        const localFilePaths = localFiles.map(file => 
          `/QUESTOES_ENEM/public/${year}/questions/${questionDir}/${file}`
        );

        // Adicionar arquivos locais às referências
        if (localFiles.length > 0) {
          hasImages = true;
          questionsWithLocalFiles++;
          localFiles.forEach(file => {
            const filePath = `/QUESTOES_ENEM/public/${year}/questions/${questionDir}/${file}`;
            imageReferences.push({
              questionId,
              year,
              discipline: question.discipline,
              language: question.language,
              field: 'local_file',
              url: filePath,
              markdown: filePath,
            });
            questionUrls.push(filePath);
            if (!questionFields.includes('local_file')) {
              questionFields.push('local_file');
            }
          });
        }

        // Adicionar arquivos listados no JSON
        if (question.files && question.files.length > 0) {
          hasImages = true;
          question.files.forEach(file => {
            imageReferences.push({
              questionId,
              year,
              discipline: question.discipline,
              language: question.language,
              field: 'files_json',
              url: file,
              markdown: file,
            });
            questionUrls.push(file);
            if (!questionFields.includes('files_json')) {
              questionFields.push('files_json');
            }
          });
        }

        // Adicionar arquivos nas alternativas
        question.alternatives.forEach((alt) => {
          if (alt.file) {
            hasImages = true;
            imageReferences.push({
              questionId,
              year,
              discipline: question.discipline,
              language: question.language,
              field: `alternative_${alt.letter}_file`,
              url: alt.file,
              markdown: alt.file,
            });
            questionUrls.push(alt.file);
            if (!questionFields.includes(`alternative_${alt.letter}_file`)) {
              questionFields.push(`alternative_${alt.letter}_file`);
            }
          }
        });

        if (hasImages) {
          questionsWithImagesCount++;
          questionsWithImages.push({
            questionId,
            year,
            discipline: question.discipline,
            language: question.language,
            imageCount: questionUrls.length,
            fields: questionFields,
            urls: [...new Set(questionUrls)],
            localFiles: localFilePaths,
          });
        }
      }
    }

    console.log(`\n📊 Estatísticas Gerais:`);
    console.log(`   - Total de questões: ${totalQuestions}`);
    console.log(`   - Questões com imagens: ${questionsWithImagesCount}`);
    console.log(`   - Questões com arquivos locais: ${questionsWithLocalFiles}`);
    console.log(`   - Total de referências de imagens: ${imageReferences.length}\n`);

    // Agrupar por tipo de URL
    const urlTypes = {
      https: imageReferences.filter(ref => ref.url.startsWith('https://')),
      http: imageReferences.filter(ref => ref.url.startsWith('http://') && !ref.url.startsWith('https://')),
      relative: imageReferences.filter(ref => ref.url.startsWith('/') && !ref.url.startsWith('//')),
      local_file: imageReferences.filter(ref => ref.field === 'local_file'),
      other: imageReferences.filter(ref => 
        !ref.url.startsWith('http') && 
        !ref.url.startsWith('/') && 
        ref.field !== 'local_file'
      ),
    };

    console.log(`📈 Distribuição por tipo de URL:`);
    console.log(`   - HTTPS: ${urlTypes.https.length}`);
    console.log(`   - HTTP: ${urlTypes.http.length}`);
    console.log(`   - Caminhos relativos: ${urlTypes.relative.length}`);
    console.log(`   - Arquivos locais: ${urlTypes.local_file.length}`);
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

    // Agrupar por disciplina
    const byDiscipline = imageReferences.reduce((acc, ref) => {
      if (!acc[ref.discipline]) acc[ref.discipline] = 0;
      acc[ref.discipline]++;
      return acc;
    }, {} as Record<string, number>);

    console.log(`📚 Distribuição por disciplina:`);
    Object.entries(byDiscipline)
      .sort(([, a], [, b]) => b - a)
      .forEach(([discipline, count]) => {
        console.log(`   - ${discipline}: ${count} imagens`);
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
      discipline: ref.discipline,
      language: ref.language || '',
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
        disciplines: [...new Set(refs.map(ref => ref.discipline))],
      };
    });

    // Salvar relatórios em JSON
    const reportsDir = path.join(process.cwd(), 'scripts', 'reports');
    await fs.mkdir(reportsDir, { recursive: true });

    await fs.writeFile(
      path.join(reportsDir, 'enem-local-all-image-references.json'),
      JSON.stringify(allReferencesReport, null, 2)
    );

    await fs.writeFile(
      path.join(reportsDir, 'enem-local-unique-urls.json'),
      JSON.stringify(uniqueUrlsReport, null, 2)
    );

    await fs.writeFile(
      path.join(reportsDir, 'enem-local-questions-with-images.json'),
      JSON.stringify(questionsWithImages, null, 2)
    );

    // Criar relatório CSV para fácil análise
    const csvLines = [
      'Question ID,Year,Discipline,Language,Field,URL,Alt Text,Markdown',
      ...allReferencesReport.map(ref => 
        `"${ref.questionId}",${ref.year},"${ref.discipline}","${ref.language}","${ref.field}","${ref.url}","${ref.alt}","${ref.markdown.replace(/"/g, '""')}"`
      )
    ];

    await fs.writeFile(
      path.join(reportsDir, 'enem-local-image-references.csv'),
      csvLines.join('\n')
    );

    console.log('✅ Relatórios salvos em scripts/reports/:');
    console.log('   - enem-local-all-image-references.json (todas as referências)');
    console.log('   - enem-local-unique-urls.json (URLs únicas com estatísticas)');
    console.log('   - enem-local-questions-with-images.json (questões com imagens)');
    console.log('   - enem-local-image-references.csv (formato CSV)\n');

    // Mostrar algumas amostras
    console.log('🔍 Amostras de URLs encontradas:\n');
    
    if (urlTypes.local_file.length > 0) {
      console.log('📌 Arquivos locais (primeiros 10):');
      urlTypes.local_file.slice(0, 10).forEach(ref => {
        console.log(`   - ${ref.url}`);
        console.log(`     Questão: ${ref.questionId} - Disciplina: ${ref.discipline}`);
      });
      console.log();
    }

    if (urlTypes.https.length > 0) {
      console.log('📌 HTTPS URLs (primeiras 10):');
      urlTypes.https.slice(0, 10).forEach(ref => {
        console.log(`   - ${ref.url}`);
        console.log(`     Questão: ${ref.questionId} - Campo: ${ref.field}`);
      });
      console.log();
    }

    if (urlTypes.relative.length > 0) {
      console.log('📌 Caminhos relativos (primeiros 10):');
      urlTypes.relative.slice(0, 10).forEach(ref => {
        console.log(`   - ${ref.url}`);
        console.log(`     Questão: ${ref.questionId} - Campo: ${ref.field}`);
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

    // Estatísticas adicionais sobre arquivos locais
    console.log('📁 Estatísticas de arquivos locais:\n');
    const localImageTypes = urlTypes.local_file.map(ref => {
      const ext = path.extname(ref.url).toLowerCase();
      return ext.substring(1); // Remove o ponto
    });

    const imageTypeCount = localImageTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('   Tipos de arquivo:');
    Object.entries(imageTypeCount)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`   - .${type}: ${count} arquivos`);
      });
    console.log();

    console.log('✨ Investigação concluída!\n');

  } catch (error) {
    console.error('❌ Erro durante a investigação:', error);
    throw error;
  }
}

// Executar o script
investigateLocalEnemImages()
  .then(() => {
    console.log('🎉 Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });


