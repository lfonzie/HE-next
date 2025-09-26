/**
 * Configurações otimizadas para streaming em tempo real
 * Reduz buffering e melhora a experiência do usuário
 */

export interface OptimizedStreamingConfig {
  // Configurações de buffer
  bufferSize: number
  flushInterval: number
  
  // Configurações de rede
  chunkSize: number
  maxRetries: number
  retryDelay: number
  
  // Configurações de performance
  enableCompression: boolean
  enableEncryption: boolean
  autoReconnect: boolean
  maxReconnectAttempts: number
  
  // Configurações de áudio
  audioChunkSize: number
  audioBufferSize: number
  audioFlushInterval: number
}

export const OPTIMIZED_STREAMING_CONFIG: OptimizedStreamingConfig = {
  // Buffer grande para aguardar carregamento completo
  bufferSize: 10000,
  flushInterval: 0, // Desabilitado - só flush quando completo
  
  // Chunks grandes para aguardar carregamento
  chunkSize: 10000,
  maxRetries: 3,
  retryDelay: 1000,
  
  // Performance otimizada
  enableCompression: true,
  enableEncryption: false,
  autoReconnect: true,
  maxReconnectAttempts: 5,
  
  // Áudio aguarda carregamento completo
  audioChunkSize: 1000,
  audioBufferSize: 10000,
  audioFlushInterval: 0
}

export const FAST_STREAMING_CONFIG: OptimizedStreamingConfig = {
  // Configuração ultra-rápida
  bufferSize: 20,
  flushInterval: 5,
  
  chunkSize: 20,
  maxRetries: 2,
  retryDelay: 500,
  
  enableCompression: false, // Desabilitar para velocidade máxima
  enableEncryption: false,
  autoReconnect: true,
  maxReconnectAttempts: 3,
  
  audioChunkSize: 50,
  audioBufferSize: 20,
  audioFlushInterval: 5
}

export const BALANCED_STREAMING_CONFIG: OptimizedStreamingConfig = {
  // Configuração equilibrada entre velocidade e estabilidade
  bufferSize: 100,
  flushInterval: 25,
  
  chunkSize: 100,
  maxRetries: 3,
  retryDelay: 1000,
  
  enableCompression: true,
  enableEncryption: false,
  autoReconnect: true,
  maxReconnectAttempts: 5,
  
  audioChunkSize: 100,
  audioBufferSize: 100,
  audioFlushInterval: 25
}

/**
 * Aplica configurações otimizadas de streaming
 */
export function applyStreamingOptimizations(config: Partial<OptimizedStreamingConfig> = {}): OptimizedStreamingConfig {
  return {
    ...OPTIMIZED_STREAMING_CONFIG,
    ...config
  }
}

/**
 * Configurações específicas para diferentes tipos de streaming
 */
export const STREAMING_PRESETS = {
  // Para chat em tempo real
  CHAT_REALTIME: FAST_STREAMING_CONFIG,
  
  // Para áudio streaming
  AUDIO_STREAMING: {
    ...OPTIMIZED_STREAMING_CONFIG,
    audioChunkSize: 60,
    audioBufferSize: 30,
    audioFlushInterval: 5
  },
  
  // Para streaming de dados grandes
  LARGE_DATA: BALANCED_STREAMING_CONFIG,
  
  // Para streaming crítico de tempo
  CRITICAL_TIME: {
    ...FAST_STREAMING_CONFIG,
    bufferSize: 10,
    flushInterval: 1,
    chunkSize: 10
  }
} as const

/**
 * Utilitários para configuração dinâmica
 */
export class StreamingConfigManager {
  private static instance: StreamingConfigManager
  private currentConfig: OptimizedStreamingConfig

  private constructor() {
    this.currentConfig = OPTIMIZED_STREAMING_CONFIG
  }

  public static getInstance(): StreamingConfigManager {
    if (!StreamingConfigManager.instance) {
      StreamingConfigManager.instance = new StreamingConfigManager()
    }
    return StreamingConfigManager.instance
  }

  public getConfig(): OptimizedStreamingConfig {
    return this.currentConfig
  }

  public setConfig(config: Partial<OptimizedStreamingConfig>): void {
    this.currentConfig = { ...this.currentConfig, ...config }
  }

  public usePreset(preset: keyof typeof STREAMING_PRESETS): void {
    this.currentConfig = STREAMING_PRESETS[preset]
  }

  public optimizeForRealtime(): void {
    this.usePreset('CHAT_REALTIME')
  }

  public optimizeForAudio(): void {
    this.usePreset('AUDIO_STREAMING')
  }

  public optimizeForStability(): void {
    this.usePreset('LARGE_DATA')
  }
}
