// moduleColors.ts - Sistema de cores para os módulos

export interface ModuleColors {
  primary: string;
  border: string;
  shadow: string;
  hover: string;
  text: string;
}

// Mapeamento de IDs de módulos para cores
export const MODULE_ID_MAPPING: Record<string, string> = {
  "professor": "professor",
  "aula-expandida": "aula-expandida",
  "enem-interativo": "enem-interativo", 
  "ti": "ti",
  "rh": "rh",
  "financeiro": "financeiro",
  "coordenacao": "coordenacao",
  "atendimento": "atendimento",
  "wellbeing": "wellbeing",
  "social-media": "social-media",
  "secretaria": "secretaria",
};

// Paleta de cores para cada módulo
const MODULE_COLORS: Record<string, ModuleColors> = {
  professor: {
    primary: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    border: "#1d4ed8",
    shadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
    hover: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    text: "#ffffff"
  },
  "aula-expandida": {
    primary: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    border: "#b45309",
    shadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
    hover: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
    text: "#ffffff"
  },
  "enem-interativo": {
    primary: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    border: "#1d4ed8",
    shadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
    hover: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    text: "#ffffff"
  },
  ti: {
    primary: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
    border: "#374151",
    shadow: "0 4px 12px rgba(107, 114, 128, 0.3)",
    hover: "linear-gradient(135deg, #4b5563 0%, #374151 100%)",
    text: "#ffffff"
  },
  rh: {
    primary: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    border: "#6d28d9",
    shadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
    hover: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
    text: "#ffffff"
  },
  financeiro: {
    primary: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    border: "#047857",
    shadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
    hover: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    text: "#ffffff"
  },
  coordenacao: {
    primary: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    border: "#4338ca",
    shadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
    hover: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
    text: "#ffffff"
  },
  atendimento: {
    primary: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    border: "#b91c1c",
    shadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
    hover: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
    text: "#ffffff"
  },
  wellbeing: {
    primary: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    border: "#047857",
    shadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
    hover: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    text: "#ffffff"
  },
  "social-media": {
    primary: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
    border: "#be185d",
    shadow: "0 4px 12px rgba(236, 72, 153, 0.3)",
    hover: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
    text: "#ffffff"
  },
  secretaria: {
    primary: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
    border: "#0f766e",
    shadow: "0 4px 12px rgba(20, 184, 166, 0.3)",
    hover: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
    text: "#ffffff"
  }
};

// Função para obter as cores de um módulo
export function getModuleColors(moduleId: string): ModuleColors {
  const mappedId = MODULE_ID_MAPPING[moduleId] || moduleId;
  const colors = MODULE_COLORS[mappedId];
  
  if (!colors) {
    console.warn(`Cores não encontradas para o módulo: ${moduleId}`);
    // Retornar cores padrão
    return {
      primary: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
      border: "#374151",
      shadow: "0 4px 12px rgba(107, 114, 128, 0.3)",
      hover: "linear-gradient(135deg, #4b5563 0%, #374151 100%)",
      text: "#ffffff"
    };
  }
  
  return colors;
}

// Função para obter uma cor específica de um módulo
export function getModuleColor(moduleId: string, colorType: keyof ModuleColors): string {
  const colors = getModuleColors(moduleId);
  return colors[colorType];
}

// Lista de todos os módulos com cores disponíveis
export const MODULES_WITH_COLORS = Object.keys(MODULE_COLORS);

// Função para verificar se um módulo tem cores definidas
export function hasModuleColors(moduleId: string): boolean {
  const mappedId = MODULE_ID_MAPPING[moduleId] || moduleId;
  return mappedId in MODULE_COLORS;
}

// Função para obter todas as cores disponíveis
export function getAllModuleColors(): Record<string, ModuleColors> {
  return MODULE_COLORS;
}