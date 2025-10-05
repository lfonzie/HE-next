/**
 * Detector de complexidade e tipo de pergunta para seleção automática de modelo
 */

export type ComplexityLevel = 'simple' | 'medium' | 'complex';
export type QuestionType = 'general' | 'web_search' | 'analysis' | 'creative' | 'technical';

export interface QuestionAnalysis {
  complexity: ComplexityLevel;
  type: QuestionType;
  needsWebSearch: boolean;
  recommendedProvider: 'openai' | 'gpt5' | 'gemini' | 'perplexity' | 'grok';
  recommendedModel: string;
  confidence: number;
}

// Palavras-chave para detecção de busca na web
const WEB_SEARCH_KEYWORDS = [
  'pesquisar', 'buscar', 'encontrar', 'procurar', 'onde', 'quando', 'quem', 'como',
  'últimas notícias', 'notícias', 'atual', 'recente', 'hoje', 'ontem', 'semana',
  'preço', 'cotação', 'valor', 'mercado', 'bolsa', 'ações',
  'tempo', 'clima', 'previsão', 'temperatura',
  'endereço', 'localização', 'mapa', 'como chegar',
  'site', 'página', 'link', 'url', 'endereço web',
  'google', 'youtube', 'wikipedia', 'reddit'
];

// Palavras-chave para perguntas complexas
const COMPLEX_KEYWORDS = [
  'explicar', 'analisar', 'comparar', 'avaliar', 'criticar', 'discutir',
  'por que', 'como funciona', 'mecanismo', 'processo', 'algoritmo',
  'filosofia', 'ética', 'moral', 'sociedade', 'política', 'economia',
  'científico', 'pesquisa', 'estudo', 'teoria', 'hipótese',
  'programação', 'código', 'algoritmo', 'estrutura de dados',
  'matemática', 'cálculo', 'equação', 'teorema', 'prova'
];

// Palavras-chave para perguntas criativas
const CREATIVE_KEYWORDS = [
  'escrever', 'criar', 'inventar', 'imaginar', 'história', 'poema',
  'roteiro', 'personagem', 'enredo', 'trama', 'narrativa',
  'desenhar', 'pintar', 'arte', 'design', 'criativo',
  'ideia', 'sugestão', 'proposta', 'solução criativa'
];

// Palavras-chave para perguntas técnicas
const TECHNICAL_KEYWORDS = [
  'configurar', 'instalar', 'configuração', 'setup', 'instalação',
  'erro', 'bug', 'problema', 'solução', 'troubleshooting',
  'código', 'programação', 'sintaxe', 'função', 'método',
  'banco de dados', 'sql', 'query', 'tabela', 'schema',
  'api', 'endpoint', 'request', 'response', 'json'
];

export function analyzeQuestion(question: string): QuestionAnalysis {
  const lowerQuestion = question.toLowerCase();
  
  // Detectar se precisa de busca na web
  const needsWebSearch = WEB_SEARCH_KEYWORDS.some(keyword => 
    lowerQuestion.includes(keyword)
  );
  
  // Detectar tipo de pergunta
  let type: QuestionType = 'general';
  if (needsWebSearch) {
    type = 'web_search';
  } else if (CREATIVE_KEYWORDS.some(keyword => lowerQuestion.includes(keyword))) {
    type = 'creative';
  } else if (TECHNICAL_KEYWORDS.some(keyword => lowerQuestion.includes(keyword))) {
    type = 'technical';
  } else if (COMPLEX_KEYWORDS.some(keyword => lowerQuestion.includes(keyword))) {
    type = 'analysis';
  }
  
  // Detectar complexidade
  let complexity: ComplexityLevel = 'simple';
  const wordCount = question.split(' ').length;
  
  if (needsWebSearch || type === 'web_search') {
    complexity = 'medium';
  } else if (wordCount > 20 || COMPLEX_KEYWORDS.some(keyword => lowerQuestion.includes(keyword))) {
    complexity = 'complex';
  } else if (wordCount > 10 || type === 'analysis' || type === 'technical') {
    complexity = 'medium';
  }
  
  // Selecionar provedor e modelo baseado na análise
  let recommendedProvider: 'openai' | 'gpt5' | 'gemini' | 'perplexity' | 'grok';
  let recommendedModel: string;
  let confidence = 0.8;
  
  if (needsWebSearch || type === 'web_search') {
    // Busca na web → Perplexity
    recommendedProvider = 'perplexity';
    recommendedModel = 'sonar';
    confidence = 0.9;
  } else if (complexity === 'complex' || type === 'analysis') {
    // Perguntas complexas → Grok 4 Fast Reasoning (mais avançado)
    recommendedProvider = 'grok';
    recommendedModel = 'grok-4-fast-reasoning';
    confidence = 0.9;
  } else if (complexity === 'simple' && wordCount <= 3) {
    // Perguntas triviais → Grok 4 Fast Reasoning (ultra-rápido)
    recommendedProvider = 'grok';
    recommendedModel = 'grok-4-fast-reasoning';
    confidence = 0.9;
  } else {
    // Perguntas simples → Grok 4 Fast Reasoning (padrão)
    recommendedProvider = 'grok';
    recommendedModel = 'grok-4-fast-reasoning';
    confidence = 0.9;
  }
  
  return {
    complexity,
    type,
    needsWebSearch,
    recommendedProvider,
    recommendedModel,
    confidence
  };
}

// Função para obter explicação da seleção
export function getSelectionExplanation(analysis: QuestionAnalysis): string {
  const { complexity, type, needsWebSearch, recommendedProvider } = analysis;
  
  if (needsWebSearch) {
    return `🔍 Busca na web detectada → Perplexity Sonar`;
  }
  
  switch (recommendedProvider) {
    case 'gpt5':
      return `🧠 Pergunta complexa (${complexity}) → GPT-5 Chat Latest`;
    case 'gemini':
      return `⚡ Pergunta trivial → Gemini 2.5 Flash`;
    case 'openai':
      return `💬 Pergunta simples → GPT-4o Mini`;
    default:
      return `🤖 Seleção automática → ${recommendedProvider}`;
  }
}
