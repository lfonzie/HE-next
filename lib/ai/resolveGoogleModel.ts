/**
 * Resolução de modelos Google para AI SDK
 * Corrige o problema do sufixo "-002" que estava causando erro 404
 */

export type GoogleProvider = 'dev' | 'vertex';

// Modelos válidos para Google AI for Developers (Dev API)
const DEV_MODELS = {
  // Modelos atuais recomendados (2025)
  'flash25': 'gemini-2.5-flash',
  'pro25': 'gemini-2.5-pro',
  
  // Modelos legados ainda suportados (sem sufixo -002)
  'flash15': 'gemini-1.5-flash',
  'pro15': 'gemini-1.5-pro',
  
  // Modelos experimentais
  'flash20': 'gemini-2.0-flash-exp',
} as const;

// Modelos para Vertex AI (não usado neste projeto)
const VERTEX_MODELS = {
  // Vertex usa caminhos completos, mas não implementamos aqui
  // Exemplo: 'projects/PROJECT/locations/global/publishers/google/models/gemini-2.5-flash'
} as const;

export type GoogleModelKey = keyof typeof DEV_MODELS;

/**
 * Resolve modelo Google baseado na chave e provedor
 * @param base - Chave do modelo (ex: 'flash25', 'pro15')
 * @param provider - Provedor ('dev' para Google AI for Developers)
 * @returns Nome do modelo válido para o AI SDK
 */
export function resolveGoogleModel(base: GoogleModelKey, provider: GoogleProvider = 'dev'): string {
  if (provider === 'dev') {
    return DEV_MODELS[base];
  }
  
  // Vertex não suportado neste endpoint
  throw new Error('Vertex AI não suportado neste endpoint. Use Google AI for Developers.');
}

/**
 * Valida se um modelo é válido para Google AI for Developers
 * @param modelName - Nome do modelo a validar
 * @returns true se válido, false caso contrário
 */
export function isValidGoogleModel(modelName: string): boolean {
  return Object.values(DEV_MODELS).includes(modelName as any);
}

/**
 * Obtém o modelo padrão recomendado para Google AI for Developers
 * @param complexity - Complexidade da tarefa
 * @returns Nome do modelo recomendado
 */
export function getDefaultGoogleModel(complexity: 'simple' | 'complex' | 'fast' = 'simple'): string {
  switch (complexity) {
    case 'complex':
      return DEV_MODELS.pro25;
    case 'fast':
      return DEV_MODELS.flash25;
    case 'simple':
    default:
      return DEV_MODELS.flash25;
  }
}

/**
 * Lista todos os modelos Google disponíveis
 * @returns Array com todos os modelos válidos
 */
export function getAllGoogleModels(): string[] {
  return Object.values(DEV_MODELS);
}

/**
 * Mapeia modelos legados para modelos atuais
 * @param legacyModel - Modelo legado (pode ter sufixo -002)
 * @returns Modelo atual válido
 */
export function mapLegacyGoogleModel(legacyModel: string): string {
  // Remove sufixos legados
  const cleanModel = legacyModel.replace(/-00[12]$/, '');
  
  // Mapeia para modelos atuais
  const mapping: Record<string, string> = {
    'gemini-1.5-flash': DEV_MODELS.flash25,
    'gemini-1.5-pro': DEV_MODELS.pro25,
    'gemini-2.0-flash-exp': DEV_MODELS.flash25,
  };
  
  return mapping[cleanModel] || DEV_MODELS.flash25;
}

// Exportar constantes para uso em outros arquivos
export { DEV_MODELS, VERTEX_MODELS };
