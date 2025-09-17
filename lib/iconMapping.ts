// lib/iconMapping.ts - Centralized icon mapping system
import { ModuleId } from './modules';

// Unified icon mapping interface
export interface IconMapping {
  iconKey: string;        // Key for Lucide React icons
  fontAwesomeClass: string; // FontAwesome class for sidebar
  name: string;           // Display name
  color: string;          // Hex color code
}

// Centralized mapping from ModuleId to all icon representations
export const ICON_MAPPINGS: Record<ModuleId, IconMapping> = {
  PROFESSOR: {
    iconKey: "professor",
    fontAwesomeClass: "fas fa-chalkboard-teacher",
    name: "Professor",
    color: "#2563eb"
  },
  AULA_EXPANDIDA: {
    iconKey: "aula-expandida",
    fontAwesomeClass: "fas fa-graduation-cap",
    name: "Aula Expandida",
    color: "#f59e0b"
  },
  ENEM_INTERACTIVE: {
    iconKey: "enem-interativo",
    fontAwesomeClass: "fas fa-clipboard-list",
    name: "ENEM Interativo",
    color: "#3b82f6"
  },
  TI: {
    iconKey: "ti",
    fontAwesomeClass: "fas fa-laptop-code",
    name: "Tecnologia da Informação",
    color: "#6b7280"
  },
  RH: {
    iconKey: "rh",
    fontAwesomeClass: "fas fa-users",
    name: "Recursos Humanos",
    color: "#8b5cf6"
  },
  FINANCEIRO: {
    iconKey: "financeiro",
    fontAwesomeClass: "fas fa-calculator",
    name: "Financeiro",
    color: "#10b981"
  },
  COORDENACAO: {
    iconKey: "coordenacao",
    fontAwesomeClass: "fas fa-user-tie",
    name: "Coordenação",
    color: "#6366f1"
  },
  ATENDIMENTO: {
    iconKey: "atendimento",
    fontAwesomeClass: "fas fa-headset",
    name: "Atendimento",
    color: "#ef4444"
  },
  BEM_ESTAR: {
    iconKey: "bem-estar",
    fontAwesomeClass: "fas fa-heart",
    name: "Bem-Estar",
    color: "#f97316"
  },
  SOCIAL_MEDIA: {
    iconKey: "social-media",
    fontAwesomeClass: "fas fa-share-alt",
    name: "Social Media",
    color: "#ec4899"
  }
};

// Fallback mapping for unknown modules
const FALLBACK_MAPPING: IconMapping = {
  iconKey: "professor",
  fontAwesomeClass: "fas fa-question-circle",
  name: "Módulo",
  color: "#6b7280"
};

/**
 * Get icon mapping for a module ID
 * @param moduleId - The module ID (uppercase from API or lowercase from frontend)
 * @returns IconMapping object with all icon representations
 */
export function getIconMapping(moduleId: string | ModuleId | null): IconMapping {
  if (!moduleId) return FALLBACK_MAPPING;
  
  // Normalize to uppercase ModuleId
  const normalizedId = moduleId.toUpperCase() as ModuleId;
  
  return ICON_MAPPINGS[normalizedId] || FALLBACK_MAPPING;
}

/**
 * Get Lucide React icon key for a module
 * @param moduleId - The module ID
 * @returns Icon key for use with getModuleIcon()
 */
export function getModuleIconKey(moduleId: string | ModuleId | null): string {
  return getIconMapping(moduleId).iconKey;
}

/**
 * Get FontAwesome class for a module
 * @param moduleId - The module ID
 * @returns FontAwesome class string
 */
export function getFontAwesomeClass(moduleId: string | ModuleId | null): string {
  return getIconMapping(moduleId).fontAwesomeClass;
}

/**
 * Get module color for a module
 * @param moduleId - The module ID
 * @returns Hex color code
 */
export function getModuleColor(moduleId: string | ModuleId | null): string {
  return getIconMapping(moduleId).color;
}

/**
 * Get module display name
 * @param moduleId - The module ID
 * @returns Display name
 */
export function getModuleName(moduleId: string | ModuleId | null): string {
  return getIconMapping(moduleId).name;
}

/**
 * Convert API module ID to frontend module ID
 * @param apiModuleId - Module ID from API (uppercase)
 * @returns Frontend module ID (lowercase)
 */
export function apiToFrontendModuleId(apiModuleId: string): string {
  const mapping = getIconMapping(apiModuleId);
  return mapping.iconKey;
}

/**
 * Convert frontend module ID to API module ID
 * @param frontendModuleId - Module ID from frontend (lowercase)
 * @returns API module ID (uppercase)
 */
export function frontendToApiModuleId(frontendModuleId: string): ModuleId {
  // Find the mapping that matches the frontend ID
  const entry = Object.entries(ICON_MAPPINGS).find(
    ([_, mapping]) => mapping.iconKey === frontendModuleId
  );
  
  return entry ? (entry[0] as ModuleId) : "ATENDIMENTO";
}

/**
 * Debug function to log icon mapping for a module
 * @param moduleId - The module ID to debug
 */
export function debugIconMapping(moduleId: string | ModuleId | null): void {
  const mapping = getIconMapping(moduleId);
  console.log(`🎨 Icon Mapping for "${moduleId}":`, {
    original: moduleId,
    normalized: moduleId?.toUpperCase(),
    iconKey: mapping.iconKey,
    fontAwesome: mapping.fontAwesomeClass,
    name: mapping.name,
    color: mapping.color
  });
}
