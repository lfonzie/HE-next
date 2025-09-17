// app/api/illustrations/processes/route.ts - API específica para processos educacionais
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema para busca de processos específicos
const ProcessSearchSchema = z.object({
  process: z.string().min(1, 'Processo é obrigatório'),
  level: z.enum(['fundamental', 'medio', 'superior']).default('medio'),
  language: z.enum(['pt', 'en', 'es']).default('pt'),
  limit: z.number().min(1).max(20).default(8),
  includeSteps: z.boolean().default(true),
  includeDiagrams: z.boolean().default(true)
});

// Definições detalhadas de processos educacionais
const EDUCATIONAL_PROCESSES_DETAILED = {
  'fotossintese': {
    name: 'Fotossíntese',
    description: 'Processo pelo qual plantas convertem luz solar em energia química',
    keywords: [
      'photosynthesis', 'fotossíntese', 'chlorophyll', 'clorofila', 
      'chloroplast', 'cloroplasto', 'light reaction', 'reação luminosa',
      'dark reaction', 'reação escura', 'calvin cycle', 'ciclo de calvin',
      'glucose', 'glicose', 'oxygen', 'oxigênio', 'carbon dioxide', 'dióxido de carbono'
    ],
    steps: [
      'Captação de luz solar pela clorofila',
      'Quebra da molécula de água (fotólise)',
      'Liberação de oxigênio',
      'Formação de ATP e NADPH',
      'Fixação do CO2',
      'Síntese de glicose'
    ],
    categories: ['biology', 'chemistry'],
    difficulty: 'medio',
    ageRange: '12-18',
    relatedProcesses: ['respiração-celular', 'respiração-vegetal']
  },
  'respiração-celular': {
    name: 'Respiração Celular',
    description: 'Processo de produção de energia nas células',
    keywords: [
      'cellular respiration', 'respiração celular', 'mitochondria', 'mitocôndria',
      'ATP', 'glycolysis', 'glicólise', 'krebs cycle', 'ciclo de krebs',
      'electron transport chain', 'cadeia transportadora de elétrons',
      'aerobic', 'aeróbico', 'anaerobic', 'anaeróbico'
    ],
    steps: [
      'Glicólise no citoplasma',
      'Formação de acetil-CoA',
      'Ciclo de Krebs',
      'Cadeia transportadora de elétrons',
      'Produção de ATP',
      'Liberação de CO2 e H2O'
    ],
    categories: ['biology'],
    difficulty: 'medio',
    ageRange: '14-18',
    relatedProcesses: ['fotossintese', 'fermentação']
  },
  'digestão': {
    name: 'Digestão',
    description: 'Processo de quebra e absorção de nutrientes',
    keywords: [
      'digestion', 'digestão', 'digestive system', 'sistema digestivo',
      'stomach', 'estômago', 'intestines', 'intestinos', 'enzymes', 'enzimas',
      'nutrients', 'nutrientes', 'absorption', 'absorção'
    ],
    steps: [
      'Ingestão de alimentos',
      'Mastigação e salivação',
      'Deglutição',
      'Digestão no estômago',
      'Digestão no intestino delgado',
      'Absorção de nutrientes',
      'Eliminação de resíduos'
    ],
    categories: ['biology'],
    difficulty: 'fundamental',
    ageRange: '8-14',
    relatedProcesses: ['circulação', 'excreção']
  },
  'circulação': {
    name: 'Circulação Sanguínea',
    description: 'Transporte de substâncias pelo sistema cardiovascular',
    keywords: [
      'circulation', 'circulação', 'cardiovascular system', 'sistema cardiovascular',
      'heart', 'coração', 'blood vessels', 'vasos sanguíneos', 'arteries', 'artérias',
      'veins', 'veias', 'capillaries', 'capilares', 'blood', 'sangue'
    ],
    steps: [
      'Bombeamento do coração',
      'Circulação arterial',
      'Troca de gases nos capilares',
      'Circulação venosa',
      'Retorno ao coração'
    ],
    categories: ['biology'],
    difficulty: 'medio',
    ageRange: '12-16',
    relatedProcesses: ['respiração', 'digestão']
  },
  'mitose': {
    name: 'Mitose',
    description: 'Divisão celular para crescimento e reparo',
    keywords: [
      'mitosis', 'mitose', 'cell division', 'divisão celular', 'chromosomes', 'cromossomos',
      'prophase', 'prófase', 'metaphase', 'metáfase', 'anaphase', 'anáfase',
      'telophase', 'telófase', 'cytokinesis', 'citocinese'
    ],
    steps: [
      'Prófase - condensação dos cromossomos',
      'Metáfase - alinhamento na placa equatorial',
      'Anáfase - separação das cromátides',
      'Telófase - formação dos núcleos',
      'Citocinese - divisão do citoplasma'
    ],
    categories: ['biology'],
    difficulty: 'medio',
    ageRange: '14-18',
    relatedProcesses: ['meiose', 'ciclo-celular']
  },
  'meiose': {
    name: 'Meiose',
    description: 'Divisão celular para formação de gametas',
    keywords: [
      'meiosis', 'meiose', 'sexual reproduction', 'reprodução sexuada',
      'gametes', 'gametas', 'crossing over', 'permutação', 'recombination', 'recombinação'
    ],
    steps: [
      'Meiose I - redução cromossômica',
      'Crossing over',
      'Segregação independente',
      'Meiose II - divisão equacional',
      'Formação de gametas'
    ],
    categories: ['biology'],
    difficulty: 'superior',
    ageRange: '16-18',
    relatedProcesses: ['mitose', 'genética']
  },
  'evolução': {
    name: 'Evolução',
    description: 'Processo de mudança das espécies ao longo do tempo',
    keywords: [
      'evolution', 'evolução', 'natural selection', 'seleção natural',
      'darwin', 'adaptation', 'adaptação', 'mutation', 'mutação',
      'speciation', 'especiação', 'fossils', 'fósseis'
    ],
    steps: [
      'Variação genética na população',
      'Pressão seletiva do ambiente',
      'Sobrevivência dos mais adaptados',
      'Reprodução dos indivíduos selecionados',
      'Transmissão das características',
      'Mudança gradual da população'
    ],
    categories: ['biology'],
    difficulty: 'medio',
    ageRange: '14-18',
    relatedProcesses: ['genética', 'ecologia']
  },
  'química-orgânica': {
    name: 'Química Orgânica',
    description: 'Estudo dos compostos de carbono',
    keywords: [
      'organic chemistry', 'química orgânica', 'carbon compounds', 'compostos de carbono',
      'functional groups', 'grupos funcionais', 'hydrocarbons', 'hidrocarbonetos',
      'alcohols', 'álcoois', 'carboxylic acids', 'ácidos carboxílicos'
    ],
    steps: [
      'Identificação da cadeia principal',
      'Localização dos grupos funcionais',
      'Numeração da cadeia',
      'Nomeação sistemática',
      'Propriedades físicas e químicas'
    ],
    categories: ['chemistry'],
    difficulty: 'superior',
    ageRange: '16-18',
    relatedProcesses: ['reação-química', 'bioquímica']
  },
  'tabela-periódica': {
    name: 'Tabela Periódica',
    description: 'Organização dos elementos químicos',
    keywords: [
      'periodic table', 'tabela periódica', 'elements', 'elementos',
      'atomic number', 'número atômico', 'atomic mass', 'massa atômica',
      'periods', 'períodos', 'groups', 'grupos', 'families', 'famílias'
    ],
    steps: [
      'Organização por número atômico',
      'Períodos horizontais',
      'Grupos verticais',
      'Propriedades periódicas',
      'Tendências periódicas'
    ],
    categories: ['chemistry'],
    difficulty: 'medio',
    ageRange: '12-18',
    relatedProcesses: ['estrutura-atômica', 'ligação-química']
  },
  'movimento': {
    name: 'Movimento',
    description: 'Estudo do deslocamento de objetos',
    keywords: [
      'motion', 'movimento', 'velocity', 'velocidade', 'acceleration', 'aceleração',
      'displacement', 'deslocamento', 'distance', 'distância', 'time', 'tempo',
      'kinematics', 'cinemática', 'dynamics', 'dinâmica'
    ],
    steps: [
      'Definição do sistema de referência',
      'Medição de posição',
      'Cálculo de velocidade',
      'Determinação da aceleração',
      'Análise do movimento'
    ],
    categories: ['physics'],
    difficulty: 'medio',
    ageRange: '14-18',
    relatedProcesses: ['força', 'energia']
  },
  'eletricidade': {
    name: 'Eletricidade',
    description: 'Estudo dos fenômenos elétricos',
    keywords: [
      'electricity', 'eletricidade', 'circuit', 'circuito', 'voltage', 'tensão',
      'current', 'corrente', 'resistance', 'resistência', 'power', 'potência',
      'electrons', 'elétrons', 'charge', 'carga'
    ],
    steps: [
      'Geração de corrente elétrica',
      'Condução através de materiais',
      'Resistência elétrica',
      'Lei de Ohm',
      'Potência elétrica',
      'Circuitos elétricos'
    ],
    categories: ['physics'],
    difficulty: 'medio',
    ageRange: '14-18',
    relatedProcesses: ['magnetismo', 'energia']
  }
};

