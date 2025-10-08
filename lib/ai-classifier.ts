// Classificador baseado em IA (client-side) - chama endpoint /api/classify
import { fastClassify } from './fast-classifier';

export interface AIClassificationResult {
  module: string;
  confidence: number;
  rationale: string;
}

// Cache local de classificações (30 minutos)
const classificationCache = new Map<string, { result: AIClassificationResult; timestamp: number }>();
const CACHE_TTL = 1800000; // 30 minutos

/**
 * Classifica uma mensagem usando IA via endpoint /api/classify
 * @param message Mensagem do usuário
 * @param historyLength Tamanho do histórico de conversa (para contexto)
 * @returns Módulo detectado com confiança
 */
export async function aiClassify(
  message: string,
  historyLength: number = 0
): Promise<AIClassificationResult> {
  try {
    // Verificar cache local
    const cacheKey = `${message.toLowerCase().trim()}_${historyLength}`;
    const cached = classificationCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`🎯 [AI-CLASSIFIER] Cache hit for: "${message.substring(0, 50)}..."`);
      return cached.result;
    }

    console.log(`🔍 [AI-CLASSIFIER] Calling /api/classify for: "${message.substring(0, 50)}..."`);

    // Chamar endpoint de classificação
    const response = await fetch('/api/classify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        historyLength
      })
    });

    if (!response.ok) {
      console.error('❌ [AI-CLASSIFIER] API error, using fallback');
      return fastClassify(message, historyLength);
    }

    const result: AIClassificationResult = await response.json();

    // Cachear resultado localmente
    classificationCache.set(cacheKey, { result, timestamp: Date.now() });
    
    // Limitar tamanho do cache
    if (classificationCache.size > 100) {
      const firstKey = classificationCache.keys().next().value;
      if (firstKey) classificationCache.delete(firstKey);
    }

    console.log(`✅ [AI-CLASSIFIER] Classified as: ${result.module} (confidence: ${result.confidence})`);
    return result;

  } catch (error) {
    console.error('❌ [AI-CLASSIFIER] Error:', error);
    console.log('🔄 [AI-CLASSIFIER] Falling back to regex classifier');
    return fastClassify(message, historyLength);
  }
}

/**
 * Limpa o cache de classificações
 */
export function clearAIClassificationCache() {
  classificationCache.clear();
  console.log('🧹 [AI-CLASSIFIER] Cache limpo');
}

/**
 * Testa classificação (útil para debug)
 */
export async function testAIClassification(message: string): Promise<AIClassificationResult> {
  return aiClassify(message, 0);
}

