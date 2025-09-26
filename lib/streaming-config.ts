// lib/streaming-config.ts

export interface StreamingConfig {
  enabled: boolean;
  voice: string;
  autoPlay: boolean;
  showVisualization: boolean;
  latency: 'low' | 'medium' | 'high';
  fallbackToTTS: boolean;
}

export const defaultStreamingConfig: StreamingConfig = {
  enabled: true,
  voice: 'Orus',
  autoPlay: false,
  showVisualization: true,
  latency: 'low',
  fallbackToTTS: true
};

export function getStreamingConfig(): StreamingConfig {
  if (typeof window === 'undefined') return defaultStreamingConfig;
  
  try {
    const saved = localStorage.getItem('streaming-config');
    return saved ? { ...defaultStreamingConfig, ...JSON.parse(saved) } : defaultStreamingConfig;
  } catch (error) {
    console.warn('Erro ao carregar configuração de streaming:', error);
    return defaultStreamingConfig;
  }
}

export function saveStreamingConfig(config: StreamingConfig): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('streaming-config', JSON.stringify(config));
  } catch (error) {
    console.warn('Erro ao salvar configuração de streaming:', error);
  }
}

export function resetStreamingConfig(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('streaming-config');
  } catch (error) {
    console.warn('Erro ao resetar configuração de streaming:', error);
  }
}

// Configurações específicas para aulas
export const aulasStreamingConfig: StreamingConfig = {
  enabled: true,
  voice: 'Orus',
  autoPlay: false,
  showVisualization: true,
  latency: 'low',
  fallbackToTTS: true
};

// Configurações específicas para chat
export const chatStreamingConfig: StreamingConfig = {
  enabled: true,
  voice: 'Orus',
  autoPlay: true,
  showVisualization: false,
  latency: 'low',
  fallbackToTTS: true
};