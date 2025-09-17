import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { EnemItem, EnemManifest } from '@/types/enem';

interface ExistingQuestionData {
  title: string;
  index: number;
  year: number;
  language: string | null;
  discipline: string;
  context: string;
  files: any[];
  correctAlternative: string;
  alternativesIntroduction: string;
  alternatives: Array<{
    letter: string;
    text: string;
    file: any;
    isCorrect: boolean;
  }>;
}

interface ExistingExamData {
  title: string;
  year: number;
  disciplines: Array<{
    label: string;
    value: string;
  }>;
  languages: Array<{
    label: string;
    value: string;
  }>;
}

// Mapeamento das disciplinas existentes para o novo formato
const DISCIPLINE_MAPPING: { [key: string]: string } = {
  'ciencias-humanas': 'CH',
  'ciencias-natureza': 'CN', 
  'linguagens': 'LC',
  'matematica': 'MT'
};

// Mapeamento das linguagens
const LANGUAGE_MAPPING: { [key: string]: string } = {
  'espanhol': 'ES',
  'ingles': 'IN'
};

export class EnemExistingDataConverter {
  private basePath: string;

  constructor(basePath: string = 'QUESTOES_ENEM/public') {
    this.basePath = basePath;
  }

  /**
   * Converte todos os dados existentes para o novo formato
   */
  async convertAllData(): Promise<{ manifest: EnemManifest; items: EnemItem[] }> {
    const years = await this.getAvailableYears();
    const manifest: EnemManifest = {
      dataset_version: 'v2025-01-15',
      years_available: years,
      areas: ['CN', 'CH', 'LC', 'MT'],
      checksums: {},
      metadata: {
        total_items: 0,
        last_updated: new Date().toISOString(),
        import_status: 'pending',
        validation_status: 'pending'
      }
    };

    const allItems: EnemItem[] = [];

    for (const year of years) {
      console.log(`Converting data for year ${year}...`);
      const yearItems = await this.convertYearData(year);
      allItems.push(...yearItems);
      
      // Calculate checksum for this year's data
      const yearDataString = JSON.stringify(yearItems);
      manifest.checksums[`${year}/items.jsonl`] = `sha256-${crypto.createHash('sha256').update(yearDataString).digest('hex')}`;
    }

    return { manifest, items: allItems };
  }

  /**
   * Obtém os anos disponíveis nos dados existentes
   */
  private async getAvailableYears(): Promise<number[]> {
    const yearsPath = path.join(this.basePath);
    const entries = await fs.readdir(yearsPath, { withFileTypes: true });
    
    return entries
      .filter(entry => entry.isDirectory() && /^\d{4}$/.test(entry.name))
      .map(entry => parseInt(entry.name))
      .sort((a, b) => b - a); // Ordem decrescente (mais recente primeiro)
  }

