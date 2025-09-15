#!/usr/bin/env node

/**
 * Script para converter dados existentes do ENEM
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Mapeamento das disciplinas existentes para o novo formato
const DISCIPLINE_MAPPING = {
  'ciencias-humanas': 'CH',
  'ciencias-natureza': 'CN', 
  'linguagens': 'LC',
  'matematica': 'MT'
};

// Mapeamento das linguagens
const LANGUAGE_MAPPING = {
  'espanhol': 'ES',
  'ingles': 'IN'
};

async function getAvailableYears() {
  const yearsPath = path.join(projectRoot, 'QUESTOES_ENEM', 'public');
  const entries = await fs.readdir(yearsPath, { withFileTypes: true });
  
  return entries
    .filter(entry => entry.isDirectory() && /^\d{4}$/.test(entry.name))
    .map(entry => parseInt(entry.name))
    .sort((a, b) => b - a); // Ordem decrescente (mais recente primeiro)
}

function determineBooklet(index) {
  // Lógica simplificada baseada no índice
  if (index <= 45) return 'AZUL';
  if (index <= 90) return 'AMARELO';
  if (index <= 135) return 'BRANCO';
  return 'ROSA';
}

function estimateDifficulty(questionData) {
  // Lógica simplificada baseada no tamanho do texto e número de alternativas
  const textLength = questionData.context.length;
  const alternativesCount = questionData.alternatives.length;
  
  if (textLength < 500 && alternativesCount === 5) {
    return 'EASY';
  } else if (textLength < 1000) {
    return 'MEDIUM';
  } else {
    return 'HARD';
  }
}

function extractTopic(context, area) {
  // Lógica simplificada para extrair tópicos
  const contextLower = context.toLowerCase();
  
  switch (area) {
    case 'CN':
      if (contextLower.includes('química') || contextLower.includes('quimica')) return 'Química';
      if (contextLower.includes('física') || contextLower.includes('fisica')) return 'Física';
      if (contextLower.includes('biologia')) return 'Biologia';
      return 'Ciências da Natureza';
      
    case 'CH':
      if (contextLower.includes('história') || contextLower.includes('historia')) return 'História';
      if (contextLower.includes('geografia')) return 'Geografia';
      if (contextLower.includes('filosofia')) return 'Filosofia';
      if (contextLower.includes('sociologia')) return 'Sociologia';
      return 'Ciências Humanas';
      
    case 'LC':
      if (contextLower.includes('literatura')) return 'Literatura';
      if (contextLower.includes('gramática') || contextLower.includes('gramatica')) return 'Gramática';
      if (contextLower.includes('espanhol')) return 'Espanhol';
      if (contextLower.includes('inglês') || contextLower.includes('ingles')) return 'Inglês';
      return 'Linguagens';
      
    case 'MT':
      if (contextLower.includes('álgebra') || contextLower.includes('algebra')) return 'Álgebra';
      if (contextLower.includes('geometria')) return 'Geometria';
      if (contextLower.includes('estatística') || contextLower.includes('estatistica')) return 'Estatística';
      return 'Matemática';
      
    default:
      return 'Geral';
  }
}

async function convertQuestionData(questionPath, year) {
  try {
    const content = await fs.readFile(questionPath, 'utf-8');
    const questionData = JSON.parse(content);

    // Gerar ID canônico
    const booklet = determineBooklet(questionData.index);
    const questionNumber = questionData.index.toString().padStart(3, '0');
    const itemId = `${year}-${booklet}-${questionNumber}`;

    // Converter disciplina
    const area = DISCIPLINE_MAPPING[questionData.discipline] || 'LC';
    
    // Converter alternativas
    const alternatives = {};
    questionData.alternatives.forEach(alt => {
      alternatives[alt.letter] = alt.text;
    });

    // Determinar dificuldade estimada (simplificado)
    const estimatedDifficulty = estimateDifficulty(questionData);

    // Extrair referências de arquivos
    const assetRefs = [];
    if (questionData.files && questionData.files.length > 0) {
      questionData.files.forEach(file => {
        if (file && typeof file === 'string') {
          assetRefs.push(file);
        }
      });
    }

    // Adicionar arquivos de imagens da pasta da questão
    const questionDir = path.dirname(questionPath);
    try {
      const files = await fs.readdir(questionDir);
      const imageFiles = files.filter(file => 
        /\.(png|jpg|jpeg|gif|bmp)$/i.test(file)
      );
      assetRefs.push(...imageFiles.map(file => path.join(questionDir, file)));
    } catch (error) {
      // Ignorar se não conseguir ler a pasta
    }

    // Gerar hash de conteúdo
    const contentHash = crypto.createHash('sha256').update(JSON.stringify({
      text: questionData.context,
      alternatives: alternatives,
      correct_answer: questionData.correctAlternative,
      area: area,
      year: year,
      index: questionData.index
    })).digest('hex');

    const item = {
      item_id: itemId,
      year: year,
      area: area,
      text: questionData.context,
      alternatives: alternatives,
      correct_answer: questionData.correctAlternative,
      topic: extractTopic(questionData.context, area),
      estimated_difficulty: estimatedDifficulty,
      asset_refs: assetRefs,
      content_hash: contentHash,
      dataset_version: 'v2025-01-15',
      metadata: {
        index: questionData.index,
        language: questionData.language,
        discipline: questionData.discipline,
        alternativesIntroduction: questionData.alternativesIntroduction,
        originalTitle: questionData.title,
        booklet: booklet,
        convertedFrom: 'existing-data'
      }
    };

    return item;
  } catch (error) {
    console.error(`Error converting question at ${questionPath}:`, error);
    return null;
  }
}

async function convertYearData(year) {
  const yearPath = path.join(projectRoot, 'QUESTOES_ENEM', 'public', year.toString());
  const questionsPath = path.join(yearPath, 'questions');
  
  // Ler todas as pastas de questões
  const questionDirs = await fs.readdir(questionsPath, { withFileTypes: true });
  const items = [];

  for (const dir of questionDirs) {
    if (dir.isDirectory()) {
      const questionPath = path.join(questionsPath, dir.name, 'details.json');
      
      try {
        const questionData = await convertQuestionData(questionPath, year);
        if (questionData) {
          items.push(questionData);
        }
      } catch (error) {
        console.warn(`Error converting question ${dir.name} for year ${year}:`, error);
      }
    }
  }

  return items.sort((a, b) => {
    // Ordenar por área e depois por índice
    if (a.area !== b.area) {
      return a.area.localeCompare(b.area);
    }
    return a.metadata.index - b.metadata.index;
  });
}

async function convertAllData() {
  console.log('🚀 Iniciando conversão dos dados existentes do ENEM...');
  
  const years = await getAvailableYears();
  console.log(`📅 Anos encontrados: ${years.join(', ')}`);
  
  const manifest = {
    dataset_version: 'v2025-01-15',
    years_available: years,
    areas: ['CN', 'CH', 'LC', 'MT'],
    checksums: {}
  };

  const allItems = [];

  for (const year of years) {
    console.log(`🔄 Convertendo dados para ${year}...`);
    const yearItems = await convertYearData(year);
    allItems.push(...yearItems);
    
    // Calculate checksum for this year's data
    const yearDataString = JSON.stringify(yearItems);
    manifest.checksums[`${year}/items.jsonl`] = `sha256-${crypto.createHash('sha256').update(yearDataString).digest('hex')}`;
    
    console.log(`✅ ${year}: ${yearItems.length} questões convertidas`);
  }

  return { manifest, items: allItems };
}

async function saveConvertedData(outputDir = 'data/enem') {
  const { manifest, items } = await convertAllData();
  
  // Criar diretório de saída
  const fullOutputDir = path.join(projectRoot, outputDir);
  await fs.mkdir(fullOutputDir, { recursive: true });
  
  // Salvar manifest
  await fs.writeFile(
    path.join(fullOutputDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  // Agrupar itens por ano
  const itemsByYear = {};
  items.forEach(item => {
    if (!itemsByYear[item.year]) {
      itemsByYear[item.year] = [];
    }
    itemsByYear[item.year].push(item);
  });

  // Salvar dados por ano
  for (const [year, yearItems] of Object.entries(itemsByYear)) {
    const yearDir = path.join(fullOutputDir, year);
    await fs.mkdir(yearDir, { recursive: true });
    
    // Salvar items.jsonl
    const itemsJsonl = yearItems.map(item => JSON.stringify(item)).join('\n');
    await fs.writeFile(
      path.join(yearDir, 'items.jsonl'),
      itemsJsonl
    );
    
    // Salvar gabarito.json
    const gabarito = {};
    yearItems.forEach(item => {
      gabarito[item.item_id] = item.correct_answer;
    });
    
    await fs.writeFile(
      path.join(yearDir, 'gabarito.json'),
      JSON.stringify(gabarito, null, 2)
    );
    
    console.log(`💾 ${year}: ${yearItems.length} itens salvos`);
  }
  
  console.log(`🎉 Conversão concluída! Total: ${items.length} itens`);
  console.log(`📁 Dados salvos em: ${fullOutputDir}`);
}

// Executar conversão
saveConvertedData().catch(console.error);
