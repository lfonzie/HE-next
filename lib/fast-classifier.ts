// Classificador rápido local - sem chamadas externas
export interface FastClassificationResult {
  module: string;
  confidence: number;
  rationale: string;
}

// Padrões otimizados para classificação rápida
const FAST_PATTERNS = {
  // Padrões de alta confiança (0.9+)
  professor: [
    /\b(dúvida|explicação|conceito|matéria|disciplina|como resolver|fórmula|teorema|demonstração|prova|análise|síntese|comparar|explicar detalhadamente|processo complexo|estatística|probabilidade|vetores|matriz|logaritmo|exponencial|limite|continuidade)\b/i,
    /\b(geometria|álgebra|trigonometria|cálculo|derivada|integral|equação|função)\b/i,
    /\b(física|química|biologia|história|geografia|português|literatura|redação|matemática)\b/i,
    /\b(me ajude com.*dúvida|tirar uma dúvida|ajuda com.*exercício)\b/i
  ],
  
  enem: [
    /\b(enem|simulado|tri|prova objetiva|redação|questões de múltipla escolha|gabarito)\b/i,
    /\b(simulado rápido|questões enem|prova rápida)\b/i
  ],
  
  aula_interativa: [
    /\b(aula interativa|slides|explicação passo a passo|atividade|demonstração|aula dinâmica|aula participativa)\b/i,
    /\b(aula completa|aula detalhada|aula expandida)\b/i
  ],
  
  ti: [
    /\b(projetor|internet|lenta|login|não funciona|configurar|impressora|bug|sistema|computador|travou|build|deploy|render|porta|log|404|405|nextauth|rota|api)\b/i,
    /\b(problema técnico|suporte técnico|equipamento)\b/i
  ],
  
  financeiro: [
    /\b(pagamento|boleto|mensalidade|financeiro|valor|preço|custo|desconto|parcelamento|taxa de matrícula)\b/i
  ],
  
  rh: [
    /\b(benefícios|férias|atestado|médico|salário|treinamento|carreira|promoção|recursos humanos|colaboradores|funcionários)\b/i
  ],
  
  social_media: [
    /\b(post|rede social|instagram|facebook|tiktok|youtube|conteúdo digital|marketing digital|postagem|compartilhar nas redes)\b/i
  ],
  
  bem_estar: [
    /\b(ansioso|ansiosa|conflito|colega|apoio|emocional|estresse|depressão|depressao|bullying|conflito|familiar|saúde|saude|mental|psicólogo|psicologo|psicóloga|psicologa|terapia|apoio emocional)\b/i,
    /\b(me sinto|estou|sinto|preciso de ajuda|quero ajuda|preciso falar)\b[\s\S]*\b(triste|ansioso|ansiosa|deprimido|deprimida|angustiado|angustiada|sobrecarregado|sobrecarregada|com medo|em pânico|em panico|sem esperança|desmotivado|desmotivada|cansado|cansada)\b/i,
    /\b(ansiedade|depressão|depressao|crise de pânico|crise de panico|saúde mental|saude mental)\b/i
  ],
  
  coordenacao: [
    /\b(calendário|provas|coordenador|pedagógico|gestão|acadêmica|planejamento|pedagógico|metodologia|ensino)\b/i
  ],
  
  secretaria: [
    /\b(matrícula|documentos|horário|secretaria|whats|procedimentos|administrativos)\b/i
  ],
  
  conteudo_midia: [
    /\b(preciso de uma imagem|diagrama|gráfico|ilustração|infográfico|conteúdo visual|material visual)\b/i
  ]
};

// Cache local simples
const classificationCache = new Map<string, { result: FastClassificationResult; timestamp: number }>();

export function fastClassify(message: string, historyLength: number = 0): FastClassificationResult {
  const cacheKey = `${message.toLowerCase().trim()}_${historyLength}`;
  const cached = classificationCache.get(cacheKey);
  
  // Cache por 30 minutos (mais agressivo)
  if (cached && Date.now() - cached.timestamp < 1800000) {
    return cached.result;
  }
  
  const messageLower = message.toLowerCase();
  let bestMatch = { module: 'professor', confidence: 0.5, rationale: 'Default fallback' };
  
  // Verificar padrões de alta confiança primeiro
  for (const [module, patterns] of Object.entries(FAST_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(messageLower)) {
        const confidence = pattern.source.includes('dúvida|explicação|conceito') ? 0.95 : 0.85;
        bestMatch = {
          module,
          confidence,
          rationale: `Fast pattern match: ${pattern.source.substring(0, 50)}...`
        };
        
        // Cache o resultado
        classificationCache.set(cacheKey, { result: bestMatch, timestamp: Date.now() });
        
        // Limitar cache
        if (classificationCache.size > 100) {
          const firstKey = classificationCache.keys().next().value;
          if (firstKey) classificationCache.delete(firstKey);
        }
        
        return bestMatch;
      }
    }
  }
  
  // Fallback baseado em palavras-chave simples
  if (messageLower.includes('aula') || messageLower.includes('slide')) {
    bestMatch = { module: 'aula_interativa', confidence: 0.7, rationale: 'Keyword: aula/slide' };
  } else if (messageLower.includes('simulado') || messageLower.includes('enem')) {
    bestMatch = { module: 'enem', confidence: 0.7, rationale: 'Keyword: simulado/enem' };
  } else if (messageLower.includes('problema') && messageLower.includes('técnico')) {
    bestMatch = { module: 'ti', confidence: 0.7, rationale: 'Keyword: problema técnico' };
  } else if (messageLower.includes('me sinto') || messageLower.includes('estou') || messageLower.includes('sinto')) {
    // Detectar mensagens de bem-estar mesmo sem palavras específicas
    if (messageLower.includes('triste') || messageLower.includes('ansioso') || messageLower.includes('ansiosa') || 
        messageLower.includes('deprimido') || messageLower.includes('deprimida') || messageLower.includes('cansado') || 
        messageLower.includes('cansada') || messageLower.includes('mal') || messageLower.includes('não') || 
        messageLower.includes('nao') || messageLower.includes('problema') || messageLower.includes('dificuldade')) {
      bestMatch = { module: 'bem_estar', confidence: 0.8, rationale: 'Keyword: estado emocional detectado' };
    }
  }
  
  // Cache o resultado
  classificationCache.set(cacheKey, { result: bestMatch, timestamp: Date.now() });
  
  return bestMatch;
}

// Função para limpar cache (útil para debug)
export function clearFastClassificationCache() {
  classificationCache.clear();
  console.log('🧹 [FAST-CLASSIFIER] Cache limpo');
}

// Função para testar classificação (útil para debug)
export function testFastClassification(message: string): FastClassificationResult {
  return fastClassify(message, 0);
}
