// modulePermissions.ts - Sistema de permissões para módulos

export const ALL_MODULES = [
  "professor",
  "aula-expandida", 
  "enem-interativo",
  "ti",
  "rh",
  "financeiro",
  "coordenacao",
  "atendimento",
  "wellbeing",
  "social-media",
  "secretaria"
] as const;

export type ModuleId = typeof ALL_MODULES[number];

export type UserRole = "STUDENT" | "TEACHER" | "STAFF" | "ADMIN" | "SUPER_ADMIN";
export type SchoolPlan = "PROFESSOR" | "FULL" | "ENTERPRISE";

// Função para verificar permissões de módulo
export function hasModulePermission(moduleId: string, userRole: string, schoolPlan: string): boolean {
  // SUPER_ADMIN tem acesso a todos os módulos
  if (userRole === "SUPER_ADMIN") {
    return true;
  }
  
  // ADMIN tem acesso a todos os módulos
  if (userRole === "ADMIN") {
    return true;
  }
  
  // Para outros usuários, verificar baseado no plano da escola
  const basicModules = ["professor", "atendimento"];
  const fullModules = ["professor", "atendimento", "ti", "rh", "financeiro", "coordenacao", "wellbeing", "social-media"];
  const enterpriseModules = [...fullModules, "aula-expandida", "enem-interativo", "secretaria"];
  
  if (schoolPlan === "PROFESSOR") {
    return basicModules.includes(moduleId);
  }
  
  if (schoolPlan === "FULL") {
    return fullModules.includes(moduleId);
  }
  
  if (schoolPlan === "ENTERPRISE") {
    return enterpriseModules.includes(moduleId);
  }
  
  // Default: apenas módulos básicos
  return basicModules.includes(moduleId);
}

// Função para obter módulos disponíveis para um usuário
export function getAvailableModules(userRole: string, schoolPlan: string): ModuleId[] {
  return ALL_MODULES.filter(moduleId => 
    hasModulePermission(moduleId, userRole, schoolPlan)
  );
}

// Função para obter informações detalhadas sobre permissões
export function getModulePermissions(userRole: string, schoolPlan: string) {
  const availableModules = getAvailableModules(userRole, schoolPlan);
  
  return {
    userRole,
    schoolPlan,
    availableModules,
    totalModules: ALL_MODULES.length,
    hasAccess: availableModules.length > 0,
    permissions: {
      canAccessProfessor: hasModulePermission("professor", userRole, schoolPlan),
      canAccessTI: hasModulePermission("ti", userRole, schoolPlan),
      canAccessRH: hasModulePermission("rh", userRole, schoolPlan),
      canAccessFinanceiro: hasModulePermission("financeiro", userRole, schoolPlan),
      canAccessCoordenacao: hasModulePermission("coordenacao", userRole, schoolPlan),
      canAccessAtendimento: hasModulePermission("atendimento", userRole, schoolPlan),
      canAccessWellbeing: hasModulePermission("wellbeing", userRole, schoolPlan),
      canAccessSocialMedia: hasModulePermission("social-media", userRole, schoolPlan),
      canAccessAulaExpandida: hasModulePermission("aula-expandida", userRole, schoolPlan),
      canAccessEnemInterativo: hasModulePermission("enem-interativo", userRole, schoolPlan),
      canAccessSecretaria: hasModulePermission("secretaria", userRole, schoolPlan),
    }
  };
}
