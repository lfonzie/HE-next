// Utilitário para classificação de complexidade de mensagens
// Reutilizável em diferentes endpoints para evitar duplicação de código

export type ComplexityLevel = 'trivial' | 'simples' | 'complexa';

// Cache global para classificações
const classificationCache = new Map<string, { classification: ComplexityLevel, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const MAX_CACHE_SIZE = 1000;

// Função para obter cache key baseada na mensagem e módulo
function getCacheKey(message: string, module?: string): string {
  // Normalizar mensagem para cache (remover espaços extras, converter para lowercase)
  const normalizedMessage = message.toLowerCase().trim().replace(/\s+/g, ' ');
  const normalizedModule = (module || 'global').toLowerCase().trim();
  return `${normalizedModule}|${normalizedMessage}`;
}

// Função para limpar cache expirado
function cleanExpiredCache(): void {
  const now = Date.now();
  for (const [key, value] of classificationCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      classificationCache.delete(key);
    }
  }
}

// Função para gerenciar tamanho do cache
function manageCacheSize(): void {
  if (classificationCache.size > MAX_CACHE_SIZE) {
    // Remover entradas mais antigas
    const entries = Array.from(classificationCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, Math.floor(MAX_CACHE_SIZE * 0.2)); // Remove 20% mais antigas
    toRemove.forEach(([key]) => classificationCache.delete(key));
  }
}

