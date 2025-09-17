'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Shield, 
  Users, 
  Database, 
  Settings,
  LogOut,
  Menu,
  X,
  Building,
  TrendingUp,
  Activity,
  Brain,
  MessageSquare,
  MessageCircle,
  Zap,
  CheckCircle,
  Target,
  Eye,
  Lock,
  RefreshCw,
  Terminal,
  AlertCircle,
  Sparkles,
  FileText,
  School
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AdminSidebarProps {
  className?: string;
  onNavigate?: (section: string) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function AdminSidebar({ className, onNavigate, activeTab, onTabChange }: AdminSidebarProps) {
  const { data: session } = useSession();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se está em mobile
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const mobile = width < 768; // Apenas mobile, não tablet
    
      setIsMobile(mobile);
      
      // Em tablet e desktop, sempre abrir sidebar
      if (width >= 768) {
        setIsMobileOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart,
      description: 'Visão geral do sistema'
    },
    {
      id: 'schools',
      label: 'Escolas',
      icon: Building,
      description: 'Gestão de escolas'
    },
    {
      id: 'users',
      label: 'Usuários',
      icon: Users,
      description: 'Gestão de usuários'
    },
    {
      id: 'system-messages',
      label: 'System Messages',
      icon: MessageSquare,
      description: 'Mensagens do sistema'
    },
    {
      id: 'models',
      label: 'Models',
      icon: Brain,
      description: 'Configuração de modelos'
    },
    {
      id: 'quotas',
      label: 'Quotas',
      icon: Database,
      description: 'Gestão de cotas'
    },
    {
      id: 'system',
      label: 'Sistema',
      icon: Settings,
      description: 'Configurações do sistema'
    },
    {
      id: 'micro-rewards',
      label: 'Micro-Rewards',
      icon: Sparkles,
      description: 'Sistema de recompensas'
    },
    {
      id: 'tickets',
      label: 'Tickets',
      icon: MessageCircle,
      description: 'Tickets de suporte'
    },
    {
      id: 'browser-extension',
      label: 'Extensão',
      icon: Zap,
      description: 'Extensão do navegador'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      description: 'Análises e estatísticas'
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: FileText,
      description: 'Relatórios de formulários de escola'
    }
  ];

  const handleLogout = () => {
    signOut();
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleNavigation = (sectionId: string) => {
    if (onTabChange) {
      onTabChange(sectionId);
    } else if (onNavigate) {
      onNavigate(sectionId);
    }
    
    // Fechar sidebar em mobile após navegação
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const handleRefreshAuth = async () => {
    try {
      // Verificar se a sessão está válida
      if (session) {
        console.log('Sessão válida:', session);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    }
  };

  const handleClearAuth = () => {
    signOut();
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden admin-mobile-toggle"
        style={{
          width: '56px',
          height: '56px',
          minWidth: '44px',
          minHeight: '44px',
          padding: '16px',
          borderRadius: '12px'
        }}
        onClick={toggleMobileMenu}
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden admin-sidebar-overlay"
          onClick={toggleMobileMenu}
          style={{
            opacity: 1,
            visibility: 'visible',
            pointerEvents: 'auto'
          }}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "admin-dashboard sidebar",
          isMobileOpen && "mobile-open",
          className
        )}
      >
        {/* Header */}
        <div className="admin-sidebar-header">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <School className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div>
              <h2 className="font-bold text-lg">Sistema Admin</h2>
              <p className="text-sm text-muted-foreground">SUPER_ADMIN</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id} className="admin-dashboard nav-item">
                  <Button
                    variant="ghost"
                    className={cn(
                      "admin-dashboard admin-sidebar-nav-button w-full justify-start",
                      isActive && "active"
                    )}
                    onClick={() => handleNavigation(item.id)}
                  >
                    <Icon className="icon" />
                    <div className="flex-1 text-left">
                      <span className="font-medium">{item.label}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className="admin-sidebar-user-info">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">
                {session?.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session?.user?.name || 'Administrador'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session?.user?.email || 'admin@hubedu.ia.br'}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
              <Shield className="w-3 h-3 mr-1" />
              SUPER_ADMIN
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-sidebar-actions">
          <div className="space-y-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleRefreshAuth}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Verificar Auth
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleClearAuth}
            >
              <Terminal className="w-4 h-4 mr-2" />
              Limpar Auth
            </Button>
            
            <Link href="/chat">
              <Button variant="outline" size="sm" className="w-full">
                <i className="fas fa-arrow-left mr-2"></i>
                Voltar ao Chat
              </Button>
            </Link>
          </div>
          
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Mobile Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 lg:hidden"
          onClick={toggleMobileMenu}
        >
          <X className="h-4 w-4" />
        </Button>
      </aside>
    </>
  );
}