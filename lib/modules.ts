export type ModuleId =
  | "PROFESSOR"
  | "AULA_EXPANDIDA"
  | "ENEM_INTERACTIVE"
  | "VIRTUAL_LAB"
  | "FLASHCARDS"
  | "VIDEO_LEARNING"
  | "CHAT_DOCS"
  | "DICTATION"
  | "LIVE_AUDIO"
  | "TI"
  | "RH"
  | "FINANCEIRO"
  | "COORDENACAO"
  | "ATENDIMENTO"
  | "BEM_ESTAR"
  | "SOCIAL_MEDIA"
  | "GEMINI_LIVE";

export const MODULES: Record<ModuleId, { label: string; color: string; icon: string; description: string }> = {
  PROFESSOR: { 
    label: "Professor", 
    color: "bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg",
    icon: "fas fa-chalkboard-teacher",
    description: "Assistente de estudos para alunos"
  },
  AULA_EXPANDIDA: { 
    label: "Aula Expandida", 
    color: "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg",
    icon: "fas fa-graduation-cap",
    description: "Aulas interativas e gamificadas"
  },
  ENEM_INTERACTIVE: { 
    label: "ENEM Interativo", 
    color: "bg-gradient-to-br from-red-500 to-red-700 shadow-lg",
    icon: "fas fa-clipboard-list",
    description: "Simulador ENEM com IA"
  },
  VIRTUAL_LAB: { 
    label: "Laboratório Virtual", 
    color: "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg",
    icon: "fas fa-flask",
    description: "Simulações interativas de química e física"
  },
  FLASHCARDS: { 
    label: "Flashcards", 
    color: "bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg",
    icon: "fas fa-credit-card",
    description: "Gerador de flashcards interativos com IA"
  },
  VIDEO_LEARNING: { 
    label: "Vídeo para Aprendizado", 
    color: "bg-gradient-to-br from-orange-500 to-red-600 shadow-lg",
    icon: "fas fa-video",
    description: "Transforme vídeos em apps de aprendizado"
  },
  CHAT_DOCS: { 
    label: "Chat com Documentos", 
    color: "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg",
    icon: "fas fa-file-search",
    description: "Converse com documentos usando IA"
  },
  DICTATION: { 
    label: "Ditado por Voz", 
    color: "bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg",
    icon: "fas fa-microphone-alt",
    description: "Transcreva e organize notas por voz"
  },
  LIVE_AUDIO: { 
    label: "Live Audio", 
    color: "bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg",
    icon: "fas fa-microphone",
    description: "Chat de voz com visualizações 3D"
  },
  TI: { 
    label: "TI", 
    color: "bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg",
    icon: "fas fa-laptop-code",
    description: "TechEdu - Suporte técnico inteligente para escolas"
  },
  RH: { 
    label: "RH", 
    color: "bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg",
    icon: "fas fa-users",
    description: "Recursos humanos"
  },
  FINANCEIRO: { 
    label: "Financeiro", 
    color: "bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg",
    icon: "fas fa-dollar-sign",
    description: "Controle financeiro escolar"
  },
  COORDENACAO: { 
    label: "Coordenação", 
    color: "bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg",
    icon: "fas fa-chart-line",
    description: "Gestão pedagógica"
  },
  ATENDIMENTO: { 
    label: "Atendimento", 
    color: "bg-gradient-to-br from-red-500 to-red-700 shadow-lg",
    icon: "fas fa-headset",
    description: "Suporte multicanal"
  },
  BEM_ESTAR: { 
    label: "Bem-Estar", 
    color: "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg",
    icon: "fas fa-heart",
    description: "Suporte socioemocional"
  },
  SOCIAL_MEDIA: { 
    label: "Social Media", 
    color: "bg-gradient-to-br from-pink-500 to-pink-700 shadow-lg",
    icon: "fas fa-share-alt",
    description: "Comunicação digital"
  },
  GEMINI_LIVE: { 
    label: "Chat ao Vivo", 
    color: "bg-gradient-to-br from-green-500 to-green-700 shadow-lg",
    icon: "fas fa-video",
    description: "Chat em tempo real com voz e vídeo"
  },
};

export type ModuleClassification = {
  module: ModuleId;
  confidence: number;        // 0..1
  rationale: string;         // curta, para logs
  secondary?: ModuleId[];    // opcional
};

// Mapeamento de módulos antigos para novos
export const MODULE_MAPPING: Record<string, ModuleId> = {
  "professor": "PROFESSOR",
  "aula-expandida": "AULA_EXPANDIDA",
  "enem-interactive": "ENEM_INTERACTIVE",
  "enem-interativo": "ENEM_INTERACTIVE",
  "virtual-lab": "VIRTUAL_LAB",
  "laboratorio-virtual": "VIRTUAL_LAB",
  "flashcards": "FLASHCARDS",
  "video-learning": "VIDEO_LEARNING",
  "video-to-learning": "VIDEO_LEARNING",
  "chat-docs": "CHAT_DOCS",
  "dictation": "DICTATION",
  "live-audio": "LIVE_AUDIO",
  "ti": "TI",
  "rh": "RH",
  "financeiro": "FINANCEIRO",
  "coordenacao": "COORDENACAO",
  "atendimento": "ATENDIMENTO",
  "social-media": "SOCIAL_MEDIA",
  "bem-estar": "BEM_ESTAR",
  "wellbeing": "BEM_ESTAR",
  "gemini-live": "GEMINI_LIVE",
  "chat-live": "GEMINI_LIVE"
};

// Mapeamento reverso de novos para antigos
export const REVERSE_MODULE_MAPPING: Record<ModuleId, string> = {
  "PROFESSOR": "professor",
  "AULA_EXPANDIDA": "aula-expandida",
  "ENEM_INTERACTIVE": "enem-interactive",
  "VIRTUAL_LAB": "virtual-lab",
  "FLASHCARDS": "flashcards",
  "VIDEO_LEARNING": "video-learning",
  "CHAT_DOCS": "chat-docs",
  "DICTATION": "dictation",
  "LIVE_AUDIO": "live-audio",
  "TI": "ti",
  "RH": "rh",
  "FINANCEIRO": "financeiro",
  "COORDENACAO": "coordenacao",
  "ATENDIMENTO": "atendimento",
  "SOCIAL_MEDIA": "social-media",
  "BEM_ESTAR": "bem-estar",
  "GEMINI_LIVE": "gemini-live"
};

// Função para converter módulo antigo para novo
export const convertModuleId = (oldId: string | null): ModuleId | null => {
  if (!oldId) return null;
  return MODULE_MAPPING[oldId] || null;
};

// Função para converter módulo novo para antigo
export const convertToOldModuleId = (newId: ModuleId): string => {
  return REVERSE_MODULE_MAPPING[newId] || "";
};
