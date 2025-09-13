import React, { startTransition } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useModuleNavigation } from "../../hooks/useModuleNavigation";
import { hasModulePermission, getAvailableModules, ALL_MODULES } from "../../utils/modulePermissions";
import { ModuleIcons, getModuleIcon } from "../../lib/moduleIcons";
import { getModuleColors, MODULE_ID_MAPPING } from "../../lib/moduleColors";
import "./ModuleSelector.css";

// Lista completa de todos os módulos disponíveis com cores e ícones únicos
const MODULES = [
  { id: "professor", name: "Professor", iconKey: "professor", color: "#2563eb" }, // Azul - GraduationCap
  { id: "aula-expandida", name: "Aula Expandida", iconKey: "aula-expandida", color: "#f59e0b" }, // Amarelo - BookOpen
  { id: "enem-interativo", name: "ENEM Interativo", iconKey: "enem-interativo", color: "#3b82f6" }, // Azul claro - FileText
  { id: "ti", name: "TI", iconKey: "ti", color: "#6b7280" }, // Cinza - Laptop
  { id: "atendimento", name: "Atendimento", iconKey: "atendimento", color: "#ef4444" }, // Vermelho - Headphones
  { id: "rh", name: "RH", iconKey: "rh", color: "#8b5cf6" }, // Roxo - Users
  { id: "financeiro", name: "Financeiro", iconKey: "financeiro", color: "#10b981" }, // Verde - DollarSign
  { id: "social-media", name: "Social Media", iconKey: "social-media", color: "#ec4899" }, // Rosa - Smartphone
  { id: "wellbeing", name: "Bem-Estar", iconKey: "wellbeing", color: "#f97316" }, // Laranja - Heart
  { id: "coordenacao", name: "Coordenação", iconKey: "coordenacao", color: "#6366f1" }, // Índigo - ClipboardList
  { id: "secretaria", name: "Secretaria", iconKey: "secretaria", color: "#059669" }, // Verde escuro - Building2
];

interface ModuleSelectorProps {
  selectedModule: string | null;
  onSelectModule: (moduleId: string) => void;
  isCollapsed?: boolean;
  isHighlighted?: boolean;
}

export function ModuleSelector({ selectedModule, onSelectModule, isCollapsed = false, isHighlighted = false }: ModuleSelectorProps) {
  const { user, isLoading } = useAuth();
  
  const { navigateToModule, isNavigating, getAvailableModules } = useModuleNavigation({
    onModuleChange: (moduleId) => {
      // Notificar o componente pai sobre a mudança de módulo
      onSelectModule(moduleId);
    },
    userRole: user?.role,
    schoolPlan: user?.schoolPlan
  });

  // Log para debug - mostrar módulos disponíveis para SUPER_ADMIN
  React.useEffect(() => {
    if (user?.role === "SUPER_ADMIN") {
      
    }
  }, [user?.role, user?.schoolPlan, getAvailableModules]);

  // Se ainda está carregando os dados do usuário, não renderizar os módulos
  if (isLoading || !user) {
    return (
      <div className="flex flex-wrap gap-2 p-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground opacity-50">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Carregando módulos...</span>
        </div>
      </div>
    );
  }

  // Obter todos os módulos disponíveis (todos os 10 módulos sempre visíveis)
  const availableModules = MODULES;

  const handleModuleSelect = (moduleId: string) => {
    if (isNavigating) {
      // Don't return - continue with selection
    }

    // Don't process if it's the same module
    if (selectedModule === moduleId) {
      // Force update even if it's the same module
    }

    try {
      // Call the parent's onSelectModule first to update the main state
      onSelectModule(moduleId);
      
      // Then call navigateToModule for additional navigation logic
      navigateToModule(moduleId);
      
    } catch (error) {
      console.error('❌ ModuleSelector: Error selecting module:', error);
      
      // Fallback: ensure the module selection still works
      onSelectModule(moduleId);
    }
  };

  return (
    <div className="space-y-2">

      
      <div className="grid grid-cols-1 gap-2">

        {availableModules.map((module) => {
          const isActive = selectedModule === module.id;
          const isDisabled = false; // Removido bloqueio desnecessário
          const Icon = getModuleIcon(module.iconKey);
          
          // Obter cores do módulo usando o sistema de cores
          const mappedModuleId = MODULE_ID_MAPPING[module.id] || module.id;
          const moduleColors = getModuleColors(mappedModuleId);
          
          return (
            <button
              key={module.id}
              onClick={() => handleModuleSelect(module.id)}
              disabled={isDisabled}
              className={`
                ${isCollapsed ? 'module-collapsed' : ''}
                ${isActive ? 'module-active' : ''}
                ${isActive && isCollapsed ? 'module-active-collapsed' : ''}
                ${isActive && isHighlighted ? 'module-highlighted' : ''}
                flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all duration-200
                ${isActive 
                  ? '' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
              `}
              style={{
                backgroundColor: isActive ? '#fbbf24' : '#f3f4f6', // Amarelo do app para ativo, cinza claro para inativo
                borderColor: isActive ? '#f59e0b' : '#e5e7eb',
                color: isActive ? '#000000' : '#374151', // Texto preto para ativo, cinza escuro para inativo
                padding: isCollapsed ? '0' : '12px 16px',
                borderRadius: '10px',
                boxShadow: isActive ? '0 4px 12px rgba(251, 191, 36, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                minHeight: isCollapsed ? '48px' : '44px',
                justifyContent: isCollapsed ? 'center !important' : 'flex-start !important'
              }}
              title={module.name}
            >
              {/* Ícone sempre visível */}
              <Icon 
                className={`module-icon ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} ${isActive ? 'text-black' : ''}`}
                data-module={module.iconKey}
              />
              
              {/* Nome do módulo apenas quando não colapsado */}
              {!isCollapsed && (
                <span className="font-medium">{module.name}</span>
              )}
            </button>
          );
        })}
      </div>
      
      {availableModules.length === 0 && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <i className="fas fa-exclamation-triangle text-lg mb-2"></i>
          <p className="text-sm">Nenhum módulo disponível para seu perfil.</p>
        </div>
      )}
    </div>
  );
}
