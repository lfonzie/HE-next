'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function AdminLayout({ children, className, activeTab, onTabChange }: AdminLayoutProps) {
  const [currentSection, setCurrentSection] = useState(activeTab || 'dashboard');
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se está em mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Apenas mobile, não tablet
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNavigation = (section: string) => {
    setCurrentSection(section);
    if (onTabChange) {
      onTabChange(section);
    }
  };

  // Mapear títulos das seções
  const getSectionTitle = (section: string) => {
    const titles: Record<string, string> = {
      'dashboard': 'Dashboard',
      'schools': 'Gestão de Escolas',
      'users': 'Gestão de Usuários',
      'ose-messages': 'Custom Messages',
      'system-messages': 'System Messages',
      'models': 'Configuração de Modelos',
      'quotas': 'Gestão de Cotas',
      'system': 'Configurações do Sistema',
      'micro-rewards': 'Sistema de Recompensas',
      'browser-extension': 'Extensão do Navegador',
      'analytics': 'Analytics',
      'reports': 'Relatórios'
    };
    return titles[section] || section;
  };

  const getSectionDescription = (section: string) => {
    const descriptions: Record<string, string> = {
      'dashboard': 'Dashboard principal e visão geral do sistema',
      'schools': 'Gestão de escolas e configurações',
      'users': 'Gestão de usuários e permissões',
      'ose-messages': 'Mensagens personalizadas OSE',
      'system-messages': 'Mensagens do sistema',
      'models': 'Configuração de modelos AI',
      'quotas': 'Gestão de cotas e limites',
      'system': 'Configurações do sistema',
      'micro-rewards': 'Sistema de recompensas',
      'browser-extension': 'Extensão do navegador',
      'analytics': 'Análises e estatísticas do sistema',
      'reports': 'Relatórios de formulários de escola'
    };
    return descriptions[section] || 'Painel administrativo';
  };

  return (
    <div className="admin-dashboard admin-dashboard-container">
      {/* Sidebar */}
      <AdminSidebar 
        onNavigate={handleNavigation} 
        activeTab={activeTab || currentSection}
        onTabChange={onTabChange}
      />
      
      {/* Main Content */}
      <main className={cn(
        "admin-dashboard admin-main-content",
        className
      )}>
        {/* Top Bar - Responsivo */}
        <header className={cn(
          "admin-top-bar bg-background border-b border-border flex-shrink-0",
          // Padding diferente para mobile (com espaço para hamburger)
          isMobile ? "pt-20 pb-6 px-4" : "p-6"
        )}>
          <div className="max-w-full">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className={cn(
                  "font-bold text-foreground mb-2",
                  isMobile ? "text-xl" : "text-2xl"
                )}>
                  {getSectionTitle(activeTab || currentSection)}
                </h1>
                <p className={cn(
                  "text-muted-foreground",
                  isMobile ? "text-sm" : "text-base"
                )}>
                  {getSectionDescription(activeTab || currentSection)}
                </p>
              </div>
              
              {/* Badge para indicar seção ativa em mobile */}
              {isMobile && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    {getSectionTitle(activeTab || currentSection)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Content Area - Scrollável e responsivo */}
        <div className={cn(
          "admin-content-area flex-1 bg-gray-50 overflow-y-auto",
          isMobile ? "p-4" : "p-6"
        )}>
          <div className="max-w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
