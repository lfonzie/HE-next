// moduleIcons.tsx - Ícones SVG para os módulos usando Lucide React

import React from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  MessageSquare, 
  Laptop, 
  Users, 
  DollarSign, 
  ClipboardList, 
  Headphones, 
  Heart, 
  Smartphone,
  Building2,
  ArrowRight,
  Shield,
  FileText,
  Calendar,
  Settings
} from 'lucide-react';

export interface ModuleIconProps {
  className?: string;
}

// Mapeamento de ícones únicos para cada módulo
export const ModuleIcons = {
  professor: GraduationCap,        // 🎓 Capelo de formatura
  "aula-expandida": BookOpen,     // 📖 Livro aberto
  "enem-interativo": FileText,    // 📄 Documento (ENEM)
  ti: Laptop,                    // 💻 Laptop
  rh: Users,                     // 👥 Pessoas
  financeiro: DollarSign,        // 💰 Símbolo do dólar
  coordenacao: ClipboardList,     // 📋 Lista de verificação
  atendimento: Headphones,       // 🎧 Fones de ouvido
  wellbeing: Heart,              // ❤️ Coração
  "bem-estar": Heart,            // ❤️ Coração (alias)
  "social-media": Smartphone,    // 📱 Smartphone
  secretaria: Building2,         // 🏢 Prédio
} as const;

export type ModuleIconKey = keyof typeof ModuleIcons;

// Função para obter o componente de ícone
export function getModuleIcon(iconKey: string): React.ComponentType<ModuleIconProps> {
  const IconComponent = ModuleIcons[iconKey as ModuleIconKey];
  
  if (!IconComponent) {
    console.warn(`Ícone não encontrado para o módulo: ${iconKey}`);
    return GraduationCap; // Ícone padrão
  }
  
  return IconComponent;
}

// Função para renderizar um ícone de módulo
export function ModuleIcon({ 
  iconKey, 
  className = "w-5 h-5" 
}: { 
  iconKey: string; 
  className?: string; 
}) {
  const IconComponent = getModuleIcon(iconKey);
  return <IconComponent className={className} />;
}

// Lista de todos os ícones disponíveis para referência
export const AVAILABLE_ICONS = Object.keys(ModuleIcons);

// Função para verificar se um ícone existe
export function hasModuleIcon(iconKey: string): boolean {
  return iconKey in ModuleIcons;
}