// Função para buscar imagens específicas de um processo
async function searchProcessImages(processName: string, level: string, limit: number) {
  const processInfo =
    EDUCATIONAL_PROCESSES_DETAILED[processName.toLowerCase() as keyof typeof EDUCATIONAL_PROCESSES_DETAILED];
  
  if (!processInfo) {
    throw new Error(`Processo '${process}' não encontrado`);
  }
  
  // Construir queries específicas para o processo
  const queries = [
    `${processInfo.name} ${level}`,
    ...processInfo.keywords.slice(0, 3),
    `${processInfo.name} diagram`,
    `${processInfo.name} illustration`
  ];
  
  const allImages: any[] = [];
  
  // Buscar para cada query
  for (const query of queries) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/illustrations/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          category: processInfo.categories[0],
          process: processName,
          limit: Math.ceil(limit / queries.length)
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          allImages.push(...data.data);
        }
      }
    } catch (error) {
      console.warn(`Failed to search for query "${query}":`, error);
    }
  }
  
  // Remover duplicatas e limitar resultados
  const uniqueImages = allImages.filter((image, index, self) => 
    index === self.findIndex(i => i.id === image.id)
  );
  
  return uniqueImages.slice(0, limit);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ProcessSearchSchema.parse(body);
    
    const { process, level, language, limit, includeSteps, includeDiagrams } = validatedData;
    
    console.log(`🔬 [PROCESS] Searching for: ${process} (level: ${level})`);
    
    // Obter informações do processo
    const processInfo = EDUCATIONAL_PROCESSES_DETAILED[process.toLowerCase() as keyof typeof EDUCATIONAL_PROCESSES_DETAILED];
    
    if (!processInfo) {
      return NextResponse.json({
        success: false,
        error: `Processo '${process}' não encontrado`,
        availableProcesses: Object.keys(EDUCATIONAL_PROCESSES_DETAILED),
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }
    
    // Buscar imagens específicas do processo
    const images = await searchProcessImages(process, level, limit);
    
    // Construir resposta
    const response: any = {
      success: true,
      process: {
        id: process,
        name: processInfo.name,
        description: processInfo.description,
        categories: processInfo.categories,
        difficulty: processInfo.difficulty,
        ageRange: processInfo.ageRange,
        relatedProcesses: processInfo.relatedProcesses
      },
      images: images.map(image => ({
        ...image,
        processRelevance: calculateProcessRelevance(image, processInfo),
        educationalLevel: level
      })),
      metadata: {
        totalImages: images.length,
        requestedLimit: limit,
        level,
        language,
        includeSteps,
        includeDiagrams
      }
    };
    
    // Incluir passos se solicitado
    if (includeSteps) {
      response.process.steps = processInfo.steps;
    }
    
    // Incluir diagramas específicos se solicitado
    if (includeDiagrams) {
      response.diagrams = await getProcessDiagrams(process, level);
    }
    
    console.log(`✅ [PROCESS] Found ${images.length} images for ${process}`);
    
    return NextResponse.json({
      ...response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ [PROCESS] Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Dados de entrada inválidos',
        details: error.errors,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Função para calcular relevância específica do processo
function calculateProcessRelevance(image: any, processInfo: any): number {
  let relevance = 0.3; // Base relevance
  
  const description = (image.description || '').toLowerCase();
  const tags = (image.tags || []).join(' ').toLowerCase();
  const searchText = `${description} ${tags}`;
  
  // Verificar keywords do processo
  processInfo.keywords.forEach((keyword: string) => {
    if (searchText.includes(keyword.toLowerCase())) {
      relevance += 0.1;
    }
  });
  
  // Verificar se é um diagrama ou ilustração educacional
  const educationalTerms = ['diagram', 'illustration', 'educational', 'science', 'biology', 'chemistry', 'physics'];
  educationalTerms.forEach(term => {
    if (searchText.includes(term)) {
      relevance += 0.05;
    }
  });
  
  return Math.min(relevance, 1.0);
}

// Função para obter diagramas específicos do processo
async function getProcessDiagrams(process: string, level: string): Promise<any[]> {
  // Esta função pode ser expandida para buscar diagramas específicos
  // de bancos de dados educacionais ou gerar diagramas automaticamente
  
  const diagramTemplates = {
    'fotossintese': [
      {
        type: 'flowchart',
        title: 'Fluxo da Fotossíntese',
        description: 'Diagrama mostrando as etapas da fotossíntese',
        elements: ['Luz Solar', 'Clorofila', 'H2O', 'CO2', 'Glicose', 'O2']
      },
      {
        type: 'cycle',
        title: 'Ciclo de Calvin',
        description: 'Representação do ciclo de Calvin',
        elements: ['RuBP', 'PGA', 'G3P', 'ATP', 'NADPH']
      }
    ],
    'respiração-celular': [
      {
        type: 'flowchart',
        title: 'Etapas da Respiração Celular',
        description: 'Fluxo das etapas da respiração celular',
        elements: ['Glicose', 'Glicólise', 'Acetil-CoA', 'Ciclo de Krebs', 'ATP']
      }
    ]
  };
  
  return diagramTemplates[process.toLowerCase() as keyof typeof diagramTemplates] || [];
}

// Endpoint GET para listar processos disponíveis
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  
  if (action === 'list') {
    const processes = Object.entries(EDUCATIONAL_PROCESSES_DETAILED).map(([id, info]) => ({
      id,
      name: info.name,
      description: info.description,
      categories: info.categories,
      difficulty: info.difficulty,
      ageRange: info.ageRange,
      keywords: info.keywords.slice(0, 5), // Primeiros 5 keywords
      relatedProcesses: info.relatedProcesses
    }));
    
    return NextResponse.json({
      success: true,
      data: processes,
      total: processes.length,
      timestamp: new Date().toISOString()
    });
  }
  
  if (action === 'categories') {
    const categories = Array.from(new Set(
      Object.values(EDUCATIONAL_PROCESSES_DETAILED)
        .flatMap(process => process.categories)
    )).map(category => ({
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1),
      processes: Object.entries(EDUCATIONAL_PROCESSES_DETAILED)
        .filter(([_, info]) => info.categories.includes(category))
        .map(([id, info]) => ({ id, name: info.name }))
    }));
    
    return NextResponse.json({
      success: true,
      data: categories,
      timestamp: new Date().toISOString()
    });
  }
  
  return NextResponse.json({
    success: true,
    message: 'API de Processos Educacionais',
    endpoints: {
      'POST /api/illustrations/processes': 'Buscar imagens de processo específico',
      'GET /api/illustrations/processes?action=list': 'Listar todos os processos',
      'GET /api/illustrations/processes?action=categories': 'Listar processos por categoria'
    },
    timestamp: new Date().toISOString()
  });
}
