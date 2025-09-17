import { type ModuleId } from "../lib/modules";

export interface SidebarIconInfo {
  icon: string;
  name: string;
  color: string;
}

export function getSidebarIcon(moduleId: ModuleId): SidebarIconInfo {
  const iconMap: Record<ModuleId, SidebarIconInfo> = {
    PROFESSOR: {
      icon: "fas fa-chalkboard-teacher",
      name: "Professor",
      color: "#3b82f6"
    },
    AULA_EXPANDIDA: {
      icon: "fas fa-graduation-cap",
      name: "Aula Expandida",
      color: "#8b5cf6"
    },
    ENEM_INTERACTIVE: {
      icon: "fas fa-clipboard-list",
      name: "ENEM Interativo",
      color: "#dc2626"
    },
    TI: {
      icon: "fas fa-laptop-code",
      name: "Tecnologia da Informação",
      color: "#06b6d4"
    },
    RH: {
      icon: "fas fa-users",
      name: "Recursos Humanos",
      color: "#10b981"
    },
    FINANCEIRO: {
      icon: "fas fa-calculator",
      name: "Financeiro",
      color: "#f59e0b"
    },
    COORDENACAO: {
      icon: "fas fa-user-tie",
      name: "Coordenação",
      color: "#ef4444"
    },
    ATENDIMENTO: {
      icon: "fas fa-headset",
      name: "Atendimento",
      color: "#8b5cf6"
    },
    SOCIAL_MEDIA: {
      icon: "fas fa-share-alt",
      name: "Social Media",
      color: "#ec4899"
    },
    BEM_ESTAR: {
      icon: "fas fa-heart",
      name: "Bem Estar",
      color: "#f97316"
    }
  };

  return iconMap[moduleId] || {
    icon: "fas fa-question-circle",
    name: "Módulo",
    color: "#6b7280"
  };
}