// Função de classificação local (melhorada)
export function classifyComplexityLocal(message: string, module?: string): ComplexityLevel {
  const lowerMessage = message.toLowerCase();
  
  // Palavras-chave que indicam trivialidade
  const trivialKeywords = [
    'oi', 'olá', 'tudo bem', 'td bem', 'bom dia', 'boa tarde', 'boa noite',
    'ok', 'okay', 'sim', 'não', 'nao', 'obrigado', 'obrigada', 'valeu', 'vlw',
    'tchau', 'até logo', 'até mais', 'bye', 'obrigado', 'obrigada'
  ];

  // Detecção de bem-estar/saúde mental e suporte emocional
  const wellbeingRegex = /\b(me sinto|estou|sinto|preciso de ajuda|quero ajuda|apoio|preciso falar)\b[\s\S]*\b(triste|ansioso|ansiosa|deprimido|deprimida|angustiado|angustiada|sobrecarregado|sobrecarregada|com medo|em p[aâ]nico|sem esperança|desmotivado|desmotivada|cansado|cansada)\b|ansiedade|depress[aã]o|crise de p[aâ]nico|sa[úu]de mental|psic[oó]logo|psic[oó]loga|terapia|apoio emocional/i;
  const isWellbeingConcern = wellbeingRegex.test(lowerMessage);
  const isWellbeingModule = module === 'bem-estar' || module === 'atendimento';

  // Sinalizar mensagens de bem-estar como complexas para assegurar tratamento adequado
  if (isWellbeingConcern || (isWellbeingModule && /\b(me sinto|estou|sinto)\b/.test(lowerMessage))) {
    return 'complexa';
  }
  
  // Verificar se é uma mensagem trivial (muito curta ou saudação simples)
  if (!isWellbeingConcern && ((trivialKeywords.some(keyword => lowerMessage.includes(keyword)) && message.length < 30) || message.length < 15)) {
    return 'trivial';
  }
  
  // Verificar se é uma pergunta educacional complexa
  const hasEducationalTerms = /\b(fotossíntese|divisão celular|revolução|guerra|independência|evolução|matemática|geografia|história|ciência|biologia|química|física|literatura|português|inglês|filosofia|sociologia|economia|política|geometria|álgebra|trigonometria|cálculo|derivada|integral|equação|função|teorema|demonstração|prova|análise|síntese|comparar|explicar detalhadamente|processo complexo|estatística|probabilidade|vetores|matriz|logaritmo|exponencial|limite|continuidade|conceito|matéria|disciplina|assunto|tema|conteúdo|estudo|aprendizado|ensino|educação|escola|aula|professor|professora|aluno|aluna|estudante|redação|redacao|redação|dissertação|dissertacao|dissertação|trabalho|pesquisa|projeto|monografia|tese|artigo|ensaio|texto|composição|composicao|composição|liderança|lideranca|liderança|feminina|masculina|gênero|genero|gênero|igualdade|diversidade|inclusão|inclusao|inclusão|direitos|humanos|social|sociedade|cultura|comportamento|psicologia|sociologia|filosofia|ética|etica|ética|moral|valores|princípios|principios|princípios)\b/i.test(message);
  const isEducationalQuestion = /\b(como|por que|quando|onde|qual|quais|quem|explique|demonstre|prove|calcule|resolva|desenvolva|analise|compare|discuta|avalie|me ajude|ajuda|dúvida|dúvidas|não entendo|não sei|preciso|quero|gostaria|poderia|pode|tirar|tirar uma|fazer|entender|aprender|estudar|escrever|escreva|produzir|produza|elaborar|elabore|criar|crie|desenvolver|desenvolva|construir|construa|formular|formule|argumentar|argumente|defender|defenda|justificar|justifique|fundamentar|fundamente|sustentar|sustente|comprovar|comprove|demonstrar|demonstre|mostrar|mostre|apresentar|apresente|expor|exponha|discorrer|discorra|abordar|aborde|tratar|trate|analisar|analise|examinar|examine|investigar|investigue|pesquisar|pesquise|estudar|estude|aprender|aprenda|compreender|compreenda|entender|entenda|interpretar|interprete|explicar|explique|descrever|descreva|narrar|narre|relatar|relate|contar|conte|expor|exponha|apresentar|apresente|mostrar|mostre|demonstrar|demonstre|provar|prove|comprovar|comprove|sustentar|sustente|fundamentar|fundamente|justificar|justifique|argumentar|argumente|defender|defenda|convencer|convença|persuadir|persuada|influenciar|influencie|motivar|motive|inspirar|inspire|estimular|estimule|incentivar|incentive|promover|promova|fomentar|fomente|desenvolver|desenvolva|cultivar|cultive|formar|forme|construir|construa|edificar|edifique|estabelecer|estabeleça|criar|crie|gerar|gere|produzir|produza|elaborar|elabore|construir|construa|desenvolver|desenvolva|formular|formule|estruturar|estruture|organizar|organize|sistematizar|sistematize|planejar|planeje|programar|programe|projetar|projete|desenhar|desenhe|esboçar|esboce|rascunhar|rascunhe|escrever|escreva|redigir|redija|compor|componha|produzir|produza|elaborar|elabore|construir|construa|desenvolver|desenvolva|formular|formule|estruturar|estruture|organizar|organize|sistematizar|sistematize|planejar|planeje|programar|programe|projetar|projete|desenhar|desenhe|esboçar|esboce|rascunhar|rascunhe)\b/i.test(message);
  const hasComplexIndicators = /\b(detalhadamente|completamente|exaustivamente|passo a passo|processo|método|técnica|estratégia|abordagem|metodologia|algoritmo|implementação|desenvolvimento|construção|elaboração|explicação|explicar|demonstrar|mostrar|ensinar|aprender|importância|importancia|importância|relevância|relevancia|relevância|significado|significância|significancia|significância|impacto|influência|influencia|influência|papel|função|funcao|função|contribuição|contribuicao|contribuição|participação|participacao|participação|envolvimento|engajamento|comprometimento|dedicação|dedicacao|dedicação|esforço|esforco|esforço|trabalho|labor|luta|conquista|vitória|vitoria|vitória|sucesso|realização|realizacao|realização|conquista|alcanço|alcanco|alcanço|objetivo|meta|finalidade|propósito|proposito|propósito|intenção|intencao|intenção|motivação|motivacao|motivação|inspiração|inspiracao|inspiração|estímulo|estimulo|estímulo|incentivo|promoção|promocao|promoção|fomento|desenvolvimento|cultivo|formação|formacao|formação|construção|construcao|construção|edição|edicao|edição|estabelecimento|criação|criacao|criação|geração|geracao|geração|produção|producao|produção|elaboração|elaboracao|elaboração|construção|construcao|construção|desenvolvimento|formulação|formulacao|formulação|estruturação|estruturacao|estruturação|organização|organizacao|organização|sistematização|sistematizacao|sistematização|planejamento|programação|programacao|programação|projeto|desenho|esboço|esboco|esboço|rascunho|escrita|redação|redacao|redação|redação|composição|composicao|composição|produção|producao|produção|elaboração|elaboracao|elaboração|construção|construcao|construção|desenvolvimento|formulação|formulacao|formulação|estruturação|estruturacao|estruturação|organização|organizacao|organização|sistematização|sistematizacao|sistematização|planejamento|programação|programacao|programação|projeto|desenho|esboço|esboco|esboço|rascunho)\b/i.test(message);
  
  // Se é uma pergunta educacional (mesmo sem termos técnicos específicos), classificar como complexa
  if (isEducationalQuestion && (hasEducationalTerms || message.length > 20)) {
    return 'complexa';
  }
  
  // Se tem indicadores de complexidade, classificar como complexa
  if (hasComplexIndicators && message.length > 30) {
    return 'complexa';
  }
  
  // Default para simples
  return 'simples';
}