  /**
   * Converte dados de um ano específico
   */
  private async convertYearData(year: number): Promise<EnemItem[]> {
    const yearPath = path.join(this.basePath, year.toString());
    const questionsPath = path.join(yearPath, 'questions');
    
    // Verificar se existe o arquivo de detalhes do ano
    const detailsPath = path.join(yearPath, 'details.json');
    let examData: ExistingExamData | null = null;
    
    try {
      const detailsContent = await fs.readFile(detailsPath, 'utf-8');
      examData = JSON.parse(detailsContent);
    } catch (error) {
      console.warn(`Could not read details.json for year ${year}:`, error);
    }

    // Ler todas as pastas de questões
    const questionDirs = await fs.readdir(questionsPath, { withFileTypes: true });
    const items: EnemItem[] = [];

    for (const dir of questionDirs) {
      if (dir.isDirectory()) {
        const questionPath = path.join(questionsPath, dir.name, 'details.json');
        
        try {
          const questionData = await this.convertQuestionData(questionPath, year, examData);
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

  /**
   * Converte dados de uma questão específica
   */
  private async convertQuestionData(
    questionPath: string, 
    year: number, 
    examData: ExistingExamData | null
  ): Promise<EnemItem | null> {
    try {
      const content = await fs.readFile(questionPath, 'utf-8');
      const questionData: ExistingQuestionData = JSON.parse(content);

      // Gerar ID canônico
      const booklet = this.determineBooklet(questionData);
      const questionNumber = questionData.index.toString().padStart(3, '0');
      const itemId = `${year}-${booklet}-${questionNumber}`;

      // Converter disciplina
      const area = DISCIPLINE_MAPPING[questionData.discipline] || 'LC';
      
      // Converter alternativas
      const alternatives: { A: string; B: string; C: string; D: string; E: string } = {
        A: '',
        B: '',
        C: '',
        D: '',
        E: ''
      };
      questionData.alternatives.forEach(alt => {
        if (alt.letter in alternatives) {
          alternatives[alt.letter as keyof typeof alternatives] = alt.text;
        }
      });

      // Determinar dificuldade estimada (simplificado)
      const estimatedDifficulty = this.estimateDifficulty(questionData);

      // Extrair referências de arquivos
      const assetRefs: string[] = [];
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

      const item: EnemItem = {
        item_id: itemId,
        year: year,
        area: area as 'CN' | 'CH' | 'LC' | 'MT',
        text: questionData.context,
        alternatives: alternatives,
        correct_answer: questionData.correctAlternative as 'A' | 'B' | 'C' | 'D' | 'E',
        topic: this.extractTopic(questionData.context, area),
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

  /**
   * Determina o caderno baseado no índice da questão
   */
  private determineBooklet(questionData: ExistingQuestionData): string {
    // Lógica simplificada baseada no índice
    // Em um ENEM real, as questões são distribuídas em cadernos diferentes
    if (questionData.index <= 45) return 'AZUL';
    if (questionData.index <= 90) return 'AMARELO';
    if (questionData.index <= 135) return 'BRANCO';
    return 'ROSA';
  }

  /**
   * Estima a dificuldade da questão (simplificado)
   */
  private estimateDifficulty(questionData: ExistingQuestionData): 'EASY' | 'MEDIUM' | 'HARD' {
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

  /**
   * Extrai tópico da questão baseado no contexto
   */
  private extractTopic(context: string, area: string): string {
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

  /**
   * Salva os dados convertidos no formato do novo sistema
   */
  async saveConvertedData(outputDir: string = 'data/enem'): Promise<void> {
    const { manifest, items } = await this.convertAllData();
    
    // Criar diretório de saída
    await fs.mkdir(outputDir, { recursive: true });
    
    // Salvar manifest
    await fs.writeFile(
      path.join(outputDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    // Agrupar itens por ano
    const itemsByYear: { [year: string]: EnemItem[] } = {};
    items.forEach(item => {
      if (!itemsByYear[item.year]) {
        itemsByYear[item.year] = [];
      }
      itemsByYear[item.year].push(item);
    });

    // Salvar dados por ano
    for (const [year, yearItems] of Object.entries(itemsByYear)) {
      const yearDir = path.join(outputDir, year);
      await fs.mkdir(yearDir, { recursive: true });
      
      // Salvar items.jsonl
      const itemsJsonl = yearItems.map(item => JSON.stringify(item)).join('\n');
      await fs.writeFile(
        path.join(yearDir, 'items.jsonl'),
        itemsJsonl
      );
      
      // Salvar gabarito.json
      const gabarito: { [itemId: string]: string } = {};
      yearItems.forEach(item => {
        gabarito[item.item_id] = item.correct_answer;
      });
      
      await fs.writeFile(
        path.join(yearDir, 'gabarito.json'),
        JSON.stringify(gabarito, null, 2)
      );
      
      console.log(`Saved ${yearItems.length} items for year ${year}`);
    }
    
    console.log(`Conversion complete! Total items: ${items.length}`);
  }
}

// Função utilitária para executar a conversão
export async function convertExistingEnemData(): Promise<void> {
  const converter = new EnemExistingDataConverter();
  await converter.saveConvertedData();
}
