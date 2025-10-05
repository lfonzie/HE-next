// Sistema genérico de análise de relevância de imagens para qualquer tópico
// Este arquivo contém funções para detectar imagens relevantes e irrelevantes de forma genérica

// Função para análise genérica de relevância de temas
export function analyzeTopicRelevance(query: string, text: string): {
  isRelevant: boolean;
  hasFalsePositive: boolean;
  falsePositiveReason?: string;
  category?: string;
} {
  // Detectar categoria do tema baseado na query
  const themeCategory = detectThemeCategory(query);
  
  // Obter termos relevantes e falsos positivos para a categoria
  const categoryTerms = getCategoryTerms(themeCategory);
  
  // Verificar relevância
  const hasRelevantTerms = categoryTerms.relevant.some(term => text.includes(term));
  const hasFalsePositiveTerms = categoryTerms.falsePositives.some(term => text.includes(term));
  
  // Se tem falsos positivos mas não tem termos relevantes, é irrelevante
  if (hasFalsePositiveTerms && !hasRelevantTerms) {
    return {
      isRelevant: false,
      hasFalsePositive: true,
      falsePositiveReason: `contexto ${themeCategory.falsePositiveType}`,
      category: themeCategory.name
    };
  }
  
  // Se não tem termos relevantes, é irrelevante
  if (!hasRelevantTerms) {
    return {
      isRelevant: false,
      hasFalsePositive: false,
      category: themeCategory.name
    };
  }
  
  return {
    isRelevant: true,
    hasFalsePositive: false,
    category: themeCategory.name
  };
}

