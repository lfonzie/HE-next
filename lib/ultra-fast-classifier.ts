import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export interface UltraFastClassificationResult {
  module: string;
  confidence: number;
  rationale: string;
  method: 'google_direct' | 'local_enhanced' | 'cache';
}

// Cache ultra-agressivo (1 hora)
const ultraCache = new Map<string, { result: UltraFastClassificationResult; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

// Padrões otimizados e expandidos para classificação local
const ULTRA_FAST_PATTERNS = {
  // Padrões de alta confiança (0.95+)
  professor: [
    /\b(dúvida|explicação|conceito|matéria|disciplina|como resolver|fórmula|teorema|demonstração|prova|análise|síntese|comparar|explicar detalhadamente|processo complexo|estatística|probabilidade|vetores|matriz|logaritmo|exponencial|limite|continuidade)\b/i,
    /\b(geometria|álgebra|trigonometria|cálculo|derivada|integral|equação|função)\b/i,
    /\b(física|química|biologia|história|geografia|português|literatura|redação|matemática)\b/i,
    /\b(me ajude com.*dúvida|tirar uma dúvida|ajuda com.*exercício|não entendo|não sei como|como fazer|como calcular|como resolver)\b/i,
    /\b(questão|exercício|problema|resolução|solução|método|técnica|estratégia)\b/i
  ],
  
  enem: [
    /\b(enem|simulado|tri|prova objetiva|redação|questões de múltipla escolha|gabarito)\b/i,
    /\b(simulado rápido|questões enem|prova rápida|vestibular|concurso)\b/i,
    /\b(nota|pontuação|classificação|ranking|resultado)\b/i
  ],
  
  aula_interativa: [
    /\b(aula interativa|slides|explicação passo a passo|atividade|demonstração|aula dinâmica|aula participativa)\b/i,
    /\b(aula completa|aula detalhada|aula expandida|material didático|conteúdo educacional)\b/i,
    /\b(presentação|exposição|explicação visual|diagrama|gráfico|ilustração)\b/i
  ],
  
  ti: [
    /\b(projetor|internet|lenta|login|não funciona|configurar|impressora|bug|sistema|computador|travou|build|deploy|render|porta|log|404|405|nextauth|rota|api)\b/i,
    /\b(problema técnico|suporte técnico|equipamento|tecnologia|software|hardware)\b/i,
    /\b(erro|falha|bug|crash|travamento|lentidão|conexão|rede|wifi|bluetooth)\b/i
  ],
  
  financeiro: [
    /\b(pagamento|boleto|mensalidade|financeiro|valor|preço|custo|desconto|parcelamento|taxa de matrícula)\b/i,
    /\b(dinheiro|reais|reembolso|estorno|cartão|débito|crédito|transferência)\b/i
  ],
  
  rh: [
    /\b(benefícios|férias|ferias|atestado|atestado médico|médico|salário|salario|treinamento|carreira|promoção|promocao|recursos humanos|colaboradores|funcionários|funcionarios|direitos trabalhistas|trabalhista|clt|consolidação das leis do trabalho)\b/i,
    /\b(1\/3.*férias|1\/3.*ferias|terço.*férias|terco.*ferias|saldo.*férias|saldo.*ferias)\b/i,
    /\b(décimo terceiro|decimo terceiro|13º|13o|terceiro|quando sai|quando pagam|pagamento do|valor do)\b/i,
    /\b(folha de pagamento|holerite|contracheque|admissão|demissão|rescisão)\b/i
  ],
  
  social_media: [
    /\b(post|rede social|instagram|facebook|tiktok|youtube|conteúdo digital|marketing digital|postagem|compartilhar nas redes)\b/i,
    /\b(mídia social|mídias sociais|social media|conteúdo viral|engajamento|seguidores)\b/i
  ],
  
  bem_estar: [
    /\b(ansioso|ansiosa|conflito|colega|apoio|emocional|estresse|depressão|depressao|bullying|conflito|familiar|saúde|saude|mental|psicólogo|psicologo|psicóloga|psicologa|terapia|apoio emocional)\b/i,
    /\b(me sinto|estou|sinto|preciso de ajuda|quero ajuda|preciso falar)\b[\s\S]*\b(triste|ansioso|ansiosa|deprimido|deprimida|angustiado|angustiada|sobrecarregado|sobrecarregada|com medo|em pânico|em panico|sem esperança|desmotivado|desmotivada|cansado|cansada)\b/i,
    /\b(ansiedade|depressão|depressao|crise de pânico|crise de panico|saúde mental|saude mental)\b/i,
    /\b(crise|emergência|urgente|preciso falar|quero conversar|me ajuda|ajuda emocional)\b/i
  ],
  
  coordenacao: [
    /\b(calendário|provas|coordenador|pedagógico|gestão|acadêmica|planejamento|pedagógico|metodologia|ensino)\b/i,
    /\b(currículo|grade curricular|disciplinas|horários|cronograma|agenda)\b/i
  ],
  
  secretaria: [
    /\b(matrícula|documentos|horário|secretaria|whats|procedimentos|administrativos)\b/i,
    /\b(certificado|diploma|histórico|transcrição|declaração|comprovante)\b/i
  ],
  
  conteudo_midia: [
    /\b(preciso de uma imagem|diagrama|gráfico|ilustração|infográfico|conteúdo visual|material visual)\b/i,
    /\b(imagem|foto|figura|desenho|esquema|mapa|tabela|gráfico)\b/i
  ],
  
  atendimento: [
    /\b(oi|olá|tudo bem|td bem|bom dia|boa tarde|boa noite|oi tudo bem|olá tudo bem)\b/i,
    /\b(ajuda|suporte|atendimento|informação|dúvida geral|não sei|preciso de ajuda)\b/i
  ]
};

// Função para classificação local ultra-rápida
function ultraFastLocalClassify(message: string, historyLength: number = 0): UltraFastClassificationResult {
  const messageLower = message.toLowerCase();
  
  // Verificar padrões de alta confiança primeiro
  for (const [module, patterns] of Object.entries(ULTRA_FAST_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(messageLower)) {
        const confidence = pattern.source.includes('dúvida|explicação|conceito') ? 0.95 : 0.9;
        return {
          module,
          confidence,
          rationale: `Ultra-fast pattern match: ${pattern.source.substring(0, 50)}...`,
          method: 'local_enhanced'
        };
      }
    }
  }
  
  // Fallback inteligente baseado em contexto
  if (messageLower.includes('aula') || messageLower.includes('slide')) {
    return { module: 'aula_interativa', confidence: 0.8, rationale: 'Keyword: aula/slide', method: 'local_enhanced' };
  } else if (messageLower.includes('simulado') || messageLower.includes('enem')) {
    return { module: 'enem', confidence: 0.8, rationale: 'Keyword: simulado/enem', method: 'local_enhanced' };
  } else if (messageLower.includes('problema') && messageLower.includes('técnico')) {
    return { module: 'ti', confidence: 0.8, rationale: 'Keyword: problema técnico', method: 'local_enhanced' };
  } else if (messageLower.includes('me sinto') || messageLower.includes('estou') || messageLower.includes('sinto')) {
    return { module: 'bem_estar', confidence: 0.85, rationale: 'Keyword: estado emocional', method: 'local_enhanced' };
  } else if (messageLower.includes('oi') || messageLower.includes('olá') || messageLower.includes('tudo bem')) {
    return { module: 'atendimento', confidence: 0.9, rationale: 'Keyword: saudação', method: 'local_enhanced' };
  }
  
  // Default para professor com confiança moderada
  return { module: 'professor', confidence: 0.6, rationale: 'Default fallback', method: 'local_enhanced' };
}

