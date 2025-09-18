// Utilitário para classificação de complexidade de mensagens
// Reutilizável em diferentes endpoints para evitar duplicação de código

export type ComplexityLevel = 'trivial' | 'simples' | 'complexa';

// Cache global para classificações
const classificationCache = new Map<string, { classification: ComplexityLevel, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const MAX_CACHE_SIZE = 1000;

// Função para obter cache key baseada na mensagem
function getCacheKey(message: string): string {
  // Normalizar mensagem para cache (remover espaços extras, converter para lowercase)
  return message.toLowerCase().trim().replace(/\s+/g, ' ');
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
export function classifyComplexityLocal(message: string): ComplexityLevel {
  const lowerMessage = message.toLowerCase();
  
  // Palavras-chave que indicam trivialidade
  const trivialKeywords = [
    'oi', 'olá', 'tudo bem', 'td bem', 'bom dia', 'boa tarde', 'boa noite',
    'ok', 'okay', 'sim', 'não', 'nao', 'obrigado', 'obrigada', 'valeu', 'vlw',
    'tchau', 'até logo', 'até mais', 'bye', 'obrigado', 'obrigada'
  ];
  
  // Verificar se é uma mensagem trivial (muito curta ou saudação simples)
  if ((trivialKeywords.some(keyword => lowerMessage.includes(keyword)) && message.length < 30) || message.length < 15) {
    return 'trivial';
  }
  
  // Verificar se é uma pergunta educacional complexa
  const hasEducationalTerms = /\b(fotossíntese|divisão celular|revolução|guerra|independência|evolução|matemática|geografia|história|ciência|biologia|química|física|literatura|português|inglês|filosofia|sociologia|economia|política|geometria|álgebra|trigonometria|cálculo|derivada|integral|equação|função|teorema|demonstração|prova|análise|síntese|comparar|explicar detalhadamente|processo complexo|estatística|probabilidade|vetores|matriz|logaritmo|exponencial|limite|continuidade)\b/i.test(message);
  const isEducationalQuestion = /\b(como|por que|quando|onde|qual|quais|quem|explique|demonstre|prove|calcule|resolva|desenvolva|analise|compare|discuta|avalie)\b/i.test(message);
  const hasComplexIndicators = /\b(detalhadamente|completamente|exaustivamente|passo a passo|processo|método|técnica|estratégia|abordagem|metodologia|algoritmo|implementação|desenvolvimento|construção|elaboração)\b/i.test(message);
  
  if ((isEducationalQuestion && hasEducationalTerms && message.length > 30) || 
      (hasComplexIndicators && message.length > 50)) {
    return 'complexa';
  }
  
  // Default para simples
  return 'simples';
}

// Função principal para classificar complexidade com cache
export function classifyComplexity(message: string): {
  classification: ComplexityLevel;
  cached: boolean;
  method: 'local' | 'cache';
} {
  // Limpar cache expirado periodicamente
  cleanExpiredCache();
  manageCacheSize();

  // Verificar cache primeiro
  const cacheKey = getCacheKey(message);
  const cached = classificationCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return {
      classification: cached.classification,
      cached: true,
      method: 'cache'
    };
  }

  // Classificação local
  const classification = classifyComplexityLocal(message);
  
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