// Função para detectar categoria do tema
export function detectThemeCategory(query: string): {
  name: string;
  falsePositiveType: string;
} {
  // Detectar temas históricos/sensíveis primeiro
  if (isHistoricalTopic(query)) {
    return {
      name: 'historical',
      falsePositiveType: 'histórico irrelevante'
    };
  }
  // Gravidade específica (prioridade máxima)
  if (query.includes('gravidade') || query.includes('gravity') ||
      query.includes('gravitational') || query.includes('gravitacional') ||
      query.includes('mass') || query.includes('massa') ||
      query.includes('weight') || query.includes('peso') ||
      query.includes('attraction') || query.includes('atração') ||
      query.includes('celestial') || query.includes('celestial bodies')) {
    return { name: 'gravity', falsePositiveType: 'genérico/não-físico' };
  }
  
  // Astronomia e espaço
  if (query.includes('sistema solar') || query.includes('solar system') || 
      query.includes('planeta') || query.includes('planet') ||
      query.includes('astronomia') || query.includes('astronomy') ||
      query.includes('espaço') || query.includes('space') ||
      query.includes('galáxia') || query.includes('galaxy') ||
      query.includes('estrela') || query.includes('star')) {
    return { name: 'astronomy', falsePositiveType: 'geográfico/turístico' };
  }
  
  // Medicina e saúde
  if (query.includes('vacinação') || query.includes('vaccination') || 
      query.includes('vacina') || query.includes('vaccine') ||
      query.includes('medicina') || query.includes('medicine') ||
      query.includes('saúde') || query.includes('health') ||
      query.includes('hospital') || query.includes('clínica') || query.includes('clinic')) {
    return { name: 'medicine', falsePositiveType: 'genérico/não-médico' };
  }
  
  // Meio ambiente e clima
  if (query.includes('aquecimento') || query.includes('global') || 
      query.includes('climate') || query.includes('warming') ||
      query.includes('meio ambiente') || query.includes('environment') ||
      query.includes('poluição') || query.includes('pollution') ||
      query.includes('sustentabilidade') || query.includes('sustainability')) {
    return { name: 'environment', falsePositiveType: 'tecnológico/genérico' };
  }
  
  // História
  if (query.includes('história') || query.includes('history') ||
      query.includes('histórico') || query.includes('historical') ||
      query.includes('antigo') || query.includes('ancient') ||
      query.includes('medieval') || query.includes('renascimento') || query.includes('renaissance')) {
    return { name: 'history', falsePositiveType: 'moderno/contemporâneo' };
  }
  
  // Geografia
  if (query.includes('geografia') || query.includes('geography') ||
      query.includes('país') || query.includes('country') ||
      query.includes('continente') || query.includes('continent') ||
      query.includes('capital') || query.includes('região') || query.includes('region')) {
    return { name: 'geography', falsePositiveType: 'genérico/não-geográfico' };
  }
  
  // Matemática
  if (query.includes('matemática') || query.includes('mathematics') ||
      query.includes('matematica') || query.includes('math') ||
      query.includes('cálculo') || query.includes('calculation') ||
      query.includes('equação') || query.includes('equation') ||
      query.includes('geometria') || query.includes('geometry')) {
    return { name: 'mathematics', falsePositiveType: 'genérico/não-matemático' };
  }
  
  // Física
  if (query.includes('física') || query.includes('physics') ||
      query.includes('fisica') || query.includes('energia') || query.includes('energy') ||
      query.includes('força') || query.includes('force') ||
      query.includes('movimento') || query.includes('motion') ||
      query.includes('gravidade') || query.includes('gravity') ||
      query.includes('gravitational') || query.includes('mass') || query.includes('massa') ||
      query.includes('weight') || query.includes('peso') ||
      query.includes('attraction') || query.includes('atração') ||
      query.includes('celestial') || query.includes('celestial bodies')) {
    return { name: 'physics', falsePositiveType: 'genérico/não-físico' };
  }
  
  // Química
  if (query.includes('química') || query.includes('chemistry') ||
      query.includes('quimica') || query.includes('molécula') || query.includes('molecule') ||
      query.includes('átomo') || query.includes('atom') ||
      query.includes('reação') || query.includes('reaction')) {
    return { name: 'chemistry', falsePositiveType: 'genérico/não-químico' };
  }
  
  // Biologia
  if (query.includes('biologia') || query.includes('biology') ||
      query.includes('célula') || query.includes('cell') ||
      query.includes('dna') || query.includes('genética') || query.includes('genetics') ||
      query.includes('evolução') || query.includes('evolution')) {
    return { name: 'biology', falsePositiveType: 'genérico/não-biológico' };
  }
  
  // Literatura
  if (query.includes('literatura') || query.includes('literature') ||
      query.includes('livro') || query.includes('book') ||
      query.includes('poesia') || query.includes('poetry') ||
      query.includes('romance') || query.includes('novel')) {
    return { name: 'literature', falsePositiveType: 'genérico/não-literário' };
  }
  
  // Tecnologia
  if (query.includes('tecnologia') || query.includes('technology') ||
      query.includes('computador') || query.includes('computer') ||
      query.includes('programação') || query.includes('programming') ||
      query.includes('software') || query.includes('hardware')) {
    return { name: 'technology', falsePositiveType: 'genérico/não-tecnológico' };
  }
  
  // Arte
  if (query.includes('arte') || query.includes('art') ||
      query.includes('pintura') || query.includes('painting') ||
      query.includes('escultura') || query.includes('sculpture') ||
      query.includes('música') || query.includes('music')) {
    return { name: 'art', falsePositiveType: 'genérico/não-artístico' };
  }
  
  // Anatomia e neurologia
  if (query.includes('cérebro') || query.includes('brain') ||
      query.includes('neurônio') || query.includes('neuron') ||
      query.includes('anatomia') || query.includes('anatomy') ||
      query.includes('sistema nervoso') || query.includes('nervous system') ||
      query.includes('medula') || query.includes('spinal cord') ||
      query.includes('córtex') || query.includes('cortex') ||
      query.includes('sinapse') || query.includes('synapse') ||
      query.includes('neurotransmissor') || query.includes('neurotransmitter')) {
    return { name: 'anatomy', falsePositiveType: 'genérico/não-anatômico' };
  }
  
  // Educação geral
  if (query.includes('educação') || query.includes('education') ||
      query.includes('escola') || query.includes('school') ||
      query.includes('aprender') || query.includes('learning') ||
      query.includes('estudar') || query.includes('study')) {
    return { name: 'education', falsePositiveType: 'genérico/não-educacional' };
  }
  
  // Biologia e plantas
  if (query.includes('plant') || query.includes('planta') ||
      query.includes('leaf') || query.includes('folha') ||
      query.includes('tree') || query.includes('árvore') ||
      query.includes('flower') || query.includes('flor') ||
      query.includes('photosynthesis') || query.includes('fotossíntese') ||
      query.includes('green') || query.includes('verde') ||
      query.includes('nature') || query.includes('natureza')) {
    return { name: 'biology', falsePositiveType: 'genérico/não-biológico' };
  }
  
  // Temas históricos/sensíveis
  if (isHistoricalTopic(query)) {
    return { name: 'historical', falsePositiveType: 'histórico irrelevante' };
  }
  
  // Categoria genérica para temas não identificados
  return { name: 'general', falsePositiveType: 'genérico' };
}