// Função para classificar complexidade usando OpenAI
async function classifyComplexityWithOpenAI(message: string): Promise<ComplexityLevel> {
  try {
    // Usar URL absoluta para evitar problemas de contexto server-side
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/router/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.classification && ['trivial', 'simples', 'complexa'].includes(data.classification)) {
        return data.classification;
      }
    }
  } catch (error) {
    console.error('OpenAI classification error:', error);
  }
  
  // Fallback para classificação local
  return classifyComplexityLocal(message);
}

// Função principal para classificar complexidade com cache
export function classifyComplexity(message: string, module?: string): {
  classification: ComplexityLevel;
  cached: boolean;
  method: 'local' | 'cache';
} {
  // Limpar cache expirado periodicamente
  cleanExpiredCache();
  manageCacheSize();

  // Verificar cache primeiro
  const cacheKey = getCacheKey(message, module);
  const cached = classificationCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return {
      classification: cached.classification,
      cached: true,
      method: 'cache'
    };
  }

  // Classificação local
  const classification = classifyComplexityLocal(message, module);
  
  // Salvar no cache
  classificationCache.set(cacheKey, {
    classification,
    timestamp: Date.now()
  });
  
  return {
    classification,
    cached: false,
    method: 'local'
  };
}

// Função assíncrona para classificar complexidade com OpenAI (para uso em endpoints)
export async function classifyComplexityAsync(message: string, module?: string): Promise<{
  classification: ComplexityLevel;
  cached: boolean;
  method: 'local' | 'cache' | 'openai';
}> {
  // Limpar cache expirado periodicamente
  cleanExpiredCache();
  manageCacheSize();

  // Verificar cache primeiro
  const cacheKey = getCacheKey(message, module);
  const cached = classificationCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return {
      classification: cached.classification,
      cached: true,
      method: 'cache'
    };
  }

  // Tentar classificação com OpenAI primeiro
  try {
    const classification = await classifyComplexityWithOpenAI(message);
    
    // Salvar no cache
    classificationCache.set(cacheKey, {
      classification,
      timestamp: Date.now()
    });
    
    return {
      classification,
      cached: false,
      method: 'openai'
    };
  } catch (error) {
    console.error('OpenAI classification failed, falling back to local:', error);
    
    // Fallback para classificação local
    const classification = classifyComplexityLocal(message, module);
    
    // Salvar no cache
    classificationCache.set(cacheKey, {
      classification,
      timestamp: Date.now()
    });
    
    return {
      classification,
      cached: false,
      method: 'local'
    };
  }
}

// Função para obter configuração de provider baseada na complexidade
export function getProviderConfig(complexity: ComplexityLevel): {
  provider: 'openai' | 'google';
  model: string;
  tier: string;
} {
  switch (complexity) {
    case 'trivial':
      return {
        provider: 'google',
        model: 'gemini-1.5-flash',
        tier: 'IA_ECO'
      };
    case 'simples':
      return {
        provider: 'openai',
        model: 'gpt-4o-mini',
        tier: 'IA'
      };
    case 'complexa':
      return {
        provider: 'openai',
        model: 'gpt-5-chat-latest',
        tier: 'IA_TURBO'
      };
    default:
      return {
        provider: 'openai',
        model: 'gpt-4o-mini',
        tier: 'IA'
      };
  }
}

// Função para limpar cache manualmente (útil para testes)
export function clearComplexityCache(): void {
  classificationCache.clear();
}

// Função para obter estatísticas do cache
export function getCacheStats(): {
  size: number;
  maxSize: number;
  entries: Array<{ key: string; timestamp: number; classification: ComplexityLevel }>;
} {
  const entries = Array.from(classificationCache.entries()).map(([key, value]) => ({
    key,
    timestamp: value.timestamp,
    classification: value.classification
  }));
  
  return {
    size: classificationCache.size,
    maxSize: MAX_CACHE_SIZE,
    entries
  };
}
