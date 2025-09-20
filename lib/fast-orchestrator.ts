import { FastClassificationResult } from './fast-classifier'

export interface FastOrchestratorResponse {
  text: string
  blocks: any[]
  actions: any[]
  trace: {
    module: string
    confidence: number
    intent: string
    slots: Record<string, any>
    latencyMs: number
  }
}

// Cache para orquestração
const orchestratorCache = new Map<string, { result: FastOrchestratorResponse; timestamp: number }>();

export async function fastOrchestrate(
  text: string, 
  context?: Record<string, any>
): Promise<FastOrchestratorResponse> {
  const t0 = Date.now()
  
  // Cache check
  const historyLength = context?.history?.length || 0;
  const cacheKey = `${text.toLowerCase().trim()}_${historyLength}`;
  const cached = orchestratorCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutos
    console.log(`🚀 [FAST-ORCHESTRATOR] Cache hit for: "${text.substring(0, 30)}..."`);
    return cached.result;
  }
  
  // Se já temos um módulo no contexto, use-o diretamente
  if (context?.module && context.module !== 'auto') {
    const trace = {
      module: context.module,
      confidence: 1.0,
      intent: 'direct_module',
      slots: {},
      latencyMs: Date.now() - t0
    }
    
    const result = {
      text: text.length > 0 ? 'Processando sua mensagem...' : 'Como posso ajudar?',
      blocks: [],
      actions: [],
      trace
    }
    
    // Cache o resultado
    orchestratorCache.set(cacheKey, { result, timestamp: Date.now() });
    return result;
  }
  
  // Usar classificador rápido local
  const classification = fastClassify(text, historyLength);
  
  const trace = {
    module: classification.module,
    confidence: classification.confidence,
    intent: classification.module.toLowerCase(),
    slots: {},
    latencyMs: Date.now() - t0
  }
  
  const result = {
    text: text.length > 0 ? 'Processando sua mensagem...' : 'Como posso ajudar?',
    blocks: [],
    actions: [],
    trace
  }
  
  // Cache o resultado
  orchestratorCache.set(cacheKey, { result, timestamp: Date.now() });
  
  // Limitar cache
  if (orchestratorCache.size > 50) {
    const firstKey = orchestratorCache.keys().next().value;
    if (firstKey) {
      orchestratorCache.delete(firstKey);
    }
  }
  
  return result;
}

// Função para limpar cache
export function clearFastOrchestratorCache() {
  orchestratorCache.clear();
  console.log('🧹 [FAST-ORCHESTRATOR] Cache limpo');
}
