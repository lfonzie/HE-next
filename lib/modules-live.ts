// lib/modules-live.ts
export type Module = {
  id: string
  name: string
  type: 'chat-http' | 'chat-live' // novo tipo
  provider: 'google' | 'openai' | 'perplexity' | 'custom'
  model: string
  modalities?: Array<'audio' | 'video' | 'screen'>
}

export const MODULES: Module[] = [
  // Módulos existentes (texto)
  {
    id: 'professor',
    name: 'Professor',
    type: 'chat-http',
    provider: 'openai',
    model: 'gpt-4o-mini',
  },
  {
    id: 'ti',
    name: 'TI',
    type: 'chat-http',
    provider: 'openai',
    model: 'gpt-4o-mini',
  },
  {
    id: 'secretaria',
    name: 'Secretaria',
    type: 'chat-http',
    provider: 'openai',
    model: 'gpt-4o-mini',
  },
  {
    id: 'financeiro',
    name: 'Financeiro',
    type: 'chat-http',
    provider: 'openai',
    model: 'gpt-4o-mini',
  },
  {
    id: 'rh',
    name: 'RH',
    type: 'chat-http',
    provider: 'openai',
    model: 'gpt-4o-mini',
  },
  {
    id: 'atendimento',
    name: 'Atendimento',
    type: 'chat-http',
    provider: 'openai',
    model: 'gpt-4o-mini',
  },
  {
    id: 'coordenacao',
    name: 'Coordenação',
    type: 'chat-http',
    provider: 'openai',
    model: 'gpt-4o-mini',
  },
  {
    id: 'social-media',
    name: 'Social Media',
    type: 'chat-http',
    provider: 'openai',
    model: 'gpt-4o-mini',
  },
  {
    id: 'bem-estar',
    name: 'Bem-Estar',
    type: 'chat-http',
    provider: 'openai',
    model: 'gpt-4o-mini',
  },
  {
    id: 'enem-interactive',
    name: 'ENEM Interativo',
    type: 'chat-http',
    provider: 'openai',
    model: 'gpt-4o-mini',
  },
  {
    id: 'aula-expandida',
    name: 'Aula Expandida',
    type: 'chat-http',
    provider: 'openai',
    model: 'gpt-4o-mini',
  },
  {
    id: 'flashcards',
    name: 'Flashcards',
    type: 'chat-http',
    provider: 'google',
    model: 'gemini-2.0-flash-exp',
  },
  {
    id: 'video-learning',
    name: 'Vídeo para Aprendizado',
    type: 'chat-http',
    provider: 'google',
    model: 'gemini-2.0-flash-exp',
  },
  {
    id: 'chat-docs',
    name: 'Chat com Documentos',
    type: 'chat-http',
    provider: 'google',
    model: 'gemini-2.0-flash-exp',
  },
  {
    id: 'dictation',
    name: 'Ditado por Voz',
    type: 'chat-http',
    provider: 'google',
    model: 'gemini-2.0-flash-exp',
  },
  {
    id: 'live-audio',
    name: 'Live Audio',
    type: 'chat-live',
    provider: 'google',
    model: 'gemini-2.5-flash-preview-native-audio-dialog',
    modalities: ['audio']
  },
  // Novo módulo Chat ao Vivo
  {
    id: 'gemini-live',
    name: 'Gemini Live',
    type: 'chat-live',
    provider: 'google',
    model: 'gemini-2.0-live',
    modalities: ['audio', 'video'] // pode ligar tela on-demand
  }
];

// Função para obter módulo por ID
export const getModuleById = (id: string): Module | undefined => {
  return MODULES.find(module => module.id === id);
};

// Função para obter módulos por tipo
export const getModulesByType = (type: 'chat-http' | 'chat-live'): Module[] => {
  return MODULES.filter(module => module.type === type);
};

// Função para obter módulos Live
export const getLiveModules = (): Module[] => {
  return getModulesByType('chat-live');
};

// Função para obter módulos HTTP
export const getHttpModules = (): Module[] => {
  return getModulesByType('chat-http');
};
