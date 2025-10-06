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
  
  // Música (prioridade alta para temas musicais específicos)
  if (query.includes('metallica') || query.includes('band') || query.includes('banda') ||
      query.includes('concert') || query.includes('concerto') || query.includes('guitar') ||
      query.includes('guitarra') || query.includes('rock') || query.includes('metal') ||
      query.includes('heavy metal') || query.includes('thrash metal') || query.includes('music') ||
      query.includes('música') || query.includes('musician') || query.includes('músico') ||
      query.includes('singer') || query.includes('cantor') || query.includes('vocalist') ||
      query.includes('drummer') || query.includes('baterista') || query.includes('bassist') ||
      query.includes('baixista') || query.includes('album') || query.includes('álbum') ||
      query.includes('song') || query.includes('música') || query.includes('lyrics') ||
      query.includes('letra') || query.includes('stage') || query.includes('palco') ||
      query.includes('performance') || query.includes('apresentação')) {
    return { name: 'music', falsePositiveType: 'genérico/não-musical' };
  }
  
  // Arte
  if (query.includes('arte') || query.includes('art') ||
      query.includes('pintura') || query.includes('painting') ||
      query.includes('escultura') || query.includes('sculpture')) {
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
  
  // Revolução Francesa específica (prioridade alta)
  if (query.includes('revolução francesa') || query.includes('french revolution') ||
      query.includes('causas da revolução francesa') || query.includes('causes of the french revolution') ||
      query.includes('revolução francesa causas') || query.includes('french revolution causes')) {
    return { name: 'french_revolution', falsePositiveType: 'histórico irrelevante' };
  }
  
  // Temas históricos/sensíveis
  if (isHistoricalTopic(query)) {
    return { name: 'historical', falsePositiveType: 'histórico irrelevante' };
  }
  
  // Para temas não identificados, usar análise semântica inteligente
  return detectGenericThemeCategory(query);
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

// Função para detectar categoria genérica usando análise semântica inteligente
function detectGenericThemeCategory(query: string): {
  name: string;
  falsePositiveType: string;
} {
  const queryLower = query.toLowerCase().trim();
  
  // Análise semântica básica para detectar categoria
  const semanticAnalysis = analyzeQuerySemantics(queryLower);
  
  return {
    name: semanticAnalysis.category,
    falsePositiveType: semanticAnalysis.falsePositiveType
  };
}

// Função para análise semântica inteligente de qualquer query
function analyzeQuerySemantics(query: string): {
  category: string;
  falsePositiveType: string;
} {
  // Detectar padrões semânticos comuns
  const patterns = [
    // Ciências naturais
    { pattern: /\b(ciência|science|científico|scientific|pesquisa|research|experimento|experiment|laboratório|laboratory)\b/, category: 'science', falsePositiveType: 'genérico/não-científico' },
    
    // Tecnologia e inovação
    { pattern: /\b(tecnologia|technology|digital|software|hardware|programação|programming|algoritmo|algorithm|dados|data)\b/, category: 'technology', falsePositiveType: 'genérico/não-tecnológico' },
    
    // Arte e cultura
    { pattern: /\b(arte|art|cultural|culture|criativo|creative|artístico|artistic|design|música|music|filme|movie|cinema)\b/, category: 'art', falsePositiveType: 'genérico/não-artístico' },
    
    // Educação e aprendizado
    { pattern: /\b(educação|education|aprender|learn|estudar|study|ensinar|teach|professor|teacher|aluno|student|escola|school)\b/, category: 'education', falsePositiveType: 'genérico/não-educacional' },
    
    // Saúde e medicina
    { pattern: /\b(saúde|health|médico|medical|hospital|clínica|clinic|tratamento|treatment|cura|cure|medicina|medicine)\b/, category: 'medicine', falsePositiveType: 'genérico/não-médico' },
    
    // Meio ambiente
    { pattern: /\b(meio ambiente|environment|natureza|nature|ecologia|ecology|sustentabilidade|sustainability|verde|green)\b/, category: 'environment', falsePositiveType: 'genérico/não-ambiental' },
    
    // Negócios e economia
    { pattern: /\b(negócio|business|empresa|company|economia|economy|mercado|market|venda|sale|comércio|commerce)\b/, category: 'business', falsePositiveType: 'genérico/não-comercial' },
    
    // Esportes e atividades físicas
    { pattern: /\b(esporte|sport|futebol|football|basquete|basketball|corrida|running|exercício|exercise|atividade física|physical activity)\b/, category: 'sports', falsePositiveType: 'genérico/não-esportivo' },
    
    // Alimentação e culinária
    { pattern: /\b(comida|food|culinária|cuisine|receita|recipe|cozinha|kitchen|ingrediente|ingredient|chef|cook)\b/, category: 'food', falsePositiveType: 'genérico/não-culinário' },
    
    // Viagem e turismo
    { pattern: /\b(viagem|travel|turismo|tourism|destino|destination|hotel|restaurante|restaurant|passeio|tour)\b/, category: 'travel', falsePositiveType: 'genérico/não-turístico' },
    
    // Moda e estilo
    { pattern: /\b(moda|fashion|roupa|clothing|vestuário|apparel|estilo|style|beleza|beauty|cosmético|cosmetic)\b/, category: 'fashion', falsePositiveType: 'genérico/não-fashion' },
    
    // Animais e pets
    { pattern: /\b(animal|pet|cachorro|dog|gato|cat|pássaro|bird|peixe|fish|veterinário|veterinary)\b/, category: 'animals', falsePositiveType: 'genérico/não-animal' },
    
    // Arquitetura e construção
    { pattern: /\b(arquitetura|architecture|construção|construction|edifício|building|casa|house|projeto|project)\b/, category: 'architecture', falsePositiveType: 'genérico/não-arquitetônico' },
    
    // Psicologia e comportamento
    { pattern: /\b(psicologia|psychology|comportamento|behavior|mente|mind|emoção|emotion|personalidade|personality)\b/, category: 'psychology', falsePositiveType: 'genérico/não-psicológico' },
    
    // Filosofia e ética
    { pattern: /\b(filosofia|philosophy|ética|ethics|moral|moral|valores|values|pensamento|thinking)\b/, category: 'philosophy', falsePositiveType: 'genérico/não-filosófico' }
  ];
  
  // Verificar padrões
  for (const { pattern, category, falsePositiveType } of patterns) {
    if (pattern.test(query)) {
      return { category, falsePositiveType };
    }
  }
  
  // Análise por palavras-chave específicas
  const keywordAnalysis = analyzeByKeywords(query);
  if (keywordAnalysis.category !== 'general') {
    return keywordAnalysis;
  }
  
  // Análise por contexto geral
  const contextAnalysis = analyzeByContext(query);
  
  return contextAnalysis;
}

// Função para análise por palavras-chave específicas
function analyzeByKeywords(query: string): {
  category: string;
  falsePositiveType: string;
} {
  const keywords = query.split(/\s+/);
  
  // Mapeamento de palavras-chave para categorias
  const keywordMap: Record<string, { category: string; falsePositiveType: string }> = {
    // Ciências
    'física': { category: 'physics', falsePositiveType: 'genérico/não-físico' },
    'physics': { category: 'physics', falsePositiveType: 'genérico/não-físico' },
    'química': { category: 'chemistry', falsePositiveType: 'genérico/não-químico' },
    'chemistry': { category: 'chemistry', falsePositiveType: 'genérico/não-químico' },
    'biologia': { category: 'biology', falsePositiveType: 'genérico/não-biológico' },
    'biology': { category: 'biology', falsePositiveType: 'genérico/não-biológico' },
    'matemática': { category: 'mathematics', falsePositiveType: 'genérico/não-matemático' },
    'mathematics': { category: 'mathematics', falsePositiveType: 'genérico/não-matemático' },
    
    // Humanidades
    'história': { category: 'history', falsePositiveType: 'genérico/não-histórico' },
    'history': { category: 'history', falsePositiveType: 'genérico/não-histórico' },
    'geografia': { category: 'geography', falsePositiveType: 'genérico/não-geográfico' },
    'geography': { category: 'geography', falsePositiveType: 'genérico/não-geográfico' },
    'literatura': { category: 'literature', falsePositiveType: 'genérico/não-literário' },
    'literature': { category: 'literature', falsePositiveType: 'genérico/não-literário' },
    
    // Arte e cultura
    'música': { category: 'music', falsePositiveType: 'genérico/não-musical' },
    'music': { category: 'music', falsePositiveType: 'genérico/não-musical' },
    'arte': { category: 'art', falsePositiveType: 'genérico/não-artístico' },
    'art': { category: 'art', falsePositiveType: 'genérico/não-artístico' },
    
    // Tecnologia
    'computador': { category: 'technology', falsePositiveType: 'genérico/não-tecnológico' },
    'computer': { category: 'technology', falsePositiveType: 'genérico/não-tecnológico' },
    'programação': { category: 'technology', falsePositiveType: 'genérico/não-tecnológico' },
    'programming': { category: 'technology', falsePositiveType: 'genérico/não-tecnológico' }
  };
  
  // Verificar palavras-chave
  for (const keyword of keywords) {
    const mapping = keywordMap[keyword.toLowerCase()];
    if (mapping) {
      return mapping;
    }
  }
  
  return { category: 'general', falsePositiveType: 'genérico' };
}

// Função para análise por contexto geral
function analyzeByContext(query: string): {
  category: string;
  falsePositiveType: string;
} {
  // Análise por comprimento e complexidade
  const words = query.split(/\s+/);
  
  // Queries muito específicas tendem a ser científicas ou técnicas
  if (words.length >= 3 && words.some(word => word.length > 8)) {
    return { category: 'science', falsePositiveType: 'genérico/não-científico' };
  }
  
  // Queries com números podem ser matemáticas ou científicas
  if (/\d/.test(query)) {
    return { category: 'mathematics', falsePositiveType: 'genérico/não-matemático' };
  }
  
  // Queries com perguntas tendem a ser educacionais
  if (query.includes('?') || query.includes('como') || query.includes('o que') || query.includes('por que')) {
    return { category: 'education', falsePositiveType: 'genérico/não-educacional' };
  }
  
  // Default para categoria geral
  return { category: 'general', falsePositiveType: 'genérico' };
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
    french_revolution: {
      relevant: [
        // Termos específicos da Revolução Francesa
        'french revolution', 'revolução francesa', 'causes of the french revolution', 'causas da revolução francesa',
        'bastille', 'bastilha', 'louis xvi', 'marie antoinette', 'maria antonieta', 'napoleon', 'napoleão',
        'estates general', 'estados gerais', 'national assembly', 'assembléia nacional',
        'declaration of the rights of man', 'declaração dos direitos do homem',
        'reign of terror', 'reinado do terror', 'guillotine', 'guilhotina',
        'jacobins', 'girondins', 'sans-culottes', 'sans-culottes',
        'liberty equality fraternity', 'liberdade igualdade fraternidade',
        'tricolor', 'tricolor', 'french flag', 'bandeira francesa',
        'versailles', 'versalhes', 'paris', 'paris', 'france', 'frança',
        
        // Documentos históricos específicos
        'document', 'documento', 'archive', 'arquivo', 'manuscript', 'manuscrito',
        'letter', 'carta', 'treaty', 'tratado', 'declaration', 'declaração',
        'newspaper', 'jornal', 'report', 'relatório', 'record', 'registro',
        'historical document', 'documento histórico', 'revolutionary document', 'documento revolucionário',
        
        // Figuras históricas específicas
        'louis xvi', 'marie antoinette', 'maria antonieta', 'napoleon bonaparte', 'napoleão bonaparte',
        'robespierre', 'danton', 'marat', 'lafayette', 'mirabeau',
        'historical figure', 'figura histórica', 'portrait', 'retrato', 'historical portrait', 'retrato histórico',
        
        // Eventos e locais específicos
        'storming of the bastille', 'tomada da bastilha', 'march on versailles', 'marcha para versalhes',
        'tennis court oath', 'juramento da quadra de tênis', 'women\'s march', 'marcha das mulheres',
        'versailles palace', 'palácio de versalhes', 'tuileries palace', 'palácio das tulherias',
        'conciergerie', 'conciergerie', 'temple prison', 'prisão do templo',
        
        // Símbolos e artefatos
        'phrygian cap', 'boné frígio', 'cockade', 'cocar', 'revolutionary symbols', 'símbolos revolucionários',
        'liberty cap', 'boné da liberdade', 'revolutionary flag', 'bandeira revolucionária',
        'french cockade', 'cocar francês', 'revolutionary cockade', 'cocar revolucionário',
        
        // Arte e cultura da época
        'neoclassical', 'neoclássico', 'revolutionary art', 'arte revolucionária',
        'jacques-louis david', 'david', 'revolutionary painting', 'pintura revolucionária',
        'historical painting', 'pintura histórica', 'revolutionary propaganda', 'propaganda revolucionária',
        
        // Termos educacionais específicos
        'educational', 'educacional', 'learning', 'aprendizado', 'teaching', 'ensino',
        'study', 'estudo', 'research', 'pesquisa', 'academic', 'acadêmico',
        'history', 'história', 'historical', 'histórico', 'educational history', 'história educacional',
        'french history', 'história francesa', 'revolutionary history', 'história revolucionária',
        '18th century', 'século xviii', 'eighteenth century', 'século dezoito',
        'ancien régime', 'antigo regime', 'old regime', 'regime antigo'
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
        'school', 'escola', 'classroom', 'sala de aula', 'student', 'estudante', 'teacher', 'professor',
        
        // Conteúdo não relacionado à Revolução Francesa
        'world war', 'segunda guerra', 'primeira guerra', 'nazi', 'hitler', 'stalin',
        'american revolution', 'revolução americana', 'russian revolution', 'revolução russa',
        'industrial revolution', 'revolução industrial', 'scientific revolution', 'revolução científica'
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
    music: {
      relevant: [
        // Termos específicos do Metallica e música em geral
        'metallica', 'band', 'banda', 'rock band', 'heavy metal band', 'thrash metal band',
        'concert', 'concerto', 'live performance', 'apresentação ao vivo', 'show', 'espetáculo',
        'guitar', 'guitarra', 'electric guitar', 'guitarra elétrica', 'guitar solo', 'solo de guitarra',
        'bass', 'baixo', 'bass guitar', 'guitarra baixo', 'drums', 'bateria', 'drum kit', 'kit de bateria',
        'vocals', 'vocais', 'singer', 'cantor', 'vocalist', 'vocalista', 'microphone', 'microfone',
        'stage', 'palco', 'stage setup', 'configuração do palco', 'lighting', 'iluminação',
        'amplifier', 'amplificador', 'speaker', 'alto-falante', 'sound system', 'sistema de som',
        'album', 'álbum', 'cd', 'vinyl', 'vinil', 'record', 'disco', 'music', 'música',
        'song', 'música', 'track', 'faixa', 'lyrics', 'letra', 'melody', 'melodia',
        'rhythm', 'ritmo', 'beat', 'batida', 'tempo', 'tempo', 'chord', 'acorde',
        'musician', 'músico', 'artist', 'artista', 'performer', 'artista', 'entertainer',
        'rock', 'metal', 'heavy metal', 'thrash metal', 'hard rock', 'punk', 'alternative',
        'music genre', 'gênero musical', 'music style', 'estilo musical', 'music scene', 'cenário musical',
        'fan', 'fã', 'audience', 'audiência', 'crowd', 'multidão', 'music festival', 'festival de música',
        'tour', 'turnê', 'tournament', 'torneio', 'music venue', 'local de música', 'arena', 'arena',
        'stadium', 'estádio', 'theater', 'teatro', 'club', 'clube', 'bar', 'bar',
        'music studio', 'estúdio de música', 'recording', 'gravação', 'producer', 'produtor',
        'music video', 'clipe', 'music documentary', 'documentário musical', 'music history', 'história da música',
        'cultural impact', 'impacto cultural', 'artistic expression', 'expressão artística',
        'band history', 'história da banda', 'band members', 'membros da banda', 'band formation', 'formação da banda',
        'music education', 'educação musical', 'music theory', 'teoria musical', 'music lesson', 'aula de música',
        'instrument', 'instrumento', 'musical instrument', 'instrumento musical', 'equipment', 'equipamento',
        'music equipment', 'equipamento musical', 'gear', 'equipamento', 'music gear', 'equipamento musical'
      ],
      falsePositives: [
        // Falsos positivos específicos para música
        'bird', 'pássaro', 'ave', 'nature', 'natureza', 'animal', 'wildlife', 'wild', 'tropical',
        'indonesia', 'halmahera', 'widi', 'islands', 'ilhas', 'red eyes', 'olhos vermelhos',
        'aporonisu', 'species', 'espécie', 'biological', 'biológico', 'insect', 'inseto',
        'dragonfly', 'libélula', 'macro', 'close-up', 'flying', 'voando', 'branch', 'galho',
        'diptera', 'entomology', 'entomologia',
        // Conteúdo genérico não musical
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'technology', 'tecnologia', 'computer', 'computador', 'laptop', 'notebook', 'internet',
        'library', 'biblioteca', 'books', 'livros', 'education', 'educação', 'learning', 'aprendizado',
        'school', 'escola', 'classroom', 'sala de aula', 'student', 'estudante', 'teacher', 'professor',
        'abstract', 'abstrato', 'art', 'arte', 'painting', 'pintura', 'drawing', 'desenho',
        'illustration', 'ilustração', 'cartoon', 'desenho animado', 'comic', 'quadrinho',
        'sticker', 'logo', 'text', 'word', 'letter', 'font', 'design', 'pattern', 'generic'
      ]
    },
    art: {
      relevant: [
        'art', 'arte', 'painting', 'pintura', 'sculpture', 'escultura',
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
    // Novas categorias genéricas
    science: {
      relevant: [
        'science', 'ciência', 'scientific', 'científico', 'research', 'pesquisa', 'experiment', 'experimento',
        'laboratory', 'laboratório', 'study', 'estudo', 'analysis', 'análise', 'discovery', 'descoberta',
        'theory', 'teoria', 'hypothesis', 'hipótese', 'method', 'método', 'observation', 'observação',
        'data', 'dados', 'evidence', 'evidência', 'result', 'resultado', 'finding', 'achado'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'lifestyle', 'estilo de vida', 'fashion', 'moda', 'beauty', 'beleza'
      ]
    },
    business: {
      relevant: [
        'business', 'negócio', 'company', 'empresa', 'corporation', 'corporação', 'enterprise', 'empreendimento',
        'market', 'mercado', 'economy', 'economia', 'finance', 'finanças', 'investment', 'investimento',
        'management', 'gestão', 'leadership', 'liderança', 'strategy', 'estratégia', 'planning', 'planejamento',
        'sales', 'vendas', 'marketing', 'marketing', 'customer', 'cliente', 'service', 'serviço'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'lifestyle', 'estilo de vida', 'fashion', 'moda', 'beauty', 'beleza', 'family', 'família'
      ]
    },
    sports: {
      relevant: [
        'sport', 'esporte', 'athletic', 'atlético', 'competition', 'competição', 'game', 'jogo', 'match', 'partida',
        'player', 'jogador', 'team', 'equipe', 'training', 'treinamento', 'exercise', 'exercício',
        'fitness', 'fitness', 'physical', 'físico', 'activity', 'atividade', 'performance', 'desempenho',
        'stadium', 'estádio', 'field', 'campo', 'court', 'quadra', 'track', 'pista', 'gym', 'academia'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'lifestyle', 'estilo de vida', 'fashion', 'moda', 'beauty', 'beleza'
      ]
    },
    food: {
      relevant: [
        'food', 'comida', 'cuisine', 'culinária', 'cooking', 'cozinha', 'recipe', 'receita', 'ingredient', 'ingrediente',
        'chef', 'chef', 'cook', 'cozinheiro', 'kitchen', 'cozinha', 'restaurant', 'restaurante', 'meal', 'refeição',
        'dish', 'prato', 'flavor', 'sabor', 'taste', 'gosto', 'nutrition', 'nutrição', 'healthy', 'saudável',
        'fresh', 'fresco', 'organic', 'orgânico', 'traditional', 'tradicional', 'gourmet', 'gourmet'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'lifestyle', 'estilo de vida', 'fashion', 'moda', 'beauty', 'beleza'
      ]
    },
    travel: {
      relevant: [
        'travel', 'viagem', 'tourism', 'turismo', 'destination', 'destino', 'vacation', 'férias', 'trip', 'passeio',
        'hotel', 'hotel', 'resort', 'resort', 'beach', 'praia', 'mountain', 'montanha', 'city', 'cidade',
        'landmark', 'marco', 'attraction', 'atração', 'adventure', 'aventura', 'explore', 'explorar',
        'culture', 'cultura', 'local', 'local', 'experience', 'experiência', 'journey', 'jornada'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'lifestyle', 'estilo de vida', 'fashion', 'moda', 'beauty', 'beleza'
      ]
    },
    fashion: {
      relevant: [
        'fashion', 'moda', 'style', 'estilo', 'clothing', 'roupa', 'apparel', 'vestuário', 'design', 'design',
        'trend', 'tendência', 'outfit', 'look', 'beauty', 'beleza', 'cosmetic', 'cosmético', 'makeup', 'maquiagem',
        'accessory', 'acessório', 'jewelry', 'joias', 'shoe', 'sapato', 'bag', 'bolsa', 'dress', 'vestido'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'technology', 'tecnologia', 'computer', 'computador', 'laptop', 'notebook', 'internet'
      ]
    },
    animals: {
      relevant: [
        'animal', 'animal', 'pet', 'pet', 'wildlife', 'vida selvagem', 'nature', 'natureza', 'creature', 'criatura',
        'dog', 'cachorro', 'cat', 'gato', 'bird', 'pássaro', 'fish', 'peixe', 'horse', 'cavalo',
        'veterinary', 'veterinário', 'care', 'cuidado', 'health', 'saúde', 'behavior', 'comportamento',
        'habitat', 'habitat', 'species', 'espécie', 'conservation', 'conservação', 'protection', 'proteção'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'technology', 'tecnologia', 'computer', 'computador', 'laptop', 'notebook', 'internet'
      ]
    },
    architecture: {
      relevant: [
        'architecture', 'arquitetura', 'building', 'edifício', 'construction', 'construção', 'design', 'design',
        'structure', 'estrutura', 'house', 'casa', 'home', 'lar', 'project', 'projeto', 'plan', 'plano',
        'modern', 'moderno', 'traditional', 'tradicional', 'contemporary', 'contemporâneo', 'classic', 'clássico',
        'space', 'espaço', 'interior', 'interior', 'exterior', 'exterior', 'material', 'material'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'lifestyle', 'estilo de vida', 'fashion', 'moda', 'beauty', 'beleza'
      ]
    },
    psychology: {
      relevant: [
        'psychology', 'psicologia', 'behavior', 'comportamento', 'mind', 'mente', 'emotion', 'emoção',
        'personality', 'personalidade', 'mental', 'mental', 'cognitive', 'cognitivo', 'therapy', 'terapia',
        'counseling', 'aconselhamento', 'mental health', 'saúde mental', 'wellbeing', 'bem-estar',
        'stress', 'estresse', 'anxiety', 'ansiedade', 'depression', 'depressão', 'therapy', 'terapia'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'lifestyle', 'estilo de vida', 'fashion', 'moda', 'beauty', 'beleza'
      ]
    },
    philosophy: {
      relevant: [
        'philosophy', 'filosofia', 'ethics', 'ética', 'moral', 'moral', 'values', 'valores', 'thinking', 'pensamento',
        'wisdom', 'sabedoria', 'knowledge', 'conhecimento', 'truth', 'verdade', 'reality', 'realidade',
        'existence', 'existência', 'meaning', 'significado', 'purpose', 'propósito', 'life', 'vida',
        'consciousness', 'consciência', 'freedom', 'liberdade', 'justice', 'justiça', 'virtue', 'virtude'
      ],
      falsePositives: [
        'woman', 'mulher', 'man', 'homem', 'person', 'pessoa', 'smiling', 'sorrindo', 'casual', 'casual',
        'business', 'negócio', 'office', 'escritório', 'work', 'trabalho', 'meeting', 'reunião',
        'lifestyle', 'estilo de vida', 'fashion', 'moda', 'beauty', 'beleza'
      ]
    },
    general: {
      relevant: [
        'general', 'geral', 'common', 'comum', 'basic', 'básico', 'simple', 'simples',
        'basic concept', 'conceito básico', 'fundamental', 'fundamental', 'essential', 'essencial',
        'information', 'informação', 'knowledge', 'conhecimento', 'learning', 'aprendizado',
        'understanding', 'compreensão', 'concept', 'conceito', 'idea', 'ideia', 'topic', 'tópico'
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