// Função para detectar temas históricos
function isHistoricalTopic(query: string): boolean {
  const historicalKeywords = [
    'war', 'guerra', 'world war', 'segunda guerra', 'primeira guerra',
    'holocaust', 'genocide', 'genocídio', 'nazi', 'hitler', 'stalin',
    'battle', 'batalha', 'conflict', 'conflito', 'military', 'militar',
    'revolution', 'revolução', 'civil war', 'guerra civil',
    'crusade', 'cruzada', 'invasion', 'invasão', 'occupation', 'ocupação',
    'history', 'história', 'historical', 'histórico', 'ancient', 'antigo',
    'medieval', 'medieval', 'renaissance', 'renascimento'
  ];
  
  return historicalKeywords.some(keyword => query.toLowerCase().includes(keyword));
}

// Função para obter termos relevantes e falsos positivos por categoria
export function getCategoryTerms(category: { name: string; falsePositiveType: string }): {
  relevant: string[];
  falsePositives: string[];
} {
  const categoryTerms: Record<string, { relevant: string[]; falsePositives: string[] }> = {
    gravity: {
      relevant: [
        'gravity', 'gravidade', 'gravitational', 'gravitacional', 'mass', 'massa', 'weight', 'peso',
        'attraction', 'atração', 'celestial', 'celestial bodies', 'planets', 'planetas',
        'newton', 'einstein', 'space', 'espaço', 'universe', 'universo', 'cosmos', 'cosmos',
        'orbit', 'órbita', 'orbital', 'orbital', 'falling', 'queda', 'acceleration', 'aceleração',
        'physics', 'física', 'force', 'força', 'motion', 'movimento', 'energy', 'energia',
        'physics diagram', 'diagrama de física', 'scientific illustration', 'ilustração científica',
        'physics concept', 'conceito de física', 'physical law', 'lei física',
        'gravitational field', 'campo gravitacional', 'gravitational pull', 'atração gravitacional',
        'earth', 'terra', 'moon', 'lua', 'sun', 'sol', 'solar system', 'sistema solar',
        'black hole', 'buraco negro', 'spacetime', 'espaço-tempo', 'relativity', 'relatividade'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'technology', 'tecnologia', 'computer', 'computador', 'laptop', 'notebook', 'internet',
        'library', 'biblioteca', 'books', 'livros', 'education', 'educação', 'learning', 'aprendizado',
        'school', 'escola', 'classroom', 'sala de aula', 'student', 'estudante', 'teacher', 'professor',
        'water', 'água', 'drop', 'gota', 'splash', 'salpico', 'liquid', 'líquido', 'wet', 'molhado',
        'lake', 'lago', 'como', 'italy', 'italian', 'italiano', 'landscape', 'paisagem', 'mountain', 'montanha',
        'nature', 'natureza', 'forest', 'floresta', 'city', 'cidade', 'building', 'edifício',
        'architecture', 'arquitetura', 'travel', 'viagem', 'vacation', 'férias', 'tourism', 'turismo',
        'hotel', 'restaurant', 'restaurante', 'swan', 'cisne', 'moonlight', 'luar', 'villa', 'vila'
      ]
    },
    astronomy: {
      relevant: [
        'solar system', 'sistema solar', 'planet', 'planeta', 'sun', 'sol', 'moon', 'lua',
        'mars', 'marte', 'earth', 'terra', 'jupiter', 'saturn', 'saturno', 'venus', 'vênus',
        'mercury', 'mercúrio', 'neptune', 'netuno', 'uranus', 'urano', 'pluto', 'plutão',
        'asteroid', 'asteroide', 'comet', 'cometa', 'galaxy', 'galáxia', 'star', 'estrela',
        'orbit', 'órbita', 'space', 'espaço', 'astronomy', 'astronomia', 'cosmos', 'universo',
        'universe', 'nebula', 'nebulosa', 'constellation', 'constelação', 'telescope', 'telescópio',
        'satellite', 'satélite', 'spacecraft', 'nave espacial', 'rocket', 'foguete', 'nasa',
        'solar', 'solar wind', 'vento solar', 'eclipse', 'eclípse', 'meteor', 'meteoro'
      ],
      falsePositives: [
        'lake como', 'como italy', 'como lake', 'varenna', 'italy', 'italian', 'italiano',
        'landscape', 'paisagem', 'mountain', 'montanha', 'nature', 'natureza', 'forest', 'floresta',
        'city', 'cidade', 'building', 'edifício', 'architecture', 'arquitetura', 'travel', 'viagem',
        'vacation', 'férias', 'tourism', 'turismo', 'hotel', 'restaurant', 'restaurante',
        'swan', 'cisne', 'moonlight', 'luar', 'lake', 'lago', 'villa', 'vila', 'ballaster'
      ]
    },
    medicine: {
      relevant: [
        'vaccine', 'vaccination', 'vacina', 'vacinação', 'injection', 'injeção', 'syringe', 'seringa',
        'medical', 'médico', 'healthcare', 'saúde', 'doctor', 'médico', 'nurse', 'enfermeiro',
        'clinic', 'clínica', 'hospital', 'immunization', 'imunização', 'prevention', 'prevenção',
        'certificate', 'certificado', 'card', 'cartão', 'patient', 'paciente', 'treatment', 'tratamento',
        'medicine', 'medicamento', 'pharmaceutical', 'farmacêutico', 'surgery', 'cirurgia'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'clothing', 'roupa', 'fashion', 'moda', 'beauty', 'beleza', 'lifestyle', 'estilo de vida',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião'
      ]
    },
    environment: {
      relevant: [
        'climate', 'clima', 'global warming', 'aquecimento global', 'greenhouse', 'efeito estufa',
        'carbon', 'carbono', 'emission', 'emissão', 'temperature', 'temperatura', 'ice', 'gelo',
        'glacier', 'geleira', 'polar', 'polar', 'arctic', 'ártico', 'antarctic', 'antártico',
        'sea level', 'nível do mar', 'ocean', 'oceano', 'environment', 'meio ambiente',
        'pollution', 'poluição', 'fossil fuel', 'combustível fóssil', 'renewable', 'renovável',
        'solar', 'solar', 'wind', 'vento', 'deforestation', 'desmatamento', 'ecosystem', 'ecossistema',
        'biodiversity', 'biodiversidade', 'sustainability', 'sustentabilidade', 'co2'
      ],
      falsePositives: [
        'laptop', 'computador', 'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'work', 'trabalho',
        'office', 'escritório', 'business', 'negócio', 'technology', 'tecnologia', 'internet', 'digital'
      ]
    },
    history: {
      relevant: [
        'history', 'história', 'historical', 'histórico', 'ancient', 'antigo', 'medieval', 'medieval',
        'renaissance', 'renascimento', 'revolution', 'revolução', 'war', 'guerra', 'civilization', 'civilização',
        'empire', 'império', 'kingdom', 'reino', 'dynasty', 'dinastia', 'monument', 'monumento',
        'archaeological', 'arqueológico', 'artifact', 'artefato', 'museum', 'museu', 'heritage', 'patrimônio'
      ],
      falsePositives: [
        'modern', 'moderno', 'contemporary', 'contemporâneo', 'technology', 'tecnologia', 'computer', 'computador',
        'smartphone', 'celular', 'internet', 'digital', 'social media', 'rede social', 'app', 'aplicativo'
      ]
    },
    historical: {
      relevant: [
        // Documentos históricos
        'document', 'documento', 'archive', 'arquivo', 'manuscript', 'manuscrito',
        'letter', 'carta', 'treaty', 'tratado', 'declaration', 'declaração',
        'newspaper', 'jornal', 'report', 'relatório', 'record', 'registro',
        
        // Mapas e geografia histórica
        'map', 'mapa', 'territory', 'território', 'border', 'fronteira',
        'region', 'região', 'country', 'país', 'nation', 'nação',
        'geography', 'geografia', 'historical map', 'mapa histórico',
        
        // Figuras históricas (sem conteúdo inadequado)
        'leader', 'líder', 'politician', 'político', 'commander', 'comandante',
        'general', 'general', 'president', 'presidente', 'minister', 'ministro',
        'historical figure', 'figura histórica', 'portrait', 'retrato',
        
        // Eventos históricos
        'conference', 'conferência', 'meeting', 'reunião', 'summit', 'cúpula',
        'ceremony', 'cerimônia', 'event', 'evento', 'occasion', 'ocasião',
        'historical event', 'evento histórico', 'milestone', 'marco',
        
        // Tecnologia histórica
        'weapon', 'arma', 'tank', 'tanque', 'aircraft', 'aeronave', 'ship', 'navio',
        'uniform', 'uniforme', 'equipment', 'equipamento', 'vehicle', 'veículo',
        'military equipment', 'equipamento militar', 'historical technology', 'tecnologia histórica',
        
        // Arquitetura e locais históricos
        'building', 'edifício', 'monument', 'monumento', 'memorial', 'memorial',
        'museum', 'museu', 'library', 'biblioteca', 'archive', 'arquivo',
        'historical building', 'edifício histórico', 'landmark', 'marco',
        
        // Termos educacionais históricos
        'educational', 'educacional', 'learning', 'aprendizado', 'teaching', 'ensino',
        'study', 'estudo', 'research', 'pesquisa', 'academic', 'acadêmico',
        'history', 'história', 'historical', 'histórico', 'educational history', 'história educacional'
      ],
      falsePositives: [
        // Conteúdo violento ou gráfico
        'blood', 'sangue', 'corpse', 'cadáver', 'death', 'morte', 'killing', 'matando',
        'execution', 'execução', 'torture', 'tortura', 'massacre', 'massacre',
        'bombing', 'bombardeio', 'destruction', 'destruição', 'ruins', 'ruínas',
        
        // Conteúdo político controverso
        'propaganda', 'propaganda', 'hate', 'ódio', 'racist', 'racista',
        'supremacist', 'supremacista', 'extremist', 'extremista',
        
        // Conteúdo inadequado para educação
        'adult', 'adulto', 'sexy', 'sensual', 'nude', 'nu', 'explicit', 'explícito',
        
        // Conteúdo irrelevante ao tema histórico
        'modern', 'moderno', 'contemporary', 'contemporâneo', 'current', 'atual',
        'today', 'hoje', 'now', 'agora', 'recent', 'recente',
        
        // Arte abstrata ou genérica
        'abstract', 'abstrato', 'art', 'arte', 'painting', 'pintura', 'drawing', 'desenho',
        'illustration', 'ilustração', 'cartoon', 'desenho animado', 'comic', 'quadrinho',
        
        // Conteúdo comercial ou não educacional
        'advertisement', 'anúncio', 'commercial', 'comercial', 'marketing', 'marketing',
        'product', 'produto', 'sale', 'venda', 'buy', 'comprar', 'shop', 'loja',
        
        // Conteúdo genérico não histórico
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo',
        'casual', 'casual', 'business', 'negócio', 'office', 'escritório', 'work', 'trabalho',
        'technology', 'tecnologia', 'computer', 'computador', 'laptop', 'notebook',
        'library', 'biblioteca', 'books', 'livros', 'education', 'educação', 'learning', 'aprendizado',
        'school', 'escola', 'classroom', 'sala de aula', 'student', 'estudante', 'teacher', 'professor'
      ]
    },
    geography: {
      relevant: [
        'geography', 'geografia', 'country', 'país', 'continent', 'continente', 'capital', 'capital',
        'region', 'região', 'landscape', 'paisagem', 'terrain', 'terreno', 'climate', 'clima',
        'population', 'população', 'culture', 'cultura', 'language', 'idioma', 'currency', 'moeda',
        'border', 'fronteira', 'mountain', 'montanha', 'river', 'rio', 'lake', 'lago', 'ocean', 'oceano'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'technology', 'tecnologia', 'computer', 'computador', 'laptop', 'notebook'
      ]
    },
    mathematics: {
      relevant: [
        'mathematics', 'matemática', 'math', 'cálculo', 'calculation', 'equation', 'equação',
        'formula', 'fórmula', 'geometry', 'geometria', 'algebra', 'álgebra', 'calculus', 'cálculo',
        'statistics', 'estatística', 'probability', 'probabilidade', 'number', 'número',
        'graph', 'gráfico', 'chart', 'gráfico', 'function', 'função', 'variable', 'variável'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'technology', 'tecnologia', 'computer', 'computador', 'laptop', 'notebook', 'internet'
      ]
    },
    physics: {
      relevant: [
        'physics', 'física', 'energy', 'energia', 'force', 'força', 'motion', 'movimento',
        'wave', 'onda', 'particle', 'partícula', 'quantum', 'quântico', 'relativity', 'relatividade',
        'gravity', 'gravidade', 'gravitational', 'gravitacional', 'mass', 'massa', 'weight', 'peso',
        'attraction', 'atração', 'celestial', 'celestial bodies', 'planets', 'planetas',
        'magnetism', 'magnetismo', 'electricity', 'eletricidade', 'electromagnetic', 'eletromagnético',
        'experiment', 'experimento', 'laboratory', 'laboratório', 'measurement', 'medição',
        'newton', 'einstein', 'space', 'espaço', 'universe', 'universo', 'cosmos', 'cosmos',
        'orbit', 'órbita', 'orbital', 'orbital', 'falling', 'queda', 'acceleration', 'aceleração',
        'physics diagram', 'diagrama de física', 'scientific illustration', 'ilustração científica',
        'physics concept', 'conceito de física', 'physical law', 'lei física'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'technology', 'tecnologia', 'computer', 'computador', 'laptop', 'notebook', 'internet',
        'library', 'biblioteca', 'books', 'livros', 'education', 'educação', 'learning', 'aprendizado',
        'school', 'escola', 'classroom', 'sala de aula', 'student', 'estudante', 'teacher', 'professor'
      ]
    },
    chemistry: {
      relevant: [
        'chemistry', 'química', 'molecule', 'molécula', 'atom', 'átomo', 'reaction', 'reação',
        'compound', 'composto', 'element', 'elemento', 'periodic table', 'tabela periódica',
        'laboratory', 'laboratório', 'experiment', 'experimento', 'chemical', 'químico',
        'bond', 'ligação', 'ion', 'íon', 'crystal', 'cristal', 'solution', 'solução'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'technology', 'tecnologia', 'computer', 'computador', 'laptop', 'notebook', 'internet'
      ]
    },
    biology: {
      relevant: [
        'biology', 'biologia', 'cell', 'célula', 'dna', 'genetics', 'genética', 'evolution', 'evolução',
        'organism', 'organismo', 'ecosystem', 'ecossistema', 'species', 'espécie', 'habitat', 'habitat',
        'microscope', 'microscópio', 'laboratory', 'laboratório', 'research', 'pesquisa',
        'protein', 'proteína', 'gene', 'gene', 'chromosome', 'cromossomo', 'mutation', 'mutação',
        'plant', 'planta', 'leaf', 'folha', 'tree', 'árvore', 'flower', 'flor', 'green', 'verde',
        'photosynthesis', 'fotossíntese', 'chlorophyll', 'clorofila', 'nature', 'natureza',
        'botany', 'botânica', 'vegetation', 'vegetação', 'forest', 'floresta', 'garden', 'jardim'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'technology', 'tecnologia', 'computer', 'computador', 'laptop', 'notebook', 'internet'
      ]
    },
    literature: {
      relevant: [
        'literature', 'literatura', 'book', 'livro', 'poetry', 'poesia', 'novel', 'romance',
        'author', 'autor', 'writer', 'escritor', 'poem', 'poema', 'story', 'história',
        'character', 'personagem', 'plot', 'enredo', 'theme', 'tema', 'genre', 'gênero',
        'classic', 'clássico', 'contemporary', 'contemporâneo', 'fiction', 'ficção'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'technology', 'tecnologia', 'computer', 'computador', 'laptop', 'notebook', 'internet'
      ]
    },
    technology: {
      relevant: [
        'technology', 'tecnologia', 'computer', 'computador', 'programming', 'programação',
        'software', 'hardware', 'algorithm', 'algoritmo', 'code', 'código', 'data', 'dados',
        'network', 'rede', 'internet', 'artificial intelligence', 'inteligência artificial',
        'machine learning', 'aprendizado de máquina', 'database', 'banco de dados', 'server', 'servidor'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'lifestyle', 'estilo de vida', 'fashion', 'moda', 'beauty', 'beleza'
      ]
    },
    art: {
      relevant: [
        'art', 'arte', 'painting', 'pintura', 'sculpture', 'escultura', 'music', 'música',
        'artist', 'artista', 'museum', 'museu', 'gallery', 'galeria', 'exhibition', 'exposição',
        'creative', 'criativo', 'aesthetic', 'estético', 'design', 'design', 'color', 'cor',
        'brush', 'pincel', 'canvas', 'tela', 'palette', 'paleta', 'technique', 'técnica'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'technology', 'tecnologia', 'computer', 'computador', 'laptop', 'notebook', 'internet'
      ]
    },
    anatomy: {
      relevant: [
        'brain', 'cérebro', 'neuron', 'neurônio', 'neural', 'neural', 'nervous system', 'sistema nervoso',
        'anatomy', 'anatomia', 'cortex', 'córtex', 'cerebral', 'cerebral', 'synapse', 'sinapse',
        'neurotransmitter', 'neurotransmissor', 'spinal cord', 'medula', 'cerebellum', 'cerebelo',
        'hippocampus', 'hipocampo', 'amygdala', 'amígdala', 'frontal lobe', 'lobo frontal',
        'temporal lobe', 'lobo temporal', 'parietal lobe', 'lobo parietal', 'occipital lobe', 'lobo occipital',
        'brainstem', 'tronco cerebral', 'thalamus', 'tálamo', 'hypothalamus', 'hipotálamo',
        'gray matter', 'matéria cinzenta', 'white matter', 'matéria branca', 'dendrite', 'dendrito',
        'axon', 'axônio', 'myelin', 'mielina', 'glial cell', 'célula glial', 'neuroglia', 'neuroglia',
        'brain scan', 'tomografia cerebral', 'mri', 'ressonância magnética', 'ct scan', 'tomografia',
        'neurological', 'neurológico', 'cognitive', 'cognitivo', 'memory', 'memória', 'learning', 'aprendizado'
      ],
      falsePositives: [
        'coronavirus', 'covid', 'virus', 'vírus', 'disease', 'doença', 'infection', 'infecção',
        'symptoms', 'sintomas', 'medical', 'médico', 'hospital', 'clinic', 'clínica', 'doctor', 'médico',
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'technology', 'tecnologia', 'computer', 'computador', 'laptop', 'notebook', 'internet',
        'lake como', 'como italy', 'como lake', 'varenna', 'italy', 'italian', 'italiano',
        'landscape', 'paisagem', 'mountain', 'montanha', 'nature', 'natureza', 'forest', 'floresta',
        'city', 'cidade', 'building', 'edifício', 'architecture', 'arquitetura', 'travel', 'viagem',
        'vacation', 'férias', 'tourism', 'turismo', 'hotel', 'restaurant', 'restaurante',
        'swan', 'cisne', 'moonlight', 'luar', 'lake', 'lago', 'villa', 'vila', 'ballaster'
      ]
    },
    education: {
      relevant: [
        'education', 'educação', 'school', 'escola', 'learning', 'aprendizado', 'study', 'estudo',
        'teacher', 'professor', 'student', 'estudante', 'classroom', 'sala de aula', 'university', 'universidade',
        'knowledge', 'conhecimento', 'teaching', 'ensino', 'academic', 'acadêmico', 'curriculum', 'currículo',
        'lesson', 'lição', 'course', 'curso', 'training', 'treinamento', 'skill', 'habilidade'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'technology', 'tecnologia', 'computer', 'computador', 'laptop', 'notebook', 'internet'
      ]
    },
    general: {
      relevant: [
        'general', 'geral', 'common', 'comum', 'basic', 'básico', 'simple', 'simples',
        'basic concept', 'conceito básico', 'fundamental', 'fundamental', 'essential', 'essencial'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'technology', 'tecnologia', 'computer', 'computador', 'laptop', 'notebook', 'internet',
        'lifestyle', 'estilo de vida', 'fashion', 'moda', 'beauty', 'beleza'
      ]
    }
  };
  
  return categoryTerms[category.name] || categoryTerms.general;
}