// Função para classificação com Google Gemini direto
async function googleDirectClassify(message: string, historyLength: number = 0): Promise<UltraFastClassificationResult> {
  try {
    const result = await generateText({
      model: google('gemini-1.5-flash'),
      messages: [
        {
          role: 'system',
          content: `Você é um classificador de módulos educacionais. Classifique a mensagem em um destes módulos:

- professor: dúvidas acadêmicas, explicações, conceitos, exercícios, matérias
- enem: simulados, provas, questões ENEM, vestibular
- aula_interativa: aulas, slides, atividades interativas
- ti: problemas técnicos, suporte tecnológico, bugs
- financeiro: pagamentos, valores, mensalidades
- rh: recursos humanos, salários, férias, benefícios
- social_media: redes sociais, posts, marketing digital
- bem_estar: apoio emocional, saúde mental, crises
- coordenacao: gestão acadêmica, calendários, provas
- secretaria: documentos, matrículas, procedimentos
- conteudo_midia: imagens, diagramas, conteúdo visual
- atendimento: saudações, dúvidas gerais

Responda apenas com o nome do módulo e a confiança (0.0-1.0) no formato: modulo|confiança`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.1,
      maxTokens: 50
    });

    const response = result.text.trim();
    const [module, confidenceStr] = response.split('|');
    
    if (module && confidenceStr) {
      const confidence = parseFloat(confidenceStr);
      if (!isNaN(confidence) && confidence >= 0 && confidence <= 1) {
        return {
          module: module.toLowerCase(),
          confidence,
          rationale: `Google Gemini direct classification`,
          method: 'google_direct'
        };
      }
    }
    
    // Fallback se parsing falhar
    return ultraFastLocalClassify(message, historyLength);
    
  } catch (error) {
    console.warn('⚠️ Google direct classification failed, using local:', error);
    return ultraFastLocalClassify(message, historyLength);
  }
}

// Função principal ultra-rápida (com timeout para Google)
export async function ultraFastClassify(
  message: string, 
  historyLength: number = 0,
  useGoogle: boolean = true // Reabilitado com timeout
): Promise<UltraFastClassificationResult> {
  const cacheKey = `${message.toLowerCase().trim()}_${historyLength}`;
  const cached = ultraCache.get(cacheKey);
  
  // Cache ultra-agressivo (1 hora)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { ...cached.result, method: 'cache' };
  }
  
  // Para mensagens muito simples, usar classificação local
  if (message.length < 30 && !message.includes('?')) {
    const result = ultraFastLocalClassify(message, historyLength);
    ultraCache.set(cacheKey, { result, timestamp: Date.now() });
    return result;
  }
  
  // Para mensagens complexas, tentar Google primeiro se habilitado (com timeout)
  if (useGoogle && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    try {
      // Timeout de 2 segundos para Google Gemini
      const googlePromise = googleDirectClassify(message, historyLength);
      const timeoutPromise = new Promise<UltraFastClassificationResult>((_, reject) => 
        setTimeout(() => reject(new Error('Google timeout')), 2000)
      );
      
      const result = await Promise.race([googlePromise, timeoutPromise]);
      ultraCache.set(cacheKey, { result, timestamp: Date.now() });
      
      // Limitar cache
      if (ultraCache.size > 200) {
        const firstKey = ultraCache.keys().next().value;
        if (firstKey) ultraCache.delete(firstKey);
      }
      
      return result;
    } catch (error) {
      console.warn('⚠️ Google classification failed or timeout, falling back to local:', error);
    }
  }
  
  // Fallback para classificação local
  const result = ultraFastLocalClassify(message, historyLength);
  ultraCache.set(cacheKey, { result, timestamp: Date.now() });
  
  return result;
}

// Função para limpar cache
export function clearUltraFastCache(): void {
  ultraCache.clear();
  console.log('🧹 [ULTRA-FAST-CLASSIFIER] Cache limpo');
}

// Função para obter estatísticas do cache
export function getUltraFastCacheStats(): { size: number; maxSize: number } {
  return {
    size: ultraCache.size,
    maxSize: 200
  };
}
